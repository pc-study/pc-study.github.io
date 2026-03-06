---
title: 听说 Oracle MOS 又放大招！
date: 2025-12-11 22:00:59
tags: [墨力计划,oracle,mos]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1999103316442308608
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

**新版 MOS 更新后，书签栏里那些经典的 MOS 文档链接都废了！** 这是 Oracle 新版 MOS 上线，受到国内外吐槽最多的一点，针对这个问题，Oracle MOS 提供了解决方案，请往下看！

Tim Hall 总结了一些新版 MOS 备受吐槽的问题：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251211-1999104799200583680_395407.jpg)

当天我也写了一篇吐槽的文章：[Oracle MOS 重磅升级？嗯，什么东西！](https://www.modb.pro/db/1997842579296182272)，转头来看，其实大家最不爽的就是**以前保存的很多经典的 MOS 文档都找不到了**。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251211-1999104726542655488_395407.jpg)

比如我自己常用的几个 MOS 文档：
- (**2118136.2**) Assistant: Download Reference for Oracle Database/GI Update, Revision, PSU, SPU(CPU), Bundle Patches, Patchsets and Base Releases
- (**2550798.1**) Autonomous Health Framework (AHF) - Including Trace File Analyzer and Orachk/Exachk
- (**742060.1**) Release Schedule of Current Database Releases
- (**274526.1**) How To Download And Install The Latest OPatch(6880880) Version
- (**1366133.1**) SQL Tuning Health-Check Script (SQLHC) Download, Guidelines and Requirements

因为新版 MOS 的 DocID 变更，导致使用以前的 DocID 无法查询到新版 MOS 对应的文档，也没有设置跳转，所以很多人都是一头雾水，不过当天还是有人摸索出一个方法来查询的。

使用下面的链接 + 以前的 DocID，就可以打开新版 MOS 对应的文章：
>https://support.oracle.com/epmos/faces/DocumentDisplay?id=

比如 **SQL Tuning Health-Check Script (SQLHC) Download, Guidelines and Requirements** 对应的就是新版文档链接就是：
>https://support.oracle.com/epmos/faces/DocumentDisplay?id=1366133.1

打开链接会跳转到新版 MOS 对应的文档界面：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251211-1999108595561603072_395407.png)

后来经过我摸索，又发现一种方式也可以找到以前的 MOS 文章，使用以下链接 + 以前的 DocID 的前缀：
>https://support.oracle.com/support/?kmContentId=1366133

但是以上两种方式都有一个弊端，就是只能针对 xxxxxx.1 的文档，如果不是 .1 结尾的 DocID 就会失效了，比如 `2118136.2` 就不行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251211-1999109213382074368_395407.png)

针对这个问题，Oracle 应该也意识到了，所以做了一些补救措施，昨天在 MOS 首页发布了一篇新的 MOS 文档：
>(NEWS20) Finding knowledge articles in My Oracle Support：https://support.oracle.com/support/?documentId=NEWS20

![](https://oss-emcsprod-public.modb.pro/image/editor/20251211-1999109574536814592_395407.png)

顾名思义就是教你如何在新版 MOS 找到以前的文档，让你搜 DocID，搜索关键字等等巴拉巴拉说了一通，最后又列出了最受欢迎的 50 篇 MOS 文档在新版的链接以及对应关系。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251211-1999113960231608320_395407.png)

但还是有一些小问题，比如按照给的链接打开 `KA958` 文档还是打不开：
>https://support.oracle.com/support/?documentId=KA958

![](https://oss-emcsprod-public.modb.pro/image/editor/20251211-1999115727668862976_395407.png)

需要使用下面的链接才能打开：
>https://support.oracle.com/support/?kmContentId=11135392

![](https://oss-emcsprod-public.modb.pro/image/editor/20251211-1999114967724400640_395407.png)

哎，等着慢慢修复吧，至少 Oracle 没有完全摆烂，目前这也算是一个临时的解决方案吧！


---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)