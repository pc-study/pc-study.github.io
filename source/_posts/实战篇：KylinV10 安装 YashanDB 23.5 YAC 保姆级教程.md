---
title: 实战篇：KylinV10 安装 YashanDB 23.5 YAC 保姆级教程
date: 2025-11-26 11:10:02
tags: [墨力计划,yashandb体验官,yashandb,崖山数据库]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1991407415469350912
---

> 大家好，这里是公众号 **DBA 学习之路**，分享一些学习国产数据库路上的知识和经验。

@[TOC](目录)

# 前言

本周三崖山数据库 v23.5 版本正式发布了！这次最值得关注的就是全新的共享集群版本，新版本带来了不少实用功能：

1. 共享集群全库闪回；
2. **共享集群 SACN 与 VIP**；
3. 应用的实例亲和性及 TAF；
4. YFS 磁盘级故障处理机制；
5. 分区表转换：支持普通表和分区表互相转换；
6. SQL 语句跟踪功能（10046 事件）；
7. SLOW LOG 完整日志输出；

这些功能里，很多都是 DBA 们期待已久的。后续可能会挨个进行测试，今天先给大家演示 YAC 23.5 的安装部署——环境搭好了，才能开始干活不是？

# 环境准备

本文以经典架构（2 台服务器，1 共享存储）为例，搭建双实例单库的共享集群环境，实例部署在不同服务器上。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251126-1993500325622407168_395407.png)

## 服务器信息

国产数据库首选部署到国产系统上，最常用的应该就是银河麒麟 V10 了，本文选择最新版本进行测试安装。

| 主机名 | IP           | 版本               | CPU | 内存 | 硬盘 |
| ------ | ------------ | ------------------ | --- | ---- | ---- |
| yac01  | 10.168.1.101 | 银河麒麟 Kylin V10 | 8C | 16G  | 200G |
| yac02  | 10.168.1.102 | 银河麒麟 Kylin V10 | 8C | 16G  | 200G |

## 网络信息
本文网络信息配置如下：

| 主机名 | 业务 IP      | VIP          | 心跳 IP | SCANIP       |
| ------ | ------------ | ------------ | ------- | ------------ |
| yac01  | 10.168.1.101 | 10.168.1.103 | 1.1.1.1 | 10.168.1.105 |
| yac02  | 10.168.1.102 | 10.168.1.104 | 1.1.1.2 | 10.168.1.105 |

对于共享集群部署，还需进行 IP 地址预留：
- **公网**：主要用于外部业务访问 YashanDB、DBA 进行数据库管理以及数据库工具进行数据库命令调用等。
	- 建议公网为每个集群预留 1 到 3 个 IP 地址作为 SCAN VIP，以满足后续可能的 SCAN 功能使用需要。
	- 建议公网为每台服务器预留 1 个 IP 地址作为 VIP，以满足后续可能的 VIP 功能使用需要。
- **私网**：主要用于 YashanDB 内部通信，也就是心跳 IP。

**注意**：多个 SCANIP 需要配置 DNS 解析，否则无法使用 SCANIP 切换功能，本文使用 1 个 SCANIP 进行部署。

## 服务器规划

共享集群配置推荐如下：

- **CPU**：推荐 8C 及以上；
- **内存**：推荐 32G 及以上；
- **心跳网卡**：内部通信的私网要求 10GE 以上；
- **公网网卡**：如需使用 SCAN 或 VIP 功能，请确保同一集群中所有服务器用于配置公网子网的网卡支持 ARP/NDP 协议，且建议网卡名称保持一致便于运维，如需使用 NVMe over RDMA 传输协议，要求网卡类型为 RDMA，并已安装相应的驱动，处于正常运行状态；
- **共享存储**：准备 1 台 SAN 共享存储，或者 1 套可搭建 NVMe-oF 分布式存储的 NVMe SSD；

**注意**：若使用虚拟机安装 YashanDB，必须将虚拟机的硬盘设置为独立-永久模式（例如，VMware 中需在虚拟机的【硬盘高级设置】中勾选模式为【独立】-【永久】，具体配置方法请以各虚拟机平台实际为准），否则在断电等场景下会出现磁盘文件破坏的情况。

## 共享存储规划

