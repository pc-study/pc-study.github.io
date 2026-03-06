---
title: 实战篇：一步步教你 Linux 7 安装 Oracle 11GR2 RAC
date: 2021-11-02 10:10:03
tags: [oracle rac,墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/153861
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
**<font color='orage'>Oracle RAC是什么?</font>**
- Oracle Real Application Clusters (RAC) 允许客户跨多台服务器运行单个 Oracle 数据库，以最大限度地提高可用性并实现水平可扩展性，同时访问共享存储。
- 连接到 Oracle RAC 实例的用户会话可以在中断期间进行故障转移并安全地重放更改，而无需对最终用户应用程序进行任何更改，从而对最终用户隐藏了中断的影响。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc236aec3a2747a0b24f5fce977658da~tplv-k3u1fbpfcp-zoom-1.image)
- Oracle RAC 运行于集群之上，为 Oracle 数据库提供了最高级别的可用性、可伸缩性和低成本计算能力。
- 如果集群内的一个节点发生故障，Oracle 将可以继续在其余的节点上运行。
- Oracle 的主要创新是一项称为高速缓存合并的技术。
- 高速缓存合并使得集群中的节点可以通过高速集群互联高效地同步其内存高速缓存，从而最大限度地低降低磁盘 I/O。
- 高速缓存最重要的优势在于它能够使集群中所有节点的磁盘共享对所有数据的访问,数据无需在节点间进行分区。

**<font color='orage'>特点：</font>**
- 多台互连计算机组成，使用共享存储。
- 用户无感知，对于最终用户和应用程序而言，它们似乎是一台服务器。
- 高可用，只要有一个节点存活，就能正常对外提供服务，避免单点故障。
- 高性能，多节点负载均衡。
- 易伸缩，可以容易地添加、删除节点，以满足系统自身的调整。

**<font color='blue'>那么，如何部署一套RAC数据库环境呢？</font>**

**大致步骤如下：**
- 安装两台redhat7.3版本Linux系统（物理内存至少2G）
- 网络配置（双网卡，准备IP：Public IP，Virtual IP，Private IP，Scan IP）
- 存储配置（6块5G共享盘做ASM盘，根目录留50G用于安装grid和oracle）
- 预安装准备（系统参数/etc/sysctl.conf修改，防火墙selinux关闭，ntpd时钟定时同步，yum源配置安装
用户组及用户、目录新建，环境变量配置，用户资源限制/etc/security/limits.conf配置，/etc/pam.d/login修改pam_limits.so等等）
- 安装Grid软件
- 安装Oracle软件并建库
- 修改数据库内存配置，密码不过期，开启归档，布置归档定时删除脚本，布置rman备份机制)

