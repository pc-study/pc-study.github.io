---
title: 达梦 DMDSC 集群之 DMCSSM 使用指南
date: 2024-12-18 17:28:07
tags: [墨力计划,达梦,达梦数据库]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1869214216599646208
---

>大家好，这里是公众号 **DBA学习之路**，致力于分享数据库领域相关知识。

# 社群交流
为了给大家提供一些技术交流的平台，目前已成立的技术交流群：
- Oracle 数据库交流群
- 国产数据库交流群
- Linux 技术交流群
- ChatGPT 4o 免费体验群

需要进群可以添加号主微信：**Lucifer-0622**，备注对应的群名即可。

@[TOC](目录)

# 介绍
DMDSC 集群的运行情况可以通过 **DMCSSM 监视器**（Dameng Cluster Synchronization Services Monitor，DMCSSM）进行查看，也可以查询 DMDSC 相关的动态视图获取更详细的信息。DMCSSM 监视器支持一些控制命令，可以用来启动、关闭 DMDSC 集群，还可以进行手动控制节点故障处理和节点重加入。

配置了 DMCSS 的集群中，可配置 DMCSSM 对集群进行统一管理，可配置 `0~10` 个 DMCSSM。各 DMCSSM 作用一样，相互独立，互不干扰。

# 功能说明
**DMCSS 功能说明：**
- **监控集群状态**：DMCSS 每秒会发送集群中所有节点的状态信息、当前连接到 DMCSS 的监视器信息以及 DCR 的配置信息到活动的监视器上，监视器提供对应的 `show` 命令用于查看各类信息。
- **打开/关闭指定组的自动拉起**：DMCSSM 提供 `SET AUTO RESTART ON/SET AUTO RESTART OFF` 命令，通知 DMCSS 打开或关闭对指定组的自动拉起功能，此功能和 DMCSS 的监控打开或关闭没有关系。
- **强制 OPEN 指定组**：DMCSSM 提供 `OPEN FORCE` 命令，在启动 ASM 或 DB 组时，如果组中某个节点发生硬件故障等原因导致一直无法启动，可执行此命令通知 DMCSS 将 ASM 组或 DB 组强制 OPEN，不再等待故障节点启动成功。
- **启动/退出集群**：DMCSSM 提供 `EP STARTUP/EP STOP` 命令，可以通知 DMCSS 启动/退出指定的 ASM 或 DB 组。

# 配置 DMDSC
DMCSSM 在任何机器上均可以启动，只要该台机器和 DMDSC 的真实机器网络是相通的，就可以监控 DMDSC 集群信息。搭建监视器，首先需要配置 `dmcssm.ini` 文件。

DMCSSM 的配置文件名称为 `dmcssm.ini`，所支持的配置项说明如下：

| 配置项                    | 配置含义                                                                                  |
|---------------------------|-------------------------------------------------------------------------------------------|
| CSSM_OGUID                | 用于和 DMCSS 通信校验使用，和 DMDCR_CFG.INI 中的 DCR_OGUID 值保持一致                      |
| CSSM_CSS_IP               | 集群中所有 DMCSS 所在机器的 IP 地址，以及 DMCSS 的监听端口，配置格式为“IP:PORT”的形式，其中 IP 和 PORT 分别对应 DMDCR_CFG.INI 中 DMCSS 节点的 DCR_EP_HOST 和 DCR_EP_PORT。<br>如果使用 IPv6 地址，为了方便区分端口，需要用[]封闭 IP 地址。<br>对于 IPv6，若当前环境存在多块网卡，需要用 % 指定具体有效的网卡号或网卡名称；若只有一块网卡或若已配置默认网卡，则可以不指定网卡号或名称。例如：CSSM_CSS_IP = [fe80::6aa7:3f02:59b3:bcb4%3]:52184 |
| CSSM_LOG_PATH             | 日志文件路径，日志文件命名方式为“dmcssm_年月日时分秒.log”，例如“dmcssm_20160614131123.log”。<br>如果 DMSSM.INI 中配置有 CSSM_LOG_PATH 路径，则将 CSSM_LOG_PATH 作为日志文件路径；如果没有配置，则将 DMCSM.INI 配置文件所在的路径作为日志文件路径。 |
| CSSM_LOG_FILE_SIZE        | 单个日志文件大小，取值范围 16-2048，单位为 MB，缺省为 64MB。达到最大值后，会自动生成并切换到新的日志文件中。 |
| CSSM_LOG_SPACE_LIMIT      | 日志总空间大小，取值 0 或者 256-4096，单位为 MB，缺省为 0，表示没有空间限制。如果达到设定的总空间限制，会自动删除创建时间最早的日志文件。 |
| CSSM_MESSAGE_CHECK        | 是否对 CSSM 通信消息启用通信校验（只有当消息的发送端和接收端都配置为 1 才启用通信校验）。<br>0：不启用；1：启用，缺省为 1。                          |

