---
title: DBA 应不应该定期做备份恢复演练？
date: 2025-10-21 16:44:47
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1980518112776695808
---

# 前言
从业多年，经常遇到 DBA 嫌弃备份恢复演练麻烦，抱着能不做就不做的心态去对待，本文以一个 Veeam 备份恢复报错案例（**绝对干货**）的解决过程，正好可以探讨一下备份恢复演练是否应该定期做？有没有必要做？

>⭐ 欢迎评论区留言讨论~

今天做恢复演练，从 Veeam 备份恢复一套 RAC 数据库到单实例环境，本想着做过好多次了，应该是轻车熟路，没想到报错了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980518161111855104_395407.png)

这个报错没见过，也没啥头绪，网上也搜不到相关内容，只能分析日志了，本文记录整体分析过程以及解决方案。

# 问题分析
恢复日志一般存放于 VBR 的 `C:\Users\Administrator\AppData\Local\Veeam\Backup\OracleExplorer\Logs` 目录下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980518910155829248_395407.png)

打开日志，搜索关键词 `Cleanup`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980519342009757696_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980519527544795136_395407.png)

从错误日志可以看到参数文件被识别为 `+DATA/orcl/spfileorcl.ora`，但是目标端是个单实例数据库，不应该是 +DATA，查看恢复过程中生成的参数文件内容：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980519987110490112_395407.png)

可以看到 PFILE 参数文件中竟然是 `*.SPFILE='+DATA/orcl/spfileorcl.ora'`，为啥呢？

从恢复日志中的恢复命令可以发现：
```bash
SET DBID=1599048745;
RUN {
ALLOCATE CHANNEL c0 DEVICE TYPE sbt PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so';
SEND "product=VEOR;jobId=4f4c136a-7c7b-42fa-9b49-9f9ddefe3fbd";
RESTORE SPFILE TO PFILE '/var/tmp/be264f88364f49048380d9b81764ea21/49549b5e20804993aac22620a93e6f36.ORA' FROM 'c-1599048745-20251021-01.vab';
}
```
这个参数文件是从源端的备份恢复来的，那源端是怎么备份的？

通过源端 Veeam 备份日志可以抓到 RUN 块：
```bash
## 0 级备份脚本
RUN { 
CONFIGURE CONTROLFILE AUTOBACKUP ON; 
CONFIGURE COMPRESSION ALGORITHM 'BASIC'; 
ALLOCATE CHANNEL VeeamAgentChannel1 DEVICE TYPE SBT_TAPE PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so' FORMAT 'f20cb2d5-2665-43a3-8864-3fc0e8215d07/RMAN_%I_%d_%T_%U.vab';
ALLOCATE CHANNEL VeeamAgentChannel2 DEVICE TYPE SBT_TAPE PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so' FORMAT 'f20cb2d5-2665-43a3-8864-3fc0e8215d07/RMAN_%I_%d_%T_%U.vab';
ALLOCATE CHANNEL VeeamAgentChannel3 DEVICE TYPE SBT_TAPE PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so' FORMAT 'f20cb2d5-2665-43a3-8864-3fc0e8215d07/RMAN_%I_%d_%T_%U.vab'; 
SEND 'setPolicyJobId=b3c565cc-1cb5-4e17-9516-54c8c5038663'; 
SEND 'bObjectId={68b0796d-cfb1-4fe0-b8dd-27a33093755e}'; 
SEND 'backupSessionParentJobId={b3c565cc-1cb5-4e17-9516-54c8c5038663}'; 
SEND 'dbCredentials-:'; 
BACKUP INCREMENTAL LEVEL 0 AS COMPRESSED BACKUPSET DATABASE PLUS ARCHIVELOG NOT BACKED UP 1 TIMES; 
SEND 'makeBackupConsistent'; 
}

## 1 级备份脚本
RUN { 
CONFIGURE CONTROLFILE AUTOBACKUP ON;  
ALLOCATE CHANNEL VeeamAgentChannel1 DEVICE TYPE SBT_TAPE PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so' FORMAT 'f20cb2d5-2665-43a3-8864-3fc0e8215d07/RMAN_%I_%d_%T_%U.vab';
ALLOCATE CHANNEL VeeamAgentChannel2 DEVICE TYPE SBT_TAPE PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so' FORMAT 'f20cb2d5-2665-43a3-8864-3fc0e8215d07/RMAN_%I_%d_%T_%U.vab';
ALLOCATE CHANNEL VeeamAgentChannel3 DEVICE TYPE SBT_TAPE PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so' FORMAT 'f20cb2d5-2665-43a3-8864-3fc0e8215d07/RMAN_%I_%d_%T_%U.vab'; 
SEND 'setPolicyJobId=b3c565cc-1cb5-4e17-9516-54c8c5038663'; 
SEND 'bObjectId={68b0796d-cfb1-4fe0-b8dd-27a33093755e}'; 
SEND 'backupSessionParentJobId={b3c565cc-1cb5-4e17-9516-54c8c5038663}'; 
SEND 'dbCredentials-:'; 
BACKUP INCREMENTAL LEVEL 1  DATABASE PLUS ARCHIVELOG NOT BACKED UP 1 TIMES; 
SEND 'makeBackupConsistent'; 
}
```
其实也是调用 RMAN 进行备份，手动触发一下备份参数文件，看看备份出来的参数文件内容：
```bash
[oracle@orcl1:/dbbak/orcl]$ strings /u01/app/oracle/product/11.2.0/db_1/dbs/be46pqp6_1_1
}|{z
O_ORCL
lHna
TAG20251021T150718
ORCL
*.SPFILE='+DATA/orcl/spfileorcl.ora'
/u01/app/oracle/product/11.2.0/db_1/dbs/spfileorcl1.ora
```
这个明显是不对，看一下 `$ORACLE_HOME/dbs` 目录下的内容：
```bash
[oracle@orcl1:/u01/app/oracle/product/11.2.0/db_1/dbs]$ ls
be46pqp6_1_1  hc_orcl1.dat  init.ora  initorcl1.ora  orapworcl1  orapworcl2  snapcf_orcl1.f  spfileorcl1.ora  tmp.ora
```
怎么 `initorcl1.ora` 和 `spfileorcl1.ora` 同时存在？这种情况下，spfileorcl1.ora 的优先级最高，所以数据库启动默认读取 spfileorcl1.ora，而 RMAN 备份是根据 spfile 参数的值指向进行备份。

