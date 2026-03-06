---
title: KCP 模拟题练习 12 - 数据文件类型
date: 2024-10-08 16:11:31
tags: [kingbasees,墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843559092641689600
---

【单选题】在 KingbaseES V8 中，哪个文件保存了只包含对所有活动事务可见的 tuple 的数据页的追踪信息？
 - [x] relfilenode_vm
 - [ ] relfilenode_fsm
 - [ ] relfilenode
 - [ ] relfilenode_init

**解题思路：**

查看数据库的信息：
```sql
test=# select datname,oid from pg_database;
  datname  |  oid  
-----------+-------
 kingbase  | 12258
 test      | 12259
 template1 |     1
 template0 | 12257
 security  | 12260
(5 行记录)

test=# select oid,relname,reltype,relfilenode from pg_class where oid=1247;        
 oid  | relname | reltype | relfilenode 
------+---------+---------+-------------
 1247 | pg_type |      71 |           0
```
查看其中一个数据库的文件(存放于数据文件目录的 base 目录下)：
```bash
[kingbase@kes:/home/kingbase]$ cd /data/base
[kingbase@kes:/data/base]$ ls
1  12257  12258  12259  12260
## 查看 test 数据库文件
[kingbase@kes:/data/base]$ cd 12259
## 太多文件，这里以 1247 为例
[kingbase@kes:/data/base/12259]$ ll 1247*
-rw------- 1 kingbase kingbase 163840 10月  8 16:00 1247
-rw------- 1 kingbase kingbase  24576  9月 24 21:13 1247_fsm
-rw------- 1 kingbase kingbase   8192 10月  8 16:00 1247_vm
```
可以看到有很多 `_vm` 和 `_fsm` 结尾的文件：
- 后缀是 `fsm` 的是**空闲空间映射文件**（free space map）文件，这个文件是用来进行空间映射的，表示页面中可以使用的空余空间。
- 后缀是 `vm` 文件是**可见性映射文件**（visibility map），标识该页的所有元组对所有事务是否可见，如果标识可见可以跳过 vacuum 扫描。
- 后缀是 `init` 文件是每一个不记录日志表或者该表上的每一个索引都会有个对应的文件。

本文不做细究，事务可见性选择 `relfilenode_vm`。

可参考：
- [关于PostgreSQL数据的存储，你有必要有所了解](https://blog.csdn.net/Herishwater/article/details/122005902)
- [Postgresql内核源码分析-unlogged表](https://blog.csdn.net/senllang/article/details/129193286)