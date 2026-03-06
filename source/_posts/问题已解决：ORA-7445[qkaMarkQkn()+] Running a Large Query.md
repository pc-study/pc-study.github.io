---
title: 问题已解决：ORA-7445[qkaMarkQkn()+] Running a Large Query
date: 2021-06-12 22:06:24
tags: [oracle,故障处理]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/70778
---

### **作者简介：**
> 作者：LuciferLiu  
> 中国DBA联盟(ACDU)成员。目前从事Oracle DBA工作，曾从事 Oracle 数据库开发工作，主要服务于生产制造，汽车金融等行业。现拥有Oracle OCP，OceanBase OBCA认证，擅长Oracle数据库运维开发，备份恢复，安装迁移，Linux自动化运维脚本编写等。

### 前言
今天巡检遇到数据库报错 **ORA-07445 [qkaMarkQkn]** 错误，数据库版本为 **11204 (x86_64)**，错误日志如下：
>ORA-07445: 出现异常错误: 核心转储 [qkaMarkQkn()+1478] [SIGSEGV] [ADDR:0x10] [PC:0x1A20E62] [Address not mapped to object] []

**关键词：ORA-07445、[qkaMarkQkn()+1478]......**

### 一、问题分析
**1、通过 Oracle oerr 工具查看错误代码：**
![ora-07445](https://img-blog.csdnimg.cn/20210612212742437.png)
###### <font color='blue'>提示为内部错误，建议提交SR进行分析。</font>

**2、抓取trace文件关键信息：**

> Error: ORA-07445 [qkaMarkQkn()+1478] [SIGSEGV] [ADDR:0x10] [PC:0x1A20E62] [Address not mapped to object]
Error Stack: ORA-7445[qkaMarkQkn]
Main Stack:
qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn
<- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn
<- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkaMarkQkn <- qkadrv2Pre
<- qkadrv2 <- opitca <- kksFullTypeCheck <- rpiswu2 <- kksLoadChild <- kxsGetRuntimeLock
<- kksfbc <- opiexe <- kpoal8 <- opiodr <- kpoodrc <- rpiswu2 <- kpoodr <- upirtrc <- kpurcsc
<- kpuexec <- OCIStmtExecute <- qksanExecSql <- qksanAnalyzeSql <- qksanAnalyzeSegSql
<- kestsaAutoTunePqDrv <- kestsTuneSqlDrv <- kesaiExecAction
>SQL脱敏：
>Current SQL: /* SQL Analyze(2399,1) */ **一个select查询语句**

###### <font color='blue'>通过trace文件可以看出在执行一个查询语句时导致报错ORA-7445。</font>

**3、通过查询MOS文档，发现该错误相符合的文档：**

**<u>ORA-7445[qkaMarkQkn()+1584] Running a Large Query (Doc ID 2094809.1)</u>**

![Doc ID 2094809.1](https://img-blog.csdnimg.cn/20210612215511250.png)
![cause](https://img-blog.csdnimg.cn/20210612215916618.png)
**4、提交SR的回复：**

>/* SQL Analyze(2399,1) */ **一个select查询语句**
This error typically only impacts the SQL Tuning job itself.
If the error is a one off incident then you can ignore it.
If such errors keep occurring in Jnnn processes when executing package DBMS_SQLTUNE_INTERNAL then a workaround is to disable the Automatic SQL Tuning Tasks as follows:

	BEGIN
	DBMS_AUTO_TASK_ADMIN.DISABLE(
	client_name => 'sql tuning advisor',
	operation => NULL,
	window_name => NULL );
	END;
	/

>This will disable all automatic SQL tuning tasks but you can still perform "on-demand" SQL tuning to get advice on tuning specific SQL statements.

###### <font color='blue'>建议关闭SQL tuning来避免，但是感觉不是根本解决方案。</font><font color='red'>读者可根据具体情况自行判断。</font>

### 二、解决方案
![solution](https://img-blog.csdnimg.cn/20210612215948381.png)
**两种解决方案，任选其一即可。**

**1、修改_fix_control隐含参数：**

	alter session set "_fix_control" = '8560951:ON','5483301:ON';

**2、修改OPTIMIZER_FEATURES_ENABLE参数**

	alter session set optimizer_features_enable='11.2.0.4';

**参考官方文章：** **ORA-7445[qkaMarkQkn()+1584] Running a Large Query (Doc ID 2094809.1)**

**如果觉得文章对你有帮助，<font color='red'>点赞、收藏、关注、评论</font>，一键四连支持，你的支持就是我创作最大的动力，谢谢**

![一键三连](https://img-blog.csdnimg.cn/20210610143658932.png)​

> 墨天轮：**[Lucifer三思而后行](https://www.modb.pro/u/395407)**  
> CSDN：**[Lucifer三思而后行](https://blog.csdn.net/m0_50546016)**  
> 微信公众号：**[Lucifer三思而后行](https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5MjI4MzExMQ==&scene=124#wechat_redirect)**
![公众号二维码](https://img-blog.csdnimg.cn/20210603125838176.png)​