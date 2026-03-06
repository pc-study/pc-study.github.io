---
title: Fedora 40 一键安装 Oracle 19C 单机详细日志记录
date: 2024-06-26 23:15:46
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1805983157174472704
---

# 前言
Oracle 一键安装脚本，演示 Fedora 40 一键安装 Oracle 19C 单机（全程无需人工干预）。

>**⭐️ <font color='red'>脚本下载地址</font>：[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)**

Fedora 40 一键安装 Oracle 19C 单机详细日志记录：
```bash
[root@fedora40-01 ~]# tail -2000f /soft/print_shell_install_20240626225128.log

#==============================================================#
打印系统信息
#==============================================================#

服务器时间:

2024年 06月 26日 星期三 22:51:38 CST

操作系统版本:

NAME="Fedora Linux"
VERSION="40 (Server Edition)"
ID=fedora
VERSION_ID=40
VERSION_CODENAME=""
PLATFORM_ID="platform:f40"
PRETTY_NAME="Fedora Linux 40 (Server Edition)"
ANSI_COLOR="0;38;2;60;110;180"
LOGO=fedora-logo-icon
CPE_NAME="cpe:/o:fedoraproject:fedora:40"
HOME_URL="https://fedoraproject.org/"
DOCUMENTATION_URL="https://docs.fedoraproject.org/en-US/fedora/f40/system-administrators-guide/"
SUPPORT_URL="https://ask.fedoraproject.org/"
BUG_REPORT_URL="https://bugzilla.redhat.com/"
REDHAT_BUGZILLA_PRODUCT="Fedora"
REDHAT_BUGZILLA_PRODUCT_VERSION=40
REDHAT_SUPPORT_PRODUCT="Fedora"
REDHAT_SUPPORT_PRODUCT_VERSION=40
SUPPORT_END=2025-05-13
VARIANT="Server Edition"
VARIANT_ID=server

内核信息:

Linux version 6.8.5-301.fc40.x86_64 (mockbuild@0bc0cc78c12e4762acf61c209bd02e96) (gcc (GCC) 14.0.1 20240328 (Red Hat 14.0.1-0), GNU ld version 2.41-34.fc40) #1 SMP PREEMPT_DYNAMIC Thu Apr 11 20:00:10 UTC 2024

Glibc 版本:

2.39

CPU 信息:

型号名称                 ：Intel(R) Xeon(R) CPU E5-2630 v2 @ 2.60GHz
物理 CPU 个数            ：4
每个物理 CPU 的逻辑核数  ：2
系统的 CPU 线程数        ：8
系统的 CPU 类型          ：x86_64

内存信息:

               total        used        free      shared  buff/cache   available
Mem:           15987         694       11816           1        3758       15292
Swap:          24575           0       24575

挂载信息:

UUID=c6341104-d694-4d61-b282-ff0bdbae5d07 /                       xfs     defaults        0 0
UUID=be347418-a6a0-4e13-b6d8-012909a2e580 /boot                   xfs     defaults        0 0
UUID=212128b3-799e-413c-b7ca-f36e0693d9ba none                    swap    defaults        0 0

目录信息:

文件系统                 大小  已用  可用 已用% 挂载点
/dev/mapper/fedora-root   83G  6.5G   77G    8% /
devtmpfs                 4.0M     0  4.0M    0% /dev
tmpfs                    7.9G     0  7.9G    0% /dev/shm
tmpfs                    3.2G  1.3M  3.2G    1% /run
tmpfs                    7.9G     0  7.9G    0% /tmp
/dev/sda2                960M  285M  676M   30% /boot
tmpfs                    1.6G  4.0K  1.6G    1% /run/user/0

#==============================================================#
配置网络软件源
#==============================================================#

[fedora]
name=Fedora $releasever - $basearch
baseurl=http://mirrors.tuna.tsinghua.edu.cn/fedora/releases/$releasever/Everything/$basearch/os/
#metalink=https://mirrors.fedoraproject.org/metalink?repo=fedora-$releasever&arch=$basearch
enabled=1
countme=1
metadata_expire=7d
repo_gpgcheck=0
type=rpm
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-$releasever-$basearch
skip_if_unavailable=False

[fedora-debuginfo]
name=Fedora $releasever - $basearch - Debug
baseurl=http://mirrors.tuna.tsinghua.edu.cn/fedora/releases/$releasever/Everything/$basearch/debug/tree/
#metalink=https://mirrors.fedoraproject.org/metalink?repo=fedora-debug-$releasever&arch=$basearch
enabled=0
metadata_expire=7d
repo_gpgcheck=0
type=rpm
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-$releasever-$basearch
skip_if_unavailable=False

[fedora-source]
name=Fedora $releasever - Source
baseurl=http://mirrors.tuna.tsinghua.edu.cn/fedora/releases/$releasever/Everything/source/tree/
#metalink=https://mirrors.fedoraproject.org/metalink?repo=fedora-source-$releasever&arch=$basearch
enabled=0
metadata_expire=7d
repo_gpgcheck=0
type=rpm
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-$releasever-$basearch
skip_if_unavailable=False

#==============================================================#
安装依赖软件包
#==============================================================#

psmisc \
tar \
glibc \
libaio \
libgcc \
libstdc++ \
bc \
make \
binutils \
glibc-devel \
ksh \
libstdc++-devel \
unzip \
gcc \
gcc-c++ \
libnsl \
libaio-devel \
e2fsprogs \
e2fsprogs-libs \
smartmontools \
net-tools \
nfs-utils \
elfutils-libelf \
elfutils-libelf-devel \
libibverbs \
librdmacm \
fontconfig \
fontconfig-devel \
libXrender \
libXrender-devel \
libX11 \
libXau \
libXi \
libXtst \
libxcb \
unixODBC \
sysstat \
readline \
readline-devel \
policycoreutils \
libvirt-libs \
policycoreutils-python-utils \
libnsl2 \
libasan \
liblsan \
compat-openssl10 \
libxcrypt-compat \
compat-openssl11 \
libgfortran \
rlwrap


#==============================================================#
静默安装软件包
#==============================================================#

检查必需软件包安装情况：

psmisc-23.6-6.fc40.x86_64
tar-1.35-3.fc40.x86_64
glibc-2.39-15.fc40.x86_64
libaio-0.3.111-19.fc40.x86_64
libgcc-14.1.1-6.fc40.x86_64
libstdc++-14.1.1-6.fc40.x86_64
bc-1.07.1-21.fc40.x86_64
make-4.4.1-6.fc40.x86_64
binutils-2.41-34.fc40.x86_64
glibc-devel-2.39-15.fc40.x86_64
ksh-1.0.8-4.fc40.x86_64
libstdc++-devel-14.1.1-6.fc40.x86_64
unzip-6.0-63.fc40.x86_64
gcc-14.1.1-6.fc40.x86_64
gcc-c++-14.1.1-6.fc40.x86_64
libnsl-2.39-15.fc40.x86_64

#==============================================================#
禁用防火墙
#==============================================================#

○ firewalld.service - firewalld - dynamic firewall daemon
     Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; preset: enabled)
    Drop-In: /usr/lib/systemd/system/service.d
             └─10-timeout-abort.conf
     Active: inactive (dead)
       Docs: man:firewalld(1)

6月 26 22:33:10 fedora40-01 systemd[1]: Starting firewalld.service - firewalld - dynamic firewall daemon...
6月 26 22:33:12 fedora40-01 systemd[1]: Started firewalld.service - firewalld - dynamic firewall daemon.
6月 26 22:53:07 fedora40-01 systemd[1]: Stopping firewalld.service - firewalld - dynamic firewall daemon...
6月 26 22:53:07 fedora40-01 systemd[1]: firewalld.service: Deactivated successfully.
6月 26 22:53:07 fedora40-01 systemd[1]: Stopped firewalld.service - firewalld - dynamic firewall daemon.
6月 26 22:53:07 fedora40-01 systemd[1]: firewalld.service: Consumed 2.471s CPU time, 42.6M memory peak, 0B memory swap peak.

#==============================================================#
禁用 SELinux
#==============================================================#

SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   permissive
Mode from config file:          disabled
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33

#==============================================================#
配置 nsysctl.conf
#==============================================================#

NOZEROCONF=yes

#==============================================================#
配置主机名
#==============================================================#

fedora40-01

#==============================================================#
配置 /etc/hosts 文件
#==============================================================#

127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
192.168.6.130   fedora40-01

#==============================================================#
创建用户和组
#==============================================================#

oracle 用户：

uid=54321(oracle) gid=54321(oinstall) 组=54321(oinstall),54322(dba),54323(oper),54324(backupdba),54325(dgdba),54326(kmdba),54330(racdba)


#==============================================================#
配置透明大页 && NUMA && 磁盘 IO 调度器
#==============================================================#

args="ro resume=UUID=212128b3-799e-413c-b7ca-f36e0693d9ba rd.lvm.lv=fedora/root rd.lvm.lv=fedora/swap rhgb quiet numa=off transparent_hugepage=never elevator=deadline"
-resume=UUID=212128b3-799e-413c-b7ca-f36e0693d9ba
-args="ro
args="ro resume=UUID=212128b3-799e-413c-b7ca-f36e0693d9ba rd.lvm.lv=fedora/root rd.lvm.lv=fedora/swap rhgb quiet numa=off transparent_hugepage=never elevator=deadline"
-elevator=deadline"
-transparent_hugepage=never

#==============================================================#
配置 sysctl.conf
#==============================================================#

查看 sysctl.conf 配置情况 ：sysctl -p

fs.aio-max-nr = 1048576
fs.file-max = 6815744
kernel.shmall = 4092814
kernel.shmmax = 16764170230
kernel.shmmni = 4096
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 1048576
vm.min_free_kbytes = 65485
net.ipv4.conf.ens33.rp_filter = 1
vm.swappiness = 10
kernel.panic_on_oops = 1
kernel.randomize_va_space = 2
kernel.numa_balancing = 0

#==============================================================#
配置 /etc/security/limits.conf 和 /etc/pam.d/login
#==============================================================#

查看 /etc/security/limits.conf：

oracle soft nofile 1024
oracle hard nofile 65536
oracle soft stack 10240
oracle hard stack 32768
oracle soft nproc 2047
oracle hard nproc 16384
oracle hard memlock unlimited
oracle soft memlock unlimited

查看 /etc/pam.d/login 文件：

auth       substack     system-auth
auth       include      postlogin
account    required     pam_nologin.so
account    include      system-auth
password   include      system-auth
session    required     pam_selinux.so close
session    required     pam_loginuid.so
session    required     pam_selinux.so open
session    required     pam_namespace.so
session    optional     pam_keyinit.so force revoke
session    include      system-auth
session    include      postlogin
-session   optional     pam_ck_connector.so
session required pam_limits.so

#==============================================================#
配置 /dev/shm
#==============================================================#

查看 Linux 挂载情况：/etc/fstab

UUID=c6341104-d694-4d61-b282-ff0bdbae5d07 /                       xfs     defaults        0 0
UUID=be347418-a6a0-4e13-b6d8-012909a2e580 /boot                   xfs     defaults        0 0
UUID=212128b3-799e-413c-b7ca-f36e0693d9ba none                    swap    defaults        0 0
tmpfs /dev/shm tmpfs size=16371260k 0 0

#==============================================================#
Root 用户环境变量
#==============================================================#

查看 root 用户环境变量：/root/.bash_profile

if [ -f ~/.bashrc ]; then
        . ~/.bashrc
fi
alias so='su - oracle'
export PS1=[`whoami`@`hostname`:'$PWD]# '

#==============================================================#
Oracle 用户环境变量，实例名：lucifer
#==============================================================#

查看 Oracle 用户环境变量：/home/oracle/.bash_profile

if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi
umask 022
export TMP=/tmp
export TMPDIR=$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=/u01/app/oracle/product/19.3.0/db
export ORACLE_TERM=xterm
export TNS_ADMIN=$ORACLE_HOME/network/admin
export LD_LIBRARY_PATH=$ORACLE_HOME/lib:/lib:/usr/lib
export ORACLE_SID=lucifer
export PATH=/usr/sbin:$PATH
export PATH=$ORACLE_HOME/bin:$ORACLE_HOME/OPatch:$ORACLE_HOME/perl/bin:$PATH
export PERL5LIB=$ORACLE_HOME/perl/lib
alias sas='sqlplus / as sysdba'
alias awr='sqlplus / as sysdba @?/rdbms/admin/awrrpt'
alias ash='sqlplus / as sysdba @?/rdbms/admin/ashrpt'
alias alert='vi $ORACLE_BASE/diag/rdbms/*/$ORACLE_SID/trace/alert_$ORACLE_SID.log'
export PS1="[`whoami`@`hostname`:"'$PWD]$ '
export CV_ASSUME_DISTID=OL7
alias sqlplus='rlwrap sqlplus'
alias rman='rlwrap rman'
alias adrci='rlwrap adrci'

#==============================================================#
静默解压 Oracle 软件包
#==============================================================#

正在静默解压缩 Oracle 软件包，请稍等：


静默解压 Oracle 软件安装包： /soft/LINUX.X64_193000_db_home.zip

#==============================================================#
Oracle 安装静默文件
#==============================================================#

oracle.install.option=INSTALL_DB_SWONLY
UNIX_GROUP_NAME=oinstall
INVENTORY_LOCATION=/u01/app/oraInventory
ORACLE_BASE=/u01/app/oracle
oracle.install.db.InstallEdition=EE
oracle.install.db.OSDBA_GROUP=dba
oracle.install.db.OSOPER_GROUP=oper
oracle.install.db.OSBACKUPDBA_GROUP=backupdba
oracle.install.db.OSDGDBA_GROUP=dgdba
oracle.install.db.OSKMDBA_GROUP=kmdba
oracle.install.db.OSRACDBA_GROUP=racdba
oracle.install.db.rootconfig.executeRootScript=false
oracle.install.db.rootconfig.configMethod=
oracle.install.responseFileVersion=/oracle/install/rspfmt_dbinstall_response_schema_v19.0.0

#==============================================================#
静默安装 Oracle 软件命令
#==============================================================#

/u01/app/oracle/product/19.3.0/db/runInstaller \
-silent \
-ignorePrereqFailure \
-responseFile /soft/oracle.rsp \
-waitForCompletion


#==============================================================#
静默安装数据库软件
#==============================================================#

检查 Oracle 软件 OPacth 版本：

OPatch Version: 12.2.0.1.17

OPatch succeeded.

正在安装 Oracle 软件：

正在启动 Oracle 数据库安装向导...

[WARNING] [INS-13014] 目标环境不满足一些可选要求。
   原因: 不满足一些可选的先决条件。有关详细信息, 请查看日志。installActions2024-06-26_10-54-27PM.log
   操作: 从日志 installActions2024-06-26_10-54-27PM.log 中确定失败的先决条件检查列表。然后, 从日志文件或安装手册中查找满足这些先决条件的适当配置, 并手动进行修复。
可以在以下位置找到此会话的响应文件:
 /u01/app/oracle/product/19.3.0/db/install/response/db_2024-06-26_10-54-27PM.rsp

可以在以下位置找到本次安装会话的日志:
 /tmp/InstallActions2024-06-26_10-54-27PM/installActions2024-06-26_10-54-27PM.log

以 root 用户的身份执行以下脚本:
        1. /u01/app/oraInventory/orainstRoot.sh
        2. /u01/app/oracle/product/19.3.0/db/root.sh

在以下节点上执行/u01/app/oraInventory/orainstRoot.sh:
[fedora40-01]
在以下节点上执行/u01/app/oracle/product/19.3.0/db/root.sh:
[fedora40-01]


Successfully Setup Software with warning(s).
已将安装会话日志移动到:
 /u01/app/oraInventory/logs/InstallActions2024-06-26_10-54-27PM

#==============================================================#
执行 root 脚本
#==============================================================#

执行命令：/u01/app/oraInventory/orainstRoot.sh

更改权限/u01/app/oraInventory.
添加组的读取和写入权限。
删除全局的读取, 写入和执行权限。

更改组名/u01/app/oraInventory 到 oinstall.
脚本的执行已完成。

执行命令：/u01/app/oracle/product/19.3.0/db/root.sh

Check /u01/app/oracle/product/19.3.0/db/install/root_fedora40-01_2024-06-26_22-56-26-087407557.log for the output of root script

#==============================================================#
Oracle 软件版本
#==============================================================#


SQL*Plus: Release 19.0.0.0.0 - Production
Version 19.3.0.0.0


#==============================================================#
Oracle 补丁信息
#==============================================================#

29585399;OCW RELEASE UPDATE 19.3.0.0.0 (29585399)
29517242;Database Release Update : 19.3.0.0.190416 (29517242)

OPatch succeeded.

#==============================================================#
静默安装 Oracle 软件命令
#==============================================================#

/u01/app/oracle/product/19.3.0/db/bin/netca -silent \
-responsefile /u01/app/oracle/product/19.3.0/db/assistants/netca/netca.rsp                                                                              


#==============================================================#
创建监听
#==============================================================#

正在创建监听：


正在对命令行参数进行语法分析:
    参数"silent" = true
    参数"responsefile" = /u01/app/oracle/product/19.3.0/db/assistants/netca/netca.rsp
完成对命令行参数进行语法分析。
Oracle Net Services 配置:
完成概要文件配置。
Oracle Net 监听程序启动:
    正在运行监听程序控制:
      /u01/app/oracle/product/19.3.0/db/bin/lsnrctl start LISTENER
   监听程序控制完成。
    监听程序已成功启动。
监听程序配置完成。
成功完成 Oracle Net Services 配置。退出代码是0


#==============================================================#
检查监听状态
#==============================================================#


LSNRCTL for Linux: Version 19.0.0.0.0 - Production on 26-JUN-2024 22:56:32

Copyright (c) 1991, 2019, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=fedora40-01)(PORT=1521)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 19.0.0.0.0 - Production
Start Date                26-JUN-2024 22:56:32
Uptime                    0 days 0 hr. 0 min. 0 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/oracle/product/19.3.0/db/network/admin/listener.ora
Listener Log File         /u01/app/oracle/diag/tnslsnr/fedora40-01/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=fedora40-01)(PORT=1521)))
  (DESCRIPTION=(ADDRESS=(PROTOCOL=ipc)(KEY=EXTPROC1521)))
The listener supports no services
The command completed successfully

#==============================================================#
DBCA 静默建库文件：lucifer
#==============================================================#

gdbName=lucifer
sid=lucifer
templateName=General_Purpose.dbc
sysPassword=Passw0rd#PST
systemPassword=Passw0rd#PST
characterSet=AL32UTF8
nationalCharacterSet=AL16UTF16
automaticMemoryManagement=false
totalMemory=12790
initParams=db_block_size=8192BYTES
createAsContainerDatabase=false
databaseConfigType=SI
storageType=FS
datafileDestination=/oradata
recoveryAreaDestination=/oradata
responseFileVersion=/oracle/assistants/rspfmt_dbca_response_schema_v19.0.0

#==============================================================#
静默创建数据库命令
#==============================================================#

/u01/app/oracle/product/19.3.0/db/bin/dbca -silent -createDatabase \
-responseFile /soft/db.rsp \
-ignorePreReqs \
-ignorePrereqFailure \
-J-Doracle.assistants.dbca.validate.ConfigurationParams=false


#==============================================================#
创建数据库实例：lucifer
#==============================================================#

正在创建数据库：lucifer

准备执行数据库操作
已完成 10%
复制数据库文件
已完成 40%
正在创建并启动 Oracle 实例
已完成 42%
已完成 46%
已完成 50%
已完成 54%
已完成 60%
正在进行数据库创建
已完成 66%
已完成 69%
已完成 70%
执行配置后操作
已完成 100%
数据库创建完成。有关详细信息, 请查看以下位置的日志文件:
 /u01/app/oracle/cfgtoollogs/dbca/lucifer。
数据库信息:
全局数据库名:lucifer
系统标识符 (SID):lucifer
有关详细信息, 请参阅日志文件 "/u01/app/oracle/cfgtoollogs/dbca/lucifer/lucifer.log"。

#==============================================================#
配置 OMF && 优化 RMAN
#==============================================================#


NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
db_create_file_dest                  string      /oradata

#==============================================================#
配置 Oracle 数据库控制文件复用
#==============================================================#


数据库控制文件：


NAME
----------------------------------------------------------------------------------------------------
/oradata/LUCIFER/control01.ctl
/oradata/LUCIFER/control02.ctl

#==============================================================#
配置在线重做日志
#==============================================================#


   THREAD#     GROUP# MEMBER                                                                              size(M)
---------- ---------- -------------------------------------------------------------------------------- ----------
         1          1 /oradata/LUCIFER/redo01.log                                                              10
         1          2 /oradata/LUCIFER/redo02.log                                                              10
         1          3 /oradata/LUCIFER/redo03.log                                                              10
         1          4 /oradata/LUCIFER/redo04.log                                                              10
         1          5 /oradata/LUCIFER/redo05.log                                                              10
         1          6 /oradata/LUCIFER/redo06.log                                                              10
         1          7 /oradata/LUCIFER/redo07.log                                                              10
         1          8 /oradata/LUCIFER/redo08.log                                                              10

#==============================================================#
配置 Oracle 数据库开机自启
#==============================================================#

数据库开机自启配置：

su oracle -lc "/u01/app/oracle/product/19.3.0/db/bin/lsnrctl start"
su oracle -lc "/u01/app/oracle/product/19.3.0/db/bin/dbstart"

#==============================================================#
配置 RMAN 备份任务
#==============================================================#

# OracleBegin
00 02 * * * /home/oracle/scripts/del_arch_lucifer.sh
#00 00 * * 0 /home/oracle/scripts/dbbackup_lv0_lucifer.sh
#00 00 * * 1,2,3,4,5,6 /home/oracle/scripts/dbbackup_lv1_lucifer.sh

#==============================================================#
优化数据库参数
#==============================================================#

数据库参数：


NAME                                               SID        SPVALUE                                                                          VALUE
-------------------------------------------------- ---------- -------------------------------------------------------------------------------- --------------------------------------------------------------------------------
_b_tree_bitmap_plans                               *          FALSE                                                                            FALSE
_datafile_write_errors_crash_instance              *          FALSE                                                                            FALSE
audit_file_dest                                    *          /u01/app/oracle/admin/lucifer/adump                                              /u01/app/oracle/admin/lucifer/adump
audit_trail                                        *          NONE                                                                             DB
compatible                                         *          19.0.0                                                                           19.0.0
control_file_record_keep_time                      *          31                                                                               31
db_block_size                                      *          8192                                                                             8192
db_create_file_dest                                *          /oradata                                                                         /oradata
db_file_multiblock_read_count                      *                                                                                           128
db_files                                           *          5000                                                                             200
db_name                                            *          lucifer                                                                          lucifer
db_recovery_file_dest                              *          /oradata                                                                         /oradata
db_recovery_file_dest_size                         *          6863978496                                                                       6863978496
db_writer_processes                                *                                                                                           1
deferred_segment_creation                          *          FALSE                                                                            FALSE
diagnostic_dest                                    *          /u01/app/oracle                                                                  /u01/app/oracle
dispatchers                                        *          (PROTOCOL=TCP) (SERVICE=luciferXDB)                                              (PROTOCOL=TCP) (SERVICE=luciferXDB)
event                                              *          10949 trace name context forever,level 1
event                                              *          28401 trace name context forever,level 1
fast_start_parallel_rollback                       *                                                                                           LOW
log_archive_dest_1                                 *          location=/oradata/archivelog                                                     location=/oradata/archivelog
log_archive_format                                 *          %t_%s_%r.dbf                                                                     %t_%s_%r.dbf
max_dump_file_size                                 *                                                                                           unlimited
max_string_size                                    *                                                                                           STANDARD
nls_language                                       *          SIMPLIFIED CHINESE                                                               AMERICAN
nls_territory                                      *          CHINA                                                                            AMERICA
open_cursors                                       *          1000                                                                             300
optimizer_adaptive_plans                           *                                                                                           TRUE
optimizer_adaptive_statistics                      *                                                                                           FALSE
optimizer_index_caching                            *                                                                                           0
optimizer_mode                                     *                                                                                           ALL_ROWS
parallel_force_local                               *                                                                                           FALSE
parallel_max_servers                               *          64                                                                               64
pga_aggregate_target                               *          2682257408                                                                       3353346048
processes                                          *          2000                                                                             640
remote_login_passwordfile                          *          EXCLUSIVE                                                                        EXCLUSIVE
session_cached_cursors                             *          300                                                                              50
sessions                                           *                                                                                           984
sga_max_size                                       *          10729029632                                                                      10066329600
sga_target                                         *          10729029632                                                                      10066329600
spfile                                             *                                                                                           /u01/app/oracle/product/19.3.0/db/dbs/spfilelucifer.ora
statistics_level                                   *                                                                                           TYPICAL
undo_retention                                     *          10800                                                                            900

#==============================================================#
配置 glogin.sql
#==============================================================#

define _editor=vi
set serveroutput on size 1000000
set pagesize 9999
set long 99999
set trimspool on
col name format a80
set termout off
define gname=idle
column global_name new_value gname
select lower(user) || '@' || substr( global_name, 1, decode( dot, 0, length(global_name), dot-1) ) global_name from (select global_name, instr(global_name,'.') dot from global_name );
ALTER SESSION SET nls_date_format = 'YYYY-MM-DD HH24:MI:SS';
set sqlprompt '&gname _DATE> '
set termout on
```