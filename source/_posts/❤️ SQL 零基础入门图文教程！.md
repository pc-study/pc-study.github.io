---
title: ❤️ SQL 零基础入门图文教程！
date: 2021-09-27 23:10:30
tags: [sql]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/118447
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 📚 前言
SQL语言有40多年的历史，从它被应用至今几乎无处不在。我们消费的每一笔支付记录，收集的每一条用户信息，发出去的每一条消息，都会使用数据库或与其相关的产品来存储，而操纵数据库的语言正是 SQL ！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4019eac765c64a8fb6bf27b62acf65a6~tplv-k3u1fbpfcp-zoom-1.image)

SQL 对于现在的互联网公司生产研发等岗位几乎是一个必备技能，如果不会 SQL 的话，可能什么都做不了。你可以把 SQL 当做是一种工具，利用它可以帮助你完成你的工作，创造价值。

**![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eb8b49a1eeb94d298c9ac04077c2fbd3~tplv-k3u1fbpfcp-zoom-1.image)
<font color='red'>文章结尾有 SQL 小测验哦！看看你能得几分？</font>**

 **👉🏻 [点我跳转到 SQL 测验！](#jump_100)**
# 🌴 SQL 介绍
## 🌼 什么是 SQL
SQL 是用于访问和处理数据库的标准的计算机语言。
- SQL 指结构化查询语言
- SQL 使我们有能力访问数据库
- SQL 是一种 ANSI 的标准计算机语言

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bedc56fb52394887a1d6387af2d8bc67~tplv-k3u1fbpfcp-zoom-1.image)
SQL 可与数据库程序协同工作，比如 MS Access、DB2、Informix、MS SQL Server、Oracle、Sybase 以及其他数据库系统。但是由于各种各样的数据库出现，导致很多不同版本的 SQL 语言，为了与 ANSI 标准相兼容，它们必须以相似的方式共同地来支持一些主要的关键词（比如 SELECT、UPDATE、DELETE、INSERT、WHERE 等等），这些就是我们要学习的SQL基础。

## 🌀 SQL 的类型
可以简单的把 SQL 分为两个部分：数据操作语言 (DML) 和 数据定义语言 (DDL)。
- 数据查询语言（DQL: Data Query Language）
- 数据操纵语言（DML：Data Manipulation Language）

## 🌵 学习 SQL 的作用
SQL 是一门 ANSI 的标准计算机语言，用来访问和操作数据库系统。SQL 语句用于取回和更新数据库中的数据。

- SQL 面向数据库执行查询
- SQL 可从数据库取回数据
- SQL 可在数据库中插入新的记录
- SQL 可更新数据库中的数据
- SQL 可从数据库删除记录
- SQL 可创建新数据库
- SQL 可在数据库中创建新表
- SQL 可在数据库中创建存储过程
- SQL 可在数据库中创建视图
- SQL 可以设置表、存储过程和视图的权限

## 🍄 数据库是什么
**顾名思义，你可以理解为数据库是用来存放数据的一个容器。**

打个比方，每个人家里都会有冰箱，冰箱是用来干什么的？冰箱是用来存放食物的地方。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ee24307a1a54c9a87ada94536497446~tplv-k3u1fbpfcp-zoom-1.image)
同样的，数据库是存放数据的地方。正是因为有了数据库后，我们可以直接查找数据。例如你每天使用余额宝查看自己的账户收益，就是从数据库读取数据后给你的。

**最常见的数据库类型是关系型数据库管理系统（RDBMS）：**

RDBMS 是 SQL 的基础，同样也是所有现代数据库系统的基础，比如 MS SQL Server, IBM DB2, Oracle, MySQL 以及 Microsoft Access等等。
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ed88e9dd7824a5a93a1f02518a2fdc8~tplv-k3u1fbpfcp-zoom-1.image)
`RDBMS` 中的数据存储在被称为表（tables）的数据库对象中。`表` 是相关的数据项的集合，它由列和行组成。

由于本文主要讲解 SQL 基础，因此对数据库不做过多解释，只需要大概了解即可。**<font color='orage'>咱们直接开始学习SQL！</font>**

# 🐥 SQL 基础语言学习
在了解 SQL 基础语句使用之前，我们先讲一下 `表` 是什么？

一个数据库通常包含一个或多个表。每个表由一个名字标识（例如“客户”或者“订单”）。表包含带有数据的记录(行)。

**下面的例子是一个名为 "Persons" 的表：**
|Id|LastName|FirstName|Address|City|
|--|--|--|--|--|
|1|Adams|John|Oxford Street|London|
|2|Bush|George|Fifth Avenue|New York|
|3|Carter|Thomas|Changan Street|Beijing|

上面的表包含三条记录（每一条对应一个人）和五个列（Id、姓、名、地址和城市）。

**<font color='orage'>有表才能查询，那么如何创建这样一个表？</font>**

## 🐤 CREATE TABLE – 创建表
CREATE TABLE 语句用于创建数据库中的表。

