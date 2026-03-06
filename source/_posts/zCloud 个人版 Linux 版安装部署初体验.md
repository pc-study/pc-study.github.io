---
title: zCloud 个人版 Linux 版安装部署初体验
date: 2024-08-05 10:01:31
tags: [墨力计划,zcloud]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1820278805795266560
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
zCloud 数据库云管平台（社区版），是面向个人学习或测试的数据库监控运维管理平台。平台兼容 20 款不同类型数据库，支持对数据库进行监控、巡检、性能分析、容量分析，以及支持通过低代码方式自定义扩展更多运维管理能力，从而帮助管理者、DBA、业务人员提升数据库运维管理效率。

**应用场景：**
>**实时监控告警：** 提供不同维度的数据库运行指标监控及变化趋势分析，快速发现数据库各种异常并实时告警，将大部分数据库问题扼杀在开始阶段，减少或规避故障的发生，降低故障带来的业务影响。
**智能健康巡检：** 通过对数据库运行状态数据的判断，以及指标关联分析，根据专家视⻆⻆并结合算法知识库，全面检查数据库存在的健康隐患，帮助用户更好的了解数据库运行状态，并提出改进建议，周期性持续进行数据库优化改进，显著减少 DBA 人员工作量。
**性能查看分析及处理：** 通过对数据库性能指标和相关对象的分析，快速分析、定位数据库性能问题，提升数据库运行稳定性和可靠性。
**容量分析及管理：** 帮助用户进行高效容量监控、分析、管理
**开放运维中心：** 数据库管理平台通过预置组件、预置流程、自定义组件开发和开放 API 接口，以及可视化页面的配置，助力用户轻松应对个性化挑战，实现敏捷高效的数据库运维能力扩展。

**个人版-支持数据库说明：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-619f89a7-9bc6-4ca6-badc-17dab23e7ee1.png)

**个人版/标准版/企业版对比：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-959dce44-19b7-49fc-acdd-a189fcb1693b.png)

