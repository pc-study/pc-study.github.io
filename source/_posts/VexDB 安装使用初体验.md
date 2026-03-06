---
title: VexDB 安装使用初体验
date: 2025-09-25 09:37:22
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1970732897644589056
---

# 前言
最近数据库领域出现了一个值得关注的新成员：[**VexDB**](https://vexdb.com/ "**VexDB**")，一款专为 AI 场景设计的向量数据库。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971026396445159424_395407.png)

VexDB 这个名字其实挺有意思的，取自 `Vector（向量） + X（代表多模态数据的无限可能） + Database（数据库）`。

VexDB 目前分为两个版本：
- **开发版**：适合应用开发商、个人开发者和开源项目使用的免费向量数据库，1年使用期限，社群支持；
- **商业版**： 面向企业级AI应用场景的商业向量数据库，SLA服务保障，专业技术支持服务；

本文演示 VexDB 开发版的安装与简单使用，安装包下载地址：[https://vexdb.com/download](https://vexdb.com/download)。

# 安装前准备
## 环境信息
本文演示环境配置如下：

|主机名|CPU|内存|磁盘|主机版本|VexDB版本|
|--|--|--|--|--|--|
|VexDB|8|16G|100G|Centos7.9|3.0|

以上仅为开发与测试环境的配置，生产环境请参考官方推荐配置进行部署。

## 关闭防火墙
数据库安装一般都建议关闭防火墙，VexDB 也不例外：
```bash
[root@VexDB ~]# systemctl stop firewalld
[root@VexDB ~]# systemctl disable firewalld
[root@VexDB ~]# systemctl status firewalld
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970738038657527808_395407.png)

## 关闭 selinux
建议关闭 SELNUX，防止造成一些不必要的问题：
```bash
## 这里使用 setenforce 0 临时生效
[root@VexDB ~]# /usr/sbin/setenforce 0
[root@VexDB ~]# sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
[root@VexDB ~]# sestatus
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
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970746138030518272_395407.png)

可以看到 `Mode from config file` 是 disabled，代表已经禁用 selinux。

## 检查时区
数据库默认时区为中国时区，如果操作系统时区和数据库默认时区不一致，会导致数据库日志显示时间和实际时间不一致。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970744505317994496_395407.png)

## 依赖包安装
和 Oracle 一样，VexDB 数据库在安装过程中也需要用到依赖包：
```bash
yum install -y zlib-devel libaio libuuid readline-devel krb5-libs libicu libxslt tcl perl openldap pam openssl-devel libxml2 bzip2
```
当然前提是要配置本地软件源：
```bash
## 备份系统初始配置文件
mkdir -p /etc/yum.repos.d/bak
mv /etc/yum.repos.d/* /etc/yum.repos.d/bak
## 一键配置软件源，默认 ISO 安装镜像挂载在 /mnt 目录下
cat<<-EOF>/etc/yum.repos.d/local.repo
[server]
name=server
baseurl=file:///mnt
enabled=1
gpgcheck=0
EOF
## 查看配置好的软件源
cat /etc/yum.repos.d/local.repo
```
配置完软件源之后，直接执行依赖包安装即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970737668870909952_395407.png)

确保依赖包都已经成功安装。

## 配置 RemoveIPC
`systemd-logind` 服务中引入的一个特性 RemoveIPC，会造成程序信号丢失等问题，只有Redhat7 及以上和一些特殊的国产Linux的版本需要修改，改之前可先查看此项是否为默认yes)，需要设置 RemoveIPC=no：
```bash
[root@VexDB ~]# sed -i 's/#RemoveIPC=no/RemoveIPC=no/' /etc/systemd/logind.conf
[root@VexDB ~]# grep RemoveIPC /etc/systemd/logind.conf
RemoveIPC=no
```
配置 `/usr/lib/systemd/system/systemd-logind.service` 文件：
```bash
[root@VexDB ~]# vi /usr/lib/systemd/system/systemd-logind.service

## 在 [Service] 最后加上 RemoveIPC=no
```
重新加载 systemd 守护进程并重启 systemd-logind 服务生效：
```bash
[root@VexDB ~]# systemctl daemon-reload
[root@VexDB ~]# systemctl restart systemd-logind
```
修改后检查是否生效：
```bash
[root@VexDB ~]# loginctl show-session | grep RemoveIPC
[root@VexDB ~]# systemctl show systemd-logind | grep RemoveIPC
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970746296390660096_395407.png)

由于 CentOS 操作系统环境的 RemoveIPC 默认为关闭，则执行如下语句是无返回结果的。

## 关闭透明大页
透明大页可能会对数据库性能产生负面影响，建议关闭透明大页：
```bash
[root@VexDB ~]# cat /sys/kernel/mm/transparent_hugepage/enabled
[always] madvise never
```
显示结果：
- [always] madvise never：透明大页已开启。
- always [madvise] never：透明大页已开启。
- always madvise [never]：透明大页已关闭。

修改 /etc/default/grub 文件，在 GRUB_CMDLINE_LINUX 中添加或修改参数 transparent_hugepage=never：
```bash
[root@VexDB ~]# sed -i 's/quiet/quiet transparent_hugepage=never/' /etc/default/grub
```
通过以下指令检查当前系统的引导类型：
```bash
[root@VexDB ~]# [ -d /sys/firmware/efi ] && echo UEFI || echo BIOS
BIOS
```
两种引导的启动文件路径分别为：
- BIOS：/boot/grub2/grub.cfg
- UEFI：/boot/efi/EFI/\<distro_name>/grub.cfg，distro_name 为系统发行版本名称，例如 ubuntu、fedora、debian 等。

执行 grub2–mkconfig 指令重新配置 grub.cfg：
```bash
## BIOS 引导
# grub2-mkconfig -o /boot/grub2/grub.cfg
## UEFI 引导
# grub2-mkconfig -o /boot/efi/EFI/<distro_name>/grub.cfg

