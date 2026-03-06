---
title: 《零基础安装 Oracle 数据库》单机ASM系列 4️⃣ 一键快速安装 Oracle 19C 数据库
date: 2021-08-22 15:08:04
tags: [oracle安装,玩转 vagrant]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/101885
---

@[TOC](目录)

# 前言

很多朋友吐槽我的脚本不会用，看不懂，哎，一言难尽！于是，我将 [vagrant + virtualbox + shell脚本] 组合起来，实现了零基础也可安装 Oracle 数据库的方式，我称之为 `新手纯享版本`，真正一行短命令！

**💡 支持单机集群版本一键安装了！❗️ 但不支持 Linux 6 系统安装！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-49d3646e-85f4-471a-9e61-d12cf0ec69d2.png)

**简单总结一下步骤：**

- 下载项目和安装软件
- 上传 oracle 和 grid 安装包
- 简单编辑配置文件
- 执行启动命令

😄 还不来试试？这要还不会，建议就直接用别人安装好的吧！

**开源项目地址：**
- Gitee：[https://gitee.com/luciferlpc/InstallOracleshell](https://gitee.com/luciferlpc/InstallOracleshell)
- GitHub：[https://github.com/pc-study/InstallOracleshell](https://github.com/pc-study/InstallOracleshell)

觉好记得点上 `star` ，项目将持续保持更新！🔥

# 安装

## 下载项目

使用 git 将项目下载到本地目录：

```bash
git clone https://gitee.com/luciferlpc/InstallOracleshell.git
```

不会用 Git ？没关系，直接打开项目地址 [https://gitee.com/luciferlpc/InstallOracleshell](https://gitee.com/luciferlpc/InstallOracleshell)，直接下载 ZIP 包也是一样的！

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-e30cc888-01df-45a1-9dca-2fabcea4a420.png)

## 安装软件

必须使用 [vagrant](https://www.vagrantup.com/downloads) 和 [virtualbox](https://www.virtualbox.org/wiki/Downloads)，请确保你本地安装了它们。

## 下载 Oracle 安装包

新手纯享版本支持 [11GR2/12CR2/18C/19C/21C] 版本，本次演示 19C 版本安装，因此需要下载 19C 版本安装包！

Oracle 安装包下载地址：[精心整理Oracle数据库各版本（软件安装包+最新补丁包）](https://www.modb.pro/download/123438)

下载好之后，将 Oracle 安装包拷贝到项目中的 `singleasm_db/software/19300` 目录下。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210822-52de847b-b679-434a-a9b8-86705ecbe831.png)

<font color='red'>**📢 注意：**</font> 项目 `singleasm_db/software/19300` 目录中有一个 `software.txt` 文件，内容为你需要上传的 Oracle 安装包。请确保安装包名称与以下名称相同，否则安装 <font color='red'>**失败**</font>！

# 安装

## 编辑 vagrant.yml 文件

不要害怕，这个文件很简单，所见即所得！调整为如下参数：

```
box: luciferliu/oraclelinux8.3
vm_name: orcl
hostname: orcl
mem_size: 4096
cpus: 2
public_ip: 192.168.56.100
non_rotational: 'on'
asmdisk_data_name: ./asm_data.vdi
asmdisk_data_size: 20
db_version: 19
gi_patch: 
grid_password: oracle
oracle_password: oracle
oracle_sid: orcl
install_base: /u01/app
characterset: AL32UTF8
cdb: true
pdb: pdb01
```

当然，你也可以自定义，参数介绍如下：

```
box             	: Linux 主机版本，不支持 linux 6 版本，建议使用 oraclelinux 系统！

可选值：
- luciferliu/centos7.9
- luciferliu/centos8.3
- luciferliu/oraclelinux7.9
- luciferliu/oraclelinux8.3

vm_name         	: 虚拟机名称，随意修改，默认即可。
hostname        	: 主机名称，随意修改，默认即可。
mem_size        	: 内存大小，单位是 `MiB`，根据需要修改，正常默认即可。
cpus            	: cpu 个数，根据需要修改，正常默认即可。
public_ip       	: IP 地址，根据网卡定义修改，正常默认即可。
non_rotational    	: 不用修改值，默认即可。
asmdisk_data_name	: 不用修改值，默认即可。
asmdisk_data_size	: ASM 磁盘大小，单位是 `GiB`，根据需要修改，正常默认即可。
db_version      	: oracle 数据库版本，根据实际情况填写！
gi_patch        	: Grid PSU/RU 补丁号，根据需要填写，不打补丁可以不填。
grid_password		: grid 用户密码，默认即可。
oracle_password   	: oracle 用户密码，默认即可。
oracle_sid      	: oracle 数据库实例名，默认即可。
install_base      	: oracle 安装根目录，默认即可。
characterset      	: 数据库字符集，根据实际需要填写，正常默认即可。
cdb             	: CDB 模式需要填写 true。
pdb             	: PDB 名称，开启 CDB 模式后才可生效。
```

**如果你不想了解，完全可以跳过！按照上面我给出的参数调整即可！**

## 开始安装

返回项目 `singleasm_db` 目录下，直接执行 `vagrant up` 命令：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210822-c7adcefc-c0bc-41e8-9704-511bb068c6d3.png)

(｀ﾍ´)=3 然后，让子弹飞一会儿，耐心等待安装成功吧！の 大概 30 ~ 60 分钟左右！

![](https://oss-emcsprod-public.modb.pro/image/editor/20210822-00391d76-3631-49ba-a10c-d6e7779ee2ca.png)

出现上述提示，即安装成功！如何使用？

<font color='red'>**📢 注意：所有密码默认都是 oracle！⭐️**</font>

# 使用方式

这里有三种方式来操作主机。

## 连接主机

1、使用 `ssh root@192.168.56.100` 来连接，root 用户密码是 oracle ，使用 Xshell 等连接工具也可连接；

2、使用 `vagrant ssh` 来连接，注意要在 `singleasm_db` 目录下执行，连接进去是 vagrant 用户，使用 `su - oracle` 来切换即可。

3、使用 Virtualbox 虚拟机直接打开访问。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210822-302366b9-b136-41f4-8e6b-80bb29ee108e.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210822-f0b526ea-274d-4d74-994c-dde332fecec1.png)

## 关闭主机

1、在主机中，执行 `init 0` 等关机命令关闭主机。

2、使用 Virtualbox 虚拟机右键关闭。

3、进入  `singleasm_db` 目录下执行 `vagrant halt` 关闭。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210822-145045df-76a3-4e8f-b799-1069ad5347c9.png)

## 开启主机

1、直接打开 Virtualbox 虚拟机，右键打开。

2、进入 `singleasm_db` 目录下执行 `vagrant up`。

## 销毁主机

用完了，不需要使用了怎么办？

1、直接打开 Virtualbox 虚拟机，右键删除。

2、进入 `singleasm_db` 目录下执行 `vagrant destory` 销毁它。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210822-dac48ea0-a176-435f-bca4-e7ec4ca62c4c.png)

# 写在最后

这要是还不会，我就爱莫能助啦！

本项目唯一的优势 👉🏻 在于可以自定义几乎大部分安装参数，包括 PSU/RU 补丁的安装！

如果使用官方的 rpm 安装方式或者 docker 这类的方法，就无法做到这么灵活！

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

技术交流可以 关注公众号：**Lucifer三思而后行**

![Lucifer三思而后行](https://img-blog.csdnimg.cn/20210702105616339.jpg)










