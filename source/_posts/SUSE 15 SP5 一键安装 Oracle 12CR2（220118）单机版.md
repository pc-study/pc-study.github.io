---
title: SUSE 15 SP5 一键安装 Oracle 12CR2（220118）单机版
date: 2024-03-27 14:16:14
tags: [suse,oracle,oracle数据库,墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1772860821603979264
---

# 前言
**Oracle 一键安装脚本，演示 SUSE 15 SP5 一键安装 Oracle 12CR2（220118）单机版过程（全程无需人工干预）：（脚本包括 <font color='red'>ORALCE PSU/OJVM 等补丁自动安装</font>）**

**⭐️ <font color='red'>脚本下载地址</font>：[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)**

脚本第三代支持 N 节点一键安装，不限制节点数！

![](https://oss-emcsprod-public.modb.pro/image/editor/20230505-1847efab-b5e0-4f66-93f5-79b6e108980e.png)

# 安装准备
- 1、安装好操作系统，建议安装图形化
- 2、配置好网络
- 3、挂载本地 ISO 镜像源
- 4、上传软件安装包（安装基础包，补丁包：33561275、33587128、6880880）
- 5、上传一键安装脚本：OracleShellInstall

**✨ 偷懒可以直接下载本文安装包合集：[SUSE 15 SP5 一键安装 Oracle 12CR2（220118）单机版安装包合集（包含补丁！！！）](https://www.modb.pro/doc/127445)**

# 演示环境信息
```bash
# 主机版本
suse15:/soft # cat /etc/os-release 
NAME="SLES"
VERSION="15-SP5"
VERSION_ID="15.5"
PRETTY_NAME="SUSE Linux Enterprise Server 15 SP5"
ID="sles"
ID_LIKE="suse"
ANSI_COLOR="0;32"
CPE_NAME="cpe:/o:suse:sles:15:sp5"
DOCUMENTATION_URL="https://documentation.suse.com/"

# 网络信息
suse15:/soft # ip a
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:0c:29:4e:7a:77 brd ff:ff:ff:ff:ff:ff
    altname enp11s0
    altname ens192
    inet 192.168.6.138/24 brd 192.168.6.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe4e:7a77/64 scope link 
       valid_lft forever preferred_lft forever

# 挂载本地 ISO 镜像
suse15:/soft # mount | grep iso9660 | grep -v "/run/media"
/dev/sr0 on /mnt type iso9660 (ro,relatime,nojoliet,check=s,map=n,blocksize=2048,iocharset=utf8)
suse15:/soft # df -h|grep /mnt
/dev/sr0                    14G   14G     0 100% /mnt

# 安装包存放在 /soft 目录下
suse15:/soft # ll
-rwx------ 1 root root 3453696911 Mar 27 13:38 LINUX.X64_122010_db_home.zip
-rwxr-xr-x 1 root root     166840 Mar 27 13:37 OracleShellInstall
-rwxr-xr-x 1 root root  138022236 Mar 27 13:37 p33561275_122010_Linux-x86-64.zip
-rwx------ 1 root root 1020001457 Mar 27 13:38 p33587128_122010_Linux-x86-64.zip
-rwx------ 1 root root  124109254 Mar 27 13:37 p6880880_122010_Linux-x86-64.zip
-rwx------ 1 root root     321590 Mar 26 10:35 rlwrap-0.44.tar.gz
```
确保安装环境准备完成后，即可执行一键安装。

# 安装命令
使用标准生产环境安装参数：
```bash
# 根据脚本 README 或者 -h 命令提示，编辑好一键安装命令，进入 /soft 目录执行安装：
./OracleShellInstall -lf eth0 `# local ip ifname`\
-n suse15 `# hostname`\
-op oracle `# oracle password`\
-d /u01 `# software base dir`\
-ord /oradata `# data dir`\
-o lucifer `# dbname`\
-dp oracle `# sys/system password`\
-ds AL32UTF8 `# database character`\
-ns AL16UTF16 `# national character`\
-redo 100 `# redo size`\
-opa 33587128 `# oracle PSU/RU`\
-jpa 33561275 `# OJVM PSU/RU`\
-opd Y `# optimize db`
```

选择需要安装的模式以及版本，即可开始安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240327-7faad998-32cb-4ca3-8e66-c039c04825f0.png)

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

请选择数据库版本 [11/12/19/21] : 12

数据库版本:     12                                                                               

#==============================================================#                                                                                  
配置本地 YUM 源                                                                                  
#==============================================================#                                                                                  

Adding repository 'sles' [...done]
Repository 'sles' successfully added

URI         : dir:/mnt/Module-Basesystem
Enabled     : Yes
GPG Check   : Yes
Autorefresh : Yes
Priority    : 99 (default priority)

Repository priorities are without effect. All enabled repositories share the same priority.
Adding repository 'sles-Legacy' [...done]
Repository 'sles-Legacy' successfully added

URI         : dir:/mnt/Module-Legacy
Enabled     : Yes
GPG Check   : Yes
Autorefresh : Yes
Priority    : 99 (default priority)

Repository priorities are without effect. All enabled repositories share the same priority.
Adding repository 'sles-Tools' [...done]
Repository 'sles-Tools' successfully added

URI         : dir:/mnt/Module-Development-Tools
Enabled     : Yes
GPG Check   : Yes
Autorefresh : Yes
Priority    : 99 (default priority)

Repository priorities are without effect. All enabled repositories share the same priority.

#==============================================================#                                                                                  
禁用防火墙                                                                                       
#==============================================================#                                                                                  

○ firewalld.service - firewalld - dynamic firewall daemon
     Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: disabled)
     Active: inactive (dead)
       Docs: man:firewalld(1)

Mar 25 16:02:33 localhost systemd[1]: Starting firewalld - dynamic firewall daemon...
Mar 25 16:02:37 localhost systemd[1]: Started firewalld - dynamic firewall daemon.
Mar 27 13:41:21 suse15 systemd[1]: Stopping firewalld - dynamic firewall daemon...
Mar 27 13:41:22 suse15 systemd[1]: firewalld.service: Deactivated successfully.
Mar 27 13:41:22 suse15 systemd[1]: Stopped firewalld - dynamic firewall daemon.

#==============================================================#                                                                                  
YUM 静默安装依赖包                                                                                  
#==============================================================#                                                                                  

bc-1.07.1-11.37.x86_64
binutils-2.39-150100.7.40.1.x86_64
package compat-libcap1 is not installed
gcc-7-3.9.1.x86_64
gcc-c++-7-3.9.1.x86_64
package elfutils-libelf is not installed
package elfutils-libelf-devel is not installed
glibc-2.31-150300.46.1.x86_64
glibc-devel-2.31-150300.46.1.x86_64
package libaio is not installed
libaio-devel-0.3.109-1.25.x86_64
package libgcc is not installed
package libstdc++ is not installed
libstdc++-devel-7-3.9.1.x86_64
package libxcb is not installed
package libX11 is not installed
package libXau is not installed
package libXi is not installed
package libXrender is not installed
make-4.2.1-7.3.2.x86_64
net-tools-2.0+git20170221.479bb4a-3.11.x86_64
smartmontools-7.2-150300.8.8.1.x86_64
sysstat-12.0.2-3.33.1.x86_64
e2fsprogs-1.46.4-150400.3.3.1.x86_64
package e2fsprogs-libs is not installed
unzip-6.00-150000.4.11.1.x86_64
openssh-clients-8.4p1-150300.3.18.2.x86_64
package readline is not installed
readline-devel-7.0-150400.25.22.x86_64
psmisc-23.0-150000.6.22.1.x86_64
package ksh is not installed
package nfs-utils is not installed
tar-1.34-150000.3.31.1.x86_64
package device-mapper-multipath is not installed
avahi-0.8-150400.7.3.1.x86_64
ntp-4.2.8p15-150000.4.22.1.x86_64
chrony-4.1-150400.19.4.x86_64
package libXtst is not installed
libXrender-devel-0.9.10-1.30.x86_64
fontconfig-devel-2.13.1-150400.1.4.x86_64
policycoreutils-3.1-150400.1.5.x86_64
package policycoreutils-python is not installed
insserv-compat-0.1-4.6.1.noarch
libXext-devel-1.3.3-1.30.x86_64
libXi-devel-1.7.9-3.2.1.x86_64
libcap-ng-utils-0.7.9-4.37.x86_64
libcap-progs-2.63-150400.1.7.x86_64
libcap1-1.97-1.15.x86_64
libpcap1-1.10.1-150400.1.7.x86_64
libpcre16-0-8.45-150000.20.13.1.x86_64
pixz-1.0.6-1.13.x86_64
rdma-core-devel-42.0-150500.1.3.x86_64
xorg-x11-libs-7.6.1-1.16.noarch
compat-libpthread-nonshared-0-150300.3.6.1.x86_64
package librdmacm is not installed
package libnsl* is not installed
libibverbs-42.0-150500.1.3.x86_64
package compat-openssl10 is not installed
policycoreutils-python-utils-3.1-150400.1.5.noarch
package elfutils* is not installed
glibc-2.31-150300.46.1.x86_64

#==============================================================#                                                                                  
配置主机名                                                                                       
#==============================================================#                                                                                  

suse15

#==============================================================#                                                                                  
配置 /etc/hosts 文件                                                                                  
#==============================================================#                                                                                  

127.0.0.1       localhost
::1             localhost ipv6-localhost ipv6-loopback
fe00::0         ipv6-localnet
ff00::0         ipv6-mcastprefix
ff02::1         ipv6-allnodes
ff02::2         ipv6-allrouters
ff02::3         ipv6-allhosts
192.168.6.138   suse15

#==============================================================#                                                                                  
创建用户和组                                                                                    
#==============================================================#                                                                                  

oracle 用户：                                                                                      

uid=54321(oracle) gid=54321(oinstall) groups=54322(dba),54323(oper),54324(backupdba),54325(dgdba),54326(kmdba),54330(racdba),54321(oinstall)


#==============================================================#                                                                                  
配置 Avahi-daemon 服务                                                                                  
#==============================================================#                                                                                  

○ avahi-daemon.service - Avahi mDNS/DNS-SD Stack
     Loaded: loaded (/usr/lib/systemd/system/avahi-daemon.service; disabled; vendor preset: enabled)
     Active: inactive (dead)
TriggeredBy: ○ avahi-daemon.socket

#==============================================================#                                                                                  
配置透明大页 && NUMA && 磁盘 IO 调度器                                                                                  
#==============================================================#                                                                                  

Generating grub configuration file ...
Found theme: /boot/grub2/themes/SLE/theme.txt
Found linux image: /boot/vmlinuz-5.14.21-150500.53-default
Found initrd image: /boot/initrd-5.14.21-150500.53-default
Adding boot menu entry for UEFI Firmware Settings ...
done

#==============================================================#                                                                                  
配置 sysctl.conf                                                                                    
#==============================================================#                                                                                  

fs.aio-max-nr = 1048576
fs.file-max = 6815744
kernel.shmall = 2097152
kernel.shmmax = 8332693503
kernel.shmmni = 4096
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 1048576
vm.min_free_kbytes = 32549
net.ipv4.conf.eth0.rp_filter = 1
vm.swappiness = 10
kernel.panic_on_oops = 1
kernel.randomize_va_space = 2
kernel.numa_balancing = 0

#==============================================================#                                                                                  
配置 RemoveIPC                                                                                      
#==============================================================#                                                                                  

[Login]

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

auth      requisite  pam_nologin.so
auth      include    common-auth
account   include    common-account
password  include    common-password
session   required   pam_loginuid.so
session   optional   pam_keyinit.so force revoke
session   include    common-session
session   optional   pam_mail.so standard
session required pam_limits.so
session required /lib64/security/pam_limits.so

#==============================================================#                                                                                  
配置 /dev/shm                                                                                       
#==============================================================#                                                                                  

/dev/rootgv/rootlv                         /          xfs   defaults  0  0
UUID=e16e4a70-ce93-4f3e-9103-7b9243fcabcc  /boot      xfs   defaults  0  0
UUID=CBDD-C51E                             /boot/efi  vfat  utf8      0  2
/dev/rootgv/swaplv                         swap       swap  defaults  0  0
tmpfs /dev/shm tmpfs size=8137396k 0 0

#==============================================================#                                                                                  
安装 rlwrap 插件                                                                                  
#==============================================================#                                                                                  

成功安装 rlwrap： rlwrap 0.44                                                                      

#==============================================================#                                                                                  
Root 用户环境变量                                                                                  
#==============================================================#                                                                                  

alias so='su - oracle'
export PS1="[`whoami`@`hostname`:"'$PWD]$ '

#==============================================================#                                                                                  
Oracle 用户环境变量                                                                                  
#==============================================================#                                                                                  

umask 022
export TMP=/tmp
export TMPDIR=$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=/u01/app/oracle/product/12.2.0/db
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

.---- -. -. .  .   .        .
( .',----- - - ' '      '                                         __
 \_/      ;--:-          __--------------------___  ____=========_||___
__U__n_^_''__[.  ooo___  | |_!_||_!_||_!_||_!_| |   |..|_i_|..|_i_|..|
c(_ ..(_ ..(_ ..( /,,,,,,] | |___||___||___||___| |   |                |
,_\___________'_|,L______],|______________________|_i,!________________!_i
/;_(@)(@)==(@)(@)   (o)(o)      (o)^(o)--(o)^(o)          (o)(o)-(o)(o)
""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"""~"'""

静默解压 Oracle 软件安装包： /soft/LINUX.X64_122010_db_home.zip                                                                                  

静默解压 Oracle 软件补丁包： /soft/p33587128*.zip                                                                                  

静默解压 OJVM 软件补丁包： /soft/p33561275*.zip                                                                                  

#==============================================================#                                                                                  
Oracle 安装静默文件                                                                                  
#==============================================================#                                                                                  

oracle.install.option=INSTALL_DB_SWONLY
UNIX_GROUP_NAME=oinstall
INVENTORY_LOCATION=/u01/app/oraInventory
ORACLE_BASE=/u01/app/oracle
oracle.install.db.InstallEdition=EE
oracle.install.db.DBA_GROUP=dba
oracle.install.db.OPER_GROUP=oper
oracle.install.responseFileVersion=/oracle/install/rspfmt_dbinstall_response_schema_v12.2.0
SELECTED_LANGUAGES=en,zh_CN
ORACLE_HOME=/u01/app/oracle/product/12.2.0/db
oracle.install.db.OSBACKUPDBA_GROUP=backupdba
oracle.install.db.OSDGDBA_GROUP=dgdba
oracle.install.db.OSKMDBA_GROUP=kmdba
oracle.install.db.OSRACDBA_GROUP=racdba

#==============================================================#                                                                                  
静默安装数据库软件                                                                                  
#==============================================================#                                                                                  

Starting Oracle Universal Installer...

Checking Temp space: must be greater than 500 MB.   Actual 77573 MB    Passed
Checking swap space: must be greater than 150 MB.   Actual 8191 MB    Passed
Preparing to launch Oracle Universal Installer from /tmp/OraInstall2024-03-27_01-46-17PM. Please wait ...You can find the log of this install session at:
 /u01/app/oraInventory/logs/installActions2024-03-27_01-46-17PM.log

Prepare in progress.
..................................................   8% Done.

Prepare successful.

Copy files in progress.
..................................................   17% Done.
..................................................   22% Done.
..................................................   27% Done.
..................................................   32% Done.
..................................................   40% Done.
..................................................   45% Done.
..................................................   50% Done.
..................................................   55% Done.
..................................................   60% Done.
..................................................   65% Done.
..................................................   70% Done.
..................................................   75% Done.
..................................................   80% Done.
....................
Copy files successful.

Link binaries in progress.
..........
Link binaries successful.

Setup files in progress.
..............................
Setup files successful.

Setup Inventory in progress.

Setup Inventory successful.

Finish Setup successful.
The installation of Oracle Database 12c was successful.
Please check '/u01/app/oraInventory/logs/silentInstall2024-03-27_01-46-17PM.log' for more details.

Setup Oracle Base in progress.

Setup Oracle Base successful.
..................................................   95% Done.

As a root user, execute the following script(s):
        1. /u01/app/oraInventory/orainstRoot.sh
        2. /u01/app/oracle/product/12.2.0/db/root.sh



..................................................   100% Done.
Successfully Setup Software.

#==============================================================#                                                                                  
执行 root 脚本                                                                                    
#==============================================================#                                                                                  

Changing permissions of /u01/app/oraInventory.
Adding read,write permissions for group.
Removing read,write,execute permissions for world.

Changing groupname of /u01/app/oraInventory to oinstall.
The execution of the script is complete.
Check /u01/app/oracle/product/12.2.0/db/install/root_suse15_2024-03-27_13-54-58-046457064.log for the output of root script

#==============================================================#                                                                                  
Oracle 软件安装补丁                                                                                  
#==============================================================#                                                                                  

Oracle Interim Patch Installer version 12.2.0.1.30
Copyright (c) 2024, Oracle Corporation.  All rights reserved.

PREREQ session

Oracle Home       : /u01/app/oracle/product/12.2.0/db
Central Inventory : /u01/app/oraInventory
   from           : /u01/app/oracle/product/12.2.0/db/oraInst.loc
OPatch version    : 12.2.0.1.30
OUI version       : 12.2.0.1.4
Log file location : /u01/app/oracle/product/12.2.0/db/cfgtoollogs/opatch/opatch2024-03-27_13-55-05PM_1.log

Invoking prereq "checkconflictagainstohwithdetail"

Prereq "checkConflictAgainstOHWithDetail" passed.

OPatch succeeded.
Oracle Interim Patch Installer version 12.2.0.1.30
Copyright (c) 2024, Oracle Corporation.  All rights reserved.


Oracle Home       : /u01/app/oracle/product/12.2.0/db
Central Inventory : /u01/app/oraInventory
   from           : /u01/app/oracle/product/12.2.0/db/oraInst.loc
OPatch version    : 12.2.0.1.30
OUI version       : 12.2.0.1.4
Log file location : /u01/app/oracle/product/12.2.0/db/cfgtoollogs/opatch/opatch2024-03-27_13-55-07PM_1.log

Verifying environment and performing prerequisite checks...
OPatch continues with these patches:   33587128  

Do you want to proceed? [y|n]
Y (auto-answered by -silent)
User Responded with: Y
All checks passed.

Please shutdown Oracle instances running out of this ORACLE_HOME on the local system.
(Oracle Home = '/u01/app/oracle/product/12.2.0/db')


Is the local system ready for patching? [y|n]
Y (auto-answered by -silent)
User Responded with: Y
Backing up files...
Applying interim patch '33587128' to OH '/u01/app/oracle/product/12.2.0/db'
ApplySession: Optional component(s) [ oracle.swd, 12.2.0.1.0 ] , [ oracle.swd.oui, 12.2.0.1.0 ] , [ oracle.network.cman, 12.2.0.1.0 ] , [ oracle.network.gsm, 12.2.0.1.0 ] , [ oracle.rdbms.drdaas, 12.2.0.1.0 ] , [ oracle.ons.cclient, 12.2.0.1.0 ] , [ oracle.ons.daemon, 12.2.0.1.0 ] , [ oracle.ons.eons.bwcompat, 12.2.0.1.0 ] , [ oracle.oid.client, 12.2.0.1.0 ]  not present in the Oracle Home or a higher version is found.

Patching component oracle.rdbms.util, 12.2.0.1.0...

Patching component oracle.rdbms, 12.2.0.1.0...

Patching component oracle.network.rsf, 12.2.0.1.0...

Patching component oracle.rdbms.rsf, 12.2.0.1.0...

Patching component oracle.ctx, 12.2.0.1.0...

Patching component oracle.has.common.cvu, 12.2.0.1.0...

Patching component oracle.ldap.owm, 12.2.0.1.0...

Patching component oracle.ldap.rsf, 12.2.0.1.0...

Patching component oracle.nlsrtl.rsf, 12.2.0.1.0...

Patching component oracle.oracore.rsf, 12.2.0.1.0...

Patching component oracle.oraolap, 12.2.0.1.0...

Patching component oracle.rdbms.dbscripts, 12.2.0.1.0...

Patching component oracle.rdbms.deconfig, 12.2.0.1.0...

Patching component oracle.rdbms.rsf.ic, 12.2.0.1.0...

Patching component oracle.sdo, 12.2.0.1.0...

Patching component oracle.sdo.locator, 12.2.0.1.0...

Patching component oracle.sdo.locator.jrf, 12.2.0.1.0...

Patching component oracle.tfa, 12.2.0.1.0...

Patching component oracle.ctx.rsf, 12.2.0.1.0...

Patching component oracle.rdbms.install.plugins, 12.2.0.1.0...

Patching component oracle.rdbms.install.common, 12.2.0.1.0...

Patching component oracle.assistants.deconfig, 12.2.0.1.0...

Patching component oracle.ons.ic, 12.2.0.1.0...

Patching component oracle.rdbms.rman, 12.2.0.1.0...

Patching component oracle.precomp.rsf, 12.2.0.1.0...

Patching component oracle.install.deinstalltool, 12.2.0.1.0...

Patching component oracle.assistants.acf, 12.2.0.1.0...

Patching component oracle.rdbms.oci, 12.2.0.1.0...

Patching component oracle.sqlplus.ic, 12.2.0.1.0...

Patching component oracle.xdk.parser.java, 12.2.0.1.0...

Patching component oracle.dbtoolslistener, 12.2.0.1.0...

Patching component oracle.ldap.rsf.ic, 12.2.0.1.0...

Patching component oracle.rdbms.dv, 12.2.0.1.0...

Patching component oracle.rdbms.lbac, 12.2.0.1.0...

Patching component oracle.ons, 12.2.0.1.0...

Patching component oracle.ldap.client, 12.2.0.1.0...

Patching component oracle.xdk, 12.2.0.1.0...

Patching component oracle.xdk.rsf, 12.2.0.1.0...

Patching component oracle.sqlplus, 12.2.0.1.0...

Patching component oracle.assistants.server, 12.2.0.1.0...

Patching component oracle.rdbms.crs, 12.2.0.1.0...

Patching component oracle.precomp.common, 12.2.0.1.0...

Patching component oracle.precomp.lang, 12.2.0.1.0...

Patching component oracle.jdk, 1.8.0.91.0...

OPatch found the word "error" in the stderr of the make command.
Please look at this stderr. You can re-run this make command.
Stderr output:
chmod: changing permissions of '/u01/app/oracle/product/12.2.0/db/bin/extjobO': Operation not permitted
make: [ins_rdbms.mk:533: iextjob] Error 1 (ignored)


Patch 33587128 successfully applied.
OPatch Session completed with warnings.
Log file location: /u01/app/oracle/product/12.2.0/db/cfgtoollogs/opatch/opatch2024-03-27_13-55-07PM_1.log

OPatch completed with warnings.

#==============================================================#                                                                                  
OJVM 补丁安装                                                                                     
#==============================================================#                                                                                  

Oracle Interim Patch Installer version 12.2.0.1.30
Copyright (c) 2024, Oracle Corporation.  All rights reserved.

PREREQ session

Oracle Home       : /u01/app/oracle/product/12.2.0/db
Central Inventory : /u01/app/oraInventory
   from           : /u01/app/oracle/product/12.2.0/db/oraInst.loc
OPatch version    : 12.2.0.1.30
OUI version       : 12.2.0.1.4
Log file location : /u01/app/oracle/product/12.2.0/db/cfgtoollogs/opatch/opatch2024-03-27_14-02-48PM_1.log

Invoking prereq "checkconflictagainstohwithdetail"

Prereq "checkConflictAgainstOHWithDetail" passed.

OPatch succeeded.
Oracle Interim Patch Installer version 12.2.0.1.30
Copyright (c) 2024, Oracle Corporation.  All rights reserved.


Oracle Home       : /u01/app/oracle/product/12.2.0/db
Central Inventory : /u01/app/oraInventory
   from           : /u01/app/oracle/product/12.2.0/db/oraInst.loc
OPatch version    : 12.2.0.1.30
OUI version       : 12.2.0.1.4
Log file location : /u01/app/oracle/product/12.2.0/db/cfgtoollogs/opatch/opatch2024-03-27_14-02-50PM_1.log

Verifying environment and performing prerequisite checks...
OPatch continues with these patches:   33561275  

Do you want to proceed? [y|n]
Y (auto-answered by -silent)
User Responded with: Y
All checks passed.

Please shutdown Oracle instances running out of this ORACLE_HOME on the local system.
(Oracle Home = '/u01/app/oracle/product/12.2.0/db')


Is the local system ready for patching? [y|n]
Y (auto-answered by -silent)
User Responded with: Y
Backing up files...
Applying interim patch '33561275' to OH '/u01/app/oracle/product/12.2.0/db'

Patching component oracle.javavm.server, 12.2.0.1.0...

Patching component oracle.javavm.server.core, 12.2.0.1.0...

Patching component oracle.rdbms.dbscripts, 12.2.0.1.0...

Patching component oracle.javavm.client, 12.2.0.1.0...

Patching component oracle.rdbms, 12.2.0.1.0...

Patching component oracle.dbjava.jdbc, 12.2.0.1.0...

Patching component oracle.dbjava.ic, 12.2.0.1.0...
Patch 33561275 successfully applied.
Log file location: /u01/app/oracle/product/12.2.0/db/cfgtoollogs/opatch/opatch2024-03-27_14-02-50PM_1.log

OPatch succeeded.

#==============================================================#                                                                                  
Oracle 软件版本                                                                                   
#==============================================================#                                                                                  


SQL*Plus: Release 12.2.0.1.0 Production


#==============================================================#                                                                                  
Oracle 补丁信息                                                                                   
#==============================================================#                                                                                  

33561275;OJVM RELEASE UPDATE 12.2.0.1.220118 (33561275)
33587128;Database Jan 2022 Release Update : 12.2.0.1.220118 (33587128)

OPatch succeeded.


#==============================================================#                                                                                  
配置监听                                                                                          
#==============================================================#                                                                                  


Parsing command line arguments:
    Parameter "silent" = true
    Parameter "responsefile" = /u01/app/oracle/product/12.2.0/db/assistants/netca/netca.rsp
Done parsing command line arguments.
Oracle Net Services Configuration:
Profile configuration complete.
Oracle Net Listener Startup:
    Running Listener Control: 
      /u01/app/oracle/product/12.2.0/db/bin/lsnrctl start LISTENER
    Listener Control complete.
    Listener started successfully.
Listener configuration complete.
Oracle Net Services configuration successful. The exit code is 0

检查监听状态：                                                                                  


LSNRCTL for Linux: Version 12.2.0.1.0 - Production on 27-MAR-2024 14:04:14

Copyright (c) 1991, 2016, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=suse15)(PORT=1521)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 12.2.0.1.0 - Production
Start Date                27-MAR-2024 14:04:14
Uptime                    0 days 0 hr. 0 min. 0 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/oracle/product/12.2.0/db/network/admin/listener.ora
Listener Log File         /u01/app/oracle/diag/tnslsnr/suse15/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=suse15)(PORT=1521)))
  (DESCRIPTION=(ADDRESS=(PROTOCOL=ipc)(KEY=EXTPROC1521)))
The listener supports no services
The command completed successfully

#==============================================================#                                                                                  
静默建库命令                                                                                    
#==============================================================#                                                                                  

dbca -silent -createDatabase \
-ignorePrereqFailure \
-templateName General_Purpose.dbc \
-responseFile NO_VALUE \
-gdbName lucifer \
-sid lucifer \
-sysPassword oracle \
-systemPassword oracle \
-redoLogFileSize 100 \
-datafileDestination /oradata \
-storageType FS \
-enableArchive true \
-archiveLogDest /oradata \
-databaseConfigType SINGLE \
-characterset AL32UTF8 \
-nationalCharacterSet AL16UTF16 \
-emConfiguration NONE \
-automaticMemoryManagement false \
-totalMemory 3973 \
-databaseType OLTP \
-createAsContainerDatabase false                                                                                  

#==============================================================#                                                                                  
创建数据库                                                                                       
#==============================================================#                                                                                  

[WARNING] [DBT-06208] The 'SYS' password entered does not conform to the Oracle recommended standards.
   CAUSE: 
a. Oracle recommends that the password entered should be at least 8 characters in length, contain at least 1 uppercase character, 1 lower case character and 1 digit [0-9].
b.The password entered is a keyword that Oracle does not recommend to be used as password
   ACTION: Specify a strong password. If required refer Oracle documentation for guidelines.
[WARNING] [DBT-06208] The 'SYSTEM' password entered does not conform to the Oracle recommended standards.
   CAUSE: 
a. Oracle recommends that the password entered should be at least 8 characters in length, contain at least 1 uppercase character, 1 lower case character and 1 digit [0-9].
b.The password entered is a keyword that Oracle does not recommend to be used as password
   ACTION: Specify a strong password. If required refer Oracle documentation for guidelines.
Copying database files
1% complete
2% complete
18% complete
33% complete
Creating and starting Oracle instance
35% complete
40% complete
44% complete
49% complete
50% complete
53% complete
55% complete
Completing Database Creation
56% complete
57% complete
58% complete
62% complete
65% complete
66% complete
Executing Post Configuration Actions
100% complete
Look at the log file "/u01/app/oracle/cfgtoollogs/dbca/lucifer/lucifer.log" for further details.

#==============================================================#                                                                                  
配置在线重做日志                                                                                  
#==============================================================#                                                                                  

数据库在线重做日志文件：                                                                                  


   THREAD#     GROUP# MEMBER                                                                                                                      size(M)
---------- ---------- ------------------------------------------------------------------------------------------------------------------------ ----------
         1          1 /oradata/lucifer/redo01.log                                                                                                     100
         1          2 /oradata/lucifer/redo02.log                                                                                                     100
         1          3 /oradata/lucifer/redo03.log                                                                                                     100
         1         11 /oradata/LUCIFER/onlinelog/o1_mf_11_m07gbjnj_.log                                                                               100
         1         12 /oradata/LUCIFER/onlinelog/o1_mf_12_m07gbjr3_.log                                                                               100
         1         13 /oradata/LUCIFER/onlinelog/o1_mf_13_m07gbjv4_.log                                                                               100
         1         14 /oradata/LUCIFER/onlinelog/o1_mf_14_m07gbjyr_.log                                                                               100
         1         15 /oradata/LUCIFER/onlinelog/o1_mf_15_m07gbk4n_.log                                                                               100

#==============================================================#                                                                                  
配置 RMAN 备份任务                                                                                  
#==============================================================#                                                                                  

## OracleBegin
00 02 * * * /home/oracle/scripts/del_arch.sh
#00 00 * * 0 /home/oracle/scripts/dbbackup_lv0.sh
#00 00 * * 1,2,3,4,5,6 /home/oracle/scripts/dbbackup_lv1.sh

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
compatible                                         *          12.2.0                                                                           12.2.0
control_file_record_keep_time                      *          31                                                                               31
db_block_size                                      *          8192                                                                             8192
db_create_file_dest                                *          /oradata                                                                         /oradata
db_file_multiblock_read_count                      *                                                                                           128
db_files                                           *          5000                                                                             200
db_name                                            *          lucifer                                                                          lucifer
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
pga_aggregate_target                               *          1332740096                                                                       833617920
processes                                          *          2000                                                                             640
remote_login_passwordfile                          *          EXCLUSIVE                                                                        EXCLUSIVE
session_cached_cursors                             *          300                                                                              50
sessions                                           *                                                                                           984
sga_max_size                                       *          5332008960                                                                       3338665984
sga_target                                         *          5332008960                                                                       3338665984
spfile                                             *                                                                                           /u01/app/oracle/product/12.2.0/db/dbs/spfilelucifer.ora
statistics_level                                   *                                                                                           TYPICAL
undo_retention                                     *          10800                                                                            900

恭喜！Oracle 单机安装成功，现在是否重启主机：[Y/N] Y
```