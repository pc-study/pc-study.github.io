---
title: 装个 Oracle 23ai RAC 玩玩~
date: 2025-08-14 16:35:12
tags: [墨力计划,oracle,oracle 23c,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1955911065053704192
---

# 前言
这个月好像好久没写文章了，最近有事一直在忙，正好昨晚有点时间，安装一个 Oracle 23ai 本地版玩玩~

# 问题记录

可以先看问题，再看安装步骤，有些坑我先帮你们避一下！

## 问题一

这个纯属好心干坏事，经验使然！之前 19C RAC 安装，高版本 SSH 会导致互信失败，需要人为处理 `scp -T -O` 来修复，谁承想，Oracle 23ai 已经修复了这个 BUG，再做就是多此一举了！

**详见**：BUG 36289539 - LNX64-234-23C: GI Installation Setup Failed With PRCF-2041 file transfer to remote node failed (Doc ID 36289539.8)

![](https://files.mdnice.com/user/16270/6c871684-a790-42d6-b72f-36077d20ba0e.png)

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
2025/08/14 13:01:32 CLSRSC-594: 执行 19 的安装步骤 14: 'InstallACFS'。
2025/08/14 13:01:41 CLSRSC-400: 需要重新启动系统才能继续安装。
Died at /u01/app/23.5.0/grid/crs/install/oraacfs.pm line 3290.
2025/08/14 13:02:25 CLSRSC-4002: 已成功安装 Oracle Autonomous Health Framework (AHF)。
```

如果使用 ESXI 虚拟化创建虚拟机，RHEL8 默认以 EFI 方式启动并且开启安全引导，在安装 GRID 执行 root.sh 时会触发 BUG，安装失败：

![](https://files.mdnice.com/user/16270/0ca0e0e7-24a0-491c-9368-1c0c661326eb.png)

**解决方案**：关闭安全引导选项，重启主机后重新安装。

# 变化
## 安装过程
在安装方面，有一些新的安装步骤和功能变化：
- 新增配置单独的磁盘组来存储 OCR 的自动备份。
- 新增启用自动自行更正，自动修复已知的错误配置。
- 新增 HugePages 内存大页检查和建议。
- 移除 GiMR 功能。

## 静默文件
23ai 的静默安装文件模板变样了：
```bash
## 以 db.rsp 为例
## 23ai 之前的格式
oracle.install.db.OSDBA_GROUP=dba
oracle.install.db.OSOPER_GROUP=oper
oracle.install.db.OSBACKUPDBA_GROUP=backupdba
oracle.install.db.OSDGDBA_GROUP=dgdba
oracle.install.db.OSKMDBA_GROUP=kmdba
oracle.install.db.OSRACDBA_GROUP=racdba

## 23ai 的格式
OSDBA=dba
OSOPER=oper
OSBACKUPDBA=backupdba
OSDGDBA=dgdba
OSKMDBA=kmdba
OSRACDBA=racdba
```
看到了吧，前缀 `oracle.install.db.` 消失了，所以以前的静默安装命令不能用了，**坏消息**：一键安装脚本需要重新适配 23ai 了。

# 环境信息

![](https://files.mdnice.com/user/16270/386080f3-3da4-4ae9-b12e-39283a4186a4.png)

# 安装前配置

使用 Oracle 一键安装脚本一键配置好操作系统环境：

```bash
./OracleShellInstall \
-m Y `# 仅配置操作系统`\
-lf ens192 `# 公网IP网卡名称`\
-pf ens224 `# 心跳IP网卡名称`\
-hn orcl1,orcl2 `# 所有节点主机名`\
-ri 10.168.1.160,10.168.1.161 `# 公网IP地址`\
-vi 10.168.1.162,10.168.1.163 `# 虚拟IP地址`\
-si 10.168.1.165 `# SCAN IP地址`\
-rp 'root123456' `# root用户密码`\
-cn orcl-cls `# 集群名称`\
-sn orcl-scan `# SCAN名称`\
-od /dev/sdb,/dev/sdc,/dev/sdd `# OCR磁盘组磁盘列表`\
-dd /dev/sde `# DATA磁盘组磁盘列表`\
-or NORMAL `# OCR磁盘组冗余度`
```

配置完成后，开始手动安装 Gird 和 Oracle 软件。

# Grid 安装

进入 grid 用户，执行图形化安装：

```bash
cd $ORACLE_HOME
./gridSetup.sh
```

![](https://files.mdnice.com/user/16270/82714a2e-af1a-47db-8941-e366476c7609.png)

我使用红帽 8.10 系统安装，提示不支持（忽略即可）：

![](https://files.mdnice.com/user/16270/a88e1ff7-896d-4a2f-94be-148b3eec1696.png)

![](https://files.mdnice.com/user/16270/fd26ee0f-3cd6-432f-a5e0-b3924b002c47.png)

![](https://files.mdnice.com/user/16270/bde09d3c-7412-4bd9-a620-3fe2b24203c0.png)

![](https://files.mdnice.com/user/16270/8917781b-1ca8-46de-bc93-09bc0dfbf795.png)

![](https://files.mdnice.com/user/16270/a8fcc5df-81a9-442c-a0fc-ec4866719494.png)

这里脚本已经互信过，输入密码直接下一步就行：

![](https://files.mdnice.com/user/16270/60e74c12-6371-4405-a428-5c039bb699d9.png)

![](https://files.mdnice.com/user/16270/a4ada8e0-adb0-4e75-861d-506f3576f2ba.png)

![](https://files.mdnice.com/user/16270/a8b40e8c-03bf-482f-8e7b-4df3f0732e03.png)

![](https://files.mdnice.com/user/16270/1394af81-6a8d-4d9b-b544-f0e7a53f1e04.png)

![](https://files.mdnice.com/user/16270/0c547eb8-9b12-4c1a-b384-a6fd5a07edf5.png)

![](https://files.mdnice.com/user/16270/5853ee9b-a741-4fb7-bc24-5cf8896c341e.png)

这里多了一个自行更正的步骤（自动修复已知的错误配置，类似于之前的 autofix）：

![](https://files.mdnice.com/user/16270/d7ca2e78-89ff-4530-80a9-36b50d851a47.png)

![](https://files.mdnice.com/user/16270/5b15f41c-18d7-468b-bfbc-5e4dec1334b4.png)

![](https://files.mdnice.com/user/16270/b75735bd-d68d-497d-94f2-34f5a109a3d5.png)

![](https://files.mdnice.com/user/16270/72755ca2-3a76-4afc-b4fe-e27bc6923bf3.png)

![](https://files.mdnice.com/user/16270/3ffa76bc-aa97-4dc5-af03-4f055fae8908.png)

![](https://files.mdnice.com/user/16270/1a40fbb7-4827-478e-b325-b56922a73f9f.png)

![](https://files.mdnice.com/user/16270/f00ca30f-43cf-4927-becd-d071a4bfe15a.png)

这里没有先决条件检查步骤，因为脚本和之前的自动纠正直接解决了所有问题，所以直接下一步了：

![](https://files.mdnice.com/user/16270/0a5bbb4e-0f7a-4477-8730-bb60421beead.png)

![](https://files.mdnice.com/user/16270/42726d95-f721-42b3-96a3-dd90c8046742.png)

![](https://files.mdnice.com/user/16270/ed285a6c-a768-4fc4-afa3-f27f1f3b8e1a.png)

记录节点一的 root.sh 执行过程：

```bash
[root@orcl1:/root]# /u01/app/oraInventory/orainstRoot.sh
更改权限/u01/app/oraInventory.
添加组的读取和写入权限。
删除全局的读取, 写入和执行权限。

更改组名/u01/app/oraInventory 到 oinstall.
脚本的执行已完成。
[root@orcl1:/root]# /u01/app/23.5.0/grid/root.sh
Performing root user operation.

The following environment variables are set as:
    ORACLE_OWNER= grid
    ORACLE_HOME=  /u01/app/23.5.0/grid

Enter the full pathname of the local bin directory: [/usr/local/bin]:
The contents of "dbhome" have not changed. No need to overwrite.
The contents of "oraenv" have not changed. No need to overwrite.
The contents of "coraenv" have not changed. No need to overwrite.


Creating /etc/oratab file...
Entries will be added to the /etc/oratab file as needed by
Database Configuration Assistant when a database is created
Finished running generic part of root script.
Now product-specific root actions will be performed.
RAC option enabled on: Linux
Executing command '/u01/app/23.5.0/grid/perl/bin/perl -I/u01/app/23.5.0/grid/perl/lib -I/u01/app/23.5.0/grid/crs/install /u01/app/23.5.0/grid/crs/install/rootcrs.pl '
Using configuration parameter file: /u01/app/23.5.0/grid/crs/install/crsconfig_params
The log of current session can be found at:
  /u01/app/grid/crsdata/orcl1/crsconfig/rootcrs_orcl1_2025-08-14_02-16-28PM.log
2025/08/14 14:16:32 CLSRSC-594: 执行 19 的安装步骤 1: 'ValidateEnv'。
2025/08/14 14:16:32 CLSRSC-594: 执行 19 的安装步骤 2: 'CheckRootCert'。
2025/08/14 14:16:32 CLSRSC-594: 执行 19 的安装步骤 3: 'GenSiteGUIDs'。
2025/08/14 14:16:33 CLSRSC-594: 执行 19 的安装步骤 4: 'SetupOSD'。
2025/08/14 14:16:33 CLSRSC-594: 执行 19 的安装步骤 5: 'CheckCRSConfig'。
2025/08/14 14:16:33 CLSRSC-594: 执行 19 的安装步骤 6: 'SetupLocalGPNP'。
2025/08/14 14:16:39 CLSRSC-594: 执行 19 的安装步骤 7: 'CreateRootCert'。
2025/08/14 14:16:55 CLSRSC-594: 执行 19 的安装步骤 8: 'ConfigOLR'。
2025/08/14 14:16:58 CLSRSC-594: 执行 19 的安装步骤 9: 'ConfigCHMOS'。
2025/08/14 14:16:58 CLSRSC-594: 执行 19 的安装步骤 10: 'CreateOHASD'。
2025/08/14 14:16:59 CLSRSC-594: 执行 19 的安装步骤 11: 'ConfigOHASD'。
2025/08/14 14:16:59 CLSRSC-330: 正在向文件 'oracle-ohasd.service' 添加集群件条目
2025/08/14 14:17:08 CLSRSC-594: 执行 19 的安装步骤 12: 'SetupTFA'。
2025/08/14 14:17:08 CLSRSC-594: 执行 19 的安装步骤 13: 'InstallAFD'。
2025/08/14 14:17:08 CLSRSC-594: 执行 19 的安装步骤 14: 'InstallACFS'。
2025/08/14 14:17:20 CLSRSC-594: 执行 19 的安装步骤 15: 'CheckFirstNode'。
2025/08/14 14:17:21 CLSRSC-594: 执行 19 的安装步骤 16: 'InitConfig'。
CRS-4256: 更新概要文件
已成功添加表决磁盘 b3bc15d316d64f90bf07a28c28159c4b。
已成功添加表决磁盘 8e0ac8d8ffe84fb5bf8aeb5b5477ac79。
已成功添加表决磁盘 2f6430957b8c4fd7bf50dfc58188dc97。
已成功将表决磁盘组替换为 +OCR。
CRS-4256: 更新概要文件
CRS-4266: 已成功替换表决文件
##  STATE    File Universal Id                File Name Disk group
--  -----    -----------------                --------- ---------
 1. ONLINE   b3bc15d316d64f90bf07a28c28159c4b (/dev/asm_ocr_1) [OCR]
 2. ONLINE   8e0ac8d8ffe84fb5bf8aeb5b5477ac79 (/dev/asm_ocr_2) [OCR]
 3. ONLINE   2f6430957b8c4fd7bf50dfc58188dc97 (/dev/asm_ocr_3) [OCR]
找到了 3 个表决磁盘。
2025/08/14 14:18:12 CLSRSC-594: 执行 19 的安装步骤 17: 'StartCluster'。
2025/08/14 14:18:26 CLSRSC-4002: 已成功安装 Oracle Autonomous Health Framework (AHF)。
2025/08/14 14:18:34 CLSRSC-343: 已成功启动 Oracle Clusterware 堆栈
2025/08/14 14:18:37 CLSRSC-594: 执行 19 的安装步骤 18: 'ConfigNode'。
clscfg: EXISTING configuration version 23 detected.
Successfully accumulated necessary OCR keys.
Creating OCR keys for user 'root', privgrp 'root'..
Operation successful.
2025/08/14 14:19:00 CLSRSC-594: 执行 19 的安装步骤 19: 'PostConfig'。
2025/08/14 14:19:15 CLSRSC-325: 为集群配置 Oracle Grid Infrastructure...成功
```

所有节点均执行完成后继续下一步：

![](https://files.mdnice.com/user/16270/0b276802-029c-4bcd-984a-37b7243fd1f2.png)

这个报错是因为 SCAN 和 NTP 相关的，可以忽略：

![](https://files.mdnice.com/user/16270/0b434159-44ee-4e5c-8d95-aef52ee60e42.png)

![](https://files.mdnice.com/user/16270/f10b2081-fcdf-44fc-84f3-f521a0966e89.png)

![](https://files.mdnice.com/user/16270/43aae2fc-8b27-4ba6-9d3c-50632468fe1e.png)

Grid 安装完成，看一下集群状态：

```bash
[grid@orcl1:/home/grid]$ crsctl stat res -t
--------------------------------------------------------------------------------
Name           Target  State        Server                   State details
--------------------------------------------------------------------------------
Local Resources
--------------------------------------------------------------------------------
ora.LISTENER.lsnr
               ONLINE  ONLINE       orcl1                    STABLE
               ONLINE  ONLINE       orcl2                    STABLE
ora.chad
               ONLINE  ONLINE       orcl1                    STABLE
               ONLINE  ONLINE       orcl2                    STABLE
ora.cvuadmin
               OFFLINE OFFLINE      orcl1                    STABLE
               OFFLINE OFFLINE      orcl2                    STABLE
ora.helper
               OFFLINE OFFLINE      orcl1                    STABLE
               OFFLINE OFFLINE      orcl2                    IDLE,STABLE
ora.net1.network
               ONLINE  ONLINE       orcl1                    STABLE
               ONLINE  ONLINE       orcl2                    STABLE
ora.ons
               ONLINE  ONLINE       orcl1                    STABLE
               ONLINE  ONLINE       orcl2                    STABLE
--------------------------------------------------------------------------------
Cluster Resources
--------------------------------------------------------------------------------
ora.ASMNET1LSNR_ASM.lsnr(ora.asmgroup)
      1        ONLINE  ONLINE       orcl1                    STABLE
      2        ONLINE  ONLINE       orcl2                    STABLE
ora.LISTENER_SCAN1.lsnr
      1        ONLINE  ONLINE       orcl1                    STABLE
ora.OCR.dg(ora.asmgroup)
      1        ONLINE  ONLINE       orcl1                    STABLE
      2        ONLINE  ONLINE       orcl2                    STABLE
ora.asm(ora.asmgroup)
      1        ONLINE  ONLINE       orcl1                    Started,STABLE
      2        ONLINE  ONLINE       orcl2                    Started,STABLE
ora.asmnet1.asmnetwork(ora.asmgroup)
      1        ONLINE  ONLINE       orcl1                    STABLE
      2        ONLINE  ONLINE       orcl2                    STABLE
ora.cdp1.cdp
      1        ONLINE  ONLINE       orcl1                    STABLE
ora.cvu
      1        ONLINE  ONLINE       orcl1                    STABLE
ora.orcl1.vip
      1        ONLINE  ONLINE       orcl1                    STABLE
ora.orcl2.vip
      1        ONLINE  ONLINE       orcl2                    STABLE
ora.rhpserver
      1        OFFLINE OFFLINE                               STABLE
ora.scan1.vip
      1        ONLINE  ONLINE       orcl1                    STABLE
--------------------------------------------------------------------------------
```

# 创建磁盘组

`asmca` 建一下 DATA 磁盘组：

![](https://files.mdnice.com/user/16270/073b10f5-3f3b-4cdb-af1b-833c90f3e017.png)

![](https://files.mdnice.com/user/16270/7702938a-ba8c-47ac-be90-f4c041ab3354.png)

![](https://files.mdnice.com/user/16270/d89d9b28-be42-415a-a5c7-3fc06f8e8685.png)

![](https://files.mdnice.com/user/16270/727c29db-3099-427a-906a-a4f8204a1a9d.png)

so easy，完事儿：

```bash
[grid@orcl1:/home/grid]$ asmcmd lsdg
State    Type    Rebal  Sector  Logical_Sector  Block       AU  Total_MB  Free_MB  Req_mir_free_MB  Usable_file_MB  Offline_disks  Voting_files  Name
MOUNTED  EXTERN  N         512             512   4096  4194304    102400   102260                0          102260              0             N  DATA/
MOUNTED  NORMAL  N         512             512   4096  4194304     30720    29708            10240            9734              0             Y  OCR/
```

# Oracle 安装

进入 oracle 用户，执行图形化安装：

```bash
cd $ORACLE_HOME
./runInstaller
```

![](https://files.mdnice.com/user/16270/5fc79823-49a6-46fb-b727-f1a3b5a0fea4.png)

![](https://files.mdnice.com/user/16270/23c717a0-4869-4793-9507-db6129b79fa4.png)

![](https://files.mdnice.com/user/16270/a634e021-5f1a-425d-82cc-f770b909cce3.png)

![](https://files.mdnice.com/user/16270/e4cb4314-5a2c-48b1-9339-24187e828fb4.png)

![](https://files.mdnice.com/user/16270/61ac53b5-801d-4f26-80dc-258b0647f964.png)

![](https://files.mdnice.com/user/16270/1673759b-6770-4c16-afc7-2c17fa15ca08.png)

![](https://files.mdnice.com/user/16270/a1adfcd8-7dc9-416d-9c7e-098fc5b7c525.png)

![](https://files.mdnice.com/user/16270/7c69d146-11f7-4a88-b6a2-b50120ca6313.png)

增加了一个 HugePages 的配置建议（大于 4G 建议配置大页内存）：

![](https://files.mdnice.com/user/16270/0824634f-6116-48db-a707-60f0bcb8efc4.png)

其他几个都是老三样了，直接忽略：

![](https://files.mdnice.com/user/16270/c6177db5-0421-4fca-bdcb-3425888ae96a.png)

![](https://files.mdnice.com/user/16270/c70cf76c-5674-42c2-adb9-0404d95a7a32.png)

![](https://files.mdnice.com/user/16270/cce698cf-4039-45a5-82d9-9951fe86743e.png)

![](https://files.mdnice.com/user/16270/d41bf4fb-4712-4e17-86b0-33b1f66cab4b.png)

![](https://files.mdnice.com/user/16270/b9039c04-92b7-4833-abc6-758aab21c49e.png)

Oracle 软件安装完成。

# 建库

`dbca` 建库：

![](https://files.mdnice.com/user/16270/d7e6557c-48db-4f7e-818f-f2e90dcaee7d.png)

![](https://files.mdnice.com/user/16270/0c352243-7e1d-4e02-8e83-fdf67b0ddbe5.png)

![](https://files.mdnice.com/user/16270/28de6b52-4f83-4031-b2ff-7b396d56c384.png)

![](https://files.mdnice.com/user/16270/99298807-06d3-4847-b268-57fe274d0418.png)

![](https://files.mdnice.com/user/16270/a48eb488-074e-454c-a11a-079206027eba.png)

![](https://files.mdnice.com/user/16270/879da16b-086a-4a8e-afe1-add6e077fb53.png)

![](https://files.mdnice.com/user/16270/2911edc6-0c21-44b2-872b-c221523a8b0d.png)

![](https://files.mdnice.com/user/16270/e5c7d95e-1442-4f07-824a-7cf2b891244c.png)

![](https://files.mdnice.com/user/16270/7e81e744-e879-4dfe-869c-b6933ed2420b.png)

![](https://files.mdnice.com/user/16270/c7701a5a-098d-498e-bd36-cb975649f3ef.png)

![](https://files.mdnice.com/user/16270/80636970-0107-4c0d-8432-bd41f511cab9.png)

![](https://files.mdnice.com/user/16270/ff2fd774-1027-49ac-8c6b-842554985ee5.png)

![](https://files.mdnice.com/user/16270/450f05b1-722c-447d-8002-948783c25321.png)

![](https://files.mdnice.com/user/16270/427dda88-bd9f-4d7a-9da9-e4c232b1fe5b.png)

![](https://files.mdnice.com/user/16270/82d0de7a-c3b1-4a80-93c4-70dc8b104894.png)

![](https://files.mdnice.com/user/16270/3b9c72f7-9c91-4b8a-aa0e-44194b05ecaf.png)

![](https://files.mdnice.com/user/16270/47e200f4-6331-489b-80c4-6eaaee2bf287.png)

建库完成。

# 连接数据库
sqlplus 连接数据库：
```bash
[oracle@orcl1:/home/oracle]$ sas

SQL*Plus: Release 23.0.0.0.0 - Production on Thu Aug 14 16:23:11 2025
Version 23.8.0.25.04

Copyright (c) 1982, 2025, Oracle.  All rights reserved.


Connected to:
Oracle Database 23ai Enterprise Edition Release 23.0.0.0.0 - Limited Availability
Version 23.8.0.25.04

SQL> show pdbs

    CON_ID CON_NAME                       OPEN MODE  RESTRICTED
---------- ------------------------------ ---------- ----------
         2 PDB$SEED                       READ ONLY  NO
         3 LUCIFER                        READ WRITE NO
SQL> alter session set container=lucifer;

Session altered.

SQL> select open_mode from v$database;

OPEN_MODE
--------------------
READ WRITE
```
有一些新变化，当命令执行错误时，会给出一个错误号链接：

![](https://files.mdnice.com/user/16270/6a98948a-88b1-4a5b-90e8-809f035f9e48.png)


# 写在最后
今天就到这了，后续有时间再测其他新特性和功能，Oracle 一键安装脚本会尽快适配 23ai 版本，大家可以期待一下。