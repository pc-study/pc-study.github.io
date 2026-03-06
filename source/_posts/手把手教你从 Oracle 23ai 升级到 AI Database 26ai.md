---
title: 手把手教你从 Oracle 23ai 升级到 AI Database 26ai
date: 2025-10-16 23:45:06
tags: [墨力计划,oracle 26ai,oracle 23ai]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1978707638280007680
---

# 前言
之前有一篇文章 [好消息：Oracle 23ai 现已支持一键部署！](https://www.modb.pro/db/1959985617895436288) 安装过一套 Oracle 23ai（23.8），在 10 月 14 日 Oracle 正式将 23ai 更名为 AI 26ai，实际上是 23.26 版本，无需重新安装，可以直接通过打补丁的方式从 23.8 直接升级上去。

>Oracle AI Database 26ai replaces Oracle Database 23ai. Transitioning from 23ai to 26ai is simple—just apply the October 2025 release update with no database upgrade or application re-certification. Advanced AI features like AI Vector Search are included at no additional charge.

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978709870606036992_395407.png)

本文使用之前安装的 Oracle 23.8 环境打补丁升级到 23.26，体验一下 Oracle AI Database 26ai 版本。

# 补丁下载
目前 Oracle MOS 已经提供 23.26 的补丁下载路径，参考文档：[Oracle AI Database 26ai Proactive Patch Information (Doc ID 3053981.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=3053981.1)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978709024682029056_395407.png)

点击链接即可下载 23.26 补丁：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978710134922686464_395407.png)

下载完成后，解压查看一下 README 文档：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978711179946110976_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978710904283869184_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978711334896283648_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978711563813007360_395407.png)

整体看起来和 19C RU 的安装步骤没有什么区别。

# 补丁升级
将下载好的 OPatch 和 RU 补丁上传到数据库主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978713672042164224_395407.png)

检查当前数据库补丁版本：
```bash
[oracle@orcl:/home/oracle]$ opatch lspatches
37701424;OCW RELEASE UPDATE 23.8.0.25.04 (37701424) Gold Image
37701421;Database Release Update : 23.8.0.25.04 (37701421) Gold Image

OPatch succeeded.
[oracle@orcl:/home/oracle]$ opatch version
OPatch Version: 12.2.0.1.46

OPatch succeeded.
```
升级 OPatch 补丁：
```bash
[oracle@orcl:/home/oracle]$ unzip -qo /soft/p6880880_230000_Linux-x86-64.zip -d $ORACLE_HOME
[oracle@orcl:/home/oracle]$ opatch version
OPatch Version: 12.2.0.1.47

OPatch succeeded.
```
确保 OPatch 版本符合 12.2.0.1.47 之后，针对单机数据库，需要关闭所有 Oracle 相关的服务：
>If this is not an Oracle RAC environment, shut down all instances and listeners associated with the Oracle home that you are updating.

```bash
[oracle@orcl:/home/oracle]$ sas

SQL*Plus: Release 23.0.0.0.0 - Production on Thu Oct 16 20:55:54 2025
Version 23.8.0.25.04

Copyright (c) 1982, 2025, Oracle.  All rights reserved.


Connected to:
Oracle Database 23ai Enterprise Edition Release 23.0.0.0.0 - Limited Availability
Version 23.8.0.25.04

SYS@orcl SQL> show pdbs

    CON_ID CON_NAME                       OPEN MODE  RESTRICTED
---------- ------------------------------ ---------- ----------
         2 PDB$SEED                       READ ONLY  NO
         3 PDB01                          READ WRITE NO
SYS@orcl SQL> alter pluggable database all close;

Pluggable database altered.

SYS@orcl SQL> shu immediate
Database closed.
Database dismounted.
ORACLE instance shut down.
SYS@orcl SQL> exit
Disconnected from Oracle Database 23ai Enterprise Edition Release 23.0.0.0.0 - Limited Availability
Version 23.8.0.25.04
[oracle@orcl:/home/oracle]$ lsnrctl stop

LSNRCTL for Linux: Version 23.0.0.0.0 - Production on 16-OCT-2025 20:57:27

Copyright (c) 1991, 2025, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=orcl)(PORT=1521)))
The command completed successfully
```
即可进行补丁安装：
```bash
[oracle@orcl:/home/oracle]$ cd /soft/
[oracle@orcl:/soft]$ unzip -q p38404116_230000_Linux-x86-64.zip 
[oracle@orcl:/soft]$ cd 38404116/
[oracle@orcl:/soft/38404116]$ opatch apply -silent
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978818717928665088_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978818835310456832_395407.png)

检查补丁补丁：
```bash
[oracle@orcl:/home/oracle]$ opatch lspatches
38404116;Database Release Update : 23.26.0.0.0 (38404116)
37701424;OCW RELEASE UPDATE 23.8.0.25.04 (37701424) Gold Image

OPatch succeeded.
```
补丁安装完成后，启动数据库实例：
```sql
SQL> startup
-- 如果配置过 save state，则 pdb 已经都能随 CDB 启动，如果没有则执行以下命令开启所有 PDB
SQL> alter pluggable database all open;
SQL> alter pluggable database all save state;
```
这里启动遇到报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978819790810656768_395407.png)

定睛一看，原来补丁安装后变成了 `Release 23.26.0.0.0 - for Oracle Cloud and Engineered Systems`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978847106089627648_395407.png)

这个版本在启动时会进行大量的硬编码检查：
- kgcs_oracle_cloud
- kscs_is_oracle_cloud
- kscs_is_exadata_or_oracle_cloud
- kcc_check_exadata
- ksxp_real_exadata_box

而我使用的是 VMware 的虚拟化环境：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978847611113189376_395407.png)

自然是会报错 `ora-27350`，不支持的平台，狡诈啊，看来补丁升级无法继续下去了，但是大致的步骤我还是写一下，都是通用的，等正式版发布可以直接应用。

---
以下部分均为预测，并非实际运行，仅作参考！

执行 datapatch：
```bash
## 如果不放心可以先执行以下命令进行预安装检查
$ datapatch -sanity_checks
## 正式 datapatch
$ datapatch -verbose
```
等待 datapatch 执行完成后，编译所有 PDB 的无效对象：
```bash
$ cd $ORACLE_HOME/rdbms/admin
$ $ORACLE_HOME/perl/bin/perl $ORACLE_HOME/rdbms/admin/catcon.pl -n 1 -e -b utlrp -d $ORACLE_HOME/rdbms/admin utlrp.sql
```
补丁安装完成，检查补丁版本：
```bash
$ opatch lspatches
```
确认一切都正常之后，打开监听，数据库开始提供访问：
```bash
$ lsnrctl start
SQL> alter system register;
```
至此，Oracle AI Database 26ai 升级完成，以上从 datapatch 开始都是预测，无法验证。

# 写在最后
回过去仔细看了，其实 Oracle 文档一开始就标注了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978848124785405952_395407.png)

只是我选择选的忽略了而已，就折腾到这吧！