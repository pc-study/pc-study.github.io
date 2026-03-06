---
title: 这个 Oracle CDB BUG，建库后需要立即修复！
date: 2025-12-02 15:40:00
tags: [墨力计划,性能优化,oracle,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1995403091425435648
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)


# 前言

上周五，开发同事反馈某套 Oracle 数据库中，大量表的统计信息已有半年未自动收集，导致执行计划不准确，SQL 执行频繁出现问题，每次都需要手动收集统计信息，希望我能协助排查并解决这个问题。

本以为是一个常规问题，但排查过程中发现了不少问题点，最终定位到一个 Oracle 未发布的 BUG，过程颇为曲折。本文将详细分享整个问题的分析思路、排查步骤与解决方案，供大家参考。

# 问题描述

开始之前，我先说一下环境信息，这对问题分析比较重要。数据库环境为 **Oracle 19.3 RAC CDB 架构**，有一个从 NON-CDB 迁移而来的 PDB。

据同事反馈，该库的自动统计信息收集任务已停滞一段时间，检查其提供的一张表：

```sql
SQL> set line2222 pages1000
col TABLE_NAME for a40
col PARTITION_NAME for a30
SELECT TABLE_NAME, PARTITION_NAME, LAST_ANALYZED, NUM_ROWS, BLOCKS
  FROM DBA_TAB_STATISTICS
  WHERE TABLE_NAME = 'PLC_DC_CDO_NOPDAHIS_ZR';

TABLE_NAME                     PARTITION_NAME       LAST_ANALYZED         NUM_ROWS     BLOCKS
------------------------------ -------------------- ------------------- ---------- ----------
PLC_DC_CDO_NOPDAHIS_ZR                              2025/10/26 11:14:28  302641840    7886515
PLC_DC_CDO_NOPDAHIS_ZR         SYS_P54830
PLC_DC_CDO_NOPDAHIS_ZR         SYS_P58815
PLC_DC_CDO_NOPDAHIS_ZR         SYS_P59994
...（部分分区信息省略）
PLC_DC_CDO_NOPDAHIS_ZR         PART_T01             2025/08/16 10:37:03          0          0
```

其中 `2025/10/26` 的统计信息是手动收集的，上一次自动收集则要追溯到 `2025/08/16`，确实已间隔很久。

# 问题分析

接下来，我根据我的实际排查思路进行复盘。

**注意**：在 CDB 架构下，PDB 的统计信息收集任务是独立的，因此所有检查都需在 PDB 下进行。

## 检查任务状态

首先确认自动统计信息收集功能是否开启：

```sql
SQL> SELECT CLIENT_NAME, STATUS
FROM DBA_AUTOTASK_CLIENT
WHERE CLIENT_NAME = 'auto optimizer stats collection';

CLIENT_NAME                                                      STATUS
---------------------------------------------------------------- --------
auto optimizer stats collection                                  ENABLED
```

任务状态显示为启用，正常。

## 检查任务窗口

查看统计信息收集任务对应的调度窗口组：

```sql
SQL> SELECT
      CLIENT_NAME,
      WINDOW_GROUP
  FROM DBA_AUTOTASK_CLIENT
  WHERE CLIENT_NAME = 'auto optimizer stats collection';

CLIENT_NAME                              WINDOW_GROUP
---------------------------------------- ------------------------------
auto optimizer stats collection          ORA$AT_WGRP_OS
```

查看 `ORA$AT_WGRP_OS` 窗口组包含的具体时间窗口：

```sql
SQL> select * from dba_scheduler_wingroup_members where window_group_name='ORA$AT_WGRP_OS';

WINDOW_GROUP_NAME              WINDOW_NAME
------------------------------ ------------------------------
ORA$AT_WGRP_OS                 MONDAY_WINDOW
ORA$AT_WGRP_OS                 TUESDAY_WINDOW
ORA$AT_WGRP_OS                 WEDNESDAY_WINDOW
ORA$AT_WGRP_OS                 THURSDAY_WINDOW
ORA$AT_WGRP_OS                 FRIDAY_WINDOW
ORA$AT_WGRP_OS                 SATURDAY_WINDOW
ORA$AT_WGRP_OS                 SUNDAY_WINDOW
```

窗口配置正常，按天执行。

## 检查任务执行情况

检查近 30 天的任务执行历史：

