---
title: RHEL 7 安装 Oracle 12CR1 RAC 数据库
date: 2025-02-11 16:10:32
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1888784165194182656
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)


# 前言
最近，有一套 12CR1 RAC 需要安装，正好记录一下安装过程。

# 整体规划
Oracle RAC 2 节点需要安装 2 台主机系统，一般在安装之前都需要提前规划一下环境信息。

## 系统规划
安装 RAC 和单机不一样，需要提前规划好以下信息：
- **主机名：** 需要英文字母开头，建议小写，rac01/rac02  
- **集群名称：** 长度不超过 15 位，rac-cluster
- **Linux 系统版本：** RedHat 7.4
- **磁盘：** 本地磁盘 100G，用于安装 OS，存放 grid 和 oracle 安装软件，用于 oracle 和 grid 安装目录  
- **ASM 共享盘（磁盘空间有限）：**  
	- 裁决盘 OCR：OCR + VOTING=**10G**、冗余模式：**EXTERNAL** 
	- 数据盘 DATA：DATA=**20G**、冗余模式：**EXTERNAL**（数据文件，归档日志文件，spfile 文件等）
- **补丁更新：** 补丁都是建议在安装 Oracle 软件时进行安装，获取最新补丁进行修补 BUG，防止数据库出现意外故障。

## 网络规划
Oracle RAC 需要至少 2 张网卡，一个用于公网访问，一个用于主机间私网心跳（生产建议2个心跳，公网2张网卡做 bond）。

- Public IP（公司内部访问，非外网）
```bash
192.168.6.70   rac01  
192.168.6.71   rac02
```
- Private IP（用于节点间心跳网络）
```bash
100.100.100.1   rac01-priv  
100.100.100.2   rac02-priv
```
- Virtual IP（提供客户端访问，漂移）
```bash
192.168.6.72 	rac01-vip  
192.168.6.73 	rac02-vip
```
- SCAN IP（提供客户端访问，均衡）
```bash
192.168.6.75 	rac-scan
```
## 存储规划
Oracle RAC 使用 ASM 存储来存放数据，通常使用 OCR 和 DATA 两个磁盘组！
|磁盘名称|磁盘用途|磁盘大小|
|--|--|--|
|asm-ocr|OCR/Voting File|10G|
|asm-data|Data Files|20G|
|系统盘|安装系统和数据库软件|100G|

## 内存规划
主机内存建议每台设置 8G 物理内存和 8G SWAP：
|内存| SWAP |
|--|--|
| 8G | 8G |

## 环境信息
综合上述要求，本次教程的环境信息大致如下：

| 节点 | 主机版本 | 主机名 | 实例名 | Grid/Oracle版本 | Public IP | Private IP |  Virtual IP | Scan IP |内存|SWAP|
|-----|-----|------|-----|-----|------|------|------|------|------|------|
| 1 | rhel7.4 | rac01 | lucifer1 | 12.1.0.2 | 192.168.6.70 | 100.100.100.1 | 192.168.6.72 | 192.168.6.75 |8G|8G|
| 2 | rhel7.4 | rac02 | lucifer2 | 12.1.0.2 | 192.168.6.71 | 100.100.100.2 | 192.168.6.73 | 192.168.6.75 |8G|8G|

# 系统安装
Linux 系统安装好之后，建议大家做一个快照，因为我们后面实战需要用到很多 Linux 系统，避免每次都要安装系统！

>**<font color='orage'>📢 注意：</font>** 以下标题中（<font color='red'>**rac01&rac02**</font>）代表节点一和节点二都需要执行，（<font color='red'>**rac01**</font>）代表只需要节点一执行。

## 网络配置（rac01&rac02）
在安装 Linux 系统过程中我已经配置好了网络，如果没有配置的话，Linux 7 版本可以使用 `nmcli` 命令来配置网络，以下命令中的 **IP地址、子网掩码、网关** 和 **网卡名称** 请根据实际情况进行修改！

