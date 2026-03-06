---
title: ⭐️ Oracle数据库巡检，需要关注哪些点？⭐️（一些个人见解）
date: 2021-08-08 00:02:43
tags: [oracle,dba]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/88694
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)



# 🌲 前言 🌲
**<font color='green'>如果给你一个全新的Oracle单机数据库环境，作为DBA，您需要关注哪些点？本文仅讨论 <font color='red'>Linux</font> 主机~</font>**

>**📢 首先申明本文所述并非标准答案，只是个人的一些见解，欢迎👏🏻大家补充完善~**

**<font color='blue'>首先，当然是确认是单机还是集群模式的数据库！本文主要讲解单机数据库。</font>**

# 一、⭐️ 主机层面 ⭐️
## 1、📚 主机版本和Oracle版本
**主机版本：**
```bash
cat /etc/system-release
cat /etc/redhat-release
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c0848b50bae9403899193a3e7c419d62.png)
**Oracle版本和补丁版本：**
```bash
sqlplus -version
opatch lspatches
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/8281463752ae4ca18ccc27d208c1843b.png)
## 2、💻 主机硬件资源
包括CPU负载，物理内存和磁盘使用。

**CPU负载和内存：**
```bash
top
free -m
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/796658b655f3485abb95932000c65a14.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/98221e41682f4000a4609831a8c998cd.png)
⚠️ 需要注意主机的CPU负载和物理内存使用是否异常，Swap是否被过多使用。

**磁盘使用情况：**
```bash
lsblk
fdisk -l
df -Th
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/b86704a76f754a2eb0ccdf663a6d5bc6.png)
⚠️ 显而易见，需要关注磁盘使用情况，是否存在使用率过高。

## 3、📒 计划任务 crontab
一般计划任务会布置一些备份策略或者归档删除的策略，我们可以通过crontab来查看：
```bash
crontab -l
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/93c59c4f31da4bf08d1eb1a31b98e273.png)
## 4、🌿 检查 Hosts 文件和网络配置
```bash
cat /etc/hosts
ip addr
nmcli connection show
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/250be0bc263c4d57bc4a0f5e39d0dadb.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/e78074eea2974c998aa0ad7d96fc660e.png)
## 5、🍄 检查系统参数文件
```bash
cat /etc/sysctl.conf
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/73243151a7c44f44bbeb0f6bb578c8fa.png)
⚠️ 需注意是否有设置非常规参数。

## 6、🌻 检查 rc.local 文件
rc.local文件用于配置开机自启动脚本，一般会设置关闭透明大页或者Oracle数据库开机自启。
```bash
cat /etc/rc.local
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/bed535db29624d789bac3192e4fd9af4.png)
## 7、🍁 环境变量配置
查看环境变量配置，进一步熟悉环境。
```bash
cat ~/.bash_profile
cat /home/oracle/.bash_profile
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3be1ac635b0443fb8da6b061354e0f44.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/8a88152346a84251a796ac34ad71f0c1.png)
## 8、🌵 检查系统服务
```bash
systemctl status firewalld.service
getenforce
cat /proc/cmdline
cat /etc/sysconfig/network
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/bb2043db1b704cd0a340157d7d67ddbd.png)
# 二、💫 数据库层面 💫
## 1、🍔 查看数据库实例和监听
```bash
ps -ef|grep smon
su - oracle
lsnrctl status
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/8fee1e996a9d4363990ffcfb0d785c6e.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/e0dd988b3d784e2cb895e6ce3645d461.png)
## 2、🍖 数据库表空间使用
```bash
sqlplus / as sysdba
col TABLESPACE_NAME for a20
select tbs_used_info.tablespace_name,
       tbs_used_info.alloc_mb,
       tbs_used_info.used_mb,
       tbs_used_info.max_mb,
       tbs_used_info.free_of_max_mb,
       tbs_used_info.used_of_max || '%' used_of_max_pct
  from (select a.tablespace_name,
               round(a.bytes_alloc / 1024 / 1024) alloc_mb,
               round((a.bytes_alloc - nvl(b.bytes_free,
                                          0)) / 1024 / 1024) used_mb,
               round((a.bytes_alloc - nvl(b.bytes_free,
                                          0)) * 100 / a.maxbytes) used_of_max,
               round((a.maxbytes - a.bytes_alloc + nvl(b.bytes_free,
                                                       0)) / 1048576) free_of_max_mb,
               round(a.maxbytes / 1048576) max_mb
          from (select f.tablespace_name,
                       sum(f.bytes) bytes_alloc,
                       sum(decode(f.autoextensible,
                                  'YES',
                                  f.maxbytes,
                                  'NO',
                                  f.bytes)) maxbytes
                  from dba_data_files f
                 group by tablespace_name) a,
               (select f.tablespace_name,
                       sum(f.bytes) bytes_free
                  from dba_free_space f
                 group by tablespace_name) b
         where a.tablespace_name = b.tablespace_name(+)) tbs_used_info
 order by tbs_used_info.used_of_max desc;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/710fb022276e4c90a85b0de821f86f27.png)
