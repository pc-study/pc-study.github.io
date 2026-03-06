---
title: 进阶版：Centos7.9 安装 Vertica 11 社区版 3 节点集群（详细教程）
date: 2021-12-12 19:52:50
tags: [墨力计划,vertica]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/196801
---

# 前言
在初体验 Vertica 单机版之后，自然要体验一下集群版的，毕竟这才是使用最广泛的安装方式！

更多关于 Vertica 可以参考下方文章：

- [《初识 Vertica ，看完白皮书，我都发现了啥》](https://www.modb.pro/db/194763)
- [《Vertica 架构：Eon 与企业模式》](https://www.modb.pro/db/196644)
- [《初体验：Centos7.9 单节点安装 Vertica 11 社区版（超详细教程）》](https://www.modb.pro/db/195927)
- [《Vertica 玩转示例数据库：VMart》](https://www.modb.pro/db/196694)
- [《Vertica 安装配置 MC（管理控制台）》](https://www.modb.pro/db/196754)

**🏆 作者写的 [《Vertica 技术文章合集》](https://www.modb.pro/topic/194826)**，欢迎阅读 👏🏻！

# 一、介绍
关于 Vertica 的安装过程和注意点，在上一篇单机版中已经详细介绍过了，重复的部分我就不再过多赘述。

由于社区版最多只支持 3 节点集群和 1TB 数据量，因此只能演示 3 节点集群安装啦！

**废话不多说，直接开装！**

# 二、Linux 安装与环境配置

## 1、环境信息
大家手动创建 3 台一模一样的 Centos7.9 主机即可，注意主机名和网络配置区分。
|节点|主机版本|Vertica 版本|主机名|IP 地址|内存|SWAP|磁盘容量|
|-|-|-|-|-|-|-|-|
|1节点|centos7.9|11.0.1|vertica1|192.168.56.150|4G|2G|50G|
|2节点|centos7.9|11.0.1|vertica2|192.168.56.151|4G|2G|50G|
|3节点|centos7.9|11.0.1|vertica3|192.168.56.152|4G|2G|50G|

**📢 注意：** Vertica 集群部分主次节点，每一个都可以作为主节点！

## 2、脚本介绍
👻 我作为一个懒人，就直接使用 `vagrant` 一键安装 3 台主机了 罒ω罒，需要源码的**可以这里直接下载**：
>[]()

**🏅 <font color='orage'>后面我会出 Vertica 单节点和3节点集群的 Vagrant 一键安装脚本，到时候再公布完整脚本源码！</font>**

展示一下源码目录结构和 `config/vagrant.yml`：
```bash
tree -N
cat config/vagrant.yml
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-f8906611-aadb-46c7-92ea-8650f620f9b8.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-5f412e4d-8e34-40be-a7d8-2f3cdd2323e4.png)

再分享一下环境一键配置脚本 `env.sh`：
```bash
#!/bin/bash

##Configure Linux environment For openGauss
echo vertica | passwd --stdin root
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
## 1.Disable firewalld service
systemctl mask firewalld.service
systemctl disable firewalld.service
systemctl stop firewalld.service
echo "Firewalld " `systemctl status firewalld|grep Active`
echo "1.Disable firewalld service completed."
echo -e "\n"

## 2.Disable SELINUX
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
setenforce 0
getenforce
cat /etc/selinux/config|grep "SELINUX=disabled"
echo "2.Disable SELINUX completed."
echo -e "\n"

## 3.检查 pts 是否挂载
df -Th /dev/pts
echo "3.Check pts completed."
echo -e "\n"

## 4.创建用户和组
groupadd -g 1001 verticadba
useradd -u 1001 -g verticadba dbadmin
echo "dbadmin" | passwd dbadmin --stdin
id dbadmin
echo "4.Create group and user completed."
echo -e "\n"

## 5.配置 Disk Readahead
lsblk
/sbin/blockdev --setra 8192 /dev/sda
echo '/sbin/blockdev --setra 8192 /dev/sda' >> /etc/rc.local
chmod +x /etc/rc.d/rc.local
echo "5.Set Disk Readahead completed."
echo -e "\n"

## 6. Configure YUM and Install Packages
yum install -y gdb mcelog sysstat openssh which dialog chrony expect
rpm -q gdb mcelog sysstat openssh which dialog chrony expect
echo "6.Configure YUM and Install Packages completed."
echo -e "\n"

## 7.配置透明大页
## 默认为 always
cat /sys/kernel/mm/transparent_hugepage/enabled
## 如果不是 always，通过以下命令设置
echo always > /sys/kernel/mm/transparent_hugepage/enabled
## 设置开机自启动设置 always
cat<<EOF>>/etc/rc.local
if test -f /sys/kernel/mm/transparent_hugepage/enabled; then
echo always > /sys/kernel/mm/transparent_hugepage/enabled
fi
EOF
## redhat7 或 centos7 需要设置可执行权限
chmod +x /etc/rc.d/rc.local
echo "7.Enable transparent_hugepage completed."
echo -e "\n"

## 8.配置 I/O Scheduler
cat /sys/block/sda/queue/scheduler
echo deadline > /sys/block/sda/queue/scheduler
## 加入开机自启
echo 'echo deadline > /sys/block/sda/queue/scheduler' >> /etc/rc.local
chmod +x /etc/rc.d/rc.local
echo "8.Set I/O Scheduler completed."
echo -e "\n"

## 9.配置 TZ（TimeZone）
yum update -y tzdata
timedatectl set-timezone Asia/Shanghai
echo "9.Set TZ completed."
echo -e "\n"

## 10.配置环境变量
cat<<EOF>>/home/dbadmin/.bash_profile
export TZ="Asia/Shanghai"
export LANG=en_US.UTF-8
EOF
echo "10.Set Profile completed."
echo -e "\n"

## 11.关闭 tuned
systemctl stop tuned.service
systemctl disable tuned.service
systemctl status tuned.service
echo "11.Disable tuned completed."
echo -e "\n"


## 12.配置 swapiness
cat /proc/sys/vm/swappiness
echo 0 > /proc/sys/vm/swappiness
echo vm.swappiness=0 >>/etc/sysctl.conf
sysctl -p
echo "12.Disable swappiness completed."
echo -e "\n"

## 13.禁用 Defrag（碎片整理）
cat /sys/kernel/mm/transparent_hugepage/defrag
echo never > /sys/kernel/mm/transparent_hugepage/defrag
cat<<EOF>>/etc/rc.local
if test -f /sys/kernel/mm/transparent_hugepage/enabled; then
echo never > /sys/kernel/mm/transparent_hugepage/defrag
fi
EOF
chmod +x /etc/rc.d/rc.local
echo "13.Disable Defrag completed."
echo -e "\n"

## 14.配置 limits.conf
cat<<EOF>>/etc/security/limits.conf
dbadmin - nice 0
dbadmin - nofile 65536
dbadmin - as unlimited
dbadmin - fsize unlimited
dbadmin - nproc 30152
EOF
echo "14.Set limits completed."
echo -e "\n"

## 15.配置 pam.d
cat<<EOF>>/etc/pam.d/su
session required pam_limits.so
EOF
echo "15.Set pam.d completed."
echo -e "\n"

## 16.配置 sysctl.conf
cat<<EOF>>/etc/sysctl.conf
fs.file-max=65536
vm.min_free_kbytes=7980
kernel.pid_max=524288
vm.max_map_count=65536
EOF
sysctl -p
echo "16.Set sysctl completed."
echo -e "\n"

## 17. Configure SSH Service 
sed -i '/Banner/s/^/#/'  /etc/ssh/sshd_config
sed -i '/PermitRootLogin/s/^/#/'  /etc/ssh/sshd_config
echo -e "\n" >> /etc/ssh/sshd_config
echo "Banner none " >> /etc/ssh/sshd_config
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
cat /etc/ssh/sshd_config |grep -v ^#|grep -E 'PermitRoot|Banner'
echo "17.Configure SSH Service completed."
echo -e "\n"

## 18.开启 chrony
systemctl status chronyd
systemctl enable chronyd
chronyc tracking
echo "18.Enable chrony completed."
echo -e "\n"
```
**📢 注意：** Vagrant 安装包含 3 台主机和环境的配置，环境配置的脚本都写在 `env.sh` 中了，这里篇幅过长不过多展示！

## 3、环境安装配置

**开始安装：**
```bash
vagrant up
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-7e6e7720-4ef8-4b58-87ae-89a49578f00c.png)

短暂等待几分钟之后，3 台主机就创建好了，并且环境配置都已经配置好了！

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-6358b42e-0b4f-43be-b2a7-86fc68328832.png)

使用下面命令连接到 3 个节点检查一下环境配置情况：
```bash
vagrant ssh node1
vagrant ssh node2
vagrant ssh node3
```
3 台主机的 `root` 用户密码均为 `vertica`，`dbadmin`用户的密码为 `dbadmin`。

环境检查脚本：
```bash
## 1.主机名
hostname
## 2.防火墙检查
systemctl status firewalld
## 3.Selinux 检查
getenforce
## 4.rpm检查
rpm -q gdb mcelog sysstat openssh which dialog chrony
## 5.pts检查
df -Th /dev/pts
## 6.用户和组检查
id dbadmin
## 7.Disk Readahead检查
/sbin/blockdev --getra /dev/sda
## 8.chrony检查
systemctl status chronyd
## 9.透明大页检查
cat /sys/kernel/mm/transparent_hugepage/enabled
## 10.I/O Scheduler检查
cat /sys/block/sda/queue/scheduler
## 11.TZ和LANG检查
cat /home/dbadmin/.bash_profile
## 12.tuned检查
systemctl status tuned.service
## 13.检查swapiness
cat /proc/sys/vm/swappiness
## 14.Defrag检查
cat /sys/kernel/mm/transparent_hugepage/defrag
## 15.limits.conf检查
cat /etc/security/limits.conf
## 16.pam.d检查
cat /etc/pam.d/su
## 17.sysctl检查
sysctl -p
```
检查每一项都没问题之后就可以继续下一步了！

## 4、配置互信
**分享一个一键配置互信的脚本：[《Linux 多台主机配置 ssh 互信脚本》](https://www.modb.pro/db/137323)**

上传互信脚本后，执行互信：
```bash
## 前提是先安装 expect
yum install -y expect
cd /soft
chmod +x sshtrust.sh
## 填写需要互信的IP地址
cat<<EOF>sshhostList.cfg
192.168.56.150
192.168.56.151
192.168.56.152
EOF
## 执行互信
sh sshtrust.sh root vertica /soft/sshhostList.cfg
## 测试互信
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-7cd1f150-54c9-4f30-9eec-1f409d80f775.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-0f56465a-cb86-4977-a17a-b0a467e43808.png)

互信配置完毕！

# 三、安装 Vertica 集群
**<font color='red'>‼️ 正式开始安装前，强烈建议重启三台主机！💥</font>**

## 1、rpm 安装
安装介质已经上传到节点一的 `/soft` 目录下，在节点一执行 `rpm` 安装：
```bash
cd /soft
rpm -ivh vertica-11.0.1-2.x86_64.RHEL6.rpm
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-3a934b0b-1b29-49a2-be36-356fa03292f9.png)

**📢 注意：** 这里 rpm 只需要在节点一执行即可，执行脚本安装时会拷贝到其他节点！

## 2、脚本静默安装
使用 `/opt/vertica/sbin/install_vertica` 脚本来静默安装！

**1、创建静默安装配置文件**
```bash
/opt/vertica/sbin/install_vertica --record-config /tmp/vertica-inst.prp --hosts 192.168.56.150,192.168.56.151,192.168.56.152 --accept-eula --ssh-password vertica --dba-user-password dbadmin --rpm /soft/vertica-11.0.1-2.x86_64.RHEL6.rpm
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-17114776-9817-4c91-8f18-494ef4393daa.png)

**2、查看配置文件**
```bash
cat /tmp/vertica-inst.prp
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-34ca4199-073d-450b-9f52-40441c8116d9.png)

确认信息没有错误后，开始安装！

**3、开始静默安装**
```bash
/opt/vertica/sbin/install_vertica --config-file /tmp/vertica-inst.prp
```
如图，先给其他节点安装 rpm 包：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-2a45a575-bace-4ced-b22e-e286df8f9cb1.png)

继续等待几分钟时间，安装完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-eb3048d3-4989-42fc-b1bd-2254d10c79fc.png)

软件安装完成后，下面就可以开始创建数据库！

## 3、MC 创建集群
当然也可以使用 MC 创建集群，参考如下步骤！
**1、填写关键信息 `集群名`，`密码`：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-b14afb0d-bd2f-4736-8504-9e1ea6eb13a3.png)