配置文件内容如下：
```bash
[dmdba@dsc01:/dmdata/DSC]$ cat dmcssm.ini 
## 和 dmdcr_cfg.ini 中的 DCR_OGUID 保持一致
CSSM_OGUID = 795681

## 配置所有 CSS 的连接信息
## 和 dmdcr_cfg.ini 中 CSS 配置项的 DCR_EP_HOST 和 DCR_EP_PORT 保持一致
CSSM_CSS_IP = 5.5.5.1:12345
CSSM_CSS_IP = 5.5.5.2:12345

## 监视器日志文件存放路径
CSSM_LOG_PATH = /dm/log

## 每个日志文件最大 32M
CSSM_LOG_FILE_SIZE = 32

## 不限定日志文件总占用空间
CSSM_LOG_SPACE_LIMIT = 0
```
创建 DMCSSM 的日志存放路径。
```bash
mkdir -p /dm/log
```
启动 DMCSSM 集群监视器：
```bash
## 查看说明
[dmdba@dsc01:/home/dmdba]$ dmcssm help
version: 03134284294-20240919-243448-20119 Pack1
格式: ./dmcssm KEYWORD=value

例程: ./dmcssm [[INI_PATH] | [INI_PATH=/opt/dmdbms/data/DAMENG/dmcssm.ini] | help]

关键字             说明
----------------------------------------------------------------
INI_PATH           ini文件路径
HELP               打印帮助信息

## 启动
[dmdba@dsc01:/home/dmdba]$ dmcssm INI_PATH=/dmdata/DSC/dmcssm.ini
[monitor]          [2024-12-18 16:49:23:812] CSS MONITOR V8
[monitor]          [2024-12-18 16:49:23:862] CSS MONITOR SYSTEM IS READY.

[monitor]          [2024-12-18 16:49:23:888] Wait CSS Control Node choosed...
[monitor]          [2024-12-18 16:49:25:212] Wait CSS Control Node choosed succeed.
```
DMCSSM 启动之后，可使用一系列命令在 DMCSSM 监视器中查看集群状态信息。

# 命令使用
监视器提供一系列命令，支持集群的状态信息查看以及节点的故障处理，可输入 `help` 命令，查看命令使用说明：

| 命令名称                        | 含义                                                        |
|:--------------------------------|:------------------------------------------------------------|
| help                            | 显示帮助信息                                                |
| show [group_name]               | 显示指定的组信息，如果没有指定 group_name，则显示所有组信息 |
| show config                     | 显示 dmdcr_cfg.ini 的配置信息                               |
| show monitor                    | 显示当前连接到主 CSS 的所有监视器信息                       |
| set group_name auto restart on  | 打开指定组的自动拉起功能（只修改 dmcss 内存值）             |
| set group_name auto restart off | 关闭指定组的自动拉起功能（只修改 dmcss 内存值）             |
| open force group_name           | 强制 open 指定的 ASM 或 DB 组                               |
| ep startup group_name           | 启动指定的 ASM 或 DB 组                                     |
| ep stop group_name              | 退出指定的 ASM 或 DB 组                                     |
| ep halt group_name.ep_name      | 强制退出指定组中的指定节点                                  |
| extend node                     | 联机扩展节点                                                |
| ep crash group_name.ep_name     | 手动指定节点故障                                            |
| check crash over group_name     | 检查指定组故障处理是否真正结束                              |
| exit                            | 退出监视器                                                  |


## help
在 DMCSS 控制台输入 `help`，显示帮助信息：
```bash
[dmdba@dsc01:/home/dmdba]$ dmcssm INI_PATH=/dmdata/DSC/dmcssm.ini
[monitor]          [2024-12-16 13:27:36:769] CSS MONITOR V8
[monitor]          [2024-12-16 13:27:36:796] CSS MONITOR SYSTEM IS READY.

[monitor]          [2024-12-16 13:27:36:799] Wait CSS Control Node choosed...
[monitor]          [2024-12-16 13:27:38:002] Wait CSS Control Node choosed succeed.

help
DMCSSM使用说明:
SHOW命令中可以通过指定group_name获取指定组的信息，如果没有指定，则显示所有组的信息
---------------------------------------------------------------------------------------------
1.help                                            --显示帮助
2.show [group_name]                               --显示指定的组信息
3.show config                                     --显示配置文件信息
4.show monitor                                    --显示当前连接的监视器信息
5.set group_name auto restart on                  --打开指定组的自动拉起功能(只修改dmcss内存值)
6.set group_name auto restart off                 --关闭指定组的自动拉起功能(只修改dmcss内存值)
7.open force group_name                           --强制OPEN指定的ASM或DB组
8.ep startup group_name                           --启动指定的ASM或DB组
9.ep stop group_name                              --停止指定的ASM或DB组
10.ep halt group_name.ep_name                     --强制退出指定组的指定节点
11.extend node                                    --扩展集群节点
12.ep crash group_name.ep_name                    --设定指定节点故障
13.check crash over group_name                    --检查指定组故障处理是否结束
14.exit                                           --退出监视器

---------------------------------------------------------------------------------------------
```

## show
在 DMCSS 控制台输入 `show` 命令可以看到所监控的集群状态，可以指定的组信息，如果没有指定 group_name，则显示所有组信息。

**`group[name = GRP_CSS, seq = 0, type = CSS, Control Node = 0]` 行显示的内容为**：
- **name**：集群名称
- **seq**：集群编号
- **type**：集群类型[CSS/ASM/DB]
- **control_node**：集群内控制节点

