---
title: KCP 模拟题练习 18 -  控制文件冗余 control_file_copy
date: 2024-10-11 16:30:51
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1844656312494424064
---

【单选题】哪个参数可以实现控制文件冗余，达到多路复用的效果？
 - [ ] control_file_duplicate
 - [x] control_file_copy
 - [ ] controlfile_copy
 - [ ] control_file_mirror

**解题思路：**

前文 **[KCP 模拟题练习 16](https://www.modb.pro/db/1843574601202364416)** 演示了如何维护和破坏控制文件，这一题就接着来演示如何恢复控制文件。

# 备份控制文件
控制文件无法手动修改，无法单独备份，只能在使用 sys_rman、sys_basebackup 备份数据库时一起备份控制文件。

启动、关闭和恢复数据库时需要读取控制文件中的相关信息。

通过参数 `control_file_copy` 可以实现控制文件冗余(多路复用)：
```sql
-- 参数 control_file_copy 默认不启用
test=# show control_file_copy;
 control_file_copy 
-------------------
 
(1 行记录)
```
启用 control_file_copy：
```bash
## 使用 root 用户创建目录 /cf_copy 并设置目录权限
[root@kes ~]# mkdir -p /cf_copy
[root@kes ~]# chown kingbase:kingbase /cf_copy
[root@kes ~]# chmod 700 /cf_copy
[root@kes ~]# su - kingbase

## 查看配置参数示例
[kingbase@kes:/data]$ cat kingbase.conf | grep control_file_copy
# control_file_copy = ''                        #example: control_file_copy = 'filepath/filename'
                                                #control_file_copy = 'filepath1/filename1;filepath2/filename2'

## 配置 kingbase.conf 文件，这里复制 2 份
[kingbase@kes:/data]$ cat<<-EOF>>/data/kingbase.conf
control_file_copy='/cf_copy/sys_control_1;/cf_copy/sys_control_2'
EOF

## 查看配置后的参数值
[kingbase@kes:/data]$ grep -v "^\s*\(#\|$\)" /data/kingbase.conf | grep control_file_copy
control_file_copy='/cf_copy/sys_control_1;/cf_copy/sys_control_2'

## 重启数据库
[kingbase@kes:/data]$ sys_ctl restart
等待服务器进程关闭 .... 完成
服务器进程已经关闭
等待服务器进程启动 ....2024-10-08 17:10:40.808 CST [9023] 日志:  sepapower extension initialized
2024-10-08 17:10:40.812 CST [9023] 日志:  正在启动 KingbaseES V008R006C007B0024 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 4.8.5 20150623 (Red Hat 4.8.5-28), 64-bit
2024-10-08 17:10:40.812 CST [9023] 日志:  正在监听IPv4地址"0.0.0.0"，端口 54321
2024-10-08 17:10:40.812 CST [9023] 日志:  正在监听IPv6地址"::"，端口 54321
2024-10-08 17:10:40.813 CST [9023] 日志:  在Unix套接字 "/tmp/.s.KINGBASE.54321"上侦听
2024-10-08 17:10:40.914 CST [9023] 日志:  日志输出重定向到日志收集进程
2024-10-08 17:10:40.914 CST [9023] 提示:  后续的日志输出将出现在目录 "sys_log"中.
 完成
服务器进程已经启动
```
验证参数生效：
```sql
test=# show control_file_copy;
               control_file_copy               
-----------------------------------------------
 /cf_copy/sys_control_1;/cf_copy/sys_control_2
(1 行记录)
```
查看控制文件：
```bash
[kingbase@kes:/home/kingbase]$ ll /cf_copy/*
-rw------- 1 kingbase kingbase 8192 10月  8 17:10 /cf_copy/sys_control_1
-rw------- 1 kingbase kingbase 8192 10月  8 17:10 /cf_copy/sys_control_2
```
可以看到数据库配置已经生效，现在有 3 份控制文件。

