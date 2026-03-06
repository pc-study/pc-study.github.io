---
title: Oracle 执行在线重定义时，表空间满了报错 ORA-23539，怎么破？
date: 2021-10-20 09:30:38
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/140672
---

今天执行转分区表操作时，使用在线重定义，去吃个饭的功夫，表空间满了，报错如下：
![](https://img-blog.csdnimg.cn/a2c087e897be41df90eae41c59c9c8a3.png)
天真的我以为，添加表空间数据文件后，再次执行就可以了！结果，报错：
![](https://img-blog.csdnimg.cn/2f78966553f94176b8ff48d518f4b81e.png)
**大概意思就是已经被重定义了，无法再次重定义，怎么破呢？**

**✅ 解决方案：**
```sql
--查询表对应的物化视图
select mview_name from user_mviews;
--删除物化视图的日志
drop materialized view log on T;
--终止之前的重定义
exec DBMS_REDEFINITION.abort_redef_table('LUCIFER','T','T_PAR');
--再次进行重定义
EXEC DBMS_REDEFINITION.START_REDEF_TABLE('LUCIFER','T','T_PAR',NULL,DBMS_REDEFINITION.CONS_USE_ROWID);
```
上述中，`T` 代表原表，`T_PAR` 代表中间分区表，`LUCIFER` 代表用户！


---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️