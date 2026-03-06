---
title: 实战篇：一行命令安装Linux系统，超详细的 Vagrant 上手指南
date: 2021-07-17 16:34:06
tags: [linux安装,玩转 vagrant]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/84762
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

**<font color="blue">一行命令安装Linux演示：</font>**
```bash
vagrant box add bento/oracle-7.9 --provider virtualbox && sudo vagrant init bento/oracle-7.9 && sudo vagrant up
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717162131591.gif)
**通过上述演示，已成功安装Linux7.9，并且可以访问。**
# 前言
最近发现了一款神器 `Vagrant`：
&gt;- Vagrant 是一个基于 Ruby 的工具，用于创建和部署虚拟化开发环境。
&gt;- 它使用 Oracle 的开源 VirtualBox 虚拟化系统，使用 Chef 创建自动化虚拟环境。

它能干嘛呢？你可以理解为与Docker类似，帮助我们快速部署开发环境。
&gt;- **Vagrant官网：** https://www.vagrantup.com/
&gt;- **Github：** https://github.com/hashicorp/vagrant
&gt;- **Vagrant文档：** https://www.vagrantup.com/docs

本文简单介绍下，如何使用Vagrant快速部署Linux主机。
&gt;- Vagrant安装
&gt;- VirtualBox安装
&gt;- Vagrant添加box
&gt;- Vagrant配置Vagrantfile
&gt;- Vagrant创建并运行Linux主机
# 一、环境准备
- 首先需要安装Vagrant和VirtualBox，这里我是通过macOS的homebrew直接进行安装。也可通过下载安装包进行安装：
&gt;- Vagrant：https://www.vagrantup.com/downloads
&gt;- VirtualBox：https://www.virtualbox.org/wiki/Downloads

**当然，其他虚拟机也是支持的，比如VM，PD等。**

## 1 Vagranta安装
```bash
cd /opt
brew install vagrant
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717114437338.png)
注意：如果是macOS可以通过homebrew直接安装，Windows可以通过下载安装包进行安装。

## 2 VirtualBox安装
```bash
brew install virtualbox
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717093927202.png)
如上所示，软件都已安装成功。

# 二、安装Linux主机
- Vagrant可以通过box预先构建镜像，可以是简单的操作系统安装，也可以是安装了整个环境。
- 无需手动下载box镜像源， 一旦引用它，Vagrant 就会自动下载，并将它添加到本地下载的框列表中。
- 网上有很多 Vagrant 盒子，本文演示的是 `bento/oracle-7.9` 的安装。
&gt;**box镜像源：** https://app.vagrantup.com/boxes/search

**<font color="red">以下命令切换到root用户下进行：</font>**
```bash
su - root
```
**1、查看当前主机box镜像**
```bash
vagrant box list
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717125432264.png)
**2、初始化box镜像**

&gt;box简介可参考：https://app.vagrantup.com/bento/boxes/oracle-7.9
- 通过标准存储库添加：
```bash
vagrant box add bento/oracle-7.9 --provider virtualbox
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717131744266.png)
- 通过镜像源添加：
&gt;- **Centos：** http://cloud.centos.org/centos/
&gt;- **OracleLinux：** http://yum.oracle.com/boxes/
```bash
vagrant box add --name ol76 https://yum.oracle.com/boxes/oraclelinux/ol76/ol76.box
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717133348561.png)
-  查看添加的box：
```bash
vagrant box list
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717133450118.png)
- 创建虚机Linux
```bash
mkdir /Volumes/DBA/Vagrantboxes
cd /Volumes/DBA/Vagrantboxes
vagrant init bento/oracle-7.9
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717134059948.png)
- 编辑Vagrantfile配置文件
```bash
mkdir -p /Volumes/DBA/Vagrantboxes/scripts/
echo 'echo "**** hello ****"' &gt; /Volumes/DBA/Vagrantboxes/scripts/my_script.sh
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717134357383.png)
- 我们可以通过编辑 Vagrantfile 来更改一些 VM 属性。
```bash
cd /Volumes/DBA/Vagrantboxes
mv Vagrantfile Vagrantfilebak
cat &lt;&lt;EOF&gt;/Volumes/DBA/Vagrantboxes/Vagrantfile
# Set some variables.
var_public_ip      = '192.168.56.100'

Vagrant.configure("2") do |config|
  config.vm.box = "bento/oracle-7.9"
  config.vm.provision :shell, path: "/opt/vagrant/scripts/my_script.sh"
  config.vm.network :forwarded_port, guest: 1521, host: 1521
  config.vm.network "private_network", ip: "192.168.56.10"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = 2048      # Memory size in M.
    vb.cpus   = 1         # Number of vCPUs
    vb.name   = "oracle—7.9"   # VM name.
  end
end
EOF
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717135029153.png)
- 启动虚机linux
```bash
vagrant up
vagrant ssh
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717135810254.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717140129690.png)
如上，Linux主机已经可以访问。

**3、通过SSH登录主机**
```bash
ssh 127.0.0.1 -p 2222
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717142452627.png)
**4、管理box镜像主机**
- 可以使用以下命令初始化、停止、启动、重新启动、删除 VM、列出和移除镜像。
```bash
vagrant init bento/oracle-7.9
vagrant halt
vagrant up
vagrant status
vagrant reload
vagrant destroy -f
vagrant box list
vagrant box remove bento/oracle-7.6
```
- 修改完Vagrantfile配置后，可以使用“--provision”选项重新加载虚拟机
```bash
vagrant reload --provision
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210717142638566.png)
**<font color="blue">至此，Vagrant安装Linux主机已演示完成。</font>**

# 写在最后
个人觉得VirtualBox真的难用，这里推荐使用VM和PD。
&gt;- **PD使用参考手册：** https://github.com/Parallels/vagrant-parallels
&gt;- **VM使用参考手册：** https://github.com/hashicorp/vagrant-vmware-desktop

Vagrant这个工具的作用当然不是简单的部署Linux主机，后面将更新使用 **Vagrant一键安装Oracle数据库系列** ，欢迎持续关注👏🏻。



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