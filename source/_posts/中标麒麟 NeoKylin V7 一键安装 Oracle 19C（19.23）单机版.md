---
title: 中标麒麟 NeoKylin V7 一键安装 Oracle 19C（19.23）单机版
date: 2024-05-08 14:55:20
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1788065065177534464
---

# 前言
Oracle 一键安装脚本，演示 NeoKylin V7 一键安装 Oracle 19C 单机（全程无需人工干预）。**（脚本包括 <font color='red'>ORALCE PSU/OJVM 等补丁自动安装</font>）**

>**⭐️ <font color='red'>脚本下载地址</font>：[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)**

脚本第三代支持 N 节点一键安装，不限制节点数！

# 前置准备
- 1、安装好操作系统，建议安装图形化
- 2、配置好网络
- 3、挂载本地 ISO 镜像源
- 4、上传软件安装包（安装基础包，补丁包）
- 5、上传一键安装脚本：OracleShellInstall

# 环境信息
```bash
# 主机版本
[root@neokylin:/root]$ cat /etc/os-release 
NAME="NeoKylin Linux Advanced Server"
VERSION="V7 (Stahl)"
ID="neokylin"
ID_LIKE="fedora"
VARIANT="Server"
VARIANT_ID="server"
VERSION_ID="V7"
PRETTY_NAME="NeoKylin Linux Advanced Server V7 (Stahl)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:neokylin:enterprise_linux:V7:GA:server"
HOME_URL="https://www.cs2c.com.cn/"
BUG_REPORT_URL="https://bugzilla.cs2c.com.cn/"

NEOKYLIN_BUGZILLA_PRODUCT="NeoKylin Linux Advanced 7"
NEOKYLIN_BUGZILLA_PRODUCT_VERSION=V7
NEOKYLIN_SUPPORT_PRODUCT="NeoKylin Linux Advanced"
NEOKYLIN_SUPPORT_PRODUCT_VERSION="V7"

# 网络信息
[root@neokylin:/root]$ ip a
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:d4:e1:41 brd ff:ff:ff:ff:ff:ff
    inet 192.168.6.198/24 brd 192.168.6.255 scope global noprefixroute ens33
       valid_lft forever preferred_lft forever
    inet6 fe80::3b33:6029:455f:a7a/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

# 挂载本地 ISO 镜像
[root@neokylin:/root]$ mount | grep iso9660 | grep -v "/run/media"
/dev/sr0 on /mnt type iso9660 (ro,relatime)
[root@neokylin:/root]$ df -h|grep /mnt
/dev/sr0               3.5G  3.5G     0 100% /mnt

# 安装包存放在 /soft 目录下
[root@neokylin:/soft]$ ll
-rwx------ 1 root root 3059705302 5月   8 12:34 LINUX.X64_193000_db_home.zip
-rwxr-xr-x 1 root root     201723 5月   8 11:17 OracleShellInstall
-rwx------ 1 root root  127475677 5月   8 12:33 p36199232_190000_Linux-x86-64.zip
-rwx------ 1 root root 1856311021 5月   8 12:33 p36233263_190000_Linux-x86-64.zip
-rwx------ 1 root root  133535622 5月   8 12:33 p6880880_190000_Linux-x86-64.zip
-rwx------ 1 root root     321590 5月   8 10:08 rlwrap-0.44.tar.gz
```
确保安装环境准备完成后，即可执行一键安装。

# 安装命令
使用标准生产环境安装参数：
```bash
# 根据脚本 README 或者 -h 命令提示，编辑好一键安装命令，进入 /soft 目录执行安装：
./OracleShellInstall -lf ens33 `# local ip ifname`\
-n neokylin `# hostname`\
-op oracle `# oracle password`\
-d /u01 `# software base dir`\
-ord /oradata `# data dir`\
-o lucifer `# dbname`\
-dp oracle `# sys/system password`\
-ds AL32UTF8 `# database character`\
-ns AL16UTF16 `# national character`\
-redo 100 `# redo size`\
-opa 36233263 `# oracle PSU/RU`\
-jpa 36199232 `# OJVM PSU/RU`\
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


注意：本脚本仅用于新服务器上实施部署数据库使用，严禁在已运行数据库的主机上执行，以免发生数据丢失或者损坏，造成不可挽回的损失！！！

请选择安装模式 [单机(si)/单机ASM(sa)/集群(rac)] : si

数据库安装模式: single

请选择数据库版本 [11/12/19/21] : 19

数据库版本:     19

