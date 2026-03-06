---
title: openGauss每日一练第18天 | 触发器
date: 2021-12-18 13:12:16
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/215809
---

openGauss 每日一练第 18 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 18 课，学习openGauss触发器。

触发器是对应用动作的响应机制，当应用对一个对象发起DML操作时，就会产生一个触发事件（Event），如果该对象上拥有该事件对应的触发器，那么就会检查触发器的触发条件（Condition）是否满足，如果满足触发条件，那么就会执行触发动作（Action）！

# 课后作业
## 1.创建源表和触发表，在源表上创建insert触发器，创建操作触发表的触发器函数
```sql
create table lucifer1(id1 int,id2 int,id3 int);
create table lucifer2(id1 int,id2 int,id3 int);
CREATE OR REPLACE FUNCTION tri_insert_func() RETURNS TRIGGER AS
$$
DECLARE
BEGIN
INSERT INTO lucifer1 VALUES(NEW.id1, NEW.id2, NEW.id3);
RETURN NEW;
END
$$ LANGUAGE PLPGSQL;
CREATE TRIGGER insert_trigger
BEFORE INSERT ON lucifer2
FOR EACH ROW
EXECUTE PROCEDURE tri_insert_func();
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211218-cf216789-57ea-4017-86cd-86854ae31086.png)
## 2.在源表上执行insert操作，查看触发操作是否生效；禁用触发器后，再次查看触发操作是否生效
```sql
INSERT INTO lucifer2 VALUES(100,200,300);
select * from lucifer1;
select * from lucifer2;
alter table lucifer2 disable trigger insert_trigger;
INSERT INTO lucifer2 VALUES(400,500,600);
select * from lucifer1;
select * from lucifer2;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211218-0c9aa9d1-bd24-4d52-8bef-b111c3d47eed.png)
## 3.使用系统表PG_TRIGGER和\dS+查看触发器
```sql
select * from pg_trigger;
\dS+ lucifer2
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211218-503589c7-c248-4ddc-a6b4-3e9d3a449ee2.png)
## 4.重命名触发器
```sql
alter trigger insert_trigger on lucifer2 rename to insert_trigger_renamed;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211218-2e006aca-419f-4d5a-b09f-e0f10322a5a6.png)
## 5.删除触发器
```sql
drop trigger insert_trigger_renamed on lucifer2;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211218-15174320-73d2-4c91-9cac-7fcc1c25416e.png)


# 写在最后

今天的作业打卡结束！🎉 