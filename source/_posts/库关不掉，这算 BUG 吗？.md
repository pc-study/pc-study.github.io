---
title: 库关不掉，这算 BUG 吗？
date: 2025-12-14 16:34:45
tags: [墨力计划,崖山数据库,yashandb体验官,数据库实操,性能优化]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1999303062712836096
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

# 前言

今天原本打算研究崖山数据库的 yasrman 备份功能，结果在第一步开启归档模式、关闭数据库时就卡住了——**数据库怎么都关不掉**！折腾了一下午，总算摸清了 YAC 集群的启停方式、步骤，以及各种进程和 monit 自启机制之间复杂的关系，还是有点弯弯绕绕的。

> **说明**：本文基于内测版本 YAC 23.5.1.100，非正式版本。内容主要为个人记录，也希望能帮助大家更好地理解 YAC 的启停逻辑。

**最新更新**：问题已解决，是因为 `yashan_monit.service` 同时启动了多个 monit 进程所致：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000415839758147584_395407.png)

我理解这个服务是为了 ycsrootagent 启动而建的，不应该包含 monit 逻辑，monit 进程以及配置了 rc.local 去启动：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000416207028183040_395407.png)

所以只需要把 `yashan_monit.service` 服务中 monit 的逻辑去掉就可以了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251215-2000416770381930496_395407.png)

问题解决。

# 问题分析
先描述一下我的问题，就是当我使用 `yasboot` 命令关闭 YAC 集群时，遇到了一个奇怪的现象：**集群刚被关闭，主节点的服务又被立即拉起来了！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999409770693468160_395407.png)

经过一番排查，发现问题出在 `monit` 监控进程上，我理解的 `yasboot` 关闭集群的逻辑应该是这样的：

1.  执行 `yasboot cluster stop` 命令关闭集群；
2.  所有节点依次取消 monit 对数据库服务进程的监控（unwatch）；
3.  所有节点依次执行 `ycsctl stop ycs` 关闭进程。

但现在第 2 步出现了异常：主节点的数据库服务进程在被取消监控后，很快又被重新监控（watch）了。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999410844879888384_395407.png)

这直接导致主节点的数据库实例被 monit 重新拉起：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999411005735133184_395407.png)

问题的症结大致如此，不过 [**monit**](https://mmonit.com/monit/) 是一个开源的监控软件，所以也不知道算不算是一个 BUG？

问题先说到这，接着来介绍一下崖山数据库的 YAC 集群启停步骤以及逻辑。

# YAC 服务进程
首先，我们需要了解 YAC 共享集群的进程体系：一个共享集群服务器上需要运行集群服务进程和数据库进程，以共同提供数据库服务。

集群服务进程主要包括：

- **yascsm（简称 YCSM）进程**：负责 yascs 进程的正常启停并监控 yascs 进程是否异常，提供重启 yascs 的高可用能力。
- **yascs（简称 YCS）进程**：负责构建和维护集群一致的成员关系，启停并监控崖山文件系统和数据库服务，并在集群成员服务器异常时提供故障仲裁能力。
- **ycsrootagent（简称 YCSRA）进程**：特权进程，需要 root 权限启动，提供执行 I/O Fencing 等高权限操作的能力。

默认情况下，集群服务器的启停涵盖了 YCSM、YCS、YFS 和数据库实例。其中，YCSM 是 YCS 的专属监控进程，YFS 属于 YCS 的内嵌资源，而数据库实例则属于 YCS 的外部资源。

这些服务在启停过程中的顺序和关系如下：

1. 启动 YCSM 之后，由 YCSM 启动并看护 YCS。
2. 启动 YCS 时会自动启动 YFS 服务，停止 YCS 也会自动停止 YFS 服务。
3. 数据库实例启动依赖 YFS 管理的文件系统以及 YCS 管理的拓扑信息，所以在 YCS/YFS 服务启动成功后，再由 YCS 启动数据库实例。
4. 停止 YCS 时，将先停止数据库实例，再停止 YCS/YFS 服务，最后 YCSM 退出。

YCSRA 不参与上述启停流程，当集群配置了 I/O Fencing 等必须在 root 权限下与操作系统和硬件设备交互的服务时，需要用户在集群部署时、服务器开机时手动 sudo 启动 YCSRA；若 YCSRA 进程异常，也需要用户手动 sudo 重启。

我们可以通过 `ycsctl status` 命令来检查 YCS 的运行状态：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999305270598656000_395407.png)

YCS 控制管理整个共享集群/分布式集群的运行，启停状态按照其所管理的资源进行展示，包括：