崖山文件系统管理（YFS）以磁盘作为存储管理的逻辑单元，并根据使用目的区别为如下两类：

- **系统盘**：用于集群管理，仅支持 1、2、3 或 5 块相同大小的磁盘，每块磁盘容量至少 1G（当系统盘数量为 1 块且 AU Size 需配置为 32M 时，要求系统盘大小至少为 2G），此类磁盘的绝对路径将作为 `--system-data` 参数的值，以 `,` 分隔多个磁盘进行配置，例如 `--system-data /dev/yfs/sys0,/dev/yfs/sys1,/dev/yfs/sys2`。
- **数据盘**：用于保存集群业务数据，1 块或多块相同大小的磁盘，请根据实际业务需求规划其数量和容量，此类磁盘的绝对路径将作为 `--data` 参数的值，以,分隔多个磁盘进行配置，例如 `--data /dev/yfs/data0,/dev/yfs/data1,/dev/yfs/data2`。

本次演示的环境是在虚拟化上进行操作，已划分 4 块盘进行多写入共享：

- **数据盘**：1 块 100GB，规划绑定至 `/dev/yas/data` 路径。
- **系统盘**：3 块 10GB，规划绑定至 `/dev/yas/sys01,/dev/yas/sys02,/dev/yas/sys03` 路径。

请选择合适的方式，以 root 用户在共享集群的所有服务器上执行对应操作绑定 LUN。

# 安装前准备（所有节点）

**📢 注意：本章节内容均需要在所有节点执行，以节点一为例进行演示！**

## 配置 /etc/hosts

部署 YAC 共享集群，**必须配置主机名**，服务器名称要求如下：

- 名称由字母、数字以及下划线组成，且必须以字母开头，长度为 [4,64] 个字符。
- 同一个 YashanDB 共享集群中的服务器名称不能相同。
- 建议每台服务器上只运行一个实例，若一台服务器需运行多个实例则要求将服务器名称设置为 [3,63] 个字符。

**建议配置主机名解析：**

```bash
## 以节点一为例
[root@yac01 ~]# cat<<-EOF>>/etc/hosts
# 公网 IP
10.168.1.101	yac01
10.168.1.102	yac02
# VIP
10.168.1.103	yac01-vip
10.168.1.104	yac02-vip
# 心跳 IP
1.1.1.1	yac01-priv
1.1.1.2	yac02-priv
# SCANIP
10.168.1.105	yac-scan
EOF
```

## 关闭防火墙

数据库安装均建议关闭防火墙：

```bash
## 以节点一为例
[root@yac01 ~]# systemctl stop firewalld
[root@yac01 ~]# systemctl disable firewalld
Removed /etc/systemd/system/multi-user.target.wants/firewalld.service.
Removed /etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service.
```

## 创建用户和组

主机创建用户如果有密码复杂性要求，不想设置密码太复杂的话，可以取消密码复杂度：

```bash
## 以节点一为例
[root@yac01 ~]# sed -i 's/^password\+[[:space:]]\+requisite[[:space:]]\+pam_pwquality.so/#&/g' /etc/pam.d/system-auth
[root@yac01 ~]# sed -i 's/use_authtok$//' /etc/pam.d/system-auth
```

建议在所有服务器上创建 YashanDB 产品的安装用户，而非使用 root 身份执行安装部署：

```bash
## 以节点一为例
## 这里增加 YASDBA 组是为了后续配置支持：yasql / as sysdba 系统认证
[root@yac01 ~]# groupadd YASDBA
[root@yac01 ~]# useradd -d /home/yashan -m yashan
[root@yac01 ~]# usermod -a -G YASDBA yashan
[root@yac01 ~]# echo "yashan:yashan" | chpasswd
[root@yac01 ~]# id yashan
用户id=1000(yashan) 组id=1001(yashan) 组=1001(yashan),1000(YASDBA)

## 配置 sudo 免密
## 对 root 用户赋权并打开 /etc/sudoers 文件
[root@yac01 ~]# chmod +w /etc/sudoers
## 在文件的最后添加如下内容
[root@yac01 ~]# cat<<-EOF>>/etc/sudoers
yashan ALL=(ALL)NOPASSWD:ALL
EOF
[root@yac01 ~]# chmod -w /etc/sudoers
```

## 创建目录

所有 YashanDB 的实例节点都必须规划以下两个目录：

