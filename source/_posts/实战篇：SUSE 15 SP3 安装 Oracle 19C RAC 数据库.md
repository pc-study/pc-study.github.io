---
title: 实战篇：SUSE 15 SP3 安装 Oracle 19C RAC 数据库
date: 2021-11-08 12:41:13
tags: [墨力计划,suse,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/159384
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
这两天看到交流群里有朋友咨询 SUSE 15 SP3 安装 Oracle 19C RAC 遇到点问题，趁着周末有时间，抱着学习的心态，研究了一下如何安装，接下来就分享一下从零开始部署的流程！

总体来说，和 RHEL 部署流程上大同小异，主要是有一些命令不一样，废话不多说直接开始了~

>**❤️ Oracle安装包合集和补丁下载地址：[2021年Oracle第三季度补丁合集](https://www.modb.pro/download/210188)**

⭐️ 如果想要使用脚本安装，可以使用博主编写的 Oracle 一键安装脚本，同时支持单机和 RAC 集群模式！
>**[Oracle 数据库一键安装脚本](https://www.modb.pro/course/148)**

**<font color='red'>更多更详细的脚本使用方式可以订阅专栏：</font>[Oracle 一键安装脚本实操合集，持续更新中！！！](https://www.modb.pro/db/1773583263184031744)。**

# 一、安装 SUSE 15 SP3
首先，我们去官网下载 15 SP3 的安装镜像：[SUSE Linux Enterprise Server](https://www.suse.com/download/sles/)

![](https://img-blog.csdnimg.cn/a76e899a38d248019d33c624250c5386.png)

<font color='orage'>**镜像比较大，大概 12G 左右，开始安装系统！**</font>

本次演示的是 Parallel Desktop 虚拟机安装，其他虚拟机一样：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-b74bbcba-36bb-468a-9464-190e90aabe08.png)

选取下载好的安装介质后，虚拟机名字为 `SUSE01`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-88148d22-f1f3-496a-9981-de1e9a9c6115.png)

由于是 19C RAC，因此配置物理内存为 8G：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-90033ccf-9f48-4533-9ca2-81b45a8d04d0.png)

至少需要2张网卡，因此添加一个网卡作为心跳：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c7ed763a-829d-4e6b-9bd2-d370916707a2.png)

挂载官网下载好的镜像源：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-539357b9-216d-4d1e-98e3-18d9e2c13013.png)

继续：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-80c5ac38-8dbb-412e-9180-2e2f982642cc.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-fd806080-6866-4590-acfd-a3ff0019e202.png)

上面的步骤，其他的虚拟机或许不一样，下面的正式开始安装流程都是一致的：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-280c03d1-6cf1-4f02-8a70-6927d5fa3e3c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-4707dca7-be40-432c-a2e5-d4edfa9ff0b9.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-22eb3bf8-3153-4229-9114-a7f063c53fc8.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-92c330a9-719d-4a0b-9e95-140d2c4452d5.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-f2179e92-a768-4b23-b2f2-204a12c07adc.png)

选择语言环境和版本：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-fcdc8fb7-b240-4b93-a8a2-1c758e65c6fa.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-1330a667-38bb-4ae9-8b01-909653fc96af.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-8d1f90b1-abc5-4541-b303-e9ebefdbb163.png)

跳过注册：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c2662796-8ad1-4605-a298-d25b6f6ac676.png)

建议安装过程中直接配置网络：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-07b9d7d5-ccb8-4412-93d1-28f83a320622.png)

两张网卡，一张 eth0 用于公网，一张 eth1 用于心跳：

eth0：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-19167f9d-10a6-4c28-aaa3-7a710d14d037.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-bf9a4a52-b9ed-4ad6-95ca-75f2a0911bf6.png)

eth1：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-4d8e635a-434f-4813-9d1e-172e30a564da.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-0b6d100a-b151-449c-9b24-b0d96e3cf99d.png)

已配置好两张网卡：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-b259a47d-1f4a-4442-b139-578d8ea98377.png)

配置主机名：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-d4558c60-f2a5-4fe3-b8a5-45cfcaba112a.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-8d40f1d2-df6d-456a-8056-f862f6424666.png)

继续安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-2c888d60-5f21-43af-a1b5-849bda62a089.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-858dd4a3-e601-40cf-8c7c-37a7dbc5cfb3.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-5feaf3c1-04b7-45b3-bdd7-50d40056c55c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-e59df47b-0fce-4347-a596-3cdee3eca668.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-bc4e067f-2391-4858-acc7-2b2804093863.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-645f035b-4a6d-40f6-9e3e-7da84f8120f0.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-230e71a9-0ad9-46b3-9f45-c3de8b3428bb.png)

手工配置系统分区：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-1e11462a-e5aa-4676-a8c2-2dbabb961899.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-2a968623-d82a-4b34-9c3f-cccf3c3f8798.png)

