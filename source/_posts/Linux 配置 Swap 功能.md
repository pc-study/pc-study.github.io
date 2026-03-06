---
title: Linux 配置 Swap 功能
date: 2021-10-06 14:10:03
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125885
---

**查看 Swap：**
```bash
free -m
grep -i 'swaptotal' /proc/meminfo | awk '{print $2}'
```

**增加 Swap**
```bash
## 从根目录划一块空间给 Swap
dd if=/dev/zero of=/swapfile bs=1G count=1
mkswap /swapfile
swapon /swapfile
echo "/swapfile swap swap defaults 0 0" >>/etc/fstab
```

**关闭 Swap：**
```bash
sed -i '/swap/s/^/#/' /etc/fstab
swapoff -a
```

**修改 Swapiness：**
```bash
## 临时生效
sysctl -w vm.swappiness=10
sysctl -a | grep vm.swappiness
cat /proc/sys/vm/swappiness

## 永久生效
echo 'vm.swappiness = 10' >>/etc/sysctl.conf
sysctl -p
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️