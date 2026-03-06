---
title: Linux 安装图形化界面（GUI）
date: 2021-09-22 09:09:10
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/112025
---

安装 Linux 主机时，如果选择 **最小化安装**！

**配置 vnc 远程桌面可以参考：[Linux 配置 VNC 远程桌面
](https://luciferliu.blog.csdn.net/article/details/120210818)**

使用 **vnc** 等工具连接通常显示如下：
![](https://img-blog.csdnimg.cn/ac8651b24b904d2ca9e78db43309282c.png)
也就是无法使用图形化界面，可以通过 yum 直接安装图形化界面：

**Linux 6：**
```bash
yum groupinstall -y "X Window System"
yum groupinstall -y "Desktop"
yum install -y nautilus-open-terminal
```

**Linux 7/8：**
```bash
yum groupinstall -y "Server with GUI"
```

📢 注意：安装完之后，重启主机生效！

**配置本地 yum 源请参考：[Linux 配置本地 yum 源（6/7/8）
](https://luciferliu.blog.csdn.net/article/details/120196606)**

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️