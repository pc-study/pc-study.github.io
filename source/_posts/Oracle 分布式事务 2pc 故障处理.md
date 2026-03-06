---
title: Oracle 分布式事务 2pc 故障处理
date: 2021-09-26 18:09:02
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/114275
---

@[TOC](目录)
# 📚 前言
我们在使用 oracle 数据库时，有时候会碰到需要使用分布式事务，并且会碰到一些报错！

# ☀️ 分布式事务
当需要在多个Oracle数据库之间进行数据一致性操作时，就会用到分布式事务。

**例如：**
```sql
insert into T_log@remote_db;  --远程数据库插入
insert into T_local;          --本地数据库插入
commit;
```
分布在本地和远程两个db的事务同时操作，这就构成了一个分布式事务。

分布式事务采用 `Two-Phase Commit` 提交机制，保证分布在各个节点的子事务能够全部提交或全部回滚的原子性。

**在这种机制下，事务处理过程分为三个阶段：**

- PREPARE：发起分布式事务的节点通知各个关联节点准备提交或回滚。
- COMMIT：写入commited SCN，释放锁资源
- FORGET：悬疑事务表和关联的数据库视图信息清理

各关联节点此时会做三个事情：刷新redo信息到redo log中；将持有的锁转换为悬疑事务锁；取各节点中最大的SCN号进行同步！

# ⭐️ 常见错误
**以下是三种常见的分布式事务问题场景：**

- dba_2pc视图中有数据，但分布式事务已经不存在
- 分布式事务存在，但dba_2pc视图中没有数据
- 事务和视图数据都有，但是执行commit force或rollback force时hang住

**通过报错会有提示，例如：**
```bash
ORA-01591: lock held by in-doubt distributed transaction 10.20.360
```
**这个10.20.360就是我们需要检查分布式事务ID！**

由于分布式事务涉及到多个数据库之间进行操作，偶尔会遇到一些异常情况（例如系统或网络中断）导致上述三个阶段出现异常，这就在一个或多个节点上，产生不完整的“悬疑分布式事务”。

大多数情况下，出现这种问题，Oracle 会由 Reco 进程进行自动修复，Oracle 数据库会在 `dba_2pc_pending` 和`dba_2pc_neighbors` 等多个视图中记录分布式事务相关的信息，事实上 reco 进程也是基于这些信息去做自动修复的。

`Reco` 进程会尝试连接到其他节点获取分布式事务信息，然后尝试修复失败的事务，并将对应的事务中的记录删除。

但有些情况下（例如节点无法正常访问或事务表中记录的数据不完整），Reco 进程不能正常完成这个工作，就会抛出异常。

对于分布式事务，对应的异常代码区间是`ORA-02040 - ORA-02099`，可通过alert日志查看到错误信息。

**例如：**
```bash
ORA-02054: transaction in-doubt
The transaction is neither committed or rolled back locally, and we have lost communication with the global coordinator.
```

**此时往往需要手工处理进行干预。**

**<font color='orage'>常用的 2pc_clean 命令如下：</font>**

```sql
select 'rollback force '||''''||local_tran_id||''''||';' "RollBack"
       from dba_2pc_pending
       where state='prepared';

select 'exec dbms_transaction.purge_lost_db_entry('||''''||local_tran_id||''''||');' "Purge"
       from dba_2pc_pending;

select 'rollback force  ''' || LOCAL_TRAN_ID || ''';' || chr(10) ||
'execute DBMS_TRANSACTION.PURGE_LOST_DB_ENTRY(''' || LOCAL_TRAN_ID
 || ''');' || chr(10) || 'commit;' from DBA_2PC_PENDING;
 ```
 
---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️