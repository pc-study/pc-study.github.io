---
title: RedHat 9.4(aarch64) 一键安装 Oracle 19C ARM 单机
date: 2024-07-05 15:01:28
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1808343014549499904
---

# 前言
Oracle 一键安装脚本，演示 RedHat 9.4 ARM 一键安装 Oracle 19C ARM 单机（全程无需人工干预）。

>**⭐️ <font color='red'>脚本下载地址</font>：[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)**

# 前置准备
- 1、系统组安装好操作系统（支持最小化安装）
- 2、网络组配置好主机网络，通常只需要一个公网 IP 地址
- 3、DBA 创建软件目录：`mkdir /soft`
- 4、DBA 上传 Oracle 安装介质（基础包，补丁包）到 /soft 目录下
- 5、DBA 上传 Oracle 一键安装脚本到 /soft 目录下，授予脚本执行权限：`chmod +x OracleshellInstall`
- 6、DBA 挂载主机 ISO 镜像，这里只需要 mount 上即可（这个很简单，不了解的可以百度下）
- 7、根据脚本安装脚本以及实际情况，配置好脚本的安装参数，在 /soft 目录下执行一键安装即可。

# 环境信息
```bash
# 主机版本
[root@rhel9-arm soft]# cat /etc/os-release 
NAME="Red Hat Enterprise Linux"
VERSION="9.4 (Plow)"
ID="rhel"
ID_LIKE="fedora"
VERSION_ID="9.4"
PLATFORM_ID="platform:el9"
PRETTY_NAME="Red Hat Enterprise Linux 9.4 (Plow)"
ANSI_COLOR="0;31"
LOGO="fedora-logo-icon"
CPE_NAME="cpe:/o:redhat:enterprise_linux:9::baseos"
HOME_URL="https://www.redhat.com/"
DOCUMENTATION_URL="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9"
BUG_REPORT_URL="https://bugzilla.redhat.com/"

REDHAT_BUGZILLA_PRODUCT="Red Hat Enterprise Linux 9"
REDHAT_BUGZILLA_PRODUCT_VERSION=9.4
REDHAT_SUPPORT_PRODUCT="Red Hat Enterprise Linux"
REDHAT_SUPPORT_PRODUCT_VERSION="9.4"

# CPU 架构
[root@rhel9-arm soft]# uname -m
aarch64

# 网络信息
[root@rhel9-arm soft]# ip a
2: enp0s5: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:1c:42:45:4b:b4 brd ff:ff:ff:ff:ff:ff
    inet 10.211.55.14/24 brd 10.211.55.255 scope global dynamic noprefixroute enp0s5
       valid_lft 1418sec preferred_lft 1418sec
    inet6 fdb2:2c26:f4e4:0:21c:42ff:fe45:4bb4/64 scope global dynamic noprefixroute 
       valid_lft 2591987sec preferred_lft 604787sec
    inet6 fe80::21c:42ff:fe45:4bb4/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

# 挂载本地 ISO 镜像
[root@rhel9-arm soft]# mount /dev/sr0 /mnt/
mount: /mnt: WARNING: source write-protected, mounted read-only.
[root@rhel9-arm soft]# mount | grep iso9660 | grep -v "/run/media"
/dev/sr0 on /mnt type iso9660 (ro,relatime,nojoliet,check=s,map=n,blocksize=2048)
[root@rhel9-arm soft]# df -h|grep /mnt
/dev/sr0               8.8G  8.8G     0  100% /mnt

# 安装包存放在 /soft 目录下
[root@rhel9-arm soft]# ll
-rwx------. 1 root root 2415583176  7月  3 11:17 LINUX.ARM64_1919000_db_home.zip
-rwxr-xr-x. 1 root root     233906  7月  3 11:17 OracleShellInstall
```
确保安装环境准备完成后，即可执行一键安装。

# 安装命令
使用标准生产环境安装参数：
```bash
# 根据脚本 README 或者 -h 命令提示，编辑好一键安装命令，进入 /soft 目录执行安装：
[root@rhel9-arm ~]# cd /soft/
[root@rhel9-arm soft]# chmod +x OracleShellInstall 

./OracleShellInstall -lf enp0s5 `# 主机网卡名称`\
-n rhel9-arm `# 主机名`\
-op 'P@ssw0rd!123' `# 主机 oracle 用户密码`\
-d /u01 `# Oracle 软件安装基础目录`\
-ord /oradata `# 数据库文件存放目录`\
-o lucifer `# 数据库名称`\
-dp 'Passw0rd#PST' `# sys/system 用户密码`\
-ds AL32UTF8 `# 数据库字符集`\
-ns AL16UTF16 `# 国家字符集`\
-redo 10 `# 在线重做日志大小（M）`\
-opd Y `# 是否优化数据库`
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

