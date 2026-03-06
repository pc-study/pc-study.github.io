---
title: Veeam：在 CentOS/RHEL7 上安装 Agent
date: 2025-09-14 23:28:05
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1967141103941988352
---

# 前言
最近在做一些恢复演练的项目，需要用到 Veeam 备份软件，但是之前没怎么接触过，所以学习过程中遇到了一些问题，比如安装 Agent 的坑。

本文介绍两种 Agent 安装方式，以便后续查阅。

# 推送安装
Veeam 支持直接在控制台推送安装 Agent，比较方便，但是经常会遇到 veeam 的 rpm 包安装不成功的情况：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250914-1967141081405992960_395407.png)

由于缺各种依赖包，所以无法成功推送安装，比如 `dkms` 依赖包：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250914-1967141779262681088_395407.png)

但是在 rhel7 的软件源里也找不到 dkms，需要安装 epel 源才能安装成功 `dkms`，再推送才能安装成功，epel 又需要连接外网，所以很多时候这种方式也不是很方便。

# 手动安装
查了 Veeam 官方文档，发现不依赖 `dkms` 也可以安装 Agent：
>https://helpcenter.veeam.com/archive/agentforlinux/50/userguide/installation_process.html

![](https://oss-emcsprod-public.modb.pro/image/editor/20250914-1967241242471837696_395407.png)

由于推送安装的方式使用的是 `veeamsnap`，而不依赖 `dkms` 包需要使用 `kmod-veeamsnap`，所以我们完全可以手动安装 Agent。

>Veeam 官方客户端离线安装包下载地址：[https://repository.veeam.com/.private/rpm/el/7/x86_64/](https://repository.veeam.com/.private/rpm/el/7/x86_64/)

先手动下载安装 Agent 所需的 rpm 包：
```bash
## 懒得去一个个找的，也可以直接使用 curl 方式下载到本地
curl -O https://repository.veeam.com/.private/rpm/el/7/x86_64/veeam-6.2.0.101-1.el7.x86_64.rpm
curl -O https://repository.veeam.com/.private/rpm/el/7/x86_64/veeam-libs-6.2.0.101-1.x86_64.rpm
curl -O https://repository.veeam.com/.private/rpm/el/7/x86_64/kmod-veeamsnap-6.2.0.101-1.el7.x86_64.rpm
```
上传到需要安装 agent 的主机后，按照如下顺序进行安装：
```bash
[root@mysql5 ~]# rpm -ivh veeam-libs-6.2.0.101-1.x86_64.rpm 
warning: veeam-libs-6.2.0.101-1.x86_64.rpm: Header V4 RSA/SHA1 Signature, key ID efdcea77: NOKEY
Preparing...                          ################################# [100%]
Updating / installing...
   1:veeam-libs-6.2.0.101-1           ################################# [100%]
[root@mysql5 ~]# rpm -ivh kmod-veeamsnap-6.2.0.101-1.el7.x86_64.rpm 
warning: kmod-veeamsnap-6.2.0.101-1.el7.x86_64.rpm: Header V4 RSA/SHA1 Signature, key ID efdcea77: NOKEY
Preparing...                          ################################# [100%]
Updating / installing...
   1:kmod-veeamsnap-6.2.0.101-1.el7   ################################# [100%]
[root@mysql5 ~]# rpm -ivh veeam-6.2.0.101-1.el7.x86_64.rpm 
warning: veeam-6.2.0.101-1.el7.x86_64.rpm: Header V4 RSA/SHA1 Signature, key ID efdcea77: NOKEY
Preparing...                          ################################# [100%]
Updating / installing...
   1:veeam-6.2.0.101-1.el7            ################################# [100%]
Created symlink from /etc/systemd/system/multi-user.target.wants/veeamservice.service to /usr/lib/systemd/system/veeamservice.service.
```
安装完成后，在 Veeam 控制台手动添加一下主机即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250914-1967248001659842560_395407.png)

直接就提示安装成功了。


