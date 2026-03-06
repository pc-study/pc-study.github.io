---
title: MySQL 8 clone 插件快速重建主从集群
date: 2026-01-08 15:28:21
tags: [墨力计划,msyql,mysql 8.0]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2008001056979116032
---

# 前言
今天发现有一套 MySQL 8 数据库主从不同步了，报错如下：
```sql
mysql> show slave status \G;
-- 错误内容
Last_Errno: 1032
Last_Error: Coordinator stopped because there were error(s) in the worker(s). The most recent failure being: Worker 1 failed executing transaction 'ANONYMOUS' at master log mysql-bin.003633, end_log_pos 603058578. See error log and/or performance_schema.replication_applier_status_by_worker table for more details about this failure or others, if any.

-- 根据提示消息查询详细报错
mysql> SELECT * FROM performance_schema.replication_applier_status_by_worker WHERE LAST_ERROR_NUMBER = 1032 \G;
-- 错误内容
LAST_ERROR_TIMESTAMP: 2025-09-06 20:08:06.998256
...
LAST_ERROR_MESSAGE: Worker 1 failed executing transaction 'ANONYMOUS' at master log mysql-bin.003633, end_log_pos 603058578; 
Could not execute Update_rows event on table ci_sch***.qrtz_***_triggers; 
Can't find record in 'qrtz_***_triggers', Error_code: 1032; 
handler error HA_ERR_KEY_NOT_FOUND; the event's master log FIRST, end_log_pos 603058578
```
由于不同步的时间已经很久了，主库的 binlog 已经不存在，所以只能重建从库了，本文使用 MySQL 8 的 clone 插件进行主从重建。

# 主从重建
## 安装插件
主从均需安装 clone 插件：
```sql
mysql> install plugin clone soname 'mysql_clone.so';
Query OK

mysql> select plugin_name, plugin_status from information_schema.plugins where plugin_name = 'clone';
+-------------+---------------+
| PLUGIN_NAME | PLUGIN_STATUS |
+-------------+---------------+
| clone       | ACTIVE        |
+-------------+---------------+
```
确保安装完成即可。

## 配置权限
执行克隆操作需要特定的权限，本地复制和远程复制权限不同：
- **本地克隆**：执行克隆操作的用户需要 `BACKUP_ADMIN` 权限；
- **远程克隆**：捐赠者（数据源）用户需要 `BACKUP_ADMIN` 权限；接受者（目标）用户需要 `CLONE_ADMIN` 权限（该权限隐含了 BACKUP_ADMIN 和 SHUTDOWN 权限）；

主（源端）：
```sql
mysql> GRANT BACKUP_ADMIN ON *.* TO 'root'@'%';
mysql> FLUSH PRIVILEGES;
```
从（目标端）：
```sql
mysql> GRANT CLONE_ADMIN ON *.* TO 'root'@'%';
mysql> FLUSH PRIVILEGES;
```

