---
title: 从零搭建金仓运维利器：KEMCC 安装与初探
date: 2025-07-17 14:17:44
tags: [墨力计划,金仓数据库]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1923756852664348672
---

>大家好，这里是 **DBA学习之路**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
过几天，金仓的管理平台 KEMCC 应该会上线，我这里有幸拿到了内测体验资格，提前测试了一把，给大家分享一下整体的一个测试过程和使用体验，当然还是以实战为主。

本文主要介绍 KEMCC 平台如何安装部署，以及一些简单的功能介绍和使用，让大家可以快速得云体验一下 KEMCC 平台。

# KEMCC 介绍
KEMCC（Kingbase Enterprise Manager Cloud Control）作为金仓全栈产品的企业级统一管理平台，为企业级用户提供关于数据库全生命周期管理能力及解决方案，通过一套可视化管控平台，实现了统一管理、极简运维的自动化运维全新体检。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250517-1923671151079862272_395407.png)

KEMCC 底层对接和支持了多种云平台资源，对外展现为统一的 UI 交互界面。可以很方便的基于第三方云平台构建数据库开发和生产云环境，完成大批量 KES 数据库实例的安装、部署、升级、备份、授权管理等生命周期工作。

当客户场景中存在大量的离线 KES 数据库实例时，可以使用 KEMCC 的非云纳管能力，将这些离线的 KES 数据库实例统管起来，提高针对大批量数据库实例的运维管理效率。

当客户环境存在并且已经有成熟的 K8S 等开源云平台方案时，可以部署 KEMCC 并且基于已有的云资源环境，构建内部私有数据库云。

# 环境信息

|IP|主机名|系统|内存|磁盘空间|
|-|-|-|-|-|
|192.168.6.53|kemcc|KylinV10 SP3|16G|200G|

KEMCC 目前支持运行 Linux 操作系统的服务器：
- 内存要求：16GB
- 软件包的磁盘空间要求：2GB
- 安装路径中的磁盘空间要求：3GB + 5GB* 被管理实例数量

KEMCC 默认使用的端口如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250517-1923679679198801920_395407.png)

如果以上端口与本地端口存在冲突，可在安装程序中修改 KEMCC 程序使用的端口。

# 安装前检查
## 关闭防火墙
建议关闭防火墙：
```bash
[root@kemcc ~]# systemctl stop firewalld
[root@kemcc ~]# systemctl disable firewalld
Removed /etc/systemd/system/multi-user.target.wants/firewalld.service.
Removed /etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service.
```

## 创建用户
麒麟 V1O 系统有密码复杂性要求，如果不想设置密码太复杂的话，可以取消密码复杂度：
```bash
[root@kemcc ~]# sed -i 's/^password\+[[:space:]]\+requisite[[:space:]]\+pam_pwquality.so/#&/g' /etc/pam.d/system-auth
[root@kemcc ~]# sed -i 's/use_authtok$//' /etc/pam.d/system-auth
```
KEMCC 部署之前，需要建立独立的运行用户 kemcc：
```bash
[root@kemcc ~]# useradd -d /home/kemcc -m kemcc
[root@kemcc ~]# echo "kemcc:kemcc" | chpasswd
[root@kemcc ~]# id kemcc
用户id=1000(kemcc) 组id=1000(kemcc) 组=1000(kemcc)
```

## 创建安装目录
KEMCC 安装过程中有默认的安装目录/opt/KEMCC，如直接使用 kemcc 用户安装，安装过程中会提示没有权限，需要将安装目录的权限赋予 kemcc 用户：
```bash
## 自定义安装路径
[root@kemcc ~]# mkdir -p /kemcc
[root@kemcc ~]# chown -R kemcc:kemcc /kemcc
```

