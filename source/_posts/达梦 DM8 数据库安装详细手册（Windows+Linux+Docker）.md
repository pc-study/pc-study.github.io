---
title: 达梦 DM8 数据库安装详细手册（Windows+Linux+Docker）
date: 2021-08-29 10:22:38
tags: [我和达梦的故事,达梦]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/103979
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 🌲 前言

对于常年占据国产数据库排行榜前三的 `达梦` 数据库，早已 "垂涎已久" (¯﹃¯)！

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-90f7291b-b25a-4a5f-8d5a-200bfa7d6af8.png)

正好趁着这次墨天轮和达梦合作举办的活动，可以入手好好研究一下！

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-4f42b684-5c6f-47e4-ab2c-3002bae2b325.png)

要想学习一门数据库技术，第一步当然是要安装数据库，然后才能学习使用它，顺便记录下作者的安装初体验！❤️

# 💬 介绍

达梦数据库管理系统(以下简称DM）是基于客户/服务器方式的数据库管理系统，可以安装在多种计算机操作系统平台上，典型的操作系统有：Windows(Windows2000/2003/XP/Vista/7/8/10/Server等)、Linux、HP-UNIX、Solaris、FreeBSD和AIX等。对于不同的系统平台，有不同的安装步骤。

**根据不同的应用需求与配置，DM提供了多种不同的产品系列：**

- 标准版Standard Edition
- 企业版Enterprise Edition
- 安全版Security Edition

相较于 Oracle 的全英文官方文档来说，达梦的官方文档就显得亲切多了，一眼看去就很喜欢！❤️

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-48b24e28-70ea-46c9-a2fd-60f9852748a3.png)

**作为一款热门的国产数据库，对于平台的支持必然是广泛的。下面👇🏻列出一些安装部署基础要求：**

|名称|要求|
|-|-|
|CPU|Intel Pentium4(建议Pentium 41.6G以上)处理器|
|内存|256M(建议512M以上)|
|硬盘|5G以上可用空间|
|网卡|10M以上支持TCP/IP协议的网卡|
|操作系统|Windows(简体中文服务器版sp2以上)/Linux(glibc2.3以上，内核2.6，已安装KDE/GNOME桌面环境，建议预先安装UnixODBC组件)|

# 💦 安装介质下载

## 🔥 达梦8安装包

达梦官方提供的最新版本为DM8，可以直接下载：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-975b7e73-7741-4ebc-b452-85032c2ea8c6.png)

**达梦8的数据库安装介质下载地址：**[https://eco.dameng.com/download](https://eco.dameng.com/download/)

## 💥 Centos7 box

Linux操作系统我选择的是 centos7，打算使用 vagrant 进行安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-27cab79a-2207-4f3c-b0b5-0c663682e4c5.png)

**centos7 box镜像下载地址：**[https://app.vagrantup.com/luciferliu/boxes/centos7.9](https://app.vagrantup.com/luciferliu/boxes/centos7.9)

**至此，安装介质都准备好了！**


# 🏆 Linux 下 DM 的安装

|操作系统|CPU|数据库|
|-|-|-|
|CentOS7|x86_64 架构|dm8_20210630_x86_rh6_64_ent|

## 🍭 Centos7 环境安装

### vagrant 启动 centos7

进入自定义目录启动主机：

```bash
mkdir -p /Volumes/DBA/dm8
cd /Volumes/DBA/dm8
## vagrant 初始化
vagrant init luciferliu/centos7.9
## vagrant 创建并启动主机
vagrant up
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-a2431686-bc31-49c9-8352-ff2e8303056f.png)

如上图所示，Centos7.9 的主机就已经启动了，下面我们连接并且上传 DM8 安装包。

### 上传安装介质

将 DM8 安装包拷贝到当前 `/Volumes/DBA/dm8` 目录下，使用 `vagrant ssh` 连接主机：

```bash
## 拷贝 DM 安装包
cd /Volumes/DBA/dm8
cp /Users/lpc/Downloads/dm8_20210630_x86_rh6_64_ent.zip .
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-ccb1fe54-406d-4798-b04d-f7c9ceba7701.png)

