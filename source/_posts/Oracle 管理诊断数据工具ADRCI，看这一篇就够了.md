---
title: Oracle 管理诊断数据工具ADRCI，看这一篇就够了
date: 2021-06-10 14:45:15
tags: [oracle,adrci]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/70350
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言

>**健康检查还在慢慢翻alert日志吗？
清理日志还在繁琐的手动rm吗？
Oracle要求收集诊断日志还在慢慢查找吗？**

不妨了解下它：`ADR Command Interpreter(ADRCI)`。

![adrci](https://img-blog.csdnimg.cn/20210610123501220.png)
# 一、介绍
ADRCI 是一个命令行工具，是 Oracle 数据库第 11g 版中引入的故障诊断基础架构的一部分。 ADRCI 使您能够：
>1、查看自动诊断存储库 (ADR) 中的诊断数据。    
2、查看运行状况监视器报告。    
3、将事件和问题信息打包到一个 zip 文件中，以便传输给 Oracle 支持。    

ADR 是一个基于文件的数据库诊断数据存储库，例如跟踪、转储、警报日志、运行状况监视器报告等。 它具有跨多个实例和多个产品的统一目录结构。 从版本 11g 开始，数据库、自动存储管理 (ASM) 和其他 Oracle 产品或组件将所有诊断数据存储在 ADR 中。

**<font color='red'>优势：</font>**
>1、无需数据库实例开启，不影响实例运行。    
2、统一管理多个产品和实例，无需反复切换环境变量。    
3、记录数据库发生的严重错误，方便DBA在ADR中跟踪问题。 每个问题都有一个问题键和一个唯一的问题 ID。可通过命令 `show problem` 来查看错误。    
4、每个问题根据发生的次数记录为一个个事件。当DBA在ADR中跟踪事件，每个事件都由一个数字事件 ID 标识，该 ID 在 ADR 中是唯一的。可通过命令 `show incident -all` 来查看错误。    
5、可以快速将事件和问题信息打包到一个 zip 文件中，以便传输给 Oracle 支持。    
6、可以快速清理大日志文件。    
7、所有平台均支持。    

# 二、如何使用

## 1、健康检查
作为一名DBA，每天对数据库进行健康检查是家常便饭了，那么如何快速高效的进行检查就很重要了。通过ADRCI工具就可以实现，接下来看看如何使用：

>例如，需要检查主机中数据库实例运行是否存在错误：
>首先 `su - oracle` 连接oracle用户，使用 `adrci` 命令进入控制台：    
![adrci](https://img-blog.csdnimg.cn/20210610131746759.png)
>输入 `show problem` 来查看所有实例的运行情况：
![problem](https://img-blog.csdnimg.cn/20210610132023747.png)
>可以看到当前实例 `cdb19c1` 运行过程中没有发生严重错误。如果有多个实例，这里会显示所有实例的情况。

## 2、清理日志
相信大家肯定遇到过因为数据库日志过大的问题，导致撑满磁盘空间或者数据库宕机的情况。所以，及时清理数据库日志是DBA需要经常做的事，通过ADRCI可以方便快捷又安全的实现。

**<font color='blue'>需要在指定用户下进行操作，本次操作环境为rac，所以是grid用户。</font>**

>首先，通过命令 `show home` 查看监听日志的位置：
![监听日志路径](https://img-blog.csdnimg.cn/20210610132753475.png)
>设置当前路径 `set home diag/tnslsnr/rac01/listener`
>使用 `help purge` 命令查看帮助：
![help purge](https://img-blog.csdnimg.cn/20210610133232293.png)
>假设当前alert日志为5G，需要清理日，按时间进行清理，保留10天日志：`purge -age 14400 -type alert` 。
>`-age` 的单位是 `分钟` 。
![purge alert](https://img-blog.csdnimg.cn/20210610133854475.png)
当然，也可以通过指定大小 `-size` 来进行清理整个ADR目录，单位是 `bytes`。

## 3、IPS打包错误日志
一般当数据库遇到一些DBA无法解决的问题或者内部600错误时，会在MOS提交SR来获取Oracle原厂的帮助，当技术人员要求我们提供相关日志时，可以通过adrci工具来打包。

>首先通过 `show incident -all` 获取错误事件ID号
>如需要查看错误事件详细信息：`show incident -mode detail -p "incident_id=72697"`
>查看 `ips` 帮助命令：
![help ips](https://img-blog.csdnimg.cn/20210610141615708.png)
>通过以下命令打包错误事件：
>ips基于事件ID创建一个package：`ips create  package incident 72697`
>将事件加入到package中：`ips add incident 72697 package 1` ，可加入多个事件。
>打包成zip文件放入主机指定位置：`ips generate package 1 in /home/oracle`。

***参考官方文章：*** [ADRCI: ADR Command Interpreter](https://docs.oracle.com/cd/B28359_01/server.111/b28319/adrci.htm#BABBHGFC)

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