## 系统参数配置
因 KEMCC 在运行时，会需要打开大量的文件句柄，所以需要检查一下系统相关的 ulimit 属性参数是否能够满足要求：
```bash
[root@kemcc ~]# su - kemcc
[kemcc@kemcc ~]$ ulimit -a 
core file size          (blocks, -c) unlimited
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 58859
max locked memory       (kbytes, -l) 64
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 58859
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```
KEMCC 进程涉及的几个限制包括：
- 最大文件句柄数（open files）
- 允许创建的最大进程数量（max user processes）

根据以上输出，open files 的参数值不符合运营配置要求，可通过修改 `/etc/security/
limits.conf` 配置文件进行调整，在文件末尾添加以下内容：
```bash
## root 用户执行
[root@kemcc ~]# cat<<-EOF>>/etc/security/limits.conf
kemcc - nofile 65535
EOF
```
完成修改后，切换到 kemcc 用户再次通过命令 `ulimit -a` 检查配置是否生效。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923286393237811200_395407.png)

## 配置系统编码
在安装前需要检查当前系统的编码类型设置当前系统的编码为 `UTF-8`：
```bash
[kemcc@kemcc ~]$ locale
LANG=zh_CN.UTF-8
LC_CTYPE="zh_CN.UTF-8"
LC_NUMERIC="zh_CN.UTF-8"
LC_TIME="zh_CN.UTF-8"
LC_COLLATE="zh_CN.UTF-8"
LC_MONETARY="zh_CN.UTF-8"
LC_MESSAGES="zh_CN.UTF-8"
LC_PAPER="zh_CN.UTF-8"
LC_NAME="zh_CN.UTF-8"
LC_ADDRESS="zh_CN.UTF-8"
LC_TELEPHONE="zh_CN.UTF-8"
LC_MEASUREMENT="zh_CN.UTF-8"
LC_IDENTIFICATION="zh_CN.UTF-8"
LC_ALL=
```
如果 LANG 和 LC_* 变量中包含“UTF-8”，则说明当前系统的字符编码为 UTF-8。否则，可尝试如下方式修改：
```bash
## 非必要不执行
[kemcc@kemcc ~]$ localectl set-locale LANG=zh_CN.UTF-8
```
运行成功后可再进行检查，验证操作是否生效。

## crontab 权限检查
程序启动需要用户具有 crontab 权限，可以输入以下命令检查是否有 crontab 权限：
```bash
[kemcc@kemcc ~]$ crontab -l
You (kemcc) are not allowed to use this program (crontab)
See crontab(1) for more information
```
如果当前用户没有 crontab 权限，可以通过以下方式授予用户 crontab 权限，需要使用 sudo 或者 root 用户操作：
```bash
## root 用户执行
[root@kemcc ~]# echo "kemcc" >> /etc/cron.allow 
```
检查是否存在 /etc/cron.deny 文件，如果存在该文件，则将当前用户名从该文件中移除。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923287932975198208_395407.png)

## 时钟检查
查看程序部署所在机器的当前系统时间，需要保证与现实时间一致，否则可能会造成程序工作异常：
```bash
[kemcc@kemcc ~]$ date
2025年 05月 16日 星期五 16:05:08 CST
```
如果时间不一致，需要修改系统时间：
```bash
timedatectl set-time "2025-05-16 16:05:08"
```
或者配置 TNS 服务自动同步时间。

## JDK 版本检查
检查当前系统 java 环境与版本：
```bash
## jdk 版本需要 8 及以上
[kemcc@kemcc ~]$ java -version
openjdk version "1.8.0_312"
OpenJDK Runtime Environment Bisheng (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM Bisheng (build 25.312-b07, mixed mode)
```
如果部署的系统中不存在 java 环境，则程序会使用安装包中自带的 java 运行程序。如果此时安装程序启动出现错误，请尝试手动安装该系统适配的 java 环境。

## 配置环境变量
为了方便使用 kemcc 命令，建议配置环境变量：
```bash
[kemcc@kemcc ~]$ cat<<-\EOF>>/home/kemcc/.bash_profile
export KEMCC_HOME=/kemcc
export PATH=$KEMCC_HOME/bin:/usr/sbin:$PATH
export PS1="[`whoami`@`hostname`:"'$PWD]$ '
EOF
[kemcc@kemcc ~]$ source /home/kemcc/.bash_profile
```