### 初始化配置
```bash
## 连接主机
vagrant ssh
## 修改 root 用户密码，密码为 dm
echo dm | sudo passwd --stdin root
## 切换至 root 用户
su - root
## 修改主机名
hostnamectl set-hostname dm8 && exec bash
## 配置时区
timedatectl set-timezone Asia/Shanghai
## 配置系统中文
echo 'export LANG=zh_CN.UTF-8' >> /etc/profile
## 创建 DM 软件包目录
mkdir /soft
## 拷贝 DM 安装包至软件包目录
cp /vagrant/dm8_20210630_x86_rh6_64_ent.zip /soft
## 安装 unzip 和 lsb_release
yum install -y unzip lsb*
## 解压 DM 安装包
cd /soft
unzip dm8_20210630_x86_rh6_64_ent.zip
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-ebf5aa1d-fa41-4244-98a8-c69ac1fea93f.png)

如上图所示，DM8 安装包已解压至至主机 `/soft` 目录下。

## 🍰 安装前准备

用户在安装DM之前需要检查或修改操作系统的配置，以保证 DM 正确安装和运行。

### 检查Linux(Unix)系统信息

```bash
## 获取系统位数
getconf LONG_BIT
## 查询操作系统release信息
lsb_release -a
## 查询系统信息
cat /etc/issue
## 查询系统名称
uname -a
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-115f60d6-7211-4253-8028-22a09a022cb4.png)

### 创建安装用户

为了减少对操作系统的影响，用户不应该以root系统用户来安装和运行DM。用户可以在安装之前为DM创建一个专用的系统用户。

```bash
## 创建 dinstall 组
groupadd -g 12349 dinstall
## 创建 dmdba 用户
useradd -u 12345 -g dinstall -m -d /home/dmdba -s /bin/bash dmdba
## 修改 dmdba 用户密码
echo dmdba | passwd --stdin dmdba
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-bcc6718c-0b50-4473-a871-43177520adb4.png)

### 创建安装目录及授权

```bash
mkdir /dm
mkdir -p /dm{arch,bak,data}
chown -R dmdba.dinstall /dm /soft /dmdata /dmarch /dmbak
chmod -R 775 /dm{arch,bak,data} /dm
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-813fb33b-aee5-4acd-8fb8-2a5d92048b16.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-6baf76a5-d6ac-490a-93b1-648b3a9d8634.png)

### 关闭防火墙和Selinux

```bash
## 关闭防火墙
systemctl stop firewalld.service
systemctl disable firewalld.service
## 关闭selinux
setenforce 0
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-ff07d959-ca1d-46c1-9feb-4ef1de3c7b80.png)

### 关闭透明大页和numa

**Linux6：**
```bash
cat >>/etc/rc.d/rc.local <<EOF
if test -f /sys/kernel/mm/transparent_hugepage/enabled; then
echo never > /sys/kernel/mm/transparent_hugepage/enabled
fi
if test -f /sys/kernel/mm/transparent_hugepage/defrag; then
echo never > /sys/kernel/mm/transparent_hugepage/defrag
fi
```

**Linux7：**
```bash
sed -i 's/quiet/quiet transparent_hugepage=never numa=off/' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-e8dbed78-bbe1-47e0-86fa-b6ab2be6385b.png)

### 配置系统参数
```bash
cat <<EOF >>/etc/sysctl.conf
fs.aio-max-nr = 1048576
fs.file-max = 6815744
#kernel.shmall = 2097152
#kernel.shmmax = 536870912
kernel.shmmni = 4096
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 1048576
vm.swappiness = 0
vm.dirty_background_ratio = 3
vm.dirty_ratio = 80
vm.dirty_expire_centisecs = 500
vm.dirty_writeback_centisecs = 100
EOF
## 激活参数配置
sysctl -p
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-13d13deb-cb38-4d7a-abdd-9cced71e5e28.png)

### 配置操作系统限制

在Linux(Unix)系统中，因为ulimit命令的存在，会对程序使用操作系统资源进行限制。为了使DM能够正常运行，建议用户检查当前安装用户的ulimit参数。

```bash
## 配置pam.d
cat <<EOF >>/etc/pam.d/login
session required pam_limits.so 
session required /lib64/security/pam_limits.so
EOF
## 查看 pam.d
cat /etc/pam.d/login | grep -v "^$" | grep -v "^#"
## 查看操作系统资源限制
ulimit -a
## 解除 nice，as fsize，nproc，nofile，core，data 限制
cat <<EOF>>/etc/security/limits.conf
dmdba - nice   0     
dmdba - as     unlimited
dmdba - fsize  unlimited
dmdba - nproc  131072
dmdba - nofile 131072
dmdba - core   unlimited
dmdba - data   unlimited
root  - nice   0     
root  - as     unlimited
root  - fsize  unlimited
root  - nproc  131072
root  - nofile 131072
root  - core   unlimited
root  - data   unlimited
EOF
## 检查配置文件
cat /etc/security/limits.conf | grep -v "^$" | grep -v "^#"
## 查看 dmdba 用户的资源限制
su - dmdba -c "ulimit -a"
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-358a0ae2-7977-42e5-a2c2-cafbcf08f1e2.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-9be05e57-8b38-438d-a2d5-5bce58c0ac71.png)

