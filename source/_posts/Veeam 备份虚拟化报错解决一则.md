---
title: Veeam 备份虚拟化报错解决一则
date: 2026-01-26 09:58:05
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2015604473767485440
---

今天收到 Veeam 备份邮件告警，提示虚拟化主机备份失败，报错如下 `Host xxx is not available. Error: Failed to retrieve object hierarchy: exception ID xxxxx`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260126-2015602638017093632_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260126-2015603099440865280_395407.png)

打开 VBR 主机发现这台 VC 无法查看，rescan 报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260126-2015602818821464064_395407.png)

解决方案：

VBR 主机使用 PowerShell（管理员） 重启 `VeeamBrokerSvc` 服务：
```bash
Get-Service VeeamBrokerSvc | Stop-Service -Force
Get-Service VeeamBrokerSvc | Start-Service
```
重新走一遍纳管 VC 的向导，问题解决：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260126-2015603740482019328_395407.png)

再次执行备份，备份恢复正常。