---
title: 拓展版：一键式安装 Vertica 数据库（单机 & 3节点集群），10 分钟不到！
date: 2021-12-15 15:12:12
tags: [墨力计划,vertica]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/210638
---

# 前言
在体验过 `Vertica` 单机版和集群安装之后，”偷懒“的我为了方便安装测试，于是又搞了一个自动化一键安装，本文的一键安装介绍和使用。

**😄 脚本下载：**
>**一键安装脚本的源码下载：[《墨天轮资源：vertica 一键安装脚本源码》](https://www.modb.pro/download/293107)**

**💻 视频教程可跳转：**
- [一键安装 Vertica 数据库（单节点）](https://www.bilibili.com/video/BV1MY411W7R1)
- [两键安装 Vertica 数据库（3节点集群）](https://www.bilibili.com/video/BV1Mi4y1d79k)

**🎉 更多关于 Vertica 可以参考下方文章：**

- [《初识 Vertica ，看完白皮书，我都发现了啥》](https://www.modb.pro/db/194763)
- [《Vertica 架构：Eon 与企业模式》](https://www.modb.pro/db/196644)
- [《初体验：Centos7.9 单节点安装 Vertica 11 社区版（超详细教程）》](https://www.modb.pro/db/195927)
- [《Vertica 玩转示例数据库：VMart》](https://www.modb.pro/db/196694)
- [《Vertica 安装配置 MC（管理控制台）》](https://www.modb.pro/db/196754)
- [《进阶版：Centos7.9 安装 Vertica 11 社区版 3 节点集群（详细教程）》](https://www.modb.pro/db/196801)

**🏆 作者写的 [《Vertica 技术文章合集》](https://www.modb.pro/topic/194826)**，欢迎阅读 👏🏻！

# 介绍
本文主要介绍使用 Vagrant 来快速部署 `vertica 11.0.1` 版本的 `单机` 和 `HA` 两种模式！🎉
- **单机**：一台主机，单个节点
- **HA**：三台主机，3 节点集群，没有主备之分

**<font color='orage'>📢 下面列几个需要注意的点：</font>**
- 务必下载安装 `Vagrant` 和 `Virtualbox` 最新版，支持 Windows 和 macOS
- 确保磁盘空间足够，Windows 主机尽量不要放在 C 盘
- 主机 root 用户密码均为：`vertica`
- Vagrant 官网下载：[https://www.vagrantup.com/downloads](https://www.vagrantup.com/downloads)
- VirtualBox 官网下载：[https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads)

# 安装

## 🌴 单机
单机版本只需要使用 Vagrant 一键安装：`vagrant up`。

**1、上传安装包**

下载源码后，进入 `Single` 目录下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-554cbb15-9a31-4ca3-ad1b-40dcebc82143.png)

查看 `software` 目录下的 `README`，上传所需安装包：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-628816f7-b9ed-4866-ab96-9ad2db83b385.png)

>**安装包下载地址：** [https://www.modb.pro/download/273825](https://www.modb.pro/download/273825)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-02febebb-a699-4474-bfda-51e79b7089a8.png)

**2、开始安装**

上传成功后，返回 `Single` 目录下，直接开始安装：
```bash
vagrant up
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-9f6398aa-9b86-4e4f-ada0-a073921b226e.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-b94ffaa8-fd85-4038-ab03-5ef432e0b989.png)

等待个 `3~5` 分钟左右吧，`vertica 软件` + `VMart 数据库` + `MC 管理控制台` 就都装好了！

**3、连接访问**

连接主机可以使用 `ssh` 或者 `vagrant` 的命令都可以！
```bash
vagrant ssh
## dbadmin 密码为 dbadmin，root 密码为 vertica
ssh dbadmin@192.168.56.100
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-c3c07d6a-788f-47bb-a0d9-4cc7d6238e26.png)

连接之后就可以使用 `admintools` 或者 `vsql` 来连接数据库进行操作学习，或者直接用 vsql 客户端连接也行！

## 🔥 集群
集群版本的安装方式和单机版本只有一点差别，就是需要两步，**安装包上传就不讲了，直接从安装开始**！

![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-16c91a2d-1f74-4163-8bd8-63fe1f30e72b.png)
**1、安装配置操作系统**

下载源码后进入 `HA` 目录下，执行 `vagrant up` 安装 3 节点主机并配置系统：
```bash
vagrant up
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-455acb13-b0f0-4c06-9b62-ab8ba34ccf64.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-0e2993ac-1ec0-4bee-962c-300582b55a2c.png)

等待 `3~5` 分钟左右，即安装配置完成！

**2、安装 vertica**

连接到 `节点一` 进行 `vertica 软件` + `VMart 数据库` + `MC 管理控制台` 的安装！
```bash
vagrant ssh node1
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211215-98f44c98-9600-4876-927a-afd1442083ac.png)

**执行一条命令即可：**
```bash
sh /soft/InstallVertica.sh
```
等待命令执行完成即可，全程不超过 10 分钟！

# 🌧 写在最后
作者目前对于 `vertica` 的了解还停留在安装部署的层面，如有错误 ❌，请及时指正！谢谢~