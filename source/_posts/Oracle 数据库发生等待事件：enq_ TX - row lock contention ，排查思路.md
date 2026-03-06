---
title: Oracle 数据库发生等待事件：enq: TX - row lock contention ，排查思路
date: 2021-08-21 14:27:50
tags: [oracle,dba,故障处理]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/101821
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

# 前言

最近看 awr 报告时，经常会看到一些 `enq: TX - row lock contention` 的等待事件，所以简单研究一下如何排查，仅为个人所见，如有异议或者修正还请评论指出，谢谢！

**通常，产生enq: TX - row lock contention事件的原因有以下几种可能：**
- 不同的session更新或删除同一条记录；
- 唯一索引有重复索引；
- 位图索引同时被更新或同时并发的向位图索引字段上插入相同字段值；
- 并发的对同一个数据块上的数据进行update操作；
- 等待索引块完成分裂；


# 现象

应用反馈系统使用存在延时，需要排查情况。查看监控服务器，发现数据库存在 `enq: TX - row lock contention` 锁的情况。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-c8460690-9d1b-451d-951f-d27c8f8d9347.png)

# 排查

首先确认发生问题的时间段，然后抓取问题时间段的报告来分析。

## AWR 报告

执行 `sqlplus / as sysdba @?/rdbms/admin/awrrpt.sql` 输入对应时间段的信息，获取 awr 报告。

### Top 10 Foreground Events by Total Wait Time

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-44256278-ae07-42ca-b2cd-b6d6b7d47e50.png)

也可通过 [awrcrt](https://www.modb.pro/download/3563) `sqlplus / as sysdba @awrcrt.sql` 来获取多段性能指标信息：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-df04edd8-03e2-4c8a-bc44-ad878264d291.png)

### Segments by Row Lock Waits

通过观察 awr 报告中段的统计信息章节 `Segments by Row Lock Waits` 项，可以发现发生锁的对象主要是两张表 `A` 和 `B`和 `A` 表的索引：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-0e42c300-5dc7-4383-9ce3-0d1b11bea064.png)

与应用确认后，发现其中一张表 `A` 为核心业务表，暂时怀疑另一张表可能存在问题，这里称之为表 `B`，所以 `A` 表暂且不考虑。

### SQL ordered by Elapsed Time

通过 🔍 搜索关键字，查出 B 表对应的 `UPDATE` 语句，执行较为频繁，先记录待查看：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-624bf6b4-5d65-4c2a-8643-8a583146f509.png)

sql_id 为：`2xb71ufa5wmrh`。

## ASH 报告

抓取对应时间段的 ash 报告，查看是否存在有用信息。

执行 `sqlplus / as sysdba @?/rdbms/admin/ashrpt.sql` 获取报告：

### Top User Events

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-8605b15e-8f83-4d48-96dd-663589beb847.png)

### Top SQL with Top Events

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-c67c530d-b152-4029-9594-0354dae6c94a.png)

### Top Blocking Sessions

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-03f1f6c5-d804-446e-be5b-9ef4561a270f.png)

### Top DB Objects

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-cd4894b6-cd4e-4fb8-ac81-1e790d426e3f.png)

从以上信息，不难看出，与 awr 报告分析出的结果吻合，同样的 sql_id 和 对象，并且获取到了 `blocking sid`。

## ADDMRPT 报告

有时，也可以通过抓取 addmrpt 报告来辅助看一下问题，可能有奇效。

执行 `sqlplus / as sysdba @?/rdbms/admin/addmrpt.sql` 获取 addmrpt 报告：

### Summary of Findings

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-4c062e99-c4cd-4122-a7e9-c4987b6a4bfc.png)

### Finding 2: Row Lock Waits

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-4ab8f7d5-176f-4ee1-a4e9-97283fb6063f.png)

同样都指向了 `B` 表和 sql_id 为 `2xb71ufa5wmrh` 的这条语句。

## 应用确认

经过应用确认，该条 sql 是一张核心业务表的一个触发器发起的，业务表每次新增提交时，会去执行该 sql 更新数据。由于未确认该触发器具体作用，因此无法尝试禁用来观察。


# 写在最后

经过排查，大部分的阻塞都是因为 sql_id 为 `2xb71ufa5wmrh` 的语句导致，具体也可以通过以以下 `sql语句` 来进行查询：

```sql
select DISTINCT b.sql_id,c.blocked_sql_id
  from DBA_HIST_ACTIVE_SESS_HISTORY b,
       (select a.sql_id as blocked_sql_id,
       a.blocking_session,
               a.blocking_session_serial#,
               count(a.blocking_session)
          from DBA_HIST_ACTIVE_SESS_HISTORY a
         where event like '%enq: TX - row lock contention%'
           and snap_id between 18835 and 18836
         group by a.blocking_session, a.blocking_session_serial#,a.sql_id
        having count(a.blocking_session) > 100
         order by 3 desc) c
 where b.session_id = c.blocking_session
   and b.session_serial# = c.blocking_session_serial#
   and b.snap_id between 18835 and 18836;
```

需自行替换对应的快照范围 snap_id 值，查询结果 `sql_id` 为被阻塞，`blocked_sql_id` 为阻塞 ID。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210821-6d6c5c85-651d-42e0-b17e-7eb2965fe2c9.png)

**📢 如有问题，请及时指正，谢谢！**



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

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)
