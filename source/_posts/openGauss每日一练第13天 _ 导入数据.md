---
title: openGauss每日一练第13天 | 导入数据
date: 2021-12-13 12:12:36
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/196996
---

openGauss 每日一练第 13 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 13 课，学习openGauss导入数据。

# 课后作业打卡

## 1.创建表1并在表中插入数据，分别指定字段和整行为缺省值
```sql
create table lucifer(id int,name char(20),ldesc char(200));
\d+ lucifer
insert into lucifer values(1,'lucifer','hhhhhhhh');
insert into lucifer values(2,'opengauss',default);
insert into lucifer default values;
select * from lucifer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211213-e4904f55-651a-4fec-8412-2cd8cf13d05f.png)
## 2.创建表2并将表1的数据全部导入表2中
```sql
create table lucifer2 as select * from lucifer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211213-593cc0b9-7cfb-45b9-bf15-f607af326b60.png)
## 3.创建表3和表4，并合并两个表的数据到表3
```sql
create table lucifer3(id int,name char(20),ldesc char(200));
insert into lucifer3 values (1,'lucifer','123456789'),(2,'lucifer1','23456789'),(3,'lucifer2','3456789');

create table lucifer4(id int,name char(20),ldesc char(200));
insert into lucifer4 values (1,'lucifer','123456789'),(3,'lucifer3','456789'),(4,'lucifer4','6789');

merge into lucifer3 l3 
using lucifer4 l4 
on (l4.id = l3.id) 
when matched then 
update set l3.name = l4.name,l3.ldesc = l4.ldesc 
when not matched then
insert values(l4.id,l4.name,l4.ldesc);
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211213-7fdd9966-8e6b-4de3-b5a7-b82fc47af6bc.png)
## 4.将表3的数据输出到文件，再将文件中的数据导入到表5
```sql
copy lucifer3 to '/home/omm/lucifer3.dat';
create table lucifer5(id int,name char(20),ldesc char(200));
copy lucifer5 from '/home/omm/lucifer3.dat';
select * from lucifer5;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211213-ecd23fc3-dbe8-421c-b5e4-513d8ede1658.png)

# 写在最后

今天的作业打卡结束！🎉 