---
title: ☀️ （亲测可用）简单两步：一键导出 CSDN 自己博客所有文章 | MD 格式
date: 2021-08-01 01:08:16
tags: [csdn文章导出]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89113
---

@[TOC](下载 CSDN 博客 MD 文章)
# 🌲 前言 🌲
近来，一直忙碌于将CSDN的博客搬来搬去，每次都需要去复制粘贴，觉得太麻烦，终于找到个一劳永逸的方式，将所有文章导出为 MD 格式，都下载到本地，这样就方便进行迁移和存档。下面 👇🏻 分享一下如何下载！⭐️


# ⭐️ 方法 ⭐️
**① 登陆CSDN，点击链接：[https://blog-console-api.csdn.net/](https://blog-console-api.csdn.net/)**

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210801-2e28a685-c2fb-421c-914a-2c3c651eb6c4.png)

<font color='red'>**你没看错！就是一个 404 页面！**</font>

**② F12 -> console**

复制粘贴下面的代码，回车：

```
var s=document.createElement('script');s.type='text/javascript';document.body.appendChild(s);s.src='//cdn.jsdelivr.net/gh/ame-yu/csdn-move@latest/dist/index.js';
```
等待一会儿功夫，会自动下载一个名为 `csdn-blog-md` 压缩包文件，里面就是你博客所有的 MD 格式的文章。

**<font color='green'>❤️ 好了，大功告成！❤️</font>**