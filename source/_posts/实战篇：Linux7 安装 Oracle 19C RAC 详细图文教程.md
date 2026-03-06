---
title: 实战篇：Linux7 安装 Oracle 19C RAC 详细图文教程
date: 2021-11-03 21:38:08
tags: [墨力计划,oracle rac]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/154424
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)


# 前言
之前发过一篇Oracle 11G RAC手把手教程，有朋友留言评论：**19C都出了，为什么还在教11G？** 
>**[一步步教你Linux7安装Oracle RAC（11GR2版本）](https://www.modb.pro/db/153861)**

**<font color='orage'>既然如此，那就趁着周末边做边写，来一篇 19C RAC 手把手教程！</font>**

**📢 注意：** 关于 Oracle RAC 在上一篇中已经讲的很清楚了，不了解的朋友可以点链接🔗看一下再继续读下去。
# 一、安装前规划
安装RAC前，当然要先做好规划。具体包含以下几方面：

| 节点 | 主机版本 | 主机名 | 实例名 | Grid/Oracle版本 | Public IP | Private IP |  Virtual IP | Scan IP |
|-----|-----|------|-----|-----|------|------|------|------|
| 1 | rhel7.9 | p19c01 | p19c01 | 19.11.0.0 | 10.211.55.100 | 1.1.1.1 | 10.211.55.102 | 10.211.55.105 |
| 2 | rhel7.9 | p19c02 | p19c02 | 19.11.0.0 | 10.211.55.101 | 1.1.1.2| 10.211.55.103 | 10.211.55.105 |
## 1、系统规划
- **主机名：** 需要英文字母开头，建议小写，p19c01/p19c02  
- **集群名称：** 长度不超过15位，p19c-cluster
- **Linux系统版本：** RedHat 7.9
- **磁盘：** 本地磁盘 100G，用于安装 OS，存放 grid 和 oracle 安装软件，用于 oracle 和 grid 安装目录  
- **ASM共享盘：**  
裁决盘OCR：OCR+VOTING=10G、冗余模式：EXTERNAL  
数据盘DATA：DATA=20G、冗余模式：EXTERNAL（数据文件，归档日志文件，spfile 文件等）
- **RU升级路径：** 19C 的补丁已经不叫PSU，改为 RU

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8eaef430ad4045cfa109e749d456c6f1~tplv-k3u1fbpfcp-zoom-1.image)

升级需满足条件：
- c>=a 
- c+d>=a+b     

例如：
- 19.5.2-->19.8.0（5是a,2是b,8是c,0是d），满足升级需求；
- 19.6.2-->19.7.0（虽然7>6，但是7+0<6+2，所以不满足，如果是19.7.1，即可满足）

**<font color='orage'>本次是从 19.3.0 升级到 19.11.0，Oracle 官网下载的基础版是 19.3.0！</font>**

