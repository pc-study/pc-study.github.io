---
title: 实战篇：Oracle 配置透明网关访问 MySQL 详细教程
date: 2021-11-16 23:30:13
tags: [墨力计划,dba]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/168336
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
从 Oracle 无法直接访问 Mysql 数据库，需要配置透明网关后通过 DBLink 实现访问。

今天搞了一下午透明网关配置，流程比较复杂，并且有一些坑，这不立刻来给大家排排坑，说不定以后就用的着呢！

废话不多说，直接实战走起~

# 一、环境准备
本次环境准备了 3 台主机，分别是 Oracle 数据库，MySQL 数据库，透明网关。

- **⭐️ Linux 主机安装教程可参考：[实战篇：VMware Workstation 虚拟机安装 Linux 系统](https://www.modb.pro/db/156576)**
- **⭐️ Oracle 单机安装教程可参考：[实战篇：Linux 安装 Oracle 11GR2 数据库保姆级教程](https://www.modb.pro/db/168337)**
- **⭐️ Oracle RAC 安装教程可参考：[实战篇：一步步教你 Linux 7 安装 Oracle 11GR2 RAC](https://www.modb.pro/db/153861)**
- **⭐️ Oracle 脚本一键安装可参考：[开源项目：Install Oracle Database By Scripts！](https://mp.weixin.qq.com/s/BFbpl-7553wRXx-YGdWpQQ)**
- **⭐️ MySQL 安装教程可参考：[实战篇：手把手教你 Linux 安装 MySQL 详细教程](https://www.modb.pro/db/168340)**

>**❤️ Oracle 安装包合集和补丁下载地址：[2021年Oracle第三季度补丁合集](https://www.modb.pro/download/210188)**
>
环境信息：
|用途|主机名|IP地址|主机版本|数据库版本|DB名称|端口号|
|--|--|--|--|--|--|--|
|Oracle 数据库|orcl|10.211.55.100|RHEL7.6|11GR2|orcl|1521|
|MySQL 数据库|mysql|10.211.55.101|RHEL7.6|8.0.26|lucifer|3306|
|透明网关主机|gateway|10.211.55.102|RHEL7.6|11GR2|无|1521|

**为什么透明网关需要单独配置一台主机？**

- 不影响数据库主机的正常运行
- 便于安装配置以及管理
- 数据库迁移时不需要重新配置透明网关
- RAC 环境下，无需重复安装配置多个节点

**📢 注意：** 透明网关主机的配置不需要很高，无需安装 Oracle 数据库，仅安装透明网关即可！

# 二、实战演示
## 1、介质装备
首先，需要下载 GateWay 和 MySQL ODBC安装包：
- mysql-connector-odbc-8.0.27-1.el7.x86_64.rpm
- p13390677_112040_Linux-x86-64_5of7.zip

![](https://img-blog.csdnimg.cn/971bb57ab6d2402cb7b3fc0922c4190b.png)

方便大家学习，我直接上传到百度网盘供大家下载：
```bash
链接: https://pan.baidu.com/s/1ybJGu1JCbOgRbjCTqtl9TA 
提取码: l062
```
## 2、安装透明网关
### 2.1、主机环境配置
下载上述安装介质并上传透明网关主机：

![](https://img-blog.csdnimg.cn/b397a9e4b49f4aaaaf46bf5c0905b045.png)

**📢 注意：** 安装透明网关之前需要配置环境和创建用户等等，可以参照 Linux 安装单机 Oracle 的环境配置步骤，这里就不再详述了！

使用 Oracle 一键安装脚本配置即可：
```bash
cd /soft
./OracleShellInstall.sh -i 10.211.55.102 -txh Y
```
![](https://img-blog.csdnimg.cn/88f55ac71cc444c8ac39e915035e3415.png)

**📢 注意：** 由于主机安装时选择了最小化安装，并且安装透明网关需要图形化，因此加上 `-txh Y` 安装图形化界面！

![](https://img-blog.csdnimg.cn/33bd73489686491fb095b1cb04934077.png)

<font color='orage'>**稍许等待几分钟之后，即可配置完成，由于没有上传 DB 安装包，这个报错是正常！**</font>

### 2.2、正式安装
主机配置完成后，开始安装透明网关：
```bash
## 首先 root 用户下，授权 oracle 访问 /soft 目录
chown -R oracle:oinstall /soft
## 切换到 oracle 用户下
su - oracle
## 解压透明网关安装包
unzip -q p13390677_112040_Linux-x86-64_5of7.zip
## 配置 vnc 访问图形化界面
vncserver
```
![](https://img-blog.csdnimg.cn/16c0acf8fb274719bd347beaade5d13b.png)

使用 VNC 客户端连接：

![](https://img-blog.csdnimg.cn/2231374cfe0c4f6e9f53d6cf65e17523.png)

开始安装：

![](https://img-blog.csdnimg.cn/241a7782522144cdbde865f660914da0.png)

![](https://img-blog.csdnimg.cn/6af4662c19204f57ab1125dcbf9a3bc5.png)

![](https://img-blog.csdnimg.cn/b2a33dd4e6cc45ddafb2ebc99fa0cdaf.png)

确认安装位置：

![](https://img-blog.csdnimg.cn/54dd4c505eb14edfaf24af4e6a65e3e8.png)

![](https://img-blog.csdnimg.cn/23895854861f43dcb77e4c13fb561d94.png)

这里选择 `for ODBC` 即可：

![](https://img-blog.csdnimg.cn/5709f2e6acc54de48caf123f6019c452.png)

![](https://img-blog.csdnimg.cn/92d4b98f0d274ed19e984cee6f671629.png)

开始安装，静待结束：

![](https://img-blog.csdnimg.cn/00ebbc9af596475ca533d6b7ed670ab8.png)

`root` 用户下执行 `root.sh` 脚本：
```bash
/u01/app/oraInventory/orainstRoot.sh
/u01/app/oracle/product/11.2.0/db/root.sh
```
![](https://img-blog.csdnimg.cn/c7a4771943d34af89027a29055db3ab7.png)

配置监听：

![](https://img-blog.csdnimg.cn/59fc6d84d1494762b1c6dfd2cc11585f.png)

![](https://img-blog.csdnimg.cn/a41542ad6d0e4511b470e1202ad624eb.png)

<font color='orage'>**至此，透明网关安装结束！**</font>
### 2.3、安装 mysql-connector
首先需要安装 `unixODBC` 依赖，否则报错：

![](https://img-blog.csdnimg.cn/b1669a3b7fd14f0abe2692842ef1a207.png)

安装 `unixODBC` 依赖后安装 `mysql-connector`：
```bash
yum install -y unixODBC*
rpm -ivh mysql-connector-odbc-8.0.27-1.el7.x86_64.rpm
```
![](https://img-blog.csdnimg.cn/cdf1c66a5f6a41aebced83f4722f3ae8.png)

**📢 注意：** 透明网关的安装到这里就全都结束了，接下来就是配置部分了。

## 3、透明网关配置
透明网关安装好之后，自然是需要配置才能使用的。
### 3.1、配置 odbc.ini
`odbc.ini` 文件用来存放 MySQL 数据库相关信息，默认不存在，`root` 用户下手动创建即可：
```bash
cat<<EOF>/etc/odbc.ini
[lucifer]
Description     = ODBC for MySQL
Driver          = /usr/lib64/libmyodbc8w.so
Server          = 10.211.55.101
Port            = 3306
User            = lucifer
Password        = lucifer
Database        = lucifer 
EOF
```
![](https://img-blog.csdnimg.cn/d77b64f4281a4a1a95ead436f91b2ef2.png)

配置文件中的配置信息如下：
- **[lucifer]** 可以理解为是一个 SID 名称，可以自定义，后面配置需要用到；
- **Server** 是指 MySQL 数据库主机的 IP 地址；
- **Port** 是指 MySQL 数据库的端口；
- **User** 是指 Oracle 需要访问的用户名；
- **Password** 是指被访问用户的登录密码；
- **Database** 是指需要 MySQL 数据库需要被访问的 DB 名称；

**📢 注意：** 如果有多个 MySQL 数据库需要配置，则填写多个即可！
```bash
[lucifer]
Description     = ODBC for MySQL
Driver          = /usr/lib64/libmyodbc8w.so
Server          = 10.211.55.101
Port            = 3306
User            = lucifer
Password        = lucifer
Database        = lucifer 

[lucifer1]
Description     = ODBC for MySQL
Driver          = /usr/lib64/libmyodbc8w.so
Server          = 10.211.55.105
Port            = 3306
User            = lucifer1
Password        = lucifer1
Database        = lucifer1
```
### 3.2、配置 init[SID].ora
切换至 `oracle` 用户，进入 `$ORACLE_HOME/hs/admin`  目录下，新建一个 **init[SID].ora** 文件：
```bash
cat<<EOF>$ORACLE_HOME/hs/admin/initlucifer.ora
##HS Configuration
HS_FDS_CONNECT_INFO = lucifer
HS_FDS_TRACE_LEVEL = debug
HS_FDS_SHAREABLE_NAME = /usr/lib64/libodbc.so
HS_FDS_SUPPORT_STATISTICS=FALSE
HS_LANGUAGE=AMERICAN_AMERICA.UTF8
HS_NLS_NCHAR = UCS2
##ODBC Configuration
set ODBCINI=/etc/odbc.ini
EOF
```
![](https://img-blog.csdnimg.cn/2626716681cd43918dca7712a94b9f43.png)

这里 initSID.ora 中的 **SID** 名称和文件中 **HS_FDS_CONNECT_INFO** 参数值，就是上一步中我们配置 **odbc.ini** 文件中的 `[lucifer]` 名称。

**📢 注意：** 如果有多个 MySQL 数据库需要配置，则创建多个 **init[SID].ora 文件** 即可！
### 3.3、配置监听
oracle 用户下，进入 `$TNS_ADMIN` 配置 listener.ora 文件：
```bash
cat<<EOF>>$TNS_ADMIN/listener.ora
SID_LIST_LISTENER =
(SID_LIST =
  (SID_DESC=
  (SID_NAME=lucifer)
  (ORACLE_HOME=/u01/app/oracle/product/11.2.0/db)
  (PROGRAM=dg4odbc)
  )
)
EOF
```
![](https://img-blog.csdnimg.cn/677fecfd6b824d7eaeade7b1b55aeadd.png)

**📢 注意：** 如果有多个 MySQL 数据库需要配置，则写成如下格式！
```bash
cat<<EOF>>$TNS_ADMIN/listener.ora
SID_LIST_LISTENER =
(SID_LIST =
  (SID_DESC =
  (SID_NAME = lucifer)
  (ORACLE_HOME=/u01/app/oracle/product/11.2.0/db)
  (PROGRAM=dg4odbc)
  )
  (SID_DESC =
  (SID_NAME = lucifer1)
  (ORACLE_HOME=/u01/app/oracle/product/11.2.0/db)
  (PROGRAM=dg4odbc)
  )
)
EOF
```
重启监听：
```bash
lsnrctl stop
lsnrctl start
lsnrctl status
```
![](https://img-blog.csdnimg.cn/9ca329c894c84038bd61449700a80e5e.png)

**配置完成之后，测试是否可以连接 MySQL 数据库：**
```bash
isql lucifer
```
![](https://img-blog.csdnimg.cn/d7cd9a2cea3548bc8b0a2a0ae90b2d97.png)

**<font color='orage'>成功连接 MySQL 数据库，至此透明网关配置完成！</font>**
## 4、Oracle 数据库配置
透明网关配置完成后，就只需要配置 Oracle 数据库来连接透明网关。
### 4.1、配置 TNS
通过配置 TNS 来连接透明网关，进入 TNS 配置文件目录 `$TNS_ADMIN` 配置 TNS：
```bash
cat<<EOF>>$TNS_ADMIN/tnsnames.ora
lucifer =
  (DESCRIPTION =
    (ADDRESS_LIST =
      (ADDRESS = (PROTOCOL = TCP)(HOST = 10.211.55.102)(PORT = 1521))
    )
    (CONNECT_DATA =
      (SID = lucifer)
    )
   (HS = OK)
  )
EOF
```
![](https://img-blog.csdnimg.cn/2de3e1b78f9e417296b57f6235eb21bf.png)

通过 `tnsping` 测试后，发现访问没有问题！

### 4.2、配置 DBLink 连接 MySQL 数据库
接下来只需要创建你 DBLink 即可连接 MySQL 数据库：
```sql
create public database link lucifer connect to "lucifer" identified by "lucifer" using 'lucifer';
```
![](https://img-blog.csdnimg.cn/fb14f8e7031c47888cc6f9f53e8a6a94.png)

测试连接操作 MySQL 数据库：
```sql
select * from "lucifer"@lucifer order by "id";
delete from "lucifer"@lucifer where "id"=1;
```
![](https://img-blog.csdnimg.cn/5d5bf4635acf4e89a730f518d94e73ce.png)

<font color='orage'>**至此，整个 Oracle 配置透明网关访问 MySQL 就完成了！**</font>
# 三、最后总结
如果按照我的步骤来操作，整个流程走下来应该会比较顺畅，下面罗列一下我操作过程中遇到的一些报错：

1、**init[sid].ora** 配置文件的 `HS_FDS_SHAREABLE_NAME = /usr/lib64/libodbc.so` 不正确，应该是 ODBC 的 Lib包：
```bash
ERROR at line 1:
ORA-28500: connection from ORACLE to a non-Oracle system returned this message:
ORA-02063: preceding line from DLK
```
2、**init[sid].ora** 里配置的 `HS_LANGUAGE=AMERICAN_AMERICA.zhs16gbk` 字符集不正确或者没有配置，应该是 `Oracle` 数据库字符集：
```bash
ERROR at line 1:
ORA-28500: connection from ORACLE to a non-Oracle system returned this message:
[
```
3、执行查询操作时，表名需要带双引号，因为 MySQL 默认表名是区分大小写，而 Oracle 是不区分大小写的：
```bash
ERROR at line 1:
ORA-00942: table or view does not exist
[MySQL][ODBC 8.0(w) Driver][mysqld-5.7.18-log]Table 'test.T1' doesn't exist
{42S02,NativeErr = 1146}
ORA-02063: preceding 2 lines from DLK
```
4、Oracle 数据库配置 TNS 时，没有加 `(HS = OK)`：
```bash
ERROR at line 1:
ORA-28546: connection initialization failed, probable Net8 admin error
ORA-02063: preceding line from LUCIFER
```

>本文部分内容参考文档：[Oracle透明网关访问MySQL数据库](https://www.cnblogs.com/rangle/p/8967643.html)

---

# 往期精彩文章
>[Oracle 一键巡检自动生成 Word 报告](https://mp.weixin.qq.com/s/0xFe5m1DQ0ucT2_266hsrA)    
[Oracle 一键安装合集](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5MzcwNzQ0MQ==&action=getalbum&album_id=3497774649285296131#wechat_redirect)    
[Oracle一键安装脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/gv6t97FFyMsd6e4GH1HAwQ)    
[Oracle一键巡检脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/4zI73auIUhwSRb7qL3UIfw)    
[全网首发：Oracle 23ai 一键安装脚本（非 RPM）](https://mp.weixin.qq.com/s/UL0BSMCAZrOQgCoWpDMGew)    
[Oracle 19C 最新 RU 补丁 19.24 ，一键安装！](https://mp.weixin.qq.com/s/T7GbpwhnMugzk7PB6hAoJQ)    
[Oracle Linux 7.9 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/dT4tFMYVZ3mh49CI6V3YEA)    
[RedHat 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cQJ6gP1bM_7m0H5-Dha4TA)    
[openEuler 22.03 LTS SP4 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/sx1E4GIvIeQXp2vGMmVr2A)    
[RHEL 7.9 一键安装 Oracle 19C 19.23 RAC](https://mp.weixin.qq.com/s/mUHqU5hQ9GdH2bKuClPt5A)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q)    
[优化 Oracle：最佳实践与开发规范](https://mp.weixin.qq.com/s/DysIcb-p11j56d3YtlqpcQ)    
[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA)    
[Linux 一键配置时钟同步全攻略](https://mp.weixin.qq.com/s/yvth1vorP3JjUp3g3vPBAQ)    

---

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎**点赞+关注**，我会持续分享数据库知识、运维技巧。