---
title: [译] 克隆 Oracle 21c 家目录
date: 2022-03-08 10:18:48
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/338040
---

>原文地址：[https://blog.dbi-services.com/clone-oracle-21c-home/](https://blog.dbi-services.com/clone-oracle-21c-home/)
原文作者：Mouhamadou Diaw

当我们在同一台服务器或新服务器上部署新的 Oracle Home 时，可以使用下载的 Oracle 二进制文件像往常一样从头开始安装，然后可以在新的 Oracle Homes 上应用补丁，但是这可能需要耗费很长的时间。

Oracle 提供了一些工具来克隆现有的 Oracle 主目录，其中包含所有补丁。我通常使用著名的 `clone.pl` 脚本，但它仍然适用于 Oracle 21c 吗？

因此我决定做一些测试来确认。

目前我已经在 Oracle Home 安装 33239276 补丁：
```bash
oracle@oraadserver:/home/oracle/ [DB21 (CDB$ROOT)] echo $ORACLE_HOME/
/u01/app/oracle/product/21.3.0/db_1/
 
oracle@oraadserver:/u01/app/oracle/product/21.3.0/ [DB21 (CDB$ROOT)] opatch lspatches
33239276;Database Release Update : 21.4.0.0.211019 (33239276)
 
OPatch succeeded.
oracle@oraadserver:/u01/app/oracle/product/21.3.0/ [DB21 (CDB$ROOT)]
```
我决定使用传统的 clone.pl 脚本在同一台服务器上克隆它：

1、将 db_1 中的二进制文件复制到新的 db_2 的 Oracle_home 目录中，随后进行压缩（zip、cp、tar…），接着只需调整 db_1 上的权限即可：
```bash
[root@oraadserver 21.3.0]# pwd
/u01/app/oracle/product/21.3.0
[root@oraadserver 21.3.0]#
 
[root@oraadserver 21.3.0]# ls -ld *
drwxr-xr-x. 66 oracle oinstall 4096 Dec 20 14:52 db_1
drwxr-xr-x. 66 oracle oinstall 4096 Dec 20 14:52 db_2
[root@oraadserver 21.3.0]#
```
2、使用用户 oracle 运行脚本 clone.pl，如下所示：
```bash
oracle@oraadserver:/home/oracle/ [DB21 (CDB$ROOT)] /u01/app/oracle/product/21.3.0/db_2/perl/bin/perl /u01/app/oracle/product/21.3.0/db_2/clone/bin/clone.pl ORACLE_BASE="/u01/app/oracle" ORACLE_HOME="/u01/app/oracle/product/21.3.0/db_2"  ORACLE_HOME_NAME=OraDB21Home3
Jan 24, 2022 1:04:03 PM oracle.install.library.util.MachineInfo isHostExadata
INFO: This host is not an Exadata system.
 
 
[INFO] [INS-32183] Use of clone.pl is deprecated in this release. Clone operation is equivalent to performing a Software Only installation from the image.
You must use /u01/app/oracle/product/21.3.0/db_2/runInstaller script available to perform the Software Only install. For more details on image based installation, refer to help documentation.
 
Starting Oracle Universal Installer...
 
You can find the log of this install session at:
 /u01/app/oraInventory/logs/cloneActions2022-01-24_01-04-02PM.log
..................................................   5% Done.
..................................................   10% Done.
..................................................   15% Done.
..................................................   20% Done.
..................................................   25% Done.
..................................................   30% Done.
..................................................   35% Done.
..................................................   40% Done.
..................................................   45% Done.
..................................................   50% Done.
..................................................   55% Done.
..................................................   60% Done.
..................................................   65% Done.
..................................................   70% Done.
..................................................   75% Done.
........................................
Copy files in progress.
 
Copy files successful.
 
Link binaries in progress.
..........
Link binaries successful.
 
Setup files in progress.
..........
Setup files successful.
 
Setup Inventory in progress.
 
Setup Inventory successful.
..........
Finish Setup successful.
The cloning of OraDB21Home3 was successful.
Please check '/u01/app/oraInventory/logs/cloneActions2022-01-24_01-04-02PM.log' for more details.
 
Setup Oracle Base in progress.
 
Setup Oracle Base successful.
..................................................   88% Done.
 
Setup Read-Only Oracle Home in progress.
 
Setup Read-Only Oracle Home successful.
..................................................   96% Done.
 
As a root user, execute the following script(s):
        1. /u01/app/oracle/product/21.3.0/db_2/root.sh
 
 
 
..................................................   100% Done.
oracle@oraadserver:/home/oracle/ [DB21 (CDB$ROOT)]
```
尽管过程中有警告“[INFO] [INS-32183] Use of clone.pl is deprecated in this release...”，但结果是成功的。最后只需要根据需要运行 root.sh 脚本：
```bash
[root@oraadserver 21.3.0]# /u01/app/oracle/product/21.3.0/db_2/root.sh
Check /u01/app/oracle/product/21.3.0/db_2/install/root_oraadserver_2022-01-24_13-07-38-506111736.log for the output of root script
[root@oraadserver 21.3.0]#
```
然后我们可以验证 Oracle Home 克隆是否正常：
```bash
oracle@oraadserver:/home/oracle/ [rdbms213c2] echo $ORACLE_HOME/
/u01/app/oracle/product/21.3.0/db_2/
oracle@oraadserver:/home/oracle/ [rdbms213c2] opatch lspatches
33239276;Database Release Update : 21.4.0.0.211019 (33239276)
 
OPatch succeeded.
oracle@oraadserver:/home/oracle/ [rdbms213c2]
```
通过以上告警提示，我们可以看到 clone.pl 已被弃用，Oracle 建议从映像执行仅软件安装。这个过程是如何工作的？

一起来看看这个方法！

1、首先使用 runInstaller 命令创建映像，如下所示

从源 Oracle Home 执行：
```bash
[oracle@oraadserver ~]$  /u01/app/oracle/product/21.3.0/db_1/runInstaller -createGoldImage -destinationLocation /home/oracle/gold_software/
Launching Oracle Database Setup Wizard...
```
安装向导运行如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20220308-662d3018-3475-44f0-8eb8-a3c29c5c241d.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20220308-ffb7bae3-4f44-4353-81e9-def0e7fcaa2e.png)

