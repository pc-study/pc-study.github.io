---
title: 115篇！国庆 ⑦ 天，我从 〇 开始撸了个 Linux 系统！(建议收藏)
date: 2021-10-08 07:10:00
tags: [linux]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/129308
---

<center>
 <b>本文已收录于专栏</b>
</center>
<center> 
 <a href="https://www.modb.pro/topic/127518"><font color="green"><b>📚《<u>Linux From Scratch</u>》📚 </b></font></a>
</center><br>
<center> 
<img src="https://oss-emcsprod-public.modb.pro/image/editor/20210903-b76b9f92-238b-44c2-9118-457cf4160beb.GIF" width="400">
</center>
<center><a href="#jump99" target="_self"><font size="5" color="ff1f00"><b><u>点我跳转文末</u></b></font></a> 可以获取 <strong>粉丝专属福利</strong> 以及博主的联系方式
</center>
 
 
@[TOC](目录)
# 🌲 前言
**曾几何时，是否有想过自己 DIY 一个 Linux 系统，就像造汽车一样一步步的构建一个 Linux 系统！**

🚗 做个形象的比喻：
>**汽车（Linux发行版**）= 发动机（内核）+ 轮子和方向盘（shell）+ 车架子和座椅（桌面）+ 倒车雷达/自动泊车（基础软件）

在大众的眼里，Linux似乎是很神秘的东西，比如经常说到的，网上的黑客用的都是Linux，对着黑色的框框敲几条命令，就能够控制很多电脑，控制网络。这个时候，Linux像是游戏里的神器，无所不能。稍微懂一点计算机知识的人来说，知道Linux是一个操作系统，但是是个什么样的操作系统，也不太了解。