首先创建一个 /boot 分区：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-00a55188-3b5d-426b-8199-e740a14aeb39.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-85e78b70-1647-4ed1-8eaf-136fcefdecc7.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-0db518a6-a131-4cc6-a396-372088d5a1ff.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-0f062373-10b5-4f30-a69b-716d7baa7f7c.png)

将剩余磁盘空间创建为 LVM，用于系统安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-21069024-5217-47c2-a340-3a616505de6c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-2b4633a6-799f-4d08-8ee7-dd7c851d9458.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-e8b867b6-518f-4bd9-acac-0f78baebab4e.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-f518bfec-f64c-443c-8e95-82f862a4ce8a.png)

创建 rootvg 分区：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c170e584-8cc5-4f66-b9fc-7305fb5778f8.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-f94862a4-7945-44ac-976f-8175d7c276cb.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-a3938d69-b6bd-44a1-bbb5-b782c70f5dd8.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-6f54e23a-c057-4727-aa65-515b1d8e1778.png)

创建 swaplv 分区：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c72414a1-f34d-4cf0-9f2d-e944d2cf9735.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-14e4bd19-089a-4802-8812-dfdc08b74187.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-a10a2053-c476-435c-8473-e32fbcaf2152.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-16a11934-084e-41f7-9472-4869b9e8fdb6.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-d7cd1b91-f569-4c62-9cbe-d092bad321ef.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-7d949b49-a1a1-403f-be69-72d0bf6d8a7b.png)

创建根分区 rootlv：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-23810c3b-bd12-4aa7-ab57-4547bdeda548.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-9da25275-d64c-4d8d-80fa-589fdd9f5da1.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-7ff1e520-0e3d-4ac1-a74c-f388e2086dda.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-431ef83f-e2af-464a-ac8a-b9e16f9ddf0d.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-1e0bcdf1-e4f8-43df-afdf-922e1fd28ae5.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-9ddc66af-5ae2-4d1e-8365-b929662fb8ce.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-9c1a3ec1-1346-4dae-9dd9-b5bb39f1e8e2.png)

选择时区：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-628a7ed2-131f-41c1-8a55-29bd6b3775e2.png)

不创建用户：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-1930d27f-2108-4fee-bd73-995be6f330ad.png)

输入 root 密码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-a55c455d-773f-49cb-b564-cc51a873eefa.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-972a89d4-1930-4664-b246-5a11ea6a6b35.png)

关闭防火墙和kdump：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-bc95617e-5fb2-4ea8-ae20-6c813d4144b2.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-d3f44b14-c50b-45b7-a10d-7818d401e581.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-57312e57-5290-4f7b-a230-cbd74ce65243.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-5e4e612e-39b4-4067-8922-1368f736f437.png)

开始安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-8551c900-6e50-4290-a45a-ab8a023603f0.png)

安装完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-e390819f-0a84-41c6-8701-822c3907cad6.png)

以同样的步骤安装第二个节点！

# 二、安装前配置
安装RAC前，当然要先做好规划。具体包含以下几方面：
|节点|系统|Oracle版本|主机名|实例名|PublicIP|PirvateIP|VirtualIP|SCANIP|
|-|-|-|-|-|-|-|-|-|-|
|1|SLSE 15 SP3|19C|suse01|orcl1|10.211.55.100|10.10.10.1|10.211.55.102|10.211.55.105|
|2|SLSE 15 SP3|19C|suse02|orcl2|10.211.55.101|10.10.10.2|10.211.55.103|10.211.55.105|

## 1、系统规划
- **主机名：** 需要英文字母开头，建议小写，suse01/suse02  
- **集群名称：** 长度不超过15位，suse-cluster
- **Linux系统版本：** SLSE 15 SP3
- **磁盘：** 本地磁盘 64G，用于安装 OS，存放 grid 和 oracle 安装软件，用于 oracle 和 grid 安装目录  
- **ASM共享盘：**  
裁决盘OCR：OCR+VOTING=10G、冗余模式：EXTERNAL  
数据盘DATA：DATA=20G、冗余模式：EXTERNAL（数据文件，归档日志文件，spfile 文件等）
- **RU升级路径：** 19C 的补丁已经不叫PSU，改为 RU

**<font color='orage'>本次是从 19.3.0 升级到 19.13.0，Oracle 官网下载的基础版是 19.3.0！</font>**