**2、获取私钥文件**

需要私钥文件才能完成 MC 集群安装向导，由于已经互信过，直接获取私钥：
```bash
cd /root/.ssh
ls
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-9ae67c0b-fd77-431f-92eb-16c13621b83a.png)

将私钥 `id_rsa` 拷贝至打开 MC 的主机上！

**3、选择私钥，继续创建**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-d31e97a3-656c-4a66-a9d4-95477e9fa91c.png)

**4、选择 vertca rpm 包**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-3a2d71c4-71cf-46d2-ae8d-9d6fd67c05a9.png)

# 四、MC 创建数据库
**参考文章：[《Vertica 安装配置 MC（管理控制台）》](https://www.modb.pro/db/196754) 安装 MC 控制台！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-445c914b-f1f7-4f75-bf5e-dad64551451d.png)

## 1、导入集群

由于已经创建集群，这边可以直接导入集群，如果没有没有创建集群，也可以使用 MC 创建集群！

**1、输入节点1的 IP 地址 `192.168.56.150`**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-eb4007b1-46c4-4ed1-ae28-41da86617115.png)

**2、获取节点1的 API Key**
```bash
cat /opt/vertica/config/apikeys.dat
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-956cc1df-dfff-41e4-837a-08364c488c7e.png)

**3、填写 API Key**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-ff7946d6-d173-4a10-851b-e317d08eacb2.png)