**rac01：**
```bash
##配置Public IP
nmcli connection modify ens192 ipv4.addresses 192.168.6.70/24 ipv4.gateway 192.168.6.254 ipv4.method manual autoconnect yes
##配置Private IP
nmcli connection modify ens224 ipv4.addresses 100.100.100.1/24 ipv4.method manual autoconnect yes
##生效
nmcli connection up ens192
nmcli connection up ens224
nmcli connection show
```
**rac02：**
```bash
##配置Public IP
nmcli connection modify ens192 ipv4.addresses 192.168.6.71/24 ipv4.gateway 192.168.6.254 ipv4.method manual autoconnect yes
##配置Private IP
nmcli connection modify ens224 ipv4.addresses 100.100.100.2/24 ipv4.method manual autoconnect yes
##生效
nmcli connection up ens192
nmcli connection up ens224
nmcli connection show
```
最后，配置好网络后，输入命令 `ip a` 查看网络是否配置成功，尝试 `ping` 测试网络。

## 配置本地软件源（rac01&rac02）
确保虚拟机已经挂载 ISO 镜像源，手动在 Linux 主机 mount：
```bash
mount /dev/sr0 /mnt
df -Th | grep /mnt
```
配置本地 YUM 源：
```bash
cat <<-EOF>/etc/yum.repos.d/local.repo
[local]
name=local
baseurl=file:///mnt
gpgcheck=0
enabled=1
EOF

yum repolist all
```
安装依赖包：
```bash
yum install -y binutils \
compat-libcap1 \
compat-libstdc++-33 \
gcc \
gcc-c++ \
glibc \
glibc-devel \
libaio \
libaio-devel \
ksh \
make \
libXi \
libXtst \
libgcc \
libstdc++ \
libstdc++-devel \
sysstat \
nfs-utils \
unzip \
openssh-clients \
readline \
readline-devel \
psmisc --skip-broken
```
手动上传并安装依赖包：
```bash
## 创建 /soft 文件夹
mkdir /soft
## 上传 compat-libstdc++-33-3.2.3-72.el7.x86_64.rpm 安装包
cd /soft
## 安装 compat-libstdc++-33-3.2.3-72.el7.x86_64.rpm
rpm -ivh compat-libstdc++-33-3.2.3-72.el7.x86_64.rpm
```
检查依赖包安装情况：
```bash
rpm -q binutils \
compat-libcap1 \
compat-libstdc++-33 \
gcc \
gcc-c++ \
glibc \
glibc-devel \
libaio \
libaio-devel \
ksh \
make \
libXi \
libXtst \
libgcc \
libstdc++ \
libstdc++-devel \
sysstat \
nfs-utils \
unzip \
openssh-clients \
readline \
readline-devel \
psmisc
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888853179316580352_395407.png)

**<font color='orage'>📢 注意：</font>** 确保以上依赖包一定要两个节点均全部安装成功，否则可能导致数据库安装失败！

## hosts文件配置（rac01&rac02）
如果安装系统过程中没有配置 hostname，可以执行以下命令配置：
```bash
hostnamectl set-hostname rac01
hostnamectl set-hostname rac02
```
配置 hosts 文件：
```bash
cat<<-\EOF>>/etc/hosts
# Public IP
192.168.6.70 	rac01
192.168.6.71 	rac02

# Private IP
100.100.100.1 rac01-priv
100.100.100.2 rac02-priv

# Vip IP
192.168.6.72 rac01-vip
192.168.6.73 rac02-vip

# Scan IP
192.168.6.75 rac-scan
EOF
```
## 防火墙配置（rac01&rac02）
```bash
systemctl stop firewalld.service
systemctl disable firewalld.service
systemctl status firewalld.service
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888855875071258624_395407.png)

## selinux 配置（rac01&rac02）
配置 selinux 临时生效： 
```bash
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
setenforce 0
getenforce
sestatus
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888855768389136384_395407.png)

**📢 注意：** selinux 配置需要重启生效！

## 用户及组、目录创建（rac01&rac02）
创建安装 Oracle 数据库所需的用户、组以及安装目录：
```bash
/usr/sbin/groupadd -g 54321 oinstall
/usr/sbin/groupadd -g 54322 dba
/usr/sbin/groupadd -g 54323 oper
/usr/sbin/groupadd -g 54324 backupdba
/usr/sbin/groupadd -g 54325 dgdba
/usr/sbin/groupadd -g 54326 kmdba
/usr/sbin/groupadd -g 54327 asmdba
/usr/sbin/groupadd -g 54328 asmoper
/usr/sbin/groupadd -g 54329 asmadmin
/usr/sbin/groupadd -g 54330 racdba
```
grid/oracle 用户创建：
```bash
## 创建 grid/oraprod 用户
/usr/sbin/useradd -u 11012 -g oinstall -G asmadmin,asmdba,asmoper,dba,racdba,oper grid
/usr/sbin/useradd -u 54321 -g oinstall -G asmadmin,asmdba,dba,backupdba,dgdba,kmdba,racdba,oper oraprod
## 修改用户密码为oracle
echo "oracle" |passwd oraprod --stdin
echo "oracle" |passwd grid --stdin
## 查看用户组
id grid
id oraprod
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888857386220269568_395407.png)

