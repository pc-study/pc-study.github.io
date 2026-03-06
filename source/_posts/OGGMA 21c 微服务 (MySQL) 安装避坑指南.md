---
title: OGGMA 21c 微服务 (MySQL) 安装避坑指南
date: 2025-04-27 13:46:32
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1916357447824977920
---

# 前言
这两天在写 [**100 天实战课程**](https://www.modb.pro/course/142) 的 OGG 微服务课程：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250427-1916367760016289792_395407.png)

在 Oracle Linux 8.10 上安装 OGGMA 21c MySQL 遇到了一点问题，分享给大家一起避坑！

# 环境信息
环境信息：

| 主机版本        | 主机名    | 实例名     | MySQL 版本                   | IP 地址         | 数据库字符集 | Goldengate 版本             |
| ----------- | ------ | ------- | --------------------------- | ------------- | ------------- |------------------------- |
| oel8.10 | target | tdb | 8.0.0.36 | 192.168.6.121 | utf8mb4 |21.17|

# 安装前准备
## 安装目录创建
创建 OGG 安装目录并设置权限：
```bash
# root 用户执行
## oggma 用于存放可执行文件
## ogginst 存放 OGGMA 的服务管理器（Service Manager）和部署（Deployment）文件
[root@target ~]# mkdir -p /ogg/{oggma,ogginst}
[root@target ~]# chown -R mysql:mysql /ogg
[root@target ~]# chmod -R 775 /ogg
```

## 解压 OGG 安装包
```bash
[mysql@target ~]$ cd /soft/
[mysql@target soft]$ unzip -q p37400370_2117000OGGRU_Linux-x86-64.zip
```

## 安装 OpenSSL
参考 [Oracle GoldenGate Microservices Documentation](https://docs.oracle.com/en/middleware/goldengate/core/21.3/coredoc/install-prerequisites-installing-oracle-goldengate-mysql.html) 官方文档：
1. Oracle GoldenGate 21c for MySQL requires that OpenSSL 1.0 be installed on the Oracle GoldenGate server prior to creating a deployment.
2. OpenSSL 1.0 is included with the core operating system packages of OEL 7 and RHEL7 but is not included with OEL8/9 or RHEL 8/9, and therefore must be manually installed for these operating systems/versions.

所以在 OEL8 上安装 OGGMA 21c MySQL 需要提前安装 OpenSSL 1.0：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250427-1916344344336936960_395407.png)

根据官方文档提示，在 MySQL 官网 https://downloads.mysql.com/archives/c-odbc/ 下载对应的 ODBC 上传到 OGG 服务器主机上：
```bash
[root@target soft]# chown mysql:mysql /soft/mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit.tar.gz 
[root@target soft]# su - mysql
[mysql@target ~]$ cd /soft/
[mysql@target soft]$ tar -xf mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit.tar.gz
[mysql@target soft]$ cd mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit/lib/
[mysql@target lib]$ ls
libcrypto.so  libcrypto.so.1.0.0  libmyodbc8a.so  libmyodbc8w.so  libssl.so  libssl.so.1.0.0
```
配置环境变量：
```bash
# root 用户执行
[root@target ~]# cat<<-\EOF >> /etc/profile
export LD_LIBRARY_PATH=/soft/mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit/lib:$LD_LIBRARY_PATH
EOF
```
到这里，准备工作就完成了。

# OGGMA 软件安装
## 创建静默响应文件
创建静默安装响应文件：
```bash
[mysql@target ~]$ cd /soft/ggs_Linux_x64_MySQL_services_shiphome/Disk1/response
[mysql@target response]$ cat<<-EOF>oggcore.rsp
oracle.install.responseFileVersion=/oracle/install/rspfmt_ogginstall_response_schema_v21_1_0
INSTALL_OPTION=mysql
SOFTWARE_LOCATION=/ogg/oggma
INVENTORY_LOCATION=/ogg/oraInventory
UNIX_GROUP_NAME=mysql
EOF
```

## 配置 OGG 环境变量
```bash
# mysql 用户执行
[mysql@target ~]$ cat<<-\EOF >> /home/mysql/.bash_profile
export OGG_HOME=/ogg/oggma
export PATH=$OGG_HOME/bin:$OGG_HOME/OPatch:$PATH
EOF

# 生效环境变量
[mysql@target ~]$ source /home/mysql/.bash_profile
```

## 执行静默安装
OGGMA 软件安装这里会遇到第一个坑，安装 OGGMA 软件报错：
```bash
[mysql@target Disk1]$ ./runInstaller -silent -nowait -responseFile /soft/ggs_Linux_x64_MySQL_services_shiphome/Disk1/response/oggcore.rsp
Starting Oracle Universal Installer...

...
...
...

Caused by: java.lang.ExceptionInInitializerError: Exception java.lang.UnsatisfiedLinkError: /tmp/OraInstall2025-04-27_01-09-12PM/oui/lib/linux64/liboraInstaller.so: libnsl.so.1: cannot open shared object file: No such file or directory [in thread "main"]
        at java.lang.ClassLoader$NativeLibrary.load(Native Method)

...
...
...
```
根据报错提示：
>libnsl.so.1: cannot open shared object file: No such file or directory

明显是缺少 libnsl 包，手动安装 libnsl 包：
```bash
[root@target ~]# yum install -y libnsl
[root@target ~]# rpm -qa libnsl
libnsl-2.28-251.0.2.el8.x86_64
```
安装依赖之后继续执行安装：
```
[mysql@target ~]$ cd /soft/ggs_Linux_x64_MySQL_services_shiphome/Disk1/
[mysql@target Disk1]$ ./runInstaller -silent -nowait -responseFile /soft/ggs_Linux_x64_MySQL_services_shiphome/Disk1/response/oggcore.rsp
Starting Oracle Universal Installer...

Checking Temp space: must be greater than 120 MB.   Actual 81868 MB    Passed
Checking swap space: must be greater than 150 MB.   Actual 8191 MB    Passed
Preparing to launch Oracle Universal Installer from /tmp/OraInstall2025-04-27_01-22-14PM. Please wait ...[mysql@target Disk1]$ You can find the log of this install session at:
 /tmp/OraInstall2025-04-27_01-22-14PM/installActions2025-04-27_01-22-14PM.log
The installation of Oracle GoldenGate Services for MySQL was successful.
Please check '/ogg/oraInventory/logs/silentInstall2025-04-27_01-22-14PM.log' for more details.

As a root user, execute the following script(s):
        1. /ogg/oraInventory/orainstRoot.sh



Successfully Setup Software.
The log of this install session can be found at:
 /ogg/oraInventory/logs/installActions2025-04-27_01-22-14PM.log
```
执行 `orainstRoot.sh` 脚本：
```bash
[root@target ~]# /ogg/oraInventory/orainstRoot.sh
Changing permissions of /ogg/oraInventory.
Adding read,write permissions for group.
Removing read,write,execute permissions for world.

Changing groupname of /ogg/oraInventory to mysql.
The execution of the script is complete.
```
安装完成后，可以通过日志文件检查安装结果：
```bash
/ogg/oraInventory/logs/installActions2025-04-27_01-22-14PM.log
```
OGGMA 软件安装完成。

# OGGMA 服务配置
使用图形化工具 oggca.sh 配置服务管理器和部署（建议使用 vnc 软件）：
```bash
[mysql@target ~]$ source /etc/profile
[mysql@target ~]$ echo $LD_LIBRARY_PATH 
/soft/mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit/lib:/soft/mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit/lib:
[mysql@target ~]$ oggca.sh
```
建议使用图形化部署，比较直观！

填写 service manager 部署目录 `/ogg/ogginst/sm`，address 填写 OGGMA 本机 IP 即可，端口 `7809`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915604675747917824_395407.png)

