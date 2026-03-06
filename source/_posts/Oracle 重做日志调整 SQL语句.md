---
title: Oracle 重做日志调整 SQL语句
date: 2021-10-02 20:10:03
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125763
---

Oracle 数据库安装之后，重做日志默认为 3组，如果需要新增删除，可以通过以下方式！

**查询：**
```sql
set line222
col member for a60
select a.group#,b.member member,a.bytes/1024/1024 "size(M)" from v$log a,v$logfile b where a.group#=b.group#;
```

**新增：**

单机数据库：
```sql
alter database add logfile group 4 '/oradata/orcl/redo04.log' size 50M;
alter database add logfile group 5 '/oradata/orcl/redo05.log' size 50M;
alter database add logfile group 16 '/oradata/orcl/redo16.log' size 1024M;
alter database add logfile group 17 '/oradata/orcl/redo17.log' size 1024M;
alter database add logfile group 18 '/oradata/orcl/redo18.log' size 1024M;
```
RAC集群数据库：
```sql
alter database add logfile thread 1 
group 4 '/oradata/orcl/redo04.log' size 50M,
group 5 '/oradata/orcl/redo05.log' size 50M,
group 6 '/oradata/orcl/redo06.log' size 50M;

alter database add logfile thread 2
group 7 '/oradata/orcl/redo07.log' size 50M,
group 8 '/oradata/orcl/redo08.log' size 50M,
group 9 '/oradata/orcl/redo09.log' size 50M;
```

**删除：**
```sql
alter database drop logfile group 16; 
alter database drop logfile group 17; 
alter database drop logfile group 18; 
```
📢 注意：如果当前要删除的 logfile 状态不是 `INACTIVE`，那么删除会报错，需要执行 `ALTER SYSTEM SWITCH LOGFILE;` 来切换日志，直到状态为 `INACTIVE` 才可以删除！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️