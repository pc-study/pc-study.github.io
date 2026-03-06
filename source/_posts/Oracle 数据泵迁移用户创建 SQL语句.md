---
title: Oracle 数据泵迁移用户创建 SQL语句
date: 2021-10-04 10:10:36
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125793
---

在进行数据泵迁移时，通常是按照用户进行导入导出，因此需要确认当前数据库中存在那些非系统用户！

**查看数据库中用户状态为 OPEN 的用户：**
```sql
select username,account_status,created,PROFILE from dba_users where account_status='OPEN' order by created;
```
通过上述sql查询出的结果中，根据 `created` 字段可以筛选掉非系统用户！

**查看数据库中的角色：**
```sql
select * from dba_roles;
```

**创建用户 SQL：**
```sql
select 'create user ' || t.username || ' identified by values ' || chr(39) ||
       u.password || chr(39) || ' default tablespace ' ||
       t.default_tablespace || ' profile ' || p.name || ' Temporary TABLESPACE '|| TEMPORARY_TABLESPACE  ||';' create_user_withoutpass
  from dba_users t, sys.user$ u, sys.profname$ p, sys.user_astatus_map m
 where t.user_id = u.user#
   and u.resource$ = p.profile#
   and u.astatus = m.status#
   and t. username in ('需要创建的用户名，用逗号隔开');
```

**用户授权：**
```sql
select 'GRANT connect,resource,unlimited tablespace,DBA to ' ||username|| ';' from dba_users where username in ('需要创建的用户名，用逗号隔开');
```
📢 注意：如果是使用expdp，则不需要创建用户和授权！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️