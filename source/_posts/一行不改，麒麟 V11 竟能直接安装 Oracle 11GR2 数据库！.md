---
title: 一行不改，麒麟 V11 竟能直接安装 Oracle 11GR2 数据库！
date: 2025-08-31 21:36:50
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1962147454577553408
---

# 前言

最近麒麟 V11（Swan25）正式发布了，作为国产操作系统的新版本，很多 DBA 朋友都在关心 Oracle 数据库的兼容性问题。毕竟 Oracle 官方的支持列表里可没有国产系统，每次在新系统上部署 Oracle 都是一场艰难的战斗。

不过今天要分享一个让人惊喜的发现——我的 Oracle 一键安装脚本（**OracleShellInstall**），在麒麟 V11 上完全可以直接使用，一行代码都不用改。

# 安装演示

## 系统环境

先看看测试环境，这是一台刚装好的麒麟 V11 服务器：

```bash
[root@orcl:/root]# cat /etc/os-release
NAME="Kylin Linux Advanced Server"
VERSION="V11 (Swan25)"
ID="kylin"
VERSION_ID="V11"
PRETTY_NAME="Kylin Linux Advanced Server V11 (Swan25)"
```

## 一键安装

把 Oracle 11g 的安装包和脚本放到 /soft 目录，直接执行：

```bash
[root@kylinv11 soft]# ./OracleShellInstall -lf ens33 -opd Y

   ███████                             ██          ████████ ██               ██  ██ ██                    ██              ██  ██
  ██░░░░░██                           ░██         ██░░░░░░ ░██              ░██ ░██░██                   ░██             ░██ ░██
 ██     ░░██ ██████  ██████    █████  ░██  █████ ░██       ░██       █████  ░██ ░██░██ ███████   ██████ ██████  ██████   ░██ ░██
░██      ░██░░██░░█ ░░░░░░██  ██░░░██ ░██ ██░░░██░█████████░██████  ██░░░██ ░██ ░██░██░░██░░░██ ██░░░░ ░░░██░  ░░░░░░██  ░██ ░██
░██      ░██ ░██ ░   ███████ ░██  ░░  ░██░███████░░░░░░░░██░██░░░██░███████ ░██ ░██░██ ░██  ░██░░█████   ░██    ███████  ░██ ░██
░░██     ██  ░██    ██░░░░██ ░██   ██ ░██░██░░░░        ░██░██  ░██░██░░░░  ░██ ░██░██ ░██  ░██ ░░░░░██  ░██   ██░░░░██  ░██ ░██
 ░░███████  ░███   ░░████████░░█████  ███░░██████ ████████ ░██  ░██░░██████ ███ ███░██ ███  ░██ ██████   ░░██ ░░████████ ███ ███
  ░░░░░░░   ░░░     ░░░░░░░░  ░░░░░  ░░░  ░░░░░░ ░░░░░░░░  ░░   ░░  ░░░░░░ ░░░ ░░░ ░░ ░░░   ░░ ░░░░░░     ░░   ░░░░░░░░ ░░░ ░░░


注意：本脚本仅用于新服务器上实施部署数据库使用，严禁在已运行数据库的主机上执行，以免发生数据丢失或者损坏，造成不可挽回的损失！！！

请选择安装模式 [单机(si)/单机ASM(sa)/集群(rac)] : si

数据库安装模式: single

请选择数据库版本 [11|12|19|21|23] : 11

数据库版本:     11

!!! 免责声明：当前操作系统版本是 [ Kylin Linux Advanced Server V11 (Swan25) ] 不在 Oracle 官方支持列表，本脚本只负责安装，请确认是否继续安装 (Y/N): [Y]

OracleShellInstall 开始安装，详细安装过程可查看日志： tail -2000f /soft/print_shell_install_20250831014116.log

正在进行安装前检查，请稍等......

正在检测安装包 /soft/p13390677_112040_Linux-x86-64_1of7.zip 的 MD5 值是否正确，请稍等......
正在检测安装包 /soft/p13390677_112040_Linux-x86-64_2of7.zip 的 MD5 值是否正确，请稍等......

正在配置本地软件源......已完成 (耗时: 1 秒)
正在获取操作系统信息......已完成 (耗时: 1 秒)
正在安装依赖包......已完成 (耗时: 50 秒)
正在配置 Swap......已完成 (耗时: 47 秒)
正在禁用防火墙......已完成 (耗时: 1 秒)
正在禁用 selinux......已完成 (耗时: 1 秒)
正在配置 nsyctl......已完成 (耗时: 1 秒)
正在配置主机名和 hosts 文件......已完成 (耗时: 1 秒)
正在创建用户和组......已完成 (耗时: 2 秒)
正在创建安装目录......已完成 (耗时: 2 秒)
正在配置透明大页 && NUMA && 磁盘 IO 调度器......已完成 (耗时: 1 秒)
正在配置操作系统参数 sysctl......已完成 (耗时: 1 秒)
正在配置 RemoveIPC......已完成 (耗时: 1 秒)
正在配置用户限制 limit......已完成 (耗时: 1 秒)
正在配置 shm 目录......已完成 (耗时: 1 秒)
正在配置用户环境变量......已完成 (耗时: 1 秒)
正在解压 Oracle 安装包以及补丁......已完成 (耗时: 20 秒)
正在安装 Oracle 软件以及补丁......已完成 (耗时: 152 秒)
正在创建监听......已完成 (耗时: 4 秒)
正在创建数据库......已完成 (耗时: 269 秒)
正在优化数据库......已完成 (耗时: 79 秒)

恭喜！Oracle 一键安装执行完成 (耗时: 641 秒)，现在是否重启主机：[Y/N] Y

正在重启当前节点主机......
```