创建软件目录：
```bash
mkdir -p /u01/app/12.1.0/grid /u01/app/grid /u01/app/oracle/product/12.1.0/db /u01/app/oraInventory /backup /home/oraprod/scripts
chown -R oraprod:oinstall /backup /home/oraprod/scripts
chown -R grid:oinstall /u01
chown -R oraprod:oinstall /u01/app/oracle
chmod -R 775 /u01
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888858866998325248_395407.png)

## 挂载共享盘
部署 SSC 集群需要挂载共享盘，挂载共享盘的方式有很多，可以使用虚拟机创建共享盘的方式，也可以通过 iscsi 共享存储作为数据库存储文件系统，可自行选择。

本文使用 Starwind 配置 iscsi 共享盘，可以参考为之前写的文章：
>⭐️ **[实战篇：使用 StarWind 配置 ISCSI 共享存储](https://mp.weixin.qq.com/s/xjYZmGcwshbJBICcr0xvBw)**

**1、Linux 客户端安装 iscsi 软件**
```bash
## 以节点一为例
## 如果遇到报错 -bash: iscsiadm：未找到命令，就需要安装 iscsi 软件
[root@rac01 ~]# yum install -y iscsi-initiator-utils*
[root@rac01 ~]# systemctl start iscsid.service
[root@rac01 ~]# systemctl enable iscsid.service
```
**2、搜索服务端 iscsi target**
```bash
## 以节点一为例
## 192.168.6.43 为 iscsi 服务端 IP 地址
[root@rac01 ~]# iscsiadm -m discovery -t st -p 192.168.6.43
192.168.6.43:3260,-1 iqn.2008-08.com.starwindsoftware:lpc-matebook-12cr1
```
**3、连接服务端 iscsi 共享存储**
```bash
## 以节点一为例
## iqn.2008-08.com.starwindsoftware:lpc-matebook-12cr1 为上一步搜索出的 target 名称
[root@rac01 ~]# iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:lpc-matebook-12cr1 -p 192.168.6.43 -l
Logging in to [iface: default, target: iqn.2008-08.com.starwindsoftware:lpc-matebook-12cr1, portal: 192.168.6.43,3260] (multiple)
Login to [iface: default, target: iqn.2008-08.com.starwindsoftware:lpc-matebook-12cr1, portal: 192.168.6.43,3260] successful.
```
**4、配置开机自动挂载**
```bash
## 以节点一为例
[root@rac01 ~]# iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:lpc-matebook-12cr1 -p 192.168.6.43 --op update -n node.startup -v automatic
```
**5、查看挂载成功的共享盘**
```bash
## 以节点一为例，sdb、sdc 为挂载的共享盘
[root@rac01 ~]# lsblk 
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda             8:0    0  100G  0 disk 
├─sda1          8:1    0    1G  0 part /boot
└─sda2          8:2    0   99G  0 part 
  ├─rhel-root 253:0    0   91G  0 lvm  /
  └─rhel-swap 253:1    0    8G  0 lvm  [SWAP]
sdb             8:16   0   10G  0 disk 
sdc             8:32   0   20G  0 disk 
sr0            11:0    1  3.8G  0 rom  /mnt
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888840792068861952_395407.png)

确保两个节点都连接共享存储之后，安装 `multipath` 绑定多路径：
```bash
## 如未安装需要安装 multipath
yum install -y device-mapper*
mpathconf --enable --with_multipathd y
## 查看共享盘的 scsi_id
/usr/lib/udev/scsi_id -g -u /dev/sdb
/usr/lib/udev/scsi_id -g -u /dev/sdc
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888840668131373056_395407.png)

配置 multipath 文件：
```bash
cat <<EOF>/etc/multipath.conf
defaults {
    user_friendly_names yes
}
 
