---
title: OGGMA 同步 Oracle 11GR2：不看这篇你一定会踩坑
date: 2026-01-29 10:13:25
tags: [墨力计划,ogg,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2016675515021746176
---

# 前言
昨天使用 OGGMA 21.20 同步一套 11GR2 数据库时，创建抽取进程报错，遇到了几个问题，这里分享一下。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

## 问题一
使用集成模式创建抽取进程报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016675739299569664_395407.png)

参考 MOS 文档：**Insufficient Privileges While Setting Up Integrated Extract on OGG 12.3 Microservices Architecture [KB336933]**

文档描述：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260127-2016063319821066240_395407.png)

解决方案：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260127-2016063706124853248_395407.png)

11GR2 版本使用集成模式创建抽取进程时，需要安装 one-off 补丁 20448066：
```bash
unzip -qo p6880880_112000_Linux-x86-64.zip -d $ORACLE_HOME
unzip -q p20448066_112040_Linux-x86-64.zip

opatch version
OPatch Version: 11.2.0.3.53

## 检查冲突
cd 20448066/
opatch prereq CheckConflictAgainstOHWithDetail -ph ./

## 关闭数据库和监听
lsnrctl stop
shu immediate

## 安装补丁
opatch apply -silent

## 开启数据库和监听
lnsrctl start
startup
alter system register;
```
补丁安装完成后，该问题修复。

## 问题二
另一个问题报错：
```bash
ERROR   OGG-02912  您的 Oracle 挖掘数据库上必须有针对线索格式版本 12.2 或更高版本的补丁程序 17030189。.
ERROR   OGG-01668  PROCESS ABENDING.
```
参考 MOS 文档：**OGG-02912 Patch 17030189 is required on your Oracle mining database for trail format RELEASE 12.2 or later [KB386115]**

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016677657203793920_395407.png)

需要安装 one-off 补丁 17030189 进行修复：
```bash
unzip -q p17030189_112040_Linux-x86-64.zip

## 检查冲突
cd 17030189/
opatch prereq CheckConflictAgainstOHWithDetail -ph ./

## 关闭数据库和监听
lsnrctl stop
shu immediate

## 安装补丁
opatch apply -silent

## 开启数据库和监听
lnsrctl start
startup
alter system register;
```
补丁修复之后，发现问题依然存在。

参考 MOS 文档：**OGG-02912 Patch 17030189 is required , but patch already applied [KB505939]**，即使补丁已安装，还需要执行 `postinstall.sql`，否则还是会继续报错。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016678218582532096_395407.png)

根据文档提示执行 `postinstall.sql`：
```sql
SQL> @?/sqlpatch/17030189/postinstall.sql
```
执行完后启动抽取进程，报错消失，问题修复。

## 问题三
抽取进程正常运行，但是有一些警告：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016678545884536832_395407.png)

查看当前同步的用户是否使用了 UDT 和 ANYDATA：
```sql
-- 开头替换用户名称即可
DEFINE TARGET_USERS = '''USER01'',''USER02''';

set heading off
SELECT '---##15##--- Tables With Columns of UNSUPPORTED Datatypes in ALL Schemas ' 
FROM dual;
set heading on
SELECT OWNER, TABLE_NAME, COLUMN_NAME, DATA_TYPE
FROM all_tab_columns
WHERE OWNER IN (&TARGET_USERS)
AND (data_type in ('ORDDICOM', 'BFILE', 'TIMEZONE_REGION', 'BINARY_INTEGER', 'PLS_INTEGER', 'UROWID', 'URITYPE', 'MLSLABEL', 'TIMEZONE_ABBR', 'ANYDATA', 'ANYDATASET', 'ANYTYPE')
or data_type like 'INTERVAL%');
```
如果查询结果都为空，代表没有用到则可以跳过这个告警。

# 总结
以上就是我遇到的几个问题，希望对你有所帮助。