![](https://img-blog.csdnimg.cn/12403b43229f458d8ff9e48c7565e0fe.png)

Linux From Scratch 项目简称 `LFS`，它提供具体的步骤、特定的补丁、必须的脚本，从而提供一个简便的创建Linux发行版的途径。LFS并不是一个发行版，但是它可以作为制作初级发行版的良好练习。

**🔥 有什么好处：**
- 了解一个完整的linux系统是如何组成的
- 可以更好的理解 Linux 是如何正常运转，和其它程序之间是如何协同工作，以及和其它程序之间的依赖关系
- 可以让你创建极其精简的 Linux 系统
- 对系统本身有更多的控制权，而不必知道别人是如何实现的
- 加强对 Linux 系统的深入理解，**<font color='red'>装逼必备</font>**

**<font color='orage'>☀️ 本文将一步步教你如何从零开始构建一个 Linux 系统！</font>**

# 🏅 构建流程
📚 构建流程参考自官方文档：[Linux From Scratch](https://www.linuxfromscratch.org/lfs/) ！

以下将我完整构建流程分为以下几个部分进行展示链接 🔗，通过链接可以直接跳转操作！

**只要跟着教程一步步操作，必然可以成功！🎉**
## 一、准备构建
[从零开始 DIY Linux 系统：LFS 介绍](https://www.modb.pro/db/129422)
[从零开始 DIY Linux 系统：虚拟机创建宿主机（Centos7）](https://www.modb.pro/db/129421)

⭐️ 系统安装完成配置之后，建议做一个快照！以备后续误操作可以回退~

[从零开始 DIY Linux 系统：磁盘分区（Version 7.7）](https://www.modb.pro/db/129420)
[从零开始 DIY Linux 系统：软件包、补丁以及创建用户（Version 7.7）](https://www.modb.pro/db/129419)

上述步骤为准备阶段，下面开始构建临时文件系统！
## 二、构建临时文件系统
Binutils 编译耗时较长...

[从零开始 DIY Linux 系统：构建临时系统 - Binutils-2.25 - 第1遍](https://www.modb.pro/db/129418)

GCC 编译耗时较长...

[从零开始 DIY Linux 系统：构建临时系统 - GCC-4.9.2](https://www.modb.pro/db/129417)
[从零开始 DIY Linux 系统：构建临时系统 - Linux-3.19](https://www.modb.pro/db/129416)

Glibc 编译耗时较长...

[从零开始 DIY Linux 系统：构建临时系统 - Glibc-2.21](https://www.modb.pro/db/129415)
[从零开始 DIY Linux 系统：构建临时系统 - Libstdc++-4.9.2](https://www.modb.pro/db/129414)

Binutils 编译耗时较长...

[从零开始 DIY Linux 系统：构建临时系统 - Binutils-2.25 - 第2遍](https://www.modb.pro/db/129413)

GCC 编译耗时较长...

[从零开始 DIY Linux 系统：构建临时系统 - GCC-4.9.2 - 第2遍](https://www.modb.pro/db/129412)

⭐️ GCC 第2遍编译之后，建议做一个快照！以备后续误操作可以回退~

[从零开始 DIY Linux 系统：构建临时系统 - Tcl-8.6.3](https://www.modb.pro/db/129411)
[从零开始 DIY Linux 系统：构建临时系统 - Expect-5.45](https://www.modb.pro/db/129410)
[从零开始 DIY Linux 系统：构建临时系统 - DejaGNU-1.5.2](https://www.modb.pro/db/129409)
[从零开始 DIY Linux 系统：构建临时系统 - Check-0.9.14](https://www.modb.pro/db/129408)
[从零开始 DIY Linux 系统：构建临时系统 - Ncurses-5.9](https://www.modb.pro/db/129407)
[从零开始 DIY Linux 系统：构建临时系统 - Bash-4.3.30](https://www.modb.pro/db/129406)
[从零开始 DIY Linux 系统：构建临时系统 - Bzip2-1.0.6](https://www.modb.pro/db/129405)
[从零开始 DIY Linux 系统：构建临时系统 - Coreutils-8.23](https://www.modb.pro/db/129404)
[从零开始 DIY Linux 系统：构建临时系统 - Diffutils-3.3](https://www.modb.pro/db/129403)
[从零开始 DIY Linux 系统：构建临时系统 - File-5.22](https://www.modb.pro/db/129402)
[从零开始 DIY Linux 系统：构建临时系统 - Findutils-4.4.2](https://www.modb.pro/db/129401)
[从零开始 DIY Linux 系统：构建临时系统 - Gawk-4.1.1](https://www.modb.pro/db/129400)
[从零开始 DIY Linux 系统：构建临时系统 - Gettext-0.19.4](https://www.modb.pro/db/129399)
[从零开始 DIY Linux 系统：构建临时系统 - Grep-2.21](https://www.modb.pro/db/129398)
[从零开始 DIY Linux 系统：构建临时系统 - Gzip-1.6](https://www.modb.pro/db/129397)
[从零开始 DIY Linux 系统：构建临时系统 - M4-1.4.17](https://www.modb.pro/db/129396)
[从零开始 DIY Linux 系统：构建临时系统 - Make-4.1](https://www.modb.pro/db/129395)
[从零开始 DIY Linux 系统：构建临时系统 - Patch-2.7.4](https://www.modb.pro/db/129394)
[从零开始 DIY Linux 系统：构建临时系统 - Perl-5.20.2](https://www.modb.pro/db/129393)
[从零开始 DIY Linux 系统：构建临时系统 - Sed-4.2.2](https://www.modb.pro/db/129392)
[从零开始 DIY Linux 系统：构建临时系统 - Tar-1.28](https://www.modb.pro/db/129391)
[从零开始 DIY Linux 系统：构建临时系统 - Texinfo-5.2](https://www.modb.pro/db/129390)
[从零开始 DIY Linux 系统：构建临时系统 - Util-linux-2.26](https://www.modb.pro/db/129389)
[从零开始 DIY Linux 系统：构建临时系统 - Xz-5.2.0](https://www.modb.pro/db/129388)
[从零开始 DIY Linux 系统：构建临时系统 - 收尾工作](https://www.modb.pro/db/129387)

⭐️ 构建临时系统完成之后，建议做一个快照！以备后续误操作可以回退~
## 三、构建 LFS 系统
接下来，我们会进入构建环境然后开始认真地构建 LFS 系统！

[从零开始 DIY Linux 系统：构建 LFS 系统 - 准备虚拟内核文件系统](https://www.modb.pro/db/129386)
[从零开始 DIY Linux 系统：构建 LFS 系统 - 进入 Chroot 环境](https://www.modb.pro/db/129385)

**📢 注意：如果下方编译过程未一次完成，再次继续的时候需要再次进入 `Chroot` 环境才能编译：**
```bash
chroot "$LFS" /tools/bin/env -i \
    HOME=/root                  \
    TERM="$TERM"                \
    PS1='\u:\w\$ '              \
    PATH=/bin:/usr/bin:/sbin:/usr/sbin:/tools/bin \
    /tools/bin/bash --login +h
```

[从零开始 DIY Linux 系统：构建 LFS 系统 - 创建目录](https://www.modb.pro/db/129384)
[从零开始 DIY Linux 系统：构建 LFS 系统 - 创建必需的文件和符号链接](https://www.modb.pro/db/129383)

下面又要开始编译啦！

[从零开始 DIY Linux 系统：构建 LFS 系统 - Linux-3.19 API 头文件](https://www.modb.pro/db/129382)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Man-pages-3.79](https://www.modb.pro/db/129381)

Glibc 编译耗时非常久... 需要耐心等待丫！

[从零开始 DIY Linux 系统：构建 LFS 系统 - Glibc-2.21](https://www.modb.pro/db/129380)

⭐️ Glibc 编译完成之后，如果后续出问题，重新编译太久了，建议做一个快照！

[从零开始 DIY Linux 系统：构建 LFS 系统 - 调整工具链](https://www.modb.pro/db/129379)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Zlib-1.2.8](https://www.modb.pro/db/129378)
[从零开始 DIY Linux 系统：构建 LFS 系统 - File-5.22](https://www.modb.pro/db/129377)

Binutils 编译耗时较长...

[从零开始 DIY Linux 系统：构建 LFS 系统 - Binutils-2.25](https://www.modb.pro/db/129376)
[从零开始 DIY Linux 系统：构建 LFS 系统 - GMP-6.0.0a](https://www.modb.pro/db/129375)
[从零开始 DIY Linux 系统：构建 LFS 系统 - MPFR-3.1.2](https://www.modb.pro/db/129374)
[从零开始 DIY Linux 系统：构建 LFS 系统 - MPC-1.0.2](https://www.modb.pro/db/129373)

**⚠️ 这次的 GCC 编译耗时灰常灰常久...**

[从零开始 DIY Linux 系统：构建 LFS 系统 - GCC-4.9.2](https://www.modb.pro/db/129372)

⭐️ GCC 编译完成之后，如果后续出问题，重新编译太久了，建议做一个快照！

[从零开始 DIY Linux 系统：构建 LFS 系统 - Bzip2-1.0.6](https://www.modb.pro/db/129371)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Pkg-config-0.28](https://www.modb.pro/db/129370)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Ncurses-5.9](https://www.modb.pro/db/129369)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Attr-2.4.47](https://www.modb.pro/db/129368)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Acl-2.2.52](https://www.modb.pro/db/129367)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Libcap-2.24](https://www.modb.pro/db/129366)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Sed-4.2.2](https://www.modb.pro/db/129365)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Shadow-4.2.1](https://www.modb.pro/db/129364)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Psmisc-22.21](https://www.modb.pro/db/129363)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Procps-ng-3.3.10](https://www.modb.pro/db/129362)
[从零开始 DIY Linux 系统：构建 LFS 系统 - E2fsprogs-1.42.12](https://www.modb.pro/db/129361)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Coreutils-8.23](https://www.modb.pro/db/129360)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Iana-Etc-2.30](https://www.modb.pro/db/129359)
[从零开始 DIY Linux 系统：构建 LFS 系统 - M4-1.4.17](https://www.modb.pro/db/129358)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Flex-2.5.39](https://www.modb.pro/db/129357)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Bison-3.0.4](https://www.modb.pro/db/129356)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Grep-2.21](https://www.modb.pro/db/129355)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Readline-6.3](https://www.modb.pro/db/129354)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Bash-4.3.30](https://www.modb.pro/db/129353)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Bc-1.06.95](https://www.modb.pro/db/129352)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Libtool-2.4.6](https://www.modb.pro/db/129351)
[从零开始 DIY Linux 系统：构建 LFS 系统 - GDBM-1.11](https://www.modb.pro/db/129350)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Expat-2.1.0](https://www.modb.pro/db/129349)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Inetutils-1.9.2](https://www.modb.pro/db/129348)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Perl-5.20.2](https://www.modb.pro/db/129347)
[从零开始 DIY Linux 系统：构建 LFS 系统 - XML::Parser-2.44](https://www.modb.pro/db/129346)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Autoconf-2.69](https://www.modb.pro/db/129345)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Automake-1.15](https://www.modb.pro/db/129344)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Diffutils-3.3](https://www.modb.pro/db/129343)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Gawk-4.1.1](https://www.modb.pro/db/129342)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Findutils-4.4.2](https://www.modb.pro/db/129341)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Gettext-0.19.4](https://www.modb.pro/db/129340)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Intltool-0.50.2](https://www.modb.pro/db/129339)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Gperf-3.0.4](https://www.modb.pro/db/129338)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Groff-1.22.3](https://www.modb.pro/db/129337)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Xz-5.2.0](https://www.modb.pro/db/129336)
[从零开始 DIY Linux 系统：构建 LFS 系统 - GRUB-2.02~beta2](https://www.modb.pro/db/129335)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Less-458](https://www.modb.pro/db/129334)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Gzip-1.6](https://www.modb.pro/db/129333)
[从零开始 DIY Linux 系统：构建 LFS 系统 - IPRoute2-3.19.0](https://www.modb.pro/db/129332)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Kbd-2.0.2](https://www.modb.pro/db/129331)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Kmod-19](https://www.modb.pro/db/129330)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Libpipeline-1.4.0](https://www.modb.pro/db/129329)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Make-4.1](https://www.modb.pro/db/129328)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Patch-2.7.4](https://www.modb.pro/db/129327)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Systemd-219](https://www.modb.pro/db/129326)
[从零开始 DIY Linux 系统：构建 LFS 系统 - D-Bus-1.8.16](https://www.modb.pro/db/129325)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Util-linux-2.26](https://www.modb.pro/db/129324)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Man-DB-2.7.1](https://www.modb.pro/db/129323)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Tar-1.28](https://www.modb.pro/db/129322)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Texinfo-5.2](https://www.modb.pro/db/129321)
[从零开始 DIY Linux 系统：构建 LFS 系统 - Vim-7.4](https://www.modb.pro/db/129320)

**📢 注意：清理前需要先退出当前环境，然后再次进入 `Chroot` 环境：**
```bash
export LFS=/mnt/lfs
chroot $LFS /tools/bin/env -i            \
    HOME=/root TERM=$TERM PS1='\u:\w\$ ' \
    PATH=/bin:/usr/bin:/sbin:/usr/sbin   \
    /tools/bin/bash --login
```
[从零开始 DIY Linux 系统：构建 LFS 系统 - 再次清理无用内容](https://www.modb.pro/db/129319)

**执行完 Strip 之后再次退出环境！**
```bash
logout
```
⭐️ 所有软件编译安装完成之后，建议做一个快照！
## 四、基本系统配置
**进入 `Chroot` 环境：**
```bash
export LFS=/mnt/lfs
chroot $LFS /usr/bin/env -i            \
    HOME=/root TERM=$TERM PS1='\u:\w\$ ' \
    PATH=/bin:/usr/bin:/sbin:/usr/sbin   \
    /bin/bash --login
```
[从零开始 DIY Linux 系统：基本系统配置 - 通用网络配置](https://www.modb.pro/db/129318)
[从零开始 DIY Linux 系统：基本系统配置 - 配置系统时间](https://www.modb.pro/db/129317)
[从零开始 DIY Linux 系统：基本系统配置 - 系统区域设置](https://www.modb.pro/db/129316)
[从零开始 DIY Linux 系统：基本系统配置 - 创建 /etc/inputrc 文件](https://www.modb.pro/db/129315)
[从零开始 DIY Linux 系统：基本系统配置 - 创建 /etc/shells 文件](https://www.modb.pro/db/129314)
[从零开始 DIY Linux 系统：基本系统配置 - Systemd 的用法与配置](https://www.modb.pro/db/129313)

## 五、让 LFS 系统可引导
⭐️ 是时候该让 LFS 系统可以启动了！

**本节主要为：**
- 创建 fstab 文件
- 为新的 LFS 系统编译内核
- 安装 GRUB 引导器

如此，就可以在电脑启动的时候选择启动 LFS 系统了！

[从零开始 DIY Linux 系统：让 LFS 系统可引导 - 创建 /etc/fstab 文件](https://www.modb.pro/db/129312)
[从零开始 DIY Linux 系统：让 LFS 系统可引导 - Linux-3.19](https://www.modb.pro/db/129311)
[从零开始 DIY Linux 系统：让 LFS 系统可引导 - 安装 GRUB](https://www.modb.pro/db/129310)
[从零开始 DIY Linux 系统：让 LFS 系统可引导 - 收尾](https://www.modb.pro/db/129309)

![](https://img-blog.csdnimg.cn/434e4887d60e4e3c9b93b3c938249e84.png)
![](https://img-blog.csdnimg.cn/606bf0b3efc74c7092ed6a91b0ba0c00.png)

**😄 哈哈，干的很不错！到这里，全新的 LFS 系统就已经安装完成了！🎉**

<span id="jump99"></span>
# ❤️ 粉丝专属福利
>**玩转 Linux：**   [《玩转 Vagrant 系列》](https://blog.csdn.net/m0_50546016/category_11236959.html)
>**玩转 Oracle：** [《Oracle 一键安装脚本》](https://blog.csdn.net/m0_50546016/category_11127389.html)
>**安装 Oracle：** [《Oracle 零基础安装》](https://blog.csdn.net/m0_50546016/category_11301009.html)
>**运维小知识：**  [《每天一个DBA小知识》](https://blog.csdn.net/m0_50546016/category_11344800.html)

<center>
 <b>👇🏻 可通过搜索下方 公众号 <font color='red'>免费</font> 获取👇🏻</b>
</center>

<center>

![Lucifer三思而后行](https://img-blog.csdnimg.cn/20210702105616339.jpg)

</center>