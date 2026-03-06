---
title: [译] DBMS_CLOUD 包
date: 2022-01-06 16:01:07
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/232395
---

>原文地址：[https://oracle-base.com/articles/21c/dbms_cloud-package](https://oracle-base.com/articles/21c/dbms_cloud-package)
原文作者：Tim Hall

本文介绍了 `DBMS_CLOUD` 包的基本用法。
@[TOC](目录)
自治数据库中引入了 DBMS_CLOUD 包，以提供一种与数据库中的对象存储进行交互的简单方法。它可用于版本 19c 和 21c 的本地安装。 它同样适用于 AWS S3 存储 buckets 或 Oracle Cloud Object Storage 存储 buckets。

# 先决条件
本文中的大多数示例都使用 `DBMS_CLOUD` 包的本地安装，但某些功能似乎只能在自治数据库上正常工作，过程中我将强调这些限制出现的地方。

DBMS_CLOUD 包默认存在于自治数据库中，它未安装在 Oracle 19c 或 21c 安装中，因此必须手动安装，此 MOS 说明中描述了安装。
- [How To Setup And Use DBMS_CLOUD Package (Doc ID 2748362.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=2748362.1)

可以参考下方的安装示例：
- [DBMS_CLOUD : Installation on 19c and 21c On-Prem Databases](https://oracle-base.com/articles/21c/dbms_cloud-installation)

对于某些示例，我们需要一个对象存储 buckets。这可以是 Oracle Cloud Object Store 存储 buckets 或 AWS S3 存储 buckets。以下文章介绍了如何创建 Oracle Cloud Object Store 存储 buckets。
- [Oracle Cloud Infrastructure (OCI) : Create an Object Storage Bucket](https://oracle-base.com/articles/vm/oracle-cloud-infrastructure-oci-create-an-object-storage-bucket)

# 安装
我们创建一个测试用户，确保用户可以创建凭据，并授予其访问 DBMS_CLOUD 包的权限。
```sql
conn sys/SysPassword1@//localhost:1521/pdb1 as sysdba

--drop user testuser1 cascade;
create user testuser1 identified by testuser1 quota unlimited on users;
grant connect, resource to testuser1;

grant create credential to testuser1;
grant execute on dbms_cloud to testuser1;
```
我们需要一个本地目录对象来与数据库文件服务器上的文件进行交互，授予 test 用户和 `C##CLOUD$SERVICE` 用户访问此目录的权限。
```sql
create or replace directory tmp_files_dir as '/tmp/files';
grant read, write on directory tmp_files_dir to testuser1, C##CLOUD$SERVICE;
```
外部表功能需要访问名为 `DATA_PUMP_DIR` 的目录对象，因此在 `PDB` 中创建它并向测试用户授予读/写访问权限。
```sql
alter session set "_oracle_script"=TRUE;
create or replace directory data_pump_dir as '/u01/app/oracle/admin/cdb1/dpdump/';
alter session set "_oracle_script"=FALSE;
grant read, write on directory data_pump_dir to testuser1;
```
连接到测试用户并创建下表：
```sql
conn testuser1/testuser1@//localhost:1521/pdb1

create table emp (
  empno    number(4,0), 
  ename    varchar2(10 byte), 
  job      varchar2(9 byte), 
  mgr      number(4,0), 
  hiredate date, 
  sal      number(7,2), 
  comm     number(7,2), 
  deptno   number(2,0), 
  constraint pk_emp primary key (empno)
);
  
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7369,'SMITH','CLERK',7902,to_date('17-DEC-80','DD-MON-RR'),800,null,20);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7499,'ALLEN','SALESMAN',7698,to_date('20-FEB-81','DD-MON-RR'),1600,300,30);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7521,'WARD','SALESMAN',7698,to_date('22-FEB-81','DD-MON-RR'),1250,500,30);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7566,'JONES','MANAGER',7839,to_date('02-APR-81','DD-MON-RR'),2975,null,20);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7654,'MARTIN','SALESMAN',7698,to_date('28-SEP-81','DD-MON-RR'),1250,1400,30);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7698,'BLAKE','MANAGER',7839,to_date('01-MAY-81','DD-MON-RR'),2850,null,30);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7782,'CLARK','MANAGER',7839,to_date('09-JUN-81','DD-MON-RR'),2450,null,10);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7788,'SCOTT','ANALYST',7566,to_date('19-APR-87','DD-MON-RR'),3000,null,20);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7839,'KING','PRESIDENT',null,to_date('17-NOV-81','DD-MON-RR'),5000,null,10);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7844,'TURNER','SALESMAN',7698,to_date('08-SEP-81','DD-MON-RR'),1500,0,30);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7876,'ADAMS','CLERK',7788,to_date('23-MAY-87','DD-MON-RR'),1100,null,20);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7900,'JAMES','CLERK',7698,to_date('03-DEC-81','DD-MON-RR'),950,null,30);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7902,'FORD','ANALYST',7566,to_date('03-DEC-81','DD-MON-RR'),3000,null,20);
insert into emp (empno,ename,job,mgr,hiredate,sal,comm,deptno) values (7934,'MILLER','CLERK',7782,to_date('23-JAN-82','DD-MON-RR'),1300,null,10);
commit;
```
本文中所有 SQL 操作均由测试用户执行，除非特殊说明。
```sql
conn testuser1/testuser1@//localhost:1521/pdb1
```
# 对象存储 URI
对于本文中的许多示例，我们使用对象存储 URI。对于 Oracle Cloud，URI 可以采用这些形式之一。
```sql
https://swiftobjectstorage.{region}.oraclecloud.com/v1/{namespace}/{bucket}/{objectname}

https://objectstorage.{region}.oraclecloud.com/n/{namespace}/b/{bucket}/o/{objectname}
```
本文主要使用 `swiftobjectstorage` URI，但两者都有效。 在本文的其余部分，我们将使用 `swiftobjectstorage` URI。

AWS S3 和 Azure blob 存储 URI 通常如下所示：
```sql
AWS S3: https://s3-{region}.amazonaws.com/{bucket}/{objectname}
Azure Blog Storage: https://{account}.blob.core.windows.net/{container}/{objectname}
```
# 对象存储凭证
DBMS_CLOUD 包包含来自 DBMS_CREDENTIAL 包的过程的副本。这两个包可以互换使用，因为它们做同样的事情。
- [DBMS_CREDENTIAL : Persist Database and OS Credentials in Oracle Database 12c Release 1 (12.1)](https://oracle-base.com/articles/12c/dbms_credential-12cr1)

使用 `CREATE_CREDENTIAL` 过程为您的对象存储创建凭证。对于 Oracle 对象存储桶，我们使用我们的 Oracle Cloud 电子邮件和我们生成的身份验证令牌。
```sql
begin
  dbms_cloud.create_credential (
    credential_name => 'obj_store_cred',
    username        => 'me@example.com',
    password        => '{my-Auth-Token}'
  ) ;
end;
/
```
对于 AWS 存储 buckets，我们使用我们的 AWS 访问密钥和秘密访问密钥。
```sql
begin
  dbms_cloud.create_credential (
    credential_name => 'obj_store_cred',
    username        => 'my AWS access key',
    password        => 'my AWS secret access key'
  );
end;
/
```
可以使用 USER_CREDENTIALS 视图显示有关凭证的信息。
```sql
column credential_name format a25
column username format a20

select credential_name,
       username,
       enabled
from   user_credentials
order by credential_name;

CREDENTIAL_NAME           USERNAME             ENABL
------------------------- -------------------- -----
OBJ_STORE_CRED            me@example.com       TRUE

SQL>
```
DISABLE_CREDENTIAL 和 ENABLE_CREDENTIAL 过程分别禁用和启用凭据。
```sql
begin
  dbms_credential.disable_credential('obj_store_cred');

  dbms_credential.enable_credential('obj_store_cred');
end;/
```
UPDATE_CREDENTIALS 过程允许我们编辑凭证的属性。
```sql
begin
  dbms_credential.update_credential(
    credential_name => 'obj_store_cred',
    attribute       => 'username', 
    value           => 'me@example.com');

  dbms_credential.update_credential(
    credential_name => 'obj_store_cred',
    attribute       => 'password', 
    value           => '{my-Auth-Token}');
end;
/
```
DROP_CREDENTIAL 过程删除命名凭据。
```sql
begin
  dbms_cloud.drop_credential(credential_name => 'obj_store_cred');
end;
/
```
以下示例需要有效凭据。
# 对象和文件
有几个例程可用于操作本地数据库文件系统上的文件和云对象存储中的对象。

在数据库服务器文件系统上创建一个文件。
```bash
mkdir -p /tmp/files
echo "This is a test file" > /tmp/files/test1.txt
```
我们使用 PUT_OBJECT 过程将文件从目录对象位置传输到云对象存储。
```sql
begin
  dbms_cloud.put_object (
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/test1.txt',
    directory_name  => 'tmp_files_dir',
    file_name       => 'test1.txt');
end;
/
```
PUT_OBJECT 过程有一个重载，用于将 BLOB 的内容传输到对象存储。
```sql
declare
  l_file blob;
begin
  l_file := utl_raw.cast_to_raw('This is another test file');

  dbms_cloud.put_object (
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/test2.txt',
    contents        => l_file);
end;
/
```
LIST_OBJECTS 表函数列出对象存储 URI 指向的位置中的对象。
```sql
set linesize 150
column object_name format a12
column checksum format a35
column created format a35
column last_modified format a35

select *
from   dbms_cloud.list_objects(
        credential_name => 'obj_store_cred',
        location_uri    => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket');

OBJECT_NAME       BYTES CHECKSUM                            CREATED                             LAST_MODIFIED
------------ ---------- ----------------------------------- ----------------------------------- -----------------------------------
test1.txt            20 5dd39cab1c53c2c77cd352983f9641e1                                        11-SEP-21 08.45.42.779000 AM +00:00
test2.txt            25 d0914057907f9d04dd9e68b1c1e180f0                                        11-SEP-21 08.45.54.148000 AM +00:00

SQL>
```
我们使用 GET_METADATA 函数返回有关特定对象的信息。
```sql
select dbms_cloud.get_metadata(
         credential_name => 'obj_store_cred',
         object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/test2.txt') as metadata
from dual;

METADATA
--------------------------------------------------------------------------------
{"Content-Length":25}

SQL>
```
我们使用 GET_OBJECT 过程将对象从云对象存储传输到目录对象位置。
```sql
begin
  dbms_cloud.get_object (
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/test2.txt',
    directory_name  => 'tmp_files_dir',
    file_name       => 'test2.txt');
end;
/
```
有一个 GET_OBJECT 函数可以将对象从云对象存储传输到 BLOB。
```sql
declare
  l_file blob;
begin
  l_file := dbms_cloud.get_object (
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/test2.txt');
end;
/
```
DELETE_OBJECT 过程从云对象存储中删除对象。
```sql
begin
  dbms_cloud.delete_object(
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/test1.txt');

  dbms_cloud.delete_object(
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/test2.txt');
end;
/
```
DELETE_FILE 过程从目录对象位置删除文件。
```sql
begin
  dbms_cloud.delete_file(
    directory_name => 'tmp_files_dir',
    file_name      => 'test1.txt');

  dbms_cloud.delete_file(
    directory_name => 'tmp_files_dir',
    file_name      => 'test2.txt');
end;
/
```
LIST_FILES 表函数列出指定 Oracle 目录对象指向的位置中的文件。 文档说它只支持映射到 Oracle 文件系统 (OFS) 或数据库文件系统 (DBFS) 文件系统的目录对象，所以我们不能将它用于常规文件系统。 它确实在自治数据库上提供的位置工作。
```sql
select *
from   dbms_cloud.list_files(directory_name => 'data_pump_dir');
```
# 外部表
本节介绍基于云对象存储中的文件创建外部表。

## CREATE_EXTERNAL_TABLE
我们使用以下内容创建一个名为“emp.dat”的文件并将其放入我们的对象存储中。 它是一个没有标题的管道分隔文件。
```sql
7369|"SMITH"|"CLERK"|7902|17-DEC-80|800||20
7499|"ALLEN"|"SALESMAN"|7698|20-FEB-81|1600|300|30
7521|"WARD"|"SALESMAN"|7698|22-FEB-81|1250|500|30
7566|"JONES"|"MANAGER"|7839|02-APR-81|2975||20
7654|"MARTIN"|"SALESMAN"|7698|28-SEP-81|1250|1400|30
7698|"BLAKE"|"MANAGER"|7839|01-MAY-81|2850||30
7782|"CLARK"|"MANAGER"|7839|09-JUN-81|2450||10
7788|"SCOTT"|"ANALYST"|7566|19-APR-87|3000||20
7839|"KING"|"PRESIDENT"||17-NOV-81|5000||10
7844|"TURNER"|"SALESMAN"|7698|08-SEP-81|1500|0|30
7876|"ADAMS"|"CLERK"|7788|23-MAY-87|1100||20
7900|"JAMES"|"CLERK"|7698|03-DEC-81|950||30
7902|"FORD"|"ANALYST"|7566|03-DEC-81|3000||20
7934|"MILLER"|"CLERK"|7782|23-JAN-82|1300||10
```
CREATE_EXTERNAL_TABLE 过程基于云对象存储中的文件创建名为 EMP_EXT 的外部表。
```sql
--drop table emp_ext;

begin
  dbms_cloud.create_external_table(
    table_name      => 'emp_ext',
    credential_name => 'obj_store_cred',
    file_uri_list   => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/emp.dat',
    column_list     => 'empno     number(4),
                        ename     varchar2(10),
                        job       varchar2(9),
                        mgr       number(4),
                        hiredate  date,
                        sal       number(7,2),
                        comm      number(7,2),
                        deptno    number(2)',
    format          => json_object('ignoremissingcolumns' value 'true', 'removequotes' value 'true')
 );
end;
/
```
我们查询外部表，它从云对象存储中读取数据。
```sql
select * from emp_ext;

     EMPNO ENAME      JOB              MGR HIREDATE         SAL       COMM     DEPTNO
---------- ---------- --------- ---------- --------- ---------- ---------- ----------
      7369 SMITH      CLERK           7902 17-DEC-80        800                    20
      7499 ALLEN      SALESMAN        7698 20-FEB-81       1600        300         30
      7521 WARD       SALESMAN        7698 22-FEB-81       1250        500         30
      7566 JONES      MANAGER         7839 02-APR-81       2975                    20
      7654 MARTIN     SALESMAN        7698 28-SEP-81       1250       1400         30
      7698 BLAKE      MANAGER         7839 01-MAY-81       2850                    30
      7782 CLARK      MANAGER         7839 09-JUN-81       2450                    10
      7788 SCOTT      ANALYST         7566 19-APR-87       3000                    20
      7839 KING       PRESIDENT            17-NOV-81       5000                    10
      7844 TURNER     SALESMAN        7698 08-SEP-81       1500          0         30
      7876 ADAMS      CLERK           7788 23-MAY-87       1100                    20
      7900 JAMES      CLERK           7698 03-DEC-81        950                    30
      7902 FORD       ANALYST         7566 03-DEC-81       3000                    20
      7934 MILLER     CLERK           7782 23-JAN-82       1300                    10

14 rows selected.

SQL>
```
FORMAT 参数允许我们调整加载过程以适应数据文件内容。 可以在此处找到格式选项的完整列表，以下示例适用于 CSV 文件。

我们使用以下内容创建一个名为“emp.csv”的文件并将其放入我们的对象存储中。 它是一个带有标题行的 CSV 文件。
```sql
"EMPNO","ENAME","JOB","MGR","HIREDATE","SAL","COMM","DEPTNO"
7369,"SMITH","CLERK",7902,17-DEC-80,800,,20
7499,"ALLEN","SALESMAN",7698,20-FEB-81,1600,300,30
7521,"WARD","SALESMAN",7698,22-FEB-81,1250,500,30
7566,"JONES","MANAGER",7839,02-APR-81,2975,,20
7654,"MARTIN","SALESMAN",7698,28-SEP-81,1250,1400,30
7698,"BLAKE","MANAGER",7839,01-MAY-81,2850,,30
7782,"CLARK","MANAGER",7839,09-JUN-81,2450,,10
7788,"SCOTT","ANALYST",7566,19-APR-87,3000,,20
7839,"KING","PRESIDENT",,17-NOV-81,5000,,10
7844,"TURNER","SALESMAN",7698,08-SEP-81,1500,0,30
7876,"ADAMS","CLERK",7788,23-MAY-87,1100,,20
7900,"JAMES","CLERK",7698,03-DEC-81,950,,30
7902,"FORD","ANALYST",7566,03-DEC-81,3000,,20
7934,"MILLER","CLERK",7782,23-JAN-82,1300,,10
```
CREATE_EXTERNAL_TABLE 过程基于云对象存储中的文件创建名为 EMP_CSV_EXT 的外部表。
```sql
--drop table emp_csv_ext;

begin
  dbms_cloud.create_external_table(
    table_name      => 'emp_csv_ext',
    credential_name => 'obj_store_cred',
    file_uri_list   => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/emp.csv',
    column_list     => 'empno     number(4),
                        ename     varchar2(10),
                        job       varchar2(9),
                        mgr       number(4),
                        hiredate  date,
                        sal       number(7,2),
                        comm      number(7,2),
                        deptno    number(2)',
    format          => json_object('type' value 'csv', 'skipheaders' value '1')
 );
end;
/
```
我们查询外部表，它从云对象存储中读取数据。
```sql
select * from emp_csv_ext;

     EMPNO ENAME      JOB              MGR HIREDATE         SAL       COMM     DEPTNO
---------- ---------- --------- ---------- --------- ---------- ---------- ----------
      7369 SMITH      CLERK           7902 17-DEC-80        800                    20
      7499 ALLEN      SALESMAN        7698 20-FEB-81       1600        300         30
      7521 WARD       SALESMAN        7698 22-FEB-81       1250        500         30
      7566 JONES      MANAGER         7839 02-APR-81       2975                    20
      7654 MARTIN     SALESMAN        7698 28-SEP-81       1250       1400         30
      7698 BLAKE      MANAGER         7839 01-MAY-81       2850                    30
      7782 CLARK      MANAGER         7839 09-JUN-81       2450                    10
      7788 SCOTT      ANALYST         7566 19-APR-87       3000                    20
      7839 KING       PRESIDENT            17-NOV-81       5000                    10
      7844 TURNER     SALESMAN        7698 08-SEP-81       1500          0         30
      7876 ADAMS      CLERK           7788 23-MAY-87       1100                    20
      7900 JAMES      CLERK           7698 03-DEC-81        950                    30
      7902 FORD       ANALYST         7566 03-DEC-81       3000                    20
      7934 MILLER     CLERK           7782 23-JAN-82       1300                    10

14 rows selected.

SQL>
```
VALIDATE_EXTERNAL_TABLE 过程允许我们检查外部表的有效性。
```sql
begin
  dbms_cloud.validate_external_table('emp_csv_ext');
end;
/
```
## CREATE_EXTERNAL_PART_TABLE
使用以下查询创建四个 CSV 文件：
```sql
set markup csv on quote on
set trimspool on linesize 1000 feedback off pagesize 0

spool /tmp/files/gbr1.txt
select 'GBR',
       object_id,
       owner,
       object_name
from   all_objects
where  object_id <= 2000
and    rownum <= 1000;
spool off

spool /tmp/files/gbr2.txt
select 'GBR',
       object_id,
       owner,
       object_name
from   all_objects
where  object_id BETWEEN 2000 AND 3999
and    rownum <= 1000;
spool off

spool /tmp/files/ire1.txt
select 'IRE',
       object_id,
       owner,
       object_name
from   all_objects
where  object_id <= 2000
and    rownum <= 1000;
spool off

spool /tmp/files/ire2.txt
select 'IRE',
       object_id,
       owner,
       object_name
from   all_objects
where  object_id BETWEEN 2000 AND 3999
and    rownum <= 1000;
spool off

set markup csv off
set trimspool on linesize 1000 feedback off pagesize 14
```
在上传文件之前，您可能需要稍微清理文件的开头和结尾。 将文件复制到对象存储：
```sql
begin
  dbms_cloud.put_object (
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/gbr1.txt',
    directory_name  => 'tmp_files_dir',
    file_name       => 'gbr1.txt');
end;
/

begin
  dbms_cloud.put_object (
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/gbr2.txt',
    directory_name  => 'tmp_files_dir',
    file_name       => 'gbr2.txt');
end;
/

begin
  dbms_cloud.put_object (
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/ire1.txt',
    directory_name  => 'tmp_files_dir',
    file_name       => 'ire1.txt');
end;
/

begin
  dbms_cloud.put_object (
    credential_name => 'obj_store_cred',
    object_uri      => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/ire2.txt',
    directory_name  => 'tmp_files_dir',
    file_name       => 'ire2.txt');
end;
/
```
CREATE_EXTERNAL_PART_TABLE 过程基于云对象存储中的文件创建名为 COUNTRY_PART_TAB_EXT 的外部分区表。
```sql
--drop table country_part_tab_ext;

begin
  dbms_cloud.create_external_part_table(
    table_name      => 'country_part_tab_ext',
    credential_name => 'obj_store_cred',
    format          => json_object('type' value 'csv', 'skipheaders' value '1'),
    column_list     => 'country_code  varchar2(3),
                        object_id     number,
                        owner         varchar2(128),
                        object_name   varchar2(128)',
    partitioning_clause => 'partition by list (country_code) (
                              partition part_gbr values (''GBR'') location (
                                ''https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/gbr1.txt'',
                                ''https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/gbr2.txt''
                              ),
                              partition part_ire values (''IRE'') location (
                                ''https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/ire1.txt'',
                                ''https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/ire2.txt''
                              )
                            )'
  );
end;
/
```
我们查询外部表，它从云对象存储中读取数据。
```sql
select country_code, count(*) as amount
from   country_part_tab_ext
group by country_code
order by country_code;

COU     AMOUNT
--- ----------
GBR       2000
IRE       2000

SQL>
```
VALIDATE_EXTERNAL_PART_TABLE 过程允许我们检查外部分区表的有效性。
```sql
begin
  dbms_cloud.validate_external_part_table('country_part_tab_ext');
end;
/
```
## CREATE_HYBRID_PART_TABLE
CREATE_HYBRID_PART_TABLE 过程基于云对象存储中的文件创建一个名为 COUNTRY_HYBRID_PART_TAB_EXT 的外部混合分区表。
```sql
--drop table country_hybrid_part_tab_ext;

begin
  dbms_cloud.create_hybrid_part_table(
    table_name      => 'country_hybrid_part_tab_ext',
    credential_name => 'obj_store_cred',
    format          => json_object('type' value 'csv', 'skipheaders' value '1'),
    column_list     => 'country_code  varchar2(3),
                        object_id     number,
                        owner         varchar2(128),
                        object_name   varchar2(128)',
    partitioning_clause => 'partition by list (country_code) (
                              partition part_gbr values (''GBR'') external location (
                                ''https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/gbr1.txt'',
                                ''https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/gbr2.txt''
                              ),
                              partition part_ire values (''IRE'') external location (
                                ''https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/ire1.txt'',
                                ''https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/ire2.txt''
                              ),
                              partition part_usa values (''USA'')
                            )'
  );
end;
/
```
我们在常规分区中插入一行。
```sql
insert into country_hybrid_part_tab_ext values ('USA', 123, 'banana', 'banana');
commit;
```
我们查询外部表，它从云对象存储中读取数据。
```sql
select country_code, count(*) as amount
from   country_hybrid_part_tab_ext
group by country_code
order by country_code;

COU     AMOUNT
--- ----------
GBR       2000
IRE       2000
USA          1

SQL>
```
VALIDATE_HYBRID_PART_TABLE 过程允许我们检查外部混合分区表的有效性。
```sql
begin
  dbms_cloud.validate_hybrid_part_table('country_hybrid_part_tab_ext');
end;
/
```
## COPY_DATA
COPY_DATA 过程允许我们将数据从云对象存储复制到现有表中。

我们使用以下内容创建一个名为“emp.csv”的文件并将其放入我们的对象存储中。 它是一个带有标题行的 CSV 文件。
```sql
"EMPNO","ENAME","JOB","MGR","HIREDATE","SAL","COMM","DEPTNO"
7369,"SMITH","CLERK",7902,17-DEC-80,800,,20
7499,"ALLEN","SALESMAN",7698,20-FEB-81,1600,300,30
7521,"WARD","SALESMAN",7698,22-FEB-81,1250,500,30
7566,"JONES","MANAGER",7839,02-APR-81,2975,,20
7654,"MARTIN","SALESMAN",7698,28-SEP-81,1250,1400,30
7698,"BLAKE","MANAGER",7839,01-MAY-81,2850,,30
7782,"CLARK","MANAGER",7839,09-JUN-81,2450,,10
7788,"SCOTT","ANALYST",7566,19-APR-87,3000,,20
7839,"KING","PRESIDENT",,17-NOV-81,5000,,10
7844,"TURNER","SALESMAN",7698,08-SEP-81,1500,0,30
7876,"ADAMS","CLERK",7788,23-MAY-87,1100,,20
7900,"JAMES","CLERK",7698,03-DEC-81,950,,30
7902,"FORD","ANALYST",7566,03-DEC-81,3000,,20
7934,"MILLER","CLERK",7782,23-JAN-82,1300,,10
```
我们截断本地 EMP 表并使用 COPY_DATA 过程从云对象存储重新加载数据。
```sql
truncate table emp;

begin
  dbms_cloud.copy_data(
    table_name      => 'emp',
    credential_name => 'obj_store_cred',
    file_uri_list   => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/emp.csv',
    format          => json_object('type' value 'csv', 'skipheaders' value '1')
  );
end;
/
```
我们查询EMP表，可以看到数据已经加载完毕。
```sql
select * from emp;

     EMPNO ENAME      JOB              MGR HIREDATE         SAL       COMM     DEPTNO
---------- ---------- --------- ---------- --------- ---------- ---------- ----------
      7369 SMITH      CLERK           7902 17-DEC-80        800                    20
      7499 ALLEN      SALESMAN        7698 20-FEB-81       1600        300         30
      7521 WARD       SALESMAN        7698 22-FEB-81       1250        500         30
      7566 JONES      MANAGER         7839 02-APR-81       2975                    20
      7654 MARTIN     SALESMAN        7698 28-SEP-81       1250       1400         30
      7698 BLAKE      MANAGER         7839 01-MAY-81       2850                    30
      7782 CLARK      MANAGER         7839 09-JUN-81       2450                    10
      7788 SCOTT      ANALYST         7566 19-APR-87       3000                    20
      7839 KING       PRESIDENT            17-NOV-81       5000                    10
      7844 TURNER     SALESMAN        7698 08-SEP-81       1500          0         30
      7876 ADAMS      CLERK           7788 23-MAY-87       1100                    20
      7900 JAMES      CLERK           7698 03-DEC-81        950                    30
      7902 FORD       ANALYST         7566 03-DEC-81       3000                    20
      7934 MILLER     CLERK           7782 23-JAN-82       1300                    10

14 rows selected.

SQL>
```
与外部表示例类似，FORMAT 参数允许我们定制加载过程以适应数据文件内容。

## Export Data
EXPORT_DATA 过程获取查询生成的数据，并以请求的格式将其导出到云对象存储。 这似乎不适用于 DBMS_CLOUD 包的本地版本，但适用于自治数据库。
```sql
begin
  dbms_cloud.export_data (
    credential_name => 'obj_store_cred',
    file_uri_list   => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/emp.json',
    query           => 'select * from emp',
    format          => '{"type" : "JSON"}'
  );
end;
/

begin
  dbms_cloud.export_data (
    credential_name => 'obj_store_cred',
    file_uri_list   => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/emp.csv',
    query           => 'select * from emp',
    format          => '{"type" : "CSV"}'
  );
end;
/
```
# SODA Collections
Oracle 数据库可用作使用简单 Oracle 文档访问 (SODA) 的文档存储。 您可以在此处阅读有关 SODA 的信息。

我们创建一个名为“TestCollection1”的新集合。
```sql
set serveroutput on

declare
  l_collection  soda_collection_t;
begin
  l_collection := dbms_soda.create_collection('TestCollection1');

  if l_collection is not null then
    dbms_output.put_line('Collection ID : ' || l_collection.get_name());
  else
    dbms_output.put_line('Collection does not exist.');  
  end if;
end;
/
Collection ID : TestCollection1


PL/SQL procedure successfully completed.

SQL>
```
使用以下内容创建一个名为“fruit.json”的文件并将其上传到您的云对象存储。
```sql
{"fruit": "banana"}
```
COPY_COLLECTION 过程将数据从我们的云对象存储加载到集合中。
```sql
begin
  dbms_cloud.copy_collection(
    collection_name => 'TestCollection1',
    credential_name => 'obj_store_cred',
    file_uri_list   => 'https://swiftobjectstorage.uk-london-1.oraclecloud.com/v1/my-namespace/ob-bucket/fruit.json',
    format          => json_object('unpackarrays' value 'true')
  );
end;
/
```
我们可以使用以下查询查看集合中的数据。
```sql
select json_document
from   "TestCollection1";

JSON_DOCUMENT
--------------------------------------------------------------------------------
{"fruit":"banana"}

SQL>
```
# 删除操作
许多 DBMS_CLOUD 操作会产生额外的文件（日志文件、坏文件、临时文件等）。 一旦操作完成，这些需要清理。 上面显示的几个过程具有返回操作 ID 值的重载，该值可与 DELETE_OPERATION 过程一起使用以清理额外的文件。 或者，可以使用 USER_LOAD_OPERATIONS 视图显示当前会话的操作。
```sql
SQL> desc user_load_operations
 Name                                                  Null?    Type
 ----------------------------------------------------- -------- ------------------------------------
 ID                                                    NOT NULL NUMBER
 TYPE                                                  NOT NULL VARCHAR2(128)
 SID                                                   NOT NULL NUMBER
 SERIAL#                                               NOT NULL NUMBER
 START_TIME                                                     TIMESTAMP(6) WITH TIME ZONE
 UPDATE_TIME                                                    TIMESTAMP(6) WITH TIME ZONE
 STATUS                                                         VARCHAR2(9)
 OWNER_NAME                                                     VARCHAR2(128)
 TABLE_NAME                                                     VARCHAR2(128)
 PARTITION_NAME                                                 VARCHAR2(128)
 SUBPARTITION_NAME                                              VARCHAR2(128)
 FILE_URI_LIST                                                  VARCHAR2(4000)
 ROWS_LOADED                                                    NUMBER
 LOGFILE_TABLE                                                  VARCHAR2(128)
 BADFILE_TABLE                                                  VARCHAR2(128)
 TEMPEXT_TABLE                                                  VARCHAR2(128)

SQL>
```
我们使用 USER_LOAD_OPERATIONS 视图返回当前会话的操作。
```sql
column type format a10

select id, type
from   user_load_operations
order by 1;

        ID TYPE
---------- ----------
         1 COPY
        11 COPY

SQL>
```
DELETE_OPERATION 过程允许我们清除与特定操作相关的附加文件。
```sql
begin
  dbms_cloud.delete_operation(1);
end;
/


select id, type
from   user_load_operations
order by 1;

        ID TYPE
---------- ----------
        11 COPY

SQL>
```
DELETE_ALL_OPERATIONS 过程允许我们清理所有操作的附加文件，或者如果我们指定类型值，则清理特定类型操作的附加文件。
```sql
-- Delete only COPY operations.
begin
  dbms_cloud.delete_all_operations('COPY');
end;
/

-- Delete all operations.
begin
  dbms_cloud.delete_all_operations;
end;
/
```