## 远程克隆
从库开始克隆：
```sql
-- 从库配置参数
mysql> set global clone_valid_donor_list='192.168.31.188:3306';

-- 从库开始克隆
mysql> clone instance from root@'192.168.31.188':3306 identified by 'P@ssw0rd';
```
克隆过程中，从库可以查询进度：
```sql
-- 查看克隆进度
mysql> SELECT 
    stage,
    state,
    CAST(begin_time AS DATETIME) AS "START TIME",
    CAST(end_time AS DATETIME) AS "FINISH TIME",
    LPAD(sys.format_time(POWER(10, 12) * (UNIX_TIMESTAMP(end_time) - UNIX_TIMESTAMP(begin_time))), 10, ' ') AS DURATION,
    LPAD(CONCAT(FORMAT(ROUND(estimate / 1024 / 1024, 0), 0), "MB"), 16, ' ') AS "Estimate",
    CASE 
        WHEN begin_time IS NULL THEN LPAD('%0', 7, ' ')
        WHEN estimate > 0 THEN LPAD(CONCAT(ROUND(data * 100 / estimate, 0), "%"), 7, ' ')
        WHEN end_time IS NULL THEN LPAD('0%', 7, ' ')
        ELSE LPAD('100%', 7, ' ')
    END AS "Done(%)"
FROM performance_schema.clone_progress;

+-----------+-----------+---------------------+---------------------+------------+------------------+---------+
| stage     | state     | START TIME          | FINISH TIME         | DURATION   | Estimate         | Done(%) |
+-----------+-----------+---------------------+---------------------+------------+------------------+---------+
| DROP DATA | Completed | 2026-01-05 15:34:10 | 2026-01-05 15:34:13 |     3.07 s |              0MB |    100% |
| FILE COPY | Completed | 2026-01-05 15:34:13 | 2026-01-05 15:58:13 |       24 m |        347,246MB |    100% |
| PAGE COPY | Completed | 2026-01-05 15:58:13 | 2026-01-05 15:58:13 |  507.57 ms |             18MB |    100% |
| REDO COPY | Completed | 2026-01-05 15:58:13 | 2026-01-05 15:58:14 |   368.4 ms |              0MB |    100% |
| FILE SYNC | Completed | 2026-01-05 15:58:14 | 2026-01-05 15:58:15 |  895.55 ms |              0MB |    100% |
| RESTART   | Completed | 2026-01-05 15:58:15 | 2026-01-05 15:58:21 |     6.47 s |              0MB |    100% |
| RECOVERY  | Completed | 2026-01-05 15:58:21 | 2026-01-05 15:58:23 |     1.64 s |              0MB |    100% |
+-----------+-----------+---------------------+---------------------+------------+------------------+---------+

-- 查看克隆最终状态
mysql> SELECT * FROM performance_schema.clone_status;

+------+------+-----------+-------------------------+-------------------------+--------------------+----------------+----------+---------------+------------------+-----------------+---------------+
| ID   | PID  | STATE     | BEGIN_TIME              | END_TIME                | SOURCE             | DESTINATION    | ERROR_NO | ERROR_MESSAGE | BINLOG_FILE      | BINLOG_POSITION | GTID_EXECUTED |
+------+------+-----------+-------------------------+-------------------------+--------------------+----------------+----------+---------------+------------------+-----------------+---------------+
|    1 |    0 | Completed | 2026-01-05 15:34:09.386 | 2026-01-05 15:58:22.894 | 192.168.31.188:3306 | LOCAL INSTANCE |        0 |               | mysql-bin.004291 |       630818978 |               |
+------+------+-----------+-------------------------+-------------------------+--------------------+----------------+----------+---------------+------------------+-----------------+---------------+
```
等待克隆完成后，会自动重新启动从库 MySQL 实例。

## 启动主从复制
从库配置并启动主从复制：
```sql
mysql> show variables like '%server_id%';
+----------------+-------+
| Variable_name  | Value |
+----------------+-------+
| server_id      | 2     |
| server_id_bits | 32    |
+----------------+-------+

-- 配置从库
mysql> change master to master_host='192.168.31.188',
master_port=3306,
master_user='repl',
master_password='P@ssw0rd',
master_log_file='mysql-bin.004291',
master_log_pos=630818978;

-- 启动主从同步
mysql> start slave;
Query OK

-- 检查主从同步状态
mysql> show slave status \G;
*************************** 1. row ***************************
               Slave_IO_State: Waiting for source to send event
                  Master_Host: 192.168.31.188
                  Master_User: repl
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.004291
          Read_Master_Log_Pos: 633519126
               Relay_Log_File: mysql-relay-bin.000002
                Relay_Log_Pos: 2697758
        Relay_Master_Log_File: mysql-bin.004291
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 633516410
              Relay_Log_Space: 2700684
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 1
                  Master_UUID: 0df21031-d536-11ee-a0cd-005056a91cf7
             Master_Info_File: mysql.slave_master_info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Replica has read all relay log; waiting for more updates
           Master_Retry_Count: 86400
                  Master_Bind: 
      Last_IO_Error_Timestamp: 
     Last_SQL_Error_Timestamp: 
               Master_SSL_Crl: 
           Master_SSL_Crlpath: 
           Retrieved_Gtid_Set: 
            Executed_Gtid_Set: 
                Auto_Position: 0
         Replicate_Rewrite_DB: 
                 Channel_Name: 
           Master_TLS_Version: 
       Master_public_key_path: 
        Get_master_public_key: 0
            Network_Namespace: 
1 row in set
```
可以发现，主从已经恢复正常同步。

# 写在最后
以前搭建 MySQL 主从都是使用 mysqldump 或者 PXB 备份恢复，耗时耗力。使用 clone 插件，只要符合它的限制条件，将是非常实用便捷的搭建方式。