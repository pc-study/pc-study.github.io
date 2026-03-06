---
title: KCP 模拟题练习 07 - TEMPLATE1 模板
date: 2024-10-08 14:22:53
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843535653492064256
---

【单选题】默认情况下，在模板数据库 TEMPLATE1 中，不可以创建、删除、更改对象。
 - [x] 错误
 - [ ] 正确

**解题思路：**

查看 KingbaseES 数据库中的 template1 数据库：
```sql
test=# \l template1
                          List of databases
   Name    | Owner  | Encoding | Collate | Ctype | Access privileges
-----------+--------+----------+---------+-------+-------------------
 template1 | system | GBK      | C       | C     | =c/system        +
           |        |          |         |       | system=CTc/system

-- 连接到 template1 数据库
test=# \c template1 system
Password for user system:

You are now connected to database "template1" as userName "system".

-- 创建表
template1=# create table test(id int,name varchar2(20));
CREATE TABLE
-- 插入一条记录
template1=# insert into test values (1,'lucifer');
INSERT 0 1
-- 创建一个索引
template1=# create index idx_test_id on test(id);
CREATE INDEX
-- 查看表 test
template1=# \d test
                         Table "public.test"
 Column |            Type            | Collation | Nullable | Default
--------+----------------------------+-----------+----------+---------
 id     | integer                    |           |          |
 name   | character varying(20 char) |           |          |
Indexes:
    "idx_test_id" btree (id)
-- 删除表
template1=# drop table test;
DROP TABLE
template1=# \d test
Did not find any relation named "test".
```
由此可以发现，数据库 template1 是可以创建、删除、更改对象的。