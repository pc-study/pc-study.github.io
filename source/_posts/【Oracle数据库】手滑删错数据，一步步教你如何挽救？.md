---
title: 【Oracle数据库】手滑删错数据，一步步教你如何挽救？
date: 2021-11-10 23:05:36
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/162620
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)



# 前言
**<font color='orage'>常在河边走，哪能不湿鞋？</font>**

今天有客户联系说误更新数据表，导致数据错乱了，希望将这张表恢复到 **一周前** 的指定时间点。
- 数据库版本为 `11.2.0.1`
- 操作系统是 `Windows64`
- 数据已经被更改超过1周时间
- 数据库已开启归档模式
- 没有DG容灾
- 有RMAN备份 

**下面模拟一下问题的详细解决过程！**
# 一、分析
**以下只列出常规恢复手段：**
- 数据已经误操作超过一周，所以排除使用UNDO快照来找回；
- 没有DG容灾环境，排除使用DG闪回；
- 主库已开启归档模式，并且存在RMAN备份，可使用RMAN异机恢复表对应表空间，使用DBLINK捞回数据表；
- Oracle 12C后支持单张表恢复；

**<font color='orage'>结论：安全起见，使用RMAN异机恢复表空间来捞回数据表。</font>**
# 二、思路
客户希望将表数据恢复到 <2021/06/08 17:00:00> 之前某个时间点。

**<font color='orange'>大致操作步骤如下：</font>**
- 主库查询误更新数据表对应的表空间和无需恢复的表空间。
- 新主机安装Oracle 11.2.0.1数据库软件，无需建库，目录结构最好保持一致。
- 主库拷贝参数文件，密码文件至新主机，根据新主机修改参数文件和创建新实例所需目录。
- 新主机使用修改后的参数文件打开数据库实例到nomount状态。
- 主库拷贝备份的控制文件至新主机，新主机使用RMAN恢复控制文件，并且MOUNT新实例。
- 新主机RESTORE TABLESPACE恢复至时间点  **<2021/06/08 16:00:00>**。
- 新主机RECOVER DATABASE SKIP TABLESPACE恢复至时间点  **<2021/06/08 16:00:00>**。
- 新主机实例开启到只读模式。
- 确认新主机实例的表数据是否正确，若不正确则重复 **第7步** 调整时间点慢慢往 **<2021/06/08  17:00:00>** 推进恢复。
- 主库创建连通新主机实例的DBLINK，通过DBLINK从新主机实例捞取表数据。

**📢 注意：** 选择表空间恢复是因为主库数据量比较大，如果全库恢复需要大量时间。

# 三、测试环境模拟
为了数据脱敏，因此以测试环境模拟场景进行演示！