### 检查系统内存

为了保证DM的正确安装和运行，要尽量保证操作系统至少1GB的可用内存(RAM)。如果可用内存过少，可能导致DM安装或启动失败。

```bash
## 获取内存总大小
grep MemTotal /proc/meminfo
## 获取交换分区大小
grep SwapTotal /proc/meminfo
## 获取内存使用详情
free -m
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-44bb2493-9b91-43e2-a89c-beb19b6ee6bf.png)

### 检查存储空间

DM完全安装需要1GB的存储空间，用户需要提前规划好安装目录，预留足够的存储空间。用户在DM安装前也应该为数据库实例预留足够的存储空间，规划好数据路径和备份路径。

```bash
## 查询目录 /dm 可用空间
df -h /dm
## /tmp目录保证1GB的存储空间
df -h /tmp
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-12620f71-0b63-42fd-a348-1f6d071fe021.png)

### 配置环境变量

```bash
## 配置 dmdba 环境变量
cat <<EOF>>/home/dmdba/.bash_profile
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export DM_HOME="/dm"
export LD_LIBRARY_PATH="\$LD_LIBRARY_PATH:\$DM_HOME/bin"
export PATH=/usr/sbin:\$PATH
export PATH=\$DM_HOME/bin:\$PATH
export PS1="[\`whoami\`@\`hostname\`:"'\$PWD]\$ '
alias ds='disql sysdba'
EOF
## 查看环境变量
cat /home/dmdba/.bash_profile | grep -v "^$" | grep -v "^#"
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-96b3fc29-c777-411c-8da1-097832c24cdc.png)

## 🍯 安装 DM8 数据库

安装同时支持图形化安装，命令行安装，静默安装三种方式。由于我没有安装图形化界面，因此使用 `命令行安装` 方式进行安装。

用户应登录或切换到安装系统用户，进行以下安装步骤的操作(注：不建议使用root系统用户进行安装)。

### 挂载 DM ISO 镜像

官网下载的 DM8 安装包解压下来是一个 ISO 镜像文件，因此需要挂载取出安装文件，才能开始安装。

```bash
## 挂载 DM iso 镜像文件
cd /soft/dm8_20210630_x86_rh6_64_ent
mount -o loop dm8_20210630_x86_rh6_64_ent_8.1.2.18_pack7.iso /opt
## 拷贝安装文件至 /soft
cp /opt/DM* /soft
## 取消挂载
umount /opt
## 目录授权
chown -R dmdba:dinstall /soft
chmod -R 775 /soft
ll /soft
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-9d3e9b99-918c-45b8-b0c0-43a0d463846c.png)

### 命令行安装

**1、执行安装命令：**

```bash
## 切换至 dmdba 用户
su - dmdba
cd /soft/
## 执行命令行安装
./DMInstall.bin -i
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-8a4313fe-8713-422a-8445-5084f59e4e4c.png)

**2、按需求选择安装语言，默认为中文。本地安装选择【不输入 Key 文件】，选择【默认时区 21】。**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-6491f759-fe6c-4648-82b0-86a35b96113a.png)

**3、选择【1-典型安装】，按已规划的安装目录 /dm 完成数据库软件安装，不建议使用默认安装目录。**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-1cc86dfd-7af0-42c4-a863-0e523b0b0758.png)

**4、root 用户执行 root 脚本：**

```bash
su - root
/dm/script/root/root_installer.sh
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-9d60162e-bd90-474e-a750-ecf6e34cc796.png)

### 命令行配置实例

使用 dmdba 用户配置实例，使用 dminit 命令初始化实例。

```bash
su - dmdba
## 使用默认参数初始化实例，需要附加实例存放路径 /dmdata
dminit path=/dmdata
```

**📢 注意：dminit 命令可设置多种参数，可执行如下命令查看可配置参数。**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-5d9c10a7-8b35-403f-8d28-0a2c23baac80.png)

