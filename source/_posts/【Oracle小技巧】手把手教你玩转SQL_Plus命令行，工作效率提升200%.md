---
title: 【Oracle小技巧】手把手教你玩转SQL*Plus命令行，工作效率提升200%
date: 2021-07-16 22:06:25
tags: [dba,sqlplus]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/84720
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
经常使用Oracle数据库的朋友，应该对SQL*Plus这个命令行工具不会陌生。每天工作都离不开它，但是这个工具有些缺点：
- Linux系统下SQL*PLUS无法上下文查看历史命令，敲错命令需要按住Ctrl才能删除
- SQL查询，输出结果格式错乱，每次都需要手动SET调整
- 当前会话不显示实例名和登录用户，提示不人性化

**注意：以上问题均为SQLPlus默认配置下。**

**<font color='blue'>那么问题来了，这些都可以解决吗？当然，我写这篇就是为了介绍如何优化SQL*Plus命令行嘛！</font>**

首先介绍下，主要分两个部分：
>- **上下文切换：rlwrap + readline**
>- **优化输出格式：glogin.sql**

# SQL*Plus优化
## 1 上下文切换 rlwrap
- **相信大家在Linux主机使用SQL*Plus命令行工具时，经常会遇到命令输错不好回退，或者刚输入的命令想再次执行，无法通过上下翻页切换的情况。**
- 上面的情况曾经也一直困惑着我，后来我发现了解决方案，这就来分享给大家，希望能帮助到你。通过 **rlwrap + readline** 一起使用，可以完美解决这个问题，接下来，我就来演示一下如何配置使用。