blacklist {
  devnode "^sda"
}

multipaths {
  multipath {
  wwid "200be82b65378c737"
  alias asm_ocr
  }
  multipath {
  wwid "259f2dfe91387593a"
  alias asm_data
  }
}
EOF
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888841011946860544_395407.png)

**📢 注意：** wwid 的值为上面获取的 scsi_id，alias 别名可自定义，这里配置 1 块 OCR 盘，1 块 DATA 盘！

激活 multipath 多路径：
```bash
multipath -F
multipath -v2
multipath -ll
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888841108369715200_395407.png)

配置 UDEV 绑盘：
```bash
rm -rf /dev/mapper/udev_info
rm -rf /etc/udev/rules.d/99-oracle-asmdevices.rules
cd /dev/mapper
for i in asm_*; do
	printf "%s %s\n" "$i" "$(udevadm info --query=all --name=/dev/mapper/"$i" | grep -i dm_uuid)" >>/dev/mapper/udev_info
done
while read -r line; do
	dm_uuid=$(echo "$line" | awk -F'=' '{print $2}')
	disk_name=$(echo "$line" | awk '{print $1}')
	echo "KERNEL==\"dm-*\",ENV{DM_UUID}==\"${dm_uuid}\",SYMLINK+=\"${disk_name}\",OWNER=\"grid\",GROUP=\"asmadmin\",MODE=\"0660\"" >>/etc/udev/rules.d/99-oracle-asmdevices.rules
done </dev/mapper/udev_info
```
查看配置好的规则：
```bash
cat /etc/udev/rules.d/99-oracle-asmdevices.rules
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888841409248112640_395407.png)

重载 udev 规则，检查共享存储多路径绑盘是否成功：
```bash
udevadm control --reload-rules
udevadm trigger --type=devices
ll /dev/asm_*
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888841602861379584_395407.png)

## 时间同步配置（rac01&rac02）
禁用 chronyd：
```bash
## 没有安装 chrony 最好安装一下，防止以后被安装生效
yum install -y chrony
timedatectl set-timezone Asia/Shanghai
systemctl stop chronyd.service
systemctl disable chronyd.service
```
配置 ntpdate 时间同步计划任务：
```bash
## 未安装需要手动安装 ntpdate
yum install -y ntpdate
## 192.168.6.188 为时间服务器 IP，每天 12 点同步系统时间
cat <<EOF>>/var/spool/cron/root
00 12 * * * /usr/sbin/ntpdate -u 192.168.6.188 && /usr/sbin/hwclock -w
EOF
## 查看计划任务
crontab -l
## 手动执行
/usr/sbin/ntpdate -u 192.168.6.188 && /usr/sbin/hwclock -w
```

## 关闭透明大页和 NUMA（rac01&rac02）
RHEL 7 配置内核文件，关闭透明大页和 numa：
```bash
sed -i 's/quiet/quiet transparent_hugepage=never numa=off/' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888859466918014976_395407.png)

**📢 注意：** 关闭 `透明大页` 和 `numa` 的配置，需要重启主机生效！

## avahi-daemon 配置（rac01&rac02）
有些主机安装选择最小化安装，没有安装 avahi-daemon 功能，建议安装之后禁用，防止以后误操作导致出问题：
```bash
yum install -y avahi*
systemctl stop avahi-daemon.socket
systemctl stop avahi-daemon.service
pgrep -f avahi-daemon | awk '{print "kill -9 "$2}'
systemctl disable avahi-daemon.socket
systemctl disable avahi-daemon.service
```
配置 NOZEROCONF：
```bash
cat <<EOF>>/etc/sysconfig/network
NOZEROCONF=yes
EOF
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888860384149385216_395407.png)

## 系统参数配置（rac01&rac02）
安装 Oracle 数据库需要配置系统参数，以下使用脚本命令一键式配置：
```bash
## 网卡名称需根据实际情况需改
PublicFName=ens192
PrivateFName=ens224
memTotal=$(grep MemTotal /proc/meminfo | awk '{print $2}')
totalMemory=$((memTotal / 2048))
shmall=$((memTotal / 4))
if [ $shmall -lt 2097152 ]; then
	shmall=2097152
