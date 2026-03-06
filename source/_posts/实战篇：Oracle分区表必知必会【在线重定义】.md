---
title: 实战篇：Oracle分区表必知必会【在线重定义】
date: 2021-07-20 00:49:46
tags: [oracle分区表]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/85211
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
**为什么要普通表转分区表？有哪些方式可以做？**
- 分区表作为Oracle三大组件之一，在Oracle数据库中，起着至关重要的作用。
>**<font color='blue'>分区表有什么优点？</font>**
>- 普通表转分区表：应用程序无感知，DML 语句无需修改即可访问分区表。
>- 高可用性：部分分区不可用不影响整个分区表使用。
>- 方便管理：可以单独对分区进行DDL操作，列入重建索引或扩展分区，不影响分区表的使用。
>- 减少OLTP系统资源争用：因为DML分布在很多段上进行操作。

**<font color='blue'>使用在线重定义的方式进行分区表的转换，优势在于可以在线进行，流程简单，可以快速进行转换。</font>**
# 一、介绍
**DBMS_REDEFINITION（在线重定义）：**
>- **支持的数据库版本**：Oracle Database - Enterprise Edition - Version 9.2.0.4 and later
>- 在线重定义是通过 **物化视图** 实现的。

**使用在线重定义的一些限制条件**：
>- 必须有足够的表空间来容纳表的两倍数据量。
>- 主键列不能被修改。
>- 表必须有主键。
>- 必须在同一个用户下进行在线重定义。
>- SYS和SYSTEM用户下的表无法进行在线重定义。
>- 在线重定义无法采用nologging。
>- 如果中间表有新增列，则不能有NOT NULL约束

**DBMS_REDEFINITION包：**
>- ABSORT_REDEF_TABLE：清理重定义的错误和中止重定义；
>- CAN_REDEF_TABLE：检查表是否可以进行重定义,存储过程执行成功代表可以进行重定义；
>- COPY_TABLE_DEPENDENTS：同步索引和依赖的对象（包括索引、约束、触发器、权限等）；
>- FINISH_REDEF_TABLE：完成在线重定义；
>- REGISTER_DEPENDENTS_OBJECTS：注册依赖的对象，如索引、约束、触发器等；
>- START_REDEF_TABLE：开始在线重定义；
>- SYNC_INTERIM_TABLE：增量同步数据；
>- UNREGISTER_DEPENDENT_OBJECT：不注册依赖的对象，如索引、约束、触发器等；

# 二、实战
**测试环境数据库安装：**
>- 11G：./OracleShellInstall.sh -i 10.211.55.111

**<font color='red'>更多更详细的脚本使用方式可以订阅专栏：</font>[Oracle一键安装脚本](https://www.modb.pro/course/148)。**

## 1 构建测试数据
**创建测试表空间和用户：**
```bash
sqlplus / as sysdba
create tablespace PAR;
create user par identified by par;
grant dba to par;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719145942902.png)
 **创建测试表：**
```bash
sqlplus par/par
create table lucifer(
id number(8) PRIMARY KEY,
name varchar2(20) not null,
par_date date)
tablespace PAR;
comment on table lucifer is 'lucifer表';
comment on column lucifer.name is '姓名';
comment on column lucifer.par_date is '分区日期';
create index id_name on lucifer(name) tablespace par;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719151608549.png)
**插入测试数据：**
```bash
sqlplus par/par
begin
  for i in 0 .. 24 loop
    insert into lucifer values
      (i,
       'lcuifer_' || i,
       add_months(to_date('2021-1-1', 'yyyy-mm-dd'), i));
  end loop;
  commit;
end;
/
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719154800330.png)
**<font color='blue'>可以看到，测试数据已经构建完成，接下来开始实战操作。</font>**
## 2 查看是否能够重定义
**需提前确认表是否有主键，表空间是否足够：**
```bash
sqlplus / as sysdba
##查看主键
select cu.* from user_cons_columns cu, user_constraints au where cu.constraint_name = au.constraint_name and au.constraint_type = 'P' and au.table_name = 'LUCIFER';
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719155234961.png)
**确认是否可以重定义，没有主键用rowid：**
```bash
sqlplus / as sysdba
exec dbms_redefinition.can_redef_table('PAR', 'LUCIFER');
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719155644687.png)
**<font color='blue'>执行没有报错代表可以进行表的在线重定义。</font>**
## 3 创建中间表（分区表结构）
**通过PL/SQL包一键生成分区表结构：**
```bash
sqlplus par/par
BEGIN
  ctas_par(p_tab        => 'lucifer',
           p_part_colum => 'par_date',
           p_part_nums  => 24,
           p_tablespace => 'par');
