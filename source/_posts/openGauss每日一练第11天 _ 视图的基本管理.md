---
title: openGauss每日一练第11天 | 视图的基本管理
date: 2021-12-11 13:12:24
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/196638
---

openGauss 每日一练第 11 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 11 课，学习openGauss视图

视图与基本表不同，是一个虚拟的表。数据库中仅存放视图的定义，而不存放视图对应的数据，这些数据仍存放在原来的基本表中。

# 课后作业打卡

## 1、为系统表PG_DATABASE创建视图，重命名视图并修改owner为jim,
```sql
create view lucifer_view as select * from pg_database;
select * from lucifer_view;
alter view lucifer_view rename to v_lucifer;
create role jim;
alter view v_lucifer owner to jim;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-ed2dfa19-ddf3-46c8-b04d-b3246ecb2e6e.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-11133531-3dfe-4ae9-b950-dd14effb4cda.png)
## 2、创建一个用户表student，并在用户表上创建视图，修改视图schema;
```sql
create schema lucifer;
create table lucifer.student(id int,name char(20),sex char(10),grade int);
insert into lucifer.student values (1,'lucifer','male',100),(2,'lucifer1','female',80),(3,'lucifer2','male',75);
create view lucifer.v_student as select * from lucifer.student where grade > 80;
select * from lucifer.v_student;
create schema jim;
alter view lucifer.v_student set schema jim;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-a3fd3d3b-945b-48bf-8f8d-3d13de17b40c.png)

## 3、使用pg_views查看视图信息
```bash
select * from pg_views where view_name = 'v_student';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-823fc364-d242-4678-80c3-5d5eeb662087.png)

## 4、删除视图、表、用户
```sql
drop view jim.v_student;
drop table lucifer.student;
drop schema jim;
drop schema lucifer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-7b84014f-96c3-41c2-959b-064f9d116794.png)


# 写在最后

今天的作业打卡结束！🎉 