---
title: [译] Oracle Database 18c 中的只读 Oracle 主目录
date: 2022-01-17 11:01:47
tags: [墨力计划,oracle 18c,只读目录]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/238657
---

>原文地址：[https://oracle-base.com/articles/18c/read-only-oracle-homes-18c](https://oracle-base.com/articles/18c/read-only-oracle-homes-18c)
原文作者：Tim Hall

Oracle 18C 引入了只读 Oracle 主目录的概念，其中所有配置和日志文件都可以与 Oracle 二进制文件分开保存。
@[TOC](目录)

# 为什么要这么做？
对于其他一些产品，将配置与二进制文件分开是一种常见的做法。

- Tomcat 具有软件所在的 CATALINA_HOME 和配置、应用程序文件和日志文件所在的 CATALINA_BASE 的概念。
- WebLogic 安装的最佳实践是将配置（域和应用程序）保留在中间件主目录之外。
- Oracle 数据库安装的最佳实践是将数据文件保存在 ORACLE_HOME 目录之外。

只读 Oracle 主目录的概念是数据库产品的自然演变，它可以在更新补丁和升级期间更轻松地在现有 Oracle 主目录之间进行克隆和切换，而无需查找所有其他配置文件。

# 先决条件
本文假设您已经安装了 Oracle 数据库 18C 的仅软件安装，如下所述：
- [在 Oracle Linux 6 (OL6) 和 7 (OL7) 上安装 Oracle Database 18c](https://oracle-base.com/articles/18c/oracle-db-18c-installation-on-oracle-linux-6-and-7)

注意在创建数据库实例之前停止。

# 启用只读 Oracle 主目录
`roohctl` 脚本（只读 Oracle Home CTL）用于启用只读 Oracle Home，通过下方例子演示：
```bash
$ cd $ORACLE_HOME/bin
$ ./roohctl -enable 
Enabling Read-Only Oracle home.
Update orabasetab file to enable Read-Only Oracle home.
Orabasetab file has been updated successfully.
Create bootstrap directories for Read-Only Oracle home.
Bootstrap directories have been created successfully.
Bootstrap files have been processed successfully.
Read-Only Oracle home has been enabled successfully.
Check the log file /u01/app/oracle/cfgtoollogs/roohctl/roohctl-180728AM112212.log.
$
```
“homes” 和 “dbs” 目录已经在 ORACLE_BASE 目录下被创建 ：
```bash
$ ls $ORACLE_BASE
cfgtoollogs  checkpoints  dbs  diag  homes  product
$
```
在创建数据库之前，“dbs”目录将是空的，“homes”目录具有以下结构：
```bash
$ cd $ORACLE_BASE/homes
$ tree
.
└── OraDB18Home1
    ├── assistants
    │   └── dbca
    │       └── templates
    ├── dbs
    ├── install
    ├── network
    │   ├── admin
    │   ├── log
    │   └── trace
    └── rdbms
        ├── audit
        └── log

13 directories, 0 files
$
```
# 创建数据库
启用只读 Oracle 主目录后，我们现在可以创建数据库：
```bash
lsnrctl start

dbca -silent -createDatabase                                                   \
     -templateName General_Purpose.dbc                                         \
     -gdbname ${ORACLE_SID} -sid  ${ORACLE_SID} -responseFile NO_VALUE         \
     -characterSet AL32UTF8                                                    \
     -sysPassword SysPassword1                                                 \
     -systemPassword SysPassword1                                              \
     -createAsContainerDatabase true                                           \
     -numberOfPDBs 1                                                           \
     -pdbName ${PDB_NAME}                                                      \
     -pdbAdminPassword PdbPassword1                                            \
     -databaseType MULTIPURPOSE                                                \
     -memoryMgmtType auto_sga                                                  \
     -totalMemory 2000                                                         \
     -storageType FS                                                           \
     -datafileDestination "${DATA_DIR}"                                        \
     -redoLogFileSize 50                                                       \
     -emConfiguration NONE                                                     \
     -ignorePreReqs
```
# 检查文件系统
创建数据库后，将在新目录中创建文件，“dbs” 目录的内容如下所示（在一个可读写的 Oracle 主目录中，我们可以在 $ORACLE_HOME/dbs 目录下看到这些文件）：
```bash
$ cd $ORACLE_BASE/dbs
$ tree
.
├── hc_cdb1.dat
├── initcdb1.ora
├── lkCDB1
├── orapwcdb1
└── spfilecdb1.ora

0 directories, 5 files
$
```
“homes” 目录的内容如下所示：
```bash
$ cd $ORACLE_BASE/homes
$ tree
.
└── OraDB18Home1
    ├── assistants
    │   └── dbca
    │       └── templates
    ├── dbs
    ├── install
    ├── log
    │   ├── diag
    │   │   └── adrci_dir.mif
    │   └── localhost
    │       └── client
    │           └── tnslsnr_26425.log
    ├── network
    │   ├── admin
    │   ├── log
    │   └── trace
    └── rdbms
        ├── audit
        └── log
            ├── cdb1_ora_26901.trc
            ├── cdb1_ora_27066.trc
            ├── cdb1_ora_27164.trc
            ├── cdb1_ora_27984.trc
            ├── cdb1_ora_27985.trc
            ├── cdb1_ora_29244.trc
            ├── cdb1_ora_29249.trc
            ├── opatch
            │   ├── lsinv
            │   │   ├── lsinventory2018-07-28_11-48-30AM.txt
            │   │   ├── lsinventory2018-07-28_11-48-34AM.txt
            │   │   ├── lsinventory2018-07-28_11-53-39AM.txt
            │   │   ├── lsinventory2018-07-28_11-54-16AM.txt
            │   │   ├── lsinventory2018-07-28_11-54-20AM.txt
            │   │   └── lsinventory2018-07-28_11-58-00AM.txt
            │   ├── opatch2018-07-28_11-48-30AM_1.log
            │   ├── opatch2018-07-28_11-48-34AM_1.log
            │   ├── opatch2018-07-28_11-53-39AM_1.log
            │   ├── opatch2018-07-28_11-54-16AM_1.log
            │   ├── opatch2018-07-28_11-54-20AM_1.log
            │   ├── opatch2018-07-28_11-58-00AM_1.log
            │   └── opatch_history.txt
            ├── qopatch.log
            └── qopatch_log.log

19 directories, 24 files
$
```
# 路径和导航
“orabasetab” 文件包含 “/etc/oratab” 文件中的 ORACLE_HOME、ORACLE_BASE 和“$ORACLE_BASE/homes” 目录下的主目录名称之间的映射：
```bash
$ cat $ORACLE_HOME/install/orabasetab
#orabasetab file is used to track Oracle Home associated with Oracle Base
/u01/app/oracle/product/18.0.0/dbhome_1:/u01/app/oracle:OraDB18Home1:Y:
$
```
orabaseconfig 和 orabasehome 命令显示配置的有效位置，对于读写 Oracle 主目录，orabaseconfig 和 orabasehome 命令都返回 ORACLE_HOME 值。对于只读 Oracle 主目录，orabaseconfig 命令返回 ORACLE_BASE 位置。对于只读 Oracle 主目录，orabasehome 命令返回  “$ORACLE_BASE/homes” 目录下的相关路径：
```bash
# 读写 Oracle home.

$ . oraenv
ORACLE_SID = [cdb1] ?
The Oracle base remains unchanged with value /u01/app/oracle
$ $ORACLE_HOME/bin/orabaseconfig
/u01/app/oracle/product/18.0.0/dbhome_1
$ $ORACLE_HOME/bin/orabasehome
/u01/app/oracle/product/18.0.0/dbhome_1
$

# 只读 Oracle home.

$ . oraenv
ORACLE_SID = [cdb1] ?
The Oracle base remains unchanged with value /u01/app/oracle
$ $ORACLE_HOME/bin/orabaseconfig
/u01/app/oracle
$ $ORACLE_HOME/bin/orabasehome
/u01/app/oracle/homes/OraDB18Home1
$
```
如果 “$ORACLE_HOME/bin” 路径是 PATH 环境变量的一部分，我们可以如下导航：
```bash
$ cd $(orabaseconfig)
$ pwd
/u01/app/oracle
$ cd $(orabasehome)
$ pwd
/u01/app/oracle/homes/OraDB18Home1
$
```