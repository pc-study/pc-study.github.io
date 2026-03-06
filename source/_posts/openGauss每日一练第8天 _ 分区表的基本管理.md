---
title: openGauss每日一练第8天 | 分区表的基本管理
date: 2021-12-08 12:12:13
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/192945
---

openGauss 每日一练第 8 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 8 课，学习 openGauss 分区表！

分区表是把逻辑上的一张表根据某种方案分成几张物理块进行存储，这张逻辑上的表称之为分区表，物理块称之为分区。

分区表是一张逻辑表，不存储数据，数据实际是存储在分区上的。
# 课后作业打卡

## 1.创建一个含有5个分区的范围分区表store，在每个分区中插入记录
```sql
create table store
(
        id int,
        name CHAR(20)
)
partition by range (id)
(
        partition store_p0 values less than (50),
        partition store_p1 values less than (100),
        partition store_p2 values less than (150),
	partition store_p3 values less than (200),
        partition store_p4 values less than (250)
);
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211208-7ee75eb7-0aa5-40b3-804e-3ee8e7defc76.png)
## 2.查看分区1上的数据
```sql
insert into store values (1,'a'),(51,'b'),(101,'c'),(151,'d'),(201,'e');
insert into store values (300,'f');
select * from store;
select * from store partition(store_p1);
select * from store partition(store_p3);
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211208-25eda4ec-b37c-440a-acdf-6f17ab7e3c1d.png)
## 3.重命名分区2
```sql
alter table store rename partition store_p2 to store_lucifer2;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211208-a79bc223-6aad-459c-8a93-47976375f70c.png)
## 4.删除分区5
```sql
alter table store drop partition store_p4;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211208-bf290027-3f9b-4fe0-b29a-428355f7de60.png)
## 5.增加分区6
```sql
alter table store add partition store_p5;
```
## 6.在系统表pg_partition中查看分区信息
```sql
select * from pg_partition;
```
## 7.删除分区表
```sql
drop table store;
```


# 写在最后

今天的作业打卡结束！🎉 