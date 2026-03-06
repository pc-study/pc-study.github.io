---
title: Oracle RAC 宕机报错：ORA-2730X
date: 2025-10-22 13:10:08
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1980864067677990912
---

# 前言
今天有一套测试 Oracle 11GR2 RAC 数据库挂了，本文记录分析过程以及解决方案。 

# 问题分析与解决
检查数据库 alert 日志：
```bash
ORA-63999: data file suffered media failure
ORA-01114: IO error writing block to file 3 (block # 7667)
ORA-01110: data file 3: '+DATA/btdbt/datafile/undotbs1.258.1101901997'
ORA-15055: unable to connect to ASM instance
ORA-15055: unable to connect to ASM instance
ORA-15055: unable to connect to ASM instance
ORA-00600: internal error code, arguments: [ORA_NPI_ERROR], [603], [ORA-00603: ORACLE server session terminated by fatal error
ORA-27504: IPC error creating OSD context
ORA-27300: OS system dependent operation:sendmsg failed with status: 105
ORA-27301: OS failure message: No buffer space available
ORA-27302: failure occurred at: sskgxpsnd2
], [], [], [], [], [], [], [], [], []
DBW0 (ospid: 10620): terminating the instance due to error 63999
```
这个错误已经很眼熟了，遇到过很多次：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251022-1980857059180556288_395407.png)

需要调整 `MTU` 和 `vm.min_free_kbytes`：
```bash
ifconfig lo mtu 16436
echo "MTU=16436" >> /etc/sysconfig/network-scripts/ifcfg-lo
service network restart

# min_free_kbytes = os_memory_total * 0.004
os_memory_total=$(awk '/MemTotal/{print $2}' /proc/meminfo)
((min_free_kbytes = os_memory_total / 250))
echo "vm.min_free_kbytes=$min_free_kbytes " >> /etc/sysctl.conf
sysctl -p
```
因为在数据库日志中看到有连接不上 ASM 实例的提示，需要再看下 asm 日志：
```bash
KSXP IPC protocol is incompatible with instance 2
Errors in file /u01/app/grid/diag/asm/+asm/+ASM1/trace/+ASM1_lmon_18227.trc:
ORA-27300: OS system dependent operation:config_check failed with status: 0
ORA-27301: OS failure message: Error 0
ORA-27302: failure occurred at: skgxpvalpid
ORA-27303: additional information: Remote port MTU does not match local MTU. [local: 9000, remote: 1500] (169.254.213.94)
```
检查两个节点的心跳网卡 MTU 值：
```bash
## 节点一
eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9000 qdisc pfifo_fast state UP group default qlen 1000

## 节点二
eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
```
修改节点二的 MTU 值为 9000：
```bash
ifconfig eth1 mtu 9000
echo "MTU=9000" >> /etc/sysconfig/network-scripts/ifcfg-eth1
```
重启 crs 生效 MTU：
```bash
crsctl stop crs
crsctl start crs
```
问题解决。

---

参考 MOS 文档：
- Unable To Start ASM RAC Instances Due To ORA-27303: Remote Port MTU Does Not Match Local MTU. (Doc ID 947223.1)
- Troubleshooting ORA-27300 ORA-27301 ORA-27302 Errors (Doc ID 579365.1)
- Oracle Linux: ORA-27301:OS Failure Message: No Buffer Space Available (Doc ID 2041723.1)
