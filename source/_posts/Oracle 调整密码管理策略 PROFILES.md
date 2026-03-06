---
title: Oracle 调整密码管理策略 PROFILES
date: 2021-10-04 10:10:48
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125792
---

**查看当前使用的profile：**
```sql
set pages0
set line222
col profile for a20
col resource_name for a30
col resource_type for a20
col limit for a20
select * from dba_profiles order by 1;
```

**启用密码管理：**
```sql
@?/rdbms/admin/utlpwdmg.sql
```

**调整密码策略：**
```sql
alter profile default limit  password_life_time unlimited;
alter profile default limit  password_lock_time unlimited;
alter profile default limit  password_grace_time unlimited;
alter profile default limit  FAILED_LOGIN_ATTEMPTS 10;
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️