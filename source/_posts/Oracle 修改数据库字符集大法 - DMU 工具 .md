---
title: Oracle 修改数据库字符集大法 - DMU 工具 
date: 2025-02-21 14:46:27
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1890218645071081472
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)


# 前言
上篇说到 [**甩锅篇：Oracle 数据库特殊字符 ™ 乱码问题**](https://www.modb.pro/db/1891306653245517824)，最后结论是客户端字符集设置有问题，但是开发不认，硬说建库时选错字符集了，要修改数据库字符集为 AL32UTF8，那会儿咋不说！

最后，拗不过还是要改，先测试环境测试一下修改过程吧，本次使用 DMU 工具修改数据库字符集为 AL32UTF8。

# DMU 工具
DMU 是 Unicode 数据库迁移助手，能够将现有数据库的 NLS_CHARACTERSET 转换为 AL32UTF8 或 UTF8。DMU 基于图形用户界面的工具，比 `csscan/csalter` 更加直观，并能在将 Oracle 数据库字符集更改为 `UTF8` 或 `AL32UTF8` 时，自动化许多转换过程。

DMU 还可用于验证现有 AL32UTF8/UTF8 数据库中的数据，并且如果需要，还可更正由于客户端配置不正确而未以 AL32UTF8/UTF8 编码存储的 UTF8/AL32UTF8 数据库中的数据。

从 DMU 1.2 开始，DMU 还可用于（有限制）更正数据库 NLS_CHARACTERSET。DMU 的当前版本是 **DMU 23.1**，于 2024 年 6 月发布。
>**MOS 下载**：  https://updates.oracle.com/download/36716892.html

![](https://oss-emcsprod-public.modb.pro/image/editor/20250214-1890224674508910592_395407.png)

**此版本中的新功能亮点包括**：
1. 使用数据泵转换方法提供了优化的转换性能，适用于迁移包含 CLOB 数据的大型数据集，并减少了迁移停机时间窗口的需求。
2. 索引检查功能可以检测并报告因 Unicode 迁移导致的潜在索引键大小违规问题，便于提前分析和修复。
3. 区块链和不可变表支持使得区块链和不可变表能够自动无缝地迁移到 Unicode，同时完全保持数据完整性。

# DMU 配置
当数据库版本大于 11.2.0.3 版本，使用 DMU 只需要安装 `SYS.DBMS_DUMA_INTERNAL` 包，该包需要使用 sys 用户运行 `$?/rdbms/admin/prvtdumi.plb` 来创建：
```sql
SQL> conn / as sysdba
Connected.
SQL> @?/rdbms/admin/prvtdumi.plb

Library created.


Package created.

No errors.

Package body created.

No errors.
```
如果数据库版本低于 11.2.0.3，使用 DMU 需要在服务器端提前安装补丁 `9825461`。

对于 DMU 不支持的版本/平台，使用 `Csscan & Csalter` 或者 `Csscan & Export/import` 是转为 AL32UTF8 的唯一方法。

# 启动 DMU 工具
如果数据库版本大于 12.1.0.2，在安装数据库软件时，会默认自带安装 DMU 2.0 客户端（用户界面）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892446738552729600_395407.png)

在 ORACLE_HOME 目录下可以找到 dmu 的安装目录：
```bash
[oracle@orcl19c:/home/oracle]$ ll $ORACLE_HOME/dmu
总用量 20
drwxr-xr-x.  2 oracle oinstall   37 4月  17 2019 configuration
drwxr-xr-x.  9 oracle oinstall  100 4月  17 2019 dmu
-rw-r--r--.  1 oracle oinstall  238 7月  13 2017 dmucls.sh
-rw-r--r--.  1 oracle oinstall   53 7月  19 2012 dmu.sh
drwxr-xr-x.  2 oracle oinstall   24 4月  17 2019 dropins
drwxr-xr-x.  2 oracle oinstall   60 4月  17 2019 equinox
drwxr-xr-x.  2 oracle oinstall 4096 4月  17 2019 external
drwxr-xr-x.  8 oracle oinstall   85 4月  17 2019 ide
drwxr-xr-x.  6 oracle oinstall   57 4月  17 2019 jdev
drwxr-xr-x.  2 oracle oinstall 4096 4月  17 2019 jlib
drwxr-xr-x. 10 oracle oinstall 4096 4月  17 2019 modules
drwxr-xr-x.  5 oracle oinstall   50 4月  17 2019 netbeans
drwxr-xr-x.  3 oracle oinstall   23 4月  17 2019 sleepycat
```
建议下载最新的 DMU 版本，解压替换默认 DMU：
```bash
[root@orcl19c:/soft]# chown oracle:oinstall /soft/p36716892_2310_Generic.zip 
[root@orcl19c:/soft]# su - oracle
[oracle@orcl19c:/home/oracle]$ cd /soft/
[oracle@orcl19c:/soft]$ unzip -qo p36716892_2310_Generic.zip -d $ORACLE_HOME
[oracle@orcl19c:/soft]$ cd $ORACLE_HOME/dmu
[oracle@orcl19c:/u01/app/oracle/product/19.3.0/db/dmu]$ sh dmu.sh 
```
必须使用图形化界面打开 DMU 工具：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892447711778058240_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892447825779240960_395407.png)