- HOME 目录：YashanDB 的产品目录，包含 YashanDB 所提供的命令、数据库运行所需的库及各关键组件。该目录由 yashan 用户执行安装部署时输入的 install-path 参数根据一定规则生成并创建。
- DATA 目录：对于共享集群，所有的数据文件和 redo 文件均需保存在共享存储上，DATA 目录将只用于存储实例运行相关的配置文件、日志文件等数据。该目录由 yashan 用户执行安装部署时输入的 `--data-path` 参数根据一定规则生成并创建。

HOME 目录和 DATA 目录均规划在 /data/yashan 下，yashan 用户需要对该目录拥有全部权限，可执行如下命令授权：

```bash
## 以节点一为例
[root@yac01 ~]# mkdir -p /home/yashan/install
[root@yac01 ~]# chown -R yashan:yashan /home/yashan/install
[root@yac01 ~]# mkdir /soft
[root@yac01 ~]# mkdir -p /data/yashan
[root@yac01 ~]# mkdir -p /data/yashan/yasdb_home
[root@yac01 ~]# mkdir -p /data/yashan/log
[root@yac01 ~]# chown -R yashan:yashan /data/yashan
[root@yac01 ~]# chmod -R 777 /data/yashan
```

## 系统参数配置

当 YashanDB 安装在 Linux 环境中时，为使系统达到更好的性能，建议进行下述配置调整：

```bash
## 以节点一为例
## 关闭交换分区
[root@yac01 ~]# echo "vm.swappiness = 0" >>/etc/sysctl.conf
## 调整自动分配本地端口范围
[root@yac01 ~]# echo "net.ipv4.ip_local_port_range = 32768 60999" >>/etc/sysctl.conf
## 调整进程的VMA上限
[root@yac01 ~]# echo "vm.max_map_count=2000000" >>/etc/sysctl.conf
## 生效配置
[root@yac01 ~]# sysctl -p
```

## 资源配置

将部分资源限制值（使用 ulimit -a 可查看所有的资源限制值）调整为推荐值或以上。

```bash
## 以节点一为例
[root@yac01 ~]# cat<<-EOF>>/etc/security/limits.conf
yashan soft nofile 1048576
yashan hard nofile 1048576
yashan soft nproc 1048576
yashan hard nproc 1048576
yashan soft rss unlimited
yashan hard rss unlimited
yashan soft stack 8192
yashan hard stack 8192
EOF
```

## 清理共享内存

部署 YashanDB 共享集群，还需在所有服务器上清理共享内存：

```bash
## 以节点一为例
[root@yac01 ~]# ipcrm -a
```

## 配置软件源

Linux 系统安装软件需要配置本地软件源。

> ⭐️ 配置 Linux 软件源可以参考为之前写的文章：**[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA)**

配置本地软件源的方式需要先挂载本地 ISO 安装镜像：

```bash
## 以节点一为例
[root@yac01 ~]# mount /dev/sr0 /mnt
mount: /mnt: WARNING: source write-protected, mounted read-only.
```

一键配置 KylinV10 本地软件源：

```bash
## 以节点一为例
## 备份软件源初始配置
[root@yac01 ~]# mkdir -p /etc/yum.repos.d/bak
[root@yac01 ~]# mv /etc/yum.repos.d/* /etc/yum.repos.d/bak
mv: 无法将目录'/etc/yum.repos.d/bak' 移动至自身的子目录'/etc/yum.repos.d/bak/bak' 下
## 配置软件源
## 注意麒麟 V10 最新版本的 ISO 改变了目录，如果是 VERSION="V10 (Sun)" 则按照如下配置
[root@yac01 ~]# cat <<-EOF > /etc/yum.repos.d/local.repo
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
EOF
## 查看软件源内容
[root@yac01 ~]# cat /etc/yum.repos.d/local.repo
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
```

确保软件源配置完成，就可以安装软件了。

## 安装依赖包

为保障 YashanDB 的正常安装和运行，请按如下来源及最低版本要求，在所有服务器环境中配置所需依赖项：

安装依赖包：

```bash
## 以节点一为例
## mpathpersist 和 sshpass 仅共享集群部署和分布式集群部署依赖
[root@yac01 ~]# dnf install -y openssl lz4 zlib zstd mpathpersist sshpass --skip-broken
```

