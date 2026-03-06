---
title: Oracle Net 12c: How to enable Clients using SID to connect to PDB? (Doc ID 1644355.1)
date: 2022-01-08 21:01:05
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/233683
---

@[TOC](In this Document)  

## APPLIES TO

Oracle Net Services - Version 12.1.0.1 and later  
Information in this document applies to any platform.  

## SYMPTOMS

As an example, Client connection string uses the "SID" value to connect to a <TEST> database instance.  
So:
```bash
<my_alias> =  
  (DESCRIPTION =  
    (ADDRESS=(protocol = tcp)(HOST=<hostname.domain>)(port = 1521))  
    (CONNECT_DATA=(SERVER=DEDICATED)(SID = <TEST>))  
  )
```
However, the <TEST> database is changed to a pluggable database (PDB so Multi-Tenant functionality) and the client connection now fails with ORA-12505.
```bash
C:\Users\test>sqlplus <username>/<password>@<my_alias>  
  
SQL*Plus: Release 12.1.0.1.0 Production on Wed Apr 16 18:15:25 2014  
Copyright (c) 1982, 2013, Oracle.  All rights reserved.  
ERROR:  
ORA-12505: TNS:listener does not currently know of SID given in connect  
descriptor
```
## CHANGES

 The TEST database is now a PDB. Connections to a pluggable database use SERVICE\_NAME and not SID.

## CAUSE

A PDB is not an instance.  
So using a SID parameter in the connection string will not work unless the following listener.ora file setting is put in place:  

**USE_SID_AS_SERVICE_LISTENER = ON**
  

When the database is an Oracle Database 12c container database, the client must specify a service name in order to connect to it. 

Listener status shows <TEST> as only a Service and not an Instance, with the Instance being the CDB (Container Database):
```bash
Listening Endpoints Summary...  
(DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=<hostname.domain>)(PORT=1521)))  
(DESCRIPTION=(ADDRESS=(PROTOCOL=ipc)(PIPENAME=\\.\pipe\EXTPROC1521ipc)))  
Services Summary...  
...  
Service "<TEST>" has 1 instance(s).  
Instance "<cdb1>", status READY, has 1 handler(s) for this service...  
The command completed successfully 
```
## SOLUTION

Set the following control parameter in the listener.ora file and restart the listener:  

**USE_SID_AS_SERVICE_<listener_name> = ON**
  
This will enable the system identifier (SID) in the connect descriptor to be interpreted as a service name when a user attempts a database connection.  
Database clients with earlier releases of Oracle Database that have hard-coded connect descriptors can use this parameter to connect to a container or pluggable database.

Example of usage in listener.ora:
```bash
LISTENER =  
   (DESCRIPTION =  
    (ADDRESS_LIST = (ADDRESS=(PROTOCOL=tcp)(HOST=<hostname.domain>)(PORT=1521))  
   )

USE_SID_AS_SERVICE_LISTENER = ON
```
  
The connection will work after this change or you will progress to the next logical issue:
```bash
C:\Users\test>sqlplus <username>/<password>@<my_alias>  
  
SQL*Plus: Release 12.1.0.1.0 Production on Wed Apr 16 18:28:40 2014  
  
Copyright (c) 1982, 2013, Oracle.  All rights reserved.  
Connected to:  
Oracle Database 12c Enterprise Edition Release 12.1.0.1.0 - 64bit Production  
With the Partitioning, OLAP, Advanced Analytics and Real Application Testing opt  
ions  
SQL>
```
  
The listener will interpret the value for SID=TEST as SERVICE\_NAME=TEST and allow the connection.  
  
  
2. Otherwise, modify the client connection string to use the a SERVICE\_NAME field to match the actual PDB service name instead of the SID field :
```bash
<my_alias> =  
  (DESCRIPTION =  
    (ADDRESS=(protocol = tcp)(HOST=<hostname.domain>)(port = 1521))  
    (CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME = <TEST>))  
  )
```