需要注意的是 **页大小 (PAGE_SIZE)、簇大小 (EXTENT_SIZE)、大小写敏感 (CASE_SENSITIVE)、字符集 (CHARSET/UNICODE_FLAG)、VARCHAR类型长度（LENGTH_IN_CHAR）** 这几个参数，一旦确定无法修改，需谨慎设置。

- EXTENT_SIZE 数据文件使用的簇大小(16)，可选值：16, 32, 64，单位：页，缺省使用 16 页。指数据文件使用的簇大小，即每次分配新的段空间时连续的页数。
- PAGE_SIZE 数据页大小(8)，可选值：4, 8, 16, 32，单位：K，选择的页大小越大，则 DM 支持的元组长度也越大，但同时空间利用率可能下降，缺省使用 8 KB。
- CASE_SENSITIVE 大小敏感(Y)，可选值：Y/N，1/0，默认值为 Y 。当大小写敏感时，小写的标识符应用双引号括起，否则被转换为大写；当大小写不敏感时，系统不自动转换标识符的大小写，在标识符比较时也不区分大小写，只能是 Y、y、N、n、1、0 之一。
- CHARSET/UNICODE_FLAG 字符集(0)，可选值：0[GB18030]，1[UTF-8]，2[EUC-KR]；1 代表 UTF-8；2 代表韩文字符集 EUC-KR；取值 0、1 或 2 之一。默认值为 0。
- LENGTH_IN_CHAR VARCHAR类型长度是否以字符为单位(N)，可选值：Y/N，1/0。

以下命令设置页大小为 32 KB，簇大小为 32 KB，大小写敏感，字符集为 utf_8，数据库名为 DMDB，实例名为 LUCIFER，端口为 5237。

```bash
dminit path=/dmdata PAGE_SIZE=32 EXTENT_SIZE=32 CASE_SENSITIVE=y CHARSET=1 DB_NAME=DMDB INSTANCE_NAME=LUCIFER
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-7a1f0c74-2498-4ccc-8d05-c71fd3c5d48d.png)

### 命令行注册服务

注册服务需使用 root 用户进行注册。使用 root 用户进入数据库安装目录的 /script/root 下，如下所示：

```bash
cd /dm/script/root
## 注册服务
./dm_service_installer.sh -t dmserver -dm_ini /dmdata/DMDB/dm.ini -p DMSERVER
## 配置服务开机自启
systemctl enable DmServiceDMSERVER.service
## 开启服务
systemctl start DmServiceDMSERVER.service
## 查看服务状态
systemctl status DmServiceDMSERVER.service
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-ad08373d-137b-4a5b-9959-ee3735d6df61.png)

### 命令行启停数据库

服务注册成功后，启停数据库，如下所示：

```bash
cd /dm8/bin
## 查看当前数据库服务状态
systemctl status DmServiceDMSERVER.service
## 关闭数据库
systemctl stop DmServiceDMSERVER.service
## 打开数据库
systemctl start DmServiceDMSERVER.service
或者
dmserver /dmdata/DMDB/dm.ini
## 重启数据库
systemctl restart DmServiceDMSERVER.service
```
也可以通过以下命令执行：
```bash
DmServiceDMSERVER start/stop/restart/status
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-a613ce89-b7dd-4349-ad3c-c038d5608b84.png)

### 连接访问数据库

```bash
disql sysdba
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-c4c3382e-a76e-4bbf-8935-2ffcc288860b.png)

# 🥈 Docker 下 DM 的安装

## 🏈 安装前准备

|软硬件|版本|
|-|-|
|终端|X86-64 架构|
|Docker|19.0 及以上版本|
			
## 🏀 下载 Docker 安装包

```bash
## 在根目录下创建 /dm8 文件夹，用来放置下载的 Docker 安装包。命令如下：
mkdir -p /Volumes/DBA/dm8
## 切换到 /dm8 目录，下载 DM Docker 安装包。命令如下：
cd /Volumes/DBA/dm8
wget -O dm8_docker.tar -c https://download.dameng.com/eco/dm8/dm8_docker.tar
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-922051ea-e5a1-44db-bec6-7a4db519f0e1.png)

## ⚽️ 导入镜像

下载完成后，导入安装包，打开 docker ，使用如下命令：

```bash
docker import dm8_docker.tar dm8:v01
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-fae4a4d1-530e-4466-88f8-dcdb724e193e.png)

导入完成后，可以使用 docker images 来查看导入的镜像，命令如下：

