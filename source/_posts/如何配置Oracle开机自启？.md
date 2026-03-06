---
title: 如何配置Oracle开机自启？
date: 2021-06-24 23:56:48
tags: [oracle,开机自启]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/74303
---

## 作者简介
>作者：LuciferLiu，中国DBA联盟(ACDU)成员。
>
>目前从事Oracle DBA工作，曾从事 Oracle 数据库开发工作，主要服务于生产制造，汽车金融等行业。现拥有Oracle OCP，OceanBase OBCA认证，擅长Oracle数据库运维开发，备份恢复，安装迁移，Linux自动化运维脚本编写等。

## 前言
大家是否有遇到过，公司通知停电，要求数据库主机在特定时段内关闭开启的情况。如果开库时间被设定在你不方便的时间点，有什么好的解决方案呢？

**答案：设置数据库随主机启动自启服务即可，当然方法可以是多种多样。**

# 一、配置rc.local（单实例）

## 1 修改/etc/oratab

- 修改数据库实例自启动为Y：
```
vi /etc/oratab
##修改为Y
cdb:/u01/app/oracle/product/19.3.0/db_1:Y
```  

## 2 修改dbstart脚本

- 替换`ORACLE_HOME_LISTNER=$1`：
```
cd $ORACLE_HOME/bin
vi dbstart 
##ORACLE_HOME_LISTNER=$1修改为如下
ORACLE_HOME_LISTNER=$ORACLE_HOME
```

## 3 修改/etc/rc.d/rc.local
- 根据实际情况填写路径：
```
vim /etc/rc.d/rc.local
#添加
su oracle -lc "/u01/app/oracle/product/19.3.0/db_1/bin/lsnrctl start"
su oracle -lc /u01/app/oracle/product/19.3.0/db_1/bin/dbstart
```

# 二、配置crs（RAC集群）

## 1 查看crs是否自启动
- 需要提前配置root用户环境变量：
```
##具体路径根据实际情况填写
cat <<EOF>>/root/.bash_profile
alias crsctl='/u01/app/19.3.0/grid/bin/crsctl'
EOF

##生效环境变量
source /root/.bash_profile
```
- 设置crs自启动：
```
##root用户下
crsctl config has

##如果显示disable则开启
crsctl enable has
```
## 2 查看AUTO_START参数
```
/u01/app/19.3.0/grid/bin/crsctl stat res ora.orcl.db -p | grep AUTO_START
```
注意：其中 `ora.orcl.db` 需要根据实际情况来填写。输出结果为 `restore` 即 未开启。

## 3 设置实例跟随crs自启动
```
##root用户下执行
##11g可以这样设置，
/u01/app/19.3.0/grid/bin/crsctl modify res ora.orcl.db -attr AUTO_START=always
    
##19c需要加上参数 -unsupported
/u01/app/19.3.0/grid/bin/crsctl modify resource "ora.orcl.db" -attr "AUTO_START=always" -unsupported
```
自从12.1.0.2之后，如果使用crsctl 进行ora resource的修改、启动、关闭，都会遭遇 `CRS-4995 The command 'Modify resource' is invalid in crsctl. Use srvctl for this command.`的错误。

**<font color='blue'>解决方案：加上-unsupported的参数。</font>**

#  三、重启测试
## 重启数据库主机
```
##关闭数据库实例
##单实例
sqlplus / as sysdba
shutdown immediate

##rac集群
srvctl stop database -d orcl

##重启主机
reboot
```


## 检查数据库状态
``` 
##等待主机开启之后，查看数据库实例启动状态
ps -ef|grep smon
sqlplus / as sysdba
select instance_name,status from gv$instance;
    
INSTANCE_NAME    STATUS
---------------- ------------
cdb              OPEN
 ```   
**可以看到，重启主机后数据库已经成功启动，并且实例状态为OPEN，说明已经设置成功。**

---
本次分享结束啦~

感谢您的阅读，希望对您有所帮助！

>- 墨天轮：Lucifer三思而后行
>- CSDN：Lucifer三思而后行
>- 微信公众号：Lucifer三思而后行