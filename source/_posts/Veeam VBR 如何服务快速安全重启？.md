---
title: Veeam VBR 如何服务快速安全重启？
date: 2025-11-19 09:23:01
tags: [墨力计划,veeam]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1990949707695349760
---

# 前言
昨天遇到一个备份任务无法停止的问题，任务执行了接近 40 小时，应该是卡住了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990952423381868544_395407.png)

今天咨询了一下服务人员，说是要重启一下 Veeam 服务进行释放，本文记录一下如何使用 Powershell 命令行快速安全的重启 Veeam 服务。

# 打开 Powershell
打开 Veeam Backup & Replication 控制台，点击左上角的“菜单”按钮，选择“PowerShell 界面”：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990944336465960960_395407.png)

如果不是用 administrator 用户登录，建议直接使用管理员权限打开 Powershell：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990946289707196416_395407.png)

否则执行会报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990947035562991616_395407.png)

# 重启 Veeam 服务
查看 Veeam 服务状态命令：
```powershell
Get-Service Veeam* | Service
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990950430269579264_395407.png)

停止 Veeam 服务状态命令：
```powershell
## 建议加 -Force
Get-Service Veeam* | Stop-Service -Force
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990950830817222656_395407.png)

**注意**：需要提前确认没有正在运行的任何Veeam Job，并且关闭 VBR 控制台。

开启 Veeam 服务状态命令：
```powershell
Get-Service Veeam* | Start-Service
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990951788443426816_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990951856231768064_395407.png)

Veeam 服务重启完成。

重新打开 VBR 控制台，检查刚刚卡住的备份任务：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251119-1990952295086497792_395407.png)

备份任务已经停止。
