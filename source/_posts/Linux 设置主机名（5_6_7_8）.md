---
title: Linux 设置主机名（5/6/7/8）
date: 2021-09-20 00:09:06
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/111796
---

## Linux 5/6 版本
**临时生效：**
```sql
hostname 你的主机名
```
**永久生效：**

需要打开 `/etc/sysconfig/network` 文件，添加一行：
```bash
echo "HOSTNAME=你的主机名" >>/etc/sysconfig/network
```
## Linux 7/8 版本

**临时生效：**
```sql
hostname 你的主机名
```
**永久生效：**
```bash
hostnamectl set-hostname 你的主机名
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️