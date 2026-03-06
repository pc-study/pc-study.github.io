---
title: zCloud 中 Oracle 实例状态未知问题记录
date: 2024-08-20 11:04:08
tags: [墨力计划,zcloud]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1825723407658983424
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
使用 zCloud 纳管 Oracle 数据库后，发现是 **<实例可连接状态>** 一直都是 **未知** 状态：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-81b4894d-6bd3-49dc-880b-e81c86275dde.png)

首先排除数据库本身问题，使用本地使用客户端连接：
```bash
## 可以正常连接，没有问题
[oracle@rhel8:/home/oracle]$ sqlplus system/oracle@192.168.6.220/lucifer

SQL*Plus: Release 19.0.0.0.0 - Production on Tue Aug 20 10:24:23 2024
Version 19.24.0.0.0

Copyright (c) 1982, 2024, Oracle.  All rights reserved.


Connected to:
Oracle Database 11g Enterprise Edition Release 11.2.0.4.0 - 64bit Production
With the Partitioning, OLAP, Data Mining and Real Application Testing options

system@LUCIFER 2024-08-20 10:24:24> 
```
出于好奇在群里寻找官方咨询后，得出答案是因为 zCloud 容器内部缺少依赖包：`libaio`，以下记录一下问题分析过程，如有遇到相同问题的可以参照以下方式进行解决。

# 问题分析
首先，查看 `Prometheus`：在浏览器输入，IP:8093：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20240820-41a2eb8a-d8c6-4947-a4a3-c7ccf54534fc.png)

查看 oracle-hr：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-bd3b881c-840d-48ed-9ee4-080092587137.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-7df2dcdd-c6f3-4bea-92ee-19b4a8cf6c3c.png)

本来是想通过 `http://172.18.0.2:8203/metrics-hr2` 查看日志，但是由于是容器内部的网络，Proxy 里面的oracle-exporter 没有放开，所以无法在外部打开，所以需要进入容器内部，去查看 `oracle-exporter` 的日志，看看是什么原因导致数据库确实链接不上。

进入 zCloud 容器内部：
```bash
## 查看容器
[root@zcloud ~]# docker ps -a
CONTAINER ID   IMAGE                     COMMAND                  CREATED        STATUS                  PORTS                                                                                                                                                                                                                                                                                                                                                 NAMES
79d21622a6c6   zcloud_with_mysql:6.2.1   "/bin/sh -c $HOME/in…"   21 hours ago   Up 21 hours (healthy)   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp, 0.0.0.0:8093->8093/tcp, :::8093->8093/tcp, 0.0.0.0:8100-8101->8100-8101/tcp, :::8100-8101->8100-8101/tcp, 0.0.0.0:8200-8201->8200-8201/tcp, :::8200-8201->8200-8201/tcp, 0.0.0.0:8215->8215/tcp, :::8215->8215/tcp, 0.0.0.0:8500->8500/tcp, :::8500->8500/tcp, 0.0.0.0:8761->8761/tcp, :::8761->8761/tcp   zcloud
b1064b92f817   mysql_for_z:5.7.44        "/home/mysql/init.sh"    21 hours ago   Up 21 hours (healthy)   0.0.0.0:3306->3306/tcp, :::3306->3306/tcp                                                                                                                                                                                                                                                                                                             mysql_for_zcloud
## 进入 zCloud 容器内部
[root@zcloud soft]# docker exec -it zcloud bash
[zcloud@79d21622a6c6 ~]$ 
```
找到 `oracle-exporter` 日志：
```bash
[zcloud@79d21622a6c6 ~]$ ls
check.sh  config.properties  data  dbaas  init  init.sh  libs  proxy  rpms  sqls
[zcloud@79d21622a6c6 ~]$ cd proxy/
[zcloud@79d21622a6c6 proxy]$ ls
chisel  common  exporters        insight         log   notRootMonitor          notRoot.sh  proxy            rceEngine    root.sh       winrm              zcloud_proxy_nginx        zcloud_zdbmon_collector
chitu   config  firewallPort.sh  java-io-tmpdir  logs  notRootProxyOperate.sh  obClient    proxyOperate.sh  redisClient  updateEnv.sh  zcloud_mysql_soar  zcloud_slowmon_collector  zcloud_zoramon
[zcloud@79d21622a6c6 proxy]$ cd log
[zcloud@79d21622a6c6 log]$ ls
chisel.log            proxy_info.log                        zcloud_custom_sql_exporter_info_2024-08-19.0.log.zip  zcloud_db2_exporter.log      zcloud_mysql_exporter.log                  zcloud_oracle_exporter.log        zcloud_redis_exporter.log     zcloud_zoramon_collector.log
monitor.log           zcloud_commondb_exporter.log          zcloud_custom_sql_exporter_info.log                   zcloud_mongodb_exporter.log  zcloud_node_exporter_2024-08-19.0.log.zip  zcloud_postgres_exporter.log      zcloud_slowmon_collector.log
proxy_info.1.log.zip  zcloud_custom_sql_exporter_error.log  zcloud_custom_sql_exporter_warn.log                   zcloud_mssql_exporter.log    zcloud_node_exporter.log                   zcloud_rce_engine_20240819_1.log  zcloud_zdbmon_collector.log
```
打开 `oracle-exporter` 日志，发现是 Docker 里面缺少一个依赖（BUG）：
```bash
## 报错消息，提示：libclntsh.so: cannot open shared object file: No such file or directory
time=2024-08-20 10:33:20 level=info  file=oracle_common.go:584    msg=97189ea4-17b7-412a-a6a7-a51b0d7959a2->6876,query connection count failed
time=2024-08-20 10:33:20 level=error file=oracle_exporter.go:696  id=97189ea4-17b7-412a-a6a7-a51b0d7959a2 instance=lucifer type=exporter_hr2 msg=97189ea4-17b7-412a-a6a7-a51b0d7959a2->6876,collect connectCount error:ORA-00000: DPI-1047: Cannot locate a 64-bit Oracle Client library: "/home/zcloud/proxy/common/instantclient_12_1/lib/libclntsh.so: cannot open shared object file: No such file or directory". See https://oracle.github.io/odpi/doc/installation.html#linux for help
```
需要在 zCloud 容器内部安装缺少的依赖包 `libaio` 进行修复。