**<font color='orage'>语法：</font>**
```sql
CREATE TABLE 表名称
(
列名称1 数据类型,
列名称2 数据类型,
列名称3 数据类型,
....
);
```
数据类型（data_type）规定了列可容纳何种数据类型。下面的表格包含了SQL中最常用的数据类型：
| 数据类型|描述|
|--|--|
|integer(size),int(size),smallint(size),tinyint(size)|仅容纳整数、在括号内规定数字的最大位数|
|decimal(size,d),numeric(size,d)|容纳带有小数的数字、"size" 规定数字的最大位数、"d" 规定小数点右侧的最大位数|
|char(size)|容纳固定长度的字符串（可容纳字母、数字以及特殊字符）、在括号中规定字符串的长度|
|varchar(size)	|容纳可变长度的字符串（可容纳字母、数字以及特殊的字符）、在括号中规定字符串的最大长度|
|date(yyyymmdd)|容纳日期|

**<font color='orage'>实例：</font>**

本例演示如何创建名为 "Persons" 的表。

该表包含 5 个列，列名分别是："Id_P"、"LastName"、"FirstName"、"Address" 以及 "City"：
```sql
CREATE TABLE Persons
(
Id_P int,
LastName varchar(255),
FirstName varchar(255),
Address varchar(255),
City varchar(255)
);
```
Id_P 列的数据类型是 int，包含整数。其余 4 列的数据类型是 varchar，最大长度为 255 个字符。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eafbf74ac4d844f792082ebc4bb2bc3f~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2bda3690d14f4f1c89da7def6ad8f1fc~tplv-k3u1fbpfcp-zoom-1.image)

**空的 "Persons" 表类似这样：**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5569f01614844c41a99f400923cc349c~tplv-k3u1fbpfcp-zoom-1.image)	 	 

可使用 INSERT INTO 语句向空表写入数据。
## 🐑 INSERT – 插入数据
INSERT INTO 语句用于向表格中插入新的行。

**<font color='orage'>语法：</font>**
```sql
INSERT INTO 表名称 VALUES (值1, 值2,....);
```
我们也可以指定所要插入数据的列：
```sql
INSERT INTO table_name (列1, 列2,...) VALUES (值1, 值2,....);
```
**<font color='orage'>实例：</font>**

本例演示 "Persons" 表插入记录的两种方式：

**1、插入新的行**
```sql
INSERT INTO Persons VALUES (1, 'Gates', 'Bill', 'Xuanwumen 10', 'Beijing');
```
**2、在指定的列中插入数据**
```sql
INSERT INTO Persons (LastName, Address) VALUES ('Wilson', 'Champs-Elysees');
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a461df9f14574ba9bf46e43fbe8e218e~tplv-k3u1fbpfcp-zoom-1.image)

**插入成功后，数据如下：**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4914b92332ec4ab39fa260b4d5185e16~tplv-k3u1fbpfcp-zoom-1.image)

这个数据插入之后，是通过 `SELECT` 语句进行查询出来的，别急马上讲！
## 🐼 SELECT – 查询数据
SELECT 语句用于从表中选取数据，结果被存储在一个结果表中（称为结果集）。

**<font color='orage'>语法：</font>**
```sql
SELECT * FROM 表名称;
```
我们也可以指定所要查询数据的列：
```sql
SELECT 列名称 FROM 表名称;
```
**📢 注意：** SQL 语句对大小写不敏感，SELECT 等效于 select。

**<font color='orage'>实例：</font>**

**SQL SELECT * 实例：**
```sql
SELECT * FROM Persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/77bf43b2d6264514b0af013e04648c23~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 星号（*）是选取所有列的快捷方式。

如需获取名为 "LastName" 和 "FirstName" 的列的内容（从名为 "Persons" 的数据库表），请使用类似这样的 SELECT 语句：
```sql
SELECT LastName,FirstName FROM Persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c2eefe9bdd74344a638685850a1a527~tplv-k3u1fbpfcp-zoom-1.image)
## 🐫 DISTINCT – 去除重复值
如果一张表中有多行重复数据，如何去重显示呢？可以了解下 `DISTINCT` 。

**<font color='orage'>语法：</font>**
```sql
SELECT DISTINCT 列名称 FROM 表名称;
```
**<font color='orage'>实例：</font>**

如果要从 "LASTNAME" 列中选取所有的值，我们需要使用 `SELECT` 语句：
```sql
SELECT LASTNAME FROM Persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ca5afee076c4243b38cf910dc312607~tplv-k3u1fbpfcp-zoom-1.image)

可以发现，在结果集中，Wilson 被列出了多次。

