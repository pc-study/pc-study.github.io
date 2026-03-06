---
title: 虚拟机玩转 Veritas NetBackup（NBU）之服务端安装部署
date: 2022-01-26 15:09:31
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/242756
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
NBU（Veritas NetBackup）是目前企业比较常用的备份软件，为了方便大家学习和使用，本文简单讲一下如何在虚拟机安装 NBU。

# 一、Linux 主机安装
NBU 大多安装在 Linux 主机，所以本文就以 Linux 主机作为演示环境，首先安装一台 RHEL 7 作为 NBU 服务端的载体，Linux 安装过程可以参考：
- Windows/macOS 都可以使用 VirtualBox 虚拟机进行安装：[VirtualBox 安装 RHEL 6 系统](https://www.bilibili.com/video/BV1mY411W7LE)
- macOS 用户也可以使用 Parallels Desktop 进行安装：[Parallels Desktop 安装 RHEL 7 系统](https://www.bilibili.com/video/bv123411v79X)

主机配置信息：
|主机名| 版本 | 内存| 磁盘|IP|
|--|--|--|--|--|
| nbu | rhel7.9 |4G|50G|10.211.55.111|

安装很简单，故不再演示如何安装 Linux 主机。
# 二、Linux 主机配置
## 1、下载上传安装包
首先需要下载好 NBU 的服务端的安装包，我这里已经下载好了，顺便分享给大家：
- [NetBackup_8.1.1_LinuxR_x86_64.tar.gz](https://pan.baidu.com/s/1wypsNY1dOXT6Tm_MFW6hwg)

>提取码：`b1n7`

下载好安装包之后，上传至 Linux 主机：

![](https://img-blog.csdnimg.cn/524e7756873f4786893cd06761ea39f9.png)
## 2、关闭防火墙和 Selinux
关闭防火墙：
```bash
systemctl stop firewalld
systemctl disable firewalld
systemctl status firewalld
```
关闭 selinux：
```bash
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```
![](https://img-blog.csdnimg.cn/4c6a992b71354848b5036e322541db4a.png)

## 3、创建用户和组
安装 NBU 服务端需要创建用户和组，否则安装过程会报错，可参考文档：
- [Web server user/group setup steps for a NetBackup master server](https://www.veritas.com/support/en_US/article.100023872)

创建用户和组：
```bash
## root 用户下执行
mkdir /usr/openv -p
groupadd nbwebgrp
useradd -g nbwebgrp -c 'NetBackup Web Services account' -d /usr/openv/wmc nbwebsvc
```
![](https://img-blog.csdnimg.cn/5200f7b47cc442629b0dae91b60364d2.png)
## 4、配置内核参数
NBU 安装需要提前配置内核参数，否则同样报错，可参考文档：
- [Recommended NetBackup UNIX / Linux semaphore tuning values (Linux/Solaris/HP-UX/AIX)](https://www.veritas.com/support/en_US/article.100023842)

配置命令：
```bash
## root 用户下执行
cat /proc/sys/kernel/sem
echo 300   307200   32   1024 > /proc/sys/kernel/sem
sysctl -a | grep kernel.sem

echo "kernel.sem = 300  307200  32  1024">> /etc/sysctl.conf
cat /etc/sysctl.conf | grep kernel.sem
sysctl -p
```
![](https://img-blog.csdnimg.cn/fafbc954048c492ab8ac7a6c91d02af8.png)
## 5、配置 ulimit
配置 ulimit，否则报错，参考文档：
- [Minimum O/S ulimit settings on master and media server UNIX platforms](https://www.veritas.com/support/en_US/article.100022164)

配置命令：
```bash
ulimit -f unlimited
ulimit -n 8000
```
![](https://img-blog.csdnimg.cn/78f3ee221f3c47ecae303b3d07fe2704.png)
## 6、配置环境变量
为了方便 nbu 命令执行，配置一下环境变量：
```bash
cat<<EOF>>/root/.bash_profile
export NBU_HOME=/usr/openv/netbackup
export PATH=\$NBU_HOME/bin:\$PATH
export PS1="[\`whoami\`@\`hostname\`:"'\w]# '
EOF
```
![](https://img-blog.csdnimg.cn/84fa3ee888474eac941c15dae842225e.png)

以上全部配置完成后，重启主机检查 selinux 是否关闭。

# 三、NBU 安装部署
## 1、解压安装包
进入安装包目录，静默解压安装包：
```bash
tar -xf NetBackup_8.1.1_LinuxR_x86_64.tar.gz
```
![](https://img-blog.csdnimg.cn/74c31e95c2274aacb528da7aefd17e8f.png)
## 2、安装
进入解压后的目录，执行安装：
```bash
./install
```
![](https://img-blog.csdnimg.cn/00b900b381764677820df7e798022d67.png)

安装过程中的选项：

- Do you wish to continue? [y,n] (y)
- Is this host the master server? [y,n] (y)
- Are you currently performing a disaster recovery of a master server? [y,n] (n)
- Do you want to install NetBackup and Media Manager files? [y,n] (y)
- Enter license key: ********************************************
- Do you want to add additional license keys now? [y,n] (y) n
- NetBackup server name of this machine? [y,n] (y)
- Do you want to add any media servers now? [y,n] (n)
- Do you want to start the job-related NetBackup daemons so backups and restores can be initiated? [y,n] (y)
- Enter the OpsCenter server (default: NONE):

![](https://img-blog.csdnimg.cn/510284e360174db2b03df104c1a1970e.png)

按照以上选项执行之后，整个过程就安装完成了。

如果 NBU 服务端主机重启，则需要手动开启 NBU 服务，执行命令：
```bash
cd /usr/openv/netbackup/bin
./bp.start_all
```
![](https://img-blog.csdnimg.cn/cd1cdbece21b4637902f8566e0dbb12e.png)

# 四、NBU 初始化
NBU 服务端成功安装之后，还需要初始化设置，否则无法使用，下面介绍一下如何初始化 NBU 服务端。

## 1、管理界面
管理界面需要图形化使用，可以通过 Windows 安装管理软件，也可以在服务端图形化界面下，执行以下命令调出管理界面：
```bash
/usr/openv/netbackup/bin/jnbSA
```
![](https://img-blog.csdnimg.cn/63156496519d4150bff2507a0f019559.png)

输入用户密码后，登录到 NBU 管理界面：

![](https://img-blog.csdnimg.cn/834533320cb9489492aa1312d86ef175.png)

进入管理界面：

![](https://img-blog.csdnimg.cn/7112e3f968f64de3b0b8398ff57b4bd6.png)

也可以在 Windows 下安装管理端软件：
- [NetBackup_8.1.1_Win.zip](https://pan.baidu.com/s/1-_09KNKf55VnyNxaql7WNg)

>提取码：`phip`

![](https://img-blog.csdnimg.cn/05342282fb324f3cacdd817c50516630.png)

安装完成后，打开管理界面：

![](https://img-blog.csdnimg.cn/a2dd61bdd74a4601b70a69a73c0e190a.png)

登录成功后显示如下:

![](https://img-blog.csdnimg.cn/c31381a703974c26b7b4d94e64eb8caf.png)
## 2、初始化
### 1、创建存储卷
由于这里的 NBU 服务端是虚拟机创建的，所以需要在主机创建一个目录：
```bash
## root 用户下执行
mkdir /backup
```
![](https://img-blog.csdnimg.cn/4c784ff5313d4bc6be7283da0fc2f901.png)

创建一个存储卷：
![](https://img-blog.csdnimg.cn/9f7fe4accfa34ca68215b2a6b3082c17.png)

选择刚刚创建的 /backup 目录：

![](https://img-blog.csdnimg.cn/254e2348f37140e1a72a0b9cf2004d23.png)

 创建完成后如下：
 
![](https://img-blog.csdnimg.cn/23f86b80e51d4c98b002dcd0a01b6524.png)

### 2、创建 Token
配置客户端连接需要创建一个 Token：

![](https://img-blog.csdnimg.cn/6c85fa7ff52c4ba38c5f887bbb44d79c.png)

![=](https://img-blog.csdnimg.cn/db1c83bf42ec4f8c82b255d9cfc32498.png)

![](https://img-blog.csdnimg.cn/b8c55adb4b624c52b563fbdf8bbee37d.png)

创建完成后，可以右键查看 Token：

![](https://img-blog.csdnimg.cn/081f5d3a3d924ad9adaba495baf5cd46.png)

通过以上简单的初始化之后，就可以开始使用 NBU 进行备份。

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