---
title: 重磅！Oracle 巡检神器来了，一键搞定！
date: 2025-05-11 23:05:40
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1921557043857600512
---

>大家好，这里是 **DBA学习之路**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
距离正式发布 [**Oracle 一键巡检生成 Word 报告**](https://www.modb.pro/db/1768446124021583872) 有一年多了，期间很多朋友使用后反馈了一些问题：
1. 源码部署有使用门槛，没有开箱即用方便；
2. 生成季度报告依赖 Chrome 浏览器以及需要持续更新 chromedriver，不易维护；
3. 每次更换电脑都需要从头部署，使用不便捷；
4. 零基础 Python 小白部署困难，遇到问题无法解决；
5. Python 依赖库升级导致程序无法正常运行；
6. ..... 等等问题...

以上这些问题，这次我全部解决了，完全做到无需部署，零基础开箱即用，无需再维护 chromedriver！

# Oracle 数据库巡检
Oracle 数据库其中一个节点上传巡检脚本（本文选择节点一）：
```bash
[root@rac01:/root]$ chown -R oracle:oinstall /home/oracle/check/
[oracle@rac01:/home/oracle/check]$ chmod +x oscheck.sh 
[oracle@rac01:/home/oracle/check]$ ls
dbcheck12c.sql oscheck.sh
```
执行脚本一键巡检 Oracle 数据库：
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

压缩包位置: /home/oracle/check/dbcheck_rac01_20250409.tar.gz
```
执行完之后会在当前目录生成一个 tar 压缩包：
```bash
[oracle@rac01:/home/oracle/check]$ ls dbcheck_*.tar.gz
dbcheck_rac01_20250409.tar.gz
```
接下来就是将 tar 文件获取到本地，进行 word 报告一键生成程序即可。

# Word 报告生成
废话不多说，先上新版演示！

## macOS 系统
在 macOS 系统中，我把源码打包后，制作成了一个 dmg 后缀的安装包：
```bash
╭─lucifer@Lucifer-7 ~/Downloads/check
╰─$ ls
oracle2word.dmg
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921568624398053376_395407.png)

直接双击打开 dmg：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921568784247173120_395407.png)

将 oracle2word 程序移动到任何你想要移动的位置，我这里移动到 check 目录下（大家自行选择）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921569144797933568_395407.png)

到这，macOS 的软件安装就完成了。

## Windows
Windows 电脑就更方便了，都不需要安装，直接双击启动即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921578375915778048_395407.png)

两个系统的区别就在于软件的安装方式，Windows 无需安装，直接使用即可。
## 运行程序
双击运行这个程序：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921569252432162816_395407.png)

程序启动比较慢，稍等一会儿即可，这里我增加了机器码注册功能，一机一码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921569672101638144_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921569845536108544_395407.png)

激活成功后，直接跳转到熟悉的使用界面：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921570010279981056_395407.png)

将数据库巡检生成的 tar.gz 文件上传到巡检文件夹位置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921570408126492672_395407.png)

填好对应的巡检信息之后，点击生成报告：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921570650905391104_395407.png)

几秒钟，一个 word 巡检报告就生成了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921570839326109696_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921570948776472576_395407.png)

# 报告展示
Word 报告内容基本没有变化，更之前版本一致，目录如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921574019086692352_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921574095842455552_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921574154134892544_395407.png)

其中比较亮眼的就是会有一些性能趋势图：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921574434696081408_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250511-1921574511191797760_395407.png)

演示到这就结束了！

# 写在最后
全新升级之后，不需要安装 Python 环境，不需要源码部署，不需要更新 chromedriver，只需要像安装软件那样，开箱即用！对了，最后再说一句：现在支持试用了，感兴趣的话来V我吧：**`Lucifer-0622`**