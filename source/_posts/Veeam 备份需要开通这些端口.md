---
title: Veeam 备份需要开通这些端口
date: 2025-11-19 13:11:32
tags: [墨力计划,veeam12]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1988839723494891520
---

# 前言
当有网络安全限制的情况下，使用 Veeam 去安装代理，备份虚拟机、数据库等等操作时会很费劲，因为里面涉及到很多端口需要打通。

为了方便以后愉快的玩耍 Veeam，我花了点时间整理了一份 Veeam 备份需要使用到的端口，分享给大家。

# 虚拟化
虚拟化可以是 vCenter 和 ESXi 服务器，需要开通以下端口：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1991011342951194624_395407.png)

# 服务器主机
服务器主机分为 Linux 和 Windows 两种，一般纳管时需要开通以下端口：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1991009887476867072_395407.png)

# Oracle RAC
如果需要纳管 Oracle RAC 数据库主机进行备份，需要开通以下端口：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1991010502773383168_395407.png)

关键端口说明：
- **22**: SSH 端口，用于 Linux 系统管理
- **443/902**: vSphere 管理和数据传输
- **2500-3300**: Veeam 核心数据传输端口范围
- **6160-6210**: Veeam 组件间通信端口
- **49152-65535**: Windows 动态端口范围
