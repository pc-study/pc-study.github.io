---
title: 实战篇：Oracle 26ai DataGuard 搭建与 SwitchOver 切换
date: 2026-01-30 08:48:07
tags: [墨力计划,oracle,oracle 26ai]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2016778303010054144
---

@[TOC](目录)

# 前言
这两天正好安装了 Oracle 26ai 的单机和 RAC 环境，想着正好可以搭建一套 DataGuard 环境玩玩，说干就干！

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

数据库安装可参考以下两篇：
- [《首发｜Oracle 26ai 本地安装包与一键脚本，附网盘下载》](https://www.modb.pro/db/2016330870652215296)
- [《Oracle AI Database 26ai RAC 安装问题汇总》](https://www.modb.pro/db/2016389088966959104)

本文不再赘述数据库安装相关内容。

# ADG 搭建
依然采用使用 Duplicate 在线复制的方式搭建 ADG，无需 RMAN 备份，可以通过 RMAN Duplicate 直接在线从主库拷贝文件。

>本文搭建步骤均来自 [**100天精通Oracle 实战系列**](https://www.modb.pro/course/142) 课程。

## 环境信息

| 组件 | 主库 (RAC) | 备库 (单机) |
|------|------------|------------|
| 主机名 | rac01, rac02 | orcldg |
| IP地址 | 10.168.1.165 | 10.168.1.25 |
| 数据库名 | orcl | orcldg |
| DB_UNIQUE_NAME | orcl | orcldg |
| 版本 | Oracle 26ai | Oracle 26ai |

## hosts 配置
```bash
# 所有节点配置 hosts 解析
cat << EOF >> /etc/hosts
10.168.1.165   rac-scan
10.168.1.25    orcldg
EOF
```

## 主库配置
### 主库开启归档和强制日志
搭建 DataGuard 必须要开启归档模式和强制日志模式：
```sql
-- 检查当前状态
SELECT log_mode, force_logging FROM v$database;

-- 开启归档模式（如未开启）
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE OPEN;

-- 开启强制日志
ALTER DATABASE FORCE LOGGING;

-- 确认配置生效
SELECT log_mode, force_logging FROM v$database;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016807417699966976_395407.png)

### 配置 Standby Redo Logs
Standby Redo Logs 数量为 `(Online Redo Logs + 1) × Threads`：
```sql
-- 查看在线日志配置
SELECT thread#, group#, bytes/1024/1024 size_mb, members 
FROM v$log 
ORDER BY thread#, group#;

-- 为每个线程添加Standby Redo Logs
-- Thread 1 (假设在线日志组数=7，大小=1GB)
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1
GROUP 20 ('+DATA', '+DATA') SIZE 1G,
GROUP 21 ('+DATA', '+DATA') SIZE 1G,
GROUP 22 ('+DATA', '+DATA') SIZE 1G,
GROUP 23 ('+DATA', '+DATA') SIZE 1G,
GROUP 24 ('+DATA', '+DATA') SIZE 1G,
GROUP 25 ('+DATA', '+DATA') SIZE 1G,
GROUP 26 ('+DATA', '+DATA') SIZE 1G,
GROUP 27 ('+DATA', '+DATA') SIZE 1G;

-- Thread 2
ALTER DATABASE ADD STANDBY LOGFILE THREAD 2
GROUP 30 ('+DATA', '+DATA') SIZE 1G,
GROUP 31 ('+DATA', '+DATA') SIZE 1G,
GROUP 32 ('+DATA', '+DATA') SIZE 1G,
GROUP 33 ('+DATA', '+DATA') SIZE 1G,
GROUP 34 ('+DATA', '+DATA') SIZE 1G,
GROUP 35 ('+DATA', '+DATA') SIZE 1G,
GROUP 36 ('+DATA', '+DATA') SIZE 1G,
GROUP 37 ('+DATA', '+DATA') SIZE 1G;

-- 验证Standby Redo Logs
SELECT thread#, group#, bytes/1024/1024 size_mb, status 
FROM v$standby_log 
ORDER BY thread#, group#;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016784537880698880_395407.png)


### 生成并准备密码文件
rac 的密码文件通常存放于 ASM 盘中，查看对应的密码文件位置：
```bash
srvctl config database -d orcl | grep PASSWORD
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016788026878926848_395407.png)

使用 `asmcmd` 进入到 ASM 磁盘组：
```bash
# 从 ASM 复制到文件系统
asmcmd -p
ASMCMD [+] > pwcopy +DATA/RPTDB/PASSWORD/pwdrptdb.256.1180304871 /home/grid/
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016788254373273600_395407.png)

将密码文件拷贝到备库，并且重命名，命名规则为 `orapw+sid`：
```bash
chown oracle:oinstall /home/grid/pwdorcl.256.1223761825
mv /home/grid/pwdorcl.256.1223761825 /home/oracle/orapworcldg
scp /home/oracle/orapworcldg  oracle@10.168.1.25:/u01/app/oracle/product/26.1.0/db/dbs/
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016789183185625088_395407.png)

### 生成参数文件
使用 RMAN 备份在备库恢复，需要在主库生成参数文件：
```sql
-- 在主库生成参数文件
CREATE PFILE='/home/oracle/pfile_orcl.ora' FROM SPFILE;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016789559439351808_395407.png)

## 备库配置
### 创建参数文件
将主库生成并修改后的参数文件在备库创建初始化参数文件（这里建议源端目标端均使用 `OMF`）：
```bash
## 在备库创建初始化参数文件
cat<<-\EOF>$ORACLE_HOME/dbs/initorcldg.ora
*._b_tree_bitmap_plans=FALSE
*._cleanup_rollback_entries=2000
*._optimizer_adaptive_cursor_sharing=FALSE
*._optimizer_extended_cursor_sharing='NONE'
*._optimizer_extended_cursor_sharing_rel='NONE'
*._optimizer_use_feedback=FALSE
*._undo_autotune=FALSE
*.compatible='23.6.0'
*.control_file_record_keep_time=31
*.control_files='/oradata/ORCL/CONTROLFILE/control01.ctl','/oradata/ORCL/CONTROLFILE/control02.ctl'
*.db_block_size=8192
*.db_create_file_dest='/oradata'
*.db_files=5000
*.db_name='orcl'
*.deferred_segment_creation=FALSE
*.diagnostic_dest='/u01/app/oracle'
*.dispatchers='(PROTOCOL=TCP) (SERVICE=orcldgXDB)'
*.enable_pluggable_database=true
*.event='28401 trace name context forever,level 1','10949 trace name context forever,level 1'
*.log_archive_format='%t_%s_%r.dbf'
*.nls_language='SIMPLIFIED CHINESE'
*.nls_territory='CHINA'
*.open_cursors=1000
*.parallel_force_local=TRUE
*.parallel_max_servers=64
*.pga_aggregate_target=2643460096
*.processes=2000
*.remote_login_passwordfile='exclusive'
*.session_cached_cursors=300
*.sga_max_size=10575937536
*.sga_target=10575937536
*.undo_retention=10800
*.undo_tablespace='UNDOTBS1'
*.db_unique_name='orcldg'
*.fal_client='ORCL_STB'
*.fal_server='ORCL_PRI'
*.log_archive_config='dg_config=(orcl,orcldg)'
*.log_archive_dest_1='LOCATION=/oradata/archivelog VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=ORCLDG'
*.log_archive_dest_2='SERVICE=ORCL_PRI VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=ORCL'
*.standby_file_management='AUTO'
EOF
```

### 创建目录结构
备库根据参数文件在两个节点均创建必要的目录：
```bash
# 创建必要目录
mkdir -p /oradata/ORCL/{CONTROLFILE,DATAFILE,ONLINELOG}
mkdir -p /oradata/archivelog
chown -R oracle:oinstall /oradata
chmod -R 755 /oradata
```

### 启动备库到 NOMOUNT

打开备库到 nomount 状态：
```sql
-- 创建SPFILE
CREATE SPFILE FROM PFILE;

-- 启动到NOMOUNT状态
STARTUP NOMOUNT;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016792835211747328_395407.png)

### 配置 TNS
备库启动监听：
```bash
# 启动监听
lsnrctl start
## 等一段时间或者手动注册监听，再次查看监听状态
lsnrctl stat
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016793053081182208_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016793454765481984_395407.png)

