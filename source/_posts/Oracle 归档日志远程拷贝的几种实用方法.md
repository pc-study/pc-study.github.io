---
title: Oracle 归档日志远程拷贝的几种实用方法
date: 2025-09-11 13:18:59
tags: [墨力计划,数据库实操,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1965941797780205568
---

# 前言
在进行 Oracle 数据库备份恢复、迁移或搭建 DataGuard 等运维操作时，经常需要传输归档日志以确保数据一致性。然而，归档目录通常包含大量文件，而我们往往只需
要传输其中的一部分，如何高效地批量传输指定的归档文件，是每个 DBA 都会遇到的实际问题。

以本文的实际场景为例，归档目录下共有 **1082** 个文件，但只需要传输其中的 **136** 个：
```bash
[oracle@lucifer:/oradata/archivelog]$ ll | wc -l
1082
[oracle@lucifer:/oradata/archivelog]$ find . -name "1_42291[7-9]_943615335.dbf" -o -name "1_4229[2-9]*_943615335.dbf" -o -name "1_42[3-9]*_943615335.dbf" | wc -l
136
```
本文总结了几种快速、高效的归档日志传输方法，帮助 DBA 在实际工作中选择最适合的方案。

| 场景       | 推荐方案                   | 理由          |
|----------|------------------------|-------------|
| 生产环境迁移   | RMAN backup archivelog | 专业、稳定、支持压缩  |
| 一次性大批量传输 | tar 打包                 | 简单快捷，压缩效果好  |
| 频繁的增量传输  | rsync                  | 支持增量传输和断点续传 |
| 复杂文件名匹配  | SSH免密 + find           | 灵活的正则表达式支持  |

# RMAN 备份归档
对于 Oracle 归档文件，最专业的方式是使用 RMAN 的 `backup archivelog` 命令：
```bash
RMAN> backup archivelog from sequence 422917 until sequence 423053 thread 1 format '/backup/arch_%d_%T_%t_%s_%p';
```
然后使用 scp 传输备份文件：
```bash
scp /backup/arch_* 192.168.31.166:/backup
```

# tar 打包传输
使用 `tar` 命令将指定的归档文件打包后传输：
```bash
[oracle@lucifer:/oradata/archivelog]$ tar czf archivelog.tar.gz 1_42291[7-9]_943615335.dbf 1_4229[2-9]*_943615335.dbf 1_42[3-9]*_943615335.dbf
[oracle@lucifer:/oradata/archivelog]$ du -sh archivelog.tar.gz 
2.6G    archivelog.tar.gz
```
传输打包文件：
```bash
scp /backup/archivelog.tar.gz 192.168.31.166:/backup
```
目标端解压：
```bash
cd /backup
tar -xf archivelog.tar.gz
```

# SSH 免密 + find 批量传输
## 配置 SSH 免密登录
首先配置 SSH 密钥认证，避免每个文件都要输入密码：
```bash
# 传输公钥文件
scp -P 11122 ~/.ssh/id_rsa.pub oracle@192.168.31.166:~/

# 在目标服务器上执行
mkdir -p ~/.ssh
cat ~/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
rm ~/id_rsa.pub
```
## find 传输
使用 find 批量传输：
```bash
[oracle@lucifer:/oradata/archivelog]$ find . -name "1_42291[7-9]_943615335.dbf" -o -name "1_4229[2-9]*_943615335.dbf" -o -name "1_42[3-9]*_943615335.dbf" | xargs -I {} scp -P 11122 {} 192.168.31.166:/backup
```
传输完成后，记得取消 SSH 免密互信。

# rsync 同步传输
确保源端和目标端都安装了 `rsync`，否则会报错：
```bash
bash: rsync: command not found
rsync: connection unexpectedly closed (0 bytes received so far) [sender]
rsync error: remote command not found (code 127) at io.c(600) [sender=3.0.6]
```
使用 rsync 进行高效的文件同步传输：
```bash
[oracle@lucifer:/oradata/archivelog]$ rsync -avz -e "ssh -p 11122" 1_42291[7-9]_943615335.dbf 1_4229[2-9]*_943615335.dbf 1_42[3-9]*_943615335.dbf oracle@10.182.32.83:/oradata/archivelog/
```
增量方式，目标端已存在的归档直接跳过，所以可以重复执行。

# 写在最后
通过合理选择传输方案，可以显著提升 Oracle 数据库运维工作的效率，减少人工操作失误的风险。