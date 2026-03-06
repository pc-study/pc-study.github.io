---
title: openGauss每日一练第7天 | 模式的基本管理
date: 2021-12-07 10:12:57
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/190735
---

openGauss 每日一练第 7 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 7 课，学习 openGauss 表空间！

表空间用于管理数据对象，与磁盘上的一个。
# 课后作业打卡
## 1.创建表空间，表空间tspc1使用相对路径指定所在目录，表空间tspc2指定owner为Lucy
```sql
create tablespace tspc1 relative location 'tablespace/tablespace1';
create role Lucy password 'Lucifer-4622';
create tablespace tspc2 owner Lucy relative location 'tablespace/tablespace2';
\db
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211207-80a1790c-0798-43ee-90b9-5be1a56e5b74.png)
## 2.在表空间tspc1中建表，并使用视图pg_tables查看信息
```sql
create table lucifer(id int) tablespace tspc1;
select * from pg_tables where tablename = 'lucifer';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211207-f4965d32-2c96-4ae4-b1c8-b8ade35cf767.png)
## 3.重命名tspc1，修改tspc2的用户为Lily，使用\db查看表空间信息
```sql
alter tablespace tspc1 rename to tspc3;
create role Lily password 'Lucifer-4622';
alter tablespace tspc2 owner Lily; 
\db
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211207-1cf592d9-64c4-4fb7-b849-a54346c5ee5c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211207-ae540c58-e3dd-4665-b04f-7cbfa1459f68.png)
## 4.删除表空间
```sql
drop table lucifer;
drop tablespace if exists tspc2;
drop tablespace if exists tspc3;
\db
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211207-209e7e9d-e9c4-4d81-a4de-1d6353e9699b.png)

# 写在最后

今天的作业打卡结束！🎉 