[root@VexDB ~]# grub2-mkconfig -o /boot/grub2/grub.cfg
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-3.10.0-1160.el7.x86_64
Found initrd image: /boot/initramfs-3.10.0-1160.el7.x86_64.img
Found linux image: /boot/vmlinuz-0-rescue-a87a758e2a72491d9ef6b8acd97e55fb
Found initrd image: /boot/initramfs-0-rescue-a87a758e2a72491d9ef6b8acd97e55fb.img
done
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970744233749393408_395407.png)

重启操作系统，使配置永久生效：
```bash
[root@VexDB ~]# reboot
```
验证透明大页已关闭：
```bash
[root@VexDB ~]# cat /sys/kernel/mm/transparent_hugepage/enabled
always madvise [never]
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970754822789935104_395407.png)

结果应显示 always madvise [never]。

## 内核参数配置
编译内核参数配置文件/etc/sysctl.conf，将内核信息写入文件末尾：
```bash
# 物理内存（KB）
os_memory_total=$(awk '/MemTotal/{print $2}' /proc/meminfo)
# 获取系统页面大小，用于计算内存总量
pagesize=$(getconf PAGE_SIZE)
((shmall = (os_memory_total - 1) * 1024 / pagesize))
((shmmax = os_memory_total * 1024 - 10))
# 如果 shmall 小于 2097152，则将其设为 2097152
((shmall < 2097152)) && shmall=2097152
# 如果 shmmax 小于 4294967295，则将其设为 4294967295
((shmmax < 4294967295)) && shmmax=4294967295
```
复制以上命令，直接执行即可计算得出这两个参数值：
```bash
[root@VexDB ~]# echo $shmall
4107692
[root@VexDB ~]# echo $shmmax
16825110518
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970747153484099584_395407.png)

根据官方建议值，配置系统参数文件：
```bash
[root@VexDB ~]# cat<<-\EOF>>/etc/sysctl.conf
fs.aio-max-nr=1048576
fs.file-max= 76724600
kernel.sem = 250 32000 100 128
kernel.shmall = 4107692
kernel.shmmax = 16825110518
kernel.shmmni = 4096
net.core.netdev_max_backlog = 10000
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 4194304
net.core.somaxconn = 4096
net.ipv4.tcp_fin_timeout = 5
vm.dirty_background_bytes = 409600000 
vm.dirty_expire_centisecs = 3000
vm.dirty_ratio = 80
vm.dirty_writeback_centisecs = 50
vm.overcommit_memory = 0
vm.swappiness = 0
net.ipv4.ip_local_port_range = 40000 65535
fs.nr_open = 20480000
EOF

## 生效配置
[root@VexDB ~]# sysctl -p
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970750359266144256_395407.png)

这里有个问题，就是官方文档中描述的两个参数：
- kernel.sem = 4096 2097152000 4096 512000
- kernel.shmmin = 819200

这个不适用于小内存的测试开发环境，直接照抄设置会报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970750158048604160_395407.png)

建议修改为以上我的配置即可。

## 修改资源限制
将部分资源限制值（使用 `ulimit -a` 可查看所有的资源限制值）调整为推荐值或以上。
```bash
cat<<-EOF>>/etc/security/limits.conf
vexdb soft nproc unlimited
vexdb hard nproc unlimited
vexdb soft stack unlimited
vexdb hard stack unlimited
vexdb soft core unlimited
vexdb hard core unlimited
vexdb soft memlock unlimited
vexdb hard memlock unlimited
vexdb soft nofile 1024000
vexdb hard nofile 1024000
EOF
```

## 创建用户
创建 vexdb 用户：
```bash
[root@vexdb ~]# useradd -d /home/vexdb -m vexdb
[root@vexdb ~]# echo "vexdb:vexdb" | chpasswd
[root@vexdb ~]# id vexdb
uid=1001(vexdb ) gid=1001(vexdb) groups=1001(vexdb)
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970751512242565120_395407.png)

