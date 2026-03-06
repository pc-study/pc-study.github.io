---
title: KCP 模拟题练习 08 - 写磁盘操作
date: 2024-10-08 15:02:39
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843537933686632448
---

【单选题】在 KingbaseES V8 中，请问 SELECT 操作时，是不是一定没有写磁盘的操作？
 - [x] 不是
 - [ ] 是

**解题思路：**

要想知道 SELECT 操作是否会有写磁盘的操作，首先得要了解：
- 什么情况下会发生写磁盘的操作？
- SELECT 是否存在符合的情况？

**1、KingbaseES 在哪些情况下会发生写磁盘的操作？**
- 当检查点发生时，需要写脏数据文件，会有写磁盘的操作。
- COMMIT 提交或者 wal buffer 内存满了的时侯，会调用 wal 进程去写 wal 日志文件，也会有写磁盘的操作。

**2、SELECT 是否存在符合的情况？**

如果一个 SELECT 语句发生了硬解析，需要将磁盘的数据读取写入到内存 shared buffer 中，然而写入内存时发现内存满了，无法写入，这时候就会触发检查点操作，写脏数据文件，就会触发写磁盘的操作。

附上 KingbaseES 的体系结构图：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241008-1843542677374205952_395407.png)