```sql
SQL> SELECT
      WINDOW_NAME,
      JOB_NAME,
      JOB_STATUS,
      JOB_START_TIME,
      JOB_DURATION,
      JOB_INFO
  FROM DBA_AUTOTASK_JOB_HISTORY
  WHERE CLIENT_NAME = 'auto optimizer stats collection'
    AND JOB_START_TIME >= SYSDATE - 30
  ORDER BY JOB_START_TIME DESC;

WINDOW_NAME          JOB_NAME                       JOB_STATUS JOB_START_TIME                      JOB_DURATION         JOB_INFO
-------------------- ------------------------------ ---------- ----------------------------------- -------------------- ----------------------------------------------------------------------------------------------------
SUNDAY_WINDOW        ORA$AT_OS_OPT_SY_2061          STOPPED    24-NOV-25 12.00.12.228566 AM PRC    +000 01:59:48        REASON="Stop job called because associated window was closed"
SUNDAY_WINDOW        ORA$AT_OS_OPT_SY_2041          STOPPED    17-NOV-25 12.00.11.518845 AM PRC    +000 01:59:49        REASON="Stop job called because associated window was closed"
SUNDAY_WINDOW        ORA$AT_OS_OPT_SY_2021          STOPPED    10-NOV-25 12.00.13.109201 AM PRC    +000 01:59:47        REASON="Stop job called because associated window was closed"
SUNDAY_WINDOW        ORA$AT_OS_OPT_SY_2001          STOPPED    03-NOV-25 12.00.11.134075 AM PRC    +000 01:59:49        REASON="Stop job called because associated window was closed"
```

历史记录显示，仅**周日窗口**有执行记录，且状态为“STOPPED”，其余窗口均无运行记录。**这是否意味着其他窗口被禁用了？**

## 检查启用的窗口

进一步查看已启用统计信息收集的窗口详情：

```sql
SQL> SELECT W.WINDOW_NAME,
       W.REPEAT_INTERVAL,
       W.DURATION,
       W.NEXT_START_DATE,
       W.LAST_START_DATE,
       W.ENABLED
  FROM DBA_AUTOTASK_WINDOW_CLIENTS C, DBA_SCHEDULER_WINDOWS W
 WHERE C.WINDOW_NAME = W.WINDOW_NAME
   AND C.OPTIMIZER_STATS = 'ENABLED';

WINDOW_NAME          REPEAT_INTERVAL                                                        DURATION        NEXT_START_DATE                      LAST_START_DATE                      ENABL
-------------------- ---------------------------------------------------------------------- --------------- ------------------------------------ ------------------------------------ -----
MONDAY_WINDOW        freq=daily;byday=MON;byhour=22;byminute=0;bysecond=0                   +000 04:00:00   01-DEC-25 10.00.00.000000 PM PRC     11-AUG-25 10.00.00.022088 PM PST8PDT TRUE
TUESDAY_WINDOW       freq=daily;byday=TUE;byhour=22;byminute=0;bysecond=0                   +000 04:00:00   02-DEC-25 10.00.00.000000 PM PRC     12-AUG-25 10.00.00.030151 PM PST8PDT TRUE
WEDNESDAY_WINDOW     freq=daily;byday=WED;byhour=22;byminute=0;bysecond=0                   +000 04:00:00   03-DEC-25 10.00.00.000000 PM PRC     13-AUG-25 10.00.00.142106 PM PST8PDT TRUE
THURSDAY_WINDOW      freq=daily;byday=THU;byhour=22;byminute=0;bysecond=0                   +000 04:00:00   04-DEC-25 10.00.00.000000 PM PRC     14-AUG-25 10.00.00.102161 PM PST8PDT TRUE
FRIDAY_WINDOW        freq=daily;byday=FRI;byhour=22;byminute=0;bysecond=0                   +000 04:00:00   28-NOV-25 10.00.00.000000 PM PRC     15-AUG-25 10.00.00.166076 PM PST8PDT TRUE
SATURDAY_WINDOW      freq=daily;byday=SAT;byhour=6;byminute=0;bysecond=0                    +000 20:00:00   29-NOV-25 06.00.00.000000 AM PRC     09-AUG-25 06.00.00.070181 AM PST8PDT TRUE
SUNDAY_WINDOW        freq=daily;byday=SUN;byhour=6;byminute=0;bysecond=0                    +000 20:00:00   30-NOV-25 06.00.00.000000 AM PRC     23-NOV-25 11.59.58.070041 PM PRC     TRUE
WEEKEND_WINDOW       freq=daily;byday=SAT;byhour=0;byminute=0;bysecond=0                    +002 00:00:00   29-NOV-25 12.00.00.000000 AM PRC     22-NOV-25 05.59.58.174010 AM PRC     TRUE
WEEKNIGHT_WINDOW     freq=daily;byday=MON,TUE,WED,THU,FRI;byhour=22;byminute=0; bysecond=0  +000 08:00:00   28-NOV-25 10.00.00.000000 PM PRC     27-NOV-25 10.00.00.111627 PM PRC     TRUE
```

