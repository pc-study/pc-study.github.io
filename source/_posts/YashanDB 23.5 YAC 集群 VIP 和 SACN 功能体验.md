---
title: YashanDB 23.5 YAC 集群 VIP 和 SACN 功能体验
date: 2025-12-10 17:24:19
tags: [墨力计划,yashandb体验官,崖山 yashandb,yashandb]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1998635855343853568
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

# 前言

之前装了一套 YashanDB 23.5 YAC，可参考 [实战篇：KylinV10 安装 YashanDB 23.5 YAC 保姆级教程](https://mp.weixin.qq.com/s/Os8AoMnR9m7GpCp86vIDmQ)，安装好之后一直没时间测试，这周抽空测了下 YAC 的 VIP 和 SCAN 功能。

本文主要记录一下测试过程中遇到的问题以及结果，全是干货！

# 介绍

在传统高可用方案中，客户端需手动配置所有节点地址，如同驾驶“**手动挡**”汽车，不仅运维繁琐，且故障切换缓慢、负载均衡能力弱，严重影响业务连续性。

YashanDB 23.5 YAC 新版本通过 **SCAN** 与 **VIP** 两大机制，实现了从“手动挡”到“自动驾驶”的体验升级：
- **VIP** 实现了“自动挡”式的故障切换，支持节点故障时 IP 自动迁移与快速接管，保障业务快速恢复；
- **SCAN** 则提供“自动驾驶”级别的体验，通过统一访问入口实现节点扩缩容与故障切换对业务的完全透明，并具备基于实时负载的智能连接分发能力。

二者结合，真正达成了“配置极简、切换无感、负载均衡”的高可用体验，显著提升了业务连续性。YashanDB 自 V23.5 支持 SCAN 与 VIP，**国内首个实现类 Oracle SCAN 机制的数据库产品**。

# 配置环境变量

新部署好的 YAC 集群，yashan 用户的环境变量文件为 `/home/yashan/.bashrc`，其中的 `YASDB_HOME` 环境变量的值是错误的，需要人为修改一下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998640664071446528_395407.png)

修改为实际安装的 `YASDB_HOME` 路径：

```bash
## 我的 YASDB_HOME 路径为 /data/yashan/yasdb_home/23.5.1.100
export YASDB_HOME=/data/yashan/yasdb_home/23.5.1.100
```

修改好之后，可以手动生效一下环境变量或者重登一下 yashan 用户即可：

```bash
## 手动生效
source ~/.bashrc

## 检查 YASDB_HOME
echo $YASDB_HOME
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998641326943444992_395407.png)

很多命令都需要基于以上环境变量，所以一定要修改。

# 配置数据库别名

我们可以先配置一下数据库别名（Oracle TNS）方便测试，可参考官方文档：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998638844913213440_395407.png)

所有节点均配置别名：

```bash
cat<<-EOF>> $YASDB_HOME/client/yasc_service.ini
yasdb1 = 10.168.1.101:1688
yasdb2 = 10.168.1.102:1688
yasdb1-vip = 10.168.1.103:1688
yasdb2-vip = 10.168.1.103:1688
yasdb-scan = 10.168.1.105:1688
EOF
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998638604563324928_395407.png)

# 配置 VIP、SCAN 自启

## VIP 连接测试

默认安装的 YAC 集群，VIP 和 SCAN 服务默认不是自启动的，重启服务器主机后，显示 VIP 未启动：

```bash
ycsctl status
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998636329815597056_395407.png)

此时，如果使用 VIP 和 SCANIP 连接数据库会报错：

```bash
yasql sys/yashan@yasdb1
yasql sys/yashan@yasdb2
yasql sys/yashan@yasdb1-vip
yasql sys/yashan@yasdb2-vip
yasql sys/yashan@yasdb-scan
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998637313652514816_395407.png)

## ycsrootagent 手动开启

开头也说了，是因为 VIP 没有开机自启，需要人工开启或者参考官方文档配置自动启动：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998639384455897088_395407.png)

