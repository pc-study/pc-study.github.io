---
title: [译] 多租户：Oracle Database 19c 中的 DBCA PDB 远程克隆
date: 2022-01-06 16:06:36
tags: [墨力计划,oracle,oracle 19c]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/232396
---

>原文地址：[https://oracle-base.com/articles/19c/multitenant-dbca-pdb-remote-clone-19c](https://oracle-base.com/articles/19c/multitenant-dbca-pdb-remote-clone-19c)
原文作者：Tim Hall

Oracle Database 12c 第 2 版 (12.2) 引入了使用该 `CREATE PLUGGABLE DATABASE` 命令执行远程可插拔数据库 (PDB) 热克隆的功能。在 Oracle 19c 中，可以使用数据库配置助手 (DBCA) 执行可插拔数据库 (PDB) 的远程克隆。

![](https://img-blog.csdnimg.cn/9fee0f7fb46a4670aa1fc4b8ec14a328.png)

@[TOC](目录)
# 一、先决条件
连接到远程 CDB 并准备克隆：
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
```
与常规的远程克隆不同，我们不需要创建数据库链接。我们只需要提供用于创建链接的凭据。DBCA 完成剩下的工作。

检查远程 `CDB` 是否处于本地 undo模式和归档模式：
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

连接到本地 CDB 并准备克隆：
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
# 二、使用 DBCA 远程克隆 PDB
在 19c 中，`DBCA-createPluggableDatabase` 命令有一个新命名的参数 `-createFromRemotePDB`，允许我们通过远程克隆现有 PDB 来创建新的 PDB。
```bash
 [-createFromRemotePDB <Create a pluggable database from Remote PDB clone operation.>]
      -remotePDBName <Name of the pluggable database to clone/relocate>
      -dbLinkUsername <Common user of a remote CDB, used by database link to connect to remote CDB.>
      -remoteDBConnString <EZCONNECT string to connect to Source database for example "host:port/servicename">
      [-remoteDBSYSDBAUserName <User name with SYSDBA privileges of remote database>]
      [-dbLinkUserPassword <Common user password of a remote CDB, used by database link to connect to remote CDB.>]
      [-remoteDBSYSDBAUserPassword <Password for remoteDBSYSDBAUserName user of remote database.>]
      [-sysDBAUserName <User name  with SYSDBA privileges>]
      [-sysDBAPassword <Password for sysDBAUserName user name>]
```
你可以在[此处](https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/creating-and-configuring-an-oracle-database.html#GUID-6EDDC43D-9BD6-4096-8192-7E548B826360)查看该 `-createPluggableDatabase` 命令的完整语法，尽管在编写文档时与该命令提供的实用程序用法不匹配，也可以使用`dbca -createPluggableDatabase -help` 来查看帮助。

确保环境设置为指向本地实例 “cdb1” 并创建一个名为 “pdb5new” 的新 PDB 作为 “cdb3” 实例中名为 “pdb5” 的远程 PDB 的克隆。
```bash
export ORACLE_SID=cdb1
export ORAENV_ASK=NO
. oraenv
export ORAENV_ASK=YES


dbca -silent \
  -createPluggableDatabase \
    -pdbName pdb5new \
    -sourceDB cdb1 \
  -createFromRemotePDB \
    -remotePDBName pdb5 \
    -remoteDBConnString localhost:1521/pdb5 \
    -remoteDBSYSDBAUserName sys \
    -remoteDBSYSDBAUserPassword SysPassword1 \
    -dbLinkUsername c##remote_clone_user \
    -dbLinkUserPassword remote_clone_user 
Prepare for db operation
50% complete
Create pluggable database using remote clone operation
100% complete
Pluggable database "pdb5new" plugged successfully.
Look at the log file "/u01/app/oracle/cfgtoollogs/dbca/cdb1/pdb5new/cdb1.log" for further details.
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
         4 PDB5NEW                        READ WRITE

SQL>
```
我们可以通过使用以下命令删除新的可插入数据库来进行清理：
```bash
dbca -silent \
     -deletePluggableDatabase \
     -sourceDB cdb1 \
     -pdbName pdb5new
Prepare for db operation
25% complete
Deleting Pluggable Database
40% complete
85% complete
92% complete
100% complete
Pluggable database "pdb5new" deleted successfully.
Look at the log file "/u01/app/oracle/cfgtoollogs/dbca/cdb1/pdb5new/cdb14.log" for further details.
$
```
# 三、附录
这些示例中使用的实例和可插入数据库是使用以下命令创建的。
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
```bash
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