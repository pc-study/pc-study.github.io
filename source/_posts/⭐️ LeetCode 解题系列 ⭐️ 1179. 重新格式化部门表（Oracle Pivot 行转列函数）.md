---
title: ⭐️ LeetCode 解题系列 ⭐️ 1179. 重新格式化部门表（Oracle Pivot 行转列函数）
date: 2021-07-31 00:30:52
tags: [leetcode解题]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89078
---

@[TOC](1179. 重新格式化部门表)
# ❤️ 原题 ❤️
**部门表 Department：**
```
+---------------+---------+
| Column Name   | Type    |
+---------------+---------+
| id            | int     |
| revenue       | int     |
| month         | varchar |
+---------------+---------+
(id, month) 是表的联合主键。
这个表格有关于每个部门每月收入的信息。
月份（month）可以取下列值 ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]。
```
编写一个 SQL 查询来重新格式化表，使得新的表中有一个部门 id 列和一些对应 每个月 的收入（revenue）列。

查询结果格式如下面的示例所示：
```
Department 表：
+------+---------+-------+
| id   | revenue | month |
+------+---------+-------+
| 1    | 8000    | Jan   |
| 2    | 9000    | Jan   |
| 3    | 10000   | Feb   |
| 1    | 7000    | Feb   |
| 1    | 6000    | Mar   |
+------+---------+-------+

查询得到的结果表：
+------+-------------+-------------+-------------+-----+-------------+
| id   | Jan_Revenue | Feb_Revenue | Mar_Revenue | ... | Dec_Revenue |
+------+-------------+-------------+-------------+-----+-------------+
| 1    | 8000        | 7000        | 6000        | ... | null        |
| 2    | 9000        | null        | null        | ... | null        |
| 3    | null        | 10000       | null        | ... | null        |
+------+-------------+-------------+-------------+-----+-------------+

注意，结果表有 13 列 (1个部门 id 列 + 12个月份的收入列)。
```
# ☀️ 解题思路 ☀️
## Pivot 函数简介
通过审题可以发现，需要将月份的值 12 个月转化为 查询结果中的 12 个列。这就是明显的 `行转列` 格式化。

Oracle 11G 中出现的新特性 `Pivot` 行转列函数正好可以解此题。

下面先了解一下 Pivot 函数，主要用于进行行转列操作。

基本语法如下：
```sql
SELECT ...
FROM   ...
PIVOT [XML]
   ( pivot_clause
     pivot_for_clause
     pivot_in_clause )
WHERE  ...
```
下面我们直接通过 LeetCode 题目实验来学习一下：

## 创建测试表 Department
```sql
CREATE TABLE department (
  id        NUMBER,
  revenue   NUMBER,
  month  VARCHAR2(10)
);
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2d1e2319f7974d4e91210896ccd53044.png)
## 插入测试数据
```sql
INSERT INTO department VALUES (1, 8000, 'Jan');
INSERT INTO department VALUES (1, 7000, 'Feb');
INSERT INTO department VALUES (1, 6000, 'Mar');
INSERT INTO department VALUES (2, 9000, 'Jan');
INSERT INTO department VALUES (3, 10000, 'Feb');
commit;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/b977f020907d41f39eb16034f95534e6.png)
## 执行 Pivot 行转列函数
根据题意：已确定需要查出的列为 ID 和 12个月份，月份列对应的 REVENUE 的值需要进行汇总 (SUM) 显示。
```sql
SELECT *
FROM department
PIVOT (SUM(revenue) as "Revenue" for month in (
'Jan' as "Jan",
'Feb' as "Feb",
'Mar' as "Mar",
'Apr' as "Apr",
'May' as "May",
'Jun' as "Jun",
'Jul' as "Jul",
'Aug' as "Aug",
'Sep' as "Sep",
'Oct' as "Oct",
'Nov' as "Nov",
'Dec' as "Dec"
));
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/166968163b1948dc8ac37485a01b398d.png)
**❤️ <font color='green'>格式化结果与原题所需要求保持一致，解题完成。</font> ❤️**

![在这里插入图片描述](https://img-blog.csdnimg.cn/a3558a47308c495a830bc79769239de8.png)
# ❄️ 写在最后
关于 Pivot 行转列函数，还有 UNPivot 函数，感兴趣的朋友可以翻阅官方文档，或者参考以下文章：

[PIVOT and UNPIVOT Operators in Oracle Database 11g Release 1](https://oracle-base.com/articles/11g/pivot-and-unpivot-operators-11gr1#pivot)

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️

![Lucifer三思而后行](https://img-blog.csdnimg.cn/20210702105616339.jpg)
