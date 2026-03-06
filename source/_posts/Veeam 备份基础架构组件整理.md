---
title: Veeam 备份基础架构组件整理
date: 2025-11-13 15:22:09
tags: [墨力计划,veeam]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1988847683453919232
---

@[TOC](目录)

# 前言
虽然用了一段时间 Veeam 备份了，但是对它的了解还是仅限于简单的备份恢复，对于基础架构组件还是迷迷糊糊，抽空看了一遍官方文档，总算是有点概念了，顺便整理了一下，以备后续查阅。

>参考：https://helpcenter.veeam.com/cn/archive/backup/110/vsphere/backup_infrastructure.html

# 备份基础架构
Veeam Backup & Replication 的安装包包含一系列组件，可用于配置备份基础架构。某些组件是必需的，提供核心功能；某些组件是可选的，可根据您的业务和部署需求进行安装，以提供额外的功能。您可以将 Veeam Backup & Replication 的各个组件安装在同一台物理机或虚拟机上，也可以将它们分开安装，以实现更具可扩展性的方法。

Veeam备份基础架构由一系列组件构成，部分组件可通过安装文件进行部署，而其他组件则可通过Veeam Backup & Replication控制台进行部署：
- 备份服务器
- 备份与复制控制台
- 虚拟化服务器和主机
- 备份代理
- VMware CDP 代理
- 备份存储库
- 外部存储库
- 横向扩展备份存储库
- 访客交互代理
- 网关服务器
- 挂载服务器
- Veeam vPower NFS 服务
- 广域网加速器
- 日志传送服务器
- 磁带服务器
- NDMP 服务器
- Veeam Backup Enterprise Manager

虽然列出了很多组件，但是日常真正接触使用的其实就那么几种。

## 备份服务器（VBR）
备份服务器是一台装有 Veeam Backup & Replication 的 Windows 物理机或虚拟机，它是备份基础架构中的核心组件，充当“配置和控制中心”的角色。

备份服务器执行所有类型的管理活动：
- 协调备份、复制、恢复验证和还原任务；
- 控制作业调度和资源分配；
- 设置和管理备份基础架构组件，指定备份基础架构的全局设置；

除了上述主要功能外，新部署的备份服务器还执行默认备份代理和备份存储库的角色（管理数据处理和数据存储任务）。

备份服务器使用以下服务和组件：
- **Veeam Backup Service** 是一项 Windows 服务，负责协调 Veeam Backup & Replication执行的所有操作，比如备份、复制、恢复验证和还原任务。Veeam Backup Service 在 LocalSystem 帐户或对备份服务器具有本地管理员权限的帐户下运行。
- **Veeam Broker Service** 与虚拟基础架构进行交互，以收集和缓存虚拟基础架构拓扑。作业和任务可以从该代理服务中查询有关虚拟基础架构拓扑的信息，从而提高作业和任务的性能。
- **Veeam Guest Catalog Service** 负责管理虚拟机的来宾操作系统文件系统索引，并复制系统索引数据文件以实现对来宾操作系统文件的搜索。索引数据存储在Veeam Backup Catalog（备份服务器上的一个文件夹）中。在备份服务器上运行的 Veeam Guest Catalog Service 与安装在 Veeam Backup Enterprise Manager 上的搜索组件以及（可选的） 专用 Microsoft 搜索服务器协同运行。
- **挂载服务**可挂载供文件级访问的备份和副本，浏览虚拟机来宾文件系统，并将虚拟机来宾操作系统文件和应用程序项目还原到原始位置。
- **备份代理服务**，除了专用服务之外，备份服务器还运行一组 Data Mover 服务。
- **Veeam CDP协调器服务**与vCenter进行通信，分配连续数据保护（CDP）任务，并管理CDP中涉及的基础架构组件。
- **Veeam Backup & Replication 配置数据库**可存储有关备份基础架构、作业、会话和其他配置数据。数据库实例可位于本地（与备份服务器在同一台机器上）或远程安装的 SQL Server 上。
Veeam Backup & Replication维护配置数据库。Veeam Backup & Replication每周在Veeam备份服务重新启动时运行一次数据库维护系统作业。该作业将更新数据库内部统计信息，对索引进行碎片整理并清除未使用的数据。有关详细信息，请参见 `%ProgramData%\Veeam\Backup` 文件夹中的 `Job.DatabaseMaintenance` 日志文件。
- **Veeam Backup & Replication控制台**提供应用程序用户界面，支持用户访问应用程序功能。
- **Veeam Backup PowerShell模块**是Microsoft Windows PowerShell的扩展，添加了一组cmdlet，支持用户通过PowerShell的命令行界面执行备份，复制和恢复任务，或运行自定义脚本以完全自动化操作Veeam Backup & Replication 。

## Backup & Replication 控制台
Veeam Backup & Replication 控制台是一个用来访问备份服务器的客户端组件。您可以通过该控制台登录到 Veeam Backup & Replication ，并在备份服务器上执行各种数据保护和灾难恢复操作。