## 3、🍢 检查RMAN备份情况
```bash
rman target /
list backup;

sqlplus / as sysdba
col status for a10
col input_type for a20
col INPUT_BYTES_DISPLAY for a10
col OUTPUT_BYTES_DISPLAY for a10
col TIME_TAKEN_DISPLAY for a10

select input_type,
       status,
       to_char(start_time,
               'yyyy-mm-dd hh24:mi:ss'),
       to_char(end_time,
               'yyyy-mm-dd hh24:mi:ss'),
       input_bytes_display,
       output_bytes_display,
       time_taken_display,
       COMPRESSION_RATIO
  from v$rman_backup_job_details
 where start_time > date '2021-07-01'
 order by 3 desc;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/abed684b93e94b479a44c7db2c0fe3f4.png)
## 4、🍡 检查控制文件冗余
查看控制文件数量和位置，是否处于多份冗余状态。
```bash
sqlplus / as sysdba
show parameter control_files
select name from v$controlfile;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/5d74f92669044961a61bcdbd6829bec7.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/275c01687ec7478b8d24a7105462dcf2.png)
## 5、🍭	检查参数文件
查看数据库参数文件，检查参数使用是否正常。
```bash
sqlplus / as sysdba
show parameter spfile
create pfile='/home/oracle/pfile.ora' from spfile;

strings /home/oracle/pfile.ora
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/10ce25731eac4e1daf24e3458f438c03.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/3e4a16e0d07f4bd4bedc9c336083379f.png)
## 6、🍬 归档和闪回是否开启
```bash
sqlplus / as sysdba
archive log list
select open_mode,log_mode,flashback_on,force_logging from v$database;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/21771eac06a5413588e1b18e1f674463.png)
## 7、🍗 检查在线日志和切换频率
**查看在线日志大小：**
```bash
set line222
col member for a100
select f.group#,f.member,l.sequence#,l.bytes/1024/1024,l.archived,l.status,l.first_time 
from v$logfile f,v$log l 
where f.group# = l.group# 
order by f.group#,f.member;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/f024dc8b1d844a1eb5498fec2b3d016b.png)
**查看在线日志切换频率：**
```bash
col day for a30
SELECT
  SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH:MI:SS'),1,5)  DAY,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'00',1,0)) H00,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'01',1,0)) H01,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'02',1,0)) H02,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'03',1,0)) H03,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'04',1,0)) H04,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'05',1,0)) H05,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'06',1,0)) H06,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'07',1,0)) H07,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'08',1,0)) H08,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'09',1,0)) H09,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'10',1,0)) H10,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'11',1,0)) H11,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'12',1,0)) H12,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'13',1,0)) H13,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'14',1,0)) H14,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'15',1,0)) H15,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'16',1,0)) H16,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'17',1,0)) H17,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'18',1,0)) H18,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'19',1,0)) H19,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'20',1,0)) H20,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'21',1,0)) H21,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'22',1,0)) H22,
  SUM(DECODE(SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH24:MI:SS'),10,2),'23',1,0)) H23,
  COUNT(*)                                                                      TOTAL
FROM
  v$log_history  a where SYSDATE - first_time < 35
GROUP BY SUBSTR(TO_CHAR(first_time, 'MM/DD/RR HH:MI:SS'),1,5) order by 1;
```

## 8、🍕 查看数据库字符集
```bash
select * from nls_database_parameters;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/67a234dd48624113b865c6ab39f05f9f.png)
## 9、🍯 检查无效对象
```bash
SELECT owner,object_name,object_type,status
FROM dba_objects
WHERE status <> 'VALID'
ORDER BY owner,object_name;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/0c51b24287b649bfbe5f4cd6eeb7fef4.png)
## 10、🍋 检查分区表对象
```bash
set line222
col high_value for a100
select t2.TABLE_OWNER,t1.table_name, t1.max_partition_name, t2.high_value
  from (select table_name, max(partition_name) as max_partition_name
          from dba_tab_partitions
         group by table_name) t1,
       (select TABLE_OWNER,table_name, partition_name, high_value
          from dba_tab_partitions
         where tablespace_name not in ('SYSAUX', 'SYSTEM')) t2
 where t1.table_name = t2.table_name
   and t1.max_partition_name = t2.partition_name
   order by 1,2;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/10b984e03307400e818da57ad165def1.png)
