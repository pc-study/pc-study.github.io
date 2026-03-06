---
title: How to Forbid the Usage of ALTER TABLE Command on Tables Owned or Created by Users (Doc ID 234098.1)	
date: 2022-03-04 14:03:39
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/337251
---

PURPOSE
-------
This bulletin explains how to forbid the usage of the ALTER TABLE command on 
tables owned or created by users.

For a user being able to create tables in his own schema or in another schema is
necessarily granted the CREATE TABLE or CREATE ANY TABLE privilege, and 
therefore is automatically assigned the ALTER TABLE or ALTER ANY TABLE 
privilege.

How to inhibit the privilege ALTER TABLE  or ALTER ANY TABLE.


SCOPE & APPLICATION
-------------------
For the Security Administrators who need to apply nuances as regards security.


How to Prevent a User from Altering His Own Tables
--------------------------------------------------
```sql
SQL> connect system/password
Connected.

SQL> CREATE or REPLACE TRIGGER Trigger_Name
     AFTER ALTER on Owner.schema
     BEGIN
     IF( ora_sysevent='ALTER' and ora_dict_obj_owner= 'Owner') THEN 
       RAISE_APPLICATION_ERROR(-20003, 
       'You are not allowed to alter your tables.');
     END IF;
     END;
     /
Trigger created.

SQL> connect user/password
Connected.
SQL> create table table_name (c number);
Table created.

SQL> alter table table_name add (c2 number);
alter table table_name add (c2 number)
*
ERROR at line 1:
ORA-00604: error occurred at recursive SQL level 1
ORA-20003: You are not allowed to alter your tables.
ORA-06512: at line 3
```
How to Prevent a User from Altering Tables owned by others
----------------------------------------------------------
```sql
SQL> connect system/password
Connected.

SQL> CREATE or REPLACE TRIGGER Trigger_Name
     AFTER ALTER on USER1.schema
     BEGIN
     IF (ora_sysevent='ALTER' and
        (ora_dict_obj_owner= 'Owner1' or ora_dict_obj_owner= 'Owner2' )) THEN 
        RAISE_APPLICATION_ERROR(-20003, 
        'You are not allowed to alter tables owned by '||ora_dict_obj_owner||'.');
     END IF;
     END;
     /
Trigger created.

SQL> conn user1/password
Connected.

    ---> The user USER1 does not have the ALTER ANY TABLE privilege

SQL>  alter table schema.table add (c57 number);
 alter table schema.table add (c57 number)
*
ERROR at line 1:
ORA-01031: insufficient privileges

    ---> The user USER1 has the ALTER ANY TABLE privilege

SQL>  alter table schema.table add (c5 number);
 alter table schema.table add (c5 number)
*
ERROR at line 1:
ORA-00604: error occurred at recursive SQL level 1
ORA-20003: You are not allowed to alter tables owned by Owner1
ORA-06512: at line 4

SQL> alter table Owner2.Table2 add (c1 number);
alter table Owner2.Table2 add (c1 number)
*
ERROR at line 1:
ORA-00604: error occurred at recursive SQL level 1
ORA-20003: You are not allowed to alter tables owned by Owner2.
ORA-06512: at line 4
```