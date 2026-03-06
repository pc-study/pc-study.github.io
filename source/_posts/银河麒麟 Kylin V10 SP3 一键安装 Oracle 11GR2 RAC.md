---
title: 银河麒麟 Kylin V10 SP3 一键安装 Oracle 11GR2 RAC
date: 2024-05-24 15:39:58
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1793909705512914944
---

# 前言
Oracle 一键安装脚本，演示 麒麟 Kylin V10 SP3 一键安装 Oracle 11GR2 RAC 过程（全程无需人工干预）。

>**⭐️ <font color='red'>脚本下载地址</font>：[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)**

# 安装准备
- 1、系统组所有节点均安装好操作系统（支持最小化安装）
- 2、网络组所有节点均配置好主机网络，至少需要一组公网 IP 地址和一组心跳 IP 地址
- 3、存储组所有节点均配置并在主机层挂载好 ASM 磁盘，至少需要一组 OCR 和 DATA 磁盘组，虚拟化环境需要确保已开启磁盘的 UUID
- 4、DBA 只需要在主节点创建软件目录：`mkdir /soft`
- 5、DBA 只需要在主节点上传 Oracle 安装介质（基础包，补丁包）到 /soft 目录下，其他节点无需任何操作
- 6、DBA 只需要在主节点上传 Oracle 一键安装脚本到 /soft 目录下，授予脚本执行权限：`chmod +x OracleshellInstall`
- 7、DBA 所有节点均挂载主机 ISO 镜像，这里只需要 mount 上即可（这个很简单，不了解的可以百度下）
- 8、根据脚本安装脚本以及实际情况，配置好脚本的安装参数，在主节点的 /soft 目录下执行一键安装即可。