**参考文档：**
>[zCloud个人版下载](https://zcloud.enmotech.com/software)
[zCloud个人版安装部署-Linux版](https://www.modb.pro/doc/133879)
[zCloud个人版安装部署-Windows版](https://www.modb.pro/doc/133880)
[zCloud个人版安装部署-Mac版](https://www.modb.pro/doc/133881)

# zCloud Linux 版安装部署

|主机名|主机版本|zCloud版本|IP地址|
|--|--|--|--|
|zcloud|centos7.9|6.2.1|192.168.6.72|

**在开始之前，请确保您的 Linux 系统满足以下要求：**

1、已安装 docker 环境（推荐使用 26.1.4 及以上版本）
- 安装 docker 环境的要求：
- 64 位版本的 Linux，包括 Ubuntu、CentOS 等。
- Linux 内核版本需不低于 3.10
- 2GB 以上的可用内存
- 满足 Docker 所需的硬盘存储空间（不小于 20G）

2、安装部署 zCloud 个人版环境要求

|操作系统|架构|CPU|内存|SSD|
|--|--|--|--|--|
|Linux|x86_64|≥4C|≥32G|≥50G|
|Linux|aarch64|≥4C|≥32G|≥50G|

## 安装 docker
首先，备份现有的软件源文件：
```bash
[root@zcloud ~]# mkdir -p /etc/yum.repos.d/bak
[root@zcloud ~]# mv /etc/yum.repos.d/* /etc/yum.repos.d/bak
mv: cannot move '/etc/yum.repos.d/bak' to a subdirectory of itself, '/etc/yum.repos.d/bak/bak'
```
配置阿里云软件源：
```bash
[root@zcloud yum.repos.d]#  curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2523  100  2523    0     0  28610      0 --:--:-- --:--:-- --:--:-- 28670
```
更新 YUM 缓存：
```bash
[root@zcloud ~]# yum clean all
[root@zcloud ~]# yum makecache
```
设置阿里云镜像地址：
```bash
[root@zcloud ~]# yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
Loaded plugins: fastestmirror, langpacks
adding repo from: http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
grabbing file http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo to /etc/yum.repos.d/docker-ce.repo
repo saved to /etc/yum.repos.d/docker-ce.repo
[root@zcloud ~]# cd /etc/yum.repos.d/
[root@zcloud yum.repos.d]# ll
drwxr-xr-x. 2 root root  220 Aug  5 09:17 bak
-rw-r--r--. 1 root root 2523 Aug  5 09:20 CentOS-Base.repo
-rw-r--r--. 1 root root 2081 Aug  5 09:16 docker-ce.repo
```
卸载旧依赖包：
```bash
[root@zcloud ~]# yum remove -y docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine \
                  podman \
                  runc
```
安装 EPEL 和一些必要的依赖包：
```bash
[root@zcloud ~]# yum install -y epel-release
[root@zcloud ~]# yum install -y yum-utils device-mapper-persistent-data lvm2
```
安装最新版 docker：
```bash
[root@zcloud ~]# yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
安装后检查是否成功：
```bash
[root@zcloud ~]# docker --version
Docker version 26.1.4, build 5650f9b
```
启动 docker：
```bash
[root@zcloud ~]# systemctl start docker.service
[root@zcloud ~]# systemctl enable docker.service
Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service.
[root@zcloud ~]# systemctl status docker.service
● docker.service - Docker Application Container Engine
   Loaded: loaded (/usr/lib/systemd/system/docker.service; enabled; vendor preset: disabled)
   Active: active (running) since Mon 2024-08-05 09:28:17 CST; 7s ago
     Docs: https://docs.docker.com
 Main PID: 2890 (dockerd)
   CGroup: /system.slice/docker.service
           └─2890 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock

Aug 05 09:28:16 zcloud systemd[1]: Starting Docker Application Container Engine...
Aug 05 09:28:16 zcloud dockerd[2890]: time="2024-08-05T09:28:16.152264976+08:00" level=info msg="Starting up"
Aug 05 09:28:16 zcloud dockerd[2890]: time="2024-08-05T09:28:16.225193662+08:00" level=info msg="Loading containers: start."
Aug 05 09:28:17 zcloud dockerd[2890]: time="2024-08-05T09:28:17.230894556+08:00" level=info msg="Firewalld: interface docker0 already part of docker zone, returning"
Aug 05 09:28:17 zcloud dockerd[2890]: time="2024-08-05T09:28:17.352091872+08:00" level=info msg="Loading containers: done."
Aug 05 09:28:17 zcloud dockerd[2890]: time="2024-08-05T09:28:17.376964264+08:00" level=info msg="Docker daemon" commit=de5c9cf containerd-snapshotter=false storage-driver=overlay2 version=26.1.4
Aug 05 09:28:17 zcloud dockerd[2890]: time="2024-08-05T09:28:17.377262433+08:00" level=info msg="Daemon has completed initialization"
Aug 05 09:28:17 zcloud dockerd[2890]: time="2024-08-05T09:28:17.429972637+08:00" level=info msg="API listen on /run/docker.sock"
Aug 05 09:28:17 zcloud systemd[1]: Started Docker Application Container Engine.
```

## 安装前准备
创建安装路径（这里的路径是官方默认配置路径，可根据需要自行修改）：
```bash
## 软件配置路径
[root@zcloud ~]# mkdir -p /my_zcloud_data/zcloud

## 数据库存储路径
[root@zcloud ~]# mkdir -p /my_zcloud_data/db
```
解压安装包：
```bash
[root@zcloud soft]# ll
total 4026896
-rw-r--r--. 1 root root 4123537621 Aug  4 17:01 zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657.tar.gz
[root@zcloud soft]# tar -xvf zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657.tar.gz
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/.lib.sh
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/install.sh
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/purge.sh
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/start.sh
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/stop.sh
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/uninstall.sh
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/.db_type
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/config.env
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/docker-compose.yml
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/images/
zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/images/zcloud.tar
```
配置文件 `config.env`：
```bash
## 配置文件在解压后的文件目录下
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# ll
total 28
-rw-r--r--. 1 root root  116 Jul 30 22:25 config.env
-rw-r--r--. 1 root root 1381 Jul 30 22:32 docker-compose.yml
drwxr-xr-x. 2 root root   24 Jul 30 17:00 images
-rwxr-xr-x. 1 root root 3695 Jul 30 22:04 install.sh
-rwxr-xr-x. 1 root root 1080 Jul 30 22:04 purge.sh
-rwxr-xr-x. 1 root root 3334 Jul 30 22:04 start.sh
-rwxr-xr-x. 1 root root  560 Jul 30 22:04 stop.sh
-rwxr-xr-x. 1 root root  579 Jul 30 22:04 uninstall.sh

## 默认配置信息如下
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# cat config.env
ZCLOUD_DATA_DIR=/my_zcloud_data/zcloud
DB_DATA_DIR=/my_zcloud_data/db
ZCLOUD_EXPORT_PORT=8080
HOST_IP=172.16.80.126

## 修改对应的 IP 地址
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# vi config.env

## 修改后信息如下
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# cat config.env
ZCLOUD_DATA_DIR=/my_zcloud_data/zcloud
DB_DATA_DIR=/my_zcloud_data/db
ZCLOUD_EXPORT_PORT=8080
HOST_IP=192.168.6.72
```
## 执行安装
在安装包解压目录下执行安装：
```bash
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# ./install.sh
配置文件路径: /soft/zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/config.env
请确认如下配置
主机IP: 192.168.6.72
zcloud数据文件夹: /my_zcloud_data/zcloud
zcloud数据库数据文件夹: /my_zcloud_data/db
zcloud服务端口: 8080
确认配置 (y/n): y
导入 /soft/zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657/images/zcloud.tar 到 Docker...
174f56854903: Loading layer [==================================================>]  211.7MB/211.7MB
3120e7d0e5d6: Loading layer [==================================================>]  379.4kB/379.4kB
91ad17e77b35: Loading layer [==================================================>]  6.133GB/6.133GB
6ae55e4aec73: Loading layer [==================================================>]  36.22MB/36.22MB
5f70bf18a086: Loading layer [==================================================>]  1.024kB/1.024kB
Loaded image: zcloud_with_mysql:6.2.1
01cfc51837bc: Loading layer [==================================================>]  379.4kB/379.4kB
e421bd33d73a: Loading layer [==================================================>]  658.2MB/658.2MB
65b0ba72c5a0: Loading layer [==================================================>]  35.07MB/35.07MB
5f70bf18a086: Loading layer [==================================================>]  1.024kB/1.024kB
Loaded image: mysql_for_z:5.7.44
执行容器安装zcloud
[+] Creating 5/5
 ✔ Network zcloud_621_for_personal_mysql_x86_20240730_1657_zcloud_net    Created                                                                                                                                                                                                    0.3s 
 ✔ Volume "zcloud_621_for_personal_mysql_x86_20240730_1657_db-data"      Created                                                                                                                                                                                                    0.0s 
 ✔ Volume "zcloud_621_for_personal_mysql_x86_20240730_1657_zcloud-data"  Created                                                                                                                                                                                                    0.0s 
 ✔ Container mysql_for_zcloud                                            Created                                                                                                                                                                                                   21.3s 
 ✔ Container zcloud                                                      Created  
```
安装完成，输入`./start.sh` 启动 zCloud 个人版容器（防火墙貌似不能关，否则会启动失败）：
```bash
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# ./start.sh 
启动zcloud容器组（初次启动大约需8min）
zcloud
mysql_for_zcloud

容器相关信息：zcloud Up Less than a second (health: starting)
容器相关信息：mysql_for_zcloud Up Less than a second (health: starting)

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 5 seconds (health: starting)
容器相关信息：mysql_for_zcloud Up 5 seconds (health: starting)

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 10 seconds (health: starting)
容器相关信息：mysql_for_zcloud Up 10 seconds (health: starting)

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 15 seconds (health: starting)
容器相关信息：mysql_for_zcloud Up 15 seconds (health: starting)

...
...
...

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 8 minutes (unhealthy)
容器相关信息：mysql_for_zcloud Up 8 minutes (healthy)

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 8 minutes (unhealthy)
容器相关信息：mysql_for_zcloud Up 8 minutes (healthy)

容器相关信息：zcloud Up 8 minutes (healthy) 需8min），请等待...
容器相关信息：mysql_for_zcloud Up 8 minutes (healthy)

所有容器及容器内服务已成功启动并运行，您可通过浏览器访问：http://192.168.6.72:8080开始使用zcloud
```
提示：这里我使用 rhel8.10 尝试启动过，zcloud 容器一直无法成功启动，原因未知。

## 网页访问
通过浏览器访问：http://192.168.6.72:8080 开始使用 zcloud（平台登录URL：http://<部署服务IP地址或对应映射后的IP>:<port>，默认 Web 端口是 8080，可进行调整）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-6b186f7a-7b95-4865-8a0f-5a92789e8295.png)

这里复制个人用户标识，然后在公众号申请 license（扫码关注公众号，点击【产品服务】--> 【申请 license】，填写个人资料后，免费申请一年期
License）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-1319e47d-16b7-4b05-9f50-0edfc99dff37.png)

zCloud 个人版默认已完成 Proxy 预装，默认已完成预制用户账号。通过激活 License 之后，使用下面账号即可开启使用体验 zCloud 个人版。

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-9b0019f4-4692-4d4f-aff4-5afc969c71fd.png)

个人预制账号信息（可根据自己安全需要，在首次登录时选择修改默认密码）:
>**普通用户**：`sysuser` 密码: `A3bDf#7Wz9`
**管理用户**：`sysadmin` 密码： `N7tK8Wz#eR4`

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-222e48d8-688e-404e-a066-4869d4de8c95.png)

zCloud 平台分为平台用户和租户用户：
>**平台用户**：管理平台基本参数、管理介质、管理基础设施等；
**租户用户**：涉及具体数据库的管理监控，可以管理本租户的用户、基础设施等。

zCloud 默认平台级管理用户为：`spadmin`，平台管理用户登录后看到界面如下，统计展示整个云平台租户、管理主机、数据库的类型和数量：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-a539917e-0acf-4b15-a76e-e3ef1fcd17ba.png)

zCloud 安装完成，可以愉快的玩耍了。

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