创建一个新的 deploy：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915604921861287936_395407.png)

填写 deploy 名称以及软件安装目录：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915605223356248064_395407.png)

填写 deploy 部署目录 `/ogg/ogginst/dep`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915605422346612736_395407.png)

默认即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250427-1916351813138264064_395407.png)

创建一个管理账号，默认为 oggadmin：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915606708622209024_395407.png)

都不勾选：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915606786845978624_395407.png)

端口依次从 7810 开始，勾选开启监控：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915606924188463104_395407.png)

OGG 默认的用户 `ogg`，后面需要创建：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915607043562549248_395407.png)

执行安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915607131240280064_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915607239457517568_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250425-1915607318792777728_395407.png)

执行 root.sh 脚本：
```bash
[root@target ~]# /ogg/ogginst/sm/bin/registerServiceManager.sh
Copyright (c) 2017, 2020, Oracle and/or its affiliates. All rights reserved.
----------------------------------------------------
     Oracle GoldenGate Install As Service Script    
----------------------------------------------------
OGG_HOME=/ogg/oggma
OGG_CONF_HOME=/ogg/ogginst/sm/etc/conf
OGG_VAR_HOME=/ogg/ogginst/sm/var
OGG_USER=mysql
Running OracleGoldenGateInstall.sh...
Created symlink /etc/systemd/system/multi-user.target.wants/OracleGoldenGate.service → /etc/systemd/system/OracleGoldenGate.service.
```

## 坑二
本来正常情况下，注册完服务就安装完成了，但是这里报错了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250427-1916350225220907008_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250427-1916350260687941632_395407.png)

在 MOS 上也搜不到相关报错（即使有也不符合），经曹神指导检查，发现是缺包：
```bash
[mysql@target ~]$ adminsrvr 
adminsrvr: error while loading shared libraries: libssl.so.10: cannot open shared object file: No such file or directory
```
报错缺少 `libssl.so.10`，可是我们前面已经安装了 libssl 怎么还会缺少呢？再一细看，原来之前安装的是 so.1.0.0，这里要的是 so.10，版本不匹配。

