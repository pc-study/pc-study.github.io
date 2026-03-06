---
title: YashanDB 归档模式开关
date: 2025-12-27 13:12:21
tags: [墨力计划,yashandb]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2000492555332034560
---

# 前言

YashanDB 在创建数据库时，提供了配置归档模式的相应参数：
- **yasboot 的建库参数**：ISARCHIVELOG=true|false；
- **CREATE DATABASE 参数**：ARCHIVELOG|NOARCHIVELOG；

默认情况下，安装完成后 YashanDB 将直接运行于归档模式，无需手动开启。

# 开启归档
本文模拟一下数据库未开启归档时，如何去开启归档模式。

查看归档模式是否开启：
```sql
-- 查看当前数据库的归档模式
-- ARCHIVELOG 表示归档模式已开启
-- NOARCHIVELOG表示归档模式已关闭
SQL> SELECT database_name,log_mode,open_mode FROM V$DATABASE;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000423028493213696_395407.png)

归档路径默认为 `$YASDB_DATA/archive`，可通过 ARCHIVE_LOCAL_DEST 参数进行自定义配置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000425600553672704_395407.png)

修改归档路径（必须写入到 SPFILE 参数文件中）：
```sql
-- 需要重启后生效，YAC 则需要配置到共享存储盘中
SQL> ALTER SYSTEM SET ARCHIVE_LOCAL_DEST='+DG0/arch' SCOPE=SPFILE;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000425839683526656_395407.png)

检查数据库实例启动方式：
```bash
[yashan@yac01 ~]$ ycsctl get AUTO_START
YCS AUTO_START = ALWAYS
```
关闭数据库集群：
```bash
yasboot cluster stop -c yasdb
```
~~重启数据库实例至 MOUNT 阶段：~~
```bash
yasboot cluster restart -c yasdb -m mount
```
使用 yasboot 工具启动或重启共享集群时，目前暂不支持将集群启动到 MOUNT 状态：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000421564668534784_395407.png)

需要使用 ycsctl 命令启动：
```bash
## AUTO_START = ALWAYS（默认值），则执行如下命令直接启动YCS实例和数据库实例
ycsctl start ycs -m mount

## AUTO_START = NEVER，则依次执行如下两条命令先启动YCS实例，再启动数据库实例
ycsctl start ycs
ycsctl start instance -m mount
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000484140954230784_395407.png)

开启到归档模式：
```sql
SQL> ALTER DATABASE ARCHIVELOG;
```

如果归档路径不存在，需要手动创建，否则归档会开启失败：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000490276600225792_395407.png)

手动创建归档目录：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000485104754450432_395407.png)

创建后再次开启归档模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000490220870000640_395407.png)

重启集群：
```bash
yasboot cluster restart -c yasdb
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000491021076094976_395407.png)

归档模式开启成功。