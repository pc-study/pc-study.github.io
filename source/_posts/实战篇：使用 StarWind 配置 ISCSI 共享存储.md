---
title: 实战篇：使用 StarWind 配置 ISCSI 共享存储
date: 2021-11-01 10:15:26
tags: [starwind,墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/152431
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
之前讲过一篇文章 [一步步教你Linux7安装Oracle RAC（11GR2版本）](https://www.modb.pro/db/153861) 教大家如何安装 Oracle RAC。

有朋友希望将共享存储配置这一块详细讲一讲，因此便写了这篇。

# 一、介绍
`ISCSI`（Internet Small Computer System Interface，Internet 小型计算机系统接口)是一种由IBM公司研究开发的IP SAN技术。

该技术是将现有SCSI接口与以太网络(Ethernet)技术结合，基于 TCP/IP的协议连接iSCSI服务端（Target）和客户端(Initiator)，使得封装后的SCSI数据包可以在通用互联网传输，最终实现iSCSI服务端映射为一个存储空间（磁盘）提供给已连接认证后的客户端。

![](https://img-blog.csdnimg.cn/20210621155703252.png)

本文主要讲解的是 Windows 主机下配置 `StarWind` 软件实现共享存储！

# 二、StarWind安装
`StarWind` 的特点就是简单快捷，方便操作；对于测试安装来说，Windows平台更实用。
## 1、解压安装包
首先，需要下载 `StarWind` 安装包，**下载地址**：

<a href="https://pan.baidu.com/s/1OX7rAiG9AQW8EfEGGHEjlQ"  target="_blank" rel="noopener noreferrer"><font size="5" color="orage">https://pan.baidu.com/s/1OX7rAiG9AQW8EfEGGHEjlQ</a></font> **提取码：`kpl9`**

![](https://img-blog.csdnimg.cn/20210621160410613.png)
## 2、运行安装
![](https://img-blog.csdnimg.cn/20210621160504272.png)

![](https://img-blog.csdnimg.cn/20210621160544313.png)

![](https://img-blog.csdnimg.cn/20210621160608972.png)

![](https://img-blog.csdnimg.cn/20210621160637453.png)

![](https://img-blog.csdnimg.cn/20210621160703248.png)

![](https://img-blog.csdnimg.cn/20210621160737939.png)

![](https://img-blog.csdnimg.cn/20210621160810275.png)

![](https://img-blog.csdnimg.cn/20210621160859729.png)

![](https://img-blog.csdnimg.cn/20210621160937349.png)

选择安装包中的key：

![](https://img-blog.csdnimg.cn/20210621161034970.png)

![](https://img-blog.csdnimg.cn/20210621161124516.png)

![](https://img-blog.csdnimg.cn/20210621161152867.png)

![](https://img-blog.csdnimg.cn/20210621161227857.png)

选择安装：

![](https://img-blog.csdnimg.cn/20210621161303502.png)

![](https://img-blog.csdnimg.cn/20210621161347768.png)

**<font color='orage'>至此，StarWind 软件已经成功安装！</font>**
# 三、配置服务端StarWind ISCSI
确保成功安装 StarWind 软件之后，接下来就需要通过软件配置共享存储！

## 1、打开StarWind软件

![](https://img-blog.csdnimg.cn/20210621161745379.png)

## 2 新建StarWind Server

![](https://img-blog.csdnimg.cn/20210621161901575.png)

通过 `cmd` 命令行输入 `ipconfig` 查看本机 ip 地址：

![](https://img-blog.csdnimg.cn/20210621162027516.png)

填写本机 IP，点击OK：

![](https://img-blog.csdnimg.cn/20210621162116899.png)

新建成功后，选择 Server，双击或者点击 connect 连接：

![](https://img-blog.csdnimg.cn/20210621162300290.png)

## 3、新建Target

![](https://img-blog.csdnimg.cn/20210621162447837.png)

填入 Target 别名，根据自己情况填写：

![](https://img-blog.csdnimg.cn/20210707114844389.png)

![](https://img-blog.csdnimg.cn/20210621162855821.png)

![](https://img-blog.csdnimg.cn/20210621162922623.png)

![](https://img-blog.csdnimg.cn/20210707122031113.png)

# 四、添加Device存储盘

![](https://img-blog.csdnimg.cn/20210621163324469.png)

选择虚拟硬盘：

![](https://img-blog.csdnimg.cn/20210621163406903.png)

选择镜像文件：

![](https://img-blog.csdnimg.cn/20210621163450530.png)

创建新的虚拟盘：

![](https://img-blog.csdnimg.cn/20210621163555151.png)

选择镜像文件路径和大小：

![](https://img-blog.csdnimg.cn/20210621164100309.png)

![](https://img-blog.csdnimg.cn/20210621164317564.png)

![](https://img-blog.csdnimg.cn/20210621164424224.png)

选择已有 Target：

![](https://img-blog.csdnimg.cn/20210621164513155.png)

![](https://img-blog.csdnimg.cn/20210621164537210.png)

![](https://img-blog.csdnimg.cn/20210621164613973.png)

![](https://img-blog.csdnimg.cn/20210621164636208.png)

**📢 注意：** 如果需要添加多块共享盘，只需要重复上述添加 Device 即可！

![](https://img-blog.csdnimg.cn/2021070712212241.png)

**<font color='orage'>至此，StarWind共享存储服务端已经配置完成。</font>**

# 五、Linux通过 ISCSI 连接共享存储
## 1、Linux 客户端安装 ISCSI
```bash
yum install -y iscsi-initiator-utils*
```
![](https://img-blog.csdnimg.cn/20210621165348769.png)
## 2、搜索服务端 ISCSI Target
```bash
iscsiadm -m discovery -t st -p 10.211.55.33
```
**📢 注意：** 10.211.55.33 为服务端 IP 地址，即 Windows 主机的 IP 地址。

![](https://img-blog.csdnimg.cn/20210621165616390.png)
## 3、连接服务端 ISCSI 共享存储
```bash
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:10.211.55.33-lucifer -p 10.211.55.33 -l
```
**📢 注意：** `iqn.2008-08.com.starwindsoftware:10.211.55.33-lucifer` 为上一步搜索出的Target名称，复制即可！

![](https://img-blog.csdnimg.cn/20210621165834145.png)
## 4、Linux 客户端查看共享存储
Linux 客户端通过命令 lsblk 查看共享存储是否成功挂载：
```bash
lsblk
```
![](https://img-blog.csdnimg.cn/20210621165930891.png)

**<font color='orage'>如上所示，共享盘已经挂载成功。</font>**

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