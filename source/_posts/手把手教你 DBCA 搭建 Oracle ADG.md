---
title: 手把手教你 DBCA 搭建 Oracle ADG
date: 2021-06-05 23:40:01
tags: [dataguard]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/69631
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
Oracle Data Guard 简称 DG，是 Oracle MAA（Maximum Availability Architecture）中的成员之一。
- 从 `Oracle 7i` 版本开始推出 STANDBY DATABASE 的概念，慢慢受到大家的欢迎。
- 随着 Oracle 数据库版本的更迭，搭建备库的方式多种多样。

本文介绍一种创建物理备库的新方式，从 `12C` 版本开始推出：使用 <font color='orage'>**DBCA**</font> 命令行创建 DG 备库。

# 介绍
最简单的搭建命令参数如下：
```bash
dbca -createDuplicateDB -createAsStandby -dbUniqueName`
```
- 优点：方便快捷，搭建速度较快。
- 缺点：影响主库的性能，执行过程报错不方便排查。

**具体命令可参考：**
```bash
dbca -silent -createDuplicateDB
-gdbName global_database_name
-primaryDBConnectionString easy_connect_string_to_primary
-sid database_system_identifier
[-createAsStandby 
	[-dbUniqueName db_unique_name_for_standby]]
[-customScripts scripts_list]
```
**更详细参数可参考官方文档**：[The createDuplicateDB command creates a duplicate of an Oracle database.](https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/creating-and-configuring-an-oracle-database.html#GUID-7F4B1A64-5B08-425A-A62E-854542B3FD4E)

![](https://img-blog.csdnimg.cn/2021060517420066.png)

**<font color='orage'>12.2.0.1 开始支持 DBCA 创建物理备库，但是限制较多：</font>**
- 主库必须是单机环境，非 RAC 数据库;
- 主库必须是非 CDB 环境;

**<font color='orage'>18c 之后，以上限制已经取消，支持主库是 CDB 和 RAC 环境。</font>**

# 一、环境准备
❤️ Oracle 安装包全集下载：**[精心整理Oracle数据库各版本（软件安装包+最新补丁包）](https://www.modb.pro/download/123438)**！

⭐️ 演示环境可以使用脚本安装，可以使用博主编写的 Oracle 一键安装脚本，同时支持单机和 RAC 集群模式！
>**[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)**

**<font color='red'>更多更详细的脚本使用方式可以订阅专栏：</font>[Shell脚本安装Oracle数据库](https://www.modb.pro/course/148)。**

本次测试尽量按照生产环境升级进行模拟：
| 节点 | 主机版本 | 主机名 | 实例名 | Oracle版本 | IP地址 |
|-----|-----|------|-----|-----|------|
| rac01 | rhel7.9 | rac01 | cdb19c | 19.3.0（补丁 29585399） | 10.211.55.100 |
| rac02 | rhel7.9 | rac02 | orcl+cdb19c | 19.3.0（补丁 29585399） | 10.211.55.101 |
| 备库 | rhel7.9 | dbca_stby | 不创建实例 | 19.3.0（补丁 29585399） | 10.211.55.110 |

**📢 注意：**
- db_unique_name主备库不能相同;
- db_name主备库需保持一致;
- 主备库DB版本需保持一致;


# 二、ADG搭建准备
## 1、配置hosts文件
**主库：**
```bash
cat <<EOF >> /etc/hosts
##FOR DG BEGIN
10.211.55.110 dbca_stby
##FOR DG END
EOF
```
![](https://img-blog.csdnimg.cn/20210605220228109.png)

![](https://img-blog.csdnimg.cn/20210605220401252.png)

**备库：**
```bash
cat <<EOF >> /etc/hosts
##FOR DG BEGIN
10.211.55.100 rac01
10.211.55.101 rac02
10.211.55.105 rac-scan
##FOR DG END
EOF
```
![](https://img-blog.csdnimg.cn/20210605215047313.png)
## 2、配置静态监听和TNS
建议 listener.ora 增加静态监听：

**rac01：**
```bash
cat <<EOF >> $TNS_ADMIN/listener.ora
##FOR DG BEGIN
SID_LIST_LISTENER =
	(SID_LIST =
		(SID_DESC =
			(GLOBAL_DBNAME = cdb19c)
			(ORACLE_HOME = /u01/app/oracle/product/19.3.0/db)
			(SID_NAME = cdb19c1)
		)
	)
