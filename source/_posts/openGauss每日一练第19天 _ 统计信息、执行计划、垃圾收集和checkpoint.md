---
title: openGauss每日一练第19天 | 统计信息、执行计划、垃圾收集和checkpoint
date: 2021-12-19 10:12:37
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/216152
---

openGauss 每日一练第 19 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 19 课，学习openGauss收集统计信息、打印执行计划、垃圾收集和checkpoint！

# 课后作业

## 1.创建分区表，并用generate_series(1,N)函数对表插入数据
```sql
create schema lucifer;
create table lucifer.store
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
        partition store_p4 values less than (10001)
);
insert into lucifer.store values(generate_series(10, 10000));
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211219-3d083045-7872-4394-aef9-425d2328f59b.png)
## 2.收集表统计信息
```sql
select relname, relpages, reltuples from pg_class where relname = 'store';
analyze VERBOSE lucifer.store;
select relname, relpages, reltuples from pg_class where relname = 'store';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211219-88b5ad28-33ca-44fc-a4ab-47cc8395400b.png)
## 3.显示简单查询的执行计划；建立索引并显示有索引条件的执行计划
```sql
SET explain_perf_mode=normal;
EXPLAIN SELECT * FROM lucifer.store;
create index store_idx on lucifer.store(id);
EXPLAIN SELECT * FROM lucifer.store WHERE id<100;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211219-4d91df0d-51fb-41a5-8725-d2bb00c5aa82.png)
## 4.更新表数据，并做垃圾收集
```sql
update lucifer.store set id = id + 1 where id < 100;
VACUUM (VERBOSE, ANALYZE) lucifer.store;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211219-e9766f33-9a44-41c2-9019-73fbb6c748af.png)
## 5.清理数据
```sql
CHECKPOINT;
drop table lucifer.store;
drop schema lucifer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211219-2814265f-7567-440a-ade6-6de9374adf5d.png)

# 写在最后

今天的作业打卡结束！🎉 