# KEMCC 安装
## 安装包解压
使用 kemcc 用户，上传安装包并解压：
```bash
[root@kemcc ~]# chown -R kemcc:kemcc /soft/
[root@kemcc ~]# su - kemcc
[kemcc@kemcc ~]$ cd /soft/
[kemcc@kemcc soft]$ tar -xf KEMCC-V003R001C002B0006-x86.tar.gz
[kemcc@kemcc soft]$ ll
-rw------- 1 kemcc kemcc 1331287028  5月 16 15:05 KEMCC-V003R001C002B0006-x86.tar.gz
drwxr-xr-x 2 kemcc kemcc        110  5月 13 18:17 setup
-rwxr-xr-x 1 kemcc kemcc       3020  5月 13 18:17 setup.sh
```

## 图形化安装
老样子，试用 vnc 调用图形化界面安装，打开新终端，进入安装程序中 setup.sh 所在目录，执行如下命令：
```bash
## 图形化安装
./setup.sh
## 命令行安装
./setup.sh -console
```
本文选择图形化安装：
```bash
[kemcc@kemcc ~]$ cd /soft/
[kemcc@kemcc soft]$ ./setup.sh 
true
Now launch installer...
```
Linux 安装过程，包含如下步骤：
1. 启动安装程序
2. 欢迎页面
3. 授权许可
4. 选择安装组件
5. 安装路径设置
6. 服务信息配置
7. 安装概览
8. 安装
9. 启动服务
10. 创建快捷方式
11. 安装完成
12. 执行 root.sh

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923294710928519168_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923294806529290240_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923294875466870784_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923295002411675648_395407.png)

其中 `Collertor 监听 IP` 与 `LAC 弹性 IP` 需要填写能够被外部访问的本机 IP：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923296480866086912_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923296683773931520_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923296842129879040_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923296983842828288_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923297113283244032_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923297266626998272_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923297321656266752_395407.png)

执行 root.sh 脚本：
```bash
[root@kemcc ~]# /kemcc/scripts/root.sh 
[Unit]
Description=Start KEMCC Service
After=network.target

[Service]
Type=forking
ExecStart=/kemcc/bin/restart_all.sh
ExecStop=/kemcc/bin/stop_all.sh
User=kemcc
Group=kemcc

[Install]
WantedBy=multi-user.target
Created symlink /etc/systemd/system/multi-user.target.wants/kemcc.service → /etc/systemd/system/kemcc.service.
已将KEMCC注册为系统服务
```
Linux 中执行 root.sh 成功后，安装过程完整结束。

# KEMCC 启停
金仓企业级统一管控平台服务的启动与停止通过可以通过命令行方式或者桌面端快捷方式操作。

## 启动服务
正常安装完成后，管控平台服务会自行启动。