⭐️ 如果想要使用脚本安装，可以使用博主编写的 Oracle 一键安装脚本，同时支持单机和 RAC 集群模式！
>**[Oracle 数据库一键安装脚本](https://www.modb.pro/course/148)**

**<font color='red'>更多更详细的脚本使用方式可以订阅专栏：</font>[Oracle 一键安装脚本实操合集，持续更新中！！！](https://www.modb.pro/db/1773583263184031744)。**
## 2、网络规划
Public IP（公司内部访问，非外网）
```bash
10.211.55.100   p19c01  
10.211.55.101   p19c02
```
Private IP（用于节点间心跳网络）
```bash
1.1.1.1   p19c01-priv  
1.1.1.2   p19c02-priv
```
Virtual IP（提供客户端访问，漂移）
```bash
10.211.55.102 	p19c01-vip  
10.211.55.103 	p19c02-vip
```
SCAN IP（提供客户端访问，均衡）
```bash
10.211.55.105 	p19c-scan
```
## 3、存储规划
Oracle RAC 使用 ASM 存储来存放数据，通常使用 OCR 和 DATA 两个磁盘组！
|磁盘名称|磁盘用途|磁盘大小|
|--|--|--|
|asm-ocr|OCR/Voting File|10G|
|asm-data|Data Files|20G|

# 二、主机配置
**<font color='orage'>📢 注意：</font>** 以下标题中（**<font color='red'>rac01&rac02</font>**）代表节点一和节点二都需要执行，（**<font color='red'>rac01</font>**）代表只需要节点一执行。

## 1、Linux主机安装（rac01&rac02）
安装 Linux 服务器可选择：Centos，Redhat，Oracle Linux。

**📢 注意：** 上述 **Linux 安装包** 和 **Oracle 安装包** 可点击链接跳转获取：

>**`Linux 安装包`：** [https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw](https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw)

>**`Oracle 安装包`：** [https://mp.weixin.qq.com/s/ECJelOb6NUjZjpUvUa17pg](https://mp.weixin.qq.com/s/ECJelOb6NUjZjpUvUa17pg)

**📢 注意：** Linux 系统的安装本文不做详细演示！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0597018f7d4043afb14e1b06f8cda501~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** Linux 系统的安装本文不做详细演示！

## 2、配置yum源并安装依赖包（rac01&rac02）
Linux远程连接工具：

- 本文将使用XShell和Xftp工具，安装包可以在官网下载，也可私信博主获取。
- 其他工具也可以，比如：putty，SecureCRT 等等工具。

Parallels Desktop挂载Linux主机镜像：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ea39598513414c699a50daf4293d8217~tplv-k3u1fbpfcp-zoom-1.image)

VMware Workstation挂载Linux镜像：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87b7967bcc0e470cb54a45f54037ecd9~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 需要提前挂载系统镜像，可参考：[Linux 配置本地 yum 源（6/7/8）](https://luciferliu.blog.csdn.net/article/details/120196606)！

手动挂载镜像源：
```bash
mount /dev/cdrom /mnt
df -Th
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7768af6b8b06410283e459660ba3eec8~tplv-k3u1fbpfcp-zoom-1.image)

配置yum源：
```bash
cat <<EOF>>/etc/yum.repos.d/local.repo
[local]
name=local
baseurl=file:///mnt
gpgcheck=0
enabled=1
EOF
yum repolist all
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4e234a85f6547e19619a6c9ad9e2fe3~tplv-k3u1fbpfcp-zoom-1.image)

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
cd /soft
rpm -ivh compat-libstdc++-33-3.2.3-72.el7.x86_64.rpm
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a8e93bee368461ab677ae067f3ec567~tplv-k3u1fbpfcp-zoom-1.image)

检查依赖包安装情况：
```bash
rpm -q bc binutils compat-libcap1 compat-libstdc++-33 gcc gcc-c++ elfutils-libelf elfutils-libelf-devel glibc glibc-devel ksh libaio libaio-devel libgcc libstdc++ libstdc++-devel libxcb libX11 libXau libXi libXtst libXrender libXrender-devel make net-tools nfs-utils smartmontools sysstat e2fsprogs e2fsprogs-libs fontconfig-devel expect unzip openssh-clients readline | grep "not installed"
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/79c2811af20449f3a095597f55979425~tplv-k3u1fbpfcp-zoom-1.image)

**<font color='orage'>📢 注意：</font>** 依赖一定要安装成功，否则可能导致安装失败！
## 3、网络配置
Linux 7 版本可以使用 `nmcli` 命令来配置网络，以下命令中的 **IP地址、子网掩码、网关** 和 **网卡名称** 请根据实际情况进行修改！

**rac01：**
```bash
##配置Public IP
nmcli connection modify eth0 ipv4.addresses 10.211.55.100/24 ipv4.gateway 10.211.55.1 ipv4.method manual autoconnect yes
##配置Private IP
nmcli connection modify eth1 ipv4.addresses 1.1.1.1/24 ipv4.method manual autoconnect yes
##生效
nmcli connection up eth0
nmcli connection up eth1
nmcli connection show
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cbef2ac32ae14246a2a202b6d0ded377~tplv-k3u1fbpfcp-zoom-1.image)

**rac02：**
```bash
##配置Public IP
nmcli connection modify eth0 ipv4.addresses 10.211.55.101/24 ipv4.gateway 10.211.55.1 ipv4.method manual autoconnect yes
##配置Private IP
nmcli connection modify eth1 ipv4.addresses 1.1.1.2/24 ipv4.method manual autoconnect yes
##生效
nmcli connection up eth0
nmcli connection up eth1
nmcli connection show
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ddb636afcc1749f9a40b3e05a4b6de8e~tplv-k3u1fbpfcp-zoom-1.image)

最后，配置好网络后，输入命令 `ip a` 查看网络是否配置成功，尝试 `ping` 测试网络。
## 4、存储配置（rac01&rac02）
**<font color='orage'>Windows 下配置 ISCSI 共享存储可参考：</font>**
>**[一步步教你Windows配置ISCSI共享存储](https://luciferliu.blog.csdn.net/article/details/118087577)**

配置好共享存储后，在 Linux 主机连接共享存储：
```bash
##iscsi识别共享存储
yum install -y iscsi-initiator-utils*
##输出targetname，10.211.55.22为iscsi共享存储设备IP地址
iscsiadm -m discovery -t st -p 10.211.55.22
##连接共享存储
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:10.211.55.22-lucifer -p 10.211.55.22 -l
lsblk
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a106c027310b413788f5202d05654f3c~tplv-k3u1fbpfcp-zoom-1.image)