​​![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2fe5f968a51459f8a7d9715caa3c8f6~tplv-k3u1fbpfcp-zoom-1.image)
⭐️ 如果想要使用脚本安装，可以使用博主编写的 Oracle 一键安装脚本，同时支持单机和 RAC 集群模式！
>**[Oracle 数据库一键安装脚本](https://www.modb.pro/course/148)**

**<font color='red'>更多更详细的脚本使用方式可以订阅专栏：</font>[Oracle 一键安装脚本实操合集，持续更新中！！！](https://www.modb.pro/db/1773583263184031744)。**
# 一、安装前配置
本文主机配置为 `Redhat 7.3 x86_64`，`内存2G`，`硬盘100G` ，`双网卡` ，`iscsi共享存储盘5G*6`！

| 节点 | 主机版本 | 主机名 | 实例名 | Oracle版本 | Public IP | Private IP |  Virtual IP | Scan IP |
|-----|-----|------|-----|-----|------|------|------|------|
| 节点一 | redhat 7.3 | rac01 | orcl1 | 11.2.0.4 | 192.168.56.10 | 172.0.0.1 | 192.168.56.20 | 192.168.56.110 |
| 节点二 | redhat 7.3 | rac02 | orcl2 | 11.2.0.4 | 192.168.56.11 | 172.0.0.2 | 192.168.56.21 | 192.168.56.110 |

**注意：** 以下标题中（rac01&rac02）代表节点一和节点二都需要执行，（rac01）代表只需要节点一执行。
## 1、Linux主机安装（rac01&rac02）
安装 Linux 服务器可选择：Centos，Redhat，Oracle Linux。

**📢 注意：** 上述 **Linux 安装包** 和 **Oracle 安装包** 可点击链接跳转获取：

>**`Linux 安装包`：** [https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw](https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw)    
**`Oracle 安装包`：** [https://mp.weixin.qq.com/s/ECJelOb6NUjZjpUvUa17pg](https://mp.weixin.qq.com/s/ECJelOb6NUjZjpUvUa17pg)

**📢 注意：** Linux 系统的安装本文不做详细演示！
## 2、配置yum源并安装依赖包（rac01&rac02）
Linux远程连接工具：

- 本文将使用 XShell 和 Xftp 工具，安装包可以在官网下载。
- 其他工具也可以，比如：putty，SecureCRT 等等工具。

Parallels Desktop挂载Linux主机镜像：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/36a9071219684c7eb112aed558b844b4~tplv-k3u1fbpfcp-zoom-1.image)

VMware Workstation挂载Linux镜像：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f8df19fb4714fb48e2f0c7b467cf7fd~tplv-k3u1fbpfcp-zoom-1.image)

**注意：** 需要提前挂载系统镜像，可参考：[Linux 配置本地 yum 源（6/7/8）](https://luciferliu.blog.csdn.net/article/details/120196606)！

挂载镜像源：
```bash
mount /dev/cdrom /mnt
##配置yum源
cat <<EOF>>/etc/yum.repos.d/local.repo
[local]
name=local
baseurl=file:///mnt
gpgcheck=0
enabled=1
EOF
```
安装依赖包：
```bash
yum groupinstall -y "Server with GUI"
yum install -y bc \
binutils \
compat-libcap1 \
compat-libstdc++-33 \
gcc \
gcc-c++ \
elfutils-libelf \
elfutils-libelf-devel \
glibc \
glibc-devel \
ksh \
libaio \
libaio-devel \
libgcc \
libstdc++ \
libstdc++-devel \
libxcb \
libX11 \
libXau \
libXi \
libXtst \
libXrender \
libXrender-devel \
make \
net-tools \
nfs-utils \
smartmontools \
sysstat \
e2fsprogs \
e2fsprogs-libs \
fontconfig-devel \
expect \
unzip \
openssh-clients \
readline* \
tigervnc* \
psmisc --skip-broken
```
手动上传并安装依赖包：
```bash
rpm -ivh compat-libstdc++-33-3.2.3-72.el7.x86_64.rpm
rpm -e ksh-20120801-142.el7.x86_64
rpm -ivh pdksh-5.2.14-37.el5.x86_64.rpm
```
检查依赖包安装情况：
```bash
rpm -q bc binutils compat-libcap1 compat-libstdc++-33 gcc gcc-c++ elfutils-libelf elfutils-libelf-devel glibc glibc-devel ksh libaio libaio-devel libgcc libstdc++ libstdc++-devel libxcb libX11 libXau libXi libXtst libXrender libXrender-devel make net-tools nfs-utils smartmontools sysstat e2fsprogs e2fsprogs-libs fontconfig-devel expect unzip openssh-clients readline | grep "not installed"
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1d8f062be82444229622a82046fd80ab~tplv-k3u1fbpfcp-zoom-1.image)
确保依赖包均已成功安装！
## 3、网络配置
Linux 7 版本可以使用 `nmcli` 命令来配置网络，以下命令中的 **IP地址、子网掩码、网关** 和 **网卡名称** 请根据实际情况进行修改！

**rac01：**
```bash
##配置Public IP
nmcli connection modify eth0 ipv4.addresses 192.168.56.10/24 ipv4.gateway 192.168.56.1 ipv4.method manual autoconnect yes
##配置Private IP
nmcli connection modify eth1 ipv4.addresses 172.0.0.1/24 ipv4.method manual autoconnect yes
##生效
nmcli connection up eth0
nmcli connection up eth1
```
**rac02：**
```bash
##配置Public IP
nmcli connection modify eth0 ipv4.addresses 192.168.56.11/24 ipv4.gateway 192.168.56.1 ipv4.method manual autoconnect yes
##配置Private IP
nmcli connection modify eth1 ipv4.addresses 172.0.0.2/24 ipv4.method manual autoconnect yes
##生效
nmcli connection up eth0
nmcli connection up eth1
```
最后，配置好网络后，输入命令 `ip a` 查看网络是否配置成功，尝试 `ping` 测试网络。
## 4、存储配置（rac01&rac02）
**<font color='orage'>Windows 下配置 ISCSI 共享存储可参考：</font>**
>**[一步步教你Windows配置ISCSI共享存储](https://luciferliu.blog.csdn.net/article/details/118087577)**

配置好共享存储后，在 Linux 主机连接共享存储：
```bash
##iscsi识别共享存储
yum install -y iscsi-initiator-utils*
##输出targetname，10.211.55.18为iscsi共享存储设备IP地址
iscsiadm -m discovery -t st -p 10.211.55.18
##连接共享存储
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:10.211.55.18-lucifer -p 10.211.55.18 -l
lsblk
```
安装 `multipath` 绑定多路径：
```bash
yum install -y device-mapper*
mpathconf --enable --with_multipathd y
##查看共享盘的scsi_id
/usr/lib/udev/scsi_id -g -u /dev/sdb
/usr/lib/udev/scsi_id -g -u /dev/sdc
/usr/lib/udev/scsi_id -g -u /dev/sdd
/usr/lib/udev/scsi_id -g -u /dev/sde
/usr/lib/udev/scsi_id -g -u /dev/sdf
/usr/lib/udev/scsi_id -g -u /dev/sdg
```
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
  wwid "27e2b3ddbd14752bb"
  alias ocr_1
  }
  multipath {
  wwid "27e2b3ddb87ff88ee"
  alias ocr_2
  }
  multipath {
  wwid "27e2b3ddb39fd2463"
  alias ocr_3
  }
  multipath {
  wwid "2852b96c1283206bf6"
  alias data_1
  }
  multipath {
  wwid "2852b96c12e8449cb9"
  alias data_2
  }
  multipath {
  wwid "2852b96c12fc938e95"
  alias data_3
  }
}
EOF
```
**📢 注意：** wwid的值为上面获取的scsi_id，alias可自定义，这里配置3块OCR盘，3块DATA盘！

激活multipath多路径：
```bash
multipath -F
multipath -v2
multipath -ll
```
配置UDEV绑盘：
```bash
for i in ocr_* data_*; do
	printf "%s %s\n" "$i" "$(udevadm info --query=all --name=/dev/mapper/"$i" | grep -i dm_uuid)" >>/dev/mapper/udev_info
done
while read -r line; do
	dm_uuid=$(echo "$line" | awk -F'=' '{print $2}')
	disk_name=$(echo "$line" | awk '{print $1}')
	echo "KERNEL==\"dm-*\",ENV{DM_UUID}==\"${dm_uuid}\",SYMLINK+=\"asm_${disk_name}\",OWNER=\"grid\",GROUP=\"asmadmin\",MODE=\"0660\"" >>/etc/udev/rules.d/99-oracle-asmdevices.rules
done </dev/mapper/udev_info
##重载udev
udevadm control --reload-rules
udevadm trigger --type=devices
```
确认配置完成后，分别在两个节点输入命令 `ls /dev/asm*` 查看是否已经成功绑定！
## 5、hosts 文件配置（rac01&rac02）
```bash
cat <<EOF>>/etc/hosts
#Public IP
192.168.56.10 rac01
192.168.56.11 rac02

#Private IP
172.0.0.1 rac01-priv
172.0.0.2 rac02-priv

#Vip IP
192.168.56.20 rac01-vip
192.168.56.21 rac02-vip

#Scan IP
192.168.56.110 rac-scan
EOF
```
## 6、防火墙配置（rac01&rac02）
```bash
systemctl stop firewalld.service
systemctl disable firewalld.service
systemctl status firewalld.service
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75554f5201274d2fa5c3ecc964f95014~tplv-k3u1fbpfcp-zoom-1.image)
## 7、selinux 配置（rac01&rac02）
配置 selinux 临时生效： 
```bash
##重启后生效
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
setenforce 0
##重启后检查
getenforce
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/456ed0cd9d764137927e0c304026e573~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** selinux 配置需要重启生效！
## 8、时间同步配置（rac01&rac02）
首先需要禁用 chronyd 和 ntpd 服务：
```bash
##禁用chronyd
yum install -y chrony
timedatectl set-timezone Asia/Shanghai
systemctl stop chronyd.service
systemctl disable chronyd.service
##禁用ntpd
yum install -y ntpdate
```
配置计划任务，定时刷新系统时间：
```bash
##10.211.55.200为时间服务器IP，每天12点同步系统时间
cat <<EOF>>/var/spool/cron/root
00 12 * * * /usr/sbin/ntpdate -u 10.211.55.200 && /usr/sbin/hwclock -w
EOF
##查看计划任务
crontab -l
##手动执行
/usr/sbin/ntpdate -u 10.211.55.200 && /usr/sbin/hwclock -w
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/62b1cc4b78004aa588efb9861e8a094c~tplv-k3u1fbpfcp-zoom-1.image)
## 9、关闭透明大页和 NUMA（rac01&rac02）
Linux 7 配置内核文件，关闭透明大页和numa：
```bash
sed -i 's/quiet/quiet transparent_hugepage=never numa=off/' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
##重启后检查是否生效
cat /sys/kernel/mm/transparent_hugepage/enabled
cat /proc/cmdline
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ed97a19e7b4421885653debad9d4489~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** 关闭 `透明大页` 和 `numa` 的配置，需要重启主机生效！
## 10、avahi-daemon 配置（rac01&rac02）
有些主机安装选择最小化安装，没有安装 avahi-daemon 功能，建议安装之后禁用，防止以后误操作导致出问题：
```bash
yum install -y avahi*
systemctl stop avahi-daemon.socket
systemctl stop avahi-daemon.service
pgrep -f avahi-daemon | awk '{print "kill -9 "$2}'
```
配置 NOZEROCONF：
```bash
cat <<EOF>>/etc/sysconfig/network
NOZEROCONF=yes
EOF
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9dad547303ac42b897531a8d0e513403~tplv-k3u1fbpfcp-zoom-1.image)
## 11、系统参数配置（rac01&rac02）
安装 Oracle 数据库需要配置系统参数，以下使用脚本命令一键式配置：
```bash
##配置参数文件
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
net.ipv4.conf.eth0.rp_filter = 1
net.ipv4.conf.eth1.rp_filter = 2
EOF
##生效
sysctl -p
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/456c9df8275149a393480e961b598f59~tplv-k3u1fbpfcp-zoom-1.image)
## 12、系统资源限制配置（rac01&rac02）
```bash
##配置limits.conf
cat <<EOF>>/etc/security/limits.conf
oracle soft nofile 1024
oracle hard nofile 65536
oracle soft stack 10240
oracle hard stack 32768
oracle soft nproc 2047
oracle hard nproc 16384
oracle hard memlock 134217728
oracle soft memlock 134217728

grid soft nofile 1024
grid hard nofile 65536
grid soft stack 10240
grid hard stack 32768
grid soft nproc 2047
grid hard nproc 16384
EOF
##配置pam.d/login
cat <<EOF>>/etc/pam.d/login
session required pam_limits.so 
session required /lib64/security/pam_limits.so
EOF
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5589da93dde84743844e575a8bffc31e~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d10102d7cc8b4505b7a808fa09e7855b~tplv-k3u1fbpfcp-zoom-1.image)
## 13、用户及组、目录创建（rac01&rac02）
创建安装 Oracle 数据库所需的用户、组以及安装目录：
```bash
##组创建
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
##用户创建
/usr/sbin/useradd -u 11012 -g oinstall -G asmadmin,asmdba,asmoper,dba,racdba,oper grid
/usr/sbin/useradd -u 54321 -g oinstall -G asmdba,dba,backupdba,dgdba,kmdba,racdba,oper oracle
##修改用户密码为oracle
echo "oracle" |passwd oracle --stdin
echo "oracle" |passwd grid --stdin
##创建软件目录
mkdir -p /u01/app/11.2.0/grid
mkdir -p /u01/app/grid
mkdir -p /u01/app/oracle/product/11.2.0/db
mkdir -p /u01/app/oraInventory
mkdir -p /backup
mkdir -p /home/oracle/scripts
chown -R oracle:oinstall /backup
chown -R oracle:oinstall /home/oracle/scripts
chown -R grid:oinstall /u01
chown -R grid:oinstall /u01/app/grid
chown -R grid:oinstall /u01/app/11.2.0/grid
chown -R grid:oinstall /u01/app/oraInventory
chown -R oracle:oinstall /u01/app/oracle
chmod -R 775 /u01
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2062ad14cc0241b3b519b8a809a82442~tplv-k3u1fbpfcp-zoom-1.image)
## 14、环境变量配置（rac01&rac02）
提前配置 profile 文件：
**grid 用户：**
```bash
cat <<EOF>>/home/grid/.bash_profile
################OracleBegin#########################
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/grid
export ORACLE_HOME=/u01/app/11.2.0/grid
export ORACLE_TERM=xterm
export TNS_ADMIN=\$ORACLE_HOME/network/admin
export LD_LIBRARY_PATH=\$ORACLE_HOME/lib:/lib:/usr/lib
export ORACLE_SID=+ASM1
export PATH=/usr/sbin:\$PATH
export PATH=\$ORACLE_HOME/bin:\$ORACLE_HOME/OPatch:\$PATH
alias sas='sqlplus / as sysasm'
export PS1="[\`whoami\`@\`hostname\`:"'\$PWD]\$ '
EOF
```
**📢 注意：** 每个节点的 ORACLE_SID 不一样（+ASM1/+ASM2），需要自行修改！

