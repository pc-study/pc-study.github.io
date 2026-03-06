---
title: openGauss每日一练第17天 | 游标管理
date: 2021-12-17 11:12:43
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/214613
---

openGauss 每日一练第 17 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 17 课，学习openGauss定义游标

为了处理SQL语句，存储过程进程分配一段内存区域来保存上下文联系，游标是指向上下文区域的句柄或指针。借助游标，存储过程可以控制上下文区域的变化。

# 课后作业
## 1.创建游标，且使用select子句指定游标返回的行，分别使用FETCH抓取数据，MOVE重定位游标
```sql
create schema lucifer;
create table lucifer.lucifer(id int,name char(20));
insert into lucifer.lucifer values (1,'lucifer'),(2,'lucifer1'),(3,'lucifer2'),(4,'lucifer3');
start transaction;
cursor cursor1 for select * from lucifer.lucifer order by id;
select * from pg_cursors;
FETCH FORWARD 3 FROM cursor1;
MOVE FORWARD 3 FROM cursor1;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211217-e14b8285-08eb-4a63-90a4-1bcfe5f111f1.png)
## 2.在系统视图pg_cursors中查看游标
```sql
select * from pg_cursors;
```
## 3.创建一个使用游标的存储过程
```sql
create or replace procedure lucifer_cursor_1
as
    name    varchar(100);
    id  integer;

    cursor cursor1 for select * from lucifer.lucifer order by id;
begin
    if not cursor1%isopen then
        open cursor1;
    end if;
    loop
        fetch cursor1 into id,name;
		RAISE INFO 'id: %' ,name;
        exit when cursor1%notfound;
    end loop;
    if cursor1%isopen then
        close cursor1;
    end if;
end;
/
call lucifer_cursor_1();
drop procedure lucifer_cursor_1;
end;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211217-2af65c82-bdb0-47fd-aa39-629de8bb5880.png)
## 4.清理数据
```sql
drop table lucifer.lucifer;
drop schema lucifer cascade;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211217-162faae3-4737-4da7-84c1-1e669c61b03f.png)


# 写在最后

今天的作业打卡结束！🎉 