安装 `multipath` 绑定多路径：
```bash
##安装multipath
yum install -y device-mapper*
mpathconf --enable --with_multipathd y
##查看共享盘的scsi_id
/usr/lib/udev/scsi_id -g -u /dev/sdb
/usr/lib/udev/scsi_id -g -u /dev/sdc
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
  wwid "27e2b3ddbb7fbeb41"
  alias asm_ocr
  }
  multipath {
  wwid "2852b96c12f460ade"
  alias asm_data
  }
}
EOF
```
**📢 注意：** wwid的值为上面获取的scsi_id，alias可自定义，这里配置1块OCR盘，1块DATA盘！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a4a1f1ba4f44a80ad135b60ca20adc7~tplv-k3u1fbpfcp-zoom-1.image)

激活multipath多路径：
```bash
multipath -F
multipath -v2
multipath -ll
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7942a6c8853346d79f2ff825d4f03d24~tplv-k3u1fbpfcp-zoom-1.image)

配置UDEV绑盘：
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
##重载udev
udevadm control --reload-rules
udevadm trigger --type=devices
ll /dev/asm*
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0543d61b76fb493691324b34dee860a7~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0995d9f2567a4f4da65d3d6522097a54~tplv-k3u1fbpfcp-zoom-1.image)

**<font color='orage'>📢 注意：</font>** 这里由于没有创建 grid 用户，因此权限和组是 root，等创建 grid 用户后，再次重载 udev 即可！

确认配置完成后，分别在两个节点输入命令 `ls /dev/asm*` 查看是否已经成功绑定！
## 5、hosts文件配置（rac01&rac02）
配置hostname：
```bash
hostnamectl set-hostname p19c01
hostnamectl set-hostname p19c02
```
配置hosts文件：
```bash
cat <<EOF>>/etc/hosts
#Public IP
10.211.55.100 	p19c01
10.211.55.101 	p19c02

#Private IP
1.1.1.1 p19c01-priv
1.1.1.2 p19c02-priv

#Vip IP
10.211.55.102 p19c01-vip
10.211.55.103 p19c02-vip

#Scan IP
10.211.55.105 p19c-scan
EOF
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/70c11d0a3d32492b97ba4b89f1a29930~tplv-k3u1fbpfcp-zoom-1.image)