**oracle 用户：**
```bash
cat <<EOF>>/home/oracle/.bash_profile
################OracleBegin#########################
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=\$ORACLE_BASE/product/11.2.0/db
export ORACLE_HOSTNAME=rac01
export ORACLE_TERM=xterm
export TNS_ADMIN=\$ORACLE_HOME/network/admin
export LD_LIBRARY_PATH=\$ORACLE_HOME/lib:/lib:/usr/lib
export ORACLE_SID=orcl1
export PATH=/usr/sbin:\$PATH
export PATH=\$ORACLE_HOME/bin:\$ORACLE_HOME/OPatch:\$PATH
alias sas='sqlplus / as sysdba'
export PS1="[\`whoami\`@\`hostname\`:"'\$PWD]\$ '
################OracleEnd#########################
EOF
```
**📢 注意：** 每个节点的 ORACLE_HOSTNAME（rac01/rac02）和 ORACLE_SID（orcl1/orcl2）不一样，需要自行修改！
## 15、安装介质上传解压（rac01）
安装包使用 	XFTP 工具进行上传，只需要上传至一节点 /soft 目录下：
```bash
##创建安装介质存放目录
mkdir /soft
##上传安装介质到/soft目录
p13390677_112040_Linux-x86-64_1of7.zip
p13390677_112040_Linux-x86-64_2of7.zip
p13390677_112040_Linux-x86-64_3of7.zip
##解压安装介质
cd /soft
unzip -q p13390677_112040_Linux-x86-64_1of7.zip
unzip -q p13390677_112040_Linux-x86-64_2of7.zip
unzip -q p13390677_112040_Linux-x86-64_3of7.zip
##授权目录
chown -R oracle:oinstall /soft/database
chown -R grid:oinstall /soft/grid
##root用户下，cvuqdisk安装（rac01&rac02）
cd /soft/grid/rpm
rpm -ivh cvuqdisk-1.0.9-1.rpm 
##传输到节点二安装
scp cvuqdisk-1.0.9-1.rpm rac2:/tmp
rpm -ivh /tmp/cvuqdisk-1.0.9-1.rpm 
```
**📢 注意：** 安装包只需要在节点一上传解压即可！

