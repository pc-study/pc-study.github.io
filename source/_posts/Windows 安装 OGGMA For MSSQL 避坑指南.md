---
title: Windows 安装 OGGMA For MSSQL 避坑指南
date: 2025-12-30 08:51:27
tags: [墨力计划,ogg,sql server]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2005275277371465728
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

# 前言
这两天折腾 Windows 安装 OGGMA 21.19 MSSQL，因为 OGGMA 官方文档主要面向 Linux/Unix 环境，在 Windows 平台部署时遇到了两个问题，在网上没有搜索到解决方案，新版 MOS 也是摆设，好在最后问题顺利解决了。

本文记录一下问题发生以及解决的过程，希望本次排错经历能为在 Windows 平台部署 OGG 的同仁提供参考，避免因环境差异而踩坑。

# 问题记录
## 问题一
OGGMA 第一次安装失败，删除所有文件重新安装，已经删除所有注册表已经服务。

第二次安装到这一步报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005275347223404544_395407.png)

经查询百度，提示都是 Linux 版本，需要删除 inventory 文件 `/u01/app/oraInventory/ContentsXML/inventory.xml` 中的记录：
```bash
<HOME NAME="OraHome1" LOC=".../ogg" TYPE="O" IDX="3"/>
```
但是我这台是 Windows，而且是 MSSQL，不知道 inventory 文件在哪里，最后在注册表找到了这个位置：
```bash
计算机\HKEY_LOCAL_MACHINE\SOFTWARE\ORACLE
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005275993108471808_395407.png)

找到 `C:\Program Files\Oracle\Inventory\ContentsXML` 目录下的 inventory 文件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005276399864193024_395407.png)

编辑文件找到这一行删掉即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005276528624623616_395407.png)

结束安装进程，重新执行安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005276962764955648_395407.png)

问题解决。

## 问题二

执行 bat 脚本报错：
```bash
-----------------------------------------------------
     Oracle GoldenGate Install As Service Script
-----------------------------------------------------

OGG_HOME=C:\ogg\oggma
OGG_ETC_HOME=C:\ogg\ogginst\sm\etc
OGG_VAR_HOME=C:\ogg\ogginst\sm\var

Enter Microsoft Windows Username : .\Administrator
Enter password:************
Registering Service Manager...
[SC] StartService 失败 1053:

服务没有及时响应启动或控制请求。

请按任意键继续. . .
```
但是服务是成功创建的：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005280086224887808_395407.png)

不过无法启动：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005280190307049472_395407.png)

可以看到服务对应的执行文件是 `C:\ogg\oggma\bin\OracleGoldenGate.cmd`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005280676707901440_395407.png)

查看文件内容：
```bash
@echo off
REM Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
setlocal
for %%F in (%0) do set OGG_BIN=%%~dpF
PATH=%OGG_BIN%;%OGG_BIN%..\lib\;%PATH%
ServiceManager.exe %*
```

可以看到这个批处理脚本是用于启动 ServiceManager.exe，为什么会启动失败，手动执行试试：
```bash
C:\ogg\oggma\bin>cd C:\ogg\oggma\bin

C:\ogg\oggma\bin>call ServiceManager.exe
Service Manager is terminating because it cannot load the inventory from 'C:\ogg\oggma\etc\conf/deploymentRegistry.dat'
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005282233968582656_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005283327025684480_395407.png)

`deploymentRegistry.dat` 这个文件的实际位置是 `C:\ogg\ogginst\sm\etc\conf`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005282511820251136_395407.png)

为什么会被识别到 `C:\ogg\oggma\etc\conf/` 目录下呢？

难道跟我配置的 OGG_HOME 有关？

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005283570676998144_395407.png)

删掉之后再次执行，靠，还真是，好了！

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005283761714454528_395407.png)

看来还是习惯作怪，Linux 安装的习惯拿到 Windows 上了，导致问题发生！

再次手动启动服务，成功运行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251228-2005284155140677632_395407.png)

问题解决！

# 写在最后
这两个问题解决后，其他的就没什么问题了，oggca 的配置方式参考 Linux 即可。


![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)