## 创建目录
创建安装所需目录并且授权：
```bash
[root@VexDB ~]# mkdir -p /vexdbdata/db_coredump /vexdbdata/vexdb /vexdbdata/soft
[root@VexDB ~]# chmod -R 770 /vexdbdata
[root@VexDB ~]# chown -R vexdb:vexdb /vexdbdata
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970752812799766528_395407.png)

## 解压安装包
创建 /soft 目录存放安装包：
```bash
[root@vexdb ~]# mkdir /soft
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970752742339653632_395407.png)

授予 vexdb 用户权限，解压安装包：
```bash
[root@VexDB soft]# chown -R vexdb:vexdb /soft
[root@VexDB soft]# chmod -R 775 /soft/
[root@VexDB soft]# su - vexdb
[vexdb@VexDB ~]$ cd /soft/
[vexdb@VexDB soft]$ tar -xf VexDB-Developer-Edition-3.0_Build0_28146-Linux-x86_64-no_mot-202509011854.tar.gz
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970753289494999040_395407.png)

# VexDB 安装
## 交互安装
执行交互安装：
```bash
cd /soft/vexdb-installer
./vexdb_installer
```

安装详细过程如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970755213137031168_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970755282787643392_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970755363779653632_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970755477067804672_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970755689832263680_395407.png)

密码：VexDB123456.

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970756063825768448_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970756222374653952_395407.png)

这里需要注意一点：如果用自定义路径，一定要用二级目录，一级目录 vexdb 用户会没有权限创建目录！

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970768222307758080_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970758903579291648_395407.png)

比如我的自定义路径是：/vexdbdata/soft 和 /vexdbdata/vexdb

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970776058437840896_395407.png)

初始化阶段：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970776182316609536_395407.png)

安装数据库过程会生成随机口令作为管理员初始口令：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970776730407284736_395407.png)

选择是否添加许可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970776791203721216_395407.png)

初始化环境变量：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970777597038571520_395407.png)

安装完成。

## 静默安装
官方文档没有展示静默安装的相关内容，但是参考 vastbase G100 的静默文件，稍作修改，一样适用。

创建静默安装文件：
```bash
[vexdb@VexDB ~]$ cat<<-EOF>/soft/vexdb-installer/db_install.rsp
vexdb_password=VexDB123456.
encryption_key=VexDB123456.
vexdb_home=/vexdbdata/soft
vexdb_data=/vexdbdata/vexdb
port=5432
max_connections=500
shared_buffers=4011
db_compatibility=A
isinitdb=true
EOF
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971010579393425408_395407.png)

执行静默安装：
```bash
[vexdb@VexDB vexdb-installer]$ ./vexdb_installer --silent -responseFile /soft/vexdb-installer/db_install.rsp
```

安装过程如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970768968717709312_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970769167301226496_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970769242450571264_395407.png)

安装完成。

# VexDB 启停
刚安装完成的 VexDB 默认是关闭状态，需要手动开启：
```bash
[vexdb@VexDB ~]$ vb_ctl start
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971010970910732288_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971011114326568960_395407.png)

启动过程中的一些警告和配置问题可以忽略，VexDB 已经成功启动。

对应还有一些常用命令：
```bash
[vexdb@VexDB ~]$ vb_ctl stop
[vexdb@VexDB ~]$ vb_ctl status
[vexdb@VexDB ~]$ vb_ctl restart
```
更多功能可以通过 `vb_ctl --help` 查阅。

# 连接使用
`vsql` 是 VexDB 提供的客户端连接工具，在数据库主机进行连接：
```bash
[vexdb@VexDB ~]$ vsql -d postgres -p 5432
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971021170216546304_395407.png)

创建用户和数据库：
```sql
CREATE USER lpc PASSWORD "VexDB@123";
CREATE DATABASE lucifer OWNER lpc TEMPLATE template0;
\l
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971023118034546688_395407.png)

创建表：
```sql
\c lucifer lpc
CREATE SCHEMA lpc;
CREATE TABLE lpc.customer
(
c_customer_sk integer not null,
c_customer_id char(6) not null,
c_first_name varchar(20) ,
c_last_name varchar(20) , 
c_country varchar(20)
);

\dt
\d lpc.customer
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250925-1971024604026122240_395407.png)

更多详细的使用请参考官方文档。

# VexDB 卸载
VexDB 卸载比较简单，直接使用 `--uninstall` 选项即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970769499662069760_395407.png)

卸载完成后，需要手动删除安装文件和数据文件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250924-1970769881524088832_395407.png)

卸载完成。

# 写在最后
本文仅是简单的 VexDB 安装部署，没有涉及到具体的应用场景，后续有机会再进行探索。

