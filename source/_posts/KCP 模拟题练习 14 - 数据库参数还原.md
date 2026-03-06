---
title: KCP 模拟题练习 14 - 数据库参数还原
date: 2024-10-08 16:28:38
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843568462364504064
---

【单选题】你是 KingbaseES 数据库管理员，现在你需要使用 ALTER STSTEM 命令还原配置，以下哪个操作可以实现？
 - [ ] ALTER STSTEM RESET;
 - [ ] ALTER DATABASE RESET ALL;
 - [x] ALTER SYSTEM RESET ALL;
 - [ ] ALTER DATABASE RESET CONFIG;

**解题思路：**

还是以 work_mem 参数为例，先设置为 8MB：
```sql
test=# show work_mem;                       
 work_mem 
----------
 4MB
(1 行记录)

test=# alter system set work_mem='8MB';     
ALTER SYSTEM
test=# \! sys_ctl reload               
服务器进程发出信号
test=# show work_mem;                  
 work_mem 
----------
 8MB
(1 行记录)
```
执行以上选项中的命令：
```sql
-- 选项 1 报错
test=# ALTER STSTEM RESET;
错误:  语法错误 在 "STSTEM" 或附近的
第1行ALTER STSTEM RESET;
           ^
-- 选项 2 报错
test=# ALTER DATABASE RESET ALL;
错误:  语法错误 在 "ALL" 或附近的
第1行ALTER DATABASE RESET ALL;
                          ^
-- 选项 3 成功还原
test=# ALTER SYSTEM RESET ALL;
ALTER SYSTEM
test=# \! sys_ctl reload               
服务器进程发出信号
test=# show work_mem;   
 work_mem 
----------
 4MB

-- 选项 4 报错
test=# ALTER DATABASE RESET CONFIG;
错误:  语法错误 在 ";" 或附近的
第1行ALTER DATABASE RESET CONFIG;
                                ^
```
答案一目了然了。