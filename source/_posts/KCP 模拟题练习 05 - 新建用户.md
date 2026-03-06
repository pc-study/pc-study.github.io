---
title: KCP 模拟题练习 05 - 新建用户
date: 2024-10-08 13:38:49
tags: [墨力计划,kingbase,金仓kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843506474117595136
---

【单选题】使用普通用户 user01 新建了一个数据库 scott，下列说法不正确的是？
 - [ ] 用户 user01 具有 createdb 权限
 - [ ] 用户 user01 是数据库 scott 的拥有者
 - [ ] 超级用户 system 可以直接删除数据库 scott
 - [x] 超级用户 system 可以直接删除用户 user01

**解题思路：**

1、连接 KingBase 数据库，创建一个普通用户 user01，然后尝试创建一个数据库 scott：
```sql
-- 首先创建一个用户 user01
test=# create user user01 with password 'kingbase';
CREATE ROLE

-- 查看 user01 的用户权限
test=# \dg user01
           List of roles
 Role name | Attributes | Member of
-----------+------------+-----------
 user01    |  	        | {}

-- 连接用户 user01
test=# \c test user01
Password for user user01:

You are now connected to database "test" as userName "user01".
test=>

-- 尝试创建数据库 scott 报错，没有创建数据库的权限，由此可见，必须要对普通用户授权创建数据库权限才可以创建数据库 scott
test=> create database scott;
ERROR:  创建数据库权限不够

-- 使用 system 用户进行授权
test=> \c test system
Password for user system:

You are now connected to database "test" as userName "system".
test=# alter user user01 createdb;
ALTER ROLE

-- 查看 user01 权限
test=# \dg user01
           List of roles
 Role name | Attributes | Member of
-----------+------------+-----------
 user01    | Create DB  | {}

-- 再次创建数据库 scott 成功
test=# \c test user01
Password for user user01:

You are now connected to database "test" as userName "user01".
test=> create database scott;
CREATE DATABASE
```
由上可知，user01 具有 createdb 权限，才可以创建 scott 数据库，所以选项 1 是正确的。

2、用户 user01 是数据库 scott 的拥有者：
```sql
test=> \l scott
                        List of databases
 Name  | Owner  | Encoding | Collate | Ctype | Access privileges
-------+--------+----------+---------+-------+-------------------
 scott | user01 | GBK      | C       | C     |
```
查看数据库 scott 的信息，拥有者确实是 user01。

3、超级用户 system 是否可以直接删除数据库 scott：
```sql
test=> \c test system
Password for user system:

You are now connected to database "test" as userName "system".
test=# drop database scott;
DROP DATABASE
```
可以直接删除数据库 scott。

4、超级用户 system 可以直接删除用户 user01：
```sql
-- 第一种情况，数据库 scott 已被删除的情况，删除 user01 成功
test=> \c test system
Password for user system:

You are now connected to database "test" as userName "system".
test=# drop database scott;
DROP DATABASE
test=# drop user user01;
DROP ROLE

-- 第二种情况，数据库 scott 未被删除的情况，删除 user01 失败
test=# create user user01 with password 'kingbase';
CREATE ROLE
test=# alter user user01 createdb;
ALTER ROLE
test=# \c test user01
Password for user user01:

You are now connected to database "test" as userName "user01".
test=> create database scott;
CREATE DATABASE
-- 使用 system 删除用户 user01
test=> \c test system
Password for user system:

You are now connected to database "test" as userName "system".
test=# drop user user01;
ERROR:  无法删除"user01"因为有其它对象倚赖它
DETAIL:  数据库 scott的属主
```
本题考察我们的应该是用户 user01 存在数据库 scott 时，使用 system 删除用户是否成功，所以明显是无法删除的。由此可知，Kingbase 数据库的用户如果有依赖的对象存在，则无法删除，必须要将依赖的对象删除或者移走才可以删除用户：
```sql
-- 将 scott 数据库移动到 system 用户下
test=# alter database scott owner to system;
ALTER DATABASE
test=#
test=# \l scott
                        List of databases
 Name  | Owner  | Encoding | Collate | Ctype | Access privileges
-------+--------+----------+---------+-------+-------------------
 scott | system | GBK      | C       | C     |
(1 row)

-- 再次删除用户 user01 成功
test=# \conninfo
You are connected to database "test" as user "system" on host "localhost" (address "::1") at port "54321".
test=# drop user user01;
DROP ROLE
```
当用户 user01 下没有任何依赖对象时，可以成功删除。