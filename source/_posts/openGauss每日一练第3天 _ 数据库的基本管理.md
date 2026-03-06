---
title: openGauss每日一练第3天 | 数据库的基本管理
date: 2021-12-03 10:12:11
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/187541
---

openGauss 每日一练第 3 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 3 课，学习了 openGauss创建数据库、修改数据库属性和删除数据库！

# 课后作业打卡
## 1.分别创建名为tpcc1和tpcc2的数据库
```sql
create database tpcc1;
create database tpcc2;
\l
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211203-2ce4c07a-e736-468d-b56a-809a162767e4.png)
## 2.将tpcc1数据库重命名为tpcc10
```sql
alter database tpcc1 rename to tpcc10;
\l
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211203-cafb619e-5176-4da8-84e8-5c770567e3ad.png)
## 3.分别使用\l和\l+两个元命令查看数据库信息
```sql
\l
\l+
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211203-4910eef6-afd8-4634-8daf-6f1c7d0b7f69.png)
## 4.在数据库tpcc2中创建customer表，字段自定义
```sql
\c tpcc2
create table customer(id int);
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211203-03af6510-cec3-4679-be37-e16f32f6a98c.png)
## 5.删除新创建的数据库
```sql
drop database tpcc10;
drop database tpcc2;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211203-426949e5-4e6b-4f11-9080-78d2b9f66167.png)
## 6.退出gsql程序
```sql
\q
```
![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20211203-256f49aa-cc8f-4c0a-83dc-266ce60a4777.png)

总结，今天学习了如何管理数据库，包括创建删除和使用！

## 更多拓展
```sql
--创建jim和tom用户。
openGauss=# CREATE USER jim PASSWORD 'xxxxxxxxx';
openGauss=# CREATE USER tom PASSWORD 'xxxxxxxxx';

--创建一个GBK编码的数据库music（本地环境的编码格式必须也为GBK）。
openGauss=# CREATE DATABASE music ENCODING 'GBK' template = template0;

--创建数据库music2，并指定所有者为jim。
openGauss=# CREATE DATABASE music2 OWNER jim;

--用模板template0创建数据库music3，并指定所有者为jim。
openGauss=# CREATE DATABASE music3 OWNER jim TEMPLATE template0;

--设置music数据库的连接数为10。
openGauss=# ALTER DATABASE music CONNECTION LIMIT= 10;

--将music名称改为music4。
openGauss=# ALTER DATABASE music RENAME TO music4;

--将数据库music2的所属者改为tom。
openGauss=# ALTER DATABASE music2 OWNER TO tom;

--设置music3的表空间为PG_DEFAULT。
openGauss=# ALTER DATABASE music3 SET TABLESPACE PG_DEFAULT;

--关闭在数据库music3上缺省的索引扫描。
openGauss=# ALTER DATABASE music3 SET enable_indexscan TO off;

--重置enable_indexscan参数。
openGauss=# ALTER DATABASE music3 RESET enable_indexscan;

--删除数据库。
openGauss=# DROP DATABASE music2;
openGauss=# DROP DATABASE music3;
openGauss=# DROP DATABASE music4;

--删除jim和tom用户。
openGauss=# DROP USER jim;
openGauss=# DROP USER tom;

--创建兼容TD格式的数据库。
openGauss=# CREATE DATABASE td_compatible_db DBCOMPATIBILITY 'C';

--创建兼容A格式的数据库。
openGauss=# CREATE DATABASE ora_compatible_db DBCOMPATIBILITY 'A';

--删除兼容TD、A格式的数据库。
openGauss=# DROP DATABASE td_compatible_db;
openGauss=# DROP DATABASE ora_compatible_db;
```

# 写在最后

今天的作业打卡结束！🎉 