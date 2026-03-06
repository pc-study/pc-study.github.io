---
title: KCP 模拟题练习 06 - 回收连接权限
date: 2024-10-08 14:12:10
tags: [墨力计划,kingbase,kingbase v9]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843526623645233152
---

【单选题】你是 KingbaseES 数据库管理员，为了防止无关用户连接到生产库，你需要回收所有非超级用户的连接权限，此时你需要使用以下哪个语句实现？
 - [x] REVOKE CONNECT ON DATABASE dbname FROM PUBLIC;
 - [ ] REVOKE CONNECT ON DATABASE dbname FROM ALL USERS;
 - [ ] REVOKE CONNECT ON DATABASE dbname FROM SUPERUSERS;
 - [ ] REVOKE CONNECT ON DATABASE dbname FROM USERS;

**解题思路：**

假设数据库名称为 scott，我们测试一下以上选项：
```sql
-- 现在创建了一个普通用户 user01，可以正常连接数据库 scott
scott=# create user user01 with password 'kingbase';
CREATE ROLE
scott=# \c scott user01
Password for user user01:

You are now connected to database "scott" as userName "user01".
scott=> \conninfo
You are connected to database "scott" as user "user01" on host "localhost" (address "::1") at port "54321".
```
接着尝试一个个收回权限。

**1、选项 1 执行后，普通用户无法正常连接**
```sql
test=# REVOKE CONNECT ON DATABASE scott FROM PUBLIC;
REVOKE
test=# \c scott user01
Password for user user01:

FATAL:  permission denied for database "scott"
DETAIL:  User does not have CONNECT privilege.
Previous connection kept

-- 恢复权限
test=# grant CONNECT ON DATABASE scott to public;
GRANT
```
官方文档中对与 PUBLIC 模式的描述如下，可以参考：

当创建一个数据库用户时，可以同时为该用户创建一个对应的模式(模式为数据库对象的集合，如表、视图、过程和函数等)。当该用户连接数据库时，就可存取该模式中的全部对象。一个用户可以创建多个模式，用户缺省使用的模式为 **`PUBLIC`**。

在创建对象时，KingbaseES 默认将某些类型的对象的权限授予 PUBLIC，对于表、表列、序列、外部数据包装器、外部服务器、大型对象、模式或表空间，PUBLIC 缺省情况下不授予任何特权。

对于其他类型的对象，授予 PUBLIC 的默认权限如下:
- 数据库的 CONNECT 和 TEMPORARY(创建临时表)权限；
- 函数和程序的 EXECUTE 权限；
- 语言和数据类型(包括域)的 USAGE 权限。

当然，对象所有者可以撤销的默认权限和明确授予的权限。(为了获得最大的安全性，在创建对象的同一事务中发出撤销；那么就没有其他用户可以在其中使用该对象的窗口。)此外，可以使用 ALTER DEFAULT PRIVILEGES 命令重写这些默认的特权设置。

**2、选项 2 执行后，报错语法有问题**
```sql
test=# REVOKE CONNECT ON DATABASE scott FROM ALL USERS;
ERROR:  语法错误 在 "ALL" 或附近的
LINE 1: REVOKE CONNECT ON DATABASE scott FROM ALL USERS;
```

**3、选项 3 执行后，报错语法有问题**
```sql
test=# REVOKE CONNECT ON DATABASE scott FROM SUPERUSERS;
ERROR:  角色 "superusers" 不存在
```

**4、选项 4 执行后，报错语法有问题**
```sql
test=# REVOKE CONNECT ON DATABASE scott FROM USERS;
ERROR:  角色 "users" 不存在
```
查看官方文档关于 revoke 命令的语法介绍：
```sql
REVOKE [ GRANT OPTION FOR ]
    { { SELECT | INSERT | UPDATE | DELETE | TRUNCATE | REFERENCES | TRIGGER }
    [, ...] | ALL [ PRIVILEGES ] }
    ON { [ TABLE ] table_name [, ...]
         | ALL TABLES IN SCHEMA schema_name [, ...] }
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { { SELECT | INSERT | UPDATE | REFERENCES } ( column_name [, ...] )
    [, ...] | ALL [ PRIVILEGES ] ( column_name [, ...] ) }
    ON [ TABLE ] table_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { { USAGE | SELECT | UPDATE }
    [, ...] | ALL [ PRIVILEGES ] }
    ON { SEQUENCE sequence_name [, ...]
         | ALL SEQUENCES IN SCHEMA schema_name [, ...] }
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { { CREATE | CONNECT | TEMPORARY | TEMP } [, ...] | ALL [ PRIVILEGES ] }
    ON DATABASE database_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { USAGE | ALL [ PRIVILEGES ] }
    ON DOMAIN domain_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { USAGE | ALL [ PRIVILEGES ] }
    ON FOREIGN DATA WRAPPER fdw_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { USAGE | ALL [ PRIVILEGES ] }
    ON FOREIGN SERVER server_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { EXECUTE | ALL [ PRIVILEGES ] }
    ON { { FUNCTION | PROCEDURE | ROUTINE } function_name [ ( [ [ argmode ] [
    arg_name ] arg_type [, ...] ] ) ] [, ...]
         | ALL { FUNCTIONS | PROCEDURES | ROUTINES } IN SCHEMA schema_name [,
         ...] }
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { USAGE | ALL [ PRIVILEGES ] }
    ON LANGUAGE lang_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { { SELECT | UPDATE } [, ...] | ALL [ PRIVILEGES ] }
    ON LARGE OBJECT loid [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { { CREATE | USAGE } [, ...] | ALL [ PRIVILEGES ] }
    ON SCHEMA schema_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { CREATE | ALL [ PRIVILEGES ] }
    ON TABLESPACE tablespace_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]

REVOKE [ GRANT OPTION FOR ]
    { USAGE | ALL [ PRIVILEGES ] }
    ON TYPE type_name [, ...]
    FROM { [ GROUP ] role_name | PUBLIC } [, ...]
    [ CASCADE | RESTRICT ]


REVOKE [ ADMIN OPTION FOR ]
    role_name [, ...] FROM role_name [, ...]
    [ CASCADE | RESTRICT ]
```
可以发现，Kingbase 数据库 revoke 命令是针对角色的，而 `ALL USERS`、`SUPERUSERS` 和 `USERS` 并非数据库角色，所以自然也就无法执行：
```sql
test=# \du
                                   List of roles
 Role name |                         Attributes                         | Member of
-----------+------------------------------------------------------------+-----------
 kcluster  | Cannot login                                               | {}
 sao       | No inheritance                                             | {}
 sso       | No inheritance                                             | {}
 system    | Superuser, Create role, Create DB, Replication, Bypass RLS | {}
```
当然，`SUPERUSER` 为系统权限，可以通过创建用户时赋予或者手动赋予用户：
```sql
-- 对已创建用户赋予
test=# alter user user01 with superuser;
ALTER ROLE
test=# \du user01
           List of roles
 Role name | Attributes | Member of
-----------+------------+-----------
 user01    | Superuser  | {}

-- 创建用户赋予
test=# create user user02 with superuser password 'kingbase';
CREATE ROLE
test=# \du user02
           List of roles
 Role name | Attributes | Member of
-----------+------------+-----------
 user02    | Superuser  | {}
```