```bash
docker images
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-197cb537-8a1c-46ea-8a52-24ec1119ff4f.png)

查看结果如下：

## ⚾️ 启动容器

镜像导入后，使用 docker run 来启动容器，默认的端口 5236 默认的账号密码 ，启动命令如下：

```bash
docker run -itd -p 5236:5236 --name dm8_01 dm8:v01 /bin/bash /startDm.sh
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-5aef5c10-0b00-46b3-83c8-3c2cdef5e996.png)

容器启动完成后，使用 docker ps 来查看镜像的启动情况，命令如下：

```bash
docker ps
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-b1d863b7-c96b-4da1-bcca-3444dafaee3d.png)

启动完成后，可以查看日志来查看启动情况，命令如下：

```bash
docker logs -f dm8_01
```
显示内容如下，则表示启动成功。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-7d80f296-cb15-4db6-9554-193472b6f76a.png)

## 🎾 数据库启停

命令如下：

```bash
docker stop/start/restart dm8_01
```

## 🎱 连接 docker

```bash
## 获取容器 ID
docker ps
## 连接容器
docker exec -it acd3a2211b52 /bin/bash
## 切换 dmdba 用户
su - dmdba
## 连接数据库
cd /dm8/bin
./disql
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-3e7845c6-af16-4e46-983f-66febea1cd69.png)

**📢 注意：如果使用docker容器里面的 disql ,进入容器后，先执行 source /etc/profile 防止中文乱码。**

# 🏅 Windows 下 DM 的安装

## 🍎 安装前准备

### 检查系统信息

用户在安装 DM 数据库前，需要检查当前操作系统的相关信息，确认 DM 数据库安装程序与当前操作系统匹配，以保证 DM 数据库能够正确安装和运行。

用户可以在终端通过 Win+R 打开运行窗口，输入 cmd，打开命令行工具，输入 `systeminfo` 命令进行查询，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-497c7b9a-2ebf-45c7-9735-5f30be276919.png)

### 检查系统内存

为了保证 DM 数据库的正确安装和运行，要尽量保证操作系统至少 1 GB 以上的可用内存 (RAM)。如果可用内存过少，可能导致 DM 数据库安装或启动失败。

用户可以通过【任务管理器】查看可用内存，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-39208a0c-f8e2-4a09-9c19-ec8103938b41.png)

### 检查存储空间

DM 完全安装需要至少 1 GB 以上的存储空间，用户需要提前规划好安装目录，预留足够的存储空间。

用户在 DM 安装前也应该为数据库实例预留足够的存储空间，规划好数据路径和备份路径。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-0ec057ac-50af-4652-aedd-c007fe85eda1.png)

## 🍉 安装 DM8 数据库

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-366e46e8-950f-47bb-abab-d3f32b051c4c.png)

上传安装包，解压挂载，复制出安装文件，开始安装!

### 选择语言与时区

双击运行【setup.exe】安装程序，请根据系统配置选择相应语言与时区，点击【确定】按钮继续安装。如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-1c9ea81b-eb85-4908-9ef0-f5edab8a75e8.png)

### 安装向导

点击【下一步】按钮继续安装，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-e0669594-6d4b-4a37-9181-c5ecbdffe029.png)

### 许可证协议

在安装和使用 DM 数据库之前，需要用户阅读并接受许可证协议，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-51ce0cb3-3545-4e48-ad5d-e883c2042b69.png)

### 查看版本信息

用户可以查看 DM 服务器、客户端等各组件相应的版本信息。

验证 Key 文件环节可跳过，如果没有 Key 文件，点击【下一步】即可。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-442ea093-9656-49ad-a912-9f567e253f88.png)

### 选择安装组件

DM 安装程序提供四种安装方式：“典型安装”、“服务器安装”、“客户端安装”和“自定义安装”，此处建议选择【典型安装】，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-b801169c-7d05-45a7-a21c-b91806ef9b2a.png)

- 典型安装包括：服务器、客户端、驱动、用户手册、数据库服务。
- 服务器安装包括：服务器、驱动、用户手册、数据库服务。
- 客户端安装包括：客户端、驱动、用户手册。
- 自定义安装包括：用户根据需求勾选组件，可以是服务器、客户端、驱动、用户手册、数据库服务中的任意组合。

### 选择安装目录

