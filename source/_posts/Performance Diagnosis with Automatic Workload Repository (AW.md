---
title: Performance Diagnosis with Automatic Workload Repository (AWR) (Doc ID 1674086.1)	
date: 2022-03-01 11:03:46
tags: [oracle,awr]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/336263
---

[TOC](In This Document)

## 1 Purpose
The purpose of this document is to inform the user how to:
- Configure AWR for best results.
- Produce AWR and ASH Reports.
- Interpret AWR and ASH reports.
- Automate or batch the production of AWR reports.
- Obtain more detailed information from the AWR views.
- Avoid performance issues on AWR reports.

Although this document has been written with Oracle E-Business Suite in mind, almost all of it is applicable to other applications (e.g. Oracle Fusion Applications). Where there is instruction or advice specific to Oracle E-Business Suite then this is clearly stated.

## 2 Introduction
From 10g onwards, the Oracle database automatically collects and stores workload information in the Automatic Workload Repository (AWR).

The AWR can be used to identify：
- SQLs or Modules with heavy loads or potential performance issues. These could be from other processes than the one with reported issues.   
- Symptoms of those heavy loads (e.g. logical I/O (buffer gets), Physical I/O, contention, waits).
- SQLs that could be using sub-optimal execution plans (e.g. buffer gets, segment statistics).
- Numbers of executions.
- Parsing issues.
- General performance issues, e.g. system capacity (I/O, memory, CPU), system/DB configuration.
- SGA (shared pool/buffer cache) and PGA sizing advice.

The results are stored in tables and then accessed using the AWR reports.

The AWR stores and reports statistics for each snapshot (identified by snapshot IDs). This is the minimum granularity of time. An AWR report can only report the total of each statistic between two completed snapshots. So the choice of snapshot duration is critical.

For more information see [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) and My Oracle Support documents:
- How to Generate an AWR Report and Create Baselines ([Document 748642.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=748642.1))  
- FAQ: Automatic Workload Repository (AWR) Reports ([Document 1599440.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1599440.1))
### 2.1 Multi-tenant Architecture
The multi-tenant database architecture was introduced starting with Oracle Database 12c Release 1. In the multi-tenant architecture, a container database (CDB) can include multiple pluggable databases (PDBs).

In Oracle Database 12c Release 1, a centralized Automatic Workload Repository (AWR) stores the performance data related to CDB and PDBs in a multi-tenant environment. You can take an AWR snapshot only at a CDB-level, that is, on the CDB root. This AWR snapshot is for the whole database system, that is, it contains the statistical information about the CDB as well as all the PDBs in a multi-tenant environment.

From Oracle Database 12c Release 2 onwards, the CDB root as well as the individual PDBs store, view, and manage AWR data. You can take an AWR snapshot at a CDB-level, that is, on the CDB root, as well as at a PDB-level, that is, on the individual PDBs.

A CDB-level snapshot contains information about the CDB statistics as well as all the PDB statistics, such as ASH, SQL statistics, and file statistics.

A PDB-level snapshot contains the PDB statistics and also some global statistics that can be useful for diagnosing the performance problems related to the PDB.

The AWR_PDB_AUTOFLUSH_ENABLED initialization parameter enables you to specify whether to enable or disable automatic snapshots for all the PDBs in a CDB or for individual PDBs in a CDB. The automatic snapshot operations are enabled by default for a CDB, but are disabled by default for a PDB. To enable automatic snapshots for a PDB, the PDB administrator must connect to that PDB, set the value for the AWR_PDB_AUTOFLUSH_ENABLED parameter to true, and set the snapshot generation interval to a value greater than 0.

For more information see [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF).
## 3 Licensing
AWR data collection is enabled by default and some database features (such as Automatic Segment Advisor and Undo Advisor) use AWR data, without needing additional pack licenses.

However, the Diagnostic Pack License is required to be able to use AWR reports or any of the information from the AWR (or it’s views).

The Diagnostic Pack can only be purchased with the Oracle Database Enterprise Edition (EE). Also with the Enterprise Edition on Engineered Systems (EE-ES) from 12c Release 2 onwards.

From 12c Release 2 the Diagnostic Pack is included in Oracle Database Cloud Service Enterprise Edition (DBCS EE), Oracle Database Cloud Service Enterprise Edition High Performance (DBCS EE-HP), Oracle Database Cloud Service Enterprise Edition Extreme Performance (DBCS EE-EP) and Oracle Database Exadata Cloud Service (ExaCS).

*Note that (on versions where Diagnostic Pack is available) the initialization parameter CONTROL_MANAGEMENT_PACK_ ACCESS should either be set to the value DIAGNOSTIC+TUNING or not be set (the default is DIAGNOSTIC+TUNING).*

See My Oracle Support document "AWR Reporting - Licensing Requirements Clarification ([Document 1490798.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1490798.1))" or [Oracle Database Licensing Information](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_LIC) in the documentation library.
## 4 AWR Snapshot Settings
These should be decided before capturing and using AWR data.

The snapshot interval, retention and the number of SQLs captured for each "Top" criteria can be controlled by using the DBMS_WORKLOAD_REPOSITORY.MODIFY_SNAPSHOT_SETTINGS procedure.

This has 4 arguments. Interval, retention, topnsql and dbid.

If NULL is specified for retention, interval or topnsql then the existing values are preserved.

For more information see [Oracle Database PL/SQL Packages and Types Reference](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PT) and [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) in the documentation library.

#### Interval

This controls how often snapshots are captured (automatically). It is specified in minutes. The minimum is 10 minutes, the maximum is 1 year. The default is 60 minutes (1 hour). If zero is specified then automatic and manual snapshots are disabled.

The interval should be short enough to provide the granularity required.

Normally 1 hour is sufficient, however it may be necessary to analyze the performance for shorter periods. For short programs (or processes of indeterminate length) it is often best to [manually create snapshots](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Man_Snap) just before the program starts and just after it has completed.

*For long running processes made up of many smaller stages, where many of the stages may only take short amounts of time (e.g. 15 minutes), then (provided the overall process is not too long) it can be advisable to have a shorter interval (e.g. 15 minutes, 30 minutes). This is often recommended for upgrades. This will increase the overheads incurred by the AWR, but if they are excessive it is likely that there is a [performance issue with AWR snapshot creation](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Perf).*

#### Retention

This controls how long snapshots are retained in the workload. It is specified in days. The default is 8 days for 11g and above. The minimum is 1 day, the maximum 100 years. If zero is specified then snapshots will be retained forever.

The retention period should be long enough to allow full analysis of the performance issues to be carried out. Quite often the performance analyst will need to run subsequent reports from the AWR (e.g. AWR SQL Reports, ASH, ADDM or querying AWR views directly).

#### Topnsql

This controls the number of Top SQLs to flush into the AWR for each of the "Top" criteria (Elapsed Time, CPU Time etc). This can be set to a numeric value, or DEFAULT, MAXIMUM. The minimum value is 30 and the maximum 50,000. DEFAULT will capture the top 30 (statistics_level=TYPICAL) or the top 100 (statistics_level=ALL). MAXIMUM will capture the complete set of SQL in the cursor cache.

Normally the default will suffice. However, there may be situations where a larger set of SQL needs to be monitored.

*Note that TOPNSQL can be set to a very high value. However, there will be much more data to capture and store; this could cause space or performance issues.*

#### Dbid

This is the database identifier (in AWR). NULL specifies the local database.

#### View DBA_HIST_WR_CONTROL

The values of these arguments can be accessed by querying the view DBA_HIST_WR_CONTROL.

The view sys.wrm$_wr_control gives a little more information.

*Note the meaning of the following values in column sys.wrm$_wr_control.topnsql:*

> *2000000000 = DEFAULT*
> 
> *2000000001 = MAXIMUM*

## 5 AWR Report Threshold Settings

From 11g Release 2 onwards, the amount of information (rows) in an AWR report can be controlled by using the DBMS_WORKLOAD_REPOSITORY.AWR_SET_REPORT_THRESHOLDS procedure.

*Note that this is only at session level. So the procedure needs to be run again for new sessions.*

See My Oracle Support document "How to Control the Number of SQL Statements and other information displayed in AWR Report ([Document 1357637.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1357637.1))"

## 6 Statistics_level

Automatic statistics gathering by the AWR is disabled if the STATISTICS_LEVEL initialization parameter is set to BASIC. So setting STATISTICS_LEVEL to BASIC is not recommended.

Set the STATISTICS_LEVEL parameter to TYPICAL or ALL. The default setting for this parameter is TYPICAL.

*Note that (if STATISTICS_LEVEL=BASIC) AWR statistics can still be captured manually. However, as the collection of many statistics (in-memory) will be disabled, the AWR reports will omit a lot of information (such as segment statistics or memory advice).*

## 7 Manually Creating Snapshots

Sometimes it is necessary to restrict the AWR reports to a specific time interval (that is not coincidental with the automatically created snapshots). In this case snapshots can be created manually by using the DBMS_WORKLOAD_REPOSITORY.CREATE_SNAPSHOT procedure. e.g.
```sql
BEGIN
   DBMS_WORKLOAD_REPOSITORY.CREATE_SNAPSHOT(flush_level => 'ALL');
END;
/
```
*Note: a flush_level of 'ALL' is recommended, the default is 'TYPICAL'. ALL will capture all AWR statistics, TYPICAL will skip some (e.g. SQL statistics, segment statistics, and files and tablespace statistics).*

For more information see [Oracle Database PL/SQL Packages and Types Reference](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PT) and [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) in the documentation library.

Also see [Multi-tenant Architecture](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#MT).

## 8 Identifying Snapshots to Report

The time period that is required or even the Snapshot IDs may already be known.

However, the following SQLs can be used to identify the Snapshot IDs (the AWR reports do help with the choice of Snapshot IDs; they display the time associated with each Snapshot ID from a specified number of previous days).

*Note that the Snapshot ID identifies the time when a snapshot ends. Requesting an AWR Report from Snapshot N to M, will show the activity between the end time for Snapshot N and the end time for Snapshot M.*

For the current database instance:

SELECT s.snap_id,
       TO_CHAR(s.end_interval_time,'DD-MON-YYYY HH24:MI:SS')
FROM dba_hist_snapshot s,
     v$database d,
     v$instance i
WHERE s.dbid = d.dbid
AND s.instance_number = i.instance_number
ORDER BY s.snap_id;

For a specified database instance:

SELECT s.snap_id,
       TO_CHAR(s.end_interval_time,'DD-MON-YYYY HH24:MI:SS')
FROM dba_hist_snapshot s
WHERE s.dbid = *<database_id>*
AND s.instance_number = *<instance_number>*
ORDER BY s.snap_id;

Alternatively, the following SQL can be used to identify the snapshots when a particular SQL was running:

SELECT dhs.sql_id,
       dsn.snap_id-1 begin_snap,
       dsn.snap_id end_snap,
       TO_CHAR(dsn.begin_interval_time,'DD-MON-YYYY HH24:MI:SS') begin_time,
       TO_CHAR(dsn.end_interval_time,'DD-MON-YYYY HH24:MI:SS') end_time,
       ROUND(SUM(dhs.elapsed_time_delta/1000000),0) elapsed_time_secs
FROM dba_hist_sqlstat dhs,
     v$database d,
     v$instance i,
     dba_hist_snapshot dsn
WHERE dhs.dbid = d.dbid
AND dsn.snap_id = dhs.snap_id
AND dsn.dbid = dhs.dbid
AND dhs.con_dbid = d.con_dbid -- From DB 12.1 onwards
AND dsn.instance_number = dhs.instance_number
AND dhs.instance_number = i.instance_number
AND dhs.sql_id = '*<sql_id>*'
GROUP BY dhs.sql_id, dsn.snap_id-1, dsn.snap_id, dsn.begin_interval_time, dsn.end_interval_time
ORDER BY dsn.snap_id;

*Note that from 12c Release 2, in a multi-tenant environment, the DBA_HIST views can also be interchanged with the [AWR_ROOT views and AWR_PDB views](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_ROOTPDB) at the CDB level and the PDB level respectively.*

*These scripts are provided for educational purposes only and not supported by Oracle Support Services.*

## 9 Baselines

AWR baselines are a series of snapshots that are retained for comparison with subsequent snapshots. The subsequent snapshots may be when performance problems have occurred, or they may be used to compare changes in workload. They can be created by using the procedure DBMS_WORKLOAD_REPOSITORY.create_baseline.

They are retained indefinitely and are not purged from the AWR.

AWR Baselines are not normally used for diagnosing specific performance issues, so they are not covered in much detail here.

For more information see:

- [Oracle Database PL/SQL Packages and Types Reference](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PT) and [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) in the documentation library.
    
- My Oracle Support document "Note How to Generate an AWR Report and Create Baselines ([Document 748642.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=748642.1))"

## 10 How to get AWR Report

An AWR report can be generated from SQL\*Plus by running the AWR SQL scripts. These are stored under $ORACLE_HOME/rdbms/admin.

The APPS (Oracle E-Business Suite), SYS or SYSTEM users can be used to generate the reports.

Note that AWR Reports can also be produced from Enterprise Manager / Oracle Enterprise Manager Cloud Control (Cloud Control).

The main scripts available are:

- awrrpt.sql – Produces the AWR report for the current (local) database and instance.
    
- awrrpti.sql - Produces the AWR report for a specified database and instance.
    
- awrgrpt.sql (11g Release 2 and above) - Produces the Global AWR report for all available instances in an Oracle Real Application Clusters (RAC) environment. It does this for the current database.
    
- awrgrpti.sql (11g Release 2 and above) - Produces the Global AWR report for available instances in an Oracle Real Application Clusters (RAC) environment. It does this for a specified database and instances (either one instance, a comma delimited list of some instances or all instances can be chosen).
    

There are other scripts available for comparing periods (e.g. awrddrpt.sql, awrddrpi.sql) – see [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) in the documentation library and My Oracle Support document "Note How to Generate an AWR Report and Create Baselines ([Document 748642.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=748642.1))"

#### *In a Multi-tenant environment*

*CDB-specific AWR reports can be generated from a CDB root using scripts awrrpt.sql/awrgrpt.sql, these show the global system data statistics for the whole multi-tenant environment.*

*PDB-specific AWR reports can be generated from a PDB using scripts awrrpt.sql/awrgrpt.sql, these show the statistics related to that PDB.*

*PDB-specific AWR reports can be generated from a CDB root using scripts awrrpti.sql/ awrgrpti.sql, these shows the statistics related to a specific PDB.*

All the scripts are interactive. Arguments cannot be specified in the command line. See [here](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Automate) for information on automating AWR Reports.

The [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) has more information about the arguments that the AWR reports prompt for, but here is some additional information.

#### (Specify the) Location of AWR Data

From 12c release 2, in a multi-tenant environment , when a report is created at the PDB level, the data location can be specified.

- AWR_ROOT - Use AWR data from root (default)
    
- AWR_PDB - Use AWR data from PDB
    

#### Report Type (html or text)

The HTML format is recommended. It is clearer, easier to read and has complete SQL statements (they are not truncated).

#### Database and Instance

If running for a specified instance (e.g. awrrpti.sql) then the script will list the "Instances in this Workload Repository schema" and prompt for the database id (dbid) and instance number (inst_num).

The current (local) instance will be highlighted with an asterix (\*) at the left hand side of the row.

Choose an instance. This should be the database and instance on which the performance issue has been observed.

If running for specified instances on a RAC environment (e.g. awrgrpti.sql) then the instance can be a comma separated list of instance numbers or "ALL".

#### Begin and End Snapshots

It is advisable to think about the snapshots required before running these scripts. See [Identifying Snapshots to Report](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Identify_Snap) section.

It is usually best to produce AWR reports for every snapshot during the period of the performance issue.

If a performance issue is long running (straddles more than 2 snapshots) then it is very useful to produce a report for the whole period of the performance issue, program or process. Ideally for snapshots covering the period from just before the program/process starts until just after program/process completes.

If a series of successive programs or processes is being reported on (e.g. Upgrade) then produce a separate report for the period that each successive program is running (if possible).

#### Report Name

Specify the report name or enter null for it to default to

> awrrpt_*<instance_number>*_*<begin_snap>*_*<end_snap>*.html

or

> awrrpt_rac_*<begin_snap>_<end_snap>*.html

for the RAC reports (awrgrpt.sql/awrgrpti.sql)

#### RAC

If using an Oracle Real Application Clusters (RAC) environment then provide.

1.  A separate AWR report (awrrpti.sql) for each node (instance) where the performance issue is occurring. If the node (with the performance issue) is not yet determined then report for all nodes.
    
2.  An AWR Global report (awrgrpt.sql / awrgrpti.sql) for all nodes (being used) if on 11g Release 2 or above. This will aggregate the statistics for all nodes and highlight differences between nodes.
    

If a process (such as an upgrade) is being run on one node (instance) only then the awrrpti.sql report for that instance will suffice.

For more information see [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) in the documentation library.

## 11 AWR Report Interpretation

Each section of the AWR report contains useful information. However, the following sections are the ones that are most frequently looked at:

- [Report Header](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_RepHead) – This contains information about the Database and environment. Along with the snapshot IDs and times.
    
- [Report Summary](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_RepSum) - Top N Timed Foreground Events and Host/Instance CPU
    
- [Wait Event Statistics](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_Wait) - Foreground Wait Events and Wait Event Histogram
    
- [SQL Statistics](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_SQLStats) - SQL ordered by Elapsed Time, CPU Time, Gets, Reads (SQL Statistics), Complete List of SQL Text
    
- [Advisory Statistics](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_Advisory) - Buffer Pool Advisory, PGA Memory Advisory, Shared Pool Advisory, SGA Target Advisory
    
- [Enqueue Activity](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_Enqueue)
    
- [Segment Statistics](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_Segment) - Segments by Logical Reads, Physical Reads, Physical Writes, DB Block Changes, Row Lock Waits, ITL Waits, Buffer Busy Waits
    
- [Init.ora Parameters](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_InitOra)
    

### 11.1 Report Header

![Report Header](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:AWR_SECTION_HEAD&clickstream=yes)

This contains information about the Database and environment. Along with the snapshot Ids and times.

### 11.2 Report Summary

#### Top N Timed Foreground Events

![Top N Timed Foreground Events](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:TOP_N_FG_EVENTS&clickstream=yes)

This indicates the most time consuming events. These are either DB CPU or wait events.

*Note that there could be significant waits that are not listed here, so check the Foreground Wait Events (Wait Event Statistics) section for any other time consuming wait events.*

A high level of DB CPU is not usually a reason for concern, unless it is accompanied by a high level of [CPU Usage](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_CPU) or a few SQLs with high CPU Time (and potentially sub-optimal execution plans).

However, the wait events can give us an indication of performance issues. These performance issues could be due to poor execution plans on individual SQLs, which can be resolved by SQL tuning. Or they could be general performance issues that can be resolved by changes to the DB/system configuration or system resources.

The key things to look for are the total time (and percentage) and the average wait for each event.

For the largest waits look at the [Wait Event Histogram](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_WaitHist) to identify the distribution of waits.

A high value of a specific wait does not always have one solution. The wait could have several different causes and solutions. In many cases, the wait could be removed by SQL (or application) tuning and this should be considered first before assuming it is a system configuration or resource issue.

For more information on interpreting the top wait events see the "How to interpret the output? > 3. Understanding AWR and ADDM reports > 3.4 Major top waits" section in My Oracle Support document "Oracle E-Business Suite SQL Tuning Tips for Customers ([Document 2098522.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=2098522.1))".

#### Host/Instance CPU

![Host / Instance CPU](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:HOST_INST_CPU&clickstream=yes)

A high level of DB CPU usage in the Top N Foreground Events (or Instance CPU: %Busy CPU) does not necessarily mean that CPU is a bottleneck.

Look at the Host CPU and Instance CPU sections. The key things to look for are the values "%Idle" in the "Host CPU" section and "%Total CPU" in the "Instance CPU" section.

If the "%Idle" is low and "%Total CPU" is high then the instance could have a bottleneck in CPU (be CPU constrained).

Otherwise, the high DB CPU usage just means that the database is spending a lot of time in CPU (processing) compared to I/O and other events.

In either case (CPU is a bottleneck or not) there could be individual expensive SQLs with high CPU time, which could indicate sub-optimal execution plans, especially if accompanied with high (buffer) gets.

### 11.3 Wait Event Statistics

#### Foreground Wait Events

![Foreground Wait Events](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:FG_EVENTS&clickstream=yes)

This is useful because there could be time consuming report wait events that do not appear in the "Top N Timed Foreground Events".

For the larger waits look at the [Wait Event Histogram](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Interp_WaitHist) to identify the distribution of waits. Are they closely clustered around an average value or are there a wide variance of values ? Are there a large number of smaller waits or a few larger waits ?

Just above this in the AWR there is a "Foreground Wait Class" section. This is of less use. A wait could have multiple possible causes (in different classes) depending on the context. There are normally only a handful of time consuming waits, which can be analyzed and investigated separately.

For more information on interpreting wait events see the "How to interpret the output? > 3. Understanding AWR and ADDM reports > 3.4 Major top waits" section in My Oracle Support document "Oracle E-Business Suite SQL Tuning Tips for Customers ([Document 2098522.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=2098522.1))".

#### Wait Event Histogram

![Wait Event Histogram](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:WAIT_HIST_1&clickstream=yes)

![Wait Event Histogram](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:WAIT_HIST_2&clickstream=yes)

This can be used to determine the distribution of wait times.

*For example, in this case there is a high level of "db file sequential read" waits (21.5%), with an average wait time of 34ms. This is very high. These days less than 5ms is expected and more than 10ms is considered poor.*

*An analysis of the histogram shows a smooth exponential distribution of wait times beyond a minimum service time clustered around 8ms. This indicates that I/O service times could be slow, but that there is also considerable contention (the I/O load is heavy). There could be a number of reasons and solutions for both.*

*Incidentally, the absence of waits below 2ms indicates that there is no caching in storage.*

Similarly an analysis of the histogram can indicate if a high average time is due to a few individual long waits.

#### RAC Wait Events

If the following places in the AWR show high levels of RAC wait events ("gc" wait events) then the RAC configuration may need to be changed.

- Top N Timed Foreground Events , Foreground Wait Events, Wait Event Histogram
    
- SQL ordered by Cluster Wait Time
    
- Segments by Global Cache Buffer Busy
    

See the following My Oracle Support documents for more information:

- RAC: Frequently Asked Questions ([Document 220970.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=220970.1))
    
- RAC and Oracle Clusterware Best Practices and Starter Kit (Platform Independent) ([Document 810394.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=810394.1))
    
- Using Oracle 11g Release 2 Real Application Clusters with Oracle E-Business Suite Release 12 ([Document 823587.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=823587.1))
    
- Troubleshooting gc block lost and Poor Network Performance in a RAC Environment ([Document 563566.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=563566.1))
    

Also see Chapter 13 Monitoring Performance in the "[Real Application Clusters Administration and Deployment Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_RAC)".

### 11.4 SQL Statistics

The most useful sections are SQL ordered by Elapsed Time, CPU Time, Gets and Reads. All the sections can be useful in identifying if a particular SQL from a particular module was running during the AWR report period.

For more information on interpreting the SQL Statistics sections see the

> "What is the challenging SQL? > 2 From Automatic Workload Repository (AWR)"

or

> "How to interpret the output? > 3. Understanding AWR and ADDM reports > 3.5 Top SQLs"

sections in My Oracle Support document "Oracle E-Business Suite SQL Tuning Tips for Customers ([Document 2098522.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=2098522.1))".

#### SQL ordered by Elapsed Time

![SQL ordered by Elapsed Time](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SQL_BY_ELAP&clickstream=yes)

This can be used to identify the long running SQLs that could be responsible for a performance issue. It can give useful information about the CPU time, the number of executions and the (SQL) Module.

The Top SQLs can be matched to long running or slow Processes in the application.

The Elapsed time can indicate if a SQL is multi-threaded (either Parallel DML/SQL or multiple workers). In this case the elapsed time will be multiple times the AWR duration (or the observed clock time of the process/SQL). The elapsed time for multi-threaded SQL will be the total of elapsed time for all workers or parallel child (secondary) processes.

*Note that the "SQL Ordered" sections can often contain the PL/SQL call that contains SQLs. So in this case the procedure WF_ENGINE.BackgroundConcurrent (via procedures Background and ProcessStuckProcess ultimately calls the SQL 1wmz1trqkzhzq).*

#### SQL ordered by CPU Time

![SQL ordered by CPU Time](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SQL_BY_CPU&clickstream=yes)

In most cases this section does not reveal much more information than the "SQL Ordered by Elapsed Time" section. However, it does sort by CPU and can output SQLs that are not in the previous section.

#### SQL ordered by Gets

![SQL ordered by Gets ](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SQL_BY_GETS&clickstream=yes)

A high number of buffer gets is one of the main indicators of SQLs with sub-optimal execution plans.

Bear in mind that the SQL could have a good execution plan and just be doing a lot of work.

#### SQL ordered by Reads

![SQL ordered by Reads](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SQL_BY_READS&clickstream=yes)

If the physical I/O waits (e.g. db file sequential read, db file scattered read, direct path read) are relatively high then this section can indicate which SQLs are responsible.

This section can help identify the SQLs that are responsible for high physical I/O and may indicate sub-optimal execution plans, particularly if the execution plan contains full table scans or large index range scans (where more selective index scans are preferable).

#### Complete List of SQL Text

![Complete List of SQL Text ](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:COMPLETE_LIST_SQL&clickstream=yes)

This shows the complete SQL text for all SQL listed in the "SQL ordered by" sections. The SQL Ids in the "SQL ordered by" sections are hyper links to entries in this list.

### 11.5 Advisory Statistics

*Note that the advisory statistics within this section (MTTR Advisory, Buffer Pool Advisory, PGA Memory Advisory, Shared Pool Advisory, SGA Target Advisory, Streams Pool Advisory, Java Pool Advisory) are all reported for the last snapshot interval only. If the AWR report covers more than one snapshot interval and the last snapshot interval has a lower workload (e.g. the process being observed completes a long time before the end snapshot) then the advisory statistics could underestimate the advised values.*

*Note that when setting SGA and PGA, ensure there is enough remaining space for:*

- *Memory used by database processes. e.g. (maximum PROCESSES) \* 4MB*
    
- *Other databases or applications resident on the same host*
    

#### Buffer Pool Advisory

The My Oracle Support document "How to Read Buffer Cache Advisory Section in AWR and Statspack Reports ([Document 754639.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=754639.1))" gives an excellent explanation of how to read this section.

It can indicate if the buffer cache (or the SGA that contains it) needs to be increased.

Starting at a "Size Factor" of 1 (this indicates the current size of the buffer pool). If the "Physical Read Factor" decreases significantly as the "Size Factor" increases then increasing the buffer cache (SGA Target) will significantly reduce the physical reads and improve performance.

For 10g and above it is recommended to use the sga_target initialization parameter to specify the size of the SGA, so there is no longer a need to specify the size of the buffer cache. The db_cache_size parameter (if specified) defines the minimum size of the default buffer cache.

So the size of Buffer Cache advised here should be added to the advised Shared Pool size and any Large Pool to determine the advised size for the SGA (sga_target). However, there is also an SGA Target Advisory section (see below).

For more information on the recommended initialization parameter values in Oracle E-Business Suite see My Oracle Support documents:

- Database Initialization Parameters for Oracle Applications Release 11i ([Document 216205.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=216205.1))
    
- Database Initialization Parameters for Oracle E-Business Suite Release 12 ([Document 396009.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=396009.1))
    

#### PGA Memory Advisory

The My Oracle Support document "How to Read PGA Memory Advisory Section in AWR and Statspack Reports ([Document 786554.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=786554.1))" gives an excellent explanation of how to read this section.

It can indicate if the PGA (defined by the pga_aggregate_target initialization parameter) needs to be increased.

Starting at a "Size Factor" of 1 (this indicates the current size of the PGA). If the "Estd Extra W/A MB Read/Written to Disk" decreases significantly as the "Size Factor" increases then increasing the PGA will improve performance. The best value to use is a PGA Target at the point where the "Estd Extra W/A MB Read/Written to Disk" stops significantly reducing.

#### Shared Pool Advisory

![Shared Pool Advisory](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:POOL_ADV&clickstream=yes)

It can indicate if the Shared Pool (defined by the shared_pool_size initialization parameter) needs to be increased.

Starting at a "Size Factor" of 1 (this indicates the current size of the shared pool). If the "Est LC Time Saved Factr" increases as the "Size Factor" increases then increasing the shared pool will improve performance.

#### SGA Target Advisory

![SGA Target Advisory](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SGA_ADV&clickstream=yes)

It can indicate if the SGA (defined by the sga_target initialization parameter) needs to be increased.

Starting at a "Size Factor" of 1 (this indicates the current size of the SGA). If the "Est DB Time (s)" decreases significantly as the "Size Factor" increases then increasing the SGA will significantly reduce the physical reads and improve performance.

*Note that the SGA Target Advisory (and Buffer Pool Advisory) may underestimate the performance improvement gained from increasing SGA for situations where there are many workers accessing the same objects at the same time (e.g. AD Parallel jobs (on upgrades), multiple workers (concurrent requests) for batch processes).*

### 11.6 Enqueue Activity

![Enequeue Activity](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:ENQ_ACT&clickstream=yes)

This is in the Wait Statistics section.

This can give some more information for enqueue waits (e.g. Requests, Successful gets, Failed gets), which can give an indication of the percentage of times that an enqueue has to wait and the number of failed gets.

### 11.7 Segment Statistics

For more information on interpreting the SQL Statistics sections see the "How to interpret the output? > 3. Understanding AWR and ADDM reports > 3.6 Top segments" sections in My Oracle Support document "Oracle E-Business Suite SQL Tuning Tips for Customers ([Document 2098522.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=2098522.1))".

*Note that the Segment Statistics section (see below) of the AWR will contain no data if the hidden parameter "_object_statistics" is set to FALSE.*

*If "_object_statistics" is set to FALSE then the object level statistics (logical and physical reads, writes, block changes, locks, ITL etc) will not be gathered. However, the default is "TRUE".*

*See My Oracle Support document ""No data exists for this section of the report" in Segment Statistics Section of AWR Report ([Document 1570007.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1570007.1))".*

#### Segments by Logical Reads

![Segments by Logical Reads ](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SEG_BY_LOG_READ&clickstream=yes)

If a SQL is sub-optimal then this can indicate the tables and indexes where the workload or throwaway occurs and where the performance issue lies. It can be particularly useful if there are no actual statistics elsewhere (e.g. Row Source Operation Counts (STAT lines) in the SQL Trace or no actuals in the SQLT/Display Cursor report).

#### Segments by Physical Reads

![Segments by Physical Reads](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SEG_BY_PHYS_READ&clickstream=yes)

If there are a high number of physical read waits (db file scattered read, db file sequential read and direct path read) then this section can indicate on which segments (tables or indexes) the issue occurs.

This can help identify sub-optimal execution plan lines. It can also help identify changes to tablespace and storage management that will improve performance.

#### Segments by Physical Writes

![Segments by Physical Writes](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SEG_BY_PHYS_WRITE&clickstream=yes)

If there are long running Inserts, Deletes or Updates during the AWR period then this section can help identify those segments (tables or indexes) where most of the workload is occurring.

#### Segments by DB Block Changes

![Segments by DB Block Changes](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SEG_BY_DB_BLOCK&clickstream=yes)

If there are long running Inserts, Deletes or Updates during the AWR period then this section can help identify those segments (tables or indexes) where most of the workload is occurring.

#### Segments by Row Lock Waits

![Segments by Row Lock Waits](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SEG_BY_ROWLOCK&clickstream=yes)

If there is a high level of "enq: TX - row lock contention" waits then this section can identify the segments (tables/indexes) on which they occur.

#### Segments by ITL Waits

![Segments by ITL Waits](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SEG_BY_ITL&clickstream=yes)

If there is a high level of "enq: TX - allocate ITL entry" waits then this section can identify the segments (tables/indexes) on which they occur.

#### Segments by Buffer Busy Waits

![Segments by Buffer Busy Waits](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:SEG_BY_BUFF&clickstream=yes)

If there is a high level of "Buffer Busy Waits" waits then this section can identify the segments (tables/indexes) on which they occur.

### 11.8 Init.ora Parameters

This section can be used to check the values of initialization parameters on the instance. It can also indicate if they have been changed during the AWR period.

For Oracle E-Business Suite any unusual or unexpected values can be checked against My Oracle Support documents:

- Database Initialization Parameters for Oracle Applications Release 11i ([Document 216205.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=216205.1))
    
- Database Initialization Parameters for Oracle E-Business Suite Release 12 ([Document 396009.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=396009.1))
    

Although, it can be easier to use script bde_chk_cbo.sql from My Oracle Support document "EBS initialization parameters - Healthcheck ([Document 174605.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=174605.1))".

For more advice on initilization parameters see the "How to interpret the output? > 3. Understanding AWR and ADDM reports > 3.3 Basic instance configuration" section in My Oracle Support document "Oracle E-Business Suite SQL Tuning Tips for Customers ([Document 2098522.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=2098522.1))".

This gives some advice on the parameters:

- _b_tree_bitmap_plans
- _fast_full_scan_enabled
- _like_with_bind_as_equality
- optimizer_secure_view_merging
- _sort_elimination_cost_ratio
- sga_target
- pga_aggregate_target
- shared_pool_size

## 12 Where Next ?

In some cases [Active Session History (ASH)](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#ASH) reports can be used to give more detailed information on which SQLs, Wait Events, Objects and Row Sources the performance issue occurs.

Analysis of the AWR and ASH reports may lead to one or more of the following conclusions:

- One or more expensive SQLs could have sub-optimal execution plans that require tuning.
    
- The database requires configuration changes. This could simply be initialization parameters that require changing or it could be architectural changes such as partitioning, OATM etc.
    
- Underlying system performance issues that could require additional or improved system resources.
    
- There are potential performance issues on the applications tier.
    

This will dictate which additional diagnostics are required (if any).

There can often be several actions that can improve performance, each to a differing extent.

Just because a small improvement has been identified, possibly by changing an initialization parameter to a recommended value, does not mean that the performance issue has been fixed.

If possible all potential improvements should be prioritized and the largest ones pursued.

In a high percentage of cases there will be one or more expensive SQLs (with potentially sub-optimal execution plans) and SQL specific diagnostics (SQL Trace/TKPROF, Display Cursor/SQL Monitor or SQLT) will be required.

In other cases Operating System Statistics or Application Tier diagnostics may be required.

## 13 Automating AWR Reports

The AWR reports are interactive. However, they could be automated in the following way.

Input (in the standard AWR reports) is provided using substitution variables, some of which are then populated into bind variables (for use inside anonymous PL/SQL blocks).

A wrapper such as the following could be used to populate the substitution variables (e.g. begin_snap, end_snap, dbid, inst_num (or instance_numbers_or_ALL for RAC global reports) and report_name) from command line arguments and then call the AWR report scripts awrrpt.sql or awrgrpt.sql.

    

*Note that from 12c Release 2, in a multi-tenant environment, the DBA_HIST views can also be interchanged with the [AWR_ROOT views and AWR_PDB views](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_ROOTPDB) at the CDB level and the PDB level respectively.*

A SQL\*Plus script containing lines such as the following could then be written to produce a series of reports.

    

Or a SQL\*Plus script, similar to the following, could be used to generate and run a SQL\*Plus script that contains command lines to run the wrapper above and produce AWR reports (for the local database and instance) for each snapshot within a defined time period.

    

It is also possible to automate many of the other AWR reports (e.g. ASH Reports, AWR SQL Reports, AWR Compare Periods report) in a similar way.

*Note that from 12c Release 2, in a multi-tenant environment, the DBA_HIST views can also be interchanged with the [AWR_ROOT views and AWR_PDB views](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_ROOTPDB) at the CDB level and the PDB level respectively.*

*These scripts are provided for educational purposes only and not supported by Oracle Support Services.*

### Setting AWR Report Thresholds in Automated Script

Note that the DBMS_WORKLOAD_REPOSITORY.AWR_SET_REPORT_THRESHOLDS procedure could be used in the scripts above to change the AWR report thresholds for the number of top SQLs or events output.

e.g.

       exec dbms_workload_repository.awr_set_report_thresholds(top_n_events=>40, top_n_sql=>50,top_n_sql_max=>50); 

However, this does not apply to the RAC Global AWR reports, where the thresholds are reset to defaults.

### Using DBMS_WORKLOAD_REPOSITORY procedures directly

An AWR HTML report for a specific database and instance can be produced by directly using DBMS_WORKLOAD_REPOSITORY functions as follows:

    

*This script is provided for educational purposes only and not supported by Oracle Support Services.*

It is also possible to produce other AWR reports using other procedures such as AWR_REPORT_TEXT, AWR_GLOBAL_REPORT_HTML, AWR_GLOBAL_REPORT_TEXT etc.

See [Oracle Database PL/SQL Packages and Types Reference](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PT) in the documentation library.

## 14 AWR Views

The AWR is held in a number of tables on the database.

Here are some of the top views that can be used for more detailed analysis of issues or for comparing/tracking values across snapshots.

See [here](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_SQL_EX) for a few examples of how SQL can be used on these views to get more detail.

See the [Oracle Database Reference](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_REF) for more detailed information and column descriptions.

### AWR_ROOT and AWR_PDB Views

From 12c Release 2, in a multi-tenant environment, the DBA_HIST views below can also be interchanged with the AWR_ROOT views and AWR_PDB views at the CDB level and the PDB level respectively.

For example, you can use the AWR_PDB_ACTIVE_SESS_HISTORY view for retrieving the AWR data about the active session history at the PDB level, which is equivalent to the DBA_HIST_ACTIVE_SESS_HISTORY view in an independent database in a non multi-tenant environment.

*Note that The AWR_PDB views will not show any AWR data, if the PDB level snapshots have not been collected.*

For more information see [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF).

Also see [Multi-tenant Architecture](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#MT).

### DBA_HIST_ACTIVE_SESS_HISTORY

This contains snapshots of the active session history information taken from memory (V$ACTIVE_SESSION_HISTORY).

It can be used to analyze many things :-

- The main wait events for a SQL.
    
- The main SQLs on which a wait event occurs.
    
- When (which snapshots) particular SQLs were running.
    
- On which objects wait events are occurring.
    

*Note that this view contains samples of the activities that are occurring at specific intervals (sample times). It can be used to indicate the main events/activities, however the percentages indicate the number of times an activity/event was sampled and not the actual percentage of time spent in that activity/event.*

#### wait_time

This is the wait time for the last wait event (0 if currently waiting). So cannot be used to analyze wait events.

#### time_waited

For waits that are always less than the sample interval (typically 10 seconds) then this is probably the best indication of activity. However, it can be inaccurate if there are individual waits over 10 seconds.

#### count(\*)

The count of the number of rows (samples) where a wait occurs can also give some idea of the most popular waits.

Multiplying by the sample interval (10 seconds) gives a very rough approximation of time spent. Note that it is subject to a significant statistical margin of error, particularly for smaller time periods. So it can only give an indication of the most popular waits.

#### current_obj=# / current_block#

The columns current_obj=# and current_block# can be used to analyze the objects and blocks on which wait events are occurring. The view DBA_HIST_SEG_STAT_OBJ can be used to identify the object names.

#### p1, p2, p3

In addition the columns p1, p3 and p3 can give additional information about waits, in particular the file, object and block. The p1text, p2text and p3text columns will indicate the content of the p1, p2 and p3 columns for each event.

### DBA_HIST_DATABASE_INSTANCE

This contains high level information (DB Version, DB Name, Instance Name, Host Name, Platform Name, Startup Time) for each database instance (stored in the repository). This will normally be just the instances in the cluster (RAC). However, AWR information from other databases can be imported into the AWR for analysis.

### DBA_HIST_SQL_PLAN

This contains execution plans used for each SQL in the AWR.

Unfortunately there are no actual statistics or filters/access predicates stored for each execution plan line.

This can also be useful in identifying whether an index has been used in any execution plans.

### DBA_HIST_SEG_STAT

This view along with the view DBA_HIST_SEG_STAT_OBJ is used in the Segment Statistics section of the AWR report. The AWR only reports the top objects, so this view can be useful if the statistics are spread across a lot of objects (e.g. partitions/sub-partitions).

Use the delta columns, which have the totals since the previous snapshot.

### DBA_HIST_SYSTEM_EVENT

This is used in the "Top N Timed Foreground Events" and "Wait Events Statistics" section of the AWR report.

Note that the _FG columns refer to the foreground waits. Also, the totals for the previous snapshot have to be deducted to obtain the totals between the two snapshots.

### DBA_HIST_EVENT_HISTOGRAM

This is used in the "Wait Event Histogram" section of the AWR report.

The totals for the previous snapshot have to be deducted to obtain the totals for the current snapshot.

### DBA_HIST_SQLSTAT

This is used in the "SQL Statistics" section of the AWR report.

Use the delta columns, which have the totals since the previous snapshot.

### Other Tables

#### DBA_HIST_SEG_STAT_OBJ

This contains information, including the object name, on all the objects referenced in the repository. It is useful for obtaining the object name with many of the views above.

#### DBA_HIST_SQLTEXT

This contains the SQL Text for each SQL ID referenced in the repository.

#### DBA_HIST_SNAPSHOT

This contains the snapshot information (e.g. begin and end interval times). So it can be used to [identify the snapshot ids](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Identify_Snap) for a particular time interval (or vice versa).

#### DBA_HIST_WR_CONTROL

This contains some AWR settings (snap interval, retention period, top n sql).

The view SYS.WRM$_WR_CONTROL gives a little more information (note the topnsql values: 2000000000 = DEFAULT, 2000000001 = MAXIMUM).

#### V$EVENT_NAME

This contains the classification (e.g. Concurrency, User I/O Configuration) of wait events.

## 15 AWR SQL Examples

Here are some examples of how SQL can be used on the AWR Tables.

*Note that from 12c Release 2, in a multi-tenant environment, the DBA_HIST views can also be interchanged with the [AWR_ROOT views and AWR_PDB views](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_ROOTPDB) at the CDB level and the PDB level respectively.*

To report on the top SQL between two snapshots in the AWR (without running an AWR report) run the following SQL. This example does it for the local database and instance

*Note that this particular example outputs the top 100 SQLs ordered by elapsed time, but this can easily be changed to order by other statistics (e.g. CPU time) or output fewer or more SQLs.*

    

The following shows the SQL IDs on which a particular wait occurs between two snapshots in the AWR for the local database and instance.

SELECT ss.sql_id,
       ss.time_waited,
       ss.counts_waited,
       tt.total_time,
       ROUND((ss.time_waited\*100/tt.total_time),1) percent 
FROM 
     (SELECT s.sql_id,
             COUNT(\*) counts_waited,
             SUM(time_waited) time_waited 
      FROM dba_hist_active_sess_history s,
           v$database d,
           v$instance i
      WHERE s.dbid = d.dbid
      AND   s.instance_number = i.instance_number
      AND   s.con_dbid = d.con_dbid –- From DB 12.1 onwards
      AND   s.event = '*<wait name>*'
      AND   s.snap_id > *<begin snap>* AND s.snap_id <= *<end snap>*
      GROUP BY s.sql_id) ss,
     (SELECT SUM(time_waited) total_time
      FROM   dba_hist_active_sess_history t,
             v$database d,
             v$instance i
      WHERE t.dbid = d.dbid
      AND   t.instance_number = i.instance_number
      AND   t.con_dbid = d.con_dbid -- From DB 12.1 onwards
      AND   t.event = '*<wait name>*'
      AND   t.snap_id > *<begin snap>*
      AND   t.snap_id <= *<end snap>* ) tt 
ORDER BY ss.counts_waited DESC;

The following SQL shows the objects on which a particular wait occurs for a given SQL ID between two snapshots in the AWR for the local database and instance.

SELECT ss.sql_id,
       ss.event,
       ss.current_obj#,
       ss.owner,
       ss.object_name,
       ss.object_type,
       ss.time_waited,
       ss.counts_waited,
       tt.total_time,
       ROUND((ss.time_waited\*100/tt.total_time),1) percent
FROM
     (SELECT s.sql_id,
             s.event,
             s.current_obj#,
             o.owner,
             o.object_name,
             o.object_type,
             COUNT(\*) counts_waited,
             SUM(time_waited) time_waited
      FROM dba_hist_active_sess_history s,
           dba_hist_seg_stat_obj o,
           v$database d,
           v$instance i
      WHERE s.dbid = d.dbid
      AND   s.instance_number = i.instance_number
      AND   s.sql_id = '<sql_id>'
      AND   s.event = '<wait name>'
      AND   o.dbid (+) = s.dbid
      AND   o.con_dbid (+) = s.con_dbid -- From DB 12.1 onwards
      AND   s.con_dbid = d.con_dbid -- From DB 12.1 onwards 
      AND   o.obj# (+) = s.current_obj#
      AND   s.snap_id > *<begin snap>* AND s.snap_id <= *<end snap>*
      GROUP BY s.sql_id, s.event, s.current_obj#, o.owner, o.object_name, o.object_type) ss,
     (SELECT SUM(time_waited) total_time
      FROM dba_hist_active_sess_history t,
           v$database d,
           v$instance i
      WHERE t.dbid = d.dbid
      AND   t.instance_number = i.instance_number
      AND   t.con_dbid = d.con_dbid -- From DB 12.1 onwards
      AND   t.sql_id = '<sql_id>'
      AND   t.event = '<wait name>'
      AND   t.snap_id > *<begin snap>* AND t.snap_id <= *<end snap>* ) tt 
ORDER BY ss.counts_waited DESC;

*Note that the view DBA_HIST_ACTIVE_SESS_HISTORY contains samples of the activities that are occurring at specific intervals (sample times). It can be used to indicate the main events/activities, however the percentages indicate the number of times an activity/event was sampled and not the actual percentage of time spent in that activity/event.*

*These scripts are provided for educational purposes only and not supported by Oracle Support Services.*

## 16 AWR Report for a SQL Statement

The AWR Report for a SQL Statement can be used to report on the actual runtime execution plan for long running or resource intensive SQLs that have been identified in the AWR (or elsewhere).

*Note that this information can also be obtained from the Display AWR report (dbms_xplan.display_awr).*

There are two SQL scripts in $ORACLE_HOME/rdbms/admin that can be used to generate this report:

- awrsqrpt.sql - Produces the report for the current (local) database and instance and the specified SQL.
    
- awrsqrpi.sql - Produces the report for a specified database, instance and SQL.
    

The arguments are very similar to the AWR Reports. And they can be automated in a similar way.

See [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) for more information.

## 17 Active Session History (ASH) Report

This can be used to report the Active Session History for specified SQLs, Sessions, Wait Classes, Modules etc. It can also be used to report on all activity on a database instance.

It can seamlessly report from both the AWR (view DBA_HIST_ACTIVE_SESS_HISTORY) and memory (view v$ACTIVE_SESSION_HISTORY).

*Note that from 12c Release 2, in a multi-tenant environment, the DBA_HIST_ACTIVE_SESS_HISTORY view can also be interchanged with the [AWR_ROOT view and AWR_PDB view](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_ROOTPDB) at the CDB level and the PDB level respectively.*

If specific SQLs or Wait Events (classes) have been identified from the AWR Reports then this report can give more information on where the performance issue occurs with those SQLs and Wait Events and (in some cases) why.

See [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) for more information.

## 18 How to get an ASH Report

An ASH report can be generated from SQL\*Plus by running the ASH SQL scripts. These are stored under $ORACLE_HOME/rdbms/admin.

The APPS (Oracle E-Business Suite), SYS or SYSTEM users can be used to generate the reports.

Note that ASH Reports can also be produced from Enterprise Manager / Oracle Enterprise Manager Cloud Control (Cloud Control).

The main scripts available are:

- ashrpt.sql – Produces the ASH report for the current (local) database and instance for all targets (all activity). Also for the default slot width.
    
- ashrpti.sql - Produces the ASH report for a specified database and instance.
    

These scripts can also be used to produce reports for some or all instances in an Oracle Real Application Clusters (RAC) environment.

All the scripts are interactive. Arguments cannot be specified in the command line. The ASH reports could be [automated](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#ASH_Automate) in a similar way to the AWR reports.

The [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) has more information about the arguments that the AWR reports prompt for, but here is some additional information.

#### Report Type (html or text)

The HTML format is recommended. It is clearer, easier to read and has complete SQL statements (they are not truncated).

#### Database and Instance

If running for a specified instance (e.g. awrrpti.sql) then the script will list the "Instances in this Workload Repository schema " and prompt for the database id (dbid) and instance number (inst_num).

The current (local) instance will be highlighted with an asterix (\*) at the left hand side of the row.

Choose an instance. This should be the database and instance on which the performance issue has been observed.

For a RAC environment then the instance can be a comma separated list of instance numbers or "ALL".

#### Begin Time and Duration

The begin time can accept relative times (before the current system time) using the format –HH24:MI or absolute start time using various date/time formats.

The duration is in minutes only (not hours and minutes).The default is a duration up to the current system time.

It is advisable to think about the begin time and duration required before running these scripts. This will normally be the time when a particular program or SQL is running.

#### Slot Width

This will be limited to the minimum granularity available (typically 10 seconds for active session history from the AWR).

This can only be specified if using ashrpti.sql.

#### Target Session, SQL_ID etc.

If running ashrpti.sql the active session history can be limited to specific SQLs, Sessions, Wait Classes, Services, Modules, Actions, Client Identifiers or PL/SQL entries by specifying values for these targets. If they are all omitted (NULL) then the active session history for all activity on the specified database instance will be reported.

Note that the wait class is not the wait event name, but the class that the wait events belong to. This is the Event Class for an event, which is visible in the "Top User Events" section of the ASH report or in the "Top N Timed Events" in an AWR report. It is also available in the view V$EVENT_NAME.

#### Report Name

Specify the report name or enter null for it to default to

> ashrpt_*<instance_number>*_*<end_time>*.html

Where

> *<instance_number>* will be "rac" for RAC reports (where instance (entered above) is a comma separated list of instance numbers or "ALL" ).
> 
> *<end_time>* is the end time in the format MMDD_HH24MI.

For more information see [Oracle Database Performance Tuning Guide](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PERF) in the documentation library.

## 19 ASH Report Interpretation

Each section of the ASH report contains useful information. Most are self explanatory.

*Note that ASH samples the activities that are occurring at specific intervals (sample times), which are typically every 10 seconds. It can be used to indicate the main events/activities, however the percentages indicate the number of times an activity/event was sampled and not the actual percentage of time spent in that activity/event. If used to indicate actual time spent then there is a significant statistical margin of error, particularly for smaller time periods** - and that is why the figures on the ASH will not match the wait event statistics on the AWR.*

*Be aware that percentages are not expressed as a percentage of total activity (or all wait events/SQL etc.), but as a percentage of the activity captured in the report (e.g. If the report is for one wait class, then 100% of the activity is associated with that wait class).*

The most useful sections are :-

![Top Event P1/P2/P3 Values](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:ASH_TOP_EVENT_P&clickstream=yes)

This can be useful in identifying more information about waits, particularly hot objects and blocks on some Concurrency and Configuration wait events.

![Top SQL with Top Events and Row Sources](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:ASH_TOP_SQL&clickstream=yes)

These sections can be used to identify the top wait events on a SQL (or vice versa) along with the top row sources.

Unfortunately the row source does not specify the object, however this may be deduced from the Top DB Objects section below.

![Top Blocking Sessions](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:ASH_TOP_BLOCK&clickstream=yes)

This can be useful in identifying which sessions are blocking others and the extent to which this is happening. Again, note that the percentages relate to the activity/wait events included in the report.

![Top DB Objects](https://support.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1674086.1&attachid=1674086.1:ASH_TOP_DB_OBJ&clickstream=yes)

This can be useful in identifying the objects on which wait events are occurring. In the absence of actual statistics on an execution plan this can give some idea of the steps of an execution plan where workload or contention is occurring.

*Note that logical reads (buffer gets) are not picked up in these statistics, so unless logical reads results in physical I/O or a Concurrency/Configuration wait then it will not show up here. So it is still possible for a SQL to have an inefficient execution plan, with too many buffer gets, and the objects on which the inefficient line(s) occur not show in this section.*

## 20 Automating ASH Reports

The ASH reports are interactive. However, they could be automated in the following way.

Input (in the standard ASH reports) is provided using substitution variables, which are then populated into bind variables (for use inside anonymous PL/SQL blocks).

A wrapper such as the following could be used to populate the substitution variables (e.g. begin_time, duration, slot_width, dbid, inst_num and report_name) from command line arguments and then call the ASH report script ashrpti.sql.

    

A SQL\*Plus script containing lines such as the following could then be written to produce a series of reports.

@@fndashrpt *<sql_id> <begin_time> <duration> <slot_width> <dbid> <inst_num> <report_name>*
@@fndashrpt *<sql_id> <begin_time> <duration> <slot_width> <dbid> <inst_num> <report_name>*
@@fndashrpt *<sql_id> <begin_time> <duration> <slot_width> <dbid> <inst_num> <report_name>*

Where

- *<sql_id>* is the sql_id
- *<begin_time>* is the time in the format MM/DD\[/YY\]\*HH24:MI:\[SS\]
- *<duration>* is the duration in minutes
- <slot_width> is the slot width in seconds
- *<dbid>* is the database id
- *<inst_num>* is the instance number
- *<report_name>* is the report name

Or a SQL\*Plus script, similar to the following, could be used to generate and run a SQL\*Plus script that contains command lines to run the wrapper above. This example produces ASH reports for the top 100 SQLs between two AWR snap ids.

    

*Note that from 12c Release 2, in a multi-tenant environment, the DBA_HIST views can also be interchanged with the [AWR_ROOT views and AWR_PDB views](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_ROOTPDB) at the CDB level and the PDB level respectively.*

*These scripts are provided for educational purposes only and not supported by Oracle Support Services.*

### Using DBMS_WORKLOAD_REPOSITORY procedures directly

An ASH HTML report for a specific database and instance can be produced by directly using DBMS_WORKLOAD_REPOSITORY functions as follows:

set linesize 8000 termout on feedback off heading off echo off veri off trimspool on trimout on 

SPOOL ashrpt_*<sql_id>*_*<begin_time>*.html 

SELECT 
   output 
FROM TABLE(dbms_workload_repository.ash_report_html(l_dbid => *<dbid>*,
                                                    l_inst_num => *<inst_num>*,
                                                    l_btime => *<begin_time>*,
                                                    l_etime => *<end_time>*,
                                                    l_slot_width => *<slot_width>*,
                                                    l_sql_id => *<sql_id>*),
                                                    l_container => <container>);

SPOOL OFF

set linesize 80 feedback 6 heading on veri on trimspool off

*This script is provided for educational purposes only and not supported by Oracle Support Services.*

It is also possible to produce other ASH reports using other procedures such as ASH_REPORT_TEXT, ASH_GLOBAL_REPORT_HTML, ASH_GLOBAL_REPORT_TEXT etc.

See [Oracle Database PL/SQL Packages and Types Reference](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#DB_DOC_PT) in the documentation library.

## 21 AWR Performance

The AWR data is stored in WRH$ tables in the SYS schema (SYSAUX tablespace). These are part of a group of tables known as dictionary tables.

In some cases the AWR tables will have grown significantly due to one or more of the following:

- Changes to AWR snapshot settings (increasing retention period, reducing snapshot interval etc.)
    
- The nature of the activity (e.g. an upgrade) being monitored creates more rows in the AWR, e.g. increased latches due to concurrency, increased wait events etc.
    
- The level of diagnostics being captured. e.g. statistics_level = ALL
    

After a significant number of DDL operations other dictionary object tables, such as those containing metadata about database objects, files and configuration (e.g. SYS.USER$, SYS.TS$, SYS.SEG$, SYS.OBJ$, SYS.TAB$, SYS.FILE ) could also have grown significantly. This could be after (or during) a platform, database or application (Oracle E-Business Suite) upgrade or after a move to OATM.

Similarly, fixed objects (e.g. X$ objects containing information on the instance and memory structures, used by V$SQL, V$SQL_PLAN, V$ACTIVE_SESSION_HISTORY etc.) could also have grown significantly, due to database, platform or application (Oracle E-Business Suite) upgrades. They could also grow because of changes to the SGA/PGA, configuration of the database or significant changes in the workload or number of sessions.

If the AWR reports or snapshot creation (collection) do not perform well (take a long time to run) then it could be due to inefficient execution plans for SQLs on dictionary or fixed objects. So Dictionary Statistics or Fixed Object Statistics could be inaccurate and require gathering again.

For 10g and above the commands are :

> execute DBMS_STATS.GATHER_FIXED_OBJECTS_STATS;  
> 
> execute DBMS_STATS.GATHER_DICTIONARY_STATS( estimate_percent => DBMS_STATS.AUTO_SAMPLE_SIZE, options => 'GATHER AUTO');

*Note that, dependent cursors should be invalidated by using the argument "no_invalidate=>FALSE" or by using procedure DBMS_STATS.set_database_prefs to set the AUTO_INVALIDATE parameter prior to gathering statistics.*

See My Oracle Support document "Best Practices for Gathering Statistics with Oracle E-Business Suite ([Document 1586374.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1586374.1))" for more information on gathering Fixed Object and Dictionary statistics with Oracle E-Business Suite.

In some instances there may have been significant growth on one AWR table (e.g. WRH$_LATCH_CHILDREN), in which case gathering table stats for that table only may resolve the issue.

> exec dbms_stats.gather_table_stats(ownname=>'SYS', tabname=>'WRH$_LATCH_CHILDREN', no_invalidate=>false);

There could also have been growth on one or two particular fixed objects (e.g. 'X$KCCFN', 'X$KCCFE'), in which case gathering statistics for those objects only may resolve the issue.

> exec dbms_stats.gather_table_stats(ownname=>'SYS', tabname=>'X$KCCFN', no_invalidate=>false); 
> exec dbms_stats.gather_table_stats(ownname=>'SYS', tabname=>'X$KCCFE', no_invalidate=>false);

See My Oracle Support document "AWR or STATSPACK Snapshot collection extremely slow in 11gR2 ([Document 1392603.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1392603.1))".

Note that it may be necessary to SQL Trace the AWR report or Snapshot Creation to identify inefficient execution plans.

AWR reports can easily be traced from SQL\*Plus using "alter session set events" (event 10046). See the "[Obtaining Traces (TKPROF) in E-Business Suite - From SQL\*Plus](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1674024.1#Trace_SQL_Plus)" section in the My Oracle Support document "Oracle E-Business SQL Trace and TKPROF Guide ([Document 1674024.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1674024.1))" for instructions.

If the performance issues relate to AWR tables (WRH$) then the "awrinfo.sql" report ( in $ORACLE_HOME/rdbms/admin ) can be used to identify the space usage of the SYSAUX tablespace and AWR. It also shows the size and data distribution of AWR objects. This script can also be used to help resolve space issues on SYSAUX and AWR objects.

See My Oracle Support documents:

- Troubleshooting Issues with SYSAUX ([Document 1399365.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=1399365.1))
    
- General Guidelines for SYSAUX Space Issues ([Document 552880.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=552880.1))
    

## 22 Action Plan Template

If not on a RAC environment then please provide an AWR report (in HTML format) for the period that the performance issue was observed (or the program was running). Use either of the scripts awrrpt.sql or awrrpti.sql.

If on a RAC environment, please provide:

- An AWR report (awrrpt.sql/awrrpti.sql) for each node (instance) where the performance issue is occurring.
    
- An AWR Global report for all nodes (being used). Use script awrgrpt.sql / awrgrpti.sql.
    
- If a process (such as an upgrade) is being run on one node (instance) only then the awrrpti.sql report for that instance will suffice.
    

If the issue/program is particularly long running then multiple AWR reports can be provided for each *n* hour slot.

If the performance issue requires reproducing then on the next run the snapshot settings should have:

1.  A retention period that is long enough for reports to be produced at a later stage. Note that the performance analyst may request more AWR or ASH reports after the initial analysis.
    
2.  A snapshot interval that is short enough to give the required granularity. However, this can be best achieved by creating [manual snapshots](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Man_Snap) (using DBMS_WORKLOAD_REPOSITORY.CREATE_SNAPSHOT(flush_level => 'ALL') ).
    

These can be set using DBMS_WORKLOAD_REPOSITORY.MODIFY_SNAPSHOT_SETTINGS. See [AWR Snapshot Settings](https://support.oracle.com/epmos/faces/DocumentDisplay?_afrLoop=250592967726859&id=1674086.1&_afrWindowMode=0&_adf.ctrl-state=tgma58wyv_29#AWR_Snapshot).

## Oracle Database Documentation Library Links

The documentation libraries are available [here](https://docs.oracle.com/).

Note that Oracle E-Business Suite is not certified with database versions 12c Release 2 or 18c.

### Reference

[19c](https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/index.html)  
[12c Release 1](https://docs.oracle.com/database/121/REFRN/toc.htm)  
[11g Release 2](https://docs.oracle.com/cd/E11882_01/server.112/e40402/toc.htm)  

### Performance Tuning Guide

[19c](https://docs.oracle.com/en/database/oracle/oracle-database/19/tgdba/index.html)  
[12c Release 1](https://docs.oracle.com/database/121/TGDBA/toc.htm)  
[11g Release 2](https://docs.oracle.com/cd/E11882_01/server.112/e41573/toc.htm)  

### PL/SQL Packages and Types Reference

[19c](https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/index.html)  
[12c Release 1](https://docs.oracle.com/database/121/ARPLS/toc.htm)  
[11g Release 2](https://docs.oracle.com/cd/E11882_01/appdev.112/e40758/toc.htm)  

### Real Application Clusters Administration and Deployment Guide

[19c](https://docs.oracle.com/en/database/oracle/oracle-database/19/racad/index.html)  
[12c Release 1](https://docs.oracle.com/database/121/RACAD/toc.htm)  
[11g Release 2](https://docs.oracle.com/cd/E11882_01/rac.112/e41960/toc.htm)  

### Licensing Information

[19c](https://docs.oracle.com/en/database/oracle/oracle-database/19/dblic/index.html)  
[12c Release 1](https://docs.oracle.com/database/121/DBLIC/toc.htm)  
[11g Release 2](https://docs.oracle.com/cd/E11882_01/license.112/e47877/toc.htm)  

## Change Log

| Date | Description |
| --- | --- |
| 1 May 2014 | 
- Initial creation.

 |
| 21 Jun 2016 | 

Added links to integrate with My Oracle Support document "Oracle E-Business Suite SQL Tuning Tips for Customers ([Document 2098522.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1674086.1&id=2098522.1))", section numbers, sections on "Automating ASH Reports" and "RAC Wait Events".

Update database references.

 |
| 22 Aug 2018 | Corrected incorrectly typed references to AWR reports in Section "10 How to get AWR Report > Report Name". Corrected section "19 How to get an ASH Report > Report Name" so that it no longer references AWR reports. |
| 15 Oct 2019 | Update for Database versions after 12.1 |
| 14 Apr 2020 | Removed references to removed My Oracle Support documents. Re-checked for PI/CI |
| 6 Oct 2020 | 

Terminology Updates

 |

[Copyright © 2017, 2020, Oracle and/or its affiliates.](https://mosemp.us.oracle.com/epmos/main/downloadattachmentprocessor?parent=DOCUMENT&sourceId=1959460.1&attachid=1320300.1:COPY&clickstream=no "copyright")

<table class="p_AFDisclosed xty" cellpadding="0" cellspacing="0" border="0" width="0" summary="" style="padding: 0px; width: 1658px; color: rgb(51, 51, 51); font-family: Tahoma, Verdana, Helvetica, sans-serif; font-size: 11px; background-color: rgb(255, 255, 255);" data-mkd-display="block" data-mkd-tablehasheader="false"><tbody data-mkd-display="block"><tr data-mkd-display="block" data-mkd-index="1" data-mkd-index-row="1"><td class="xvf" style="padding: 0px; overflow: hidden; white-space: nowrap; vertical-align: middle; display: block; font-weight: bold; font-size: 14px;" data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><table cellpadding="0" cellspacing="0" border="0" width="100%" summary="" data-mkd-display="block" data-mkd-tablehasheader="false"><tbody data-mkd-display="block"><tr data-mkd-display="block" data-mkd-index="1" data-mkd-index-row="1"><td id="kmPgTpl:r1:0:sdh2::_afrTtxt" data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><div title="Attachments" class="xu3" style="overflow: hidden; width: 90px; max-width: 90px;" data-mkd-display="block"><h1 class="xdm " style="font-size: 14px; color: rgb(0, 61, 91); padding-top: 1em; display: inline; margin: 0px;" data-mkd-display="block">Attachments</h1></div></td><td id="kmPgTpl:r1:0:sdh2::_afrEps" data-mkd-display="block" data-mkd-index="2" data-mkd-index-cell="2"></td><td id="kmPgTpl:r1:0:sdh2::_afrStr" style="width: 1551px;" data-mkd-display="block" data-mkd-index="3" data-mkd-index-cell="3" data-mkd-pos="last"></td></tr></tbody></table></td><td class="xv1" style="width: 1px; min-width: 1px; padding: 0px; font-size: 0px;" data-mkd-display="block" data-mkd-index="4" data-mkd-index-cell="4" data-mkd-pos="last">&nbsp;</td></tr></tbody></table>

- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[ASH Top Blocking Sessions](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AASH_TOP_BLOCK&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(46.51 KB)
- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[ASH Top DB Objects](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AASH_TOP_DB_OBJ&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(42.52 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[ASH Top Event by P1/P2/P3](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AASH_TOP_EVENT_P&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(69.18 KB)
- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[ASH Top SQL](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AASH_TOP_SQL&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(54.7 KB)
- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[AWR Header Section](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AAWR_SECTION_HEAD&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(55.21 KB)
- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[Complete List of SQL Text](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ACOMPLETE_LIST_SQL&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(131.72 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Enqueue Activity](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AENQ_ACT&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(66.14 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Host Instance CPU](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AHOST_INST_CPU&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(33.24 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[SGA Target Advisory](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASGA_ADV&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(39.89 KB)
- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[SQL Ordered by CPU Time](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASQL_BY_CPU&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(146.04 KB)
- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[SQL Ordered by Elapsed Time](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASQL_BY_ELAP&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(133.14 KB)
- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[SQL Ordered by Gets](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASQL_BY_GETS&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(102.02 KB)
- ![GIF](https://support.oracle.com/epmos/ui/images/filetypes/file_gif.gif "GIF")![](https://support.oracle.com/epmos/adf/images/t.gif)[SQL Ordered by Reads](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASQL_BY_READS&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(113.36 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Segments by Buffer Busy Waits](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASEG_BY_BUFF&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(76.29 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Segments by DB Blocks Changes](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASEG_BY_DB_BLOCK&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(67.01 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Segments by ITL Waits](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASEG_BY_ITL&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(59.09 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Segments by Logical Reads](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASEG_BY_LOG_READ&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(62.55 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Segments by Physical Reads](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASEG_BY_PHYS_READ&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(64.36 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Segments by Physical Writes](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASEG_BY_PHYS_WRITE&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(60.53 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Segments by Row Lock Waits](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ASEG_BY_ROWLOCK&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(71.39 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Shared Pool Advisory](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3APOOL_ADV&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(179.27 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Top N Timed Foreground Events](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3ATOP_N_FG_EVENTS&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(41.78 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Wait Event Histogram 1](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AWAIT_HIST_1&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(78.03 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Wait Event Histogram 2](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AWAIT_HIST_2&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(79.7 KB)
- ![JPEG](https://support.oracle.com/epmos/ui/images/filetypes/file_jpg.gif "JPEG")![](https://support.oracle.com/epmos/adf/images/t.gif)[Foreground Wait Events](https://support.oracle.com/epmos/main/downloadattachmentprocessor?attachid=1674086.1%3AFG_EVENTS&docType=REFERENCE&action=download)![](https://support.oracle.com/epmos/adf/images/t.gif)(102.59 KB)