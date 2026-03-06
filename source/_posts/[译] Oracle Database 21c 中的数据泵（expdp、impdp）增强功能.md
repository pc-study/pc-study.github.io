---
title: [译] Oracle Database 21c 中的数据泵（expdp、impdp）增强功能
date: 2022-01-12 14:11:38
tags: [墨力计划,oracle 21c,impdp expdp 数据泵]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/237256
---

>原文地址：[https://oracle-base.com/articles/21c/data-pump-enhancements-21c](https://oracle-base.com/articles/21c/data-pump-enhancements-21c)
原文作者：Tim Hall

@[TOC](目录)

本文主要概述了 Oracle Database 21c 中的数据泵增强功能。

# 环境准备
在可插拔数据库中创建一个 testuser1 用户：
```sql
conn sys/SysPassword1@//localhost:1521/pdb1 as sysdba

--drop user testuser1 cascade;
create user testuser1 identified by testuser1 quota unlimited on users;
grant connect, resource to testuser1;
grant select_catalog_role to testuser1;
```
创建一个新的目录并授予测试用户访问权限：
```sql
create or replace directory tmp_dir as '/tmp/';
grant read, write on directory tmp_dir to testuser1;
```
在测试用户下创建以下表并插入数据：
```sql
conn testuser1/testuser1@//localhost:1521/pdb1

-- drop table t1 purge;

create table t1 (
  id         number generated always as identity,
  json_data  json,
  constraint ta_pk primary key (id)
);

insert into t1 (json_data) values (json('{"fruit":"apple","quantity":10}'));
insert into t1 (json_data) values (json('{"fruit":"orange","quantity":20}'));
commit;
```
# JSON 数据类型支持
Oracle 21C 的导出和导入实用程序已包括对新 JSON 数据类型的支持。

以下示例，通过 expdp 实用程序导出 T1 表，需要注意的是，T1 表需要包含使用新 JSON 数据类型定义的列。
```bash
$ expdp testuser1/testuser1@//localhost:1521/pdb1 \
    tables=t1 \
    directory=tmp_dir \
    dumpfile=t1.dmp \
    logfile=expdp_t1.log \
    exclude=statistics

Export: Release 21.0.0.0.0 - Production on Sun Sep 5 08:41:15 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates.  All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Starting "TESTUSER1"."SYS_EXPORT_TABLE_01":  testuser1/********@//localhost:1521/pdb1
  tables=t1 directory=tmp_dir dumpfile=t1.dmp logfile=expdp_t1.log exclude=statistics
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
. . exported "TESTUSER1"."T1"                            6.070 KB       2 rows
Master table "TESTUSER1"."SYS_EXPORT_TABLE_01" successfully loaded/unloaded
******************************************************************************
Dump file set for TESTUSER1.SYS_EXPORT_TABLE_01 is:
  /tmp/t1.dmp
Job "TESTUSER1"."SYS_EXPORT_TABLE_01" successfully completed at Sun Sep 5 08:41:45 2021 elapsed 0 00:00:28

$
```
我们导入 DUMP 文件，将表名重新映射为 T1_COPY：
```bash
$ impdp testuser1/testuser1@//localhost:1521/pdb1 \
    tables=t1 \
    directory=tmp_dir \
    dumpfile=t1.dmp \
    logfile=impdp_t1.log \
    remap_table=testuser1.t1:t1_copy

Import: Release 21.0.0.0.0 - Production on Sun Sep 5 08:46:32 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates.  All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Master table "TESTUSER1"."SYS_IMPORT_TABLE_01" successfully loaded/unloaded
Starting "TESTUSER1"."SYS_IMPORT_TABLE_01":  testuser1/********@//localhost:1521/pdb1 
  tables=t1 directory=tmp_dir dumpfile=t1.dmp logfile=impdp_t1.log remap_table=testuser1.t1:t1_copy
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
. . imported "TESTUSER1"."T1_COPY"                       6.070 KB       2 rows
Processing object type TABLE_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
ORA-31684: Object type CONSTRAINT:"TESTUSER1"."TA_PK" already exists

Job "TESTUSER1"."SYS_IMPORT_TABLE_01" completed with 1 error(s) at Sun Sep 5 08:46:39 2021 elapsed 0 00:00:05

$
```
# CHECKSUM、CHECKSUM_ALGORITHM、VERIFY_ONLY 和 VERIFY_CHECKSUM 参数
>计算校验需要花费时间，DUMP 文件越大，计算校验所需的工作量就越大。

Oracle 21C 数据库泵已添加 CHECKSUM 和 CHECKSUM_ALGORITHM 参数，以防止 DUMP 文件的数据被篡改。如果我们设置 CHECKSUM_ALGORITHM 参数，那么 CHECKSUM 参数默认为 yes。如果两者都没有设置，则CHECKSUM 参数默认为 no。CHECKSUM_ALGORITHM 参数可以设置为 CRC32、SHA256、SHA384 或 SHA512，默认为 SHA256。

在下面的示例中，我们启用 CHECKSUM, 并将 显式设置 CHECKSUM_ALGORITHM 为模式导出的默认值：
```bash
$ expdp testuser1/testuser1@//localhost:1521/pdb1 \
    schemas=testuser1 \
    directory=tmp_dir \
    dumpfile=testuser1.dmp \
    logfile=expdp_testuser1.log \
    exclude=statistics \
    checksum=yes \
    checksum_algorithm=SHA256

Export: Release 21.0.0.0.0 - Production on Sun Sep 5 08:58:55 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates.  All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Starting "TESTUSER1"."SYS_EXPORT_SCHEMA_01":  testuser1/********@//localhost:1521/pdb1
  schemas=testuser1 directory=tmp_dir dumpfile=testuser1.dmp logfile=expdp_testuser1.log exclude=statistics checksum=yes checksum_algorithm=SHA256
Processing object type SCHEMA_EXPORT/TABLE/TABLE_DATA
Processing object type SCHEMA_EXPORT/PRE_SCHEMA/PROCACT_SCHEMA
Processing object type SCHEMA_EXPORT/TABLE/TABLE
Processing object type SCHEMA_EXPORT/TABLE/COMMENT
Processing object type SCHEMA_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type SCHEMA_EXPORT/TABLE/INDEX/INDEX
Processing object type SCHEMA_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
. . exported "TESTUSER1"."T1"                            6.070 KB       2 rows
. . exported "TESTUSER1"."T1_COPY"                       6.078 KB       2 rows
Master table "TESTUSER1"."SYS_EXPORT_SCHEMA_01" successfully loaded/unloaded
Generating checksums for dump file set
******************************************************************************
Dump file set for TESTUSER1.SYS_EXPORT_SCHEMA_01 is:
  /tmp/testuser1.dmp
Job "TESTUSER1"."SYS_EXPORT_SCHEMA_01" successfully completed at Sun Sep 5 08:59:38 2021 elapsed 0 00:00:41

$
```
我们可以使用 VERIFY_ONLY 参数验证转储文件的校验：
```bash
$ impdp testuser1/testuser1@//localhost:1521/pdb1 \
    directory=tmp_dir \
    dumpfile=testuser1.dmp \
    verify_only=yes

Import: Release 21.0.0.0.0 - Production on Sun Sep 5 09:10:55 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates.  All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Verifying dump file checksums
Master table "TESTUSER1"."SYS_IMPORT_FULL_01" successfully loaded/unloaded
dump file set is complete
verified checksum for dump file "/tmp/testuser1.dmp"
dump file set is consistent
Job "TESTUSER1"."SYS_IMPORT_FULL_01" successfully completed at Sun Sep 5 09:10:57 2021 elapsed 0 00:00:01

$
```
在导入过程中，我们可以使用 VERIFY_CHECKSUM 参数来验证校验。如果验证失败，则不会进行导入。如果不使用 VERIFY_CHECKSUM 参数，即使校验不正确，导入也会继续。
```bash
$ impdp testuser1/testuser1@//localhost:1521/pdb1 \
    tables=t1 \
    directory=tmp_dir \
    dumpfile=testuser1.dmp \
    logfile=impdp_t1_copy_again.log \
    remap_table=testuser1.t1:t1_copy_again \
    verify_checksum=yes

Import: Release 21.0.0.0.0 - Production on Sun Sep 5 09:16:24 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates.  All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Verifying dump file checksums
Master table "TESTUSER1"."SYS_IMPORT_TABLE_01" successfully loaded/unloaded
Starting "TESTUSER1"."SYS_IMPORT_TABLE_01":  testuser1/********@//localhost:1521/pdb1
  tables=t1 directory=tmp_dir dumpfile=testuser1.dmp logfile=impdp_t1_copy_again.log
  remap_table=testuser1.t1:t1_copy_again verify_checksum=yes
Processing object type SCHEMA_EXPORT/TABLE/TABLE
Processing object type SCHEMA_EXPORT/TABLE/TABLE_DATA
. . imported "TESTUSER1"."T1_COPY_AGAIN"                 6.070 KB       2 rows
Processing object type SCHEMA_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type SCHEMA_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
ORA-31684: Object type CONSTRAINT:"TESTUSER1"."TA_PK" already exists

Job "TESTUSER1"."SYS_IMPORT_TABLE_01" completed with 1 error(s) at Sun Sep 5 09:16:30 2021 elapsed 0 00:00:04

$
```
# 同时支持INCLUDE和EXCLUDE
在 Oracle 21C 中，INCLUDE 和 EXCLUDE 参数可以同时是一条命令的一部分。在以前的版本中 INCLUDE，EXCLUDE 参数是互斥的，只能存在一个。

以下示例在单个命令中同时使用 INCLUDE 和 EXCLUDE 参数：
```bash
$ expdp testuser1/testuser1@//localhost:1521/pdb1 \
    schemas=testuser1 \
    directory=tmp_dir \
    dumpfile=testuser1.dmp \
    logfile=expdp_testuser1.log \
    include="table:\"in ('T1')\"" \
    exclude="table:\"in ('T1_COPY','T1_COPY_AGAIN')\"" \
    exclude=statistics

Export: Release 21.0.0.0.0 - Production on Sun Sep 5 10:54:03 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates.  All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Starting "TESTUSER1"."SYS_EXPORT_SCHEMA_01":  testuser1/********@//localhost:1521/pdb1
  schemas=testuser1 directory=tmp_dir dumpfile=testuser1.dmp logfile=expdp_testuser1.log
  include=table:"in ('T1')" exclude=table:"in ('T1_COPY','T1_COPY_AGAIN')" exclude=statistics
Processing object type SCHEMA_EXPORT/TABLE/TABLE_DATA
Processing object type SCHEMA_EXPORT/TABLE/TABLE
Processing object type SCHEMA_EXPORT/TABLE/IDENTITY_COLUMN
Processing object type SCHEMA_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
. . exported "TESTUSER1"."T1"                            6.070 KB       2 rows
Master table "TESTUSER1"."SYS_EXPORT_SCHEMA_01" successfully loaded/unloaded
******************************************************************************
Dump file set for TESTUSER1.SYS_EXPORT_SCHEMA_01 is:
  /tmp/testuser1.dmp
Job "TESTUSER1"."SYS_EXPORT_SCHEMA_01" successfully completed at Sun Sep 5 10:54:31 2021 elapsed 0 00:00:27

$
```
# 索引压缩
在 Oracle 21C 中，我们可以选择使用 TRANSFORM 参数和 INDEX_COMPRESSION_CLAUSE 来进行索引压缩。

首先，创建一个带有一些索引的测试表：
```sql
conn testuser1/testuser1@//localhost:1521/pdb1

-- drop table t2 purge;

create table t2 as
  select level as id,
         'Description for ' || level as col1,
         case mod(level, 2)
           when 0 then 'one'
           else 'two'
         end as col2,
         trunc(dbms_random.value(0,10)) as col3,
         trunc(dbms_random.value(0,20)) as col4
  from   dual
  connect by level <= 10000;

alter table t2 add constraint t2_pk primary key (id);
create index t2_col1_idx on t2(col1);
create index t2_col2_idx on t2(col2);
create index t2_col3_idx on t2(col3);
create index t2_col4_idx on t2(col4);
```
检查表和索引是否开启压缩：
```sql
select compression
from   user_tables
where  table_name = 'T2';

COMPRESS
--------
DISABLED

SQL>


column index_name format a12

select index_name,
       compression
from   user_indexes
where  table_name = 'T2'
order by 1;

INDEX_NAME   COMPRESSION
------------ -------------
T2_COL1_IDX  DISABLED
T2_COL2_IDX  DISABLED
T2_COL3_IDX  DISABLED
T2_COL4_IDX  DISABLED
T2_PK        DISABLED

SQL>
```
导出表：
```bash
$ expdp testuser1/testuser1@//localhost:1521/pdb1 \
    tables=t2 \
    directory=tmp_dir \
    dumpfile=t2.dmp \
    logfile=expdp_t2.log \
    exclude=statistics

Export: Release 21.0.0.0.0 - Production on Sun Sep 5 11:57:18 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates.  All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Starting "TESTUSER1"."SYS_EXPORT_TABLE_01":  testuser1/********@//localhost:1521/pdb1
  tables=t2 directory=tmp_dir dumpfile=t2.dmp logfile=expdp_t2.log exclude=statistics
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/INDEX/INDEX
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
. . exported "TESTUSER1"."T2"                            384.8 KB   10000 rows
Master table "TESTUSER1"."SYS_EXPORT_TABLE_01" successfully loaded/unloaded
******************************************************************************
Dump file set for TESTUSER1.SYS_EXPORT_TABLE_01 is:
  /tmp/t2.dmp
Job "TESTUSER1"."SYS_EXPORT_TABLE_01" successfully completed at Sun Sep 5 11:57:35 2021 elapsed 0 00:00:14

$
```
删除源表，以便我们重新导入它：
```sql
conn testuser1/testuser1@//localhost:1521/pdb1

drop table t2 purge;
```
从 DUMP 文件导入表，通过 TRANSFORM 参数组合 TABLE_COMPRESSION_CLAUSE 来压缩使用表，INDEX_COMPRESSION_CLAUSE 来压缩索引：
```bash
$ impdp testuser1/testuser1@//localhost:1521/pdb1 \
    tables=t2 \
    directory=tmp_dir \
    dumpfile=t2.dmp \
    logfile=impdp_t2.log \
    transform=table_compression_clause:\"compress basic\" \
    transform=index_compression_clause:\"compress advanced low\"

Import: Release 21.0.0.0.0 - Production on Sun Sep 5 12:02:22 2021
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle and/or its affiliates.  All rights reserved.

Connected to: Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Master table "TESTUSER1"."SYS_IMPORT_TABLE_01" successfully loaded/unloaded
Starting "TESTUSER1"."SYS_IMPORT_TABLE_01":  testuser1/********@//localhost:1521/pdb1
  tables=t2 directory=tmp_dir dumpfile=t2.dmp logfile=impdp_t2.log
  transform=table_compression_clause:"compress basic" transform=index_compression_clause:"compress advanced low"
Processing object type TABLE_EXPORT/TABLE/TABLE
Processing object type TABLE_EXPORT/TABLE/TABLE_DATA
. . imported "TESTUSER1"."T2"                            384.8 KB   10000 rows
Processing object type TABLE_EXPORT/TABLE/INDEX/INDEX
Processing object type TABLE_EXPORT/TABLE/CONSTRAINT/CONSTRAINT
Job "TESTUSER1"."SYS_IMPORT_TABLE_01" successfully completed at Sun Sep 5 12:02:29 2021 elapsed 0 00:00:05

$
```
检查表和索引是否开启压缩：
```sql
conn testuser1/testuser1@//localhost:1521/pdb1

select compression
from   user_tables
where  table_name = 'T2';

COMPRESS
--------
ENABLED

SQL>


column index_name format a12

select index_name,
       compression
from   user_indexes
where  table_name = 'T2'
order by 1;

INDEX_NAME   COMPRESSION
------------ -------------
T2_COL1_IDX  ADVANCED LOW
T2_COL2_IDX  ADVANCED LOW
T2_COL3_IDX  ADVANCED LOW
T2_COL4_IDX  ADVANCED LOW
T2_PK        DISABLED

SQL>
```
我们可以看到表和索引现在都被压缩了。

# 可传输表空间增强
在 Oracle 21c 中，可传输表空间导出 (expdp) 和导入 (impdp) 可以使用 PARALLEL 参数来并行化操作。

在 Oracle 21c 中，数据泵可以在故障点或故障点附近恢复失败的可传输表空间作业。在以前的版本中，可传输表空间作业无法恢复。

# 从 Oracle 自治数据库导出
我们可以使用本地 Oracle 21.3 安装将数据从自治数据库导出到使用该expdp实用程序的对象存储。您可以在本文中阅读有关此功能的信息。
- [Oracle 云：自治数据库（ADW 或 ATP）- 将数据导出到对象存储 (expdp)](https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp)
# 从云对象存储导出和导入
Data Pump 支持将云对象存储作为转储文件位置，用于从 Oracle 21c 开始的本地安装。

- [数据泵导出 (expdp) 到 Oracle Database 21c 中的云对象存储和从云对象存储导入 (impdp)](https://oracle-base.com/articles/21c/data-pump-export-import-cloud-object-store-21c)