如需从 "LASTNAME" 列中仅选取唯一不同的值，我们需要使用 SELECT DISTINCT 语句：
```sql
SELECT DISTINCT LASTNAME FROM Persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/879f245f617c47fe98df86712353aee0~tplv-k3u1fbpfcp-zoom-1.image)

通过上述查询，结果集中只显示了一列 Wilson，显然已经去除了重复列。

## 🐸 WHERE – 条件过滤
如果需要从表中选取指定的数据，可将 WHERE 子句添加到 SELECT 语句。

**<font color='orage'>语法：</font>**
```sql
SELECT 列名称 FROM 表名称 WHERE 列 运算符 值;
```
下面的运算符可在 WHERE 子句中使用：
|操作符| 描述 |
|--|--|
|=|等于|
|<>|不等于|
|>|大于|
|<|小于|
|>=|大于等于|
|<=|小于等于|
|BETWEEN|在某个范围内|
|LIKE|搜索某种模式|

**📢 注意：** 在某些版本的 SQL 中，操作符 <> 可以写为 !=。

**<font color='orage'>实例：</font>**

如果只希望选取居住在城市 "Beijing" 中的人，我们需要向 SELECT 语句添加 WHERE 子句：
```sql
SELECT * FROM Persons WHERE City='Beijing';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/55994edc954a4f759aaf05937007b8c9~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** SQL 使用单引号来环绕文本值（大部分数据库系统也接受双引号）。如果是数值，请不要使用引号。
## 🐹 AND & OR – 运算符
AND 和 OR 可在 WHERE 子语句中把两个或多个条件结合起来。
- 如果第一个条件和第二个条件都成立，则 AND 运算符显示一条记录。
- 如果第一个条件和第二个条件中只要有一个成立，则 OR 运算符显示一条记录。

**<font color='orage'>语法：</font>**

**AND 运算符实例：**
```sql
SELECT * FROM 表名称 WHERE 列 运算符 值 AND 列 运算符 值;
```
**OR 运算符实例：**
```sql
SELECT * FROM 表名称 WHERE 列 运算符 值 OR 列 运算符 值;
```
**<font color='orage'>实例：</font>**

由于 Persons 表数据太少，因此增加几条记录：
```sql
INSERT INTO Persons VALUES (2, 'Adams', 'John', 'Oxford Street', 'London');
INSERT INTO Persons VALUES (3, 'Bush', 'George', 'Fifth Avenue', 'New York');
INSERT INTO Persons VALUES (4, 'Carter', 'Thomas', 'Changan Street', 'Beijing');
INSERT INTO Persons VALUES (5, 'Carter', 'William', 'Xuanwumen 10', 'Beijing');
SELECT * FROM Persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9572e9c3a7ec41dca89c7544c5944b30~tplv-k3u1fbpfcp-zoom-1.image)

**AND 运算符实例：**

使用 AND 来显示所有姓为 "Carter" 并且名为 "Thomas" 的人：
```sql
SELECT * FROM Persons WHERE FirstName='Thomas' AND LastName='Carter';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1db1de4e8dc43a88907c05487dd4f0a~tplv-k3u1fbpfcp-zoom-1.image)

**OR 运算符实例：**

使用 OR 来显示所有姓为 "Carter" 或者名为 "Thomas" 的人：
```sql
SELECT * FROM Persons WHERE firstname='Thomas' OR lastname='Carter';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f2ab8a914974468a1a1998e0567e9cb~tplv-k3u1fbpfcp-zoom-1.image)

**结合 AND 和 OR 运算符：**

我们也可以把 AND 和 OR 结合起来（使用圆括号来组成复杂的表达式）:
```sql
SELECT * FROM Persons WHERE (FirstName='Thomas' OR FirstName='William') AND LastName='Carter';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06ad7a980bbd47fb84f30dd3b4085f14~tplv-k3u1fbpfcp-zoom-1.image)
## 🐰 ORDER BY – 排序
ORDER BY 语句用于根据指定的列对结果集进行排序，默认按照升序对记录进行排序，如果您希望按照降序对记录进行排序，可以使用 DESC 关键字。

**<font color='orage'>语法：</font>**
```sql
SELECT * FROM 表名称 ORDER BY 列1,列2 DESC;
```
默认排序为 ASC 升序，DESC 代表降序。

**<font color='orage'>实例：</font>**

以字母顺序显示 `LASTNAME` 名称：
```sql
SELECT * FROM Persons ORDER BY LASTNAME;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d475ffec1204d398333745437c99fd4~tplv-k3u1fbpfcp-zoom-1.image)

空值（NULL）默认排序在有值行之后。

以数字顺序显示`ID_P`，并以字母顺序显示 `LASTNAME` 名称：
```sql
SELECT * FROM Persons ORDER BY ID_P,LASTNAME;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e89a49a07a44947a0146707a84af766~tplv-k3u1fbpfcp-zoom-1.image)

以数字降序显示`ID_P`：
```sql
SELECT * FROM Persons ORDER BY ID_P DESC;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dabf32a064d547f9918179e08728e222~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 在第一列中有相同的值时，第二列是以升序排列的。如果第一列中有些值为 null 时，情况也是这样的。
## 🐱 UPDATE – 更新数据
Update 语句用于修改表中的数据。

**<font color='orage'>语法：</font>**
```sql
UPDATE 表名称 SET 列名称 = 新值 WHERE 列名称 = 某值;
```
**<font color='orage'>实例：</font>**

**更新某一行中的一个列：**

目前 `Persons` 表有很多字段为 `null ` 的数据，可以通过 `UPDATE` 为 LASTNAME 是 "Wilson" 的人添加FIRSTNAME：
```sql
UPDATE Persons SET FirstName = 'Fred' WHERE LastName = 'Wilson';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01f36ea281da4254baff535040dd2be5~tplv-k3u1fbpfcp-zoom-1.image)

