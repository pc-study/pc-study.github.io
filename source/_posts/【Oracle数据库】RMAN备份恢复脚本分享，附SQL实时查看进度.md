---
title: 【Oracle数据库】RMAN备份恢复脚本分享，附SQL实时查看进度
date: 2021-07-18 01:01:19
tags: [oracle,备份恢复]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/84769
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
- 使用rman进行备份恢复时，通过客户端执行记录无法直观看出进度如何，可以通过SQL进行查询。
# 一、RMAN备份
- 以下命令，直接复制执行即可。
## 1 配置备份路径和计划任务
- 备份路径设置
```bash
SCRIPTSDIR=/home/oracle/scripts
BACKUPDIR=/backup
mkdir -p $BACKUPDIR $SCRIPTSDIR
```
- 写入计划任务
```bash
cat &lt;&lt;EOF&gt;&gt;/var/spool/cron/oracle
30 00 * * 0 ${SCRIPTSDIR}/dblevel0_backup.sh
30 00 * * 1-6 ${SCRIPTSDIR}/dbleve1_backup.sh
EOF
```
## 2 全备脚本
```bash
{
	echo '#!/bin/sh'
	echo 'source ~/.bash_profile'
	echo 'backtime=`date +"20%y%m%d%H%M%S"`'
	echo "rman target / log=${BACKUPDIR}/full_backup_\${backtime}.log&lt;&lt;EOF"
	echo 'run {'
	echo 'allocate channel c1 device type disk;'
	echo 'allocate channel c2 device type disk;'
	echo 'crosscheck backup;'
	echo 'crosscheck archivelog all; '
	echo 'sql"alter system switch logfile";'
	echo 'delete noprompt expired backup;'
	echo 'delete noprompt obsolete device type disk;'
	echo "backup database include current controlfile format '${BACKUPDIR}/backfull_%d_%T_%t_%s_%p';"
	echo 'backup archivelog all DELETE INPUT format '${BACKUPDIR}/archivelog_%d_%T_%t_%s_%p';'
	echo 'release channel c1;'
	echo 'release channel c2;'
	echo '}'
	echo 'EOF'
} &gt;&gt;${SCRIPTSDIR}/dbbackup_full.sh
```
注意：全备脚本和增量0级备份等同。
## 3 增量备份脚本
- 每周日00：30 做0级增量备份脚本
```bash
{
	echo '#!/bin/sh'
	echo 'source ~/.bash_profile'
	echo 'backtime=`date +"20%y%m%d%H%M%S"`'
	echo "rman target / log=${BACKUPDIR}/level0_backup_\${backtime}.log&lt;&lt;EOF"
	echo 'run {'
	echo 'allocate channel c1 device type disk;'
	echo 'allocate channel c2 device type disk;'
	echo 'crosscheck backup;'
	echo 'crosscheck archivelog all; '
	echo 'sql"alter system switch logfile";'
	echo 'delete noprompt expired backup;'
	echo 'delete noprompt obsolete device type disk;'
	echo "backup incremental level 0 database include current controlfile format '${BACKUPDIR}/backlv0_%d_%T_%t_%s_%p';"
	echo 'backup archivelog all DELETE INPUT format '${BACKUPDIR}/archivelog_%d_%T_%t_%s_%p';'
	echo 'release channel c1;'
	echo 'release channel c2;'
	echo '}'
	echo 'EOF'
} &gt;&gt;${SCRIPTSDIR}/dbbackup_lv0.sh
```
- 每周一至周六00：30 做1级增量备份脚本
```bash
{
	echo '#!/bin/sh'
	echo 'source ~/.bash_profile'
	echo 'backtime=`date +"20%y%m%d%H%M%S"`'
	echo "rman target / log=${BACKUPDIR}/level1_backup_\${backtime}.log&lt;&lt;EOF"
	echo 'run {'
	echo 'allocate channel c1 device type disk;'
	echo 'allocate channel c2 device type disk;'
	echo 'crosscheck backup;'
	echo 'crosscheck archivelog all; '
	echo 'sql"alter system switch logfile";'
	echo 'delete noprompt expired backup;'
	echo 'delete noprompt obsolete device type disk;'
	echo "backup incremental level 1 database include current controlfile format '${BACKUPDIR}/backlv1_%d_%T_%t_%s_%p';"
	echo 'backup archivelog all DELETE INPUT format '${BACKUPDIR}/archivelog_%d_%T_%t_%s_%p';'
	echo 'release channel c1;'
	echo 'release channel c2;'
	echo '}'
	echo 'EOF'
} &gt;&gt;${SCRIPTSDIR}/dbbackup_lv1.sh
```
## 4 查看rman备份进度sql
```sql
    SELECT sid,
           serial#,
           CONTEXT,
           sofar,
           totalwork,
           round(sofar / totalwork * 100,
                 2) "%_COMPLETE"
      FROM gv$session_longops
     WHERE opname LIKE 'RMAN%'
       AND opname NOT LIKE '%aggregate%'
       AND totalwork != 0
       AND sofar &lt;&gt; totalwork;
```

# 二、RMAN恢复
## 1 恢复脚本
- 数据库开启到nomount
```bash
sqlplus / as sysdba
startup nomount
```
- rman恢复控制文件，开启数据库到mount
```bash
rman target /
restore controlfile from '/backup/control.bak';
alter database mount;
```
- rman 恢复数据库
```bash
rman target /
restore database;
recover database;
```
- 打开数据库到resetlogs
```bash
alter database open resetlogs;
```
## 2 查看rman恢复进度sql
```sql
SELECT sid,
       serial#,
       CONTEXT,
       sofar,
       totalwork,
       round(sofar / totalwork * 100,
             2) "% Complete"
  FROM v$session_longops
 WHERE opname LIKE 'RMAN:%'
   AND opname NOT LIKE 'RMAN: aggregate%';
```

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
​