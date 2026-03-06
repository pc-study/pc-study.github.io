---
title: KCP 模拟题练习 16 - 控制文件丢失
date: 2024-10-08 17:32:11
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843574601202364416
---

【单选题】当 KES 实例正在运行时，控制文件丢失，此时执行 checkpoint 操作，会有怎样的结果？
 - [ ] checkpoint 执行正常
 - [x] 实例崩溃
 - [ ] checkpoint 执行失败，但是实例继续运行
 - [ ] 不能确定

**解题思路：**

# 介绍
KingbaseES 数据库的控制文件是记录数据库内部信息的重要文件，一但控制文件损坏，数据库将会宕机，且无法启动。

控制文件默认存放在数据文件目录下的 global 目录下：
```bash
[kingbase@kes:/home/kingbase]$ cd /data/global/
[kingbase@kes:/data/global]$ ll sys_control 
-rw------- 1 kingbase kingbase 8192 10月  8 16:00 sys_control
```
通过 `sys_controldata` 命令可以查看控制文件的内容：
```bash
[kingbase@kes:/home/kingbase]$ export KINGBASE_DATE=/data
[kingbase@kes:/home/kingbase]$ sys_controldata
sys_control 版本:                      1201
Catalog 版本:                         202211151
数据库系统标识符:                     7418197114018412488
数据库簇状态:                         在运行中
sys_control 最后修改:                  2024年10月08日 星期二 16时00分11秒
最新检查点位置:                       0/1CF23F0
最新检查点的 REDO 位置:               0/1CF23C0
最新检查点的重做日志文件: 000000010000000000000001
最新检查点的 TimeLineID:              1
最新检查点的PrevTimeLineID: 1
最新检查点的full_page_writes: 开启
最新检查点的NextXID:          0:1064
最新检查点的 NextOID:                 24576
最新检查点的NextMultiXactId: 1
最新检查点的NextMultiOffsetD: 0
最新检查点的oldestXID:            1032
最新检查点的oldestXID所在的数据库：1
最新检查点的oldestActiveXID:  1064
最新检查点的oldestMultiXid:  1
最新检查点的oldestMulti所在的数据库：1
最新检查点的oldestCommitTsXid:0
最新检查点的newestCommitTsXid:0
最新检查点的时间:                     2024年10月08日 星期二 16时00分07秒
不带日志的关系: 0/3E8使用虚假的LSN计数器
最小恢复结束位置: 0/0
最小恢复结束位置时间表: 0
开始进行备份的点位置:                       0/0
备份的最终位置:                  0/0
需要终止备份的记录:        否
wal_level设置：                    replica
wal_log_hints设置：        关闭
max_connections设置：   100
max_worker_processes设置：   8
max_wal_senders设置:              10
max_prepared_xacts设置：   0
max_locks_per_xact设置：   64
track_commit_timestamp设置:        关闭
最大数据校准:     8
数据库块大小:                         8192
大关系的每段块数:                     131072
WAL的块大小:    8192
每一个 WAL 段字节数:                  16777216
标识符的最大长度:                     64
在索引中可允许使用最大的列数:    32
TOAST区块的最大长度:                1988
大对象区块的大小:         2048
日期/时间 类型存储:                   64位整数
正在传递Flloat4类型的参数:           由值
正在传递Flloat8类型的参数:                   由值
数据页校验和版本:  0
当前身份验证:            c4e1fd6b06f9a8aed87af6ecd6fe351980a0c2d5377215695d959f1af2a2b0a5
数据库模式：                        1
身份验证方法模式：                     0
```
控制文件中记录内容如下：
- 建库时生成的静态信息：初始化数据库时产生，固定不变，无需手动维护。
- kingbase.conf 中的配置信息：conf 中的相关参数被修改，会自动更新控制文件，无需手动维护。
- wal 以及 checkpoint 的动态信息：当发生检查点、日志切换等操作，则会自动更新控制文件，无需手动维护。

注意：KES 中的控制文件路径不能改变。

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

# 模拟破坏控制文件
登录数据库，对一张测试表 test 插入数据：
```sql
test=# \c test system 
您现在已经连接到数据库 "test",用户 "system".
test=# \d test         
           数据表 "public.test"
 栏位 |  类型   | 校对规则 | 可空的 | 预设 
------+---------+----------+--------+------
 id   | integer |          |        | 
索引：
    "idx_test_id" btree (id)
-- 插入一条数据
test=# insert into test values (1); 
INSERT 0 1
-- 人为删除控制文件 /data/global/sys_control
test=# \! rm /data/global/sys_control
-- 插入第二条数据，可以成功插入
test=# insert into test values (2);  
INSERT 0 1
-- 可以成功查询，说明删除之后不影响正常的 DML 操作，必须要触发检查点才会报错
test=# select * from test;
 id 
----
  1
  2
(2 行记录)
-- 但是手动触发检查点之后，数据库宕机了
test=# checkpoint;
警告:  中断联接, 因为其它服务器进程崩溃
描述:  The kingbase has commanded this server process to roll back the current transaction and exit, because another server process exited abnormally and possibly corrupted shared memory.
提示:  一会儿你将可以重联接数据库并且重复你的命令.
服务器意外地关闭了联接
        这种现象通常意味着服务器在处理请求之前
或者正在处理请求的时候意外中止
```
此时尝试启动数据库，会提示无法找到控制文件，启动失败：
```bash
[kingbase@kes:/home/kingbase]$ sys_ctl start
sys_ctl: 其他服务器进程可能正在运行; 尝试启动服务器进程
等待服务器进程启动 ....kingbase: 无法找到数据库系统
预期在目录 "/data" 找到,
但是无法打开文件 "/data/global/sys_control": 没有那个文件或目录
 已停止等待
sys_ctl: 无法启动服务器进程
检查日志输出.
```
这里我们已经得到答案了，当控制文件被破坏后，手动触发检查点，实例会直接崩溃。