##FOR DG END
EOF
```
![](https://img-blog.csdnimg.cn/20210605192435726.png)

**rac02：**
```bash
cat <<EOF >> $TNS_ADMIN/listener.ora
##FOR DG BEGIN
SID_LIST_LISTENER =
(SID_LIST =
	(SID_DESC =
		(GLOBAL_DBNAME = cdb19c)
		(ORACLE_HOME = /u01/app/oracle/product/19.3.0/db)
		(SID_NAME = cdb19c2)
	)
)
##FOR DG END
EOF
```
![](https://img-blog.csdnimg.cn/20210605192555806.png)

**备库：**
```bash
cat <<EOF >>$TNS_ADMIN/listener.ora
##FOR DG BEGIN
SID_LIST_LISTENER =
(SID_LIST =
	(SID_DESC =
		(GLOBAL_DBNAME = cdb19c_stby)
		(ORACLE_HOME = /u01/app/oracle/product/19.3.0/db)
		(SID_NAME = cdb19c_stby)
	)
)
##FOR DG END
EOF
```
![](https://img-blog.csdnimg.cn/20210605194216412.png)
**重启监听：**
```bash
#主库RAC重启监听
srvctl stop listener
srvctl start listener
   
##备库重启监听
lsnrctl start
```
![](https://img-blog.csdnimg.cn/20210605193630649.png)

![](https://img-blog.csdnimg.cn/20210605193735686.png)

![](https://img-blog.csdnimg.cn/2021060519390969.png)

![备库监听](https://img-blog.csdnimg.cn/20210605214433370.png)
## 3、tnsnames.ora 增加 TNS
**oracle用户执行：**
```bash
cat <<EOF >> $TNS_ADMIN/tnsnames.ora
##FOR DG BEGIN
CDB19C =
(DESCRIPTION =
	(ADDRESS_LIST =
		(ADDRESS = (PROTOCOL = TCP)(HOST = rac-scan)(PORT = 1521))
	)
	(CONNECT_DATA =
		(SERVICE_NAME = cdb19c)
	)
)
CDB19C1 =
(DESCRIPTION =
	(ADDRESS_LIST =
		(ADDRESS = (PROTOCOL = TCP)(HOST = rac01)(PORT = 1521))
	)
	(CONNECT_DATA =
		(SERVICE_NAME = cdb19c)
	)
)
CDB19C2 =
(DESCRIPTION =
	(ADDRESS_LIST =
		(ADDRESS = (PROTOCOL = TCP)(HOST = rac02)(PORT = 1521))
	)
	(CONNECT_DATA =
		(SERVICE_NAME = cdb19c)
	)
)
CDB19C_STBY =
(DESCRIPTION =
	(ADDRESS_LIST =
		(ADDRESS = (PROTOCOL = TCP)(HOST = dbca_stby)(PORT = 1521))
	)
	(CONNECT_DATA =
		(SERVICE_NAME = cdb19c_stby)
	)
)
##FOR DG BEGIN
EOF
```
**tnsping 测试连通性：**
```bash
tnsping cdb19c
tnsping cdb19c1
tnsping cdb19c2
tnsping cdb19c_stby
```
![](https://img-blog.csdnimg.cn/20210605215512300.png)

![](https://img-blog.csdnimg.cn/20210605215538701.png)

![](https://img-blog.csdnimg.cn/20210605215613108.png)

![](https://img-blog.csdnimg.cn/20210605215433806.png)
## 4、主库配置参数
**查看是否开启强制日志：**
```sql
select force_logging,log_mode,cdb from gv$database;
    
FORCE_LOGGING		LOG_MODE     CDB
--------------------------------------- 
YES					ARCHIVELOG   YES
```
**如果没有开启强制日志：**
```sql
alter database force logging;
```
**如果没有开启归档日志：**
```sql
shutdown immediate
startup mount
alter database archivelog;
alter database open;
alter pluggable database all open;
```
![](https://img-blog.csdnimg.cn/20210605220911471.png)
## 5、主库添加stanby log文件
```sql
set line222
col member for a60
select t2.thread#,t1.group#,t1.member,t2.bytes/1024/1024 from v$logfile t1,v$log t2 where t1.group#=t2.group# order by 1,2;
```
![](https://img-blog.csdnimg.cn/20210605221437322.png)
**📢 注意：**
- stanby log 日志大小至少要和 redo log 日志一样大小，不能小于主库日志大小；
- stanby log 数量： standby logfile=(1+logfile组数)=(1+2)=3 组,每个 thread 需要加 3 组 standby logfile；
- thread 要与 redo log 保持一致，如果是 rac，需要增加多个 thread 对应的 standby log；
	
```sql
ALTER DATABASE ADD STANDBY LOGFILE thread 1 
group 5 ('+DATA') SIZE 120M,
group 6 ('+DATA') SIZE 120M,
group 7 ('+DATA') SIZE 120M;
	
