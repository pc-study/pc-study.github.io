---
title: 真相大白！DataPump 导入频繁失败的幕后真凶竟然是它。。。
date: 2025-09-05 17:18:41
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1963581462221959168
---

# 前言
最近遇到一个问题，有一套 Oracle 11GR2 数据库，使用数据泵 impdp 进行大数据量导入时遇到异常问题，worker 进程反复被终止并报错 `ORA-00028: your session has been killed`，经过深入分析，终于找到问题原因。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250905-1963874460159717376_395407.png)

本文记录完整的分析排查过程，供后续参考。

# 问题现象
数据泵导入日志显示 worker 进程异常终止，具体错误如下：
```bash
 Starting "SYS"."SYS_IMPORT_FULL_01":  sys/******** AS SYSDBA directory=data_pump_dir dumpfile=lucifer_20250828171754.dmp
  logfile=lucifer_imp_20250902.log table_exists_action=replace

  ORA-39014: One or more workers have prematurely exited.
  ORA-39029: worker 1 with process name "DW00" prematurely terminated
  ORA-31671: Worker process DW00 had an unhandled exception.
  ORA-00028: your session has been killed
  ORA-06512: at "SYS.KUPD$DATA_INT", line 58
  ORA-06512: at "SYS.KUPD$DATA", line 3434
  ORA-06512: at "SYS.KUPW$WORKER", line 16370
  ORA-06512: at "SYS.KUPW$WORKER", line 4549
  ORA-06512: at "SYS.KUPW$WORKER", line 10464
  ORA-06512: at "SYS.KUPW$WORKER", line 1824
  ORA-06512: at line 2
```
Alert 日志显示 worker 进程被异常终止：
```bash
DW01 terminating with fatal err=28, pid=26, wid=2, job LUCIFER.SYS_IMPORT_FULL_02
opidrv aborting process DW01 ospid (58023) as a result of ORA-28
```
`ORA-00028` 错误通常表示会话被外部程序终止，这种情况在数据泵导入中较为罕见。在 MOS 中也未找到相关解决方案：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250904-1963588598876352512_395407.png)

需要进行详细的故障排查。

