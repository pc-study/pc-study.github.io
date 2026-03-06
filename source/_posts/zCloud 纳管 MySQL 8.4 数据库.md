---
title: zCloud 纳管 MySQL 8.4 数据库
date: 2024-08-23 17:34:46
tags: [墨力计划,zcloud]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1826901348995051520
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
前面写两篇纳管数据库的文章：
- [zCloud 纳管 Oracle 数据库](https://www.modb.pro/db/1820305079062323200)
- [zCloud 纳管达梦 DM8 数据库](https://www.modb.pro/db/1825363800528855040)

接着再来一篇 zCloud 纳管 MySQL 数据库。

正好下午使用芬达大佬的 dbops 部署了一套 MySQL 8.4 数据库：[使用 dbops 快速部署 MySQL 数据库（脚本免费）](https://www.modb.pro/db/1826871628341456896)，所以本文就记录一下如何快速纳管 MySQL 数据库。

不了解如何安装部署 zCloud 的朋友，可以参考 [zCloud 个人版 Linux 版安装部署初体验](https://www.modb.pro/db/1820278805795266560) 快速部署一套尝鲜。

更多关于个人版 zCloud 学习文章可以跳转合集：[zCloud 个人版学习记录](https://www.modb.pro/topic/659485)，希望大家一起进步。

# 参考文档
**参考文档中心：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-9907a38f-9099-46ea-9431-fe8b22762672.png)

# 下载 Agent
纳管主机需要下载对应平台的 Agent 上传到 zCloud 网页端，这里我选择的是 Linux 主机，所以下载 Linux 的 Agent：
> Agent 下载地址：[https://zcloud.enmotech.com/software](https://zcloud.enmotech.com/software)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-18e46d6a-b562-4692-ace3-37ffb0d81fab.png)

下载后将 `agent_linux_6.2.1_20240724_0958.tar.gz` 文件上传到网页端：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-c71d6e32-aceb-49c6-8a91-fb09dc7490a4.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-d737aabc-6a8e-42f4-90ec-91794b512565.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-985f7f20-7ba1-4101-9067-75e016b4f1ea.png)

上传完成即可。

# 纳管主机
使用初始用户 `sysadmin` 登录 zCloud 网页门户：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-fc0f538d-b1fa-450f-8475-8dafa9c081aa.png)

选择【资源池管理】 --> 【主机资源池】 --> 【默认主机资源池】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-e7f04755-9d80-4409-b597-62e27969283c.png)

选择 【纳管主机】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-6876cf48-7f56-41bc-a59b-b18db8adc360.png)

填写对应信息后，选择 【连接主机】，确认信息没问题后，【确定】即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-ff702ea2-7c5a-4a03-b5da-3427dd0b1af8.png)

等待部署完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-b37eb494-03be-4a57-b59f-614d5a8f5762.png)

查看添加的主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-667ddfb9-9b18-407e-832f-8c11ab1b7d5c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-7fcd0425-114e-449a-8c7a-070a2fde0cfa.png)

# 纳管 MySQL 数据库
MySQL 数据库纳管是将已经在运行的 MySQL 数据库纳管到数据库服务平台里，进行后续的管理及监控。纳管的前提是目标主机上已经安装了平台的 agent，并在主机资源池可以查到。

## MySQL纳管前置检查
由于 MySQL localhost 用户的特殊性，需检查目标数据库的纳管用户的权限和密码，确保纳管时能使用输入的纳管用户、密码连接目标数据库，并完成纳管。
- 检查是否开通 Proxy 到目标数据库的 8100、8101、数据库端口
- 登录需纳管的目标数据库
- 检查目标数据库是否开启反向连接

检查命令：
```sql
-- 检查目标数据库是否开启反向连接
mysql> show variables like 'skip_name_resolve';
+-------------------+-------+
| Variable_name     | Value |
+-------------------+-------+
| skip_name_resolve | ON    |
+-------------------+-------+
1 row in set (0.01 sec)

-- 检查使用的纳管用户信息，这个数据库没有 root 用户
mysql> select user,host from MySQL.user where user='root' and host in ('localhost','127.0.0.1');
Empty set (0.00 sec)

-- 检查使用的纳管用户权限
show grants for 'root'@'localhost';
-- 或者
show grants for 'root'@'127.0.0.1';
```
若不能使用 root 用户或者不知道 root 用户密码，可临时创建具有 `GRANT ALL PRIVILEGES ON *.* WITH GRANT OPTION` 权限的用户，纳管完成后删除该用户：
```sql
-- 数据库参数 skip_name_resolve=on
create user 'zcloud_test'@'127.0.0.1' identified by 'Dbops@8888';
grant all privileges on *.* to 'zcloud_test'@'127.0.0.1' WITH GRANT OPTION;
flush privileges;
show grants for 'zcloud_test'@'127.0.0.1';

-- 数据库参数 skip_name_resolve=off
create user 'zcloud_test'@'localhost' identified by 'Dbops@8888';
grant all privileges on *.* to 'zcloud_test'@'localhost' WITH GRANT OPTION;
flush privileges;
show grants for 'zcloud_test'@'localhost';
```
若使用以上步骤创建的新用户，由于 agent 连接的原因需要重启 agent 服务：
```bash
## Linux 6：
service zcloud_agent_server restart

## Linux 7
systemctl restart zcloud_agent_server
```

## 有主机纳管
选择【MySQL】–> 【实例管理】–> 【纳管选项】–> 【有主机纳管】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-10c23d69-137c-48ba-8533-97d92d5daf22.png)

选择刚添加纳管的主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-291597ea-b215-4b70-9f32-5c573b2212a5.png)

选择数据库实例，我这里使用的纳管用户是 zcloud_test，大家可以根据情况自行选择：
>注意：保证本机能够登陆成功，如果开了反向解析(skip_name_resolve=off)需要 root@localhost 登陆权限，如果没用开反向解析(skip_name_resolve=on)需要保证root@127.0.0.1 能够登陆成功。

![](https://oss-emcsprod-public.modb.pro/image/editor/20240823-ecbf4967-043e-4bf2-ac42-19290d0c49fc.png)

这里报错：
```bash
MySQL [192.168.6.162:3306] 执行sql[SHOW SLAVE STATUS] 失败：SQL execution exception:You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'SLAVE STATUS' at line 1
```
看报错是语法错误，查看文档后发现 8.0.22 以上版本将 `SHOW SLAVE STATUS;` 命令弃用了，改成了 `SHOW REPLICA STATUS;`，看来遇到 BUG 了，卒。zCloud 官方目前支持的最高版本是 MySQL8.0，看来只能换版本了，大体步骤就是如此了。

---
# 往期精彩文章推荐

>[Oracle RAC 启动顺序，你真的了解吗？](https://mp.weixin.qq.com/s/8Iab3QpvdIMCCsDycJ-kkA)
[达梦数据库一键安装脚本（免费）](https://mp.weixin.qq.com/s/DvowNh7ncV1OWs_Vpv5SSg)[一篇文章让你彻底掌握 Python](https://mp.weixin.qq.com/s/eH4oe3VfP3QQpqHsH620kQ) 🔥        
[一篇文章让你彻底掌握 Shell](https://mp.weixin.qq.com/s/GmSqHJiBToncvcpFAJUZbw) 🔥     
[一篇文章让你彻底掌握 Shell](https://mp.weixin.qq.com/s/GmSqHJiBToncvcpFAJUZbw) 🔥      
[Oracle 监控 EMCC 13.5 安装部署超详细教程](https://mp.weixin.qq.com/s/0W-53x2eGIY9uaX_RQrI2g) 🔥   
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
