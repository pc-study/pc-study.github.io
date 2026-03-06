---
title:  ORA 600 [qkaQknLTPruneKaf:1] BUG 分析与处理
date: 2025-03-26 15:34:26
tags: [墨力计划,oracle,ora-600]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1904740566840127488
---

>大家好，这里是 **DBA学习之路**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
今天检查一套 Oracle 12.1 单机数据库发现 alert 日志报错 ORA-600 [qkaQknLTPruneKaf:1]，本文记录一下处理过程。

# 问题描述
日常检查数据库，adrci 检查发现报错：
```bash
[oracle@lucifer ~]$ sqlplus -v

SQL*Plus: Release 12.1.0.2.0 Production

adrci> show problem  

ADR Home = /u01/app/oracle/diag/rdbms/lucifer/lucifer:
*************************************************************************
PROBLEM_ID           PROBLEM_KEY                                                 LAST_INCIDENT        LASTINC_TIME                             
-------------------- ----------------------------------------------------------- -------------------- ----------------------------------------     
1                    ORA 600 [qkaQknLTPruneKaf:1]                                113105               2025-03-25 14:02:29.144000 +08:00       
2                    ORA 600 [kewuxs_1]                                          113106               2025-03-25 14:02:42.486000 +08:00       
```
查看 alert 日志：
```bash
ORA-00600: internal error code, arguments: [qkaQknLTPruneKaf:1], [], [], [], [], [], [], [], [], [], [], []
ORA-00600: internal error code, arguments: [kewuxs_1], [600], [ORA-00600: internal error code, arguments: [qkaQknLTPruneKaf:1], [], [], [], [], [], [], [], [], [], [], []
ORA-06512: at "SYS.DBMS_SQL", line 1707
ORA-06512: at "SYS.DBMS_FEATURE_USAGE_INTERNAL", line 312
ORA-06512: at "SYS.DBMS_FEATURE_USAGE_INTERNAL", line 522
ORA-06512: at "SYS.DBMS_FEATURE_USAGE_INTERNAL", line 694
ORA-06512: at "SYS.DBMS_FEATURE_USAGE_INTERNAL", line 791
ORA-06512: at line 1
], [], [], [], [], [], [], [], [], []
```
日志中可以发现数据库每天都在报错：**ORA 600 [qkaQknLTPruneKaf:1]**，明显是不正常的现象。

# 问题分析
查看 alert 报错对应的 trc 文件内容：
```bash
----- Incident Context Dump -----
Address: 0x7ffc986bb400
Incident ID: 113625
Problem Key: ORA 600 [qkaQknLTPruneKaf:1]
Error: ORA-600 [qkaQknLTPruneKaf:1] [] [] [] [] [] [] [] [] [] [] []
[00]: dbgexProcessError [diag_dde]
[01]: dbgeExecuteForError [diag_dde]
[02]: dbgePostErrorKGE [diag_dde]
[03]: dbkePostKGE_kgsf [rdbms_dde]
[04]: kgeadse []
[05]: kgerinv_internal []
[06]: kgerinv []
[07]: kgeasnmierr []
[08]: qkaQknLTPruneKaf [SQL_Code_Generator]<-- Signaling
[09]: qkaQknPruneKaf [SQL_Code_Generator]
[10]: qknProjPushNode_Int [SQL_Code_Generator]
[11]: qknProjPushNode [SQL_Code_Generator]
[12]: qkeWalkAllQueryNodes [SQL_Code_Generator]
[13]: qknProjPushStmt [SQL_Code_Generator]
[14]: qkeProjPrune [SQL_Code_Generator]
[15]: qkadrv2 [SQL_Code_Generator]
```
该问题在 MOS 上搜索后发现是一个 BUG：
>[ORA-00600:[qkaQknLTPruneKaf:1] WHEN _NLJ_BATCHING_ENABLED=0 ON ORACLE 12C (Doc ID 2067672.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=2067672.1)

其描述与本次内容基本一致：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250326-1904785689716207616_395407.png)