**1、Linux主机配置yum源**
```bash
##查看系统版本
cat /etc/system-release
##上传对应主机版本iso文件
scp rhel-server-7.9-x86_64-dvd.iso root@10.211.55.110:/soft
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716112950524.png)
```bash
##挂载系统iso镜像源
mount -o loop /soft/rhel-server-7.9-x86_64-dvd.iso /mnt
##配置yum镜像源
mv /etc/yum.repos.d/* /tmp/
echo "[local]" >> /etc/yum.repos.d/local.repo
echo "name = local" >> /etc/yum.repos.d/local.repo
echo "baseurl = file:///mnt/" >> /etc/yum.repos.d/local.repo
echo "enabled = 1" >> /etc/yum.repos.d/local.repo
echo "gpgcheck = 0" >> /etc/yum.repos.d/local.repo
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021071611315978.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716113810573.png)

通过以上步骤，我们已经成功挂载系统镜像，可以开始安装redline。

**2、安装readline依赖包**
```bash
yum install -y readline*
```
- 如果没有系统ISO镜像源，也可以直接在上直接下载readline安装包进行安装。

下载readline包：
```bash
wget -c ftp://ftp.gnu.org/gnu/readline/readline-6.2.tar.gz
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716121514994.png)

上传安装包：
```bash
scp readline-6.2.tar.gz root@10.211.55.110:/soft
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716122013820.png)

解压安装：
```bash
tar -zxvf readline-6.2.tar.gz
cd readline-6.2
./configure && make && make install
```

**3、rlwrap安装**
```bash
tar -xvf rlwrap-0.42.tar.gz
 cd rlwrap-0.42
./configure && make && make install
```
>下载地址：https://github.com/hanslub42/rlwrap/releases/tag/v0.45.2

**注意：由于我macOS的终端连接可以切换回退，所以无法演示，以下使用XShell来进行演示。**

- **<font color='blue'>未使用rlwrap时，无法回退和切换上下文：</font>**

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021071615281094.gif)
- **<font color='blue'>使用rlwrap时，可任意切换回退：</font>**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716140324685.gif)

通过上述演示，已经可以轻松做到命令输错无需按住Ctrl键回退和上下文历史命令切换，可以大大提升工作效率。

**4、配置环境变量**
- 为避免每次都需要输入rlwrap来调用命令，我们通过alias别名来配置环境变量实现。
```bash
##配置oracle用户环境变量
cat <<EOF>>/home/oracle/.bash_profile
alias sqlplus='rlwrap sqlplus'
alias rman='rlwrap rman'
alias lsnrctl='rlwrap lsnrctl'
alias asmcmd='rlwrap asmcmd'
alias adrci='rlwrap adrci'
alias ggsci='rlwrap ggsci'
alias dgmgrl='rlwrap dgmgrl'
EOF

##环境变量生效
exit
su - oracle
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021071614104114.gif)

**<font color='blue'>至此，rlwrap工具就配置完成啦！</font>**

## 2 优化输出格式 glogin.sql
SQL*Plus 在启动时会自动运行脚本：**glogin.sql** 。
>- **glogin.sql** 存放在目录$ORACLE_HOME/sqlplus/admin/下。
>- 每当用户启动 SQL*Plus 会话并成功建立 Oracle 数据库连接时，SQL*Plus 就会执行此脚本。
>- 该脚本可以写入在 SQL*Plus 脚本中的任何内容，例如系统变量设置或 DBA 想要实现的其他全局设置。

**1、未做配置时，默认如下：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716152424201.png)

此时，我登录SQL*PLUS并执行sql查询，看一下输出结果格式。

**演示：未配置glogin.sql时，查询结果输出：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716152956372.png)

可以看到，查询结果格式很乱，而且连进去之后也看不到当前实例名和用户名。

**2、配置glogin.sql**
```sql
cat <<EOF>>$ORACLE_HOME/sqlplus/admin/glogin.sql
--设置编辑器用vi打开，windows客户端可以换成NotePad
define _editor=vi
--设置dbms_output输出缓冲区大小
set serveroutput on size 1000000
--设置输出格式
set long 200
set linesize 500
set pagesize 9999
--去除重定向输出每行拖尾空格
set trimspool on
--设置name列长
col Name format a80
--查询当前实例名
set termout off
col global_name new_value gname
define gname=idle
column global_name new_value gname
select lower(user) || '@' || substr( global_name, 1, decode( dot, 0,
length(global_name), dot-1) ) global_name
  from (select global_name, instr(global_name,'.') dot from global_name );
set sqlprompt '&gname _DATE> '
--设置session时间格式
ALTER SESSION SET nls_date_format = 'HH24:MI:SS';
set termout on
EOF
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021071615234274.png)

**演示：配置完glogin.sql时，查询结果输出：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716153121637.png)

通过以上配置，SQL*PLUS连接后，明显输出格式更加好看，显示更加人性化。具体配置可根据个人常用进行配置，比如可以将查询表空间使用率配置进去，每次打开都可以看到表空间使用率，防止数据文件撑爆。
```sql
--查询表空间使用率
col TABLESPACE_NAME for a20
select tbs_used_info.tablespace_name,
       tbs_used_info.alloc_mb,
       tbs_used_info.used_mb,
       tbs_used_info.max_mb,
       tbs_used_info.free_of_max_mb,
       tbs_used_info.used_of_max || '%' used_of_max_pct
  from (select a.tablespace_name,
               round(a.bytes_alloc / 1024 / 1024) alloc_mb,
               round((a.bytes_alloc - nvl(b.bytes_free,
                                          0)) / 1024 / 1024) used_mb,
               round((a.bytes_alloc - nvl(b.bytes_free,
                                          0)) * 100 / a.maxbytes) used_of_max,
               round((a.maxbytes - a.bytes_alloc + nvl(b.bytes_free,
                                                       0)) / 1048576) free_of_max_mb,
               round(a.maxbytes / 1048576) max_mb
          from (select f.tablespace_name,
                       sum(f.bytes) bytes_alloc,
                       sum(decode(f.autoextensible,
                                  'YES',
                                  f.maxbytes,
                                  'NO',
                                  f.bytes)) maxbytes
                  from dba_data_files f
                 group by tablespace_name) a,
               (select f.tablespace_name,
                       sum(f.bytes) bytes_free
                  from dba_free_space f
                 group by tablespace_name) b
         where a.tablespace_name = b.tablespace_name(+)) tbs_used_info
 order by tbs_used_info.used_of_max desc;

--查询备份
col status for a10
col input_type for a20
col INPUT_BYTES_DISPLAY for a10
col OUTPUT_BYTES_DISPLAY for a10 
col TIME_TAKEN_DISPLAY for a10

select input_type,
       status,
       to_char(start_time,
               'yyyy-mm-dd hh24:mi:ss'),
       to_char(end_time,
               'yyyy-mm-dd hh24:mi:ss'),
       input_bytes_display,
       output_bytes_display,
       time_taken_display,
       COMPRESSION_RATIO
  from v$rman_backup_job_details
 where start_time > date '2021-07-01'
 order by 3 desc;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210716151536120.png)

**<font color='blue'>至此，glogin.sql已经配置完成，欢迎食用👏🏻。</font>**
# 写在最后
**<font color='red'>glogin.sql 需要谨慎配置，没有理解的命令尽量不要写入。</font>**

**大名鼎鼎的比特币勒索病毒，有一种方式就是通过glogin.sql来进行注入。**

参考官方文档：
>**Configuring SQL*Plus**：https://docs.oracle.com/cd/E11882_01/server.112/e16604/ch_two.htm#SQPUG012



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