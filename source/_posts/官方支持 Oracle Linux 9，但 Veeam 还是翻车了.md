---
title: 官方支持 Oracle Linux 9，但 Veeam 还是翻车了
date: 2026-01-20 14:30:22
tags: [墨力计划,oracle,veeam]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2013072141349625856
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)


# 前言
最近遇到一个挺折腾的问题：Veeam 12.3 给一台 Oracle Linux 9.6 的物理机做整机备份，怎么都跑不起来。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260119-2013073117325910016_395407.png)

一开始我以为就是个常规环境问题，结果一路查下来才发现，这个坑比想象中要深得多，中间几乎把 Veeam 在 Linux 下的几种纳管方式都试了一遍。最终虽然解决了，但过程相当曲折，还是有必要完整记录一下，给后面可能踩到同样坑的人留个参考。

# 分析过程
一开始我并没有想太多，流程也是完全按“正常用法”来的：在 VBR 上直接纳管物理机，装 Agent，然后就报错了，Agent 无法安装成功。

通过 VBR 纳管的 OL9 版本的系统，默认使用的就是 blksnap 驱动：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013482874226434048_395407.png)

于是排查思路也很自然，先从 blksnap 入手。

## blksnap 纳管
首先尝试在目标主机上直接安装 blksnap 的 rpm 包，这里需要注意的是：如果没有提前安装依赖，会报错缺少 `dkms、gcc、kernel-devel、perl` 等依赖包。
```bash
[root@SQCSLAIDB01P tmp]# rpm -ivh blksnap-6.3.1.1016-1.noarch.rpm 
warning: blksnap-6.3.1.1016-1.noarch.rpm: Header V4 RSA/SHA256 Signature, key ID e6fbd664: NOKEY
error: Failed dependencies:
        dkms is needed by blksnap-6.3.1.1016-1.noarch
        gcc is needed by blksnap-6.3.1.1016-1.noarch
        kernel-devel is needed by blksnap-6.3.1.1016-1.noarch
        perl is needed by blksnap-6.3.1.1016-1.noarch
```
这些依赖本身不算复杂，配置好本地 YUM 源之后，gcc、kernel-devel、perl 都可以直接安装：
```bash
dnf install -y gcc kernel-devel perl kernel-uek-devel
```
比较麻烦的是 dkms，这个包并不在 Oracle Linux 9 的基础仓库里，需要从 [EPEL](https://yum.oracle.com/repo/OracleLinux/OL9/developer/EPEL/x86_64/index.html) 仓库单独下载 rpm：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013464242587000832_395407.png)

再用 dnf localinstall 的方式安装：
```bash
[root@SQCSLAIDB01P tmp]# dnf localinstall dkms-3.3.0-1.el9.noarch.rpm
```
依赖补齐之后，再次安装 blksnap，安装过程中模块编译报错：
```bash
[root@SQCSLAIDB01P tmp]# rpm -ivh blksnap-6.3.1.1016-1.noarch.rpm 
...
...

Building module(s)...(bad exit status: 2)
Failed command:
make -j64 KERNELRELEASE=6.12.0-1.23.3.2.el9uek.x86_64 -j64 -C /lib/modules/6.12.0-1.23.3.2.el9uek.x86_64/build M=/var/lib/dkms/blksnap/6.3.1.1016/build modules

Error! Bad return status for module build on kernel: 6.12.0-1.23.3.2.el9uek.x86_64 (x86_64)
Consult /var/lib/dkms/blksnap/6.3.1.1016/build/make.log for more information.
WARNING: Package not configured! See output!
warning: %post(blksnap-6.3.1.1016-1.noarch) scriptlet failed, exit status 1
```
dkms status 里只能看到模块处于 added 状态，并没有真正 installed，很明显是 DKMS 编译阶段出了问题：
```bash
[root@SQCSLAIDB01P ~]# dkms status
blksnap/6.3.1.1016: added
```
翻了一下 `/var/lib/dkms/blksnap/.../make.log`，很快就找到了关键原因：
```bash
  The kernel was built by: gcc (GCC) 14.2.1 20240801 (Red Hat 14.2.1-1)
  You are using:           gcc (GCC) 11.5.0 20240719 (Red Hat 11.5.0-5.0.1)

...

gcc: error: unrecognized command-line option ‘-fmin-function-alignment=16’; did you mean ‘-flimit-function-alignment’?
  CC [M]  /var/lib/dkms/blksnap/6.3.1.1016/build/tracker.o
```
内核是用 gcc 14.2.1 编译的，而当前系统里默认的 gcc 是 11.5.0，编译参数中的 `-fmin-function-alignment=16` gcc 11 无法识别，所以报错了。

说白了就是一句话：**内核太新，编译器太旧，DKMS 当场翻车**。难道官方文档不支持，居然忘记先去查查官方兼容性了。

## 兼容性检查
从 Veeam 官方支持矩阵上看，Oracle Linux 9 是在支持列表里的，乍一看没什么问题。**但如果只看到“9”这个大版本，其实很容易被误导。**

![](https://oss-emcsprod-public.modb.pro/image/editor/20260119-2013077814632325120_395407.png)

继续翻 Oracle Linux 9.6 的官方文档，再结合 `uname -r` 的输出：
```bash
[root@SQCSLAIDB01P ~]# uname -r
6.12.0-1.23.3.2.el9uek.x86_64
```
可以确认这台机器用的是 UEK R8 内核：`6.12.0-1.23.3.2.el9uek.x86_64`。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013464079198396416_395407.png)

而 Veeam 对 Oracle Linux 的支持，其实是和 UEK 版本强绑定的，官方明确只支持 UEK3 到 UEK R7。UEK R8 属于比较新的内核分支，已经超出了当前官方支持范围。

看到这里，很多前面的异常其实就都说得通了：**官方不支持的内核，用默认方式失败，基本是预期之内。**

但问题还没完。既然 DKMS 方式的 blksnap 在 UEK R8 上编译不过，那自然会想到另一条路：**不走编译，直接用官方提供的预编译模块，也就是 kmod-blksnap。**

## kmod-blksnap 纳管
于是我又从 Veeam 的 [rpm](https://repository.veeam.com/backup/linux/agent/rpm/el/9/x86_64/) 仓库里下载了对应版本的 kmod-blksnap、veeam-libs 以及 veeam agent，按顺序安装：
```bash
[root@SQCSLAIDB01P tmp]# rpm -ivh kmod-blksnap-6.3.1.1016-1.el9.x86_64.rpm
[root@SQCSLAIDB01P tmp]# rpm -ivh veeam-libs-6.3.1.1016-1.x86_64.rpm
[root@SQCSLAIDB01P tmp]# rpm -ivh veeam-6.3.1.1016-1.el9.x86_64.rpm
```
安装过程本身是顺利的，VBR 侧重新扫描也能正常通过，但真正跑备份任务时，问题出现了：
```bash
Failed to perform managed backup
Failed to create volume snapshot
Failed to load module [veeamblksnap].
Failed to take volume snapshot
```
继续翻 Backup 日志，并没有看到特别明确的编译或版本报错，感觉像是一些未定义的错误：
```xml
Sub-task [On-host backup] failed
引发类型为“Veeam.Backup.Core.CAmTaskSessionFailedException”的异常。 (Veeam.Backup.Core.CAmTaskSessionFailedException)
在 Veeam.Backup.Core.AgentManagement.COnHostBackupSubTask.WaitComplete(IStopSessionSync stopSessionSync)
在 Veeam.Backup.Core.AgentManagement.COnHostBackupSubTask.Do(IStopSessionSync stopSessionSync)
在 Veeam.Backup.Core.CEpSubTasksCoordinator.ExecuteSubTask(CSubTaskContext subTaskContext, LogStorage logStorage)
```
到这一步，其实已经很清楚了：
- DKMS 方式的 blksnap 走不通；
- kmod-blksnap 也无法在当前内核下正常工作；

中间我也和 Veeam 官方做过沟通，对方建议可以尝试他们发布的 `kmod-blksnap` 补丁包。

于是照着官方说明，把补丁下载解压后上传到 VBR 主机的指定目录 `C:\ProgramData\Veeam\Agents\val\x64\rpm`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013420125421133824_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013420401285210112_395407.png)

手动修改 `C:\ProgramData\Veeam\Agents\VAL\ValPackageIndex` 文件，将 Oracle Linux 9.6 的版本映射加进去：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013446550262456320_395407.png)

