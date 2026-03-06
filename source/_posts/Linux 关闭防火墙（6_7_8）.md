---
title: Linux 关闭防火墙（6/7/8）
date: 2021-09-22 09:09:12
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/112024
---

## Linux 6
```bash
service iptables stop
chkconfig iptables off
service ip6tables stop
chkconfig ip6tables off
service iptables status
```

## Linux 7/8
```bash
systemctl stop firewalld.service
systemctl disable firewalld.service
systemctl status firewalld.service
```

以上命令直接执行即可！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️