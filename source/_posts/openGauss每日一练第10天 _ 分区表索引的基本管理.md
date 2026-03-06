---
title: openGauss每日一练第10天 | 分区表索引的基本管理
date: 2021-12-10 11:12:55
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/196403
---

openGauss 每日一练第 10 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 10 课，学习openGauss分区表索引！

索引是对数据库表中一列或多列的值进行排序的一种结构，使用索引可快速访问数据库表中的特定信息。

# 课后作业打卡

## 1.创建范围分区表products, 为表创建分区表索引1，不指定索引分区的名称，创建分区表索引2，并指定索引分区的名称，创建GLOBAL分区索引3
```sql
--创建分区表 products
CREATE TABLE products
(
        id int,
        name CHAR(20)
)
partition by range (id)
(
        partition products_p0 values less than (50),
        partition products_p1 values less than (100),
        partition products_p2 values less than (150),
	partition products_p3 values less than (200),
        partition products_p4 values less than (250)
);
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211210-314349bc-2912-48f3-9329-4b68664ae60b.png)
```sql
-- 创建分区表索引1
create index products_p1_index1 ON products(id) LOCAL;
-- 创建分区表索引2
create index products_p1_index2 ON products(id) LOCAL
(
PARTITION id_index1,
PARTITION id_index2 TABLESPACE example3,
PARTITION id_index3 TABLESPACE example4,
PARTITION id_index4 TABLESPACE example3,
PARTITION id_index5 TABLESPACE example4
);
-- 创建GLOBAL分区索引3
create index products_p1_index3 ON products(name) GLOBAL;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211210-ad0f0e76-09ff-4050-8f02-c225f685f635.png)
## 2.在分区表索引1上，修改分区表索引的表空间，重命名分区表索引
```sql
alter index products_p1_index2 move partition id_index1 tablespace example3;
alter index products_p1_index2 rename partition id_index1 to id_index0;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211210-fe035d0c-97ef-419c-846a-af8aabe54897.png)
## 3.在分区表索引1上，重建单个索引分区和分区上的所有索引
```sql
reindex index products_p1_index1 partition products_p1_id_idx;
reindex index products_p1_index1;
reindex table products partition products_p0;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211210-2e9d8b7e-399f-49f1-a7d0-69dbfd011e61.png)
## 4.使用\d+、系统视图pg_indexes和pg_partition查看索引信息
```sql
\d+ products
select * from pg_indexes where tablename = 'products';
select * from pg_partition;
```
## 5.删除索引、表和表空间
```sql
drop index products_p1_index1;
drop index products_p1_index2;
drop index products_p1_index3;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211210-4c60a379-1e73-4393-8e7b-b89019ffef9e.png)


# 写在最后

今天的作业打卡结束！🎉 