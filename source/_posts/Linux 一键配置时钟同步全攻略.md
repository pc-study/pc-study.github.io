---
title: Linux 一键配置时钟同步全攻略
date: 2024-07-23 11:42:53
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1815575697914605568
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC]

# 前言
为了确保 Oracle RAC 环境中的时间同步，通常会使用网络时间协议 (NTP) 或 chrony 来同步各节点的系统时间。这可以确保所有节点都具有一致的时间，从而保证数据库的正常运行和数据的一致性。

首先要先了解下这两种方式的区别以及优缺点，可参考红帽官方文档：
- [使用 ntpd 配置 NTP](https://docs.redhat.com/zh_hans/documentation/red_hat_enterprise_linux/7/html/system_administrators_guide/ch-configuring_ntp_using_ntpd)
- [使用 chrony 套件配置 NTP](https://docs.redhat.com/zh_hans/documentation/red_hat_enterprise_linux/7/html/system_administrators_guide/ch-configuring_ntp_using_the_chrony_suite)

所以在配置时钟同步时，到底是选择 `NTP` 还是 `Chrony` 呢？

# ntpd 和 chronyd 之间的区别
在 **`Red Hat Enterprise Linux 7`** 之前的版本中，默认都是使用 NTP 来配置时钟同步，但在从 Red Hat Enterprise Linux 7 开始，NTP 的用户空间守护进程变成了 chronyd。**所以要使用 ntpd 守护进程，则必须禁用chronyd，相反则需要禁用 ntpd。**

在 **`Red Hat Enterprise Linux 8`** 之后的版本，则完全放弃了 NTP，必须使用 `Chrony` 来配置时钟同步。

**官方选择替换 ntpd，必然是认为 chronyd 可以优于 ntpd，提供了以下原因：**
- chronyd 可以正常工作，其中对时间参考的访问是间歇性的，而 ntpd 需要定期轮询时间引用才能正常工作。
即使网络在较长时间内拥塞，chronyd 也能表现良好。
- chronyd 通常可以更快准确地同步时钟。
- chronyd 能够快速适应时钟速率的突然变化。例如，由于碳粉电器温度的变化，ntpd 可能需要很长时间才能再次下降。
- 在默认配置中，chronyd 从不调整时钟在系统启动时同步的时间，以便不设置其他正在运行的程序。ntpd 也可以配置为从不调整时间，但是它必须使用不同的调整时钟的方法，这种方法存在一些缺点，包括对时钟准确性的负面影响。
- chronyd 可以调整较大范围内 Linux 系统上的时钟速率，即使在时钟中断或不稳定的机器上运行。例如，在某些虚拟机上。
- chronyd 比较小，使用较少的内存，仅在需要时才会唤醒 CPU，这更有利于节能。

**chronyd 可以执行 ntpd 不能执行的操作：**
- chronyd 支持隔离的网络，其中唯一的调整时间方法是手动输入。例如，管理员看一下时钟。
- chronyd 可以检查在不同更新中更正的错误，以估算计算机获得或丢失时间的速率，并随后使用此估算来调整计算机时钟。
- chronyd 支持降低实时时钟的增益或丢失率，例如维护关闭计算机时间的时钟。当系统引导时，它可以使用实时时钟调整时间值来设置系统时间。这些实时时钟设施目前仅在 Linux 系统上可用。
- chronyd 支持 Linux 上的硬件时间戳，允许在本地网络上进行非常准确的同步。

**ntpd 可以执行 chronyd 不能执行的操作：**
- ntpd 支持 NTP 版本 4(RFC 5905)的所有工作模式，包括广播、多播和多播客户端和服务器。请注意，广播和多播模式本质上也不如普通服务器和客户端模式准确且安全性较低，因此通常应避免使用。
- ntpd 支持自动密钥协议(RFC 5906)，用于通过公钥加密对服务器进行身份验证。请注意，该协议已被证明不安全，并可能替换为网络时间安全(NTS)规范的实施。
- ntpd 包含许多参考时钟的驱动程序，而 chronyd 依赖于其他程序（如 gpsd ）使用共享内存(SHM)或 Unix 域套接字(SOCK)从参考时钟访问数据。

经过以上对比得出结论，除非是系统不支持 chrony 的工具管理或监控的系统外，均建议使用 **`chrony`** 来配置硬件时钟。

# 配置 NTP
当没有 Chrony 服务时只能使用 NTP 来配置时钟同步，本文不针对配置讲解过多，主要分享如何快速配置时钟同步。

以下配置命令可一键执行配置：
```bash
# 最小化安装系统需要手动安装 ntp 软件
yum install -y ntp
# 启动和开机启动 ntpd 服务
service ntpd start
chkconfig ntpd on
# 时间服务器 IP，请根据实际的IP进行替换
timeserver_ip=192.168.6.101
# 删除默认的时间服务器配置
sed -i '/^server/d' /etc/ntp.conf
# 写入新的时间服务器配置
cat<<-EOF>/etc/ntp.conf
server $timeserver_ip iburst
tos maxdist 30
tinker panic 0
EOF
# 创建 ntpd 进程ID文件
touch /var/run/ntpd.pid
# 编辑 sysconfig 文件来配置 ntpd 服务
cat<<-\EOF>/etc/sysconfig/ntpd
OPTIONS="-g -x -p /var/run/ntpd.pid"
SYNC_HWCLOCK=yes
EOF
# 重启 ntpd 服务，并检查其状态及时间同步情况
service ntpd restart
# 检查时间同步情况
ntpstat
ntpq -p -n
```
如果是 Red Hat Enterprise Linux 7 上配置 ntp，需要先手动禁用 chrony 服务，否则会造成冲突导致无法正常同步时钟：
```bash
# 禁用 chronyd 服务
systemctl stop chronyd.service
systemctl disable chronyd.service
mv /etc/chrony.conf /etc/chrony.conf.bak
```
拓展一下，如果需要使用 `ntpdate` 配合 crontab 定时任务来配置时钟同步的方式，则需要禁用 ntp 服务：
```bash
# 最小化安装系统需要手动安装 ntpdate 软件
yum install -y ntpdate
# 禁用 ntpd 服务
## rhel6
service ntpd stop
chkconfig ntpd off
## rhel7
systemctl stop ntpd
systemctl disable ntpd
# 时间服务器 IP，请根据实际的IP进行替换
timeserver_ip=192.168.6.101
# 配置 crontab 计划任务，每天中午 12 点执行一次，定时计划根据实际需求自行修改即可
cat<<-EOF>>/var/spool/cron/root
00 12 * * * /usr/sbin/ntpdate -u $timeserver_ip && /usr/sbin/hwclock -w
EOF
## 查看计划任务
crontab -l
## 手动执行验证
/usr/sbin/ntpdate -u $timeserver_ip && /usr/sbin/hwclock -w
```

# 配置 Chrony
Chrony 的配置方式更简单：
```bash
# 最小化安装系统需要手动安装 chrony 软件
yum install -y chrony
# 禁用 ntpd 服务，只针对 rhel7 系统
systemctl start ntpd.service
systemctl disable ntpd.service
# 启动和开机启动 chronyd 服务
systemctl start chronyd.service
systemctl enable chronyd.service
# 时间服务器 IP，请根据实际的IP进行替换
timeserver_ip=192.168.6.101
# 删除默认的时间服务器配置
sed -i '/^server/d' /etc/chrony.conf
# 写入新的时间服务器配置
cat<<-EOF>/etc/chrony.conf
server $timeserver_ip iburst
EOF
# 重启 chrony 服务，并检查其状态及时间同步情况
systemctl restart chronyd.service
# 检查时间同步情况
chronyc tracking
chronyc sources -v
```
拓展一下，如果需要使用 `chronyd` 配合 crontab 定时任务来配置时钟同步的方式：
```bash
# 时间服务器 IP，请根据实际的IP进行替换
timeserver_ip=192.168.6.101
# 配置 crontab 计划任务，每天中午 12 点执行一次，定时计划根据实际需求自行修改即可
cat<<-EOF>>/var/spool/cron/root
00 12 * * * /usr/sbin/chronyd -q 'server $timeserver_ip iburst' && /usr/sbin/hwclock -w
EOF
## 查看计划任务
crontab -l
## 手动执行验证
/usr/sbin/chronyd -q 'server $timeserver_ip iburst' && /usr/sbin/hwclock -w
```
如有错误，欢迎指正。

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