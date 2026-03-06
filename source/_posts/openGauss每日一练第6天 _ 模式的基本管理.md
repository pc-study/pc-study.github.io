---
title: openGauss每日一练第6天 | 模式的基本管理
date: 2021-12-06 10:12:25
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/189310
---

openGauss 每日一练第 6 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 6 课，学习 openGauss 创建模式、修改模式属性和删除模式！

模式是一组数据库对象的集合，主要用于控制对数据库对象的访问。
# 课后作业打卡
## 1.创建一个名为tpcds的模式
```sql
create schema tpcds;
\dn+ tpcds
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211206-ed58cac6-155d-4777-9c53-0424d62bfc0a.png)
## 2.创建一个用户tim, 并将tpcds的owner修改为tim，且修改owner前后分别使用\dn+查看模式信息
```sql
create user tim password 'Lucifer-4622';
\dn+ tpcds
alter schema tpcds owner to tim;
\dn+ tpcds
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211206-edec8446-5503-42a9-9f49-aeb488078f8b.png)
## 3.重命名tpcds为tpcds1
```sql
alter schema tpcds rename to tpcds1;
\dn+ tpcds1
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211206-e2d11551-2327-4a61-8e0c-e4bda2bce029.png)
## 4.在模式tpcds1中建表customer、插入记录和查询记录
```sql
create table tpcds1.customer(id int);
\d+ tpcds1.customer
insert into tpcds1.customer values (1);
select * from tpcds1.customer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211206-0747570d-5eb7-430e-a7a1-00b1dd7683c0.png)
## 5.删除模式tpcds1
```sql
drop schema tpcds1 cascade;
drop user tim;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211206-56136096-bba3-4592-8eff-eaaed0e9ac01.png)


# 写在最后

今天的作业打卡结束！🎉 