---
title: GBase 8s 数据库 dbaccess 以及 GBaseDataStudio 使用
date: 2024-10-11 15:41:43
tags: [墨力计划,gbase 8s]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1844611628836417536
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习国产数据库路上的知识和经验。

@[TOC](目录)

# 前言
数据库安装后通常会提供一个命令行客户端工具，比如：
- Oracle 数据库的 `sqlplus`
- KingbaseES 数据库的 `ksql`
- 达梦数据库的 `disql`

类似的客户端工具还有很多，不再一一列举。

本文主要介绍 GBase 8s 数据库中的 dbaccess 客户端工具的使用。

# 介绍
dbaccess 是 GBase 8s 数据库的一个命令行客户端工具，用来与 GBase 8s 数据库服务器进行交互。

GBase 8s 数据库安装完成后默认包含 dbaccess 工具，在 gbasedbt 用户下输入 dbaccess 即可使用（前提是需要配置好环境变量）：
```bash
[gbasedbt@gbase8s ~]$ dbaccess - -
Your evaluation license will expire on 2025-10-10 00:00:00
> 
```
dbaccess 识别用户输入，将用户输入的 SQL 语句打包发送给 GBase 8s 数据库服务器执行，并接收服务器的执行结果，并按用户的要求将执行结果展示给用户。

# dbaccess
dbaccess 有三种交互方式：
- 菜单交互模式
- 指令交互模式
- 非交互模式

## 菜单交互模式
dbaccess 提供了一个基于控制台的菜单，用户可以使用方向键或快捷键，选择和执行相应的功能。

直接运行 dbaccess 命令，即可进入菜单的交互模式：
```bash
[gbasedbt@gbase8s ~]$ dbaccess
Your evaluation license will expire on 2025-10-10 00:00:00

## 跳转出如下页面
DBACCESS:   Query-language  Connection  Database  Table  Session  Exit
Use SQL query language.

------------------------------------------------ Press CTRL-W for Help --------
```

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844647504372137984_395407.png)

这种方式以前没怎么接触过，下面演示一下使用方式：

创建数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844624908862713856_395407.png)

选择创建：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844624976441339904_395407.png)

输入数据库名称：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844625165935800320_395407.png)

这一步可以配置数据库选项，默认不修改可以直接退出：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844625851172880384_395407.png)

确认是否创建数据库 lucifer：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844625722168672256_395407.png)

查看创建好的数据库信息：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844626312230694912_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844626728263708672_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844626791628111872_395407.png)

使用 `ctrl+z` 可以直接退出菜单交互模式：
```bash
[gbasedbt@gbase8s ~]$ dbaccess
Your evaluation license will expire on 2025-10-10 00:00:00

[2]+  Stopped                 dbaccess
```

## 指令交互模式
dbaccess 提供了一个类似 mysq l或 sqlplus 的客户端交互模式，用户输入要执行的指令并回车，dbaccess 执行用户输入的指令，并返回执行结果。

可以通过为 dbaccess 提供两个参数，进入指令交互模式：
```bash
dbaccess <param1> <param2>
param1：提供数据库名称或 -，当该参数为 - 时，表示未选择默认的数据库，后续可在 dbaccess 中，使用 database <db_name> 指定当前数据库。
param2：固定为 -，表示 dbaccess 的输入为标准输入 STDIN。
```
使用 dbaccess 连接数据库：
```bash
[gbasedbt@gbase8s ~]$ dbaccess - -
Your evaluation license will expire on 2025-10-10 00:00:00
## 选择数据库
> database lucifer;

Database selected.

Elapsed time: 0.031 sec

## 创建一张测试表
> create table test(id int, name varchar2(20));

Table created.

Elapsed time: 0.002 sec

## 插入一条数据
> insert into test values (1,'lucifer');

1 row(s) inserted.

Elapsed time: 0.002 sec

## 查询测试表数据
> select * from test;


         id name                 

          1 lucifer             

1 row(s) retrieved.

Elapsed time: 0.002 sec

## 删除测试表
> drop table if exists test;

Table dropped.

Elapsed time: 0.003 sec

## ctrl+d 可以命令交互模式

> 

Database closed.
```
看起来就是一个简陋的客户端工具，命令行需要以 `;` 结束，没有找到 help 帮助信息以及合理的退出命令。

## 非交互模式
### 管道模式
dbaccess 可以接收 STDIN 中的内容，做为 dbaccess 需要执行的指令：
```bash
[gbasedbt@gbase8s ~]$ echo "select trim(name) db_name from sysdatabases where name = 'lucifer';" | dbaccess sysmaster
Your evaluation license will expire on 2025-10-10 00:00:00

Database selected.




db_name  lucifer

1 row(s) retrieved.

Elapsed time: 0.002 sec



Database closed.
```

### 脚本模式
dbaccess 也可以将 SQL 代码保存到文件中，将文件做为 dbaccess 的第二个参数，来执行文件中的 SQL 代码：
```bash
dbaccess <db_name> <sql_file>
```
创建一个 sql 脚本：
```bash
[gbasedbt@gbase8s ~]$ cat<<-EOF>test.sql
database lucifer;
create table test(id int, name varchar(20));
insert into test values(1, 'lucifer');
select * from test;
drop table if exists test;
EOF
```
执行脚本：
```bash
[gbasedbt@gbase8s ~]$ dbaccess - test.sql
Your evaluation license will expire on 2025-10-10 00:00:00

Database selected.

Elapsed time: 0.028 sec


Table created.

Elapsed time: 0.001 sec


1 row(s) inserted.

Elapsed time: 0.001 sec



         id name                 

          1 lucifer             

1 row(s) retrieved.

Elapsed time: 0.001 sec


Table dropped.

Elapsed time: 0.001 sec


Database closed.
```
也可以使用 EOF 的方式：
```bash
[gbasedbt@gbase8s ~]$ dbaccess sysmaster -  << EOF
select * from sysdbslocale where dbs_dbsname='lucifer';
EOF

Your evaluation license will expire on 2025-10-10 00:00:00

Database selected.




dbs_dbsname  lucifer
dbs_collate  zh_CN.57372

1 row(s) retrieved.

Elapsed time: 0.004 sec



Database closed.
```
个人还是比较喜欢这种方式。

# GBaseDataStudio
dbaccess 客户端有点不太好用，好在官方还提供了一个图形化客户端工具：GBaseDataStudio，可以在官方直接下载 [GBaseDataStudio](https://www.gbase.cn/download/gbase-8s-1?category=TOOLKIT)：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844642172317040640_395407.png)

下载之后解压即可，无需安装，直接可以运行，输入数据库的连接信息后测试连接：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844641744451895296_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844642985135407104_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844643082929799168_395407.png)

一直下一步，确认没问题之后，就可以对连接的数据库进行操作了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241011-1844643454662574080_395407.png)

具体大家可以自行探索，不再一一演示。

# 写在最后
对了，dbaccess 工具也可以和 rlwrap 插件（上下文翻页）配合使用，操作更方便。