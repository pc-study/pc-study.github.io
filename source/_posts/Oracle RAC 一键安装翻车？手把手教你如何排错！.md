---
title: Oracle RAC 一键安装翻车？手把手教你如何排错！
date: 2025-04-15 17:24:06
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1912023970732322816
---

# 前言
今天 Oracle 一键安装脚本群有个朋友使用过程中安装失败，需要帮忙分析：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912024392436035584_395407.png)

这里记录一下分析过程以及解决过程~

# 问题分析
为了方便分析，我在脚本内置了日志模块，安装遇到问题只需要把日志发出来即可快速分析问题，通过日志可以发现：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912024643549016064_395407.png)

可以看到这里集群状态有问题，大概率是 root.sh 执行有问题，检查 root.sh 日志：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912025246278889472_395407.png)

查看日志后发现节点 2 执行 root.sh 失败：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912025393142444032_395407.png)

检查了节点1和节点2的脚本安装日志，发现脚本配置基本都没问题。

除了 /etc/hosts 配置有点问题，有重复配置情况：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912025945930739712_395407.png)

经过确认，是因为在执行脚本安装前手工配置了 /etc/hosts 文件，怀疑有可能是这个导致的，在 MOS 上查了下，果然是这个问题（这里顺带提一下，**Oracle MOS 现在也有了 AI 功能**）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912026965469573120_395407.png)

可以看到这里 /etc/hosts 中重复的部分确实会导致 `Not All Endpoints Registered` 问题。当不使用 DNS 进行解析 SCAN 的时候，都是通过识别 /etc/hosts 文件中的 rac-scan 对应的解析进行配置集群，可以看到这里 rac-scan 有两行，所以会创建 2 个 scan 监听：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912027904028979200_395407.png)

但是因为 rac-scan 对应的是同一个 IP，自然是会报错，所以也就导致集群出现错误，安装失败。

# 解决方案
删除 /etc/hosts 文件中重复配置的部分，只保留脚本生成的配置即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912028203309346816_395407.png)

修改之后，再次执行一键安装脚本，问题解决：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912074376573366272_395407.png)

问题解决。

# 写在最后
建议在干净的服务器主机系统上执行安装脚本，这样才能确保成功率，因为脚本是基于干净的操作系统开发，很多人为的修改是无法预判的，你的任何操作和配置都有可能影响到脚本的成功执行。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250415-1912031432839540736_395407.png)

>目前 Oracle 一键安装脚本已经部分开源（单机）：[https://gitee.com/luciferlpc/OracleShellInstall](https://www.yuque.com/luciferliu/oracleshellinstall#%E3%80%8AOracle%20%E6%95%B0%E6%8D%AE%E5%BA%93%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E8%84%9A%E6%9C%AC%E3%80%8B)

需要体验可自行下载使用！

>**免责声明**：本脚本仅用于新服务器上实施部署数据库使用，严禁在已运行数据库的主机上执行，以免发生数据丢失或者损坏，造成不可挽回的损失！！！ 
