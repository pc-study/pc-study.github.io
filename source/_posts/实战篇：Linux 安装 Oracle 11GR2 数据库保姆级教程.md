---
title: 实战篇：Linux 安装 Oracle 11GR2 数据库保姆级教程
date: 2021-11-17 00:13:32
tags: [墨力计划,dba]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/168337
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)


# 前言
相信大家第一次接触Oracle，大都是在windows上安装，比较方便快捷，基本上是一直下一步就可以安装成功。然而企业级的数据库，基本上都是安装在Linux服务器上，安全且高效。

**<font color='orage'>没接触Linux的朋友不用害怕，跟着本篇文章一步步操作，安装Oracle如喝水般简单且标准。</font>**

下面我就来手把手教大家如何在Linux上安装Oracle数据库。
![](https://img-blog.csdnimg.cn/20210613232723502.png)
# 一、前期准备
## 1、虚拟机安装包
- Windows主机推荐虚拟机：[VMware Workstation](https://www.vmware.com/go/getworkstation-win)
- MacOS主机推荐虚拟机：[Parallels Desktop 16 for Mac](https://www.parallels.cn/products/desktop/trial/)
## 2、Oracle软件安装包
- [oracle官网下载](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html)
- Oracle帐号：2696671285@qq.com
- Oracle密码：Oracle123

**📢 注意：** Oracle 官方网站目前只能下载最新版 19C 和 21C，**需要其他版本 Oracle 安装包可点击链接跳转获取**：

**[https://mp.weixin.qq.com/s/ECJelOb6NUjZjpUvUa17pg](https://mp.weixin.qq.com/s/ECJelOb6NUjZjpUvUa17pg)**

## 3、Linux系统安装包
一般有三种Linux系统比较常用：**RedHat** 、 **OracleLinux** 、**Centos** 。

>- [RedHat官网下载](https://developers.redhat.com/products/rhel/download)
>- [OracleLinux官网下载](https://yum.oracle.com/oracle-linux-isos.html)
>- [Centos官网下载](https://vault.centos.org/)

**📢 注意：** 上述 **Linux 安装包** 可点击链接跳转获取：

**[https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw](https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw)**

## 4、Linux远程连接工具
本文将使用XShell和Xftp工具，安装包可以在官网下载，也可私信博主获取。

其他工具也可以，比如：[putty](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)，[SecureCRT](https://www.vandyke.com/download/securecrt/6.7/index.html) 等等工具。

**<font color='orage'>这篇博客演示RedHat Linux 7.6 版本安装Oracle 11GR2版本数据库。</font>**
# 二、Linux主机配置
安装 `Linux` 操作系统的步骤此处省略，主机内存 2G ，硬盘 50G 即可。

使用XShell工具连接Linux主机root用户：

![](https://img-blog.csdnimg.cn/20210531151043479.png)
## 1、主机名配置
如果安装时没有配置主机名，或者想要修改主机名，可以通过以下命令修改：
```bash
hostnamectl set-hostname orcl
```
![](https://img-blog.csdnimg.cn/20210531151223440.png)
## 2、网络配置
如果安装时没有配置网络，或者想要修改网络，可以通过以下命令修改：
```bash
nmcli connection modify eth0 ipv4.addresses 10.211.55.188/24 ipv4.gateway 10.211.55.1 ipv4.method manual autoconnect yes
nmcli connection up eth0
```
![](https://img-blog.csdnimg.cn/20210531151411783.png)
## 3、配置Hosts文件
根据上面配置好的主机名和IP，配置hosts文件：
```bash
cat <<EOF >>/etc/hosts
##OracleBegin##
##Public IP
10.211.55.188     orcl
##OracleEnd##
EOF
```
![](https://img-blog.csdnimg.cn/20210531151526712.png)
## 4、防火墙配置
```bash
systemctl stop firewalld
systemctl disable firewalld
```
![](https://img-blog.csdnimg.cn/20210531151651455.png)
## 5、Selinux配置
selinux修改后需要重启主机生效：
```bash
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```
![](https://img-blog.csdnimg.cn/20210531151755794.png)
## 6、ISO镜像源配置
**📢 注意：** 需要先挂载主机镜像！

Parallels Desktop 挂载 Linux 主机镜像：

![](https://img-blog.csdnimg.cn/202105311519447.png)

VMware Workstation 挂载 Linux 镜像：

![](https://img-blog.csdnimg.cn/2021053115231055.png)​
```bash
mount /dev/cdrom /mnt
cat <<EOF>/etc/yum.repos.d/local.repo
[local]
name=local
baseurl=file:///mnt
gpgcheck=0
enabled=1
EOF
```
![](https://img-blog.csdnimg.cn/20210531152447379.png)
## 7、安装Oracle依赖包
如下依赖包从Oracle官方文档推荐获取：
```bash
yum install -y bc \
binutils \
compat-libcap1 \
compat-libstdc++-33 \
gcc \
gcc-c++ \
elfutils-libelf \
elfutils-libelf-devel \
glibc \
glibc-devel \
ksh \
libaio \
libaio-devel \
libgcc \
libstdc++ \
libstdc++-devel \
libxcb \
libX11 \
libXau \
libXi \
libXtst \
libXrender \
libXrender-devel \
make \
net-tools \
nfs-utils \
smartmontools \
sysstat \
e2fsprogs \
e2fsprogs-libs \
fontconfig-devel \
expect \
unzip \
openssh-clients \
readline* \
psmisc --skip-broken
```
检查是否安装成功：
```bash
rpm -q bc binutils compat-libcap1 compat-libstdc++-33 gcc gcc-c++ elfutils-libelf elfutils-libelf-devel glibc glibc-devel ksh libaio libaio-devel libgcc libstdc++ libstdc++-devel libxcb libX11 libXau libXi libXtst libXrender libXrender-devel make net-tools nfs-utils smartmontools sysstat e2fsprogs e2fsprogs-libs fontconfig-devel expect unzip openssh-clients readline
```
![](https://img-blog.csdnimg.cn/20210531152856876.png)

Linux7需要手动安装compat-libstdc++依赖包：
```bash
rpm -ivh compat-libstdc++-33-3.2.3-72.el7.x86_64.rpm
```
![](https://img-blog.csdnimg.cn/20210531153209642.png)
## 8、配置ZeroConf
```bash
##关闭Zeroconf service的服务守护进程
systemctl stop avahi-daemon.socket
systemctl stop avahi-daemon.service
systemctl disable avahi-daemon.service
systemctl disable avahi-daemon.socket

##关闭NOZEROCONF
cat <<EOF >>/etc/sysconfig/network
#OracleBegin
NOZEROCONF=yes
#OracleEnd
EOF
```
![](https://img-blog.csdnimg.cn/20210531153907611.png)
## 9、关闭透明大页和numa
```bash
sed -i 's/quiet/quiet transparent_hugepage=never numa=off/' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
```
![](https://img-blog.csdnimg.cn/2021053115420611.png)
## 10、配置系统参数文件
```bash
##计算shmall和shmmax值
memTotal=$(grep MemTotal /proc/meminfo | awk '{print $2}')
totalMemory=$((memTotal / 2048))
shmall=$((memTotal / 4))
if [ $shmall -lt 2097152 ]; then
  shmall=2097152
fi
shmmax=$((memTotal * 1024 - 1))
if [ "$shmmax" -lt 4294967295 ]; then
  shmmax=4294967295
fi
echo $shmall
echo $shmmax

##配置系统参数
cat <<EOF >>/etc/sysctl.conf
#OracleBegin
##shmmal's Calculation formula: physical memory 8G：(8*1024*1024*1024)/4096=2097152
##shmmax's Calculation formula: physical memory 8G：(8/2)*1024*1024*1024 -1=4294967295
fs.aio-max-nr = 1048576
fs.file-max = 6815744
kernel.shmall = $shmall
kernel.shmmax = $shmmax
kernel.shmmni = 4096
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 1048576
EOF

##系统参数生效
sysctl -p
```
![](https://img-blog.csdnimg.cn/20210531154612937.png)
![](https://img-blog.csdnimg.cn/20210531154703153.png)
## 11、配置系统资源限制
```bash
cat <<EOF >>/etc/security/limits.conf
#OracleBegin
oracle soft nofile 1024
oracle hard nofile 65536
oracle soft stack 10240
oracle hard stack 32768
oracle soft nproc 2047
oracle hard nproc 16384
oracle hard memlock 134217728
oracle soft memlock 134217728
#OracleEnd
EOF

cat <<EOF >>/etc/pam.d/login
#OracleBegin
session required pam_limits.so 
session required /lib64/security/pam_limits.so
#OracleEnd
EOF
```
![](https://img-blog.csdnimg.cn/20210531154952801.png)
![](https://img-blog.csdnimg.cn/20210531155119545.png)
## 12、创建用户和组
```bash
/usr/sbin/groupadd -g 54321 oinstall
/usr/sbin/groupadd -g 54322 dba
/usr/sbin/groupadd -g 54323 oper

/usr/sbin/useradd -u 54321 -g oinstall -G dba,oper oracle
echo oracle | passwd --stdin oracle
```
![](https://img-blog.csdnimg.cn/20210531155644693.png)
## 13、创建Oracle安装目录
```bash
mkdir -p /u01/app/oracle/product/11.2.0/db
mkdir -p /u01/app/oraInventory
mkdir -p /oradata
chown -R oracle:oinstall /oradata
chown -R oracle:oinstall /u01/app
chmod -R 775 /u01/app
```
![](https://img-blog.csdnimg.cn/20210531155929742.png)
## 14、配置用户环境变量
```bash
cat <<EOF >>/home/oracle/.bash_profile
################OracleBegin#########################
umask 022
export TMP=/tmp
export TMPDIR=\$TMP
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=/u01/app/oracle/product/11.2.0/db
export ORACLE_HOSTNAME=orcl
export ORACLE_TERM=xterm
export TNS_ADMIN=\$ORACLE_HOME/network/admin
export LD_LIBRARY_PATH=\$ORACLE_HOME/lib:/lib:/usr/lib
export ORACLE_SID=orcl
export PATH=/usr/sbin:\$PATH
export PATH=\$ORACLE_HOME/bin:\$ORACLE_HOME/OPatch:\$PATH
alias sas='sqlplus / as sysdba'
export PS1="[\`whoami\`@\`hostname\`:"'\$PWD]\$ '
EOF
```
![](https://img-blog.csdnimg.cn/20210531165145782.png)
# 三、Oracle软件安装
## 1、Oracle软件包上传
```bash
[root@orcl soft]# ll
-rw-r--r--. 1 root root 1395582860 May 31 16:56 p13390677_112040_Linux-x86-64_1of7.zip
-rw-r--r--. 1 root root 1151304589 May 31 16:56 p13390677_112040_Linux-x86-64_2of7.zip
```
![](https://img-blog.csdnimg.cn/20210531165942856.png)
## 2、解压Oracle软件安装包
需要按顺序解压1，2安装包：
```bash
cd /soft
unzip -q p13390677_112040_Linux-x86-64_1of7.zip
unzip -q p13390677_112040_Linux-x86-64_2of7.zip

##授权/soft给oracle读写权限
chown -R oracle:oinstall /soft
```
![](https://img-blog.csdnimg.cn/20210531170541605.png)
## 3、安装VNC软件
```bash
yum install -y tigervnc*

su - oracle
vncserver
##输入密码
```
![](https://img-blog.csdnimg.cn/20210531171020356.png)

## 4、连接VNC远程工具或者直接打开虚拟机图形化界面

![](https://img-blog.csdnimg.cn/20210531171225671.png)

右键打开终端工具：

![](https://img-blog.csdnimg.cn/20210531171326904.png)

进入 /soft/database 开始安装 Oracle 软件：
```bash
./runInstaller -jreLoc /etc/alternatives/jre_1.8.0
```
![](https://img-blog.csdnimg.cn/20210531172656865.png)

不接收 Oracle 邮件推送：

![](https://img-blog.csdnimg.cn/20210531171632653.png)

不更新 Oracle：

![](https://img-blog.csdnimg.cn/20210531171647118.png)

只安装 Oracle 软件：

![](https://img-blog.csdnimg.cn/20210531171701277.png)

单实例安装：

![](https://img-blog.csdnimg.cn/20210531171715452.png)

选择企业版：

![](https://img-blog.csdnimg.cn/20210531171728646.png)

选择安装目录：

![](https://img-blog.csdnimg.cn/20210531171739957.png)

![](https://img-blog.csdnimg.cn/20210531171752742.png)

选择安装用户组：

![](https://img-blog.csdnimg.cn/20210531171801876.png)

Oracle 安装前必要检查：

![](https://img-blog.csdnimg.cn/20210531171917550.png)

上传 pdksh-5.2.14-37.el5.x86_64.rpm 依赖包并安装：
```bash
rpm -e ksh-20120801-142.el7.x86_64
rpm -ivh pdksh-5.2.14-37.el5.x86_64.rpm
```
![](https://img-blog.csdnimg.cn/20210531172054678.png)

点击再次检查，忽略 Swap 警告：

![](https://img-blog.csdnimg.cn/20210531172201548.png)

![](https://img-blog.csdnimg.cn/2021053117283651.png)

![](https://img-blog.csdnimg.cn/20210531172855489.png)

![](https://img-blog.csdnimg.cn/20210531173205684.png)

解决方案：
```bash
su - oracle
sed -i 's/^\(\s*\$(MK_EMAGENT_NMECTL)\)\s*$/\1 -lnnz11/g' $ORACLE_HOME/sysman/lib/ins_emagent.mk
```
执行完点击retry重试：

![](https://img-blog.csdnimg.cn/20210531173429769.png)

执行 root 脚本：

![](https://img-blog.csdnimg.cn/20210531173641716.png)

root用户下执行脚本：
```bash
/u01/app/oraInventory/orainstRoot.sh
/u01/app/oracle/product/11.2.0/db/root.sh
```
![](https://img-blog.csdnimg.cn/20210531173926391.png)

![](https://img-blog.csdnimg.cn/20210531174056289.png)

![](https://img-blog.csdnimg.cn/20210531174122126.png)

安装完成后，重启主机。

# 四、创建数据库
## 1、打开监听
```bash
su - oracle
lsnrctl start
lsnrctl status
```
![](https://img-blog.csdnimg.cn/20210531174512675.png)
## 2、连接VNC远程工具或者直接打开虚拟机图形化界面
```bash
dbca
```
![](https://img-blog.csdnimg.cn/2021053117492276.png)

创建数据库：

![](https://img-blog.csdnimg.cn/20210531175021476.png)

选择自定义模式：

![](https://img-blog.csdnimg.cn/20210531175036151.png)

输入实例名：

![](https://img-blog.csdnimg.cn/20210531175048186.png)

这里填写数据库实例名称和 dbname，本次填写 orcl。

![](https://img-blog.csdnimg.cn/20210531175240947.png)

不安装EM工具。

![](https://img-blog.csdnimg.cn/20210531175329342.png)

这里输入SYS和SYSTEM用户的密码，需要记住。

![](https://img-blog.csdnimg.cn/20210531175819854.png)

这里选择前面建好的/oradata目录用来存放数据文件。

![](https://img-blog.csdnimg.cn/20210531175908479.png)

不开启闪回日志，不开启归档日志，可以建好库之后再手动修改。

![](https://img-blog.csdnimg.cn/20210531175953761.png)

![](https://img-blog.csdnimg.cn/20210531180118511.png)

数据库内存分配，选择手动分配，占用物理内存70%左右。

![](https://img-blog.csdnimg.cn/20210531180222432.png)

block_size根据实际情况选择，一旦建库无法修改，默认8K。

![](https://img-blog.csdnimg.cn/20210531180325784.png)

字符集根据需要进行选择，默认AL32UTF8。

![](https://img-blog.csdnimg.cn/20210531180418580.png)

![](https://img-blog.csdnimg.cn/20210531180441297.png)

![](https://img-blog.csdnimg.cn/20210531180507805.png)

![](https://img-blog.csdnimg.cn/20210531180531646.png)

等待建库完成即可。

![](https://img-blog.csdnimg.cn/20210531185121835.png)

# 五、连接数据库
确保监听正常启动，并监听数据库：

![](https://img-blog.csdnimg.cn/20210531185400117.png)

## 1、通过数据库主机连接
```bash
su - oracle
sqlplus / as sysdba
select sysdate from dual;

##创建数据库用户
create user test identified by test;
grant dba to test;
conn test/test

##创建表
create table test (id number not null,name varchar2(100));
insert into test values (1,'lucifer');
commit;
```
## 2、通过PL/SQL连接test用户
![](https://img-blog.csdnimg.cn/20210531190303447.png)

![](https://img-blog.csdnimg.cn/20210531190329171.png)

**<font color='orage'>至此，Oracle数据库已经安装完毕。</font>**

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