**<font color='orage'>至此，准备工作已经完成。</font>**

# 二、安装 Grid 软件（rac01）
关于 `VNC` 配置具体可参考文章：
>**[Linux 配置 VNC 远程桌面](https://luciferliu.blog.csdn.net/article/details/120210818)**

配置 grid 用户 vnc 图形界面：
```bash
##root用户下切换到grid用户
su - grid
##执行vncserver，按提示输入密码即可
vncserver
##在vnc客户端界面输入192.168.56.10:1，输入刚才输入的密码即可连接。
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8781a0859835427599bcfd9ecf7a151d~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ce31f8c78fc498f9ca13d03d65fc353~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/818e1c92b92349898a2f96539a17cf9c~tplv-k3u1fbpfcp-zoom-1.image)
右键打开终端：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8691c38770e14ea9af37e0d913316f70~tplv-k3u1fbpfcp-zoom-1.image)
开始安装：
```bash
##应用环境变量
source ~/.bash_profile
##进入安装目录
cd /soft/grid
##执行安装程序开始安装，加上jar包防止弹窗不显示问题
./runInstaller -jreLoc /etc/alternatives/jre_1.8.0
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5e0998f4e9534e74a17cd096055ed7d8~tplv-k3u1fbpfcp-zoom-1.image)
跳过版本更新：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1b2c6dda9b834f31beefef94bd41fe11~tplv-k3u1fbpfcp-zoom-1.image)
选择集群模式安装：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5aa7fecd91b146d984dc7b184805d313~tplv-k3u1fbpfcp-zoom-1.image)
自定义模式安装：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e4d33d6a6df4c8b8d3196d74d3aa134~tplv-k3u1fbpfcp-zoom-1.image)
选择语言：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73ef171783d248e0986602c3f57c3563~tplv-k3u1fbpfcp-zoom-1.image)
修改集群名称和 scan 名称：
![修改cluster名称](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/375f8c5e4d1a45da903b56650d1bfdec~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** scan 名称必须与 /etc/hosts 中配置的 scan 名称保持一致！

配置 grid 用户节点间互信：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/badad7b2852141bf8601a96d55c2a2b5~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** 点击 Add 添加节点二，pubile hostname 为 `rac02`，virtual hostname 为 `rac02-vip`，输入密码：`oracle`，点击 setup 开始互信。

点击Test测试互信：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ba065e0f601493094945707d2a9b9bc~tplv-k3u1fbpfcp-zoom-1.image)
确认网络信息是否正确：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a86a28edb98f494c93d1c3ecc25633d9~tplv-k3u1fbpfcp-zoom-1.image)
选择ASM模式安装：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9dfe6bd98d7644ce865f17fd5bd17e47~tplv-k3u1fbpfcp-zoom-1.image)
填写 OCR 裁决盘信息：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/537f2341f9224b549321ad660c8364be~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** OCR 裁决盘这里冗余模式 External，Normal，High 对应磁盘数量为 1，3，5。

