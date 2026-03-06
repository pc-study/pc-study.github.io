---
title: After Upgrade Database to Release 12.2: ORA-3137 12569 Errors in Alert.log or Incident Traces (Doc ID 2540948.1)	
date: 2022-03-01 10:03:29
tags: [oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/336206
---

@[TOC](In this Document)

## APPLIES TO:

Oracle Net Services - Version 12.2.0.1 and later  
Oracle Database - Enterprise Edition - Version 19.10.0.0.0 to 19.10.0.0.0 \[Release 19\]  
Information in this document applies to any platform.  

## SYMPTOMS

 Following an upgrade of the database, JDBC Thin client connection can throw the following errors in incident traces:  
  
  
Alert log:  
  
2019-04-30T12:01:39.077605-04:00  
Errors in file /opt/oracle/diag/diag/rdbms/database/instance1/trace/instance1\_ora\_57369.trc  (incident=169482):  
ORA-03137: malformed TTC packet from client rejected: \[12569\] \[94\] \[\] \[\] \[\] \[\] \[\] \[\]  
Incident details in: /opt/oracle/diag/diag/rdbms/database/instance1/incident/incdir\_169482/instance1\_ora\_57369\_i169482.trc  
2019-04-30T12:01:40.395633-04:00  
Session (811,13950): Bad TTC Packet Detected: Inbound connection from client  
Session (811,13950): Bad TTC Packet Detected: DB Logon User: USERNAME, Remote Machine: remote\_host, Program:your\_app@remote machine (TNS V1-V3), OS User: OS\_USER  
Session (811,13950): Bad TTC Packet Detected: Client IP Address:  xxx.yyy.zzz.aa

\*\*\* 2019-04-30T12:01:39.079938-04:00  
\*\*\* SESSION ID:(811.13950) 2019-04-30T12:01:39.079956-04:00  
\*\*\* CLIENT ID:() 2019-04-30T12:01:39.079963-04:00  
\*\*\* SERVICE NAME:(SERVICE\_NAME) 2019-04-30T12:01:39.079970-04:00  
\*\*\* MODULE NAME:(your\_app@remote\_host (TNS V1-V3)) 2019-04-30T12:01:39.079977-04:00  
\*\*\* ACTION NAME:() 2019-04-30T12:01:39.079984-04:00  
\*\*\* CLIENT DRIVER:() 2019-04-30T12:01:39.079990-04:00  
   
\[TOC00000\]  
Jump to table of contents  
Dump continued from file: /opt/oracle/diag/diag/rdbms/database/instance1/trace/instance1\_ora\_57369.trc  
\[TOC00001\]  
ORA-03137: malformed TTC packet from client rejected: \[12569\] \[94\] \[\] \[\] \[\] \[\] \[\] \[\]  
ORA-3137  
\[TOC00001-END\]  
\[TOC00002\]

Error Stack:  
 ORA-03137: malformed TTC packet from client rejected: \[12569\] \[94\] \[\] \[\] \[\] \[\] \[\] \[\]  
   
Stack:  
ksedst <- dbkedDefDump <- ksedmp <- dbgexPhaseII <- dbgexProcessError  
 <- dbgePostErrorKGE <- dbkePostKGE\_kgsf <- kgeade <- kgerelv <- kgerev <- opiierr  
  <- opitsk <- opiino <- opiodr <- opidrv <- sou2o <- opimai\_real  
   <- ssthrdmain <- main

These parameters are present in the server side sqlnet.ora file.

SQLNET.ENCRYPTION\_SERVER = (requested)  
SQLNET.CRYPTO\_CHECKSUM\_CLIENT = (requested)

## CHANGES

 The database has recently been upgraded to release 12.2

SQLNET.ENCRYPTION\_SERVER = (requested)  
SQLNET.CRYPTO\_CHECKSUM\_CLIENT = (requested)

## CAUSE

 Undetermined. 

## SOLUTION

 Remove these lines from the sqlnet.ora file and monitor:

SQLNET.ENCRYPTION\_SERVER = (requested)  
SQLNET.CRYPTO\_CHECKSUM\_CLIENT = (requested)  
  
**IMPORTANT NOTE**:  Best practice solution is to upgrade the clients to the same level as that database.  
This is especially true if client is using the JDBC Thin driver.