该控制台无法直接访问备份基础架构组件和配置数据库。用户凭据、密码、角色和权限等数据均存储在备份服务器端。要访问这些数据，控制台需要连接到备份服务器，并在工作会话期间定期查询此信息。

为了使用户尽可能不间断地工作，远程控制台会在连接断开的情况保持会话 5 分钟。如果在此期间连接恢复，则用户可以继续工作，而无需重新登录控制台。

默认情况下，控制台安装在备份服务器的本地。 您还可以采用独立部署模式 — 将控制台安装在专用机器上，并通 过网络远程访问 Veeam Backup & Replication 。

## 虚拟化服务器和主机
可以将物理机和虚拟机添加到备份基础架构中，并为它们分配不同的角色。

下表描述了可以分配给不同类型服务器的角色：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251113-1988856890152017920_395407.png)

## 备份代理
备份代理是位于备份服务器和备份基础架构其他组件之间的一种架构组件，备份服务器负责管理任务，而代理则负责处理作业并传递备份流量。

基本的备份代理任务包括以下内容：
- 从生产存储中检索虚拟机数据
- 压缩
- 去重
- 加密

将其发送到备份存储库（例如，如果您运行备份作业）或其他备份代理（例如，如果您运行复制作业）。

## VMware CDP 代理
VMware CDP代理是一种充当数据移动器的组件，可在源主机和目标主机之间传输数据。

基本上，VMware CDP代理执行以下任务：
- 从生产存储接收虚拟机数据；
- 聚合变化的数据；
- 为短期还原点准备数据；
- 压缩和去重数据；
- 加密和解密数据；
- 将数据发送到灾难恢复站点的存储或另一个VMware CDP代理；

## 高速存储库
缓存存储库是 Veeam Backup & Replication 用于保存文件共享备份作业所备份数据的临时缓存元数据的存储位置。

## 备份存储库
备份存储库是 Veeam 用于保存备份文件、虚拟机副本和复制虚拟机元数据的存储位置。

要配置备份存储库，您可以使用以下存储类型：
- **直接连接存储**：您可以将虚拟服务器和物理服务器添加为备份存储库：
	- 微软 Windows 服务器
	- Linux 服务器
- **网络附加存储**：您可以将以下网络共享添加为备份存储库：
	- SMB (CIFS) share
	- NFS share
- **重复数据删除存储设备**：您可以将以下重复数据删除存储设备添加为备份存储库：
	- Dell EMC Data Domain
	- ExaGrid
	- HPE StoreOnce
	- Quantum DXi
- **对象存储**：您可以将云存储服务用作备份存储库。

## 外部存储库
外部存储库是只读存储库。您可以使用 `<% VBR % >` 从外部存储库复制，导入和/或还原由Veeam Backup for AWS，Veeam Backup for Microsoft Azure和Veeam Backup for Google Cloud Platform创建的备份。这样，您可以在云，内部和虚拟基础架构之间执行数据迁移。

Veeam Backup & Replication支持以下类型的外部存储库：
- Amazon S3 （已分配标准存储类别）
- Azure Blob （冷热访问层）
- Google Cloud Platform（已分配标准存储类别）

要开始使用Veeam Backup for AWS，Veeam Backup for Microsoft Azure和Veeam Backup for Google Cloud Platform创建的备份，您必须添加一个存储库，其中包含Amazon EC2实例，Azure虚拟机或Google Cloud Platform虚拟机的备份到 `< % VBR %>` 基础架构作为外部存储库。

## 扩展式备份存储库 (Scale-Out Backup Repository™)
扩展式备份存储库是一种支持对数据的多层存储进行水平扩展的存储库系统。扩展式备份存储库由一个或多个备份存储库（称为性能层）组成，可通过对象存储库进行扩展，以支持长期存储和归档存储：容量层和归档层。扩展式备份存储库中的所有存储设备和系统都已合并到一个系统中，并汇总了容量。

## 访客交互代理
访客交互代理是备份基础架构组件，位于备份服务器和待处理的虚拟机之间。

如果备份或复制作业对虚拟机执行以下处理，则需要此组件：
- 应用感知处理
- 访客文件系统索引
- 交易日志处理

为了与虚拟机客户操作系统交互，Veeam Backup & Replication 需要在每个虚拟机中安装非持久性运行时组件或使用（如有必要，则安装）持久性代理组件。在虚拟机中部署这些组件的任务由访客交互代理执行。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251113-1988866691045597184_395407.png)

## 网关服务器
网关服务器是辅助备份基础架构组件，用于“桥接”备份服务器和备份存储库。

如果您在备份基础架构中部署以下类型的备份存储库，则需要网关服务器：
- 共享文件夹备份存储库；
- Dell EMC Data Domain去重存储设备；
- HPE StoreOnce去重存储设备；