安装完成后检查是否安装成功：

```bash
## 以节点一为例
## gmssl、bitshuffle、monit、fio、iperf 已内嵌至 YashanDB 安装包，无需手动安装
[root@yac01 ~]# rpm -q openssl lz4 zlib zstd mpathpersist sshpass
openssl-1.1.1c-15.el8.x86_64
lz4-1.8.1.2-4.el8.x86_64
zlib-1.2.11-13.el8.x86_64
zstd-1.4.2-2.el8.x86_64
未安装软件包 mpathpersist
未安装软件包 sshpass
```

以上未安装软件包：

- **sshpass**：需要执行多服务器检测且 -u 指定的用户未配置免密登录时，脚本依赖 sshpass，可通过 sshpass -h 确认工具是否可用。通常更推荐配置免密登录。
- **mpathpersist**：服务器使用 DM-Multipath 多路径软件管理存储设备时，脚本依赖 mpathpersist。通常 multipath-tools 软件包会一同安装 mpathpersist，可通过 mpathpersist --help 确认工具是否可用。

检查 mpathpersist：

```bash
[root@yac01 soft]# which mpathpersist
/usr/sbin/mpathpersist
```

mpathpersist 已经跟随 multipath-tools 一起安装，所以只需要手动安装 sshpass 即可：

> sshpass 下载地址：https://github.com/kevinburke/sshpass

安装方式如下：

```bash
## sshpass
cd sshpass
./configure
make && make install
```

检测 sshpass 是否安装：

```bash
[root@yac01 sshpass-master]# which sshpass
/usr/local/bin/sshpass
```

依赖包全部安装完成。

## 挂载共享盘

本文是通过虚拟化直接挂载的共享盘进行搭建，记得一定要打开虚拟化主机的 UUID 配置 `disk.EnableUUID ="TRUE"`，否则无法获取到 UUID：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993228992967696384_395407.png)

查看挂载成功的共享盘：

```bash
## 以节点一为例，sdb、sdc、sdd、sde 为挂载的共享盘
[root@yac01 ~]# lsblk
NAME          MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda             8:0    0   200G  0 disk
├─sda1          8:1    0     1G  0 part /boot
└─sda2          8:2    0   199G  0 part
  ├─kals-root 252:0    0 191.1G  0 lvm  /
  └─kals-swap 252:1    0   7.9G  0 lvm  [SWAP]
sdb             8:16   0   100G  0 disk
sdc             8:32   0    10G  0 disk
sdd             8:48   0    10G  0 disk
sde             8:64   0    10G  0 disk
sr0            11:0    1   7.5G  0 rom  /mnt
```

挂载好共享盘之后就可以配置 UDEV 绑盘了。

## UDEV 绑盘

如果共享盘是多路径，建议可以先使用 multipath 进行绑盘，便于管理。

我这里只有一条路径，查看节点磁盘 wwid：

```bash
## 以节点一为例
[root@yac01 ~]# /usr/lib/udev/scsi_id -g -u /dev/sdb
36000c291084988f077ae73b51c9300a9
[root@yac01 ~]# /usr/lib/udev/scsi_id -g -u /dev/sdc
36000c294b908fb7c2aff5af247045fc0
[root@yac01 ~]# /usr/lib/udev/scsi_id -g -u /dev/sdd
36000c295e01066faf6afd123dc3182e5
[root@yac01 ~]# /usr/lib/udev/scsi_id -g -u /dev/sde
36000c29a85edab15832930722fa30534
```

执行 udev 绑定：

