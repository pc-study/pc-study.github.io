---
title: ⭐️ LeetCode解题系列 ⭐️ 178. 分数排名（Oracle dense_rank函数）
date: 2021-08-05 07:34:06
tags: [leetcode解题]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89238
---

@[TOC](178. 分数排名)

# ❤️ 原题 ❤️
编写一个 SQL 查询来实现分数排名。

如果两个分数相同，则两个分数排名（Rank）相同。请注意，平分后的下一个名次应该是下一个连续的整数值。换句话说，名次之间不应该有“间隔”。
```
+----+-------+
| Id | Score |
+----+-------+
| 1  | 3.50  |
| 2  | 3.65  |
| 3  | 4.00  |
| 4  | 3.85  |
| 5  | 4.00  |
| 6  | 3.65  |
+----+-------+
```
例如，根据上述给定的 Scores 表，你的查询应该返回（按分数从高到低排列）：
```
+-------+------+
| Score | Rank |
+-------+------+
| 4.00  | 1    |
| 4.00  | 1    |
| 3.85  | 2    |
| 3.65  | 3    |
| 3.65  | 3    |
| 3.50  | 4    |
+-------+------+
```
# ⭐️ 解题思路 ⭐️
很明显，这是一个排名问题，Oracle 中有四大排名函数：
> - **rank函数**
> - **dense_rank函数**
> - **row_number函数**
> - **ntile函数**

下面举个例子来展示一下这 4 种函数的作用：
```sql
create table scores
(   id number(6)
   ,score number(4,2)
);
insert into scores values(1,3.50);
insert into scores values(2,3.65);
insert into scores values(3,4.00);
insert into scores values(4,3.85);
insert into scores values(5,4.00);
insert into scores values(6,3.65);
commit;

select
    id 
   ,score
   ,rank() over(order by score desc) rank               --按照成绩排名，纯排名
   ,dense_rank() over(order by score desc) dense_rank   --按照成绩排名，相同成绩排名一致
   ,row_number() over(order by score desc) row_number   --按照成绩依次排名
   ,ntile(3) over (order by score desc) ntile         --按照分数划分成绩梯队
from scores;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/4af4ea738437478d997d8ccc67c59404.png)
通过以上SQL查询结果可以发现：
如果两个分数相同，`RANK` 和 `DENSE_RANK` 函数的分数排名相同，但是 `RANK` 函数的名次之间会存在“间隔”，因此 `DENSE_RANK` 函数才是符合本题题意的解决方案。

# ☀️ 解题答案 ☀️
```sql
select score as "Score",dense_rank() over (order by score desc) as "Rank" from scores;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/ba7509f7a27d48a98113faf6eaf894b5.png)
去 LeetCode 执行一下看看结果吧：
![在这里插入图片描述](https://img-blog.csdnimg.cn/ee080af5e8314be99d209b43465dbb42.png)
# ❄️ 写在最后 ❄️
本题的解题说难不难，只要知道这个函数，一下子就能看出解法，不知道的当然可以通过 rownum的方式来实现，但是过于麻烦。

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。
