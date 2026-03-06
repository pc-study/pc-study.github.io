---
title: Oracle 23ai 新变化：大文件表空间
date: 2025-10-17 17:11:20
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1979100117546315776
---

# 前言

在 Oracle 23ai/26ai 数据库版本中，针对大文件表空间有一些改动，主要是系统表空间默认创建为大文件表空寂以及大文件表空间收缩功能。

# 大文件表空间

大文件表空间是指仅包含单个大型数据文件的表空间。相较之下，普通（小文件）表空间可包含多个数据文件，但每个文件的大小均受限制。

**大文件表空间的优势**：

- Oracle 数据库最多可拥有 64000 个数据文件，这限制了其总容量。通过允许表空间使用单个大型数据文件，可提升数据库总容量。采用 8K 和 32K 区块的大文件表空间，可分别容纳 32TB 和 128TB 的数据文件。
- 使用更少的大型数据文件可降低 `DB_FILES` 和 `MAXDATAFILES` 参数值，从而节省 SGA 和控制文件空间。
- ALTER TABLESPACE 语法已更新，支持在表空间层级而非数据文件层级执行操作。

通常大文件表空间必须采用本地管理模式并启用自动段空间管理。例外情况包括临时表空间、SYSTEM 表空间及本地管理的回滚表空间，这些均允许采用手动段空间管理。

# 默认大文件表空间
连接 Oracle 23ai 查看表空间默认类型：
```sql
-- CDB
SQL> select tablespace_name, bigfile
from dba_tablespaces
order by 1;

TABLESPACE_NAME                BIG
------------------------------ ---
SYSAUX                         YES
SYSTEM                         YES
TEMP                           NO
UNDOTBS1                       YES
USERS                          YES

-- PDB
SQL> alter session set container=pdb01;

SQL> select tablespace_name, bigfile
from dba_tablespaces
order by 1;

TABLESPACE_NAME                BIG
------------------------------ ---
SYSAUX                         YES
SYSTEM                         YES
TEMP                           NO
UNDOTBS1                       YES
USERS                          NO
```
CDB 下除 TEMP 表空间外，其他表空间均为大文件表空间；PDB 下则多了个 USERS 表空间不是大文件表空间。

# 大文件表空间收缩
从 Oracle 23ai/26ai 开始，可以使用 `DBMS_SPACE` 包来缩小大文件表空间以回收未使用的空间。值得一提的是，从 23.7 版本开始，小文件表空间也添加了类似功能。

首先需要分析大文件表空间：
```sql
SQL> set serveroutput on
execute dbms_space.shrink_tablespace('SYSAUX', shrink_mode => dbms_space.ts_mode_analyze);
```
收缩大文件表空间：
```sql
SQL> set serveroutput on
-- 默认 shrink_mode => dbms_space.ts_mode_shrink, target_size => dbms_space.ts_target_max_shrink
execute dbms_space.shrink_tablespace('SYSAUX');
```
检查收缩后的使用情况：
```sql
SQL> column file_name format a30

select substr(file_name, -28) as file_name, blocks, bytes/1024/1024 as size_mb
from dba_data_files
where tablespace_name = 'SYSAUX';
```
需要注意的是：
- 表空间需要开启自动扩展；
- 对于表空间中具有 LONG 类型字段的表、cluster 表、有虚拟列的表，都不支持在线移动；
- 可以缩小 SYSAUX 表空间；

总体来说，还是比较方便简单的。

# 写在最后
Oracle 23ai/26ai 开始默认使用大文件表空间，是 Oracle 为适应大数据量、简化管理、并面向 AI 等新技术发展的一次重要演进。