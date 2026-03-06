---
title: Linux 系统如何挂载安装镜像 ISO，看我！
date: 2025-06-05 16:16:30
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1930527685701283840
---

一般 Linux 系统会安装在虚拟机或者实体机上，根据安装方式的原因，有两种方式进行挂载 ISO。

@[TOC](目录)

# CD/DVD 驱动器挂载
## 物理层面连接 ISO
不管是使用虚拟机还是实体机安装都可以使用 CD/DVD 驱动器挂载。

以虚拟化平台为例：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250605-1930528122567405568_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250605-1930529124993478656_395407.png)

按上图配置完成后即可。

## 主机层面挂载 ISO
物理层面先连接 ISO 之后，还需要在主机层面挂载 ISO 才算完成。

主机层面挂载 ISO 的命令可以有以下方式，在 root 用户下执行：
```bash
[root@ ~]# mount /dev/sr0 /mnt
## 或
[root@ ~]# mount /dev/cdrom /mnt
```
以上两条命令的效果一样，都可以。如果没有在物理层面连接 ISO，主机层面挂载 ISO 时会报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250605-1930532816614338560_395407.png)

遇到这个报错就需要在物理层面先连接 ISO，然后再次执行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250605-1930533500172644352_395407.png)

执行 `df -h | grep /mnt` 查看是否挂载成功：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250605-1930537800705781760_395407.png)

如果查询结果如上，则代表已经挂载成功了。

# 手工上传镜像挂载
## 物理层面上传 ISO
这个就很简单了，上传下载好的安装镜像 iso 到服务器主机指定目录下，以 `/iso` 为例：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250605-1930534613244456960_395407.png)

上传之后就可以，烦在烦在 ISO 比较大，下载上传比较慢。

## 主机层面挂载 ISO
主机层面挂载 ISO 的命令，在 root 用户下执行：
```bash
mount -o loop /iso/OracleLinux-R9-U6-x86_64-dvd.iso /mnt/
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250605-1930538676879110144_395407.png)

执行 `df -h | grep /mnt` 查看是否挂载成功：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250605-1930539040420409344_395407.png)

如果查询结果如上，则代表已经挂载成功了。