---
title: zCloud 纳管达梦 DM8 数据库
date: 2024-08-19 14:24:04
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1825363800528855040
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
前面写了一篇 [zCloud 纳管 Oracle 数据库](https://www.modb.pro/db/1820305079062323200)，很多朋友表示通俗易懂，跟着文章一路走下去就成功了，很方便。

正好最近也使用达梦一键安装脚本部署了一套达梦DM8数据库：[达梦数据库 DM8 一键安装脚本教程（脚本免费）](https://www.modb.pro/db/1825344953594163200)，所以本文就记录一下如何快速纳管达梦数据库。

不了解如何安装部署 zCloud 的朋友，可以参考 [zCloud 个人版 Linux 版安装部署初体验](https://www.modb.pro/db/1820278805795266560) 快速部署一套尝鲜。

# 参考文档
**参考文档中心：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-ffb9ca61-c827-4c47-b916-f7b4da7222d5.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-6f5c2c07-1e73-455d-b019-e61f0c75a393.png)

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

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-4174606b-4b53-4b52-a4a8-e9021ad73bd0.png)

填写对应信息后，选择 【连接主机】：

注意：这里经过测试，个人版暂不支持：
- `LINUX 8.10` 主机，报错信息：**不支持类型为'LINUX 8.10'的主机,内核版本:4.18.0-553.el8_10.x86_64，发行厂商:RedHat**
- `Ubuntu`主机，报错信息：**查询操作系统发行商失败**

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-4569120c-4be2-4cfb-82d4-e1016a7b2d90.png)

确认信息没问题后，【确定】即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-cc385d31-9559-4519-baca-799ad6741a61.png)

等待部署完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-771856f5-effd-43c7-966a-7b1b3078f5ce.png)

查看添加的主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-5899dbb8-5e15-4669-9af7-badf392d8ad1.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-2f57b5dc-6e4e-43a7-8b9e-49c7ccc63d6b.png)

# 纳管达梦数据库
达梦数据库有主机纳管是将已经在运行的达梦数据库主库或单实例纳管到数据库云平台里，进行后续的管理及监控。纳管的前提是目标主机已纳管到平台（集群所有节点主机均需纳管），井在主机资源池可以查到。

选择【DM】–> 【实例管理】–> 【纳管选项】–> 【有主机纳管】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-c65b5cf5-5d9b-48fb-b2a7-c0289dae1cc2.png)

选择刚添加纳管的主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-502a6363-d6a3-4a65-98fb-b2001538d088.png)

选择数据库实例：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-97106151-3b64-41a8-9ae6-206ae7a58162.png)

填写必填项，这里维护用户根据需要自行选择，我这里选择统一用户：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-d30857c5-995d-4164-97fc-7f5e083b786b.png)

达梦数据库纳管完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-36339233-ac6b-49a8-b794-790fc560a6a4.png)

关联报警模板：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-b51f267f-b80b-4ea1-845a-837c44e0b6fa.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-12ea5453-6207-40c7-9359-02fb829a1a91.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-4fcdf3a9-fb24-46eb-81a5-dd8460a5ebdb.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-0bab8aef-34c2-485b-9246-3901880de4f3.png)

创建巡检场景：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-3e1a78d8-f6a0-4a96-9ac7-ea127462001e.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-97b5394a-2f83-4631-971f-aaf7b6647ba8.png)

设置自动巡检：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-65e32013-25d7-4433-88af-e942f9ce601f.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-ae04d421-bf2c-4e64-b9bb-7eb8c045b9f1.png)

达梦数据库成功纳管：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-c279ab59-1606-4b2f-93a3-bb0b2b570ead.png)


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
