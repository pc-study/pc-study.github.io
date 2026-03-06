---
title: EM 24ai 运维必知：一招搞定用户密码重置！
date: 2025-12-01 14:00:45
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1995325974411026432
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

# 前言
做 DBA 的这些年里，最让我头疼的问题之一就是密码遗忘。去年就曾遇到过一个典型案例：客户遗忘了 EM 的管理密码，向 Oracle 原厂寻求支持时，建议却是“重置过程复杂，建议直接重装”。结果耗费了一整天时间，重新搭建了一套 EM 13C。

最近查阅 MOS 文档时，注意到一篇标题为 **《EM 24ai: Steps to Reset the Password for Weblogic and Nodemanager User Accounts (Doc ID 3086915.1)》** 的文章，才发现从 EM 24ai 版本开始，密码重置流程已大幅简化。

>Oracle EM 24ai 的安装教程可参考：https://www.modb.pro/db/1869933671994638336

如果 EM 13C 当年就有这样的方案，去年也不至于耗费如此多精力。这一功能对日常运维非常实用，特地给大家分享一下。

# 介绍
众所周知，在部署 EM 24ai OMS 时，系统会安装 `WebLogic Server (WLS) 12.1.0.4`，并根据所选安装类型为 `weblogic` 和 `nodemanager` 账户设置初始密码：

- **weblogic 账户**：用于创建和管理 WebLogic 域（GCDomain）及相关组件，包括管理服务器、受管服务器及节点管理器。
- **nodemanager 账户**：用于连接节点管理器进程，以启动或停止管理服务器和受管服务器。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251201-1995355514290118656_395407.png)

安装时设置的初始密码复杂度通常较高，建议在安装完成后立即妥善记录。一旦遗忘，以往的处理方式确实非常繁琐。

# 密码修改
## 重置前的准备工作
开始操作前，请务必确认以下几点：

- **确认版本**：确保 OMS 为 24.1 版本，并已安装 RU04 或更高版本的补丁；
- **备份数据**：完整备份 oms_home、ext_oms_home 及 gc_inst 目录；
- **检查服务状态**：确认 OMS 运行正常；
- **操作便利性**：重置过程不需要旧密码，这一点非常友好。

## 仅重置 WebLogic 密码
切换至 oracle 用户，在 OMS 节点上执行以下命令（**执行过程中 OMS 将自动重启**）：

```bash
## 切换到oracle用户，加载环境变量
. .oms
## 设置新密码，例如设为 P@ssw0rdEMCC
ADMIN_PWD=P@ssw0rdEMCC
## 执行以下命令重置WebLogic用户密码
emctl config oms -change_wls_pwd -new_admin_pwd $ADMIN_PWD
emcli modify_oms_wls_target_creds -new_admin_pwd=$ADMIN_PWD
```

若为 EMCC 集群环境，则需在所有 OMS 节点上执行上述命令。


## 仅重置 Node Manager 密码

切换至 oracle 用户，在 OMS 节点上执行以下命令（**执行过程中 OMS 将自动重启**）：

```bash
## 加载环境变量
. .oms
## 设置新密码，例如设为 P@ssw0rdEMCC
NM_PWD=P@ssw0rdEMCC
## 执行以下命令重置Node Manager密码
emctl config oms -change_wls_pwd -new_nm_pwd $NM_PWD
emcli modify_oms_wls_target_creds -new_nm_pwd=$NM_PWD
```

若为 EMCC 集群环境，则需在所有 OMS 节点上执行上述命令。

## 同时重置两个密码

如果两个密码均遗忘，可一次性重置 WebLogic 和 Node Manager 的密码。

切换至 oracle 用户，在任意 OMS 节点上执行以下命令（**执行过程中 OMS 将自动重启**）：

```bash
## 加载环境变量
. .oms
## 设置新密码，例如均设为 P@ssw0rdEMCC
ADMIN_PWD=P@ssw0rdEMCC
NM_PWD=P@ssw0rdEMCC
emctl config oms -change_wls_pwd -new_admin_pwd $ADMIN_PWD -new_nm_pwd $NM_PWD
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251201-1995363883272970240_395407.png)

随后在任意一个 OMS 节点上执行以下命令完成同步：

```bash
## 加载环境变量
. .oms
## 以sysman用户登录并同步
emcli login -username=sysman
emcli sync
emcli modify_oms_wls_target_creds -new_admin_pwd=$ADMIN_PWD -new_nm_pwd=$NM_PWD
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251201-1995363834345906176_395407.png)


# 写在最后
随着 EM 24ai 的发布，Oracle 在密码重置流程上做出了明显优化，使得运维操作更为便捷。对于仍在使用早期版本的用户，建议关注官方更新，适时升级以获得更好的管理体验。日常运维中，仍应养成良好的密码记录与保管习惯，防患于未然。

---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)