## 6、防火墙配置（rac01&rac02）
```bash
systemctl stop firewalld.service
systemctl disable firewalld.service
systemctl status firewalld.service
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7c3144e3faa4082997aed9430f77d20~tplv-k3u1fbpfcp-zoom-1.image)
## 7、selinux 配置（rac01&rac02）
配置 selinux 临时生效： 
```bash
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
setenforce 0
getenforce
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a125ec945f654cdabbb033a83afc5fab~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** selinux 配置需要重启生效！
## 8、时间同步配置（rac01&rac02）
禁用chronyd：
```bash
yum install -y chrony
timedatectl set-timezone Asia/Shanghai
systemctl stop chronyd.service
systemctl disable chronyd.service
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b1d0069f3ad44bdb9ef76d5a4b83959a~tplv-k3u1fbpfcp-zoom-1.image)

配置ntpdate时间同步计划任务：
```bash
yum install -y ntpdate
##10.211.55.200为时间服务器IP，每天12点同步系统时间
cat <<EOF>>/var/spool/cron/root
00 12 * * * /usr/sbin/ntpdate -u 10.211.55.200 && /usr/sbin/hwclock -w
EOF
##查看计划任务
crontab -l
##手动执行
/usr/sbin/ntpdate -u 10.211.55.200 && /usr/sbin/hwclock -w
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2fbbc56e1ed44376aa33f78939b142c1~tplv-k3u1fbpfcp-zoom-1.image)
## 9、关闭透明大页和NUMA（rac01&rac02）
Linux 7 配置内核文件，关闭透明大页和numa：
```bash
sed -i 's/quiet/quiet transparent_hugepage=never numa=off/' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
```
重启后检查是否生效：
```bash
cat /sys/kernel/mm/transparent_hugepage/enabled
cat /proc/cmdline
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5cea3d3a186244d58f2b7f5a892b8fdb~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 关闭 `透明大页` 和 `numa` 的配置，需要重启主机生效！

## 10、avahi-daemon 配置（rac01&rac02）
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
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/947f73223909400d9869b9209911371d~tplv-k3u1fbpfcp-zoom-1.image)
## 11、系统参数配置（rac01&rac02）
安装 Oracle 数据库需要配置系统参数，以下使用脚本命令一键式配置：
```bash
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
```
生效系统参数：
```bash
sysctl -p
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/36164b64d6d549ad94cdd49f827b004e~tplv-k3u1fbpfcp-zoom-1.image)
## 12、系统资源限制配置（rac01&rac02）
配置limits.conf：
```bash
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
```
配置pam.d/login：
```bash
cat <<EOF>>/etc/pam.d/login
session required pam_limits.so 
session required /lib64/security/pam_limits.so
EOF
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d2b805a5b8946aa9abf62e5db058d21~tplv-k3u1fbpfcp-zoom-1.image)
## 13、用户及组、目录创建（rac01&rac02）
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
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db9235b878f94b5bbe7fa90a0abdb6d7~tplv-k3u1fbpfcp-zoom-1.image)
grid/oracle 用户创建：
```bash
/usr/sbin/useradd -u 11012 -g oinstall -G asmadmin,asmdba,asmoper,dba,racdba,oper grid
/usr/sbin/useradd -u 54321 -g oinstall -G asmdba,dba,backupdba,dgdba,kmdba,racdba,oper oracle
##修改用户密码为oracle
echo "oracle" |passwd oracle --stdin
echo "oracle" |passwd grid --stdin
##查看用户组
id grid
id oracle
##重载udev
udevadm control --reload-rules
udevadm trigger --type-devices
ll /dev/asm*
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60664c3a2bee4700901ad2c75f65d6f6~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/991d103202664a50ac587fc56c595df0~tplv-k3u1fbpfcp-zoom-1.image)

**<font color='orage'>📢 注意：</font>** 这里udev重载之后，绑盘权限已经变成 grid 了！

创建软件目录：
```bash
mkdir -p /u01/app/19.3.0/grid
mkdir -p /u01/app/grid
mkdir -p /u01/app/oracle/product/19.3.0/db
mkdir -p /u01/app/oraInventory
mkdir -p /backup
mkdir -p /home/oracle/scripts
chown -R oracle:oinstall /backup
chown -R oracle:oinstall /home/oracle/scripts
chown -R grid:oinstall /u01
chown -R grid:oinstall /u01/app/grid
chown -R grid:oinstall /u01/app/19.3.0/grid
chown -R grid:oinstall /u01/app/oraInventory
chown -R oracle:oinstall /u01/app/oracle
chmod -R 775 /u01
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/196b7108b4d94af096545c419ab64cdb~tplv-k3u1fbpfcp-zoom-1.image)
## 14 环境变量配置（rac01&rac02）
grid用户环境变量：
```bash
cat <<EOF>>/home/grid/.bash_profile
################OracleBegin#########################
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/grid
export ORACLE_HOME=/u01/app/19.3.0/grid
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
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/660a10cb66c24357a6b9c9c2d0f67777~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 每个节点的 ORACLE_SID 不一样（+ASM1/+ASM2），需要自行修改！

