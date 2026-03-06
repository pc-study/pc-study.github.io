---
title: 实战篇：Oracle 数据库标准版（SE）转换为企业版（EE）
date: 2022-06-02 11:34:54
tags: [oracle,大数据,数据库]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/411233
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
很多 Oracle 数据库在初始安装的时候选择了标准版，而相对企业版来说就少了：RAC、ASM、DataGuard、闪回功能、分区表等等一些很实用的功能：
```sql
SELECT *
  FROM v$option
 WHERE parameter IN ('Oracle Data Guard',
                     'Active Data Guard',
                     'Flashback Table',
                     'Flashback Database',
                     'Online Index Build',
                     'Partitioning');
PARAMETER                       			VALUE
-------------------------------------------------
Partitioning                    			FALSE
Online Index Build              			FALSE
Oracle Data Guard               			FALSE
Flashback Table                 			FALSE
Flashback Database              			FALSE
Active Data Guard               			FALSE 
```
那么如何将标准版升级到企业版呢？Oracle 给我们提供了具体方案：
- [How to Convert Database from Standard to Enterprise Edition (till 11gR2)? (Doc ID 117048.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=117048.1)

下面我就来测试一下升级过程！

# 环境准备
| 主机名 | IP地址 | 主机版本 | Oracle 版本 | 实例名 | 
|--|--|--|--|--|
| orcl | 10.211.55.100 | rhel8.6 | 19.15 SE2 | orcl |

# 正式转换
Oracle 创建数据库均使用相同的 `SQL.BSQ` 脚本，因此数据库在内部几乎相同，转换过程不是很复杂。
## 备份数据库
首先，出于数据安全考虑，转换前进行一次备份：
```bash
run {
allocate channel c1 device type disk;
allocate channel c2 device type disk;
backup database include current controlfile format '/backup/backdb_%d_%T_%t_%s_%p';
backup archivelog all format '/backup/arch_%d_%T_%t_%s_%p';
release channel c1;
release channel c2;
}
```
确保备份成功：
```sql
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
 order by 3 desc;
```
最好把参数文件、密码文件以及监听文件：
```bash
cp -r $ORACLE_HOME/dbs /soft/
cp -r $ORACLE_HOME/network/admin /soft/
```
## 关闭数据库
关闭数据库相关的所有服务：
```bash
lsnrctl stop
sqlplus / as sysdba<<EOF
shu immediate
exit
EOF
```
## 卸载 Oracle SE 软件
这里的卸载不建议使用 `deinstall`，建议使用 `runInstaller` 来卸载 `ORACLE_HOME`：
```bash
$ORACLE_HOME/oui/bin/runInstaller -silent -detachHome -invPtrLoc /etc/oraInst.loc ORACLE_HOME=$ORACLE_HOME
```
使用以上命令 `$ORACLE_HOME` 下的所有文件和目录都被保留，实际上没有从 `$ORACLE_HOME` 文件系统中删除任何内容。它只是从 `Oracle Central Inventory` 中删除了该特定 `$ORACLE_HOME` 的所有信息。

**可参考 MOS 文档**：[Behaviour of the Oracle De-install/Deinstall/Uninstall Utility in 11gR2 (Doc ID 1363753.1)	](https://support.oracle.com/epmos/faces/DocContentDisplay?id=1363753.1)
## 安装 Oracle EE 软件
由于旧的 ORACLE_HOME 没有删除，所以建议创建新的 ORACLE_HOME 目录：
```bash
## 创建新的 ORACLE_HOME
mkdir -p /u01/app/oracle/product/19.3.0/db1
## 修改环境变量
export ORACLE_HOME=/u01/app/oracle/product/19.3.0/db1
## 解压 DB 软件至新的 ORACLE_HOME
unzip -q LINUX.X64_193000_db_home.zip -d $ORACLE_HOME
## 解压 OPatch 补丁包
unzip -q -o p6880880_190000_Linux-x86-64.zip -d $ORACLE_HOME
## 安装 RU 补丁和 Oracle EE 软件(需要调用图形化界面)
cd $ORACLE_HOME
./runInstaller -applyRU /soft/33806152
## 执行 root.sh
/u01/app/oracle/product/19.3.0/db1/root.sh
```
至此，Oracle EE 安装完成。
## 启动数据库
启动数据库之前，需要将原先的 `$ORACLE_HOME/dbs` 下的参数文件、密码文件拷贝到新的 `$ORACLE_HOME` 下：
```bash
## 恢复参数文件和密码文件
cd /soft/dbs
cp orapworcl $ORACLE_HOME/dbs
cp spfileorcl.ora $ORACLE_HOME/dbs

## 恢复监听文件
cd /soft/admin
cp listener.ora $ORACLE_HOME/network/admin
cp sqlnet.ora $ORACLE_HOME/network/admin
cp tnsnames.ora $ORACLE_HOME/network/admin
```
启动监听和数据库：
```bash
lsnrctl start
sqlplus / as sysdba<<EOF
startup
exit
EOF
```
此时再次查询版本以及可选功能:
```sql
-- 查看数据库版本
SQL> select banner_full from v$version;

BANNER_FULL
----------------------------------------------------------------------
Oracle Database 19c Enterprise Edition Release 19.0.0.0.0 - Production
Version 19.15.0.0.0
-- 查看可选功能
SELECT *
  FROM v$option
 WHERE parameter IN ('Oracle Data Guard',
                     'Active Data Guard',
                     'Flashback Table',
                     'Flashback Database',
                     'Online Index Build',
                     'Automatic Storage Management',
                     'Partitioning',
                     'Real Application Clusters');
PARAMETER                       			VALUE
-------------------------------------------------
Partitioning                    			TRUE
Online Index Build              			TRUE
Oracle Data Guard               			TRUE
Flashback Table                 			TRUE
Flashback Database              			TRUE
Active Data Guard               			TRUE 
```
此时已经转换成功。
## 执行升级脚本
运行 `catalog.sql` 和 `catproc.sql` 脚本：
```sql
sqlplus / as sysdba @?/rdbms/admin/catalog.sql
sqlplus / as sysdba @?/rdbms/admin/catproc.sql
```
这两个脚本的执行可能不是在所有情况下都是强制性的，但最好运行它们，因为数据字典的复杂性，我们无法确保创建所有 EE 对象。
## 编译无效对象
最后，重新编译数据库中的所有无效对象：
```sql
sqlplus / as sysdba @?/rdbms/admin/utlrp.sql
```
# 注意事项
在整个转换过程中，有哪些需要注意的点：
- 确保你的企业版服务器软件的版本号（和补丁版本）与原始标准版服务器软件的版本相同；
- Windows 系统，必须在重新安装软件后重新创建数据库服务（通过 ORADIM）；

**END！**

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