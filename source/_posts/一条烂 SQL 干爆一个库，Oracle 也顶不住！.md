---
title: 一条烂 SQL 干爆一个库，Oracle 也顶不住！
date: 2025-11-28 00:10:46
tags: [墨力计划,数据库实操,性能优化,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1993940358913417216
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)



# 前言

下午有开发同事反馈，一条原本执行时间在 1 秒以内的 SQL 突然延长至 16 秒，严重影响了产线业务的正常运行。经过我分析和优化之后，SQL 恢复正常，数据库性能提升 99.99%。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251128-1994076514758500352_395407.png)

本文将详细记录整个问题的定位过程、优化方法及相关思考。

# 问题分析

数据库环境为 Oracle 19C RAC CDB 架构（**运行了 6 个 PDB**），故障发生时间为 `2025.11.27 13:11:09.227`。

## SQL 分析

初步沟通后得知，开发人员通过应用日志监控到某条 SQL 执行时间显著增加，导致接口超时，进而影响业务流程。

首先，通过 SQLID `3jm7s0g3w2px0` 获取该 SQL 的 AWR SQL 报告（awrsqrpt）。当然，也可以使用 `dbms_xplan.display_cursor` 来获取执行计划：

```sql
SELECT * FROM TABLE(dbms_xplan.display_cursor('3jm7s0g3w2px0', NULL));
```

通过 AWR SQL 报告分析，可以发现该 SQL 存在两个执行计划：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1993942802959523840_395407.png)

**慢的执行计划**采用了全表扫描方式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1993946405682110464_395407.png)

从等待可以看出，SQL 执行时间主要消耗在 I/O 等待上：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994050444151316480_395407.png)

**快的执行计划**则使用了索引访问：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1993946512230014976_395407.png)

索引访问的 I/O 等待明显减少：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994050951528390656_395407.png)

基于经验判断，这很可能是由于执行计划选择错误导致的性能问题，解决方向是固定最优执行计划。

## 固定执行计划

可以使用 `coe_xfr_sql_profile` 脚本来固定执行计划：

```sql
-- 参数1：SQL_ID，参数2：需要绑定的执行计划哈希值
SQL> @coe_xfr_sql_profile 3jm7s0g3w2px0 1000005031
```

执行后会在当前目录生成 `coe_xfr_sql_profile_3jm7s0g3w2px0_1000005031.sql` 脚本，执行该脚本即可完成执行计划绑定：

```sql
SQL> @coe_xfr_sql_profile_3jm7s0g3w2px0_1000005031
```

验证绑定结果：

```sql
SQL> SET lines 222 PAGES 1000
COL name FOR a60
COL status FOR a10
COL type FOR a10
SELECT name, status, created, type FROM dba_sql_profiles;

NAME                                                         STATUS     CREATED                                                                     TYPE
------------------------------------------------------------ ---------- --------------------------------------------------------------------------- ----------
coe_3jm7s0g3w2px0_1000005031                                ENABLED    27-NOV-25 03.08.33.103163 PM                                                MANUAL
```

执行计划绑定后，开发反馈 SQL 执行速度恢复正常，接口不再超时，产线业务得以恢复。

## AWR 分析

虽然表面问题已解决，但我进一步采集了 AWR 报告进行深入分析，结果发现了更严重的性能问题。

报告采集时间范围为 60 分钟，DB Time 高达 `1,592.57` 分钟，平均活动会话数（Avg Active Sessions）达到 `23.6`，表明数据库在此期间承受了巨大的性能压力：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994056603075698688_395407.png)

Load Profile 显示每秒物理读达到 `121,964.1` 个块，Read I/O 吞吐量为 `952.8MB/s`，其中直接路径读（Direct Reads）占比超过 96%，达到 `934.242M/s`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994056768574545920_395407.png)

Top Event 中 `direct path read` 等待事件占比 63.5%，总等待时间 60,694 秒，平均每次等待 35.60 ms，远超 10ms 的健康标准：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994056928851992576_395407.png)

Time Model 分析显示 `sql execute elapsed time` 占 DB Time 的 98.33%，而 DB CPU 仅占 8.43%，进一步证实性能瓶颈主要在 I/O 等待：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994058393490366464_395407.png)

进一步分析发现，SQL ID 为 `08n0j9b7uw4pv` 的语句物理读高达 4.32 亿次，占总量的 98.12%，执行频繁且主要等待事件为直接路径读，表明该 SQL 对大表进行了大量全表扫描操作，是系统最主要的性能瓶颈：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994060573182074880_395407.png)