oracle用户环境变量：
```bash
cat <<EOF>>/home/oracle/.bash_profile
################OracleBegin#########################
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=\$ORACLE_BASE/product/19.3.0/db
export ORACLE_HOSTNAME=p19c01
export ORACLE_TERM=xterm
export TNS_ADMIN=\$ORACLE_HOME/network/admin
export LD_LIBRARY_PATH=\$ORACLE_HOME/lib:/lib:/usr/lib
export ORACLE_SID=p19c01
export PATH=/usr/sbin:\$PATH
export PATH=\$ORACLE_HOME/bin:\$ORACLE_HOME/OPatch:\$PATH
alias sas='sqlplus / as sysdba'
export PS1="[\`whoami\`@\`hostname\`:"'\$PWD]\$ '
################OracleEnd#########################
EOF
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fab7c178b63045459abe10b533409380~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 每个节点的 ORACLE_HOSTNAME（p19c01/p19c02）和 ORACLE_SID（p19c01/p19c02）不一样，需要自行修改！
## 15、安装介质上传解压（rac01）
安装包使用 	XFTP 工具进行上传，只需要上传至一节点 /soft 目录下：
```bash
##创建安装介质存放目录
mkdir /soft
##上传安装介质到/soft目录
LINUX.X64_193000_db_home.zip
LINUX.X64_193000_grid_home.zip
p32545008_190000_Linux-x86-64.zip
p6880880_190000_Linux-x86-64.zip
```
**📢 注意：** 19C 的安装包需要解压到对应的 ORACLE_HOME 目录下！

静默解压grid安装包：
```bash
chown -R grid:oinstall /soft
su - grid -c "unzip -q /soft/LINUX.X64_193000_grid_home.zip -d /u01/app/19.3.0/grid/"
```
静默解压oracle安装包：
```bash
chown -R oracle:oinstall /soft
su - oracle -c "unzip -q /soft/LINUX.X64_193000_db_home.zip -d /u01/app/oracle/product/19.3.0/db/"
```
静默解压补丁安装包：
```bash
cd /soft
##解压RU补丁包
chown -R grid:oinstall /soft
su - grid -c "unzip -q -o /soft/p6880880_190000_Linux-x86-64.zip -d /u01/app/19.3.0/grid"
##解压OPatch补丁包
su - grid -c "unzip -q /soft/p32545008_190000_Linux-x86-64.zip -d /soft"
chown -R oracle:oinstall /soft
su - oracle -c "unzip -q -o /soft/p6880880_190000_Linux-x86-64.zip -d /u01/app/oracle/product/19.3.0/db"
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fea16949182d40bb936af51f8c1ac822~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ee2524eea09410d99b2bb903329c3bb~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 由于19C支持安装grid软件前打RU补丁，因此提前解压OPatch和RU补丁，为安装做准备！

root用户下，cvuqdisk安装（rac01&rac02）：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ffe923b8327d4f6082efcbaf3460c725~tplv-k3u1fbpfcp-zoom-1.image)
```bash
rpm -ivh /u01/app/19.3.0/grid/cv/rpm/cvuqdisk-1.0.10-1.rpm 
##传输到节点二安装
scp cvuqdisk-1.0.10-1.rpm p19c02:/soft
rpm -ivh /soft/cvuqdisk-1.0.10-1.rpm 
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db357a57d01545ed8fcea23e40f98dc2~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 19C 版本的 cvu 包换位置了，目录为：`$ORACLE_HOME/cv/rpm/`，以上所有软件只需要在节点一上传解压即可。

**<font color='orage'>至此，准备工作已经完成，安装前重启主机！</font>**

重启后，检查 selinux、numa 和透明大页：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fee7c26f85f94faeb4fd4849f88346c8~tplv-k3u1fbpfcp-zoom-1.image)
# 三、安装Grid软件（rac01）
关于 `VNC` 配置具体可参考文章：
>**[Linux 配置 VNC 远程桌面](https://luciferliu.blog.csdn.net/article/details/120210818)**

配置 grid 用户 vnc 图形界面：
```bash
##root用户下切换到grid用户
chown -R grid:oinstall /soft
su - grid
##执行vncserver，按提示输入密码即可
vncserver
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db225a60ad384e8590f2ada14d452de9~tplv-k3u1fbpfcp-zoom-1.image)

在 vnc 客户端界面输入 10.211.55.100:1，输入刚才输入的密码即可连接：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6f2157b744f440729bff3ba620459ef2~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/daf140d0c4a0439bbc90d3acf9a2b9e5~tplv-k3u1fbpfcp-zoom-1.image)

打开终端命令行：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae10cc67e0734442a5d6cfed534d5f58~tplv-k3u1fbpfcp-zoom-1.image)

