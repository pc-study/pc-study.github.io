---
title: 首发｜Oracle 26ai 本地安装包与一键脚本，附网盘下载
date: 2026-01-28 11:13:32
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2016330870652215296
---

**今天早上 Oracle AI Database 26ai 本地版 Linux x86-64 正式发布，这次 Oracle 总算是没有跳票了！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016334896450052096_395407.png)

打开官网可以看到 Oracle 已经开放了 Linux x86-64 的本地安装版下载：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016344309138808832_395407.png)

官方资源直达：
- **26ai 安装包下载**：https://www.oracle.com/database/technologies/oracle26ai-linux-downloads.html
- **26ai 官方文档**：https://docs.oracle.com/en/database/oracle/oracle-database/26/index.html

# 一键安装脚本已火速适配

顺便还适配了一下 [**Oracle 一键安装脚本**](https://www.modb.pro/course/148)，其实早已在去年我就已经把 23ai 版本适配完了，但是因为 Oracle 一直没有发布本地版，后面版本号又改成了 26ai，无奈只能再重新适配一下了，花了 5 分钟改了一下版本号完成适配。

在 Oracle Linux 9.2 环境下，使用最简命令进行实测安装（**不是 rpm 安装**）：
```bash
./OracleShellInstall -lf ens160
```

在 Oracle Linux 9.2 环境进行安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016339256739438592_395407.png)

脚本安装过程如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016338721600266240_395407.png)

重启后检查数据库运行情况：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016339489598300160_395407.png)

安装过程非常顺利，十分钟搞定。

---

Oracle 26ai 安装包我已经都下载好了，明天会放到百度网盘免费提供给大家下载（**关注**）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260128-2016331513529966592_395407.png)

**如何获取**：
- 一键安装脚本需要付费下载（**99米**），欢迎咨询。
- 需要网盘下载链接的朋友，请 **关注后私信「26ai」** 自动获取（**明天开始**）。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

**安装只是第一步**，大家对 26ai 的哪些 AI 特性最感兴趣？欢迎在评论区留言，后续可安排针对性测试。