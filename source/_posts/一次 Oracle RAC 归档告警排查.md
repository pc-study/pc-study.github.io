---
title: 一次 Oracle RAC 归档告警排查
date: 2026-03-04 10:23:11
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2029005194634797056
---

今天早上收到监控告警，一套 **Oracle RAC 数据库** 的 `alert log` 出现了如下报错：

```bash
2026-03-04T07:05:54.675143+08:00
ORA-19504: failed to create file "+ARCH"
ORA-17502: ksfdcre:4 Failed to create file +ARCH
ORA-15041: diskgroup "ARCH" space exhausted
ARC1 (PID:243419): Error 19504 Creating archive log file to '+ARCH'
ARC1 (PID:243419): Stuck archiver: insufficient local LADs
ARC1 (PID:243419): Stuck archiver condition declared
```

从报错来看，ARC 归档进程在向 `+ARCH` 磁盘组写归档日志时失败，提示磁盘组空间耗尽。

这种问题如果持续存在，会导致归档日志无法生成，而数据库又在不断产生 redo，最终可能影响日志切换，严重时甚至可能把库拖挂，所以需要尽快确认情况。

第一反应肯定是：**归档盘是不是满了**。

于是登录 ASM 看了一下磁盘组状态：

```bash
[grid@orcl01:/home/grid]$ asmcmd lsdg
State    Type    Rebal  Sector  Logical_Sector  Block       AU  Total_MB  Free_MB  Req_mir_free_MB  Usable_file_MB  Offline_disks  Voting_files  Name
MOUNTED  EXTERN  N         512             512   4096  4194304   2097152   409248                0          409248              0             N  ARCH/
```

结果发现 `ARCH` 磁盘组竟然还有 **400GB 多的可用空间**。

看到这里其实有点疑惑：alert log 里明明报的是 **diskgroup space exhausted**，但现在看空间又很充足。

遇到这种情况，一般不会直接认为报错有问题，而是要考虑另一种可能：**磁盘组在某个时间点确实被写满过，但后来空间被释放了。**

再看了一下 alert 报错的时间：**07:05**，这个时间点让我想到一个东西——是不是有 **归档清理任务**。

于是上服务器看了一下 crontab：

```bash
[oracle@orcl01:/home/grid]$ crontab -l
00 07 * * * /home/oracle/scripts/del_arch.sh
```

果然，每天 **07:00** 会执行一个归档删除脚本。继续翻了一下删除日志，发现当天确实删掉了一批归档：

```bash
archived log file name=+ARCH/ORCL/ARCHIVELOG/2026_03_01/thread_2_seq_26666.1851.1226732779
deleted archived log
archived log file name=+ARCH/ORCL/ARCHIVELOG/2026_03_01/thread_2_seq_26667.6173.1226732827
Deleted 1246 objects
```

这次一共删除了 **1246 个归档日志文件**。

看到这里基本就明白了，再结合昨天发生的一件事情，整个过程就串起来了。

昨天发现这套库有两个 **DELETE JOB** 同时执行，结果把 **UNDO 表空间耗尽了**。这种大批量 DELETE 会产生大量 redo，自然也会带来大量归档日志。
```sql
set lines 200
col day for a12

SELECT
    to_char(completion_time,'yyyy-mm-dd') AS day,
    COUNT(*)                              AS arch_count,
    ROUND(SUM(blocks*block_size)/1024/1024/1024,2) AS arch_gb
FROM v$archived_log
WHERE completion_time >= SYSDATE - 30
GROUP BY to_char(completion_time,'yyyy-mm-dd')
ORDER BY 1;

DAY          ARCH_COUNT    ARCH_GB
------------ ---------- ----------
2026-02-28         1380     475.52
2026-03-01         1428     489.35
2026-03-02         1891     656.68
2026-03-03         1425     487.18
2026-03-04          401        125
```
当时主要精力都在处理 UNDO 问题，没有继续关注归档日志的增长情况。

结果就是：

* 夜间业务持续产生大量 redo；
* 归档日志快速增长；
* `+ARCH` 磁盘组被写满；
* ARC 归档失败，alert 开始报 `ORA-15041`；

随后归档进程进入 **Stuck archiver** 状态。

到了早上 **07:00**，归档清理脚本执行，删除了一批历史归档，磁盘空间重新释放。所以我登录 ASM 时看到的，其实已经是 **清理之后的状态**。

整个过程大致就是：

1. 夜间业务产生大量 redo；
2. 归档日志持续增长；
3. 归档磁盘组被写满；
4. ARC 归档失败并产生告警；
5. 07:00 清理任务删除归档；
6. 磁盘空间恢复正常；

这类问题在生产环境其实并不少见。

如果归档磁盘组被写满，而数据库又持续产生 redo，归档进程无法工作，后面就可能影响日志切换，严重时甚至会导致数据库 hang。

这次也算是一个提醒：以后遇到 **大事务或者批量 DELETE / UPDATE** 的情况，除了关注 UNDO，还要顺带看看 **redo 和归档增长情况**，否则归档日志很容易在短时间内把磁盘打满。