---
title: 免费分享一个生产可用的 MySQL8 一键安装脚本
date: 2026-01-16 16:50:29
tags: [墨力计划,mysql]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2012081216519479296
---

最近正好在研究 MySQL 数据库，花了点时间写了一个 **MySQL 8 的一键安装脚本**，给大家分享一下，如果有使用问题，**可以在评论区留言**。

因为**代码太长**，而且很容易因为**格式问题**导致脚本错误，所以只提供网盘链接进行下载。
**关注下方公众号**：回复关键字 `mysql` 即可获取下载链接。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012084682175897600_395407.png)


## 脚本简介
目前本脚本用于在 Linux 主机上通过 MySQL 二进制 tar 包快速完成 MySQL 8.0 的安装部署，并配套基础环境优化、残留清理、日志记录和自动备份能力。脚本运行过程中会将输出同时打印到屏幕并写入日志文件，便于排查问题与留痕。

![](https://files.mdnice.com/user/16270/cab2d3d3-4a46-4c10-8c00-9a371519add4.png)

## 脚本主要能力
* **系统基线优化（默认执行）**：处理防火墙、SELinux、SWAP、时区、limits/file-max、GRUB 内核参数等。
* **MySQL 安装与配置**：解压安装包到指定目录，生成目录结构与 `my.cnf`，自动计算 `innodb_buffer_pool_size`（默认取物理内存 70%，上限 64G）。
* **初始化与启动**：执行初始化（`--initialize`）、生成 systemd unit、启动服务并做健康检查。
* **root 密码处理**：从错误日志解析临时密码并重置为指定密码，同时生成 `/root/.my.cnf` 方便免密登录。
* **自动备份**：生成 mysqldump 每日全备脚本（排除系统库、按库拆分、压缩、校验、保留 7 天）并写入 root crontab 定时执行。
* **MySQL 残留检测与清理**：检测旧 mysqld 服务/进程/目录/socket 等残留，交互确认后执行清理。

## 脚本执行步骤

1. **环境检查**：解析参数、检查依赖命令、识别操作系统信息。
2. **（可选）仅基线模式**：`--baseline-only` 只执行系统基线，不安装 MySQL。
3. **残留清理**：发现 MySQL 残留则提示确认，确认后停止服务/杀进程/删除目录与 unit。
4. **安装前校验**：检查 mysqld 进程、端口占用、安装目录/数据目录是否仍存在残留。
5. **系统基线优化**：按发行版执行防火墙/SELinux/SWAP/limits/时区/GRUB 等配置。
6. **安装部署**：创建 mysql 用户/组、解压二进制包、写入 `my.cnf`。
7. **初始化与启动**：初始化数据目录、生成 systemd 服务、启动并等待就绪。
8. **账号与免密**：重置 root 密码并写 `/root/.my.cnf`。
9. **备份与定时任务**：生成备份脚本并安装 crontab 定时任务。
10. **总结输出**：打印关键路径、端口、socket、日志文件位置等信息。

## 常用用法

正常安装：

```bash
bash install_mysql8.sh -p /path/mysql-8.0.xx-linux-x86_64.tar.gz
```

仅执行系统基线（不安装 MySQL）：

```bash
bash install_mysql8.sh --baseline-only
```

## 安装演示
这里我演示一下脚本的执行过程：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012083110767321088_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012083188081434624_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012083259782553600_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012083328996958208_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012083400887328768_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012083481854173184_395407.png)

安装完成后，测试免密登陆以及 mysqldump 备份：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012083699186229248_395407.png)

脚本还自动配置了一个备份任务：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260116-2012083919815008256_395407.png)

脚本支持重复多次执行，大概功能就是这样了，大家可以自行测试！

