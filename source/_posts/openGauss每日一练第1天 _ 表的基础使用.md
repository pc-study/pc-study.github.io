---
title: openGauss每日一练第1天 | 表的基础使用
date: 2021-12-01 10:12:59
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/182988
---

openGauss 每日一练第一天打卡，我来了！又可以学习，真开心~

# 学习
今天第一课，学习了 openGauss 表的基础操作，openGauss数据库创建表、插入记录、查询记录和删除表基本使用！

​​​​
# 课后作业打卡
## 1.创建一个表products

|字段名|数据类型|含义|
|--|--|--|
|product_id|INTEGER|产品编号|
|product_name|Char(10)|产品名|
|category|Char(10)|种类|

创建语句如下：
```sql
CREATE TABLE products
( product_id             integer,      
  product_name           char(10),    
  category               char(10) 
) ;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211201-a20b5931-7c3a-4846-a469-7e67c993330c.png)
## 2.向表中插入数据，采用一次插入一条和多条记录的方式
|product_id	|product_name	|category|
|--|--|--|
|1502	|olympus camera	|electrncs|
|1601	|lamaze	|toys|
|1700	|wait interface	|Books|
|1666	|harry potter	|toys|

📢 注意：这里有个小问题，就是 **`product_name`** 的列长不够用，因此需要改大。
```sql
alter table products alter column product_name type char(20);
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211201-97cbf7f5-8390-4d31-a884-b6fbe9126411.png)

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

## 3.查询表中所有记录及记录数
由于我们上面插入了两次记录，因此会有 8 条记录，重复的有4 条。
```sql
select * from products;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211201-40371e6a-bde6-42c5-b02b-0b669a0152ee.png)

## 4.查询表中所有category记录，并将查询结果按升序排序
这里按照 product_id 升序排序，如果是降序，则为 desc。
```sql
select category from products order by product_id;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211201-78a468dd-64c0-46db-8812-d0c335ab1b23.png)

## 5.查询表中category为toys的记录
```sql
select * from products where category= 'toys';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211201-c5bf440b-b3df-496f-a195-64fd446be139.png)

如果需要去重的话，可以使用 **`distinct`** 来实现！
## 6.删除表products
最后，删除表 products，使用 drop。
```sql
drop table products;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211201-62ffc36f-8b35-4b38-8947-dc8ef20d8e86.png)


# 写在最后

今天的作业打卡结束！🎉 