观察发现，启用的窗口包含以下几类：

1.  **工作日窗口**（MONDAY_WINDOW~FRIDAY_WINDOW）：22:00 开始，持续 4 小时。
2.  **周末窗口**（SATURDAY_WINDOW, SUNDAY_WINDOW）：06:00 开始，持续 20 小时。
3.  **WEEKEND_WINDOW**：周六 00:00 开始，持续 48 小时。
4.  **WEEKNIGHT_WINDOW**：周一到周五 22:00 开始，持续 8 小时。

正常情况下，不应出现 `WEEKEND_WINDOW` 和 `WEEKNIGHT_WINDOW`。这两个是什么窗口？检查其所属窗口组：

```sql
SQL> select * from dba_scheduler_wingroup_members where WINDOW_NAME in ('WEEKNIGHT_WINDOW','WEEKEND_WINDOW');

no rows selected
```

它们不属于任何窗口组。但关键发现是：**WEEKEND_WINDOW 覆盖了周末窗口，WEEKNIGHT_WINDOW 覆盖了工作日窗口！**

再观察各窗口的 `LAST_START_DATE`：

- 周六至周五的窗口（SATURDAY_WINDOW ~ FRIDAY_WINDOW）最后启动时间均为 **2025 年 8 月**，且时区为 **PST8PDT**。
- 周日窗口（SUNDAY_WINDOW）、WEEKEND_WINDOW、WEEKNIGHT_WINDOW 最后启动时间较新，且时区为 **PRC**。

这意味着自 **2025 年 8 月中旬**起，只有周日、WEEKEND、WEEKNIGHT 窗口在运行，其余窗口均未执行。

## 检查窗口执行历史

通过窗口历史验证上述结论：

```sql
SQL> select * from DBA_AUTOTASK_WINDOW_HISTORY order by WINDOW_START_TIME desc;

WINDOW_NAME          WINDOW_START_TIME                        WINDOW_END_TIME
-------------------- ---------------------------------------- -------------------------------------
WEEKNIGHT_WINDOW     27-NOV-25 10.00.00.462315 PM +08:00      28-NOV-25 06.00.00.059050 AM +08:00
WEEKNIGHT_WINDOW     26-NOV-25 10.00.00.175039 PM +08:00      27-NOV-25 06.00.00.093159 AM +08:00
WEEKNIGHT_WINDOW     25-NOV-25 10.00.00.182260 PM +08:00      26-NOV-25 06.00.00.123977 AM +08:00
WEEKNIGHT_WINDOW     24-NOV-25 10.00.00.248089 PM +08:00      25-NOV-25 06.00.00.083077 AM +08:00
SUNDAY_WINDOW        23-NOV-25 11.59.58.152753 PM +08:00      24-NOV-25 02.00.00.266551 AM +08:00
WEEKEND_WINDOW       22-NOV-25 05.59.58.207990 AM +08:00      23-NOV-25 11.59.58.084099 PM +08:00
WEEKNIGHT_WINDOW     21-NOV-25 10.00.00.268361 PM +08:00      22-NOV-25 05.59.58.179604 AM +08:00
WEEKNIGHT_WINDOW     20-NOV-25 10.00.00.196818 PM +08:00      21-NOV-25 06.00.00.042041 AM +08:00
WEEKNIGHT_WINDOW     19-NOV-25 10.00.00.279480 PM +08:00      20-NOV-25 06.00.00.202939 AM +08:00
WEEKNIGHT_WINDOW     18-NOV-25 10.00.00.226061 PM +08:00      19-NOV-25 06.00.00.095200 AM +08:00
WEEKNIGHT_WINDOW     17-NOV-25 10.00.00.208560 PM +08:00      18-NOV-25 06.00.00.097892 AM +08:00
```

