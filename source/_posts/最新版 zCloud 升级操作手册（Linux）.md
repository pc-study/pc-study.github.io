---
title: 最新版 zCloud 升级操作手册（Linux）
date: 2024-08-19 11:40:43
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1825189373224755200
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
上周，**zCloud 智能运维小助手**告知更新了一版，目前最新的版本是 `6.2.1.1`，自然是想第一时间尝鲜下新版本，看看有没有什么新的优化和改变。但是，又不想重新安装一台新的，于是想着参考官方提供的升级方式将旧版本进行升级。

>官方 zCloud 个人版升级操作手册下载地址：[zCloud个人版升级操作手册](https://www.modb.pro/doc/134551)

本文记录如何从旧版 zCloud 个人版升级到最新的 zCloud 个人版。
>注意：升级过程为停机升级，不对已纳管的数据库本身产生影响，但数据库监控相关数据，会存在监控断点数据。

# 新版本升级操作
大致看了下文档，升级新版本需要先停止监控端服务，然后卸载旧版本，然后安装新版本。下面将以在 Linux 操作系统（Mysql 资料库）的卸载及升级操作为例进行说明，其他操作系统或数据库的卸载及升级操作相同。

## 停止旧版 zCloud 个人版
首先，进入 zCloud 个人版旧版解压后的软件目录，执行 `./stop.sh` 命令，停止所有容器服务：
```bash
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# ll
total 28
-rw-r--r--. 1 root root  115 Aug  5 09:33 config.env
-rw-r--r--. 1 root root 1381 Jul 30 22:32 docker-compose.yml
drwxr-xr-x. 2 root root   24 Jul 30 17:00 images
-rwxr-xr-x. 1 root root 3695 Jul 30 22:04 install.sh
-rwxr-xr-x. 1 root root 1080 Jul 30 22:04 purge.sh
-rwxr-xr-x. 1 root root 3334 Jul 30 22:04 start.sh
-rwxr-xr-x. 1 root root  560 Jul 30 22:04 stop.sh
-rwxr-xr-x. 1 root root  579 Jul 30 22:04 uninstall.sh
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# ./stop.sh
停止容器运行
zcloud
mysql_for_zcloud
```

## 卸载旧版 zCloud 个人版容器
确保完全停止旧版 zCloud 个人版后，再执行 `./uninstall.sh` 卸载命令，卸载容器信息：
```bash
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# ./uninstall.sh
停止容器运行
zcloud
mysql_for_zcloud
移除zcloud容器
zcloud
mysql_for_zcloud
Deleted Networks:
zcloud_621_for_personal_mysql_x86_20240730_1657_zcloud_net

Total reclaimed space: 0B
```
注意：最后我这里的输出信息为 `Total reclaimed space: 0B`，由于不同的版本，容器包大小不一样，只要执行 `uninstall` 没有显示报错，则表示卸载成功。

## 备份旧版数据
备份或者记录旧版 zCloud 个人版数据的存放目录（**<font color='red'>非常重要！！！！</font>**）：
- `ZCLOUD_DATA_DIR`：zCloud 存储目录
- `DB_DATA_DIR`：资料库存储目录

即 `config.env` 中的 ZCLOUD_DATA_DIR 以及 DB_DATA_DIR 对应信息：
```bash
[root@zcloud zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657]# cat config.env
ZCLOUD_DATA_DIR=/my_zcloud_data/zcloud
DB_DATA_DIR=/my_zcloud_data/db
ZCLOUD_EXPORT_PORT=8080
HOST_IP=192.168.6.72
```
备份目录，最好备份一份保留，以防万一：
```bash
## 这里需要注意以下目录的权限，并非 root 权限
cp -r /my_zcloud_data /my_zcloud_data_bak
```
注意，以上两个目录以及目录下的所有内容不可清理或删除，否则所有历史数据均会被会丢失。

## 下载最新版 zCloud
通过链接获取最新的 zCloud 个人版安装包：
>最新 zCloud 个人版下载链接：[zCloud 开放运维创新坊](https://zcloud.enmotech.com/software?download=true)

将安装包上传到目标主机并解压：
```bash
[root@zcloud soft]# ll
-rw-r--r--. 1 root root 4133808651 Aug 18 23:05 zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504.tar.gz
[root@zcloud soft]# tar -xvf zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504.tar.gz
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/.lib.sh
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/config.env
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/docker-compose.yml
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/install.sh
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/purge.sh
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/start.sh
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/stop.sh
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/uninstall.sh
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/images/
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/images/zcloud.tar
zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/.db_type
```

## 复用旧版本配置
复用旧版 zCloud 个人版环境信息 `config.env`：
```bash
vi config.env

## 以下信息建议直接从旧版本复制即可
ZCLOUD_DATA_DIR=/my_zcloud_data/zcloud
DB_DATA_DIR=/my_zcloud_data/db
ZCLOUD_EXPORT_PORT=8080
HOST_IP=192.168.6.72
```
修改后再次确认：
```bash
[root@zcloud zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504]# cat config.env
ZCLOUD_DATA_DIR=/my_zcloud_data/zcloud
DB_DATA_DIR=/my_zcloud_data/db
ZCLOUD_EXPORT_PORT=8080
HOST_IP=192.168.6.72
```
**📢注意**：数据的存放目录（ZCLOUD_DATA_DIR）和资料库存储目录（DB_DATA_DIR），即 config.env 中的 ZCLOUD_DATA_DIR 以及 DB_DATA_DIR 对应信息，必须为已卸载的旧版 zCloud 个人版的配置的目录地址，否则所有数据均会丢失。

## 新版 zCloud 安装部署
确保配置正确后，执行新版本 `./install.sh`，完成个人版安装部署：
```bash
[root@zcloud zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504]# ./install.sh
配置文件路径: /soft/zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/config.env
请确认如下配置
主机IP: 192.168.6.72
zcloud数据文件夹: /my_zcloud_data/zcloud
zcloud数据库数据文件夹: /my_zcloud_data/db
zcloud服务端口: 8080
确认配置 (y/n): y
导入 /soft/zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504/images/zcloud.tar 到 Docker...
c86cc67002fa: Loading layer [==================================================>]  379.4kB/379.4kB
d9b4c27e7b97: Loading layer [==================================================>]  6.164GB/6.164GB
cd2dfb5bfa5b: Loading layer [==================================================>]  36.22MB/36.22MB
5f70bf18a086: Loading layer [==================================================>]  1.024kB/1.024kB
The image zcloud_with_mysql:6.2.1 already exists, renaming the old one with ID sha256:5d5b0fdfc89c7c74bce96658e33edde4321d693bf08c50fe79ed8d2ebcf4b7d4 to empty string
Loaded image: zcloud_with_mysql:6.2.1
2dc3315bab41: Loading layer [==================================================>]  379.4kB/379.4kB
2f6b10eb8f07: Loading layer [==================================================>]  658.2MB/658.2MB
e1209fcae4a3: Loading layer [==================================================>]  35.07MB/35.07MB
5f70bf18a086: Loading layer [==================================================>]  1.024kB/1.024kB
The image mysql_for_z:5.7.44 already exists, renaming the old one with ID sha256:bd172449061f9191f0eca86dc319d92f3967f018440b9ee0165e32379ebe5e7e to empty string
Loaded image: mysql_for_z:5.7.44
执行容器安装zcloud
[+] Creating 5/5
 ✔ Network zcloud_6211_for_personal_mysql_x86_20240809_1504_zcloud_net    Created                                                                                                           0.2s
 ✔ Volume "zcloud_6211_for_personal_mysql_x86_20240809_1504_zcloud-data"  Created                                                                                                           0.0s
 ✔ Volume "zcloud_6211_for_personal_mysql_x86_20240809_1504_db-data"      Created                                                                                                           0.0s
 ✔ Container mysql_for_zcloud                                             Created                                                                                                          16.6s
 ✔ Container zcloud                                                       Created  
```

## 启动新版 zCloud 服务
执行 `./start.sh` 启动 zCloud 个人版服务：
```bash
[root@zcloud zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504]# ./start.sh
启动zcloud容器组（初次启动大约需8min）
zcloud
mysql_for_zcloud

容器相关信息：zcloud Up Less than a second (health: starting)
容器相关信息：mysql_for_zcloud Up Less than a second (health: starting)

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 5 seconds (health: starting)
容器相关信息：mysql_for_zcloud Up 5 seconds (healthy)

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 10 seconds (health: starting)
容器相关信息：mysql_for_zcloud Up 10 seconds (healthy)

...
...
...

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 4 minutes (health: starting)
容器相关信息：mysql_for_zcloud Up 4 minutes (healthy)

部分容器或容器内服务正在启动中（初次启动大约需8min），请等待...
容器相关信息：zcloud Up 4 minutes (health: starting)
容器相关信息：mysql_for_zcloud Up 4 minutes (healthy)

容器相关信息：zcloud Up 5 minutes (healthy) 需8min），请等待...
容器相关信息：mysql_for_zcloud Up 5 minutes (healthy)


所有容器及容器内服务已成功启动并运行，您可通过浏览器访问：http://192.168.6.72:8080 开始使用 zcloud
```
等待容器启动成功，根据提示的地址访问 zCloud 页面即可。

## 访问新版 zCloud 页面
新版 zCloud 登陆无需重新激活，可直接使用旧版已有用户直接登陆：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240818-3fadfb6b-3b6c-4338-9a70-d1bd9eb56229.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240818-c9e564d0-cfb6-4a33-ab23-00c42942ae1d.png)

到此，新版 `zCloud 6.2.1.1` 个人版升级完成。但是，版本更新说明并没有列出哪些更新内容：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240818-7f3b72c9-0e1c-4f4e-9b6c-86f6d7a45280.png)

