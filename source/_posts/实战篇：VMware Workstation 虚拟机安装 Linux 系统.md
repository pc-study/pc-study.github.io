---
title: 实战篇：VMware Workstation 虚拟机安装 Linux 系统
date: 2021-11-04 16:11:24
tags: [墨力计划,vmware]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/156576
---

# 前言
很多朋友工作学习中需要在 Windows 上安装 Linux 系统，最常用的就是使用 VMware Workstation 虚拟机。

![](https://img-blog.csdnimg.cn/a8a19fe31fa041d9ae7ed8267d18003f.png)

**<font color='orage'>本文将讲解如何在 VMware Workstation 上安装 Linux 主机！</font>**

# 一、安装前准备
## 1、下载 VMware Workstation
>请跳转官方网站进行下载：[下载 VMware Workstation Pro](https://www.vmware.com/cn/products/workstation-pro/workstation-pro-evaluation.html)

## 2、下载 Linux 系统
安装 Linux 服务器可选择：Centos，Redhat，Oracle Linux。
- RedHat下载：https://developers.redhat.com/products/rhel/download
- OracleLinux下载：https://yum.oracle.com/oracle-linux-isos.html
- Centos下载：https://vault.centos.org/

**📢 注意：** 上述 **Linux 安装包** 可点击链接跳转获取：

**`Linux 安装包`：** [https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw](https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw)
## 3、安装 VMware Workstation
安装比较简单，不做演示啦！一直下一步。。。。。。
# 二、开始安装
## 1、创建 Linux 主机
确认安装好 VMware Workstation 虚拟机后，打开虚拟机软件，开始创建 Linux 系统。

新建虚拟机：

![](https://img-blog.csdnimg.cn/20210531140639293.png)

选择典型：

![](https://img-blog.csdnimg.cn/20210531140704926.png)

选择稍后安装操作系统：

![](https://img-blog.csdnimg.cn/20210531140758938.png)

选择 Linux，选择需要安装的版本：

![](https://img-blog.csdnimg.cn/20210531140904431.png)

修改虚拟机名称和位置：

![](https://img-blog.csdnimg.cn/20210531141025730.png)

修改虚拟机磁盘空间大小：

![](https://img-blog.csdnimg.cn/20210531141207889.png)

选自定义硬件：

![](https://img-blog.csdnimg.cn/20210531141242697.png)

网卡改为桥接模式，CD/DVD 选择已下载好的 Linux 镜像文件，本文选择 Linux 7.6 版本：

![](https://img-blog.csdnimg.cn/20210531141442681.png)

**📢 注意：** 如果需要修改CPU，内存，网卡数量，硬盘等，可以在上面自定义硬件中修改。

创建完成：

![](https://img-blog.csdnimg.cn/2021053114161221.png)

**<font color='orage'>至此，Linux 主机创建成功，接下来开始安装 Linux 系统！</font>**

## 2、安装Linux主机
打开上面创建好的主机：

![](https://img-blog.csdnimg.cn/20210531141822418.png)

回车跳过等待：

![](https://img-blog.csdnimg.cn/2021053114190158.png)

检查镜像中，可以 ESC 跳过：

![](https://img-blog.csdnimg.cn/20210531141937610.png)

选择语言，开始安装：

![](https://img-blog.csdnimg.cn/20210531142101156.png)

选择时区为上海：

![](https://img-blog.csdnimg.cn/20210531142237517.png)

![](https://img-blog.csdnimg.cn/20210531142300763.png)

关闭 KDUMP：

![](https://img-blog.csdnimg.cn/20210531142400475.png)

选择图形化界面安装：

![](https://img-blog.csdnimg.cn/20210531142436935.png)

选择自定义分区：

![](https://img-blog.csdnimg.cn/20210531142717255.png)

![](https://img-blog.csdnimg.cn/20210531142634494.png)

选完之后，点击 Done：

![](https://img-blog.csdnimg.cn/20210531142833912.png)

添加/boot分区，默认 `2GiB` 即可：

![](https://img-blog.csdnimg.cn/2021053114293358.png)

添加 swap 分区，建议等于物理内存大小，可大于物理内存：

![](https://img-blog.csdnimg.cn/20210531143045397.png)

剩余磁盘空间全部划给根目录 / 即可：

![](https://img-blog.csdnimg.cn/20210531143124303.png)

![](https://img-blog.csdnimg.cn/20210531143211919.png)

配置网络和主机名：

![](https://img-blog.csdnimg.cn/20210531143237513.png)

![](https://img-blog.csdnimg.cn/202105311433325.png)

修改主机名为 redhat7，可自定义，无需保持一致：

![](https://img-blog.csdnimg.cn/20210531143455609.png)

配置网络为固定 IP，IP 等信息根据本机实际网络情况填写：

![](https://img-blog.csdnimg.cn/20210531143603298.png)

点击开始安装：

![](https://img-blog.csdnimg.cn/20210531143639841.png)

修改 root 用户密码：

![](https://img-blog.csdnimg.cn/2021053114375715.png)

![](https://img-blog.csdnimg.cn/20210531143816734.png)

如果提示密码强度弱，点击两次 Done 即可通过：

![](https://img-blog.csdnimg.cn/20210531143927432.png)

等待安装结束，点击 Reboot 重启主机：

![](https://img-blog.csdnimg.cn/20210531144921419.png)

勾选 License 声明：

![](https://img-blog.csdnimg.cn/20210531145116960.png)

![](https://img-blog.csdnimg.cn/20210531145139107.png)

点击完成配置：

![](https://img-blog.csdnimg.cn/20210531145213448.png)

配置时区，选择上海：

![](https://img-blog.csdnimg.cn/20210531145613324.png)

创建用户 zhangsan：

![](https://img-blog.csdnimg.cn/20210531145713337.png)

![](https://img-blog.csdnimg.cn/20210531145744527.png)

这里需要强密码，否则无法通过：

![](https://img-blog.csdnimg.cn/20210531145942385.png)

**<font color='orage'>至此，Linux主机安装成功！</font>**

# 三、写在最后
Linux 系统安装完之后就可以愉快地双系统玩耍了，下面再分享几篇 Linux 基础文章：
- [25万字《决战Linux到精通》笔记](https://blog.csdn.net/as604049322/article/details/120446586)
- [基础篇：Linux 常用命令总结](https://luciferliu.blog.csdn.net/article/details/119984255)