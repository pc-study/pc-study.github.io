---
title: Oracle AI Database 26ai RAC 安装问题汇总
date: 2026-01-28 22:25:23
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2016389088966959104
---

# 前言
昨天适配了一下 26ai，测试了单机安装很顺畅，就想着测试一下 RAC 安装，不测不知道，一测就懵掉。本文记录一下 26ai rac 安装遇到的一些问题，大家可以参考一下，有些坑我先帮你们避一下！

需要 26ai 安装包网盘下载链接的朋友，请 **关注后私信「26ai」** 自动获取。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

## 问题一

这个纯属好心干坏事，经验使然！之前 19C RAC 安装，高版本 SSH 会导致互信失败，需要人为处理 `scp -T -O` 来修复，谁承想，Oracle 26ai 已经修复了这个 BUG，再做就是多此一举了！

**详见**：BUG 36289539 - LNX64-234-23C: GI Installation Setup Failed With PRCF-2041 file transfer to remote node failed (Doc ID 36289539.8)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016418019887636480_395407.png)

检查当前主机 scp 文件：

```bash
[root@orcl1:/u01/app/grid]# cat /usr/bin/scp
/usr/bin/scp.original -T $*
```

手动还原 scp：

```bash
mv /usr/bin/scp.original /usr/bin/scp
```

问题解决。

## 问题二

执行 root.sh 报错：

```bash
CLSRSC-594: 执行 19 的安装步骤 14: 'InstallACFS'。
CLSRSC-400: 需要重新启动系统才能继续安装。
Died at /u01/app/23.5.0/grid/crs/install/oraacfs.pm line 3290.
CLSRSC-4002: 已成功安装 Oracle Autonomous Health Framework (AHF)。
```

如果使用 ESXI 虚拟化创建虚拟机，RHEL8 默认以 EFI 方式启动并且开启安全引导，在安装 GRID 执行 root.sh 时会触发 BUG，安装失败：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016418128201342976_395407.png)

**解决方案**：关闭安全引导选项，重启主机后重新安装。

## 问题三
在安装方面，有一些新的安装步骤和功能变化：
- 新增配置单独的磁盘组来存储 OCR 的自动备份。
- 新增启用自动自行更正，自动修复已知的错误配置。
- 新增 HugePages 内存大页检查和建议。
- 移除 GiMR 功能。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016418683489951744_395407.png)

26ai 的静默安装文件模板大变样了：
```bash
## 以 db.rsp 为例
## 26ai 之前的格式
oracle.install.db.OSDBA_GROUP=dba
oracle.install.db.OSOPER_GROUP=oper
oracle.install.db.OSBACKUPDBA_GROUP=backupdba
oracle.install.db.OSDGDBA_GROUP=dgdba
oracle.install.db.OSKMDBA_GROUP=kmdba
oracle.install.db.OSRACDBA_GROUP=racdba

## 26ai 的格式
OSDBA=dba
OSOPER=oper
OSBACKUPDBA=backupdba
OSDGDBA=dgdba
OSKMDBA=kmdba
OSRACDBA=racdba
```
看到了吧，前缀 `oracle.install.db.` 消失了，所以以前的静默安装命令不能用了，**坏消息**：一键安装脚本需要重新适配 26ai 了。

# Oracle AI Database 26ai rac 一键安装
花费半小时修复了以上的问题，下面演示一下 Oracle AI Database 26ai RAC 一键安装。

操作系统版本：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016390137954000896_395407.png)

网络信息：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016390297619079168_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016390362735648768_395407.png)

磁盘信息：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016390524303925248_395407.png)

挂载系统 ISO 镜像：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016390819629064192_395407.png)

上传安装包以及安装脚本：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016391018481524736_395407.png)

根据系统信息可视化生成安装命令：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016391880024612864_395407.png)

RAC 主节点执行一键安装：
```bash
./OracleShellInstall \
-lf ens192 `# 公网IP网卡名称`\
-pf ens224 `# 心跳IP网卡名称`\
-n rac `# 主机名前缀`\
-hn rac01,rac02 `# 所有节点主机名`\
-ri 10.168.1.160,10.168.1.161 `# 公网IP地址`\
-vi 10.168.1.162,10.168.1.163 `# 虚拟IP地址`\
-si 10.168.1.165 `# SCAN IP地址`\
-rp 'root123456' `# root用户密码`\
-od /dev/sdb,/dev/sdc,/dev/sdd `# OCR磁盘组磁盘列表`\
-dd /dev/sde `# DATA磁盘组磁盘列表`\
-or NORMAL `# OCR磁盘组冗余度`\
-pdb lucifer `# PDB名称`\
-opd Y `# 优化数据库`
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016392048132825088_395407.png)

安装过程可以不需要一直盯着，也可以打开日志查看安装详情：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016392602741448704_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016392766075527168_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016392914483093504_395407.png)

剩下时间可以去看看官方文档，喝喝茶，静待脚本安装完成即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016513659338579968_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016518465839505408_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016518545317371904_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016519137020420096_395407.png)

虚拟化一套 26ai rac 安装耗时 40 分钟左右，速度还算可以。

# 总结
我这次是先手动安装了一次 26ai rac 之后再去适配安装脚本，这样对一些坑有数了才能更顺利的修改脚本，所以还是建议大家可以都先动手一步步的去安装一次体验一下 26ai 数据库的一些变化。