# 问题分析
## Trace 分析
参考 MOS 文档：[How to Trace Data Pump Using a Logon Trigger (Doc ID 1991279.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=1991279.1)，创建 10046 跟踪触发器来分析数据泵的 DM 和 DW 进程：
```sql
SQL> conn / as sysdba
SQL> CREATE OR REPLACE TRIGGER sys.set_dp_trace
AFTER LOGON ON DATABASE
DECLARE
  v_program v$session.program%TYPE;
BEGIN
  SELECT substr(program, -5, 2) INTO v_program
  FROM v$session WHERE sid = (SELECT DISTINCT sid FROM v$mystat);

  IF v_program = 'DW' or v_program= 'DM' THEN
    EXECUTE IMMEDIATE 'alter session set tracefile_identifier = '||'DPTRC';
    EXECUTE IMMEDIATE 'alter session set statistics_level=ALL';
    EXECUTE IMMEDIATE 'alter session set max_dump_file_size=UNLIMITED';
    EXECUTE IMMEDIATE 'alter session set events ''10046 trace name context forever, level 12''';
  END IF;
END;
/
```
执行数据泵导入并启用跟踪：
```bash
## 创建 parfile for LUCIFER 导入
cat<<-\EOF>/home/oracle/LUCIFER_IMP.par
dumpfile=LUCIFER_EXP%U.DMP
directory=DATA_PUMP_DIR
logfile=LUCIFER_IMP.log
parallel=8
table_exists_action=replace
METRICS=Y
TRACE=480300
EOF

## 执行导入
impdp lucifer/oracle parfile=/home/oracle/LUCIFER_IMP.par
```
Trace 参数也可以根据以下值进行配置：
```bash
Trace   DM   DW  ORA  Lines
  level  trc  trc  trc     in
  (hex) file file file  trace                                         Purpose
------- ---- ---- ---- ------ -----------------------------------------------
  10300    x    x    x  SHDW: To trace the Shadow process (API) (expdp/impdp)
  20300    x    x    x  KUPV: To trace Fixed table
  40300    x    x    x  'div' To trace Process services
  80300    x            KUPM: To trace Master Control Process (MCP)      (DM)
 100300    x    x       KUPF: To trace File Manager
 200300    x    x    x  KUPC: To trace Queue services
 400300         x       KUPW: To trace Worker process(es)                (DW)
 800300         x       KUPD: To trace Data Package
1000300         x       META: To trace Metadata Package
------- 'Bit AND'
1FF0300    x    x    x  'all' To trace all components          (full tracing)         
```
常用跟踪值：
- TRACE=1FF0300 - 全组件跟踪
- TRACE=480300 - 核心组件跟踪（推荐用于调试）
- TRACE=10300 - 仅 Shadow process 跟踪

数据泵导入运行了一段时间后还是报错，跟踪文件显示 worker 进程在 `Streams AQ: enqueue blocked on low memory` 等待事件上停滞：
```bash
WAIT #140098774867664: nam='Streams AQ: enqueue blocked on low memory' ela= 3000069 p1=0 p2=0 p3=0 obj#=408355 tim=1756989768058379
KUPM:20:42:48.058: ORA-39029: worker 5 with process name "DW04" prematurely terminated
KUPM:20:42:48.059: ORA-31671: Worker process DW04 had an unhandled exception.
ORA-00028: your session has been killed
```
猜测是内存不足导致 `DataPump worker` 进程被杀。

## 系统资源检查
检查数据库内存配置：
```sql
SQL> SELECT name, value/1024/1024 as MB FROM v$parameter
WHERE name IN ('memory_target','memory_max_target','sga_target','pga_aggregate_target'); 

NAME											 MB
-------------------------------------------------------------------------------- ----------
sga_target									      14368
memory_target										  0
memory_max_target									  0
pga_aggregate_target								       4784
```
检查内存使用情况：
```sql
SQL> SELECT pool, name, bytes/1024/1024 as MB FROM v$sgastat
WHERE pool IS NOT NULL AND bytes > 10485760
ORDER BY bytes DESC;

-- 结果显示: streams pool 64MB，free memory 63.98MB，几乎完全空闲
POOL         NAME                MB
------------ -------------------------- ----------
......
streams pool free memory        63.9820099
......
streams pool KGH: NO ACCESS         31.992218
......
```
检查 Streams 池状态：
```sql
SQL> SELECT component, current_size/1024/1024 as current_mb,
       min_size/1024/1024 as min_mb,
       max_size/1024/1024 as max_mb
FROM v$memory_dynamic_components
WHERE component LIKE '%stream%' OR component LIKE '%queue%';

COMPONENT                             CURRENT_MB    MIN_MB       MAX_MB
---------------------------------------------------------------- ---------- ---------- ----------
streams pool                                 64         0           64
```
通过以上信息可以发现：`streams pool free memory    63.9820099` 几乎全部空闲，系统资源充足，排除内存不足的可能性。

## 外部进程终止
考虑可能的外部终止原因：
- OOM Killer；
- 系统服务限制；
- 监控程序干预；
- 数据库内部调度任务；

### 资源管理限制
后来怀疑可能是资源管理器限制，检查资源限制情况：
```sql
-- 检查资源管理器是否启用
SQL> SELECT name, value FROM v$parameter WHERE name = 'resource_manager_plan';

NAME			       VALUE
------------------------------ ------------------------------
resource_manager_plan

-- 检查资源限制设置
SQL> SELECT resource_name, current_utilization, max_utilization, limit_value
FROM v$resource_limit
WHERE limit_value != 'UNLIMITED';

RESOURCE_NAME		       CURRENT_UTILIZATION MAX_UTILIZATION LIMIT_VALUE
------------------------------ ------------------- --------------- ----------------------------------------
processes					44		63	 3000
sessions					65		84	 4528
enqueue_locks					98	       127	52780
enqueue_resources				93	       128  UNLIMITED
ges_procs					 0		 0	    0
ges_ress					 0		 0  UNLIMITED
ges_locks					 0		 0  UNLIMITED
ges_cache_ress					 0		 0  UNLIMITED
ges_reg_msgs					 0		 0  UNLIMITED
ges_big_msgs					 0		 0  UNLIMITED
ges_rsv_msgs					 0		 0	    0
gcs_resources					 0		 0  UNLIMITED
gcs_shadows					 0		 0  UNLIMITED
smartio_overhead_memory 			 0		 0  UNLIMITED
smartio_buffer_memory				 0		 0  UNLIMITED
smartio_metadata_memory 			 0		 0  UNLIMITED
smartio_sessions				 0		 0  UNLIMITED
dml_locks					 9		38  UNLIMITED
temporary_table_locks				 0	       101  UNLIMITED
transactions					14		15  UNLIMITED
branches					 1		 1  UNLIMITED
cmtcallbk					 4		13  UNLIMITED
max_rollback_segments				12		12	65535
sort_segment_locks				16		22  UNLIMITED
k2q_locks					 0		 0  UNLIMITED
max_shared_servers				 1		 1  UNLIMITED
parallel_max_servers				 0		16	 3600
```
查看 profile 限制：
```sql
SQL> select username,profile from dba_users where username='LUCIFER';

USERNAME		       PROFILE
------------------------------ ------------------------------
LUCIFER			       DEFAULT

SQL> select * from dba_profiles;

PROFILE 		       RESOURCE_NAME			RESOURCE LIMIT
------------------------------ -------------------------------- -------- ----------------------------------------
DEFAULT 		       COMPOSITE_LIMIT			KERNEL	 UNLIMITED
DEFAULT 		       SESSIONS_PER_USER		KERNEL	 UNLIMITED
DEFAULT 		       CPU_PER_SESSION			KERNEL	 UNLIMITED
DEFAULT 		       CPU_PER_CALL			KERNEL	 UNLIMITED
DEFAULT 		       LOGICAL_READS_PER_SESSION	KERNEL	 UNLIMITED
DEFAULT 		       LOGICAL_READS_PER_CALL		KERNEL	 UNLIMITED
DEFAULT 		       IDLE_TIME			KERNEL	 UNLIMITED
DEFAULT 		       CONNECT_TIME			KERNEL	 UNLIMITED
DEFAULT 		       PRIVATE_SGA			KERNEL	 UNLIMITED
DEFAULT 		       FAILED_LOGIN_ATTEMPTS		PASSWORD UNLIMITED
DEFAULT 		       PASSWORD_LIFE_TIME		PASSWORD UNLIMITED
DEFAULT 		       PASSWORD_REUSE_TIME		PASSWORD UNLIMITED
DEFAULT 		       PASSWORD_REUSE_MAX		PASSWORD UNLIMITED
DEFAULT 		       PASSWORD_VERIFY_FUNCTION 	PASSWORD NULL
DEFAULT 		       PASSWORD_LOCK_TIME		PASSWORD 1
DEFAULT 		       PASSWORD_GRACE_TIME		PASSWORD 7
```
没有任何资源限制问题。

### 检查数据库JOB
之前其实一直没往这方面想，一直怀疑是 Oracle 的 BUG 导致，有没有可能进程真是被什么 job 给 kill 了？

检查数据库调度任务：
```sql
SQL> SELECT job, what, last_date, last_sec, next_date, next_sec, broken
FROM dba_jobs
WHERE what LIKE '%kill%' OR what LIKE '%terminate%';

       JOB WHAT 												LAST_DATE	    LAST_SEC			     NEXT_DATE		 NEXT_SEC			  B
---------- ---------------------------------------------------------------------------------------------------- ------------------- -------------------------------- ------------------- -------------------------------- -
	24 proc_killsession;											2025/09/05 13:19:20 13:19:20			     4000/01/01 00:00:00 00:00:00			  N

-- 检查调度器任务
SQL> SELECT job_name, job_action, enabled, state, last_start_date, next_run_date
FROM dba_scheduler_jobs
WHERE job_action LIKE '%kill%' OR job_action LIKE '%terminate%';

no rows selected
```
发现有一个 Job 每分钟执行一次 proc_killsession 存储过程：
- JOB 24 每分钟执行一次 (13:11:20 -> 13:12:20)；
- 最后执行时间: 2025/09/05 13:11:20；
- 作业状态: N (未 broken，正在正常运行)；

这很可能就是杀死 DataPump 进程的罪魁祸首！立即查看 `proc_killsession` 存储过程的代码：
```sql
SQL> SELECT text
FROM dba_source
WHERE name = 'PROC_KILLSESSION'
ORDER BY owner, line;

TEXT
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
PROCEDURE     proc_killsession
AS
v_sid	       NUMBER := 0;
v_serial       NUMBER := 0;
v_sql	       VARCHAR2(2000);
v_record_time  VARCHAR2(19) := to_char(sysdate,'yyyy-mm-dd hh24:mi:ss');
v_object_name  VARCHAR2(30);
CURSOR block_session_list IS
    SELECT s1.sid, s1.serial#, ao.object_name
    FROM v$session s1, v$session s2, all_objects ao
    WHERE s1.sid = s2.final_blocking_session
      AND s2.blocking_session IS NOT NULL
      AND s2.blocking_session_status = 'VALID'
      AND s2.state = 'WAITING'
      AND s2.row_wait_obj# = ao.object_id
      AND s2.last_call_et > 60;
BEGIN
    INSERT INTO block_event
    SELECT v_record_time record_time,
	   to_char(s1.logon_time, 'yyyy-mm-dd hh24:mi:ss') logon_time,
	   nvl(to_char(t.start_date, 'yyyy-mm-dd hh24:mi:ss'),'~') start_time,
	   s1.username||'@'||s1.machine||'('||s1.client_info||') '||s1.program||' '||s1.action
	   ||' (sid='||s1.sid||' serial#='||s1.serial#||' sql_id='||s1.sql_id||' | prev_sql_id='||s1.prev_sql_id||')' blocker,
	   s2.username||'@'||s2.machine||'('||s2.client_info||') '||s2.program||' '||s2.action
	   ||' (sid='||s2.sid||' serial#='||s2.serial#||' sql_id='||s2.sql_id||')' blocked,
	   q1.sql_text blocking_text, q2.sql_text blocked_text,
	   l1.lmode lock_mode, l2.request request_mode, l1.ctime CTIME1,l2.ctime CTIME2,
	   s1.event blocking_event,s2.event blocked_event,ao.owner||'.'||ao.object_name object_name,
	   DBMS_ROWID.rowid_create(1, ao.data_object_id, s2.row_wait_file#, s2.row_wait_block#, s2.row_wait_row#) BLOCKED_ROWID,
	   s2.final_blocking_session final_blocking_session
    FROM v$lock l1, v$session s1, v$lock l2, v$session s2, v$locked_object lo, all_objects ao, v$transaction T, v$sql q1, v$sql q2
    WHERE s1.sid=l1.sid AND s2.sid=l2.sid
      AND s2.last_call_et > 60
      AND l1.block=1 AND l2.request>0
      AND l1.id1=l2.id1 AND l1.id2=l2.id2
      AND s1.sid=lo.session_id
      AND lo.object_id=ao.object_id
      AND hextoraw(s1.saddr) = hextoraw(t.ses_addr(+))
      AND q2.sql_id = s2.sql_id
--	AND ao.owner='LUCIFER'
      AND q1.sql_id IN (s1.sql_id,s1.prev_sql_id);
    COMMIT;
  OPEN block_session_list;
    FETCH block_session_list INTO v_sid,v_serial,v_object_name;
    LOOP
      EXIT WHEN block_session_list%notfound;
      v_sql := 'insert into block_sql select :v_record_time,sql_id,hash_value,sql_fulltext,first_load_time,last_load_time,last_active_time from v$sql
		where upper(sql_text) like ''% '||v_object_name||' %'' AND command_type=6 AND last_active_time > sysdate-10/1440';
      EXECUTE IMMEDIATE v_sql using v_record_time;
      v_sql := 'alter system kill session '''||v_sid||','||v_serial||'''';
      --DBMS_OUTPUT.PUT_LINE(v_sql);
      EXECUTE IMMEDIATE v_sql;
      FETCH block_session_list INTO v_sid,v_serial,v_object_name;
    END LOOP;
  CLOSE block_session_list;
  COMMIT;
  EXCEPTION
    WHEN OTHERS THEN DBMS_OUTPUT.put_line('Error NO:'||SQLCODE);
END proc_killsession;
```
分析了一下这个存储过程的主要功能：
1. 监控阻塞会话：查找造成阻塞的会话（final_blocking_session）
2. 时间条件：s2.last_call_et > 60 - 阻塞超过 60 秒的会话
3. 记录详情：将阻塞信息插入 block_event 表
4. 自动终止：`alter system kill session` - 自动杀死阻塞会话

该存储过程自动识别并终止阻塞时间超过 60 秒的会话。

验证分析结果：
```sql
-- 检查block_event表中的记录，看是否有Data Pump相关的记录
SQL> SELECT * FROM block_event
WHERE record_time >= '2025-09-05 06:30:00'
  AND record_time <= '2025-09-05 06:40:00'
  AND (blocker LIKE '%DW%' OR blocked LIKE '%DW%');

RECORD_TIME	    LOGON_TIME		START_TIME	    BLOCKER			   BLOCKED			  BLOCKING_TEXT 										       BLOCKED_TEXT				          LOCK_MODE REQUEST_MODE	CTIME1	   CTIME2 BLOCKING_EVENT						   BLOCKED_EVENT						    OBJECT_NAME 						  BLOCKED_ROWID      FINAL_BLOCKING_SESSION
------------------- ------------------- ------------------- ------------------------------ ------------------------------ ---------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------- ---------- ------------ ---------- ---------- ---------------------------------------------------------------- ---------------------------------------------------------------- ------------------------------------------------------------- ------------------ ----------------------
2025-09-05 06:33:58 2025-09-04 21:36:02 2025-09-05 06:28:39 IIH@dbtest() oracle@dbtest (DW IIH@dbtest() oracle@dbtest (J0  BEGIN    SYS.KUPW$WORKER.MAIN('SYS_IMPORT_FULL_05', 'IIH', 4719360);  END;			       DELETE FROM BL_CG_IP WHERE DT_SRV > TO_CHAR(SYSDATE,'YYYY-MM-DD') AND ID_SRV = '1001L51000000136P7RS	     6		  3	   319	      120 Datapump dump file I/O					   enq: TM - contention 					    IIH.BL_CG_IP			       AABmyqAAAAAAAAAAAA			  3
							    00) SYS_IMPORT_FULL_05 (sid=3  02)	(sid=2832 serial#=1109 sq												       '
							    serial#=1 sql_id=aa1j28hu26qat l_id=4uwxvrr9q4af3)
							     | prev_sql_id=1at2aksnpg563)

......
......

-- 检查是否有IIH相关的对象被阻塞
SQL> SELECT * FROM block_event
WHERE record_time >= '2025-09-05 06:30:00'
  AND object_name LIKE 'IIH.%';

RECORD_TIME	    LOGON_TIME		START_TIME	    BLOCKER			   BLOCKED			  BLOCKING_TEXT 										       BLOCKED_TEXT				          LOCK_MODE REQUEST_MODE	CTIME1	   CTIME2 BLOCKING_EVENT						   BLOCKED_EVENT						    OBJECT_NAME 						  BLOCKED_ROWID      FINAL_BLOCKING_SESSION
------------------- ------------------- ------------------- ------------------------------ ------------------------------ ---------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------- ---------- ------------ ---------- ---------- ---------------------------------------------------------------- ---------------------------------------------------------------- ------------------------------------------------------------- ------------------ ----------------------
2025-09-05 06:33:58 2025-09-04 21:36:02 2025-09-05 06:28:39 IIH@dbtest() oracle@dbtest (DW IIH@dbtest() oracle@dbtest (J0  BEGIN    SYS.KUPW$WORKER.MAIN('SYS_IMPORT_FULL_05', 'IIH', 4719360);  END;			       DELETE FROM BL_CG_IP WHERE DT_SRV > TO_CHAR(SYSDATE,'YYYY-MM-DD') AND ID_SRV = '1001L51000000136P7RS	     6		  3	   319	      120 Datapump dump file I/O					   enq: TM - contention 					    IIH.BL_CG_IP			       AABmyqAAAAAAAAAAAA			  3
							    00) SYS_IMPORT_FULL_05 (sid=3  02)	(sid=2832 serial#=1109 sq												       '
							    serial#=1 sql_id=aa1j28hu26qat l_id=4uwxvrr9q4af3)
							     | prev_sql_id=1at2aksnpg563)

......
......
```
记录显示：DataPump worker 进程在导入 LUCIFER.Bx_xx_xP 表时被标记为阻塞会话，随后被 proc_killsession 自动终止。

到这里为止，问题总算弄清楚了：
1. DataPump worker 进程在导入过程中持有表级锁；
2. 其他会话(Job 进程)尝试访问相同对象被阻塞超过 60 秒；
3. proc_killsession 将 DataPump 进程误识别为恶意阻塞会话并自动终止；
4. 导致 `ORA-00028: your session has been killed` 错误；

不是系统资源问题，不是内存不足，而是自动阻塞会话清理 Job 程序！**这也太坑了！**

# 解决方案
## 临时解决方案
禁用 Job 运行：
```sql
SQL> BEGIN
  DBMS_JOB.BROKEN(24, TRUE);
END;
/
```
重新执行数据泵导入：
```bash
impdp 'userid="/ as sysdba"' parfile=/home/oracle/LUCIFER_IMP.par
```
等待一段时间后，数据成功导入：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250905-1963854790518124544_395407.png)

