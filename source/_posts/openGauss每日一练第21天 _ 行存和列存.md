---
title: openGauss每日一练第21天 | 行存和列存
date: 2021-12-21 17:12:24
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/218687
---

openGauss 每日一练第 21 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 21 课，学习openGauss存储模型-行存和列存。

行存储是指将表按行存储到硬盘分区上，列存储是指将表按列存储到硬盘分区上。默认情况下，创建的表为行存储。行、列存储模型各有优劣，通常用于TP场景的数据库，默认使用行存储，仅对执行复杂查询且数据量大的AP场景时，才使用列存储.


# 课后作业

## 1.创建行存表和列存表，并批量插入10万条数据(行存表和列存表数据相同)
```sql
## 创建行存表
CREATE TABLE lucifer1
(
col1 CHAR(2),
col2 VARCHAR2(40),
col3 NUMBER
);

insert into lucifer1 select col1, col2, col3 from (select generate_series(1, 100000) as key, repeat(chr(int4(random() * 26) + 65), 2) as  col1, repeat(chr(int4(random() * 26) + 65), 30) as  col2, (random() * (10^4))::integer as col3);

## 创建列存表
CREATE TABLE lucifer2
(
col1 CHAR(2),
col2 VARCHAR2(40),
col3 NUMBER
)
WITH (ORIENTATION = COLUMN);

insert into lucifer2 select * from lucifer1;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211221-ab72034b-4b36-464e-bddd-6c82d9e954e5.png)
## 2.对比行存表和列存表空间大小
```sql
\d+
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211221-d4115e59-646d-44b2-bc9b-4d1a05b6a982.png)
## 3.对比查询一列和插入一行的速度
```sql
analyze VERBOSE lucifer1;
analyze VERBOSE lucifer2;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211221-848f9cd2-41b9-47dd-ae66-89544fa61b1c.png)
## 4.清理数据
```sql
drop table lucifer1;
drop table lucifer2;
```

# 写在最后

今天的作业打卡结束！🎉 