**更新某一行中的若干列：**
```sql
UPDATE Persons SET ID_P = 6,city= 'London' WHERE LastName = 'Wilson';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5483d5392dc34e43a857f09d6b0ecc4d~tplv-k3u1fbpfcp-zoom-1.image)
## 🐨 DELETE – 删除数据
DELETE 语句用于删除表中的行。

**<font color='orage'>语法：</font>**
```sql
DELETE FROM 表名称 WHERE 列名称 = 值;
```
**<font color='orage'>实例：</font>**

**删除某行：**

删除 `Persons` 表中 LastName 为 "Fred Wilson" 的行：
```sql
DELETE FROM Persons WHERE LastName = 'Wilson';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f783bce6bd294926a39abb373a32cf32~tplv-k3u1fbpfcp-zoom-1.image)

**删除所有行：**

可以在不删除表的情况下删除所有的行。这意味着表的结构、属性和索引都是完整的：
```sql
DELETE FROM table_name;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd6675f8b687401cbf1ccade6296de3e~tplv-k3u1fbpfcp-zoom-1.image)
## 🐵 TRUNCATE TABLE – 清除表数据
如果我们仅仅需要除去表内的数据，但并不删除表本身，那么我们该如何做呢？

可以使用 TRUNCATE TABLE 命令（仅仅删除表格中的数据）：

**<font color='orage'>语法：</font>**
```sql
TRUNCATE TABLE 表名称;
```
**<font color='orage'>实例：</font>**

本例演示如何删除名为 "Persons" 的表。
```sql
TRUNCATE TABLE persons;
```
## 🐯 DROP TABLE – 删除表
DROP TABLE 语句用于删除表（表的结构、属性以及索引也会被删除）。

**<font color='orage'>语法：</font>**
```sql
DROP TABLE 表名称;
```
**<font color='orage'>实例：</font>**

本例演示如何删除名为 "Persons" 的表。
```sql
drop table persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06a7b676c0be4a9db6720a7df0a3183a~tplv-k3u1fbpfcp-zoom-1.image)

从上图可以看出，第一次执行删除时，成功删除了表 `persons`，第二次执行删除时，报错找不到表 `persons`，说明表已经被删除了。
# 🚀 SQL 高级言语学习
## 🚢 LIKE – 查找类似值
LIKE 操作符用于在 WHERE 子句中搜索列中的指定模式。

**<font color='orage'>语法：</font>**
```sql
SELECT 列名/(*) FROM 表名称 WHERE 列名称 LIKE 值;
```
**<font color='orage'>实例：</font>**

`Persons` 表插入数据：
```sql
INSERT INTO Persons VALUES (1, 'Gates', 'Bill', 'Xuanwumen 10', 'Beijing');
INSERT INTO Persons VALUES (2, 'Adams', 'John', 'Oxford Street', 'London');
INSERT INTO Persons VALUES (3, 'Bush', 'George', 'Fifth Avenue', 'New York');
INSERT INTO Persons VALUES (4, 'Carter', 'Thomas', 'Changan Street', 'Beijing');
INSERT INTO Persons VALUES (5, 'Carter', 'William', 'Xuanwumen 10', 'Beijing');
select * from persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03e6931c532b47978b6d29a13fe99c83~tplv-k3u1fbpfcp-zoom-1.image)

1、现在，我们希望从上面的 "Persons" 表中选取居住在以 "N" 开头的城市里的人：
```sql
SELECT * FROM Persons WHERE City LIKE 'N%';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbad3838842c4834b84709849b3f13e7~tplv-k3u1fbpfcp-zoom-1.image)

2、接下来，我们希望从 "Persons" 表中选取居住在以 "g" 结尾的城市里的人：
```sql
SELECT * FROM Persons WHERE City LIKE '%g';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ea280fcd29741c2a019ef79bd319d2c~tplv-k3u1fbpfcp-zoom-1.image)

3、接下来，我们希望从 "Persons" 表中选取居住在包含 "lon" 的城市里的人：
```sql
SELECT * FROM Persons WHERE City LIKE '%on%';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8b5a09d75144835b89b7381589a13cb~tplv-k3u1fbpfcp-zoom-1.image)