OracleShellInstall 开始安装，详细安装过程可查看日志： tail -2000f /soft/print_ora_install_20240508131957.log
正在检查操作系统是否符合安装条件......已完成 (耗时: 0 秒)
正在去除密码复杂度配置......已完成 (耗时: 0 秒)
正在配置 YUM 源......已完成 (耗时: 1 秒)
正在获取操作系统信息......已完成 (耗时: 2 秒)
正在配置 Swap......已完成 (耗时: 0 秒)
正在配置防火墙......已完成 (耗时: 3 秒)
正在配置 selinux......已完成 (耗时: 1 秒)
正在配置 nsyctl......已完成 (耗时: 1 秒)
正在安装依赖包......已完成 (耗时: 2 秒)
正在配置主机名和 /etc/hosts......已完成 (耗时: 1 秒)
正在创建用户和组......已完成 (耗时: 1 秒)
正在创建安装目录......已完成 (耗时: 3 秒)
正在配置 Avahi-daemon 服务......已完成 (耗时: 1 秒)
正在配置透明大页 && NUMA && 磁盘 IO 调度器......已完成 (耗时: 1 秒)
正在配置操作系统参数 sysctl......已完成 (耗时: 1 秒)
正在配置 RemoveIPC......已完成 (耗时: 0 秒)
正在配置用户限制 limit......已完成 (耗时: 1 秒)
正在配置 shm 目录......已完成 (耗时: 0 秒)
正在配置用户环境变量......已完成 (耗时: 1 秒)
正在解压 Oracle 安装包以及补丁......已完成 (耗时: 124 秒)
正在安装 Oracle 软件以及补丁......已完成 (耗时: 2162 秒)
正在创建监听......已完成 (耗时: 7 秒)
正在创建数据库......已完成 (耗时: 1949 秒)
正在优化数据库......已完成 (耗时: 24 秒)

恭喜！Oracle 单机安装成功 (耗时: 4289 秒)，现在是否重启主机：[Y/N] Y

正在重启主机......
```

# 连接测试
查看系统版本：
```bash
[root@neokylin:/root]$ cat /etc/os-release 
NAME="NeoKylin Linux Advanced Server"
VERSION="V7 (Stahl)"
ID="neokylin"
ID_LIKE="fedora"
VARIANT="Server"
VARIANT_ID="server"
VERSION_ID="V7"
PRETTY_NAME="NeoKylin Linux Advanced Server V7 (Stahl)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:neokylin:enterprise_linux:V7:GA:server"
HOME_URL="https://www.cs2c.com.cn/"
BUG_REPORT_URL="https://bugzilla.cs2c.com.cn/"

NEOKYLIN_BUGZILLA_PRODUCT="NeoKylin Linux Advanced 7"
NEOKYLIN_BUGZILLA_PRODUCT_VERSION=V7
NEOKYLIN_SUPPORT_PRODUCT="NeoKylin Linux Advanced"
NEOKYLIN_SUPPORT_PRODUCT_VERSION="V7"
```
查看 Oracle 版本以及补丁：
```bash
[oracle@neokylin:/home/oracle]$ opatch lspatches
36199232;OJVM RELEASE UPDATE: 19.23.0.0.240416 (36199232)
36233263;Database Release Update : 19.23.0.0.240416 (36233263)
29585399;OCW RELEASE UPDATE 19.3.0.0.0 (29585399)

OPatch succeeded.
```
查看监听：
```bash
[oracle@neokylin:/home/oracle]$ lsnrctl stat

LSNRCTL for Linux: Version 19.0.0.0.0 - Production on 08-MAY-2024 14:54:45

Copyright (c) 1991, 2024, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=neokylin)(PORT=1521)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 19.0.0.0.0 - Production
Start Date                08-MAY-2024 14:52:39
Uptime                    0 days 0 hr. 2 min. 7 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/oracle/product/19.3.0/db/network/admin/listener.ora
Listener Log File         /u01/app/oracle/diag/tnslsnr/neokylin/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=neokylin)(PORT=1521)))
  (DESCRIPTION=(ADDRESS=(PROTOCOL=ipc)(KEY=EXTPROC1521)))
Services Summary...
Service "lucifer" has 1 instance(s).
  Instance "lucifer", status READY, has 1 handler(s) for this service...
Service "luciferXDB" has 1 instance(s).
  Instance "lucifer", status READY, has 1 handler(s) for this service...
The command completed successfully
```
连接数据库：
```bash
[oracle@neokylin:/home/oracle]$ sas

SQL*Plus: Release 19.0.0.0.0 - Production on Wed May 8 14:54:55 2024
Version 19.23.0.0.0

Copyright (c) 1982, 2023, Oracle.  All rights reserved.


Connected to:
Oracle Database 19c Enterprise Edition Release 19.0.0.0.0 - Production
Version 19.23.0.0.0

sys@LUCIFER 2024-05-08 14:54:55> show parameter name

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