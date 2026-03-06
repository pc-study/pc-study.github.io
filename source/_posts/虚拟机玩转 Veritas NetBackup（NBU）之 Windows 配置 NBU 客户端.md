---
title: 虚拟机玩转 Veritas NetBackup（NBU）之 Windows 配置 NBU 客户端
date: 2022-01-26 21:00:26
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/242908
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
NBU 的使用需要在客户端安装配置，否则无法使用，NBU 客户端支持 Linux、Window 以及 AIX 三个平台，安装过程都比较简单，本文介绍下如何在 Windows 下配置 NBU 客户端。

# 一、上传并解压客户端安装包
首先下载 Windows 的 NBU 客户端软件：
- [NetBackup_8.1.1_Win.zip](https://pan.baidu.com/s/1-_09KNKf55VnyNxaql7WNg)

>提取码：`phip`

下载后解压：

![](https://img-blog.csdnimg.cn/aac7631ce77c4352917f50756a1792f0.png)
# 二、配置解析
客户端和服务端主机均需要添加主机解析，在 /etc/hosts 文件中添加即可！

**服务端：**
```bash
cat<<EOF>>/etc/hosts
10.211.55.61 lucifer
EOF

## 测试 ping
ping lucifer
```
![](https://img-blog.csdnimg.cn/e777417164b743868dad19100d678214.png)

**客户端：**

Windows 下的 hosts 文件位于：C:\Windows\System32\drivers\etc 目录下。

![](https://img-blog.csdnimg.cn/dc5dfaa1cafb4772b9b65c15fbc29aba.png)

![](https://img-blog.csdnimg.cn/499beb77bdde44b6be8a87b3f308ef81.png)

测试能否 ping 通：

![](https://img-blog.csdnimg.cn/6e8e59a46ecc402ba15b5417f6d1e7fa.png)

# 三、客户端安装软件
配置好解析之后，就可以开始安装 NBU 客户端软件了：

![](https://img-blog.csdnimg.cn/623d079485524aa68694c8018987e63b.png)

![](https://img-blog.csdnimg.cn/258c53a92a6d4a37bdf4672c872719fa.png)

![](https://img-blog.csdnimg.cn/add90de76aec4e03aa19aadf28301b90.png)

![](https://img-blog.csdnimg.cn/a3e351a870c24f968bb24a80b818a924.png)

![](https://img-blog.csdnimg.cn/b200309ae80e4bd08976ff34e2d467e8.png)

![](https://img-blog.csdnimg.cn/1215a25b7865411eb67b7e9ed3af3b73.png)

![](https://img-blog.csdnimg.cn/ef9d599ab4ec441f82d8088ab0d381be.png)

![](https://img-blog.csdnimg.cn/db6ef129e5624a1f819d315c4447923f.png)

![](https://img-blog.csdnimg.cn/c5d0cec0d9ce4124b0774d0cfd9b4f19.png)

📢 注意：安装过程中需要使用 Token，在 NBU 管理界面获取：

![](https://img-blog.csdnimg.cn/70703188c960410a80b9bdf1fa777881.png)

![](https://img-blog.csdnimg.cn/a41b07cd700248a6bf25ad30d038daf9.png)

![](https://img-blog.csdnimg.cn/bb44170209a24637a0145a8b61e4b61c.png)

![](https://img-blog.csdnimg.cn/9c8b93f3b600497eb76f47c7cdb266b4.png)

**📢 注意：** 两台主机需要保持时间同步，否则安装过程中报错！

至此，Windows 配置 NBU 客户端就完成了。

---

# 往期精彩文章
>[Oracle 一键巡检自动生成 Word 报告](https://mp.weixin.qq.com/s/0xFe5m1DQ0ucT2_266hsrA)    
[Oracle 一键安装合集](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5MzcwNzQ0MQ==&action=getalbum&album_id=3497774649285296131#wechat_redirect)    
[Oracle一键安装脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/gv6t97FFyMsd6e4GH1HAwQ)    
[Oracle一键巡检脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/4zI73auIUhwSRb7qL3UIfw)    
[全网首发：Oracle 23ai 一键安装脚本（非 RPM）](https://mp.weixin.qq.com/s/UL0BSMCAZrOQgCoWpDMGew)    
[Oracle 19C 最新 RU 补丁 19.24 ，一键安装！](https://mp.weixin.qq.com/s/T7GbpwhnMugzk7PB6hAoJQ)    
[Oracle Linux 7.9 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/dT4tFMYVZ3mh49CI6V3YEA)    
[RedHat 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cQJ6gP1bM_7m0H5-Dha4TA)    
[openEuler 22.03 LTS SP4 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/sx1E4GIvIeQXp2vGMmVr2A)    
[RHEL 7.9 一键安装 Oracle 19C 19.23 RAC](https://mp.weixin.qq.com/s/mUHqU5hQ9GdH2bKuClPt5A)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q)    
[优化 Oracle：最佳实践与开发规范](https://mp.weixin.qq.com/s/DysIcb-p11j56d3YtlqpcQ)    
[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA)    
[Linux 一键配置时钟同步全攻略](https://mp.weixin.qq.com/s/yvth1vorP3JjUp3g3vPBAQ)    

---

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎**点赞+关注**，我会持续分享数据库知识、运维技巧。