然后重装 Agent：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013445968885784576_395407.png)

安装完成之后再次发起备份，结果依然失败：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260119-2013073117325910016_395407.png)

继续往下看官方补丁说明才发现，**这个补丁实际上只适配特定范围的 5.14 内核**，而我们使用的是 6.12 的 UEK R8，内核版本完全不在支持范围内。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013481302650593280_395407.png)

到这里基本可以下结论了：**kmod-blksnap 这条路，在 UEK R8 上同样行不通。**

# 解决方案
本来我已经准备放弃继续折腾了，CASE 也已经开好，等官方慢慢拉日志分析。结果今天不死心又去搜了一下错误关键字，居然搜到了一篇非常符合的 KB 文档：：[Failed to load module [veeamblksnap] on Oracle Linux 9 with UEK R8 kernel](https://www.veeam.com/kb4732)，简直太符合我现在的这个问题了。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013465086485667840_395407.png)

这篇 KB 的思路其实很关键：问题不在于 blksnap 本身，而在于编译环境。UEK R8 的内核是用 gcc 14 编译的，而系统默认 gcc 太旧，DKMS 编译自然会失败。

解决办法也很直接：**使用 `gcc-toolset-14`，让编译器版本和内核构建环境保持一致，然后重新编译 blksnap。**

按照 KB 文档操作，启用 gcc-toolset-14 后，强制执行 DKMS 安装：
```bash
[root@SQCSLAIDB01P 6.12.0-1.23.3.2.el9uek.x86_64]# scl enable gcc-toolset-14 -- dkms install -m blksnap/6.3.1.1016 --force
Deprecated feature: CLEAN (/var/lib/dkms/blksnap/6.3.1.1016/source/dkms.conf)
Sign command: /lib/modules/6.12.0-1.23.3.2.el9uek.x86_64/build/scripts/sign-file
Signing key: /var/lib/dkms/mok.key
Public certificate (MOK): /var/lib/dkms/mok.pub

Building module(s)... done.
Signing module /var/lib/dkms/blksnap/6.3.1.1016/build/veeamblksnap.ko
Signing module /var/lib/dkms/blksnap/6.3.1.1016/build/bdevfilter.ko
Installing /lib/modules/6.12.0-1.23.3.2.el9uek.x86_64/extra/veeamblksnap.ko.xz
Installing /lib/modules/6.12.0-1.23.3.2.el9uek.x86_64/extra/bdevfilter.ko.xz
Running depmod..... done.
Executing post-transaction command............................. done.
[root@SQCSLAIDB01P 6.12.0-1.23.3.2.el9uek.x86_64]# dkms status
blksnap/6.3.1.1016, 6.12.0-1.23.3.2.el9uek.x86_64, x86_64: installed
```
这一次，模块终于顺利编译完成，veeamblksnap 和 bdevfilter 都成功生成并加载，dkms status 里也能看到 installed 状态。

接下来再安装 veeam-libs 和 veeam agent：
```bash
[root@SQCSLAIDB01P tmp]# rpm -ivh veeam-libs-6.3.1.1016-1.x86_64.rpm 
[root@SQCSLAIDB01P tmp]# rpm -ivh veeam-6.3.1.1016-1.el9.x86_64.rpm
```
回到 VBR 控制台重新扫描，环境状态终于全部正常：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013465704159338496_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013466325574836224_395407.png)

