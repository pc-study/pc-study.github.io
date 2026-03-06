---
title: 甩锅篇：Oracle 数据库特殊字符 ™ 乱码问题
date: 2025-02-17 10:52:19
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1891306653245517824
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)


# 前言
今天有个朋友说他们有套 Oracle 19C 数据库，数据库字符集为 `ZHS16GBK`，应用系统查询数据时，有个特殊字符 **™** 有时候正常显示，有时候又会显示乱码，非常诡异，**开发硬要说是数据库字符集有问题**，需要帮忙排查一下问题（**甩锅**）。

本文记录一下问题分析过程，并使用测试环境复现一下问题。

# 问题描述
首先展示问题，使用 PLSQL 查询发现数据时显示乱码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250214-1890270178378788864_395407.png)

正常应该显示为：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250214-1890270270598950912_395407.png)

查看数据库字符集：
```bash
SQL> set line2222 pages1000
col parameter for a30
col value for a20
select * from nls_database_parameters where parameter='NLS_CHARACTERSET';

PARAMETER                      VALUE
------------------------------ --------------------
NLS_CHARACTERSET               ZHS16GBK
```
我初步怀疑有可能是 **客户端字符集** 配置有问题，为了确认这个问题，直接在数据库本地 sqlplus 查询看看：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891304545607757824_395407.png)

结果发现还是乱码，查看一下数据库主机的客户端字符集：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891304162617470976_395407.png)

数据库主机没有设置客户端字符集，如果没有设置 **NLS_LANG** 环境变量，Oracle 客户端会默认使用操作系统的默认字符集。

在 Unix/Linux 系统中，默认字符集通常与系统的 `locale` 设置相关：
```bash
[oracle@orcl19c:/home/oracle]$ locale
LANG=en_US.UTF-8
LC_CTYPE="en_US.UTF-8"
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="en_US.UTF-8"
LC_NAME="en_US.UTF-8"
LC_ADDRESS="en_US.UTF-8"
LC_TELEPHONE="en_US.UTF-8"
LC_MEASUREMENT="en_US.UTF-8"
LC_IDENTIFICATION="en_US.UTF-8"
LC_ALL=
```
比如系统的 locale 设置为 `en_US.UTF-8`，则客户端的字符集可能会默认为 AL32UTF8 或 UTF-8，此时与我们的数据库字符集明显不匹配，此时插入数据时就可能会造成乱码问题。

这里我尝试将客户端字符集修改成：`AMERICAN_AMERICA.ZHS16GBK`：
```bash
export NLS_LANG=AMERICAN_AMERICA.ZHS16GBK
```
再次查询，可以发现结果依然显示乱码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891306021642055680_395407.png)

**这是为什么呢？** 我明明已经把客户端字符集已经修改成正确的了。
>**问题原因**：当 NLS_LANG 设置错误时，数据库会以错误的字符集存储数据，导致特殊字符 ™ 变为乱码 ???，这是一个**不可逆**的行为。即使后续修改为正确的 NLS_LANG，新的数据会正确存储，但已存储的乱码数据无法自动恢复，因为字符已经以错误的编码方式存储。

其实问题分析到这里，基本已经能确定问题所在了。
1. **为什么特殊字符 ™ 有时候会变成乱码 ??? 字符？**
2. **为什么特殊字符 ™ 有时候又显示正常？**

这里我先不说答案，下面我用测试环境复现一下整个过程，大家就能明白了。

# 环境准备
环境信息如下：

|主机名|服务IP|主机版本|CPU|内存|系统盘|Oracle版本|字符集|
|--|--|--|--|--|--|--|--|
|orcl19c|192.168.6.154|rhel8.10|x86_64|8G|100G|19C|ZHS16GBK|

