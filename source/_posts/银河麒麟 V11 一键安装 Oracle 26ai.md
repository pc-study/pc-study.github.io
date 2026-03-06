---
title: 银河麒麟 V11 一键安装 Oracle 26ai
date: 2026-02-26 17:31:12
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2026952073901318144
---

昨天适配了银河麒麟 V11 一键安装 Oracle 19C，有朋友问：**新出的 Oracle 26ai 也可以安装吗？**

>答案：必须是可以的！

本文演示一下 Oracle 26ai 在银河麒麟 V11 系统的一键安装：
```bash
[root@kylinv11:/root]# cat /etc/os-release
NAME="Kylin Linux Advanced Server"
VERSION="V11 (Swan25)"
ID="kylin"
VERSION_ID="V11"
PRETTY_NAME="Kylin Linux Advanced Server V11 (Swan25)"
ANSI_COLOR="0;31"

[root@kylinv11 soft]# ll
-rw-r--r-- 1 oracle oinstall 2406058543  2月26日 14:07 LINUX.X64_2326100_db_home.zip
-rwxr-xr-x 1 root root     237245  2月26日 14:06 OracleShellInstall
```
不管是什么操作系统，安装步骤以及命令都是一致的，同一套命令就可以一键执行安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260226-2026949261276045312_395407.png)

重启后，检查数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260226-2026951036183863296_395407.png)

同时，脚本依然自动执行了全面的数据库优化，使 Oracle 26ai 在麒麟系统上发挥最佳性能。

从 19c 到 26ai，从 CentOS 到麒麟、龙蜥、openEuler，这套一键安装脚本始终无需修改，真正做到了“一次适配，永久兼容”。

如果你也想在国产操作系统上快速部署最新版 Oracle，不妨试试这个脚本。后续还将支持更多数据库版本和操作系统，欢迎持续关注！