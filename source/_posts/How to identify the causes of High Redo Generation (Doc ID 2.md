---
title: How to identify the causes of High Redo Generation (Doc ID 2265722.1)	
date: 2022-03-02 10:03:47
tags: [oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/336508
---

@[TOC](In this Document)

## APPLIES TO:

Oracle Database - Enterprise Edition - Version 9.2.0.1 and later  
Oracle Database Exadata Cloud Machine - Version N/A and later  
Oracle Cloud Infrastructure - Database Service - Version N/A and later  
Oracle Database Cloud Exadata Service - Version N/A and later  
Oracle Database Exadata Express Cloud Service - Version N/A and later  
Information in this document applies to any platform.  

## PURPOSE

 Purpose of this document is to show how to identify the causes of excessive redo generation and what we can do to mitigate the problem

## TROUBLESHOOTING STEPS

 First of all, we need to remark that high redo generation is always a consequence of certain activity in the database and it is expected behavior, oracle is optimized for redo generation and there are no bugs regarding the issue.  
The main cause of high redo generation is usually a high DML activity during a certain period of time and it’s a good practice to first examine modifications on either database level (parameters, any maintenance operations,…) and application level (deployment of new application, modification in the code, increase in the users,..).

What we need to examine:

1. Is supplemental logging enabled? The amount of redo generated when supplemental logging is enabled is quite high when compared to when supplemental logging is disabled. 

What Causes High Redo When Supplemental Logging is Enabled (Doc ID 1349037.1)

2. Are a lot of indexes being used?, reducing the number of indexes or using the attribute NOLOGGING will reduce the redo considerably

3. Are all the operation really in need of the use of LOGGING? From application we can reduce redo by making use of the clause NOLOGGING. Note that only the following operations can make use of NOLOGGING mode:

- direct load (SQL\*Loader)  
- direct-load INSERT  
- CREATE TABLE ... AS SELECT  
- CREATE INDEX  
- ALTER TABLE ... MOVE PARTITION  
- ALTER TABLE ... SPLIT PARTITION  
- ALTER INDEX ... SPLIT PARTITION  
- ALTER INDEX ... REBUILD  
- ALTER INDEX ... REBUILD PARTITION  
- INSERT, UPDATE, and DELETE on LOBs in NOCACHE NOLOGGING mode stored out of line

To confirm if the table or index has "NOLOGGING" set.

Issue the following statement.

select table_name,logging from all_tables where table_name = <table name>;  
-or-  
select table_name,logging from all_indexes where index_name = <index name>;

4. Do tables have triggers that might cause some indirect DML on other tables?

5. Is Auditing enabled the contributor for this excessive redo generation?

6. Are tablespaces in hot backup mode?

7. Examine the log switches:
```sql
select lg.group#,lg.bytes/1024/1024 mb, lg.status, lg.archived,lf.member  
from v$logfile lf, v$log lg where lg.group# = lf.group# order by 1, 2;
```
```sql
select to_char(first_time,'YYYY-MON-DD') "Date", to_char(first_time,'DY') day,  
to_char(sum(decode(to_char(first_time,'HH24'),'00',1,0)),'999') "00",  
to_char(sum(decode(to_char(first_time,'HH24'),'01',1,0)),'999') "01",  
to_char(sum(decode(to_char(first_time,'HH24'),'02',1,0)),'999') "02",  
to_char(sum(decode(to_char(first_time,'HH24'),'03',1,0)),'999') "03",  
to_char(sum(decode(to_char(first_time,'HH24'),'04',1,0)),'999') "04",  
to_char(sum(decode(to_char(first_time,'HH24'),'05',1,0)),'999') "05",  
to_char(sum(decode(to_char(first_time,'HH24'),'06',1,0)),'999') "06",  
to_char(sum(decode(to_char(first_time,'HH24'),'07',1,0)),'999') "07",  
to_char(sum(decode(to_char(first_time,'HH24'),'08',1,0)),'999') "08",  
to_char(sum(decode(to_char(first_time,'HH24'),'09',1,0)),'999') "09",  
to_char(sum(decode(to_char(first_time,'HH24'),'10',1,0)),'999') "10",  
to_char(sum(decode(to_char(first_time,'HH24'),'11',1,0)),'999') "11",  
to_char(sum(decode(to_char(first_time,'HH24'),'12',1,0)),'999') "12",  
to_char(sum(decode(to_char(first_time,'HH24'),'13',1,0)),'999') "13",  
to_char(sum(decode(to_char(first_time,'HH24'),'14',1,0)),'999') "14",  
to_char(sum(decode(to_char(first_time,'HH24'),'15',1,0)),'999') "15",  
to_char(sum(decode(to_char(first_time,'HH24'),'16',1,0)),'999') "16",  
to_char(sum(decode(to_char(first_time,'HH24'),'17',1,0)),'999') "17",  
to_char(sum(decode(to_char(first_time,'HH24'),'18',1,0)),'999') "18",  
to_char(sum(decode(to_char(first_time,'HH24'),'19',1,0)),'999') "19",  
to_char(sum(decode(to_char(first_time,'HH24'),'20',1,0)),'999') "20",  
to_char(sum(decode(to_char(first_time,'HH24'),'21',1,0)),'999') "21",  
to_char(sum(decode(to_char(first_time,'HH24'),'22',1,0)),'999') "22",  
to_char(sum(decode(to_char(first_time,'HH24'),'23',1,0)),'999') "23" ,  
count(*) Total from v$log_history group by to_char(first_time,'YYYY-MON-DD'), to_char(first_time,'DY')  
order by to_date(to_char(first_time,'YYYY-MON-DD'),'YYYY-MON-DD')
```
This will give us an idea of the times when the high peaks of redo are happening

8. Examine AWR report:

Next step will be examining the AWR from the hour where we have had the highest number of log switches, and confirm with the redo size that these log switches are actually caused by a lot of redo generation.  
In the AWR we can also see the sql with most of the gets/executions to have an idea of the activity that is happening in the database and generating redo and we can also see the segments with the biggest number of block changes and the sessions performing these changes.  
Another way to find these sessions is described in SQL: How to Find Sessions Generating Lots of Redo or Archive logs (Doc ID 167492.1)

To find these segments we can also use queries:
```sql
SELECT to_char(begin_interval_time,'YY-MM-DD HH24') snap_time,  
dhso.object_name,  
sum(db_block_changes_delta) BLOCK_CHANGED  
FROM dba_hist_seg_stat dhss,  
dba_hist_seg_stat_obj dhso,  
dba_hist_snapshot dhs  
WHERE dhs.snap_id = dhss.snap_id  
AND dhs.instance_number = dhss.instance_number  
AND dhss.obj# = dhso.obj#  
AND dhss.dataobj# = dhso.dataobj#  
AND begin_interval_time BETWEEN to_date('11-01-28 13:00','YY-MM-DD HH24:MI') <<<<<<<<<<<< Need to modify the time as per the above query where more redo log switch happened (keep it for 1 hour)  
AND to_date('11-01-28 14:00','YY-MM-DD HH24:MI') <<<<<<<<<<<< Need to modify the time as per the above query where more redo log switch happened (interval shld be only 1 hour)  
GROUP BY to_char(begin_interval_time,'YY-MM-DD HH24'),  
dhso.object_name  
HAVING sum(db_block_changes_delta) > 0  
ORDER BY sum(db_block_changes_delta) desc ;

-- Then : What SQL was causing redo log generation :

SELECT to_char(begin_interval_time,'YYYY_MM_DD HH24') WHEN,  
dbms_lob.substr(sql_text,4000,1) SQL,  
dhss.instance_number INST_ID,  
dhss.sql_id,  
executions_delta exec_delta,  
rows_processed_delta rows_proc_delta  
FROM dba_hist_sqlstat dhss,  
dba_hist_snapshot dhs,  
dba_hist_sqltext dhst  
WHERE upper(dhst.sql_text) LIKE '%<segment_name>%' >>>>>>>>>>>>>>>>>> Update the segment name as per the result of previous query result  
AND ltrim(upper(dhst.sql_text)) NOT LIKE 'SELECT%'  
AND dhss.snap_id=dhs.snap_id  
AND dhss.instance_number=dhs.instance_number  
AND dhss.sql_id=dhst.sql_id  
AND begin_interval_time BETWEEN to_date('11-01-28 13:00','YY-MM-DD HH24:MI') >>>>>>>>>>>> Update time frame as required  
AND to_date('11-01-28 14:00','YY-MM-DD HH24:MI') >>>>>>>>>>>> Update time frame as required
```
9. Finally, to troubleshoot further the issue and know the exact commands are being recorded at that particular time frame we can use log miner and mine the archivelog from the concerned time frame. We can look on v$archived_log and find the archived log generated at that particular time frame.  
How To Determine The Cause Of Lots Of Redo Generation Using LogMiner (Doc ID 300395.1)

## REFERENCES
[NOTE:782935.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=2265722.1&id=782935.1) - Troubleshooting High Redo Generation Issues  
[NOTE:1504755.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=2265722.1&id=1504755.1) - Simple Steps to use Log Miner for finding high redo log generation  
[NOTE:167492.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=2265722.1&id=167492.1) - SQL: How to Find Sessions Generating Lots of Redo or Archive logs