ALTER DATABASE ADD STANDBY LOGFILE thread 2
group 8 ('+DATA') SIZE 120M,
group 9 ('+DATA') SIZE 120M,
group 10 ('+DATA') SIZE 120M;
```
![](https://img-blog.csdnimg.cn/20210605222215369.png)
```sql
select t2.thread#,t1.group#,t1.member,t2.bytes/1024/1024 from v$logfile t1,v$standby_log t2 where t1.group#=t2.group# order by 1,2;
```
![](https://img-blog.csdnimg.cn/20210605222902724.png)
# 三、DBCA 创建物理备库
**oracle 用户执行：**
```bash
dbca -silent -createDuplicateDB \
-gdbName cdb19c \
-sid cdb19c \
-sysPassword oracle \
-primaryDBConnectionString 10.211.55.105:1521/cdb19c \
-nodelist dbca_stby \
-databaseConfigType SINGLE \
-createAsStandby -dbUniqueName cdb19c_stby \
-datafileDestination '/oradata'
```
![](https://img-blog.csdnimg.cn/20210605224346403.png)
![](https://img-blog.csdnimg.cn/20210605224824638.png)
**<font color='orage'>DBCA 物理 DG 已经创建成功！</font>**

# 四、配置主库+备库 DG 参数
**主库设置 DG 参数：**
```sql
ALTER SYSTEM SET LOG_ARCHIVE_CONFIG='DG_CONFIG=(CDB19C,CDB19C_STBY)' sid='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=+DATA VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=CDB19C' sid='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=cdb19c_stby ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=CDB19C_STBY' sid='*';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_STATE_2=ENABLE sid='*';
ALTER SYSTEM SET LOG_ARCHIVE_MAX_PROCESSES=4 sid='*';
ALTER SYSTEM SET FAL_SERVER=CDB19C_STBY sid='*';
ALTER SYSTEM SET FAL_CLIENT=CDB19C sid='*';
ALTER SYSTEM SET DB_FILE_NAME_CONVERT='+DATA','/oradata/CDB19C_STBY' SCOPE=SPFILE sid='*';
ALTER SYSTEM SET LOG_FILE_NAME_CONVERT='+DATA','/oradata/CDB19C_STBY' SCOPE=SPFILE sid='*';
ALTER SYSTEM SET STANDBY_FILE_MANAGEMENT=AUTO sid='*';
```
**📢 注意：** RAC 修改参数需要加上 `sid='*'`，修改多个实例。

**备库设置 DG 参数：**
```sql
ALTER SYSTEM SET LOG_ARCHIVE_CONFIG='DG_CONFIG=(CDB19C_STBY,CDB19C)';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_1='LOCATION=/archivelog VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=CDB19C_STBY';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=CDB19C ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=CDB19C';
ALTER SYSTEM SET LOG_ARCHIVE_DEST_STATE_2=ENABLE;
ALTER SYSTEM SET LOG_ARCHIVE_MAX_PROCESSES=4;
ALTER SYSTEM SET FAL_SERVER=CDB19C;
ALTER SYSTEM SET FAL_CLIENT=CDB19C_STBY;
ALTER SYSTEM SET DB_FILE_NAME_CONVERT='/oradata/CDB19C_STBY','+DATA' SCOPE=SPFILE;
ALTER SYSTEM SET LOG_FILE_NAME_CONVERT='/oradata/CDB19C_STBY','+DATA' SCOPE=SPFILE;
ALTER SYSTEM SET STANDBY_FILE_MANAGEMENT=AUTO;
```
**查看 OMF 参数配置：**
```sql
show parameter db_create_file_dest
```
![](https://img-blog.csdnimg.cn/20210605230405897.png)
    
![](https://img-blog.csdnimg.cn/20210605230332418.png)

**📢 注意：** 如果同时设置 OMF 和 DB_FILE_NAME_CONVERT 参数，则优先 OMF 参数。

# 五、开启日志应用
```sql
##备库执行
alter database recover managed standby database using current logfile disconnect from session;
    
##主库执行
alter system set log_archive_dest_state_2=enable sid='*';
```
![](https://img-blog.csdnimg.cn/20210605231146809.png)

![](https://img-blog.csdnimg.cn/20210605232211617.png)
# 六、测试同步
**主库创建测试数据：**
```sql
alter session set container=orcl;
```
![](https://img-blog.csdnimg.cn/20210604000102800.png)
```bash
sqlplus lucifer/lucifer@orcl
```
![](https://img-blog.csdnimg.cn/20210604000353642.png)

**备库查看是否同步：**

![](https://img-blog.csdnimg.cn/20210604000554940.png)

**<font color='orage'>至此，ADG 已搭建完毕！</font>**

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