⭐️ 如果想要使用脚本安装，可以使用博主编写的 Oracle 一键安装脚本，同时支持单机和 RAC 集群模式！
>**[开源项目：Install Oracle Database By Scripts！](https://www.modb.pro/db/101853)**

**<font color='red'>更多更详细的脚本使用方式可以订阅专栏：</font>[Oracle一键安装脚本](https://blog.csdn.net/m0_50546016/category_11127389.html)。**


## 2、网络规划
Public IP（公司内部访问，非外网）
```bash
10.211.55.100   suse01  
10.211.55.101   suse02
```
Private IP（用于节点间心跳网络）
```bash
10.10.10.1   suse01-priv  
10.10.10.2   suse02-priv
```
Virtual IP（提供客户端访问，漂移）
```bash
10.211.55.102 	suse01-vip  
10.211.55.103 	suse02-vip
```
SCAN IP（提供客户端访问，均衡）
```bash
10.211.55.105 	suse-scan
```
## 3、存储规划
Oracle RAC 使用 ASM 存储来存放数据，通常使用 OCR 和 DATA 两个磁盘组！
|磁盘名称|磁盘用途|磁盘大小|
|--|--|--|
|asm-ocr|OCR/Voting File|10G|
|asm-data|Data Files|20G|

# 三、主机配置
**<font color='orage'>📢 注意：</font>** 以下标题中（**<font color='red'>rac01&rac02</font>**）代表节点一和节点二都需要执行，（**<font color='red'>rac01</font>**）代表只需要节点一执行。

## 1、配置 zypper 源并安装依赖包（rac01&rac02）
Linux远程连接工具：

- 本文将使用XShell和Xftp工具，安装包可以在官网下载，也可私信博主获取。
- 其他工具也可以，比如：putty，SecureCRT 等等工具。

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-7cca051d-c557-49b1-9838-1680d70c8e49.png)

Parallels Desktop挂载Linux主机镜像：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-83e097c3-395e-4596-8aeb-0688aa4e3388.png)

挂载镜像：
```bash
mount /dev/cdrom /mnt
df -Th /mnt
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-41a937ab-b0c1-4d0c-8ce9-54304434a37f.png)

配置 zypper 源：
```bash
zypper ar -f /mnt/Module-Basesystem sle15
zypper ar -f /mnt/Module-Legacy sle15-Legacy
zypper ar -f /mnt/Module-Development-Tools sle15-Tools
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-2e8a9ffa-8b82-4349-93fb-6810439c3ed1.png)

安装依赖包：
```bash
zypper in -y gcc bc binutils glibc glibc-devel insserv-compat libaio-devel libaio1 libX11-6 libXau6 libXext-devel libXext6 libXi-devel libXi6 libXrender-devel libXrender1 libXtst6 libcap-ng-utils libcap-ng0 libcap-progs libcap1 libcap2 libelf1 libgcc_s1 libjpeg8 libpcap1 libpcre1 libpcre16-0 libpng16-16 libstdc++6 libtiff5 libgfortran4 mksh make pixz rdma-core rdma-core-devel smartmontools sysstat xorg-x11-libs xz compat-libpthread-nonshared readline-devel
```

检查依赖包安装情况：
```bash
rpm -q gcc bc binutils glibc glibc-devel insserv-compat libaio-devel libaio1 libX11-6 libXau6 libXext-devel libXext6 libXi-devel libXi6 libXrender-devel libXrender1 libXtst6 libcap-ng-utils libcap-ng0 libcap-progs libcap1 libcap2 libelf1 libgcc_s1 libjpeg8 libpcap1 libpcre1 libpcre16-0 libpng16-16 libstdc++6 libtiff5 libgfortran4 mksh make pixz rdma-core rdma-core-devel smartmontools sysstat xorg-x11-libs xz compat-libpthread-nonshared readline-devel --qf '%{name}.%{arch}\n' | grep "未安装软件包" | wc -l
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-3394f710-ce41-4789-a7c4-128e26d4be9e.png)

**<font color='orage'>📢 注意：</font>** 依赖一定要安装成功，否则可能导致安装失败！

## 2、用户及组、目录创建（rac01&rac02）
创建安装 Oracle 数据库所需的用户、组以及安装目录：
```bash
/usr/sbin/groupadd -g 54321 oinstall
/usr/sbin/groupadd -g 54322 dba
/usr/sbin/groupadd -g 54323 oper
/usr/sbin/groupadd -g 54324 backupdba
/usr/sbin/groupadd -g 54325 dgdba
/usr/sbin/groupadd -g 54326 kmdba
/usr/sbin/groupadd -g 54330 racdba
/usr/sbin/groupadd -g 54327 asmdba
/usr/sbin/groupadd -g 54328 asmoper
/usr/sbin/groupadd -g 54329 asmadmin
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-9877bca7-a170-4be1-90e5-27f9f13b0d40.png)

grid/oracle 用户创建并修改密码：
```bash
/usr/sbin/useradd -m -u 11012 -g oinstall -G asmadmin,asmdba,asmoper,dba,racdba,oper grid
passwd grid
/usr/sbin/useradd -m -u 54321 -g oinstall -G asmdba,dba,backupdba,dgdba,kmdba,racdba,oper oracle
passwd oracle
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c0c1cfd4-c950-461a-b5c0-de690673a010.png)

查看用户组
```bash
id grid
id oracle
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-fb50e06a-f0a8-430f-9d84-0d65263205c0.png)

## 3、创建软件目录：
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
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-b3d1ad0e-a484-4fd9-83d9-8239726ede84.png)

