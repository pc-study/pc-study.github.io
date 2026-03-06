---
title: Oracle 查询如何做到 “四大皆空“（BUG）
date: 2022-03-25 15:31:03
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/383537
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 问题分析
首先，我们看一张图，我称之为 “四大皆空”，此图来源于 [刘晨](https://www.modb.pro/u/6583) 的视频分享 [Oracle中新增字段的点点滴滴](https://www.modb.pro/video/5098)，很有意思，从图中可以发现两段 SQL，看看一下这张图有什么奇怪的地方！

![](https://img-blog.csdnimg.cn/ff3cff0c41224cc0b920dc17c67f2868.png)

***本文参考资料：***
-  [非空字段空值对查询的影响](http://yangtingkun.net/?p=1481)
- [非空字段空值的产生](http://yangtingkun.net/?p=1483)
- [Oracle中新增字段的点点滴滴](https://www.modb.pro/video/5098)

## SQL 分析
**第一段 SQL：**
```sql
SQL> select * from test where c1 is null;
no rows selected

SQL> select * from test where c1 is not null;
	ID	NAME	C1
------	-------	---
	1	a
```
- 有一张 test 表有个 c1 字段；
- 当查询 c1 字段值为空时，没有记录返回，得出结论：**test 表中不存在 c1 字段值为空的数据；**
- 当查询 c1 字段值不为空时，有一条记录返回，且 c1 字段是空值，得出结论：**test 表中存在 c1 字段值不能空，但是 c1 字段值返回是空值？**

**<font color='orange'>看完第一段 SQL，是不是已经产生疑惑	😵？</font>** 先不急，接着看第二段 SQL！

**第二段 SQL：**
```sql
SQL> select dump(c1) as d from test;
D
-------
NULL

SQL> select nvl(c1,'is null') as c1 from test;
C1
-------
IS NULL
```
- 同一张 test 表的相同字段 c1；
- 当使用 [DUMP 函数](https://docs.oracle.com/cd/E11882_01/server.112/e41084/functions055.htm#SQLRF00635) 来判断 c1 的值，返回值为空，根据官方文档描述：**If expr is null, then this function returns NULL**，可以得出结论：**c1 字段值为空**。
- 当使用 [NVL 函数](https://docs.oracle.com/cd/E11882_01/server.112/e41084/functions119.htm#SQLRF00684) 来判断 c1 的值，返回值为 IS NULL，根据官方文档描述：**If expr1 is null, then NVL returns expr2. If expr1 is not null, then NVL returns expr1** ，得出结论：**c1 字段值为空**。

看完第二段 SQL，得出统一的结论就是： **<font color='red'>c1 字段值为空。</font>**

根据上面两段 SQL 的结论，也就有了上图中的 `where PK dump/nvl？` 的疑问，那么到底是什么导致的这个问题呢？

# 猜测实践
首先，这明显不是一个正常的操作能够导致的问题，所以首先排除插入空值到非空字段的情况，需要从其他的思路的进行探讨。

通过 dbms_metadata.get_ddl 函数获取 test 表结构的定义：
```sql
select dbms_metadata.get_ddl('TABLE', 'TEST') from dual;
DBMS_METADATA.GET_DDL('TABLE','TEST')
--------------------------------------------------------------------------------
CREATE TABLE "TEST"."TEST"
( "ID" NUMBER,
"NAME" VARCHAR2(8) DEFAULT 'a',
"C1" VARCHAR2(8) DEFAULT '' NOT NULL ENABLE
) SEGMENT CREATION IMMEDIATE
PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255
NOCOMPRESS LOGGING
STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
TABLESPACE "USERS"
```
**小知识拓展：**
- Oracle 数据库中，对于 char 和 varchar2 字段来说，缺省值 '' 就是 null；
- 但是 where 条件后的 '' 不等于 null。

可以发现，**c1 字段是非空字段，且默认值为空。** 为什么 Oracle 会允许空值插入到非空约束字段中？

<font color='orage'>**想要搞明白原因，光靠猜测是没有用的，实践是检验真理的唯一标准。**</font>
## 猜测一
有没有可能是，插入记录时有非空约束的列默认为空导致：
```sql
SQL> insert into TEST (id, name) values (1, 'a');
insert into TEST (id, name) values (1, 'a')
*
ERROR at line 1:
ORA-01400: cannot insert NULL into ("TEST"."TEST"."C1")
```
可以看到插入报错了，说明这个思路是错的，此路不通。

## 猜测二
按理来说，Oracle 这么多版本的更新迭代之后，应该不会在 11G 版本还出现这种问题，综上所述，猜测可能是 11G 的新特性导致的 BUG。

查询官方文档中的 11G 新特性 [Enhanced ADD COLUMN Functionality](https://docs.oracle.com/cd/B28359_01/server.111/b28279/chapter1.htm#OBJECTIVENO04548) 可以发现：

![](https://img-blog.csdnimg.cn/1b007114c5e14038b61248a96e4b03d9.png)

在 11G 版本中，当添加带有默认值且非空约束的列时，不直接更新当前表的所有记录的该列默认值，而是将数据存储到数据字典中的 sys.col$ 表中，后续执行 DML 操作时会自动更新该列默认值。

接下来就是用新特性来测试一下，首先创建 TEST 表，不包含 C1 字段：
```sql
CREATE TABLE TEST (ID NUMBER, NAME VARCHAR2(8) DEFAULT 'a');
```
手动添加 c1 列（非空约束+默认值为空）：
```sql
 alter table TEST add c1 varchar2(8) default '' not null;
```
再次查询：
```sql
SQL> select * from test where c1 is not null;
	ID	NAME	C1
------	-------	---
	1	a
```
![](https://img-blog.csdnimg.cn/8e173906ecef40f685202433ff815461.png)

**破案了**，函数是对的，c1 字段值在默认的情况下确实为空，NOT NULL 列的默认值为 NULL，如果不指定默认值那么就相当于默认值为 NULL。

# 深入研究
上面通过猜测和实践得出了问题的原因，但还是有些不明所以：
- where PK dump/nvl？函数的结果是对的，where 真的错了吗？
- 为什么要引入 Enhanced ADD COLUMN Functionality 新特性？
- `.......`

## Where 错了吗？
通过 ”四大皆空“ 图看起来，使用 Where 条件返回了错误的数据，CBO 那么聪明，执行计划判断不出来？

![](https://img-blog.csdnimg.cn/fdf3e897690441969b6ba6e13f1a7db8.png)

**第一个 SQL：**
```sql
SQL> select * from test where c1 is null;
no rows selected
```
分析：当查询条件 c1 为空时，CBO 给出一个谓词 filter 过滤条件 **`NULL IS NOT NULL`**，这意味着**查询条件恒假**，当一个查询条件恒假的时候，Oracle 不需要真正执行语句，所以看到 **Cost（%CPU）** 为 0，所以当一个查询条件明显的违反表中的约束条件时，Oracle 并不会去执行这个查询语句，而是直接返回了 0 条记录。

**第二个 SQL 的执行计划：**
```sql
SQL> select * from test where c1 is not null;
	ID	NAME	C1
------	-------	---
	1	a
```
分析：当查询条件为 c1 不为空时，执行计划中并没有 filter 谓词条件，为什么呢？因为 c1 字段是非空约束，所以 **CBO** 判读 c1 is not null 这个查询条件是**恒真**的，也就不需要过滤，直接返回所有的数据。

**结论：** 简单的说，导致这个问题的原因是由于错误的数据存储于表中，而这导致了 CBO 在判断时出现了错误，导致和预期相反的结果返回，所以 where 并没有错误，是新特性的 BUG 导致 CBO 的判断错误。

## 新特性详解
Oracle 为什么要引入这个新特性？我们使用 3 种情况的分析一下！
- 在 Oracle 11G 之前，向现有表添加一个新列需要修改该表中的所有行，以添加新列。
- Oracle 11G 引入了元数据唯一默认值的概念。将默认子句添加到现有表的非空列，只涉及元数据更改，而不是对表中的所有行进行更改。优化器重写新列的查询，以确保结果与默认定义一致。
- Oracle 12C 则更进一步，允许元数据默认值的强制和可选列。因此，在现有表中添加带有默认子句的新列将被作为一个元数据来处理，而不管该列是否被定义为不为空。这代表了空间保存和性能改进。

### 实践演示
准备测试数据：
```sql
create table test(id number,name varchar2(1));
insert into test values(1,a);
insert into test values(2,b);
commit;
select * from test;
```
通过 dump 操作来查看数据的实时情况：
```sql
select dbms_rowid.rowid_relative_fno(rowid), dbms_rowid.rowid_block_number(rowid) from test;
alter system dump datafile 4 block 173109;
```
![](https://img-blog.csdnimg.cn/601fd39806e340bb90ff55a3ac9e03ec.png)

**第一种情况：增加一个字段，不带默认值，不带非空约束**
```sql
alter table test add a1 varchar2(1);
desc test
```
![](https://img-blog.csdnimg.cn/df697d8100a545249ec8fb8f1a98add6.png)

当为表增加一个不带默认值，不带非空约束的字段时，已存记录的数据块中不会立刻存储该新增字段：

![](https://img-blog.csdnimg.cn/6dac666601f04cf2bfd8ae33a8e49537.png)

只有当更新字段或插入数据的时候，数据块中才会实际存储：

**更新操作：**

![](https://img-blog.csdnimg.cn/29b5ace7d033431f8309e0e7a7136e73.png)

**插入操作：**

![](https://img-blog.csdnimg.cn/5c29fdf0673c4fb1b9a8eb5d6fafdd97.png)

**第二种情况：增加一个字段，带默认值，不带非空约束**
>📢 注意：针对这种情况，12C 引入了新特性：MetaData-Only DEFAULT Column Values for  NULL Columns 
```sql
alter table test add a2 varchar2(1) default 'a';
desc test
```
Oracle 11g，新增一个带默认值，不带非空约束的字段，会立刻在表的数据块中增加该字段：

![](https://img-blog.csdnimg.cn/c3e72035a624467ab24b65b3e3cb8be0.png)

并执行全表更新的操作，将该值更新为默认值，DDL操作的执行时间和表的数据量相关：

![](https://img-blog.csdnimg.cn/f10ce825f9184ba78606ee05dd39c637.png)

**第三种情况：增加一个字段，带默认值，带非空约束**

>📢 注意：针对这种情况，11G 引入了新特性：Enhanced ADD COLUMN Functionality！
```sql
alter table test add a2 varchar2(1) default 'a' not null;
desc test
```
![](https://img-blog.csdnimg.cn/6bf03a9a094645e197a90a84e274fbab.png)

Oracle 11g，新增一个带默认值，带非空约束的字段，已存记录的数据块中不会立刻存储该新增字段：

![](https://img-blog.csdnimg.cn/73f3c5eac10c493fbdb2e6b9364bfadf.png)

而是将其作为元数据存储在数据字典中的 `sys.col$` 中：

![](https://img-blog.csdnimg.cn/f53c68ae7bbe460c98049e55f374b87f.png)

同时在 `sys.ecol$` 中可以看到：

![](https://img-blog.csdnimg.cn/ea4c708095754d2494315f73831eae26.png)

但是，当改变新增列的默认值时，`sys.ecol$` 的数据不会实时变化，仅存储第一次增加列时的默认值：

![](https://img-blog.csdnimg.cn/e45afa4755174f42894c4fb7a730b649.png)

只有当更新字段或插入数据的时候，数据块才会实际存储：

![](https://img-blog.csdnimg.cn/92ec7130ca874602ba99d1286da39f31.png)

![](https://img-blog.csdnimg.cn/3fccf24f5cad44caa30f759653b1b49b.png)

通过这种优化，缩短了DDL执行时间，这就是 Oracle 11G 引入 Enhanced ADD COLUMN Functionality 新特性的原因。

# 最后
值得一提的是，Oracle 在 12C 以后已经修复了这个 BUG，增加了如下判断（DEFAULT 为 NULL 是禁止的）：

![](https://img-blog.csdnimg.cn/680a70e2672c40a9b38752466686d990.png)

Oracle 学习路漫漫，茫茫文档需要看，直觉前路要变宽，到头还被 BUG 绊！😂

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