开始安装：
```bash
##应用环境变量
source ~/.bash_profile
##进入安装目录
cd $ORACLE_HOME
##执行安装程序开始安装，通过-applyRU参数指向补丁解压位置，提前安装grid补丁
./gridSetup.sh -applyRU /soft/32545008
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cffe51d6edcb47e4880b1b3c8ce7f526~tplv-k3u1fbpfcp-zoom-1.image)

**注意：** 可以看到，已经开始对ORACLE_HOME进行补丁安装。

补丁打完，进入安装界面，选择集群安装：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e479eec3040c4de0aefa098fd62336ef~tplv-k3u1fbpfcp-zoom-1.image)

选择 standlone 模式：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5e1e5b6e32e742e38fb3d7fdbea5ec88~tplv-k3u1fbpfcp-zoom-1.image)

修改 scan 名称，与 hosts 文件配置 scan 名称保持一致：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35c7d4792c894f84a83e74c9c689a3f0~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/333e78c08d7d43b7a39419e1e1a026b9~tplv-k3u1fbpfcp-zoom-1.image)

添加节点二信息，进行互信：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34cedb3ab0fc4df8981844b184fb6d17~tplv-k3u1fbpfcp-zoom-1.image)

输入 grid 用户密码，创建用户时两节点必须保持一致。先执行 setup，再执行 test，开始互信：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10bc2a0d512d4d56a527bdd3ddf68c6f~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c45030c2f72a40b9a18bd5d97480f9a2~tplv-k3u1fbpfcp-zoom-1.image)

确保对应网卡和IP网段对应即可，19C 心跳网段需要选 ASM & Private，用于 ASM 实例的托管：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a35f8dfe095142c7bf3f1ce53f36f0f9~tplv-k3u1fbpfcp-zoom-1.image)

选择存储类型，19C 只有两个选项，ASM 只能选 Flex：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab230f3e94224a1f8a52dc5fbee66266~tplv-k3u1fbpfcp-zoom-1.image)

GIMR，这里不选择安装：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8397c6c9ae274a9986e3f6206e472e5f~tplv-k3u1fbpfcp-zoom-1.image)

安装时填创建 OCR 盘，一块盘冗余 External，目录选择udev绑的路径：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/82d80b7560664b47bdd19830d1d87126~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/342d55cdf2e0460d9e677c22201f9d51~tplv-k3u1fbpfcp-zoom-1.image)

填写 sys/system 密码，需要记住自己设置的密码：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd02cf050a9747b385d7369b814f5016~tplv-k3u1fbpfcp-zoom-1.image)

默认即可：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/757ff94f0dfe476291081e1a9330c8d6~tplv-k3u1fbpfcp-zoom-1.image)

EM 选择不开，比较占资源，后面安装好后可以配置：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c93b7a9144f4f86ab67bcaa0992a543~tplv-k3u1fbpfcp-zoom-1.image)

默认即可：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da4fcbdfdbaa4c4fa316f80c1d8eb336~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00a606f24ddb4638816f5c32cdc24a39~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/adc04dd0eeb64c84abd530c74b65f1cb~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab71737857004f2387c5571c0205fcbc~tplv-k3u1fbpfcp-zoom-1.image)

安装预检查，由于我们只配了一个SCAN，所以关于 DNS 相关的都无视，继续：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/adce8753cf7a4abcaeda23eb5ab22527~tplv-k3u1fbpfcp-zoom-1.image)

开始安装 grid：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ea6b83b4a8a45699aa247f2627e8a33~tplv-k3u1fbpfcp-zoom-1.image)

两节点顺序执行 root.sh，先节点一执行完，再节点二执行：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9b0d434a31e4485894e58cc4544300e~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/477c304c549346c397c5820eba7eb00c~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/243e008349a2427bb2d24b6df6fe976f~tplv-k3u1fbpfcp-zoom-1.image)

两个节点的 root.sh 都执行完之后，继续安装：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/991239414569477bbae5fdcb139981da~tplv-k3u1fbpfcp-zoom-1.image)

这个错误查过 MOS 可以忽略：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5191666518b945b593bdaec618af2d2a~tplv-k3u1fbpfcp-zoom-1.image)

安装完成：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a142359cc394302aeaba4a22800e928~tplv-k3u1fbpfcp-zoom-1.image)

检查集群状态：
```bash
su - grid
crsctl stat res -t
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/124ac9a7a8514c539d98b54965053e6b~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/974f019701b54df3a5f53a02ad1caf8a~tplv-k3u1fbpfcp-zoom-1.image)

检查 grid 补丁：
```bash
su - grid
opatch lspatches
sqlplus -version
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f51cd9461f04b7f8b4c3524769ae814~tplv-k3u1fbpfcp-zoom-1.image)
# 三、创建 ASM 数据盘 DATA
这里创建的 DATA 磁盘组主要用于存放数据文件、日志文件等数据库文件！

使用图形化方式添加 ASM DATA 数据盘：
```bash
asmca
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e4882f8b7934a0a80bb4f6af2a2d5bb~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00f35251374a4125a1efd1cf184d41f5~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f534d3917247483cb0bb5d89a165be4d~tplv-k3u1fbpfcp-zoom-1.image)

