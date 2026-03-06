---
title: OGG 更新表频繁导致进程中断，见鬼了？非也！
date: 2025-04-28 21:20:34
tags: [墨力计划,oracle,ogg]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1916732889287372800
---

>大家好，这里是 **DBA学习之路**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
最近几周一直遇到一个 OGG 问题，有一张表已更新就会中断 OGG 同步进程，本文记录一下分析过程以及解决方案。

# 问题描述
昨天下午，客户说 OGG 又停了（OGG 版本是 19.1.0.4，源端和目标端同版本，都是 19.20）：
>ogg 又停了，源端到目标端的 XZ3WFP 链路，可以查一下原因吗？

连上环境看了下，确实目标端复制链路处理 ABENDED 状态：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916739092071591936_395407.png)

查看目标端 ggserr.log 日志（日志路径一般在 $OGG_HOME 目录下）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916739818147557376_395407.png)

日志里没有看到明显报错信息。

# 问题分析
简单查看了下每次链路 ABENDED，报错的内容都是因为 update 语句导致，源端都是正常抽取状态，目标端复制进程异常终止。

关于 ggserr.log 日志中报错信息，查看官方针对这个错误代码的定义：
```bash
OGG-01296: Error mapping from {0} to {1}
The mapping of the specified source and target tables failed.

Examine the accompanying messages that provide details about the mapping failure, and resolve the problem based on those messages.
```
查看目标端 discardfile 文件（日志路径一般在 $OGG_HOME/dirrpt 目录下）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916740780404781056_395407.png)

看报错是缺列 ID，ID 是这张表的主键，检查了一下源端和目标端的表结构以及主键，发现没有区别，两端保持一致：
```sql
SQL> select owner, constraint_name, constraint_type, status, validated from dba_constraints where owner='XXXXXXX' and TABLE_NAME = 'XXXXX';
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916745703561375744_395407.png)

源端和目标端均存在主键，按理来说应该没有问题。问了一下客户，这张表是最近新建的表，检查一下源端的抽取链路参数：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916746949772980224_395407.png)

有设置参数 `ddloptions addtrandata report` 参数，按理来说应该可以自动添加 trandata，检查一下源端 trandata 是否正常（一般是手动添加完 trandata 用 dba_log_groups 视图查看）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916747725257846784_395407.png)

但是通过参数自动添加需要使用下方方式查看：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916748273763758080_395407.png)

检查发现没有添加 trandata 记录，在 ggsci 中检查表是否添加 trandata：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916748978100645888_395407.png)

确实没有添加 trandata，这就很奇怪，不过先处理问题要紧。

# 解决方案
之前每次遇到这个问题，为了紧急恢复同步，都是使用跳过当前事务的方式恢复：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916751133733826560_395407.png)

这里也是先紧急修复了，然后手动添加 trandata：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916749429793632256_395407.png)

添加完之后再次检查视图：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916749573402406912_395407.png)

可以查看记录，这次是添加成功了，后续请客户再次执行 update 操作：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250428-1916751844714491904_395407.png)

复制链路没有中断，数据正常同步，问题解决。

# 后续
后续问了客户建表的操作，客户反馈：
1. 第一次建表忘记添加主键，所以添加成功后，删掉了这张表；
2. 重建表，设置 ID 为主键。

之前每次对这张表进行 update 操作，都会导致复制链路中断。

等后面有时间了可以做一下测试~





