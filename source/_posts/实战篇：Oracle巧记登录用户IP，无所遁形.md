---
title: 实战篇：Oracle巧记登录用户IP，无所遁形
date: 2021-07-14 21:56:54
tags: [oracle记录ip地址]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/84175
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
日常工作生产，我们一般都通过监听连接 `Oracle` 数据库。如果想要记录访问过数据库的用户 `IP` 地址，常规方式是无法做到的，但是可以通过一些非常规方式来实现。

# 一、介绍
这里提供几种方式：
- 通过触发器实现
- 查看监听日志
- 通过 PLSQL 包 `DBMS_SESSION`

# 二、实战演示
## 1、触发器实现
创建单独表空间存放记录：
```sql
create tablespace test datafile;
```
![](https://i-blog.csdnimg.cn/blog_migrate/178eff03f8988a8ac5a36745b23a435c.png)

通过 `ctas` 复制 v$session  表结构，用来存放 `session` 历史记录：
```sql
create table session_history tablespace test as (select sid,username,program,machine,'000.000.000.000'ipadd,sysdate moditime from v$session where 0=1);
```
![](https://i-blog.csdnimg.cn/blog_migrate/9bb8adb34e7f6c50ca35aa3abb43d581.png)

创建触发器 `on_logon_trigger`，当有用户登录时，将记录插入 `session` 历史记录表：
```sql
CREATE or replace trigger on_logon_trigger after logon
ON database begin
INSERT INTO session_history
SELECT  sid
       ,username
       ,program
       ,machine
       ,sys_context('userenv','ip_address')
       ,sysdate
FROM v$session
WHERE audsid = userenv('sessionid'); end;
/
```
![](https://i-blog.csdnimg.cn/blog_migrate/c454a1763483a3d62225c734c7fd6511.png)

本机通过 `lucifer` 用户登录：
```bash
sqlplus lucifer/lucifer@10.211.55.110/orcl
```
![](https://i-blog.csdnimg.cn/blog_migrate/04af75424e70136c40cb5c6788de2922.png)

查询 `非 SYS` 用户的登录记录：
```sql
alter session set nls_date_format = 'yyyy-mm-dd hh24:mi:ss';
select * from session_history q where q.username not in ('SYS');
```
![](https://i-blog.csdnimg.cn/blog_migrate/3d71f2aa4e7d07c16ca89c20a6a87c27.png)

**<font color='orage'>至此，已经可以记录到登录数据库的用户 IP 地址，第一种方式已经介绍完毕！</font>**
## 2、查看监听日志
查看监听日志位置：
```bash
su - oracle
lsnrctl status
```
![](https://i-blog.csdnimg.cn/blog_migrate/14e6513a949767ff00648a6dfe29dabf.png)

查看监听日志：
```bash
tail -100 log.xml
```
![](https://i-blog.csdnimg.cn/blog_migrate/c2f74d58917a5a62f18a283a70d26bc8.png)
**<font color='orage'>这种方式也是可以实现查看登录IP，但是查询起来可能有些麻烦。</font>**

## 3、PLSQL包 DBMS_SESSION
为方便后面测试，先删除第一种方式创建的触发器和表空间：
```sql
drop trigger on_logon_trigger;
drop tablespace test;
```
![](https://i-blog.csdnimg.cn/blog_migrate/2e1849e80a1179c231d786d86aea12cb.png)

测试是否还能看到 IP 地址：
```bash
sqlplus lucifer/lucifer@10.211.55.110/orcl
sqlplus / as sysdba
alter session set nls_date_format = 'yyyy-mm-dd hh24:mi:ss';
select username,machine,terminal,program,client_info,logon_time from v$session;
```
![](https://i-blog.csdnimg.cn/blog_migrate/85c031007fb86a537ecd02518f3b64d4.png)

**从上图的 client_info 字段为空，可以看出 v$session 视图并没有记录到 IP。**
​
使用 `DBMS_SESSION` 程序包设置可以查询 IP 地址：
```sql
exec DBMS_SESSION.set_identifier(SYS_CONTEXT('USERENV', 'IP_ADDRESS'));
```
![](https://i-blog.csdnimg.cn/blog_migrate/408258a57d143105dfd445c352b971ec.png)

主机测试用户登录是否能查看 IP 地址：
```bash
sqlplus lucifer/lucifer@10.211.55.110/orcl
alter session set nls_date_format = 'yyyy-mm-dd hh24:mi:ss';
select sys_context('userenv','ip_address') from dual; 
```
![](https://i-blog.csdnimg.cn/blog_migrate/6f58e3d34c3dd4e759a6101e267ae178.png)

换一个主机客户端登录，查看是否可以查询 IP 地址：

![](https://i-blog.csdnimg.cn/blog_migrate/323dfc82779a96d8546e2ea632f800d1.png)

**从上述实验可以看出，客户端已经可以查询 IP 地址，说明 plsql 包已生效，但是不会记录到 v$session 中，需要创建一个触发器来实现。**

创建触发器，记录客户端登录 IP：
```sql
create or replace trigger on_logon_trigger
  after logon on database
begin
  dbms_application_info.set_client_info(sys_context('userenv','ip_address'));
end;
/
```
![](https://i-blog.csdnimg.cn/blog_migrate/02c2f8a03e8054ef33bd737affde784c.png)

查询 `v$session` 查看是否有记录 IP 地址：
```sql
select username,machine,terminal,program,client_info,logon_time from v$session where username is not null;
```
![](https://i-blog.csdnimg.cn/blog_migrate/63a56b6405e9a04d64c564775fdadb90.png)

可以看到，IP 地址已经被记录了。

**通过以上几种方式，我们可以跟踪记录到登录用户的IP地址。**


---

# 往期精彩文章
>[Oracle 一键巡检自动生成 Word 报告](https://mp.weixin.qq.com/s/0xFe5m1DQ0ucT2_266hsrA)    
[Oracle 一键安装合集](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5MzcwNzQ0MQ==&action=getalbum&album_id=3497774649285296131#wechat_redirect)    
[Oracle一键安装脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/gv6t97FFyMsd6e4GH1HAwQ)    
[Oracle一键巡检脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/4zI73auIUhwSRb7qL3UIfw)    
[全网首发：Oracle 23ai 一键安装脚本（非 RPM）](https://mp.weixin.qq.com/s/UL0BSMCAZrOQgCoWpDMGew)    
[Oracle 19C 最新 RU 补丁 19.24 ，一键安装！](https://mp.weixin.qq.com/s/T7GbpwhnMugzk7PB6hAoJQ)    
[Oracle Linux 7.9 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/dT4tFMYVZ3mh49CI6V3YEA)    
[RedHat 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cQJ6gP1bM_7m0H5-Dha4TA)    
[openEuler 22.03 LTS SP4 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/sx1E4GIvIeQXp2vGMmVr2A)    
[RHEL 7.9 一键安装 Oracle 19C 19.23 RAC](https://mp.weixin.qq.com/s/mUHqU5hQ9GdH2bKuClPt5A)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q)    
[优化 Oracle：最佳实践与开发规范](https://mp.weixin.qq.com/s/DysIcb-p11j56d3YtlqpcQ)    
[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA)    
[Linux 一键配置时钟同步全攻略](https://mp.weixin.qq.com/s/yvth1vorP3JjUp3g3vPBAQ)    

---

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎**点赞+关注**，我会持续分享数据库知识、运维技巧。