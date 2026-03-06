---
title: ❤️ 新手向：⭐️接近零基础⭐️ Oracle Linux 7 安装 Oracle 11GR2 RAC
date: 2021-07-30 13:06:19
tags: [玩转 vagrant,rac,oracle安装]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/88647
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)


# 🌲 前言 🌲
💥 最近，在接触了解 `Vagrant `之后，我立刻就想到了使用 `Vagrant` 安装 `Oracle` 数据库的想法。于是开始研究如何玩转，经过一番折腾之后，配置我之前写的 Shell 一键安装脚本，终于是实现了，这次就来分享一下给大家。🙉 绝对技术干货，特别适合用于学习环境的搭建！ ❤️ **ヾ(◍°∇°◍)ﾉﾞ** ❤️

# 💦 准备工作 💦
首先需要对 Vagrant 和 Oracle RAC 需要有一定的了解，不需要精通，但是需要知道简单的玩法。不了解的可以看一下以下文章：

> - **[☀️ 福利向：⚡️万字图文⚡️ 带你 Vagrant 从入门到超神！❤️](https://www.modb.pro/db/88457)**
> - **[一步步教你Linux7安装Oracle RAC（11GR2版本）](https://www.modb.pro/db/70805)** 

## ⭐️ 需要提前安装软件
> - Vagrant
> - VirtualBox
> - Git

## 🔥 从 Github/Gitee 下载脚本源码 
> - https://gitee.com/luciferlpc/InstallOracleshell
> - https://github.com/pc-study/InstallOracleshell

```bash
git clone https://hub.fastgit.org/pc-study/InstallOracleshell.git
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/b86e56700a23414e86f1a4252a2c21b1.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/c11b662bba0b40d2a4ae74212e463c81.png)
## ☀️ 准备安装介质
将安装介质存放在 `InstallOracleshell/vagrant-OracleRAC/orcl_software` 目录下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/21538cb3ff4e442c957ad58c183c4fd5.png)

❤️ 需要安装介质的朋友可以关注公众号免费获取！详情可以查看如下文章：❤️

> **[精心整理Oracle数据库各版本（软件安装包+最新补丁包），附下载链接🔗](https://www.modb.pro/db/81506)**

**<font color='green'>至此，准备工作就已经做好了！</font>**

# ☁️ 开始安装 ☁️
确保准备工作都已做好，进入 Vagrantfile 所在目录 `/InstallOracleshell/vagrant-OracleRAC`。

## 🌟 Vagrant 安装配置操作系统

**💙 执行 `Vagrant up` 开始安装配置操作系统：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/7c846c803cfe47999e5666a48ce57dee.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/82762adca0e44d7da5d5ce121febe166.png)

**💤 经过短暂等待，两台 Oracle Linux 7 操作系统和共享存储磁盘已经成功创建。如下：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/7a4289434eb84d08888274ae0885eb86.png)

**<font color='green'>至此，操作系统级配置已全部完成。</font>**

## 💛 OracleShell 脚本执行安装
此时，需要手动连接到 `node1` 主机，执行 OracleShell 一键安装脚本开始安装 RAC：
```bash
vagrant ssh node1
su - root
cd /soft
sh rac_install.sh
```
**<font color='red'>注意：所有密码均为 `oracle`。</font>**

![在这里插入图片描述](https://img-blog.csdnimg.cn/f71a6e00cf5e4b60a7f56bd0f45edaf5.png)

**🌀  <font color='blue'>正式开始安装进程：</font>🌀**

![在这里插入图片描述](https://img-blog.csdnimg.cn/faa7a1d40d184ae9be4fb8efc3b09975.png)

<font color='green'>**🐒 经过漫长的等待，大概 2 - 3 小时左右。Oracle RAC 安装部署成功！🎉**</font>

![在这里插入图片描述](https://img-blog.csdnimg.cn/4033dbd8f262412992c5b9c115ac2758.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2b50c1f17f6e4537a679ead544620d97.png)

**<font color='green'>至此，Oracle RAC 已经安装结束，退出主机，准备重启。</font>**
##  🌻 安装后重启检查
这里我是通过 vagrant 命令来操作管理，当然也可以打开 VirtualBox 来进行操作！

**❄️ Vagrant 直接关闭两节点主机：**
```bash
vagrant halt
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/6f4cba2023cf417991f6b9ca75c60abe.png)

**🌟 Vagrant 重新开启两节点主机：**

```bash
vagrant up
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/e5af7d3ac50f424291b0764ceddd53ea.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/b4bcc78b457c432bac738e01c84a4a22.png)

**🌟 Vagrant 连接主机 node1 节点：**

```bash
vagrant ssh node1
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/53a69321e6174285a0103846f341806c.png)

**🌟 检查集群状态和补丁情况：**

```bash
su - grid
crs_stat -v -t
opatch lspatches
asmcmd lsdg
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/542160f437b045449287d596d7de02df.png)

**🌟 检查数据库实例和补丁情况：**
```bash
su - oracle
opatch lspatches
sqlplus / as sysdba
select isntance_name,status from gv$instance;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/0a65abc395b84887b89ee19ac8905415.png)

**<font color='green'>OK，演示到此结束，想了解更多细节，大家自己玩吧！👋🏻</font>**
# 💡 写在最后
目前该脚本仅支持 `Oracle Linux 7` 安装 `Oracle 11GR2 RAC`。当然，如果你足够了解该脚本，可自定义脚本参数，自然是支持各种版本的 RAC 安装。博主由于精力有限，不再继续开发，仅为了验证实现最初的想法。如果你感兴趣，想要进一步完善脚本，那我表示非常欢迎。❤️ 可以联系我，一起讨论下~ 😄

> 关于 Shell 脚本玩法，可以关注 **[Oracle一键安装脚本](https://blog.csdn.net/m0_50546016/category_11127389.html)** 专栏 ！


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