---
title: 教你一招：5 分钟定位 Oracle AWR 性能问题！
date: 2025-11-25 13:52:56
tags: [墨力计划,awr,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1993182348326821888
---

# 前言
今天早上收到邮件告警，显示某套应用服务器在昨天夜里出现数据库连接超时问题。根据日志定位，故障发生在 `2025-11-24 14:17:58` 这个时间点，应用连接数据库时发生超时。

如何快速定位并解决数据库性能问题？本文分享一次真实的 `enq: TM - contention` 锁争用排查经历，并介绍如何利用 AI 分析工具提升排查效率。

# AWR 分析
作为 DBA，我首先怀疑问题可能与数据库本身有关，于是立即抓取了对应时段的 AWR 报告和 ASH 报告。初步浏览报告后，问题根源很快浮出水面：**DML 操作与 DDL 操作发生表级锁争用，引发了大量的 `enq: TM - contention` 等待事件**。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993184403904880640_395407.png)

![](https://files.mdnice.com/user/16270/874f537c-625c-453b-b149-4c04b197b148.png)

想着最近安装了老白开发的 **BIC-QA AWR 分析工具**，正好可以拿这个 AWR 报告来试试手：

> https://gitee.com/BIC-QA/bic-qa

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993184744507531264_395407.png)

BIC-QA 是一款专业的 Oracle 数据库 AWR 报告分析工具，最新版本提供了强大的 AI 分析功能，能够帮助 DBA 快速诊断数据库性能问题，获取专业的分析报告和优化建议。

安装及使用方式请参考：

> https://gitee.com/BIC-QA/bic-qa/blob/master/README.md

安装配置好插件之后，通过工具的 AWR 分析功能上传需要分析的 AWR 报告：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993186087603871744_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993186306122407936_395407.png)

分析过程需要一定时间，完成后报告会发送到指定邮箱：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993189595354324992_395407.png)

获取到的分析报告直接明确了问题原因，对于 AWR 报告分析经验不足的技术人员来说，这一功能极为实用，相当于请了一位专业的 DBA 进行问题分析：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993189967284740096_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993190133273812992_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993190198936150016_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993190253701177344_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251125-1993190393417129984_395407.png)

更值得惊喜的是，AI 工具不仅关注本次问题的直接原因，还会综合分析报告中的各项指标，揭示其他潜在问题，帮助我们更全面地理解数据库的健康状况。

# 写在最后
设想一下，当你首次接触一个陌生的数据库环境，可以通过抽样一周的 AWR 报告，使用该工具进行综合分析，快速掌握该数据库的健康状况和优化方向，这种效率提升对于 DBA 工作来说具有重要价值。

![](https://files.mdnice.com/user/16270/48a29ee9-f2be-470d-99f1-b3b4f46d4c06.png)

**心动不如行动**！建议各位 DBA 同行尝试使用这一工具，相信会为你的数据库运维工作带来显著效率提升。最后，向开发这一免费工具造福 DBA 社区的老白致以诚挚的感谢和点赞！