配置 TNSNAMES.ORA：
```bash
## 所有节点均配置 TNS
cat >> $ORACLE_HOME/network/admin/tnsnames.ora << 'EOF'
ORCL_PRI =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.168.1.165)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = orcl)
    )
  )

ORCL_STB =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.168.1.25)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = orcldg)
      (UR=A)
    )
  )
EOF

# 测试连接
tnsping ORCL_PRI
tnsping ORCL_STB

# 验证数据库连接
sqlplus sys/oracle@ORCL_PRI as sysdba
sqlplus sys/oracle@ORCL_STB as sysdba
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016793876984586240_395407.png)

## RMAN在线复制
rman 同时连接主备库：
```bash
[oracle@orcldg:/home/oracle]$ rman target sys/oracle@ORCL_PRI AUXILIARY sys/oracle@ORCL_STB
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016794098872164352_395407.png)

执行 duplicate 命令：
```bash
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

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016796004675313664_395407.png)

等待 RMAN duplicate 复制完成即可。

## 打开备库只读
```sql
SQL> alter database open read only;
SQL> alter pluggable database all open;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016796542033272832_395407.png)

## 备库开启日志应用
```sql
SQL> alter database recover managed standby database using current logfile disconnect;

Database altered.
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016796623452594176_395407.png)

## 主库设置 ADG 参数
```sql
alter system set log_archive_config='DG_CONFIG=(orcl,orcldg)';
alter system set log_archive_dest_1='LOCATION=+DATA VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=ORCL';
alter system set log_archive_dest_2='SERVICE=ORCL_STB VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=ORCLDG';
alter system set fal_client='ORCL_PRI';
alter system set fal_server='ORCL_STB';
alter system set log_archive_dest_state_2=defer;
alter system set log_archive_dest_state_2=enable;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016796732475138048_395407.png)

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
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016796979465117696_395407.png)


