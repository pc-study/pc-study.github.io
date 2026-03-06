---
title: Oracle 物理 DG 转 ADG 步骤
date: 2021-10-19 09:30:35
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/139081
---

DataGuard 物理备库，正常为 mount 状态，如果想要进行查询，需要转为 ADG，即 read only 状态！

在开启为 read only 之前，需要给备库添加 `n+1` 组的 standby redo log！

**查询主库的 redolog ：**
```sql
set line222
set pagesize1000
col member for a60
select t2.thread#,t1.group#,t1.member,t2.bytes/1024/1024 from v$logfile t1,v$log t2 where t1.group#=t2.group# order by 1,2;

   THREAD#     GROUP# MEMBER							   T2.BYTES/1024/1024
---------- ---------- ------------------------------------------------------------ ------------------
	 1	    1 +DATA/mesdb/onlinelog/group_1.257.1034181431				  200
	 1	    2 +DATA/mesdb/onlinelog/group_2.258.1034181431				  200
	 1	    5 +DATA/mesdb/onlinelog/group_5.268.1034182623				  200
	 1	    7 +DATA/mesdb/onlinelog/group_7.270.1034182623				  200
	 1	    9 +DATA/mesdb/onlinelog/group_9.272.1034182623				  200
	 1	   11 +DATA/mesdb/onlinelog/group_11.274.1034182623				  200
	 1	   13 +DATA/mesdb/onlinelog/group_13.276.1034182625				  200
	 2	    3 +DATA/mesdb/onlinelog/group_3.265.1034182261				  200
	 2	    4 +DATA/mesdb/onlinelog/group_4.266.1034182263				  200
	 2	    6 +DATA/mesdb/onlinelog/group_6.269.1034182623				  200
	 2	    8 +DATA/mesdb/onlinelog/group_8.271.1034182623				  200
	 2	   10 +DATA/mesdb/onlinelog/group_10.273.1034182623				  200
	 2	   12 +DATA/mesdb/onlinelog/group_12.275.1034182623				  200
	 2	   14 +DATA/mesdb/onlinelog/group_14.277.1034182627				  200

14 rows selected.
```
**需要注意：**
> - stanby log日志大小至少要和redo log日志一样大小，不能小于
> - stanby log数量： standby logfile=(1+logfile组数)=(1+2)=3组,每个thread需要加3组standby logfile.
> - thread要与redo log保持一致，如果是rac，需要增加多个thread对应的standby log

关闭备库同步进程：
```sql
alter database recover managed standby database cancel;
```

**备库添加standby redo log：**
```sql
ALTER DATABASE ADD STANDBY LOGFILE thread 1 
group 21 ('/data/MESSTB/onlinelog/standby_group_21') SIZE 200M,
group 22 ('/data/MESSTB/onlinelog/standby_group_22') SIZE 200M,
group 23 ('/data/MESSTB/onlinelog/standby_group_23') SIZE 200M,
group 24 ('/data/MESSTB/onlinelog/standby_group_24') SIZE 200M,
group 25 ('/data/MESSTB/onlinelog/standby_group_25') SIZE 200M,
group 26 ('/data/MESSTB/onlinelog/standby_group_26') SIZE 200M,
group 27 ('/data/MESSTB/onlinelog/standby_group_27') SIZE 200M,
group 28 ('/data/MESSTB/onlinelog/standby_group_28') SIZE 200M;

ALTER DATABASE ADD STANDBY LOGFILE thread 2
group 31 ('/data/MESSTB/onlinelog/standby_group_31') SIZE 200M,
group 32 ('/data/MESSTB/onlinelog/standby_group_32') SIZE 200M,
group 33 ('/data/MESSTB/onlinelog/standby_group_33') SIZE 200M,
group 34 ('/data/MESSTB/onlinelog/standby_group_34') SIZE 200M,
group 35 ('/data/MESSTB/onlinelog/standby_group_35') SIZE 200M,
group 36 ('/data/MESSTB/onlinelog/standby_group_36') SIZE 200M,
group 37 ('/data/MESSTB/onlinelog/standby_group_37') SIZE 200M,
group 38 ('/data/MESSTB/onlinelog/standby_group_38') SIZE 200M;
```

**重启开启备库同步进程：**

```sql
alter database open read only;
alter database recover managed standby database using current logfile disconnect from session;
```

**检查日志同步情况：**

```sql
set line222
set pagesize1000
col member for a60
select t2.thread#,t1.group#,t1.member,t2.STATUS,t2.ARCHIVED,t2.bytes/1024/1024 from v$logfile t1,v$standby_log t2 where t1.group#=t2.group# order by 1,2;
```
![](https://img-blog.csdnimg.cn/844803be562d48cabd274024f6656f51.png)
```sql
select process,group#,thread#,sequence# from v$managed_standby;
```
![](https://img-blog.csdnimg.cn/74191ebe7e754e99b486469c3cb4333a.png)
```sql
select database_role,open_mode from v$database;
```
![](https://img-blog.csdnimg.cn/89f026d647db45909a80bb05ae06a0e2.png)
**至此，ADG 已经转换完成！**

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️