`ycsrootagent` 手动启动 YCSRA 后台服务进程：

```bash
## 要确保环境变量设置是正确的
echo $YASDB_HOME
echo $YASCS_HOME
sudo env LD_LIBRARY_PATH=$YASDB_HOME/lib $YASDB_HOME/bin/ycsrootagent start -H $YASCS_HOME&
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998643040522149888_395407.png)

此时再次查看 VIP 和 SCANIP 的状态：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998643223427358720_395407.png)

已经是 online 状态，再次尝试连接数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998643453816283136_395407.png)

连接成功。

## 配置脚本自启

为了避免每次服务器因各种原因发生重启开机后，都需要人工去执行以下命令去启动 VIP 和 SCAN：

```bash
sudo env LD_LIBRARY_PATH=$YASDB_HOME/lib $YASDB_HOME/bin/ycsrootagent start -H $YASCS_HOME &
```

建议在每台服务器上为该进程配置开机自启动。

创建开机自启动服务脚本：

```bash
## 需要在 root 用户下执行，其中的 YASDB_HOME 和 YASCS_HOME 要根据实际环境进行修改
## 不同节点的 YASCS_HOME 不一致，需要注意替换 ce-1-1 为 ce-1-2
cat<<-\EOF> /usr/local/bin/yashan_monit.sh
#!/bin/bash
MONIT_AUTOSTART="true"
YCSROOTAGENT_AUTOSTART="true"
YASDB_USER=yashan
YASDB_HOME=/data/yashan/yasdb_home/23.5.1.100
YASCS_HOME=/data/yashan/yasdb_home/yasdb_data/ycs/ce-1-1
INTERVAL=3

while true; do
    if "$MONIT_AUTOSTART" = "true"; then
        if ! pgrep -a monit | grep "$YASDB_HOME" > /dev/null; then
            echo "$(date) monit abnormal, try restart..."
            su - $YASDB_USER -c "source ~/.bashrc && $YASDB_HOME/om/bin/monit -c $YASDB_HOME/om/monit/monitrc" &
        fi
    fi
    if "$YCSROOTAGENT_AUTOSTART" = "true"; then
        if ! pgrep -a ycsrootagent | grep "$YASCS_HOME" > /dev/null; then
            echo "$(date) ycsrootagent abnormal, try restart..."
            export LD_LIBRARY_PATH=$YASDB_HOME/lib
            $YASDB_HOME/bin/ycsrootagent start -H $YASCS_HOME &
        fi
    fi
    sleep "$INTERVAL"
done
EOF
```

赋予脚本可执行权限：

```bash
chmod +x /usr/local/bin/yashan_monit.sh
```

使用 `systemd` 创建服务：

```bash
## root 用户下执行
cat<<-EOF> /etc/systemd/system/yashan_monit.service
[Unit]
Description=Yashan Monitor
After=network.target

[Service]
ExecStart=/usr/local/bin/yashan_monit.sh
Type=simple
Restart=always
StandardOutput=syslog
StandardError=syslog

[Install]
WantedBy=multi-user.target
EOF
```

设置服务开机自动并启动服务：

```bash
## root 用户下执行
systemctl daemon-reload
systemctl enable yashan_monit
systemctl start yashan_monit
systemctl status yashan_monit
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998653007098109952_395407.png)

重启两台服务器主机，验证重启后 VIP 和 SCAN 是否可以自启：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998655481305964544_395407.png)

验证成功，YAC 的 VIP 和 SCAN 已经自启成功。

# 负载均衡测试

同时开启多个窗口，使用 SCANIP 连接数据库：