需要注意分区的最大扩展分区，是否需要扩展，建议提前进行扩展，避免拆分。

# 三、❄️ 报告层面 ❄️
通过 Oracle 自带的 awr、ash、awrsqrpt等等报告可以清晰了解当前数据库的情况。

## 🍉 1、awr 报告
AWR 包含了数据库运行情况的详细信息收集，常用于分析收集性能问题。

```bash
sqlplus / as sysdba @?/rdbms/admin/awrrpt.sql
```
通过以上命令可以生成 AWR 报告，过程中需要填写 生成报告类型，抓取时间段，具体如何使用请自行查询，也可关注我公众号免费获取 awr 鹰眼调优视频教程。
![在这里插入图片描述](https://img-blog.csdnimg.cn/6a0629f5a8c847eab4deba68a198eaae.png)
##  🍊 2、ash  报告
ash 能抓取到比 AWR 报告更细节的信息，可以精确到分钟，也较为常用。
```bash
sqlplus / as sysdba @?/rdbms/admin/ashrpt.sql
```
如上为生成方式，可选时间段，默认为获取当前时间到15分钟前的报告。


## 🍒 3、awrsqrpt 报告
用于分析单条 SQL 出现性能问题时的报告，需要知道 SQL_ID。
```bash
sqlplus / as sysdba @?/rdbms/admin/awrsqrpt.sql
```
需要填写时间段和sql_id来获取相关sql的报告。

##  🍑 4、sqltrpt 报告
通常与 awrsqrpt 报告一起使用，可获取 Oracle 提供的关于 SQL 的优化建议，一般来说推荐创建索引和profile较多，适合新手来优化sql使用。
```bash
sqlplus / as sysdba @?/rdbms/admin/sqltrpt.sql
```
只需要 SQL_ID 即可。

##  🍍 5、addmrpt 报告
addmrpt 是 oracle 通过对 awr 报告进行自动诊断生成的报告。

```bash
sqlplus / as sysdba @?/rdbms/admin/addmrpt.sql
```
仅作参考作用，真实帮助的意义并不大。过程需要输入时间段。

## 🌽 6、健康检查报告
此类健康检查报告，一般为个人编写脚本执行产生的报告，检查结果根据个人自行定义，通常会包含以上所需信息。当然 Oracle 官方也提供了完整数据库的报告生成方式，这里不做过多介绍，需要的朋友可以联系我获取。


#  ⚡️ 写在最后 ⚡️
通过以上这些检查，相信对你新接触的这个数据库系统已经有了一个大概的了解，接来下，只需要再慢慢的深入分析，然后制订出一套符合实际情况的运维规范来。

**ヾ(◍°∇°◍)ﾉﾞ**

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