**ep 行显示的内容为**：
- **inst_name**：节点实例名
- **seqno**：节点编号
- **port**：实例对外提供服务的端口号
- **mode**：模式[控制/普通]
- **sys_status**：实例系统状态[MOUNT/OPEN 等]
- **vtd_status**：实例的集群状态[WORKING/SHUTDOWN/SYSHALT 等]
- **is_ok**：实例在集群内是否正常，ERROR 的节点暂时从集群内剔除
- **active**：实例是否活动
- **guid**：实例的 guid 值
- **ts**：实例的时间戳

```bash
show

monitor current time:2024-12-16 13:41:36, n_group:3
=================== group[name = GRP_CSS, seq = 0, type = CSS, Control Node = 0] ========================================

[CSS01] auto check = TRUE, global info:
[ASM01] auto restart = TRUE
[DSC01] auto restart = TRUE
[CSS02] auto check = TRUE, global info:
[ASM02] auto restart = TRUE
[DSC02] auto restart = TRUE

ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-16 13:41:36    CSS01         0         12345   Control Node OPEN               WORKING      OK           TRUE         13815             20305           
        2024-12-16 13:41:36    CSS02         1         12345   Normal Node  OPEN               WORKING      OK           TRUE         13918             20418           

=================== group[name = GRP_ASM, seq = 1, type = ASM, Control Node = 0] ========================================

n_ok_ep = 2
ok_ep_arr(index, seqno):
(0, 0)
(1, 1)

sta = OPEN, sub_sta = STARTUP
break ep = NULL
recover ep = NULL

crash process over flag is TRUE
ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-16 13:41:36    ASM01         0         12346   Control Node OPEN               WORKING      OK           TRUE         21156             27650           
        2024-12-16 13:41:36    ASM02         1         12346   Normal Node  OPEN               WORKING      OK           TRUE         21233             27734           

=================== group[name = GRP_DSC, seq = 2, type = DB, Control Node = 0] ========================================

n_ok_ep = 2
ok_ep_arr(index, seqno):
(0, 0)
(1, 1)

sta = OPEN, sub_sta = STARTUP
break ep = NULL
recover ep = NULL

crash process over flag is TRUE
ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-16 13:41:36    DSC01         0         5236    Control Node OPEN               WORKING      OK           TRUE         13930             20404           
        2024-12-16 13:41:36    DSC02         1         5236    Normal Node  OPEN               WORKING      OK           TRUE         350892            355722          

==================================================================================================================
```

## show config
在 DMCSS 控制台输入 `show config`，显示 DMDCR_CFG.INI 的配置信息，对于 DB 类型的节点，会比 CSS/ASM 节点多一项 DCR_EP_SEQNO 的显示值，如果原本的 ini 文件中没有手动配置，则显示的是自动分配的序列值。
```bash
show config

monitor current time:2024-12-16 13:52:51
==================================================================================================================
        DCR_N_GRP            = 3
        DCR_VTD_PATH         = /dev/asmdisk/dmvote01
        DCR_OGUID            =795681
        [GRP]
        DCR_GRP_TYPE         = CSS
        DCR_GRP_NAME         = GRP_CSS
        DCR_GRP_N_EP         = 2
        DCR_GRP_DSKCHK_CNT   = 60
        [GRP_CSS]
        DCR_EP_NAME          = CSS01
        DCR_EP_HOST          = 5.5.5.1
        DCR_EP_PORT          = 12345
        [GRP_CSS]
        DCR_EP_NAME          = CSS02
        DCR_EP_HOST          = 5.5.5.2
        DCR_EP_PORT          = 12345

        [GRP]
        DCR_GRP_TYPE         = ASM
        DCR_GRP_NAME         = GRP_ASM
        DCR_GRP_N_EP         = 2
        DCR_GRP_DSKCHK_CNT   = 60
        [GRP_ASM]
        DCR_EP_NAME          = ASM01
        DCR_EP_HOST          = 5.5.5.1
        DCR_EP_PORT          = 12346
        DCR_EP_SHM_KEY       = 78901
        DCR_EP_SHM_SIZE      = 512
        DCR_EP_ASM_LOAD_PATH = /dev/asmdisk
        [GRP_ASM]
        DCR_EP_NAME          = ASM02
        DCR_EP_HOST          = 5.5.5.2
        DCR_EP_PORT          = 12346
        DCR_EP_SHM_KEY       = 78902
        DCR_EP_SHM_SIZE      = 512
        DCR_EP_ASM_LOAD_PATH = /dev/asmdisk

        [GRP]
        DCR_GRP_TYPE         = DB
        DCR_GRP_NAME         = GRP_DSC
        DCR_GRP_N_EP         = 2
        DCR_GRP_DSKCHK_CNT   = 60
        [GRP_DSC]
        DCR_EP_SEQNO         = 0
        DCR_EP_NAME          = DSC01
        DCR_EP_PORT          = 5236
        DCR_CHECK_PORT       = 12347
        [GRP_DSC]
        DCR_EP_SEQNO         = 1
        DCR_EP_NAME          = DSC02
        DCR_EP_PORT          = 5236
        DCR_CHECK_PORT       = 12347

==================================================================================================================
``` 