填写 ASM 实例 SYS 用户密码为 oracle：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8b2e65756ce4fcfad1279a0f656282d~tplv-k3u1fbpfcp-zoom-1.image)
不使用 IPMI：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da56e6f08876436f95e62eac08ec6b0c~tplv-k3u1fbpfcp-zoom-1.image)
选择用户组，默认即可：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5893bd9a3dea4ac1b394fe0b0719acb9~tplv-k3u1fbpfcp-zoom-1.image)
选择grid安装目录，默认即可：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa8bd0729bec47b190c787032ac67fa5~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20a0b39e4124413891e468cfbf7b5072~tplv-k3u1fbpfcp-zoom-1.image)
安装前预检查：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/deef3e2f4efd4ff39ae5f25c2e47b418~tplv-k3u1fbpfcp-zoom-1.image)
开始执行安装：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b035f5eb32ef4ed2a9f9143ff0db0385~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc4bf12d104c4206bb526082b37c764a~tplv-k3u1fbpfcp-zoom-1.image)
执行 root 脚本：（rac01&rac02）
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b838cc88d494713a1e362a2c18352d1~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** Linux7 安装 Oracle 11GR2 版本，执行 root.sh 时存在 BUG：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa9459efc8db49aeb8f641b14ae1a9e5~tplv-k3u1fbpfcp-zoom-1.image)
需要在执行 root.sh 之前安装补丁 `18370031` 来修复，**补丁下载地址**：

