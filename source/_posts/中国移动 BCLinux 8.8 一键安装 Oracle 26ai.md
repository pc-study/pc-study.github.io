---
title: 中国移动 BCLinux 8.8 一键安装 Oracle 26ai
date: 2026-03-02 11:22:12
tags: [墨力计划,oracle 26ai,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2028307449938780160
---

最近有好几个朋友咨询我中移的操作系统 BCLinux 能否适配一下，我下载安装看了一下，基本没啥问题。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260302-2028308403098050560_395407.png)

一看就是 RHEL 系的，参考 RHEL8 进行适配即可，修改了一下脚本，开测！

本文演示一下 Oracle 26ai 在中国移动 BCLinux 8.8 系统的一键安装：
```bash
[root@orcl:/root]# cat /etc/os-release
NAME="BigCloud Enterprise Linux"
VERSION="8.8 (Core)"
ID="bclinux"
ID_LIKE="rhel fedora centos anolis"
VERSION_ID="8.8"
PLATFORM_ID="platform:an8"
PRETTY_NAME="BigCloud Enterprise Linux 8.8 (Core)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:bclinux:bclinux:8"
HOME_URL="https://mirrors.cmecloud.cn/"

[root@orcl:/soft]# ll
-rw-r--r-- 1 oracle oinstall 2406058543 3月   2 10:37 LINUX.X64_2326100_db_home.zip
-rwxr-xr-x 1 oracle oinstall     256221 3月   2 10:46 OracleShellInstall
-rw-r--r-- 1 oracle oinstall     339767 3月   2 10:37 rlwrap-0.46.tar.gz
```
测试就使用最简命令进行安装即可：
```bash
[root@bclinux8 soft]# ./OracleShellInstall -lf enp0s3
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260302-2028309036945973248_395407.png)

最简安装不会优化数据库，所以重启后，需要手动启动数据库和监听：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260302-2028309577629507584_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260302-2028309647845842944_395407.png)

中移 BCLinux 适配完毕，如果你也想在国产操作系统上快速部署最新版 Oracle，不妨试试这个脚本。后续还将支持更多数据库版本和操作系统，欢迎持续关注！