4、通过使用 NOT 关键字，我们可以从 "Persons" 表中选取居住在不包含 "lon" 的城市里的人：
```sql
SELECT * FROM Persons WHERE City NOT LIKE '%on%';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bafd0513393e42a1967d2f5ee8327fae~tplv-k3u1fbpfcp-zoom-1.image)

**📢注意：** "%" 可用于定义通配符（模式中缺少的字母）。
## 🚤 IN – 锁定多个值
IN 操作符允许我们在 WHERE 子句中规定多个值。

**<font color='orage'>语法：</font>**
```sql
SELECT 列名/(*) FROM 表名称 WHERE 列名称 IN (值1,值2,值3);
```
**<font color='orage'>实例：</font>**

现在，我们希望从 `Persons` 表中选取姓氏为 Adams 和 Carter 的人：
```sql
SELECT * FROM Persons WHERE LastName IN ('Adams','Carter');
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/28520d2c1c1b4296b5763993cb6e1e20~tplv-k3u1fbpfcp-zoom-1.image)
## ⛵️ BETWEEN – 选取区间数据
操作符 BETWEEN ... AND 会选取介于两个值之间的数据范围。这些值可以是数值、文本或者日期。

**<font color='orage'>语法：</font>**
```sql
SELECT 列名/(*) FROM 表名称 WHERE 列名称 BETWEEN 值1 AND 值2;
```
**<font color='orage'>实例：</font>**

1、查询以字母顺序显示介于 "Adams"（包括）和 "Carter"（不包括）之间的人：
```sql
SELECT * FROM Persons WHERE LastName BETWEEN 'Adams' AND 'Carter';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03c7b92a21e247528d7a19c6daf1e273~tplv-k3u1fbpfcp-zoom-1.image)

2、查询上述结果相反的结果，可以使用 NOT：
```sql
SELECT * FROM Persons WHERE LastName NOT BETWEEN 'Adams' AND 'Carter';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2582e0555e2d4b39a9ee5db8ca623745~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 不同的数据库对 BETWEEN...AND 操作符的处理方式是有差异的。
>某些数据库会列出介于 "Adams" 和 "Carter" 之间的人，但不包括 "Adams" 和 "Carter" ；某些数据库会列出介于 "Adams" 和 "Carter" 之间并包括 "Adams" 和 "Carter" 的人；而另一些数据库会列出介于 "Adams" 和 "Carter" 之间的人，包括 "Adams" ，但不包括 "Carter" 。

**<font color='orage'>所以，请检查你的数据库是如何处理 BETWEEN....AND 操作符的！</font>**
## 🚂 AS – 别名
通过使用 SQL，可以为列名称和表名称指定别名（Alias），别名使查询程序更易阅读和书写。

**<font color='orage'>语法：</font>**

**表别名：**
```sql
SELECT 列名称/(*) FROM 表名称 AS 别名;
```
**列别名：**
```sql
SELECT 列名称 as 别名 FROM 表名称;
```
**<font color='orage'>实例：</font>**

**使用表名称别名：**
```sql
SELECT p.LastName, p.FirstName
FROM Persons p 
WHERE p.LastName='Adams' AND p.FirstName='John';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb79f31ea6684397b66de85fab7a7d92~tplv-k3u1fbpfcp-zoom-1.image)

**使用列名别名：**
```sql
SELECT LastName "Family", FirstName "Name" FROM Persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/71b245b232f34d00ac603042b81935b4~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 实际应用时，这个 `AS` 可以省略，但是列别名需要加上 `" "`。

## 🚁 JOIN – 多表关联
`JOIN` 用于根据两个或多个表中的列之间的关系，从这些表中查询数据。

有时为了得到完整的结果，我们需要从两个或更多的表中获取结果。我们就需要执行 `join`。

数据库中的表可通过键将彼此联系起来。主键（Primary Key）是一个列，在这个列中的每一行的值都是唯一的。在表中，每个主键的值都是唯一的。这样做的目的是在不重复每个表中的所有数据的情况下，把表间的数据交叉捆绑在一起。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95f027b472994d698c049d6ff936bca1~tplv-k3u1fbpfcp-zoom-1.image)

如图，"Id_P" 列是 Persons 表中的的主键。这意味着没有两行能够拥有相同的 Id_P。即使两个人的姓名完全相同，Id_P 也可以区分他们。

**❤️ 为了下面实验的继续，我们需要再创建一个表：Orders。**
```sql
create table orders (id_o number,orderno number,id_p number);
insert into orders values(1,11111,1);
insert into orders values(2,22222,2);
insert into orders values(3,33333,3);
insert into orders values(4,44444,4);
insert into orders values(6,66666,6);
select * from orders;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/62c7b5ed55e94689bcac0e4941985933~tplv-k3u1fbpfcp-zoom-1.image)

如图，"Id_O" 列是 Orders 表中的的主键，同时，"Orders" 表中的 "Id_P" 列用于引用 "Persons" 表中的人，而无需使用他们的确切姓名。
```sql
select * from persons p,orders o where p.id_p=o.id_p;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f6f453a93c247f6b543c8a6587effe6~tplv-k3u1fbpfcp-zoom-1.image)

可以看到，"Id_P" 列把上面的两个表联系了起来。

**<font color='orage'>语法：</font>**
```sql
select 列名
from 表A
INNER|LEFT|RIGHT|FULL JOIN 表B
ON 表A主键列 = 表B外键列;
```
**不同的 SQL JOIN：**

