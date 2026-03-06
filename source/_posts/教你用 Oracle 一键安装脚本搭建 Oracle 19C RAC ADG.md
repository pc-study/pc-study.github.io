---
title: 教你用 Oracle 一键安装脚本搭建 Oracle 19C RAC ADG
date: 2025-10-16 13:05:45
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1978639223234244608
---

# 前言
最近正好需要搭建一套 RAC to RAC 的 ADG，之前有很多朋友希望可以多分享一些 Oracle 一键安装脚本的使用场景，本文演示一下如何使用 Oracle 一键安装脚本快速搭建一套 19C RAC to RAC 的 ADG 环境。

# 19C RAC ADG 环境搭建
首先，使用 [**Oracle 一键安装脚本**](https://www.modb.pro/course/148) 快速搭建一套 19C RAC 环境：
```bash
[root@dg01:/root]# cat /etc/os-release
NAME="CentOS Linux"
VERSION="7 (Core)"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="7"
PRETTY_NAME="CentOS Linux 7 (Core)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:7"
HOME_URL="https://www.centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"

CENTOS_MANTISBT_PROJECT="CentOS-7"
CENTOS_MANTISBT_PROJECT_VERSION="7"
REDHAT_SUPPORT_PRODUCT="centos"
REDHAT_SUPPORT_PRODUCT_VERSION="7"

[root@dg01:/root]# cat /etc/redhat-release
CentOS Linux release 7.9.2009 (Core)

## 搭建 ADG 不需要创建数据库，只需要安装到 Oracle 软件完成即可
[root@dg01:/soft]# ./OracleShellInstall \
-ud Y `# 安装到Oracle软件结束`\
-lf eth0 `# 公网IP网卡名称`\
-pf eth1 `# 心跳IP网卡名称`\
-n dg`# 主机名前缀`\
-hn dg01,dg02 `# 所有节点主机名`\
-ri 100.99.40.231,100.99.40.232 `# 公网IP地址`\
-vi 100.99.40.233,100.99.40.234 `# 虚拟IP地址`\
-si 100.99.40.235 `# SCAN IP地址`\
-rp oracle `# root用户密码`\
-cn dg-cluster `# 集群名称`\
-sn dg-scan `# SCAN名称`\
-od /dev/sda,/dev/sdb,/dev/sdc `# OCR磁盘组磁盘列表`\
-dd /dev/sde,/dev/sdf,/dev/sdg,/dev/sdh,/dev/sdi,/dev/sdj `# DATA磁盘组磁盘列表`\
-ad /dev/sdd `# ARCH磁盘组磁盘列表`\
-or NORMAL `# OCR磁盘组冗余度`\
-o dgdb `# 数据库名称`\
-tsi 100.98.32.5 `# 时间服务器IP`\
-gpa 36582629 `# Grid PSU/RU补丁编号`\
-jpa 36414915 `# OJVM PSU/RU补丁编号`
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978638934301224960_395407.png)

19C RAC 软件安装完成（包括补丁安装），共花费 35 分钟。

# 搭建 ADG
使用 Duplicate 在线复制的方式搭建 ADG，无需 RMAN 备份，可以通过 RMAN Duplicate 直接在线从主库拷贝文件。

