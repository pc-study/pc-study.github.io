---
title: Oracle 一键获取源库表空间 DDL 脚本
date: 2022-12-09 14:12:55
tags: [墨力计划,oracle,表空间,ddl,select]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/578420
---

## 一键创建表空间
```bash
-- 查看需要创建的表空间
select distinct tablespace_name from dba_segments where owner='LUCIFER';

TABLESPACE_NAME
------------------------------
LUCIFER

-- 获取所需创建表空间的ddl语句（此方法用于创建很多表空间时会很方便）
select distinct 'select dbms_metadata.get_ddl(''TABLESPACE'',' || chr(39) ||
                tablespace_name || chr(39) || ') ddl FROM dual;' sql
  from dba_tablespaces
 where tablespace_name in (select distinct tablespace_name
                             from dba_segments
                            where owner = 'LUCIFER')
 order by 1;

------------------------------------------------------------------------------------------
select dbms_metadata.get_ddl('TABLESPACE','LUCIFER') ddl FROM dual;

-- 获取创建表空间的ddl语句
set long 2000000000 echo off feedback off heading off pagesize 0 linesize 30000 trimout on wrap on trimspool on termout off serveroutput off SQLPROMPT "SQL>"
col ddl for a3000 wrapped word
execute dbms_metadata.set_transform_param(dbms_metadata.session_transform,'STORAGE',false);
execute dbms_metadata.set_transform_param(dbms_metadata.session_transform,'PRETTY',true);
execute dbms_metadata.set_transform_param(dbms_metadata.session_transform,'SQLTERMINATOR',true);
spool ctbs_create.sql
select dbms_metadata.get_ddl('TABLESPACE','LUCIFER') ddl FROM dual;
spool off

-- 获取脚本后修改对应的数据库文件目录（如果有数据文件目录的，需要修改成目标端的路径）
SQL>select dbms_metadata.get_ddl('TABLESPACE','LUCIFER') ddl FROM dual;

  CREATE TABLESPACE "LUCIFER" DATAFILE
  SIZE 104857600
  AUTOEXTEND ON NEXT 104857600 MAXSIZE 32767M
  LOGGING ONLINE PERMANENT BLOCKSIZE 8192
  EXTENT MANAGEMENT LOCAL AUTOALLOCATE DEFAULT
 NOCOMPRESS  SEGMENT SPACE MANAGEMENT AUTO;

SQL>spool off
```
📢注意： 如果创建表空间时遇到 ORA-02494: invalid or missing maximum file size in MAXSIZE clause 则说明数据文件大小比 MAXSIZE 要大，只需要把对应的 MAXSIZE 改为 32767M。￥