下面列出了您可以使用的 JOIN 类型，以及它们之间的差异。
- JOIN: 如果表中有至少一个匹配，则返回行
- INNER JOIN: 内部连接，返回两表中匹配的行
- LEFT JOIN: 即使右表中没有匹配，也从左表返回所有的行
- RIGHT JOIN: 即使左表中没有匹配，也从右表返回所有的行
- FULL JOIN: 只要其中一个表中存在匹配，就返回行

**<font color='orage'>实例：</font>**

如果我们希望列出所有人的定购，可以使用下面的 SELECT 语句：
```sql
SELECT p.LastName, p.FirstName, o.OrderNo
FROM Persons p
INNER JOIN Orders o
ON p.Id_P = o.Id_P
ORDER BY p.LastName DESC;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/590b9ca27bf344389b9ea4f0134cd912~tplv-k3u1fbpfcp-zoom-1.image)
## 🚜 UNION – 合并结果集
`UNION` 操作符用于合并两个或多个 SELECT 语句的结果集。

**<font color='orage'>UNION 语法：</font>**
```sql
SELECT 列名 FROM 表A
UNION
SELECT 列名 FROM 表B;
```
**📢注意：** UNION 操作符默认为选取不同的值。如果查询结果需要显示重复的值，请使用 `UNION ALL`。

**<font color='orage'>UNION ALL 语法：</font>**
```sql
SELECT 列名 FROM 表A
UNION ALL
SELECT 列名 FROM 表B;
```
另外，UNION 结果集中的列名总是等于 UNION 中第一个 SELECT 语句中的列名。

为了实验所需，创建 Person_b 表：
```sql
CREATE TABLE Persons_b
(
Id_P int,
LastName varchar(255),
FirstName varchar(255),
Address varchar(255),
City varchar(255)
);
INSERT INTO Persons_b VALUES (1, 'Bill', 'Gates', 'Xuanwumen 10', 'Londo');
INSERT INTO Persons_b VALUES (2, 'John', 'Adams', 'Oxford Street', 'nBeijing');
INSERT INTO Persons_b VALUES (3, 'George', 'Bush', 'Fifth Avenue', 'Beijing');
INSERT INTO Persons_b VALUES (4, 'Thomas', 'Carter', 'Changan Street', 'New York');
INSERT INTO Persons_b VALUES (5, 'William', 'Carter', 'Xuanwumen 10', 'Beijing');
select * from persons_b;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/474d5137bbdb4966a75261944bc78b55~tplv-k3u1fbpfcp-zoom-1.image)

**<font color='orage'>实例：</font>**

**使用 UNION 命令：**

列出 persons 和 persons_b 中不同的人：
```sql
select * from persons
UNION
select * from persons_b;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85a2566fcc5b4a18960a74a87a3c4722~tplv-k3u1fbpfcp-zoom-1.image)

**📢注意：** UNION 内部的 SELECT 语句必须拥有相同数量的列。列也必须拥有相似的数据类型。同时，每条 SELECT 语句中的列的顺序必须相同。
## 🚌 NOT NULL – 非空
`NOT NULL` 约束强制列不接受 NULL 值。

NOT NULL 约束强制字段始终包含值。这意味着，如果不向字段添加值，就无法插入新记录或者更新记录。

**<font color='orage'>语法：</font>**
```sql
CREATE TABLE 表
(
列 int NOT NULL
);
```
如上，创建一个表，设置列值不能为空。

**<font color='orage'>实例：</font>**
```sql
create table lucifer (id number not null);
insert into lucifer values (NULL);
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d68965bb49994a0cbc7d44f3d9fdd523~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 如果插入 `NULL` 值，则会报错 `ORA-01400` 提示无法插入！

**⭐️ 拓展小知识：**`NOT NULL` 也可以用于查询条件：
```sql
select * from persons where FirstName is not null;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85a69e36894046cf8ef3838ee31fd7db~tplv-k3u1fbpfcp-zoom-1.image)

同理，`NULL` 也可：
```sql
select * from persons where FirstName is null;
```
感兴趣的朋友，可以自己尝试一下！
## 🚐 VIEW – 视图
在 SQL 中，视图是基于 SQL 语句的结果集的可视化的表。

视图包含行和列，就像一个真实的表。视图中的字段就是来自一个或多个数据库中的真实的表中的字段。我们可以向视图添加 SQL 函数、WHERE 以及 JOIN 语句，我们也可以提交数据，就像这些来自于某个单一的表。

**<font color='orage'>语法：</font>**
```sql
CREATE VIEW 视图名 AS
SELECT 列名
FROM 表名
WHERE 查询条件;
```
**📢 注意：** 视图总是显示最近的数据。每当用户查询视图时，数据库引擎通过使用 SQL 语句来重建数据。

**<font color='orage'>实例：</font>**

下面，我们将 Persons 表中住在 Beijing 的人筛选出来创建视图：
```sql
create view persons_beijing as
select * from persons where city='Beijing';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d577beb6cd1c463a80a00c282ef5f3b8~tplv-k3u1fbpfcp-zoom-1.image)

