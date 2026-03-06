---
title: openGauss每日一练第2天 | 表的更新删除
date: 2021-12-02 10:12:58
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/185661
---

openGauss 每日一练第 2 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 2 课，学习了 openGauss 表的更新删除，openGauss 数据库查询、更新和删除基本使用！

# 课后作业打卡
## 1.创建一个表products

|字段名|数据类型|含义|
|--|--|--|
|product_id|INTEGER|产品编号|
|product_name|Char(20)|产品名|
|category|Char(30)|种类|

创建语句如下：
```sql
CREATE TABLE products
( product_id             integer,      
  product_name           char(20),    
  category               char(30) 
) ;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211202-bfbff49c-fbbd-4a7e-b8a4-87abc3d357d5.png)

## 2.向表中插入数据，采用一次插入一条和多条记录的方式
|product_id	|product_name	|category|
|--|--|--|
|1502	|olympus camera	|electrncs|
|1601	|lamaze	|toys|
|1700	|wait interface	|Books|
|1666	|harry potter	|toys|

插入数据语句：
```sql
-- 一次插入一条
INSERT INTO products VALUES (1502,'olympus camera','electrncs');
INSERT INTO products VALUES (1601,'lamaze','toys');
INSERT INTO products VALUES (1700,'wait interface','Books');
INSERT INTO products VALUES (1666,'harry potter','toys');
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211201-4e02b60c-6d96-410a-92ee-980eb9269eef.png)
```sql
-- 一次插入多条
INSERT INTO products VALUES 
(1502,'olympus camera','electrncs'),
(1601,'lamaze','toys'),
(1700,'wait interface','Books'),
(1666,'harry potter','toys');
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211201-dce4300b-c7b9-45eb-9015-288e17916547.png)

## 3.获取表中一条记录、三条记录和所有记录
```sql
-- 一条记录
select * from products limit 1;
-- 三条记录
select * from products limit 3;
-- 所有记录
select * from products;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211202-f59b0044-a309-402b-a8d4-b41bc29ba07e.png)

## 4.将满足product_id > 1600的记录的product_id更新为product_id – 1000，并查看products中所有记录是否更新成功
```sql
update products set product_id = product_id - 1000 where product_id > 1600;
select * from products;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211202-2f0c8d48-bb07-4cdb-a09c-e2c2fe5e8c83.png)
## 5.删除category为toys的所有记录，并查看products中数据是否删除成功
```sql
delete from products where categort = 'toys';
select * from products;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211202-e43d5d96-e15c-43fb-82e7-10a9d71cf9e0.png)
## 6.删除products中所有数据，并查看数据是否删除成功
```sql
delete from products;
select * from products;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211202-c641b33f-daa9-494b-a263-c80bb90d0357.png)
## 6.删除表products
```sql
drop table products;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211202-31408d4c-5315-4997-8c2a-02048f9fd2f2.png)

总结，今天新学了一个 `limit` 用法！

# 写在最后

今天的作业打卡结束！🎉 