## show monitor
在 DMCSS 控制台输入 `show monitor` 显示当前连接到主 CSS 的所有监视器信息，返回的信息中，第一行为当前执行命令的监视器的连接信息。
```bash
show monitor
==================================================

Get monitor connect info from css(seqno:0, name:CSS01).
The first line is self connect info.

CONN_TIME            MID            MON_IP                   FROM_NAME                
2024-12-16 13:41:30  1734327690     ::ffff:5.5.5.1           dmcssm                   
2024-12-16 13:28:55  1734326935     ::ffff:5.5.5.2           dmcssm                   

==================================================
```
在数据守护环境中，守护监视器 dmmonitor 的部分命令（启动/停止/强杀实例）最终是由 dmcss 执行的，守护进程 dmwatcher 在命令执行中充当了 dmcssm 的角色，守护进程通知 dmcss 执行完成后，再将执行结果返回给守护监视器。因此 dmcss 上会有 dmwatcher 的连接信息，show monitor 命令也会显示 dmwatcher 的连接信息，可以根据 from_name 字段值进行区分。

## set auto restart on/off
打开/关闭指定组的自动拉起功能。可借助 `show css` 命令查看每个节点的自动拉起标记，每个 css 只能控制和自己的 DMDCR.INI 中配置的 DMDCR_SEQNO 相同节点的自动拉起。
```bash
## 查看当前组是否开启自动拉起
show grp_css

monitor current time:2024-12-16 17:28:51
=================== group[name = grp_css, seq = 0, type = CSS, Control Node = 0] ========================================

[CSS01] auto check = TRUE, global info:
[ASM01] auto restart = TRUE
[DSC01] auto restart = TRUE
[CSS02] auto check = TRUE, global info:
[ASM02] auto restart = TRUE
[DSC02] auto restart = TRUE

ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-16 17:28:50    CSS01         0         12345   Control Node OPEN               WORKING      OK           TRUE         13815             33425           
        2024-12-16 17:28:50    CSS02         1         12345   Normal Node  OPEN               WORKING      OK           TRUE         13918             33516           

==================================================================================================================

## 关闭 DB 自动拉起
set grp_dsc auto restart off
[monitor]          [2024-12-16 17:20:07:035] 通知CSS(seqno:0)关闭节点(DSC01)的自动拉起功能
[monitor]          [2024-12-16 17:20:07:338] 通知CSS(seqno:0)关闭节点(DSC01)的自动拉起功能成功
[monitor]          [2024-12-16 17:20:07:339] 通知CSS(seqno:1)关闭节点(DSC02)的自动拉起功能
[monitor]          [2024-12-16 17:20:07:642] 通知CSS(seqno:1)关闭节点(DSC02)的自动拉起功能成功
[monitor]          [2024-12-16 17:20:07:643] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-16 17:20:08:496] 清理CSS(0)请求成功
[monitor]          [2024-12-16 17:20:08:849] 清理CSS(1)请求成功
[monitor]          [2024-12-16 17:20:08:852] 关闭CSS自动拉起功能成功

## 查看 DB 自动拉起状态
show

monitor current time:2024-12-16 17:20:16, n_group:3
=================== group[name = GRP_CSS, seq = 0, type = CSS, Control Node = 0] ========================================

[CSS01] auto check = TRUE, global info:
[ASM01] auto restart = TRUE
[DSC01] auto restart = FALSE
[CSS02] auto check = TRUE, global info:
[ASM02] auto restart = TRUE
[DSC02] auto restart = FALSE

## 开启 DB 自动拉起
set grp_dsc auto restart on
[monitor]          [2024-12-16 17:21:02:742] 通知CSS(seqno:0)打开节点(DSC01)的自动拉起功能
[monitor]          [2024-12-16 17:21:03:094] 通知CSS(seqno:0)打开节点(DSC01)的自动拉起功能成功
[monitor]          [2024-12-16 17:21:03:097] 通知CSS(seqno:1)打开节点(DSC02)的自动拉起功能
[monitor]          [2024-12-16 17:21:03:399] 通知CSS(seqno:1)打开节点(DSC02)的自动拉起功能成功
[monitor]          [2024-12-16 17:21:03:400] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-16 17:21:04:254] 清理CSS(0)请求成功
[monitor]          [2024-12-16 17:21:05:661] 清理CSS(1)请求成功
[monitor]          [2024-12-16 17:21:05:662] 打开CSS自动拉起功能成功
```

## open force
在启动 ASM 或 DB 组时，如果某个节点故障一直无法启动，可借助此命令将 ASM 或 DB 组强制 OPEN。此命令需要发送到主 CSS 执行，并且主 CSS 的监控需要处于打开状态，如果主 CSS 故障或尚未选出，则命令执行失败。
```bash
open force GRP_DSC
```

## ep stop/startup
通知 CSS 启动/关闭指定的 ASM 或 DB 组，如果 CSS 已经打开了指定组的自动拉起功能，则启动命令不允许执行，需要等待 CSS 自动检测故障并执行拉起操作。