历史记录证实，只有 SUNDAY_WINDOW、WEEKEND_WINDOW 和 WEEKNIGHT_WINDOW 在正常运行。**WEEKEND 和 WEEKNIGHT 窗口的启用，导致原有的工作日和周末窗口被覆盖而无法执行。**

## WEEKEND 和 WEEKNIGHT 窗口分析

通过查阅 MOS 文档 **IF:11g Autotask Jobs Are Not Running as Scheduled. (Doc ID 2084941.1)** 得知：

> `WEEKNIGHT_WINDOW` 和 `WEEKEND_WINDOW` 是 **Oracle 10g 时期使用的调度窗口**，高版本虽保留但不建议使用。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251202-1995716410367107072_395407.png)

检查当前 PDB 中这两个窗口的状态：

```sql
SQL> select window_name, enabled from dba_scheduler_windows where window_name in ('WEEKNIGHT_WINDOW','WEEKEND_WINDOW');

WINDOW_NAME                    ENABLED
------------------------------ ----------
WEEKNIGHT_WINDOW               TRUE
WEEKEND_WINDOW                 TRUE
```

查询显示为 `TRUE`，这就是为什么统计信息收集任务的窗口没有正常执行的根本原因。

解决方法很简单，直接禁用这两个窗口：

```sql
SQL> exec dbms_scheduler.disable('WEEKNIGHT_WINDOW');
exec dbms_scheduler.disable('WEEKEND_WINDOW');
```

周五禁用后，周一检查窗口状态，周五、周六、周日的窗口已恢复正常执行：

```sql
WINDOW_NAME          REPEAT_INTERVAL                                              DURATION             NEXT_START_DATE                     LAST_START_DATE                      ENABL
-------------------- ------------------------------------------------------------ -------------------- ----------------------------------- ------------------------------------ -----
MONDAY_WINDOW        freq=daily;byday=MON;byhour=22;byminute=0;bysecond=0         +000 04:00:00        01-DEC-25 10.00.00.000000 PM PRC    11-AUG-25 10.00.00.022088 PM PST8PDT TRUE
TUESDAY_WINDOW       freq=daily;byday=TUE;byhour=22;byminute=0;bysecond=0         +000 04:00:00        02-DEC-25 10.00.00.000000 PM PRC    12-AUG-25 10.00.00.030151 PM PST8PDT TRUE
WEDNESDAY_WINDOW     freq=daily;byday=WED;byhour=22;byminute=0;bysecond=0         +000 04:00:00        03-DEC-25 10.00.00.000000 PM PRC    13-AUG-25 10.00.00.142106 PM PST8PDT TRUE
THURSDAY_WINDOW      freq=daily;byday=THU;byhour=22;byminute=0;bysecond=0         +000 04:00:00        04-DEC-25 10.00.00.000000 PM PRC    14-AUG-25 10.00.00.102161 PM PST8PDT TRUE
FRIDAY_WINDOW        freq=daily;byday=FRI;byhour=22;byminute=0;bysecond=0         +000 04:00:00        05-DEC-25 10.00.00.000000 PM PRC    28-NOV-25 10.00.00.021661 PM PRC     TRUE
SATURDAY_WINDOW      freq=daily;byday=SAT;byhour=6;byminute=0;bysecond=0          +000 20:00:00        06-DEC-25 06.00.00.000000 AM PRC    29-NOV-25 06.00.00.069636 AM PRC     TRUE
SUNDAY_WINDOW        freq=daily;byday=SUN;byhour=6;byminute=0;bysecond=0          +000 20:00:00        07-DEC-25 06.00.00.000000 AM PRC    30-NOV-25 06.00.00.087849 AM PRC     TRUE
```

## 时区问题分析

窗口执行的问题已经解决了，但是时区的问题还是比较困惑，所以继续分析了一下时区的问题。

### MOS 文档参考

关于时区问题，我查阅 MOS 之后发现了一个相关的文档：**Default Scheduler Timezone Value In PDB\$SEED Different Than CDB (Doc ID 2702230.1)**

文档中提到：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251202-1995682355630137344_395407.png)

