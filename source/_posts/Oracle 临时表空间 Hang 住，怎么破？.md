---
title: Oracle 临时表空间 Hang 住，怎么破？
date: 2026-01-25 16:20:22
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2014272232730746880
---

前几天，一位群友遇到一个问题并紧急求助：他在为 Oracle RAC 数据库更换临时表空间时，执行 `DROP TABLESPACE` 命令后，会话完全 **Hang** 住。接手分析后，我发现根源在于仍有大量会话占用着旧临时表空间的临时段，以下是我完整的排障过程与思考，希望能为大家提供一个参考。

先介绍一下问题背景：一套 Oracle RAC 数据库面临存储压力，+DATA 磁盘组空间不足 50GB，且存储无剩余空间。并且归档日志存放在独立的 `+ARCH` 磁盘组，无法通过清理归档释放空间，故只能通过清理 `+DATA` 中约 500GB 的临时表空间来释放容量。

首先，检查了一下临时表空间的使用率：

```bash
select  df.tablespace_name "Tablespace",
       df.totalspace "Total(MB)",
       nvl(FS.UsedSpace, 0)  "Used(MB)",
       (df.totalspace - nvl(FS.UsedSpace, 0)) "Free(MB)",
       round(100 * (1-( nvl(fs.UsedSpace, 0) / df.totalspace)), 2) "Pct. Free(%)"
FROM  (SELECT tablespace_name, round(SUM(bytes) / 1048576) TotalSpace
        FROM   dba_TEMP_files
        GROUP  BY tablespace_name) df,
       (SELECT tablespace_name, ROUND(SUM(bytes_used) / 1024 / 1024)  UsedSpace
        FROM   gV$temp_extent_pool
        GROUP  BY tablespace_name) fs  WHERE  df.tablespace_name = fs.tablespace_name(+);
```

发现使用率并不高，只有 1% 左右，起初群友打算直接删除部分临时表空间文件进行释放：

```bash
alter tablespace TEMP drop tempfile 14;
alter tablespace TEMP drop tempfile 15;
alter tablespace TEMP drop tempfile 16;
alter tablespace TEMP drop tempfile 17;
alter tablespace TEMP drop tempfile 18;
alter tablespace TEMP drop tempfile 19;
alter tablespace TEMP drop tempfile 20;
```

执行后发现临时文件并没有被删除，只是变成了 `OFFLINE` 状态。所以，打算直接更换临时表空间：

```bash
create temporary tablespace TEMP1 tempfile '+DATA' size 1G autoextend on;
alter database default temporary tablespace temp1;
drop tablespace temp including contents and datafiles;
```

到这一步，Drop 命令 HANG 住了，执行了很久都没有结束。

接手后，我检查了一下临时表空间的使用情况：

```bash
## 临时表空间使用情况
SQL> SELECT
    username,
    session_num,
    sql_id,
    tablespace,
    contents,
    segtype,
    segfile#,
    segblk#,
    extents,
    blocks
FROM
    gv$tempseg_usage;
```

发现有很多会话还占用了旧临时表空间 TEMP，所以无法删除 TEMP 表空间 HANG 住是正常现象。

我打算先将占用 TEMP 表空间的 `INACTIVE` 会话都杀掉：

```bash
select 'alter system kill session ''' || s.sid || ',' || s.serial# || ''' immediate;' as kill_sql
from v$sort_usage u
join v$session s on u.session_addr = s.saddr
where s.status = 'INACTIVE'
and u.tablespace = 'TEMP';
```

再查看剩余占用 TEMP 的 `ACTIVE` 会话，发现这些会话都在执行一些 `SELECT` 语句：

```bash
select s.sid,
       s.serial#,
       s.username,
       s.program,
       s.status,
       u.tablespace,
       u.blocks*8/1024 mb
from v$sort_usage u
join v$session s on u.session_addr = s.saddr
where s.status = 'ACTIVE'
and u.tablespace = 'TEMP'
order by mb desc;
```

跟业务沟通之后，确认可以杀掉这些会话：

```bash
select distinct
       'alter system kill session ''' || s.sid || ',' || s.serial# || ',@' || s.inst_id || ''' immediate;' as kill_sql
from   gv$tempseg_usage u
join   gv$session s
       on s.inst_id = u.inst_id
      and s.saddr   = u.session_addr
where  u.tablespace = 'TEMP'
order  by 1;
```

接着将所有占用 TEMP 的会话都杀掉，TEMP 临时表空间被成功 Drop。

继续切换为 TEMP 表空间：

```bash
create temporary tablespace TEMP tempfile '+DATA' size 1G autoextend on;
alter database default temporary tablespace temp;
drop tablespace temp1 including contents and datafiles;

## 根据实际需求多增加一些临时表空间文件
alter tablespace TEMP add tempfile '+DATA' size 8G autoextend on;
```

按照上述步骤将占用 TEMP1 的会话都杀掉，临时表空间成功更换，空出 350G 空间，问题解决。

本次排障虽告成功，但其暴露出的运维风险不容忽视。数据库运维，本质上是与状态和依赖打交道。临时表空间的操作，就是一个经典的例子——**它考验的不仅是我们对命令的熟悉程度，更是对数据库内部状态机的深刻理解，以及严谨的流程意识**。希望这个完整的案例，能帮助大家在未来的运维工作中，既敢下刀，又下对刀。
