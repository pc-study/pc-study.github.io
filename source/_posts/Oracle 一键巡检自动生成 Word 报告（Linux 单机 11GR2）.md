---
title: Oracle 一键巡检自动生成 Word 报告（Linux 单机 11GR2）
date: 2024-11-07 10:11:59
tags: [oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1854325926564302848
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

# 前言
Oracle 数据库巡检通常需要消耗大量时间和精力，包括收集数据库以及主机的相关信息。针对 Word 报告的样式调整，也是重复和费事的，所以我针对 Oracle 巡检所需检查的信息以及报告模板，写了一套自动巡检并且生成报告的脚本。巡检人员只需要执行脚本，脚本会自动生成一个完整的 Word 报告（样式格式都无需调整），只需要检查报告中是否存在问题即可。

之前演示过 Oracle RAC 一键巡检可参考：
- [Oracle RAC 一键巡检自动生成 Word 报告](https://www.modb.pro/db/1768446124021583872)
- **RAC 报告预览**：[Lucifer 有限公司-Oracle数据库4019382963_LUCIFER巡检报告_20240315.pdf](https://www.modb.pro/doc/126508)

本文演示一套 Oracle 11GR2 单机数据库的自动巡检流程。

# 介绍
Oracle 一键巡检脚本可将巡检结果一键生成为 Word 报告！本脚本通过 python 将巡检结果生成为 Word 报告，分为两部分：
- 第一部分通过 shell 和 sql 脚本生成巡检压缩包
- 第二部分通过 python 解析巡检压缩包生成 Word 巡检报告

Word 报告内容主要包括：主机巡检，数据库巡检，DataGuard 同步检查，Rman 备份检查， rac 集群检查，数据库性能分析（awr 内部 sql 获取），抓取 alert日志，抓取 awr 报告等，内容极其丰富。如果是 rac，会抓取所有节点报告。
- 报告可选：**周/月/季**三种类型，生成的 Word 可直接交付客户
- 支持所有操作系统，所有版本
- 支持 **Oracle 10/11/12/18/19/21** 等版本
- 支持 **non-cdb/cdb** 架构
- 如果一台主机有多个实例，支持一键巡检多个实例，生成一个巡检文件，方便快捷
- 支持一键生成多个数据库 Word 报告
- Word 报告生成支持自定义客户名称，巡检公司名称，巡检人员名称，巡检公司 LOGO 等，直接解放双手
- Word 报告生成后根据数据库巡检结果，在 Word 中直接提供巡检建议，全程智能巡检
- 数据库主机无需安装任何第三方软件，只需要上传巡检脚本，一键执行生成巡检文件即可
- 脚本持续更新，**一次订阅，永久更新**

**脚本不是免费，订阅巡检脚本**可扫码进微信群或者添加作者微信 `Lucifer-0622`：

<img src="https://oss-emcsprod-public.modb.pro/image/editor/20241115-1857196558488449024_395407.png" width="300" />

Oracle 数据库主机无需安装任何软件，只需需要上传对应数据库版本的巡检脚本：
- **dbcheck*.sql**：是用来巡检数据库相关信息，12c 包括 12c 以后的版本：18c，19c，21c，23ai。
- **oscheck.sh**：是用来巡检主机相关信息以及配置检查。

上传完巡检脚本就可以开始巡检了，数据库主机巡检完之后只会生成一个巡检信息包，安全可靠。
# 演示
## Oracle 数据库巡检
Oracle 数据库上传巡检脚本：
```bash
[root@oracle11g:/root]# chown -R oracle:oinstall /home/oracle/check/
[root@oracle11g:/root]# so
[oracle@oracle11g:/home/oracle]$ cd check/
[oracle@oracle11g:/home/oracle/check]$ chmod +x oscheck.sh 
[oracle@oracle11g:/home/oracle/check]$ ll
total 232
-rw-r--r-- 1 oracle oinstall 206434 Nov  7 08:49 dbcheck11g.sql
-rwxr-xr-x 1 oracle oinstall  27275 Nov  7 09:10 oscheck.sh
```
执行脚本一键巡检 Oracle 数据库：
```bash
## 查看当前数据库实例
[oracle@oracle11g:/home/oracle/check]$ ps -ef|grep smon
oracle     28684       1  0 Oct30 ?        00:00:23 ora_smon_lucifer
## 如果一台主机上有多个实例，可以通过参数 -o 来指定，例如：
sh oscheck.sh -o orcl,lucifer,test
## 如果当前主机只有一个数据库实例，并且 ORACLE_SID 环境变量设置正确，则可以不需要指定 -o 参数
[oracle@oracle11g:/home/oracle/check]$ echo $ORACLE_SID
lucifer
## 确保 ORACLE_SID 正确后，执行脚本开始巡检
[oracle@oracle11g:/home/oracle/check]$ sh oscheck.sh

   ███████                             ██         ██      ██                    ██   ██   ██        ██████  ██                      ██    
  ██░░░░░██                           ░██        ░██     ░██                   ░██  ░██  ░██       ██░░░░██░██                     ░██    
 ██     ░░██ ██████  ██████    █████  ░██  █████ ░██     ░██  █████   ██████   ░██ ██████░██      ██    ░░ ░██       █████   █████ ░██  ██
░██      ░██░░██░░█ ░░░░░░██  ██░░░██ ░██ ██░░░██░██████████ ██░░░██ ░░░░░░██  ░██░░░██░ ░██████ ░██       ░██████  ██░░░██ ██░░░██░██ ██ 
░██      ░██ ░██ ░   ███████ ░██  ░░  ░██░███████░██░░░░░░██░███████  ███████  ░██  ░██  ░██░░░██░██       ░██░░░██░███████░██  ░░ ░████  
░░██     ██  ░██    ██░░░░██ ░██   ██ ░██░██░░░░ ░██     ░██░██░░░░  ██░░░░██  ░██  ░██  ░██  ░██░░██    ██░██  ░██░██░░░░ ░██   ██░██░██ 
 ░░███████  ░███   ░░████████░░█████  ███░░██████░██     ░██░░██████░░████████ ███  ░░██ ░██  ░██ ░░██████ ░██  ░██░░██████░░█████ ░██░░██
  ░░░░░░░   ░░░     ░░░░░░░░  ░░░░░  ░░░  ░░░░░░ ░░      ░░  ░░░░░░  ░░░░░░░░ ░░░    ░░  ░░   ░░   ░░░░░░  ░░   ░░  ░░░░░░  ░░░░░  ░░  ░░ 


#==============================================================#                                                                                  
Oracle数据库主机检查                                                                                  
#==============================================================#                                                                                  

收集主机 OS 层信息 ...                                                                                  

收集数据库补丁信息 ...                                                                                  

收集数据库监听信息 ...                                                                                  


#==============================================================#                                                                                  
检查数据库实例：lucifer                                                                                  
#==============================================================#                                                                                  

收集数据库 ALERT 日志 ...                                                                                  

收集数据库 AWR 报告 ...                                                                                  

Note1: Information about Instance

   INST_ID       DBID NAME       DATABASE_ROLE        CREATED              LOG_MODE      OPEN_MODE            VERSION    SESSIONID
---------- ---------- ---------- -------------------- -------------------- ------------- -------------------- ---------- --------------------
         1 4034009431 LUCIFER    PRIMARY              2024-08-27 17:16:07  NOARCHIVELOG  READ WRITE           11.2.0.4.0 2271,4705,50171


Note2: Information about Recyclebin

+------------------------------------------------------------------------------------------------------------+
|                                    Oracle Database health Check script                                     |
|------------------------------------------------------------------------------------------------------------+
|                              Copyright (c) 2022-2100 lpc. All rights reserved.                             |
+------------------------------------------------------------------------------------------------------------+

DBHealthCheck  Author: Lucifer

+----------------------------------------------------------------------------+
Now DBCheck staring, the time cost depending on size of database.
Begining ......
+----------------------------------------------------------------------------+

-----Oracle Database  Check STRAT, Starting Collect Data Dictionary Information----
start...Set Environment Variables, Configure html headers.....
start collect...Database Informaion...
start collect......Overview of Instance Informaion...
start collect......Overview of Database Informaion...
start collect......Database Version Informaion...
start collect......Database Component and Patch Informaion...
start collect......Database Parameter Informaion...
start collect......Database Resource Informaion...
start collect......Database ControlFile Informaion...
start collect......Database LogFile Informaion...
start collect......Archive Log Size in last 10 Days...
start collect......Invalid Object Informaion...
start collect......Tablespace Usage Informaion...
start collect......Top10 Index Informaion...
start collect......Range Partition Extend Check Informaion...
start collect......Object in System TableSpace Informaion...
start collect......BitCoin Attack Check...
start collect......SYSAUX Objects Informaion...
start collect......Flashback Database Parameters...
start...OverView Database User Information...
start collect......System Manager Role Informaion...
start collect......Schema Informaion...
start collect......Profile Informaion...
start collect......Directory Informaion...
start collect......Job Informaion...
start collect......Database Link Informaion...
start collect......Autotask Informaion...
start...OverView Database of Backup and Recover Information...
start collect......Dataguard Parameter...
start collect......Dataguard Applied Status...
start collect......Dataguard Status...
start collect......RMAN Backup Info...
start collect......Orphaned DataPump Jobs...
start collect......Instacne Alert Log...
start...OverView Database of ASM Information...
start collect......ASM Instance Informaion...
start collect......ASM Diskgroup Attribute...
start collect......ASM Disk Group...
start...OverView Database Performace Information...
start collect......AWR Configure Informaion...
start collect......Awrrpt Snap Informaion...
start collect......Awrrpt Load Profile Informaion...
start collect......Instance Efficiency Percentages...
start collect......TOP 10 Wait Event...
start collect......System Time Model...
start collect......TOP 10 SQL Order by Elapsed Time...
start collect......Awrcrt Informaion...
Database script execution ends....

压缩包位置: /home/oracle/check/dbcheck_oracle11g_20241107.tar.gz 
```
执行完之后会在当前目录生成一个 tar.gz 结尾的压缩包：**dbcheck_oracle11g_20241107.tar.gz**
```bash
[oracle@oracle11g:/home/oracle/check]$ ll
total 316
-rw-r--r-- 1 oracle oinstall 206434 Nov  7 08:49 dbcheck11g.sql
drwxr-xr-x 2 oracle oinstall    165 Nov  7 09:14 dbcheck_oracle11g_20241107
-rw-r--r-- 1 oracle oinstall  83097 Nov  7 09:14 dbcheck_oracle11g_20241107.tar.gz
-rwxr-xr-x 1 oracle oinstall  27275 Nov  7 09:10 oscheck.sh
```
这个就是脚本获取到的所有信息集合，包含以下内容：
```bash
[oracle@oracle11g:/home/oracle/check]$ cd dbcheck_oracle11g_20241107
[oracle@oracle11g:/home/oracle/check/dbcheck_oracle11g_20241107]$ ll
total 756
## 最近 90 天的 alert 日志
-rw-r--r-- 1 oracle oinstall   2536 Nov  7 09:13 alert_lucifer.log
## 最近一周的 awrrpt 报告
-rw-r--r-- 1 oracle oinstall 650453 Nov  7 09:13 awrrpt_lucifer_1165_1341.html
## ## Oracle Database 巡检报告 html 格式
-rw-r--r-- 1 oracle oinstall 109080 Nov  7 09:14 dbcheck_4034009431_LUCIFER_11.2.0.4.0_20241107.html
## Oracle 主机巡检报告 txt 格式
-rw-r--r-- 1 oracle oinstall   4266 Nov  7 09:13 oscheck_oracle11g_20241107.txt
```
接下来就是将 tar.gz 文件下载到本地电脑，进行 word 报告一键生成程序生成 Word 报告即可。

## 生成 Word 报告
### 放入巡检文件
通过 sftp 等工具获取到 tar 报告，放到 checkfiles 目录下：
```zsh
╭─lucifer@Lucifer-7 /Volumes/DBA/Github/OracleHealthCheck/checkfiles ‹main●›
╰─$ ls
dbcheck_oracle11g_20241107.tar.gz
请将巡检文件移动到此目录下.txt
```
### 一键生成 Word 报告
进入到 main.py 所在的目录 src，运行脚本调用图形化程序：
```zsh
╭─lucifer@Lucifer-7 /Volumes/DBA/Github/OracleHealthCheck/src ‹main●›
╰─$ python main.py
```
运行完之后会弹出一个图形化报告生成工具：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854333329232977920_395407.png)

工具页面包含可编辑选项：
- 客户公司名称
- 服务公司名称
- 巡检人员
- 服务公司 logo
- 巡检类型：根据不同巡检类型生成不同的报告内容
	- 周
	- 月
	- 季
- Word 报告保存位置（默认建议不改动）

根据自己实际情况填写后，本文按照默认配置选择季度巡检，点击 `生成报告` 即可，运行完成后在 reports 目录下已自动生成 Word 报告：
```zsh
╭─lucifer@Lucifer-7 /Volumes/DBA/Github/OracleHealthCheck/reports ‹main●›
╰─$ ls
Lucifer 有限公司-Oracle数据库4034009431_LUCIFER巡检报告_20241107.docx
word 巡检报告将在此目录下生成.txt
```
至此，Word 报告已经生成完成。

# Word 报告演示

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854337003564916736_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336102092607488_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336156169768960_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336214248296448_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336336914911232_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336406641020928_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336509426634752_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336684537765888_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336861362294784_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241107-1854336903192088576_395407.png)

Word 报告更多内容可以查看：[Lucifer 有限公司-Oracle数据库4034009431_LUCIFER巡检报告_20241107.pdf
](https://www.modb.pro/doc/126508)

注意：脚本默认读取 checkfiles 下的所有 dbcheck 开头的 html 和 tar.gz 文件，并根据一个数据库一个 word 报告的方式批量生成报告。

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

<center>「喜欢这篇文章，您的关注和赞赏是给作者最好的鼓励」</center>