## 4、存储配置（rac01&rac02）
**<font color='orage'>Windows 下配置 ISCSI 共享存储可参考：</font>**
>**[一步步教你Windows配置ISCSI共享存储](https://luciferliu.blog.csdn.net/article/details/118087577)**

配置好共享存储后，在 Linux 主机连接共享存储：
```bash
##iscsi识别共享存储
##输出targetname，10.211.55.61 为iscsi共享存储设备 IP地址
iscsiadm -m discovery -t st -p 10.211.55.61
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c6c78efb-0861-4b80-8919-1f3a2103d0c1.png)

```bash
##连接共享存储
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:10.211.55.61-lucifer -p 10.211.55.61 -l
lsblk
## 设置开机自启动
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:10.211.55.61-lucifer -p 10.211.55.61 -o update -n node.startup -v automatic
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-aac60010-aba1-435c-9c2b-f656316a2d2d.png)

## 5、UDEV 配置共享存储：
设置 multipath 开机自启：
```bash
systemctl start multipathd
systemctl enable multipathd
systemctl status multipathd
```

配置 multipath 文件：
```bash
cat <<EOF >/etc/multipath.conf
defaults {
    user_friendly_names yes
}
 
blacklist {
  devnode "^sda"
}

multipaths {
  multipath {
  wwid "$(/usr/lib/udev/scsi_id -g -u /dev/sdb)"
  alias ocr_1
  }
  multipath {
  wwid "$(/usr/lib/udev/scsi_id -g -u /dev/sdc)"
  alias data_1
  }
}
EOF
```
激活 multipath：
```bash
multipath -v2
multipath -ll
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-60cf3566-1b4f-41dc-a42e-db70a5318e43.png)

绑定 UDEV：
```bash
cd /dev/mapper
for i in ocr_* data_*; do
    printf "%s %s\n" "$i" "$(udevadm info --query=all --name=/dev/mapper/"$i" | grep -i dm_uuid)" >>udev_info
done

while read -r line; do
  dm_uuid=$(echo "$line" | awk -F'=' '{print $2}')
  disk_name=$(echo "$line" | awk '{print $1}')
  echo "KERNEL==\"dm-*\",ENV{DM_UUID}==\"${dm_uuid}\",SYMLINK+=\"asm_${disk_name}\",OWNER=\"grid\",GROUP=\"asmadmin\",MODE=\"0660\"" >>/etc/udev/rules.d/99-oracle-asmdevices.rules
done </dev/mapper/udev_info

cat /etc/udev/rules.d/99-oracle-asmdevices.rules
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-ab4b7cfd-a520-45cf-88da-7151ef1639fc.png)

生效 UDEV：
```bash
udevadm control --reload-rules
udevadm trigger --type=devices
ll /dev/asm_*
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-fc092e7b-67fe-494f-b98e-bfb82f50173f.png)

## 6、hosts文件配置（rac01&rac02）
配置hostname：
```bash
hostnamectl set-hostname suse01
hostnamectl set-hostname suse02
```
配置hosts文件：
```bash
cat <<EOF>>/etc/hosts
#Public IP
10.211.55.100 	suse01
10.211.55.101 	suse02

#Private IP
10.10.10.1 suse01-priv
10.10.10.2 suse02-priv

#Vip IP
10.211.55.102 suse01-vip
10.211.55.103 suse02-vip

#Scan IP
10.211.55.105 suse-scan
EOF
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-07d1e0f7-d2ea-4142-aedf-6e01bdd4bb9a.png)

## 7、防火墙配置（rac01&rac02）
```bash
systemctl stop firewalld.service
systemctl disable firewalld.service
systemctl status firewalld.service
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-4ef11584-6fd4-430e-966b-b82d23c121ea.png)

## 8、时间同步配置（rac01&rac02）
禁用 chronyd：
```bash
zypper in -y chrony
timedatectl set-timezone Asia/Shanghai
systemctl stop chronyd.service
systemctl disable chronyd.service
systemctl status chronyd.service
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-0af800ba-c640-426c-b7df-6b73a6337f6a.png)

配置ntpdate时间同步计划任务：
```bash
zypper in -y ntp
##10.211.55.61 为时间服务器IP，每天12点同步系统时间
cat <<EOF>>/var/spool/cron/root
00 12 * * * /usr/sbin/ntpdate -u 10.211.55.61 && /usr/sbin/hwclock -w
EOF
##查看计划任务
crontab -l
##手动执行
/usr/sbin/ntpdate -u 10.211.55.61 && /usr/sbin/hwclock -w
```