```bash
## 以节点一为例
[root@yac01 ~]# cat<<-EOF >/etc/udev/rules.d/yashan-device-rule.rules
KERNEL=="sd*",ENV{ID_SERIAL}=="36000c291084988f077ae73b51c9300a9",SYMLINK+="yas/data",OWNER="yashan",GROUP="YASDBA",MODE="0666",RUN+="/bin/sh -c 'chown -R yashan:yashan /dev/yas/data'"
KERNEL=="sd*",ENV{ID_SERIAL}=="36000c294b908fb7c2aff5af247045fc0",SYMLINK+="yas/sys01",OWNER="yashan",GROUP="YASDBA",MODE="0666",RUN+="/bin/sh -c 'chown -R yashan:yashan /dev/yas/sys01'"
KERNEL=="sd*",ENV{ID_SERIAL}=="36000c295e01066faf6afd123dc3182e5",SYMLINK+="yas/sys02",OWNER="yashan",GROUP="YASDBA",MODE="0666",RUN+="/bin/sh -c 'chown -R yashan:yashan /dev/yas/sys02'"
KERNEL=="sd*",ENV{ID_SERIAL}=="36000c29a85edab15832930722fa30534",SYMLINK+="yas/sys03",OWNER="yashan",GROUP="YASDBA",MODE="0666",RUN+="/bin/sh -c 'chown -R yashan:yashan /dev/yas/sys03'"
EOF
```

生效 udev：

```bash
## 以节点一为例
[root@yac01 ~]# udevadm control --reload-rules
[root@yac01 ~]# udevadm trigger --type=devices --action=change
```

查看绑定后的盘：

```bash
## 以节点一为例
[root@yac01 ~]# ll /dev/yas/*
lrwxrwxrwx 1 yashan yashan 6 11月 25 16:12 /dev/yas/data -> ../sdb
lrwxrwxrwx 1 yashan yashan 6 11月 25 16:12 /dev/yas/sys01 -> ../sdc
lrwxrwxrwx 1 yashan yashan 6 11月 25 16:12 /dev/yas/sys02 -> ../sdd
lrwxrwxrwx 1 yashan yashan 6 11月 25 16:12 /dev/yas/sys03 -> ../sde
```

确保两个节点都绑定成功。

## 关闭透明大页

YashanDB 建议关闭透明大页，部分操作系统默认开启了透明大页选项，可执行以下命令确认：

```bash
## 以节点一为例
[root@yac01 ~]# cat /sys/kernel/mm/transparent_hugepage/enabled
[always] madvise never
```

显示结果：

- [always] madvise never：透明大页已开启。
- always [madvise] never：透明大页已开启。
- always madvise [never]：透明大页已关闭。

修改 /etc/default/grub 文件，在 GRUB_CMDLINE_LINUX 中添加或修改参数 transparent_hugepage=never：

```bash
## 以节点一为例
[root@yac01 ~]# sed -i 's/quiet/quiet transparent_hugepage=never/' /etc/default/grub
```

通过以下指令检查当前系统的引导类型：

```bash
## 以节点一为例
[root@yac01 ~]# [ -d /sys/firmware/efi ] && echo UEFI || echo BIOS
BIOS
```

两种引导的启动文件路径分别为：

- BIOS：/boot/grub2/grub.cfg
- UEFI：/boot/efi/EFI/\<distro_name>/grub.cfg，distro_name 为系统发行版本名称，例如 ubuntu、fedora、debian 等。

执行 grub2–mkconfig 指令重新配置 grub.cfg：

```bash
## 以节点一为例
## BIOS 引导
[root@yac01 ~]# grub2-mkconfig -o /boot/grub2/grub.cfg
Generating grub configuration file ...
done
## UEFI 引导
# grub2-mkconfig -o /boot/efi/EFI/<distro_name>/grub.cfg
```

重启操作系统，使配置永久生效：

```bash
## 以节点一为例
[root@yac01 ~]# reboot
```

验证透明大页已关闭：

```bash
## 以节点一为例
[root@yac01 ~]# cat /sys/kernel/mm/transparent_hugepage/enabled
always madvise [never]
```

结果应显示 always madvise [never]。

# YAC 安装（主节点）

YashanDB 提供了多种部署形态，不同形态的安装过程，尤其是初始安装参数配置部分差异较大，本文使用可视化安装方式，对于新手比较友好。

## 解压安装软件

执行安装部署前，请以安装用户（yashan）登录数据库服务器，并进入 `/home/yashan/install` 安装目录解压安装包：

