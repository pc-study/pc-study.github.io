---
title: ❤️ 硬核！2021年，微软居然开源了 Linux ？不敢信！发行版：CBL-Mariner！
date: 2021-08-28 02:08:14
tags: [cbl-mariner]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/103835
---

@[TOC](目录)

# 🌲 前言

`CBL` 代表 Common Base Linux，`Mariner` 的目标是用作微软工程团队的内部 Linux 发行版，以构建云基础设施和边缘产品和服务。

# ☀️ 介绍

`Mariner` 是开源的，它在微软的 GitHub 组织下有自己的存储库。**<font color='red'>目前没有提供 Mariner 的 ISO 或映像，需要自行编译</font>**，但是 repo 有在 Ubuntu 18.04 上构建它们的说明。

**<font color='oragen'>文末有博主编译好的 ISO 文件，可以直接下载安装体验！</font>**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-cba68eb3-ec17-4643-9190-63daf4aa6d6e.png)

此GitHub 页面中列出了一系列先决条件，大致包括 Docker、RPM 工具、ISO 构建工具和 Golang 等。

>**官方源：** [https://github.com/pc-study/CBL-Mariner](https://github.com/pc-study/CBL-Mariner)

# 🍉 编译 CBL 镜像文件

❤️ 接下来，我们就本地编译一个镜像文件来玩玩！

## 编译环境准备

官方建议使用 `ubuntu 18.04` 版本进行编译，其他版本不知道是否可以！

### vagrant 安装 ubuntu 18.04

由于需要在 `Ubuntu 18.04` 上进行构建，因此使用 `vagrant` 本地快速创建一台虚拟机环境。

```bash
mkdir -p /Volumes/DBA/vagrant/ubuntu1804
cd /Volumes/DBA/vagrant/ubuntu1804
vagrant init generic/ubuntu1804
vagrant up --provider=virtualbox
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-8d08f67c-4ec2-418d-bfe5-d00fd6260209.png)

### 连接主机修改密码

```bash
vagrant ssh
sudo passwd root
su - root
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-066348ad-91ae-4a86-8b96-ed7b42a16264.png)

## 先决条件配置

**添加一个 backports 存储库以安装最新版本的 Go:**

```bash
sudo add-apt-repository ppa:longsleep/golang-backports
sudo apt-get update
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-61fb39aa-32b5-4a84-9e70-2466d0d2bf57.png)

**1、安装所需的依赖项：**

```bash
sudo apt -y install make tar wget curl rpm qemu-utils golang-1.15-go genisoimage python-minimal bison gawk parted
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-97040ff8-55c8-4ac5-87a7-79addcef2f06.png)

**2、推荐安装 `pigz` ，但不是必须，用于更快的压缩操作：**

```bash
sudo apt -y install pigz
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-a9d7cf5e-e214-4568-b7eb-c002d145d55a.png)


**3、修复 go 1.15 link：**
```bash
sudo ln -vsf /usr/lib/go-1.15/bin/go /usr/bin/go
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-4440f71f-fd55-49ff-b49d-078f37d6468f.png)

**4、安装 docker：**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-cd3a8066-e301-434b-997d-9edf4fe24a5f.png)

配置完成后建议关闭主机：

```bash
vagrant halt
```


## 下载 CBL-Mariner 项目

由于官方源太慢，于是我 fork 到了我的 **gitee 仓库**：[https://gitee.com/luciferlpc/CBL-Mariner](https://gitee.com/luciferlpc/CBL-Mariner)。

```bash
git clone https://gitee.com/luciferlpc/CBL-Mariner.git
```

**下载到本地之后，上传到服务器主机中：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-3a5f9886-55e3-4125-a8a8-310710a23a64.png)

编辑 Vagrantfile 文件，挂载当前目录到主机 /vagrant 目录：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-be3b594a-1524-4599-b2bc-1eaa7d7a12ae.png)

重新启动 Ubuntu 主机：
```bash
cd /Volumes/DBA/vagrant/ubuntu1804
vagrant up
```

**或者通过 ftp 等工具进行上传！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-854951f4-0b5f-491b-b616-332737a0dbf0.png)

**同步到最新的稳定版本：**

```bash
git checkout 1.0-stable
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-0dab33c8-5295-474e-8622-2a31ce8b9c5e.png)

**把文件拷贝到 /opt 目录下：**

```bash
cp -r /vagrant/CBL-Mariner /opt
```

## 构建 VHD 或 VHDX 镜像

**<font color='green'>📢 注意：这里有个小问题，关于解析和GO：</font>**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-998fae4e-9f13-4990-b062-2b6ebf34e082.png)

**修复：**

```bash
export GO111MODULE=on
export GOPROXY=https://goproxy.io
echo '47.246.43.224 goproxy.cn' >>/etc/hosts
echo '140.82.121.3 github.com' >>/etc/hosts
echo 'nameserver 8.8.8.8' >>/etc/resolv.conf
echo 'nameserver 8.8.4.4' >>/etc/resolv.conf
```

### 构建 VHDX 镜像 

**镜像放在../out/images/core-efi：** 

```bash
cd toolkit
sudo make image REBUILD_TOOLS=y REBUILD_PACKAGES=n CONFIG_FILE=./imageconfigs/core-efi.json
```

构建过程中，可能存在域名无法解析的问题，可以访问：https://packages.microsoft.com/cbl-mariner/1.0/prod/，手动下载缺少的 rpm 包。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210827-d101148d-a769-48c2-aca1-9877b122a10d.png)

等待很久很久时间后，完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-461898a5-296f-4bbc-8773-dd1cfb782dcc.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-db453cb3-b955-4912-a59c-994c2e2f599c.png)

### 构建 VHD 镜像 
**镜像放在../out/images/core-legacy：**

```bash
cd toolkit
sudo make image REBUILD_TOOLS=y REBUILD_PACKAGES=n CONFIG_FILE=./imageconfigs/core-legacy.json
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-94645bb9-f43c-4740-9042-9bed2c7f02e6.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-43d23fa2-cf84-4912-a642-2a1f9691ea15.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-4d4058c4-32d1-4b02-b6e9-a21bd2728aa1.png)

