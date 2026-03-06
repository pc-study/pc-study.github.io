---
title: EMCC 13.5 配置开机自启动
date: 2024-02-28 15:30:40
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1762742092308254720
---

## 配置自启动
### 配置数据库自启动
仅针对非 deb 系：
```bash
## oracle 用户执行
sed -i 's/db:N/db:Y/' /etc/oratab
sed -i 's/ORACLE_HOME_LISTNER=$1/ORACLE_HOME_LISTNER=$ORACLE_HOME/' $ORACLE_HOME/bin/dbstart
## root 用户执行
cat <<-\EOF >>/etc/rc.d/rc.local
su oracle -lc "/u01/app/oracle/product/19.3.0/db/bin/lsnrctl start"
su oracle -lc "/u01/app/oracle/product/19.3.0/db/bin/dbstart"
EOF
chmod +x /etc/rc.d/rc.local
```
### 配置 EMCC 自启动
```bash
## root 用户执行
cat <<-\EOF >>/etc/rc.d/rc.local
su oracle -lc "/u01/app/oracle/middleware/oms/bin/emctl start oms"
su oracle -lc "/u01/app/oracle/middleware/agent/agent_13.5.0.0.0/bin/emctl start agent"
EOF
chmod +x /etc/rc.d/rc.local
```

## 重启后检查
### 检查数据库
```bash
[oracle@emcc:/home/oracle]$ ps -ef|grep smon|grep -v grep
oracle    2183     1  0 15:20 ?        00:00:00 ora_smon_emcc
[oracle@emcc:/home/oracle]$ sas

SQL*Plus: Release 19.0.0.0.0 - Production on Wed Feb 28 15:25:54 2024
Version 19.22.0.0.0

Copyright (c) 1982, 2023, Oracle.  All rights reserved.

Connected to:
Oracle Database 19c Enterprise Edition Release 19.0.0.0.0 - Production
Version 19.22.0.0.0

SQL> select open_mode from v$database;

OPEN_MODE
--------------------
READ WRITE
```

### 检查 oms
```bash
[root@emcc:/root]$ su - oracle
[oracle@emcc:/home/oracle]$ . .oms 
[oracle@emcc:/home/oracle]$ emctl statu oms
## 这一步因为启动时间较长，需要等待一段时间 DOWN 才会变成 UP
[oracle@emcc:/home/oracle]$ emctl status oms
Oracle Enterprise Manager Cloud Control 13c Release 5  
Copyright (c) 1996, 2021 Oracle Corporation.  All rights reserved.
WebTier is Down
Oracle Management Server is Down
JVMD Engine is Down

## 以下为正常启动的输出
[oracle@emcc:/home/oracle]$ emctl status oms
Oracle Enterprise Manager Cloud Control 13c Release 5  
Copyright (c) 1996, 2021 Oracle Corporation.  All rights reserved.
WebTier is Up
Oracle Management Server is Up
JVMD Engine is Up
```

### 检查 agent
```bash
[oracle@emcc:/home/oracle]$ . .agent 
[oracle@emcc:/home/oracle]$ emctl status agent
Oracle Enterprise Manager Cloud Control 13c Release 5  
Copyright (c) 1996, 2021 Oracle Corporation.  All rights reserved.
---------------------------------------------------------------
Agent Version          : 13.5.0.0.0
OMS Version            : (unknown)
Protocol Version       : 12.1.0.1.0
Agent Home             : /u01/app/oracle/middleware/agent/agent_inst
Agent Log Directory    : /u01/app/oracle/middleware/agent/agent_inst/sysman/log
Agent Binaries         : /u01/app/oracle/middleware/agent/agent_13.5.0.0.0
Core JAR Location      : /u01/app/oracle/middleware/agent/agent_13.5.0.0.0/jlib
Agent Process ID       : 2272
Parent Process ID      : 2058
Agent URL              : https://emcc:3872/emd/main/
Local Agent URL in NAT : https://emcc:3872/emd/main/
Repository URL         : https://emcc:4903/empbs/upload
Started at             : 2024-02-28 15:20:33
Started by user        : oracle
Operating System       : Linux version 3.10.0-1160.el7.x86_64 (amd64)
Number of Targets      : 37
Last Reload            : (none)
Last successful upload                       : (none)
Last attempted upload                        : (none)
Total Megabytes of XML files uploaded so far : 0
Number of XML files pending upload           : 60
Size of XML files pending upload(MB)         : 0.06
Available disk space on upload filesystem    : 84.16%
Collection Status                            : Collections enabled
Heartbeat Status                             : OMS is unreachable
Last attempted heartbeat to OMS              : 2024-02-28 15:21:15
Last successful heartbeat to OMS             : (none)
Next scheduled heartbeat to OMS              : 2024-02-28 15:21:45

---------------------------------------------------------------
Agent is Running and Ready
```