查询上面这个视图：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8677cafb3413439faecbff87a24a5e99~tplv-k3u1fbpfcp-zoom-1.image)

如果需要更新视图中的列或者其他信息，无需删除，使用 `CREATE OR REPLACE VIEW` 选项：
```sql
CREATE OR REPLACE VIEW 视图名 AS
SELECT 列名
FROM 表名
WHERE 查询条件;
```
**<font color='orage'>实例：</font>**

现在需要筛选出，LASTNAME 为 Gates 的记录：
```sql
create or replace view persons_beijing as
select * from persons where lastname='Gates';
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e3986885dbf8410489f4d21aff6b9e72~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc0e8938e9f24b08a67faa2c212834ad~tplv-k3u1fbpfcp-zoom-1.image)

删除视图就比较简单，跟表差不多，使用 `DROP` 即可：
```sql
drop view persons_beijing;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c89150ed77c14b42b0c4464f45c29390~tplv-k3u1fbpfcp-zoom-1.image)

**❤️ <font color='orage'>本章要讲的高级语言就先到此为止，不宜一次性介绍太多~</font>**
# 🎯 SQL 常用函数学习
SQL 拥有很多可用于计数和计算的内建函数。

**<font color='orage'>函数的使用语法：</font>**
```sql
SELECT function(列) FROM 表;
```
**❤️ 下面就来看看有哪些常用的函数！**

## 🍔 AVG – 平均值
AVG 函数返回数值列的平均值。NULL 值不包括在计算中。

**<font color='orage'>语法：</font>**
```sql
SELECT AVG(列名) FROM 表名;
```
**<font color='orage'>实例：</font>**

计算 "orderno" 字段的平均值。
```sql
select avg(orderno) from orders;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/808115ad57354c9e829b42cc2ffe61e9~tplv-k3u1fbpfcp-zoom-1.image)

当然，也可以用在查询条件中，例如查询低于平均值的记录：
```sql
select * from orders where orderno < (select avg(orderno) from orders);
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abcb84b54ead4aa2b7001c99c9aa1bf4~tplv-k3u1fbpfcp-zoom-1.image)
## 🍕 COUNT – 汇总行数
COUNT() 函数返回匹配指定条件的行数。

**<font color='orage'>语法：</font>**

`count()` 中可以有不同的语法：
- COUNT(*) ：返回表中的记录数。
- COUNT(DISTINCT 列名) ：返回指定列的不同值的数目。
- COUNT(列名) ：返回指定列的值的数目（NULL 不计入）。
```sql
SELECT COUNT(*) FROM 表名;
SELECT COUNT(DISTINCT 列名) FROM 表名;
SELECT COUNT(列名) FROM 表名;
```
**<font color='orage'>实例：</font>**

**COUNT(*) ：**
```sql
select count(*) from persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/46478f79c1fc4668b13b582857e3c9ef~tplv-k3u1fbpfcp-zoom-1.image)

**COUNT(DISTINCT 列名) ：**
```sql
select count(distinct city) from persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7aef1b1b82b449a9e07c966d881ca0b~tplv-k3u1fbpfcp-zoom-1.image)

**COUNT(列名) ：**
```sql
select count(city) from persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d43e521d2fde4dbe88524cdf6a7a628e~tplv-k3u1fbpfcp-zoom-1.image)
## 🍘 MAX – 最大值
`MAX` 函数返回一列中的最大值。NULL 值不包括在计算中。

**<font color='orage'>语法：</font>**
```sql
SELECT MAX(列名) FROM 表名;
```
MIN 和 MAX 也可用于文本列，以获得按字母顺序排列的最高或最低值。

**<font color='orage'>实例：</font>**
```sql
select max(orderno) from orders;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbf1e08282f84e479dd3f7c6af9edf55~tplv-k3u1fbpfcp-zoom-1.image)
## 🍢 MIN – 最小值
`MIN` 函数返回一列中的最小值。NULL 值不包括在计算中。

**<font color='orage'>语法：</font>**
```sql
SELECT MIN(列名) FROM 表名;
```

**<font color='orage'>实例：</font>**
```sql
select min(orderno) from orders;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6699f738c6554386a547586a0b906250~tplv-k3u1fbpfcp-zoom-1.image)
## 🍰 SUM – 求和
`SUM` 函数返回数值列的总数（总额）。

**<font color='orage'>语法：</font>**
```sql
SELECT SUM(列名) FROM 表名;
```
**<font color='orage'>实例：</font>**
```sql
select sum(orderno) from orders;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3fbfdb9d086d4b7ca3db7588520688f6~tplv-k3u1fbpfcp-zoom-1.image)
## 🍪 GROUP BY – 分组
GROUP BY 语句用于结合合计函数，根据一个或多个列对结果集进行分组。

**<font color='orage'>语法：</font>**
```sql
SELECT 列名A, 统计函数(列名B)
FROM 表名
WHERE 查询条件
GROUP BY 列名A;
```
**<font color='orage'>实例：</font>**