如果您没有配置图形环境或不想使用图形工具，只需使用命令中的静默选项：
```bash
[oracle@oraadserver ~]$  /u01/app/oracle/product/21.3.0/db_1/runInstaller -silent -createGoldImage -destinationLocation /home/oracle/gold_software/
```
2、现在让我们使用刚刚创建的 goldimage 部署一个新的 Oracle Home 目录：

第一步是解压新 Oracle Home 文件夹中的 goldimage：
```bash
oracle@oraadserver:/home/oracle/gold_software/ [rdbms213c] ls -ltra
total 3622644
drwx------. 8 oracle oinstall       4096 Jan 24 13:38 ..
-rw-r--r--. 1 oracle oinstall 3709576334 Jan 24 13:44 db_home_2022-01-24_01-38-44PM.zip
drwxr-xr-x. 2 oracle oinstall         46 Jan 24 13:44 .
oracle@oraadserver:/home/oracle/gold_software/ [rdbms213c] mkdir -p /u01/app/oracle/product/21.3.0/db_2
oracle@oraadserver:/home/oracle/gold_software/ [rdbms213c] unzip -d /u01/app/oracle/product/21.3.0/db_2 db_home_2022-01-24_01-38-44PM.zip
```
之后我们可以在新的 Oracle Home 中使用 runInstaller 开始部署：
```bash
[oracle@oraadserver db_2]$ pwd
/u01/app/oracle/product/21.3.0/db_2
[oracle@oraadserver db_2]$ ./runInstaller
```
安装过程和往常一样（但这里我们不需要安装最终的补丁，因为它们已经在 GoldImage 中了），不展示所有过程：

![](https://oss-emcsprod-public.modb.pro/image/editor/20220308-1caa5f77-2b10-41c3-9953-b31a94899f30.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20220308-2ad220d2-4e6b-454f-9170-2bf65e8770a5.png)

并且在安装结束时，我们可以验证新的 Oracle Home 是否具有相同的补丁：
```bash
oracle@oraadserver:/home/oracle/ [rdbms213c2] opatch lspatches
33239276;Database Release Update : 21.4.0.0.211019 (33239276)
 
OPatch succeeded.
oracle@oraadserver:/home/oracle/ [rdbms213c2]
```
请注意，如果您没有或不想要图形工具，您也可以在此处使用静默安装，我们还可以验证 Oracle Inventory 是否正常：
```bash
oracle@oraadserver:/home/oracle/ [rdbms213c2] opatch util LoadXML -xmlInput /u01/app/oraInventory/ContentsXML/inventory.xml
Oracle Interim Patch Installer version 12.2.0.1.27
Copyright (c) 2022, Oracle Corporation.  All rights reserved.
 
 
Oracle Home       : /u01/app/oracle/product/21.3.0/db_2
Central Inventory : /u01/app/oraInventory
   from           : /u01/app/oracle/product/21.3.0/db_2/oraInst.loc
OPatch version    : 12.2.0.1.27
OUI version       : 12.2.0.9.0
Log file location : /u01/app/oracle/product/21.3.0/db_2/cfgtoollogs/opatch/opatch2022-01-24_14-05-10PM_1.log
 
Invoking utility "loadxml"
UtilSession: XML file is OK.
 
OPatch succeeded.
oracle@oraadserver:/home/oracle/ [rdbms213c2]
```
**结论：**

我们看到了如何将现有的 Oracle Home 克隆到新的。虽然您仍然可以使用传统的 clone.pl 脚本，但强烈建议对最新的 Oracle 版本采用映像方法。