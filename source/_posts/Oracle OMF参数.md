---
title: Oracle OMF参数
date: 2021-09-20 00:09:14
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/111797
---

@[TOC](目录)
# 📚 前言
Oracle DBA 日常工作中，比较常见的就是添加表空间数据文件，如果不使用 OMF 参数，将会是一件麻烦的工作。

# ☀️ OMF 介绍
**Oracle 的 OMF 全称 “Oracle managed file”，即 Oracle 文件管理。**

使用 OMF 可以简化管理员的管理工作，不用指定文件的名字、大小、路径，其名字，大小，路径由 oracle 自动分配。

当删除不再使用的日志、数据、控制文件时，OMF 也可以自动删除其对应的 OS 文件。

# ⭐️ 配置 OMF 参数
使用 OMF 参数之后，会存放在默认生成的文件路径下。

**格式为：** 

- 数据文件：`OMF路径/ORACLE_SID/datafile/`
- 日志文件：`OMF路径/ORACLE_SID/onlinelog/`

## 确认系统是否启用 OMF 特性
Oracle 数据库是否启用OMF特性可以通过查看DB_CREATE_FILE_DEST参数来获得。
```bash
sqlplus / as sysdba
show parameter db_create_file_dest
```
![](https://img-blog.csdnimg.cn/ecf0d9c65b714dbcba5ef3d292afba1d.png)
当 DB_CREATE_FILE_DEST 参数值为空时表示未启用OMF功能。

**配置命令：**
```sql
alter system set db_create_file_dest='/oradata';
```
![](https://img-blog.csdnimg.cn/6ccb8d57a1f244798054aac1205902bc.png)
修改后立即生效！

## 创建数据文件
**未设置 OMF ：**
```sql
alter tablespace users add datafile '/oradata/orcl/user02.dbf' size 1M autoextend off;
```
![](https://img-blog.csdnimg.cn/da0e747e54664a91a500db77fd0b693b.png)
需要指定数据文件 `路径`，`名称`，每次增加前需要查询，增加工作量。

**设置 OMF 后：**
```sql
alter tablespace users add datafile size 1M autoextend off;
```
![](https://img-blog.csdnimg.cn/027e940715964ab3ab8cb9fca9ea53f4.png)
如上，知道表空间就可以直接添加数据文件！

## 创建日志文件
同理，在线重做日志也是一样的！

**使用 OMF 参数后：**
```sql
alter database add logfile group 20 size 512M;
```
![](https://img-blog.csdnimg.cn/1a37505f7773401091379d33d279f481.png)
只需要指定 group 即可！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️
