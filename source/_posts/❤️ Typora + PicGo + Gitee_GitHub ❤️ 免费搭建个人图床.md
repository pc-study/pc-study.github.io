---
title: ❤️ Typora + PicGo + Gitee/GitHub ❤️ 免费搭建个人图床
date: 2021-08-10 18:08:23
tags: [图床]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/98359
---

@[toc](目录)
# 前言

写了将近一年多博客，之前半年都是用 `富文本` 的方式来写博客。直到遇到了一些博友，听说他们都是用 `Markdown` 格式来写博客。结果，我就放弃了富文本模式，见仁见智，我是觉得真的很难用。

接触到 `Markdown` 模式的第一个问题就是图的问题，因为都是要贴网址的。当时没多想，因为都是用的博客平台，只需要将图片复制进去就行，也很方便。

后来，听说还有 `图床` 这个东西，但是由于懒，就一直没有去玩。最近，出于种种原因，还是尝试搭建了一下，这里分享一下搭建过程。

# 搭建准备

本次搭建过程需要以下介质：Typora + PicGo + Gitee/GitHub ，**<font color='red'>免费！</font>**

## Typora

Typora 是一款 markdown 编辑器，支持几乎所有的 markdown 格式，神器！

![](https://img-blog.csdnimg.cn/img_convert/cd821a989966ff635988595025585c57.png)

支持 `macOS`、`Windows`、`Linux` 三种操作系统，下载地址：https://www.typora.io/。

macOS 也可以直接通过 Homebrew 安装：`brew install typora`。

## PicGo

PicGo 是用于快速上传图片并获取图片 URL 链接的工具，也是神器！

![image-20210810174810560](https://img-blog.csdnimg.cn/img_convert/c89829914d76cb0442847732c29d15b9.png)

支持 `macOS`、`Windows`、`Linux` 三种操作系统，下载地址：https://github.com/Molunerfinn/PicGo/releases。

macOS 也可以直接通过 Homebrew 安装：`brew install picgo`。

## Gitee/GitHub

Gitee/GitHub 都是代码托管平台，免费的私有仓库，没有容量限制，写代码的都知道吧？

![image-20210810160746165](https://img-blog.csdnimg.cn/img_convert/ba655eddebdf745dab0558f1beb44089.png)

你要问我孰优孰劣？我只能说，国内的就老老实实用 Gitee 吧！

# 搭建步骤

接下来我们开始搭建，确保已经安装上述软件和注册 Gitee/GitHub 账号。

## Gitee/GitHub 创建图床仓库

在 Gitee/GitHub 创建一个图床仓库，用来存放你的图片。

### Gitee步骤

#### 1、创建图床仓库

首先打开你的 `Gitee` 主页，点击 `新建仓库` ，创建一个仓库。

![image-20210810174335872](https://img-blog.csdnimg.cn/img_convert/b8791ed1c5cd5c86edece2a28aacb4c0.png)

如下图，输入你的仓库信息，必须为 `开源`，否则无法上传图片。

![image-20210810161941077](https://img-blog.csdnimg.cn/img_convert/09635dc56bcc6ffc3e09cf29029d90f4.png)

#### 2、生成私人令牌 Token

点击个人设置-->私人令牌：

![image-20210810162720938](https://img-blog.csdnimg.cn/img_convert/812f26985380b01a1801c0e0187456a5.png)

点击 `+生成新令牌` 生成一个私人令牌：

![image-20210810162911778](https://img-blog.csdnimg.cn/img_convert/fff1d08fa60d323f8e56cdd7d805a4fd.png)

填写描述，然后提交，输入你的 Gitee 账号密码即可，**Token 关闭页面后将不再显示，因此需要记录 Token。**

![image-20210810163126822](https://img-blog.csdnimg.cn/img_convert/d7196a774cd36a7c299a27d6eadfb1f6.png)

**<font color='green'>至此，Gitee 的配置已经完成。</font>**

### GitHub步骤

<font color='red'>前提：GitHub 与 Gitee 大同小异，最好有 🪜 ，不然不建议使用 Github，以下只是演示下如何使用。</font>

#### 1、创建图床仓库

![image-20210810163858499](https://img-blog.csdnimg.cn/img_convert/1a853297dcbca98be96aaca03f120da0.png)

这里和 Gitee 大同小异，填写相关信息即可。

![image-20210810164240474](https://img-blog.csdnimg.cn/img_convert/e6e59f5a5c65ea97c37865abc281ec30.png)

#### 2、生成私人令牌 Token

打开 https://github.com/settings/tokens，点击 `Generate new token` 创建一个私人令牌：

![image-20210810164905375](https://img-blog.csdnimg.cn/img_convert/71c31410c007e97493629abb82886b71.png)

选择 `无限期`，勾选 `repo` 即可：

![image-20210810165146963](https://img-blog.csdnimg.cn/img_convert/a10de675b6227b22d5f53739f12596a3.png)

同样的，保存好你的 Token：

![image-20210810165432798](https://img-blog.csdnimg.cn/img_convert/99987d45f9e5b0a7bd6456312d1bb9cd.png)

**<font color='green'>至此，Github已配置完成。</font>**

## 配置 PicGo

### GitHub 图床配置

打开 PicGo 详细窗口，根据提示填入 GitHub 图床仓库的相关信息：

![image-20210810165805839](https://img-blog.csdnimg.cn/img_convert/6bec8d057cffde6234328027511cca77.png)

这个很简单，不做解释，相信以你的聪明才智，分分钟搞定。

### Gitee 图床配置

由于 PicGo 原生不支持 Gitee，因此需要通过插件安装。

点击插件设置，搜索 `gitee-upload` ，点击安装。

![image-20210810170110623](https://img-blog.csdnimg.cn/img_convert/41fc0ac18e4064ee4bb5bec5f5cd55b9.png)

**<font color='red'>注意：这里需要提前安装 `node.js`，否则无法安装！</font>**

插件安装成功后，重启 PicGo ，然后配置 gitee：

![image-20210810170358801](https://img-blog.csdnimg.cn/img_convert/d99266ab1c30b2c3991621bda13658cf.png)

配置方式与 GitHub 大同小异。

经过如上配置，图床已经搭建成功，可以通过上传图片测试：

![image-20210810170522129](https://img-blog.csdnimg.cn/img_convert/f4392fd9be72bb9d6c1f616104b1ffa7.png)

点击上传图片，然后复制到 `markdown` 编辑器中查看。

## 配置 Typora

为什么要配置 Typora ？当然是为了方便，不能每次都手动去上传图片，然后复制链接吧，只需要简单配置 Typora 就可以实现复制图片自动上传。

![image-20210810172414616](https://img-blog.csdnimg.cn/img_convert/495033ae8b6f1e3c4d0f78568eb9442c.png)

配置如上，选择插入图片时选择 `PicGo.app` 即可！就这么简单~

测试一下最终效果，直接截图当前界面，上传粘贴：

![test](https://img-blog.csdnimg.cn/img_convert/3af30c5f191fcf1adaeeb7751d6ca8c2.gif)

![image-20210810172807755](https://img-blog.csdnimg.cn/img_convert/808e0b93b8b72e172fa9424e7354ddc2.png)

可以发现，已经自动实现上传了！

# 写在最后

总的来说，搭建过程不算难，只需要了解这些软件的简单使用即可。

终于拥有自己的图床了，再也不怕网站挂了图片不显示，最主要的是还去水印！

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。