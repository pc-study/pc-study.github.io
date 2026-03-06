---
title: ❤️ [Vagrant + VirtualBox] 一键搞定Oracle数据库安装 ❤️
date: 2021-07-25 17:24:47
tags: [oracle安装,linux安装,玩转 vagrant]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/86763
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 🌲 前言
**<font color='green'>写在最前面，如果是新手不会安装Oracle数据库，可以直接下载我打包好的 box 直接安装，打开即可使用Oracle数据库！！！</font>**

> **⭐️ <font color='red'>Box 下载方式：</font>[luciferliu/oracle11g](https://app.vagrantup.com/luciferliu/boxes/oracle11g) ⭐️**

哈哈 😄，我又来偷懒了，之前写了一版 ❤️ **[Oracle一键安装脚本](https://github.com/pc-study/InstallOracleshell)** ❤️，大大减少了平时用于安装数据库花费的时间。但是，安装Linux系统还是需要耗费时间，而且是重复的点击动作，太不自动化了。

于是，我就开始在网上冲浪 🏄🏻，发现了ansible，cobbler，vagrant等等可用于脚本自动安装Linux主机的方法。毅然决然，我选择了入门最快，最简单的 **[Vagrant](https://www.vagrantup.com/)**。

就这样，我开始折腾了。先是成功使用Vagrant在电脑上安装了Linux系统，然后融合之前的Oracle一键安装脚本，最终成功 🎉 实现了 Vagrantg 一键安装Oracle数据库，彻底释放双手 🙌🏻！

🪐 **Vagrant使用方式可参考：**

>- **[Vagrant中文文档专栏](https://www.modb.pro/topic/89230)**
>- **[实战篇：一行命令安装Linux系统，超详细的 Vagrant 上手指南](https://www.modb.pro/db/84762)**

🌏 **Oracle一键安装脚本使用可参考：**

>- **[Oracle一键安装脚本专栏](https://blog.csdn.net/m0_50546016/category_11127389.html)**
>- **[‼️ 我写了4000多行Shell脚本，终于实现了一键安装Oracle RAC！！！](https://www.modb.pro/db/69072)**

**<font color='green'>好勒，哔哔半天了，正文开始~ ヾ(◍°∇°◍)ﾉﾞ</font>**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210720003451421.gif)
💻 **本文需要用到的软件：**
>- **Vagrant**
>- **VirtualBox**

**<font color='blue'>注意：📢 请提前安装好~</font>**
# 一、⭐️ Vagrant安装Linux系统 ⭐️
第一步，当然是安装Linux系统啊，没有安装Vagrant的朋友，去 **[下载页面](https://www.vagrantup.com/downloads)** 下载安装一下吧，很简单的。不会玩的，往上翻一点看教程，我就默认大家已经安装完啦👍🏻~

## 1、安装目录
首先需要创建一个目录，用来放置 Vagrantfile 和安装介质：
```bash
mkdir /Volumes/DBA/vagrant/centos79 -p
```
Windows系统的朋友👬🏻，我就不说怎么创建目录啦~

![在这里插入图片描述](https://img-blog.csdnimg.cn/eef68e39932f4ee59588298ebd9a9221.png)
## 2、下载 Vagrant box
建议直接去 **[Vagrant box官方下载页面](https://app.vagrantup.com/boxes/search)** 搜索下载，本文使用 Centos7.9版本。

![在这里插入图片描述](https://img-blog.csdnimg.cn/bca1df72d8834ede8d3a3cfd05e985ce.png)
当然是选下载量最高，更新比较靠近的哇 🤩~

点击进去，我们选择 `virtualbox` 版本进行下载：

![在这里插入图片描述](https://img-blog.csdnimg.cn/21fd305b726744d9a2d5ef6023412f61.png)
**注意：这里有很多版本支持，如果使用VMware或者Parallels也可以的哈~**

## 3、Vagrant添加Box
下载完之后，我这边为了便于分辨，将文件改名为 `centos7.9`：

![在这里插入图片描述](https://img-blog.csdnimg.cn/fb87d844ea6e47aab725a5cc8ed16881.png)

使用 `vagrant box add` 命令添加下载好的box：
```bash
vagrant box add /Users/lpc/Downloads/centos7.9 --name centos79
vagrant box list
```
注意：**/Users/lpc/Downloads/centos7.9** 为 box 存放位置，**--name centos79** 是指创建一个逻辑名称。

![在这里插入图片描述](https://img-blog.csdnimg.cn/e20a133b43bd4863a1e4441ec651f088.png)

已成功添加 box，接下来需要配置 Vagrantfile 文件和上传安装介质。

## 4、配置Vagrantfile文件
这里我就不讲解Vagrantfile如何配置，具体可以看官方文档，配置如下：
```bash
cd /Volumes/DBA/vagrant/centos79
cat <<EOF>Vagrantfile
Vagrant.configure("2") do |config|
  config.vm.box = "centos79"
  config.vm.provision :shell, path: "/Volumes/DBA/vagrant/centos79/scripts/ora_preinstall.sh"
  config.vm.synced_folder "/Volumes/DBA/vagrant/centos79", "/vagrant"
  config.vm.network :forwarded_port, guest: 1521, host: 1521
  config.vm.network :forwarded_port, guest: 22, host: 22
  config.vm.network "public_network", ip: "192.168.1.120"
  config.vm.provider "virtualbox" do |vb|
  vb.name = "orcl1"
  vb.memory = 4196
  vb.cpus = 2
  end
end
EOF
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/cde5f5979ee24e45b0a4cd2350e3824b.png)

**<font color='red'>这里简单解释一下配置文件中的几个参数：</font>**
>- config.vm.box = "centos79"
><font color='blue'> 指定上文添加的box逻辑名称，用于安装Linux系统 </font>
>- config.vm.provision :shell, path: "/Volumes/DBA/vagrant/centos79/scripts/ora_preinstall.sh" 
><font color='blue'> 配置用于安装完Linux系统后自动执行shell脚本 </font>
>- config.vm.synced_folder "/Volumes/DBA/vagrant/centos79", "/vagrant" 
><font color='blue'> 映射本地目录到Linux主机目录 </font>
>- config.vm.network :forwarded_port, guest: 1521, host: 1521 
><font color='blue'> 映射Linux主机1521端口到本机端口1521 </font>
>- config.vm.network :forwarded_port, guest: 22, host: 22 
><font color='blue'> 映射Linux主机22端口到本机端口22 </font>
>- config.vm.network "public_network", ip: "192.168.1.120" 
><font color='blue'> 配置主机网络为192.168.1.120，建议与本机做桥接，可用于上网 </font>
>- config.vm.provider "virtualbox" do |vb| 
><font color='blue'> 配置虚拟机程序为virtualbox，如果是paralles则修改为parallels即可 </font>
>- vb.name = "orcl" 
><font color='blue'> 配置主机名 </font>
>- vb.memory = 4196 
><font color='blue'> 配置主机内存 </font>
>- vb.cpus = 2 
><font color='blue'> 配置主机CPU </font>

## 5、准备安装介质
在开始创建的目录下，创建 soft 文件夹，并上传需要的安装介质：

❤️ <font color='green'>需要安装介质的朋友可以关注公众号免费获取！详情可以查看如下文章：</font>❤️

> **[精心整理Oracle数据库各版本（软件安装包+最新补丁包），附下载链接🔗](https://www.modb.pro/db/81506)**

![在这里插入图片描述](https://img-blog.csdnimg.cn/b8ee784ee16b429c8e9f87f64b254955.png)

**这里说一下以下文件的作用：**
>- CentOS-7.9-x86_64-Everything-2009.iso
><font color='blue'> Centos iso镜像文件，用于安装本地YUM源，如果能联网可以不需要 </font>
>- OracleShellInstall.sh
><font color='blue'> Oracle一键安装脚本，可在Github下载，持续更新🔥，欢迎👏🏻 **Star** </font>
>- p13390677_112040_Linux-x86-64_1of7.zip
>- p13390677_112040_Linux-x86-64_2of7.zip
><font color='blue'> Oracle 11GR2 Database 安装包 </font>
>- p31537677_112040_Linux-x86-64.zip
><font color='blue'> Oracle 11GR2 Database PSU补丁包 </font>
>- p6880880_112000_Linux-x86-64.zip
><font color='blue'> Oracle OPatch补丁包 </font>
>- rlwrap-0.42.tar.gz
><font color='blue'> 上下文切换软件，可选安装，非必须 </font>

这里安装介质就准备好啦，放在这里就行了 😄 ~
## 6、编写Vagrantfile中定义的Shell脚本
为了实现Linux安装成功后继续自动安装Oracle数据库，因此需要提前准备shell脚本用于Linux系统安装后调用执行。
```bash
mkdir -p /Volumes/DBA/vagrant/centos79/scripts
cd /Volumes/DBA/vagrant/centos79/scripts
cat <<EOF>ora_preinstall.sh
#change root password
echo oracle | passwd --stdin root
#change sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
systemctl reload sshd.service
#mkdir software dir
mkdir /soft
#cp software to softdir
cp /vagrant/soft/* /soft
#mount iso to mnt dir
mount -o loop /soft/*iso /mnt
#chmod shell script
chmod +x /soft/OracleShellInstall.sh
#install oracle database
cd /soft
./OracleShellInstall.sh -i 192.168.1.120 -opa 31537677 -installmode single -dbv 11g
EOF
```
**这里稍微解释一下哈，脚本中的步骤：**
- a.修改root用户密码
- b.配置ssh服务允许输入密码连接
- c.Linux主机中创建soft目录用于存放安装介质
- d.复制映射目录/vagrant/soft下的安装介质到/soft目录下
- e.挂载centos7.9的iso镜像文件
- f.授权Oracle一键安装脚本可执行权限
- e.进入/soft目录，根据提前配置好的一键安装参数，执行安装Oracle数据库

![在这里插入图片描述](https://img-blog.csdnimg.cn/b23c018ee1924ae4aa32c9ea6b7d4e57.png)

**<font color='red'>至此，所有的前置配置都已完成，下面就是见证奇迹的时刻啦 ᕕ( ᐛ )ᕗ ~</font>**

# 二、❤️ Vagrant启动一键安装Oracle ❤️
## 1、😏 很简单，一行短短的命令
```bash
vagrant up
```
**为了直观一点，来个动图看一下吧：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/51d2906b2a514c2b80b48f88b40c6c50.gif)

**<font color='red'>开始拷贝文件有些慢，不是Gif结束了，等一会儿就继续了；</font >**

由于Gif大小限制，只展示到安装PSU补丁就停止，后续没有什么好看的了，就是 **<font color='blue'>顺利建库成功</font>** 啦！

![在这里插入图片描述](https://img-blog.csdnimg.cn/3e2c3721e63449249f063a093f2496d6.png)

这里就已经安装成功了。现在我们连进去查看数据库试试：

![在这里插入图片描述](https://img-blog.csdnimg.cn/7333c368a36548f99a27c524becaf7b4.png)

可以看到数据库创建成功 🎉，PSU补丁也已经安装成功 ✌🏻：

![在这里插入图片描述](https://img-blog.csdnimg.cn/4810f1a9e1c54fcbb1658480e6cd32b3.png)

**就这，你以为本文就结束了❓ 当然不是，还有干货分享 🔥 ！！！** 

# 三、❄️ Vagrant box打包分享 ❄️
Vagrant支持将box打包并且上传到官方站点进行分享，也可以用于备份，方便以后直接打开使用。

**接下来，就看看如何打包Vagrant box吧 😄！**

## 1、打包前准备
删除多余的安装介质以减少box大小，取消/mnt镜像挂载
```bash
rm -rf /soft
umount /mnt
```
关闭Oracle数据库和监听
```bash
lsnrctl stop
sas
shudown immediate
```
关闭Linux主机
```bash
vagrant halt
vagrant status
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/47eec0cf40ed472fbfc65f6f37170e3a.png)
## 2、打包box
通过`vagrant package`命令打包box：

![在这里插入图片描述](https://img-blog.csdnimg.cn/c273798e712b49bea54c579c30dbebce.png)
```bash
sudo vagrant package
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3ce41e1993394ef5863ab15bc299d0ee.png)

**<font color='red'>注意：如果直接打包box，打包完后的box高达 18G，明显太大了。</font>**

**使用脚本清理，缩小box大下：**
```bash
##创建脚本文件
vi /mnt/purge.sh
chmod +x /mnt/purge.sh
##将以下内容写入脚本文件
#!/bin/sh
# Zero free space to aid VM compression
printf "STEP: Zero free space to aid VM compression\n"
dd if=/dev/zero of=/EMPTY bs=1M
rm -f /EMPTY

# Remove Linux headers
printf "STEP: Remove Linux headers\n"
rm -rf /usr/src/linux-headers*
 
# Remove Unused locales (edit for your needs, this keeps only en* and pt_BR)
printf "STEP: Remove Unused locales (edit for your needs, this keeps only en* and pt_BR)
find\n" 
find /usr/share/locale/{af,am,ar,as,ast,az,bal,be,bg,bn,bn_IN,br,bs,byn,ca,cr,cs,csb,cy,da,de,de_AT,dz,el,en_AU,en_CA,eo,es,et,et_EE,eu,fa,fi,fo,fr,fur,ga,gez,gl,gu,haw,he,hi,hr,hu,hy,id,is,it,ja,ka,kk,km,kn,ko,kok,ku,ky,lg,lt,lv,mg,mi,mk,ml,mn,mr,ms,mt,nb,ne,nl,nn,no,nso,oc,or,pa,pl,ps,qu,ro,ru,rw,si,sk,sl,so,sq,sr,sr*latin,sv,sw,ta,te,th,ti,tig,tk,tl,tr,tt,ur,urd,ve,vi,wa,wal,wo,xh,zh,zh_HK,zh_CN,zh_TW,zu} -type d -delete
 
# Remove bash history
printf "STEP: Remove bash history\n"
unset HISTFILE
rm -f /root/.bash_history

# Cleanup log files
printf "STEP: Cleanup log files\n"
find /var/log -type f | while read f; do echo -ne '' > $f; done;
 
# Whiteout root
printf "STEP: Whiteout root\n"
count=`df --sync -kP / | tail -n1  | awk -F ' ' '{print $4}'`;
count=$((count -= 1))
dd if=/dev/zero of=/tmp/whitespace bs=1024 count=$count;
rm /tmp/whitespace;
 
# Whiteout /boot
printf "STEP: Whiteout /boot\n"
count=`df --sync -kP /boot | tail -n1 | awk -F ' ' '{print $4}'`;
count=$((count -= 1))
dd if=/dev/zero of=/boot/whitespace bs=1024 count=$count;
rm /boot/whitespace;
 
# Whiteout swap 
printf "STEP: Whiteout swap\n"
swappart=`cat /proc/swaps | tail -n1 | awk -F ' ' '{print $1}'`
swapoff $swappart;
dd if=/dev/zero of=$swappart;
mkswap $swappart;
swapon $swappart;
```
清理完成后，重新打包 box。查看大小：
```bash
sudo vagrant package --output=centos79-oracle11g
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3f5c451d03184bbe810396aaa559ca6d.png)

刺不刺激，从 **18G** 变成 **3.9G** 了，爽呀，美滋滋 😄~

**<font color='blue'>为了确保可以使用，我们重新添加测试一下：</font>**
```bash
mkdir -p /Volumes/DBA/vagrant/oracle11g
vagrant box add /Volumes/DBA/vagrant/centos79/centos79-oracle11g --name oracle11g
cd /Volumes/DBA/vagrant/oracle11g
vagrant init oracle11g
vagrant up --provider=virtualbox
vagrant ssh
su - oracle
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/9a0b3862c5b34ae18a0b43bbba5516e2.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/072279bde93a4825ae8b5d9ec28067c9.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/84e56f27415d4758b5afd17af2c3fcd1.png)

**<font color='blue'>经过测试，数据库可以使用，没毛病！！！</font>**

## 3、上传分享box
需要注册Vagrant账号，我这里已经注册好勒，开始上传！具体上传流程很简单，就不演示了哈 O(∩_∩)O~~
![在这里插入图片描述](https://img-blog.csdnimg.cn/e01ff2c3d628430f8f69c2d1f20fbd8a.png)
害，上传也太慢了，先去玩一会儿，等传完我再来 👋🏻 ~

**<font color='green'>。。。。。。好长时间过去了。。。。。。。</font>**
![在这里插入图片描述](https://img-blog.csdnimg.cn/eabfa53c79e84a8ca75879e3f2bde3f4.png)
终于上传成功了！！！大家可以去下载使用了~☀️
![在这里插入图片描述](https://img-blog.csdnimg.cn/34fd1fb9cd8c4fc4bb516f3cf1a42623.png)
>**<font color='red'>下载方式：</font>[luciferliu/oracle11g](https://app.vagrantup.com/luciferliu/boxes/oracle11g)**

之后应该会出更多版本的数据库 box，包括rac数据库，dataguard，dns服务器，openfiler服务器以及MySQL等等。

**⭐️  慢慢玩，不着急~ ⭐️**

**<font color='red'>最新的 Vagrant + Oracle 11GR2 RAC 安装教程：</font>**[❤️ 新手向：⭐️接近零基础⭐️ Oracle Linux 7 安装 Oracle 11GR2 RAC](https://www.modb.pro/db/88647)

# 写在最后
虽然这种方式不适用于生产环境的安装使用 😒，但是，对于个人测试练习使用，可以说是极其方便了 😄。如果不会使用的朋友，可以直接下载我分享的box，直接 `vagrant up` 就可以使用啦 🎉~

**<font color='green'>❤️ 最后，祝大家玩得开心，有问题或者技术交流可以关注我，私聊我~ ❤️</font>**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210720002546787.gif)


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