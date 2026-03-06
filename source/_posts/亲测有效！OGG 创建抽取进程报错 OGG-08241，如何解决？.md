---
title: 亲测有效！OGG 创建抽取进程报错 OGG-08241，如何解决？
date: 2025-05-07 16:20:07
tags: [墨力计划,ogg,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1920024475702145024
---

# 前言
今天在测试 OGG 一个功能的时候，需要重新初始化 oggca，所以重装了一下 OGG。重建完之后重新添加抽取进程报错，一直无法添加成功：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1920024503640403968_395407.png)

经过一翻分析，找到了解决方案，本文记录一下解决过程。

# 问题描述
OGG 重装之前，没有清理原先抽取进程，重装后，抽取进程重建失败！

原因是因为添加抽取进程时，会在数据库中的一些表里创建一些数据，用来记录抽取进程的信息。
- **dba_capture**：displays information about all capture processes in the database.
- **dba_apply**：displays information about all apply processes in the database. 
- **system.logmnr_***

如果重建同名进程时未清理对应的记录，会导致无法成功创建抽取进程。

# 问题解决
经过在 MOS 查找对应的解决方案，最终解决问题。

>参考 MOS 文档：**Unable To Register OGG Extract (Doc ID 2861271.1)**

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1920026283552026624_395407.png)

根据 MOS 提供的清理步骤：
```sql
SQL> select session# from system.logmnr_session$ where session_name like '%E_MYSQL%';

-- 执行清理
SQL> delete from system.logmnr_spill$ where session# = 1;
delete from system.logmnr_age_spill$ where session# = 1;
delete from system.logmnr_log$ where session# = 1;
delete from system.logmnr_restart_ckpt$ where session# = 1;
delete from system.logmnr_restart_ckpt_txinfo$ where session# = 1;
delete from system.logmnr_filter$ where session# = 1;
delete from system.logmnr_parameter$ where session# = 1;
delete from system.logmnr_global$ where session# = 1;
delete from system.logmnr_session$ where session# = 1;
commit;
```
清理后再次添加抽取进程，依然报错。

>参考 MOS 文档：**Add Extract on GGMA Fails By OGG-08241 (Doc ID 2936927.1)**

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1920025429851779072_395407.png)

根据 MOS 提供的清理步骤：
```sql
SQL> select capture_name from dba_capture where capture_name like '%E_MYSQL%';

CAPTURE_NAME
----------------------------------------------------------------------------------------------------
OGG$CAP_E_MYSQL

SQL> exec dbms_capture_adm.stop_capture('OGG$CAP_E_MYSQL');
SQL> exec dbms_capture_adm.drop_capture('OGG$CAP_E_MYSQL');

SQL> select apply_name from dba_apply where apply_name like '%E_MYSQL%';

APPLY_NAME
----------------------------------------------------------------------------------------------------
OGG$E_MYSQL

SQL> exec dbms_apply_adm.stop_apply('OGG$E_MYSQL');
SQL> exec dbms_apply_adm.drop_apply('OGG$E_MYSQL');
```
再次添加抽取进程：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1920027434875891712_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1920027563590692864_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1920027723502727168_395407.png)

创建成功。问题解决！