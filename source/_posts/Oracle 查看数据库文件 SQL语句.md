---
title: Oracle 查看数据库文件 SQL语句
date: 2021-10-02 20:10:20
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125762
---

Oracle 数据库文件主要分为：
- 表空间数据文件（包括临时表空间和UNDO表空间）
- 控制文件
- 日志文件（包括重做日志和standby日志）


可以通过 SQL 来查询：
```sql
set line222
col pagesize1000
select name from v$datafile 
union all
select name from v$tempfile 
union all
select member from v$logfile 
union all
select name from v$controlfile;
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️