备库：
```sql
SQL> set line222 pages1000
select process,thread#,group#,sequence#,status from v$managed_standby;

SQL> col member for a100
select t2.thread#,t1.group#,t1.member,t2.STATUS,t2.ARCHIVED,t2.bytes/1024/1024 from v$logfile t1,v$standby_log t2 where t1.group#=t2.group# order by 1,2;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016797224894816256_395407.png)

至此，ADG 搭建完成，备库可用于报表查询。

## 主备同步验证
在主库创建一个 PDB：
```sql
-- 创建PDB
CREATE PLUGGABLE DATABASE testpdb ADMIN USER admin IDENTIFIED BY oracle;

-- 打开PDB
ALTER PLUGGABLE DATABASE testpdb OPEN;
ALTER PLUGGABLE DATABASE testpdb SAVE STATE;

-- 连接到新创建的 PDB
ALTER SESSION SET CONTAINER=testpdb;

-- 创建测试用户
CREATE USER testuser IDENTIFIED BY oracle;
GRANT dba TO testuser;

-- 创建测试表
CREATE TABLE testuser.employees (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(50),
    department VARCHAR2(30),
    salary NUMBER,
    hire_date DATE
);

-- 插入测试数据
INSERT INTO testuser.employees VALUES (1, 'John Doe', 'IT', 5000, SYSDATE-100);
INSERT INTO testuser.employees VALUES (2, 'Jane Smith', 'HR', 4500, SYSDATE-50);
INSERT INTO testuser.employees VALUES (3, 'Bob Johnson', 'Sales', 4000, SYSDATE-30);

COMMIT;