后续找小助手获取了更新发布说明如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-0323f46d-4688-4830-b8c1-6a7273f1460f.png)

---
# 往期精彩文章推荐

>[一篇文章让你彻底掌握 Python](https://mp.weixin.qq.com/s/eH4oe3VfP3QQpqHsH620kQ) 🔥        
[一篇文章让你彻底掌握 Shell](https://mp.weixin.qq.com/s/GmSqHJiBToncvcpFAJUZbw) 🔥      
>[Oracle 监控 EMCC 13.5 安装部署超详细教程](https://mp.weixin.qq.com/s/0W-53x2eGIY9uaX_RQrI2g) 🔥   
[Oracle 一键巡检自动生成 Word 报告](https://mp.weixin.qq.com/s/0xFe5m1DQ0ucT2_266hsrA) 🔥      
[Oracle一键安装脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/gv6t97FFyMsd6e4GH1HAwQ) 🔥      
[Oracle一键巡检脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/4zI73auIUhwSRb7qL3UIfw) 🔥      
[全网首发：Oracle 23ai 一键安装脚本](https://mp.weixin.qq.com/s/UL0BSMCAZrOQgCoWpDMGew) 🔥      
[Oracle 19C 最新 RU 补丁 19.24 ，一键安装！](https://mp.weixin.qq.com/s/T7GbpwhnMugzk7PB6hAoJQ) 🔥       
[Oracle Linux 6 一键安装 Oracle 11GR2 RAC](https://mp.weixin.qq.com/s/uicyzHfgS2TwleocXJEIrA)    
[Oracle Linux 7.9 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/dT4tFMYVZ3mh49CI6V3YEA)    
[Oracle Linux 8.9 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/FHXYiZBPn3XpKOM6ZqlU1A)    
[Oracle Linux 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cTuTUE-oaO-tKZ72F2WjAA) 🔥        
[openEuler 20.03 LTS SP4 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/uJwEPOG22fhQcC6cTLfN1Q) 🔥        
[openEuler 22.03 LTS SP4 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/sx1E4GIvIeQXp2vGMmVr2A)    
[RHEL 7.9 一键安装 Oracle 19C 19.23 RAC](https://mp.weixin.qq.com/s/mUHqU5hQ9GdH2bKuClPt5A)    
[Redhat 8.4 一键安装 Oracle 11GR2](https://mp.weixin.qq.com/s/fnuHKotjj_S8_0EfUkWI4Q)    
[RedHat 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cQJ6gP1bM_7m0H5-Dha4TA)    
[龙蜥 Anolis 7.9 一键安装 Oracle 19C 19.23](https://mp.weixin.qq.com/s/bJtBpzyG_NAhU-0vov1WmQ)    
[龙蜥 Anolis OS 8.8 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/_4-anPhn9wThtdAqqHIH5w)    
[SUSE 15 SP5 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/N2J9JxZ7l9elG1L1NV7ynA)    
[统信 UOS V20 1070(a) 一键安装 Oracle 11GR2](https://mp.weixin.qq.com/s/SSmLvx2wDzhzsQY6f5Q5Rg)    
[Ubuntu 22.04 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/0-q9mLR48abGUbZUODj7xw)    
[Ubuntu 14.04 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/Y6fFi3Nth0NA5HGq2LjubQ)    
[银河麒麟 Kylin V10 SP3 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/EVNaKhH53YN885gk_Ik_Xg) 🔥       
[银河麒麟 Kylin V10 SP3 一键安装 Oracle 11GR2 RAC](https://mp.weixin.qq.com/s/IZ_VYoDOxzSLzsQo8aJTIw)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q) 🔥       
[优化 Oracle：最佳实践与开发规范](https://mp.weixin.qq.com/s/DysIcb-p11j56d3YtlqpcQ)    
[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA) 🔥       
[Linux 一键配置时钟同步全攻略](https://mp.weixin.qq.com/s/yvth1vorP3JjUp3g3vPBAQ) 🔥       
[Starwind 配置 ISCSI 共享存储](https://mp.weixin.qq.com/s/xjYZmGcwshbJBICcr0xvBw)    
[SUSE 15 SP3 安装 Oracle 19C RAC 数据库](https://mp.weixin.qq.com/s/JMMzOa6dN6ytAUkcy7I2jQ)    
[达梦 8 数据库安装手册](https://mp.weixin.qq.com/s/KEobA1FAx4Uod3uBGkJ9-A) 🔥       
[Oracle 12CR2 RAC 安装避坑宝典](https://mp.weixin.qq.com/s/KlP4IM4O7sHVvSNJ9rNXEA)    
[Linux7 安装 Oracle 19C RAC 详细图文教程](https://mp.weixin.qq.com/s/vNZbH5QsiSWrdtJcqP2MWg) 🔥       
[Oracle ADG 搭建 RAC to Single 详细教程](https://mp.weixin.qq.com/s/mA5MPcykF-eytChoUAhwnA)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q) 🔥        
[Oracle 分区表之在线重定义](https://mp.weixin.qq.com/s/NYQ8TPMktc6u8jMtnI_Gpg)    
[AutoUpgrade 快速升级 Oracle 数据库](https://mp.weixin.qq.com/s/ebpMdmozKOR6XZSMKsG2DQ)    
[Oracle 数据库巡检命令手册](https://mp.weixin.qq.com/s/vLtJ2zH_TnyQxKyVddzMRg) 🔥       
[Oracle 数据坏块的 N 种修复方式](https://mp.weixin.qq.com/s/0w66O5Ugx-TX7e_trE5ZBQ) 🔥       
[数据库 SQL 开发入门教程](https://mp.weixin.qq.com/s/92mBTibjSGNywnwOYIFuqg)    
[超全 Linux 基础命令总结](https://mp.weixin.qq.com/s/UwVlWxEUBE4OEq4a91dyfg) 🔥       
[VMware 虚拟机安装 Linux 系统](https://mp.weixin.qq.com/s/-gTiGVWFZV0tkw0yZyI2bQ)    
[Linux 安装 MySQL 详细教程](https://mp.weixin.qq.com/s/dHSaDSrUqxFG9E2dMuTmxg)    
[教你玩转 SQLPLUS，工作效率提升 200%](https://mp.weixin.qq.com/s/KaxEN6qxLDJWb7paOvcffw)    

---

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎 **点赞+关注**，我会持续分享数据库知识、运维技巧。