fi
shmmax=$((memTotal * 1024 - 1))
if [ "$shmmax" -lt 4294967295 ]; then
	shmmax=4294967295
fi
cat <<EOF>>/etc/sysctl.conf
fs.aio-max-nr = 1048576
fs.file-max = 6815744
kernel.shmall = $shmall
kernel.shmmax = $shmmax
kernel.shmmni = 4096
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 1048576
net.ipv4.conf.$PublicFName.rp_filter = 1
net.ipv4.conf.$PrivateFName.rp_filter = 2
EOF
```
生效系统参数：
```bash
sysctl -p
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888860608905359360_395407.png)

## 系统资源限制配置（rac01&rac02）
配置 limits.conf：
```bash
cat <<EOF>>/etc/security/limits.conf
oraprod soft nofile 1024
oraprod hard nofile 65536
oraprod soft stack 10240
oraprod hard stack 32768
oraprod soft nproc 16384
oraprod hard nproc 16384
oraprod hard memlock unlimited
oraprod soft memlock unlimited

grid soft nofile 1024
grid hard nofile 65536
grid soft stack 10240
grid hard stack 32768
grid soft nproc 16384
grid hard nproc 16384
EOF
```
配置pam.d/login：
```bash
cat <<EOF>>/etc/pam.d/login
session required pam_limits.so 
session required /lib64/security/pam_limits.so
EOF
```

## 配置 /dev/shm
如果 shm 不配置可能会造成后面安装过程出现警告，使用上出现报错等等。
```bash
cat <<EOF >> /etc/fstab
tmpfs /dev/shm tmpfs defaults,size=8G 0 0
EOF
mount -o remount /dev/shm
```

## 环境变量配置（rac01&rac02）
grid 用户环境变量：
```bash
cat <<EOF>>/home/grid/.bash_profile
################OracleBegin#########################
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/grid
export ORACLE_HOME=/u01/app/12.1.0/grid
export ORACLE_TERM=xterm
export TNS_ADMIN=\$ORACLE_HOME/network/admin
export LD_LIBRARY_PATH=\$ORACLE_HOME/lib:/lib:/usr/lib
export ORACLE_SID=+ASM1
export PATH=/usr/sbin:\$PATH
export PATH=\$ORACLE_HOME/bin:\$ORACLE_HOME/OPatch:\$PATH
alias sas='sqlplus / as sysasm'
export PS1="[\`whoami\`@\`hostname\`:"'\w]\$ '
EOF
```
**📢 注意：** 每个节点的 ORACLE_SID 不一样（+ASM1/+ASM2），需要自行修改！

oraprod 用户环境变量：
```bash
cat <<EOF>>/home/oraprod/.bash_profile
################OracleBegin#########################
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=\$ORACLE_BASE/product/12.1.0/db
export ORACLE_HOSTNAME=rac01
export ORACLE_TERM=xterm
export TNS_ADMIN=\$ORACLE_HOME/network/admin
export LD_LIBRARY_PATH=\$ORACLE_HOME/lib:/lib:/usr/lib
export ORACLE_SID=lucifer1
export PATH=/usr/sbin:\$PATH
export PATH=\$ORACLE_HOME/bin:\$ORACLE_HOME/OPatch:\$PATH
alias sas='sqlplus / as sysdba'
export PS1="[\`whoami\`@\`hostname\`:"'\w]\$ '
################OracleEnd#########################
EOF
```
**📢 注意：** 每个节点的 ORACLE_HOSTNAME（rac01/rac02）和 ORACLE_SID（lucifer1/lucifer2）不一样，需要自行修改！

