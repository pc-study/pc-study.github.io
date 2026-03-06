---
title: Oracle spfile 参数文件
date: 2021-09-18 21:09:36
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/111625
---

@[TOC](目录)
# 📚 前言
上篇讲了 [Oracle pfile 参数文件](https://luciferliu.blog.csdn.net/article/details/120198832) ，这篇讲讲 spfile 参数文件！

Oracle数据库启动时，第一步开启到nomount状态，需要使用到参数文件。

spfile 也是参数文件的一种，全称：**服务器参数文件（Server Parameter Files）**！

# ☀️ spfile 介绍
**spfileSID.ora 文件就是 spfile 参数文件，是二进制文件。**

从 Oracle 9i 开始，Oracle 引入 `spfile` 文件，使用spfile用户可以通过 ALTER SYSTEM 或者 ALTER SESSION 来修改参数，而不再需要通过手工修改。

**<font color='orage'>使用 spfile 参数文件有以下好处：</font>**
- 动态参数的更改可以立即生效，用户可以选择使更改只应用于当前实例还是应用到spfile，或者都应用；
- 可以彻底告别手工修改初始化参数文件，也就大大减少了人为错误的发生；
- spfile 是一个二进制文件，可以使用rman进行备份，增加数据库的安全，便于恢复；

所以，现在**基本都是默认使用 spfile 来启动数据库**，但是如果由于 spfile 修改参数数据库无法启动时，就只能使用 pfile 修改参数进行启动。

**<font color='orage'>如何查看当前数据库使用的是不是 spfile 启动？</font>**

连接数据库之后，执行以下命令：
```sql
show parameter spfile
```
![](https://img-blog.csdnimg.cn/img_convert/69b406608e1b4fd3a61a9698cc5e5b51.png)

如果以下框选的地方不为空，则代表当前数据库使用 spfile 启动，否则是 pfile 启动。

# ⭐️ spfile 参数文件位置
单机数据库，spfile 参数文件通常存在于以下目录下：
- **Windows：** $ORACLE_HOME/database
- **Linux：** $ORACLE_HOME/dbs

RAC 集群，spfile 通常是存放在 ASM 磁盘中，以上目录仅存放 pfile 文件。
![](https://img-blog.csdnimg.cn/img_convert/2fbbd9c9475a8052c21800acde8ceac1.png)
>- **pfile 文件格式为：**`initSID.ora`
>- **spfile 文件格式为：**`spfileSID.ora`

# 🌛 启动优先级

如果同时有 pfile 和 spfile 文件，数据库启动的优先级是如何的？

![](https://img-blog.csdnimg.cn/img_convert/00d35563158a84fa305cd742efb3c97f.png)

**官方说法： `spfileSID.ora > initorcl.ora`**

**<font color='red'>⭐️ 拓展：</font>** 

我看到网上一个有趣的说法，如果使用 spfileSID.ora 文件复制出一个 spfile.ora 文件，那么优先级顺序是：`spfileSID.ora > spfile.ora > initorcl.ora`。

**<font color='orage'>所以，我做了个小测试：</font>**

**1、首先关闭数据库：**
```bash
sqlplus / as sysdba
shutdown immediate
exit
```
![](https://img-blog.csdnimg.cn/img_convert/fb6bafe7a48ca9706235e44a8d2648e1.png)
**2、从 spfileSID.ora 复制一个 spfile.ora 文件：**
```bash
cd $ORACLE_HOME/dbs
cp spfileorcl.ora spfile.ora
```
![](https://img-blog.csdnimg.cn/img_convert/d88c5970e584acab39fb1c45e5a1c921.png)

3、重新启动数据库
```bash
sqlplus / as sysdba
startup
show parameter spfile
```
![](https://img-blog.csdnimg.cn/img_convert/14d4c3e5fe787f92cc777bec980a54b5.png)

从上图可以看出，优先级最高的是 spfileSID.ora，验证没有问题。

4、删除 spfileSID.ora 文件，重启数据库
```
cd $ORACLE_HOME/dbs
rm -rf spfileorcl.ora
sqlplus / as sysdba
shutdown immediate
startup
show parameter spfile
```
![](https://img-blog.csdnimg.cn/img_convert/d59ee025a4cc24dbe5ca70684f58c6a7.png)
根据上图所示，居然真的优先识别到的是 spfile.ora 文件，那就有一个问题，如果是随便 export 一个 ORACLE_SID，是不是也能启动呢？

5、先关闭当前数据库，设置一个新的 ORACLE_SID，启动数据库
```bash
export ORACLE_SID=lucifer
sqlplus / as sysdba
startup
```
![](https://img-blog.csdnimg.cn/img_convert/75a47c4967d5af52c6e208f3e68dfb75.png)

根据上图实验，实例名为 lucifer，数据库也是可以成功启动😂。

所以，如果 ORACLE_SID 设置错误的情况下，如果存在 spfile.ora 文件，那么优先级会跳过 spfileSID.ora 文件，直接优先选择 spfile.ora 文件来启动数据库。

6、最后删除所有 spfile 文件，重启数据库

```bash
source ~/.bash_profile
rm -rf spfile*
sqlplus / as sysdba
shutdown immediate
startup
```
![](https://img-blog.csdnimg.cn/img_convert/c680482def9fe6bcd722e30e74edfe93.png)

当没有 spfile 文件时，最后只能选择 initSID.ora 文件来进行启动数据库。

**<font color='orage'>因此，优先级顺序：`spfileSID.ora > spfile.ora > initorcl.ora` 是没有问题的。</font>**

# ❄️ 实例讲解
## ① 从 pfile 切换为 spfile 启动数据库

有一些特殊情况下需要切换使用参数文件，如何切换使用 pfile 和 spfile？

**1、首先，使用 pfile 参数文件启动数据库：**
```bash
sqlplus / as sysdba
startup pfile=$ORACLE_HOME/dbs/initorcl.ora
```
![](https://img-blog.csdnimg.cn/img_convert/7c6c575eaa4700cef147392741eba9c3.png)

**2、为了测试会生成 spfile 参数文件，我提前删除它：**

![](https://img-blog.csdnimg.cn/img_convert/79d17d81a9fdc5c6d8b40f4d044b83c4.png)

**3、确保当前数据库环境是由 pfile 文件启动，连接 sqlplus：**
```bash
sqlplus / as sysdba
create spfile from pfile;
```
![](https://img-blog.csdnimg.cn/img_convert/c30edd4e6f19ccd26a0bbd8278fcbbdf.png)

执行以上命令，可以根据 pfile 生成 spfile 文件，保存在默认的参数文件目录下。

**4、重启数据库，默认会使用 spfile 文件启动：**
```bash
sqlplus / as sysdba
shutdown immediate
startup
```
![image.png](https://img-blog.csdnimg.cn/img_convert/51b697ccce979586a5180e09b445382a.png)

此时，数据库已经使用 spfile 启动。

## ② 使用 spfile 启动数据库后修改参数错误，导致数据库无法启动

**<font color='orage'>一般什么情况下必须用到 pfile 参数文件？</font>**

### 问题重现
比如，你在数据库中通过 alter system 设置了数据库参数，关闭数据库后，重新打开数据库时报错无法打开。

![](https://img-blog.csdnimg.cn/img_convert/64f12cc38eee9bf6dae66002ccd4184b.png)

此时，由于 spfile 是二进制文件，无法直接打开修改，因此需要通过手动生成 pfile 文件进行修改启动。

### 解决步骤

**1、手动生成 pfile 文件**
```bash
sqlplus / as sysdba
create pfile from spfile;
```
![](https://img-blog.csdnimg.cn/img_convert/b2fa6c37f40f41a1c562c5a7a05092b2.png)

**注意：以上命令可以在未开启数据库时进行执行，pfile生成路径也可以指定：pfile=生成路径/pfile文件名。**

**2、编辑 pfile 文件，修改错误设置的参数**
```bash
cd $ORACLE_HOME/dbs
vi initorcl.ora
```
![](https://img-blog.csdnimg.cn/img_convert/6d8f535e534c6867139a41e9fef34636.png)

打开之后，修改 processes 参数为正确✅的数值即可。

**3、使用修改后的 pfile 参数文件启动数据库**
```bash
sqlplus / as sysdba
startup pfile=$ORACLE_HOME/dbs/initorcl.ora
```
![](https://img-blog.csdnimg.cn/img_convert/426ad62d482f39f79bbe6efc34748d23.png)

此时，数据库已经成功打开。

**4、数据库启动成功后，切换回 spfile 重新启动数据库**
由于当前数据库是使用 pfile 进行启动，需要修改为spfile启动。
```bash
sqlplus / as sysdba
create spfile from pfile;
```
![](https://img-blog.csdnimg.cn/img_convert/a821f6655933e459610b424bbb0e884e.png)

修改完之后，重启数据库生效：
```bash
sqlplus / as sysdba
shutdown immediate
startup
```
![](https://img-blog.csdnimg.cn/img_convert/24f269e724648f957d5704f0bb9976b3.png)

如上，数据库已经成功恢复为 spfile 启动，并且当前数据库参数也是正确的。

**5、注意点**

如果是 RAC 集群操作时，由于 RAC 的 spfile 文件是保存在 ASM 磁盘中，所以是跟 pfile 文件配合进行使用。

**比如，下方的 RAC 集群示例：**
```bash
# ASM磁盘下的 spfile 文件
ASMCMD> pwd
+data/orcl
ASMCMD> ls spfile*
spfileorcl.ora

# 一节点 ORACLE_HOME/dbs 目录下的 pfile 文件
[oracle@orcl1 dbs]$ cat initorcl1.ora 
SPFILE='+DATA/orcl/spfileorcl.ora'
```

通过上述示例可以发现，RAC 实际上使用的还是 pfile 去启动的，但是将 spfile 路径写在 pfile 文件中。

**❤️ 注意：** 

因此，在最后生成 spfile 时，需要手动指定 spfile 的路径为 ASM 磁盘中的路径！ 

**需要注意 $ORACLE_HOME/dbs 目录下不能存在 spfile[ORACLE_SID].ora 文件**，否则启动时优先选择 $ORACLE_HOME/dbs 下的 spfile 文件。

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️