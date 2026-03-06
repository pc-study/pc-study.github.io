---
title: 数据同步软件 Shareplex 异常重建详细步骤（Oracle 数据库）
date: 2021-08-25 15:28:56
tags: [shareplex,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/102752
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)



# 前言

最近有客户的 shareplex 因为一些稀奇古怪的原因又挂了，由于邮件告警问题，没有及时通知到，并且归档已经被删除，备份也追溯不回丢失的归档日志。

经过与客户确认repo库没有历史数据需保留，直接重建修复！

# 准备

确认以下条件均已具备：

- 有可用备份；
- 磁盘空间足够；
- 由于使用 networker 备份，需要提前安装备份恢复所需客户端；

本次重建目标端使用 rman 进行全库恢复。

# 重建过程

## 确认数据库大小

```sql
select sum(bytes/1024/1024/1024) from dba_segments;
select sum(bytes/1024/1024/1024) from dba_data_files;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-063880eb-275e-44ca-a00d-6c1c744e5085.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-cc3617fd-28a8-435a-85b5-a18a174de0f3.png)

确认目标端磁盘空间足够！

## 确认备份可用

```sql
--查询备份
set line222
set pagesize100
col status for a10
col input_type for a20
col INPUT_BYTES_DISPLAY for a10
col OUTPUT_BYTES_DISPLAY for a10 
col TIME_TAKEN_DISPLAY for a10

select input_type,
       status,
       to_char(start_time,
               'yyyy-mm-dd hh24:mi:ss'),
       to_char(end_time,
               'yyyy-mm-dd hh24:mi:ss'),
       input_bytes_display,
       output_bytes_display,
       time_taken_display,
       COMPRESSION_RATIO
  from v$rman_backup_job_details
 where start_time > date '2021-08-10'
 order by 3 desc;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-6f73c036-7594-47e9-9091-6c229aa38b3a.png)

```bash
list backup of controlfile;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-c09f8155-1c53-4682-9486-f0724fe91d34.png)

`ctrl_mesdbtj_65271_1_1081487814`

确认最新的有效备份，记录控制文件。

## 安装 networker 客户端

### 安装包上传目标端安装

```bash
lgtoclnt-9.2.1.4-1.x86_64.rpm
lgtonmda-9.2.1.4-1.x86_64.rpm
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-f64bdba7-2ce7-4289-988c-fb8de7aed943.png)

建议使用 `yum install` 进行安装，防止依赖包缺失，前提是 yum 源已配置。

**按顺序安装：**

```bash
yum install -y lgtoclnt-9.2.1.4-1.x86_64.rpm
systemctl start networker
systemctl start networker
yum install -y lgtonmda-9.2.1.4-1.x86_64.rpm
```

`lgtoclnt` 安装完成后，确保服务正常运行，再安装 `lgtonmda`。

### 配置解析

必须将目标端和源端，networker 服务端的ip和主机名解析全部写入 /etc/hosts 文件。

### 目标端链接 NMO 库文件

```bash
cd $ORACLE_HOME/lib
ln –s /usr/lib/libnsrora.so libobk.so
```

至此，networker 目标端已安装完成。

## 清理 shareplex 旧环境

### 源端和目标端关闭 shareplex

```bash
sp_ctrl
shutdown
```

### 源端和目标端执行清理脚本

```bash
/quest/bin/ora_cleansp splex2300/splex2300
/data/quest/bin/ora_cleansp splex2300/splex2300
```

### 源端和目标端重新开启 shareplex 环境

```bash
sp_cop -u2300&
```

本文 shareplex 使用端口为 2300，读者需根据实际情况更换，如 2400、2500 等。

### 目标端停止 post 进程

```bash
stop post
```

最后全部恢复完毕之后再开启。

## 开始 rman 恢复

确保目标端数据库已开启到 nomount 状态。

### 恢复控制文件

连接 rman 客户端后执行恢复控制文件：