每个 CSS 只负责拉起和自己的 dmdcr.ini 中配置的 DMDCR_SEQNO 相同的 ASM 或 DB 节点，因此需要所有 CSS 都处于活动状态，否则只通知当前活动的 CSS 自动拉起相对应的节点。
```bash
## 关闭 DB
ep stop GRP_DSC  
[monitor]          [2024-12-16 17:10:41:449] 通知CSS(seqno:0)关闭节点(DSC01)的自动拉起功能
[monitor]          [2024-12-16 17:10:41:652] 通知CSS(seqno:0)关闭节点(DSC01)的自动拉起功能成功
[monitor]          [2024-12-16 17:10:41:653] 通知CSS(seqno:1)关闭节点(DSC02)的自动拉起功能
[monitor]          [2024-12-16 17:10:41:855] 通知CSS(seqno:1)关闭节点(DSC02)的自动拉起功能成功
[monitor]          [2024-12-16 17:10:41:856] 关闭CSS自动拉起功能成功
[monitor]          [2024-12-16 17:10:41:858] 通知CSS(seqno:0)执行EP STOP(GRP_DSC)
[monitor]          [2024-12-16 17:10:51:071] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-16 17:10:53:227] 清理CSS(0)请求成功
[monitor]          [2024-12-16 17:10:53:280] 清理CSS(1)请求成功
[monitor]          [2024-12-16 17:10:53:281] 命令EP STOP GRP_DSC执行成功

## 查看 DB 状态
show GRP_DSC

monitor current time:2024-12-16 17:12:22
=================== group[name = grp_dsc, seq = 2, type = DB, Control Node = 255] ========================================

n_ok_ep = 2
ok_ep_arr(index, seqno):
(0, 0)
(1, 1)

sta = OPEN, sub_sta = STARTUP
break ep = NULL
recover ep = NULL

crash process over flag is FALSE
ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-16 17:12:21    DSC01         0         5236    Normal Node  SHUTDOWN           SHUTDOWN     OK           FALSE        13930             32647           
        2024-12-16 17:12:21    DSC02         1         5236    Normal Node  SHUTDOWN           SHUTDOWN     OK           FALSE        350892            367969          

==================================================================================================================

## 启动 DB
ep startup grp_dsc
[monitor]          [2024-12-16 17:13:49:260] 通知CSS(seqno:0)执行EP STARTUP(DSC01)
[monitor]          [2024-12-16 17:14:03:383] 通知CSS(seqno:0)执行EP STARTUP(DSC01)成功
[monitor]          [2024-12-16 17:14:03:385] 通知CSS(seqno:1)执行EP STARTUP(DSC02)
[monitor]          [2024-12-16 17:14:18:016] 通知CSS(seqno:1)执行EP STARTUP(DSC02)成功
[monitor]          [2024-12-16 17:14:18:021] 通知CSS(seqno:0)打开节点(DSC01)的自动拉起功能
[monitor]          [2024-12-16 17:14:18:781] 通知CSS(seqno:0)打开节点(DSC01)的自动拉起功能成功
[monitor]          [2024-12-16 17:14:18:783] 通知CSS(seqno:1)打开节点(DSC02)的自动拉起功能
[monitor]          [2024-12-16 17:14:19:135] 通知CSS(seqno:1)打开节点(DSC02)的自动拉起功能成功
[monitor]          [2024-12-16 17:14:19:137] 打开CSS自动拉起功能成功
[monitor]          [2024-12-16 17:14:19:138] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-16 17:14:19:589] 清理CSS(0)请求成功
[monitor]          [2024-12-16 17:14:20:394] 清理CSS(1)请求成功
[monitor]          [2024-12-16 17:14:20:395] 命令EP STARTUP GRP_DSC执行成功

[CSS01]            [2024-12-16 17:14:20:154] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-16 17:14:20:573] [DB]: 设置命令[EP START], 目标站点 DSC01[0], 命令序号[73]
[CSS01]            [2024-12-16 17:14:21:605] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-16 17:14:21:744] [DB]: 设置命令[EP START], 目标站点 DSC02[1], 命令序号[75]
[CSS01]            [2024-12-16 17:14:22:217] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-16 17:14:22:243] [DB]: 设置命令[EP START2], 目标站点 DSC01[0], 命令序号[78]
[CSS01]            [2024-12-16 17:14:24:423] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-16 17:14:24:555] [DB]: 设置命令[EP START2], 目标站点 DSC02[1], 命令序号[80]
[CSS01]            [2024-12-16 17:14:25:511] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-16 17:14:25:640] [DB]: 设置命令[EP OPEN], 目标站点 DSC01[0], 命令序号[83]
[CSS01]            [2024-12-16 17:14:25:812] [DB]: 设置命令[EP OPEN], 目标站点 DSC02[1], 命令序号[84]
[CSS01]            [2024-12-16 17:14:26:250] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-16 17:14:26:479] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-16 17:14:26:792] [DB]: 设置命令[EP REAL OPEN], 目标站点 DSC01[0], 命令序号[86]
[CSS01]            [2024-12-16 17:14:27:108] [DB]: 设置命令[EP REAL OPEN], 目标站点 DSC02[1], 命令序号[87]
[CSS01]            [2024-12-16 17:14:28:109] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-16 17:14:28:379] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]

## 查看 DB 状态
show grp_dsc

monitor current time:2024-12-16 17:16:57
=================== group[name = grp_dsc, seq = 2, type = DB, Control Node = 0] ========================================

n_ok_ep = 2
ok_ep_arr(index, seqno):
(0, 0)
(1, 1)

sta = OPEN, sub_sta = STARTUP
break ep = NULL
recover ep = NULL

crash process over flag is TRUE
ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-16 17:16:57    DSC01         0         5236    Control Node OPEN               WORKING      OK           TRUE         3899323           3899495         
        2024-12-16 17:16:57    DSC02         1         5236    Normal Node  OPEN               WORKING      OK           TRUE         3902670           3902828         

==================================================================================================================
```
只有在 ASM 组正常启动到 OPEN 状态，并且所有活动的 ASM 节点都处于 OPEN 状态时，才允许启动 DB 组，否则执行 DB 组的启动命令会报错，CSS 自动拉起 DB 组时也需要满足此条件。在命令执行前，如果 CSS 对指定组的自动拉起功能是关闭的，在节点拉起成功后，会打开对指定组的自动拉起功能。