```bash
yasql sys/yashan@yasdb-scan
alter session set date_format='yyyy-mm-dd hh24:mi:ss';
select instance_name,sysdate from v$instance;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998659784615223296_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998659883655831552_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998660014094491648_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998660099566018560_395407.png)

结论：使用 SCAN 既可以连接节点 1，也能连接节点 2，且基本保持循环，实现负载均衡功能。

# 高可用测试

## 数据准备

分别在两个实例中创建测试表，并执行批量插入操作：

```sql
-- 实例 1
create table t1 (id int primary key,c int);
BEGIN
FOR i IN 1 .. 100000 LOOP
INSERT INTO t1 VALUES (i,i);
COMMIT;
DBMS_LOCK.SLEEP(0.2);
END LOOP;
END;
/

-- 实例 2
create table t2 (id int primary key,c int);
BEGIN
FOR i IN 1 .. 100000 LOOP
INSERT INTO t2 VALUES (i,i);
COMMIT;
DBMS_LOCK.SLEEP(0.2);
END LOOP;
END;
/
```

这一步是为了验证高可用测试过程中，会话事务是否会丢失。

这里本来打算用 23.4 的 YDC 连接测试，但是报错了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998667182964826112_395407.png)

说是 YDC 23.4 还不支持 SCAN 连接 YAC 数据库，暂时使用 ydc-web 23.5 进行连接：

```bash
tar -xf ydc-web-v23.5.1.0-linux-x86_64.tar.gz
./start_server.sh
```

启动打开网页 `http://10.168.1.101:9328/` 即可访问开发者工具：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998668195805356032_395407.png)

打开两个窗口（分别连接到两个实例）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998682317372612608_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998682367633465344_395407.png)

开始执行事务：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998682571132198912_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998682604112519168_395407.png)

## 关闭任意主机

关闭节点 2 主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998669480596676608_395407.png)

此时节点 1 查看集群状态：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998669429300338688_395407.png)

节点 2 的 VIP 已经漂移到节点 1 主机上：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998671657549504512_395407.png)

节点 2 实例已经关闭，查看 ydc-web 的连接情况：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998683710187724800_395407.png)

可以看到节点 2 主机关闭之后，实例 2 的会话已经断开：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998683757449142272_395407.png)

重新打开节点 2 主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998671161266872320_395407.png)

节点 2 的 VIP 已经漂回去：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998672374708379648_395407.png)

节点 2 实例恢复正常，整个测试过程中，实例 1 的窗口未受到影响，实例 2 的窗口因为节点 2 主机被关闭中断，此时如果应用有自动重连的机制，则可以通过 SCAN 自动连接到实例 1，但是事务依然需要回滚重新执行。

# TAF 测试

TAF 是一项客户端功能，能最大程度地减少数据库连接因实例或网络故障而失败时对最终用户应用程序的中断。

进入 `$YASDB_HOME/client` 路径，在 `yasc_service.ini` 文件中新增配置：

```bash
cat<<-EOF>> $YASDB_HOME/client/yasc_service.ini
yasdb-taf = 10.168.1.103:1688, 10.168.1.104:1688, 10.168.1.105:1688 ? FAILOVER = ON & FAILOVER_TYPE = SESSION & FAILOVER_METHOD = BASIC & FAILOVER_RETRIES = 10 & FAILOVER_DELAY = 2
EOF
```

具体参数以及配置可以参考官方文档：

> https://doc.yashandb.com/yashandb/23.5/zh/All-Manuals/Development-Guide/C-Language-Family-Drivers/C-Driver/C-Drive-Advanced-Features/Transparent-Application-Failover.html

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998674205626933248_395407.png)

使用 TAF 客户端连接到数据库：

```bash
yasql sys/yashan@yasdb-taf
select instance_name,sysdate from v$instance;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998678855780474880_395407.png)

此时关闭节点 1 实例：

```bash
yasboot group stop -c yasdb -g 1
yasboot cluster status -b group -c yasdb -d
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998680286914748416_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998680348109643776_395407.png)

在刚刚的会话再次查询实例：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251210-1998680606516011008_395407.png)

会话没有断开，并且自动连接到实例 2。

# 写在最后

总体测试下来，还是可以满足生产环境的正常使用，有一些小的问题，在后续版本中应该会陆续修复，就测到这儿吧。


---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)