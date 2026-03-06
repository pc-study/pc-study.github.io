---
title: MongoDB 5.0 单机二进制安装
date: 2025-09-25 14:35:26
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1971087135222542336
---

# 前言
以前基本用不到 MongoDB，所以没学习过，最近正好需要安装一套，研究了一下，本文记录一下安装过程。

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
上传 MongoDB 安装包：
```bash
[root@lpc ~]# mkdir /soft
[root@lpc ~]# mv /tmp/mongodb-linux-x86_64-rhel80-5.0.0.tgz /soft/
[root@lpc soft]# cd /soft/
[root@lpc soft]# ls
mongodb-linux-x86_64-rhel80-5.0.0.tgz
```
解压二进制安装包：
```bash
# 解压
[root@lpc soft]# mkdir /data
[root@lpc soft]# tar -xzvf mongodb-linux-x86_64-rhel80-5.0.0.tgz -C /data
mongodb-linux-x86_64-rhel80-5.0.0/LICENSE-Community.txt
mongodb-linux-x86_64-rhel80-5.0.0/MPL-2
mongodb-linux-x86_64-rhel80-5.0.0/README
mongodb-linux-x86_64-rhel80-5.0.0/THIRD-PARTY-NOTICES
mongodb-linux-x86_64-rhel80-5.0.0/bin/install_compass
mongodb-linux-x86_64-rhel80-5.0.0/bin/mongo
mongodb-linux-x86_64-rhel80-5.0.0/bin/mongod
mongodb-linux-x86_64-rhel80-5.0.0/bin/mongos
```
重命名目录：
```bash
[root@lpc soft]# cd /data/
[root@lpc data]# mv /data/mongodb-linux-x86_64-rhel80-5.0.0 /data/mongodb-5.0.0
```
配置环境变量：
```bash
[root@lpc data]# cat<<-EOF>>/etc/profile
export MONGO_HOME=/data/mongodb-5.0.0
export PATH=/data/mongodb-5.0.0/bin:$PATH
EOF

[root@lpc data]# source /etc/profile
```
在 MongoDB 安装目录中创建数据、日志目录：
```bash
[root@lpc soft]# cd /data/mongodb-5.0.0
[root@lpc mongodb-5.0.0]# mkdir data logs
[root@lpc mongodb-5.0.0]# ls
bin  data  LICENSE-Community.txt  logs  MPL-2  README  THIRD-PARTY-NOTICES
```
编辑 MongoDB 配置信息：
```bash
[root@lpc mongodb-5.0.0]# echo $MONGO_HOME
/data/mongodb-5.0.0

[root@lpc mongodb-5.0.0]# cat<<-EOF>mongodb.conf
## 端口
port=3717
## 允许远程连接
bind_ip=0.0.0.0
## 数据文件存放路径
dbpath=$MONGO_HOME/data
## 日志文件存放路径
logpath=$MONGO_HOME/logs/mongodb.log
## 后台运行
fork=true
EOF
```
配置 MongoDB 为系统服务：
```bash
[root@lpc mongodb-5.0.0]# echo $MONGO_HOME
/data/mongodb-5.0.0

[root@lpc mongodb-5.0.0]# cat<<-EOF>/usr/lib/systemd/system/mongodb.service
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

[root@lpc mongodb-5.0.0]# chmod 755 /usr/lib/systemd/system/mongodb.service
```
设置开机自启动：
```bash
[root@lpc mongodb-5.0.0]# systemctl start mongodb
[root@lpc mongodb-5.0.0]# systemctl status mongodb
● mongodb.service - mongodb-server
   Loaded: loaded (/usr/lib/systemd/system/mongodb.service; enabled; vendor preset: disabled)
   Active: active (running) since Thu 2025-09-25 13:55:28 CST; 628ms ago
  Process: 12722 ExecStart=/data/mongodb-5.0.0/bin/mongod --config /data/mongodb-5.0.0/mongodb.conf (code=exited, status=0/SUCCESS)
 Main PID: 12724 (mongod)
    Tasks: 34 (limit: 22548)
   Memory: 54.6M
   CGroup: /system.slice/mongodb.service
           └─12724 /data/mongodb-5.0.0/bin/mongod --config /data/mongodb-5.0.0/mongodb.conf

Sep 25 13:55:27 lpc systemd[1]: Starting mongodb-server...
Sep 25 13:55:27 lpc mongod[12722]: about to fork child process, waiting until server is ready for connections.
Sep 25 13:55:27 lpc mongod[12724]: forked process: 12724
Sep 25 13:55:28 lpc mongod[12722]: child process started successfully, parent exiting
Sep 25 13:55:28 lpc systemd[1]: Started mongodb-server.
```
连接 MongoDB：
```bash
[root@lpc mongodb-5.0.0]# mongo --port 3717
MongoDB shell version v5.0.0
connecting to: mongodb://127.0.0.1:3717/?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("824697d1-a40a-42af-a6dd-a0a93bb441f7") }
MongoDB server version: 5.0.0
================
Warning: the "mongo" shell has been superseded by "mongosh",
which delivers improved usability and compatibility.The "mongo" shell has been deprecated and will be removed in
an upcoming release.
We recommend you begin using "mongosh".
For installation instructions, see
https://docs.mongodb.com/mongodb-shell/install/
================
Welcome to the MongoDB shell.
For interactive help, type "help".
For more comprehensive documentation, see
        https://docs.mongodb.com/
Questions? Try the MongoDB Developer Community Forums
        https://community.mongodb.com
---
The server generated these startup warnings when booting: 
        2025-09-25T13:55:27.537+08:00: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine. See http://dochub.mongodb.org/core/prodnotes-filesystem
        2025-09-25T13:55:28.248+08:00: Access control is not enabled for the database. Read and write access to data and configuration is unrestricted
        2025-09-25T13:55:28.248+08:00: You are running this process as the root user, which is not recommended
        2025-09-25T13:55:28.248+08:00: /sys/kernel/mm/transparent_hugepage/enabled is 'always'. We suggest setting it to 'never'
        2025-09-25T13:55:28.248+08:00: Failed to read /sys/kernel/mm/transparent_hugepage/defrag
        2025-09-25T13:55:28.248+08:00:         error: ** WARNING: unrecognized transparent Huge Pages mode of operation in /sys/kernel/mm/transparent_hugepage/defrag: 'defer''
        2025-09-25T13:55:28.248+08:00: Soft rlimits for open file descriptors too low
        2025-09-25T13:55:28.248+08:00:         currentValue: 1024
        2025-09-25T13:55:28.248+08:00:         recommendedMinimum: 64000
---
---
        Enable MongoDB's free cloud-based monitoring service, which will then receive and display
        metrics about your deployment (disk utilization, CPU, operation statistics, etc).

        The monitoring data will be available on a MongoDB website with a unique URL accessible to you
        and anyone you share the URL with. MongoDB may use this information to make product
        improvements and to suggest MongoDB products and deployment options to you.

        To enable free monitoring, run the following command: db.enableFreeMonitoring()
        To permanently disable this reminder, run the following command: db.disableFreeMonitoring()
---
> db.version()
5.0.0
```
创建一个 root 用户：
```bash
> use admin
switched to db admin
> db.createUser({user:"root", pwd:"**********", roles:[{role:"dbAdminAnyDatabase", db:"admin"}]})
Successfully added user: {
        "user" : "root",
        "roles" : [
                {
                        "role" : "dbAdminAnyDatabase",
                        "db" : "admin"
                }
        ]
}
> exit
bye
```
至此，MongoDB 安装完成。