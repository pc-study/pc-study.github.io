---
title: Oracle DataGuard容灾如何升级？看这篇就够了
date: 2021-06-04 00:37:29
tags: [dataguard,oracle升级]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/69122
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

### 前言
<p style="text-indent:2em">随着Oracle的普遍应用，DataGuard这个成员基本成为了数据库容灾环境的标配。当需要升级Oracle数据库的同时，也需要考虑同时升级DataGuard数据库版本，那么如何快捷安全的升级？</p>

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://media.giphy.com/media/JOMJaZ0OzRBpMHMBw2/giphy.gif">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">升级流程</div>
</center>

**推荐方案：**

<font color='red'>升级至NON-CDB模式：</font>

**1、首先关闭ADG同步，升级主库至19C，备库以mount模式在19C下打开，开启ADG同步。**

<font color='red'>升级至CDB模式：</font>

**<font color='red'>1、首先升级主库为19C cdb+pdb模式，备库重新搭建ADG。</font>**

**2、首先搭建一套19C CDB的主备ADG环境，首先关闭ADG同步，然后将主库升级并插入主库CDB，开启ADG同步。**

## 以下主要介绍CDB模式方案1：

### 一、环境准备
环境安装过程忽略，可参考：

[10分钟！一键部署Oracle 11GR2单机](https://blog.csdn.net/m0_50546016/article/details/116503394)

[30分钟！一键部署Oracle 19C单机CDB+PDB](https://blog.csdn.net/m0_50546016/article/details/116524049)

**脚本使用和下载可参考Github**：[https://github.com/pc-study/InstallOracleshell](https://github.com/pc-study/InstallOracleshell)

**搭建ADG可参考：**

[ADG单实例搭建系列之（Active Database Duplicate Using Image Copies）](https://blog.csdn.net/m0_50546016/article/details/115801363)

[ADG单实例系列搭建之（RMAN备份恢复）](https://blog.csdn.net/m0_50546016/article/details/115866259)

[ADG单实例搭建系列之 （DBCA）](https://blog.csdn.net/m0_50546016/article/details/115830566)

[ADG搭建系列之 11G RAC to Single DATABASE](https://blog.csdn.net/m0_50546016/article/details/116075865)

本次测试尽量按照生产环境升级进行模拟：
| 节点 | 主机版本 | 主机名 | 实例名 | Oracle版本 | IP地址 |
|-----|-----|------|-----|-----|------|
| 主库 | redhat 7.9 | orcl | orcl+cdb19c | 11.2.0.4 + 19.3.0（补丁 29585399） | 10.211.55.100 |
| 备库 | redhat 7.9 | orcl_stby | 不创建实例 | 19.3.0（补丁 29585399） | 10.211.55.101 |
**注意：<font color='red'>源库最好冷备拷贝到新机器进行升级，保留源库用于回退。</font>**

根据**MOS文档 2485457.1**可以获取**最新版 AutoUpgrade工具**下载地址：

The most recent version of AutoUpgrade can be downloaded via this link: version [20210421](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=2485457.1&attachid=2485457.1:AUTOUPGRADE_2113&clickstream=yes).

### 二、升级主库

**1、用autoUpgrade工具升级主库**

参考文章：[都2021了，还愁Oracle升级步骤麻烦吗？学会本文，升级如喝水](https://blog.csdn.net/m0_50546016/article/details/117261236)

**config文件如下：**
	
    cat<<EOF >/soft/conifg.cfg
	# Global configurations
	global.autoupg_log_dir=/soft/uplogs
	global.raise_compatible=yes
	global.drop_grp_after_upgrade=yes
	
	# Database number 3 - Noncdb to PDB upgrade
	upg3.log_dir=/soft/logs
	upg3.sid=orcl
	upg3.source_home=/u01/app/oracle/product/11.2.0/db
	upg3.target_cdb=cdb19c
	upg3.target_home=/u01/app/oracle/product/19.3.0/db
	upg3.target_pdb_name=orcl
	upg3.target_pdb_copy_option=file_name_convert=('/oradata/orcl/', '/oradata/CDB19C/orcl/')
	upg3.start_time=NOW                  # Optional. 10 Minutes from now
	upg3.upgrade_node=orcl           # Optional. To find out the name of your node, run the hostname utility. Default is 'localhost'
	upg3.run_utlrp=yes              # Optional. Whether or not to run utlrp after upgrade
	upg3.timezone_upg=yes           # Optional. Whether or not to run the timezone upgrade
	upg3.target_version=19  # Oracle version of the target ORACLE_HOME.  Only required when the target Oracle database version is 12.2
	upg3.remove_underscore_parameters=yes
	upg3.source_tns_admin_dir=/u01/app/oracle/product/11.2.0/db/network/admin
	upg3.target_tns_admin_dir=/u01/app/oracle/product/19.3.0/db/network/admin
	EOF
![开始升级](https://img-blog.csdnimg.cn/2021060322094958.png)![non-cdb转换为pdb](https://img-blog.csdnimg.cn/20210603225715343.png)
![升级完成](https://img-blog.csdnimg.cn/20210603230554516.png)
**至此，主库已升级完成。**

<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://media.giphy.com/media/ZWDqdBk29XvDifWofC/giphy.gif">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;"></div>
</center>

**检查升级情况：**

设置pdb随cdb启动：
`alter pluggable database all save state;`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210603230704106.png)
### 三、搭建ADG

**1、主备CDB搭建ADG**

备库执行：

	dbca -silent -createDuplicateDB \
	-gdbName cdb19c \
	-sid cdb19c \
	-sysPassword oracle \
	-primaryDBConnectionString 10.211.55.100:1521/cdb19c \
	-nodelist orcl_stby \
	-databaseConfigType SINGLE \
	-createAsStandby -dbUniqueName cdb19c_stby \
	-datafileDestination '/oradata'
![DBCA创建备库实例](https://img-blog.csdnimg.cn/20210603235342134.png)![pdb](https://img-blog.csdnimg.cn/20210603235430951.png)

	--主库设置DG参数
	ALTER SYSTEM SET LOG_ARCHIVE_CONFIG='DG_CONFIG=(CDB19C,CDB19C_STBY)';
	ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=/archivelog VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=CDB19C';
	ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=CDB19C_stby ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=CDB19C_STBY';
	ALTER SYSTEM SET LOG_ARCHIVE_DEST_STATE_2=ENABLE;
	ALTER SYSTEM SET LOG_ARCHIVE_FORMAT='%t_%s_%r.arc' SCOPE=SPFILE;
	ALTER SYSTEM SET LOG_ARCHIVE_MAX_PROCESSES=4;
	ALTER SYSTEM SET REMOTE_LOGIN_PASSWORDFILE=EXCLUSIVE SCOPE=SPFILE;
	ALTER SYSTEM SET FAL_SERVER=CDB19C_STBY;
	ALTER SYSTEM SET FAL_CLIENT=CDB19C;
	ALTER SYSTEM SET DB_FILE_NAME_CONVERT='/oradata/CDB19C','/oradata/CDB19C_STBY' SCOPE=SPFILE;
	ALTER SYSTEM SET LOG_FILE_NAME_CONVERT='/oradata/CDB19C','/oradata/CDB19C_STBY'  SCOPE=SPFILE;
	ALTER SYSTEM SET STANDBY_FILE_MANAGEMENT=AUTO;
	
	--备库设置DG参数
	ALTER SYSTEM SET LOG_ARCHIVE_CONFIG='DG_CONFIG=(CDB19C_STBY,CDB19C)';
	ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=/archivelog VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=CDB19C_STBY';
	ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=CDB19C ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=CDB19C';
	ALTER SYSTEM SET LOG_ARCHIVE_DEST_STATE_2=ENABLE;
	ALTER SYSTEM SET LOG_ARCHIVE_FORMAT='%t_%s_%r.arc' SCOPE=SPFILE;
	ALTER SYSTEM SET LOG_ARCHIVE_MAX_PROCESSES=4;
	ALTER SYSTEM SET REMOTE_LOGIN_PASSWORDFILE=EXCLUSIVE SCOPE=SPFILE;
	ALTER SYSTEM SET FAL_SERVER=CDB19C;
	ALTER SYSTEM SET FAL_CLIENT=CDB19C_STBY;
	ALTER SYSTEM SET DB_FILE_NAME_CONVERT='/oradata/CDB19C_STBY','/oradata/CDB19C' SCOPE=SPFILE;
	ALTER SYSTEM SET LOG_FILE_NAME_CONVERT='/oradata/CDB19C_STBY','/oradata/CDB19C'  SCOPE=SPFILE;
	ALTER SYSTEM SET STANDBY_FILE_MANAGEMENT=AUTO;
![配置ADG参数](https://img-blog.csdnimg.cn/20210603235600782.png)
**2、CDB主备开启同步**

	##备库执行
    alter database recover managed standby database using current logfile disconnect from session;
    
    ##主库执行
    alter system set log_archive_dest_state_2=enable;
![同步情况检查](https://img-blog.csdnimg.cn/20210603235800841.png)
### 四、升级完测试

**主库创建测试数据：**

`alter session set container=orcl;`
![创建连接用户](https://img-blog.csdnimg.cn/20210604000102800.png)
`sqlplus lucifer/lucifer@orcl`
![创建测试数据](https://img-blog.csdnimg.cn/20210604000353642.png)
**备库查看是否同步：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210604000554940.png)
**升级结束，ADG同步正常，完美。**
<center>
    <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://media.giphy.com/media/a3qvCO711Xn05LgF4R/giphy.gif">
    <br>
    <div style="color:orange; border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;"></div>
</center>

**参考文章：**

[How to Upgrade with AutoUpgrade and Data Guard](https://dohdatabase.com/2021/01/05/how-to-upgrade-with-autoupgrade-and-data-guard/)

[Upgrade Database to 12.2 with Physical Standby](http://www.br8dba.com/upgrade-database-to-12-2-with-physical-standby/)


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