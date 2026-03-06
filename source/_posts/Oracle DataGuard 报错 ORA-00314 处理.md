---
title: Oracle DataGuard 报错 ORA-00314 处理
date: 2025-09-01 17:24:08
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1962439759666622464
---

# 前言
有一套 Oracle 11GR2 DataGuard 单机环境，巡检发现 alert 日志报错如下：
```bash
Wed Aug 27 09:53:02 2025
Errors in file /u01/app/oracle/diag/rdbms/orcldg/orcldg/trace/orcldg_arc2_3637.trc:
ORA-00314: log 5 of thread 1, expected sequence# 119864 doesn't match 119862
ORA-00312: online log 5 thread 1: '/u01/app/oracle/oradata/redostd05.log'
```
查看错误定义：
```bash
[oracle@lucifer:/home/oracle]$ oerr ora 314
00314, 00000, "log %s of thread %s, expected sequence# %s doesn't match %s"
// *Cause:  The online log is corrupted or is an old version.
// *Action: Find and install correct version of log or reset logs.
```
看报错是说在线日志损坏或者版本过旧，需要 reset 日志。

# 问题分析
检查备库当前在线重做日志：
```sql
SQL> set line2222 pages1000
SQL> select * from v$standby_log;

    GROUP# DBID                                        THREAD#  SEQUENCE#      BYTES  BLOCKSIZE       USED ARC STATUS     FIRST_CHANGE# FIRST_TIM NEXT_CHANGE# NEXT_TIME LAST_CHANGE# LAST_TIME
---------- ---------------------------------------- ---------- ---------- ---------- ---------- ---------- --- ---------- ------------- --------- ------------ --------- ------------ ---------
         5 UNASSIGNED                                        1          0  209715200        512          0 NO  UNASSIGNED
         6 1584260213                                        1     120011  209715200        512   17433088 YES ACTIVE        7.7784E+10 01-SEP-25                          7.7784E+10 01-SEP-25
         7 1584260213                                        2     119841  209715200        512  144156672 YES ACTIVE        7.7784E+10 01-SEP-25                          7.7784E+10 01-SEP-25
         8 UNASSIGNED                                        2          0  209715200        512          0 NO  UNASSIGNED
         9 UNASSIGNED                                        1          0  209715200        512          0 NO  UNASSIGNED
        10 UNASSIGNED                                        2          0  209715200        512          0 NO  UNASSIGNED

SQL> col member for a100
SQL> select group#,member from v$logfile;

    GROUP# MEMBER
---------- ----------------------------------------------------------------------------------------------------
         1 /u01/app/oracle/oradata/redo01.log
         2 /u01/app/oracle/oradata/redo02.log
         3 /u01/app/oracle/oradata/redo03.log
         4 /u01/app/oracle/oradata/redo04.log
         5 /u01/app/oracle/oradata/redostd05.log
         6 /u01/app/oracle/oradata/redostd06.log
         7 /u01/app/oracle/oradata/redostd07.log
         8 /u01/app/oracle/oradata/redostd08.log
         9 /u01/app/oracle/oradata/redostd09.log
        10 /u01/app/oracle/oradata/redostd10.log
```
可以看到 alert 中报错的日志文件对应的是 5 号日志。

# 解决方案
执行 clear 日志：
```sql
SQL> Alter database recover managed standby database cancel;

Database altered.

SQL> alter database clear logfile group 5;

Database altered.

SQL> recover managed standby database using current logfile disconnect;
Media recovery complete.

-- 检查在线日志使用情况
SQL> set line2222 pages1000
SQL> select * from v$standby_log;
    GROUP# DBID                                        THREAD#  SEQUENCE#      BYTES  BLOCKSIZE       USED ARC STATUS     FIRST_CHANGE# FIRST_TIM NEXT_CHANGE# NEXT_TIME LAST_CHANGE# LAST_TIME
---------- ---------------------------------------- ---------- ---------- ---------- ---------- ---------- --- ---------- ------------- --------- ------------ --------- ------------ ---------
         5 1584260213                                        1     120012  209715200        512   64310272 YES ACTIVE        7.7786E+10 01-SEP-25                          7.7786E+10 01-SEP-25
         6 UNASSIGNED                                        1          0  209715200        512          0 NO  UNASSIGNED
         7 1584260213                                        2     119843  209715200        512  103357952 YES ACTIVE        7.7786E+10 01-SEP-25                          7.7786E+10 01-SEP-25
         8 UNASSIGNED                                        2          0  209715200        512          0 NO  UNASSIGNED
         9 UNASSIGNED                                        1          0  209715200        512          0 NO  UNASSIGNED
        10 UNASSIGNED                                        2          0  209715200        512          0 NO  UNASSIGNED
```
目前 alert 没有再报错，后续持续观察，确定问题是否完全解决！

---

参考 MOS 文章：[ORA-00314: LOG 404 OF THREAD 4, EXPECTED SEQUENCE# 33808 DOESN'T MATCH 33543 (Doc ID 1077564.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=1077564.1)