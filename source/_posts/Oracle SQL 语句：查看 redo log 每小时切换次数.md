---
title: Oracle SQL 语句：查看 redo log 每小时切换次数
date: 2021-09-27 12:36:21
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/115006
---

有时候，通过查看在线重做日志 redo log 每小时的切换次数，可以查看故障发生的时间点！

SQL 语句如下：
```sql
set linesize 260 pagesize 1000;
col h0 for 999
col h1 for 999; 
col h2 for 999; 
col h3 for 999; 
col h4 for 999; 
col h5 for 999; 
col h6 for 999; 
col h7 for 999; 
col h8 for 999; 
col h9 for 999; 
col h10 for 999; 
col h11 for 999; 
col h12 for 999; 
col h13 for 999; 
col h14 for 999; 
col h15 for 999; 
col h16 for 999; 
col h17 for 999; 
col h18 for 999; 
col h19 for 999; 
col h20 for 999
col h21 for 999; 
col h22 for 999; 
col h23 for 999;  
SELECT TRUNC(first_time) "Date",
       TO_CHAR(first_time, 'Dy') "Day",
       COUNT(1) "Total",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '00', 1, 0)) "h0",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '01', 1, 0)) "h1",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '02', 1, 0)) "h2",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '03', 1, 0)) "h3",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '04', 1, 0)) "h4",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '05', 1, 0)) "h5",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '06', 1, 0)) "h6",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '07', 1, 0)) "h7",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '08', 1, 0)) "h8",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '09', 1, 0)) "h9",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '10', 1, 0)) "h10",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '11', 1, 0)) "h11",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '12', 1, 0)) "h12",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '13', 1, 0)) "h13",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '14', 1, 0)) "h14",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '15', 1, 0)) "h15",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '16', 1, 0)) "h16",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '17', 1, 0)) "h17",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '18', 1, 0)) "h18",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '19', 1, 0)) "h19",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '20', 1, 0)) "h20",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '21', 1, 0)) "h21",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '22', 1, 0)) "h22",
       SUM(DECODE(TO_CHAR(first_time, 'hh24'), '23', 1, 0)) "h23",
       ROUND(COUNT(1) / 24, 2) "Avg"
  FROM v$log_history
 GROUP BY TRUNC(first_time), TO_CHAR(first_time, 'Dy')
 ORDER BY 1;
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️