检查 asm 磁盘：
```bash
asmcmd lsdg
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4e597a278af946839c5604e4e8cbcbd8~tplv-k3u1fbpfcp-zoom-1.image)
**<font color='orage'>建议重启两台主机，检查重启后 Grid 集群是否正常运行！</font>**

# 四、安装Oracle软件
配置 oracle 用户 vnc 图形界面：
```bash
chown -R oracle:oinstall /soft
##root用户下切换到grid用户
su - oracle
##执行vncserver，按提示输入密码即可
vncserver
##在vnc客户端界面输入10.211.55.100:1，输入刚才输入的密码即可连接。
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/50269ad530dc4bbca9585dfb766e2b96~tplv-k3u1fbpfcp-zoom-1.image)

在 vnc 客户端界面输入 10.211.55.100:1，输入刚才输入的密码即可连接：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9f60df719b143d294bc46b543ffc102~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f70c9ffdafc14e44b1b043c1b317dc43~tplv-k3u1fbpfcp-zoom-1.image)

右键打开终端：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f26582473ab4bac9f6339e0e2df26a9~tplv-k3u1fbpfcp-zoom-1.image)

开始安装：
```bash
##应用环境变量
source ~/.bash_profile
##进入ORACLE_HOME目录
cd $ORACLE_HOME
##执行安装程序开始安装，加上jar包防止弹窗不显示问题
./runInstaller -applyRU /soft/32545008/
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ebc9e77dc8574b1cb2014d57d21067be~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 可以看到，已经开始对 ORACLE_HOME 进行补丁安装！

补丁打完，进入安装界面，选择仅安装 Oracle 软件：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5bf81841385849dd8466a8557b765914~tplv-k3u1fbpfcp-zoom-1.image)

选择集群模式：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7677981e366a4f7a94031299b7f5bb2d~tplv-k3u1fbpfcp-zoom-1.image)

输入 oracle 用户密码，先执行 setup，再执行 test，开始互信：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b781949a403946b09a33903cc7d589f6~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10a60252bf23445b92855ed30e76ac7b~tplv-k3u1fbpfcp-zoom-1.image)

选择企业版：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4395c115120d4d9db8f24948f01e1995~tplv-k3u1fbpfcp-zoom-1.image)

默认即可：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6e59fa1fb3824b578cc79ef2b3f767ca~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e7a3c91471944be8858550fe087750e6~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0ffdea72f304250aa1a57db610a45cc~tplv-k3u1fbpfcp-zoom-1.image)

安装预检查，由于我们只配了一个 SCAN，所以关于 DNS 相关的都无视，继续：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/559404e78a9f4eb6a656cf18d2bc2b2e~tplv-k3u1fbpfcp-zoom-1.image)

开始安装：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/244a484af6ab4f1688a79c6260965df5~tplv-k3u1fbpfcp-zoom-1.image)

root 用户下，两个节点顺序执行 root.sh：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dfd62548f7ff4f56a2d7e4963249df51~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6399dea42a3a4ccea9c1a1fb934286ee~tplv-k3u1fbpfcp-zoom-1.image)

安装完成：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8b2dbad835d84e6cb4493903ff31d0aa~tplv-k3u1fbpfcp-zoom-1.image)

检查补丁版本：
```bash
su - oracle
opatch lspatches
sqlplus -version
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c94c058b7554bfebfba1a540f229fc5~tplv-k3u1fbpfcp-zoom-1.image)**<font color='orage'>至此，Oracle 软件已成功安装！</font>**