查看 spfile 参数：
```sql
SQL> show parameter pfile

NAME                                 TYPE        VALUE
------------------------------------ ----------- ------------------------------
spfile                               string      /u01/app/oracle/product/11.2.0
                                                 /db_1/dbs/spfileorcl1.ora
```
查看 spfileorcl1.ora 的内容：
```bash
[oracle@orcl1:/u01/app/oracle/product/11.2.0/db_1/dbs]$ strings spfileorcl1.ora 
*.SPFILE='+DATA/orcl/spfileorcl.ora'
```
这个文件的内容明显不对，又多套了一层，这样备份出来的参数文件就是无效的，因为根本没有记录实际的参数文件内容，所以 Veeam 备份恢复出来自然就是报错了。

我们可以手动执行验证一下：
```bash
SQL> create pfile='/home/oracle/pfile.ora' from spfile;

File created.

[oracle@sqmespmdb01:/home/oracle]$ strings pfile.ora 
*.SPFILE='+DATA/orcl/spfileorcl.ora'
```
这种情况下，使用这个 pfile.ora 是无法打开数据库实例的，也就导致了我们的恢复失败：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980518161111855104_395407.png)

问题分析到这，原因已经找到了，接下来就是如何处理这个问题了。

# 问题解决
目前需要解决的问题是，如何能获取到参数文件的实际内容？我的做法比较简单，直接从 asm 磁盘里拷贝出来：
```bash
ASMCMD [+] > cp +DATA/orcl/spfileorcl.ora /home/grid
copying +DATA/orcl/spfileorcl.ora -> /home/grid/spfileorcl.ora
```
然后查看编辑一下内容，适配一下单机环境：
```bash
*.audit_file_dest='/u01/app/oracle/admin/orcl/adump'
*.audit_trail='db'
*.compatible='11.2.0.4.0'
*.control_files='/data/orcl/CONTROLFILE/control01.ctl','/data/orcl/CONTROLFILE/control02.ctl'
*.db_block_size=8192
*.db_create_file_dest='/data'
*.db_domain=''
*.db_name='orcl'
*.deferred_segment_creation=FALSE
*.diagnostic_dest='/u01/app/oracle'
*.dispatchers='(PROTOCOL=TCP) (SERVICE=orclXDB)'
*.log_archive_dest_1='location=/data/archivelog'
*.log_archive_format='%t_%s_%r.dbf'
*.open_cursors=300
*.pga_aggregate_target=4G
*.processes=1000
*.remote_login_passwordfile='exclusive'
*.sessions=1105
*.sga_target=8G
*.undo_tablespace='UNDOTBS1'
```
在恢复主机上创建 pfile 并启动数据库实例到 nomount 状态：
```sql
SQL> create spfile from pfile;

File created.

SQL> startup nomount
ORACLE instance started.

Total System Global Area 8551575552 bytes
Fixed Size                  2270360 bytes
Variable Size            1744833384 bytes
Database Buffers         6794772480 bytes
Redo Buffers                9699328 bytes
```
但是，很可惜，Veeam 恢复时不能提前把实例开启到 nomount 状态：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980538805417422848_395407.png)

看来不能通过 Explorer 来操作恢复了，得用 RMAN 命令行调用恢复了。

