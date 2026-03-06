---
title: Linux 关闭 selinux
date: 2021-09-27 12:09:42
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/115005
---

基本上安装大部分的数据库，都需要关闭 `selinux`，很简单！

**临时关闭：**
```bash
setenforce 0
```
**永久关闭：**
```bash
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```
**📢 注意：需要重启才能生效！**

查看是否成功关闭：
```bash
getenforce
cat /etc/selinux/config
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️