正在进行安装前检查，请稍等......                                                                                  

正在检测安装包 /soft/LINUX.ARM64_1919000_db_home.zip 的 MD5 值是否正确，请稍等......                                                                                  

OracleShellInstall 开始安装，详细安装过程可查看日志： tail -2000f /soft/print_shell_install_20240703112127.log                                                                                  
正在获取操作系统信息......已完成 (耗时: 1 秒)
正在配置本地软件源......已完成 (耗时: 1 秒)
正在安装依赖包......已完成 (耗时: 32 秒)
正在禁用防火墙......已完成 (耗时: 1 秒)
正在禁用 selinux......已完成 (耗时: 1 秒)
正在配置 nsyctl......已完成 (耗时: 1 秒)
正在配置主机名和 /etc/hosts......已完成 (耗时: 1 秒)
正在创建用户和组......已完成 (耗时: 1 秒)
正在创建安装目录......已完成 (耗时: 1 秒)
正在配置透明大页 && NUMA && 磁盘 IO 调度器......已完成 (耗时: 1 秒)
正在配置操作系统参数 sysctl......已完成 (耗时: 1 秒)
正在配置 RemoveIPC......已完成 (耗时: 1 秒)
正在配置用户限制 limit......已完成 (耗时: 1 秒)
正在配置 shm 目录......已完成 (耗时: 1 秒)
正在配置用户环境变量......已完成 (耗时: 1 秒)
正在解压 Oracle 安装包以及补丁......已完成 (耗时: 35 秒)
正在安装 Oracle 软件以及补丁......已完成 (耗时: 91 秒)
正在创建监听......已完成 (耗时: 1 秒)
正在创建数据库......已完成 (耗时: 247 秒)
正在优化数据库......已完成 (耗时: 8 秒)

恭喜！Oracle 一键安装执行完成 (耗时: 428 秒)，现在是否重启主机：[Y/N] Y

正在重启当前节点主机......  
```

# 连接测试
查看系统版本：
```bash
[root@rhel9-arm:/root]# cat /etc/os-release 
NAME="Red Hat Enterprise Linux"
VERSION="9.4 (Plow)"
ID="rhel"
ID_LIKE="fedora"
VERSION_ID="9.4"
PLATFORM_ID="platform:el9"
PRETTY_NAME="Red Hat Enterprise Linux 9.4 (Plow)"
ANSI_COLOR="0;31"
LOGO="fedora-logo-icon"
CPE_NAME="cpe:/o:redhat:enterprise_linux:9::baseos"
HOME_URL="https://www.redhat.com/"
DOCUMENTATION_URL="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9"
BUG_REPORT_URL="https://bugzilla.redhat.com/"

REDHAT_BUGZILLA_PRODUCT="Red Hat Enterprise Linux 9"
REDHAT_BUGZILLA_PRODUCT_VERSION=9.4
REDHAT_SUPPORT_PRODUCT="Red Hat Enterprise Linux"
REDHAT_SUPPORT_PRODUCT_VERSION="9.4"
```
查看补丁信息：
```bash
[oracle@rhel9-arm:/home/oracle]$ sqlplus -v

SQL*Plus: Release 19.0.0.0.0 - Production
Version 19.19.0.0.0

[oracle@rhel9-arm:/home/oracle]$ opatch lspatches
此 Oracle 主目录中未安装任何临时补丁程序 "/u01/app/oracle/product/19.3.0/db".

OPatch succeeded.
```
查看监听：
```bash
[oracle@rhel9-arm:/home/oracle]$ lsnrctl stat

LSNRCTL for Linux: Version 19.0.0.0.0 - Production on 03-JUL-2024 11:31:45

Copyright (c) 1991, 2023, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=rhel9-arm)(PORT=1521)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 19.0.0.0.0 - Production
Start Date                03-JUL-2024 11:30:58
Uptime                    0 days 0 hr. 0 min. 46 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/oracle/product/19.3.0/db/network/admin/listener.ora
Listener Log File         /u01/app/oracle/diag/tnslsnr/rhel9-arm/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=rhel9-arm)(PORT=1521)))
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
[oracle@rhel9-arm:/home/oracle]$ sas

SQL*Plus: Release 19.0.0.0.0 - Production on Wed Jul 3 11:31:51 2024
Version 19.19.0.0.0

Copyright (c) 1982, 2023, Oracle.  All rights reserved.


Connected to:
Oracle Database 19c Enterprise Edition Release 19.0.0.0.0 - Production
Version 19.19.0.0.0

sys@LUCIFER 2024-07-03 11:31:51> show parameter name

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
数据库可以正常连接。