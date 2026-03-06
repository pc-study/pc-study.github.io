---
title: Oracle Linux 7.9 一键安装 Oracle 21C（21.14）单机
date: 2024-04-24 15:52:17
tags: [oracle,linux系统,string,root,oracle数据库]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1783041124776611840
---

# 前言
Oracle 一键安装脚本，演示 Oracle Linux 7.9 一键安装 Oracle 21C 单机（21.14）过程（全程无需人工干预）。**（脚本包括 <font color='red'>ORALCE PSU/OJVM 等补丁自动安装</font>）**

>**⭐️ <font color='red'>脚本下载地址</font>：[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)**

脚本第三代支持 N 节点一键安装，不限制节点数！

# 安装准备
- 1、安装好操作系统，建议安装图形化
- 2、配置好网络
- 3、挂载本地 ISO 镜像源
- 4、上传软件安装包（安装基础包，补丁包）
- 5、上传一键安装脚本：OracleShellInstall

# 环境信息
```bash
# 主机版本
[root@oel7 soft]# cat /etc/os-release 
NAME="Oracle Linux Server"
VERSION="7.9"
ID="ol"
ID_LIKE="fedora"
VARIANT="Server"
VARIANT_ID="server"
VERSION_ID="7.9"
PRETTY_NAME="Oracle Linux Server 7.9"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:oracle:linux:7:9:server"
HOME_URL="https://linux.oracle.com/"
BUG_REPORT_URL="https://bugzilla.oracle.com/"

ORACLE_BUGZILLA_PRODUCT="Oracle Linux 7"
ORACLE_BUGZILLA_PRODUCT_VERSION=7.9
ORACLE_SUPPORT_PRODUCT="Oracle Linux"
ORACLE_SUPPORT_PRODUCT_VERSION=7.9

# 网络信息
[root@oel7 soft]# ip a
2: ens192: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:0c:29:0f:51:9e brd ff:ff:ff:ff:ff:ff
    inet 192.168.6.198/24 brd 192.168.6.255 scope global noprefixroute ens192
       valid_lft forever preferred_lft forever
    inet6 fe80::b290:9808:4a69:ee9f/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

# 挂载本地 ISO 镜像
[root@oel7 soft]# mount | grep iso9660 | grep -v "/run/media"
/dev/sr0 on /mnt type iso9660 (ro,relatime,nojoliet,check=s,map=n,blocksize=2048)
[root@oel7 soft]# df -h|grep /mnt
/dev/sr0             4.6G  4.6G     0 100% /mnt

# 安装包存放在 /soft 目录下
[root@oel7 soft]# ll
-rwx------. 1 root root 3109225519 Apr 17 16:47 LINUX.X64_213000_db_home.zip
-rwxr-xr-x. 1 root root     195170 Apr 17 16:45 OracleShellInstall
-rwx------. 1 root root 1458473664 Apr 17 16:46 p36352352_210000_Linux-x86-64.zip
-rwx------. 1 root root  127629034 Apr 17 16:46 p6880880_210000_Linux-x86-64.zip
-rwx------. 1 root root     321590 Apr 17 12:08 rlwrap-0.44.tar.gz
```
确保安装环境准备完成后，即可执行一键安装。

# 安装命令
使用标准生产环境安装参数（安装过程若失败，脚本支持重复执行安装）：
```bash
# 根据脚本 README 或者 -h 命令提示，编辑好一键安装命令，进入 /soft 目录执行安装：
./OracleShellInstall -lf ens192 `# local ip ifname`\
-n oel7 `# hostname`\
-op oracle `# oracle password`\
-d /u01 `# software base dir`\
-ord /oradata `# data dir`\
-o lucifer `# dbname`\
-dp oracle `# sys/system password`\
-ds AL32UTF8 `# database character`\
-ns AL16UTF16 `# national character`\
-redo 100 `# redo size`\
-opa 36352352 `# oracle PSU/RU`\
-opd Y `# optimize db`
```

# 安装过程
```bash
   ███████                             ██          ████████ ██               ██  ██ ██                    ██              ██  ██
  ██░░░░░██                           ░██         ██░░░░░░ ░██              ░██ ░██░██                   ░██             ░██ ░██
 ██     ░░██ ██████  ██████    █████  ░██  █████ ░██       ░██       █████  ░██ ░██░██ ███████   ██████ ██████  ██████   ░██ ░██
░██      ░██░░██░░█ ░░░░░░██  ██░░░██ ░██ ██░░░██░█████████░██████  ██░░░██ ░██ ░██░██░░██░░░██ ██░░░░ ░░░██░  ░░░░░░██  ░██ ░██
░██      ░██ ░██ ░   ███████ ░██  ░░  ░██░███████░░░░░░░░██░██░░░██░███████ ░██ ░██░██ ░██  ░██░░█████   ░██    ███████  ░██ ░██
░░██     ██  ░██    ██░░░░██ ░██   ██ ░██░██░░░░        ░██░██  ░██░██░░░░  ░██ ░██░██ ░██  ░██ ░░░░░██  ░██   ██░░░░██  ░██ ░██
 ░░███████  ░███   ░░████████░░█████  ███░░██████ ████████ ░██  ░██░░██████ ███ ███░██ ███  ░██ ██████   ░░██ ░░████████ ███ ███
  ░░░░░░░   ░░░     ░░░░░░░░  ░░░░░  ░░░  ░░░░░░ ░░░░░░░░  ░░   ░░  ░░░░░░ ░░░ ░░░ ░░ ░░░   ░░ ░░░░░░     ░░   ░░░░░░░░ ░░░ ░░░ 

