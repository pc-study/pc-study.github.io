---
title: OGG 报错 OGG-02028，一个奇葩的 BUG！
date: 2025-05-09 15:00:38
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1919944820139765760
---

>大家好，这里是 **DBA学习之路**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
这俩天在测试 OGG 21.17 微服务版本，源端是 Oracle 19C（未安装补丁），在源端配置抽取进程后，进程启动后没多久，就会报错停止，报错内容如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1920050421742186496_395407.png)

**难道 OGG 还必须要开闪回？没听说过啊！** 出于好奇，仔细研究了一下这个问题，发现竟然是一个奇葩的 BUG：
>GG Integrated Extract (IE) Fails With OGG-02028 Failed to attach to logmining server ORA-19801: initialization parameter DB_RECOVERY_FILE_DEST (Doc ID 2794000.1)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1919942326277910528_395407.png)

为了验证，我还原重现了一下这个问题！

# 重现问题
## 设置闪回参数
重现问题很简单，就是设置一下闪回参数 db_recovery_file_dest 到 spfile：
```sql
SQL> alter system set db_recovery_file_dest='/oradata' scope=spfile;

System altered.

SQL> alter system set db_recovery_file_dest_size=20G;

System altered.
```
后续添加抽取进程时，就会中断报错 `OGG-02028`。

>**Tips**：这里有一个很奇葩的点，如果按照本文的解决方案修复这个问题之后（成功添加过抽取进程之后），不管再怎么设置闪回参数，都无法重现这个问题。

所以，重现这个问题，得要没有添加过抽取进程的数据库环境才可以。
## 添加抽取进程
在源端添加抽取进程，默认选择集成模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250507-1919952349284544512_395407.png)

自定义一个抽取进程名称，选择源端的 SDB，填写 Trial 名称（自定义）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250509-1920725780699557888_395407.png)

配置抽取进程 extract 的参数：
```bash
EXTRACT E_MYSQL
USERIDALIAS sdb DOMAIN OracleGoldenGate
SETENV (ORACLE_HOME = /u01/app/oracle/product/19.3.0/db)
SETENV (NLS_LANG="AMERICAN_AMERICA.AL32UTF8")
EXTTRAIL MYSQL/et
DDL INCLUDE MAPPED
BR BROFF
TABLE LUCIFER.*;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250509-1920725945233715200_395407.png)

创建并运行抽取进程：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250506-1919655976647536640_395407.png)

运行一段时间后，抽取进程挂掉了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250509-1920715462275510272_395407.png)

下面分析一下问题原因以及如何解决。

# 问题描述
这里重现问题之后，查看当前数据库的闪回参数：
```sql
SQL> show parameter db_recovery_file_dest

NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
db_recovery_file_dest                string
db_recovery_file_dest_size           big integer 20G
```
重启生效后，查看 spfile 参数文件：
```bash
[oracle@source:/home/oracle]$ cd $ORACLE_HOME/dbs
[oracle@source:/u01/app/oracle/product/19.3.0/db/dbs]$ strings spfilesdb.ora | grep db_recovery_file_dest
*.db_recovery_file_dest='/oradata'
*.db_recovery_file_dest_size=21474836480
```
这里可以看到闪回路径在 spfile 中存在参数值，但是在内存中并没有生效，看来是执行过以下命令：
```sql
SQL> alter system set db_recovery_file_dest='/oradata' scope=spfile;
```
根据报错内容：
>Oracle GoldenGate Capture for Oracle, E_MYSQL.prm: Failed to attach to logmining server OGG$CAP_E_MYSQL error 19,801 - ORA-19801: initialization parameter DB_RECOVERY_FILE_DEST is not set.

提示是没有找到 `DB_RECOVERY_FILE_DEST` 参数配置，说明不会读取 spfile 参数，而是直接读取内存参数值。接下来，就这个思路，尝试解决一下这个问题。

# 解决方案
既然是因为内存参数值无法读取到，spfile 文件中有值，那我们在可以停机的情况下，重启数据库让这个参数值生效即可：
```sql
SQL> shu immediate
SQL> startup
```
再次查看闪回参数：
```sql
SQL> show parameter db_recovery_file_dest

NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
db_recovery_file_dest                string      /oradata
db_recovery_file_dest_size           big integer 20G
```
此时，再次启动抽取进程：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250509-1920719544381878272_395407.png)

抽取进程正常运行，不会再中断，看起来思路没有问题。但是有个问题，正常源端应该不设置闪回参数的，我如果把闪回参数全都 reset 掉，重启数据库，再启动抽取进程，会不会报错？
```sql
SQL> alter system reset db_recovery_file_dest;

System altered.

SQL> alter system reset db_recovery_file_dest_size;

System altered.

SQL> shu immediate
SQL> startup
```
查看闪回参数：
```sql
SQL> show parameter db_recovery_file_dest

NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
db_recovery_file_dest                string
db_recovery_file_dest_size           big integer 0
```
检查 spfile 参数：
```bash
[oracle@source:/home/oracle]$ cd $ORACLE_HOME/dbs
[oracle@source:/u01/app/oracle/product/19.3.0/db/dbs]$ strings spfilesdb.ora | grep db_recovery_file_dest
```
现在已经没有设置闪回相关参数，重新启动抽取进程：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250509-1920721653013688320_395407.png)

抽取进程运行正常，那看来就是上面分析的思路了！

# 写在最后
OGG 在源端添加抽取进程，进程会读取内存参数，如果内存参数有设置闪回参数的 db_recovery_file_dest_size 值，但是没有设置 db_recovery_file_dest 值，那就会导致进程中断，报错：
>Oracle GoldenGate Capture for Oracle, E_MYSQL.prm: Failed to attach to logmining server OGG$CAP_E_MYSQL error 19,801 - ORA-19801: initialization parameter DB_RECOVERY_FILE_DEST is not set.

从 BUG 文档可以看到，从 RU 19.19 开始，这个问题已经被修复：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250509-1920732196441174016_395407.png)

所以，如果 RU 版本低于 19.19，我们只需要保证这两个参数值同步（都设置或者都不设置）缺一不可，**设置 spfile 无效**，就可以避免这个问题。

>**Tips**：最后再提一嘴，这个 BUG 十分诡异，建议大家能打补丁最好打补丁！！！

