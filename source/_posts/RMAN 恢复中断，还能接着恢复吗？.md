---
title: RMAN 恢复中断，还能接着恢复吗？
date: 2025-09-03 13:03:04
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1963093112767655936
---

# 前言
前几天在处理一个生产环境的数据库恢复任务，2TB 的 Oracle 数据库需要从备份中完整恢复。按照惯例，晚上启动 RMAN 恢复任务，准备让它跑一整夜。

结果第二天早上一看，磁盘空间不够，RMAN 恢复中断了。怎么办，重来吗？

本文记录一下处理过程，方便后续查看。

# 问题现象
查看 RMAN 恢复日志：
```bash
channel c2: reading from backup piece /backup/db_full_xxx_1_1_1_20250825.bak
channel c1: ORA-19870: error while restoring backup piece /data/backup/db_full_xxx_1_1_1_20250825.bak
ORA-19502: write error on file "/data/database/tbs_data04.dbf", block number 3145984 (block size=8192)
ORA-27072: File I/O error
Linux-x86_64 Error: 28: No space left on device
Additional information: 4
Additional information: 3145984
Additional information: -1

channel c2: ORA-19870: error while restoring backup piece /data/backup/db_full_xxx_1_1_1_20250825.bak
ORA-19502: write error on file "/data/database/tbs_data.327.1170146731", block number 37184 (block size=8192)
ORA-27072: File I/O error
Additional information: 4
Additional information: 37184
Additional information: 217088

channel c3: ORA-19870: error while restoring backup piece /data/backup/db_full_xxx_1_1_1_20250825.bak
ORA-19502: write error on file "/data/database/tbs_data.311.1147251363", block number 3219328 (block size=8192)
ORA-27072: File I/O error
Linux-x86_64 Error: 28: No space left on device

failover to previous backup

creating datafile file number=16 name=/data/database/tbs_data.dbf
creating datafile file number=36 name=/data/database/tbs_data04.dbf
creating datafile file number=37 name=/data/database/tbs_data05.dbf
[部分数据文件创建日志省略...]
Finished restore at 02-SEP-25

RMAN-00571: ===========================================================
RMAN-00569: =============== ERROR MESSAGE STACK FOLLOWS ===============
RMAN-00571: ===========================================================
RMAN-03002: failure of switch command at 09/02/2025 21:19:55
ORA-19563: header validation failed for file

Recovery Manager complete.
```
从报错 `Linux-x86_64 Error: 28: No space left on device` 明显可以看到是磁盘空间不足导致恢复中断。

# 磁盘扩容
首先需要解决磁盘空间问题，虚拟化增加了一块 2T 盘，执行以下 LVM 扩容操作：
```bash
# 创建物理卷
pvcreate /dev/sdc
# 扩展卷组
vgextend data /dev/sdc
# 扩展逻辑卷（使用全部可用空间）
lvextend -l +100%FREE /dev/data/data_lv
# 调整文件系统大小
resize2fs /dev/data/data_lv
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250903-1963093893117915136_395407.png)

扩容完成后，确认磁盘空间充足后准备重新启动恢复任务。

# RMAN 断点续传机制
一个关键问题：**RMAN 是否支持从中断点继续恢复，还是需要重新开始？**

启动恢复脚本进行验证：
```bash
[oracle@dbserver:/home/oracle]$ sh restore.sh &
[1] 16640
[oracle@dbserver:/home/oracle]$ tail -200f restore_2025-09-03.log
```
观察日志输出，可以清楚看到 RMAN 的智能恢复机制：
```bash
Starting restore at 03-SEP-25

datafile 1 is already restored to file /data/database/system.260.1056479481
datafile 2 is already restored to file /data/database/sysaux.261.1056479483
datafile 3 is already restored to file /data/database/undotbs1.262.1056479483
datafile 4 is already restored to file /data/database/undotbs2.264.1056479487
datafile 5 is already restored to file /data/database/users.265.1056479487
datafile 6 is already restored to file /data/database/tbs_trans
datafile 7 is already restored to file /data/database/tbs_workflow_ex
datafile 8 is already restored to file /data/database/tbs_hist
datafile 9 is already restored to file /data/database/tbs_main
[已恢复数据文件列表省略...]

# 从未完成的数据文件开始恢复
channel c1: starting datafile backup set restore
channel c1: specifying datafile(s) to restore from backup set
channel c1: restoring datafile 00036 to /data/database/tbs_data04.dbf
channel c1: restoring datafile 00046 to /data/database/tbs_data.310.1147251361
channel c1: restoring datafile 00061 to /data/database/tbs_data.325.1165308233
channel c1: restoring datafile 00083 to /data/database/tbs_data.347.1189929603
channel c1: reading from backup piece /backup/db_full_xxx_1_1_1_20250901.bak
```
# 监控恢复进度
使用以下 SQL 查询实时监控恢复进度：
```sql
SQL> set line2222 pages1000
SQL> SELECT SID, SERIAL#, CONTEXT, SOFAR, TOTALWORK,
       ROUND(SOFAR/TOTALWORK*100,2) "% Complete",
       TIME_REMAINING/60 "Minutes Remaining"
FROM V$SESSION_LONGOPS
WHERE OPNAME LIKE 'RMAN%'
  AND TOTALWORK != 0
  AND SOFAR != TOTALWORK; 

       SID    SERIAL#    CONTEXT      SOFAR  TOTALWORK % Complete Minutes Remaining
---------- ---------- ---------- ---------- ---------- ---------- -----------------
      1423         14          1    1063783   15990656       6.65        66.4166667
      1992          7          1     809302   12312064       6.57        67.2833333
       853        607          3    2569277  262981344        .98        413.866667
      1707          7          1    1091712   15990656       6.83              64.6
```

# 写在最后
通过这个案例，想跟大家分享一个很多人可能不太了解的 RMAN 特性。很多 DBA 朋友遇到恢复中断时，第一反应是重新开始，其实完全没必要。

RMAN 的断点续传机制相当可靠，这个功能从 Oracle 9i 开始就有了，但真正用过的人不多。原理很简单：RMAN 会检查目标文件的 header 信息和备份集的元数据，判断哪些数据文件已经完整恢复。

对于刚接触 Oracle 的朋友，遇到大型数据库恢复中断不要慌。RMAN 比你想象中聪明，相信它的断点续传能力。这个机制在企业级应用中经过了无数次验证，稳定性和可靠性都没问题。

当然，预防永远比补救重要。恢复前的规划和检查，远比事后的补救措施来得有效。


