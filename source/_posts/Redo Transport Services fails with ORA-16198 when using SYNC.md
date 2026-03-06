---
title: Redo Transport Services fails with ORA-16198 when using SYNC (synchronous) mode (Doc ID 808469.1)	
date: 2022-03-02 11:03:15
tags: [oracle,dataguard]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/336515
---

@[TOC](In this Document)

## APPLIES TO:

Oracle Database - Enterprise Edition - Version 10.2.0.1 and later  
Oracle Database Exadata Cloud Machine - Version N/A and later  
Oracle Cloud Infrastructure - Database Service - Version N/A and later  
Oracle Database Cloud Exadata Service - Version N/A and later  
Oracle Database Exadata Express Cloud Service - Version N/A and later  
Information in this document applies to any platform. \*\* checked for relevance '26-Oct-2016' \*\*  
  
This will affect LGWR SYNC transport mode in 10.2.0.x and above databases.  

## SYMPTOMS

\*\* checked for relevance '30-May-2018' \*\*

Redo Transport Services failed with ORA-16198 from primary database to either the physical standby database or logical standby database using LGWR SYNC mode.  
  
The primary alert log file showed:
```bash
Fri Feb 6 21:22:26 2009  
ORA-16198: LGWR received timedout error from KSR  
LGWR: Attempting destination LOG_ARCHIVE_DEST_2 network reconnect (16198)  
LGWR: Destination LOG_ARCHIVE_DEST_2 network reconnect abandoned  
Fri Feb 6 21:22:26 2009  
Errors in file /<PATH>/bdump/<FILE_NAME>.trc:  
ORA-16198: Timeout incurred on internal channel during remote archival  
LGWR: Network asynch I/O wait error 16198 log 2 service '(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=tcp)(HOST=<HOST_NAME>)(PORT=1521)))(CONNECT_DATA=(SERVICE_NAME=<SERVICE_NAME>)(INSTANCE_NAME=<INSTANCE_NAME>)(SERVER=dedicated)))'  
Fri Feb 6 21:22:26 2009  
Destination LOG_ARCHIVE_DEST_2 is UNSYNCHRONIZED  
LGWR: Failed to archive log 2 thread 1 sequence 628 (16198)  
Fri Feb 6 21:22:27 2009
```
   
If you use Data Guard Broker, then the primary drc log showed:
```bash
DG 2009-04-12-12:11:08 0 2 678445059 Operation CTL_GET_STATUS cancelled during phase 2, error = ORA-16778  
DG 2009-04-12-12:12:08 0 2 0 RSM detected log transport problem: log transport for database '<DATABASE_NAME>' has the following error.  
DG 2009-04-12-12:12:08 0 2 0 ORA-16198: Timeout incurred on internal channel during remote archival  
DG 2009-04-12-12:12:08 0 2 0 RSM0: HEALTH CHECK ERROR: ORA-16737: the redo transport service for standby database "<DATABASE_NAME>" has an error  
DG 2009-04-12-12:12:08 0 2 678445062 Operation CTL_GET_STATUS cancelled during phase 2, error = ORA-16778  
DG 2009-04-12-12:12:08 0 2 678445062 Operation CTL_GET_STATUS cancelled during phase 2, error = ORA-16778
```
## CAUSE

The NET_TIMEOUT attribute in the LOG_ARCHIVE_DEST_2 on the primary is set too low so that  
LNS couldn't finish sending redo block in 10 seconds in this example.  
```bash
log_archive_dest_2 service="(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PR  
OTOCOL=tcp)(HOST=<HOST_NAME>)(PORT=1521)))(CONNECT  
_DATA=(SERVICE_NAME=<SERVICE_NAME>)(  
INSTANCE_NAME=<INSTANCE_NAME>)(SERVER=dedicated)))",  
LGWR SYNC AFFIRM delay=0 OPTIONAL max_failure=0  
max_connections=1 reopen=300 db_unique_name="  
<DB_UNIQUE_NAME>" register net_timeout=10 valid  
_for=(online_logfile,primary_role)
```
Noticed that you used LGWR SYNC log transport mode and NET_TIMEOUT was set to 10 .