**结论**：使用 `DBCA General` 模式创建的 CDB 数据库，其 `PDB$SEED` 的默认 Scheduler 时区独立于 `CDB$ROOT`，具体规则为：

- **12C & 18C**：`Etc/UTC`
- **19C**：`PST8PDT`

若使用 `CREATE DATABASE` 命令或 `DBCA 自定义（customize）` 模式创建，则无此问题，`PDB$SEED` 会继承 `CDB$ROOT` 的 Scheduler 时区。

### 环境时区检查

检查当前环境的时区设置：

```sql
-- CDB$ROOT 时区
SQL> select * from cdb_scheduler_global_attribute where ATTRIBUTE_NAME like '%TIMEZONE%';

ATTRIBUTE_NAME                 VALUE
------------------------------ ----------
DEFAULT_TIMEZONE               PRC

-- PDB$SEED 时区
SQL> alter session set container=PDB$SEED;
SQL> select * from dba_scheduler_global_attribute where ATTRIBUTE_NAME like '%TIMEZONE%';

ATTRIBUTE_NAME                 VALUE
------------------------------ ------------------------------
DEFAULT_TIMEZONE               PST8PDT

-- 用户 PDB 时区
SQL> alter session set container=RPTDB;
SQL> select * from dba_scheduler_global_attribute where ATTRIBUTE_NAME like '%TIMEZONE%';

ATTRIBUTE_NAME                 VALUE
------------------------------ ----------
DEFAULT_TIMEZONE               PRC
```

可以发现，`PDB$SEED` 的 Scheduler 时区为 `PST8PDT`（符合上述 BUG 描述），用户 PDB 的 Scheduler 时区为 `PRC`（推测为人为修改过）。

### 实战验证

通过创建测试 PDB 验证时区继承行为：

```sql
-- 从 PDB$SEED 创建一个测试 PDB
SQL> create pluggable database test admin user admin identified by oracle;
SQL> alter pluggable database test open;
SQL> alter session set container=TEST;

-- 检查新建 PDB 的 scheduler 时区
SQL> select * from dba_scheduler_global_attribute where ATTRIBUTE_NAME like '%TIMEZONE%';

ATTRIBUTE_NAME                 VALUE
------------------------------ ----------
DEFAULT_TIMEZONE               PST8PDT
```

**结论**：在不人为干预的情况下，新建 PDB 会从 `PDB$SEED` 继承 `PST8PDT` 时区。

查看自动任务优化器统计信息收集所使用的窗口时间：

```sql
SQL> SELECT W.WINDOW_NAME,
       W.REPEAT_INTERVAL,
       W.DURATION,
       W.NEXT_START_DATE,
       W.LAST_START_DATE,
       W.ENABLED
  FROM DBA_AUTOTASK_WINDOW_CLIENTS C, DBA_SCHEDULER_WINDOWS W
 WHERE C.WINDOW_NAME = W.WINDOW_NAME
   AND C.OPTIMIZER_STATS = 'ENABLED';

WINDOW_NAME
REPEAT_INTERVAL                                                        DURATION        NEXT_START_DATE                      LAST_START_DATE           ENABL
-------------------- ---------------------------------------------------------------------- --------------- ------------------------------------ ------------------------- -----
SATURDAY_WINDOW      freq=daily;byday=SAT;byhour=6;byminute=0; bysecond=0                   +000 20:00:00   06-DEC-25 06.00.00.000000 AM PST8PDT                           TRUE
MONDAY_WINDOW        freq=daily;byday=MON;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   01-DEC-25 10.00.00.000000 PM PST8PDT                           TRUE
FRIDAY_WINDOW        freq=daily;byday=FRI;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   05-DEC-25 10.00.00.000000 PM PST8PDT                           TRUE
WEDNESDAY_WINDOW     freq=daily;byday=WED;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   03-DEC-25 10.00.00.000000 PM PST8PDT                           TRUE
TUESDAY_WINDOW       freq=daily;byday=TUE;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   02-DEC-25 10.00.00.000000 PM PST8PDT                           TRUE
SUNDAY_WINDOW        freq=daily;byday=SUN;byhour=6;byminute=0; bysecond=0                   +000 20:00:00   07-DEC-25 06.00.00.000000 AM PST8PDT                           TRUE
THURSDAY_WINDOW      freq=daily;byday=THU;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   04-DEC-25 10.00.00.000000 PM PST8PDT                           TRUE
```

