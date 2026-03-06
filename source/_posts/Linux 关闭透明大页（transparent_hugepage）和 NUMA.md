---
title: Linux 关闭透明大页（transparent_hugepage）和 NUMA
date: 2021-09-27 12:09:01
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/114992
---

有些情况下需要关闭Linux 服务器的 透明大页和 NUMA，比如安装 Oracle 数据库！

下面介绍如何永久关闭 透明大页 和 NUMA 的命令：

**Linux 6：**

关闭透明大页：
```bash
cat >>/etc/rc.d/rc.local <<EOF
if test -f /sys/kernel/mm/transparent_hugepage/enabled; then
echo never > /sys/kernel/mm/transparent_hugepage/enabled
fi
if test -f /sys/kernel/mm/transparent_hugepage/defrag; then
echo never > /sys/kernel/mm/transparent_hugepage/defrag
fi
EOF
```
关闭 numa：
```bash
sed -i 's/quiet/quiet numa=off/' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
```

**Linux 7/8：**

关闭 透明大页 和 NUMA：
```bash
sed -i 's/quiet/quiet transparent_hugepage=never numa=off/' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
```
**📢 注意：修改完之后，需要重启主机才能生效！**

重启后，通过以下命令可以查看是否成功关闭：
```bash
cat /sys/kernel/mm/transparent_hugepage/enabled
cat /proc/cmdline
```
![](https://img-blog.csdnimg.cn/a278f34775264c92be03ee10bc473900.png)
如上，即成功关闭！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️