```bash
## 上传并授权 yashan 用户权限
[root@yac01 ~]# chown yashan:yashan /home/yashan/install/yashandb-23.5.1.100-linux-x86_64.tar.gz
## 使用 yashan 用户解压安装包
[root@yac01 ~]# su - yashan
[yashan@yac01 ~]$ cd install/
[yashan@yac01 install]$ tar -xf yashandb-23.5.1.100-linux-x86_64.tar.gz
[yashan@yac01 install]$ ll
drwxrwxr-x 2 yashan yashan        21 11月  3 11:02 bin
-rw-rw-r-- 1 yashan yashan 302105919 11月  3 11:03 database-23.5.1.100-linux-x86_64.tar.gz
drwxrwxr-x 3 yashan yashan        19 11月  3 11:02 depends
-rwxrwxr-x 1 yashan yashan      1035 11月  3 11:03 install.sh
drwxrwxr-x 6 yashan yashan        56 11月  3 11:02 om
drwxrwxr-x 2 yashan yashan      4096 11月  3 11:02 plugins
-rw-r--r-- 1 yashan yashan 330746513 11月 25 16:18 yashandb-23.5.1.100-linux-x86_64.tar.gz
```

## 启动 Web 服务

进入主节点安装目录下 Web 服务所在的目录，使用 `yasom` 启动 Web 服务端：

```bash
[yashan@yac01 ~]$ cd /home/yashan/install/om
[yashan@yac01 om]$ ./bin/yasom --web --listen 10.168.1.101:9001
2025-11-25 16:24:40 INFO   [console] yasom.go:147 Version: 23.5.1.100
2025-11-25 16:24:40 INFO   [console] deploy.go:60 deploy manager starting...
2025-11-25 16:24:40 INFO   [console] activity.go:29 activity manager starting...
2025-11-25 16:24:40 INFO   [console] convert.go:119 opt.GroupConfig: map[]
2025-11-25 16:24:40 INFO   [console] static.go:21 routing vue app
2025-11-25 16:24:40 INFO   [console] web.go:21 Server listen on: 10.168.1.101:9001
```

在 PC 端浏览器中访问可视化安装的网页地址：

> http://10.168.1.101:9001/omweb

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993234657018732544_395407.png)

## 配置数据库信息

根据实际情况，配置数据库基本信息：

- **数据库名称**：填写数据库集群名称，该名称也将作为初始数据库的名称（database name）。必须以字母开头，支持字母（区分大小写）、数字以及下划线，长度为[4,64]个字符，例如 yashandb。
- **数据库类型**：选择数据库部署形态，例如集群。

集群模式需要添加其余节点：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993235505442545664_395407.png)

填写好所有节点的信息：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993235635319676928_395407.png)

检查确认安装路径等信息无误后单击【全部尝试校验】检查正确性：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993235712674717696_395407.png)

确认信息无误后，单击【下一步】，配置开机自启 monit（sudo 在上面配置步骤已经完成，这里直接勾选就行），开启时，守护进程将在服务器开机后自行启动并拉起 YashanDB 的各个进程，间接实现数据库的开机自启动：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993236189961854976_395407.png)

确认信息无误后，单击【下一步】。

## 配置集群节点信息

在弹出的节点规模配置对话框中，根据实际规划的实例数调整相关配置，单击【确定】保存信息：

- **语法模式**：可根据业务需求选择 yashan 模式或 mysql 模式。若选定为 yashan 模式，安装后无法直接切换为 mysql 模式，只能卸载重装。
- **集群组数量**：共享集群组的数量。例如 1 为搭建 1 个集群，2 为搭建一主一备集群，3 为搭建一主两备集群，以此类推。此例中以搭建 1 个集群为例。
- **主集群节点数量**：选择主集群的数据库实例数量。
- **磁盘发现路径**：填写为磁盘发现路径，用于发现集群共享存储的磁盘路径，该路径是磁阵数据存储盘路径和系统数据盘路径的父级目录，例如 `/dev/yfs`。
- **磁阵数据存储盘路径**：填写为数据盘规划的共享存储 LUN 路径，例如 `/dev/yfs/data0`。
- **系统数据盘**：填写为系统数据盘规划的共享存储 LUN 路径，例如 `/dev/yfs/sys0、/dev/yfs/sys1和/dev/yfs/sys2`。
- **网卡配置**：可以将数据库监听地址、主备复制链路地址和共享集群网络通信链路地址配置为不同的网段，格式为 `192.168.1.0/24`。
- **scan 配置**：配置公网子网、SCAN 域名或 VIP 信息。 - **public_network**：共享集群对外提供服务的公网，格式为子网/子网掩码[/网卡名]，网卡名可以省略，例如：`192.168.1.0/24`； - **scan_name**：共享集群的 SCAN 域名，需配合 `--public-network` 参数使用； - **vips**：共享集群的 VIP 配置信息，格式为 IP 地址/子网掩码[/网卡名]，例如：`192.168.1.62/255.255.255.0/ens192`，如果无法确保同一集群中所有服务器访问公网的网卡名一致，则必须省略网卡名。需配合 `--public-network` 参数使用，且 IP 地址应属于公网网段。VIP 个数与节点个数一致，多个 VIP 配置之间用逗号 `,` 隔开；

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993237798762651648_395407.png)

