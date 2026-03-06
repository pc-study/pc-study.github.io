---
title: [译] Oracle 21c PDB 快照轮播
date: 2022-03-07 10:03:56
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/337645
---

>原文地址：[https://blog.dbi-services.com/pdb-snapshot-carousel-with-oracle-21c/](https://blog.dbi-services.com/pdb-snapshot-carousel-with-oracle-21c/)
原文作者：Mouhamadou Diaw


在作者之前的 [Managing Refreshable Clone Pluggable Databases with Oracle 21c](https://blog.dbi-services.com/managing-refreshable-clone-pluggable-databases-with-oracle-21c/) 文章中谈到了可刷新 PDB 技术，该技术可用于刷新目标 PDB。

在 [Pluggable Database Snapshots with Oracle 21c](https://blog.dbi-services.com/pluggable-database-snapshots-with-oracle-21c/) 文章中可以看到如何将目标可刷新 PDB 用作主库来提供 PDB 快照。

本文作者将继续讨论 PDB 快照并讨论 PDB 快照轮播功能，作为一个 PDB 快照库，它包括为给定的 PDB 自动或手动生成一定数量的快照。源 PDB 可以是普通 PDB 或可刷新的 PDB。

参考 [官方文档](https://docs.oracle.com/en/database/oracle/oracle-database/21/multi/administering-pdb-snapshots.html#GUID-FF6DF540-0C22-451C-80B3-1ACA8C8CB7D2/) 中所述，PDB 快照轮播可用于维护作为 PITR 和克隆的最新 PDB 副本库。

此功能仅适用于以下版本 [ [官方文档](https://docs.oracle.com/en/database/oracle/oracle-database/21/dblic/Licensing-Information.html#GUID-0F9EB85D-4610-4EDF-89C2-4916A0E7AC87) ]：

- EE-ES 集成系统上的 Oracle 数据库企业版
- DBCS EE Oracle 数据库云服务企业版
- DBCS EE-HP Oracle 数据库云服务企业版 – 高性能
- DBCS EE-EP Oracle 数据库云服务企业版 – 极致性能
- ExaCS Oracle 数据库 Exadata 云服务
- ExaCC Oracle 数据库 Exadata Cloud@Customer

但是，如果您没有这样的环境，您可以将以下参数 "_exadata_feature_on" 设置为 `TRUE` 进行测试。

首先，我们设置 `PDB1FRES` 作为快照的来源，当配置 PDB 快照轮播时，可以为每个定义的时间间隔自动生成一个快照，可以创建的最大快照数由 `CDB_PROPERTIES` 中的 `MAX_PDB_SNAPSHOTS` 定义。

快照数默认值为 8 并且是最大值：
```sql
SQL> col PROPERTY_NAME for a40
SQL> col PROPERTY_VALUE for a40
SQL> set lines 150
SQL> select PROPERTY_NAME,PROPERTY_VALUE from cdb_properties where property_name='MAX_PDB_SNAPSHOTS';
 
PROPERTY_NAME                            PROPERTY_VALUE
---------------------------------------- ----------------------------------------
MAX_PDB_SNAPSHOTS                        8
 
SQL>
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20220307-a585d31a-46c2-4af0-aad8-717a7678f345.png)

`MAX PDB SNAPSHOTS` 可以使用以下命令配置：
```sql
ALTER PLUGGABLE DATABASE SET MAX_PDB_SNAPSHOTS = 5;
```
在此次测试中，我们将最大值设置为默认值，并将 PDB1FRES 配置为每 2 分钟生成一次快照，我们只需运行以下命令：
```sql
SQL> show pdbs;
 
    CON_ID CON_NAME                       OPEN MODE  RESTRICTED
---------- ------------------------------ ---------- ----------
         2 PDB$SEED                       READ ONLY  NO
         4 PDB1FRES                       READ ONLY  NO
 
SQL> alter session set container=PDB1FRES;
 
Session altered.
 
SQL> show pdbs;
 
    CON_ID CON_NAME                       OPEN MODE  RESTRICTED
---------- ------------------------------ ---------- ----------
         4 PDB1FRES                       READ ONLY  NO
 
SQL> ALTER PLUGGABLE DATABASE PDB1FRES SNAPSHOT MODE EVERY 2  MINUTES;
 
Pluggable database altered.
 
SQL>

SQL> SELECT SNAPSHOT_MODE, SNAPSHOT_INTERVAL FROM   DBA_PDBS;
 
SNAPSH SNAPSHOT_INTERVAL
------ -----------------
AUTO                   2
```
SNAPSHOT MODE 也可以设置为 MANUAL 或 NONE，但是我们不可以使用命令 `CREATE PLUGGABLE DATABASE` 创建一个每 2 分钟拍摄一次快照的新 PDB。

通过查询 `DBA_PDB_SNAPSHOTS` 视图，我们可以看到正在自动生成的快照信息：
```sql
SQL> SELECT  CON_NAME, SNAPSHOT_NAME, scn_to_timestamp(snapshot_scn) as snaptime , SNAPSHOT_SCN  FROM  DBA_PDB_SNAPSHOTS ORDER BY SNAPSHOT_SCN;
 
CON_NAME  SNAPSHOT_NAME             SNAPTIME                            SNAPSHOT_SCN
--------- ------------------------- ----------------------------------- ------------
PDB1FRES  SNAP_745266373_1097421048 23-FEB-22 03.10.53.000000000 PM         45436486
PDB1FRES  SNAP_745266373_1097421168 23-FEB-22 03.12.51.000000000 PM         45436585
PDB1FRES  SNAP_745266373_1097421287 23-FEB-22 03.14.50.000000000 PM         45436668
PDB1FRES  SNAP_745266373_1097421407 23-FEB-22 03.16.50.000000000 PM         45436751
PDB1FRES  SNAP_745266373_1097421527 23-FEB-22 03.18.49.000000000 PM         45436830
PDB1FRES  SNAP_745266373_1097421647 23-FEB-22 03.20.50.000000000 PM         45436905
PDB1FRES  SNAP_745266373_1097421767 23-FEB-22 03.22.50.000000000 PM         45437166
PDB1FRES  SNAP_745266373_1097421887 23-FEB-22 03.24.50.000000000 PM         45437249
 
8 rows selected.
 
SQL>
```
如果快照数达到最大 (8) 时会发生什么？数据库将删除最旧的快照，始终保持最多 8 个快照数：
```sql
SQL> SELECT  CON_NAME, SNAPSHOT_NAME, scn_to_timestamp(snapshot_scn) as snaptime , SNAPSHOT_SCN  FROM  DBA_PDB_SNAPSHOTS ORDER BY SNAPSHOT_SCN;
 
CON_NAME  SNAPSHOT_NAME             SNAPTIME                            SNAPSHOT_SCN
--------- ------------------------- ----------------------------------- ------------
PDB1FRES  SNAP_745266373_1097421168 23-FEB-22 03.12.51.000000000 PM         45436585
PDB1FRES  SNAP_745266373_1097421287 23-FEB-22 03.14.50.000000000 PM         45436668
PDB1FRES  SNAP_745266373_1097421407 23-FEB-22 03.16.50.000000000 PM         45436751
PDB1FRES  SNAP_745266373_1097421527 23-FEB-22 03.18.49.000000000 PM         45436830
PDB1FRES  SNAP_745266373_1097421647 23-FEB-22 03.20.50.000000000 PM         45436905
PDB1FRES  SNAP_745266373_1097421767 23-FEB-22 03.22.50.000000000 PM         45437166
PDB1FRES  SNAP_745266373_1097421887 23-FEB-22 03.24.50.000000000 PM         45437249
PDB1FRES  SNAP_745266373_1097422007 23-FEB-22 03.26.50.000000000 PM         45437336
```
使用 SHOW PDBS 命令无法看到快照 PDB 轮播：
```sql
SQL> show pdbs;
 
    CON_ID CON_NAME                       OPEN MODE  RESTRICTED
---------- ------------------------------ ---------- ----------
         2 PDB$SEED                       READ ONLY  NO
         4 PDB1FRES                       READ ONLY  NO
SQL>
```
现在我们有了快照，假设我们需要使用一个快照创建一个新的 PDB：
```sql
SQL> create pluggable database MYPDB from PDB1FRES using snapshot SNAP_745266373_1097421767;
 
Pluggable database created.
 
SQL> show pdbs;
 
    CON_ID CON_NAME                       OPEN MODE  RESTRICTED
---------- ------------------------------ ---------- ----------
         2 PDB$SEED                       READ ONLY  NO
         3 MYPDB                          MOUNTED
         4 PDB1FRES                       READ ONLY  NO
 
 
SQL> alter pluggable database MYPDB open;
 
Pluggable database altered.
 
SQL> show pdbs
 
    CON_ID CON_NAME                       OPEN MODE  RESTRICTED
---------- ------------------------------ ---------- ----------
         2 PDB$SEED                       READ ONLY  NO
         3 MYPDB                          READ WRITE NO
         4 PDB1FRES                       READ ONLY  NO
SQL>
```
要删除快照，只需使用命令：
```sql
SQL> alter pluggable database drop snapshot SNAP_745266373_1097422487;
```
要删除所有快照，我们可以在 [文档](https://docs.oracle.com/en/database/oracle/oracle-database/21/multi/administering-pdb-snapshots.html#GUID-82BCCB60-4A6F-4687-BD16-64A5FE767FB5) 中找到以下几行：
>要删除 PDB 快照轮播中的所有快照，请将“MAX_PDB_SNAPSHOTS”数据库属性设置为 0（零），如以下语句所示：
```sql
ALTER PLUGGABLE DATABASE SET MAX_PDB_SNAPSHOTS=0;
```
>这种技术比对每个快照执行 ALTER PLUGGABLE DATABASE ... DROP SNAPSHOT snapshot_name 更快。

禁用快照模式：
```sql
SQL> ALTER PLUGGABLE DATABASE PDB1FRES SNAPSHOT mode none;
 
Pluggable database altered.
 
SQL> SELECT SNAPSHOT_MODE, SNAPSHOT_INTERVAL FROM   DBA_PDBS;
 
SNAPSH SNAPSHOT_INTERVAL
------ -----------------
NONE
 
SQL>
```











