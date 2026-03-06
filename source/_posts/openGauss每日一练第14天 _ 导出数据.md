---
title: openGauss每日一练第14天 | 导出数据
date: 2021-12-14 12:12:53
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/199007
---

openGauss 每日一练第 14 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 14 课，学习openGauss导出数据。

# 课后作业打卡

## 1.创建数据库tpcc，在数据库tpcc中创建模式schema1，在模式schema1中建表products
```sql
create database tpcc;
\c tpcc
create schema schema1;
create table schema1.products(id int,name char(20));
insert into schema1.products values(1,'a'),(2,'b'),(3,'c');
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211214-5a0c3d8f-4035-4b01-9fb3-dcee901dbdec.png)
## 2.使用gs_dump工具以文本格式导出数据库tpcc的全量数据
```sql
gs_dump -f /home/omm/backup_database_tpcc_all.sql tpcc -F p
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211214-86563ea4-2165-47f6-8287-9d5fb336d9f5.png)
## 3.使用gs_dump工具以文本格式导出模式schema1的定义
```sql
gs_dump -f /home/omm/backup_schema_define.sql tpcc -n schema1 -s -F p
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211214-f8f46909-8fea-476f-b4c1-2595a7504d21.png)
## 4.使用gs_dump工具以文本格式导出数据库tpcc的数据，不包含定义
```sql
gs_dump -f /home/omm/backup_database_tpcc_data.sql tpcc -a -F p 
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211214-42c89779-a516-4774-aa61-9f14b8507573.png)
## 5.删除表、模式和数据库
```sql
\c tpcc
drop table schema1.products;
drop schema schema1;
drop database tpcc;
```

# 写在最后

今天的作业打卡结束！🎉 