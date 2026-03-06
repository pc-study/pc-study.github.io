---
title: mysql8 忘记 root 密码，怎么破？
date: 2026-01-08 15:29:04
tags: [墨力计划,mysql,mysql 8.0]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2008821476888240128
---

# 前言
今天发现有一套 MySQL8 数据库 root 密码找不到了，无法连接：
```bash
[root@mysql ~]# mysql -uroot -p
Enter password:
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
```
折腾了一下，找到了几种解决方案，本文分享一下跟大家一起交流一下。

# 方案一
通过设置 `skip-grant-tables` 参数来跳过加载权限表。

当 MySQL 启动时使用 `--skip-grant-tables` 参数时，MySQL 会跳过所有涉及用户权限和认证的检查，允许任何人以任何用户名和密码（或者不使用密码）登录数据库。

修改 my.cnf 配置文件，在 [mysqld] 下面增加一行：
```bash
[root@SSSZLMYSQL1 ~]# cat /etc/my.cnf
## 在 []
[mysqld]
user = mysql
port = 3306
basedir = /usr/local/mysql
datadir = /data/mysql/data
socket = /data/mysql/tmp/mysql.sock
pid-file = /data/mysql/tmp/mysql.pid
skip-grant-tables
```
重启 MySQL 服务：
```bash
[root@mysql ~]# service mysql status
 SUCCESS! MySQL running (23724)
[root@mysql ~]# service mysql restart
Shutting down MySQL.. SUCCESS!
Starting MySQL........... SUCCESS!
```
使用无密码方式登录：
```bash
[root@mysql ~]# mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 7
Server version: 8.0.26 MySQL Community Server - GPL

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]>
```
修改 root 密码：
```bash
MySQL [(none)]> use mysql;
## 必须先执行 FLUSH PRIVILEGES 命令通过强制 MySQL 重新加载 mysql 数据库中的权限信息，使修改生效
MySQL [mysql]> flush privileges;
MySQL [mysql]> ALTER USER 'root'@'%' IDENTIFIED BY 'mysql';
```
**注意**：在 `--skip-grant-tables` 模式下，MySQL 会跳过权限验证，不会自动应用对 `mysql.user` 表的修改，必须通过执行 `FLUSH PRIVILEGES` 来手动刷新权限表，确保对用户表的修改生效。

再次编辑 my.cnf 配置文件，取消参数 `--skip-grant-tables`，然后重启 MySQL 服务：
```bash
[root@mysql ~]# sed -i '/skip-grant-tables/s/^/#/' /etc/my.cnf
[root@mysql ~]# service mysql restart
Shutting down MySQL.. SUCCESS!
Starting MySQL........... SUCCESS!
```
使用新密码登陆 MySQL 数据库：
```bash
[root@mysql ~]# mysql -uroot -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.26 MySQL Community Server - GPL

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]>
```
成功登陆。

# 方案二
这个和方案一的原理相同，只是命令不相同，使用 `mysqld_safe` 命令启动 MySQL 安全模式（跳过权限表）。

首先关闭 MySQL 服务：
```bash
[root@mysql ~]# service mysql stop
Shutting down MySQL. SUCCESS!
```
安全模式启动：
```bash
[root@mysql ~]# /usr/local/mysql/bin/mysqld_safe --skip-grant-tables &
[1] 6736
[root@mysql ~]# 2026-01-07T09:06:02.741202Z mysqld_safe Logging to '/data/mysql/log/error.log'.
2026-01-07T09:06:02.765308Z mysqld_safe Starting mysqld daemon with databases from /data/mysql/data
```
无密码模式登陆：
```bash
[root@mysql ~]# mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 7
Server version: 8.0.26 MySQL Community Server - GPL

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]>
```
修改 root 密码：
```bash
MySQL [(none)]> use mysql;
## 必须先执行 FLUSH PRIVILEGES 命令通过强制 MySQL 重新加载 mysql 数据库中的权限信息，使修改生效
MySQL [mysql]> flush privileges;
MySQL [mysql]> ALTER USER 'root'@'%' IDENTIFIED BY 'mysql1';
```
重启 MySQL 服务：
```bash
[root@mysql ~]# service mysql restart
Shutting down MySQL.2026-01-07T09:07:56.558733Z mysqld_safe mysqld from pid file /data/mysql/tmp/mysql.pid ended
 SUCCESS!
[1]+  Done                    /usr/local/mysql/bin/mysqld_safe --skip-grant-tables
```
使用新密码登陆 MySQL 数据库：
```bash
[root@mysql ~]# mysql -uroot -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.26 MySQL Community Server - GPL

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]>
```
成功登陆。

# 总结
看了下网上大概就这两种方案，我都验证了没有问题，大家如果还有其他方案，欢迎在评论区交流！