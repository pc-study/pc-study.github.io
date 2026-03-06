---
title: Oracle RAC 磁盘空间又满了，竟是这个“监控工具”在作祟！
date: 2026-01-12 14:57:39
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2010604034362253312
---

# 前言

**刚上班，发现有一套 Oracle RAC 的 `/u01` 盘满了，告警邮件发个不停！**

查了一圈，发现不是业务数据，也不是日志，而是一个叫 `ora.crf` 的集群监控服务在“作祟”。它本该只占 1G 空间，却因为一个 BUG，生成了超过 60G 的 **.bdb** 文件，把磁盘撑爆了。

本文记录了完整的排查和解决过程，一起来看看吧！对了，**文末我还写了一个自动清理脚本**，设个定时任务就能一劳永逸，避免半夜再收告警。

# 问题分析

## 磁盘占用分析

检查磁盘使用率：

```bash
[root@orcl01 ~]# df -h
Filesystem            Size  Used Avail Use% Mounted on
/dev/sda2              59G   14G   43G  24% /
tmpfs                  16G  3.2G   13G  20% /dev/shm
/dev/sda1             190M   65M  116M  36% /boot
/dev/mapper/oravg-oralv
                       99G   94G  192M 100% /u01
```

/u01 磁盘目录已经 100% 使用率，使用 `du -sh *` 逐级找到占用最大的目录：

```bash
[root@orcl01 crf]# du -sh *
32K     admin
66G     db
[root@orcl01 crf]# cd db/orcl01/
[root@orcl01 orcl01]# du -sh *
...
...
1.1G    crfalert.bdb
61G     crfclust.bdb
999M    crfcpu.bdb
972M    crfhosts.bdb
1.2G    crfloclts.bdb
761M    crfts.bdb
...
...
```

可以看到占用比较大的文件都是 crf\*.bdb 的文件，最大的有 61G。

## ora.crf & CHM

Oracle Cluster Health Monitor（CHM）是专为 Oracle 集群（如 RAC）设计的底层监控与诊断工具。它以极低的性能开销（约每秒 1 次）实时收集所有节点的 CPU、内存、I/O 和网络等操作系统核心指标，并持续归档。

CHM 在 Oracle 集群中作为一个高可用性服务运行，其资源名为 `ora.crf`，由集群的 OHASD 守护进程统一管理。

可以使用 `crsctl stat res ora.crf -init` 查看资源使用情况：

```bash
[root@orcl02 orcl02]# crsctl stat res ora.crf -init
NAME=ora.crf
TYPE=ora.crf.type
TARGET=ONLINE
STATE=ONLINE on orcl02
```

CHM 使用 `oclumon` 命令进行管理：

```bash
## 查看 CHM 文件存放位置
oclumon manage -get reppath

## 查看 CHM 文件默认大小（默认大小为 1G）
oclumon manage -get repsize

## 调整 CHM 文件默认大小，必须大于 1G
oclumon manage -repos changesize <memsize>
```

更多细节可以查看 MOS 文档：[FAQ2058] Cluster Health Monitor (CHM) FAQ 。

检查当前环境的 CHM 默认文件大小：

```bash
[grid@orcl01:/home/grid]$oclumon manage -get repsize

CHM Repository Size = 1094795585

 Done
```

默认文件最大为 1G，但是目录下的文件却远远超过（达到 61G），符合 **BUG 10165314**：

> Another reason for having very large bdb files (greater than 2GB) is due to a bug since the default size limits the bdb to 1GB unless the CHM data retention time is increased. One such bug is 10165314.

以上内容取自 MOS 文档：[KB145337] Oracle Cluster Health Monitor (CHM) using large amount of space (more than default)。

针对这个 BUG 的处理方式，MOS 文档给出了答案：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260112-2010588906493386752_395407.png)

# 问题解决

根据 MOS 的解决方案针对所有节点进行清理。

获取 CHM 文件所在目录：

