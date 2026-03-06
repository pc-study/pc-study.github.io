---
title: [译] 从 CentOS 8 迁移到 Rocky Linux 8
date: 2022-03-08 11:03:22
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/365402
---

>原文地址：[https://blog.dbi-services.com/migration-from-centos-8-to-rocky-linux-8/](https://blog.dbi-services.com/migration-from-centos-8-to-rocky-linux-8/)
原文作者：Karsten Lenz

本篇博客描述了从 CentOS 8 到 Rocky Linux 8 的迁移，建议在出现问题时有备份或虚拟机快照。

起初需要将 CentOS 8 更新到最新版本，但现在这并不容易，大多数存储库镜像已被弃用。作为准备，需要对 CentOS Repo 文件进行改编才能完成此任务。

在这种情况下，有以下 repo 文件，CentOS-AppStream.repo、CentOS-Base.repo、CentOS-Extras.repo、CentOS-PowerTools.repo，所以需要对这四个文件中的baseurl进行适配。
```bash
$ CentOS-AppStream.repo
$ baseurl=http://vault.centos.org/$contentdir/$releasever/AppStream/$basearch/os/

$ CentOS-Base.repo
$ baseurl=http://vault.centos.org/$contentdir/$releasever/BaseOS/$basearch/os/

$ CentOS-Extras.repo
$ baseurl=http://vault.centos.org/$contentdir/$releasever/extras/$basearch/os//

$ CentOS-PowerTools.repo
$ baseurl=http://vault.centos.org/$contentdir/$releasever/PowerTools/$basearch/os/
```
http://vault.centos.org 上的软件库工作正常，我写的大多数其他软件库已弃用且无法访问。

适配 repo 文件后更新 CentOS 8 到 8.5。
```bash
$ dnf update
```
升级完成后重启，建议在 CentOS 8.5 升级后创建备份或快照。

CentOS 的 repo 文件重命名为 repo.rpmsave，现在会有新的名为 CentOS-Linux.. 的文件。

Rocky Linux 提供了一个迁移脚本，可以使用 curl 下载。
```bash
$ cd /tmp
$ mkdir rocky
$ cd rocky
$ curl https://raw.githubusercontent.com/rocky-linux/rocky-tools/main/migrate2rocky/migrate2rocky.sh -o migrate2rocky.sh
$ chmod u+x migrate2rocky.sh
```
该脚本已知有三个开关，-h 为帮助，-r 为运行，-V 为验证，对于迁移，我们需要 -r：
```bash
$ ./migrate2rocky.sh -r
```
执行过程会有关于无效 URL 的错误消息，这与 CentOS 有关，因此可以忽略，该脚本将用 Rocky Linux 替换 CentOS 软件包，因此它会运行一段时间，当它成功完成并且系统重新启动时，迁移就完成了。
```bash
# cat /etc/os-release
$ NAME="Rocky Linux"
$ VERSION="8.5 (Green Obsidian)"
$ ID="rocky"
$ ID_LIKE="rhel centos fedora"
$ VERSION_ID="8.5"
$ PLATFORM_ID="platform:el8"
$ PRETTY_NAME="Rocky Linux 8.5 (Green Obsidian)"
$ ANSI_COLOR="0;32"
$ CPE_NAME="cpe:/o:rocky:rocky:8:GA"
$ HOME_URL="https://rockylinux.org/"
$ BUG_REPORT_URL="https://bugs.rockylinux.org/"
$ ROCKY_SUPPORT_PRODUCT="Rocky Linux"
$ ROCKY_SUPPORT_PRODUCT_VERSION="8"
```





