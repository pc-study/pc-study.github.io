---
title: SQL Server 创建账号密码复杂度问题
date: 2025-09-03 10:18:30
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1963055579975397376
---

# 前言
在维护 SQL Server 数据库时，账号密码策略问题是一个常见的困扰。今天在 SQL Server 2008 上创建新账号时遇到了一个典型的错误：
```bash
消息 15118，级别 16，状态 1，第 1 行
密码有效性验证失败。该密码不够复杂，不符合 Windows 策略要求。
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250903-1963057020731404288_395407.png)

本文将详细介绍该问题的排查过程和解决方案。

# 问题分析
SQL Server 的密码策略并非独立存在，而是依赖于 Windows 操作系统的本地安全策略。当创建账号时出现密码复杂度错误，需要检查系统级别的安全设置。

# 解决步骤
## 1. 检查本地安全策略
打开本地安全策略管理器：**服务器管理器 → 本地服务器 → 工具 → 本地安全策略**

![](https://oss-emcsprod-public.modb.pro/image/editor/20250903-1963055556768313344_395407.png)

## 2. 查看密码策略设置
导航至密码策略：**安全设置 → 账户策略 → 密码策略**

![](https://oss-emcsprod-public.modb.pro/image/editor/20250903-1963055684551979008_395407.png)

## 3. 确认密码复杂性要求
检查"**密码必须符合复杂性要求**"选项的状态：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250903-1963055770648457216_395407.png)

密码复杂性要求策略如下：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250903-1963055851552387072_395407.png)

如果启用此策略，密码必须符合下列最低要求:
- 不能包含用户的帐户名，不能包含用户姓名中超过两个连续字符的部分；
- 至少有六个字符长；
- 包含以下四类字符中的三类字符:；
- 英文大写字母(A 到 Z)；
- 英文小写字母(a 到 z)；
- 10 个基本数字(0 到 9)；
- 非字母字符(例如 !、$、#、%)；

在更改或创建密码时执行复杂性要求。

# 实际解决方案
问题原因：密码中包含了账号名称，违反了复杂性要求。

修改密码后重新执行创建脚本：
```sql
SELECT @@VERSION;

Microsoft SQL Server 2008 R2 (RTM) - 10.50.1600.1 (X64)   Apr  2 2010 15:48:46   Copyright (c) Microsoft Corporation  Enterprise Edition (64-bit) on Windows NT 6.2 <X64> (Build 9200: ) (Hypervisor) 

-- 创建登录账号并指定默认数据库
CREATE LOGIN LUCIFER WITH PASSWORD = 'MSSQLTEST@2025!', DEFAULT_DATABASE = WANGDS;

-- 切换到目标数据库
USE WANGDS;
GO

-- 创建数据库用户并关联登录账号
CREATE USER LUCIFER FOR LOGIN LUCIFER;
GO

-- 设置默认 Schema
USE WANGDS;
ALTER USER LUCIFER WITH DEFAULT_SCHEMA = dbo;
GO
    
-- 授予表级别的增删改查权限
GRANT SELECT, INSERT, UPDATE, DELETE ON WANGDS.dbo.zhangsan TO LUCIFER;
GRANT SELECT, INSERT, UPDATE, DELETE ON WANGDS.dbo.lissi TO LUCIFER;
GO
```
执行成功，账号创建完成，可以对表进行增删改查操作。

# 写在最后
SQL Server 数据库的密码策略继承自 Windows 操作系统的安全策略，而非独立配置。遇到密码复杂度问题时，应当：
1. 检查 Windows 本地安全策略的密码设置；
2. 确保密码符合系统要求的复杂度标准；
3. 避免在密码中使用账号名或用户名的部分内容；

理解这一机制有助于快速定位和解决类似问题。