-- 验证数据
SELECT * FROM testuser.employees;
SELECT COUNT(*) FROM testuser.employees;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016800055060668416_395407.png)

备库验证数据：
```sql
-- 启动 PDB
SQL> alter pluggable database testpdb open;

-- 查看 PDB
SQL> show pdbs

-- 切换到 PDB
ALTER SESSION SET CONTAINER=testpdb;

-- 查询数据
SELECT * FROM testuser.employees;
SELECT COUNT(*) FROM testuser.employees;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016801110149914624_395407.png)

# 主备 SwitchOver 切换
## 切换前检查
查看主备库同步进程状态：
```sql
-- 主库
SQL> set line2222
col status for a10
col type for a10
col error for a20
col gap_status for a20
col synchronization_status for a30
col recovery_mode for a60
select inst_id,status,DEST_ID,TYPE,database_mode,ERROR,GAP_STATUS,SYNCHRONIZED,SYNCHRONIZATION_STATUS,RECOVERY_MODE from GV$ARCHIVE_DEST_STATUS where STatus <> 'INACTIVE' and type = 'PHYSICAL';

SQL> set line2222
col name for a10
col database_role for a20
col switchover_status for a20
col PROTECTION_MODE for a25
select inst_id,name,database_role,protection_mode,switchover_status from gv$database;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016802200517959680_395407.png)

备库：
```sql
SQL> SELECT 
    (SELECT MAX(sequence#) FROM v$archived_log WHERE applied='YES') last_applied_seq,
    (SELECT MAX(sequence#) FROM v$archived_log) last_received_seq,
    (SELECT MAX(sequence#) FROM v$archived_log) - 
    (SELECT MAX(sequence#) FROM v$archived_log WHERE applied='YES') gap
FROM dual;

SQL> set line222
col database_role for a20
col switchover_status for a20
col PROTECTION_MODE for a25
select inst_id,name,database_role,protection_mode,switchover_status from gv$database;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016802491099340800_395407.png)

## 主切换到备
主库切换为备库 (期间观察主库 alert 日志)：
```sql
SQL> alter database commit to switchover to physical standby with session shutdown;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016802662718185472_395407.png)

## 备切换到主
备库下检查是否可以切换为主库：
```sql
SQL> set line222
col database_role for a20
col switchover_status for a20
col PROTECTION_MODE for a25
select name,database_role,protection_mode,switchover_status from gv$database;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016802796277407744_395407.png)

备库切换主库：
```sql
SQL> alter database commit to switchover to primary with session shutdown;

Database altered.
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016802917685731328_395407.png)

## 启动主备库
打开新的主库：
```sql
SQL> alter database open;

Database altered.

SQL> select name,open_mode,database_role from v$database;

NAME      OPEN_MODE            DATABASE_ROLE
--------- -------------------- ----------------
ORADB     READ WRITE           PRIMARY
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016803015093739520_395407.png)

打开新的备库：
```sql
[oracle@rac01:/home/oracle]$ srvctl start db -d orcl

SQL> alter database recover managed standby database using current logfile disconnect from session;
SQL> select name,open_mode,database_role from gv$database;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016804978074148864_395407.png)

## 检查同步情况
检查主备同步情况：
```sql
-- 主库
SQL> set line2222
col status for a10
col type for a10
col error for a20
col gap_status for a20
col synchronization_status for a30
col recovery_mode for a60
select inst_id,status,DEST_ID,TYPE,database_mode,ERROR,GAP_STATUS,SYNCHRONIZED,SYNCHRONIZATION_STATUS,RECOVERY_MODE from GV$ARCHIVE_DEST_STATUS where STatus <> 'INACTIVE' and type = 'PHYSICAL';
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20260129-2016805290600636416_395407.png)

切换后主备同步正常，操作流程也较为简单。

# 总结
这篇文章是使用经典的架构去搭建和切换 ADG，所以还是比较顺利，但是我看 26ai 支持 PDB 级别的 ADG，后面有时间再学习一下。

