---
title: 实战篇：LogMiner 分析数据泵导入参数 TABLE_EXISTS_ACTION 的秘密
date: 2021-08-09 12:43:48
tags: [logminer,oracle,impdp]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/97514
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)


# 前言
前几天，技术交流群里看到大家讨论 `Oracle` 数据泵导入时使用 `table_exists_action` 参数，存在一些疑惑。于是，我打算通过 `LogMiner` 来分析一下在线重做日志，看看到底是怎么玩的。

> - **关于 LogMiner 的官方文档：[Using LogMiner to Analyze Redo Log Files](https://docs.oracle.com/cd/E11882_01/server.112/e22490/logminer.htm#SUTIL019)**
> - **关于 TABLE_EXISTS_ACTION 的官方文档：[TABLE_EXISTS_ACTION
](https://docs.oracle.com/database/121/SUTIL/GUID-C9664F8C-19C5-4177-AC20-5682AEABA07F.htm#SUTIL936)**

建议先阅读简单了解一下，下面👇🏻就开始~ ヾ(◍°∇°◍)ﾉﾞ

# 环境准备
已有 Oracle 11GR2 数据库环境，已开启归档模式。
![在这里插入图片描述](https://img-blog.csdnimg.cn/82d5e72604e34a1db0157076ffd72c79.png)
## 1、安装 LogMiner
Oracle 自带的 sql 脚本与 LogMiner 相关的有以下三个：
![在这里插入图片描述](https://img-blog.csdnimg.cn/e913c80ab4024cd99a6b89089d8ec522.png)在默认情况下，Oracle已经安装了LogMiner工具，如果没有安装，可以依次执行以下 sql 脚本，创建 LogMiner 相关的对象：
```bash
sqlplus / as sysdba @?/rdbms/admin/dbmslm.sql
sqlplus / as sysdba @?/rdbms/admin/dbmslmd.sql
```
脚本需要用 SYS 用户执行，可重复执行。

## 2、创建数据字典文件
DBMS_LOGMNR_D.BUILD 过程需要访问可以放置字典文件的目录。 因为 PL/SQL 过程通常不访问用户目录，所以必须指定一个目录供 DBMS_LOGMNR_D.BUILD 过程使用，否则该过程将失败。
```bash
mkdir /oradata/orcl/logmnr
sqlplus / as sysdba
CREATE DIRECTORY utlfile AS '/oradata/orcl/logmnr';
alter system set utl_file_dir='/oradata/orcl/logmnr' scope=spfile;
shutdown immediate;
startup;
```
要指定目录，需要在初始化参数文件中设置初始化参数 UTL_FILE_DIR，需要重启数据库生效参数。
![在这里插入图片描述](https://img-blog.csdnimg.cn/673d6cf5d6934157a39242d60a89b02e.png)
执行 PL/SQL 过程 DBMS_LOGMNR_D.BUILD。 指定字典的文件名和文件的目录路径名。 此过程创建字典文件。 例如，输入以下内容在 /oradata/orcl/logmnr 中创建文件 dictionary.ora：
```sql
EXECUTE DBMS_LOGMNR_D.BUILD('dictionary.ora','/oradata/orcl/logmnr',DBMS_LOGMNR_D.STORE_IN_FLAT_FILE);
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/53a5e468b05a44709cd118340666b3a1.png)
由于本次仅作实验所用，不单独创建用户和表空间。

## 3、添加在线重做日志
通过 LogMiner.ADD_LOGFILE 添加所有 REDO LOG ：
```sql
-- 查询所有在线重做日志
select member from v$logfile;
-- 添加所有在线重做日志
BEGIN 
    DBMS_LOGMNR.ADD_LOGFILE(LOGFILENAME => '/oradata/orcl/redo03.log',OPTIONS => DBMS_LOGMNR.NEW);
    DBMS_LOGMNR.ADD_LOGFILE(LOGFILENAME => '/oradata/orcl/redo01.log',OPTIONS => DBMS_LOGMNR.ADDFILE);
    DBMS_LOGMNR.ADD_LOGFILE(LOGFILENAME => '/oradata/orcl/redo02.log',OPTIONS => DBMS_LOGMNR.ADDFILE);
end;
```
添加第一个文件时，OPTIONS 需要指定 DBMS_LOGMNR.NEW，后面添加的文件指定 DBMS_LOGMNR.ADDFILE。

## 4、启动 LogMiner
```sql
begin
    DBMS_LOGMNR.START_LOGMNR(DictFileName => '/oradata/orcl/logmnr/dictionary.ora');
end;
```
**<font color='green'>这里需要注意的是，执行启动 LogMiner 的 SESSION 才可以进行查询，否则不能查询。</font>**
## 5、准备数据泵导入数据
创建用户和测试表：
```sql
create user tea identified by tea;
grant dba to tea;
conn tea/tea
create table tea (id number,text varchar2(20));
insert into tea values (1,'test1');
insert into tea values (2,'test2');
commit;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/bac8f7e7607142bcb3ffc85ca38d8c97.png)
数据泵导出表：
```bash
expdp system/oracle directory=DATA_PUMP_DIR dumpfile=tea.dmp logfile=tea.log tables=tea.tea
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/cde06b9e132a4828b289b5c0d8d14010.png)
## 6、查询 LogMiner 记录
```sql
alter session set NLS_DATE_FORMAT='YYYY-MM-DD HH24:mi:ss';
SELECT timestamp, sql_redo, sql_undo, seg_owner FROM v$logmnr_contents WHERE seg_name='TEA' AND seg_owner='TEA';
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/aedb9025cef04770a685a0cc87214f1a.png)
通过查询可以看到上面建表的 DDL 语句已经被查询到。
# 开始实验
数据泵导入参数 `TABLE_EXISTS_ACTION`，通常用于数据库中表已存在的情况下，导入数据时处理的参数。
>TABLE_EXISTS_ACTION=[SKIP | APPEND | TRUNCATE | REPLACE]

可用选项有 4 种，接下来我们依次使用参数来进行测试。
>- SKIP：跳过当前表进行下一个。 如果 CONTENT 参数设置为 DATA_ONLY，这不是有效选项。
>- APPEND：从源加载数据并保持现有数据不变。
>- TRUNCATE：删除现有表数据，然后从源加载数据。
>- REPLACE：删除现有表，然后从源创建并加载数据。 如果 CONTENT 参数设置为 DATA_ONLY，这不是有效选项。

**默认值：SKIP（注意，如果指定了 CONTENT=DATA_ONLY，则默认值是 APPEND，而不是 SKIP）**
## 1、SKIP
SKIP 参数是指导入时跳过已存在的表，添加参数 `TABLE_EXISTS_ACTION=SKIP` 测试。

执行导入：
```bash
impdp system/oracle directory=DATA_PUMP_DIR dumpfile=tea.dmp logfile=tea.log tables=tea.tea table_exists_action=skip
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/39ce363bcd024ab8b2dbe7cf424037da.png)
这个参数比较简单明了，就是直接跳过了存在的表，不进行导入，表数据不变。

## 2、APPEND
APPEND 参数是指导入时对已存在表进行增量导入，添加参数`TABLE_EXISTS_ACTION=APPEND` 测试。

由于目前表数据一样，无法看出效果，先修改表中数据：
```sql
delete from tea.tea where id=2;
insert into tea.tea values (3,'test3');
commit;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/ad22d77e142b4603aa5c96781ba1f858.png)
执行导入：
```bash
impdp system/oracle directory=DATA_PUMP_DIR dumpfile=tea.dmp logfile=tea.log tables=tea.tea table_exists_action=append
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2d70a04fb1664bb392a28001803c6ed6.png)
由于建表时没有主键唯一限制，因此允许存在重复数据，导入后数据如下：
```sql
select * from tea.tea;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/b280e4f653194d52a9c828299083d5e3.png)
当使用 APPEND 参数，如果发现存在表，将导入数据进行增量导入，**<font color='blue'>如果有唯一限制时，有重复数据，将会导入失败</font>**。
![在这里插入图片描述](https://img-blog.csdnimg.cn/1adf24db8ea2408ead1dcdb91be2cae0.png)
也可以通过在导入命令行上指定 DATA_OPTIONS=SKIP_CONSTRAINT_ERRORS 来覆盖此行为。如果有必须加载的数据，但可能会导致违反约束，可以考虑禁用约束，加载数据，然后在重新启用约束之前删除有问题的行。
## 3、TRUNCATE
TRUNCATE 参数会删除原表中所有的数据，并且导入新数据，添加参数`TABLE_EXISTS_ACTION=TRUNCATE` 测试。

执行导入：
```bash
impdp system/oracle directory=DATA_PUMP_DIR dumpfile=tea.dmp logfile=tea.log tables=tea.tea table_exists_action=truncate
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/52a1e4b21b884037bb7286f551f3b17c.png)
查询导入后数据：
```sql
select * from tea.tea;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/9b300d524def4efc884e654471c49171.png)
可以看到之前的数据已经不存在，数据重新导入。
```sql
SELECT timestamp, sql_redo, sql_undo, seg_owner FROM v$logmnr_contents WHERE seg_name='TEA' AND seg_owner='TEA';
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/b1dbca0ad44b4dc3a9d13ec48a9e950b.png)
通过比对导入时间和 LogMiner 表中记录时间，可以看到 TEA 表执行了 TRUNCATE 操作。

## 4、REPLACE
REPLACE 参数会删除已存在的表然后重新创建，并且导入新数据，添加参数`TABLE_EXISTS_ACTION=REPLACE` 测试。

导入前插入几条数据：
```sql
insert into tea values(3,'test3');
insert into tea values(4,'test4');
commit;
```
执行导入：
```bash
impdp system/oracle directory=DATA_PUMP_DIR dumpfile=tea.dmp logfile=tea.log tables=tea.tea table_exists_action=replace
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/6b050cc4eecf4fe4b82f0794ec48b14b.png)
通过导入过程没有看到任何关于表已存在的提示，导入正常，查询数据：
![在这里插入图片描述](https://img-blog.csdnimg.cn/d22962cf6e094b168d9edb9822a6544c.png)
数据只存在导入的数据，导入前新增的数据已经消失。
```sql
SELECT timestamp, sql_redo, sql_undo, seg_owner FROM v$logmnr_contents WHERE seg_name='TEA' AND seg_owner='TEA';
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/256f104b0d6546c0ac6eeaa75ac06d28.png)
通过比对导入时间和 LogMiner 表中记录时间，可以看到 TEA 表先执行 `DROP PURGE` 操作，然后执行 `CREATE TABLE` 重新创建表。

# 总结
使用 SKIP、APPEND 或 TRUNCATE 时，不会修改源中现有的表相关对象，例如索引、授权、触发器和约束。对于 REPLACE，如果依赖对象未被显式或隐式排除（使用 EXCLUDE）并且它们存在于源转储文件或系统中，则会从源中删除并重新创建它们。



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