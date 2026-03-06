---
title: Oracle 短时间内误删数据，如何快速找回？（UNDO）
date: 2021-10-10 10:29:48
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/129029
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

首先，这个短时间内，通常是值 undo 段没有被覆盖，undo 保留的时间为多长呢？

1、需要看 undo_retention 的设置，默认为 900s，也就是 15 分钟。
2、需要看数据库的业务繁忙程度，如果1天切一个归档那种，3天前删的说不定都能用 UNDO 找回来。

好的，科普完了！

**<font color='orage'>如果，两分钟前不小心误删了一笔数据，如何快速找回？</font>**

1、查看 UNDO 中 5 分钟前数据是否还在
```sql
select * from 用户.表 as of timestamp to_timestamp('2021-09-12 10:30:00', 'yyyy-mm-dd hh24:mi:ss');
```

2、防止 UNDO 中数据被覆盖，先创建一张备份表将5分钟前数据备份
```sql
create table 用户.表_20201217
as
select * from 用户.表 as of timestamp to_timestamp('2021-09-12 10:30:00', 'yyyy-mm-dd hh24:mi:ss');
```

3、用备份表和原表比对数据，将误删的数据插入原表中

**没有sql，自己搞吧！可以用 PLSQL等工具导出！**


**注意：此方法仅适用于 delete 等 DML 误删误操作恢复，DDL 不支持！**


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