初始化界面如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892448125701337088_395407.png)

到这就算启动成功了。

# DMU 转换字符集
## 创建测试数据
为了测试数据完整，这里可以创建一个测试表，插入一些测试数据：
```sql
SQL> create user lucifer identified by oracle;
SQL> grant dba to lucifer;

SQL> conn lucifer/oracle

SQL> CREATE TABLE test_conversion (
    id NUMBER PRIMARY KEY,
    char_data VARCHAR2(4000),
    clob_data CLOB, 
    description VARCHAR2(500),
    mixed_content VARCHAR2(4000)
);

SQL> INSERT INTO test_conversion (id, char_data, clob_data, description, mixed_content)
VALUES (1, NULL, '这是一个包含中文字符的CLOB字段', '描述：包含中文字符的CLOB字段', NULL);

SQL> INSERT INTO test_conversion (id, char_data, clob_data, description, mixed_content)
VALUES (2, 'This is a CHAR field containing English characters.', NULL, 'Description: CHAR field with English characters', NULL);

SQL> INSERT INTO test_conversion (id, char_data, clob_data, description, mixed_content)
VALUES (3, NULL, '包含特殊字符的CLOB字段：$#@!&*()', 'Description: CLOB field with special characters', NULL);

SQL> INSERT INTO test_conversion (id, char_data, clob_data, description, mixed_content)
VALUES (4, NULL, '包含表情符号的CLOB字段：😊😂👍 ', 'Description: CLOB field with emojis', NULL);

SQL> INSERT INTO test_conversion (id, char_data, clob_data, description, mixed_content)
VALUES (5, '混合内容的字符字段：Hello，世界！1234 @#$%', NULL, 'Description: Mixed content CHAR field', '混合内容的CLOB字段：Hello，世界！1234 @#$%');

SQL> commit;

SQL> set line2222 pages1000 wrap off tab off
col char_data for a80
col clob_data for a80
col description for a80
col mixed_content for a80
select * from lucifer.test_conversion order by id;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892827796561473536_395407.png)

>**📢 注意**：这里有几个字符是 GBK 不支持的，所以显示乱码。

测试数据创建完成后下面就开始转换字符集。
## 连接数据库
首先连接需要转换字符集的数据库：
>📢注意：在正式进行数据库字符集转换之前，建议对数据库进行全备，确保数据库可以正常恢复。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892448442287403008_395407.png)

填写数据库连接信息，点击测试连接：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892449026377789440_395407.png)

确保能够正常连接，保存即可。

## 安装存储库
双击打开刚保存的连接：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892449334629773312_395407.png)

选择我们需要转换的数据库字符集：`AL32UTF8`

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892451176029892608_395407.png)

这里我选择 SYSAUX 表空间，大家也可以单独创建一个表空间：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892451456314257408_395407.png)

点击完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892451597775548416_395407.png)

等待一会儿，会提示安装完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892451719376809984_395407.png)

可以看到转换字符集一共需要 4 步，目前已经完成第一步：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892452140610760704_395407.png)

## 扫描数据库
第二步需要扫描数据库，点击链接即可跳转：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892452631377883136_395407.png)

配置一些参数用于扫描数据库，可根据实际情况进行配置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892453981713084416_395407.png)

选择需要扫描的用户：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892771085150597120_395407.png)

点击下一步：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250220-1892454813485510656_395407.png)

默认全部转换：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892771198749126656_395407.png)

等待扫描完成（**扫描时间取决于数据库对象数量以及大小**）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892771370266800128_395407.png)

扫描完成，这里显示有一些有问题的对象，可以通过 `scan report` 查看：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892771986439417856_395407.png)

检查是否存在会转换失败的对象：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892772151741132800_395407.png)

参考 [Tips For and Known Issues With The Database Migration Assistant for Unicode (DMU) Tool version (Doc ID 2018250.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=2018250.1) 文档，检查 `SYS.SOURCE$` 对象扫描问题：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892772714121801728_395407.png)

```sql
SQL> set line2222 pages1000
col owner for a10
col object_name for a30
col object_type for a20
SELECT OWNER, OBJECT_NAME, OBJECT_TYPE FROM dba_objects WHERE OBJECT_ID IN
(SELECT UNIQUE obj# FROM sys.source$ WHERE rowid IN
(SELECT row_id FROM system.dum$exceptions WHERE obj# =
( select OBJECT_ID FROM dba_objects where OWNER='SYS' AND OBJECT_NAME ='SOURCE$')
and TYPE ='8'))
ORDER BY owner;

