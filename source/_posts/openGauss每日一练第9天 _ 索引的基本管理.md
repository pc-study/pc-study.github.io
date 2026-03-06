---
title: openGauss每日一练第9天 | 索引的基本管理
date: 2021-12-09 12:12:10
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/194642
---

openGauss 每日一练第 9 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 9 课，学习openGauss普通表索引！

索引是对数据库表中一列或多列的值进行排序的一种结构，使用索引可快速访问数据库表中的特定信息。

# 课后作业打卡
## 1.创建表products, 分别为表创建一个unique索引1，指定b-tree索引2和表达式索引3
```sql
-- 创建 schema
create schema lucifer;
-- 创建表
CREATE TABLE lucifer.products
(
id INTEGER NOT NULL,
name CHAR(16) NOT NULL,
type CHAR(30),
code CHAR(30),
address CHAR(200)
);
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211209-4105f7b6-08e9-46e5-81b2-e7fbffce3a70.png)
```sql
-- 创建 unique 索引
create unique index idx_products_id on lucifer.products (id);
-- 创建 b-tree 索引
create index idx_products_name on lucifer.products using btree(name);
-- 创建 表达式索引
create index idx_products_code on lucifer.products (substr(code,1,4));
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211209-1e2b2c7d-bd9a-4beb-b684-123dff239804.png)
## 2.设置索引1不可用，修改索引2的表空间，重命名索引3
```sql
alter index lucifer.idx_products_id unusable;
CREATE TABLESPACE example0 RELATIVE LOCATION 'tablespace1/tablespace_0';
alter index lucifer.idx_products_name set tablespace example0;
alter index lucifer.idx_products_code rename to idx_products_code1;
select * from pg_indexes where tablename = 'products';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211209-efcd61e1-5242-48f9-b599-1f5f8e9a0eb8.png)
## 3.重建索引2和products的所有索引
```sql
alter index lucifer.idx_products_name rebuild;
reindex index lucifer.idx_products_name;
reindex table lucifer.products;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211209-d34a79f6-a79c-4213-9049-c2cbdd9a14cb.png)
## 4.使用\d+和系统视图pg_indexes查看索引信息
```sql
\d+ lucifer.products
select * from pg_indexes where tablename = 'products';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211209-bff5fab9-5a8b-470b-9880-7c94023dd2e8.png)
## 5.删除索引、表和表空间
```sql
drop index lucifer.idx_products_id;
drop index lucifer.idx_products_name;
drop index lucifer.idx_products_code1;
drop table lucifer.products;
drop schema lucifer;
drop tablespace example0;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211209-eddf4482-5c04-44e5-b119-d91c3ddc6a86.png)


# 写在最后

今天的作业打卡结束！🎉 