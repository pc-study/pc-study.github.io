---
title: 实战篇：JS kgl get object wait 等待事件分析
date: 2025-01-19 23:54:55
tags: [墨力计划,oracle,oracle 19c]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1879741445268058112
---

>大家好，这里是公众号 **DBA学习之路**，致力于分享数据库领域相关知识。

@[TOC](目录)

# 前言
今天给客户巡检数据库时发现有一套 19C RAC CDB 数据库，AWR 报告中 `JS kgl get object wait` 等待事件比较重，于是记录了一下排查过程，比较简单。

# AWR 报告
这里抓取了一小时的 AWR 报告：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250116-1879902536744841216_395407.png)

可以看到 Top10 等待事件排名第一是 `JS kgl get object wait` 等待事件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250116-1879902718060408832_395407.png)

MOS 文档上搜了一圈没找到 `JS kgl get object wait` 等待事件的相关文档说明，但是通过它的名字可以得到一些信息：
- `JS` 一般指 **Job Scheduler**；
- `kgl` 是与 **library cache** 有关；

这样我们就可以理解这个等待是 Job scheduler 相关的 library cache 获得 object 时的等待。

查看 Top SQL 发现确实是有很多 **DBMS_SCHEDULER Job** 在执行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250116-1879904388349702144_395407.png)

印证了上面等待事件与 Job scheduler 有关的可能性。

# 探索 BUG
经过仔细搜索，发现在 19C 版本有 'JS kgl get object wait' 高等待主要有两个 Bug：
- [Bug 32999541 - high wait on js kgl lock on self calling jobs in rac (Doc ID 32999541.8)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=32999541.8)
- [Bug 36623712 - Scheduler Job Creations Spends High Time In "JS kgl get object wait" Event (Doc ID 36623712.8)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=36623712.8)

根据文档描述， **Bug 32999541** 主要在 RAC 环境 `calling job` 的时候产生：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250116-1879905903948869632_395407.png)

而 **Bug 36623712** 是在 `job creations` 的时候：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250116-1879905800253091840_395407.png)

从 AWR 看，这个高等待在 **1月 9 日到 16 日**持续存在，显然 **Bug 32999541** 更符合，而且当前 19.12 的 RU 也没有包含 Bug 32999541。

所以怀疑是这个 BUG 导致，在 MOS 上与 Oracle 确认后，确实是这个 BUG 导致 `JS kgl get object wait` 等待事件，需要进行补丁修复。

# 解决方案
建议打 oneoff 补丁或者升级到最新的 RU 版本。

## 下载 oneoff 补丁
**下载 oneoff 补丁**：[HIGH WAIT ON JS KGL LOCK ON SELF CALLING JOBS IN RAC](https://updates.oracle.com/download/32999541.html)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250116-1879906683103752192_395407.png)

下载好补丁之后查看一下 README 文档要求（**提取关键信息**）：
- This patch is RAC Rolling Installable.
- This patch is Data Guard Standby-First Installable.
- Ensure that 19 Release 19.12.0.0.210720DBRU Patch Set Update (PSU) 32904851 is already applied on the Oracle Database.
- (Only for Offline Patching) Ensure that you shut down all the services running from the Oracle home.
	- For a RAC environment, shut down all the services (database, ASM, listeners, nodeapps, and CRS daemons) running from the Oracle home of the node you want to patch. After you patch this node, start the services on this node. Repeat this process for each of the other nodes of the Oracle RAC system. OPatch is used on only one node at a time.
		- please use -local option to apply the patch to the particular node. e.g., opatch apply -local

好在这个补丁支持滚动安装，所以挨个节点停机即可安装。

## 更新 OPatch
**下载最新的 OPatch 包**：[	OPatch 12.2.0.1.44 for DB 19.0.0.0.0 (Oct 2024)](https://updates.oracle.com/download/6880880.html)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250116-1879909175053004800_395407.png)

oracle 用户下解压替换为最新的 OPatch 版本：
```bash
unzip -oq /soft/p6880880_190000_Linux-x86-64.zip -d $ORACLE_HOME
opatch version
```

## 安装 oneoff 补丁
确保满足以上条件之后，进行补丁安装前检查：
```bash
cd /soft
unzip -q /soft/p32999541_1912000DBRU_Linux-x86-64.zip
cd /soft/32999541
opatch prereq CheckConflictAgainstOHWithDetail -ph ./
```
检查没有冲突后，关闭节点一的所有 oracle 相关服务：
```bash
## 节点一
## oracle 用户执行
srvctl stop db -d lucifer
## root 用户执行
crsctl stop crs
```
节点一开始补丁静默安装：
```bash
cd /soft/32999541
opatch apply -local -silent
```
安装成功后，查看补丁：
```bash
opatch lsinventory
```
开启所有 oracle 相关服务：
```bash
## root 用户执行
crsctl start crs
## oracle 用户执行
srvctl start db -d lucifer
```
节点二重复节点一的操作即可。

# 写在最后
这个问题解决过程比较简单，本文分享仅做记录参考。

