---
title: YashanDB openssl 版本过低升级过程
date: 2024-09-19 16:16:20
tags: [墨力计划,yashandb,yashandb体验官,yashandb个人版体验,yashandb迁移体验官]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1836675020644507648
---

YashanDB 对 openssl 版本有限制，要求版本为 1.1.1，检查当前系统 openssl 版本：
```bash
[root@ymp ~]# openssl version
OpenSSL 1.0.2k-fips  26 Jan 2017
```
不满足安装需求，需要升级 openssl，下载地址：[OpenSSL 1.1.1l](https://www.openssl.org/source/openssl-1.1.1l.tar.gz)

编译 openssl 需要安装 gcc，所以需要配置软件源：
```bash
## 挂载操作系统镜像
mount /dev/sr0 /mnt
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
安装依赖包：
```bash
yum install -y gcc
```
备份自带 openssl：
```bash
[root@ymp ~]# find /usr -name openssl
/usr/bin/openssl
/usr/lib64/openssl
[root@ymp ~]# mv /usr/bin/openssl /usr/bin/openssl_old
[root@ymp ~]# mv /usr/lib64/openssl/ /usr/lib64/openssl_old
```
解压安装包安装：
```bash
[root@ymp ycp_package]# tar -xvf openssl-1.1.1l.tar.gz 
[root@ymp ycp_package]# cd openssl-1.1.1l/
[root@ymp openssl-1.1.1l]# ./config --prefix=/usr/local/openssl
[root@ymp openssl-1.1.1l]# make && make install
```
重新链接 openssl：
```bash
[root@ymp openssl-1.1.1l]# ln -s /usr/local/openssl/bin/openssl /usr/bin/openssl
[root@ymp openssl-1.1.1l]# ln -s /usr/local/openssl/include/openssl/ /usr/include/openssl
[root@ymp openssl-1.1.1l]# echo "/usr/local/openssl/lib/" >> /etc/ld.so.conf
[root@ymp openssl-1.1.1l]# ldconfig -v
```
查看 openssl 版本：
```bash
[root@ymp ~]# openssl version
OpenSSL 1.1.1l  24 Aug 2021
```
openssl 已经升级到 1.1.1 版本。

