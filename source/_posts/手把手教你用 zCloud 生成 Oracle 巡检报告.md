---
title: 手把手教你用 zCloud 生成 Oracle 巡检报告
date: 2024-08-20 16:26:32
tags: [墨力计划,zcloud]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1825195557992804352
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
使用 zCloud 的初衷就是想体验下一键巡检的功能，所以在成功纳管了 Oracle 数据库之后就迫不及待的体验了一把 Oracle 一键巡检。

接前文：[zCloud 纳管 Oracle 数据库](https://www.modb.pro/db/1820305079062323200)，本文演示如何使用 zCloud 快速巡检 Oracle 数据库，并生成巡检报告。

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-38a3dcd5-d107-4bec-bd1c-4df7e584ef99.png)

# 巡检场景
zCloud 为 Oracle 数据库设置以下场景：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-5ae00c0b-f60f-4236-b254-3ea4adb30524.png)

区别在于巡检项的配置不一样，通过点击巡检项个数可以预览具体是哪些巡检内容：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240819-0e650cb7-7052-4f98-95c0-ee3895530b71.png)

# 手动巡检
在实例管理可以选择巡检进入手工巡检：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-b0d123e4-abad-4896-8e45-b5c10c22982d.png)

选择需要巡检的数据库以及巡检场景，然后开始巡检即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-f096a27b-1080-40d8-b3d5-b8b28cedd63f.png)

可以看到巡检速度很快😂，只需要 4s：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-7b01325e-c1a2-4324-93bb-8e73a3a92ae0.png)

查看巡检报告（个人版没有提供报告下载的功能，需要使用企业版才可以下载）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-17dcbd55-15e0-44f1-bd39-a1f1dc39ff8c.png)

开头会对数据库的整体情况进行一个评分，之后就是每一项的巡检情况以及评分：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-bcc9c7c1-1cd2-491d-98cf-de4104e78cc2.png)

巡检结果马马虎虎，比较适合每日巡检报告。右上角还有个报告对比，可以和之前的巡检报告进行对比。

# 自动巡检
在巡检中心可以设置自动巡检，在健康评估中，可以选择对应的数据库进行自动巡检配置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-4811caa5-f762-40c6-af92-d75b7dcd9b76.png)

选择对应的时间和场景，启用即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-b565f7a8-4d44-41da-b1e2-5565da270f6e.png)

完成之后，可以看到有哪些场景被配置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240820-c60bb5ae-48a4-4b26-80cd-c6bbf43dac1b.png)

总体来说，巡检功能比较简单。

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