再次发起整机备份，任务顺利执行：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013466929877573632_395407.png)

到这里，这个问题才算是真正解决。

# 拓展
最后再分享一篇 KB 文档：https://www.veeam.com/kb2804，可以查询 Veeam Agent for Linux - veeamsnap 和 blksnap 扩展 Linux 发行版支持。

![](https://oss-emcsprod-public.modb.pro/image/editor/20260120-2013498887723098112_395407.png)

这样可以很方便的查询我们应该使用哪个 kernel module 安装 Agent。

# 总结
简单总结一下这次踩坑的几个关键点：
1. Oracle Linux 9.6 使用 UEK R8 内核，目前确实不在 Veeam 官方支持范围内，很多问题本质上都是“新内核 + 旧工具”的不兼容。
2. blksnap 在 UEK R8 下并不是完全不能用，核心前提是编译环境必须和内核一致，gcc 版本不对，DKMS 一定失败。
3. kmod-blksnap 和官方补丁并不能覆盖所有 UEK R8 场景，盲目尝试只会浪费时间。

如果你也遇到了 Veeam 在 Oracle Linux 9.6 上加载 `veeamblksnap` 失败的问题，尤其是 UEK R8 内核环境，这套排查顺序和解决思路，应该能少让你绕不少弯路。

---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)