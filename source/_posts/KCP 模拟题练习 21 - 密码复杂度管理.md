---
title: KCP 模拟题练习 21 - 密码复杂度管理
date: 2024-10-12 11:29:20
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1844940992526512128
---

【单选题】KES 密码复杂度管理需要安装什么插件？
 - [ ] password
 - [ ] check
 - [x] passwordcheck
 - [ ] checkpassword

**解题思路：**

# 口令的复杂度管理
口令的复杂度检查是由数据库管理员对口令的最小长度，所包含的数字、英文字母、特殊符号的数目进行设置后，在创建和修改用户时，自动对口令进行相关方面的检查。如果口令不满足指定的条件，那么创建用户将不成功。

KingbaseES 通过插件的方式来进行口令的复杂度管理。这种方式更为灵活，当数据库的实用场景需要进行口令的复杂度管理时，加载插件即可。而不需要该功能时，卸载插件即可。

KingbaseES 中通过 4 个全局级参数配合插件来实现用户口令复杂度管理。

## 加载插件
修改 kingbase.conf 文件中 shared_preload_libraries 参数后重启数据库，创建插件并打开密码复杂度开关：
```bash
[kingbase@kes:/home/kingbase]$ cat /data/kingbase.conf | grep shared_preload_libraries | grep passwordcheck
[kingbase@kes:/home/kingbase]$ vi /data/kingbase.conf
## 在 shared_preload_libraries 中拼接 passwordcheck，以逗号隔开
shared_preload_libraries = 'passwordcheck'

[kingbase@kes:/home/kingbase]$ cat /data/kingbase.conf | grep shared_preload_libraries | grep passwordcheck
shared_preload_libraries = 'liboracle_parser, synonym, plsql, force_view, kdb_flashback,plugin_debugger, plsql_plugin_debugger, plsql_plprofiler, ora_commands,kdb_ora_expr, sepapower, dblink, sys_kwr, sys_spacequota, sys_stat_statements, backtrace, kdb_utils_function, auto_bmr, sys_squeeze, src_restrict, sys_audlog, passwordcheck'

## 重启数据库生效配置
[kingbase@kes:/home/kingbase]$ sys_ctl restart
等待服务器进程关闭 .... 完成
服务器进程已经关闭
等待服务器进程启动 ....2024-10-12 11:25:55.092 CST [33325] 日志:  sepapower extension initialized
2024-10-12 11:25:55.128 CST [33325] 日志:  正在启动 KingbaseES V008R006C007B0024 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 4.8.5 20150623 (Red Hat 4.8.5-28), 64-bit
2024-10-12 11:25:55.128 CST [33325] 日志:  正在监听IPv4地址"0.0.0.0"，端口 54321
2024-10-12 11:25:55.128 CST [33325] 日志:  正在监听IPv6地址"::"，端口 54321
2024-10-12 11:25:55.129 CST [33325] 日志:  在Unix套接字 "/tmp/.s.KINGBASE.54321"上侦听
2024-10-12 11:25:55.232 CST [33325] 日志:  日志输出重定向到日志收集进程
2024-10-12 11:25:55.232 CST [33325] 提示:  后续的日志输出将出现在目录 "sys_log"中.
 完成
服务器进程已经启动
```
数据库中创建 passwordcheck 插件，使用 sso 用户执行：
```sql
test=> create extension passwordcheck;
CREATE EXTENSION

## 密码复杂度开关，默认为关闭状态
test=> show passwordcheck.enable;
 passwordcheck.enable 
----------------------
 off
(1 行记录)

## 开启密码复杂度
test=> alter system set passwordcheck.enable=on;
ALTER SYSTEM

test=> select sys_reload_conf();
 sys_reload_conf 
-----------------
 t
(1 行记录)

test=> show passwordcheck.enable;
 passwordcheck.enable 
----------------------
 on
(1 行记录)
```
## 卸载插件
修改 kingbase.conf 文件中 shared_preload_libraries 参数后重启数据库。