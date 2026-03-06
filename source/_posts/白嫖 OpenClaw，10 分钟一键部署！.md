---
title: 白嫖 OpenClaw，10 分钟一键部署！
date: 2026-02-28 12:25:26
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2027594476907225088
---

最近 OpenClaw 太火了，大家都在玩，这不得学习一下。今天花点时间部署了一下，用的是目前性价比最高的**云服务**部署方式，而且全程白嫖！下面把我的经验分享给大家。

OpenClaw 资源占用低，2 核 2G 配置就能流畅运行，主流云服务商（如阿里云、腾讯云）都提供这类实例，但这次我选择腾讯云轻量应用服务器（Lighthouse），因为它内置 OpenClaw 镜像，无需手动安装环境，一键部署。

最主要的是，腾讯云 AI 助手 CodeBuddy 正举办新年活动，可以免费领取一台 2 核 2G 4M 带宽的 Lighthouse 服务器，正好用来部署 OpenClaw。下面一步步教大家白嫖并部署。

活动链接有两个版本，根据你的情况选择：
- **国际版**：https://www.codebuddy.ai/promotion/?ref=1fuqyhrlnv（可使用 Google/GitHub 账号注册）
- **国内版**：https://www.codebuddy.cn/promotion/?ref=hyb05vog4t5av（手机号注册）

我以国内版为例。打开链接，注册/登录 CodeBuddy 账号。登录后，根据提示下载并安装 CodeBuddy 客户端（支持 Windows/Mac），安装完成后，打开 CodeBuddy 软件。

在活动页面点击 **“实战礼”** → **“立刻领奖”**：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260228-2027596545882398720_395407.png)

此时浏览器会自动跳转到 CodeBuddy 客户端的授权页面，用微信扫码登录即可。登录成功后，你会看到弹窗提示成功领取云资源，并引导你前往腾讯云控制台确认。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260228-2027597222741893120_395407.png)

领取的资源会自动发放到你的腾讯云账号下（通常是与 CodeBuddy 绑定的手机号对应的账号）。打开 [腾讯云控制台](https://console.cloud.tencent.com/)，进入 **“轻量应用服务器”** 页面，你会看到一台状态为“待使用”或“运行中”的实例（配置为 2核2G4M）。

因为实例已经创建但应用不是 OpenClaw，可以点击实例卡片右上角的 **“更多”** → **“重装系统”**。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260228-2027597843851206656_395407.png)

在重装系统页面，镜像类型选择 **“应用镜像”**，然后在列表中找到 **“OpenClaw(clawdbot)”**。选中后点击确定，等待几分钟，系统就会自动安装好 OpenClaw 及其运行环境。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260228-2027597992925159424_395407.png)

重装完成后，回到轻量应用服务器列表，复制实例的公网 IP，然后使用 SSH 工具（如终端、Putty、Xshell 等）连接服务器，登录成功后，输入以下命令查看 OpenClaw 版本：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260228-2027598218390478848_395407.png)

通过 CodeBuddy 的新年活动，我们不仅白嫖了一台 2 核 2G 的云服务器，还利用腾讯云轻量应用服务器的 OpenClaw 镜像实现了真正的一键部署。整个过程不到 10 分钟，非常适合想快速体验 OpenClaw 的朋友。如果你也想搭建自己的 OpenClaw，不妨试试这个方法，省时省力还省钱！

快去领取你的免费服务器，加入 OpenClaw 的狂欢吧！如果遇到问题，欢迎在评论区留言交流。