# 环境信息
**📢注意：Oracle 11GR2 RAC 安装主机名不能有大写字符，否则安装失败！**
```bash
# 主机版本
## 节点一
[root@kylinv10-01 soft]# cat /etc/os-release 
NAME="Kylin Linux Advanced Server"
VERSION="V10 (Halberd)"
ID="kylin"
VERSION_ID="V10"
PRETTY_NAME="Kylin Linux Advanced Server V10 (Halberd)"
ANSI_COLOR="0;31"
## 节点二
[root@kylinv10-02 ~]# cat /etc/os-release 
NAME="Kylin Linux Advanced Server"
VERSION="V10 (Halberd)"
ID="kylin"
VERSION_ID="V10"
PRETTY_NAME="Kylin Linux Advanced Server V10 (Halberd)"
ANSI_COLOR="0;31"

# 网络信息
## 节点一
[root@kylinv10-01 soft]# ip a
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:d2:86:47 brd ff:ff:ff:ff:ff:ff
    inet 192.168.6.150/24 brd 192.168.6.255 scope global noprefixroute ens33
       valid_lft forever preferred_lft forever
    inet6 fe80::4471:e6d3:f2a9:96cd/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
3: ens34: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:d2:86:51 brd ff:ff:ff:ff:ff:ff
    inet 1.1.1.1/24 brd 1.1.1.255 scope global noprefixroute ens34
       valid_lft forever preferred_lft forever
    inet6 fe80::9683:eb97:5e60:cedb/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

## 节点二
[root@kylinv10-02 ~]# ip a
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:dc:5d:67 brd ff:ff:ff:ff:ff:ff
    inet 192.168.6.151/24 brd 192.168.6.255 scope global noprefixroute ens33
       valid_lft forever preferred_lft forever
    inet6 fe80::3dd1:f670:8a3d:5d90/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
3: ens34: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:dc:5d:71 brd ff:ff:ff:ff:ff:ff
    inet 1.1.1.2/24 brd 1.1.1.255 scope global noprefixroute ens34
       valid_lft forever preferred_lft forever
    inet6 fe80::9707:c4e8:d76e:8180/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

# 挂载本地 ISO 镜像
## 节点一
[root@kylinv10-01 soft]# mount /dev/sr0 /mnt/
mount: /mnt: WARNING: source write-protected, mounted read-only.
[root@kylinv10-01 soft]# mount | grep iso9660 | grep -v "/run/media"
/dev/sr0 on /mnt type iso9660 (ro,relatime,nojoliet,check=s,map=n,blocksize=2048,iocharset=utf8)
[root@kylinv10-01 soft]# df -h|grep /mnt
/dev/sr0               4.4G  4.4G     0  100% /mnt

## 节点二
[root@kylinv10-02 ~]# mount /dev/sr0 /mnt/
mount: /mnt: WARNING: source write-protected, mounted read-only.
[root@kylinv10-02 ~]# mount | grep iso9660 | grep -v "/run/media"
/dev/sr0 on /mnt type iso9660 (ro,relatime,nojoliet,check=s,map=n,blocksize=2048,iocharset=utf8)
[root@kylinv10-02 ~]# df -h|grep /mnt
/dev/sr0               4.4G  4.4G     0  100% /mnt

# 两节点均需执行，配置本地软件源(为了安装 iscsi，不需要使用 starwind 挂载共享存储可以不配置)
mkdir -p /etc/yum.repos.d/bak
mv /etc/yum.repos.d/* /etc/yum.repos.d/bak
cat <<-EOF > /etc/yum.repos.d/local.repo
[server]
name=server
baseurl=file:///mnt
enabled=1
gpgcheck=0
EOF

# 两节点均需执行，Starwind 共享磁盘挂载（有存储就不需要使用 starwind，直接存储上划盘挂载就可）
yum install -y iscsi-initiator-utils*
systemctl start iscsid.service
systemctl enable iscsid.service
iscsiadm -m discovery -t st -p 192.168.6.188
## 挂载 ASM 磁盘
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:192.168.6.188-lucifer -p 192.168.6.188 -l
## 配置开机自动挂载
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:192.168.6.188-lucifer -p 192.168.6.188 --op update -n node.startup -v automatic

## 节点一
[root@kylinv10-01 soft]# lsblk 
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda             8:0    0  100G  0 disk 
├─sda1          8:1    0    1G  0 part /boot
└─sda2          8:2    0   99G  0 part 
  ├─klas-root 253:0    0   83G  0 lvm  /
  └─klas-swap 253:1    0   16G  0 lvm  [SWAP]
sdb             8:16   0   10G  0 disk 
sdc             8:32   0   20G  0 disk 
sr0            11:0    1  4.4G  0 rom  /mnt
## 节点二
[root@Kylin02 ~]# lsblk 
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda             8:0    0  100G  0 disk 
├─sda1          8:1    0    1G  0 part /boot
└─sda2          8:2    0   99G  0 part 
  ├─klas-root 253:0    0   91G  0 lvm  /
  └─klas-swap 253:1    0    8G  0 lvm  [SWAP]
sdb             8:16   0   10G  0 disk 
sdc             8:32   0   50G  0 disk 
sr0            11:0    1  4.3G  0 rom  /mnt

# 安装包存放在 /soft 目录下
[root@kylin01 soft]# ll
-rwxr-xr-x 1 root root     225676  6月 23 16:02 OracleShellInstall
-rw-r--r-- 1 root root 1395582860  6月 23 15:39 p13390677_112040_Linux-x86-64_1of7.zip
-rw-r--r-- 1 root root 1151304589  6月 23 15:39 p13390677_112040_Linux-x86-64_2of7.zip
-rw-r--r-- 1 root root 1205251894  6月 23 15:49 p13390677_112040_Linux-x86-64_3of7.zip
-rw-r--r-- 1 root root  174911877  6月 23 15:49 p18370031_112040_Linux-x86-64.zip
# Kylin V10 安装 11GR2 Grid 必须要上传 libnsl 包，否则安装失败（下载地址：https://update.cs2c.com.cn/NS/V10/）
-rwxr-xr-x 1 root root      43320  6月 23 16:01 libnsl-2.28-98.p02.ky10.x86_64.rpm
```
确保安装环境准备完成后，即可执行一键安装。

# 安装命令
使用标准生产环境安装参数（安装过程若失败，脚本支持重复执行安装）：
```bash
# 根据脚本 README 或者 -h 命令提示，编辑好一键安装命令，进入 /soft 目录执行安装：
[root@kylinv10-01 ~]# cd /soft/
[root@kylinv10-01 soft]# chmod +x OracleShellInstall

./OracleShellInstall -n kylinv10 `# RAC 主机名前缀`\
-hn kylinv10-01,kylinv10-02 `# RAC 主机名`\
-cn kylinv10-cls `# RAC 集群名称`\
-sn kylinv10-scan `# RAC SCAN 名称`\
-rp P@ssw0rdPST `# 主机 root 用户密码`\
-lf ens33 `# 主机网卡名称`\
-pf ens34 `# 主机心跳网卡名称`\
-ri 192.168.6.150,192.168.6.151 `# RAC 公网 IP`\
-vi 192.168.6.152,192.168.6.153 `# RAC 虚拟 IP`\
-si 192.168.6.154 `# RAC SCAN IP`\
-od /dev/sdb `# OCR 磁盘盘符名称`\
-dd /dev/sdc `# DATA 磁盘盘符名称`\
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

