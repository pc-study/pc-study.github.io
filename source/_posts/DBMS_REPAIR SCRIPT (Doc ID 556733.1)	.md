---
title: DBMS_REPAIR SCRIPT (Doc ID 556733.1)	
date: 2021-12-14 15:12:02
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/199050
---

# APPLIES TO
Oracle Database - Enterprise Edition - Version 8.1.5.0 and later
Oracle Database Cloud Schema Service - Version N/A and later
Gen 1 Exadata Cloud at Customer (Oracle Exadata Database Cloud Machine) - Version N/A and later
Oracle Cloud Infrastructure - Database Service - Version N/A and later
Oracle Database Backup Service - Version N/A and later
Information in this document applies to any platform.
Checked for relevance on 11-Sep-2012
Checked for relevance on 21-Nov-2013
Checked for relevance on 26-Feb-2016
# PURPOSE
This script is intended to provide a simple and quick way to run DBMS_REPAIR to identify and skip corrupted blocks

# REQUIREMENTS
SQL*Plus 

# CONFIGURING
Run sqlplus with SYS user

# INSTRUCTIONS
1. Run sqlplus.  Example:
```bash
sqlplus '/ as sysdba'
```
2.  run the script from sqlplus
# CAUTION
This sample code is provided for educational purposes only, and is not supported by Oracle Support. It has been tested internally, however, we do not guarantee that it will work for you. Ensure that you run it in your test environment before using.
# SCRIPT
```sql
REM Create the repair table in a given tablespace:

BEGIN
  DBMS_REPAIR.ADMIN_TABLES (
  TABLE_NAME => 'REPAIR_TABLE',
  TABLE_TYPE => dbms_repair.repair_table,
  ACTION => dbms_repair.create_action,
  TABLESPACE => '&tablespace_name');
END;
/

REM Identify corrupted blocks for schema.object (it also can be done at partition level with parameter PARTITION_NAME):

set serveroutput on
DECLARE num_corrupt INT;
BEGIN
  num_corrupt := 0;
  DBMS_REPAIR.CHECK_OBJECT (
  SCHEMA_NAME => '&schema_name',
  OBJECT_NAME => '&object_name',
  REPAIR_TABLE_NAME => 'REPAIR_TABLE',
  corrupt_count => num_corrupt);
  DBMS_OUTPUT.PUT_LINE('number corrupt: ' || TO_CHAR (num_corrupt));
END;
/

REM Optionally display any corrupted block identified by check_object:

select BLOCK_ID, CORRUPT_TYPE, CORRUPT_DESCRIPTION
from REPAIR_TABLE;

REM Mark the identified blocks as corrupted ( Soft Corrupt - reference Note 1496934.1 )
DECLARE num_fix INT;
BEGIN
  num_fix := 0;
  DBMS_REPAIR.FIX_CORRUPT_BLOCKS (
  SCHEMA_NAME => '&schema_name',
  OBJECT_NAME=> '&object_name',
  OBJECT_TYPE => dbms_repair.table_object,
  REPAIR_TABLE_NAME => 'REPAIR_TABLE',
  FIX_COUNT=> num_fix);
  DBMS_OUTPUT.PUT_LINE('num fix: ' || to_char(num_fix));
END;
/

REM Allow future DML statements to skip the corrupted blocks:

BEGIN
  DBMS_REPAIR.SKIP_CORRUPT_BLOCKS (
  SCHEMA_NAME => '&schema_name',
  OBJECT_NAME => '&object_name',
  OBJECT_TYPE => dbms_repair.table_object,
  FLAGS => dbms_repair.SKIP_FLAG);
END;
/
```
<u>**Notes:**</u>

- Recreate indexes after using DBMS_REPAIR as INDEX scan may produce errors if accessing the corrupt block.  If there is an unique index, then reinserting the same data may also produce error ORA-1.
- Use the dbms_repair.NOSKIP_FLAG in the FLAGS value in procedure SKIP_CORRUPT_BLOCKS if it is needed to stop skipping corrupt blocks in the object after the dbms_repair.SKIP_FLAG was used.
- If the goal is to skip the corrupt blocks for a specific object, it is just needed to run procedure SKIP_CORRUPT_BLOCKS.  Only blocks producing ORA-1578 will be skipped in that case.  If different errors are produced then it is required to run these additional procedures: ADMIN_TABLES, CHECK_OBJECT and FIX_CORRUPT_BLOCKS
- If it is needed to clear a table from corruptions and after using procedure SKIP_CORRUPT_BLOCKS,  the table can be moved with: "alter table <name> MOVE" instead of recreating or truncating it.  Then use the dbms_repair.NOSKIP_FLAG described above. Note that the data inside the corrupt blocks is lost.
- Procedure CHECK_OBJECT gets a DML LOCK (TM) in MODE=3 Row-X (SX) on the segment blocking other sessions trying to execute a DDL or getting another non-compatible TM lock.  Example: other sessions getting a TM lock in mode=2 row-S (SS) or 3 Row-X (SX) are not blocked.  The lock TM mode requested by regular DML statements like UPDATE/DELETE/INSERT is 3 Row-X (SX).