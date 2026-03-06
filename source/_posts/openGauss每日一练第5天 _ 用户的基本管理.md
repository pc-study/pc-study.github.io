---
title: openGauss每日一练第5天 | 用户的基本管理
date: 2021-12-05 10:12:21
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/188731
---

openGauss 每日一练第 5 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 5 课，学习 openGauss创建用户、修改用户属性、更改用户权限和删除用户！

用户是用来登录数据库的，通过对用户赋予不同的权限，可以方便地管理用户对数据库的访问及操作。
# 课后作业打卡
过程中使用\du或\du+查看用户信息。

## 1.创建用户user1、user2和user3，user1具有CREATEROLE权限，user2具有CREATEDB权限，要求使用两种不同的方法设置密码
```sql
create user user1 createrole identified by 'lucifer-4622';
create user user2 createdb password 'lucifer-4622';
create user user3 password 'lucifer-4622';
\du+
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211205-eea65088-7ec6-4379-8479-f25515b9a0ee.png)
## 2.修改用户user1的密码
```sql
alter user user1 identified by 'lucifer-0622' replace 'Lucifer-4622';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211205-dfd3d3be-b29a-47c7-b20d-dc7542f15ec9.png)

**拓展 && 疑问❓** 
- 既然加 `replace` 和不加效果相同，为什么要加 replace？
- 为什么第一次设置过得密码修改成其他密码后，无法再次设置成第一次设置的密码？

**<font color='orage'>👍🏻 有朋友给出了解释，感谢 [小虫](https://www.modb.pro/u/13100)：</font>**

1、普通用户修改自己的密码必须要求输入正确的旧密码才可以。而初始用户、系统管理员或者拥有创建用户权限的用户才可以不需要旧密码直接重置普通用户密码。

![](https://oss-emcsprod-public.modb.pro/image/editor/20211205-b7f88220-2894-43d8-9a6b-45d768d7f6a6.png)

2、无法 `reuse` 是因为有参数限制，单位是：天数，可以通过修改参数来限制密码重用。

>**参考：[设置密码安全策略](https://opengauss.org/zh/docs/2.0.0/docs/Developerguide/%E8%AE%BE%E7%BD%AE%E5%AF%86%E7%A0%81%E5%AE%89%E5%85%A8%E7%AD%96%E7%95%A5.html)**

如需要设置为 0，可以通过如下方式：
```bash
gs_guc reload -N all -I all -c "password_reuse_time=0"
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211205-ac866cc0-4fc3-4a5b-82cb-a9d390acd7a9.png)
## 3.重命名用户user2
```sql
alter user user2 rename to 'lucifer';
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211205-a85e31c9-877b-45ea-8042-fbb4bdcf202f.png)
## 4.将用户user1的权限授权给用户user3，再回收用户user3的权限
```sql
grant user1 to user3;
revoke user3 from user1;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211205-7d8bc1f0-edb2-4219-ae92-136535ad4171.png)
## 5.删除所有创建用户
```sql
drop user user1;
drop user lucifer;
drop user user3;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211205-45fa662b-f1be-44de-816b-89026a98aef9.png)

# 写在最后

今天的作业打卡结束！🎉 