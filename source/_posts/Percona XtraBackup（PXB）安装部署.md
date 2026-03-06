---
title: Percona XtraBackup（PXB）安装部署
date: 2026-01-08 15:28:37
tags: [墨力计划,mysql,percona]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2008050257889402880
---

# 前言
数据库备份是 DBA 日常工作中的重中之重，备份一般可以分为逻辑备份和物理备份。在 MySQL 数据库中，逻辑备份通常使用 `mysqldump`，而物理备份则使用 `Percona XtraBackup`。

# 介绍
**Percona XtraBackup（简称 PXB）** 是 Percona 公司开发的一个用于 MySQL 数据库物理热备的备份工具，支持 MySQL、Percona Server 和 MariaDB，并且全部开源，真可谓是业界良心（**听说 RDS MySQL 就是基于 PXB 做的**）。

**Percona XtraBackup 的部分功能简介**：
- 无需暂停数据库即可创建 InnoDB 热备份；
- 对 MySQL 进行增量备份；
- 将压缩的 MySQL 备份流式传输到另一台服务器；
- 在线在 MySQL 服务器之间迁移表；
- 轻松创建新的 MySQL 复制副本；
- 在不增加服务器负载的情况下备份 MySQL；
- Percona XtraBackup 根据每秒 I/O 操作数进行限流；
- 即使是完整备份，PXB 也能导出单个表，而无需考虑 InnoDB 版本；
- 备份锁是 Percona Server 中提供的一种轻量级替代方案 `FLUSH TABLES WITH READ LOCK`，PXB 会自动使用备份锁来复制非 InnoDB 数据，从而避免阻塞修改 InnoDB 表的 DML 查询。

PXB 为所有版本的 Percona Server for MySQL 和 MySQL 提供 MySQL 热备份，它支持流式、压缩和增量 MySQL 备份。

## 发行版本
目前 PXB 一共发行了 3 个版本：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260105-2008056582497181696_395407.png)

我整理了一下 PXB 和 MySQL 之间的版本对应关系，大家可以参考：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260105-2008055256467972096_395407.png)

可以看到从 8.0 开始，PXB 的版本号已经严格与 MySQL 的主版本保持一致。为了确保备份有效性，PXB 会在运行时**默认检查自身版本是否高于或等于目标数据库版本**。**如果PXB版本更低，备份将中止**，这是一个很重要的安全检查。

## 备份原理
PXB 是基于 InnoDB 的崩溃恢复功能，通过以下流程图可以清晰的了解 PXB 8.0 版本的工作原理：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260105-2008061860466221056_395407.png)

具体的 PXB 原理介绍可以查看官方文档：
- https://docs.percona.com/percona-xtrabackup/2.4/how_xtrabackup_works.html
- https://docs.percona.com/percona-xtrabackup/8.0/how-xtrabackup-works.html
- https://docs.percona.com/percona-xtrabackup/8.4/how-xtrabackup-works.html

网上还看到一张 PXB 2.4 版本的备份流程图，仅供参考：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260105-2008064372980146176_395407.png)

总的来说，PXB 是一个“**物理备份+逻辑应用**”的工具。从 2.4 到 8.0/8.4，其演进方向是：在保持核心流程稳定的同时，积极采用 MySQL 官方新特性（如备份锁），并引入创新机制（如 Redo Log 消费者）来提升备份的可靠性、兼容性和对生产环境的影响。

# PXB 安装部署
## 软件下载
PXB 下载地址：https://www.percona.com/downloads，找到 **Percona XtraBackup**：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260105-2008065750515408896_395407.png)

根据 MySQL 以及 Linux 主机版本找到需要下载的 PXB 版本，如下所示：
```bash
## 获取系统 glibc 版本
[root@mysql8 ~]# ldd --version | grep ldd
ldd (GNU libc) 2.17
## 获取 mysql 主版本
[root@mysql8 ~]# mysql -V
mysql  Ver 8.0.30 for Linux on x86_64 (MySQL Community Server - GPL)
```
PXB 的安装包分为 rpm 包和二进制包，我比较喜欢用二进制包，解压就是安装，很方便。

选择需要下载的二进制安装包：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260105-2008066995078651904_395407.png)

因为 8.0.35-32 不支持 glibc 2.17，所以选择最新的 8.0.35.31 进行下载：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260105-2008067347307913216_395407.png)

下载后上传安装包到 MySQL 数据库主机进行解压即可。

## PXB 安装
解压二进制安装包：
```bash
## 创建 PXB 安装目录
[root@mysql8 ~]# mkdir -p /usr/local/xtrabackup
## 解压安装包到安装目录
[root@mysql8 ~]# tar -xf percona-xtrabackup-8.0.35-31-Linux-x86_64.glibc2.17.tar.gz -C /usr/local/xtrabackup --strip-components=1
## 检查安装情况
[root@mysql8 tmp]# ll /usr/local/xtrabackup/
total 0
drwxr-xr-x 2 root root 91 Jul 15  2024 bin
drwxr-xr-x 2 root root 22 Jul 15  2024 docs
drwxr-xr-x 2 root root 36 Jul 15  2024 include
drwxr-xr-x 4 root root 97 Jul 15  2024 lib
drwxr-xr-x 4 root root 30 Jul 15  2024 man
drwxr-xr-x 3 root root 18 Jul 15  2024 percona-xtrabackup-8.0-test
```
设置环境变量：
```bash
[root@mysql8 ~]# echo "export PATH=\$PATH:/usr/local/xtrabackup/bin" >> /etc/profile
[root@mysql8 ~]# source /etc/profile
```
检查安装是否成功：
```bash
[root@mysql8 ~]# xtrabackup --version
2026-01-05T14:03:44.617022+07:00 0 [Note] [MY-011825] [Xtrabackup] recognized server arguments: --datadir=/data/mysql/data --open_files_limit=65535 --innodb_open_files=65535 --innodb_flush_log_at_trx_commit=1 --innodb_log_file_size=1G --innodb_log_group_home_dir=./ --log_bin=mysql-bin --server-id=1 --innodb_buffer_pool_size=4G 
xtrabackup version 8.0.35-31 based on MySQL server 8.0.35 Linux (x86_64) (revision id: 2b9a1f65)
```
PXB 安装完成。

# 写在最后
PXB 的二进制安装非常简单，解压即可，为此成文一篇大可不必，但是为了深入学习 PXB，所以逼着自己写了一下，也算是作为记录，对于初学者来说也算是能有所帮助，同时后续也可以进行回顾。