---
title: Oracle 数据库监听日志过大，怎么清除？
date: 2021-10-21 09:57:36
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/142706
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

Oracle 数据库的监听日志用于保留连接数据库的一些记录以及问题等信息！

当数据库运行长时间之后，日志文件就会一直变大，这时就需要定时清理！如果不清理，当日志大小达到 4G 左右的时候，可能会导致数据库宕机，无法使用！

**以 `Linux` 为例，以下为清除监听日志的详细步骤：**

**1、查询监听日志的位置**
```bash
lsnrctl stat
```
![](https://img-blog.csdnimg.cn/d9ea4260a2224381a13424e96cdefdd3.png)
**如图框中的即监听日志存放的位置！**

**2、查看监听日志文件大小**
```bash
cd /u01/app/oracle/diag/tnslsnr/orcl/listener/
du -sh *
cd trace
```
![](https://img-blog.csdnimg.cn/d96ac18ebc8744b9bda1d3eff3cfc4e8.png)
图中框中的文件夹就是需要清除的监听日志文件：`listener.log`，注意不要超过 **1-2G** ！

**3、停止监听写入**
```bash
lsnrctl set log_status off
```
📢 注意：此操作仅停止日志文件的写入，不影响数据库的运行！

**4、删除或者备份重建日志**
```bash
## 1、直接删除
rm -rf listener.log
## 2、先改名备份，再重建日志文件
mv listener.log listener.log0922
tail -100 listener.log0922 > listener.log
```

**5、开启监听日志写入**
```bash
lsnrctl set log_status on
```

**至此，数据库监听日志已经清除完毕！**

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