## 9、关闭透明大页、HLE和NUMA（rac01&rac02）
SUSE 15 SP3 配置内核文件，关闭透明大页和numa：
```bash
sed -i 's/quiet/quiet transparent_hugepage=never numa=off tsx=off/' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-f0426c2a-6bba-4a0e-90eb-d930ee545796.png)

重启后检查是否生效：
```bash
cat /sys/kernel/mm/transparent_hugepage/enabled
cat /proc/cmdline
```
**📢 注意：** 关闭 `透明大页`、`HLE`和 `numa` 的配置，需要重启主机生效！

## 10、avahi-daemon 配置（rac01&rac02）
有些主机安装选择最小化安装，没有安装 avahi-daemon 功能，建议安装之后禁用，防止以后误操作导致出问题：
```bash
zypper in -y avahi*
systemctl stop avahi-daemon.socket
systemctl stop avahi-daemon.service
pgrep -f avahi-daemon | awk '{print "kill -9 "$2}'
systemctl disable avahi-daemon.service
systemctl disable avahi-daemon.socket
systemctl status avahi-daemon.service
systemctl status avahi-daemon.socket
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-e90f60c2-f12e-4473-a7d0-8245b4bf6ddf.png)

## 11、removeIPC
```bash
sed -i 's/#RemoveIPC=no/RemoveIPC=no/g' /etc/systemd/logind.conf
systemctl daemon-reload
systemctl restart systemd-logind
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-b81c3870-2854-411f-b6c5-6dca20cf69fc.png)

## 12、系统参数配置（rac01&rac02）
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

cat <<EOF >>/etc/sysctl.conf
#OracleBegin
##shmmal's Calculation formula: physical memory 8G：(8*1024*1024*1024)/4096=2097152
##shmmax's Calculation formula: physical memory 8G：(8/2)*1024*1024*1024 -1=4294967295
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
#OracleEnd
EOF
```
生效系统参数：
```bash
sysctl -p
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-481e78eb-e51b-4830-a5de-5205407ea4e3.png)

## 13、系统资源限制配置（rac01&rac02）
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
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-cf194604-34d0-4008-8946-a5a18c33ce82.png)

配置 pam.d/login：
```bash
cat <<EOF>>/etc/pam.d/login
session required pam_limits.so 
session required /lib64/security/pam_limits.so
EOF
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-b6fbbacc-e718-4325-9a7e-4a76c3f80713.png)

配置 shm：
```bash
memTotal=$(grep MemTotal /proc/meminfo | awk '{print $2}')
cat <<EOF >>/etc/fstab
tmpfs /dev/shm tmpfs size=${memTotal}k 0 0
EOF

mount -o remount /dev/shm
df -Th /dev/shm
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c6ecd56b-bebc-45a3-91db-cf428d941388.png)

## 14、安装 rlwrap
```bash
cd /soft
tar -xf rlwrap-0.42.tar.gz
cd rlwrap-0.42
./configure && make && make install
cd /soft
rm -rf rlwrap-0.42*
```

## 15、环境变量配置（rac01&rac02）
root 用户环境变量：
```bash
cat <<EOF >>/root/.profile
################OracleBegin#########################
alias so='su - oracle'
export PS1="[\`whoami\`@\`hostname\`:"'\$PWD]\$ '
alias crsctl='/u01/app/19.3.0/grid/bin/crsctl'
alias sg='su - grid'
################OracleEnd###########################
EOF
```

grid 用户环境变量：
```bash
cat <<EOF >>/home/grid/.profile
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
alias sqlplus='rlwrap sqlplus'
alias rman='rlwrap rman'
alias lsnrctl='rlwrap lsnrctl'
alias asmcmd='rlwrap asmcmd'
alias adrci='rlwrap adrci'
################OracleEnd###########################
EOF
```

**📢 注意：** 每个节点的 ORACLE_SID 不一样（+ASM1/+ASM2），需要自行修改！

oracle用户环境变量：
```bash
cat <<EOF >>/home/oracle/.profile
################OracleBegin#########################
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=/u01/app/oracle/product/19.3.0/db
export ORACLE_HOSTNAME=suse01
export ORACLE_TERM=xterm
export TNS_ADMIN=\$ORACLE_HOME/network/admin
export LD_LIBRARY_PATH=\$ORACLE_HOME/lib:/lib:/usr/lib
export ORACLE_SID=orcl1
export PATH=/usr/sbin:\$PATH
export PATH=\$ORACLE_HOME/bin:\$ORACLE_HOME/OPatch:\$PATH
alias sas='sqlplus / as sysdba'
alias alert='tail -500f \$ORACLE_BASE/diag/rdbms/\$ORACLE_SID/\$ORACLE_SID/trace/alert_\$ORACLE_SID.log|more'
export PS1="[\`whoami\`@\`hostname\`:"'\$PWD]\$ '
alias sqlplus='rlwrap sqlplus'
alias rman='rlwrap rman'
alias lsnrctl='rlwrap lsnrctl'
alias asmcmd='rlwrap asmcmd'
alias adrci='rlwrap adrci'
alias ggsci='rlwrap ggsci'
alias dgmgrl='rlwrap dgmgrl'
################OracleEnd###########################
EOF
```
**📢 注意：** 每个节点的 ORACLE_HOSTNAME（suse01/suse02）和 ORACLE_SID（orcl1/orcl2）不一样，需要自行修改！
## 16、安装介质上传解压（rac01）
>**❤️ Oracle安装包合集和补丁下载地址：[2021年Oracle第三季度补丁合集
](https://www.modb.pro/download/210188)**

安装包使用 XFTP 工具进行上传，只需要上传至一节点 /soft 目录下：
```bash
##上传安装介质到/soft目录
LINUX.X64_193000_db_home.zip
LINUX.X64_193000_grid_home.zip
p33182768_190000_Linux-x86-64.zip
p6880880_190000_Linux-x86-64.zip
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-6024227d-89c3-4a19-adcc-8bf4c04417fd.png)

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
静默解压 RU 补丁安装包：
```bash
cd /soft
chown -R grid:oinstall /soft
su - grid -c "unzip -q -o /soft/p6880880_190000_Linux-x86-64.zip -d /u01/app/19.3.0/grid"
su - grid -c "unzip -q /soft/p33182768_190000_Linux-x86-64.zip -d /soft"
chown -R oracle:oinstall /soft
su - oracle -c "unzip -q -o /soft/p6880880_190000_Linux-x86-64.zip -d /u01/app/oracle/product/19.3.0/db"
chown -R grid:oinstall /soft/33182768
```

