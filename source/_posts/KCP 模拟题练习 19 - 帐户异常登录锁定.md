---
title: KCP 模拟题练习 19 - 帐户异常登录锁定
date: 2024-10-12 11:04:36
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1844656977350328320
---

【单选题】哪个参数可以设置用户被锁定时长，若用户被锁定的时长超过了该参数，则该用户可自动解锁？
 - [ ] sys_audlog.error_user_connect_times
 - [ ] sys_audlog.error_user_interval
 - [x] sys_audlog.error_user_connect_interval
 - [ ] sys_audlog.error_sys_interval

**解题思路：**

# 帐户异常登录锁定
帐户异常登录锁定是指如果用户连续若干次不能正确的登录数据库，那么这个用户的帐户将被系统禁用。系统允许的用户连续错误登录次数由数据库管理员指定。被禁用的帐户可以由安全员利用 SQL 命令使其重新可用或者等待一段时间自动解锁。

KingbaseES 通过插件的方式来进行帐户异常登录锁定以及账户登录信息显示。这种方式更为灵活，当数据库的实用场景需要进行帐户异常登录锁定以及账户登录信息显示时，加载插件即可。而不需要该功能时，卸载插件即可。

插件名为 `sys_audlog`。

## 加载插件
修改 kingbase.conf 文件中 shared_preload_libraries 参数。
```bash
shared_preload_libraries = 'sys_audlog'
create extension sys_audlog;
```
## 参数配置
### sys_audlog.error_user_connect_times
允许用户连续登录失败的最大次数，用户登录失败的次数大于超过该值，用户自动锁定，取值范围为[0,INT_MAX]，缺省为 0。

设置密码连续最大失败次数为 10：
```sql
ALTER SYSTEM SET sys_audlog.max_error_user_connect_times = 10;
CALL sys_reload_conf();
```
### sys_audlog.max_error_user_connect_times
用户登录失败次数的最大值界限，error_user_connect_times的最大取值，取值范围为[0,INT_MAX]，缺省为 2147483647。

设置密码连续最大失败次数为 6：
```sql
ALTER SYSTEM SET sys_audlog.error_user_connect_times = 6;
CALL sys_reload_conf();
```
### sys_audlog.error_user_connect_interval
用户被锁定时间，若用户被锁定的时间超过了该参数，则该用户可自动解锁。单位是分钟，取值范围为[0，INT_MAX]，缺省为 0。

设置被封锁用户的自动解封时间为 1 小时：
```sql
ALTER SYSTEM SET sys_audlog.error_user_connect_interval = 60;
CALL sys_reload_conf();
```