## SOLUTION

You'll need to increase the NET_TIMEOUT value in the LOG_ARCHIVE_DEST_2 on the primary to at least 15 to 20 seconds depends on your network speed.

If you don't use Data Guard Broker, then you could change LOG_ARCHIVE_DEST_2 from SQL*Plus using ALTER SYSTEM command. For example,
```sql
SQL>ALTER SYSTEM SET LOG_ARCHIVE_DEST_2 SERVICE=<SERVICE_NAME>  
LGWR SYNC DB_UNIQUE_NAME=<DB_UNIQUE_NAME> NET_TIMEOUT=30 VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE)
```
If you use Data Guard Broker, then you will need to modify NetTimeout property from DGMGRL or Grid Control.  
  
For example, connect to the DGMGRL command-line interface from the primary machine,  
```sql
DGMGRL> connect sys/<sys password>

DGMGRL> EDIT DATABASE '<primary db_unique_name>' SET PROPERTY NetTimeout = 30;  
``` 
=======================================================================

Note: If NET_TIMEOUT attribute has already been set to 30, and you still get ORA-16198, that means LNS couldn't finish sending redo block in 30 seconds. We may have to increase the NET_TIMEOUT value to more than 30sec. If DG Broker not place then update it via SQLPLUS.

The slowness may caused by:

1. Operating System. Please keep track of OS usage (like iostat).

2. Network. Please keep track network flow (like tcpdump).

>**Note: Please don't use SYNC log transport mode across a wide area network (WAN) with latencies above 10ms.**

 The purpose here is to figure out if the slowness is caused by temporary OS glitch or temporary network glitch.

NOTE : In an Environment having both primary and standby aRE RAC chances that this error maybe a FALSE info, For details refer

Bug 17823929 : PRIMARY DB INSTANCE HANGS WITH A LOT OF ORA-16198

NOTE : LGWR fail to get the written ACK from standby within the NET_TIMEOUT. If issue persists,Check ORATCPcheck tool or IOSTAT to narrow down issue on NETWORK or at the IO side.

++ Tool To Simulate NETWORK BAndwidth,  
install ORATCPTEST tool,  
Get help using,  
% java -jar oratcptest.jar -help  
Refer,  
++ Article to findout current Network Capacity  
Measuring Network Capacity using oratcptest (Doc ID 2064368.1)

++ OSWATCHER  
Recording on OSWATCHER,  
https://oracletalk.webex.com/oracletalk/ldr.php?RCID=85c29232f4c89248c8ab9b447ef19835

* * *

## REFERENCES

[BUG:4255639](https://support.oracle.com/epmos/faces/BugDisplay?parent=DOCUMENT&sourceId=808469.1&id=4255639) - ORA-16198: LGWR RECEIVED TIMEDOUT ERROR FROM KSR  
[BUG:9188870](https://support.oracle.com/epmos/faces/BugDisplay?parent=DOCUMENT&sourceId=808469.1&id=9188870) - ORA-16198: LGWR RECEIVED TIMEDOUT ERROR FROM KSR DURING TRANSPORT TO LOGICAL  
[NOTE:1604963.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=808469.1&id=1604963.1) - Troubleshooting Data Guard Log Transport Services

---

**📢 备注：**
>出现这个报错是由于在默认的NET_TIMEOUT时间（10秒）内主库LGWR进程没有将数据完整的发送到备库，可以将NET_TIMEOUT设置为15或者30秒来增加LGWR发送数据到备库的时间，减少出现这个问题的几率。如果NET_TIMEOUT设置为30秒仍然存在此问题，那么就需要考虑是否是主库到备库的网络存在性能问题或存在一定的故障，对于WAN外网的Standby数据库最好不要使用LGWR SYNC进行实时同步，使用ARC NSYNC同步更合适。