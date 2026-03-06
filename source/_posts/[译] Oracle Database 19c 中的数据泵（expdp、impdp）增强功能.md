---
title: [译] Oracle Database 19c 中的数据泵（expdp、impdp）增强功能
date: 2022-03-07 10:03:36
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/337676
---

>原文地址：[https://oracle-base.com/articles/21c/space-management-enhancements-21c](https://oracle-base.com/articles/21c/space-management-enhancements-21c)
原文作者：Tim Hall

本文概述了 Oracle Database 19c 中的主要数据泵增强功能。

- [混合分区表](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#hybrid-partitioned-tables)
- [导入时排除加密方式](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#exclude-encryption)
- [对象存储中转储文件名的通配符](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#wildcards)
- [凭证参数](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#credential-parameter)
- [在单个操作中导入表分区](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#partitions)
- [在可传输表空间导入期间表空间保持只读状态](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#transportable-tablespace)
- [防止无意使用受保护的角色](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#protected-roles)
- [资源限制](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#resource-limitations)
- [可传输表空间的测试模式](https://oracle-base.com/articles/19c/data-pump-enhancements-19c#test-mode-for-tts)

相关文章：

- [Oracle Database 19c 中的混合分区表](https://oracle-base.com/articles/19c/hybrid-partitioned-tables-19c)
- [在 Oracle Database 19c 中导入时排除加密子句](https://oracle-base.com/articles/19c/exclude-encryption-clause-on-import-19c)
- [Oracle 云：自治数据库（ADW 或 ATP）- 从对象存储导入数据 (impdp)](https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store#import-data-from-s3)
- [Oracle 云：自治数据库（ADW 或 ATP）- 将数据导出到对象存储 (expdp)](https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp)
- [数据泵 (expdp, impdp) : 所有文章](https://oracle-base.com/articles/misc/articles-misc#data-pump)
-   数据泵快速链接 ： [10g](https://oracle-base.com/articles/10g/oracle-data-pump-10g)、 [11g](https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1)、 [12cR1、12cR2、18c](https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1)、 [19c](https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2)、 [21c](https://oracle-base.com/articles/18c/data-pump-enhancements-18c)、 [可传输表空间](https://oracle-base.com/articles/19c/data-pump-enhancements-19c) 

## 混合分区表

Oracle 19c 引入了混合分区表，它允许将内部和外部分区组合成一个表。外部分区的选项包括数据泵，有关混合分区表的详细信息，请参阅以下文章。

- [Oracle Database 19c 中的混合分区表](https://oracle-base.com/articles/19c/hybrid-partitioned-tables-19c)

## 导入时排除加密方式

该`OMIT_ENCRYPTION_CLAUSE`选项已添加到 [TRANSFORM](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html#GUID-64FB67BD-EB67-4F50-A4D2-5D34518E6BDB) 参数中。“Y”的值使数据泵抑制表的列加密子句。因此，在源表中加密的列将不会在目标表中加密。默认值为“N”，使目标表的列加密与源表的列加密相匹配。此功能在以下文章中进行了演示。

- [在 Oracle Database 19c 中导入时排除加密子句](https://oracle-base.com/articles/19c/exclude-encryption-clause-on-import-19c)

## 对象存储中转储文件名的通配符

从 19c 开始，我们可以在基于 URL 的转储文件名中使用通配符，从而更轻松地从多个文件导入自治数据库。此功能将在以下文章中讨论。

- [Oracle 云：自治数据库（ADW 或 ATP）- 从对象存储导入数据 (impdp)](https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store#import-data-from-s3)

## 凭证参数

从 19c 开始，我们可以使用 [CREDENTIAL](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html#GUID-B6038E22-89B1-49AF-8521-C9B03C067985) 参数而不是 `DEFAULT_CREDENTIAL` 数据库设置来指定对象存储凭据，此功能已向后移植到 18c 客户端。以下文章中有使用该`CREDENTIAL`参数的示例。

- [Oracle 云：自治数据库（ADW 或 ATP）- 从对象存储导入数据 (impdp)](https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store#import-data-from-s3)
- [Oracle 云：自治数据库（ADW 或 ATP）- 将数据导出到对象存储 (expdp)](https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp)
- [数据泵导出 (expdp) 到 Oracle Database 21c 中的云对象存储和从云对象存储导入 (impdp)](https://oracle-base.com/articles/21c/data-pump-export-import-cloud-object-store-21c)

## 在单个操作中导入表分区

默认情况下，分区表的每个分区都作为单独操作的一部分导入。该`GROUP_PARTITION_TABLE_DATA` 选项已添加到 [DATA_OPTIONS](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html#GUID-5FFA128D-B7F5-41D0-A72C-EB2CE384765D) 参数中，以允许将所有表分区作为单个操作的一部分导入。这是一个语法示例：

```bash
impdp testuser1/testuser1@pdb1 \
      tables=t1 \
      directory=tmp_dir \
      logfile=t1-imp.log \
      dumpfile=t1.dmp \
      data_options=group_partition_table_data
```

## 在可传输表空间导入期间表空间保持只读状态

添加了该 [TRANSPORTABLE](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html#GUID-6C68D323-988F-4A4D-9112-20EA2F53C5C2)=KEEP_READ_ONLY 选项以允许导入可传输表空间，同时它们的数据文件保持只读模式。由于文件永远不会被触及，因此相同的文件可以毫无问题地传输到多个数据库中，前提是它们都使用只读访问。

## 防止无意使用受保护的角色

Oracle 允许我们创建需要授权的角色。在 Oracle 19c 中，任何需要授权角色的导出或导入操作只有在 [ENABLE_SECURE_ROLES](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-958B6081-7609-4928-963B-47E5E6542D58)=YES 设置了参数后才能进行。此参数的默认值为`NO`。

## 资源限制

Oracle 12.2 中引入了 [MAX_DATAPUMP_JOBS_PER_PDB](https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/MAX_DATAPUMP_JOBS_PER_PDB.html) 初始化参数，以限制数据泵在 PDB 级别使用的资源。此参数的默认值是 100，允许的值是从 0 到 2147483647。在 Oracle 19c 中，默认值仍然是 100，但允许的值是从 0 到 250，或 value `AUTO`。使用时`AUTO`，该值设置为`SESSIONS`初始化参数值的 50%。

添加了该 [MAX_DATAPUMP_PARALLEL_PER_JOB](https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/MAX_DATAPUMP_PARALLEL_PER_JOB.html) 参数以限制 Data Pump 用于单个作业的并行度。它的默认值为 50，允许的值从 1 到 1024，或者 value `AUTO`。使用时`AUTO`，该值设置为`SESSIONS`初始化参数值的 50%。

## 可传输表空间的测试模式

可传输表空间要求相关表空间处于只读模式。这会使生产系统上的导出操作的测试和时间安排变得困难。Oracle 19c 引入了测试模式，它允许我们测试可传输的表空间导出，而不需要只读模式下的表空间。

该 [TTS_CLOSURE_CHECK](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html#GUID-70EF3307-4F88-4B1D-9FE6-329BD2C58BF2) 参数具有以下允许值。

- `ON` - 执行自我封闭检查。
- `OFF` - 不执行关闭检查。
- `FULL` - 执行完全双向关闭检查。
- `TEST_MODE` - 表空间不需要处于只读模式。

有关更多信息，请参阅：

- [Oracle Database 19c 中的混合分区表](https://oracle-base.com/articles/19c/hybrid-partitioned-tables-19c)
- [在 Oracle Database 19c 中导入时排除加密子句](https://oracle-base.com/articles/19c/exclude-encryption-clause-on-import-19c)
- [Oracle 云：自治数据库（ADW 或 ATP）- 从对象存储导入数据 (impdp)](https://oracle-base.com/articles/vm/oracle-cloud-autonomous-data-warehouse-adw-import-data-from-object-store#import-data-from-s3)
- [Oracle 云：自治数据库（ADW 或 ATP）- 将数据导出到对象存储 (expdp)](https://oracle-base.com/articles/21c/oracle-cloud-autonomous-data-warehouse-export-data-to-object-store-expdp)
- [数据泵 (expdp, impdp) : 所有文章](https://oracle-base.com/articles/misc/articles-misc#data-pump)
-   数据泵快速链接 ： [10g](https://oracle-base.com/articles/10g/oracle-data-pump-10g)、 [11g](https://oracle-base.com/articles/11g/data-pump-enhancements-11gr1)、 [12cR1、12cR2、18c](https://oracle-base.com/articles/12c/data-pump-enhancements-12cr1)、 [19c](https://oracle-base.com/articles/12c/data-pump-enhancements-12cr2)、 [21c](https://oracle-base.com/articles/18c/data-pump-enhancements-18c)、 [可传输表空间](https://oracle-base.com/articles/19c/data-pump-enhancements-19c)