使用开源版 **Oracle 一键安装脚本** 安装一套 19C 数据库，Oracle 一键安装脚本是托管于 Gitee 代码平台：
>脚本下载地址：[https://gitee.com/luciferlpc/OracleShellInstall](https://gitee.com/luciferlpc/OracleShellInstall)

**⭐️ 使用教程可以参考**：[2025 年宣布一件大事，Oracle 一键安装脚本开源了！](https://www.modb.pro/db/1878623781711785984)

执行一键安装：
```bash
./OracleShellInstall -lf ens192 `# 主机网卡名称`\
-n orcl19c `# 主机名`\
-op oracle `# 主机 oracle 用户密码`\
-d /u01 `# Oracle 软件安装基础目录`\
-ord /oradata `# 数据库文件存放目录`\
-o lucifer `# 数据库名称`\
-dp oracle `# sys/system 用户密码`\
-ds ZHS16GBK `# 数据库字符集`\
-ns AL16UTF16 `# 国家字符集`\
-redo 100 `# 在线重做日志大小（M）`\
-opd Y `# 是否优化数据库`
```
执行后选择对应需要安装的模式以及版本即可安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250214-1890283128955088896_395407.png)

等待重启后，数据库就已经安装完成了！测试环境已经准备好了，接下来先回溯一下问题分析过程。

# 问题复现
首先确认一下安装好的数据库字符集是 ZHS16GBK：
```sql
SQL> set line2222 pages1000
col parameter for a30
col value for a20
select * from nls_database_parameters where parameter='NLS_CHARACTERSET';

PARAMETER                      VALUE
------------------------------ --------------------
NLS_CHARACTERSET               ZHS16GBK
```

然后，我们把测试表创建好：
```sql
## 创建测试表
SQL> create table test (id int, ename varchar2(50));

Table created.
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891312261709443072_395407.png)

**📢 注意**：使用脚本安装好的数据库主机，会在 `/home/oracle/.bash_profile` 文件中自动配置好客户端字符集：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891311499197558784_395407.png)

模拟测试数据插入：
```sql
SQL> insert into test values(1,'Pierce™ Dilution-Free™ Rapid Gold BCA Protein');

1 row created.

SQL> commit;

Commit complete.
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891312649414127616_395407.png)

此时，查看测试数据的特殊符号 ™ 是否会显示为乱码：
```sql
SQL> select ename from test;

        ID TEXT
---------- --------------------------------------------------
         1 Pierce™ Dilution-Free™ Rapid Gold BCA Protein
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891312736575959040_395407.png)

可以发现没有显示为乱码，为什么呢？
>当设置 `NLS_LANG=AMERICAN_AMERICA.ZHS16GBK` 后，客户端知道它应该使用 ZHS16GBK 字符集来解码字符数据，因此能够正确显示 ™ 字符。

这就是为什么特殊字符 ™ 有时候显示正常的原因，客户端字符集与数据库字符集相匹配，设置对了就能正确存储，正常显示嘛！

这个好解释，那么问题来了，**为什么特殊字符 ™ 有时候会变成乱码 ??? 字符？** 别急，接着看！

首先，我们先将客户端字符集配置取消，或者设置为一个错误的客户端字符集：
```bash
## 我这里修改为一个错误的客户端字符集
[oracle@orcl19c:/home/oracle]$ export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
[oracle@orcl19c:/home/oracle]$ echo $NLS_LANG
AMERICAN_AMERICA.AL32UTF8
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891314350552526848_395407.png)

再次插入测试数据：
```sql
SQL> insert into test values(2,'Pierce™ Dilution-Free™ Rapid Gold BCA Protein');

1 row created.

SQL> commit;

Commit complete.
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891314824726982656_395407.png)

再次查询测试结果：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891314903437291520_395407.png)

显示乱码了，但是有朋友说，你这也不是一开始问题里的 ??? 啊！行，那就再测试一下取消客户端字符集：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891315680503410688_395407.png)

再次插入测试数据：
```sql
SQL> insert into test values(3,'Pierce™ Dilution-Free™ Rapid Gold BCA Protein');

1 row created.

SQL> commit;

Commit complete.
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891315844622331904_395407.png)

再次查询测试结果：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891315999941603328_395407.png)

好嘛！三个问号来了。

此时，即使我们把客户端字符集恢复正确：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891316506798075904_395407.png)

再次查询：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250217-1891316602000388096_395407.png)

可以发现，三行数据的查询结果截然不同！这是不是就还原出来了：
1. **为什么特殊字符 ™ 有时候会变成乱码 ??? 字符？**
2. **为什么特殊字符 ™ 有时候又显示正常？**

说回到一开始发的问题截图：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250214-1890270178378788864_395407.png)

哎，乱码是**一个问号 ?**，那你客户端字符集八成是设置成 `AMERICAN_AMERICA.AL32UTF8` 了吧！

# 写在最后
所以，问题的关键还是在于 **客户端字符集** 的设置是否正确 ✅，**那这锅，DBA 可不接了**！爱谁接谁接吧~


---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)