<a href="https://pan.baidu.com/s/1f1nCwZxfeqsdWGKN1DiI9Q"  target="_blank" rel="noopener noreferrer"><font size="5" color="orage">https://pan.baidu.com/s/1f1nCwZxfeqsdWGKN1DiI9Q</a></font> 
**提取码: `wbtw`**

18370031 补丁安装：（rac01&rac02）
```bash
##上传补丁包
p18370031_112040_Linux-x86-64.zip
##解压补丁包
cd /soft
unzip -q p18370031_112040_Linux-x86-64.zip
##授权补丁包
chown -R grid:oinstall /soft/18370031
##开始安装补丁，两个节点都需要执行
opatch napply -oh $ORACLE_HOME -local /soft/18370031 -silent
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1fe48e9dee2741b1ad9b6b8246dd05d8~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** 两个节点都需要安装补丁 `18370031`！

打好补丁后，开始执行 root.sh 脚本：（rac01&rac02）
```bash
##root用户下执行
/u01/app/oraInventory/orainstRoot.sh
/u01/app/11.2.0/grid/root.sh
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/379def3a6bdc49e28f126e5b279b35a1~tplv-k3u1fbpfcp-zoom-1.image)
<font color='orage'>**执行过程太长，不做记录！**</font>

由于我们没有配置 DNS 解析，因此下方的错误忽略即可：
![DNS报错](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3fb689e0a432488eb3b6712c972e6093~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/615be3110ebc4a4ea88ba8666a0f8414~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a0bf446c30db41e68e5f13de06b251b2~tplv-k3u1fbpfcp-zoom-1.image)
<font color='orage'>**至此，Grid集群软件安装成功！**</font>

<font color='red'>**注意：**</font> 如果需要安装 `PSU` 补丁，建议在建库之前安装，可以省去数据字典升级的步骤！

以 Grid PSU 补丁 `31718723` 为例，使用 `root` 用户执行补丁安装命令：（rac01&rac02）**
```bash
##解压补丁包
cd /soft
unzip -q p31718723_112040_Linux-x86-64.zip
##切换到root用户执行，需要拷贝到2节点也执行一次
opatch auto /soft/31718723 -oh $GRID_ORACLE_HOME
```
**📢 注意：** 需要先替换 grid 和 oracle 软件的 OPatch 包为最新版本，否则无法成功安装补丁！

# 三、创建 ASM 数据盘 DATA
这里创建的 DATA 磁盘组主要用于存放数据文件、日志文件等数据库文件！

这里我们可以使用静默创建或者图形化方式创建：

