---
title: MongoDB 8.2.3 单机二进制安装
date: 2026-01-27 13:15:57
tags: [墨力计划,mongodb]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2015982252044410880
---

# 前言
这次要在一台腾讯云主机上安装一台 MongoDB 8.2.3，本文记录安装步骤，仅供参考。

# MongoDB 安装
安装前卸载系统自带的 MongoDB 版本：
```bash
[root@lpc ~]# rpm -qa | grep mongodb
[root@lpc ~]# ps -ef | grep mongodb
root       12591   12530  0 13:42 pts/0    00:00:00 grep --color=auto mongodb
[root@lpc ~]# yum erase -y $(rpm -qa | grep mongodb-org)
No packages marked for removal.
Dependencies resolved.
Nothing to do.
Complete!
```
提前安装依赖包：
```bash
[root@lpc ~]# yum install libcurl openssl xz-libs
[root@lpc ~]# rpm -qa libcurl openssl xz-libs
xz-libs-5.4.7-8.tl4.x86_64
libcurl-8.4.0-14.tl4.x86_64
openssl-3.0.12-18.tl4.4.x86_64
```
上传 MongoDB 安装包：
```bash
[root@lpc ~]# mkdir /soft
[root@lpc ~]# mv /tmp/mongodb-linux-x86_64-rhel93-8.2.3.gz /soft/
[root@lpc soft]# cd /soft/
[root@lpc soft]# ls
mongodb-linux-x86_64-rhel93-8.2.3.gz
```
解压二进制安装包：
```bash
# 解压
[root@lpc ~]# mkdir -p /data/mongodb-8.2.3
[root@lpc data]# tar -xzvf /soft/mongodb-linux-x86_64-rhel93-8.2.3.gz --strip-components=1 -C /data/mongodb-8.2.3
mongodb-linux-x86_64-rhel93-8.2.3/LICENSE-Community.txt
mongodb-linux-x86_64-rhel93-8.2.3/MPL-2
mongodb-linux-x86_64-rhel93-8.2.3/README
mongodb-linux-x86_64-rhel93-8.2.3/THIRD-PARTY-NOTICES
mongodb-linux-x86_64-rhel93-8.2.3/bin/
mongodb-linux-x86_64-rhel93-8.2.3/bin/install_compass
mongodb-linux-x86_64-rhel93-8.2.3/bin/mongod
mongodb-linux-x86_64-rhel93-8.2.3/bin/mongos
```
配置环境变量：
```bash
[root@lpc data]# cat<<-EOF>>/etc/profile
export MONGO_HOME=/data/mongodb-8.2.3
export PATH=/data/mongodb-8.2.3/bin:$PATH
EOF

[root@lpc data]# source /etc/profile
```
在 MongoDB 安装目录中创建数据、日志目录：
```bash
[root@lpc data]# mkdir -p /data/db /data/log
[root@lpc mongodb-8.2.3]# ls
db  log  mongodb-8.2.3
```
编辑 MongoDB 配置信息：
```bash
[root@lpc data]# cat<<-EOF>/data/mongodb-8.2.3/mongodb.conf
processManagement:
   fork: true
net:
   bindIp: 0.0.0.0
   port: 27017
storage:
   dbPath: /data/db
systemLog:
   destination: file
   path: "/data/log/mongod.log"
   logAppend: true
EOF
```
配置 MongoDB 为系统服务：
```bash
[root@lpc data]# echo $MONGO_HOME
/data/mongodb-8.2.3

[root@lpc data]# cat<<-EOF>/usr/lib/systemd/system/mongodb.service
[Unit]
Description=mongodb-server
After=network.target

[Service]
Type=forking
ExecStart=$MONGO_HOME/bin/mongod --config $MONGO_HOME/mongodb.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

[root@lpc data]# chmod 755 /usr/lib/systemd/system/mongodb.service
```
设置开机自启动：
```bash
[root@lpc data]# systemctl start mongodb
[root@lpc data]# systemctl enable mongodb
[root@lpc data]# systemctl status mongodb
● mongodb.service - mongodb-server
     Loaded: loaded (/usr/lib/systemd/system/mongodb.service; enabled; preset: disabled)
     Active: active (running) since Tue 2026-01-27 11:20:08 CST; 3s ago
    Process: 50562 ExecStart=/data/mongodb-8.2.3/bin/mongod --config /data/mongodb-8.2.3/mongodb.conf (code=exited, status=0/SUCCESS)
   Main PID: 50564 (mongod)
      Tasks: 50 (limit: 4264)
     Memory: 94.1M (peak: 94.2M)
        CPU: 140ms
     CGroup: /system.slice/mongodb.service
             └─50564 /data/mongodb-8.2.3/bin/mongod --config /data/mongodb-8.2.3/mongodb.conf

Jan 27 11:20:08 VM-48-8-tencentos systemd[1]: Starting mongodb.service - mongodb-server...
Jan 27 11:20:08 VM-48-8-tencentos mongod[50562]: {"t":{"$date":"2026-01-27T11:20:08.666+08:00"},"s":"I",  "c":"-",        "id":8991200, "ctx":"main","msg":"Shuffling initializers","a>
Jan 27 11:20:08 VM-48-8-tencentos mongod[50562]: about to fork child process, waiting until server is ready for connections.
Jan 27 11:20:08 VM-48-8-tencentos mongod[50564]: forked process: 50564
Jan 27 11:20:08 VM-48-8-tencentos mongod[50562]: child process started successfully, parent exiting
Jan 27 11:20:08 VM-48-8-tencentos systemd[1]: Started mongodb.service - mongodb-server.
```
新版本已经废弃 mongo，改用 mongosh，手动下载安装：
```bash
[root@lpc ~]# mkdir -p /data/mongosh-2.6.0
[root@lpc data]# tar -xzvf /soft/mongosh-2.6.0-linux-x64-openssl3.tgz --strip-components=1 -C /data/mongosh-2.6.0
mongosh-2.6.0-linux-x64-openssl3/.sbom.json
mongosh-2.6.0-linux-x64-openssl3/LICENSE-crypt-library
mongosh-2.6.0-linux-x64-openssl3/LICENSE-mongosh
mongosh-2.6.0-linux-x64-openssl3/README
mongosh-2.6.0-linux-x64-openssl3/THIRD_PARTY_NOTICES
mongosh-2.6.0-linux-x64-openssl3/bin/
mongosh-2.6.0-linux-x64-openssl3/mongosh.1.gz
mongosh-2.6.0-linux-x64-openssl3/bin/mongosh
mongosh-2.6.0-linux-x64-openssl3/bin/mongosh_crypt_v1.so
```
配置环境变量：
```bash
[root@lpc data]# cat<<-EOF>>/etc/profile
export PATH=/data/mongosh-2.6.0/bin:$PATH
EOF

[root@lpc data]# source /etc/profile
```
连接 MongoDB：
```bash
[root@lpc data]# mongosh
Current Mongosh Log ID: 697830999368bd4d49ed1101
Connecting to:          mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.6.0
Using MongoDB:          8.2.3
Using Mongosh:          2.6.0

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/

------
   The server generated these startup warnings when booting
   2026-01-27T11:20:08.785+08:00: Access control is not enabled for the database. Read and write access to data and configuration is unrestricted
   2026-01-27T11:20:08.785+08:00: You are running this process as the root user, which is not recommended
   2026-01-27T11:20:08.785+08:00: Soft rlimits for open file descriptors too low
   2026-01-27T11:20:08.785+08:00: For customers running the current memory allocator, we suggest changing the contents of the following sysfsFile
   2026-01-27T11:20:08.785+08:00: For customers running the current memory allocator, we suggest changing the contents of the following sysfsFile
   2026-01-27T11:20:08.785+08:00: We suggest setting the contents of sysfsFile to 0.
   2026-01-27T11:20:08.785+08:00: Your system has glibc support for rseq built in, which is not yet supported by tcmalloc-google and has critical performance implications. Please set the environment variable GLIBC_TUNABLES=glibc.pthread.rseq=0
------

test> db.version()
8.2.3
```
创建一个 root 用户：
```bash
test> use admin
switched to db admin
admin> db.createUser({user:"root", pwd:"**********", roles:[{role:"dbAdminAnyDatabase", db:"admin"}]})
{ ok: 1 }
admin> exit
```
至此，MongoDB 安装完成。