**📢 注意：** 由于19C支持安装grid软件前打RU补丁，因此提前解压OPatch和RU补丁，为安装做准备！

root用户下，cvuqdisk安装（rac01&rac02）：

```bash
rpm -ivh /u01/app/19.3.0/grid/cv/rpm/cvuqdisk-1.0.10-1.rpm 
##传输到节点二安装
scp /u01/app/19.3.0/grid/cv/rpm/cvuqdisk-1.0.10-1.rpm suse02:/soft
rpm -ivh /soft/cvuqdisk-1.0.10-1.rpm 
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-fd2786fb-f399-459d-80e6-3e1c281631db.png)

**📢 注意：** 19C 版本的 cvu 包换位置了，目录为：`$ORACLE_HOME/cv/rpm/`，以上所有软件只需要在节点一上传解压即可。

**<font color='orage'>至此，准备工作已经完成，安装前重启主机！</font>**

重启后，检查 numa 和透明大页：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-f57be620-c906-4a98-96a0-5b52ad7beb48.png)

**📢 注意：** 重启后别忘记两个节点 ISCSI 连接共享存储：
```bash
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:10.211.55.61-lucifer -p 10.211.55.61 -l
```

# 四、安装Grid软件（rac01）
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
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-71cbcae5-8e88-49d7-9a2f-fbb1d9083bde.png)

在 vnc 客户端界面输入 10.211.55.100:2，输入刚才输入的密码即可连接：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-4497de5d-d15e-4fa0-83de-e0aac284e77b.png)

打开终端命令行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-e2099eab-14c1-41cd-a1b3-509866275a54.png)

开始安装：
```bash
source ~/.profile
cd $ORACLE_HOME
##执行安装程序开始安装，通过-applyRU参数指向补丁解压位置，提前安装grid补丁
./gridSetup.sh -applyRU /soft/33182768
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-63da339a-4b99-45c1-9aa8-9b4eb4a912ef.png)

**📢 注意：** 可以看到，已经开始对 ORACLE_HOME 进行补丁安装。

补丁打完，进入安装界面，选择集群安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c22418ee-ce69-4a93-aa0a-000061d08e42.png)

选择 standlone 模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-6fab1aa8-1b7b-43f5-8265-2fc72fd19f2d.png)

修改 scan 名称，与 hosts 文件配置 scan 名称保持一致：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-a9332b5f-1981-4954-b4c1-3d193257d125.png)

添加节点二信息，进行互信：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-e0594406-ef13-4f21-ba51-62066b40d316.png)

输入 grid 用户密码，创建用户时两节点必须保持一致。先执行 setup，再执行 test，开始互信：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-2f5e2fa2-7c09-473f-81b9-b79d31beefde.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-ee8ed9ff-c1f0-4f59-83fa-367c229e62e2.png)

确保对应网卡和IP网段对应即可，19C 心跳网段需要选 ASM & Private，用于 ASM 实例的托管：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-39723be5-fa76-405c-936c-59e6f43a4049.png)

选择存储类型，19C 只有两个选项，ASM 只能选 Flex：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-60bfbf4a-1a35-47be-9010-9eae7f57380c.png)

GIMR，这里不选择安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-fbb81df9-31d0-4d34-a3dd-60fb3dfc9425.png)

安装时填创建 OCR 盘，一块盘冗余 External，目录选择 udev 绑的路径：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-513f0cbf-9632-4620-b2d7-c836581da23a.png)

填写 sys/system 密码，需要记住自己设置的密码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-95f4bc68-80df-4f47-8076-cc3e254fdb8f.png)

默认即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-87f28b6c-3507-4b59-a152-785837ceb84c.png)

EM 选择不开，比较占资源，后面安装好后可以配置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-7270b98c-1072-428b-bbee-922a2bb4946f.png)

