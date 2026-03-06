---
title: Veeam 主机 agent 纳管问题小记
date: 2025-11-18 13:06:11
tags: [墨力计划,veeam12]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1990633255331258368
---

# 前言
今天用 Veeam 纳管了几十台主机，基本都是 Linux 和 Windows 两种类型，期间遇到了一些问题，整理总结一下，以备后面再遇到可以方便查看。

# 问题一
## 问题描述
主机系统同样都是 Centos 8.3，却有 2 台显示不支持的系统 `Unsupported OS`，无法纳管：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990633598438416384_395407.png)

## 问题分析
检查操作系统版本：
```bash
[root@AP ~]# cat /etc/redhat-release 
CentOS Linux release 8.3.2011
```
检查官方文档支持清单，显示不支持 Centos 8 系列：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990634183748837376_395407.png)

检查 Rescan 日志（`C:\ProgramData\Veeam\Backup\Rescan`）：
```bash
[18.11.2025 09:12:00.269]    <18>    Info (3)    [veeamdeployer] Command result: '<OutputArguments><systemInfo value="<LinuxEpSystemInfo SystemType="1" ComputerName="AP" OsPlatform="1" KernelVersion="4.18.0.0" OsVersionStr="CentOS Linux 8" BiosUuid="{4c893f4b-e635-7b4e-95fe-df41418df887}" SystemIsVirtual="true" IsSupported="false" KernelFlavour="240.el8.x86_64" PublicCloudType="0"><DistrInfo name="CentOS Linux" osType="centos" version="8.0.0.0" prettyName="CentOS Linux 8" /></LinuxEpSystemInfo>" /></OutputArguments>'

[18.11.2025 09:13:36.966]    <17>    Info (3)    [SEpAgentDiscoveryHelper] Check whether Linux host '192.168.40.103' supports deployment. Agent version '0.0.0.0', Is supported 'False'.
[18.11.2025 09:13:36.966]    <17> Warning (3)    Skipping 192.168.40.103: host does not meet system requirements for agent deployment
[18.11.2025 09:13:36.966]    <17>    Info (3)        [DB] Sync agent [1c004789-4ec6-4876-896f-adbd2ffac92a]: agentInstallationStatus [UnsupportedOs]
```
从以上日志中可以提取出关键字 `IsSupported="false"`，`agentInstallationStatus [UnsupportedOs]`，很明显了，就是操作系统不支持。

## 解决方案
解决方案比较简单，可以下载红帽 RHEL 8 的 Veeam rpm 包进行手动安装：
>https://repository.veeam.com/backup/linux/agent/rpm/el/8/x86_64/

Linux x64 的需要下载以下几个 rpm 包：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990643285984616448_395407.png)

上传到主机上按照以下顺序进行安装：
```bash
rpm -ivh kmod-veeamsnap-6.3.2.1207-1.el8.x86_64.rpm
rpm -ivh veeam-libs-6.3.2.1207-1.x86_64.rpm
rpm -ivh veeam-6.3.2.1207-1.el8.x86_64.rpm
```
安装完成后，再回到 VBR 执行 Rescan 即可。

至于为什么其他几个 Centos8 系统可以纳管成功，我猜测是之前有人手动安装过 agent 吧，看了下 veeam agent 目录时间：
```bash
[root@AP veeam]# ll
drwxr-xr-x 7 root root  177 Apr 28  2025 deployment
drwxr-xr-x 4 root root 4096 Apr 28  2025 transport
```
看起来确实如此，问题解决。

# 问题二
## 问题描述
第二个问题就更加没见过了，两台 Windows 主机无法纳管，报错如下：
```bash
2025/11/18 9:47:50 Warning Failed to connect to 192.168.120.23 Details: The network path was not found. The network path was not found. (ERROR_BAD_NETPATH). 
```

## 问题分析
一开始在添加过程中一直提示 RPC 错误，就以为是网络端口限制或者密码不对，折腾了很久，后来排除了以上两种原因。

在 Google 搜了一下解决方案，找到一个类似的文档：
>https://www.veeam.com/kb4495

看问题描述，和我遇到的情况一致：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990645074288533504_395407.png)

检查 Rescan 日志（`C:\ProgramData\Veeam\Backup\Rescan\Rescan_of_<protection_group_name>\Task.<machine_name>.log`）：
```bash
[18.11.2025 09:47:46.692]    <29>    Info (3)    [RPC] Making sure that the deployment service installed on host [192.168.120.23]. Failed.
[18.11.2025 09:47:46.692]    <29>   Error (3)    [RPC] The network path was not found.
[18.11.2025 09:47:46.692]    <29>   Error (3)    [RPC] The network path was not found. (ERROR_BAD_NETPATH)
[18.11.2025 09:47:46.692]    <29>   Error (3)    [RPC] --tr:Error code: 0x00000035
[18.11.2025 09:47:46.692]    <29>   Error (3)    [RPC] --tr:Failed to create persistent connection to ADMIN$ shared folder on host [192.168.120.23].
[18.11.2025 09:47:46.692]    <29>   Error (3)    [RPC] --tr:Failed to install service [VeeamDeploySvc] was not installed on the host [192.168.120.23].
```
根据文档提示，排除了防火墙、DNS、服务器关机、网络端口限制、服务运行以及网卡开启文件和打印机共享功能这些问题，最后就只剩下 `ADMIN$ Share Is Active` 这个没有检查。

在被纳管的 Windows 主机上使用 PowerShell 执行以下命令： 
```bash
Get-WmiObject -Class Win32_Share | Where-Object { $_.Name -eq 'admin$' }
```
如果执行后没有返回内容，则说明有问题，反之是正常的：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990646560913448960_395407.png)

我这两台都没有返回任何信息，符合文档描述，解决方案也很简单，重启服务器服务就行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990646812366168064_395407.png)

打开服务管理，重启 Server 服务：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990646958084677632_395407.png)

重启后，再次检查：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990647054364925952_395407.png)

可以正常返回结果，在 VBR 上执行 Rescan：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251118-1990647251162177536_395407.png)

纳管成功，问题解决。

# 写在最后
虽然问题的处理方式都比较简单，但是没有遇到过处理起来就容易一脸懵，这次弄清楚之后，以后再遇到就可以从从容容、游刃有余了。