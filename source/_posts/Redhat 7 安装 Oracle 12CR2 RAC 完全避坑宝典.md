---
title: Redhat 7 安装 Oracle 12CR2 RAC 完全避坑宝典
date: 2021-12-13 22:35:36
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/193241
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
相信在 Redhat 7 上安装过 `Oracle 12CR2 RAC` 的朋友，看了本文一定会后悔没有早点看到这篇完美的避坑指南！

😜 如果有朋友不信邪，可以按照常规的方式安装，大概率是会遇到下面我列出的这些坑。

# 一、聊聊哪些坑
本文主要介绍 `Redhat 7.6` 系统安装 `Oracle 12201` 版本 `RAC` 的一些坑以及避坑方式。

绝对干货满满，物超所值，当然更欢迎大家来补充和纠错！

>**📢 注意：** 坑点主要位于 Grid 软件安装步骤中 `cvu check` 和 `root.sh` 执行。

## 坑 1：ASM device sharedness check
Grid 软件安装过程检查报错：Shared Storage Accessibility:/dev/asm_ocr ...FAILED (PRVG-11506)

​​​​​​![](https://img-blog.csdnimg.cn/7b60914c28444d4e94d952299448a3f1.png)

可参照 `MOS` 文档：
- 12.2: PRVG-0802 : Storage type for path "/dev/mapper/asm011p1" could not be determined (Doc ID 2251322.1)

这里先卖个关子，不说解决方案，MOS 建议是打一个补丁 25784424 来修复：
>**Apply patch [25784424](https://support.oracle.com/epmos/faces/ui/patch/PatchDetail.jspx?parent=DOCUMENT&sourceId=2251322.1&patchId=25784424), if CVU storage check fails for ASMLib paths 。**

## 坑 2：执行 root.sh 报错
**<font color='red'>😤 先吐槽一下，这 TM 简直巨坑无比！</font>**

当执行 `root.sh` 命令到进度 **14/19** 时，突然停止并且报错 `CLSRSC-400`，并提示**重启主机系统**，重启之后安装进程已经终止，继续执行依然报错，无奈卸载重装，结果依然报错，**<font color='orage'>当时搞了将近 3 个多小时</font>**，网上找遍了都没发现相关问题，**真是一把心酸泪 😢**！

![](https://img-blog.csdnimg.cn/ce3b6101cabd40dd904a7199cd2968ec.png)

在 `MOS` 上找了个相关文档，但没解决问题，可以参考一下：
- ALERT: root.sh Fails With "CLSRSC-400" While Installing GI 12.2.0.1 on RHEL or OL with RedHat Compatible Kernel (RHCK) 7.3 (Doc ID 2284463.1)

`MOS` 建议仍然是通过 `applyOneOffs` 打补丁来修复：
>**Interim patch 25078431 is required before installing 12.2 GI on Linux 7.3 (RedHat and OL7 with RHCK).**

**📢 注意：** 这里虽然没有帮助我解决问题，但是帮我打开了一个思路，让我想到了 12C 开始支持的新的打补丁方式 `applyPSU`，对我后面解决问题带来了很大的帮助！

## 坑 3：ASMCMD 报错
在修复了上述 2 个问题之后，😀 我又高高兴兴的开始执行 `root.sh`，看着一路畅通无阻，本想着收拾收拾回家了。

结果 `root.sh` 执行到进度 `19/19` 时，突然报错停止，报错内容为：kgfnGetConnDetails requires 4 parameters at/u01/app/12.2.0/grid/lib/asmcmdbase.pm line 5704，显示 `root.sh` 执行失败。

![](https://img-blog.csdnimg.cn/7fff740d41ad4613a859184eb27a266e.png)

此时，我不认命的觉得它安装成功，去试了下 `asmcmd` 命令，我直接裂开了 😵！

![](https://img-blog.csdnimg.cn/144e5423ed5d44d3920fc6934a8f8815.png)

好吧，放下书包，看报错日志，然后 `MOS` 一通发现了下面这些文档，以供参考：
- install.sh Hung And root.sh Is Failing At asmcmd lsdg --suppressheader While Installing A Zone With Clusterware (Doc ID 2414241.1)
- ASMCMD Failing With "KGFNGETCONNDETAILS Requires 4 Parameters at <GI_HOME>/lib/asmcmdbase.pm (Doc ID 2748316.1)

这个问题还算简单，但是还要卸载重装一遍，最后经过九九八一难，使出九牛二虎之力，终于把 Grid 软件安装成功了，后面 Oracle 软件安装和建库都尤为顺利。

# 二、说说如何避坑
聊完了有哪些坑，下面当然要说说怎么避开了！
 
 ## applyPSU
之前坑 2 有个 MOS 说要使用 `applyOneOffs` 打补丁来修复，于是就去搜了一下这个参数的用法，发现可以在 `Grid` 软件安装前打上补丁，顺带着还发现了 `applyPSU`，感觉找到了出路！

当时我使用 MOS 的方式进行单个补丁修复，结果一个又一个，感觉没完了一样，后来转念一想，`PSU` 季度补丁是包含之前的 BUG 修复补丁的，直接使用 `applyPSU` 提前打上季度补丁来进行修复，就没那么多问题，值得一试！
- How to Apply a Grid Infrastructure Patch Before Grid Infrastructure Configuration (before root.sh or rootupgrade.sh or gridsetup.bat) is Executed (Doc ID 1410202.1)    

参考上述 MOS 文档，有详细的介绍和使用方法。

## 修复坑1、2
通过 `12C` 开始支持的 `applyPSU` 方式，提前给 `Grid` 软件打上最新的季度 `PSU` 补丁，修复坑 1，2 的 `BUG`：

**1、解压 OPatch 补丁包**
```bash
## grid 用户下执行解压，覆盖 OPatch 旧版本
unzip -o /soft/p6880880_122010_Linux-x86-64.zip -d /u01/app/12.2.0/grid/
```
**2、查看 OPatch 补丁包版本**
```bash
## grid 用户下执行
/u01/app/12.2.0/grid/OPatch/opatch version

OPatch Version: 12.2.0.1.24
```
**3、解压最新 PSU 补丁**
```bash
## grid 用户下执行
unzip /soft/p32226491_122010_Linux-x86-64.zip -d /soft
```
**📢 注意：** 由于本文是在 2021年1月份写的，所以补丁包版本非最新，请下载当前最新的 PSU 补丁包！

**4、执行 Grid 软件安装**
```bash
## grid 用户下执行
./gridSetup.sh -applyPSU /soft/32226491

Preparing the home to patch...
Applying the patch /soft/32226491/...
Successfully applied the patch.
The log can be found at: /u01/app/oraInventory/logs/GridSetupActions2021-04-01_04-18-54PM/installerPatchActions_2021-04-01_04-18-54PM.log
Launching Oracle Grid Infrastructure Setup Wizard...
```
通过上述命令执行结果，可以看到成功安装了 PSU 补丁后才开始安装 Grid 软件！

**📢 注意：** 当通过上述方式提前安装了 PSU 补丁后，后面简直可以说是一帆风顺，直到执行 root.sh 到最后一步，遇到了坑 3。

## 修复坑 3
这个问题很简单，只需要执行一行命令即可，但是要注意执行命令的时机。
```bash
## 在 root 用户下执行，需要提前配置 grid 软件的 ORACLE_HOME 环境变量
/usr/bin/make -f $ORACLE_HOME/rdbms/lib/ins_rdbms.mk client_sharedlib libasmclntsh12.ohso libasmperl12.ohso ORACLE_HOME=$ORACLE_HOME
```
**执行顺序：**

当 Grid 软件安装 **<font color='orage'>执行到出现 `root.sh` 提示框时</font>**，执行以上命令，📢 需在两个节点以`root` 身份执行该命令，`ORACLE_HOME` 路径请根据实际情况填写！确保所有节点执行完之后，再执行 `root.sh`，就可以完美修复坑 3。

**接下来，就是顺风顺水，常规安装步骤了！不过，有 19C 了谁还用 12C 呢？😎**

# 三、知识拓展
咱们上面讲的几个坑，说白了都是 `BUG`，解决方案都是通过补丁来修复。事后我就在想，**官方为什么不在安装之前先把补丁都打上呢？<font color='orage'>这样不就可以避免这些 BUG 报错嘛！</font>**

**于是，我在试着整了一版打好 PSU 的 12C GRID 安装包，下面介绍一下如何操作！**

## 1、实现依据
通过以下👇🏻 两个参数可以将基础安装包和补丁包进行集成打包。
- Oracle 12C开始支持Grid安装前安装PSU补丁：-applyPSU
- Oracle 18C/19C支持Grid/Oracle安装前安装RU补丁：-applyRU

**集成目的：** 安装时可以省去安装补丁的步骤，直接解压集成安装包安装即可！
## 2、实现方式
以下举例 `12CR2 Grid` 集成补丁包 `32540149` 步骤：

**1、上传安装介质**
```bash
##Grid基础安装包
LINUX.X64_122010_grid_home.zip
##OPatch补丁包
p6880880_122010_Linux-x86-64.zip
##PSU补丁包
p32540149_122010_Linux-x86-64.zip
##Oracle一键配置脚本
OracleShellInstall.sh
```
**2、配置主机环境**

使用我编写的 Oracle 一键安装脚本进行环境配置：
```bash
./OracleShellInstall.sh -i 10.211.55.100 `#Public ip`\
-n restart `# hostname`\
-o nocdb `# oraclesid`\
-gp oracle `# grid user password`\
-op oracle `# oracle user password`\
-b /oracle/app `# install basedir`\
-s AL32UTF8 `# characterset`\
-m Y
```
**​3、安装补丁**

分别解压 `OPatch` 补丁包和 `PSU` 补丁包：
```bash
##解压更新OPatch包
unzip -o p6880880_122010_Linux-x86-64.zip -d /oracle/app/12.2.0/grid
chown -R grid:oinstall /oracle/app/12.2.0/grid/OPatch

##解压PSU补丁包
unzip p32540149_122010_Linux-x86-64.zip /soft
chown -R grid:oinstall /soft/32540149
```
Grid 安装好补丁，但是不执行安装过程：
```bash
su - grid -c "/oracle/app/12.2.0/grid/gridSetup.sh -applyPSU /soft/32540149"

## 安装成功后
## 1.修复bug：
## [INS-42505] The installer has detected that the Oracle Grid Infrastructure home software at (/oracle/GRID/12201) is not complete. (Doc ID 2697235.1)
mv $ORACLE_HOME/install/files.lst $ORACLE_HOME/install/files.lst.bak
```
![](https://img-blog.csdnimg.cn/6e63a2a37d8747489bcd050a575fcf21.png)

**📢 注意：** 上面遇到这个小 BUG，也可以无视，没有什么大影响。

**4、压缩 ORACLE_HOME 目录**

这里我将安装好的 Grid ORACLE_HOME 压缩打包成 `zip` 安装包：
```bash
cd /oracle/app/12.2.0/grid/
zip -r LINUX.X64_122010_grid_home_32540149.zip *
mv LINUX.X64_122010_grid_home_32540149.zip /soft
```
![](https://img-blog.csdnimg.cn/4539b02f4b174f95b7081ade147028e9.png)

**<font color='orage'>至此，基础安装包和补丁包集成成功。</font>**

## 3、安装测试
这里我们打开一台新的主机进行安装测试。

**1、上传集成安装包等介质**
```bash
##Grid集成安装包
LINUX.X64_122010_grid_home_32540149.zip
##Oracle一键配置脚本
OracleShellInstall.sh
```
**2、主机环境初始化配置**
```bash
##iscsi挂载共享盘
iscsiadm -m discovery -t st -p 10.211.55.22
iscsiadm -m node -T iqn.2008-08.com.starwindsoftware:10.211.55.22-lucifer -p 10.211.55.22 -l
 
##重命名安装包
mv LINUX.X64_122010_grid_home_32540149.zip LINUX.X64_122010_grid_home.zip
 
##执行脚本初始化配置
cd /soft
./OracleShellInstall.sh -i 10.211.55.100 `#Public ip`\
-n restart `# hostname`\
-o nocdb `# oraclesid`\
-gp oracle `# grid user password`\
-op oracle `# oracle user password`\
-b /u01/app `# install basedir`\
-s AL32UTF8 `# characterset`\
-dd /dev/sdc `# asm data disk`\
-dn DATA `# asm data diskgroupname`\
-dr EXTERNAL `# asm data redundancy`\
-m Y
```
**3、安装 Grid 软件**
```bash
su - grid
cd /oracle/app/12.2.0/grid/
./gridSetup.sh
```
执行 `root.sh` 前执行：
```bash
## 2.修复bug:ASMCMD Failing With "KGFNGETCONNDETAILS Requires 4 Parameters at <GI_HOME>/lib/asmcmdbase.pm (Doc ID 2748316.1)
export ORACLE_HOME=/u01/app/12.2.0/grid
/usr/bin/make -f $ORACLE_HOME/rdbms/lib/ins_rdbms.mk client_sharedlib libasmclntsh12.ohso libasmperl12.ohso ORACLE_HOME=$ORACLE_HOME
```
![](https://img-blog.csdnimg.cn/e1107cd86032427f85a33fc0594b8518.png)

顺利安装完毕！虽然实际用处不大，也算是一个思路吧，可以节省一些时间。

# 写在最后
Oracle 学习路漫漫，茫茫文档需要看，直觉前路要变宽，到头还被 BUG 绊！😂

---

# 往期精彩文章
>[Oracle 一键巡检自动生成 Word 报告](https://mp.weixin.qq.com/s/0xFe5m1DQ0ucT2_266hsrA)    
[Oracle 一键安装合集](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5MzcwNzQ0MQ==&action=getalbum&album_id=3497774649285296131#wechat_redirect)    
[Oracle一键安装脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/gv6t97FFyMsd6e4GH1HAwQ)    
[Oracle一键巡检脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/4zI73auIUhwSRb7qL3UIfw)    
[全网首发：Oracle 23ai 一键安装脚本（非 RPM）](https://mp.weixin.qq.com/s/UL0BSMCAZrOQgCoWpDMGew)    
[Oracle 19C 最新 RU 补丁 19.24 ，一键安装！](https://mp.weixin.qq.com/s/T7GbpwhnMugzk7PB6hAoJQ)    
[Oracle Linux 7.9 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/dT4tFMYVZ3mh49CI6V3YEA)    
[RedHat 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cQJ6gP1bM_7m0H5-Dha4TA)    
[openEuler 22.03 LTS SP4 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/sx1E4GIvIeQXp2vGMmVr2A)    
[RHEL 7.9 一键安装 Oracle 19C 19.23 RAC](https://mp.weixin.qq.com/s/mUHqU5hQ9GdH2bKuClPt5A)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q)    
[优化 Oracle：最佳实践与开发规范](https://mp.weixin.qq.com/s/DysIcb-p11j56d3YtlqpcQ)    
[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA)    
[Linux 一键配置时钟同步全攻略](https://mp.weixin.qq.com/s/yvth1vorP3JjUp3g3vPBAQ)    

---

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎**点赞+关注**，我会持续分享数据库知识、运维技巧。