默认即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-7b0c6fcc-bace-47ac-a822-7029572e153d.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-0c29c580-4492-4cb3-93e4-5a33c22b426b.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-866478d8-e119-47d8-884f-0ac7b36e2487.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-33feb033-548d-4bf9-84b1-283717ccf830.png)

安装预检查：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-4b10bf8c-9350-443b-a2b8-0194d53dea43.png)

两个节点执行依赖安装：
```bash
zypper in -y libcap-ng0-32bit libcap1-32bit libcap2-32bit libgcc_s1-32bit libXtst6-32bit nfs-kernel-server libXi6-32bit libXrender1-32bit libpcre1-32bit libpng16-16-32bit libstdc++6-32bit libaio1-32bit
```
重新检查后，剩下的报错都是 DNS 相关的，可直接忽略：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-370b52cd-2302-4410-8827-5eb80c9876de.png)

开始安装 grid：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-4010f48c-048c-4564-b322-7cb4dd6f47a8.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-cb585a25-6ea1-49a1-9139-48015301dc3d.png)

两节点顺序执行 root.sh，先节点一执行完，再节点二执行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-d50423c9-d69d-4a3c-96e0-2b26358b68fe.png)

两个节点的 root.sh 都执行完之后，继续安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-5e70fe6a-13c0-4cd2-a5f1-aeed4b99c12b.png)

这个错误查过 MOS 可以忽略：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c567aff3-bb39-45c5-82b3-c22b6a8239a9.png)

安装完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-af5b94eb-fea8-4994-84bb-c0823812b9b3.png)

检查集群状态：
```bash
crsctl stat res -t
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-7b62cfad-9a8d-4131-a094-a8adac5ad88b.png)

检查 grid 补丁：
```bash
su - grid
opatch lspatches
sqlplus -version
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-8608662e-5f2a-4870-8060-99c7e3931714.png)

# 五、创建 ASM 数据盘 DATA
这里创建的 DATA 磁盘组主要用于存放数据文件、日志文件等数据库文件！

使用图形化方式添加 ASM DATA 数据盘：
```bash
asmca
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-ffc16ad2-a9f8-46dc-9a12-7b22478eaf5a.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-dc0b730f-0405-434f-a702-f00cde8db590.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-c417fa30-ffd9-4651-a626-40a9bf607fa4.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-fe7dc024-79d0-4f2d-9d16-50037214d258.png)

检查 asm 磁盘：
```bash
asmcmd lsdg
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-03cec725-7cb8-463e-857a-8c3627ee9552.png)

**<font color='orage'>建议重启两台主机，检查重启后 Grid 集群是否正常运行！</font>**

# 六、安装Oracle软件
配置 oracle 用户 vnc 图形界面：
```bash
chown -R oracle:oinstall /soft
##root用户下切换到grid用户
su - oracle
##执行vncserver，按提示输入密码即可
vncserver
##在vnc客户端界面输入10.211.55.100:1，输入刚才输入的密码即可连接。
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-6e937525-9704-4364-8610-eca5092f639c.png)

在 vnc 客户端界面输入 10.211.55.100:1，输入刚才输入的密码即可连接：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-8cd98993-c907-4886-9c81-899960916499.png)

右键打开终端：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-011d2167-3ed1-4d1c-b5bc-47274e4802ad.png)

开始安装：
```bash
##应用环境变量
source ~/.profile
##进入ORACLE_HOME目录
cd $ORACLE_HOME
##执行安装程序开始安装，加上jar包防止弹窗不显示问题
./runInstaller -applyRU /soft/33182768
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211106-8752e3be-bb79-4c8d-b399-98f97fb6a89a.png)

**📢 注意：** 可以看到，已经开始对 ORACLE_HOME 进行补丁安装！

补丁打完，进入安装界面，选择仅安装 Oracle 软件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-53bc6022-e68e-499a-81a0-5c8a2c59523a.png)

选择集群模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-1565ab2a-5e03-4635-be26-a27d6110d620.png)

输入 oracle 用户密码，先执行 setup，再执行 test，开始互信：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-8cd7159b-554c-42f9-a982-405bd6a18f45.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-d418c58b-ae82-41eb-bcf5-e47d22bfd1aa.png)

选择企业版：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-01629f73-16c9-4156-8a96-ced6825c3d43.png)

默认即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-4e4c08ce-6189-4b0c-81e7-22e9c0183b1d.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-e82db2ae-bc5e-4d2a-9731-7410a70f4f1f.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-75ce3bb2-8894-4a52-801e-ba79c7982e87.png)

安装预检查，由于我们只配了一个 SCAN，所以关于 DNS 相关的都无视，继续：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-10f9c9ab-9102-4f96-afda-dcc0a9f08384.png)

开始安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-a71c215c-b283-491d-88ab-f3c0b6a1b43d.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-9a7d06b6-3ff5-4709-b1f8-441756d1696f.png)

