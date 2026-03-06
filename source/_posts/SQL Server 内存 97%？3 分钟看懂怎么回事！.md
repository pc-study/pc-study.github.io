---
title: SQL Server 内存 97%？3 分钟看懂怎么回事！
date: 2026-01-22 12:21:50
tags: [墨力计划,sql server]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2014176855713718272
---

# 前言
早上收到一个告警，某台 MSSQL 主机内存使用率超过 97%，打开监控一看，内存几乎被 SQL Server 全部占满。

但大多数情况下，这并不是故障，而是 SQL Server 的设计选择，**内存高，本身不是问题。**

**内存高 ≠ 内存泄漏**：SQL Server 会尽可能占用内存做缓存，只有系统内存极度紧张时才会主动释放。

# 内存都去哪了？

最典型的一类是 **数据缓存（Buffer Pool）**。

当我们执行一条 `SELECT` 语句时，SQL Server 会把相关的数据页从磁盘读取到内存中。SQL Server 的所有数据操作，都是以“页”为基本单位进行的。一旦这些数据页进入内存，下一次再访问时，就可以直接从内存读取，避免磁盘 IO，性能差异非常明显。

除了数据页缓存，还有一些我们平时不太关注、但同样重要的缓存：
- **执行计划缓存**：存储过程或复杂 SQL 在第一次执行时需要编译，编译后的执行计划会被缓存起来，避免重复编译。
- **会话缓存**
- **系统级内部缓存**

这些缓存在正常情况下，都是性能的保障。

## 缓存能不能清？
SQL Server 提供了一组 DBCC 管理命令，用于清理不同类型的缓存：

```sql
-- 清除存储过程/执行计划缓存
DBCC FREEPROCCACHE
-- 清除会话缓存
DBCC FREESESSIONCACHE
-- 清除系统缓存
DBCC FREESYSTEMCACHE('All')
-- 清除数据缓存（干净页）
DBCC DROPCLEANBUFFERS
```
当我们遇到内存不足或者大批量临时查询执行完毕的时候，可以通过以上方式进行缓存清理。但是，执行命令后**只是清空缓存，并不会释放内存**。

**需要注意的是：** 这些命令会直接清空现有缓存，在高并发或业务高峰期执行，可能会引发短时间的性能抖动，一般只建议在低峰或明确知道后果的情况下使用。

## 如何释放内存？
SQL Server 没有官方命令可以直接释放内存。

现实中，DBA 常用的办法只有一个：**临时调低 max server memory，强迫 SQL Server 回收内存。**

```bash
USE master
EXEC sp_configure 'show advanced options', 1
RECONFIGURE WITH OVERRIDE

-- 临时降低最大内存
EXEC sp_configure 'max server memory (MB)', 20480
RECONFIGURE WITH OVERRIDE

-- 恢复原来的配置
EXEC sp_configure 'max server memory (MB)', 51200
RECONFIGURE WITH OVERRIDE

EXEC sp_configure 'show advanced options', 0
RECONFIGURE WITH OVERRIDE
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260122-2014184404470554624_395407.png)

一旦上限降低，SQL Server 会立刻回收内存，效果通常很明显。

实际操作时，建议逐步下调内存，而不是一次性降得过低，并观察系统和 SQL Server 的响应情况，避免引入新的压力。**这并不是一个“优雅”的方案，更像是 DBA 在现实运维中的一种妥协，但在实践中确实有效。**

## 图形化调整
如果你更习惯使用 SSMS，也可以通过图形界面完成同样的操作：

* 连接到 SQL Server 实例
* 打开实例属性
* 找到【内存】设置
* 调整“最大服务器内存”
* 应用后，再调回原值

![](https://oss-emcsprod-public.modb.pro/image/editor/20260122-2014184230453583872_395407.png)

本质上，和 `sp_configure` 做的是同一件事。

# 总结
如果你管理过 SQL Server，就会明白：
>**很多时候，我们并不是在“控制数据库”，而是在和它的设计理念共存。**

而 DBA 的工作，就是在性能与资源之间不断做平衡。