---
title: Oracle BBED 简单使用手册
date: 2021-10-12 15:10:32
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/131142
---

**BBED(Block Browerand EDitor Tool)** 是 Oracle 内部工具，可用于直接查看和修改数据文件数据。

通常用于恢复一些特殊场景下的数据丢失。

**BBED 安装**

在 Oracle 9i/10g 版本中，可以通过 relink 的方式来使用 bbed 工具，在 Oracle 11G 之后已经删除相关文件，需要从 10g 版本拷贝文件使用。

**Oracle 9i/10g**

在 Oracle 9i/10g 版本，只需要执行 relink 操作：

```bash
su - oracle
cd $ORACLE_HOME/rdbms/lib
make -f ins_rdbms.mk $ORACLE_HOME/rdbms/lib/bbed
```

**Oracle 11G**

在 Oracle 11G 版本，由于相关文件被删除，因此需要拷贝文件至对应目录下，然后执行 relink 操作：

![](https://img-blog.csdnimg.cn/img_convert/4442c11b22e2a2b4fdc14e2ef57a7d67.png)

```bash
su - oracle
cd $ORACLE_HOME/rdbms/lib
cp /soft/bbedus.ms* .
cp /soft/s* .
make -f $ORACLE_HOME/rdbms/lib/ins_rdbms.mk BBED=$ORACLE_HOME/bin/bbed $ORACLE_HOME/bin/bbed
```

# BBED 使用

## BBED 配置

使用 bbed 命令进行连接，默认密码为 `blockedit` ：

```bash
su - oracle
bbed
```
![](https://img-blog.csdnimg.cn/img_convert/28c627c4f7d7df1c39dd7f3ad3329253.png)

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️