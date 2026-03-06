---
title: ⭐️ LeetCode解题系列 ⭐️ 177. 第N高的薪水（Oracle dense_rank函数）
date: 2021-08-04 11:08:56
tags: [leetcode解题]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89236
---

@[TOC](177. 第N高的薪水)
# ❤️ 原题 ❤️
编写一个 SQL 查询，获取 `Employee` 表中第 n 高的薪水（Salary）。
```
+----+--------+
| Id | Salary |
+----+--------+
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
+----+--------+
```
例如上述 `Employee` 表，n = 2 时，应返回第二高的薪水 `200`。如果不存在第 n 高的薪水，那么查询应返回 `null`。
```
+------------------------+
| getNthHighestSalary(2) |
+------------------------+
| 200                    |
+------------------------+
```
# ⭐️ 解题思路 ⭐️
前面有一篇文章讲过 dense_rank 排名函数 [⭐️ LeetCode解题系列 ⭐️ 178. 分数排名（Oracle dense_rank函数）](https://blog.csdn.net/m0_50546016/article/details/119274435)，本题依然是排名函数的解法。

① 使用 dense_rank 函数进行排名并去重：
```sql
select distinct salary,dense_rank() over (order by salary desc) rank 
from employee;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/fa64455c343d4a9084cc22030cf4cad3.png)
② 将查询结果作为表，传入 N 值再次进行查询，并且使用 `nvl` 函数返回 `null`，返回结果：
```sql
select nvl(salary,null) 
    from (
        select distinct salary,dense_rank() over (order by salary desc) rank 
        from employee
    )
    where rank = 2;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3fdd4a6cf25440258e8989b16f85c65b.png)
③ 完整代码如下：
```sql
CREATE FUNCTION getNthHighestSalary(N IN NUMBER) RETURN NUMBER IS
result NUMBER;
BEGIN
    /* Write your PL/SQL query statement below */
    select nvl(salary,null) 
    into result 
    from (
        select distinct salary,dense_rank() over (order by salary desc) rank 
        from employee
    )
    where rank = N;
    
    RETURN result;
END;
```
去 LeetCode 执行一下看看结果吧：
![在这里插入图片描述](https://img-blog.csdnimg.cn/93f004645de94b0581f3f07fd4e0ddc4.png)
# ❄️ 写在最后 ❄️
本题的解题说难不难，只要知道这个函数，一下子就能看出解法。

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。