请选择安装模式 [单机(si)/单机ASM(sa)/集群(rac)] : si

数据库安装模式: single                                                                           

请选择数据库版本 [11/12/19/21] : 21

数据库版本:     21                                                                               

OracleShellInstall 开始安装(安装过程可查看日志：/soft/print_ora_install_20240417165039.log）                            

正在检查操作系统是否符合安装条件......已完成 (耗时: 0 秒)
正在去除密码复杂度配置......已完成 (耗时: 0 秒)
正在配置 YUM 源......已完成 (耗时: 1 秒)
正在获取操作系统信息......已完成 (耗时: 2 秒)
正在配置 Swap......已完成 (耗时: 0 秒)
正在配置防火墙......已完成 (耗时: 2 秒)
正在配置 selinux......已完成 (耗时: 1 秒)
正在配置 nsyctl......已完成 (耗时: 0 秒)
正在安装依赖包......已完成 (耗时: 45 秒)
正在配置主机名和 /etc/hosts......已完成 (耗时: 0 秒)
正在创建用户和组......已完成 (耗时: 1 秒)
正在创建安装目录......已完成 (耗时: 1 秒)
正在配置 Avahi-daemon 服务......已完成 (耗时: 1 秒)
正在配置透明大页 && NUMA && 磁盘 IO 调度器......已完成 (耗时: 1 秒)
正在配置操作系统参数 sysctl......已完成 (耗时: 1 秒)
正在配置 RemoveIPC......已完成 (耗时: 1 秒)
正在配置用户限制 limit......已完成 (耗时: 1 秒)
正在配置 shm 目录......已完成 (耗时: 1 秒)
正在安装 rlwrap 插件......已完成 (耗时: 10 秒)
正在配置用户环境变量......已完成 (耗时: 1 秒)
正在解压 Oracle 安装包以及补丁......已完成 (耗时: 168 秒)
正在安装 Oracle 软件以及补丁......已完成 (耗时: 1165 秒)
正在创建监听......已完成 (耗时: 5 秒)
正在创建数据库......已完成 (耗时: 1324 秒)
正在优化数据库......已完成 (耗时: 32 秒)

恭喜！Oracle 单机安装成功 (耗时: 4256 秒)，现在是否重启主机：[Y/N] Y

正在重启主机......  
```

# 连接测试
查看系统版本：
```bash
[root@oel7 soft]# cat /etc/os-release 
NAME="Oracle Linux Server"
VERSION="7.9"
ID="ol"
ID_LIKE="fedora"
VARIANT="Server"
VARIANT_ID="server"
VERSION_ID="7.9"
PRETTY_NAME="Oracle Linux Server 7.9"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:oracle:linux:7:9:server"
HOME_URL="https://linux.oracle.com/"
BUG_REPORT_URL="https://bugzilla.oracle.com/"

ORACLE_BUGZILLA_PRODUCT="Oracle Linux 7"
ORACLE_BUGZILLA_PRODUCT_VERSION=7.9
ORACLE_SUPPORT_PRODUCT="Oracle Linux"
ORACLE_SUPPORT_PRODUCT_VERSION=7.9
```
查看 Oracle 版本以及补丁：
```bash
[oracle@oel7:/home/oracle]$ sqlplus -v

SQL*Plus: Release 21.0.0.0.0 - Production
Version 21.14.0.0.0

[oracle@oel7:/home/oracle]$ opatch lspatches
36352352;Database Release Update : 21.14.0.0.240416 (36352352)

OPatch succeeded.
```
连接数据库：
```bash
[oracle@oel7:/home/oracle]$ sas

SQL*Plus: Release 21.0.0.0.0 - Production on Wed Apr 17 21:54:52 2024
Version 21.14.0.0.0

Copyright (c) 1982, 2021, Oracle.  All rights reserved.

Connected to:
Oracle Database 21c Enterprise Edition Release 21.0.0.0.0 - Production
Version 21.14.0.0.0

sys@LUCIFER 2024-04-17 21:54:53> show parameter name

NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
cdb_cluster_name                     string
cell_offloadgroup_name               string
db_file_name_convert                 string
db_name                              string      lucifer
db_unique_name                       string      lucifer
global_names                         boolean     FALSE
instance_name                        string      lucifer
lock_name_space                      string
log_file_name_convert                string
pdb_file_name_convert                string
processor_group_name                 string
service_names                        string      lucifer
```
数据库连接正常。