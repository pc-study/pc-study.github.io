---
title: [译] ALTER SYSTEM CANCEL SQL : 在 Oracle Database 18c 的会话中取消 SQL 语句
date: 2022-01-14 17:01:14
tags: [墨力计划,oracle 18c]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/238029
---

>原文地址：[https://oracle-base.com/articles/18c/alter-system-cancel-sql-18c](https://oracle-base.com/articles/18c/alter-system-cancel-sql-18c)
原文作者：Tim Hall

Oracle Database 18C 引入了 `ALTER SYSTEM CANCEL SQL` 命令，用于取消会话中的 SQL 语句，提供了杀死恶意会话的替代方法。

@[TOC](目录)
# 语法
`ALTER SYSTEM CANCEL SQL` 命令的基本语法如下所示：
```sql
ALTER SYSTEM CANCEL SQL 'SID, SERIAL[, @INST_ID][, SQL_ID]';
```
如果不加 `INST_ID`，默认代表当前实例。如果 `SQL_ID` 不写，则代表是在当前指定会话中运行的 SQL。参考如下：
```sql
-- 当前实例的会话中的当前 SQL
ALTER SYSTEM CANCEL SQL '738, 64419';

-- INST_ID = 1 的实例会话中的当前 SQL
ALTER SYSTEM CANCEL SQL '738, 64419, @1';

-- 在此实例的会话中指定的 SQL
ALTER SYSTEM CANCEL SQL '738, 64419, 84djy3bnatbvq';

-- 在实例的会话中指定 SQL 和 INST_ID = 1
ALTER SYSTEM CANCEL SQL '738, 64419, @1, 84djy3bnatbvq';
```
可以从视图中检索所有四条信息 `GV$SESSION`，如下所示。

# 指定要取消的会话
在后台会话中取消 SQL 语句可能具有很大的破坏性，因此在查询会话和 SQL 时要非常小心。

`GV$SESSION` 使用视图查询有问题的会话和 SQL，以下查询连接到 GV$PROCESS 视图以获取 SPID 列，这对于此命令并不是必需的：
```sql
SET LINESIZE 150
COLUMN spid FORMAT A10
COLUMN username FORMAT A30
COLUMN program FORMAT A45

SELECT s.inst_id,
       s.sid,
       s.serial#,
       s.sql_id,
       p.spid,
       s.username,
       s.program
FROM   gv$session s
       JOIN gv$process p ON p.addr = s.paddr AND p.inst_id = s.inst_id
WHERE  s.type != 'BACKGROUND';
```
然后可以将相关值替换到前面部分中的命令 `SID, SERIAL#, INST_ID and SQL_ID` 中。





