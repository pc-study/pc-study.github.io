---
title: Oracle DataGuard 备库配置闪回模式
date: 2021-10-07 14:10:43
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125905
---

Oracle 数据库闪回通常设置在 DataGuard 备库，如果主库误删数据，可用备库闪回至删除点之前，获取丢失数据，然后再自动同步回来！

**注意：** 主库不建议开启闪回，首先影响性能，其次主库不可能为了某些数据去做闪回，所以很鸡肋！

**那么，DataGuard 备库如何开启数据库闪回？**
- 需要有充足的磁盘空间

1、第一步，关闭 DataGuard 备库同步进程
```sql
ALTER DATABASE RECOVER MANAGED STANDBY DATABASE CANCEL; 
```
2、第二步，开启闪回功能
```sql
ALTER DATABASE FLASHBACK ON; 
alter system set db_recovery_file_dest='/oradata/fast_recovery_area' scope=spfile;
alter system set db_recovery_file_dest_size=100G scope=spfile;
```
注意：闪回目录 `/oradata/fast_recovery_area` 需要物理真是存在，设置的闪回区大小即闪回日志占用磁盘空间的上限！

3、第三步，重启备库生效，重新开启备库同步进程
```sql
shutdown immediate
startup mount
ALTER DATABASE RECOVER MANAGED STANDBY DATABASE DISCONNECT FROM SESSION;
```

4、第四步，检查闪回开启情况
```sql
select FLASHBACK_ON from v$database;
show parameter db_recovery_file_dest
show parameter db_recovery_file_dest_size
show parameter db_flashback_retention_target
```

开启闪回后，持续观察 🔎 一段时间，确认 100G 空间能够保留多久的闪回日志，大致推算出需要保存固定时间闪回日志的空间，根据实际情况进行修改！


---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️
