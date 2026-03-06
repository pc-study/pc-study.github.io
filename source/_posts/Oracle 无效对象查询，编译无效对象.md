---
title: Oracle 无效对象查询，编译无效对象
date: 2021-10-14 11:10:37
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/134160
---

**查看当前无效对象**
```sql
select *
from  dba_objects t
where t.status = 'INVALID' order by 1;
```

**编译无效对象：**

有两种方式：

1、执行sql查询结果：
```sql
select  'alter  '||object_type||'   '||owner||'.'||object_name||'   compile;'
from  dba_objects t
where t.status = 'INVALID' order by 1;
```

2、脚本编译：
```bash
sqlplus / as sysdba @?/rdbms/admin/utlrp.sql
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️