DM 默认安装在 C:\dmdbms 目录下，不建议使用默认目录，改为其他任意盘符即可，以 E:\dmdbs 为例，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-dcf1c350-a625-4590-b294-564b2c46057d.png)

这里我只有一个 C 盘，因此直接默认安装！

**📢 注意：安装路径里的目录名由英文字母、数字和下划线等组成，不建议使用包含空格和中文字符的路径等。**

### 安装前小结

显示用户即将进行的数据库安装信息，例如产品名称、版本信息、安装类型、安装目录、可用空间、可用内存等信息，用户检查无误后点击【安装】按钮进行 DM 数据库的安装，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-20d37d86-bae4-4e65-8005-90f2fd098ecd.png)

### 数据库安装

安装过程需耐心等待 1~2 分钟，如下图所示：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210829-e38c4e5b-9bcb-402a-8746-6a48793ee7bf.png)

### 数据库安装完成

数据库安装完成后，请选择【初始化】数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-1698696b-8c05-4e4c-86f8-9804aba86f73.png)

## 🍏 配置实例

### 选择操作方式

此处建议选择【创建数据库实例】，点击【开始】进入下一步骤，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-accd9078-a0e5-42e2-a3a7-80bd8f7c5c3d.png)

### 创建数据库模板

此处建议选择【一般用途】即可，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-a0607ca0-e655-4ba1-a6bb-d7b17f888ee6.png)

### 选择数据库目录

本例中数据库安装路径为 C:\dmdbs，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-aa2cc88b-92ef-44b5-8757-a2f802321f28.png)

### 输入数据库标识

输入数据库名称、实例名、端口号等参数，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-b739f5ab-7990-4538-8dfb-2bb9d0ced95f.png)

### 数据库文件所在位置

此处选择默认配置即可，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-fbd29f2b-f40f-4c49-a61e-e8f91b80754b.png)

用户可通过选择或输入确定数据库控制、数据库日志等文件的所在位置，并可通过右侧功能按钮，对文件进行添加或删除。

### 数据库初始化参数

此处选择默认配置即可，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-f15f9b9c-060c-4223-9373-6539b6f6c89e.png)

用户可输入数据库相关参数，如簇大小、页大小、日志文件大小、选择字符集、是否大小写敏感等。

**常见参数说明：**
- EXTENT_SIZE 数据文件使用的簇大小 (16)，可选值： 16、 32、 64，单位：页
- PAGE_SIZE 数据页大小 (8)，可选值： 4、 8、 16、 32，单位： KB
- LOG_SIZE 日志文件大小 (256)，单位为： MB，范围为： 64 MB~2 GB
- CASE_SENSITIVE 大小敏感 (Y)，可选值： Y/N， 1/0
- CHARSET/UNICODE_FLAG 字符集 (0)，可选值： 0[GB18030]， 1[UTF-8]， 2[EUC-KR]

### 口令管理

此处选择默认配置即可，默认口令与登录名一致，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-0656372a-4542-434b-a887-98667fc4d9a9.png)

用户可输入 SYSDBA，SYSAUDITOR 的密码，对默认口令进行更改，如果安装版本为安全版，将会增加 SYSSSO 用户的密码修改。

### 选择创建示例库

此处建议勾选创建示例库 BOOKSHOP 或 DMHR，作为测试环境，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-aa936baa-f12c-4b6f-9da1-8e26a24d9871.png)

### 创建数据库摘要

在安装数据库之前，将显示用户通过数据库配置工具设置的相关参数。点击【完成】进行数据库实例的初始化工作，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-d84c1fad-78da-4848-8a16-62cda6be4478.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-b0845554-b92a-4288-9bb8-15d0c3f16a52.png)

### 安装完成

安装完成后将弹出数据库相关参数及文件位置。点击【完成】即可，如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-2cd49f71-ca95-4f35-8383-b6798c2dc3b9.png)

### 数据库启停

数据库安装路径下 tool 目录，双击运行 dmservice.exe 程序可以查看到对应服务，选择【启动】或【停止】服务。如下图所示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-c3892f0f-0318-45b5-9ff8-e18d8290b266.png)

当然，也可以通过 cmd 命令行进行启动：

```bash
cd C:\dmdbms\bin
dmserver.exe C:\dmdbms\data\DAMENG\dm.ini
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210829-119738a8-9d56-415d-87b6-c00336a2b8bc.png)

# 🎯 写在最后

达梦8 数据库安装总体来说，还算简单。但是有一说一，官方文档确实比较简单，不够细致，有待改进！


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