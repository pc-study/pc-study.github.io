---
title: Veeam 整机恢复 MySQL 数据库
date: 2025-12-30 08:53:18
tags: [墨力计划,mysql]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2003347522253840384
---

# 前言
Veeam 备份 MySQL 数据库是采取整机备份，通过快照的方式进行备份，当需要对 MySQL 进行恢复的时候，自然也可以进行整机恢复。

本文演示如何使用 Veeam 针对 MySQL 进行整机恢复。

# 前置准备
如果公司有对端口做防火墙限制的，需要开通 VBR 主机和 VCenter 之间的端口。

# 整机恢复

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003385196403040256_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003385322143571968_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003385377042817024_395407.png)

这里点击 Host 选择需要恢复的虚拟化 exsi:

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003385580311371776_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003385712365346816_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003385791989506048_395407.png)

改一下新主机的名称：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003385978481352704_395407.png)

选择合适的网卡 vlan：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003386066851143680_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003386232542928896_395407.png)

开始恢复：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003392304741687296_395407.png)

走 proxy 恢复，可以不走网络，直接走 IO，恢复速度可以提升非常多倍：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251223-2003393722458382336_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251224-2003626898464251904_395407.png)

恢复完成，1.5TB 恢复一共耗时 38 分钟不到。

恢复完成后，记得修改 IP，因为是整机恢复，所以类似于克隆，网卡的UUID需要重新生成，可以使用 `uuidgen` 生成新的 UUID 并替换掉原网卡配置文件中的 UUID，再启动网卡即可。

# 写在最后
Veeam 备份恢复 MySQL 数据库还是比较简单的，通过快照的方式 Veeam 可以确保数据一致性。