- **YCS 字段**：表示 YCS 服务的当前状态。
- **YFS 字段**：表示 YFS 服务的当前状态。
- **DB_STATE 字段**：表示数据库实例的当前状态。
- **Target 字段**：表示数据库实例是否纳入 YCS 一起启动，根据参数 AUTO_START 而定，当 AUTO_START=ALWAYS 时，Target 为 online，当 AUTO_START=NEVER 时，Target 为 offline。

了解了 YAC 的服务进程和启动步骤后，接下来我们介绍 YAC 的两种启停方式。

# YAC 启停方式

YAC 共享集群支持以下两种启停方式：

- **使用 `ycsctl` 工具**：用于启停**单个服务器**上的实例。使用前，需在目标服务器上正确配置环境变量 `$YASCS_HOME`（即 YCS HOME 目录），该目录下包含管理外部资源的 shell 脚本。
- **使用 `yasboot` 工具**：用于启停**整个集群**或**指定节点**（同时操作 YCS 服务和数据库实例）。

下面详细介绍如何使用这两种工具来管理 YAC 集群数据库。

## 使用 ycsctl 启停

`ycsctl` 是 YashanDB 的 YCS 管理工具，可用于实现集群级别和节点级别的管理操作。

使用前，需要确保已在每台服务器上正确配置 `$YASCS_HOME` 环境变量：

```bash
echo $YASCS_HOME
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999343836011782144_395407.png)

通过 `ycsctl -H` 可以查看帮助信息，其集群管理命令包含一系列配置命令，这些配置信息会存储在 YCR 盘中，可通过 `ycsctl show config` 查看：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999344192598925312_395407.png)

### 启动 YCS

使用 ycsctl 启动集群时，可以通过 `AUTO_START` 参数控制数据库实例是否随 YCS 一同启动：

- **ALWAYS**（默认值）：数据库实例与 YCS 一起启动；
- **NEVER**：数据库实例不与 YCS 一起启动，可后续由外部命令单独启动。

可以使用 `ycsctl get AUTO_START` 命令查看当前参数值：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999383577956540416_395407.png)

默认情况下，执行 `ycsctl start ycs` 会启动 YCS 进程并自动带起数据库实例：

```bash
ycsctl start ycs
ycsctl status
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999382707852877824_395407.png)

可以使用 `ycsctl set AUTO_START NEVER` 修改参数值。但需要注意的是，此修改仅更新配置文件，需重启 YCS 才能生效：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999386017632690176_395407.png)

该参数是实例级别的，在哪个节点修改，就对哪个节点生效：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999386982112894976_395407.png)

如果 `AUTO_START` 参数值为 `NEVER`，则可以使用 `ycsctl start instance` 命令单独启动数据库实例。可以通过 `-m` 参数指定启动状态（如 MOUNT），不指定则默认启动到 OPEN 状态：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999386909194919936_395407.png)

### 停止 YCS

在使用 `ycsctl stop ycs` 停止 YCS 进程之前，**必须**先确保 monit 进程没有在监控 `yasdb-ce-1-1` 服务进程，否则停止后它会被立即拉起：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999389509508210688_395407.png)

先手动关闭进程监控：

