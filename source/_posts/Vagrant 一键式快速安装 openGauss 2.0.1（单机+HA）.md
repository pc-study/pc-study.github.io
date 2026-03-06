---
title: Vagrant 一键式快速安装 openGauss 2.0.1（单机+HA）
date: 2021-09-12 10:16:05
tags: [opengauss,opengauss训练营]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/108365
---

@[TOC](目录)

# 📚 前言
关于 `openGauss` 数据库的安装，参考自 `贾军锋` 老师的两篇文章：
- [一键部署openGauss2.0.1[CentOS 7.6]](https://www.modb.pro/db/106407)
- [openGauss 2.0.0 安装部署(1主+1备+1级联备)](https://www.modb.pro/db/49097)

文中详细的介绍了 openGauss 数据库的安装过程和脚本，感兴趣的朋友可以按照文章一步步进行安装，这里不做介绍了！

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-d96e3e42-b66a-406a-a622-0a4c7da1c1fb.png)

❤️ 如果不想通过安装直接使用 `openGauss` 学习，可以直接使用墨天轮平台的 **[在线openGauss实训平台](https://www.modb.pro/marketlist?type=1)**！
```
我们为大家提供了在线openGauss实训平台👇
https://www.modb.pro/marketlist?type=1

✅1分钱即可领取，开箱即用、一键连接，可以随时随地通过浏览器连接到部署好数据库的Linux系统中学习
这里可以查看操作手册👉modb.pro/db/104002?xzs
```

同时支持 `MYSQL`，`openGauss`，`Redis`，`PostgreSQL`！

# ☀️ 介绍

本文主要介绍使用 Vagrant 来快速部署 openGauss 2.0.1 版本的 `单机` 和 `HA` 两种模式！🎉
- **单机**：一台主机，我理解为 **一主无备**
- **HA**：三台主机，最简单的 **一主一备一级联**

**<font color='orage'>📢 下面列几个需要注意的点：</font>**

- 务必下载安装 `Vagrant` 和 `Virtualbox` 最新版，支持 Windows 和 macOS
- 确保磁盘空间足够，Windows 主机尽量不要放在 C 盘
- 主机 root 用户密码均为：`opengauss`

**📢 注意：本文使用 `macOS` 进行安装演示，不是 `Linux` ！** 
# ❤️ 安装前准备

## 下载脚本
脚本下载链接：[https://www.modb.pro/download/271405](https://www.modb.pro/download/271405)

## 安装软件

建议使用最新版 [vagrant](https://www.vagrantup.com/downloads) 和 [virtualbox](https://www.virtualbox.org/wiki/Downloads)，请确保你本地安装了它们。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-063d9ace-0e0e-4d68-a71d-e3e5977400ce.png)

# 🏆 安装
安装主要分为两个步骤：
- 使用 Vagrant 一键安装主机：`vagrant up`
- 连接安装好的主机，执行安装：`sh og_install.sh`

可以简单的理解为 **两行命令** 部署 openGauss！👌🏻

## 🌴 单机

### Vagrant 一键部署主机
首先，进入 git 下载好的项目目录 `InstallOracleshell/openGauss/Single` 路径下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-88382142-5ac9-4035-a0a0-3e66a48e4940.png)

如果，你想要 **傻瓜式安装**，啥也不管，直接执行 `vagrant up` 即可！

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-2a7d2179-4000-4329-96fd-68941c7a3a68.png)

**<font color='red'>中间执行过程省略...</font>**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-f1626348-d4c7-49cd-96b1-322bcdb712cc.png)

**<font color='orage'>📢 注意：第一次执行时，初始化需要下载 vbox（大概400多M）会比较慢，多等一会儿就行！</font>**

**但是，由于是教程，我还是要略微介绍一下：**
```
├── README.md
├── Vagrantfile
├── config
│   └── vagrant.yml
└── scripts
    ├── GaussInstall.sh
    └── env.sh
```
如果只是作为用户来说，只需要了解 `vagrant.yml` 这个配置文件即可：
```ruby
box: luciferliu/centos7.9
vm_name: openGauss
hostname: openGauss		## 主机名 openGauss
mem_size: 4096			## 主机内存 4G
cpus: 2				## 主机CPU 2颗
public_ip: 192.168.56.100  	## 主机IP
non_rotational: 'on'
gauss_install_dir: /gaussdb 	## openGauss安装目录
```
不了解的朋友，建议不要修改！如果需要修改，只动 `hostname`，`public_ip`，`gauss_install_dir`即可！

### Shell 快速安装 openGauss

我们已经通过 vagrant 一键部署好了，在执行安装之前，还需要重启一下主机！
- `vagrant halt` 关闭主机
- `vagrant up` 开启主机

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-c628f402-0cbf-4bfe-928d-e51d82ec44a5.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-387e9512-983e-4083-bdb7-ae12141d9cbd.png)