```bash
[grid@orcl01:/home/grid]$ oclumon manage -get reppath

CHM Repository Path = /u01/app/11.2.0/grid/crf/db/orcl02

 Done
```

关闭 ora.crf 资源：

```bash
## root 用户执行
[root@orcl02 ~]# export GI_HOME=/u01/app/11.2.0/grid
[root@orcl02 ~]# $GI_HOME/bin/crsctl stop res ora.crf -init
CRS-2673: Attempting to stop 'ora.crf' on 'orcl02'
CRS-2677: Stop of 'ora.crf' on 'orcl02' succeeded
```

删除 bdb 结尾的文件：

```bash
## root 用户
[root@orcl02 ~]# cd /u01/app/11.2.0/grid/crf/db/orcl02
[root@orcl02 orcl02]# rm -rf *.bdb
```

检查磁盘空间，确保空间已经释放：

```bash
[root@orcl02 orcl02]# df -h
Filesystem            Size  Used Avail Use% Mounted on
/dev/sda2              59G  5.3G   51G  10% /
tmpfs                  17G  209M   17G   2% /dev/shm
/dev/sda1             190M   39M  141M  22% /boot
/dev/mapper/oravg-oralv
                       99G   27G   67G  29% /u01
```

重新开启 ora.crf 资源：

```bash
## root 用户执行
[root@orcl02 ~]# export GI_HOME=/u01/app/11.2.0/grid
[root@orcl02 orcl02]# $GI_HOME/bin/crsctl start res ora.crf -init
CRS-2672: Attempting to start 'ora.crf' on 'orcl02'
CRS-2676: Start of 'ora.crf' on 'orcl02' succeeded
```

检查是否成功开启：

```bash
[root@orcl02 orcl02]# crsctl stat res ora.crf -init
NAME=ora.crf
TYPE=ora.crf.type
TARGET=ONLINE
STATE=ONLINE on orcl02
```

其实这样不算彻底解决，还需要每隔一段时间清理一次，因为这个 BUG 并没有被解决，本来想禁用这个资源，但是不能禁用：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260112-2010592878330994688_395407.png)

所以可以写个脚本使用定时任务自动清理：

```bash
cat > /root/clear_bdb.sh <<'EOF'
#!/bin/bash
# CHM 数据清理脚本

GI_HOME="/u01/app/11.2.0/grid"
CHM_PATH="/u01/app/11.2.0/grid/crf/db/$(hostname | cut -d'.' -f1)"

# 检查 CHM 目录是否存在
[ ! -d "$CHM_PATH" ] && echo "CHM 目录不存在: $CHM_PATH" && exit 1

# 计算 .bdb 文件总大小（以 KB 为单位）
total_kb=$(find "$CHM_PATH" -name "*.bdb" -type f -exec du -k {} + 2>/dev/null | awk '{sum += $1} END {print sum}')
total_kb=${total_kb:-0}

echo "CHM 数据目录: $CHM_PATH"
echo "当前 .bdb 文件总大小: ${total_kb}KB"

# 判断是否超过 1G（1G = 1024*1024KB）
if [ $total_kb -gt 1048576 ]; then
    echo "数据超过1G，开始清理..."
    $GI_HOME/bin/crsctl stop res ora.crf -init
    sleep 3
    rm -f "$CHM_PATH"/*.bdb
    $GI_HOME/bin/crsctl start res ora.crf -init
    sleep 5
    echo "清理完成"
else
    echo "数据未超过 1G，无需清理"
fi
EOF

## 赋予脚本执行权限
chmod +x /root/clear_bdb.sh

## 配置定时任务
crontab -e

# 每天 09:00 执行
00 09 * * * /root/clear_bdb.sh
```

手动执行效果：

```bash
[root@orcl01 ~]# sh clear_bdb.sh
CHM 数据目录: /u01/app/11.2.0/grid/crf/db/orcl01
当前 .bdb 文件总大小: 68312KB
数据未超过 1G，无需清理
```

这样比较方便一些，完全解放双手！