**4、确认导入**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-71ad1c9e-1ebe-4b36-88d1-982a53c8e2ee.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-867c9468-a4fc-46af-91a6-901af904d6f1.png)

**5、查看集群状态**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-970f1659-14c4-4f60-b693-f6ea492fa35a.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-0d223321-8869-4142-8bc5-1cc1bfdcf724.png)

**至此，集群已经成功导入！**

## 2、创建数据库

选择创建数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-f8fb5f08-16bf-4216-9b04-083e83b9b21d.png)

选择企业模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-1bf57be7-b9c1-4428-91a8-53b0873237ac.png)

数据库名 `Lucifer`，密码为空：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-e7ac855d-3879-42ed-a90f-c516cf869bcd.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-1dda96e8-6b8e-4de3-a6b4-be9c0e16de13.png)

确认信息没问题，开始创建：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-612e4634-aa03-43ab-b081-bdd1f38d9545.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-7cdae47f-16fa-4462-8ce3-427e3699a48d.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-b6174a7a-5ab7-4df1-96b5-1150423ef52c.png)

等待创建结束即可，可能会报一个 license 相关的错误。

点击导入数据库 `Lucifer`，然后查看：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-e2636968-d13d-468e-9475-3405d04de243.png)

总体来说，创建过程没有 `admintools` 创建来的顺滑，也算是一个尝鲜吧！

# 写在最后
社区版 3 节点的集群，安装起来也不费劲，跟单机版其实差别不是很大，上手不难！至于关于如何管理集群和数据库，咱们后续文章再讲吧~