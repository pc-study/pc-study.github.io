---
title: 教你三步在MacOS上安装Linux系统，看完就会了
date: 2021-07-11 11:18:22
tags: [linux安装]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/81502
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)


# 前言
- 随着苹果产品的普及，很多IT开发人员都是人手Macbook，当需要安装一些系统用于多系统使用时，自然想到虚拟机，Parallels Desktop可以说是MacOS上体验最好的虚拟机软件。
![parallel desktop](https://img-blog.csdnimg.cn/20210707224203851.png)

**下面将介绍如何在Parallels Desktop上安装Linux系统。**

# 一、下载并安装Parallels Desktop
- Parallels Desktop下载地址：[https://www.parallels.cn/products/desktop/trial/](https://www.parallels.cn/products/desktop/trial/)

**安装方式很简单，不做演示。**

# 二、下载Linux系统
**一般有三种Linux系统比较常用：RedHat 、OracleLinux、Centos 。**
>- RedHat下载：https://developers.redhat.com/products/rhel/download
>- OracleLinux下载：https://yum.oracle.com/oracle-linux-isos.html
>- Centos下载：https://vault.centos.org/

# 三、创建并安装Linux主机
## 1 点击➕添加一台主机
![](https://img-blog.csdnimg.cn/20210531130009158.png)
## 2 双击中间光盘图标
![](https://img-blog.csdnimg.cn/20210531130127494.png)
## 3 选择需要安装的镜像，勾选手动安装选项
![](https://img-blog.csdnimg.cn/20210531130300313.png)
## 4 修改虚拟机名称，安装位置，勾选安装前设定，然后点击创建
![](https://img-blog.csdnimg.cn/20210531130416762.png)
**选择硬件-->CD/DVD-->源-->选择需要安装的镜像源，确认是否需要修改CPU，内存，硬盘等配置；全部修改完毕后点击🔐上锁，关闭配置页面：**

![](https://img-blog.csdnimg.cn/20210531130624982.png)
## 5 点击继续
![](https://img-blog.csdnimg.cn/20210531130835918.png)
## 6 出现这类提示，直接点击确定
![](https://img-blog.csdnimg.cn/20210531130918959.png)
![](https://img-blog.csdnimg.cn/20210531130932551.png)
![](https://img-blog.csdnimg.cn/20210531130941562.png)
## 7 进入安装界面
![](https://img-blog.csdnimg.cn/20210531131013862.png)
## 8 镜像检查，可以ESC跳过检查
![](https://img-blog.csdnimg.cn/20210531131048274.png)
## 9 选择需要的语言
![](https://img-blog.csdnimg.cn/20210531131204134.png)
## 10 关闭KDUMP
![](https://img-blog.csdnimg.cn/2021053113125275.png)
![](https://img-blog.csdnimg.cn/2021053113132985.png)
## 11 选择图形化界面安装
![](https://img-blog.csdnimg.cn/20210531131401463.png)
![](https://img-blog.csdnimg.cn/20210531131446742.png)
## 12 选择时区
![](https://img-blog.csdnimg.cn/20210531131527389.png)
![](https://img-blog.csdnimg.cn/2021053113154673.png)
## 13 手动分配磁盘分区，勾选手动分区，添加分区
![](https://img-blog.csdnimg.cn/20210531131620531.png)
![](https://img-blog.csdnimg.cn/20210531131650620.png)
![](https://img-blog.csdnimg.cn/20210531131710764.png)
![](https://img-blog.csdnimg.cn/20210531131834759.png)
**/boot分区默认2G即可。**
![](https://img-blog.csdnimg.cn/20210531131858159.png)
**swap分区建议与物理内存大小保持一致，可大于物理内存。**
![](https://img-blog.csdnimg.cn/20210531132036158.png)
**剩余空间全部划分给根目录/。**
![](https://img-blog.csdnimg.cn/20210531132117666.png)
![](https://img-blog.csdnimg.cn/2021053113215968.png)
## 14 配置网络和主机名
![](https://img-blog.csdnimg.cn/20210531132221244.png)
![](https://img-blog.csdnimg.cn/20210531132405717.png)
![](https://img-blog.csdnimg.cn/20210531132552335.png)
![](https://img-blog.csdnimg.cn/20210531132614414.png)
## 15 点击开始安装Linux系统
![](https://img-blog.csdnimg.cn/20210531132652986.png)
## 16 修改root用户密码
![](https://img-blog.csdnimg.cn/20210531132736296.png)
![](https://img-blog.csdnimg.cn/20210531132753922.png)
**如果密码强度弱，点击两次done即可。**

## 16 等待安装结束，点击Reboot重启即可
![](https://img-blog.csdnimg.cn/20210531133504422.png)
## 17 勾选license声明
![](https://img-blog.csdnimg.cn/20210531133646407.png)
![](https://img-blog.csdnimg.cn/20210531133733374.png)
## 18 点击完成配置
![](https://img-blog.csdnimg.cn/20210531133816625.png)
## 19 一直下一步即可
![](https://img-blog.csdnimg.cn/20210531133943541.png)
![](https://img-blog.csdnimg.cn/202105311341262.png)
![](https://img-blog.csdnimg.cn/2021053113415128.png)
![](https://img-blog.csdnimg.cn/20210531134213497.png)
![](https://img-blog.csdnimg.cn/20210531134351414.png)
**设置密码，需要强度很高才能通过。**
![](https://img-blog.csdnimg.cn/20210531134512918.png)
**至此，Linux已经安装成功。**



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