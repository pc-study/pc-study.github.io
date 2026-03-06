---
title: Linux 执行 df -h 卡着不动，HANG 住了，怎么破？
date: 2021-10-13 10:10:26
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/132380
---

最近，查看磁盘空间时，执行 `df -h` 时，命令 hang 住了，一直没有反应！

**现象如下：**
![](https://img-blog.csdnimg.cn/da4d465322e443cd93cc95bb0f3e9e98.png)
这种问题，大概率是由于 mount 的目录被删除了，但是没有提前执行 umount 操作，因此报错！

**解决方案：**

查看 `/etc/fstab` 文件中是否有 mount 相关的目录，使用 `umount -l ` 命令卸载无效挂载目录。

```bash
[root@mes-rac01 soft]# umount -l /backup
 
##umount -l解释
-l, --lazy              detach the filesystem now, and cleanup all later
```

![](https://img-blog.csdnimg.cn/1b82d70202bc45eb9a08a02f2d174f7c.png)
**测试df -h，已恢复正常！**


---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️