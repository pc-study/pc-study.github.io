---
title: Oracle MOS 重磅升级？嗯，什么东西！
date: 2025-12-08 10:01:45
tags: [墨力计划,oracle,mos]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1997842579296182272
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

# 前言
今天一早就收到了 Oracle MOS 升级的官方邮件通知：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251208-1997830543375949824_395407.png)

本来想写一篇新版 MOS 的介绍文章，但是使用了一半，我放弃了，打算来吐槽一下新版 MOS，简直太不好用了（**个人感觉**）！

# 变与不变
首先，新版 MOS 的网址没有变化，还是 **https://support.oracle.com**，打开之后，映入眼帘的是两个大大的 MOS 升级公告：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251208-1997832801816223744_395407.png)

从今天开始，老版 MOS 没法用了，你必须去使用 Oracle 新版 MOS 了，不管你习不习惯！

新版 MOS 登录之后的主界面：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251208-1997843284497604608_395407.png)

嗯，可以说是面目全非，但是保留了**所有未解决的服务请求（SR）以及过去两年内已关闭的 SR**，还算可以接受吧！

以前老版 MOS 登录进去的页面功能清单，变成了下拉菜单：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251208-1997844258678726656_395407.png)

我挨个点了一下这些功能，总体感觉挺鸡肋的，广告成分大于知识库成分，个人感觉。

总体试用了一圈，让我感觉最不爽的就是：**我以前保存的很多经典的 MOS 文章链接全都无法查看了，也搜索不到这个文档号**！

原因是因为文档号从以前的 **Doc** 变成了 **KB** 开头，所以嗯，打开以前的文档号链接，就会跳转到：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251208-1997845941664686080_395407.png)

最坑人的就是，我搜索一篇 MOS 文档，打开其中的文档号链接，他也是跳转到上面的 MOS 登录界面，甚至会出现**加载文章出错**的页面：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251208-1997846390450511872_395407.png)

能打开的页面显示这样（**你觉得美观吗？**）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251208-1997847337705218048_395407.png)

SR 详情页面就不吐槽了，我截个图：

![i](https://oss-emcsprod-public.modb.pro/image/editor/20251208-1997847715565871104_395407.png)

要我说，至少应该内部测试稳定了再发布正式版，在未发布正式版期间，老版 MOS 继续提供使用，给用户选择的权利，现在是直接一锤子直接打死，不用也得用。

# 写在最后
使用完新版 MOS 之后，总体还是比较失望的，总结一下：**不如不升**！

---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)