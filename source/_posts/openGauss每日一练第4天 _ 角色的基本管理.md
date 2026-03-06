---
title: openGauss每日一练第4天 | 角色的基本管理
date: 2021-12-04 10:12:36
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/188593
---

openGauss 每日一练第 4 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 4 课，学习 openGauss 创建角色、修改角色属性、更改角色权限和删除角色！

角色是用来管理权限的，从数据库安全的角度考虑，可以把所有的管理和操作权限划分到不同的角色上！
# 课后作业打卡
过程中可以使用 `\du` 或 `\du+` 查看角色信息！

## 1.创建角色role1为系统管理员, role2指定生效日期, role3具有LOGIN属性
```sql
create role role1 sysadmin identified by 'Lucifer-4622';
create role role2 identified by 'Lucifer-4622' valid begin '2021-12-04' valid until '2021-12-05';
create role role3 login identified by 'Lucifer-4622';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211204-f6e73629-d3f4-4531-9eb9-f6e1097f5e80.png)
## 2.重命名role1
```sql
alter role role1 rename to lucifer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211204-bf12ca84-e6ea-4020-a7ee-7636a919e378.png)
## 3.修改role2密码
```sql
alter role role2 identified by 'lucifer-0622';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211204-686f81bd-1966-4065-8a1c-73025120b8ca.png)
## 4.将omm权限授权给role3,再回收role3的权限
```sql
grant omm to role3 with admin option;
revoke omm from role3;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211204-095c0741-0053-4d0b-9ca4-786ee4afaed2.png)
## 5.删除所有创建角色
```sql
drop role lucifer;
drop role role2;
drop role role3;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211204-080fdd3d-2962-4cff-b60c-f1aa4d137b1c.png)

# 写在最后

今天的作业打卡结束！🎉 