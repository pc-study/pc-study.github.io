---
title: 虚拟机玩转 Veritas NetBackup（NBU）之 Linux 配置 NBU 客户端
date: 2022-01-26 20:59:58
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/242907
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
NBU 的使用需要在客户端安装配置，否则无法使用，NBU 客户端支持 Linux、Window 以及 AIX 三个平台，安装过程都比较简单，本文介绍下如何在 Linux 下配置 NBU 客户端。

# 一、上传并解压客户端安装包
首先下载 Linux 的 NBU 客户端软件：
- [NetBackup_8.1.1_CLIENTS2.tar.gz](https://pan.baidu.com/s/1LZ_VzRnl7aTpW6AP0mkypA)

>提取码：`meuq`

```bash
## 本地上传安装包
scp NetBackup_8.1.1_CLIENTS2.tar.gz root@10.211.55.222:/root
## 连接到客户端
ssh root@10.211.55.222
## 解压安装包
tar -xf NetBackup_8.1.1_CLIENTS2.tar.gz
```
![](https://img-blog.csdnimg.cn/831da55c12d94b3ebcbf49334d8b2ac2.png)

# 二、配置解析
客户端和服务端主机均需要添加主机解析，在 /etc/hosts 文件中添加即可！
```bash
cat<<EOF>>/etc/hosts
10.211.55.111 nbu
10.211.55.222 Lucifer
EOF

## 测试 ping
ping nbu
ping Lucifer
```
**服务端：**

![](https://img-blog.csdnimg.cn/72f4ce902953422ea947c7c0663b3285.png)

**客户端：**

![](https://img-blog.csdnimg.cn/030516b0d41f4e8fa8bb93daac5343f1.png)
# 三、客户端安装软件
配置好解析之后，就可以开始安装 NBU 客户端软件了：
```bash
## root 用户下执行
cd ~/NetBackup_8.1.1_CLIENTS2/
./install
```
![](https://img-blog.csdnimg.cn/128a570cd8ee42a5af83747f6070bef6.png)

📢 注意：安装过程中需要使用 Token，在 NBU 管理界面获取：

![](https://img-blog.csdnimg.cn/70703188c960410a80b9bdf1fa777881.png)

安装过程中的选项：
- Do you wish to continue? [y,n] (y)
- Do you want to install the NetBackup client software for this client? [y,n] (y)
- Enter the name of the NetBackup master server : nbu
- name of the NetBackup client? [y,n] (y)
- Is this correct? [y,n] y
- Enter the authorization token for nbu or q to skip: MEWWOCTLVZUSTJIQ

![](https://img-blog.csdnimg.cn/8a2f1209d6ce45ba85b958722a0fe43a.png)

**📢 注意：** 两台主机需要保持时间同步，否则安装过程中报错！

# 四、libobk.so
如果是客户端是 Oracle 数据库，就需要执行链接 libobk.so 文件，否则无法用于备份恢复，配置比较简单：
```bash
su - oracle
cd /usr/openv/netbackup/bin
./oracle_link
```
![](https://img-blog.csdnimg.cn/5704c04e65c54e279bc06ee00a1394a7.png)

至此，Linux 配置 NBU 客户端就完成了。
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