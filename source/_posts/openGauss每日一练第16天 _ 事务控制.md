---
title: openGauss每日一练第16天 | 事务控制
date: 2021-12-16 22:12:29
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/214496
---

openGauss 每日一练第 16 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 16 课，学习openGauss事务控制。

事务是用户定义的一个数据库操作序列，这些操作要么全做要么全不做，是一个不可分割的工作单位！
# 课后作业打卡

## 1.以默认方式启动事务1，修改事务隔离级别，查看transaction_isolation
```sql
start transaction;
SET LOCAL TRANSACTION ISOLATION LEVEL READ COMMITTED READ ONLY;
show transaction_isolation;
END;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211216-32f51450-40c8-477d-8eb6-aac3f677c6fb.png)
## 2.以读写方式启动事务2，创建新表，修改事务为只读事务，查看transaction_read_only，并向表中插入记录
```sql
show transaction_isolation;
START TRANSACTION ISOLATION LEVEL repeatable read READ WRITE;
create table lucifer(id int,name char(20));
SET LOCAL TRANSACTION ISOLATION LEVEL READ COMMITTED READ ONLY;
show transaction_read_only;
insert into lucifer values(1,'Lucifer');
commit;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211216-b45efeca-9330-44e7-a3da-51322f0817d2.png)
## 3.启动事务3，对表进行增删改查，并用到创建savepoint，回滚savepoint和删除savepoint
```sql
START TRANSACTION;
create table lucifer(id int,name char(20));
insert into lucifer values(1,'Lucifer');
select * from lucifer;
SAVEPOINT my_savepoint;
delete from lucifer where id = 1;
ROLLBACK TO SAVEPOINT my_savepoint;
update lucifer set name = 'Lucifer1' where id = 1;
RELEASE SAVEPOINT my_savepoint;
COMMIT;
select * from lucifer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211216-e15fe137-c120-474c-af59-25508b1a53d0.png)
## 4.清理数据
```sql
drop table lucifer;
```

# 写在最后

今天的作业打卡结束！🎉 