在退出 ASM 组时，需要保证 DB 组已经退出，否则会报错处理。在命令执行前，如果 CSS 对指定组的自动拉起功能是打开的，则会先通知 CSS 关闭对指定组的自动拉起功能，再通知指定组退出，避免命令执行成功后节点再次被自动拉起。

## ep halt
强制退出指定组的指定 EP。**适用于下述场景：**
1. 某个 ASM 或 DB 集群节点故障，CSS 的心跳容错时间 `DCR_GRP_DSKCHK_CNT` 配置值很大，在容错时间内，CSS 不会调整故障节点的 active 标记，一直是 TRUE，CSS 认为故障 EP 仍然处于活动状态，不会自动执行故障处理，并且不允许手动执行故障处理。

	另外，执行 `EP STARTUP` 或 `EP STOP` 命令时，会误认为故障 EP 仍然处于活动状态，导致执行结果与预期不符。此时可以通过执行 `EP HALT` 命令，通知 CSS 再次 HALT 故障 EP，确认 EP 已经被 HALT 后，CSS 会及时调整 active 标记为 FALSE，在此之后，对自动/手动故障处理，`EP STARTUP/EP STOP` 命令都可以正常执行。
2. 需要强制 HALT 某个正在运行的 ASM 或 DB 节点，也可以通过此命令完成。