OWNER      OBJECT_NAME                    OBJECT_TYPE
---------- ------------------------------ --------------------
SYS        INSERT_DATA_TO_TEST_TABLE      PROCEDURE
```
对了，这个是我之前测试数据的时候创建的一个存储过程，不符合要求：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892773984425488384_395407.png)

很简单，将这个存储过程删除或者移动到其他用户下即可：
```sql
SQL> drop procedure INSERT_DATA_TO_TEST_TABLE;

Procedure dropped.
```
重新扫描这个表：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892774345240489984_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892774515185299456_395407.png)

扫描完成后，这个问题已经修复。

但是，发现还是有感叹号，再次查看，发现还有一个视图 `WRH$_SQLSTAT` 有问题：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892774874603597824_395407.png)

参考文档是需要重建 AWR 存储库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892774973803081728_395407.png)

重建 AWR 参考文档 [How to Recreate the Automatic Workload Repository (AWR)? (Doc ID 782974.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=782974.1)：
```sql
-- 查看 AWR 配置，记录一下
SQL> select snap_interval from wrm$_wr_control;

-- 禁用 AWR
SQL> execute dbms_workload_repository.modify_snapshot_settings(interval => 0);

-- 重启数据库到受限模式
SQL> shutdown immediate
SQL> startup restrict

-- 执行 catnoawr 脚本删除 AWR，12.2 以上版本可能会遇到 ORA-600 [opiodr:] 报错
SQL> start $ORACLE_HOME/rdbms/admin/catnoawr.sql

-- 检查是否所有 AWR 相关对象都被删除了
SQL> SELECT 'DROP TABLE ' || table_name || ' CASCADE CONSTRAINTS;'
FROM dba_tables where table_name like 'WRM$_%' or table_name like 'WRH$_%' or table_name like 'AWR%';