在 SYS 用户配置区域，设置数据库超级管理员 SYS 用户的密码，配置要求如下：

- 密码长度为 `8-64` 位。
- 密码中不能包含对应的数据库用户名称。
- 密码必须同时包含数字、字母和特殊字符。
- Linux OS 命令相关的特殊字符（例如 `@、/、.、!、$、'` 等）需进行转义。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993238174752645120_395407.png)

在 yasom 配置区域，可根据实际情况调整 yasom 所在服务器和监听端口。

- yasom 所在服务器：默认为当前服务器 IP。
- LISTEN_ADDR：yasom 的监听端口，默认为 1675。

在插件配置区域，可按需选择需要安装的插件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993238333296828416_395407.png)

在节点配置区域，可按需调整以下配置（保持默认即可）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993238845249380352_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993238988535701504_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993239120580780032_395407.png)

这个建议勾选上，否则部署过程中可能因为磁盘不干净导致报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251126-1993516735321415680_395407.png)

确认信息无误后，单击【下一步】。

## 设置建库参数

在【数据库建库参数】页面，可参考共享集群配置文件按需增/删/改建库参数，参考共享集群 YFS 参数配置按需增/删/改 YFS 参数，参考共享集群 YCS 参数配置按需增/删/改 YCS 参数。

本文使用参数文件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993239630863998976_395407.png)

集群类型数据库 YFS 参数配置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993239902348206080_395407.png)

集群类型数据库 YCS 参数配置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993240007440687104_395407.png)

确认信息无误后，单击【下一步】。

## 部署数据库

在【数据库全局信息】页面，确认信息无误后，单击【部署】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993240668702580736_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993240982930939904_395407.png)

当出现下面提示时，表示部署完成，可以手动关闭网页，服务端会在一定时间内自动退出：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993246006394314752_395407.png)

部署完成后，yasom 会在 `/home/yashan/install/conf/CE/yashandb` 目录中生成 hosts.toml 和 yashandb.toml 文件，其中 `yasdb` 为数据库名称，此目录为安装目录：

```bash
[yashan@yac01 yasdb]$ pwd
/home/yashan/install/conf/CE/yasdb
[yashan@yac01 yasdb]$ ll
总用量 12
-rw-rw-r-- 1 yashan yashan   16 11月 25 17:06 deploy.uuid
-rw------- 1 yashan yashan 1397 11月 25 17:06 hosts.toml
-rw------- 1 yashan yashan 3431 11月 25 17:06 yasdb.toml
```

## 配置环境变量（所有节点）

部署命令成功执行后将会在 \$YASDB_HOME 目录下的 conf 文件夹中生成 <<集群名称>>.bashrc 环境变量文件：

```bash
## 以节点一为例
# 进入环境变量文件所在目录，例如/data/yashan/yasdb_home/{version_number}/conf
[yashan@yac01 ~]$ cd /data/yashan/yasdb_home/23.5.1.100/conf
[yashan@yac01 conf]$ cat yasdb.bashrc >> ~/.bashrc

# 生效环境变量
[yashan@yac01 conf]$ source ~/.bashrc
```

# 集群管理

ycsctl 是 YashanDB 的 YCS 管理工具，用户可使用本工具实现对共享集群的管理操作，包括集群级别的管理和节点级别的管理。

## 配置 YCS 环境变量

其中，节点级别的 ycsctl 命令要求节点上的 YCS 启动后才能执行，并配置 **\$YASCS_HOME** 环境变量：

