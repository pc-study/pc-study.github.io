---
title: Oracle 开启归档模式
date: 2021-10-06 14:10:52
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125886
---

Oracle 数据库通常建议开启归档模式，记录数据库操作的记录归档到本地日志文件！

可以通过以下命令查看是否开启归档：
```sql
archive log list
```
![](https://img-blog.csdnimg.cn/81411c7c78a5465c8d28eb70936016b6.png)
如图，即已开启归档！

**有啥好处呢？**

开了归档之后，可以 RMAN 实时备份数据，配置 DataGuard 必须开启归档模式，数据库基本能保证零丢失！

**缺点可能就是：**

1、占用大量磁盘空间
2、占用部分系统资源
3、如果归档空间满了，可能导致数据库宕机

**总的来说，利大于弊，现在谁还差那么点磁盘空间和系统资源呢？对吧！**

**<font color='orage'>开启归档模式的步骤：</font>**

**1、设置归档路径**
```sql
alter system set log_archive_dest_1='LOCATION=/archivelog';
```
这个 `/archivelog` 目录需要是磁盘中物理存在的路径，否则无法归档！
![](https://img-blog.csdnimg.cn/8ea66c353ac54e72b927eb9311793c9e.png)
**2、关闭数据库，开启到mount状态**
```sql
shutdown immediate
startup mount
```
如果是 rac 集群环境，使用 `srvctl` 来关闭所有节点数据库，然后打开一个节点到 mount 状态！

**3、打开归档模式，打开数据库到 open**
```sql
alter database archivelog;
alter database open;
```
**4、检查归档状态，切换日志**
```sql
archive log list
alter system switch logfile;
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️