请选择安装模式 [单机(si)/单机ASM(sa)/集群(rac)] : rac

数据库安装模式: rac                                                                              

请选择数据库版本 [11/12/19/21] : 11

数据库版本:     11                                                                               

!!! 免责声明：当前操作系统版本是 [ Kylin Linux Advanced Server V10 (Halberd) ] 不在 Oracle 官方支持列表，本脚本只负责安装，请确认是否继续安装 (Y/N): [Y] 

正在进行安装前检查，请稍等......                                                                                  

正在检测安装包 /soft/p18370031_112040_Linux-x86-64.zip 的 MD5 值是否正确，请稍等......                                                                                  
正在检测安装包 /soft/p13390677_112040_Linux-x86-64_3of7.zip 的 MD5 值是否正确，请稍等......                                                                                  
正在检测安装包 /soft/p13390677_112040_Linux-x86-64_1of7.zip 的 MD5 值是否正确，请稍等......                                                                                  
正在检测安装包 /soft/p13390677_112040_Linux-x86-64_2of7.zip 的 MD5 值是否正确，请稍等......                                                                                  

OracleShellInstall 开始安装，详细安装过程可查看日志： tail -2000f /soft/print_shell_install_20240623175344.log                                                                                  
正在获取操作系统信息......已完成 (耗时: 1 秒)
正在配置本地软件源......已完成 (耗时: 1 秒)
正在安装依赖包......已完成 (耗时: 29 秒)
配置 root 用户互信......已完成 (耗时: 1 秒)
正在检查并更新 RAC 主机时间......已完成 (耗时: 1 秒)
正在清理 Oracle 旧环境......已完成 (耗时: 1 秒)
正在禁用防火墙......已完成 (耗时: 1 秒)
正在禁用 selinux......已完成 (耗时: 0 秒)
正在配置 nsyctl......已完成 (耗时: 0 秒)
正在配置主机名和 /etc/hosts......已完成 (耗时: 0 秒)
正在创建用户和组......已完成 (耗时: 1 秒)
正在创建安装目录......已完成 (耗时: 1 秒)
正在配置透明大页 && NUMA && 磁盘 IO 调度器......已完成 (耗时: 1 秒)
正在配置操作系统参数 sysctl......已完成 (耗时: 1 秒)
正在配置 RemoveIPC......已完成 (耗时: 0 秒)
正在配置用户限制 limit......已完成 (耗时: 1 秒)
正在配置 shm 目录......已完成 (耗时: 1 秒)
正在配置用户环境变量......已完成 (耗时: 1 秒)
正在配置 RAC 其他节点信息......已完成 (耗时: 48 秒)
正在配置 RAC 所有节点互信......已完成 (耗时: 15 秒)
正在解压 Grid 安装包以及补丁......已完成 (耗时: 13 秒)
正在解压 Oracle 软件以及补丁......已完成 (耗时: 24 秒)
正在安装 Grid 软件以及补丁......已完成 (耗时: 1278 秒)
正在创建 ASM 磁盘组......已完成 (耗时: 18 秒)
正在安装 Oracle 软件以及补丁......已完成 (耗时: 489 秒)
正在创建数据库......已完成 (耗时: 436 秒)
正在优化数据库......已完成 (耗时: 15 秒)

恭喜！Oracle 一键安装执行完成 (耗时: 2387 秒)，现在是否重启主机：[Y/N] Y

正在重启节点 192.168.6.151 主机......                                                                                  

正在重启当前节点主机......  
```

# 连接测试
查看系统版本：
```bash
[root@kylinv10-01:/root]# cat /etc/os-release 
NAME="Kylin Linux Advanced Server"
VERSION="V10 (Halberd)"
ID="kylin"
VERSION_ID="V10"
PRETTY_NAME="Kylin Linux Advanced Server V10 (Halberd)"
ANSI_COLOR="0;31"
```
查看 Grid 版本以及补丁：
```bash
[grid@kylinv10-01:/home/grid]$ sqlplus -v

