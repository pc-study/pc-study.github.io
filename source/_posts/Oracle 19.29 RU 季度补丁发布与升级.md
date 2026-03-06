---
title: Oracle 19.29 RU 季度补丁发布与升级
date: 2025-10-23 09:14:07
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1980792673501982720
---

# 前言
老样子，Oracle 在 10 月份发布第三个季度补丁，推迟一周，19C 最新 RU 补丁 19.29 如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251022-1980792921343406080_395407.png)

Windows 补丁依然没有发布，可能要晚一周左右：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251022-1980896942171369472_395407.png)

OPatch 补丁没有更新，但是 12.2.0.1.47 依然适用于 19.29，可以正常打补丁：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251022-1980897401527349248_395407.png)

老规矩，下载后测试安装一下！

# 19.29 补丁升级
使用 [Oracle 数据库一键安装脚本](https://www.modb.pro/course/148) 简单安装一套 19C 环境：
```bash
[root@lucifer soft]# ./OracleShellInstall -lf ens192 -opd Y
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251022-1980912478297010176_395407.png)

安装完重启主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251022-1980914262767841280_395407.png)

替换 OPatch：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981153931581468672_395407.png)

关闭数据库以及监听：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981154933973987328_395407.png)

RU 补丁预检查：
```bash
cd /soft/38291812
opatch prereq CheckConflictAgainstOHWithDetail -ph ./
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981154676837986304_395407.png)

OJVM 补丁预检查：
```bash
cd /soft/38194382
opatch prereq CheckConflictAgainstOHWithDetail -ph ./
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981165359558307840_395407.png)

补丁升级前准备已完成。

## RU 升级
开始打补丁：
```bash
opatch apply -silent
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981155834709159936_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981156635703783424_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981156690665943040_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981156831162544128_395407.png)

## OJVM 升级
开始打补丁：
```bash
opatch apply -silent
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981165693357797376_395407.png)


检查补丁版本：
```bash
opatch lspatches
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981165882260860928_395407.png)

启动数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981157366829690880_395407.png)

datapatch 数据库：
```bash
datapatch -verbose
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981160249826488320_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981166662816641024_395407.png)

编译无效对象：
```bash
cd $ORACLE_HOME/rdbms/admin
$ORACLE_HOME/perl/bin/perl $ORACLE_HOME/rdbms/admin/catcon.pl -n 1 -e -b utlrp -d $ORACLE_HOME/rdbms/admin utlrp.sql
```

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981160804934234112_395407.png)

启动监听：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251023-1981166912553889792_395407.png)

补丁安装完成。

# 写在最后
Oracle 每季度补丁发布用于修复已知 BUG，及时应用补丁能够减少 BUG 的可能性，建议定期对数据库进行补丁升级。