可以发现，`NEXT_START_DATE` 字段显示的是 `PST8PDT`，也就是说从 `PDB$SEED` 继承过来的默认时区是 `PST8PDT`（太平洋时间）。此时，如果默认不修改时区，自动任务优化器统计信息收集会在太平洋时间的晚上 10 点和早上 6 点运行，这显然是错误的。

修复这个问题，可手动修改 PDB 的 scheduler 时区：

```sql
-- 切换到 TEST PDB
SQL> alter session set container=TEST;

Session altered.

-- 调整 TEST PDB 的 scheduler 时区为 PRC
SQL> EXEC DBMS_SCHEDULER.SET_SCHEDULER_ATTRIBUTE('default_timezone', 'PRC');

PL/SQL procedure successfully completed.

-- 修改后检查 TEST PDB 的 scheduler 时区
SQL> select * from dba_scheduler_global_attribute where ATTRIBUTE_NAME like '%TIMEZONE%';

ATTRIBUTE_NAME                 VALUE
------------------------------ ----------
DEFAULT_TIMEZONE               PRC
```

修改后，自动任务窗口的 `NEXT_START_DATE` 将更新为 `PRC` 时区下的正确时间。

再次检查自动任务优化器统计信息收集所使用的窗口时间：

```sql
SQL> SELECT W.WINDOW_NAME,
       W.REPEAT_INTERVAL,
       W.DURATION,
       W.NEXT_START_DATE,
       W.LAST_START_DATE,
       W.ENABLED
  FROM DBA_AUTOTASK_WINDOW_CLIENTS C, DBA_SCHEDULER_WINDOWS W
 WHERE C.WINDOW_NAME = W.WINDOW_NAME
   AND C.OPTIMIZER_STATS = 'ENABLED';

WINDOW_NAME          REPEAT_INTERVAL                                                        DURATION        NEXT_START_DATE                      LAST_START_DATE           ENABL
-------------------- ---------------------------------------------------------------------- --------------- ------------------------------------ ------------------------- -----
SATURDAY_WINDOW      freq=daily;byday=SAT;byhour=6;byminute=0; bysecond=0                   +000 20:00:00   06-DEC-25 06.00.00.000000 AM PRC                               TRUE
MONDAY_WINDOW        freq=daily;byday=MON;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   08-DEC-25 10.00.00.000000 PM PRC                               TRUE
FRIDAY_WINDOW        freq=daily;byday=FRI;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   05-DEC-25 10.00.00.000000 PM PRC                               TRUE
WEDNESDAY_WINDOW     freq=daily;byday=WED;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   03-DEC-25 10.00.00.000000 PM PRC                               TRUE
TUESDAY_WINDOW       freq=daily;byday=TUE;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   02-DEC-25 10.00.00.000000 PM PRC                               TRUE
SUNDAY_WINDOW        freq=daily;byday=SUN;byhour=6;byminute=0; bysecond=0                   +000 20:00:00   07-DEC-25 06.00.00.000000 AM PRC                               TRUE
THURSDAY_WINDOW      freq=daily;byday=THU;byhour=22;byminute=0; bysecond=0                  +000 04:00:00   04-DEC-25 10.00.00.000000 PM PRC                               TRUE
```

修改完之后，`LAST_START_DATE` 字段显示已经修改为 `PRC` 了。

# 问题分析总结

基于以上排查，可以还原大致的**问题时间线**：

1.  目标 CDB 库通过 `DBCA General` 模式创建，导致 `PDB$SEED` 的 Scheduler 时区默认为 `PST8PDT`。
2.  原 NON-CDB 库通过 `DBMS_PDB.DESCRIBE` 方式迁移，作为 PDB 插入该 CDB。此过程会基于 `PDB$SEED` 创建 PDB 的元数据，因此继承了 `PST8PDT` 时区。
3.  迁移完成后，PDB 运行一段时间，DBA 发现统计信息收集任务执行时间（显示为太平洋时间）与实际不符。
4.  **可能为了解决时间问题，启用了 `WEEKEND_WINDOW` 和 `WEEKNIGHT_WINDOW` 这两个窗口。**
5.  DBA 后面发现了时区问题，手动将 PDB 的 Scheduler 时区修改为 `PRC`。
6.  **但未禁用 `WEEKEND_WINDOW` 和 `WEEKNIGHT_WINDOW` 窗口**，导致这两个窗口覆盖了原有的周一至周六窗口，致使统计信息收集任务长期无法在正确时间触发。

