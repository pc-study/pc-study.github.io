---
title: openGauss每日一练第12天 | 定义数据类型
date: 2021-12-12 12:12:45
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/196778
---

openGauss 每日一练第 12 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 12 课，学习openGauss定义数据类型。

# 课后作业打卡

## 1、创建一个复合类型，重命名复合类型，为复合类型增加属性、删除属性
```sql
create type lucifer_type as (a int,b char(20));
alter type lucifer_type rename to lucifer_tp;
alter type lucifer_tp add attribute c int;
alter type lucifer_tp drop attribute a;
\d lucifer_tp
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-acdb00fa-ff6c-4b3d-a381-50c1866d38b7.png)

## 2、创建一个枚举类型，新增标签值，重命名标签值
```sql
create type lucifer_mj as enum ('a','b','c');
select * from pg_enum;
alter type lucifer_mj add value if not exists 'd' before 'c';
alter type lucifer_mj rename value 'd' to 'e';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-96020570-03ad-4ab8-ba31-55dc0f1e9fc9.png)

## 3、使用新创建的类型创建表
```sql
create table lucifer (id int,name lucifer_tp,type lucifer_mj);
insert into lucifer values (1,('a',1),'a');
insert into lucifer values (2,('b',2),'b');
insert into lucifer values (2,('b',2));
insert into lucifer values (3,('c',3));
select * from lucifer;
select id,(name).b,type from lucifer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-c07ec959-9769-4205-a069-403e1179840b.png)
## 4、删除类型
```sql
drop type lucifer_tp cascade;
drop type lucifer_mj cascade;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-3e383a0a-8d74-4c0b-bd12-a28018b12161.png)


# 写在最后

今天的作业打卡结束！🎉 