查看隐含参数 `_NLJ_BATCHING_ENABLED` 在数据库中的值：
```sql
set line2222 pages1000
col name for a40
col value for a10
col describ for a60
select x.ksppinm name, y.ksppstvl value, x.ksppdesc describ
from sys.x$ksppi x, sys.x$ksppcv y
where x.inst_id = userenv ('instance')
and y.inst_id = userenv ('instance')
and x.indx = y.indx
and x.ksppinm = '_nlj_batching_enabled';

NAME                                     VALUE      DESCRIB
---------------------------------------- ---------- ------------------------------------------------------------
_nlj_batching_enabled                    0          enable batching of the RHS IO in NLJ
```
确实值被设置为 0，与该 BUG 现象完全一致，根据 MOS 建议有两种解决方案：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250326-1904786480321540096_395407.png)

这个问题 Oracle 官方提供了两种解决方案：
1. 打补丁 `26153372`（需要停机）
2. 修改隐含参数 `_nlj_batching_enabled=1`（在线修改）

如果停机时间充足的情况下，还是比较建议打补丁。

# 问题解决
打补丁修复，首先检查 OPatch 是否符合要求：
```bash
[oracle@lucifer ~]$ cd $ORACLE_HOME
[oracle@lucifer dbhome_1]$ cd OPatch/
[oracle@lucifer OPatch]$ ./opatch version
OPatch Version: 12.1.0.1.3

OPatch succeeded.
```
补丁 README 需要 opatch 版本为：`12.1.0.1.4 or the latest version`，这里 12.1.0.2 版本下载 12CR2 版本的 OPatch 即可：
>[OPatch - 可以在什么位置找到最新版本的 OPatch(6880880)？[视频] (Doc ID 1525335.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=1525335.1)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250326-1904791078557986816_395407.png)

更新 OPatch 版本：
```bash
[root@lucifer u01]# chown oracle:oinstall /home/oracle/p6880880_122010_Linux-x86-64.zip 
[oracle@lucifer ~]$ unzip -qo p6880880_122010_Linux-x86-64.zip -d $ORACLE_HOME
[oracle@lucifer ~]$ cd $ORACLE_HOME/OPatch
[oracle@lucifer OPatch]$ ./opatch version
OPatch Version: 12.2.0.1.45

OPatch succeeded.
```
解压补丁：
```bash
[root@lucifer ~]# chown oracle:oinstall /home/oracle/p26153372_121020_Linux-x86-64.zip
[oracle@lucifer ~]$ unzip -q p26153372_121020_Linux-x86-64.zip 
```
执行安装前检查：
```bash
[oracle@lucifer ~]$ cd 26153372/
[oracle@lucifer 26153372]$ $ORACLE_HOME/OPatch/opatch prereq CheckConflictAgainstOHWithDetail -ph ./
Oracle Interim Patch Installer version 12.2.0.1.45
Copyright (c) 2025, Oracle Corporation.  All rights reserved.

PREREQ session

Oracle Home       : /u01/app/oracle/product/12.1.0.2/dbhome_1
Central Inventory : /u01/app/oraInventory
   from           : /u01/app/oracle/product/12.1.0.2/dbhome_1/oraInst.loc
OPatch version    : 12.2.0.1.45
OUI version       : 12.1.0.2.0
Log file location : /u01/app/oracle/product/12.1.0.2/dbhome_1/cfgtoollogs/opatch/opatch2025-03-26_15-12-18PM_1.log

Invoking prereq "checkconflictagainstohwithdetail"

Prereq "checkConflictAgainstOHWithDetail" passed.

OPatch succeeded.
```
关闭 oracle 相关资源：
```bash
## 关闭监听
[oracle@lucifer ~]$ lsnrctl stop

## 关闭数据库
SQL> shu immediate
```
正式安装补丁：
```bash
[oracle@lucifer 26153372]$ $ORACLE_HOME/OPatch/opatch apply
```
安装完成后检查补丁：
```bash
$ORACLE_HOME/OPatch/opatch lspatches
```
关闭 oracle 相关资源：
```bash
## 关闭监听
[oracle@lucifer ~]$ lsnrctl start

## 打开数据库
SQL> startup
```
后续检查是否还会报错 ORA-600 即可。

# 写在最后
既然 BUG 难以避免，做好备份尤为重要。