命令行停止管控平台：
```bash
[kemcc@kemcc:/home/kemcc]$ stop_all.sh 
openjdk version "1.8.0_312"
OpenJDK Runtime Environment Bisheng (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM Bisheng (build 25.312-b07, mixed mode)
Stopping KEMCC......
KEMCC is running, stopping KEMCC......
.KEMCC stop success.
Stopping KES......
等待服务器进程关闭 .... 完成
服务器进程已经关闭
Stopping LAC......
waiting for server to shut down.... done
server stopped
sys_ctl: 正在运行服务器进程(PID: 40993)
/kemcc/lac/db/bin/kingbase "-D" "/kemcc/lac/bin/../db/data"
等待服务器进程关闭 .... 完成
服务器进程已经关闭
Stopping Collector......
openjdk version "1.8.0_312"
OpenJDK Runtime Environment Bisheng (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM Bisheng (build 25.312-b07, mixed mode)
now stop collector...
stop collector success...
Stopping KStudio......
Using CATALINA_BASE:   /kemcc/kstudio/apache-tomcat-kstudio
Using CATALINA_HOME:   /kemcc/kstudio/apache-tomcat-kstudio
Using CATALINA_TMPDIR: /kemcc/kstudio/apache-tomcat-kstudio/temp
Using JRE_HOME:        /usr
Using CLASSPATH:       /kemcc/kstudio/apache-tomcat-kstudio/bin/bootstrap.jar:/kemcc/kstudio/apache-tomcat-kstudio/bin/tomcat-juli.jar
Using CATALINA_OPTS:   
Using CATALINA_PID:    /kemcc/kstudio/apache-tomcat-kstudio/logs/catalina.pid
Tomcat stopped.
```
命令行启动管控平台：
```bash
[kemcc@kemcc:/home/kemcc]$ restart_all.sh 
Waiting for start kes
Starting KES......
等待服务器进程启动 .... 完成
服务器进程已经启动
. kes start successful.

Starting LAC ################################################################################
openjdk version "1.8.0_312"
OpenJDK Runtime Environment Bisheng (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM Bisheng (build 25.312-b07, mixed mode)
LAC Server 端口号为 11234
lac_ctl: PID file "/kemcc/lac/bin//lac_server.pid" does not exist
Is server running?
trying to start server anyway
Successfully set/update lac_server scheduled attempt to start.
sys_ctl:没有服务器进程正在运行
等待服务器进程启动 ....2025-05-16 16:49:59.930 CST [42033] 日志:  sepapower extension initialized
2025-05-16 16:49:59.934 CST [42033] 日志:  正在启动 KingbaseES V001R001C001B0038 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 4.8.5 20150623 (Red Hat 4.8.5-28), 64-bit
2025-05-16 16:49:59.934 CST [42033] 日志:  在Unix套接字 "/kemcc/lac/bin/../db/data/.s.KINGBASE.64321"上侦听
2025-05-16 16:49:59.987 CST [42033] 日志:  日志输出重定向到日志收集进程
2025-05-16 16:49:59.987 CST [42033] 提示:  后续的日志输出将出现在目录 "sys_log"中.
 完成
服务器进程已经启动
waiting for server to start...
[2025-05-16 16:50:00] [INFO] [140460108008768] configpath = /kemcc/lac/bin//lac_server.conf
[2025-05-16 16:50:00] [NOTICE] [140460108008768] redirecting logging output to "/kemcc/lac/bin//../log/lac_server.log"

 done
lac server started
Starting KEMCC ###############################################################################
openjdk version "1.8.0_312"
OpenJDK Runtime Environment Bisheng (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM Bisheng (build 25.312-b07, mixed mode)
Waiting for start KEMCC
........ KEMCC start successful.

Starting KMonitor collector ##########################################################################
openjdk version "1.8.0_312"
OpenJDK Runtime Environment Bisheng (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM Bisheng (build 25.312-b07, mixed mode)
now restart collector...
restart collector success...
Starting KStudio ############################################################################
openjdk version "1.8.0_312"
OpenJDK Runtime Environment Bisheng (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM Bisheng (build 25.312-b07, mixed mode)
Updating KStudio port： 8081
KStudio port: 8081
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Starting KStudio...
.KStudio start successful, PID: 42533
KStudio listening on port: 8081
```

# 访问 KEMCC
启动管控平台后：
>默认登录地址为：`http://管控平台所在机器 IP 地址:19000/`    
默认帐号密码为：`admin/Kingbase@2024`。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923300510887587840_395407.png)

当页面成功显示信息时，即表示 KEMCC 安装完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250516-1923300939604176896_395407.png)

至此，KEMCC 安装部署完成。

# 写在最后
KEMCC 安装部署比较简单，但是篇幅也不短，一篇文章不宜过长，否则读感不好，所以就写到这，下一篇讲讲如何使用 KEMCC。