# 演示
在 kingbaseES 数据库中加载插件 sys_audlog：
```bash
## 检查当前 kes 是否配置 sys_audlog 插件
[kingbase@kes:/data]$ cat kingbase.conf | grep shared_preload_libraries
shared_preload_libraries = 'liboracle_parser, synonym, plsql, force_view, kdb_flashback,plugin_debugger, plsql_plugin_debugger, plsql_plprofiler, ora_commands,kdb_ora_expr, sepapower, dblink, sys_kwr, sys_spacequota, sys_stat_statements, backtrace, kdb_utils_function, auto_bmr, sys_squeeze, src_restrict'
## 未加载插件 sys_audlog
[kingbase@kes:/data]$ cat kingbase.conf | grep shared_preload_libraries | grep sys_audlog
[kingbase@kes:/data]$ 

## 修改 kingbase.conf 文件中 shared_preload_libraries 参数，加入 sys_audlog
[kingbase@kes:/data]$ vi kingbase.conf 
## 加入以下内容，sys_audlog 要拼接在 shared_preload_libraries 参数值中，以逗号分开
shared_preload_libraries = 'sys_audlog'

## 再次查看 kingbase.conf 文件
[kingbase@kes:/data]$ cat kingbase.conf | grep shared_preload_libraries | grep sys_audlog
shared_preload_libraries = 'liboracle_parser, synonym, plsql, force_view, kdb_flashback,plugin_debugger, plsql_plugin_debugger, plsql_plprofiler, ora_commands,kdb_ora_expr, sepapower, dblink, sys_kwr, sys_spacequota, sys_stat_statements, backtrace, kdb_utils_function, auto_bmr, sys_squeeze, src_restrict, sys_audlog'

## 重启数据库生效
[kingbase@kes:/home/kingbase]$ sys_ctl restart
sys_ctl: PID 文件 "/data/kingbase.pid" 不存在
服务器进程是否正在运行?
尝试启动服务器进程
等待服务器进程启动 ....2024-10-11 16:53:53.881 CST [3949] 日志:  sepapower extension initialized
2024-10-11 16:53:53.885 CST [3949] 日志:  正在启动 KingbaseES V008R006C007B0024 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 4.8.5 20150623 (Red Hat 4.8.5-28), 64-bit
2024-10-11 16:53:53.885 CST [3949] 日志:  正在监听IPv4地址"0.0.0.0"，端口 54321
2024-10-11 16:53:53.885 CST [3949] 日志:  正在监听IPv6地址"::"，端口 54321
2024-10-11 16:53:53.886 CST [3949] 日志:  在Unix套接字 "/tmp/.s.KINGBASE.54321"上侦听
2024-10-11 16:53:53.985 CST [3949] 日志:  日志输出重定向到日志收集进程
2024-10-11 16:53:53.985 CST [3949] 提示:  后续的日志输出将出现在目录 "sys_log"中.
 完成
服务器进程已经启动
```
在数据库中创建 sys_audlog：
```sql
test=# create extension sys_audlog;                    
CREATE EXTENSION
```
使用 sso 用户设置被封锁用户的自动解封时间为 1 分钟：
```sql
test=> \conninfo 
以用户 "sso" 的身份，通过套接字"/tmp"在端口"54321"连接到数据库 "test"
test=> ALTER SYSTEM SET sys_audlog.error_user_connect_interval = 1;
ALTER SYSTEM
test=> CALL sys_reload_conf();
 sys_reload_conf 
-----------------
 t
(1 行记录)

test=> show sys_audlog.error_user_connect_interval ;
 sys_audlog.error_user_connect_interval 
----------------------------------------
 1
(1 行记录)
```
📢注意：这个需要在 sso 用户进行设置，否则会报错没有权限：
```sql
test=# \conninfo                                                   
以用户 "system" 的身份，通过套接字"/tmp"在端口"54321"连接到数据库 "test"
test=# ALTER SYSTEM SET sys_audlog.error_user_connect_interval = 1;
错误:  权限不够
```
关于 sso 用户没有密码以及本地免密认证登录的方式可以参考：**[《KingbaseES KSQL 免密登录的几种方式》](https://www.modb.pro/db/1840302340634660864)**

使用 sso 用户设置密码连续最大失败次数为 3：
```sql
test=> ALTER SYSTEM SET sys_audlog.error_user_connect_times = 3;
ALTER SYSTEM
test=> CALL sys_reload_conf();
 sys_reload_conf 
-----------------
 t
(1 行记录)

test=> show sys_audlog.error_user_connect_times;
 sys_audlog.error_user_connect_times 
-------------------------------------
 3
(1 行记录)
```
创建一个用户：
```sql
test=# \conninfo 
以用户 "system" 的身份，通过套接字"/tmp"在端口"54321"连接到数据库 "test"

test=# create user lucifer with password 'lucifer';
CREATE ROLE
```
多次不使用密码连接用户，模拟登录失败：
```bash
[kingbase@kes:/home/kingbase]$ ksql -U lucifer -W test -p 54321 -h 127.0.0.1
口令：
ksql: 错误: 无法连接到服务器：致命错误:  password authentication failed for user "lucifer"
NOTICE:  This is the 1 login failed. There are 2 left.
[kingbase@kes:/home/kingbase]$ ksql -U lucifer -W test -p 54321 -h 127.0.0.1
口令：
ksql: 错误: 无法连接到服务器：致命错误:  password authentication failed for user "lucifer"
NOTICE:  This is the 2 login failed. There are 1 left.
[kingbase@kes:/home/kingbase]$ ksql -U lucifer -W test -p 54321 -h 127.0.0.1
口令：
ksql: 错误: 无法连接到服务器：致命错误:  The user "lucifer" is locked.please wait 1 minutes to retry
```
可以发现，用户输错密码连接 3 次之后，用户直接锁定 1 分钟，等待 1 分钟后，我们再次尝试输入密码：
```bash
# 如果输入的密码还是错误的，会再次锁定 1 分钟
[kingbase@kes:/home/kingbase]$ ksql -U lucifer -W test -p 54321 -h 127.0.0.1
口令：
ksql: 错误: 无法连接到服务器：致命错误:  The user "lucifer" is locked.please wait 1 minutes to retry
```
又等待 1 分钟后，输入正确的密码：
```bash
[kingbase@kes:/home/kingbase]$ ksql -U lucifer -W test -p 54321 -h 127.0.0.1
口令：
ksql (V8.0)
输入 "help" 来获取帮助信息.

test=> \conninfo 
以用户 "lucifer" 的身份, 在主机"127.0.0.1", 端口"54321"连接到数据库 "test"
```
可以正常登录。