⭐️ 测试环境可以使用脚本安装，可以使用博主编写的 Oracle 一键安装脚本，同时支持单机和 RAC 集群模式！
>**[Oracle 数据库一键安装脚本](https://www.modb.pro/course/148)**

**<font color='red'>更多更详细的脚本使用方式可以订阅专栏：</font>[Oracle 一键安装脚本实操合集，持续更新中！！！](https://www.modb.pro/db/1773583263184031744)。**

## 1、环境准备
测试环境信息如下：
| 节点 | 主机版本 | 主机名 | 实例名 | Oracle版本 | IP地址 |
|-----|-----|------|-----|-----|------|
| 主库 | rhel6.9 | orcl | orcl | 11.2.0.1 | 10.211.55.111 |
| 新主机 | rhel6.9 | orcl | 不创建实例 | 11.2.0.1  | 10.211.55.112 |

## 2、模拟测试场景
主库开启归档模式：
```bash
sqlplus / as sysdba
## 设置归档路径
alter system set log_archive_dest_1='LOCATION=/archivelog';
## 重启开启归档模式
shutdown immediate
startup mount
alter database archivelog；
## 打开数据库
alter database open;
```
创建测试数据：
```bash
sqlplus / as sysdba
## 创建表空间
create tablespace lucifer datafile '/oradata/orcl/lucifer01.dbf' size 10M autoextend off;
create tablespace ltest datafile '/oradata/orcl/ltest01.dbf' size 10M autoextend off;
## 创建用户
create user lucifer identified by lucifer;
grant dba to lucifer;
## 创建表
conn lucifer/lucifer
create table lucifer(id number not null,name varchar2(20)) tablespace lucifer;
## 插入数据
insert into lucifer values(1,'lucifer');
insert into lucifer values(2,'test1');
insert into lucifer values(3,'test2');
commit;
```
![](https://img-blog.csdnimg.cn/20210617180444975.png)

进行数据库全备：
```bash
rman target /
## 进入 rman 后执行以下命令
run {
allocate channel c1 device type disk;
allocate channel c2 device type disk;
crosscheck backup;
crosscheck archivelog all; 
sql"alter system switch logfile";
delete noprompt expired backup;
delete noprompt obsolete device type disk;
backup database include current controlfile format '/backup/backlv0_%d_%T_%t_%s_%p';
backup archivelog all DELETE INPUT;
release channel c1;
release channel c2;
}
```
![](https://img-blog.csdnimg.cn/20210617180630264.png)

模拟数据修改：
```bash
sqlplus / as sysdba
conn lucifer/lucifer
delete from lucifer where id=1;
update lucifer set name='lucifer' where id=2;
commit;
```
![](https://img-blog.csdnimg.cn/20210617180723979.png)

**📢 注意：** 为了模拟客户环境，假设无法通过UNDO快照找回，当前删除时间点为：**<2021/06/17 18:10:00>**。

**<font color='orage'>如果使用UNDO快照，比较方便：</font>**
```bash
sqlplus / as sysdba
## 查找UNDO快照数据是否正确
select * from lucifer.lucifer as of timestamp to_timestamp('2021-06-17 18:05:00','YYYY-MM-DD HH24:MI:SS');
## 将UNDO快照数据捞至新建表中
create table lucifer.lucifer_0617 as select * from lucifer.lucifer as of timestamp to_timestamp('2021-06-17 18:05:00','YYYY-MM-DD HH24:MI:SS');
```
![](https://img-blog.csdnimg.cn/20210618171123507.png)
# 四、RMAN完整恢复过程
主库查询误更新数据表对应的表空间和无需恢复的表空间：
```bash
sqlplus / as sysdba
## 查询误更新数据表对应表空间
select owner,tablespace_name from dba_segments where segment_name='LUCIFER';
## 查询所有表空间
select tablespace_name from dba_tablespaces;
```
![](https://img-blog.csdnimg.cn/20210618141648327.png)

![](https://img-blog.csdnimg.cn/2021061814464188.png)

主库拷贝参数文件，密码文件至新主机，根据新主机修改参数文件和创建新实例所需目录：
```bash
## 生成pfile参数文件
sqlplus / as sysdba
create pfile='/home/oracle/pfile.ora' from spfile;
exit;
## 拷贝至新主机
su - oracle
scp /home/oracle/pfile.ora 10.211.55.112:/tmp
scp $ORACLE_HOME/dbs/orapworcl 10.211.55.112:$ORACLE_HOME/dbs
## 新主机根据实际情况修改参数文件并且创建目录
mkdir -p /u01/app/oracle/admin/orcl/adump
mkdir -p /oradata/orcl/
mkdir -p /archivelog
chown -R oracle:oinstall /archivelog
chown -R oracle:oinstall /oradata
```
![](https://img-blog.csdnimg.cn/20210617163128493.png)

新主机使用修改后的参数文件打开数据库实例到nomount状态：
```bash
sqlplus / as sysdba
startup nomount pfile='/tmp/pfile.ora';
```
![](https://img-blog.csdnimg.cn/20210617165844780.png)

主库拷贝备份的控制文件至新主机，新主机使用RMAN恢复控制文件，并且MOUNT新实例：
```bash
rman target /
list backup of controlfile;
exit;
## 拷贝备份文件至新主机
scp /backup/backlv0_ORCL_20210617_107548592* 10.211.55.112:/tmp
scp /u01/app/oracle/product/11.2.0/db/dbs/0c01l775_1_1 10.211.55.112:/tmp
## 新主机恢复控制文件并开启到mount状态
rman target /
restore controlfile from '/tmp/backlv0_ORCL_20210617_1075485924_9_1';
alter database mount;
```
通过 `list backup of controlfile;` 可以看到控制文件位置：

![](https://img-blog.csdnimg.cn/20210618135728685.png)

![](https://img-blog.csdnimg.cn/20210618143700747.png)

![](https://img-blog.csdnimg.cn/20210618141406283.png)

新主机RESTORE TABLESPACE恢复至时间点 **<2021/06/17 18:06:00>** ：
```bash
## 新主机注册备份集
rman target /
catalog start with '/tmp/backlv0_ORCL_20210617_107548592';
crosscheck backup;
delete noprompt expired backup;
delete noprompt obsolete device type disk;
## 恢复表空间LUCIFER和系统表空间，指定时间点 `2021/06/17 18:06:00`
run {
sql 'alter session set nls_date_format="yyyy-mm-dd hh24:mi:ss"';
set until time '2021-06-17 18:06:00';
allocate channel ch01 device type disk;
allocate channel ch02 device type disk;
restore tablespace SYSTEM,SYSAUX,UNDOTBS1,USERS,LUCIFER;
release channel ch01;
release channel ch02;
}
```
![](https://img-blog.csdnimg.cn/20210618160220424.png)

新主机RECOVER DATABASE SKIP TABLESPACE恢复至时间点 **<2021/06/17 18:06:00>** ：
```bash
rman target /
run {
sql 'alter session set nls_date_format="yyyy-mm-dd hh24:mi:ss"';
set until time '2021-06-17 18:06:00';
allocate channel ch01 device type disk;
recover database skip tablespace LTEST,EXAMPLE;
release channel ch01;
}
```
![](https://img-blog.csdnimg.cn/20210618160604159.png)

**<font color='orage'>这里有一个小BUG：</font>** 客户环境是Windows，执行这一步最后报错，手动offline数据文件依然无法开启数据库。

![windows恢复报错](https://img-blog.csdnimg.cn/20210618175704500.png)

**解决方案：**
```bash
sqlplus / as sysdba
## 将恢复跳过的表空间都offline drop掉，执行以下查询结果
select 'alter database datafile '|| file_id ||' offline drop;' from dba_data_files where tablespace_name in ('LTEST','EXAMPLE');
## 再次开启数据库
alter database open read only;
```
**<font color='orage'>📢 注意：</font>** 如果显示缺归档日志，可以参考如下步骤：
```bash
sqlplus / as sysdba
## 查询恢复需要的归档日志号时间 
alter session set nls_date_format="yyyy-mm-dd hh24:mi:ss"; 
select first_time,sequence# from v$archived_log where sequence#='7';
exit;
## 通过备份RESTORE吐出所需的归档日志 
rman target / 
catalog start with '/tmp/0c01l775_1_1'; 
crosscheck archivelog all; 
run { 
allocate channel ch01 device type disk; 
SET ARCHIVELOG DESTINATION TO '/archivelog';
restore ARCHIVELOG SEQUENCE 7; 
release channel ch01; 
}
## 再次recover进行恢复至指定时间点 2021-06-17 18:06:00 
run { 
sql 'alter session set nls_date_format="yyyy-mm-dd hh24:mi:ss"'; 
set until time '2021-06-17 18:06:00'; 
allocate channel ch01 device type disk; 
recover database skip tablespace LTEST,EXAMPLE; 
release channel ch01; 
} 
```
新主机实例开启到只读模式：
```bash
sqlplus / as sysdba
alter database open read only;
```
![](https://img-blog.csdnimg.cn/20210618153752398.png)
确认新主机实例的表数据是否正确：
```bash
sqlplus / as sysdba
select * from lucifer.lucifer;
```
![](https://img-blog.csdnimg.cn/20210618173156452.png)

**<font color='orage'>📢 注意：</font>** 若不正确则重复 第7步 调整时间点慢慢往 2021/06/17 18:10:00 推进恢复:
```bash
## 关闭数据库
sqlplus / as sysdba
shutdown immediate; 
## 开启数据库到mount状态
startup mount pfile='/tmp/pfile.ora';
## 重复 第7步，往前推进1分钟，调整时间点为 `2021/06/08 18:07:00`
rman target /
run {
sql 'alter session set nls_date_format="yyyy-mm-dd hh24:mi:ss"';
set until time '2021-06-17 18:07:00';
allocate channel ch01 device type disk;
recover database skip tablespace LTEST,EXAMPLE;
release channel ch01;
}
```

主库创建连通新主机实例的DBLINK，通过DBLINK从新主机实例捞取表数据：
```bash
sqlplus / as sysdba
## 创建dblinnk
CREATE PUBLIC DATABASE LINK ORCL112
CONNECT TO lucifer
IDENTIFIED BY lucifer
USING '(DESCRIPTION_LIST=
(DESCRIPTION=
(ADDRESS=(PROTOCOL=tcp)(HOST=10.211.55.112)(PORT=1521))
(CONNECT_DATA=
(SERVICE_NAME=orcl)
)
)
)';
## 通过dblink捞取数据
create table lucifer.lucifer_0618 as select /*+full(lucifer)*/ * from lucifer.lucifer@ORCL112;
select * from lucifer.lucifer_0618;
```
![](https://img-blog.csdnimg.cn/20210618154621621.png)
![](https://img-blog.csdnimg.cn/20210618161111259.png)

**<font color='orage'>至此，整个RMAN恢复过程就结束了！</font>**

# 写在最后
备份永远是最后一道防线，所以备份一定要做好！！！

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

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)