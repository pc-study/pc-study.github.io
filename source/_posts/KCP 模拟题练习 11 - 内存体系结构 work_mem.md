---
title: KCP 模拟题练习 11 - 内存体系结构 work_mem
date: 2024-10-08 15:24:33
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843551367930150912
---

【单选题】一个排序操作的单个 SQL 执行完毕后，work_mem 内存空间会释放。
 - [ ] 错误
 - [x] 正确

**解题思路：**

KingbaseES 用服务进程来处理连接到数据库服务的客户端请求。 对于每个客户端的连接，KingbaseES 主进程接收到客户端连接后，会为其创建一个新的服务进程。 该进程负责实际处理客户端的数据库请求，连接断开时退出。题干所说的一个 SQL 的排序操作，可以理解为一个客户端会话连接到数据库执行。

KingbaseES 的体系结构图：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241008-1843542677374205952_395407.png)

由图可知：Work Mem 是一块本地独占内存区域，服务于客户端会话，当一个 SQL 的会话进程执行结束，对应的 work_mem 内存空间也会释放。