# Veeam RMAN Plugin 恢复
在恢复目标机上，查询 sbt_library 参数和 srcbackup 参数：
```bash
[oracle@test:/home/oracle]$ OracleRMANConfigTool --get-backup-for-restore
Select backup to be used:
1. xxxxxx Oracle backup (xxxxxx)
Enter backup number:1
To perform restore operations, use ID of the selected backup from the example below as srcBackup parameter value in SEND command:
ALLOCATE CHANNEL VeeamAgentChannel1 DEVICE TYPE SBT_TAPE
PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so';
SEND 'srcBackup=52e80707-e5d2-4f0c-9643-b408f3c62ad9';
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980540054825086976_395407.png)

在源端通过 RMAN 获取最近备份的控制文件名称：
```bash
BS Key  Type LV Size       Device Type Elapsed Time Completion Time
------- ---- -- ---------- ----------- ------------ ---------------
24015   Full    32.00M     SBT_TAPE    00:00:04     21-OCT-25      
        BP Key: 24015   Status: AVAILABLE  Compressed: NO  Tag: TAG20251021T135357
        Handle: c-1599048745-20251021-02   Media: {650a4d3a-a045-4a9d-92fa-32805e5aaf42}
  Control File Included: Ckp SCN: 79127664575   Ckp time: 21-OCT-25
```
在目标端进行恢复控制文件（使用上面获取到的参数）：
```bash
## dbid 连接源端 rman 就可以看到 connected to target database: ORCL (DBID=1599048745)
RMAN> RUN { 
set dbid=1599048745;
ALLOCATE CHANNEL VeeamAgentChannel1 DEVICE TYPE SBT_TAPE
PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so';
SEND 'srcBackup=52e80707-e5d2-4f0c-9643-b408f3c62ad9';
SET CONTROLFILE AUTOBACKUP FORMAT FOR DEVICE TYPE 'SBT_TAPE' TO '%F_RMAN_AUTOBACKUP.vab';
RESTORE controlfile FROM 'c-1599048745-20251021-02';
}
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980544186973696000_395407.png)

打开数据库到 mount 状态：
```bash
RMAN> alter database mount;

database mounted
```
写一个脚本，后台执行 RMAN 恢复：
```bash
[oracle@test:/home/oracle]$ cat<<-\RMAN>/home/oracle/veeam_restore.sh
#!/bin/bash
source ~/.bash_profile
DAY_TAG=`date +"%Y-%m-%d"`
rman target / nocatalog msglog /home/oracle/restore_$DAY_TAG.log<<EOF
RUN { 
ALLOCATE CHANNEL VeeamAgentChannel1 DEVICE TYPE SBT_TAPE
PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so';
ALLOCATE CHANNEL VeeamAgentChannel2 DEVICE TYPE SBT_TAPE
PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so';
ALLOCATE CHANNEL VeeamAgentChannel3 DEVICE TYPE SBT_TAPE
PARMS 'SBT_LIBRARY=/opt/veeam/VeeamPluginforOracleRMAN/libOracleRMANPlugin.so';
SEND 'srcBackup=52e80707-e5d2-4f0c-9643-b408f3c62ad9';
SET NEWNAME FOR DATABASE TO '/data/orcl/%b';
RESTORE DATABASE;
SWITCH DATAFILE ALL;
SWITCH TEMPFILE ALL;
RECOVER DATABASE;
}
EOF
RMAN

[oracle@test:/home/oracle]$ chmod +x veeam_restore.sh
## 执行恢复
[oracle@test:/home/oracle]$ sh /home/oracle/veeam_restore.sh &
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980547190149885952_395407.png)

可以看到开始正常恢复了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251021-1980547302347517952_395407.png)

等待恢复完成后，打开数据库即可：
```sql
SQL> alter database open resetlogs;
```
本次备份恢复成功完成！但是，问题依然没有解决，需要修复参数文件的问题。

# 后续处理
因为数据库使用错误的参数文件进行启动，所以无法在线去更换 spfile 路径，需要关闭数据库进行替换调整。

等到有停机时间时，关闭数据库：
```bash
[oracle@orcl1:/home/oracle]$ srvctl stop db -d orcl
```
检查集群已经配置 spfile 参数：
```bash
[oracle@orcl1:/home/oracle]$ srvctl config db -d orcl | grep Spfile
Spfile: +DATA/orcl/spfileorcl.ora
```
确保集群已配置 spfile 参数后，即可移走或者删掉所有节点 dbs 目录下的 spfile[SID].ora 和 init[SID].ora 文件（**如果集群未配置 Spfile 参数，则需要保留 init[SID].ora 文件**）：
```bash
## 所有节点均需要删除
rm $ORACLE_HOME/dbs/spfileorcl1.ora
rm $ORACLE_HOME/dbs/initorcl1.ora
```
然后重新启动数据库：
```sql
[oracle@orcl1:/home/oracle]$ srvctl start db -d orcl
```
再次使用 Veeam 发起一次完整备份，确保备份成功即可。

# 写在最后
通过本文再次体现了恢复演练的重要性，很多时候光看备份是否成功是无法发现一些问题的，只有切身实地的去恢复验证了，才能发现这些问题并且解决它，所以一定要定期去做恢复演练。

记得之前听说有一个国外 DBA 干了 20 多年从未做过恢复演练，结果真到了要恢复的时候，没有恢复出来数据，面临重大赔偿，直接跳楼（**是否真实无从考证**）。

**❗️❗️❗️切记：DBA 的首要工作是备份！！！** 备份永远都是你的最后一根救命稻草。