END;
/
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719160745931.png)
**<font color='blue'>注意：PL/SQL包可参考：[Oracle普通表按月转分区表，通过PLSQL包一键生成分区表](https://luciferliu.blog.csdn.net/article/details/118425361)</font>**

**创建中间分区表lucifer_par：**
```bash
create table lucifer_par
(
  id       NUMBER(8),
  name     VARCHAR2(20),
  par_date DATE
)
partition BY RANGE(par_date)(
partition lucifer_P202101 values less than (TO_DATE(' 2021-02-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202102 values less than (TO_DATE(' 2021-03-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202103 values less than (TO_DATE(' 2021-04-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202104 values less than (TO_DATE(' 2021-05-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202105 values less than (TO_DATE(' 2021-06-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202106 values less than (TO_DATE(' 2021-07-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202107 values less than (TO_DATE(' 2021-08-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202108 values less than (TO_DATE(' 2021-09-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202109 values less than (TO_DATE(' 2021-10-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202110 values less than (TO_DATE(' 2021-11-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202111 values less than (TO_DATE(' 2021-12-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202112 values less than (TO_DATE(' 2022-01-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202201 values less than (TO_DATE(' 2022-02-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202202 values less than (TO_DATE(' 2022-03-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202203 values less than (TO_DATE(' 2022-04-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202204 values less than (TO_DATE(' 2022-05-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202205 values less than (TO_DATE(' 2022-06-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202206 values less than (TO_DATE(' 2022-07-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202207 values less than (TO_DATE(' 2022-08-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202208 values less than (TO_DATE(' 2022-09-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202209 values less than (TO_DATE(' 2022-10-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202210 values less than (TO_DATE(' 2022-11-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202211 values less than (TO_DATE(' 2022-12-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_P202212 values less than (TO_DATE(' 2023-01-01 00:00:00', 'SYYYY-MM-DD HH24:MI:SS', 'NLS_CALENDAR=GREGORIAN')) tablespace par,
partition lucifer_MAX values less than (maxvalue) tablespace par)
             enable row movement
             tablespace par;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021071916381671.png)
**<font color='blue'>如上，唯一索引和约束不加，会自动复制，分区表结构的中间表已经生成。</font>**
## 4 检查中间表是否开启行迁移
```bash
select row_movement from dba_tables where table_name='LUCIFER' and owner='PAR';
select row_movement from dba_tables where table_name='LUCIFER_PAR' and owner='PAR';
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719161931367.png)
## 5 收集表统计信息
**为了确保数据准确，开始前进行统计信息收集：**
```bash
sqlplus / as sysdba
exec dbms_stats.gather_table_stats(ownname => 'PAR',tabname => 'LUCIFER',estimate_percent => 10,method_opt=> 'for all indexed columns',cascade=>TRUE,degree => '8') ;
exec dbms_stats.gather_table_stats(ownname => 'PAR',tabname => 'LUCIFER_PAR',estimate_percent => 10,method_opt=> 'for all indexed columns',cascade=>TRUE,degree => '8') ;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719162205216.png)
## 6 开始在线重定义
```bash
sqlplus / as sysdba
EXEC DBMS_REDEFINITION.START_REDEF_TABLE('PAR','LUCIFER','LUCIFER_PAR');
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719162330741.png)
## 7 复制表属性，排除索引
**选择自动复制表属性，手动创建本地索引（local）**
>- 优点：只需要关注索引是否遗漏，无需关注触发器，权限，约束等依赖。
>- 缺点：需要手动创建索引，并且结束后手动rename索引。

**可参考：[Oracle在线重定义之COPY_TABLE_DEPENDENTS](https://luciferliu.blog.csdn.net/article/details/115622154)**
```bash
sqlplus par/par
SET SERVEROUTPUT ON
DECLARE
  l_errors  NUMBER;
BEGIN
  DBMS_REDEFINITION.copy_table_dependents(
    uname            => USER,
    orig_table       => 'LUCIFER',
    int_table        => 'LUCIFER_PAR',
    copy_indexes     => 0,
    copy_triggers    => TRUE,
    copy_constraints => TRUE,
    copy_privileges  => TRUE,
    ignore_errors    => FALSE,
    num_errors       => l_errors,
    copy_statistics  => FALSE,
    copy_mvlog       => FALSE);
    
  DBMS_OUTPUT.put_line('Errors=' || l_errors);
END;
/
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719163947525.png)
**<font color='blue'>执行过程没有任何报错，代表正常。</font>**
## 8 中间表创建本地索引
**中间表LUCIFER_PAR创建索引：**
```bash
create index ID_NAME_PAR on LUCIFER_PAR(NAME) tablespace PAR local parallel 8;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719164456560.png)
**<font color='blue'>注意：索引名称需要与原索引名称不一致。</font>**
## 9 取消索引并行度
**如果创建索引时，开启并行创建，则需要取消索引并行度：**
```bash
sqlplus / as sysdba
select 'alter index '||owner||'.'||index_name||' noparallel;'
from dba_indexes 
where table_name = 'LUCIFER_PAR' and owner= 'PAR';
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719164726838.png)
## 10 同步数据（可以减少结束重定义过程的锁表时间）
```bash
sqlplus / as sysdba
BEGIN
dbms_redefinition.sync_interim_table(
uname => 'PAR',
orig_table => 'LUCIFER',
int_table => 'LUCIFER_PAR');
END;
/
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719164847779.png)
**<font color='blue'>注意：这一步操作是为了在结束重定义的时候，减少锁表的时间。</font>**
## 11 收集中间表统计信息
**为了下面同步数据做准备，收集中间表统计信息：**
```bash
sqlplus / as sysdba
exec dbms_stats.gather_table_stats(ownname => 'PAR',tabname => 'LUCIFER_PAR',estimate_percent => 10,method_opt=> 'for all indexed columns',cascade=>TRUE,degree => '8') ;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719165130259.png)
## 12 结束重定义（结束重定义需要锁表，具体时间根据表的大小决定）
```bash
sqlplus / as sysdba
BEGIN
dbms_redefinition.finish_redef_table(
uname => 'PAR',
orig_table => 'LUCIFER',
int_table => 'LUCIFER_PAR');
END;
/
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719165222179.png)
## 13 查看分区表是否已转换
```bash
sqlplus par/par
select owner,table_name,partitioned from user_tables where table_name in ('LUCIFER','LUCIFER_PAR');
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719165403886.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719165659258.png)
**<font color='blue'>如上，LUCIFER表已经在线重定义为分区表结构。</font>**
## 14 手动修改重命名索引
**1、此时，原表名的表已经转换为中间表，需要先将原表的索引，rename到其他名字，本次是BAK，需要注意索引名称长度不能过长**
```bash
sqlplus / as sysdba
ALTER index PAR.ID_NAME RENAME TO ID_NAME_BAK;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719165955347.png)