```bash
ep halt grp_dsc.DSC02
[monitor]          [2024-12-18 10:04:27:101] 通知CSS(CSS01, seqno:0)执行EP HALT GRP_DSC.DSC02
[monitor]          [2024-12-18 10:04:28:738] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-18 10:04:30:648] 清理CSS(0)请求成功
[monitor]          [2024-12-18 10:04:30:701] 清理CSS(1)请求成功
[monitor]          [2024-12-18 10:04:30:729] 命令EP HALT GRP_DSC.DSC02执行成功

[CSS01]            [2024-12-18 10:04:30:457] [DB]: 设置命令[EP_CRASH], 目标站点 DSC01[0], 命令序号[92]
[CSS01]            [2024-12-18 10:04:42:453] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:04:42:458] [DB]: 命令[EP_CRASH]处理结束
[CSS01]            [2024-12-18 10:04:42:618] [DB]: 设置命令[CMD CLEAR], 目标站点 DSC01[0], 命令序号[95]
[CSS01]            [2024-12-18 10:04:42:893] [CSS]: 设置命令[CONFIG VIP], 目标站点 CSS02[1], 命令序号[4]
[CSS01]            [2024-12-18 10:04:43:441] [DB]: 设置命令[CONFIG VIP], 目标站点 DSC01[0], 命令序号[100]
[CSS01]            [2024-12-18 10:04:44:580] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:04:44:745] [DB]: 命令[CONFIG VIP]处理结束
[CSS01]            [2024-12-18 10:04:45:929] [DB]: 上次故障处理已完成，允许故障ep重加入

## 查看 DB 状态
show grp_dsc

monitor current time:2024-12-18 10:05:28
=================== group[name = grp_dsc, seq = 2, type = DB, Control Node = 0] ========================================

n_ok_ep = 1
ok_ep_arr(index, seqno):
(0, 0)

sta = OPEN, sub_sta = STARTUP
break ep = NULL
recover ep = NULL

crash process over flag is TRUE
ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-18 10:05:28    DSC01         0         5236    Control Node OPEN               WORKING      OK           TRUE         3899323           4044687         
        2024-12-18 10:05:28    DSC02         1         5236    Normal Node  OPEN               SYSHALT      ERROR        FALSE        3902670           4047981         

==================================================================================================================

## 先关闭所有 DB
ep stop grp_dsc
[monitor]          [2024-12-18 10:18:46:035] 通知CSS(seqno:0)关闭节点(DSC01)的自动拉起功能
[monitor]          [2024-12-18 10:18:46:187] 通知CSS(seqno:0)关闭节点(DSC01)的自动拉起功能成功
[monitor]          [2024-12-18 10:18:46:203] 通知CSS(seqno:1)关闭节点(DSC02)的自动拉起功能
[monitor]          [2024-12-18 10:18:46:405] 通知CSS(seqno:1)关闭节点(DSC02)的自动拉起功能成功
[monitor]          [2024-12-18 10:18:46:406] 关闭CSS自动拉起功能成功
[monitor]          [2024-12-18 10:18:46:407] 通知CSS(seqno:0)执行EP STOP(GRP_DSC)
[monitor]          [2024-12-18 10:18:51:717] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-18 10:18:52:672] 清理CSS(0)请求成功
[monitor]          [2024-12-18 10:18:52:737] 清理CSS(1)请求成功
[monitor]          [2024-12-18 10:18:52:739] 命令EP STOP GRP_DSC执行成功

## 执行 ep startup 可以再次启动
ep startup grp_dsc
[monitor]          [2024-12-18 10:07:32:089] 通知CSS(seqno:0)执行EP STARTUP(DSC01)
[monitor]          [2024-12-18 10:07:45:470] 通知CSS(seqno:0)执行EP STARTUP(DSC01)成功
[monitor]          [2024-12-18 10:07:45:507] 通知CSS(seqno:1)执行EP STARTUP(DSC02)
[monitor]          [2024-12-18 10:08:02:055] 通知CSS(seqno:1)执行EP STARTUP(DSC02)成功
[monitor]          [2024-12-18 10:08:02:073] 通知CSS(seqno:0)打开节点(DSC01)的自动拉起功能
[monitor]          [2024-12-18 10:08:02:276] 通知CSS(seqno:0)打开节点(DSC01)的自动拉起功能成功
[monitor]          [2024-12-18 10:08:02:277] 通知CSS(seqno:1)打开节点(DSC02)的自动拉起功能
[monitor]          [2024-12-18 10:08:02:579] 通知CSS(seqno:1)打开节点(DSC02)的自动拉起功能成功
[monitor]          [2024-12-18 10:08:02:590] 打开CSS自动拉起功能成功
[monitor]          [2024-12-18 10:08:02:591] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-18 10:08:03:695] 清理CSS(0)请求成功
[monitor]          [2024-12-18 10:08:03:807] 清理CSS(1)请求成功
[monitor]          [2024-12-18 10:08:03:809] 命令EP STARTUP GRP_DSC执行成功

[CSS01]            [2024-12-18 10:08:03:518] [DB]: 设置命令[DCR_LOAD], 目标站点 DSC02[1], 命令序号[109]
[CSS01]            [2024-12-18 10:08:03:830] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:08:03:906] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-18 10:08:04:068] [DB]: 设置命令[EP START], 目标站点 DSC01[0], 命令序号[111]
[CSS01]            [2024-12-18 10:08:12:435] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:08:12:577] [DB]: 设置命令[EP START], 目标站点 DSC02[1], 命令序号[113]
[CSS01]            [2024-12-18 10:08:12:837] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-18 10:08:12:861] [DB]: 设置命令[EP START2], 目标站点 DSC01[0], 命令序号[116]
[CSS01]            [2024-12-18 10:08:14:717] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:08:14:857] [DB]: 设置命令[EP START2], 目标站点 DSC02[1], 命令序号[118]
[CSS01]            [2024-12-18 10:08:15:684] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-18 10:08:15:813] [DB]: 设置命令[EP OPEN], 目标站点 DSC01[0], 命令序号[121]
[CSS01]            [2024-12-18 10:08:15:839] [DB]: 设置命令[EP OPEN], 目标站点 DSC02[1], 命令序号[122]
[CSS01]            [2024-12-18 10:08:16:151] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:08:16:164] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-18 10:08:16:300] [DB]: 设置命令[EP REAL OPEN], 目标站点 DSC01[0], 命令序号[124]
[CSS01]            [2024-12-18 10:08:16:435] [DB]: 设置命令[EP REAL OPEN], 目标站点 DSC02[1], 命令序号[125]
[CSS01]            [2024-12-18 10:08:17:034] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:08:17:184] [DB]: 设置命令[NONE], 目标站点 DSC02[1], 命令序号[0]
[CSS01]            [2024-12-18 10:08:18:399] [DB]: 上次故障处理未真正完成，不允许故障ep重加入

show grp_dsc

monitor current time:2024-12-18 10:09:39
=================== group[name = grp_dsc, seq = 2, type = DB, Control Node = 0] ========================================

n_ok_ep = 2
ok_ep_arr(index, seqno):
(0, 0)
(1, 1)

sta = OPEN, sub_sta = STARTUP
break ep = NULL
recover ep = NULL

crash process over flag is TRUE
ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-18 10:09:38    DSC01         0         5236    Control Node OPEN               WORKING      OK           TRUE         34076905          34077011        
        2024-12-18 10:09:38    DSC02         1         5236    Normal Node  OPEN               WORKING      OK           TRUE         34080259          34080356        

==================================================================================================================
```

## extend node
DMDSC 集群联机增加节点时使用。程序会通知所有实例（CSS/ASMSVR/dmserver）更新 dcr 信息。

使用 `show` 命令能看到新增节点信息，新增 `ASMSVR/dmserver` 为 ERROR 状态。

