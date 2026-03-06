---
title: Veeam 安装 Agent 报错问题处理
date: 2025-09-25 16:43:32
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1971105340733272064
---

# 前言
今天用 Veeam 备份一台文件服务器，在安装 agent 时报错：`Agent is managed by another Veeam server`。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971105511219146752_395407.png)

本文记录一下解决过程。

# 解决方案
连接到需要被备份的主机，搜索框输入 `regedit` 打开注册表（管理员运行）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971124761103183872_395407.png)

找到 Veeam 软件的注册表位置 `HKEY_LOCAL_MACHINE\SOFTWARE\Veeam`，删除 Veeam 这一栏：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971107055155032064_395407.png)

然后再次在 Veeam 服务器再次执行安装 agent：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971125085075419136_395407.png)

这时候已经不报错被另一台 Veeam 服务器管理了，问题已解决。