```bash
run {
allocate channel c1 type 'SBT_TAPE';
send 'NSR_ENV=(NSR_SERVER=这里填写 networker 服务端主机名,NSR_CLIENT=这里填写源端备份主机名)';
restore controlfile from '这里填写最新备份控制文件名称';
release channel c1;
}
``

恢复完之后开启目标端数据库到 mount 状态。

### 恢复数据

由于数据库大概有 1-2 T 的大小，恢复时间很长，因此建议将恢复脚本放在后台进行执行，脚本如下：

```bash
#!/bin/bash
source ~/.bash_profile
backtime=`date +"20%y%m%d%H%M%S"`
rman target / log=/home/oracle/rman_repo_$backtime.log<<EOF
run {
allocate channel c1 type 'SBT_TAPE';
allocate channel c2 type 'SBT_TAPE';
allocate channel c3 type 'SBT_TAPE';
allocate channel c4 type 'SBT_TAPE';
send 'NSR_ENV=(NSR_SERVER=这里填写 networker 服务端主机名,NSR_CLIENT=这里填写源端备份主机名)';
set newname for database to '/data/mesdb/%b';
restore database;
switch datafile all;
recover database;
release channel c1;
release channel c2;
release channel c3;
release channel c4;
}
exit;
EOF
```

**执行 `sh rman_sp.sh &` 进行后台恢复。**

**📢 注意：** 通道根据实际情况进行修改，由于源端是 rac 环境，目标端是单机环境，因此数据文件路径需要 `set newname` 进行转换，最后执行初次 `recover database`。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-b475f1cd-ea14-4ec6-82ce-fc9c5e6f8a90.png)

备份恢复完之后，由于缺少归档，所以需要追归档。

### 追归档日志

由于备份时间与当前时间存在较大时差，在获取当前源端的 scn 进行 recover 时，必然需要追大量的归档日志文件，为了减少 shareplex 积压，因此提前追归档日志到当前时间。

源端备份归档日志到当前最新：

```bash
backup archivelog from sequence 71457 until sequence 71986 thread 1;
backup archivelog from sequence 65247 until sequence 65780 thread 2;
```

备份成功后拷贝至目标端，注册目录后执行 `recover`：

```bash
catalog start with '/data/archivelog/';
recover database;
```

追完归档之后，激活源端 shareplex 的 config 文件。

### 激活源端 config 配置文件

```bash
list config
activate config ORA_config_20210825 nolock
show config
```

激活成功后，检查源端数据库中是否存在 **长事务**。

```sql
select start_time from gv$transaction;
```

如果有长事务，可以确实是否可以杀掉，杀掉后才能继续操作。

根据以下 SQL 可以获取到事务的详细情况：

```sql
set linesize 260 pagesize 10000
column sess       format a21 heading "SESSION"
column program    format a18
column clnt_pid   format a8
column machine    format a25
column username   format a12
column osuser     format a13
column event      format a32
column waitsec    format 999999
column start_time format a18
column sql_id     format a15
column clnt_user  format a10
column svr_ospid  format a10

ALTER SESSION SET NLS_DATE_FORMAT = 'yyyy/mm/dd hh24:mi:ss';

set feedback off
set echo off

set head off
select chr(9) from dual;
select 'Waiting Transactions'||chr(10)||'====================' from dual;
set head on
select /*+ rule */
       lpad(nvl(s.username,' '),8)||'('||s.sid||','||s.serial#||')' as sess,
       p.spid as svr_ospid,
       nvl(osuser,' ') as clnt_user,
       s.process as clnt_pid,
       substr((case instr(s.PROGRAM, '@')
                 when 0 then
                   s.program
                 else
                   case instr(s.PROGRAM, '(TNS V1-V3)')
                     when 0 then
                       substr(s.program, 1, instr(s.PROGRAM, '@') - 1) || substr(s.program, instr(s.PROGRAM, '(') - 1)
                     else
                       substr(s.program, 1, instr(s.PROGRAM, '@') - 1)
                   end
                                                         end),
              1, 18) as program,
       (case 
            when length(s.MACHINE) > 8 then substr(s.machine,1,8)||'~'
            else s.machine
        end
       ) || '('||nvl(s.client_info, 'Unknown IP')||')' as machine, s.sql_id,
       substr(s.event, 1, 32) as event,
       s.seconds_in_wait      as waitsec
  from v$transaction t,v$session s,v$process p
 where t.ses_addr=s.saddr and s.paddr=p.addr
 order by s.seconds_in_wait, s.program, s.machine;
```
可以通过 `SESSION` 字段来杀掉事务：

```sql
alter system kill session '1841,44697';
```

如果杀不掉，则使用 `svr_ospid` 系统层进行 kill：

```bash
kill -9 27353
```

确认没有长事务后，继续下一步操作。

### 源端获取 scn 号

```
col current_scn format 9999999999999999
select current_scn from v$database;
```
记录获取到的 SCN 号：`72863106548`。

### 目标端 rman 恢复至指定 scn

```bash
recover database until scn 72863106548;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-c4714c0a-fdcf-467a-9600-5ce4262bc2aa.png)