# 解决方案
上传并安装 `libaio` 依赖包：
>libaio 依赖包下载地址：[libaio-0.3.109-13.el7.x86_64.rpm](https://www.modb.pro/doc/134610)

```bash
## 上传 libaio 依赖包
[root@zcloud ~]# cd /soft/
[root@zcloud soft]# ll libaio-0.3.109-13.el7.x86_64.rpm
-r--r--r--. 1 root root      24744 Aug 20 10:32 libaio-0.3.109-13.el7.x86_64.rpm
drwxr-xr-x. 3 root root        180 Aug 19 13:35 zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504
-rw-r--r--. 1 root root 4133808651 Aug 18 23:05 zCloud_6.2.1.1_For_Personal_mysql_X86_20240809_1504.tar.gz
drwxr-xr-x. 3 root root        180 Aug  5 09:33 zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657
-rwxr-xr-x. 1 root root 4123537621 Aug  5 09:30 zCloud_6.2.1_For_Personal_mysql_X86_20240730_1657.tar.gz
## 拷贝到 zCloud 容器内部
[root@zcloud soft]# docker cp /soft/libaio-0.3.109-13.el7.x86_64.rpm zcloud:/tmp/libaio-0.3.109-13.el7.x86_64.rpm
Successfully copied 26.6kB to zcloud:/tmp/libaio-0.3.109-13.el7.x86_64.rpm
## 执行安装
[root@zcloud soft]# docker exec -u root -it zcloud rpm -ivh /tmp/libaio-0.3.109-13.el7.x86_64.rpm
warning: /tmp/libaio-0.3.109-13.el7.x86_64.rpm: Header V3 RSA/SHA256 Signature, key ID f4a80eb5: NOKEY
Preparing...                          ################################# [100%]
Updating / installing...
   1:libaio-0.3.109-13.el7            ################################# [100%]
```
安装完成后，再次查看实例状态（已恢复正常，显示可连接）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-0f915e85-02d0-4c8a-bdbc-b03bfe64266f.png)

查看 `oracle-exporter` 日志：
```bash
## 没有报错日志出现
time=2024-08-20 10:46:14 level=info  file=oracle_common.go:323    msg=97189ea4-17b7-412a-a6a7-a51b0d7959a2->99183,period:lr2,instance:[97189ea4-17b7-412a-a6a7-a51b0d7959a2],permit to create long connection
time=2024-08-20 10:46:14 level=info  file=oracle_common.go:340    msg=97189ea4-17b7-412a-a6a7-a51b0d7959a2->99183,period:lr2,instanceUUID:97189ea4-17b7-412a-a6a7-a51b0d7959a2,isHr2:[false],create connection , start...
```
至此，问题已解决，该 BUG 暂时可以按以上方式进行临时处理，会在下个 zCloud 更新版本中完全修复。

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