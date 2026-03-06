---
title: Oracle 19.28 RU 升级最佳实践指南
date: 2025-07-17 13:28:43
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1945717276863377408
---

# 前言

作为关键基础设施维护的关键环节，季度补丁更新（Release Update）是保障 Oracle 数据库安全与稳定的核心任务。本文将以生产环境标准流程，详细记录 Oracle 19.3.0 单机环境升级至 19.28 RU 的完整操作，重点阐述技术风险控制与最佳实践。

# 补丁获取与预处理

## MOS 补丁下载

访问 My Oracle Support（MOS）下载页：

![RU 19.28](https://files.mdnice.com/user/16270/cf0d1915-6b77-4b09-bc4b-0b3c3fae6f62.png)

下载对应 Oracle 版本的补丁，根据实际需要使用：

![](https://files.mdnice.com/user/16270/0c0be822-a7a1-4695-a1d3-2ff4edb33502.png)

## 补丁包预处理

将补丁文件上传至数据库服务器 `/soft` 目录下，授予对应 oracle 用户的执行权限：

![](https://files.mdnice.com/user/16270/71456365-033d-4bdc-aed0-294ce0bcfb7e.png)

使用 oracle 用户解压补丁包：

![](https://files.mdnice.com/user/16270/ad6e2b94-39f7-4b78-a84e-3df1180ca4f3.png)

到这补丁包就算搞定了。

# 预升级检查

## OPatch 工具更新

OPatch 补丁更新是替换 ORACLE_HOME 目录下的 OPacth 目录，建议都使用最新的版本进行替换：

![](https://files.mdnice.com/user/16270/aee0f112-5fef-4d46-85bd-9ae4a0ee1538.png)

## 补丁冲突与空间检查

在正式升级前，一般都会对补丁进行检查，确保正式升级万无一失，这一步主要是检查磁盘空间，补丁冲突是否符合补丁安装条件：

**DBRU 检查：**

![](https://files.mdnice.com/user/16270/6bc13658-8d64-449c-9272-6214b5fd1a79.png)

**OJVM 检查：**

![](https://files.mdnice.com/user/16270/ccab3cb2-3f38-4ca9-ad40-d32a55a0bed1.png)

确保检查都成功，就可以正式升级补丁。

# 停机窗口升级操作

从这一步开始，就需要数据库停机了~

## 关闭数据库资源

关闭数据库以及监听：

![](https://files.mdnice.com/user/16270/e1c4f316-480f-4b8f-b07c-e23844748faf.png)

确保没有 oracle 相关的服务运行。

## 应用 DBRU 补丁

正式升级：

![](https://files.mdnice.com/user/16270/6382dc62-499e-49ab-9891-2a5a4cf9f434.png)

## 应用 OJVM 补丁

正式升级：

![](https://files.mdnice.com/user/16270/87deed36-776a-4e6a-aa76-9c4cbe94a215.png)

检查补丁版本：

![](https://files.mdnice.com/user/16270/d60976ec-1088-4500-9d52-c6735ad2facc.png)

可以看到，补丁都已经升级完成，但是仅是软件层面，数据库层面还没更新。

## 启动数据库

补丁升级完成后就可以打开数据库服务：

![](https://files.mdnice.com/user/16270/6eeeafde-86b6-4b09-b6a2-9fe29d86ee44.png)

监听建议先不开，防止有用户连接进行操作。

## 执行 datapatch

执行 datapatch 更新数据库字典（**执行比较慢**）：

![](https://files.mdnice.com/user/16270/e8cc0db1-5292-40af-afd3-ef2aac585942.png)

## 重新编译失效对象

补丁升级过程中可能会导致部分对象失效，建议升级后执行无效对象编译进行修复：

```bash
$ORACLE_HOME/perl/bin/perl $ORACLE_HOME/rdbms/admin/catcon.pl -n 1 -e -b utlrp -d $ORACLE_HOME/rdbms/admin utlrp.sql
```

![](https://files.mdnice.com/user/16270/70b729f2-d608-4ac3-ba94-8f1b7aad3f46.png)

## 升级后验证

升级后检查补丁应用情况以及无效对象检查：

```sql
-- 验证补丁应用
SELECT patch_id, status, description FROM dba_registry_sqlpatch;

-- 检查无效对象
SELECT owner, object_name, object_type
FROM dba_objects
WHERE status = 'INVALID';

-- 确认版本
SELECT banner_full FROM v$version;
```

![](https://files.mdnice.com/user/16270/f60ed65e-e00d-477f-bcdb-0b83760ae69a.png)

## 启动监听服务

确认升级没有问题后，打开监听：

![](https://files.mdnice.com/user/16270/fa8df4ac-2d85-45ce-867d-81a5eddab440.png)

至此，Oracle 19.28 补丁升级完成。