### 构建 cloud-init 配置镜像

**镜像放在../out/images/meta-user-data.iso**

```bash
cd toolkit
sudo make meta-user-data
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-c73f4af2-c427-4ce7-a627-4b041d41e1e2.png)

### 新建并访问主机

使用 `virtualbox` 创建 VHD(X) 虚拟机。

**1、创建新主机**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-431bafd2-969b-4a9b-9490-85c435bff274.png)

**2、选择编译好的 VHD(X) 文件**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-1ecd0ef2-a3b9-4580-ad63-cd6df80a631a.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-06e49eaf-f2ec-44ee-89f6-f5113189392d.png)

**3、挂载 Meta-User-Data.Iso 镜像**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-d95fcb38-1188-4b1d-8354-e31fc8c6105c.png)

**4、启动并登录虚拟机**

账号密码：

```
mariner_user/p@ssw0rd
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-df93564f-a905-4845-8972-6b3d3cb55f03.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210828-28ad531d-2903-473f-8e8b-ce46487c090e.png)

**总体来说，Linux 的命令都差不多。**

## 构建 ISO 镜像

**镜像放在../out/images/full**

```bash
cd toolkit
sudo make iso REBUILD_TOOLS=y REBUILD_PACKAGES=n CONFIG_FILE=./imageconfigs/full.json
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-3f8a5269-4a04-41c3-9da2-58f8c98a3de9.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-e36c6cf5-f3a8-4d80-95c0-373c49df2fd0.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-8ead2deb-186f-45f1-becd-4fe17da9586b.png)

**生成的 ISO 镜像大概 700M 不到。**

### 用 ISO 镜像安装系统

#### 终端模式安装

**1、创建新主机：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-f67cdb48-da1c-4884-8ade-efbb66017d43.png)

后面选项全都默认即可。

**2、挂载上面生成的 ISO 镜像：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-866db649-b546-4734-8d49-bf9ceb5c89a0.png)

**3、启动主机并安装：**

选择安装模式：分为终端和图形化，本次选择终端安装。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-dca7594f-a2f2-43f1-a9b4-6fdf97b80eab.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-fe2815ae-e060-4f5f-9235-0f0184da7800.png)

选择完全安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-0599c4d0-b0fe-4233-b1f4-7c5a0b15e6ea.png)

选择系统安装盘：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-983f2aec-77ed-465d-8c94-3c9ca49168b2.png)

跳过磁盘加密：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-0b373edb-b313-43c5-8673-a9615387b010.png)

设置主机名：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-d4f1ff10-545d-469d-8cd5-24fabcdbc01a.png)

创建用户和密码：密码规则要求较高。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-ae82b989-d469-4699-bcc7-dab42d4d1bbc.png)

开始安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-c914e62c-6538-43b9-9735-7ec4859d53f5.png)

安装完重启：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-d123e1e3-ef68-4459-8994-c40858f4fee0.png)

#### 图形化模式安装

**1、创建新主机：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-f67cdb48-da1c-4884-8ade-efbb66017d43.png)

后面选项全都默认即可。

**2、挂载上面生成的 ISO 镜像：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-866db649-b546-4734-8d49-bf9ceb5c89a0.png)

**3、启动主机并安装：**

选择安装模式：分为终端和图形化，本次选择图形化安装。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-dc94cb69-f755-4e2d-bb7c-32c45700c6e3.png)

选择完全安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-42c10a24-7573-4557-a3e9-8334e7386fe1.png)

选择接受协议：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-85de4853-d658-43fc-90d9-5ef8a3ba32da.png)

不加密磁盘：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-b2144dfd-5ce2-4adf-a0a4-7c41ee16ae3d.png)

创建用户密码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-19c814cc-8c05-4f49-b480-da0911eb822e.png)

开始安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-835a9a9e-4cee-4c61-9781-1e34012f53f5.png)

安装完重启：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-c043bd2b-6878-47ed-b8b5-d6a0dba2f1c6.png)

重启后连接：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-9567e578-dc83-4046-8aa5-5d878028c2e7.png)

**<font color='green'>⭐️ 至此，CBL-Mariner 已经成功安装体验过！</font>**

# ❄️ 写在最后

**如果不想自己编译 ISO 镜像的朋友，可以直接下载我编译好的镜像安装体验！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210828-ba65e427-79f7-4b0c-a40e-e8e2aeb022f1.png)

**<font color='Persimmon'>可以扫码关注我公众号，菜单栏自取！</font>**

![Lucifer三思而后行](https://img-blog.csdnimg.cn/20210702105616339.jpg)

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️







