---
title: Rocky Linux 10 一键安装 Oracle 11GR2 单机 ASM
date: 2025-06-16 12:08:18
tags: [rocky,oracle,linux系统,asm,墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1934463014976106496
---

## 前言
Rocky Linux 10.0 作为 RHEL10 衍生发行版的最新版本。Rocky Linux 10.0 融合了 RHEL 10.0 的最新变化，可以视作 CentOS 替代版，目标是成为一个开放的企业操作系统，100% 兼容 Enterprise Linux。总之，Rocky Linux 是一个免费开源、兼容 RHEL 的 Linux 发行版，由社区驱动开发，可以用于服务器、工作站等企业级应用场景。

本文介绍如何使用 Oracle 一键安装脚本 在 Rocky Linux 10.0 系统上一键安装 Oracle 11GR2 单机 ASM。

>**脚本下载：[https://www.modb.pro/course/148](https://www.modb.pro/course/148)**
**作者微信：[Lucifer-0622](Lucifer-0622)** 

## 前置准备
1. 系统组安装好操作系统（支持最小化安装）
2. 网络组配置好主机网络，通常只需要一个公网 IP 地址
3. 存储组配置并在主机层挂载好 ASM 磁盘，虚拟化环境需要确保已开启磁盘的 UUID
4. DBA 创建软件目录：`mkdir /soft`
5. DBA 上传 Oracle 安装介质（基础包，补丁包）到 /soft 目录下
6. DBA 上传 Oracle 一键安装脚本到 /soft 目录下，授予脚本执行权限：`chmod +x OracleshellInstall`
7. DBA 挂载主机 ISO 镜像，这里只需要 mount 上即可（这个很简单，不了解的可以百度下）
8. 根据脚本安装脚本以及实际情况，配置好脚本的安装参数，在 /soft 目录下执行一键安装即可。

## 环境信息
```bash
# 主机版本
root@RockyLinux10-1:/root# cat /etc/os-release 
NAME="Rocky Linux"
VERSION="10.0 (Red Quartz)"
ID="rocky"
ID_LIKE="rhel centos fedora"
VERSION_ID="10.0"
PLATFORM_ID="platform:el10"
PRETTY_NAME="Rocky Linux 10.0 (Red Quartz)"
ANSI_COLOR="0;32"
LOGO="fedora-logo-icon"
CPE_NAME="cpe:/o:rocky:rocky:10::baseos"
HOME_URL="https://rockylinux.org/"
VENDOR_NAME="RESF"
VENDOR_URL="https://resf.org/"
BUG_REPORT_URL="https://bugs.rockylinux.org/"
SUPPORT_END="2035-05-31"
ROCKY_SUPPORT_PRODUCT="Rocky-Linux-10"
ROCKY_SUPPORT_PRODUCT_VERSION="10.0"
REDHAT_SUPPORT_PRODUCT="Rocky Linux"
REDHAT_SUPPORT_PRODUCT_VERSION="10.0"

# 网络信息
root@RockyLinux10-1:/root# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute 
       valid_lft forever preferred_lft forever
2: ens192: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:0c:29:d2:ea:90 brd ff:ff:ff:ff:ff:ff
    altname enp11s0
    altname enx000c29d2ea90
    inet 10.168.1.101/24 brd 10.168.1.255 scope global noprefixroute ens192
       valid_lft forever preferred_lft forever
    inet6 fd97:cf9e:1fd5:0:20c:29ff:fed2:ea90/64 scope global noprefixroute 
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fed2:ea90/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

# 挂载本地 ISO 镜像
root@RockyLinux10-1:/root# mount | grep iso9660 | grep -v "/run/media"
/dev/sr0 on /mnt type iso9660 (ro,relatime,nojoliet,check=s,map=n,blocksize=2048,iocharset=utf8)
root@RockyLinux10-1:/root# df -h|grep /mnt
/dev/sr0             7.2G  7.2G     0  100% /mnt

# 安装包存放在 /soft 目录下
root@RockyLinux10-1:/soft# ll
-rwxr-xr-x. 1 oracle oinstall     245613  6月16日 11:32 OracleShellInstall
-rw-r--r--. 1 oracle oinstall 1395582860  4月28日 20:05 p13390677_112040_Linux-x86-64_1of7.zip
-rw-r--r--. 1 oracle oinstall 1151304589  4月28日 20:03 p13390677_112040_Linux-x86-64_2of7.zip
-rw-r--r--. 1 oracle oinstall 1205251894  6月15日 12:29 p13390677_112040_Linux-x86-64_3of7.zip
-rw-r--r--. 1 oracle oinstall  174911877  6月15日 12:28 p18370031_112040_Linux-x86-64.zip
```
确保安装环境准备完成后，即可执行一键安装。

## 安装命令
使用标准生产环境安装参数：
```bash
# 根据脚本 README 或者 -h 命令提示，编辑好一键安装命令，进入 /soft 目录执行安装：
root@RockyLinux10-1:/soft# chmod +x OracleShellInstall
root@RockyLinux10-1:/soft# ./OracleShellInstall \
-lf ens192 `# 公网IP的网卡名称`\
-n RockyLinux10-1 `# 主机名`\
-dd /dev/sdb `# DATA磁盘组磁盘列表`\
-opd Y `# 优化数据库`

## 安装过程
   ███████                             ██          ████████ ██               ██  ██ ██                    ██              ██  ██
  ██░░░░░██                           ░██         ██░░░░░░ ░██              ░██ ░██░██                   ░██             ░██ ░██
 ██     ░░██ ██████  ██████    █████  ░██  █████ ░██       ░██       █████  ░██ ░██░██ ███████   ██████ ██████  ██████   ░██ ░██
░██      ░██░░██░░█ ░░░░░░██  ██░░░██ ░██ ██░░░██░█████████░██████  ██░░░██ ░██ ░██░██░░██░░░██ ██░░░░ ░░░██░  ░░░░░░██  ░██ ░██
░██      ░██ ░██ ░   ███████ ░██  ░░  ░██░███████░░░░░░░░██░██░░░██░███████ ░██ ░██░██ ░██  ░██░░█████   ░██    ███████  ░██ ░██
░░██     ██  ░██    ██░░░░██ ░██   ██ ░██░██░░░░        ░██░██  ░██░██░░░░  ░██ ░██░██ ░██  ░██ ░░░░░██  ░██   ██░░░░██  ░██ ░██
 ░░███████  ░███   ░░████████░░█████  ███░░██████ ████████ ░██  ░██░░██████ ███ ███░██ ███  ░██ ██████   ░░██ ░░████████ ███ ███
  ░░░░░░░   ░░░     ░░░░░░░░  ░░░░░  ░░░  ░░░░░░ ░░░░░░░░  ░░   ░░  ░░░░░░ ░░░ ░░░ ░░ ░░░   ░░ ░░░░░░     ░░   ░░░░░░░░ ░░░ ░░░ 


注意：本脚本仅用于新服务器上实施部署数据库使用，严禁在已运行数据库的主机上执行，以免发生数据丢失或者损坏，造成不可挽回的损失！！！                                                                                  

请选择安装模式 [单机(si)/单机ASM(sa)/集群(rac)] : sa

数据库安装模式: standalone                                                                       

请选择数据库版本 [11|12|19|21|23] : 11

数据库版本:     11                                                                               

!!! 免责声明：当前操作系统版本是 [ Rocky Linux 10.0 (Red Quartz) ] 不在 Oracle 官方支持列表，本脚本只负责安装，请确认是否继续安装 (Y/N): [Y] 

OracleShellInstall 开始安装，详细安装过程可查看日志： tail -2000f /soft/print_shell_install_20250616193744.log                                                                                  

正在进行安装前检查，请稍等......                                                                                  

正在检测安装包 /soft/p13390677_112040_Linux-x86-64_3of7.zip 的 MD5 值是否正确，请稍等......                                                                                  
正在检测安装包 /soft/p13390677_112040_Linux-x86-64_1of7.zip 的 MD5 值是否正确，请稍等......                                                                                  
正在检测安装包 /soft/p13390677_112040_Linux-x86-64_2of7.zip 的 MD5 值是否正确，请稍等......                                                                                  

正在配置本地软件源......已完成 (耗时: 1 秒)
正在检测安装包 /soft/p18370031_112040_Linux-x86-64.zip 的 MD5 值是否正确，请稍等......                                                                                  
正在获取操作系统信息......已完成 (耗时: 1 秒)
正在安装依赖包......已完成 (耗时: 64 秒)
正在配置 Swap......已完成 (耗时: 47 秒)
正在禁用防火墙......已完成 (耗时: 1 秒)
正在禁用 selinux......已完成 (耗时: 1 秒)
正在配置 nsyctl......已完成 (耗时: 1 秒)
正在配置主机名和 hosts 文件......已完成 (耗时: 1 秒)
正在创建用户和组......已完成 (耗时: 1 秒)
正在创建安装目录......已完成 (耗时: 1 秒)
正在配置 Avahi-daemon 服务......已完成 (耗时: 2 秒)
正在配置透明大页 && NUMA && 磁盘 IO 调度器......已完成 (耗时: 1 秒)
正在配置操作系统参数 sysctl......已完成 (耗时: 1 秒)
正在配置 RemoveIPC......已完成 (耗时: 1 秒)
正在配置用户限制 limit......已完成 (耗时: 1 秒)
正在配置 shm 目录......已完成 (耗时: 1 秒)
正在配置用户环境变量......已完成 (耗时: 1 秒)
正在解压 Grid 安装包以及补丁......已完成 (耗时: 21 秒)
正在解压 Oracle 安装包以及补丁......已完成 (耗时: 18 秒)
正在安装 Grid 软件以及补丁......已完成 (耗时: 246 秒)
正在安装 Oracle 软件以及补丁......已完成 (耗时: 165 秒)
正在创建数据库......已完成 (耗时: 357 秒)
正在优化数据库......已完成 (耗时: 276 秒)

恭喜！Oracle 一键安装执行完成 (耗时: 1227 秒)，现在是否重启主机：[Y/N] Y

正在重启当前节点主机...... 
```

## 连接测试
验证环境是否成功安装：
```bash

[root@RockyLinux10-1:/root]# sg
[grid@RockyLinux10-1:/home/grid]$ crsctl stat res -t
--------------------------------------------------------------------------------
NAME           TARGET  STATE        SERVER                   STATE_DETAILS       
--------------------------------------------------------------------------------
Local Resources
--------------------------------------------------------------------------------
ora.DATA.dg
               ONLINE  ONLINE       rockylinux10-1                               
ora.asm
               ONLINE  ONLINE       rockylinux10-1           Started             
ora.ons
               OFFLINE OFFLINE      rockylinux10-1                               
--------------------------------------------------------------------------------
Cluster Resources
--------------------------------------------------------------------------------
ora.cssd
      1        ONLINE  ONLINE       rockylinux10-1                               
ora.diskmon
      1        OFFLINE OFFLINE                                                   
ora.evmd
      1        ONLINE  ONLINE       rockylinux10-1                               
ora.orcl.db
      1        ONLINE  ONLINE       rockylinux10-1           Open                
[grid@RockyLinux10-1:/home/grid]$ asmcmd lsdg
State    Type    Rebal  Sector  Block       AU  Total_MB  Free_MB  Req_mir_free_MB  Usable_file_MB  Offline_disks  Voting_files  Name
MOUNTED  EXTERN  N         512   4096  1048576     51200    33171                0           33171              0             N  DATA/
[grid@RockyLinux10-1:/home/grid]$ exit
注销
[root@RockyLinux10-1:/root]# so
[oracle@RockyLinux10-1:/home/oracle]$ sas

SQL*Plus: Release 11.2.0.4.0 Production on Mon Jun 16 12:13:21 2025

Copyright (c) 1982, 2013, Oracle.  All rights reserved.


Connected to:
Oracle Database 11g Enterprise Edition Release 11.2.0.4.0 - 64bit Production
With the Partitioning, Automatic Storage Management, OLAP, Data Mining
and Real Application Testing options

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
With the Partitioning, Automatic Storage Management, OLAP, Data Mining
and Real Application Testing 
```
数据库可以正常连接。
