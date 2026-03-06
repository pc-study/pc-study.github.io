---
title: ❓关于Oracle一键巡检脚本的 21 个疑问与解答
date: 2024-07-30 11:45:40
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1818088174262956032
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC]

# 前言
前段时间发布了一篇❓关于Oracle一键安装脚本的 21 个疑问与解答，大家反响很好，帮助解答了不少疑问，脚本使用起来更加得心应手。

**<font color='red'>⭐️ 点击直达文章→</font>：[❓关于Oracle一键安装脚本的 21 个疑问与解答](https://www.modb.pro/db/1803438703376420864)**

所以，这次打算再写一篇关于Oracle一键巡检脚本的 21 个疑问与解答，帮助大家更方便的使用脚本。

**关于 Oracle 一键巡检脚本使用方式以及报告预览可以参考文章：**
- **[Oracle 一键巡检自动生成 Word 报告](https://www.modb.pro/db/1768446124021583872)**
- **[Lucifer 有限公司-Oracle数据库4019382963_LUCIFER巡检报告_20240315.pdf](https://www.modb.pro/doc/126508)**

**📢 注意**：本脚本不是免费提供，如有需要请联系作者微信：**`Lucifer-0622`**。
# 疑问和解答
**1、巡检脚本如何使用？购买后是否提供更新？**

答：**一次购买，永久更新**。使用方式请参考：**[Oracle 一键巡检自动生成 Word 报告](https://www.modb.pro/db/1768446124021583872)。**

**2、巡检脚本购买后是否提供源码？还是有其他订阅方式？**

答：可以提供源码，具体请联系作者微信：**`Lucifer-0622`**。

**3、巡检脚本使用什么语言编写的？**

答：主要是以 **SQL、Shell、Python** 语言编写。
- 数据库巡检层面使用 SQL 脚本
- 主机层面使用 Shell 脚本
- 生成 Word 报告使用 Python 脚本

![](https://oss-emcsprod-public.modb.pro/image/editor/20240730-852ee71c-0ae9-4faf-a736-ce7d470c97d0.png)

**4、巡检脚本只支持 Oracle 数据库吗？是否支持其他数据库：MySQL、MSSQL、PGSQL、达梦等等？**

答：目前只支持 Oracle 数据库，后续后增加 MySQL、MSSQL、PGSQL、达梦等等数据库的支持。

**5、巡检脚本支持 Oracle 哪些数据库版本？支持 CDB 架构巡检吗？**

答：从 **Oracle 10G** 版本开始支持，包括但不限于 **`11G、12C、18C、19C、21C、23ai`**；**支持 CDB 架构。**

**6、巡检脚本支持哪些主机平台？Linux、SUSE、Windows、Aix、HP-UNIX 等等都支持吗？**

答：从数据库层面来讲是支持所有平台，因为脚本的本意是巡检数据库，而不是数据库主机；但是脚本也对 Linux 版本的主机增加了巡检主机层面信息的支持（目前只支持 glibc 版本从 2.17 开始）。

**7、巡检脚本执行会影响数据库运行吗？**

答：完全不会影响，数据库巡检的 SQL 均为查询 SQL，不会对应用用户做任何写入操作，均为作者长期运维使用脚本，经过几百套生产数据库检验，从几 G 到上百 T 的数据库运行都没有影响。

**8、巡检脚本执行是否需要在数据库上创建安装软件？**

答：不需要，只需要上传巡检脚本提供的 SQL 和 Shell 脚本即可，不需要对数据库主机以及数据库做任何操作。

**9、巡检脚本生成 Word 报告需要在数据库主机上执行吗？**

答：不需要在数据库主机上执行，生成 Word 报告脚本只需要在任意有 Python 软件环境的主机上执行均可，目前已经适配 Windows 和 MacOS 主机。

**10、巡检脚本执行后生成什么文件？**

答：数据库执行完脚本后根据执行脚本的类型会生成 2 种类型的结果：
- 执行 **`oscheck.sh`** 会在当前目录下生成一个 tar.gz 结尾的压缩包，包含主机层面和数据库层面巡检信息。
- 执行 **`dbcheck.sql`** 会在当前目录下生成一个 html 结尾的文件，只包含数据库层面巡检信息。

将以上生成的文件下载到需要生成 Word 报告的主机上进行一键转换即可。

**11、数据库主机无法登录，只能通过 TNS 连接，巡检脚本是否支持巡检？**

答：支持，只需要能连接到数据库，可以执行 SQL 脚本即可执行巡检，可以将巡检结果直接生成到本地。使用这种方式，可以实现一次性巡检成百上千套数据库。

写一个使用示例（可自行修改）：
```bash
## 进入一个巡检脚本巡检文件放置指定目录
cd checkfiles
## 要求本地有 Oracle 客户端，可以执行 sqlplus 即可
## 以下方式写 100 个，或者通过数组循环来实现也可以
sqlplus sys/passwd@TNS @dbcheck11g.sql
...
...
...
sqlplus sys/passwd@TNS @dbcheck11g.sql
## 执行以上 SQL 之后会生成 100 个 html 报告
dbcheck_2973339141_MESDB_11.2.0.1.0_20240730.html
...
...
...
dbcheck_29732539141_LUCIFER_11.2.0.4.0_20240730.html
## 进入 main 函数所在目录，执行调用 Python 脚本
python main.py
```
随后就是释放双手了，等待一段时间，巡检报告就可以全部生成完成。

**12、演示教程里生成 Word 报告界面可以选巡检类型，有什么区别？**

答：如下图所示，巡检类型可以分为：**`周、月、季`** 三种。

![](https://oss-emcsprod-public.modb.pro/image/editor/20240730-5295ef2e-3c5c-49ae-a29f-01e65126d954.png)

每一种类型生成的 Word 报告的区别就是字面意思，生成的内容从少到多，根据周、月、季需要巡检的信息量进行生成 Word，季度的生成的内容最完善，比如季度生成的 Word 报告里面会包含主机信息，RAC 信息，DG信息，awrcrt 性能分析图等等。

**13、演示教程里需要安装 Python、Google 浏览器和 chromdriver，这个是必须的吗？**

答：**这些都不是在数据库主机上安装，而是在本地主机上，比如自己的 PC 主机**。Python 环境是必须安装的，不然无法使用 python 脚本；Google 浏览器和 chromdriver 是用于在选择季度巡检时生成 awrcrt 性能图截取所需，不安装脚本执行会报错；

**这里可以提供下载链接：**
 - **最新版本 Google Chrome 浏览器**：[https://www.google.cn/intl/zh-CN/chrome/](https://www.google.cn/intl/zh-CN/chrome/)
 - **稳定版本 chromedriver**：[Chrome for Testing availability](https://googlechromelabs.github.io/chrome-for-testing/#stable)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240730-30e40579-2fa1-45f5-a631-d2b2ae2c8d51.png)

**以 MacOS 为例：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20240730-917af48e-d1de-4818-b686-1b394b7410b8.png)

选择对应操作系统的稳定版本 chromdriver 下载后进行解压，复制解压文件夹中的 chromedriver 可执行程序到巡检脚本目录的 resources 目录下。

**14、巡检脚本是否支持自定义巡检项或者巡检模板？**

答：购买后可以提供所有源码，使用者可自行自定义巡检项以及模板内容，前提是需要自行理解源码之后进行 DIY，作者暂不提供订制服务。

**15、脚本订阅后如何下载？是否每次更新都需要向作者索要？**

答：脚本目前是托管在 Github 平台的私有项目组中，为了方便作者及时更新和排错，也方便订阅用户随时下载和使用。唯一的要求就是需要订阅用户提供自己的 Github 用户名或者注册邮箱，方便作者为用户进行项目授权访问。

**16、脚本是加密的吗？还是公开源码？**

答：目前脚本是提供源码的，为了方便大家进行学习和排错，脚本目前没有加密的打算，提供所有源码。

**17、脚本支持试用吗？如果脚本使用遇到问题，可以退款吗？**

答：由于订阅后，脚本是提供源码的，不加密，所以不支持试用，更不支持退款。

**18、脚本订阅后，是否支持售后？遇到问题如何解决呢？**

答：支持售后，也可以帮忙解决问题。但是需要先阅读与了解脚本使用说明。

以上条件是为了减少排错时间成本以及方便用户快速使用脚本，**什么都不看就问几十个问题的**，恕我无能为力吧！

**19、如果需要远程排错或者安装部署，作者支持远程服务吗？**

答：支持，但不免费，毕竟需要时间成本，具体按照问题难易程度。

**20、可以看一下数据库执行巡检时的输出结果吗？**

答：可以，以下为执行 oscheck 时主机输出：
```bash
## 如果一台主机上有多个实例，可以通过参数 -o 来指定，例如：
sh oscheck.sh -o orcl,lucifer,test
## 确保 ORACLE_SID 正确后，执行脚本
[oracle@rac01:/home/oracle/check]$ sh oscheck.sh

#==============================================================#                                                                                  
Oracle数据库主机检查                                                                                  
#==============================================================#                                                                                  

收集主机 OS 层信息 ...                                                                                  
收集数据库补丁信息 ...                                                                                  
收集数据库监听信息 ...                                                                                  

#==============================================================#                                                                                  
检查数据库实例：luciferdg1                                                                                  
#==============================================================#                                                                                  

收集数据库ALERT日志 ...                                                                                  
收集数据库AWR报告 ...                                                                                  

Note1: Information about Instance

   INST_ID       DBID NAME       DATABASE_ROLE        CREATED              LOG_MODE      OPEN_MODE            VERSION    SESSIONID
---------- ---------- ---------- -------------------- -------------------- ------------- -------------------- ---------- --------------------
         1 4019382963 LUCIFER    PRIMARY              2024-03-13 10:21:39  ARCHIVELOG    READ WRITE           19.0.0.0.0 392,13105,30182
         2 4019382963 LUCIFER    PRIMARY              2024-03-13 10:21:39  ARCHIVELOG    READ WRITE           19.0.0.0.0 392,13105,30182


Note2: Information abount Recyclebin

+------------------------------------------------------------------------------------------------------------+
|                                    Oracle Database health Check script                                     |
|------------------------------------------------------------------------------------------------------------+
|                              Copyright (c) 2022-2100 lpc. All rights reserved.                             |
+------------------------------------------------------------------------------------------------------------+

DBHealthCheck  Author: Lucifer

+----------------------------------------------------------------------------+
Now DBCheck staring, the time cost depending on size of database.
Begining ......500
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

压缩包位置: /home/oracle/check/dbcheck_rac01_20240315.tar.gz  
```

**21、可以提供下巡检报告的巡检目录信息吗？**

答：可以，下面列出季度巡检报告最全的巡检信息目录：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240730-ec863328-5778-41c0-8d48-9bd60b129de1.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240730-04a78b9a-bcab-4b26-894d-445f0f34e42c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240730-4e7fe606-e333-4278-8c49-9f01601e8144.png)

针对 Oracle 巡检脚本的疑问，暂时先解惑这么多，**有其他的问题可以在评论区回复！！！**


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