root 用户下，两个节点顺序执行 root.sh：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-0847a69f-210a-44a1-871a-d326a7f8bc27.png)

安装完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-71f8172c-4fcd-44db-94c9-c6876fc2c53d.png)

检查补丁版本：
```bash
su - oracle
opatch lspatches
sqlplus -version
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-b85ecea5-2abb-4413-92d0-d1c0337f999c.png)

# 七、创建数据库实例
这里建库还是在第四步安装 Oracle 软件的 vnc 界面中继续：
```bash
dbca
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-82f0aeae-e7a3-4bca-b2f4-5cfe385b7a69.png)

选择创建数据库实例：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-ba538df8-8cee-4021-8ba9-7492bad73471.png)

选择自定义模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-233cf0de-f9d9-4901-bfdc-f468a9ce5ad1.png)

选择基础安装即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-3aed671c-8d97-4efc-8722-18c75102a8ae.png)

选择节点：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-26570c82-bd8b-4cca-8429-8b3762e5d676.png)

填写实例名orcl，由于默认添加为1，2，实例名规划为orcl1/2；选择安装 CDB 模式，不创建PDB：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-e409e030-06dc-4d71-b996-3267f9cec8a1.png)

默认即可，使用 OMF 模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-6206e612-c5e0-4d57-b171-a7f18b153d2e.png)

不开闪回，不开归档，可以建完实例后再配置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-a7308ad4-f0a7-44d8-91d6-0cd16361ec2b.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-e0a40f14-84ce-4b3b-b726-89b4be14e537.png)

配置内存，使用 ASMM 模式，数据库总内存占用物理内存 70%-90% 之间：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-87b64991-8d82-4bde-8957-d7b505c8279c.png)

使用基础模式安装，block_size 是无法修改的，process 进程数修改为1500，根据实际情况修改：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-d5046e16-564a-48ff-bd73-51b0f8c75170.png)

配置数据库字符集，默认 AL32UTF8，国家字符集，默认 AL16UTF16；根据实际情况修改：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-9b095a5a-75d5-4de0-8389-0dc72b5e4664.png)

建议全关掉，有可能导致 bug：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-a43507ba-e51a-4ece-a9af-f35bf64a4eaf.png)

填写sys/system密码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-69e36792-f05f-4c24-a1fb-5c98ca86c0aa.png)

默认即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-f3093b8c-1d65-40c9-8cc9-ab8a4b59e794.png)

安装预检查，DNS 相关忽略：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-ce0cd8ad-0068-4ed5-b336-1e5c1f618fcd.png)

开始安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-b690e780-e45d-4c51-90b8-fe616d81fbb6.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-3b8590f7-08f7-4a71-8418-c034caf42c7d.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-89969f03-6d86-476e-947e-2eaec9b2825b.png)

经过漫长的等待，数据库建完了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211107-5f3f2247-b7de-4751-8cc2-7d320434164f.png)

**<font color='orage'>至此，数据库实例创建完成！</font>**

# 八、数据库优化配置（rac01）
## 1、开启数据库归档模式
关于开启归档模式，具体可参考文章：
>**[Oracle 开启归档模式](https://luciferliu.blog.csdn.net/article/details/120250918)**

```bash
##关闭数据库实例
srvctl stop database -d orcl
##开启单个节点到mount模式
srvctl start instance -d orcl -i orcl1 -o mount
##开启归档
sqlplus / as sysdba
alter database archivelog;
##设置归档路径
ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=+DATA';
exit;
##重启数据库实例
srvctl stop instance -d orcl -i orcl1
srvctl start database -d orcl
##检查归档
sqlplus / as sysdba
archive log list
```

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
    echo 'source ~/.profile'
    echo 'deltime=`date +"20%y%m%d%H%M%S"`'
    echo "rman target / nocatalog msglog /home/oracle/scripts/del_arch_\${deltime}.log<<EOF"
    echo 'crosscheck archivelog all;'
    echo "delete noprompt archivelog until time 'sysdate-7';"
    echo "delete noprompt force archivelog until time 'SYSDATE-10';"
    echo 'EOF'
} >>/home/oracle/scripts/del_arch.sh
chmod +x /home/oracle/scripts/del_arch.sh
```

切换到 oracle 用户写入计划任务：
```bash
cat <<EOF>>/var/spool/cron/oracle
12 00 * * * /home/oracle/scripts/del_arch.sh
EOF
##手动执行测试
su - oracle
/home/oracle/scripts/del_arch.sh
```

## 3、配置数据库开机自启
配置数据库实例随集群服务自启动：
```bash
##root用户下执行
/u01/app/19.3.0/grid/bin/crsctl modify resource "ora.orcl.db" -attr "AUTO_START=always" -unsupported
```
**📢 注意：** `ora.orcl.db` 中的 orcl 是指 db 名称；需要在 root 用户下执行！

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

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎**点赞+关注**，我会持续分享数据库知识、运维技巧。
