---
title: [译] 多租户：Oracle Database 19c 中的 DBCA PDB 重定位
date: 2022-01-06 16:01:20
tags: [墨力计划,oracle,oracle 19c]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/232397
---

>原文地址：[https://oracle-base.com/articles/19c/multitenant-dbca-pdb-relocate-19c](https://oracle-base.com/articles/19c/multitenant-dbca-pdb-relocate-19c)
原文作者：Tim Hall

Oracle Database 12c 第 2 版 (12.2) 引入了使用 `CREATE PLUGGABLE DATABASE` 命令重新定位可插拔数据库 (PDB) 的功能。在 Oracle 19c 中，现在可以使用数据库配置助手 (DBCA) 执行可插拔数据库 (PDB) 的重定位。

![](https://img-blog.csdnimg.cn/57bd889cf6b549588e19f077c4d2ed59.png)

@[TOC](目录)
# 一、先决条件
连接到远程 CDB 并准备重定位：
```bash
export ORAENV_ASK=NO
export ORACLE_SID=cdb3
. oraenv
export ORAENV_ASK=YES

sqlplus / as sysdba
```
在远程数据库中创建一个用户以与数据库链接一起使用。在这种情况下，我们将在远程 PDB 中使用一个普通用户。
```sql
CREATE USER c##remote_clone_user IDENTIFIED BY remote_clone_user CONTAINER=ALL;
GRANT CREATE SESSION, CREATE PLUGGABLE DATABASE TO c##remote_clone_user CONTAINER=ALL;
GRANT SYSOPER TO c##remote_clone_user CONTAINER=ALL;
```
与常规重定位不同，我们不需要创建数据库链接。我们只需要提供用于创建链接的凭据。DBCA 完成剩下的工作。

检查远程 CDB 是否处于本地 undo 模式和归档模式。
```sql
CONN / AS SYSDBA

COLUMN property_name FORMAT A30
COLUMN property_value FORMAT A30

SELECT property_name, property_value
FROM   database_properties
WHERE  property_name = 'LOCAL_UNDO_ENABLED';

PROPERTY_NAME                  PROPERTY_VALUE
------------------------------ ------------------------------
LOCAL_UNDO_ENABLED             TRUE

SQL>


SELECT log_mode
FROM   v$database;

LOG_MODE
------------
ARCHIVELOG

SQL>
```

因为远程 CDB 是本地 undo 模式和归档模式，所以我们不需要把远程数据库变成只读模式。

连接到本地 CDB 并为迁移做准备：
```bash
export ORAENV_ASK=NO
export ORACLE_SID=cdb1
. oraenv
export ORAENV_ASK=YES

sqlplus / as sysdba
```
检查本地 CDB 是否处于本地 undo 模式和归档模式：
```sql
CONN / AS SYSDBA

COLUMN property_name FORMAT A30
COLUMN property_value FORMAT A30

SELECT property_name, property_value
FROM   database_properties
WHERE  property_name = 'LOCAL_UNDO_ENABLED';

PROPERTY_NAME                  PROPERTY_VALUE
------------------------------ ------------------------------
LOCAL_UNDO_ENABLED             TRUE

SQL>


SELECT log_mode
FROM   v$database;

LOG_MODE
------------
ARCHIVELOG

SQL>
```
# 二、使用 DBCA 重新定位 PDB
在 19c 中 `-relocatePDB` 引入了 DBCA 命令，允许我们将 PDB 重新定位到不同的容器数据库 (CDB)。
```bash
 -relocatePDB - Command to Relocate a pluggable database.
      -remotePDBName <Name of the pluggable database to clone/relocate>
      -pdbName <Pluggable database name>
      -dbLinkUsername <Common user of a remote CDB, used by database link to connect to remote CDB.>
      -remoteDBConnString <EZCONNECT string to connect to Source database for example "host:port/servicename">
      -sourceDB <Database unique name for RAC database or SID for Single Instance database>
      [-remoteDBSYSDBAUserName <User name with SYSDBA privileges of remote database>]
      [-dbLinkUserPassword <Common user password of a remote CDB, used by database link to connect to remote CDB.>]
      [-useWalletForDBCredentials <true | false> Specify true to load database credentials from wallet]
         -dbCredentialsWalletLocation <Path of the directory containing the wallet files>
         [-dbCredentialsWalletPassword <Password to open wallet with auto login disabled>]
      [-remoteDBSYSDBAUserPassword <Password for remoteDBSYSDBAUserName user of remote database.>]
      [-sysDBAUserName <User name  with SYSDBA privileges>]
      [-sysDBAPassword <Password for sysDBAUserName user name>]
```
您可以在 [此处](https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/creating-and-configuring-an-oracle-database.html#GUID-8DD80A8A-DDE1-471F-8CBB-013D85CFE28F) 查看该 `-relocatePDB` 命令的完整语法，尽管在编写文档时与该命令提供的实用程序用法不匹配。
```bash
dbca -relocatePDB -help
```
确保环境设置为指向本地实例 “cdb1”，并从 “cdb3” 实例中名为 “pdb5” 的远程 PDB 中重新定位名为 “pdb5” 的 PDB。
```bash
export ORACLE_SID=cdb1
export ORAENV_ASK=NO
. oraenv
export ORAENV_ASK=YES


dbca -silent \
  -relocatePDB \
  -pdbName pdb5 \
  -sourceDB cdb1 \
  -remotePDBName pdb5 \
  -remoteDBConnString localhost:1521/cdb3 \
  -remoteDBSYSDBAUserName sys \
  -remoteDBSYSDBAUserPassword SysPassword1 \
  -dbLinkUsername c##remote_clone_user \
  -dbLinkUserPassword remote_clone_user
Prepare for db operation
50% complete
Create pluggable database using relocate PDB operation
100% complete
Pluggable database "pdb5" plugged successfully.
Look at the log file "/u01/app/oracle/cfgtoollogs/dbca/cdb1/pdb5/cdb10.log" for further details.
$
```
连接到本地根容器并检查新 PDB 的状态：
```sql
COLUMN name FORMAT A30

SELECT con_id, name, open_mode
FROM   v$pdbs
ORDER BY 1;

    CON_ID NAME                           OPEN_MODE
---------- ------------------------------ ----------
         2 PDB$SEED                       READ ONLY
         3 PDB1                           READ WRITE
         4 PDB5                           READ WRITE

SQL>
```
要将其重新定位，我们需要在本地数据库中创建链接用户：
```sql
CREATE USER c##remote_clone_user IDENTIFIED BY remote_clone_user CONTAINER=ALL;
GRANT CREATE SESSION, CREATE PLUGGABLE DATABASE TO c##remote_clone_user CONTAINER=ALL;
GRANT SYSOPER TO c##remote_clone_user CONTAINER=ALL;
```
确保将环境设置为指向远程实例 “cdb3”，并从 “cdb1” 实例中名为 “pdb5” 的本地 PDB 中重新定位名为 “pdb5” 的 PDB。
```bash
export ORACLE_SID=cdb3
export ORAENV_ASK=NO
. oraenv
export ORAENV_ASK=YES


dbca -silent \
  -relocatePDB \
  -pdbName pdb5 \
  -sourceDB cdb3 \
  -remotePDBName pdb5 \
  -remoteDBConnString localhost:1521/cdb1 \
  -remoteDBSYSDBAUserName sys \
  -remoteDBSYSDBAUserPassword SysPassword1 \
  -dbLinkUsername c##remote_clone_user \
  -dbLinkUserPassword remote_clone_user
Prepare for db operation
50% complete
Create pluggable database using relocate PDB operation
100% complete
Pluggable database "pdb5" plugged successfully.
Look at the log file "/u01/app/oracle/cfgtoollogs/dbca/cdb1/pdb5/cdb10.log" for further details.
$
```
连接到远程根容器并检查新 PDB 的状态：
```sql
COLUMN name FORMAT A30

SELECT con_id, name, open_mode
FROM   v$pdbs
ORDER BY 1;

    CON_ID NAME                           OPEN_MODE
---------- ------------------------------ ----------
         2 PDB$SEED                       READ ONLY
         3 PDB5                           READ WRITE

SQL>
```
# 三、附录
这些示例中使用的实例和可插入数据库是使用以下命令创建的：
```bash
# Local container (cdb1).
dbca -silent -createDatabase \
 -templateName General_Purpose.dbc \
 -gdbname cdb1 -sid cdb1 -responseFile NO_VALUE \
 -characterSet AL32UTF8 \
 -sysPassword SysPassword1 \
 -systemPassword SysPassword1 \
 -createAsContainerDatabase true \
 -numberOfPDBs 1 \
 -pdbName pdb1 \
 -pdbAdminPassword PdbPassword1 \
 -databaseType MULTIPURPOSE \
 -memoryMgmtType auto_sga \
 -totalMemory 2048 \
 -storageType FS \
 -datafileDestination "/u02/oradata/" \
 -redoLogFileSize 50 \
 -emConfiguration NONE \
 -ignorePreReqs

# Remote container (cdb3) with PDB (pdb5).
dbca -silent -createDatabase \
 -templateName General_Purpose.dbc \
 -gdbname cdb3 -sid cdb3 -responseFile NO_VALUE \
 -characterSet AL32UTF8 \
 -sysPassword SysPassword1 \
 -systemPassword SysPassword1 \
 -createAsContainerDatabase true \
 -numberOfPDBs 1 \
 -pdbName pdb5 \
 -pdbAdminPassword PdbPassword1 \
 -databaseType MULTIPURPOSE \
 -memoryMgmtType auto_sga \
 -totalMemory 2048 \
 -storageType FS \
 -datafileDestination "/u02/oradata/" \
 -redoLogFileSize 50 \
 -emConfiguration NONE \
 -ignorePreReqs

 

# Delete the instances.
#dbca -silent -deleteDatabase -sourceDB cdb1 -sysDBAUserName sys -sysDBAPassword SysPassword1
#dbca -silent -deleteDatabase -sourceDB cdb3 -sysDBAUserName sys -sysDBAPassword SysPassword1
```
数据库启用了 Oracle Managed Files (OMF) 并切换到归档日志模式：
```sql
export ORAENV_ASK=NO
export ORACLE_SID=cdb3
. oraenv
export ORAENV_ASK=YES

sqlplus / as sysdba <<EOF

ALTER SYSTEM SET db_create_file_dest = '/u02/oradata';

SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE OPEN;

ALTER PLUGGABLE DATABASE pdb5 OPEN;
ALTER PLUGGABLE DATABASE pdb5 SAVE STATE;

EXIT;
EOF


export ORAENV_ASK=NO
export ORACLE_SID=cdb1
. oraenv
export ORAENV_ASK=YES

sqlplus / as sysdba <<EOF

ALTER SYSTEM SET db_create_file_dest = '/u02/oradata';

SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE OPEN;

ALTER PLUGGABLE DATABASE pdb1 OPEN;
ALTER PLUGGABLE DATABASE pdb1 SAVE STATE;

EXIT;
EOF
```