导入成功完成后重新启用 Job，并且删除 10046 触发器：
```sql
SQL> BEGIN
  DBMS_JOB.BROKEN(24, FALSE);
END;
/

SQL> DROP TRIGGER SYS.SET_DP_TRACE;
```

## 永久解决方案
优化 proc_killsession 存储过程，排除 DataPump 进程：
```sql
-- 在游标定义中添加排除条件
CURSOR block_session_list IS
    SELECT s1.sid, s1.serial#, ao.object_name
    FROM v$session s1, v$session s2, all_objects ao
    WHERE s1.sid = s2.final_blocking_session
      AND s2.blocking_session IS NOT NULL
      AND s2.blocking_session_status = 'VALID'
      AND s2.state = 'WAITING'
      AND s2.row_wait_obj# = ao.object_id
      AND s2.last_call_et > 60
      -- 排除DataPump相关进程
      AND s1.program NOT LIKE '%DW%'
      AND s1.program NOT LIKE '%MCP%'
      AND s1.module NOT LIKE 'Data Pump%';
-- 其余逻辑保持不变
```
此案例充分说明了数据库故障排查中"现象与根因分离"的典型特征。表面上看是 DataPump 进程异常终止的技术问题，实质上是人为管理策略设计不当导致的运维事故。

# 总结
在数据库运维的道路上，技术问题往往有标准的解决方案，但人为因素导致的问题却更加复杂和隐蔽。这个案例提醒我们，在追求自动化和效率的同时，必须始终保持对系
统安全性和稳定性的敬畏之心。

正如那句老话："工具是把双刃剑"。我们创造的每一个自动化脚本，都可能在某个不经意的时刻，以我们意想不到的方式影响系统运行。因此，谨慎设计、充分测试、持续
监控，应该成为每一位数据库管理员的基本准则。

希望这个案例能够为大家提供有价值的参考，让我们在数据库运维的路上少走弯路，多一些从容与自信。