# 五、创建数据库实例
这里建库还是在第四步安装 Oracle 软件的 vnc 界面中继续：
```bash
dbca
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34f7114c855c46c89eaf611640330d94~tplv-k3u1fbpfcp-zoom-1.image)

选择创建数据库实例：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a85b634a14d8477a83dd798c9dadc081~tplv-k3u1fbpfcp-zoom-1.image)

选择自定义模式：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00c9e1f2c3a347909ec079eabdb349d1~tplv-k3u1fbpfcp-zoom-1.image)

选择基础安装即可：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7689c049e5894225b3a58567f500f729~tplv-k3u1fbpfcp-zoom-1.image)

选择节点：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33e53bdb42184c68a0c6287eb5379a45~tplv-k3u1fbpfcp-zoom-1.image)

填写实例名 p19c0，由于默认添加为1，2，实例名规划为 p19c01/02，所以需要加个0；选择安装 CDB 模式，不创建PDB：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6e84e03c0e6b4541bd7bd2cff8eb476e~tplv-k3u1fbpfcp-zoom-1.image)

默认即可，使用 OMF 模式：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ef9a0c8455e48a78f45a9b6e3dc1d1d~tplv-k3u1fbpfcp-zoom-1.image)

不开闪回，不开归档，可以建完实例后再配置：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e6ca6dacecd8403b9721c2697fc7568b~tplv-k3u1fbpfcp-zoom-1.image)

配置内存，使用 ASMM 模式，数据库总内存占用物理内存 70%-90% 之间：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3dd8abe5148042a2b8677d8937b9b012~tplv-k3u1fbpfcp-zoom-1.image)

使用基础模式安装，block_size 是无法修改的，process 进程数修改为1500，根据实际情况修改：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b4238c328a644ab4bd1a208fabe2a3df~tplv-k3u1fbpfcp-zoom-1.image)

配置数据库字符集，默认 AL32UTF8，国家字符集，默认 AL16UTF16；根据实际情况修改：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8642faf404447b8abedd8b6b01b72a1~tplv-k3u1fbpfcp-zoom-1.image)

建议全关掉，有可能导致 bug：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06c9813d84804be88f4401a7e0abadf5~tplv-k3u1fbpfcp-zoom-1.image)

填写sys/system密码：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/72391475a90f405c9a722429fe220cd8~tplv-k3u1fbpfcp-zoom-1.image)

默认即可：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d27ebebe72554927ac4d3d12d780a8e5~tplv-k3u1fbpfcp-zoom-1.image)

安装预检查，DNS 相关忽略：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0770abfdeb7b404b80f9ba8d9d7a0453~tplv-k3u1fbpfcp-zoom-1.image)

开始安装：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d4e1ea1b9db4355997b0dc1b254b0a6~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3bff8315ebe04b839925ae06b7872180~tplv-k3u1fbpfcp-zoom-1.image)

经过漫长的等待，数据库建完了：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84e6d92019094a15b7fab7cc9cdc7dce~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9440dd32c5474927974c3f34a463f1f5~tplv-k3u1fbpfcp-zoom-1.image)
**<font color='orage'>至此，数据库实例创建完成！</font>**

# 六、数据库优化配置（rac01）
## 1、开启数据库归档模式
关于开启归档模式，具体可参考文章：
>**[Oracle 开启归档模式](https://luciferliu.blog.csdn.net/article/details/120250918)**

```bash
##关闭数据库实例
srvctl stop database -d p19c0
##开启单个节点到mount模式
srvctl start instance -d p19c0 -i p19c01 -o mount
##开启归档
sqlplus / as sysdba
alter database archivelog;
##设置归档路径
ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=+DATA';
exit;
##重启数据库实例
srvctl stop instance -d p19c0 -i p19c01
srvctl start database -d p19c0
##检查归档
sqlplus / as sysdba
archive log list
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51f5be3a24ae46cfa0560608060e9cb9~tplv-k3u1fbpfcp-zoom-1.image)
## 2、配置定期删除归档计划任务
关于归档日志删除，具体可参考文章：
>**[Oracle RMAN删除归档日志脚本](https://luciferliu.blog.csdn.net/article/details/120319512)**

```bash
##进入oracle用户
su - oracle
mkdir -p /home/oracle/scripts/
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
chmod +x /home/oracle/scripts/del_arch.sh
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/09b139f8a9a64b4db41ab1db717b0e48~tplv-k3u1fbpfcp-zoom-1.image)
切换到 oracle 用户写入计划任务：
```bash
cat <<EOF>>/var/spool/cron/oracle
12 00 * * * /home/oracle/scripts/del_arch.sh
EOF
##手动执行测试
su - oracle
/home/oracle/scripts/del_arch.sh
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8d9b3036b0c04e3daf356ecab6a2f38e~tplv-k3u1fbpfcp-zoom-1.image)
## 3、配置数据库开机自启
配置数据库实例随集群服务自启动：
```bash
##root用户下执行
/u01/app/19.3.0/grid/bin/crsctl modify resource "ora.p19c0.db" -attr "AUTO_START=always" -unsupported
```
**注意：** `ora.p19c0.db`中的 p19c0 是指 db 名称；需要在 root 用户下执行！

**<font color='orage'>所有都配置完成之后，关闭数据库，重启主机！</font>**

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

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)