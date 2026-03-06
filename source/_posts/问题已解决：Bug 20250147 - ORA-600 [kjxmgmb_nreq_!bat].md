---
title: 问题已解决：Bug 20250147 - ORA-600 [kjxmgmb_nreq:!bat]
date: 2021-06-11 16:06:48
tags: [oracle,故障处理]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/70733
---

### **作者简介：**

> 作者：LuciferLiu  
> 中国DBA联盟(ACDU)成员。目前从事Oracle DBA工作，曾从事 Oracle 数据库开发工作，主要服务于生产制造，汽车金融等行业。现拥有Oracle OCP，OceanBase OBCA认证，擅长Oracle数据库运维开发，备份恢复，安装迁移，Linux自动化运维脚本编写等。

### 前言

今天巡检遇到数据库报错 **ORA-00600 **错误，数据库版本为**Oracle 11204 (x86_64)**，错误日志如下：

> ORA-00600: internal error code, arguments: [kjxmgmb_nreq:!bat], [17], [56], [9], [], [], [], [], [], [], [], []

**关键词：ORA-00600、 [kjxmgmb_nreq:!bat]。**

## 一、问题分析

**1、通过Oracle oerr工具查看错误代码：**

![oerr](https://img-blog.csdnimg.cn/20210610171825649.png)​

**可以发现，ORA-600是Oracle的内部错误，无法从错误代码提示上看出什么问题。**

**2、抓取trace文件关键信息：**

> Error: ORA-00600 \[kjxmgmb\_nreq:!bat\] \[17\] \[56\] \[9\]  
>   
> Error Stack: ORA-600\[kjxmgmb\_nreq:!bat\]  
> Main Stack:  
> kjxmgmb\_nreq\_header <- kjdrpushpkey <- kjdrpkey2hv <- kjblprmexp <- kjbmprmexp  
> <- kjbmchkretryreq <- kjmsm <- ksbrdp <- opirip <- opidrv <- sou2o <- opimai\_real <- ssthrdmain  
> <- main

**未发现可以判断问题的信息。**

**3、通过查询MOS文档，发现该错误相符合的文档：**

***Bug 20250147 - ORA-600 [kjxmgmb_nreq:!bat] can occur in RAC crashing the instance (Doc ID 20250147.8)***

文档中描述，该 bug 可能发生在 RAC 环境崩溃时。

### 二、解决方案

> **安装OneOffPatch补丁：** Patch 20250147: ORA 600 [KJXMGMB_NREQ:!BAT]
> 
> p20250147_112040_Linux-x86-64.zip 
> 
> p6880880_112000_Linux-x86-64.zip
> 
> **需要补丁包的可以加我或者关注微信公众号。**

**补丁包安装步骤：**

1、备份 ORACLE_HOME 和 ORAINVENTORY 目录。

2、替换最新的OPATCH补丁包（**p6880880**）。

3、解压20250147补丁包，安装补丁。

    ##解压补丁包
    unzip -d /soft p20250147_112040_Linux-x86-64.zip
    
    ##设置环境变量
    export PATH=$ORACLE_HOME/bin:$ORACLE_HOME/OPatch:$PATH
    
    ##安装补丁前检查
    cd /soft/20250147
    opatch prereq CheckConflictAgainstOHWithDetail -ph ./
    
    ##关闭当前主机所有ORACLE_HOME下的服务（database, ASM, listeners, nodeapps, and CRS daemons）
    
    ##正式安装补丁
    cd /soft/20250147
    opatch apply
    
    ##确认是否安装成功
    opatch lsinventory
    
    ##启动所有ORACLE_HOME下的服务（database, ASM, listeners, nodeapps, and CRS daemons）

**注意：需要数据库停机进行操作。**

***参考官方文章：*** **Bug 20250147 - ORA-600 [kjxmgmb_nreq:!bat] can occur in RAC crashing the instance (Doc ID 20250147.8)**

**如果觉得文章对你有帮助，点赞、收藏、关注、评论，一键四连支持，你的支持就是我创作最大的动力，谢谢**

![一键三连](https://img-blog.csdnimg.cn/20210610143658932.png)

> 墨天轮：**[Lucifer三思而后行](https://www.modb.pro/u/395407)**  
> CSDN：**[Lucifer三思而后行](https://blog.csdn.net/m0_50546016)**  
> 微信公众号：**[Lucifer三思而后行](https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5MjI4MzExMQ==&scene=124#wechat_redirect)**

![公众号二维码](https://img-blog.csdnimg.cn/20210603125838176.png)