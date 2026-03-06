---
title: 实战篇：Oracle 数据坏块的 N 种修复方式
date: 2021-12-08 20:26:30
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/193821
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

# 前言
Oracle 数据库的运行不可避免的会遇到各种各样的错误，就比如数据表出现坏块，此时，你这张表的数据就无法访问了，有什么好的办法可以恢复呢？

**<font color='orage'>什么，你没有遇到过？😱</font>** 

😏 那就祝你不久的将来遇到，哈哈开个玩笑~ **玩归玩，闹归闹，经验必须要老到！👍🏻**

# 一、介绍
今天就给大家讲讲怎么处理数据表的坏块情况！

对于 Oracle **数据块物理损坏**的情形，通常可以分为两种情况：
- 有备份，通过 RMAN 恢复
- 无备份，通过 DBMS_REPAIR 修复

## 1、RMAN
有备份的情况下，这是很理想的情形，我们可以直接通过 `RMAN` 块介质恢复（BLOCK MEDIA RECOVERY）功能来完成受损块的恢复。

这里我是不建议恢复整个数据库或者数据库文件来修复这些少量受损的数据块，有点浪费时间。

>**可参考官方文档：[Block Media Recovery with RMAN](https://docs.oracle.com/cd/B19306_01/backup.102/b14191/rcmconc2.htm#BRADV118)**

## 2、DBMS_REPAIR
**那如果没有任何备份怎么办？** （PS：备份大于一切！）

我们可以使用 Oracle 自带的 `DBMS_REPAIR` 包来实现修复。

**📢 注意：** 使用 `DBMS_REPAIR` 包来修复，并非完全恢复，而是标记坏块，然后不对起进行访问，这部分被标记的数据也就丢失了，这是无法避免的。

>**可参考MOS文档：[DBMS_REPAIR SCRIPT (Doc ID 556733.1)	](https://support.oracle.com/epmos/faces/DocContentDisplay?id=556733.1)**

# 二、实战环境准备
## 1、环境安装
使用我编写的一键安装脚本创建：
```bash
cd /Volumes/DBA/voracle/github/single_db
vagrant up
vagrant ssh
```
![](https://img-blog.csdnimg.cn/4f5c3b29e9c141b1a62146456f8885c4.png)
## 2、测试数据准备
创建表空间：
```sql
create tablespace eason datafile '/oradata/orcl/eason.dbf' size 1g autoextend on;
```
![](https://img-blog.csdnimg.cn/58fe99857e3346f3b9a9bcf400813631.png)

创建用户：
```sql
create user eason identified by eason default tablespace eason;
grant dba to eason;
```
![](https://img-blog.csdnimg.cn/2682811c3fa34e45bc89046bb600425e.png)

创建测试表：
```sql
create table hyj as select * from dba_objects;
```
![](https://img-blog.csdnimg.cn/1876a6dc336f4ee78b655d5d6543a6c6.png)

创建表索引：
```sql
create index i_hyj on hyj(object_id);
```
![](https://img-blog.csdnimg.cn/85358ca3d7c740e0abfd59e64ccdd21a.png)
## 3、查看表相关信息
查看表段上的相关信息：
```sql
select segment_name , header_file , header_block,blocks from dba_segments where segment_name ='HYJ'; 
```
![](https://img-blog.csdnimg.cn/257248147b38410f8abc4ab32a3642ed.png)

查出包含行记录的数据块：
```sql
select distinct dbms_rowid.rowid_block_number(rowid) from eason.hyj order by 1;

DBMS_ROWID.ROWID_BLOCK_NUMBER(ROWID)
------------------------------------
                                1411
                                1412
                                1413
								...
								...
								...	
                                2665
                                2666
                                2667

1232 rows selected.
```
![](https://img-blog.csdnimg.cn/af907b24fa7f4b3cb819c42ed2195d44.png)
```sql
select * from dba_extents where segment_name='HYJ';
```
![](https://img-blog.csdnimg.cn/865fdb7fb740459996d58f65f1c6dd7e.png)
**📢 注意：** 这里看到 `HEADER_BLOCK` 和 `BLOCK_ID` 不一致，其实一个 segment 的第一个区的第一个块是 FIRST LEVEL BITMAP BLOCK，第二个块是 SECOND LEVEL BITMAP BLOCK，这两个块是用来管理 free block 的，第三个块是 PAGETABLE SEGMENT HEADER，这个块才是 segment 里的 HEADER_BLOCK。
## 4、RMAN 备份
首先，我们先做一个全备份，用来演示 RMAN 修复坏块！
```bash
run {
allocate channel c1 device type disk;
allocate channel c2 device type disk;
crosscheck backup;
crosscheck archivelog all;
sql"alter system switch logfile";
delete noprompt expired backup;
delete noprompt obsolete device type disk;
backup database include current controlfile format '/backup/backlv_%d_%T_%t_%s_%p';
backup archivelog all DELETE INPUT;
release channel c1;
release channel c2;
}
```
![](https://img-blog.csdnimg.cn/fc89ceb226534c7fa8a1ba89d9b89446.png)
## 5、模拟坏块
破坏 `1468`、`1688`、`2468` 数据块的内容：
```bash
dd if=/dev/zero of=/oradata/orcl/eason.dbf bs=8192 conv=notrunc seek=1468 count=1
dd if=/dev/zero of=/oradata/orcl/eason.dbf bs=8192 conv=notrunc seek=1688 count=1
dd if=/dev/zero of=/oradata/orcl/eason.dbf bs=8192 conv=notrunc seek=2468 count=1
```
![](https://img-blog.csdnimg.cn/56d4f033fccb446fb5262ccb25cb5877.png)

清除 `buffer cache` 的内容：
```sql
alter system flush buffer_cache;
```
![](https://img-blog.csdnimg.cn/ca4bbcaa613d49d4aa08693750620e11.png)

再次查询表 hyj，此时查询已经报错，发现有坏块：
```sql
select * from eason.hyj;
```
![](https://img-blog.csdnimg.cn/8b32bae1db0c4314bc64c8a462188a20.png)

当然，也可以使用 `bbed` 进行坏块模拟！

## 6、坏块检查
**下面在介绍几种发现坏块的方式：**

1、使用 `DBV` 检查当前文件的坏块：
```bash
dbv file=/oradata/orcl/eason.dbf blocksize=8192;
```
![](https://img-blog.csdnimg.cn/d7e7ce6703c34be0ab682cd80267799f.png)

使用 `DBV`检查，同样发现了坏块！

2、使用 rman 检查数据库坏块：
```bash
## 检查对应的数据文件
backup check logical validate datafile 5;
## 检查当前数据库
backup validate check logical database;
```
![](https://img-blog.csdnimg.cn/cbe04e17dddf4c85a803dba77fbe7fc9.png)
结合 `V$DATABASE_BLOCK_CORRUPTION` 视图查看，更加方便：
```sql
select * from V$DATABASE_BLOCK_CORRUPTION;
```
![](https://img-blog.csdnimg.cn/4831e7f247b948b6bc72c9fac312003d.png)

使用 `RMAN` 检查后，同样发现了坏块！

3、通过数据库的告警日志也可以发现报错：

![](https://img-blog.csdnimg.cn/646c6ea96c924dd1b7bea1f1afd9a8e4.png)

4、通过报错信息快照查找对应的坏表，依次填写数据文件 ID `5` 和 坏块 ID `1468`：
```sql
SELECT tablespace_name, segment_type, owner, segment_name
FROM dba_extents
        WHERE file_id = &fileid
and &blockid between block_id AND block_id + blocks - 1;
```
![](https://img-blog.csdnimg.cn/94d258fd59974b31b3faebe43f0b6575.png)

**<font color='orage'>实验环境准备完毕，下面开始实战！</font>**
# 三、实战演示
今天，我打算使用上述介绍的 2 种方式来演示！

## 1、RMAN 修复
由于我们之前已经备份了，因此直接使用备份来恢复坏块：
```bash
blockrecover datafile 5 block 1468;
```
![](https://img-blog.csdnimg.cn/277b5045c7bf42d5aaeac2ed743147ed.png)
```bash
blockrecover datafile 5 block 1688,2468;
```
![](https://img-blog.csdnimg.cn/43786716341647378523bd53a436959c.png)

使用同样的方式，依次修复坏块 `1688`，`2468`，修复成功后，查询已恢复正常！

再次检查坏块情况：
```bash
backup validate check logical database;
select * from V$DATABASE_BLOCK_CORRUPTION;
```
![](https://img-blog.csdnimg.cn/201bccd67b384564b281506c0cbe6ffd.png)

坏块已经都被恢复，并且数据没有丢失！
## 2、DBMS_REPAIR 修复
首先，依然使用 dd 先模拟坏块：
```bash
dd if=/dev/zero of=/oradata/orcl/eason.dbf bs=8192 conv=notrunc seek=3333 count=1
dd if=/dev/zero of=/oradata/orcl/eason.dbf bs=8192 conv=notrunc seek=3368 count=1
dd if=/dev/zero of=/oradata/orcl/eason.dbf bs=8192 conv=notrunc seek=4000 count=1
```
![](https://img-blog.csdnimg.cn/d1d2c88bc35f4b18a9a84dc3b574a402.png)

在没有备份的前提下，我们就无法做到无损修复坏块了，需要损失对应坏块的数据。

1、创建 `repair` 表，用于记录需要被修复的表：
```sql
begin
dbms_repair.admin_tables (
     table_name => 'REPAIR_TABLE',
     table_type => dbms_repair.repair_table,
     action => dbms_repair.create_action,
     tablespace => 'USERS');
end;
/
```
![](https://img-blog.csdnimg.cn/354a5c31e03d4a738704f7ee08f599a7.png)

2、创建 `Orphan Key` 表，用于记录在表块损坏后那些孤立索引，也就是指向坏块的那些索引 ：
```sql
begin
dbms_repair.admin_tables (
     table_name => 'ORPHAN_KEY_TABLE',
     table_type => dbms_repair.orphan_table,
     action => dbms_repair.create_action,
     tablespace => 'USERS');
end;
/
```
![](https://img-blog.csdnimg.cn/fdd9b502ce7b445e9606ffbae3ecab60.png)

3、检查坏块，检测对象上受损的情形，并返回受损块数为 `3`：
```sql
declare
  num_corrupt int;
begin
  num_corrupt := 0;
DBMS_REPAIR.CHECK_OBJECT (
  schema_name =>'EASON',
  object_name =>'HYJ',
  repair_table_name =>'REPAIR_TABLE',
  corrupt_count =>num_corrupt);
  dbms_output.put_line('number corrupt:' || to_char(num_corrupt));
end;
/
```
![](https://img-blog.csdnimg.cn/97fd8ad4cf6341b6b5edad1a161306a9.png)

4、查看受损的块信息：
```sql
select object_name, block_id, corrupt_type, marked_corrupt, repair_description from repair_table;
```
![](https://img-blog.csdnimg.cn/d83d36f729074aed8bffbe79823c8822.png)

**📢 注意：** 这里 `marked_corrupt` 被标记为 `TRUE`，应该是系统在执行  CHECK_OBJECT 过程中自动完成了FIX_CORRUPT_BLOCKS。如果被标记为 FALSE，需要再运行 `FIX_CORRUPT_BLOCKS` 来完成坏块的标记工作。

5、修复被损坏的数据块，这些被损坏的数据块是在执行了 check_object 之后生成的：
```sql
declare
  cc number;
begin
  dbms_repair.fix_corrupt_blocks(schema_name => 'EASON',
  object_name => 'HYJ',
  fix_count => cc);
  dbms_output.put_line('Number of blocks fixed: ' || to_char(cc));
end;
/
```
![](https://img-blog.csdnimg.cn/8a0a92a1a42745ba97f837045ebeb2bd.png)

标记了 `0` 个坏块，说明 CHECK_OBJECT 完成了标记工作。

6、使用 `DUMP_ORPHAN_KEYS` 过程将那些指向坏块的索引键值填充到 ORPHAN_KEY_TABLE：
```sql
declare
   cc number;
begin
  dbms_repair.dump_orphan_keys
  (
     schema_name => 'EASON',
     object_name => 'I_HYJ', 
     object_type => dbms_repair.index_object,
     repair_table_name => 'REPAIR_TABLE',
     orphan_table_name=> 'ORPHAN_KEY_TABLE',
     key_count => cc
  );
  dbms_output.put_line('Number of orphan keys: ' || to_char(cc));
end;
/
```
![](https://img-blog.csdnimg.cn/4de8911582f64f22a435df3c4502785a.png)

表明 `202` 条记录被损坏丢失！

**📢 注意：** 此处一定要注意 object_name 是**索引名**，而不是 table_name，这里 dump 的是损坏的索引信息.如果表有多个索引，需要为每个索引执行 DUMP_ORPHAN_KEYS 操作。

7、验证对象是否可以查询，下面的结果显示依旧无法查询：
```sql
select count(*) from eason.hyj;
```
![](https://img-blog.csdnimg.cn/c23e0c50e8354dbfbab876055a3a6495.png)

8、跳过坏块：
```sql
BEGIN
  DBMS_REPAIR.SKIP_CORRUPT_BLOCKS (
     SCHEMA_NAME => 'EASON',
     OBJECT_NAME => 'HYJ',
     OBJECT_TYPE => dbms_repair.table_object,
     FLAGS => dbms_repair.skip_flag);
END;
/
```
![](https://img-blog.csdnimg.cn/64709aba9faa49ea998f52946c6af9a0.png)

**📢 注意：** 丢失 `202` 条记录，丢失记录的 rowid 可以在 ORPHAN_KEY_TABLE 表中找到。

9、重建索引：
```sql
alter index eason.I_HYJ rebuild;
```
![](https://img-blog.csdnimg.cn/c5fd579cda1449e79e76721aa0d149b9.png)

10、验证结果

![](https://img-blog.csdnimg.cn/a03689d657f1498f8232ab4ed24bbd37.png)

**<font color='orage'>至此，表中数据可以顺利被访问！</font>**

由于坏块并没有消失，而是被标记跳过，因此还是可以查看坏块：
```sql
select * from V$DATABASE_BLOCK_CORRUPTION;
```
![](https://img-blog.csdnimg.cn/1969ad5d4db544a4a965c6b1da5cdaf6.png)

用这种方法可以找回部分数据，也可以找回建了索引的值，但是使用dbv再检查表空间的数据文件时，仍然会显示有损坏的数据块。

这时需要把表的数据全部导出，再重建表或者表空间，然后再把找回的数据导入数据库，推荐用 `expdp/impdp` 命令做，可以彻底消除 `dbv` 检查到的坏块。

# 写在最后
备份大于一切，也是最后的防线，所以请大家一定要做好备份！886

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