## 安装介质上传解压（rac01）
安装包可以使用 	xftp 工具进行上传，只需要上传至一节点 /soft 目录下：
```bash
## 上传安装介质到/soft目录
-rw-------. 1 root root 1673544724 Feb 10 15:22 12102_database_linuxx86_64_1of2.zip
-rw-------. 1 root root 1014530602 Feb 10 15:21 12102_database_linuxx86_64_2of2.zip
-rw-------. 1 root root 1747043545 Feb 10 15:21 12102_grid_linuxx86_64_1of2.zip
-rw-------. 1 root root  646972897 Feb 10 15:21 12102_grid_linuxx86_64_2of2.zip
```
**静默解压 grid 安装包：**
```bash
## root 用户下执行
unzip -q 12102_grid_linuxx86_64_1of2.zip
unzip -q 12102_grid_linuxx86_64_2of2.zip
chown -R grid:oinstall /soft
```
**静默解压 oracle 安装包：**
```bash
## root 用户下执行
unzip -q 12102_database_linuxx86_64_1of2.zip
unzip -q 12102_database_linuxx86_64_2of2.zip
```
**root 用户安装 cvuqdisk 包（rac01&rac02）：**
```bash
cd /soft/grid/rpm/
rpm -ivh cvuqdisk-1.0.9-1.rpm
## 传输到节点二安装
scp cvuqdisk-1.0.9-1.rpm 192.168.6.71:/soft
rpm -ivh cvuqdisk-1.0.9-1.rpm
```
至此，Linux 操作系统的配置就完成了，重启两台主机确保配置没有！重启成功后检查一下 Selinux，透明大页和 numa：
```bash
cat /etc/selinux/config
cat /sys/kernel/mm/transparent_hugepage/enabled
cat /proc/cmdline
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888866453881892864_395407.png)

至此，一切准备工作都已经做完了，接下来可以正式开始安装 Oracle RAC 数据库！

# 安装 Grid 软件（rac01）
## 安装 GRID 软件
```bash
[grid@rac01:~]$ cd /soft/grid
[grid@rac01:/soft/grid]$ ./runInstaller 
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888868377339375616_395407.png)

直接跳出安装界面，选择集群安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888868553454006272_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888868637348474880_395407.png)

选择自定义安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888868869159268352_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888869009328713728_395407.png)

修改 scan 名称，与 hosts 文件配置 scan 名称保持一致，输入 grid 用户密码，创建用户时两节点必须保持一致。先执行 setup，再执行 test，开始互信：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888869598909444096_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888869811384496128_395407.png)

确保对应网卡和IP网段对应即可，12CR1 心跳网段需要选 Private：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888870958027517952_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888870722991304704_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888870305976823808_395407.png)

安装时填创建 OCR 盘，一块盘冗余 External，目录选择udev绑的路径：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888871219408154624_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888871164295000064_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888871760766971904_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888871822683287552_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888871883169345536_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888871949502263296_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888872280080527360_395407.png)

这里不选择自动执行 root.sh 脚本，因此容易失败，所以选择手动执行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888872337731235840_395407.png)

安装预检查，关于 DNS 和 NTP 相关的都可以忽略，继续下一步：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888878283358482432_395407.png)

开始安装 grid：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888878346952519680_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888883529078026240_395407.png)

root 用户下，两个节点顺序执行 root.sh，先节点一执行完，再节点二执行，两个节点的 root.sh 都执行完之后，继续安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250210-1888884633056587776_395407.png)

这个错误是由于在 /etc/hosts 中配置了 scan ip，而不是使用 DNS 配置解析，可以忽略该错误，完成安装！
>MOS 文档：PRVF-4664 PRVF-4657: Found inconsistent name resolution entries for SCAN name (Doc ID 887471.1)	

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889121759367016448_395407.png)

安装完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889121948702093312_395407.png)

## 检查集群状态和补丁
检查集群状态：
```bash
su - grid
crsctl stat res -t
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889122163098136576_395407.png)

检查 grid 补丁情况：
```bash
opatch lspatches
sqlplus -version
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889122362273050624_395407.png)

检查 asm 磁盘组：
```bash
asmcmd lsdg
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889122425317634048_395407.png)

# 创建 ASM 数据盘
这里创建的 DATA 磁盘组主要用于存放数据文件、归档日志文件等数据库文件！

使用图形化方式添加 ASM DATA 数据盘：
```bash
asmca
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889122650300100608_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889122781921554432_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889122839932973056_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889122938801106944_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889122993230589952_395407.png)

再次检查 asm 磁盘：
```bash
asmcmd lsdg
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889123090668466176_395407.png)

**📢 注意：** 建议重启两台主机，重启后再次检查集群状态，监听状态，ASM 磁盘组情况，确保没有问题再继续安装！

# 安装 Oracle 软件
开始安装，12CR1 安装 Oracle 软件还不支持提前安装 PSU，所以先安装 Oracle 软件再打补丁：
```bash
chown -R oraprod:oinstall /soft
cd /soft/database
./runInstaller
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889124342982782976_395407.png)

