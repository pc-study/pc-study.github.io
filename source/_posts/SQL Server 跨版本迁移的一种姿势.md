---
title: SQL Server 跨版本迁移的一种姿势
date: 2026-01-08 16:55:13
tags: [墨力计划,sql server]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2009171552676438016
---

# 前言
今天业务要求还原一套 MSSQL 数据库到新建的 MSSQL 数据库上，直接用备份恢复的方式恢复报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009171665193345024_395407.png)

报错很明确，MSSQL 2022（16.00.1000） 的数据库备份无法恢复到 MSSQL 2019（15.00.2000） 上，网上搜了一下，发现了一个解决方案。

本文分享一下如何从高版本 MSSQL 恢复到低版本数据库的完整的操作过程。

# 高版本导出脚本
首先，源端选中需要导出的数据库，选择 `[Tasks] --> [Generate Scripts]`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009172861874413568_395407.png)

介绍页可跳过：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009173157542977536_395407.png)

导出数据库的所有对象：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009173429564563456_395407.png)

选择生成脚本存放的位置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009173815457816576_395407.png)

选择需要导入的 MSSQL 版本：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009174087148052480_395407.png)

继续下一步：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009174239208349696_395407.png)

执行导出：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009174475796455424_395407.png)

导出成功之后在目录里可以看到：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009174795083653120_395407.png)

将导出的脚本文件拷贝到目标端进行恢复即可。

# 低版本恢复数据
根据低版本 MSSQL 的实际环境修改脚本中的文件路径：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009176315711283200_395407.png)

执行脚本：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009178609811021824_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260108-2009181319478714368_395407.png)

数据库创建完成。

# 补充一下
需要注意源端和目标端的数据库字符集（排序规则），如果有差异，建议指定字符集 `COLLATE <排序规则>` 创建数据库：
```bash
CREATE DATABASE [TEST_DB]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'TEST_DB', FILENAME = N'D:\MSSQL\DATA\TEST_DB.mdf' , SIZE = 75571200KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'TEST_DB_log', FILENAME = N'D:\MSSQL\DATA\TEST_DB_log.ldf' , SIZE = 176168960KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 COLLATE Chinese_PRC_CI_AS
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
```
确保两边的字符集一致，否则可能导致中文乱码问题。


# 总结
MSSQL 操作总体来说还是很简单的，即使没有经验，跟着流程一步步走就成功了。