因为源端一直在运行，激活期间到SCN号必然会有新的归档产生，提示缺少归档日志，因此需要去源端拷贝缺少的归档日志，再次进行 recover。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-a136d7e0-77e1-42d2-921d-6ac2337b13b2.png)

### 目标端开启 resetlogs 状态

```sql
alter database open resetlogs;
```

确认 recover 完成恢复之后，基本恢复结束，可以开启目标端到 resetlogs 状态。

## rman 恢复后收尾

### 目标端 reconcile 至指定SCN号

```bash
reconcile queue q1 for o.mesdb2-o.mesdb scn 72863106548
reconcile queue q2 for o.mesdb2-o.mesdb scn 72863106548
reconcile queue q3 for o.mesdb2-o.mesdb scn 72863106548
reconcile queue q4 for o.mesdb2-o.mesdb scn 72863106548
reconcile queue q5 for o.mesdb2-o.mesdb scn 72863106548
```

非必须操作，如果出现 `hang` 住的情况，需要在源端 shareplex 执行 flush 操作疏通通道：

```bash
flush o.mesdb2 to mes-repo queue q1
flush o.mesdb2 to mes-repo queue q2
flush o.mesdb2 to mes-repo queue q3
flush o.mesdb2 to mes-repo queue q4
flush o.mesdb2 to mes-repo queue q5
```

**📢 注意：** 源端执行过 flush 的通道，目标端 `start post` 之后需要再次执行 `start post queue 指定队列名` ，否则无法开启 post。

### 目标端运行 cleanup.sql 来清空内部表信息

```bash
cd /data/quest/bin/
sqlplus splex用户账号/splex账户密码
@cleanup.sql
```

该步骤用于清理源端 splex 用户相关数据。

### 目标端禁用所有 trigger

```sql
SELECT 'alter trigger ' || owner || '.' || trigger_name || ' disable;'
  from dba_triggers
 where owner in (需要同步的用户);
```

将输出结果复制执行即可！

### 目标端禁用所有约束

```sql
SELECT 'alter table '||owner||'.'||table_name||' disable constraint '||constraint_name||';' from dba_constraints
where constraint_type='R' and owner in (需要同步的用户);
```

将输出结果复制执行即可！

### 禁用job
```sql
alter system set job_queue_processes=0;
```

确保 job 任务不会运行！

### 目标端开启 post 进程

```bash
sp_ctrl
start post
```

确保所有队列均已处于正常 running 状态。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-5588e5d4-b4cf-46c7-89eb-66bd97389198.png)

由于目标端执行 reconcile 时 2，4 队列 `hang` 住，因此需要单独 `start post queue 指定队列名` 来开启：

```bash
start post queue q2
start post queue q4
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210825-5ea3ba13-6cf1-463c-a288-2390c1bad81c.png)

状态已全部正常 running。

## 重建后检查

```bash
qstatus
show post queue q2
show log reverse
```
通过命令查看同步是否正常，以及同步速度是否正常。再次确认邮件告警是否恢复正常。

# 写在最后

shareplex 重建恢复的流程还算复杂，因此需要做好必备的告警措施，防止遇到停止导致问题发生，无法及时补救的情况。

分享两个告警脚本：

1、监控 shareplex 进程是否正常运行：

```bash
#!/bin/bash
if [ -f ~/.bash_profile ];
then
  . ~/.bash_profile
fi
  count=`ps -ef|grep sp_cop|wc -l`
  if [ "${count}" -ne 2 ]; 
    then
      ps -ef|grep sp_cop > /tmp/sp_cop.log
      mail -s "Shareplex sp_cop process shutdown" 邮箱地址 < /tmp/sp_cop.log
  fi

```

2、监控 shareplex 队列是否存在异常：

```bash
#!/bin/bash
if [ -f ~/.bash_profile ];
then
  . ~/.bash_profile
fi
rm -rf /data/quest/error.log
echo "show "|sp_ctrl|grep "Idle"     >> /data/quest/error.log
echo "show "|sp_ctrl|grep "Stopped"  >> /data/quest/error.log

# -s 文件大小非0时为真
if  [ ! -s /data/quest/error.log ]
then
    rm -rf /data/quest/error.log   #文件大小为0 删除
fi

if  [ -s /data/quest/error.log ]
  then
mail -s "Shareplex error" 邮箱地址 < /data/quest/error.log
fi
```

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

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎**点赞+关注**，我会持续分享数据库知识、运维技巧。