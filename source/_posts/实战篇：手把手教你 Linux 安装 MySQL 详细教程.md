---
title: 实战篇：手把手教你 Linux 安装 MySQL 详细教程
date: 2021-11-18 13:11:41
tags: [墨力计划,dba]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/168340
---


# 前言
如何在 Linux 主机一步一步安装 MySQL 数据库？看这篇准没错！

![](https://img-blog.csdnimg.cn/20210610002614429.png)
# 一、Linux 服务器安装
**安装Linux服务器可选择：Centos，Redhat，Oracle Linux。**

**`Linux 安装包下载`：**

**[https://mp.weixin.qq.com/s/vqhPRNwSeiaTsiWHo0GKVA](https://mp.weixin.qq.com/s/vqhPRNwSeiaTsiWHo0GKVA)**

参考官网文档，本次实战环境配置为：
- Redhat 7.9 x86_64
- 内存2G
- 硬盘50G

![](https://img-blog.csdnimg.cn/20210609223736448.png)

![](https://img-blog.csdnimg.cn/20210609224031655.png)

**⭐️ Linux 主机安装教程可参考：[实战篇：VMware Workstation 虚拟机安装 Linux 系统](https://luciferliu.blog.csdn.net/article/details/118558758)**

# 二、MySQL 安装介质下载
**MySQL 安装包官网下载地址：[MySQL Product Archives](https://downloads.mysql.com/archives/community/) ！**

选择版本：
- 经典版5.7.20
- Linux-Generic
- glibc-2.12 && x86-64

![](https://img-blog.csdnimg.cn/20210609211435530.png)

下载完之后，安装包如下：`mysql-5.7.20-linux-glibc2.12-x86_64.tar.gz`，通过 ftp 工具上传至 Linux 服务器文件夹下。

# 三、MySQL 安装
安装步骤参考官方文档：[Installing MySQL on Unix/Linux Using Generic Binaries](https://dev.mysql.com/doc/refman/5.7/en/binary-installation.html) 
## 1、检查安装介质
上传安装介质至 /soft 目录下：

![](https://img-blog.csdnimg.cn/20210609214357647.png)
## 2、解压安装介质
解压安装介质，并将解压出的文件夹名称修改为 `mysql`：
```bash
cd /soft
tar -xvf mysql-5.7.20-linux-glibc2.12-x86_64.tar.gz
mv mysql-5.7.20-linux-glibc2.12-x86_64 mysql
```
![](https://img-blog.csdnimg.cn/20210609222624344.png)

![](https://img-blog.csdnimg.cn/20210609222552662.png)
## 3、关闭防火墙
```bash
systemctl stop firewalld
systemctl disable firewalld
systemctl status firewalld
```
## 4、建立用户和组
安装 MySQL 需要创建 mysql 用户：
```bash
groupadd mysql
useradd -r -g mysql -s /bin/false mysql
```
![](https://img-blog.csdnimg.cn/20210609222915258.png)
## 5、创建相关目录
```bash
mkdir -p /data/mysql
chown -R mysql:mysql /data
chown -R mysql:mysql /soft
chmod 750 /data
```
![](https://img-blog.csdnimg.cn/20210609223245548.png)
## 6、配置环境变量
配置 root 用户环境变量：
```bash
cat <<EOF>> /root/.bash_profile
export PATH=\$PATH:/soft/mysql/bin
EOF
##生效环境变量
source /root/.bash_profile
```
![](https://img-blog.csdnimg.cn/2021060923042979.png)
## 7、安装依赖包
配置 yum 源并安装 libaio 包：
```bash
##挂载镜像源
mount /dev/cdrom /mnt
##配置yum源
cat <<EOF>>/etc/yum.repos.d/local.repo
[local]
name=local
baseurl=file:///mnt
gpgcheck=0
enabled=1
EOF
##安装依赖包
yum install -y libaio
```
![](https://img-blog.csdnimg.cn/20210609225239130.png)
## 8、卸载自带mariadb和mysql
- 检查系统是否安装mysql：`rpm -qa | grep mysql`，因为我是最小化安装所以没有。
- 如果有则强制卸载：`rpm -e --nodeps $(rpm -qa | grep mysql)`

![](https://img-blog.csdnimg.cn/20210609221149657.png)
- 检查系统是否安装mariadb：`rpm -qa | grep mariadb`
- 如果有则强制卸载：`rpm -e --nodeps $(rpm -qa | grep mariadb)`，这里卸载成功。

![](https://img-blog.csdnimg.cn/20210609221616590.png)
# 四、MySQL 初始化
## 1、初始化 MySQL 数据库
通过以下命令初始化创建 MySQL 数据库：
```bash
mysqld --initialize --user=mysql --basedir=/soft/mysql --datadir=/data/mysql/
```
参数： `--basedir` 为mysql解压目录，`--datadir` 为mysql数据存放目录。

![](https://img-blog.csdnimg.cn/2021060923070866.png)

**📢 注意：这里框出的是root用户的初始密码：`yhfvt_rP,24M` ！**

## 2、配置 my.cnf
配置 my.cnf 文件：
```bash
cat <<EOF>/etc/my.cnf
[mysqld]
user=mysql
basedir=/soft/mysql
datadir=/data/mysql
server_id=6
port=3306
socket=/tmp/mysql.sock
##客户端
[mysql]
socket=/tmp/mysql.sock
prompt=lucifer [\\\\d]>
EOF
```
![](https://img-blog.csdnimg.cn/20210609233230196.png)
启动 MySQL 服务：
```bash
/soft/mysql/support-files/mysql.server start
```
![](https://img-blog.csdnimg.cn/20210609233308118.png)

**<font color='orage'>当然 MySQL 服务也可以配置开机自启动！</font>**
## 3、配置 MySQL 开机自启
**Linux 6&7 通用配置方式：**
```bash
cp /soft/mysql/support-files/mysql.server /etc/init.d/mysqld
chkconfig mysqld on
```
![](https://img-blog.csdnimg.cn/20210609234824245.png)
配置完之后就可以用 `service mysqld start` 启动 MySQL 服务！

**Linux7配置方式：**
```bash
##配置mysqld.service文件：
cat <<EOF>>/usr/lib/systemd/system/mysqld.service
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target
[Install]
WantedBy=multi-user.target
[Service]
User=mysql
Group=mysql
ExecStart=/soft/mysql/bin/mysqld --defaults-file=/etc/my.cnf
LimitNOFILE = 5000
EOF
systemctl enable mysqld
```
![](https://img-blog.csdnimg.cn/20210609235342134.png)

配置完之后就可以用 `systemctl start mysqld` 启动mysql服务！

![](https://img-blog.csdnimg.cn/20210609235445986.png)
## 4、修改 MySQL ROOT 密码
尝试连接mysql数据库：
```bash
mysql -uroot -pyhfvt_rP,24M
```
![](https://img-blog.csdnimg.cn/20210610000253651.png)

**由于初始密码不好记，因此需要修改数据库 root 用户初始密码！**

重设 root 密码：
```bash
mysqladmin -uroot -pyhfvt_rP,24M password mysql
```
![](https://img-blog.csdnimg.cn/20210610000945275.png)

用新密码连接 MySQL 数据库：
```bash
mysql -uroot -pmysql
```
![](https://img-blog.csdnimg.cn/20210610001439174.png)
## 5、查询测试
查看当前已创建的数据库：

![](https://img-blog.csdnimg.cn/20210610001515952.png)

查看数据库 MySQL 的用户信息：

![](https://img-blog.csdnimg.cn/20210610002358842.png)

![](https://img-blog.csdnimg.cn/20210610001900197.png)

**<font color='orage'>至此，MySQL 数据库已经安装完毕，可以连接进行测试操作！</font>**