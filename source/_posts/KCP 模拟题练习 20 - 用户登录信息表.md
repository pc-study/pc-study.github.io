---
title: KCP 模拟题练习 20 - 用户登录信息表
date: 2024-10-12 11:19:06
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1844939900519546880
---

【单选题】用户登录信息保存在哪个系统表中？
 - [ ] log_user
 - [ ] sys_audit_log
 - [ ] sys_log
 - [x] sys_audit_userlog

**解题思路：**

## 系统表 sys_audit_userlog：
用户的登录信息保存在系统表 sys_audit_userlog 中，管理员可查看所有用户的登录信息；普通用户可通过系统视图sys_user_audit_userlog 查看本用户的登录信息。

管理员查看最近登录的10条信息。
```sql
select * from sys_audit_userlog order by audtimestamp desc limit 10;
```

sys_log 是数据库日志文件。