进入安装界面，不接收安全更新：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889124422657781760_395407.png)

选择仅安装 Oracle 软件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889124489779228672_395407.png)

选择集群模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889124635808116736_395407.png)

输入 oraprod 用户密码，先执行 setup，再执行 test，开始互信：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889124769321201664_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889124900804243456_395407.png)

选择企业版：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889125022690717696_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889125091863179264_395407.png)

默认即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889125165213167616_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889125262051258368_395407.png)

安装预检查，由于我们只配了一个 SCAN，所以关于 DNS 相关的都无视，继续：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889128025917239296_395407.png)

开始安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889128104300392448_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889128174471098368_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889138379552468992_395407.png)

root 用户下，两个节点都要执行 root.sh：
```bash
/u01/app/oracle/product/12.2.0/db/root.sh
```

安装完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889138568187097088_395407.png)

**至此，Oracle 软件已全部安装成功！**

# 创建数据库
打开 oracle 用户下的 vnc 界面，执行 `dbca` 创建数据库实例：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889195975495921664_395407.png)

选择自定义模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889196054483054592_395407.png)

默认选择一版用途安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197061250232320_395407.png)

填写数据库名称 lucifer，由于默认添加为 1，2，实例名规划为 lucifer1/2；选择安装 CDB 模式，不创建 PDB：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197170704789504_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197256658661376_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197333838049280_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197441975595008_395407.png)

默认即可，使用 OMF 模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197531595288576_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197607839346688_395407.png)

配置内存，使用 ASMM 模式，数据库总内存占用物理内存 70%-90% 之间：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197757936709632_395407.png)

一般用途模式安装，block_size 是无法修改的，process 进程数修改为1500，根据实际情况修改：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197838538649600_395407.png)

配置数据库字符集：默认 AL32UTF8，国家字符集：默认 AL16UTF16；根据实际业务情况修改成对应字符集：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889197917420924928_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889198121951965184_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889198184161882112_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889199576108773376_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889199631897210880_395407.png)

开始安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889199737912438784_395407.png)

经过漫长的等待，数据库建完了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889202407205253120_395407.png)

**至此，数据库实例创建完成！**

# 数据库优化配置（rac01）
## 配置归档删除定期任务
如果数据库开启了归档模式，那么就需要配置归档删除的定期任务，否则归档日志越来越多回导致磁盘空间被用尽。
```bash
## 进入 oraprod 用户，创建脚本
cat<<-DELARCH>/home/oraprod/scripts/del_arch.sh
#!/bin/bash
source ~/.bash_profile
deltime=\$(date +"20%y%m%d%H%M%S")
rman target / nocatalog msglog /home/oraprod/scripts/del_arch_\$deltime.log <<-EOF
crosscheck archivelog all;
delete noprompt archivelog until time 'sysdate-7';
delete noprompt force archivelog until time 'SYSDATE-10';
EOF
DELARCH
chmod +x /home/oraprod/scripts/del_arch.sh
```
切换到 root 用户写入计划任务：
```bash
echo "12 00 * * * /home/oraprod/scripts/del_arch.sh" >>/var/spool/cron/oraprod
## 手动执行测试
su - oraprod
/home/oraprod/scripts/del_arch.sh
```

## 配置低版本客户端连接
12CR1 版本之后由于低版本客户端连接可能会报错，因此需要配置 sqlnet 来支持低版本客户端连接：
```bash
su - oraprod
cat<<- EOF>>$TNS_ADMIN/sqlnet.ora
SQLNET.ALLOWED_LOGON_VERSION_CLIENT=8
SQLNET.ALLOWED_LOGON_VERSION_SERVER=8
EOF
```
## 配置数据库开机自启
配置数据库实例随集群服务自启动：
```bash
## root用户下执行
/u01/app/12.1.0/grid/bin/crsctl modify resource "ora.lucifer.db" -attr "AUTO_START=always" -unsupported
```
**注意：** `ora.lucifer.db`中的 lucifer 是指 db 名称；需要在 root 用户下执行！

**所有都配置完成之后，关闭数据库，重启主机，重启后检查集群状态和数据库运行状态！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20250211-1889203943801106432_395407.png)


---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)