获取 Persons 表中住在北京的总人数，根据 LASTNAME 分组：
```sql
select lastname,count(city) from persons 
where city='Beijing' 
group by lastname;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e0a1788ea3cf489d938299826b8f53dd~tplv-k3u1fbpfcp-zoom-1.image)

如果不加 `GROUP BY ` 则会报错：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75061370b9d64986b9bcb568ebfc50da~tplv-k3u1fbpfcp-zoom-1.image)

也就是常见的 `ORA-00937` 不是单组分组函数的错误。
## 🍭 HAVING – 句尾连接
在 SQL 中增加 HAVING 子句原因是，WHERE 关键字无法与合计函数一起使用。

**<font color='orage'>语法：</font>**
```sql
SELECT 列名A, 统计函数(列名B)
FROM table_name
WHERE 查询条件
GROUP BY 列名A
HAVING 统计函数(列名B) 查询条件;
```
**<font color='orage'>实例：</font>**

获取 Persons 表中住在北京的总人数大于1的 LASTNAME，根据 LASTNAME 分组：
```sql
select lastname,count(city) from persons 
where city='Beijing' 
group by lastname
having count(city) > 1;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ac4d916647542b49165a78f56d11639~tplv-k3u1fbpfcp-zoom-1.image)
## 🍷 UCASE/UPPER – 大写
`UCASE/UPPER` 函数把字段的值转换为大写。

**<font color='orage'>语法：</font>**
```sql
select upper(列名) from 表名;
```
**<font color='orage'>实例：</font>**

选取 "LastName" 和 "FirstName" 列的内容，然后把 "LastName" 列转换为大写：
```sql
select upper(lastname),firstname from persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eff20ec933d14debbd2e857baee41acd~tplv-k3u1fbpfcp-zoom-1.image)
## 🍶 LCASE/LOWER – 小写
`LCASE/LOWER` 函数把字段的值转换为小写。

**<font color='orage'>语法：</font>**
```sql
select lower(列名) from 表名;
```
**<font color='orage'>实例：</font>**

选取 "LastName" 和 "FirstName" 列的内容，然后把 "LastName" 列转换为小写：
```sql
select lower(lastname),firstname from persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93924cb4b3094b329d09f818479206d4~tplv-k3u1fbpfcp-zoom-1.image)
## 👛 LEN/LENGTH – 获取长度
`LEN/LENGTH` 函数返回文本字段中值的长度。

**<font color='orage'>语法：</font>**
```sql
select length(列名) from 表名;
```

**<font color='orage'>实例：</font>**

获取 LASTNAME 的值字符长度：
```sql
select length(lastname),lastname from persons;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/317bf2e7c66a43e7980bf2882a459eef~tplv-k3u1fbpfcp-zoom-1.image)
## 🍗 ROUND – 数值取舍
`ROUND` 函数用于把数值字段舍入为指定的小数位数。

**<font color='orage'>语法：</font>**
```sql
select round(列名,精度) from 表名;
```
**<font color='orage'>实例：</font>**

**保留2位：**
```sql
select round(1.1314,2) from dual;
select round(1.1351,2) from dual;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb2334f55c264015b98e9a87c1bc0883~tplv-k3u1fbpfcp-zoom-1.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abb8481ad0f448b9a9978ca1c9944c9d~tplv-k3u1fbpfcp-zoom-1.image)

📢 注意：`ROUND` 取舍是 **四舍五入** 的！

**取整：**
```sql
select round(1.1351,0) from dual;
select round(1.56,0) from dual;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e473c7b6a51449e09db7f5095a69a790~tplv-k3u1fbpfcp-zoom-1.image)
## 🍞 NOW/SYSDATE – 当前时间
`NOW/SYSDATE` 函数返回当前的日期和时间。

**<font color='orage'>语法：</font>**
```sql
select sysdate from 表名;
```
**<font color='orage'>实例：</font>**

获取当前时间：
```sql
select sysdate from dual;
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1ba785917214eabab846108b4413c9b~tplv-k3u1fbpfcp-zoom-1.image)

**📢 注意：** 如果您在使用 Sql Server 数据库，请使用 `getdate()` 函数来获得当前的日期时间。
# 🍺 写在最后
**上述如果都学完了的话，可以来做个小测验：[SQL 测验](https://www.w3school.com.cn/quiz/quiz.asp?quiz=sql)**，看看掌握的怎么样！
<a id="jump_100"></a>
**❤️ 测验会被记分：**

每道题的分值是 1 分。在您完成全部的20道题之后，系统会为您的测验打分，并提供您做错的题目的正确答案。其中，绿色为正确答案，而红色为错误答案。

**☞ [现在就开始测验！](https://www.w3school.com.cn/quiz/quiz.asp?quiz=sql)** 祝您好运。

**<font color='red'>⭐️ 将你的得分写在下方的 `评论区` 中吧，让我看看大家的水平如何？⭐️</font>**



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