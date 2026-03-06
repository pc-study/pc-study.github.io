---
title: Rocky Linux 9.4 一键安装 Oracle 11GR2 单机
date: 2024-08-01 12:36:30
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1818868354532335616
---

## 前言
Rocky Linux 9.4 作为 RHEL9 衍生发行版的最新版本。Rocky Linux 9.4 融合了 RHEL 9.4 的最新变化，可以视作 CentOS 替代版，目标是成为一个开放的企业操作系统，100% 兼容 Enterprise Linux。总之，Rocky Linux 是一个免费开源、兼容 RHEL 的 Linux 发行版，由社区驱动开发，可以用于服务器、工作站等企业级应用场景。

本文介绍如何使用 Oracle 一键安装脚本 在 Rocky Linux 9.4 系统上一键安装 Oracle 11GR2 单机。

>**脚本下载：[https://www.modb.pro/course/148](https://www.modb.pro/course/148)**
**作者微信：[Lucifer-0622](Lucifer-0622)** 

## 前置准备
- 1、系统组安装好操作系统（支持最小化安装）
- 2、网络组配置好主机网络，通常只需要一个公网 IP 地址
- 3、DBA 创建软件目录：`mkdir /soft`
- 4、DBA 上传 Oracle 安装介质（基础包，补丁包）到 /soft 目录下
- 5、DBA 上传 Oracle 一键安装脚本到 /soft 目录下，授予脚本执行权限：`chmod +x OracleshellInstall`
- 6、DBA 挂载主机 ISO 镜像，这里只需要 mount 上即可（这个很简单，不了解的可以百度下）
- 7、根据脚本安装脚本以及实际情况，配置好脚本的安装参数，在 /soft 目录下执行一键安装即可。

## 环境信息
```bash
# 主机版本
[root@rocky9 ~]# cat /etc/os-release
NAME="Rocky Linux"
VERSION="9.4 (Blue Onyx)"
ID="rocky"
ID_LIKE="rhel centos fedora"
VERSION_ID="9.4"
PLATFORM_ID="platform:el9"
PRETTY_NAME="Rocky Linux 9.4 (Blue Onyx)"
ANSI_COLOR="0;32"
LOGO="fedora-logo-icon"
CPE_NAME="cpe:/o:rocky:rocky:9::baseos"
HOME_URL="https://rockylinux.org/"
BUG_REPORT_URL="https://bugs.rockylinux.org/"
SUPPORT_END="2032-05-31"
ROCKY_SUPPORT_PRODUCT="Rocky-Linux-9"
ROCKY_SUPPORT_PRODUCT_VERSION="9.4"
REDHAT_SUPPORT_PRODUCT="Rocky Linux"
REDHAT_SUPPORT_PRODUCT_VERSION="9.4"

# 网络信息
[root@rocky9 ~]# ip a
2: ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:0c:29:60:c0:20 brd ff:ff:ff:ff:ff:ff
    altname enp3s0
    inet 192.168.6.139/24 brd 192.168.6.255 scope global noprefixroute ens160
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe60:c020/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

# 挂载本地 ISO 镜像
[root@rocky9 ~]# mount /dev/sr0 /mnt/
mount: /mnt: WARNING: source write-protected, mounted read-only.
[root@rocky9 ~]# mount | grep iso9660 | grep -v "/run/media"
/dev/sr0 on /mnt type iso9660 (ro,relatime,nojoliet,check=s,map=n,blocksize=2048)
[root@rocky9 ~]# df -h|grep /mnt
/dev/sr0              11G   11G     0 100% /mnt

# 安装包存放在 /soft 目录下
[root@rocky9 ~]# cd /soft/
[root@rocky9 soft]# ll
-rw-r--r--. 1 root root     235991 Aug  1 10:51 OracleShellInstall
-rwx------. 1 root root 1395582860 Aug  1 10:53 p13390677_112040_Linux-x86-64_1of7.zip
-rwx------. 1 root root 1151304589 Aug  1 10:53 p13390677_112040_Linux-x86-64_2of7.zip
-rw-------. 1 root root   86211857 Aug  1 10:52 p36533106_112040_Linux-x86-64.zip
-rw-------. 1 root root  562376591 Aug  1 10:53 p36575425_112040_Linux-x86-64.zip
-rwxr-xr-x. 1 root root  135128916 Aug  1 10:52 p6880880_112000_Linux-x86-64.zip
-rwx------. 1 root root     321590 Aug  1 10:51 rlwrap-0.44.tar.gz
```
确保安装环境准备完成后，即可执行一键安装。

## 安装命令
使用标准生产环境安装参数：
```bash
# 根据脚本 README 或者 -h 命令提示，编辑好一键安装命令，进入 /soft 目录执行安装：
[root@rocky9 ~]# cd /soft/
[root@rocky9 soft]# chmod +x OracleShellInstall

./OracleShellInstall -lf ens160 `# 主机网卡名称`\
-n rocky9 `# 主机名`\
-op oracle `# 主机 oracle 用户密码`\
-d /u01 `# Oracle 软件安装基础目录`\
-ord /oradata `# 数据库文件存放目录`\
-ard /archivelog `# 归档文件存放目录`\
-o lucifer `# 数据库名称`\
-dp 'Passw0rd#PST' `# sys/system 用户密码`\
-ds AL32UTF8 `# 数据库字符集`\
-ns AL16UTF16 `# 国家字符集`\
-redo 200 `# 在线重做日志大小（M）`\
-opa 36575425 `# db PSU/RU`\
-jpa 36533106 `# OJVM PSU/RU`\
-opd Y `# 是否优化数据库`
```

## 安装过程
```bash
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

请选择数据库版本 [11/12/19/21/23] : 11

数据库版本:     11

!!! 免责声明：当前操作系统版本是 [ Rocky Linux 9.4 (Blue Onyx) ] 不在 Oracle 官方支持列表，本脚本只负责安装，请确认是否继续安装 (Y/N): [Y]

OracleShellInstall 开始安装，详细安装过程可查看日志： tail -2000f /soft/print_shell_install_20240801111354.log                                                                                  

正在进行安装前检查，请稍等......                                                                                  

正在检测安装包 /soft/p13390677_112040_Linux-x86-64_1of7.zip 的 MD5 值是否正确，请稍等......                                                                                  
正在检测安装包 /soft/p13390677_112040_Linux-x86-64_2of7.zip 的 MD5 值是否正确，请稍等...... 

正在配置本地软件源......已完成 (耗时: 0 秒)
正在获取操作系统信息......已完成 (耗时: 1 秒)
正在安装依赖包......已完成 (耗时: 85 秒)
正在禁用防火墙......已完成 (耗时: 1 秒)
正在禁用 selinux......已完成 (耗时: 1 秒)
正在配置 nsyctl......已完成 (耗时: 0 秒)
正在配置主机名和 /etc/hosts......已完成 (耗时: 0 秒)
正在创建用户和组......已完成 (耗时: 1 秒)
正在创建安装目录......已完成 (耗时: 0 秒)
正在配置透明大页 && NUMA && 磁盘 IO 调度器......已完成 (耗时: 1 秒)
正在配置操作系统参数 sysctl......已完成 (耗时: 0 秒)
正在配置 RemoveIPC......已完成 (耗时: 1 秒)
正在配置用户限制 limit......已完成 (耗时: 0 秒)
正在配置 shm 目录......已完成 (耗时: 0 秒)
正在安装 rlwrap 插件......已完成 (耗时: 14 秒)
正在配置用户环境变量......已完成 (耗时: 1 秒)
正在解压 Oracle 安装包以及补丁......已完成 (耗时: 101 秒)
正在安装 Oracle 软件以及补丁......已完成 (耗时: 922 秒)
正在创建监听......已完成 (耗时: 3 秒)
正在创建数据库......已完成 (耗时: 691 秒)
正在优化数据库......已完成 (耗时: 6 秒)

恭喜！Oracle 一键安装执行完成 (耗时: 1834 秒)，现在是否重启主机：[Y/N] Y

正在重启当前节点主机......
```

## 连接测试
查看系统版本：
```bash
[root@rocky9:/root]# cat /etc/os-release 
NAME="Rocky Linux"
VERSION="9.4 (Blue Onyx)"
ID="rocky"
ID_LIKE="rhel centos fedora"
VERSION_ID="9.4"
PLATFORM_ID="platform:el9"
PRETTY_NAME="Rocky Linux 9.4 (Blue Onyx)"
ANSI_COLOR="0;32"
LOGO="fedora-logo-icon"
CPE_NAME="cpe:/o:rocky:rocky:9::baseos"
HOME_URL="https://rockylinux.org/"
BUG_REPORT_URL="https://bugs.rockylinux.org/"
SUPPORT_END="2032-05-31"
ROCKY_SUPPORT_PRODUCT="Rocky-Linux-9"
ROCKY_SUPPORT_PRODUCT_VERSION="9.4"
REDHAT_SUPPORT_PRODUCT="Rocky Linux"
REDHAT_SUPPORT_PRODUCT_VERSION="9.4"
```
查看补丁信息：
```bash
[oracle@rocky9:/home/oracle]$ sqlplus -v

SQL*Plus: Release 11.2.0.4.0 Production

[oracle@rocky9:/home/oracle]$ opatch lspatches
36533106;OJVM PATCH SET UPDATE 11.2.0.4.240716
36575425;Database Patch Set Update : 11.2.0.4.240716 (36575425)

OPatch succeeded.
```
查看监听：
```bash
[oracle@rocky9:/home/oracle]$ lsnrctl stat

LSNRCTL for Linux: Version 11.2.0.4.0 - Production on 01-AUG-2024 11:51:38

Copyright (c) 1991, 2013, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=IPC)(KEY=EXTPROC1521)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 11.2.0.4.0 - Production
Start Date                01-AUG-2024 11:47:50
Uptime                    0 days 0 hr. 3 min. 48 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/oracle/product/11.2.0/db/network/admin/listener.ora
Listener Log File         /u01/app/oracle/diag/tnslsnr/rocky9/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=ipc)(KEY=EXTPROC1521)))
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=rocky9)(PORT=1521)))
Services Summary...
Service "lucifer" has 1 instance(s).
  Instance "lucifer", status READY, has 1 handler(s) for this service...
Service "luciferXDB" has 1 instance(s).
  Instance "lucifer", status READY, has 1 handler(s) for this service...
The command completed successfully
```
连接数据库：
```bash
[oracle@rocky9:/home/oracle]$ sas

SQL*Plus: Release 11.2.0.4.0 Production on Thu Aug 1 11:51:40 2024

Copyright (c) 1982, 2013, Oracle.  All rights reserved.


Connected to:
Oracle Database 11g Enterprise Edition Release 11.2.0.4.0 - 64bit Production
With the Partitioning, OLAP, Data Mining and Real Application Testing options

sys@LUCIFER 2024-08-01 11:51:40> show parameter name

NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
cell_offloadgroup_name               string
db_file_name_convert                 string
db_name                              string      lucifer
db_unique_name                       string      lucifer
global_names                         boolean     FALSE
instance_name                        string      lucifer
lock_name_space                      string
log_file_name_convert                string
processor_group_name                 string
service_names                        string      lucifer
```
数据库可以正常连接。