此类备份存储库无法托管Veeam Data Mover —在备份代理和备份存储库之间（如​​果是备份作业）或备份存储库之间（如​​果是备份拷贝作业）建立连接的Veeam组件。为克服此限制， Veeam Backup & Replication使用网关服务器。

在备份基础架构中，网关服务器托管目标Veeam Data Mover。 Veeam Backup & Replication在源Veeam Data Mover和目标Veeam Data Mover之间建立连接，并通过网关服务器从/向备份存储库传输数据。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251113-1988866642575712256_395407.png)

## 挂载服务器
挂载服务器是使用访客操作系统文件和应用程序项目进行恢复所需的服务器。要访问存储在备份文件中的文件或项目，Veeam Backup & Replication会将备份内容挂载到挂载服务器。只有在挂载内容后，Veeam Backup & Replication才能获取文件并将其复制到还原目标位置。

如果执行以下操作，则需要使用挂载服务器：
- 客户机操作系统文件恢复；
- 应用程序项目恢复；
- 安全恢复；
- 即时文件共享恢复；

为了减少网络负载并加快还原过程，挂载服务器必须与存储备份文件的备份存储库位于同一站点。在这种情况下，您可以将流量保持在一个站点中。如果挂载服务器位于其他站点，则数据将在站点之间通过网络传输。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251113-1988867056608550912_395407.png)

## Veeam Data Mover
Veeam Data Mover代表Veeam Backup & Replication执行数据处理任务，如检索源机器数据，执行去重和压缩以及在目标存储上存储备份数据。

对于Microsoft Windows服务器，Veeam Data Mover具有持久性，即Veeam Data Mover仅在服务器上上传和安装一次。当您将Microsoft Windows服务器添加到备份基础架构时，Veeam Backup & Replication会自动安装Veeam Data Mover 。

对于Linux服务器，Veeam Data Mover可以是持久的或非持久的。每次Veeam Backup & Replication访问一台服务器时，都会上传和删除非持久Veeam Data Mover 。

为使Veeam Data Mover具有持久性，您在添加Linux服务器时必须指定一个具有root权限或等同于root权限的帐户。以下备份基础架构组件需要使用持久性Veeam Data Mover：
- 强化的存储库；
- 备份代理；

对于基于Linux服务器的其他备份基础架构组件，Veeam Data Mover可以是持久的或非持久的。如果您不想提供root或等效于root的权限，请指定一个具有非root权限的帐户。在这种情况下，Veeam Data Mover将是非持久性的。当Veeam Backup & Replication访问服务器时，`<% VBR % >` 将通过SSH连接上传并启动Veeam Data Mover。

## Veeam vPower NFS 服务
vPower技术支持以下特性：
- 恢复验证；
- 即时恢复；
- 即时磁盘恢复；
- 分阶段恢复；
- 通用应用程序项目恢复（U-AIR）；
- 多操作系统文件级还原；

vPower技术的关键架构是vPower NFS Service。vPower NFS服务是一种Microsoft Windows服务，在Microsoft Windows机器上运行，支持该机器充当NFS服务器。

在vPower NFS服务器上，Veeam Backup & Replication创建一个特殊目录— vPower NFS数据存储。当您从备份启动虚拟机或虚拟机磁盘时， Veeam Backup & Replication会在vPower NFS数据存储上“发布”来自备份的虚拟机的VMDK文件。从技术上讲， Veeam Backup & Replication用于模拟在vPower NFS数据存储上VMDK文件的存在— VMDK文件本身仍位于备份存储库的备份文件中。

然后， vPower NFS数据存储将挂载到ESXi主机。因此， ESXi主机可借助vPower NFS数据存储“查看”备份的虚拟机映像，并将其与常规VMDK文件一样使用。模拟的VMDK文件用作备份存储库中实际VMDK文件的指针。

## 广域网加速器
WAN 加速器是 Veeam Backup & Replication 用于 WAN 加速的专用组件。WAN 加速器负责全局数据缓存和数据去重。

## 日志传送服务器
日志传送服务器是 Veeam Backup & Replication 用于备份 Microsoft SQL Server 事务日志和 Oracle 归档日志的专用组件。

## 磁带服务器
磁带服务器是专门负责在数据源和磁带设备之间传输数据的组件。

## NDMP服务器
如果您的 NAS 设备支持 NDMP 协议，您可以将其中的数据备份到磁带。为此，您需要将 NAS 设备添加为 NDMP 服务器。

## Veeam Backup Enterprise Manager
Veeam Backup Enterprise Manager 是一个可选组件，专为具有多个备份服务器的分布式企业环境而设计。Veeam Backup Enterprise Manager 可联合多个备份服务器，并通过 Web 浏览器界面提供这些服务器的统一视图。您可以通过单一的“管理面板”集中控制和管理所有作业，编辑和克隆作业，监控作业状态，并获取所有备份服务器的报告数据。Veeam Backup Enterprise Manager 还允许您在备份基础架构的所有当前和已归档备份中搜索虚拟机客户操作系统文件，并一键恢复这些文件。