```bash
# 如下路径需更换为实际的节点路径
[yashan@yac01 ~]$ echo "export YASCS_HOME=/data/yashan/yasdb_home/yasdb_data/ycs/ce-1-1" >> ~/.bashrc
[yashan@yac02 ~]$ echo "export YASCS_HOME=/data/yashan/yasdb_home/yasdb_data/ycs/ce-1-2" >> ~/.bashrc

# 生效环境变量
[yashan@yac01 conf]$ source ~/.bashrc
[yashan@yac02 conf]$ source ~/.bashrc
```

## 检查集群

查看集群状态：

```bash
[yashan@yac01 ~]$ ycsctl status
[yashan@yac01 ~]$ ycsctl status -v
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993248873742163968_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993249788645695488_395407.png)

查看集群配置：

```bash
[yashan@yac01 ~]$ ycsctl show config
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993249267805921280_395407.png)

查看集群磁盘组：

```bash
[yashan@yac01 ~]$ ycsctl query disk
[yashan@yac01 ~]$ yfscmd ls
[yashan@yac01 ~]$ yfscmd lsdg
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993250714781573120_395407.png)

更多 ycsctl 用法可使用 `ycsctl -H` 查看。

## 检查数据库

检查数据库状态：

```bash
[yashan@yac01 ~]$ yasboot cluster status -c yasdb -d
[yashan@yac01 ~]$ yasboot cluster status -b group -c yasdb -d
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993249524950310912_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993250997364924416_395407.png)

查看实例状态：

```bash
## 系统认证方式登录，可以直接使用 yasql / as sysdba 方式连接
[yashan@yac01 ~]$ yasql / as sysdba
YashanDB SQL Enterprise Edition Release 23.5.1.100 x86_64

Connected to:
YashanDB Server Enterprise Edition Release 23.5.1.100 x86_64 - Linux

SQL> select instance_number,instance_name from gv$instance;

INSTANCE_NUMBER INSTANCE_NAME
--------------- ----------------------------------------------------------------
              1 yasdb-1-1
              2 yasdb-1-2

2 rows fetched.
```

## 创建用户和表

```sql
-- 创建用户
SQL> create user lucifer identified by lucifer;

Succeed.
-- 授予 DBA 权限
SQL> grant dba to lucifer;

Succeed.
-- 连接用户
SQL> conn lucifer/lucifer

Connected to:
YashanDB Server Enterprise Edition Release 23.5.1.100 x86_64 - Linux

-- 创建表
SQL> create table test(id number,name varchar2(20));

Succeed.
-- 插入数据
SQL> insert into test values (1,'lucifer');

1 row affected.
-- 提交
SQL> commit;

Succeed.
-- 查询数据
SQL> select * from test;

         ID NAME
----------- ---------------------
          1 lucifer

1 row fetched.
-- 创建索引
SQL> create index idx_lucifer_id on test(id);

Succeed.
```

## 配置 monit

启动所有服务器上的 monit 进程：

```bash
[yashan@yac01 ~]$ yasboot monit start -c yasdb -d
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993252297216974848_395407.png)

查看 monit 的监控状态简略信息：

```bash
[yashan@yac01 ~]$ yasboot monit summary -c yasdb
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993252430759419904_395407.png)

## 配置开机自启（所有节点）

由于每次开机都需要启动 yasom 和 yasagent，然后再启动数据库：

```bash
## 手动启动 yasom 和 yasagent 进程
[root@yac01 ~]# yasboot process yasom start -c yasdb
[root@yac01 ~]# yasboot process yasagent start -c yasdb

## 待 yasom 和 yasagent 进程启动后，才能启动数据库
[root@yac01 ~]# yasboot cluster start -c yasdb
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993252708250378240_395407.png)

重启主机测试是否会开启：

```bash
[root@ymp ~]# reboot
## 重启后连接数据库，正常开启
[yashan@yac01 ~]$ yasql / as sysdba
YashanDB SQL Enterprise Edition Release 23.5.1.100 x86_64

Connected to:
YashanDB Server Enterprise Edition Release 23.5.1.100 x86_64 - Linux

SQL>
```

本文篇幅过长，影响阅读体验，下一篇再演示 VIP 和 SCANIP 相关内容。

# 写在最后

本文简单记录了崖山共享集群的安装部署过程，总体来说比较简单易上手，大家感兴趣都可以玩玩！

如果有遗漏或者不足的地方，欢迎评论区补充或者投稿，感谢阅读！