详细的搭建教程可以参考 [**100天精通Oracle 实战系列**](https://www.modb.pro/course/142) 课程中的 [**（第45天）DataGuard 搭建之 RAC 到 RAC**](https://www.modb.pro/course/article/142?lsId=5950&catalogId=5)，课程中有完整的步骤以及教程。

## 主库开启归档和强制日志
搭建 DataGuard 必须要开启归档模式和强制日志模式：
```sql
-- 主库检查是否开启归档和强制日志
SQL> select log_mode,force_logging from v$database;

LOG_MODE     FORCE_LOGGING
------------ ---------------------------------------
ARCHIVELOG   NO

SQL> alter database force logging;

Database altered.

SQL> select log_mode,force_logging from v$database;

LOG_MODE     FORCE_LOGGING
------------ ---------------------------------------
ARCHIVELOG   YES
```

## 主库增加 standby redo 日志
查看主库的在线日志数量以及大小：
```sql
-- 主库的在线日志组数为 4 组
SQL> set line222
set pagesize1000
col member for a60
select t2.thread#,t1.group#,t1.member,t2.bytes/1024/1024 from v$logfile t1,v$log t2 where t1.group#=t2.group# order by 1,2;
```
直接在主库增加 10 组 standby redo log，rman duplicate 复制之后，备库也会同步创建：
```sql
-- 每个节点有 4 组在线重做日志，单个大小为 500 M；需要创建 （4+1）*2= 10 组备库重做日志
SQL> ALTER DATABASE ADD STANDBY LOGFILE THREAD 1
group 10 ('+DATA', '+FRA') SIZE 500M,
group 11 ('+DATA', '+FRA') SIZE 500M,
group 12 ('+DATA', '+FRA') SIZE 500M,
group 13 ('+DATA', '+FRA') SIZE 500M,
group 14 ('+DATA', '+FRA') SIZE 500M;

SQL> ALTER DATABASE ADD STANDBY LOGFILE THREAD 2
group 16 ('+DATA', '+FRA') SIZE 500M,
group 17 ('+DATA', '+FRA') SIZE 500M,
group 18 ('+DATA', '+FRA') SIZE 500M,
group 19 ('+DATA', '+FRA') SIZE 500M,
group 20 ('+DATA', '+FRA') SIZE 500M;
```

## 拷贝密码文件至备库
rac 的密码文件通常存放于 ASM 盘中，查看对应的密码文件位置：
```bash
[oracle@rptdb1:/home/oracle]$ srvctl config database -d rptdb | grep Password
Password file: +DATA/RPTDB/PASSWORD/pwdrptdb.256.1180304871
```
使用 `asmcmd` 进入到 ASM 磁盘组中，复制密码文件到文件系统：
```bash
[grid@rptdb1:/home/grid]$ asmcmd -p
ASMCMD [+] > pwcopy +DATA/RPTDB/PASSWORD/pwdrptdb.256.1180304871 /home/grid/
copying +DATA/RPTDB/PASSWORD/pwdrptdb.256.1180304871 -> /home/grid/pwdrptdb.256.1180304871
```
将密码文件拷贝到备库，并且重命名，命名规则为 `orapw+sid`：
```bash
 ## 拷贝密码文件至备库
[grid@rptdb1:/home/grid]$ scp /home/grid/pwdrptdb.256.1180304871 grid@10.199.40.231:/home/grid/orapwdgdb
grid@10.199.40.231's password: 
pwdrptdb.256.1180304871

## 移动密码文件至备库 ASM 盘
[grid@dg01:/home/grid]$ asmcmd -p
ASMCMD [+] > cd data
ASMCMD [+data] > mkdir DGDB
ASMCMD [+data] > cd DGDB
ASMCMD [+data/DGDB] > mkdir PASSWORD
ASMCMD [+data/DGDB] > ls
PASSWORD/
ASMCMD [+data/DGDB] > cd PASSWORD
ASMCMD [+data/DGDB/PASSWORD] > pwcopy /home/grid/orapwdgdb +DATA/DGDB/PASSWORD/orapwdgdb
copying /home/grid/orapwdgdb -> +DATA/DGDB/PASSWORD/orapwdgdb
ASMCMD [+data/DGDB/PASSWORD] > ls
orapwdgdb
```

## 主库生成参数文件并修改
由于要使用 RMAN 备份在备库恢复，所以需要再主库生成参数文件，修改相关参数后将备库启动到 nomount 状态：
```sql
SQL> create pfile='/home/oracle/pfile_rptdb.ora' from spfile;

File created.
```

### 备库创建参数文件并启动到 nomount
将主库生成并修改后的参数文件在备库创建好（这里建议源端目标端均使用 `OMF`）：
```bash
[oracle@dg01:/home/oracle]$ cat<<-\EOF>/home/oracle/pfile_dgdb.ora
*._gc_policy_time=0
*._gc_undo_affinity=FALSE
*._optimizer_use_feedback=FALSE
*._use_adaptive_log_file_sync='FALSE'
*.audit_file_dest='/u01/app/oracle/admin/dgdb/adump'
*.audit_sys_operations=FALSE
*.audit_trail='NONE'
*.cluster_database=true
*.compatible='19.0.0'
*.control_file_record_keep_time=31
*.control_files='+DATA/RPT/CONTROLFILE/control01.ctl','+DATA/RPT/CONTROLFILE/control02.ctl'
*.db_block_size=8192
*.db_create_file_dest='+DATA'
*.db_files=8192
*.db_name='rptdb'
*.deferred_segment_creation=FALSE
*.diagnostic_dest='/u01/app/oracle'
*.dispatchers='(PROTOCOL=TCP) (SERVICE=dgdbXDB)'
dgdb1.instance_number=1
dgdb2.instance_number=2
*.local_listener='-oraagent-dummy-'
*.log_archive_format='%t_%s_%r.dbf'
*.nls_language='AMERICAN'
*.nls_territory='AMERICA'
*.open_cursors=300
*.parallel_force_local=TRUE
*.parallel_max_servers=64
*.pga_aggregate_target=14719m
*.processes=2560
*.remote_login_passwordfile='exclusive'
*.sga_target=44156m
dgdb2.thread=2
dgdb1.thread=1
*.undo_retention=10800
dgdb2.undo_tablespace='UNDOTBS2'
dgdb1.undo_tablespace='UNDOTBS1'
*.db_unique_name='dgdb'
*.fal_client='RPTDB_STB'
*.fal_server='RPTDB_PRI'
*.log_archive_config='dg_config=(RPTDB,RPT)'
*.log_archive_dest_1='LOCATION=+ARCH VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=RPT'
*.log_archive_dest_2='SERVICE=RPTDB_PRI VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=RPTDB'
*.standby_file_management='AUTO'
EOF
```
备库根据参数文件在两个节点均创建必要的目录：
```bash
[oracle@dg01:/home/oracle]$ mkdir -p /u01/app/oracle/admin/dbdg/adump
[oracle@dg02:/home/oracle]$ mkdir -p /u01/app/oracle/admin/dbdg/adump
```
备库创建初始化参数文件：
```bash
## 节点一
[oracle@dg01:/home/oracle]$ cat<<-\EOF>$ORACLE_HOME/dbs/initdgdb1.ora
spfile='+DATA/DGDB/spfiledgdb.ora'
EOF

## 节点二
[oracle@dg02:/home/oracle]$ cat<<-\EOF>$ORACLE_HOME/dbs/initdgdb2.ora
spfile='+DATA/DGDB/spfiledgdb.ora'
EOF
```
备库节点一创建 spfile：
```sql
Connected to an idle instance.

SQL> create spfile='+DATA/DGDB/spfiledgdb.ora' from pfile='/home/oracle/pfile_dgdb.ora';

File created.
```
备库集群注册数据库实例：
```bash
[oracle@dg01:/home/oracle]$ srvctl add database -d dgdb -o $ORACLE_HOME -p +DATA/DGDB/spfilerpt.ora -pwfile +DATA/DGDB/PASSWORD/orapwdgdb
[oracle@dg01:/home/oracle]$ srvctl add instance -d dgdb -i dgdb1 -n dg01
[oracle@dg01:/home/oracle]$ srvctl add instance -d dgdb -i dgdb2 -n dg02
## 打开节点一到 nomount 状态
[oracle@dg01:/home/oracle]$ srvctl start instance -d dgdb -i dgdb1 -o nomount 
```
备库检查监听：
```bash
[grid@dg02:/home/grid]$ lsnrctl stat LISTENER_SCAN1

LSNRCTL for Linux: Version 19.0.0.0.0 - Production on 16-OCT-2025 11:04:32

Copyright (c) 1991, 2024, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=IPC)(KEY=LISTENER_SCAN1)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER_SCAN1
Version                   TNSLSNR for Linux: Version 19.0.0.0.0 - Production
Start Date                16-OCT-2025 09:47:56
Uptime                    0 days 1 hr. 16 min. 36 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/19.3.0/grid/network/admin/listener.ora
Listener Log File         /u01/app/grid/diag/tnslsnr/dg02/listener_scan1/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=ipc)(KEY=LISTENER_SCAN1)))
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=10.199.40.235)(PORT=1521)))
Services Summary...
Service "dgdb" has 1 instance(s).
  Instance "dgdb1", status BLOCKED, has 1 handler(s) for this service...
The command completed successfully
```

## 主备配置 hosts 文件以及 TNS
```bash
## 所有节点均配置 TNS
cat<<-\EOF>>$ORACLE_HOME/network/admin/tnsnames.ora
RPTDB_PRI =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.199.40.204)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = rptdb)
    )
  )
 
RPTDB_STB =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.199.40.235)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = dgdb)
    (UR=A)
    )
  )
EOF

## 测试是否可以连通
tnsping RPTDB_PRI
tnsping RPTDB_STB
sqlplus sys/oracle@RPTDB_PRI as sysdba
sqlplus sys/oracle@RPTDB_STB as sysdba
```

## RMAN Duplicate 复制
```bash
[oracle@dg01:/home/oracle]$ rman target sys/oracle@RPTDB_PRI AUXILIARY sys/oracle@RPTDB_STB

Recovery Manager: Release 19.0.0.0.0 - Production on Thu Oct 16 11:13:40 2025
Version 19.24.0.0.0

Copyright (c) 1982, 2019, Oracle and/or its affiliates.  All rights reserved.

connected to target database: RPTDB (DBID=170820080)
connected to auxiliary database: RPTDB (not mounted)

RMAN> run {
allocate channel prmy1 type disk;
allocate channel prmy2 type disk;
allocate channel prmy3 type disk;
allocate channel prmy4 type disk;
allocate channel prmy5 type disk;
allocate channel prmy6 type disk;
allocate auxiliary channel aux1 type disk;
allocate auxiliary channel aux2 type disk;
allocate auxiliary channel aux3 type disk;
allocate auxiliary channel aux4 type disk;
allocate auxiliary channel aux5 type disk;
allocate auxiliary channel aux6 type disk;
duplicate target database for standby from active database dorecover nofilenamecheck;
}
```
等待 RMAN duplicate 复制完成即可。

## 打开备库只读
```bash
-- 重启备库2个节点到只读状态
[oracle@dg01:/home/oracle]$ srvctl stop db -d dgdb
[oracle@dg01:/home/oracle]$ srvctl start db -d dgdb -o "read only"
```

## 备库开启日志应用
```sql
SQL> alter database recover managed standby database using current logfile disconnect;

Database altered.
```

## 主库设置 ADG 参数
```sql
alter system set log_archive_config='DG_CONFIG=(RPTDB,DGDB)';
alter system set log_archive_dest_1='LOCATION=+FRA VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=RPTDB';
alter system set log_archive_dest_2='SERVICE=RPTDB_STB VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=DGDB';
alter system set fal_client='RPTDB_PRI';
alter system set fal_server='RPTDB_STB';
alter system set log_archive_dest_state_2=enable;
```

## 检查同步情况
```sql
-- 主库
SQL> set line2222 pages1000
col status for a10
col type for a10
col error for a20
col gap_status for a20
col synchronization_status for a30
col recovery_mode for a60
select inst_id,status,DEST_ID,TYPE,ERROR,GAP_STATUS,SYNCHRONIZED,SYNCHRONIZATION_STATUS,RECOVERY_MODE from GV$ARCHIVE_DEST_STATUS where STatus <> 'INACTIVE' and type = 'PHYSICAL';

-- 备库
SQL> set line222 pages1000
select process,thread#,group#,sequence#,status from v$managed_standby;

SQL> select t2.thread#,t1.group#,t1.member,t2.STATUS,t2.ARCHIVED,t2.bytes/1024/1024 from v$logfile t1,v$standby_log t2 where t1.group#=t2.group# order by 1,2;
```
至此，ADG 搭建完成，备库可用于报表查询。