最简单的解决方式就是链接一个 so.10 出来：
```bash
[mysql@target ~]$ cd /soft/mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit/lib
[mysql@target lib]$ ln -sf libssl.so libssl.so.10
[mysql@target lib]$ ll
total 36136
lrwxrwxrwx. 1 mysql mysql       18 Jun 19  2019 libcrypto.so -> libcrypto.so.1.0.0
-rw-r--r--. 1 mysql mysql  2605390 Jun 19  2019 libcrypto.so.1.0.0
-rwxr-xr-x. 1 mysql mysql 16925360 Jun 19  2019 libmyodbc8a.so
-rwxr-xr-x. 1 mysql mysql 16946136 Jun 19  2019 libmyodbc8w.so
lrwxrwxrwx. 1 mysql mysql       15 Jun 19  2019 libssl.so -> libssl.so.1.0.0
lrwxrwxrwx. 1 mysql mysql        9 Apr 27 12:38 libssl.so.10 -> libssl.so
-rw-r--r--. 1 mysql mysql   512744 Jun 19  2019 libssl.so.1.0.0
```
测试一下是否还缺包：
```bash
[mysql@target lib]$ adminsrvr
adminsrvr: error while loading shared libraries: libcrypto.so.10: cannot open shared object file: No such file or directory
```
同样的再链接一个：
```bash
[mysql@target lib]$ ln -sf libcrypto.so libcrypto.so.10
[mysql@target lib]$ ll
total 36136
lrwxrwxrwx. 1 mysql mysql       18 Jun 19  2019 libcrypto.so -> libcrypto.so.1.0.0
lrwxrwxrwx. 1 mysql mysql       12 Apr 27 12:45 libcrypto.so.10 -> libcrypto.so
-rw-r--r--. 1 mysql mysql  2605390 Jun 19  2019 libcrypto.so.1.0.0
-rwxr-xr-x. 1 mysql mysql 16925360 Jun 19  2019 libmyodbc8a.so
-rwxr-xr-x. 1 mysql mysql 16946136 Jun 19  2019 libmyodbc8w.so
lrwxrwxrwx. 1 mysql mysql       15 Jun 19  2019 libssl.so -> libssl.so.1.0.0
lrwxrwxrwx. 1 mysql mysql        9 Apr 27 12:42 libssl.so.10 -> libssl.so
-rw-r--r--. 1 mysql mysql   512744 Jun 19  2019 libssl.so.1.0.0
```
再次测试一下是否还缺包：
```bash
[mysql@target lib]$ adminsrvr
adminsrvr: /soft/mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit/lib/libcrypto.so.10: no version information available (required by /ogg/oggma/bin/../lib/libmysqlclient.so.21)
adminsrvr: /soft/mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit/lib/libssl.so.10: no version information available (required by /ogg/oggma/bin/../lib/libmysqlclient.so.21)
Oracle GoldenGate Administration Service for MySQL
Version 21.17.0.0.0 OGGCORE_21.17.0.0.0OGGRU_PLATFORMS_250125.0558

Copyright (C) 1995, 2025, Oracle and/or its affiliates. All rights reserved.

Oracle Linux 7, x64, 64bit (optimized), MySQL  on Jan 25 2025 10:57:34
Operating system character set identified as UTF-8.
```
确保正常之后，这里无法继续安装，否则还是会报错！需要删除 OGGCA 相关服务以及文件，重新配置：
```bash
[root@target ~]# rm -rf /etc/systemd/system/OracleGoldenGate.service
[root@target ~]# rm -rf /etc/oggInst.loc
[mysql@target lib]$ cd /ogg/ogginst/
[mysql@target ogginst]$ ls
dep  sm
[mysql@target ogginst]$ rm -rf *
[mysql@target ogginst]$ ps -ef|grep -v grep|grep ServiceManager
mysql      33033       1  0 12:41 ?        00:00:01 /ogg/oggma/bin/ServiceManager --inventory '/ogg/ogginst/sm/etc/conf'
[mysql@target ogginst]$ kill -9 33033
```
重新配置 OGGCA 之前，建议手动设置一下环境变量：
```bash
export LD_LIBRARY_PATH=/soft/mysql-connector-odbc-8.0.17-linux-glibc2.12-x86-64bit/lib:$LD_LIBRARY_PAT
[mysql@target ~]$ oggca.sh 
```
这次顺利安装，一次成功：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250427-1916355748641124352_395407.png)

服务启动后，可以通过浏览器访问 OGGMA 管理界面，网址为：`http://192.168.6.121:7810`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250422-1914586968474791936_395407.png)

输入账号（oggadmin）密码连接：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250427-1916367329164800000_395407.png)

这里可以看到 OGGMA 的版本是 21.17 版本。

# 写在最后
大家在使用 OGG 的时候还遇到过哪些坑呢？欢迎评论区分享~

# 追加
曹总后续给了替代解决方案：
```bash
dnf install openssl-devel compat-openssl10
```
大家可以自行测试一下。
