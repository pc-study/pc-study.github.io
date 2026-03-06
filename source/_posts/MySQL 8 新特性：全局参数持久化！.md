---
title: MySQL 8 新特性：全局参数持久化！
date: 2021-09-25 21:09:37
tags: [mysql]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/113625
---

# 前言
自从 2018 年发布第一版 `MySQL 8.0.11` 正式版至今，MySQL 版本已经更新迭代到 `8.0.26`，相对于稳定的 5.7 版本来说，8.0 在性能上的提升是毋庸置疑的！

随着越来越多的企业开始使用 MySQL 8.0 版本，对于 DBA 来说是一个挑战，也是一个机遇！💪🏻

本文主要讨论下 MySQL 8.0 版本的新特性：**全局参数持久化**

# 全局参数持久化
MySQL 8.0 版本支持在线修改全局参数并持久化，通过加上 `PERSIST` 关键字，可以将修改的参数持久化到新的配置文件（mysqld-auto.cnf）中，重启 MySQL 时，可以从该配置文件获取到最新的配置参数！

>**对应的Worklog [WL#8688]：https://dev.mysql.com/worklog/task/?id=8688**

启用这个功能，使用特定的语法 `SET PERSIST` 来设定任意可动态修改的全局变量！
>- **SET PERSIST**
语句可以修改内存中变量的值，并且将修改后的值写⼊数据⽬录中的 mysqld-auto.cnf 中。
>- **SET PERSIST_ONLY**
语句不会修改内存中变量的值，只是将修改后的值写⼊数据⽬录中的 mysqld-auto.cnf 中。

**以 `max_connections` 参数为例：**

```sql
mysql> select * from performance_schema.persisted_variables;
Empty set (0.00 sec)

mysql> show variables like '%max_connections%';
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| max_connections        | 151   |
| mysqlx_max_connections | 100   |
+------------------------+-------+
2 rows in set (0.00 sec)

mysql> set persist max_connections=300;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from performance_schema.persisted_variables;
+-----------------+----------------+
| VARIABLE_NAME   | VARIABLE_VALUE |
+-----------------+----------------+
| max_connections | 300            |
+-----------------+----------------+
1 row in set (0.00 sec)
```
系统会在数据目录下生成一个包含 `json` 格式的 mysqld-auto.cnf 的文件，格式化后如下所示，当 my.cnf 和mysqld-auto.cnf 同时存在时，后者具有更高优先级。
```json
{
    "Version": 1, 
    "mysql_server": {
        "max_connections": {
            "Value": "300", 
            "Metadata": {
                "Timestamp": 1632575065787609, 
                "User": "root", 
                "Host": "localhost"
            }
        }
    }
}
```
**📢 注意：** 即使你通过 `SET PERSIST` 修改配置的值并没有任何变化，也会写入到 mysqld-auto.cnf 文件中。但你可以通过设置成 `DEFAULT` 值的方式来恢复初始默认值！

如果想要恢复 `max_connections` 参数为初始默认值，只需要执行：
```sql
mysql> set persist max_connections=DEFAULT;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from performance_schema.persisted_variables;
+-----------------+----------------+
| VARIABLE_NAME   | VARIABLE_VALUE |
+-----------------+----------------+
| max_connections | 151            |
+-----------------+----------------+
1 row in set (0.00 sec)
```
如果想要移除所有的全局持久化参数，则只需执行：
```sql
mysql> RESET PERSIST;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from performance_schema.persisted_variables;
Empty set (0.00 sec)
```
当然，删除 mysqld-auto.cnf 文件后，重启 MySQL 也可！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️