**1、静默创建**
```bash
asmca -silent -sysAsmPassword oracle -asmsnmpPassword oracle -oui_internal -configureASM -diskString '/dev/asm*' -diskGroupName DATA -diskList /dev/asm_data_1,/dev/asm_data_2,/dev/asm_data_3 -redundancy NORMAL -au_size 1
```
**2、图形化创建**
```bash
asmca
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8574fac5af4745cfb3d7c0fd23e0fbdb~tplv-k3u1fbpfcp-zoom-1.image)
点击 create 创建 DATA：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6dab095b5284adb9e6301c9dd259235~tplv-k3u1fbpfcp-zoom-1.image)
点击 OK 创建 DATA：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6678d447c59f46f2b7bb1299321b932f~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6bf2e2e61b8243f58da4512a0bdad631~tplv-k3u1fbpfcp-zoom-1.image)
**<font color='orage'>建议重启两台主机，检查重启后Grid集群是否正常运行！</font>**

# 四、安装Oracle软件
配置 oracle 用户 vnc 图形界面：
```bash
##root用户下切换到grid用户
su - oracle
##执行vncserver，按提示输入密码即可
vncserver
##在vnc客户端界面输入192.168.56.10:2，输入刚才输入的密码即可连接。
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e15dd2c589043938c1a8c4ec186fb6a~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ea4b185df7a41e1893c85f4b4d8f1ae~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32295c06e4d2418db592a7487fedbda4~tplv-k3u1fbpfcp-zoom-1.image)
右键打开终端：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4d4e4a7f99c4fa397580ec96e6a8bf8~tplv-k3u1fbpfcp-zoom-1.image)
开始安装：
```bash
##应用环境变量
source ~/.bash_profile
##进入安装目录
cd /soft/database
##执行安装程序开始安装，加上jar包防止弹窗不显示问题
./runInstaller -jreLoc /etc/alternatives/jre_1.8.0
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/325b46da296342448504f353eadc4e02~tplv-k3u1fbpfcp-zoom-1.image)
不配置 Oracle 邮件发送：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ddcdd0ec5dc4711b46851ff912fe6e4~tplv-k3u1fbpfcp-zoom-1.image)
跳过软件更新：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7c088280895463cb884370867ec05f0~tplv-k3u1fbpfcp-zoom-1.image)
选择仅安装 oracle 软件：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84dfe4d145484f01beeb89cc19bd60a3~tplv-k3u1fbpfcp-zoom-1.image)
配置 oracle 用户互信：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8b29387883d94b879c36cff43a8a104b~tplv-k3u1fbpfcp-zoom-1.image)
输入密码，点击 setup 开始，成功之后点击 Test 。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92773cd2ed3744d4865c92c1dcb288ea~tplv-k3u1fbpfcp-zoom-1.image)
选择语言：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/003f79eb92414dd2bb1a152e238c7f73~tplv-k3u1fbpfcp-zoom-1.image)
选择企业版安装：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc368790c4f74031a9f16823fa9b7606~tplv-k3u1fbpfcp-zoom-1.image)
检查用户组，默认即可：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33fea71bb9af4c708d80a27a69e1f622~tplv-k3u1fbpfcp-zoom-1.image)
安装前预检查：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f7688b04b3e5412898bdb87e7e70b3e8~tplv-k3u1fbpfcp-zoom-1.image)
开始安装 Oracle 软件：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3fb8f9e47b34416bce9c08d08ac3b49~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76a656e2194840efa9632e2bad1d0c46~tplv-k3u1fbpfcp-zoom-1.image)
报错解决：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6dc6812c5b5415fa60a079397768893~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** Linux7 安装 Oracle 11GR2 版本，oracle 软件安装过程中报错：`ins_emagent.mk`，需要修改文件 `/sysman/lib/ins_emagent.mk` 来修复！

两个节点都执行以下命令，然后点击继续：（rac01&rac02）
```bash
sed -i 's/^\(\s*\$(MK_EMAGENT_NMECTL)\)\s*$/\1 -lnnz11/g' "$ORACLE_HOME/sysman/lib/ins_emagent.mk
```
执行 root.sh 脚本：（rac01&rac02）
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f01dd3faeeb24d5c91434db038d8cfc0~tplv-k3u1fbpfcp-zoom-1.image)
点击下一步，安装成功：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/72ada41a0dd54b4781744a266d08e965~tplv-k3u1fbpfcp-zoom-1.image)
**<font color='orage'>至此，Oracle 软件已成功安装。</font>**

<font color='red'>**注意：**</font> 如果需要安装 `PSU` 补丁，建议在建库之前安装，可以省去数据字典升级的步骤！

以 Grid PSU 补丁 `31718723` 为例，使用 `root` 用户执行补丁安装命令：（rac01&rac02）**
```bash
##解压补丁包
cd /soft
unzip -q p31718723_112040_Linux-x86-64.zip
##切换到root用户执行，需要拷贝到2节点也执行一次
opatch auto /soft/31718723 -oh $ORACLE_ORACLE_HOME
```
**📢 注意：** 需要先替换 grid 和 oracle 软件的 OPatch 包为最新版本，否则无法成功安装补丁！
# 五、创建数据库实例
在确保 grid 和 oracle 软件和补丁都已安装成功后，即可开始创建数据库实例！
```bash
dbca
```
选择rac模式：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/becd1471fff94b6ea13ca8fdeecff4c8~tplv-k3u1fbpfcp-zoom-1.image)
选择创建数据库：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/15a834f72b924a389611a4397ea0fe2a~tplv-k3u1fbpfcp-zoom-1.image)
选择自定义模板：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/08f94bf1bb074abd9a31316a84955826~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** 这里我选择的是 `Custom Database` 选项，可以自定义安装组件！

填写数据库实例 ID：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/14f3d499b0a44076a8d1b477283f7cc3~tplv-k3u1fbpfcp-zoom-1.image)
关闭 EM，保留自动化系统 JOB：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e2a5d0b42d542c88b943c228e4e6a71~tplv-k3u1fbpfcp-zoom-1.image)
填写 SYS 密码，需要记住：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/22c2ad489b9b48259a07ee3e307091e7~tplv-k3u1fbpfcp-zoom-1.image)
选择存放数据的 ASM 盘：**DATA**
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87d6f95d282b470780f3b339d7a50df2~tplv-k3u1fbpfcp-zoom-1.image)
不开启闪回区，建库后可随时开启：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1496d89cfb8441bb87a1c65a844263a0~tplv-k3u1fbpfcp-zoom-1.image)
选择自定义组件，默认即可！![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb3c18c860304571964c0d0d2595becd~tplv-k3u1fbpfcp-zoom-1.image)
配置初始化参数：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6f90f50e5ad4f7babfcc8471349701b~tplv-k3u1fbpfcp-zoom-1.image)
**📢 注意：** 如果使用自动管理内存，建议使用 **70%~90%** 的物理内存，建议 `/etc/shm` 和物理内存一样大！

block 默认 `8192`（即数据文件默认最大 32G），进程数增加到 `1500`：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a7ec85ba4b24aa1b69f14ab075ec307~tplv-k3u1fbpfcp-zoom-1.image)
选择数据库字符集，默认字符集为 `AL32UTF8`，国家字符集为 `AL16UTF16`，**需根据业务实际情况进行修改**：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60b6ae3e87c34368930b8f455ad66445~tplv-k3u1fbpfcp-zoom-1.image)
开始建库：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d81395e8c0c04443bee662d4dc200342~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6cf42ccd009945c489a3c8c58999cb39~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e0122b61f5df4012b309b42a83c3e808~tplv-k3u1fbpfcp-zoom-1.image)
数据库创建成功：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1cac3a232233437eb1e39a6765b8ad52~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/362ebdb0984c412ea8137020b9a53c32~tplv-k3u1fbpfcp-zoom-1.image)
**<font color='orage'>至此，数据库实例创建完成！</font>**

# 六、数据库优化配置（rac01）
## 1、开启数据库归档模式
关于开启归档模式，具体可参考文章：
>**[Oracle 开启归档模式](https://luciferliu.blog.csdn.net/article/details/120250918)**

```bash
##关闭数据库实例
srvctl stop database -d orcl
##开启单个节点到mount模式
srvctl start instance -d orcl -i orcl1 -o mount
##开启归档
alter database archivelog;
##设置归档路径
ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=+DATA';
##重启数据库实例
srvctl stop instance -d orcl -i orcl1
srvctl start database -d orcl
##检查归档
archive log list
```
## 2、配置定期删除归档计划任务
关于归档日志删除，具体可参考文章：
>**[Oracle RMAN删除归档日志脚本](https://luciferliu.blog.csdn.net/article/details/120319512)**

```bash
##进入oracle用户
su - oracle
##写入脚本
{
	echo '#!/bin/bash'
    echo 'source ~/.bash_profile'
    echo 'deltime=`date +"20%y%m%d%H%M%S"`'
    echo "rman target / nocatalog msglog /home/oracle/scripts/del_arch_\${deltime}.log<<EOF"
    echo 'crosscheck archivelog all;'
    echo "delete noprompt archivelog until time 'sysdate-7';"
    echo "delete noprompt force archivelog until time 'SYSDATE-10';"
    echo 'EOF'
} >>/home/oracle/scripts/del_arch.sh
##写入计划任务
cat <<EOF>>/var/spool/cron/oracle
12 00 * * * /home/oracle/scripts/del_arch.sh
EOF
##手动执行测试
/home/oracle/scripts/del_arch.sh
```

## 3、设置密码永不过期
```bash
sqlplus / as sysdba
ALTER PROFILE DEFAULT LIMIT PASSWORD_LIFE_TIME UNLIMITED;
```
Oracle 11GR2 版本需要手动设置密码永不过期，12CR2 版本之后已经默认设置为永不过期了！

---

# 往期精彩文章
>[Oracle 一键巡检自动生成 Word 报告](https://mp.weixin.qq.com/s/0xFe5m1DQ0ucT2_266hsrA)    
[Oracle 一键安装合集](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5MzcwNzQ0MQ==&action=getalbum&album_id=3497774649285296131#wechat_redirect)    
[Oracle一键安装脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/gv6t97FFyMsd6e4GH1HAwQ)    
[Oracle一键巡检脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/4zI73auIUhwSRb7qL3UIfw)    
[全网首发：Oracle 23ai 一键安装脚本（非 RPM）](https://mp.weixin.qq.com/s/UL0BSMCAZrOQgCoWpDMGew)    
[Oracle 19C 最新 RU 补丁 19.24 ，一键安装！](https://mp.weixin.qq.com/s/T7GbpwhnMugzk7PB6hAoJQ)    
[Oracle Linux 7.9 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/dT4tFMYVZ3mh49CI6V3YEA)    
[RedHat 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cQJ6gP1bM_7m0H5-Dha4TA)    
[openEuler 22.03 LTS SP4 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/sx1E4GIvIeQXp2vGMmVr2A)    
[RHEL 7.9 一键安装 Oracle 19C 19.23 RAC](https://mp.weixin.qq.com/s/mUHqU5hQ9GdH2bKuClPt5A)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q)    
[优化 Oracle：最佳实践与开发规范](https://mp.weixin.qq.com/s/DysIcb-p11j56d3YtlqpcQ)    
[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA)    
[Linux 一键配置时钟同步全攻略](https://mp.weixin.qq.com/s/yvth1vorP3JjUp3g3vPBAQ)    

---

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎**点赞+关注**，我会持续分享数据库知识、运维技巧。