-- 如果没有删除完成，可以手动执行删除
-- WRH$_SYSMETRIC_HISTORY_BL 在 19c 会被保留
SQL> drop table WRH$_SYSMETRIC_HISTORY_BL CASCADE CONSTRAINTS; 
drop type AWR_OBJECT_INFO_TABLE_TYPE;
drop type AWR_OBJECT_INFO_TYPE;
drop table WRH$_PLAN_OPERATION_NAME;
drop table WRH$_PLAN_OPTION_NAME;
drop table WRH$_MV_PARAMETER;
drop table WRH$_MV_PARAMETER_BL;
drop table WRH$_DYN_REMASTER_STATS;
drop table WRH$_PERSISTENT_QMN_CACHE;
drop table WRH$_DISPATCHER;
drop table WRH$_SHARED_SERVER_SUMMARY;
drop table WRM$_WR_USAGE;
drop table WRM$_SNAPSHOT_DETAILS;

-- 重建 AWR
SQL> PURGE RECYCLEBIN;
SQL> start $ORACLE_HOME/rdbms/admin/catawrtb.sql
SQL> start $ORACLE_HOME/rdbms/admin/execsvrm.sql
SQL> start $ORACLE_HOME/rdbms/admin/utlrp.sql

-- 重启数据库
SQL> shutdown immediate
SQL> startup

-- 恢复 AWR 配置
SQL> execute dbms_workload_repository.modify_snapshot_settings(interval => 60);

-- 手动创建快照
SQL> exec dbms_workload_repository.create_snapshot;

-- 手动创建 SYS.WRMS$_SNAPSHOT 表
CREATE TABLE "SYS"."WRMS$_SNAPSHOT"
( "SNAP_ID" NUMBER NOT NULL ENABLE,
"DBID" NUMBER NOT NULL ENABLE,
"INSTANCE_NUMBER" NUMBER NOT NULL ENABLE,
"STARTUP_TIME" TIMESTAMP (3) NOT NULL ENABLE,
"BEGIN_INTERVAL_TIME" TIMESTAMP (3) NOT NULL ENABLE,
"END_INTERVAL_TIME" TIMESTAMP (3) NOT NULL ENABLE,
"FLUSH_ELAPSED" INTERVAL DAY (5) TO SECOND (1),
"SNAP_LEVEL" NUMBER,
"STATUS" NUMBER,
"ERROR_COUNT" NUMBER,
"BL_MOVED" NUMBER,
"SNAP_FLAG" NUMBER,
"SNAP_TIMEZONE" INTERVAL DAY (0) TO SECOND (0),
"STAGE_INST_ID" NUMBER NOT NULL ENABLE,
"STAGE_ID" NUMBER NOT NULL ENABLE
);
```
重建 AWR 完成之后，再次扫描后：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892779737307688960_395407.png)

问题已经解决。

## 解决转换问题
第三步需要解决正式转换前的一些问题：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892780027448668160_395407.png)

第一个问题可以修改配置，这 2 个建议都改成 Yes：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892780681999167488_395407.png)

修改完之后，再次 `Retest` 一下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892780805596917760_395407.png)

还有一个问题需要解决，这个是因为有表空间开启了 force logging：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892780984509149184_395407.png)

我查了下是 SYSTEM 和 SYSAUX 表空间：
```sql
SQL> select tablespace_name,force_logging from dba_tablespaces;

TABLESPACE_NAME                FOR
------------------------------ ---
SYSTEM                         YES
SYSAUX                         YES
UNDOTBS1                       NO
TEMP                           NO
USERS                          NO
```
手动修改为 NO：
```sql
SQL> alter tablespace SYSTEM no force logging;

Tablespace altered.

SQL> alter tablespace SYSAUX no force logging;