当 Oracle 在执行大表扫描时会自动启用直接路径读机制，以避免污染 Buffer Cache。但当该等待事件占比过高且平均延时超标时，则说明数据库中存在**高频执行的大表全表扫描 SQL**。

这个库的 SQL 得垃圾到什么程度啊，大量全表扫描直接读取磁盘，造成严重 I/O 压力。

该 SQL 的优化方案很简单：**为 WHERE 条件中的字段创建联合索引**。优化后的执行计划显示将使用索引范围扫描：

```sql
------------------------------------------------------------------------------------
| Id  | Operation         | Name           | Rows  | Bytes | Cost (%CPU)| Time     |
------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT  |                |     1 |    33 |     3   (0)| 00:00:01 |
|   1 |  SORT AGGREGATE   |                |     1 |    33 |            |          |
|*  2 |   INDEX RANGE SCAN| IDX_XXXXXX_XXX |     1 |    33 |     3   (0)| 00:00:01 |
------------------------------------------------------------------------------------
```

这个问题也就立刻解决了。

## sqlhc 分析

回到最初的问题 SQL，我们使用 sqlhc 工具进行深入分析：

```bash
$ sqlplus / as sysdba @sqlhc T '3jm7s0g3w2px0'
```

分析发现，慢的执行计划平均执行时间为 7.3s，明显比开发说的 16s 要低：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1993958920747556864_395407.png)

仔细观察可以发现，从 10:00 开始，该执行计划的执行时间从原来的 0.5s 左右激增至 198s 左右，且主要时间都消耗在 I/O 等待上，且 I/O 等待时间呈现逐渐增长趋势：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1993957447803953152_395407.png)

这表明最初 SQL 的性能下降并非单纯由于多个执行计划，而是受到了系统级 I/O 压力的间接影响。虽然该 SQL 本身存在多个执行计划也是一个问题，但根本原因在于系统中存在大量全表扫描操作导致的 I/O 资源竞争。

# 开发质疑

我将上述分析结果反馈给开发团队后，我建议优化全表扫描的 SQL，并为其增加合适的联合索引。然而，开发团队对此提出了几点质疑：

1. SQL 已经创建了索引，为什么优化器选择了全表扫描而非索引访问？
2. 应用日志明确提示是该 SQL 执行缓慢，应该就是该 SQL 本身的问题，与其他 SQL 无关。
3. SPC 库的 SQL 性能问题，为何会影响到 MES 库的 SQL 执行？

经过半小时的友好深入沟通，我逐一解释了这些问题：

- 对于第一点，说明了优化器选择执行计划是基于成本估算的，当统计信息不准确或索引选择性不足时，优化器可能误判成本而选择全表扫描。
- 对于第二点，解释了在共享资源的数据库环境中，一条高消耗的 SQL 可能影响整个系统的 I/O 性能，进而间接影响其他 SQL 的执行。
- 对于第三点，阐明了在 RAC CDB 环境中，所有 PDB 库共享存储资源，任何一个数据库的 SQL 导致的 I/O 压力都会影响到整个数据库。

最终，开发团队接受了我的建议。

# 问题解决

随后，我创建了联合索引之后，晚上抓了一个 AWR 报告看了下数据库性能：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994068583723393024_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994068719787122688_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251127-1994068810144505856_395407.png)

多么健康的数据库，那条 SQL 也早已从 Top SQL 中消失。所以，回到我们最初的标题——“**一条烂 SQL 也能拖垮一个数据库**！” 这绝不是危言耸听。

# 写在最后

说实话，这次问题排查给我上了挺生动的一课。刚开始我也以为就是个简单的执行计划跑偏的问题，绑个 profile 就完事了。谁知道越挖越深，最后发现是个“连环案”。

想想也挺有意思的——开发同事看到的是“我的 SQL 怎么突然慢了”，我一开始看到的是“这个 SQL 怎么走错索引了”，但真正的问题却是“整个数据库的 IO 都被打满了”。就像医院里来了个病人说头疼，结果一查是高血压引起的，再一查发现是肾脏出了问题。

最后想说的是，这次问题虽然解决了，但我心里还是有点没底——谁知道下一个“IO 杀手”会什么时候出现呢？或许我们应该趁这个机会，好好梳理一下整个数据库的 SQL 质量了。**毕竟，治标不如治本啊。**

---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)