## ep crash
手动指定节点故障，节点故障后，css 只有在 `DCR_GRP_DSKCHK_CNT` 配置的时间过后才会判定实例故障，开始故障处理流程。用户如果明确知道实例已经故障，可以收到执行此命令，CSS 可以立即开始故障处理流程。
```bash
## 强制关闭节点 2 DB
ep halt grp_dsc.dsc02
[monitor]          [2024-12-18 10:14:07:230] 通知CSS(CSS01, seqno:0)执行EP HALT GRP_DSC.DSC02
[monitor]          [2024-12-18 10:14:08:537] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-18 10:14:09:492] 清理CSS(0)请求成功
[monitor]          [2024-12-18 10:14:09:643] 清理CSS(1)请求成功
[monitor]          [2024-12-18 10:14:09:645] 命令EP HALT GRP_DSC.DSC02执行成功

[CSS01]            [2024-12-18 10:14:27:631] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:14:27:640] [DB]: 命令[EP_CRASH]处理结束
[CSS01]            [2024-12-18 10:14:27:791] [DB]: 设置命令[CMD CLEAR], 目标站点 DSC01[0], 命令序号[133]
[CSS01]            [2024-12-18 10:14:28:034] [CSS]: 设置命令[CONFIG VIP], 目标站点 CSS02[1], 命令序号[5]
[CSS01]            [2024-12-18 10:14:28:541] [DB]: 设置命令[CONFIG VIP], 目标站点 DSC01[0], 命令序号[138]
[CSS01]            [2024-12-18 10:14:28:779] [DB]: 设置命令[NONE], 目标站点 DSC01[0], 命令序号[0]
[CSS01]            [2024-12-18 10:14:28:786] [DB]: 命令[CONFIG VIP]处理结束
[CSS01]            [2024-12-18 10:14:29:940] [DB]: 上次故障处理已完成，允许故障ep重加入

## 指定节点 2 DB 故障
ep crash grp_dsc.dsc02
[monitor]          [2024-12-18 10:15:38:419] 通知CSS(CSS01, seqno:0)执行EP CRASH GRP_DSC DSC02
[monitor]          [2024-12-18 10:15:38:640] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-18 10:15:39:795] 清理CSS(0)请求成功
[monitor]          [2024-12-18 10:15:40:699] 清理CSS(1)请求成功
[monitor]          [2024-12-18 10:15:40:704] 通知CSS(CSS01, seqno:0)执行EP CRASH GRP_DSC DSC02成功，请等待CSS处理完成

show grp_dsc 

monitor current time:2024-12-18 10:16:37
=================== group[name = grp_dsc, seq = 2, type = DB, Control Node = 0] ========================================

n_ok_ep = 1
ok_ep_arr(index, seqno):
(0, 0)

sta = OPEN, sub_sta = STARTUP
break ep = NULL
recover ep = NULL

crash process over flag is TRUE
ep:     css_time               inst_name     seqno     port    mode         inst_status        vtd_status   is_ok        active       guid              ts              
        2024-12-18 10:16:36    DSC01         0         5236    Control Node OPEN               WORKING      OK           TRUE         34076905          34077411        
        2024-12-18 10:16:36    DSC02         1         5236    Normal Node  OPEN               SYSHALT      ERROR        FALSE        34080259          34080624 
```

## check crash over
DB 集群环境故障处理后，需要满足一定条件（控制节点重做 REDO 日志产生的数据页修改都已经刷盘完成），才允许故障节点重新加回集群环境。此命令用来显示 DB 集群环境故障处理是否真正结束。
```bash
check crash over grp_dsc
[monitor]          [2024-12-18 10:17:45:089] 检查故障处理是否结束

[CSS01]            [2024-12-18 10:17:45:111] Group crash process over flag: TRUE
[monitor]          [2024-12-18 10:17:45:460] 通知当前活动的CSS执行清理操作
[monitor]          [2024-12-18 10:17:46:565] 清理CSS(0)请求成功
[monitor]          [2024-12-18 10:17:47:319] 清理CSS(1)请求成功
[monitor]          [2024-12-18 10:17:47:340] 命令CHECK CRASH OVER grp_dsc执行成功
```
至此，DMCSSM 监视器的命令使用演示完成。

# 写在最后
达梦十分建议使用 DMCSSM 来管理 ASM 和 DB，十分安全可靠，可视化更加清晰！

如果有遗漏或者不足的地方，欢迎评论区补充或者投稿，感谢阅读！

# 往期精彩文章
>[达梦数据库安装最详细教程](https://mp.weixin.qq.com/s/gjQBBvjIFsHC1rtEjn30nw)      
[一招教你学会达梦数据库的免密登录](https://mp.weixin.qq.com/s/hapMuAF9xg8fbdlKJpsN6A)    
[一文讲透达梦数据库的大小写敏感](https://mp.weixin.qq.com/s/pZIcZiICY1pUiTAWQRtUKg)    
[效率翻倍！达梦数据库 disql 使用技巧全攻略](https://mp.weixin.qq.com/s/MWQeqdvIfo9D2d8_vi7BTg)    
[达梦数据库参数配置与一键优化指南](https://mp.weixin.qq.com/s/5EvUN21PZ3Oc0tDnygr7rw)    
[达梦 AWR 报告快速上手指南](https://mp.weixin.qq.com/s/4vl88Oj9Nal-goeoijAqWg)   
[达梦 DMDSC 共享存储集群介绍](https://mp.weixin.qq.com/s/dsSirB3YQG0Hy0Mdal6l6A)    
[官方认证：达梦共享集群 DMDSC 一键安装脚本](https://mp.weixin.qq.com/s/arhUH5HWfOc-AMuUaoi1sA)    

---

<center>「喜欢这篇文章，您的关注和赞赏是给作者最好的鼓励」</center>