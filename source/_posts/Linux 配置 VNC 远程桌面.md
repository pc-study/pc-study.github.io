---
title: Linux 配置 VNC 远程桌面
date: 2021-09-23 15:09:07
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/112692
---

@[TOC](目录)
# 📚 前言
Linux 主机如果不是虚拟机安装，那么很难直接访问图形化界面。

通常都是使用 SSH 远程连接的方式来连接 Linux 主机，那么，当需要图形化桌面进行操作时，就可以配置 `VNC` 远程桌面来进行操作！

**所以，如何配置 VNC 远程桌面？**

# ☀️ VNC 服务端配置
## 配置本地 yum 源

可以参考：**[Linux 配置本地 yum 源（6/7/8）
](https://luciferliu.blog.csdn.net/article/details/120196606)**

## 安装 vnc 服务端软件
```bash
yum install -y tigervnc*
```
**<font color='orage'>第三步，配置 VNC 服务端</font>**

登录所需访问的用户，比如 oracle 用户：
```bash
su - oracle
vncserver
# 输入两次密码，该密码用于连接vnc远程桌面，可自定义
```
图中的 `orcl:1` 即 vnc 客户端需要输入的信息，但是由于没有配置 DNS，因此需要把 orcl 换成主机 IP 地址，即：`10.211.55.100:1`！
![](https://img-blog.csdnimg.cn/f5f1b4dc86814a6fa3288aa344b0106c.png)
📢 注意：需要哪个用户连接 VNC 远程桌面，就切换到哪个用户进行配置！

# ⭐️ VNC 客户端配置
## 下载 VNC 客户端软件
vnc 客户端软件下载地址：[https://www.realvnc.com/en/connect/download/viewer/](https://www.realvnc.com/en/connect/download/viewer/)

**下载后，直接打开就行：**
![](https://img-blog.csdnimg.cn/779dce88e34b44c8af4f06313d24b5e3.png)
## VNC 客户端连接

**在vnc客户端界面输入`10.211.55.100:1`，输入刚才输入的密码即可连接：**
![](https://img-blog.csdnimg.cn/20210718003654329.png)
![](https://img-blog.csdnimg.cn/2021061302342734.png)
如果输入密码正确，则成功进入 Linux 主机的图形化界面！
![](https://img-blog.csdnimg.cn/20210718093354501.png)
至此，VNC 远程桌面配置完成！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️