# 解决方案

目前这个时区 BUG 尚未被 Oracle 正式发布修复。建议针对所有使用 CDB 架构的数据库进行检查：

```sql
SQL> alter session set container=MES;

Session altered.

SQL> select * from dba_scheduler_global_attribute where ATTRIBUTE_NAME like '%TIMEZONE%';

ATTRIBUTE_NAME       VALUE
-------------------- ----------
DEFAULT_TIMEZONE     PST8PDT

SQL> SELECT W.WINDOW_NAME,
       W.REPEAT_INTERVAL,
       W.DURATION,
       W.NEXT_START_DATE,
       W.LAST_START_DATE,
       W.ENABLED
  FROM DBA_AUTOTASK_WINDOW_CLIENTS C, DBA_SCHEDULER_WINDOWS W
 WHERE C.WINDOW_NAME = W.WINDOW_NAME
   AND C.OPTIMIZER_STATS = 'ENABLED';

WINDOW_NAME          REPEAT_INTERVAL                                              DURATION        NEXT_START_DATE                      LAST_START_DATE                      ENABL
-------------------- ------------------------------------------------------------ --------------- ------------------------------------ ------------------------------------ -----
MONDAY_WINDOW        freq=daily;byday=MON;byhour=22;byminute=0; bysecond=0        +000 04:00:00   01-DEC-25 10.00.00.000000 PM PST8PDT 24-NOV-25 10.00.00.110249 PM PST8PDT TRUE
TUESDAY_WINDOW       freq=daily;byday=TUE;byhour=22;byminute=0; bysecond=0        +000 04:00:00   02-DEC-25 10.00.00.000000 PM PST8PDT 25-NOV-25 10.00.00.166222 PM PST8PDT TRUE
WEDNESDAY_WINDOW     freq=daily;byday=WED;byhour=22;byminute=0; bysecond=0        +000 04:00:00   03-DEC-25 10.00.00.000000 PM PST8PDT 26-NOV-25 10.00.00.158350 PM PST8PDT TRUE
THURSDAY_WINDOW      freq=daily;byday=THU;byhour=22;byminute=0; bysecond=0        +000 04:00:00   04-DEC-25 10.00.00.000000 PM PST8PDT 27-NOV-25 10.00.00.022223 PM PST8PDT TRUE
FRIDAY_WINDOW        freq=daily;byday=FRI;byhour=22;byminute=0; bysecond=0        +000 04:00:00   05-DEC-25 10.00.00.000000 PM PST8PDT 28-NOV-25 10.00.00.030350 PM PST8PDT TRUE
SATURDAY_WINDOW      freq=daily;byday=SAT;byhour=6;byminute=0; bysecond=0         +000 20:00:00   06-DEC-25 06.00.00.000000 AM PST8PDT 29-NOV-25 06.00.00.126232 AM PST8PDT TRUE
SUNDAY_WINDOW        freq=daily;byday=SUN;byhour=6;byminute=0; bysecond=0         +000 20:00:00   07-DEC-25 06.00.00.000000 AM PST8PDT 30-NOV-25 06.00.00.206237 AM PST8PDT TRUE
```

这个问题的解决方案，上面分析过程中其实已经提供了：

```sql
-- 禁用 10g 版本的 WEEKEND 和 WEEKNIGHT 窗口
SQL> exec dbms_scheduler.disable('WEEKNIGHT_WINDOW');
exec dbms_scheduler.disable('WEEKEND_WINDOW');

-- 修改 PDB 时区为 PRC
SQL> EXEC DBMS_SCHEDULER.SET_SCHEDULER_ATTRIBUTE('default_timezone', 'PRC');

PL/SQL procedure successfully completed.
```

执行完之后，窗口的 `NEXT_START_DATE` 已经更新为正确的了：

