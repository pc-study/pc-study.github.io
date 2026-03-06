---
title: 玩转rlwrap，敲命令会更舒适！
date: 2021-06-23 21:22:49
tags: [dba,rlwrap]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/73454
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)


# 前言

> 相信大家在Linux主机使用sqlplus命令行工具时，经常会抱怨命令输错不好回退，或者刚输入的命令想再次执行，无法通过上下翻页切换的情况。

**<font color='blue'>那么，是否有方法可以解决呢？</font>**
  
**答案是肯定的，安装配置`rlwrap`即可。**
  
# 一、介绍

>[rlwrap](https://github.com/hanslub42/rlwrap) 是GitHub的一个项目：使用readline封装一些linux命令。例如：sqlplus，rman等等，配合 `alias` 一起食用更佳。

# 二、安装与配置

**1、yum安装readline依赖包**
```
yum install -y readline*
```

**注意：需要提前好配置yum源。**

**2、解压rlwrap安装包**
```
tar -xvf rlwrap-0.42.tar.gz
```

>**下载地址：**[https://github.com/hanslub42/rlwrap/releases/tag/v0.45.2](https://github.com/hanslub42/rlwrap/releases/tag/v0.45.2)

**3、安装**
```
cd rlwrap-0.42
./configure && make && make install
```

**4、配置环境变量**
```
##配置oracle用户环境变量
cat <<EOF>>/home/oracle/.bash_profile
alias sqlplus='rlwrap sqlplus'
alias rman='rlwrap rman'
alias lsnrctl='rlwrap lsnrctl'
alias asmcmd='rlwrap asmcmd'
alias adrci='rlwrap adrci'
EOF

## 环境变量生效
source /home/oracle/.bash_profile
```
**<font color='blue'>至此，rlwrap工具就配置完成啦，可以开心的翱翔在sqlplus命令行中了。</font>**


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