---
title: Oracle 查看 rman 备份情况 SQL 语句
date: 2021-10-01 09:10:40
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125652
---

RMAN 备份是 Oracle 数据库中最常用的一种备份方式！

可以直接通过 rman 客户端来查看备份情况，也可以通过rman备份视图来查看备份情况。

SQL语句如下：
```sql
set line222
col pagesize1000
col status for a10
col input_type for a20
col INPUT_BYTES_DISPLAY for a10
col OUTPUT_BYTES_DISPLAY for a10 
col TIME_TAKEN_DISPLAY for a10
select input_type,
       status,
       to_char(start_time,
               'yyyy-mm-dd hh24:mi:ss'),
       to_char(end_time,
               'yyyy-mm-dd hh24:mi:ss'),
       input_bytes_display,
       output_bytes_display,
       time_taken_display,
       COMPRESSION_RATIO
  from v$rman_backup_job_details
 order by 3 desc;
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️