```bash
yasboot monit unwatch -c yasdb -n 1-1 -d
yasboot monit summary -c yasdb
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999390013302333440_395407.png)

再次停止 YCS：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999390401879941120_395407.png)

已经可以成功停止 YCS，并且不会被自动拉起。

## yasboot 启停

使用 yasboot 工具可以实现整个共享集群的启停：

```bash
# 检查共享集群
yasboot cluster status -c yasdb -p Yashan.123
# 停止共享集群
yasboot cluster stop -c yasdb -p Yashan.123
# 启动共享集群
yasboot cluster start -c yasdb -p Yashan.123
# 重启共享集群
yasboot cluster restart -c yasdb -p Yashan.123
```

以我的测试环境为例：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999364821133910016_395407.png)

**注意**：使用 `yasboot` 进行集群启停时，不支持单独指定数据库实例的启动状态（即无法临时调整 `AUTO_START` 参数），否则可能导致启动失败。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999317119256305664_395407.png)

> **补充**：使用 `yasboot` 工具启动或重启共享集群时，目前暂不支持将集群启动到 MOUNT 状态。

**总结一下**：`ycsctl` 是针对**单个节点**的实例进行操作，而 `yasboot` 则是针对**整个集群**。`yasboot` 的启停过程，本质上等同于对集群中的每个服务器依次执行前面介绍的 `ycsctl` 启动和停止操作。

# 是 BUG 吗？
介绍完 YAC 集群的两种启停方式后，让我们回到文章开头提到的那个疑似 BUG 的问题。要彻底弄清楚它，必须先了解 monit 进程。

## monit 进程介绍

monit 进程用于监控 YashanDB 的各个关键进程。一旦它监控的进程挂掉，monit 会自动将其拉起。在安装 YAC 时，我们通常会配置 monit 为开机自启：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000105149742800896_395407.png)

可以通过 `yasboot` 命令查看 monit 的状态信息：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251212-1999351012818247680_395407.png)

如前文所述，`yasboot` 的集群操作等效于在每台服务器上执行 `ycsctl` 命令。因此，我们可以通过 `ycsctl` 来测试 monit 对集群启停的实际影响。

**经测试发现**：一旦配置了 monit 进程，在使用 `ycsctl` 启停数据库集群时，**必须**先对应地启停 monit 的监控功能，否则数据库集群会被 monit 自动拉起或阻止关闭。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000107337307725824_395407.png)

当然，使用 `yasboot` 关闭集群时，理论上应该自动处理 monit 的监控状态，但在我的环境中也出现了同样的问题：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000108281772204032_395407.png)

问题的核心在于：**无论我手动使用 `ycsctl` 还是 `yasboot` 关闭集群实例，都会因为 monit 进程的持续监控，导致实例被再次拉起，陷入关不掉、反复启动的循环！**

为了对比，我请群里的曹总在他的 RHEL 8 系统上也进行了测试。结果显示：
- 使用 `ycsctl` 关闭实例后，同样会被 monit 拉起（与我的情况一致）。
- 但使用 `yasboot` 关闭集群后，**实例没有被拉起**。

曹总的测试步骤和结果如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000109181920174080_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000109393414266880_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000109654631325696_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000109484316909568_395407.png)

**这就是问题所在了**：在 RHEL 8 系统上，`yasboot` 成功执行了 `unwatch` 操作并保持；而在我的 Kylin V10 系统上，`yasboot` 执行 `unwatch` 后几秒钟，monit 又自动对 `yasdb-ce` 进程进行了 `watch` 操作！

既然这个问题已经搞清楚了，所以只需要：**关闭 monit 监控**，应该就可以正常关闭 YAC 集群了！

不过这里还有一个问题，还需要注意 `yashan_monit.service` 这个系统服务。这个脚本中包含下面这一段逻辑：

```bash
if ! pgrep -a monit | grep "$YASDB_HOME" > /dev/null; then
	echo "$(date) monit abnormal, try restart..."
	su - $YASDB_USER -c "source ~/.bashrc && $YASDB_HOME/om/bin/monit -c $YASDB_HOME/om/monit/monitrc" &
fi
```

当这个服务处于运行状态时，monit 进程是无法被彻底关闭的——**一旦关闭，又会被该服务自动启动**。

因此，在关闭 monit 进程之前，需要先停止 `yashan_monit.service` 服务（**所有节点**）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000127849848725504_395407.png)

然后再关闭 monit 进程：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000126996128014336_395407.png)

这样 monit 才能被正常关闭。

# 反转！
但是，反转来了，当我把 yashan_monit.service 服务和 monit 服务都关闭之后：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000224820547100672_395407.png)

使用 yasboot 去关闭 YAC 集群时，集群又被拉起了：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251214-2000225002382761984_395407.png)

那看来问题不是出在 monit 服务上了，那到底是什么原因呢？

看了一下两个节点的 run.log，发现节点2的日志里有报错，不知道是否有关：
```bash
2025-12-14 23:31:47.109 798614 [ERROR][errno=00406]: [ICS] ics link 0_2_2,  receive message failed: connection is closed
2025-12-14 23:31:47.567 798597 [WARN] [AXC MSG] ics disconnect event trigger, node(0) version(1)
2025-12-14 23:31:47.568 798597 [ERROR][errno=00402]: [ICS] ics try start node 0 failed: failed to connect socket, errno 111, error message "Connection refused"
YAS-00402 failed to connect socket, errno 111, error message "Connection refused"
YAS-00402 failed to connect socket, errno 111, error message "Connection refused"
YAS-00402 failed to connect socket, errno 111, error message "Connection refused"
```
感兴趣的朋友可以一起看下，后面等有时间再继续分析吧~

# 写在最后

针对该问题，我已经将情况反馈给崖山数据库的研发团队，期待后续的解决方案。

---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)