选择单机模式，选择 11g 版本，然后就是见证奇迹的时刻了，**安装总耗时：641 秒，也就是 10 分钟多一点。**

## 验证结果

重启后，切换到 oracle 用户，数据库已经正常运行：

```sql
[root@orcl:/root]# so
[oracle@orcl:/home/oracle]$ sas

SQL*Plus: Release 11.2.0.4.0 Production on Sun Aug 31 01:56:26 2025

Copyright (c) 1982, 2013, Oracle.  All rights reserved.


Connected to:
Oracle Database 11g Enterprise Edition Release 11.2.0.4.0 - 64bit Production
With the Partitioning, OLAP, Data Mining and Real Application Testing options

SYS@orcl SQL> select instance_name,status,startup_time from v$instance;

INSTANCE_NAME    STATUS       STARTUP_TIME
---------------- ------------ ------------------
orcl             OPEN         31-AUG-25

SYS@orcl SQL> show parameter name

NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
cell_offloadgroup_name               string
db_file_name_convert                 string
db_name                              string      orcl
db_unique_name                       string      orcl
global_names                         boolean     FALSE
instance_name                        string      orcl
lock_name_space                      string
log_file_name_convert                string
processor_group_name                 string
service_names                        string      orcl
SYS@orcl SQL> exit
Disconnected from Oracle Database 11g Enterprise Edition Release 11.2.0.4.0 - 64bit Production
With the Partitioning, OLAP, Data Mining and Real Application Testing options
```

数据库实例 orcl 已经正常启动，状态是 OPEN，一切正常。

# 写在最后

**OracleShellInstall** 不仅仅是一个安装脚本，更是 Oracle DBA 的得力助手。它将复杂的数据库部署过程标准化、自动化，让 DBA 能够将更多精力投入到数据库优化、架构设计等更有价值的工作中。

无论您是经验丰富的资深 DBA，还是刚入门的初学者，**OracleShellInstall** 都能成为您的最佳部署伙伴。

**让 Oracle 数据库部署，从此变得简单！** 🚀

---

_注：本工具持续更新优化中，欢迎订阅！_
