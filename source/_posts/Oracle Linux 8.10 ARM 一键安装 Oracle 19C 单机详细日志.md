---
title: Oracle Linux 8.10 ARM 一键安装 Oracle 19C 单机详细日志
date: 2024-06-27 13:20:50
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1806195844588310528
---

# 前言
Oracle 一键安装脚本，演示 Oracle Linux 8.10 ARM 一键安装 Oracle 19C 单机（全程无需人工干预）。

>**⭐️ <font color='red'>脚本下载地址</font>：[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)**

Oracle Linux 8.10 ARM 一键安装 Oracle 19C 单机详细日志记录：
```bash
[root@oel810-arm64 ~]# tail -2000f /soft/print_shell_install_20240627130857.log

#==============================================================#                                                                                  
打印系统信息                                                                                    
#==============================================================#                                                                                  

服务器时间:                                                                                      

Thu Jun 27 13:09:04 CST 2024

操作系统版本:                                                                                   

NAME="Oracle Linux Server"
VERSION="8.10"
ID="ol"
ID_LIKE="fedora"
VARIANT="Server"
VARIANT_ID="server"
VERSION_ID="8.10"
PLATFORM_ID="platform:el8"
PRETTY_NAME="Oracle Linux Server 8.10"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:oracle:linux:8:10:server"
HOME_URL="https://linux.oracle.com/"
BUG_REPORT_URL="https://github.com/oracle/oracle-linux"

ORACLE_BUGZILLA_PRODUCT="Oracle Linux 8"
ORACLE_BUGZILLA_PRODUCT_VERSION=8.10
ORACLE_SUPPORT_PRODUCT="Oracle Linux"
ORACLE_SUPPORT_PRODUCT_VERSION=8.10

内核信息:                                                                                         

Linux version 5.15.0-206.153.7.1.el8uek.aarch64 (mockbuild@host-100-100-224-51) (gcc (GCC) 11.4.1 20230605 (Red Hat 11.4.1-2.1.0.1), GNU ld version 2.36.1-4.0.2.el8_6) #2 SMP Wed May 22 23:22:35 PDT 2024

Glibc 版本:                                                                                         

2.28

CPU 信息:                                                                                           

型号名称                 ：                                                                                  
物理 CPU 个数            ：0                                                                                  
每个物理 CPU 的逻辑核数  ：0                                                                                  
系统的 CPU 线程数        ：4                                                                                  
系统的 CPU 类型          ：aarch64                                                                                  

内存信息:                                                                                         

              total        used        free      shared  buff/cache   available
Mem:           7918         235        5179          11        2503        7513
Swap:          8191           0        8191

挂载信息:                                                                                         

/dev/mapper/ol-root     /                       xfs     defaults        0 0
UUID=33b0abab-16cf-4341-aa9b-01197bc9f343 /boot                   xfs     defaults        0 0
UUID=E906-4461          /boot/efi               vfat    umask=0077,shortname=winnt 0 2
/dev/mapper/ol-swap     none                    swap    defaults        0 0

目录信息:                                                                                         

Filesystem           Size  Used Avail Use% Mounted on
devtmpfs             3.9G     0  3.9G   0% /dev
tmpfs                3.9G     0  3.9G   0% /dev/shm
tmpfs                3.9G  8.9M  3.9G   1% /run
tmpfs                3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/mapper/ol-root   55G  4.8G   50G   9% /
/dev/sda2            924M  278M  647M  31% /boot
/dev/sda1            599M  7.2M  592M   2% /boot/efi
tmpfs                792M     0  792M   0% /run/user/0
/dev/sr0              11G   11G     0 100% /mnt

#==============================================================#                                                                                  
配置本地软件源                                                                                  
#==============================================================#                                                                                  

[BaseOS]
name=BaseOS
baseurl=file:///mnt/BaseOS
enabled=1
gpgcheck=0
[AppStream]
name=AppStream
baseurl=file:///mnt/AppStream
enabled=1
gpgcheck=0

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
psmisc \
gcc \
gcc-c++ \
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

psmisc-23.1-5.el8.aarch64
tar-1.30-9.el8.aarch64
glibc-2.28-251.0.2.el8.aarch64
libaio-0.3.112-1.el8.aarch64
libgcc-8.5.0-21.0.1.el8.aarch64
libstdc++-8.5.0-21.0.1.el8.aarch64
bc-1.07.1-5.el8.aarch64
make-4.2.1-11.el8.aarch64
binutils-2.30-123.0.2.el8.aarch64
glibc-devel-2.28-251.0.2.el8.aarch64
ksh-20120801-267.0.1.el8.aarch64
libstdc++-devel-8.5.0-21.0.1.el8.aarch64
unzip-6.0-46.0.1.el8.aarch64
gcc-8.5.0-21.0.1.el8.aarch64
gcc-c++-8.5.0-21.0.1.el8.aarch64
libnsl-2.28-251.0.2.el8.aarch64
psmisc-23.1-5.el8.aarch64
gcc-8.5.0-21.0.1.el8.aarch64
gcc-c++-8.5.0-21.0.1.el8.aarch64

#==============================================================#                                                                                  
禁用防火墙                                                                                       
#==============================================================#                                                                                  

● firewalld.service - firewalld - dynamic firewall daemon
   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: enabled)
   Active: inactive (dead)
     Docs: man:firewalld(1)

Jun 27 12:49:38 localhost.localdomain systemd[1]: Starting firewalld - dynamic firewall daemon...
Jun 27 12:49:39 localhost.localdomain systemd[1]: Started firewalld - dynamic firewall daemon.
Jun 27 12:49:39 localhost.localdomain firewalld[849]: WARNING: AllowZoneDrifting is enabled. This is considered an insecure configuration option. It will be removed in a future release. Please consider disabling it now.
Jun 27 13:09:46 oel810-arm64 systemd[1]: Stopping firewalld - dynamic firewall daemon...
Jun 27 13:09:46 oel810-arm64 systemd[1]: firewalld.service: Succeeded.
Jun 27 13:09:46 oel810-arm64 systemd[1]: Stopped firewalld - dynamic firewall daemon.

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

oel810-arm64

#==============================================================#                                                                                  
配置 /etc/hosts 文件                                                                                  
#==============================================================#                                                                                  

127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.211.55.130   oel810-arm64

#==============================================================#                                                                                  
创建用户和组                                                                                    
#==============================================================#                                                                                  

oracle 用户：                                                                                      

uid=54321(oracle) gid=54321(oinstall) groups=54321(oinstall),54322(dba),54323(oper),54324(backupdba),54325(dgdba),54326(kmdba),54330(racdba)


#==============================================================#                                                                                  
配置透明大页 && NUMA && 磁盘 IO 调度器                                                                                  
#==============================================================#                                                                                  

args="ro rd.lvm.lv=ol/root rd.lvm.lv=ol/swap rhgb quiet numa=off transparent_hugepage=never elevator=deadline $tuned_params"
-rd.lvm.lv=ol/root
-args="ro
args="ro rd.lvm.lv=ol/root rd.lvm.lv=ol/swap rhgb quiet numa=off transparent_hugepage=never elevator=deadline"
-
-elevator=deadline"

#==============================================================#                                                                                  
配置 sysctl.conf                                                                                    
#==============================================================#                                                                                  

查看 sysctl.conf 配置情况 ：sysctl -p                                                                                  

fs.aio-max-nr = 1048576
fs.file-max = 6815744
kernel.shmall = 2097152
kernel.shmmax = 8303366134
kernel.shmmni = 4096
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 1048576
vm.min_free_kbytes = 32435
net.ipv4.conf.enp0s5.rp_filter = 1
vm.swappiness = 10
kernel.panic_on_oops = 1
kernel.randomize_va_space = 2
kernel.numa_balancing = 0

#==============================================================#                                                                                  
配置 RemoveIPC                                                                                      
#==============================================================#                                                                                  

查看 RemoveIPC ：/etc/systemd/logind.conf                                                                                  

RemoveIPC=no
RemoveIPC=no

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
session    optional     pam_console.so
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

/dev/mapper/ol-root     /                       xfs     defaults        0 0
UUID=33b0abab-16cf-4341-aa9b-01197bc9f343 /boot                   xfs     defaults        0 0
UUID=E906-4461          /boot/efi               vfat    umask=0077,shortname=winnt 0 2
/dev/mapper/ol-swap     none                    swap    defaults        0 0
tmpfs /dev/shm tmpfs size=8108756k 0 0

#==============================================================#                                                                                  
Root 用户环境变量                                                                                  
#==============================================================#                                                                                  

查看 root 用户环境变量：/root/.bash_profile                                                                                  

if [ -f ~/.bashrc ]; then
        . ~/.bashrc
fi
PATH=$PATH:$HOME/bin
export PATH
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

#==============================================================#                                                                                  
静默解压 Oracle 软件包                                                                                  
#==============================================================#                                                                                  

正在静默解压缩 Oracle 软件包，请稍等：                                                                                  


静默解压 Oracle 软件安装包： /soft/LINUX.ARM64_1919000_db_home.zip                                                                                  

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

OPatch Version: 12.2.0.1.37

OPatch succeeded.

正在安装 Oracle 软件：                                                                                  

Launching Oracle Database Setup Wizard...

The response file for this session can be found at:
 /u01/app/oracle/product/19.3.0/db/install/response/db_2024-06-27_01-10-35PM.rsp

You can find the log of this install session at:
 /tmp/InstallActions2024-06-27_01-10-35PM/installActions2024-06-27_01-10-35PM.log

As a root user, execute the following script(s):
        1. /u01/app/oraInventory/orainstRoot.sh
        2. /u01/app/oracle/product/19.3.0/db/root.sh

Execute /u01/app/oraInventory/orainstRoot.sh on the following nodes: 
[oel810-arm64]
Execute /u01/app/oracle/product/19.3.0/db/root.sh on the following nodes: 
[oel810-arm64]


Successfully Setup Software.
Moved the install session logs to:
 /u01/app/oraInventory/logs/InstallActions2024-06-27_01-10-35PM

#==============================================================#                                                                                  
执行 root 脚本                                                                                    
#==============================================================#                                                                                  

执行命令：/u01/app/oraInventory/orainstRoot.sh                                                                                  

Changing permissions of /u01/app/oraInventory.
Adding read,write permissions for group.
Removing read,write,execute permissions for world.

Changing groupname of /u01/app/oraInventory to oinstall.
The execution of the script is complete.

执行命令：/u01/app/oracle/product/19.3.0/db/root.sh                                                                                  

Check /u01/app/oracle/product/19.3.0/db/install/root_oel810-arm64_2024-06-27_13-11-05-819882490.log for the output of root script

#==============================================================#                                                                                  
Oracle 软件版本                                                                                   
#==============================================================#                                                                                  


SQL*Plus: Release 19.0.0.0.0 - Production
Version 19.19.0.0.0


#==============================================================#                                                                                  
Oracle 补丁信息                                                                                   
#==============================================================#                                                                                  

There are no Interim patches installed in this Oracle Home "/u01/app/oracle/product/19.3.0/db".

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


Parsing command line arguments:
    Parameter "silent" = true
    Parameter "responsefile" = /u01/app/oracle/product/19.3.0/db/assistants/netca/netca.rsp
Done parsing command line arguments.
Oracle Net Services Configuration:
Profile configuration complete.
Oracle Net Listener Startup:
    Running Listener Control: 
      /u01/app/oracle/product/19.3.0/db/bin/lsnrctl start LISTENER
    Listener Control complete.
    Listener started successfully.
Listener configuration complete.
Oracle Net Services configuration successful. The exit code is 0


#==============================================================#                                                                                  
检查监听状态                                                                                    
#==============================================================#                                                                                  


LSNRCTL for Linux: Version 19.0.0.0.0 - Production on 27-JUN-2024 13:11:07

Copyright (c) 1991, 2023, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oel810-arm64)(PORT=1521)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 19.0.0.0.0 - Production
Start Date                27-JUN-2024 13:11:07
Uptime                    0 days 0 hr. 0 min. 0 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/oracle/product/19.3.0/db/network/admin/listener.ora
Listener Log File         /u01/app/oracle/diag/tnslsnr/oel810-arm64/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=oel810-arm64)(PORT=1521)))
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
totalMemory=6334
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

Prepare for db operation
10% complete
Copying database files
40% complete
Creating and starting Oracle instance
42% complete
46% complete
50% complete
54% complete
60% complete
Completing Database Creation
66% complete
69% complete
70% complete
Executing Post Configuration Actions
100% complete
Database creation complete. For details check the logfiles at:
 /u01/app/oracle/cfgtoollogs/dbca/lucifer.
Database Information:
Global Database Name:lucifer
System Identifier(SID):lucifer
Look at the log file "/u01/app/oracle/cfgtoollogs/dbca/lucifer/lucifer.log" for further details.

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

touch /var/lock/subsys/local
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
db_recovery_file_dest_size                         *          6769606656                                                                       6769606656
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
nls_language                                       *          AMERICAN                                                                         AMERICAN
nls_territory                                      *          AMERICA                                                                          AMERICA
open_cursors                                       *          1000                                                                             300
optimizer_adaptive_plans                           *                                                                                           TRUE
optimizer_adaptive_statistics                      *                                                                                           FALSE
optimizer_index_caching                            *                                                                                           0
optimizer_mode                                     *                                                                                           ALL_ROWS
parallel_force_local                               *                                                                                           FALSE
parallel_max_servers                               *          64                                                                               64
pga_aggregate_target                               *          1327497216                                                                       1660944384
processes                                          *          2000                                                                             320
remote_login_passwordfile                          *          EXCLUSIVE                                                                        EXCLUSIVE
session_cached_cursors                             *          300                                                                              50
sessions                                           *                                                                                           504
sga_max_size                                       *          5313134592                                                                       4982833152
sga_target                                         *          5313134592                                                                       4982833152
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