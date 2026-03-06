---
title: Veeam ONE 13  安装部署全过程
date: 2025-10-13 15:29:56
tags: [墨力计划,veeam]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1977616394137120768
---

# 前言
Veeam ONE 13 是 Veeam 公司推出的一款面向混合云和多云环境的备份和恢复监控、分析工具，于 2025 年 9 月 3 日正式发布，它通过全新的 Web 界面、增强的报告功能、高级监控特性等，重新定义了现代 IT 环境中的监控和报告。

官方下载地址：https://download2.veeam.com/VONE/v13/VeeamONE_13.0.0.5630_20250903.iso

# 安装
安装 Windows Server 2019 或者 2022 操作系统，挂载下载好的 Veeam One 13 安装镜像，双击 setup 开始安装：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977616469278076928_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977616550450442240_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977616800732950528_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977617036331200512_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977617109366616064_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977617392213700608_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977617643892912128_395407.png)

Veeam ONE 13 开始改用 PostgreSQL 数据库作为底层数据存储，之前版本都是 SQLServer 数据库：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977618440659677184_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977618522897395712_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977620095803338752_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977621192735469568_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977621772077903872_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977624234071437312_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977624309648601088_395407.png)

打开 Client：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977624596518023168_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977624634040266752_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977624898008788992_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977625595232137216_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977626153728880640_395407.png)

添加一个 Veeam 备份服务器：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977627086248488960_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977627221451878400_395407.png)

添加一个可以访问 Veeam 备份服务器的账号：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977628159679934464_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977628558004596736_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977628721297240064_395407.png)

等待安装完成：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977628852004335616_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977629427580284928_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977630112157806592_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251013-1977629630567821312_395407.png)

安装纳管完成。