Tablespace altered.
```
>**📢 注意**：字符集转换完成后需要修改回来。

再次 Retest 之后，已经没有报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892781782915887104_395407.png)

可以正式开始转换数据库字符集。

## 转换字符集
右键选择转换字符集：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892781987501453312_395407.png)

确认没问题，执行转换：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892782185782980608_395407.png)

这里需要注意的是，在转换时最好确保没有用户连接数据库，否则报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892782354381418496_395407.png)

转换前确认：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892782985775165440_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892783037109252096_395407.png)

正式开始转换：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892783142335950848_395407.png)

很快转换完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892783243640975360_395407.png)

完成后建议重启一下数据库，因为我发现监听显示数据库是受限模式：
```bash
[oracle@orcl19c:/home/oracle]$ lsnrctl stat

LSNRCTL for Linux: Version 19.0.0.0.0 - Production on 21-FEB-2025 13:13:45

Copyright (c) 1991, 2019, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=orcl19c)(PORT=1521)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 19.0.0.0.0 - Production
Start Date                21-FEB-2025 13:13:32
Uptime                    0 days 0 hr. 0 min. 13 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/oracle/product/19.3.0/db/network/admin/listener.ora
Listener Log File         /u01/app/oracle/diag/tnslsnr/orcl19c/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=orcl19c)(PORT=1521)))
  (DESCRIPTION=(ADDRESS=(PROTOCOL=ipc)(KEY=EXTPROC1521)))
Services Summary...
Service "lucifer" has 1 instance(s).
  Instance "lucifer", status RESTRICTED, has 1 handler(s) for this service...
Service "luciferXDB" has 1 instance(s).
  Instance "lucifer", status RESTRICTED, has 1 handler(s) for this service...
The command completed successfully
```
重启数据库：
```sql
SQL> shutdown immediate
SQL> startup
```
查看数据库字符集：
```sql
SQL> set line2222 pages1000
col parameter for a30
col value for a20
select * from nls_database_parameters where parameter='NLS_CHARACTERSET';

PARAMETER                      VALUE
------------------------------ --------------------
NLS_CHARACTERSET               AL32UTF8
```
查看客户端字符集：
```bash
[oracle@orcl19c:/home/oracle]$ echo $NLS_LANG
AMERICAN_AMERICA.ZHS16GBK
```
查看测试数据：
```sql
SQL> set line2222 pages1000 wrap off tab off
col char_data for a80
col clob_data for a80
col description for a80
col mixed_content for a80
select * from lucifer.test_conversion order by id;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892823944663674880_395407.png)

**📢 注意**：这里有几个字符乱码是在转换前就是乱码的。

如果此时修改客户端字符集 AL32UTF8：
```bash
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
```
查询数据就会乱码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892823399525789696_395407.png)

如果重新插入测试数据，就不会乱码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250221-1892823722034212864_395407.png)

到此，数据库字符集就转换完成了。

## 收尾工作
记得要将过程中修改的还原回去：
```sql
SQL> alter tablespace SYSTEM force logging;

Tablespace altered.

SQL> alter tablespace SYSAUX force logging;

Tablespace altered.
```
到这就结束啦。

# 写在最后
由于之前没使用过 DMU 这个工具，所以本文也仅是作为测试记录所用，如有问题，欢迎在评论区指出！

# 参考文档
本文部分内容参考自 Oracle MOS 文档内容：

- [Oracle Database Migration Assistant for Unicode](https://www.oracle.com/cn/database/technologies/appdev/oracle-database-migration-assistant.html)
- [Oracle Database Migration Assistant for Unicode 23.1 文档](https://docs.oracle.com/en/database/oracle/dmu/23.1/)
- [Patch 36716892 - DMU Client 23.1.0 下载](https://updates.oracle.com/download/36716892.html)
- [The Database Migration Assistant for Unicode (DMU) Tool (Doc ID 1272374.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=1272374.1)
- [如何选择或更改数据库字符集 (NLS_CHARACTERSET) (Doc ID 1525394.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=1525394.1)

---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)


