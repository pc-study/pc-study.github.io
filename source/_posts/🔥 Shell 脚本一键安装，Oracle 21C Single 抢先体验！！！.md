---
title: 🔥 Shell 脚本一键安装，Oracle 21C Single 抢先体验！！！
date: 2021-08-15 20:08:04
tags: [oracle一键安装脚本,玩转 vagrant]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/99806
---

@[TOC](目录)
# 🌲 前言
2021年8月13日，Oracle 21C 正式发布 Linux64 版本的本地安装包。

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210815-fe613fd2-df26-456a-9912-f6331436f7f7.png)

为了体验和完善我的Oracle一键安装脚本，我下载安装了一波，下面分享一下安装过程。

<font color='green'>**❤️ 同时发布最新的 OracleShell 脚本，支持 21C 单机和RAC 一键部署。**</font>

**脚本获取方式：**
>- [GitHub](https://github.com/pc-study/InstallOracleshell) **<font color='red'>持续保持更新中🔥</font>**
>- [Gitee](https://gitee.com/luciferlpc/InstallOracleshell) **<font color='red'>持续保持更新中🔥</font>**

# 🌛 环境准备

本次依然使用 `Vagrant` 进行 OS 环境的一键部署，比较方便快捷，需要了解的朋友可以关注收藏合辑：

>**❤️ [玩转 Vagrant 系列专栏](https://www.modb.pro/topic/99805) ❤️**

罪过，我偷懒，所以我用 Vagrant ，不熟悉的朋友还是手动安装主机环境吧，然后直接跑脚本就行。

**环境信息：**

|主机版本|Oracle版本|IP地址|内存|
|-|-|-|-|
|Oracle Linux 7.9|Oracle 21C|10.211.55.100|8G|

**Vagrant 主机镜像源（7、8）：**

>**[generic/oracle7](https://app.vagrantup.com/generic/boxes/oracle7)**
>**[generic/oracle8](https://app.vagrantup.com/generic/boxes/oracle8)**

**Oracle 21C 安装包下载地址：**

>**[Database](https://download.oracle.com/otn/linux/oracle21c/LINUX.X64_213000_db_home.zip)**
>**[Grid](https://download.oracle.com/otn/linux/oracle21c/LINUX.X64_213000_grid_home.zip)**

# ☀️ 21C 单机部署

## Vagrant 部署主机环境

**<font color='red'>📢 注意：手动安装操作系统的朋友可以直接跳过本节，直接进入到 `Oracle 安装` 章节。</font>**

### 1、Vagrant 镜像源添加

这里我的镜像源下载到 `/Users/lpc/Downloads/` 目录下，并且重命名为 `oel7_pd`，box 命名为 `oel7`。

```bash
vagrant box add /Users/lpc/Downloads/oel7_pd --name oel7
vagrant box list
```
![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210815-c66915fc-2a53-4cf6-ba6e-126f75f966a7.png)

### 2、配置 VagrantFile 

**<font color='blue'>📢 注意：以下的实际信息，请根据自己的环境填写配置！！！</font>**

进入自定义目录下，执行以下脚本创建 VagrantFile：

```bash
cat <<EOF>VagrantFile
Vagrant.configure("2") do |config|
  config.vm.box = "oel7"
  config.vm.provision :shell, path: "/Volumes/DBA/vagrant/ora21c/scripts/ora_preinstall.sh"
  config.vm.synced_folder "/Volumes/DBA/vagrant/software", "/vagrant"
  config.vm.network :forwarded_port, guest: 1521, host: 1521
  config.vm.network :forwarded_port, guest: 22, host: 22
  config.vm.network "public_network", ip: "10.211.55.100"
  config.vm.provider "parallels" do |pd|
  pd.name = "ora21c"
  pd.memory = 8192
  pd.cpus = 2
  end
end
EOF
```
**<font color='red'>⚠️注意：</font>关于如何配置 VagrantFile 这里不做解释，可以参考专栏。这里我使用的是 `Parallels` 虚拟机软件，如果使用 Virtualbox 虚拟机软件的朋友，需要将脚本中的 `parallels` 修改为 `virtualbox`即可。**

### 3、准备安装介质和脚本

主要是配置 VagrantFile 中的这两行：
```
config.vm.provision :shell, path: "/Volumes/DBA/vagrant/ora21c/scripts/ora_preinstall.sh"
config.vm.synced_folder "/Volumes/DBA/vagrant/software", "/vagrant"
```
第一行是指，Vagrant 主机安装好之后自动配置操作系统的脚本。
第二行是指，Vagrant 主机安装好之后自动映射目录。

**ora_preinstall.sh脚本内容：**
```bash
cat <<EOF>ora_preinstall.sh
#change root password
echo oracle | passwd --stdin root
#change sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
systemctl reload sshd.service
#mkdir software dir
mkdir /soft
#cp software to softdir
cp /vagrant/* /soft
#chmod shell script
chmod +x /soft/OracleShellInstall.sh
EOF
```
**安装介质内容：**
```
LINUX.X64_213000_db_home.zip
OracleShellInstall.sh
```
只需要上传 `Oracle一键安装脚本` 以及 `Oracle 21C Database 安装包`即可。

### 4、初始化主机环境

确认做好以上准备之后，如果你使用 Virtualbox 虚拟机软件，直接执行 `vagrant up` 即可；使用 parallels 虚拟机软件的朋友需要执行 `vagrant up --provider=parallels`。

```bash
vagrant up --provider=parallels
```

经过短暂等待之后，主机已经初始化成功：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210815-ff76f821-b355-45f0-9845-0f357aedb23d.png)

## Oracle 21C 单机脚本安装

环境准备好之后，执行安装就很简单了，只需要一行短短的命令即可。

使用 XSHELL 或者其他工具连接主机，执行脚本：

```bash
./OracleShellInstall.sh -i 10.211.55.100 -iso N
```

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210815-8841d304-df8a-4ddc-9f90-2cb1821f0a26.png)

解释下，由于 Vagrant 初始化的环境是配置好 yum 源的，因此不需要手动 mount 镜像源，因此我加了参数 `-iso N`，手动安装操作系统的朋友依然需要手动 mount。

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210815-62d5395b-f33a-41a7-a494-1883bcaf7137.png)

整个安装过程大概 `30分钟` 不到，如果需要创建 PDB，只需要加上参数 `-pb PDB名称` 即可自动创建好。

**<font color='green'>更多自定义参数可以参考：[‼️ 我写了4000多行Shell脚本，终于实现了一键安装Oracle RAC！！！](https://www.modb.pro/db/69072)**。</font>

# 📚 写在最后

关于 Oracle 21C RAC 安装的教程，随后就出！！！

<font color='red'>**更多更详细的脚本使用方式可以订阅专栏：</font> [Oracle一键安装脚本](https://blog.csdn.net/m0_50546016/category_11127389.html)**
> - [15分钟！一键部署Oracle 12CR2单机CDB+PDB](https://blog.csdn.net/m0_50546016/article/details/116521750)
>- [20分钟！一键部署Oracle 18C单机CDB+PDB](https://blog.csdn.net/m0_50546016/article/details/116522953)
>- [25分钟！一键部署Oracle 11GR2 HA 单机集群](https://blog.csdn.net/m0_50546016/article/details/116547743)
>- [30分钟！一键部署Oracle 19C单机CDB+PDB](https://blog.csdn.net/m0_50546016/article/details/116524049)
>- [1.5小时！一键部署Oracle 11GR2 RAC 集群](https://blog.csdn.net/m0_50546016/article/details/116549125)


---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

技术交流可以 关注公众号：**Lucifer三思而后行**

![Lucifer三思而后行](https://img-blog.csdnimg.cn/20210702105616339.jpg)