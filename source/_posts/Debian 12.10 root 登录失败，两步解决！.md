---
title: Debian 12.10 root 登录失败，两步解决！
date: 2025-03-22 19:09:09
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1903396624202739712
---

>大家好，这里是 **DBA学习之路**，专注于提升数据库运维效率。

# 前言
今天看到 debian 正式发布 12.10，安装完成后发现无法登录 root 用户：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903397026616848384_395407.png)

这里我一开始怀疑是 root 密码错了，所以改了一下 root 密码，忘记 root 密码如何修改？

# 修改 root 密码
重启主机：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903397473666740224_395407.png)

第一时间按 e 进入 grub 界面：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903397617757859840_395407.png)

在如图位置添加 `init=/bin/bash`：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903398179467440128_395407.png)

键盘按 `Ctrl + x` 进入命令行界面：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903398647388188672_395407.png)
 
执行 `mount -no remount,rw /` 后，修改 root 密码：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903398922727469056_395407.png)

修改后，重启进入系统：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903399048795664384_395407.png)

再次输入 root 密码，依然无法登录：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903399261925027840_395407.png)

看来不是密码错误的原因，可能是 debian 12.10 默认不允许 root 账户登录。

# 修改 gdm 配置
好在安装的时候创建了一个普通用户，用普通用户登录后，再切换到 root 用户：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903399743967997952_395407.png)

成功切换到 root 用户：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903399955990065152_395407.png)

修改 `/etc/gdm3/daemon.conf` 文件，在 [security] 下面添加一行 `AllowRoot=true`：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903400481125314560_395407.png)

修改 `/etc/pam.d/gdm-password` 文件，注释如下行：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903401544893083648_395407.png)

重启主机，再次登录 root 用户成功：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903402845097963520_395407.png)

使用 ssh 客户端成功连接：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250322-1903403297415901184_395407.png)

问题解决！