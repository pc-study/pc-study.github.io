---
title: 数据同步软件SharePlex For Oracle搭建手册
date: 2021-06-11 16:41:13
tags: [oracle,shareplex]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/70729
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)


# 前言
- **什么是SharePlex?**

>**SharePlex是一种基于分析oracle的redo log文件，把数据改变从一个Oracle数据库复制到另外一个或多个oracle数据库的逻辑数据复制软件。**

![SharePlex简介](https://img-blog.csdnimg.cn/2021061116090245.png)
**SharePlex特点：**

>- 可以复制表（全部内容、部分行、部分列）
> - 可以复制MV和sequence，以及DDL
>- 支持Blob，Clob，NClob，Long，Long RAW，udt，varray，nchar，nvarchar2，IOT，XML等不常用的数据类型
> - 支持redo文件存在文件系统，裸设备，ASM上
> - 准实时复制
>- 支持在不同的硬件，软件平台以及不同的Oracle版本之间的复制
>- 支持双向复制（包括DDL）
>- 复制过程中检验数据不一致问题
>- 在线比对，修复数据
>- 事务开始时即复制到目标端
>- 容灾切换简单，快速
>- 支持Email，SNMP等方式报警
>- 图形监控界面

**SharePlex架构图：**
![SharePlex架构图](https://img-blog.csdnimg.cn/20210611161104273.png)
- **本次实施用RMAN进行复制：<font color='red'>rman/BCV</font>**

# 一、环境准备
![环境准备](https://img-blog.csdnimg.cn/20210611154146746.png?)

## 1 配置hosts文件
```bash
##源端
cat <<EOF>>/etc/hosts
10.211.55.110 orcl-rpt
EOF

##目标端
cat <<EOF>>/etc/hosts
10.211.55.100 orcl-rac01
EOF
```

## 2 环境变量添加
```bash
##源端
cat <EOF>/home/oracle/.bash_profile
export SP_SYS_HOST_NAME=orcl-rac01
export SP_SYS_VARDIR=/quest/vardir2300
export PATH=/quest/bin:$PATH
EOF

##目标端
cat <EOF>/home/oracle/.bash_profile
export SP_SYS_HOST_NAME=orcl-rpt
export SP_SYS_VARDIR=/quest/vardir2300
export PATH=/quest/bin:$PATH
EOF
```
## 3 源端启动归档及补充日志
```bash
--开启归档模式
shutdown immediate
startup mount
alter database archivelog;
alter database open;

--开启补充日志
alter database add supplemental log data (primary key, unique index) columns;

--查看补充日志
select SUPPLEMENTAL_LOG_DATA_MIN,SUPPLEMENTAL_LOG_DATA_PK,SUPPLEMENTAL_LOG_DATA_UI from v$database;
```

## 4 创建splex用户
```bash
--源端执行
create user SPLEX2300 identified by SPLEX2300;
grant dba to SPLEX2300;
```
# 二、安装SharePlex软件
![安装SharePlex](https://img-blog.csdnimg.cn/20210611154213142.png)

## 1 准备安装介质和license
```bash
##源端&目标端：
mkdir /quest
chmod -R 755 /quest
chown -R oracle:oinstall /quest

##license
```

## 2 执行Share*.tpm安装
![tpm安装](https://img-blog.csdnimg.cn/20210611150046744.png)​

## 3 执行ora_setup初始化
![ora_setup初始化](https://img-blog.csdnimg.cn/2021061115014246.png)

**Notes：以上步骤，如若重建SharePlex，无需操作。**
>- 如果是重建splex，需要在启动splex前清理splex：
>- /quest/bin/ora\_cleansp splex2300/splex2300
>- 源端目标端均执行(前提是数据库都要启动)

## 4 启动shareplex
```bash
sp_cop -u2300 &
```
## 5 源端参数修改
```bash
##进入sp控制台
sp_ctrl

##设置参数
set param SP_OCT_REDUCED_KEY 2
set param SP_OPO_STOP_ON_DDL_ERR 0 
set param SP_OPO_CONT_ON_ERR 1
set param SP_OCF_LOCK_WAIT_TIME 1 
set param SP_OCF_THREAD_COUNT 30
set param SP_OCT_OLOG_USE_OCI 1
```
## 6 目标端停止post
```bash
##进入sp控制台
sp_ctrl

##停止同步
stop post
```

## 7 源端配置并激活config文件
![编写config文件](https://img-blog.csdnimg.cn/20210611154301272.png)
![激活config文件](https://img-blog.csdnimg.cn/20210611154355364.png)

**这里需要在源端主机配置/etc/hosts的orcl-rpt的解析，否则会激活失败。**
```bash
##进入sp控制台
sp_ctrl

##查看config
list config
copy config ORA_config orcl_config
edit config orcl_config

##以下为配置文件内容
datasource:o.mesdb2
#source tables target tables routing map

expand TABLE_A.% 　　LUCIFER.% 　　orcl-rpt:q1@o.orcl
expand TABLE_B.% 　　TEST.% 　　orcl-rpt:q2@o.orcl
```

**Notes：如若是重建splex，直接激活config即可。**
```bash
activate config orcl_config nolock
```

实际操作时，不建议这一步激活，一般是rman恢复到目标端之后recover database until scn 之前激活config。　  

## 8 大事务检查
```bash
select start_time from gv$transaction;
```

## 9 数据初始化
![数据初始化](https://img-blog.csdnimg.cn/20210611154609722.png)
>- **有备份的话可以直接恢复，然后追归档即可**
>- **如果是rac恢复到单机，要注意目录的变化set newname**

- **如果没有备份，可执行以下备份脚本：**
```bash
#!/bin/sh
source ~/.bash_profile
backtime=`date +"20%y%m%d%H%M%S"`
rman target / log=/dbbackup/logs/full_backup_$backtime.log<<EOF
run{
allocate channel c1 device type disk;
allocate channel c2 device type disk;
crosscheck backup;
crosscheck archivelog all;
sql 'alter system archive log current';
delete noprompt expired backup;
delete noprompt obsolete device type disk;
backup database format '/dbbackup/backdata_%d_%T_%U';
backup current controlfile format '/dbbackup/cntrl_%s_%p_%s';
sql 'alter system archive log current';
backup archivelog all format '/dbbackup/archlog_%d_%T_%U';
crosscheck archivelog all;
crosscheck backup;
delete noprompt obsolete device type disk;
release channel c1;
release channel c2;
}
exit;
EOF
```
![初始化方法](https://img-blog.csdnimg.cn/20210611160215758.png)
- **源端取一个SCN**
```bash
col current_scn format 9999999999999999
select current_scn from v$database;
```

- **目标端恢复数据库到指定的scn**
```bash
startup nomount;

##连接rman
rman target /
restore controlfile from '/dbbackup/cntrl_6428_1_6428.bak';
alter database mount;
run {
set newname for database to '/data/orcl/%b';
restore database;
switch datafile all;
};
recover database;
```
>- (如果是**ASM**存放归档文件，cp只能一个一个归档拷贝，可以直接用rman备份指定时间到当前时间的归档，然后恢复到目标端)源端
>- 如果是ocfs共享，可以把源端archivelog目录通过nfs挂载到目标端，在目标端catalog之后recover database,但是要注意nfs挂载需要注释掉源端/etc/hosts文件中的目标端ip解析，否则无法挂载)

```bash
backup archivelog from time "to_date('2020-9-22 00:00:00','YYYY-MM-DD hh24:mi:ss')" until time "to_date('2020-9-22 22:00:00','YYYY-MM-DD hh24:mi:ss')";
catalog start with '/dbbackup/archlog_MESDB_';
recover database until scn 63839836480;
```

- **用RESETLOGS方式打开目标端数据库**
```bash
alter database open resetlogs;
```
>- 目标端运行 ora\_setup 使用存在的 SPLEX 用户,不要创建新用户(如果 shareplex 重建的话，不需要执行这一步)
>- 目标端运行 reconcile 指定的 scn 值是之前取的 scn 值

![reconcile](https://img-blog.csdnimg.cn/20210611160307438.png)
```bash
##进入sp控制台
sp_ctrl
reconcile queue q1 for o.orcl1-o.orcl scn 63839836480
reconcile queue q2 for o.orcl1-o.orcl scn 63839836480
reconcile queue q3 for o.orcl1-o.orcl scn 63839836480
reconcile queue q4 for o.orcl1-o.orcl scn 63839836480
reconcile queue q5 for o.orcl1-o.orcl scn 63839836480
```
>**Notes：如果reconcile hang住，可以在源端执行flush o.mesdb2来清洗队列管道，源端执行几次flush，目标端就要执行几次start post加1次，也可以单独对一个队列管道flush：flush o.orcl1 to orcl-rpt queue q1。**

- **目标端运行cleanup.sql来清空内部表信息**
```bash
sqlplus splex2300/splex2300 @/quest/bin/cleanup.sql
```
## 10 目标端禁用trigger和FK、job
![禁用trigger和FK、job](https://img-blog.csdnimg.cn/20210611160328256.png)
```sql
--禁用trigger
SELECT 'alter trigger ' || owner || '.' || trigger_name || ' disable;' from dba_triggers where owner in ('SAJET','SMT','ERP','WIQ','SJ');

--禁用约束
SELECT 'alter table '||owner||'.'||table_name||' disable constraint '||constraint_name||';' from dba_constraints where constraint_type='R' and owner in ('SAJET','SMT','ERP','WIQ','SJ');

--禁用job
alter system set job_queue_processes=0;
```

## 11 目标端启动post
```bash
##进入sp控制台
sp_ctrl

##目标端开启同步
start post

##查看队列运行情况
show
qstatus

##查看日志
show log reverse
```
**至此，SharePlex已经搭建完成。**



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