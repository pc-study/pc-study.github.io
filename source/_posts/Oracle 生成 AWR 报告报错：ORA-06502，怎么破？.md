---
title: Oracle 生成 AWR 报告报错：ORA-06502，怎么破？
date: 2021-10-11 10:10:00
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/129508
---

Oracle 数据库 awr 报告是 DBA 用于分析数据库性能情况的重要工具！

**最近遇到一个问题，生成报告时报错：**
```bash
ERROR:
ORA-06502: PL/SQL: numeric or value error: character string buffer too small
ORA-06512: at "SYS.DBMS_WORKLOAD_REPOSITORY", line 919
ORA-06512: at line 1
```
**那么，如何解决这个问题呢？**

**解决方案：**
```sql
update WRH$_SQLTEXT set sql_text = SUBSTR(sql_text, 1, 1000);
commit;
```
**执行完之后，重新执行`sqlplus / as sysdba @?/rdmbs/admin/awrrpt.sql` 脚本顺利生成 AWR 报告！**

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️