**2、rename新分区表索引，由于新分区表的索引名称还是中间表的索引名称，所以需要手动rename**
```bash
sqlplus / as sysdba
ALTER index PAR.ID_NAME_PAR RENAME TO ID_NAME;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719170102288.png)
## 15 查看是否存在无效索引
```bash
sqlplus / as sysdba
SELECT owner index_owner, index_name, index_type,'N/A' partition_name,status,table_name,tablespace_name,
  'alter index '||owner||'.'||index_name||' rebuild;' rebuild_index
  FROM dba_indexes
WHERE status = 'UNUSABLE'
UNION ALL
SELECT a.index_owner,a.index_name,b.index_type,a.partition_name,a.status,b.table_name,a.tablespace_name,
'alter index '||a.index_owner||'.'||a.index_name||' rebuild partition '||a.partition_name||' ;' rebuild_index
  FROM dba_ind_partitions a, dba_indexes b
WHERE a.index_name = b.index_name
   AND a.index_owner = b.owner
   AND a.status = 'UNUSABLE'
UNION ALL
SELECT owner index_owner,a.index_name,b.index_type,'N/A' partition_name,a.status,b.table_name,NULL,
'alter index '||a.index_owner||'.'||a.index_name||' rebuild subpartition '||a.subpartition_name||';' rebuild_index
  FROM dba_ind_subpartitions a, dba_indexes b
WHERE a.index_name = b.index_name
   AND a.index_owner = b.owner
   AND a.status = 'UNUSABLE';
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719170223839.png)
## 16 检查切换后是否开启row_movement
```bash
sqlplus / as sysdba
select owner,table_name,row_movement from dba_tables where table_name in ('LUCIFER','LUCIFER_PAR') and owner='PAR';
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719170323721.png)
## 17 检查无效对象
```bash
##无效对象编译
sqlplus / as sysdba 
@?/rdbms/admin/utlrp.sql

select  'alter  '||object_type||'   '||owner||'.'||object_name||'   compile;'
from  dba_objects t
where t.status = 'INVALID' order by 1;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021071917040679.png)
## 18 收集统计信息
```bash
sqlplus / as sysdba
exec dbms_stats.gather_table_stats(ownname => 'PAR',tabname => 'LUCIFER',estimate_percent => 10,method_opt=> 'for all indexed columns',cascade=>TRUE,degree => '8') ;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719170456330.png)
## 19 插入测试数据
```bash
sqlplus par/par
begin
  for i in 100 .. 124 loop
    insert into lucifer values
      (i,
       'lcuifer_' || i,
       add_months(to_date('2021-5-1', 'yyyy-mm-dd'), i));
  end loop;
  commit;
end;
/
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719170802792.png)
## 20 查询分区表数据分布
```bash
sqlplus par/par
SELECT COUNT(*) FROM  LUCIFER;
SELECT * FROM  LUCIFER PARTITION(LUCIFER_P202101);
SELECT * FROM  LUCIFER PARTITION(LUCIFER_P202201);
SELECT * FROM  LUCIFER PARTITION(LUCIFER_MAX);
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719171138494.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210719171202205.png)
**<font color='blue'>可以发现，数据已经根据日期均匀分布在不同的子分区中。至此，在线重定义已经完成，分区表已成功转换。</font>**

**参考MOS文档：** 
>- How To Partition Existing Table Using DBMS_REDEFINITION (Doc ID 472449.1)
>- [Oracle在线重定义之COPY_TABLE_DEPENDENTS](https://luciferliu.blog.csdn.net/article/details/115622154)


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