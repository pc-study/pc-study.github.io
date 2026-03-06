---
title: 分享几个 MySQL8 的小技巧
date: 2026-01-20 14:43:43
tags: [墨力计划,mysql]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2009555568454344704
---

# 前言
今天学习到了几个 MySQL8 的小技巧，还挺有趣，分享给大家。

# 用户双密码
从 在MySQL 8.0.14 开始支持，用户可以多设置一个辅助密码作为备用，一个用户可以同时拥有 2 个密码。实现很简单，使用 `RETAIN CURRENT PASSWORD` 修改密码即可：
```bash
MySQL [(none)]> ALTER USER 'root'@'%' IDENTIFIED BY 'mysql1' RETAIN CURRENT PASSWORD;
```
测试一下：
```bash
[root@mysql ~]# mysql -uroot -pmysql
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 21
Server version: 8.0.26 MySQL Community Server - GPL

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]> exit
Bye
[root@mysql ~]# mysql -uroot -pmysql1
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 22
Server version: 8.0.26 MySQL Community Server - GPL

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]> exit
Bye
```
好了，现在你有两把钥匙了，不怕一把钥匙忘在家里了。

# Pager 分页
Pager 可以在命令行中分页显示查询结果，支持多种分页程序，包括 less、more 等，使用起来非常方便。在日常操作中，妙用 pager 设置显示方式，可以大大提高工作效率。

我们可以在 mysql 客户端中直接使用，常用命令如下：
```bash
## 启用分页
pager less -S
pager more

## 只查看执行时间，不查看具体结果
pager cat > /dev/null

## 对比查询结果是否一致
pager md5sum

## 只查看 slave 关键指标
pager cat | egrep -i 'system user|Exec_Master_Log_Pos|Seconds_Behind_Master|Read_Master_Log_Pos';

## 退出分页，恢复默认输出
nopager
\n
```

# 重启数据库
MySQL 8.0 开始支持命令行 `RESTART` 命令重启数据库：
```bash
MySQL [(none)]> restart;
Query OK, 0 rows affected (0.00 sec)

## 等一段时间后，数据库自动重启完成
MySQL [(none)]> use mysql;
No connection. Trying to reconnect...
Connection id:    8
Current database: *** NONE ***

Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
```
这个过程中，pid 不会变化，执行的用户需要有 `SHUTDOWN` 权限。

# 总结
MySQL8 很多新特性都挺实用的，能发现并且用到工作中是非常便捷的功能。