使用 `vagrant ssh` 连接主机，切换到 `root` 用户，进入 `/soft` 目录，执行安装命令 `sh og_install.sh`：
```bash
vagrant ssh
su - root ## root密码：opengauss
cd /soft
sh og_install.sh
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-50978e31-230e-4b78-bad8-e59a02bcbdaa.png)

**📢 注意：安装并非是一键，过程中需要输入 `yes`，`omm用户密码2次`，`Database管理用户密码2次`！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-181b0caf-4ab7-4f6b-b767-2db55c840cd3.png)

**<font color='orage'>至此， openGauss 2.0.1 单机模式安装成功！</font>🎉**

## 🍁 HA

HA 模式基本与 `单机` 模式的部署步骤一致，因此不做详细介绍，直接演示！

### Vagrant 一键部署主机
首先，进入 git 下载好的项目目录 `InstallOracleshell/openGauss/HA` 路径下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-178b6e97-0abd-4fa5-8309-b7eba686386d.png)

如果，你想要 **傻瓜式安装**，啥也不管，直接执行 `vagrant up` 即可！

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-96bb9683-a2ea-419f-ab60-423e99ae7dde.png)

**<font color='red'>中间执行过程省略...</font>**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-f1626348-d4c7-49cd-96b1-322bcdb712cc.png)

**<font color='orage'>📢 注意：由于需要同时安装配置 3 台主机，因此会比较慢一些，多等一会儿就行！</font>**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-93b1087d-c1f6-433a-a399-3dc9807b12a1.png)

**<font color='orage'>如上所示，三台主机均已安装完成，并且完成基础环境配置！😄</font>**

**但是，由于是教程，我还是要略微介绍一下：**
```
├── README.md
├── Vagrantfile
├── config
│   └── vagrant.yml
└── scripts
    ├── GaussInstall.sh
    └── env.sh
```
如果只是作为用户来说，只需要了解 `vagrant.yml` 这个配置文件即可：
```ruby
box: luciferliu/centos7.9
vm_name: openGauss
hostname: openGauss		## 主机名 openGauss
mem_size: 4096			## 主机内存 4G
cpus: 2				## 主机CPU 2颗
public_ip: 192.168.56.100  	
non_rotational: 'on'
gauss_install_dir: /gaussdb 	
env:
  box: luciferliu/centos7.9
  mem_size: 4096		## 主机内存 4G
  cpus: 2			## 主机CPU 2颗
  non_rotational: 'on'
  gauss_install_dir: /gaussdb	## openGauss安装目录

node1:
  vm_name: prod			
  hostname: prod		## 主节点主机名
  public_ip: 192.168.56.100     ## 主节点主机IP

node2:
  vm_name: standby
  hostname: standby		## 备节点主机名
  public_ip: 192.168.56.101	## 备节点主机IP

node3:
  vm_name: casstb	
  hostname: casstb		## 级联节点主机名
  public_ip: 192.168.56.102	## 级联节点主机IP
```
不了解的朋友，建议不要修改！如果需要修改，只动 `hostname`，`public_ip`，`gauss_install_dir`即可！

### Shell 快速安装 openGauss

我们已经通过 vagrant 一键部署好了，在执行安装之前，还需要重启一下主机！
- `vagrant halt` 关闭主机
- `vagrant up` 开启主机

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-b993b35f-909e-438b-8675-38f910ba23d7.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-6951124c-ab0c-4ef0-8428-fc804ede2828.png)

使用 `vagrant ssh node1` 连接主机，切换到 `root` 用户，进入 `/soft` 目录，执行安装命令 `sh og_install.sh`：
```bash
vagrant ssh node1
su - root ## root密码：opengauss
cd /soft
sh og_install.sh
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-bb830c30-7182-4c22-a11a-279e60f99714.png)

**📢 注意：安装并非是一键式，过程中需要输入 `yes`，`root用户密码`，`yes`，`omm用户密码2次`，`Database管理用户密码2次`！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210912-881ac44c-32ca-4d0a-ab40-e7de6c4fffa8.png)

**<font color='orage'>至此， openGauss 2.0.1（一主一备一级联）模式安装成功！</font>🎉**

# 🌧 写在最后

作者目前对于 openGauss 的了解还停留在安装部署的层面，如有错误 ❌，请及时指正！谢谢~

**⭐️ 关于 Vagrant 快速安装 Oracle 数据库可以参考专栏：[零基础快速安装 Oracle 本地环境
](https://www.modb.pro/topic/100755)**

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️
![](https://img-blog.csdnimg.cn/20210702105616339.jpg)


