---
title: openGauss每日一练第15天 | 存储过程和函数
date: 2021-12-15 11:12:52
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/210308
---

openGauss 每日一练第 15 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 15 课，学习openGauss定义存储过程和函数。

# 课后作业打卡

## 1.创建带有入参和出参的函数1，调用函数时使用按参数值传递和命名标记法传参
```sql
CREATE FUNCTION lucifer_func1(num1 IN integer, num2 IN integer, res OUT integer)
RETURN integer
AS
BEGIN
res := num1 + num2;
END;
/

call lucifer_func1(1,2,1);
call lucifer_func1(num1=>1,num2=>2,res=>2);
```
## 2.创建返回类型为record的函数2，重命名函数2
```sql
CREATE OR REPLACE FUNCTION lucifer_func2(i int, out result_1 bigint, out result_2
bigint)
returns SETOF RECORD
as $$
begin
result_1 = i + 1;
result_2 = i * 10;
return next;
end;
$$language plpgsql;
call lucifer_func2(1, 0, 0);
alter function lucifer_func2(in int,out bigint,out bigint) rename to lucifer_func3;
```
## 3.使用\sf和系统函数查看函数定义
```sql
\sf lucifer_func3
select * from pg_proc where proname = 'lucifer_func3';
```
4.删除函数
```sql
drop function lucifer_func1;
drop function lucifer_func3;
```


# 写在最后

今天的作业打卡结束！🎉 