SQL*Plus: Release 11.2.0.4.0 Production

[grid@kylinv10-01:/home/grid]$ opatch lspatches
18370031;Grid Infrastructure Patch Set Update : 11.2.0.4.x (gibugno)
```
查看集群：
```bash
[grid@kylinv10-01:/home/grid]$ crsctl stat res -t
--------------------------------------------------------------------------------
NAME           TARGET  STATE        SERVER                   STATE_DETAILS       
--------------------------------------------------------------------------------
Local Resources
--------------------------------------------------------------------------------
ora.DATA.dg
               ONLINE  ONLINE       kylinv10-01                                  
               ONLINE  ONLINE       kylinv10-02                                  
ora.LISTENER.lsnr
               ONLINE  ONLINE       kylinv10-01                                  
               ONLINE  ONLINE       kylinv10-02                                  
ora.OCR.dg
               ONLINE  ONLINE       kylinv10-01                                  
               ONLINE  ONLINE       kylinv10-02                                  
ora.asm
               ONLINE  ONLINE       kylinv10-01              Started             
               ONLINE  ONLINE       kylinv10-02              Started             
ora.gsd
               OFFLINE OFFLINE      kylinv10-01                                  
               OFFLINE OFFLINE      kylinv10-02                                  
ora.net1.network
               ONLINE  ONLINE       kylinv10-01                                  
               ONLINE  ONLINE       kylinv10-02                                  
ora.ons
               ONLINE  ONLINE       kylinv10-01                                  
               ONLINE  ONLINE       kylinv10-02                                  
--------------------------------------------------------------------------------
Cluster Resources
--------------------------------------------------------------------------------
ora.LISTENER_SCAN1.lsnr
      1        ONLINE  ONLINE       kylinv10-01                                  
ora.cvu
      1        ONLINE  ONLINE       kylinv10-01                                  
ora.kylinv10-01.vip
      1        ONLINE  ONLINE       kylinv10-01                                  
ora.kylinv10-02.vip
      1        ONLINE  ONLINE       kylinv10-02                                  
ora.lucifer.db
      1        ONLINE  ONLINE       kylinv10-01              Open                
      2        ONLINE  ONLINE       kylinv10-02              Open                
ora.oc4j
      1        ONLINE  ONLINE       kylinv10-01                                  
ora.scan1.vip
      1        ONLINE  ONLINE       kylinv10-01  
```
查看 ASM 磁盘组：
```bash
[grid@kylinv10-01:/home/grid]$ asmcmd lsdg
State    Type    Rebal  Sector  Block       AU  Total_MB  Free_MB  Req_mir_free_MB  Usable_file_MB  Offline_disks  Voting_files  Name
MOUNTED  EXTERN  N         512   4096  1048576     20480    18621                0           18621              0             N  DATA/
MOUNTED  EXTERN  N         512   4096  1048576     10240     9844                0            9844              0             Y  OCR/
```
查看 Oracle 版本以及补丁：
```bash
[oracle@kylinv10-01:/home/oracle]$ sqlplus -v

SQL*Plus: Release 11.2.0.4.0 Production

[oracle@kylinv10-01:/home/oracle]$ opatch lspatches
此 Oracle 主目录中未安装任何中间补丁程序。
```
连接数据库：
```bash
[oracle@kylinv10-01:/home/oracle]$ sas

SQL*Plus: Release 11.2.0.4.0 Production on Mon Jun 24 13:37:19 2024

Copyright (c) 1982, 2013, Oracle.  All rights reserved.


Connected to:
Oracle Database 11g Enterprise Edition Release 11.2.0.4.0 - 64bit Production
With the Partitioning, Real Application Clusters, Automatic Storage Management, OLAP,
Data Mining and Real Application Testing options

sys@LUCIFER 2024-06-24 13:37:19> select instance_name,status from gv$instance;

INSTANCE_NAME    STATUS
---------------- ------------
lucifer1         OPEN
lucifer2         OPEN

sys@LUCIFER 2024-06-24 13:37:30> show parameter name

NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
cell_offloadgroup_name               string
db_file_name_convert                 string
db_name                              string      lucifer
db_unique_name                       string      lucifer
global_names                         boolean     FALSE
instance_name                        string      lucifer1
lock_name_space                      string
log_file_name_convert                string
processor_group_name                 string
service_names                        string      lucifer
```
数据库连接正常。