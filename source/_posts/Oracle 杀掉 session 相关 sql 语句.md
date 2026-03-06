---
title: Oracle 杀掉 session 相关 sql 语句
date: 2021-09-25 16:03:31
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/113623
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

**kill某个等待事件对应的spid：**
```sql
set linesize 260 pagesize 10000
select 'kill -9 ' || a.spid
  from v$process a, v$session b
 where a.addr = b.paddr
   and a.background is null
   and b.type = 'USER'
   and b.event like '%' || '&eventname' || '%'
   and b.status = 'ACTIVE';
```
**对应的alter system kill session的语法：**
```sql
set linesize 260 pagesize 1000
col machine for a50
col kill_session for a60;
select machine,
       'alter system kill session ' || ''''||sid|| ',' || serial# ||''''|| 'immediate;' kill_session,
       status
  from v$session
 where type='USER' and event like '%event_name%' and status = 'ACTIVE';
```
**kill某个sql_id对应的spid：**
```sql
set linesize 260 pagesize 10000
select 'kill -9 ' || a.spid
  from v$process a, v$session b
 where a.addr = b.paddr
   and a.background is null
   and b.type = 'USER'
   and b.sql_id = '&sql_id'
   and b.status = 'ACTIVE';
```
**对应的alter system kill session的语法：**
```sql
set linesize 260 pagesize 10000
col machine for a60
select machine,
       'alter system kill session ' || ''''||sid|| ',' || serial# ||''''|| 'immediate;',
       status
  from v$session
 where sql_id = '&sql_id' and type='USER' and status='ACTIVE';
```
**被kill会话的类型：**
```sql
set linesize 260 pagesize 10000
select b.osuser,b.machine,b.program,b.sql_id,b.PREV_SQL_ID,a.spid,to_char(LAST_CALL_ET) as seconds,b.BLOCKING_SESSION,b.BLOCKING_INSTANCE
  from v$process a, v$session b
 where a.addr = b.paddr
   and a.inst_id=b.inst_id
   and a.background is null
   and b.type = 'USER'
   and b.event='&event_name'
   and b.status = 'ACTIVE';
```
**blocking会话类型和kill blocking会话：**
```sql
set linesize 260 pagesize 10000
col machine for a50
col kill_session for a60
SELECT
    blocking_instance,
    blocking_session,
    BLOCKING_SESSION_STATUS,
    FINAL_BLOCKING_INSTANCE,
    FINAL_BLOCKING_SESSION,
    COUNT(*)
FROM
    v$session
WHERE
    upper(event) LIKE '%&cursor%'
GROUP BY
    blocking_instance,
    blocking_session,
    BLOCKING_SESSION_STATUS,
    FINAL_BLOCKING_INSTANCE,
    FINAL_BLOCKING_SESSION
    order by blocking_instance,count(*);
```
**kill blocking会话：**
```sql
select 
       inst_id,
       machine,
       'alter system kill session ' || ''''||sid|| ',' || serial# ||''''|| 'immediate;' kill_session,
       status
  from gv$session a
where a.type='USER' and (a.inst_id,a.sid) in 
(
select 
BLOCKING_INSTANCE,
BLOCKING_SESSION 
from v$session
where upper(event) like '%&cursor%'
)
order by inst_id;
```
**所有含有关键字“LOCAL=NO”的进程是Oracle数据库中远程连接进程的共同特点，因此通过以下命令可以kill掉所有的进程**
```bash
ps -ef|grep -v grep|grep LOCAL=NO|awk '{print $2}'|xargs kill -9
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

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)