```sql
WINDOW_NAME          REPEAT_INTERVAL                                              DURATION        NEXT_START_DATE                      LAST_START_DATE                      ENABL
-------------------- ------------------------------------------------------------ --------------- ------------------------------------ ------------------------------------ -----
MONDAY_WINDOW        freq=daily;byday=MON;byhour=22;byminute=0; bysecond=0        +000 04:00:00   08-DEC-25 10.00.00.000000 PM PRC     24-NOV-25 10.00.00.110249 PM PST8PDT TRUE
TUESDAY_WINDOW       freq=daily;byday=TUE;byhour=22;byminute=0; bysecond=0        +000 04:00:00   02-DEC-25 10.00.00.000000 PM PRC     25-NOV-25 10.00.00.166222 PM PST8PDT TRUE
WEDNESDAY_WINDOW     freq=daily;byday=WED;byhour=22;byminute=0; bysecond=0        +000 04:00:00   03-DEC-25 10.00.00.000000 PM PRC     26-NOV-25 10.00.00.158350 PM PST8PDT TRUE
THURSDAY_WINDOW      freq=daily;byday=THU;byhour=22;byminute=0; bysecond=0        +000 04:00:00   04-DEC-25 10.00.00.000000 PM PRC     27-NOV-25 10.00.00.022223 PM PST8PDT TRUE
FRIDAY_WINDOW        freq=daily;byday=FRI;byhour=22;byminute=0; bysecond=0        +000 04:00:00   05-DEC-25 10.00.00.000000 PM PRC     28-NOV-25 10.00.00.030350 PM PST8PDT TRUE
SATURDAY_WINDOW      freq=daily;byday=SAT;byhour=6;byminute=0; bysecond=0         +000 20:00:00   06-DEC-25 06.00.00.000000 AM PRC     29-NOV-25 06.00.00.126232 AM PST8PDT TRUE
SUNDAY_WINDOW        freq=daily;byday=SUN;byhour=6;byminute=0; bysecond=0         +000 20:00:00   07-DEC-25 06.00.00.000000 AM PRC     30-NOV-25 06.00.00.206237 AM PST8PDT TRUE
```

执行后，各窗口的 `NEXT_START_DATE` 将更新为 `PRC` 时区下的正确时间，`LAST_START_DATE` 将在下次窗口执行后同步更新。

# 拓展

统计信息收集任务虽然已经解决，但是由于接近半年没有收集统计信息，所以很多表收集会耗费很多时间，导致每天收集都会无法执行完成。

为了解决这个问题，可以将收集任务中时间大于 30 分钟的大表进行手动单独收集：

```sql
SQL> spool /tmp/dba_autotask_table30min.html
set markup html on
SELECT
target,
start_time,
end_time,
(end_time - start_time) AS elapsed_time, -- interval
(
EXTRACT(DAY FROM (end_time - start_time)) * 1440 +
EXTRACT(HOUR FROM (end_time - start_time)) * 60 +
EXTRACT(MINUTE FROM (end_time - start_time)) +
EXTRACT(SECOND FROM (end_time - start_time)) / 60
) AS elapsed_minutes,
notes
FROM dba_optstat_operation_tasks
WHERE end_time IS NOT NULL
AND (
EXTRACT(DAY FROM (end_time - start_time)) * 1440 +
EXTRACT(HOUR FROM (end_time - start_time)) * 60 +
EXTRACT(MINUTE FROM (end_time - start_time)) +
EXTRACT(SECOND FROM (end_time - start_time)) / 60
) > 30
ORDER BY start_time DESC;
spool off
set markup html off
```

使用以上命令可以获取统计信息运行超过 30 分钟的表，然后通过以下命令手动收集这些表：

```sql
SQL> exec dbms_stats.lock_table_stats('<OWNER>', '<TABLE_NAME>');
SQL> exec dbms_stats.gather_table_stats(ownname=>'<OWNER>',tabname =>'<TABLE_NAME>',estimate_percent =>DBMS_STATS.AUTO_SAMPLE_SIZE,method_opt => 'FOR ALL COLUMNS SIZE AUTO',cascade=>true, DEGREE=> DBMS_STATS.AUTO_DEGREE);
```

建议您可以先锁住它们，然后手动收集输出里每个表的统计信息。

# 写在最后

这个 BUG 表面上看只是时区显示问题，似乎不影响统计信息收集任务本身。但深入思考，**统计信息收集任务通常被安排在业务低峰期（如夜间）执行，以避免对生产系统造成性能冲击**。如果因时区错误导致任务实际在业务高峰期执行，极易引发严重的性能问题，影响生产环境的稳定运行。

因此，建议所有 Oracle CDB 用户检查 PDB 的 Scheduler 时区设置，防患于未然。

---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)