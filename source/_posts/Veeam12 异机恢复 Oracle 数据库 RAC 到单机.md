---
title: Veeam12 异机恢复 Oracle 数据库 RAC 到单机
date: 2025-09-24 08:18:26
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1967433377703800832
---

# 前言
最近做恢复演练需要使用 Veeam 恢复一套 RAC 数据库到灾备单机数据库。


# 灾备环境准备
## 安装 Oracle 软件
使用 OracleShellInstall 脚本一键安装 Oracle 软件：
```bash
./OracleShellInstall \
-lrp N `# 配置本地软件源`\
-ud Y `# 安装到Oracle软件结束`\
-lf ens18 `# 公网IP的网卡名称`\
-n SQCSLdisasterT02 `# 主机名`\
-ord /data `# Oracle数据文件目录`\
-ard /data/archivelog `# Oracle归档文件目录`\
-o lucifer `# 数据库名称`\
-ns AL16UTF16 `# 国家字符集`
```
安装完成后，配置 Veeam Agent，可参考文章：[Veeam：在 CentOS/RHEL7 上安装 Agent](https://www.modb.pro/db/1967141103941988352)。

## 创建恢复密钥
在 Veeam 控制台选择需要被恢复的主机，右键创建恢复密钥：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967434433716301824_395407.png)

复制密钥后，点击创建（有效期是24小时）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967434592823029760_395407.png)

然后打开灾备主机，进入 Veeam Oracle RMAN 的安装目录下，执行密钥加载：
```bash
cd /opt/veeam/VeeamPluginforOracleRMAN/
./OracleRMANConfigTool --set-auth-data-for-restore
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967435313005998080_395407.png)

至此，密钥就搞定了。

# 异机恢复
打开 Veeam 控制台，选择需要被恢复的主机，右键选择从 `Oracle RMAN backup` 恢复：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967435805308235776_395407.png)

会自动打开 Veeam.Oracle.Explorer 工具：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967435888930074624_395407.png)

右键选择 restore 开始恢复：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967436669276139520_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967437085514674176_395407.png)

这里输入灾备主机的 IP 以及 oracle 用户密码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967436970594938880_395407.png)

如果安装目录不一致，需要选择下面的进行修改：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967437341195251712_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967437671005958144_395407.png)

选择需要恢复到最新或者其他需要的时间点：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967437907791196160_395407.png)

由于是 RAC 恢复到单机，所以需要修改数据库文件的位置（修改第一行，然后点击同步就行）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967438269562499072_395407.png)

检查以上修改后的文件目录是否存在，没有则手动在灾备主机上进行创建：
```bash
## oracle 用户执行
mkdir -p /data/lucifer/CONTROLFILE/
mkdir -p /data/lucifer/DATAFILE/
mkdir -p /data/lucifer/86B637B62FE07A65E053F706E80A27CA/DATAFILE/
mkdir -p /data/lucifer/2BFE67B0B608F9ABE0638128C70AF9E0/DATAFILE/
mkdir -p /data/lucifer/ONLINELOG/
mkdir -p /data/lucifer/TEMPFILE/
mkdir -p /data/lucifer/2BFE3BB27172C814E0638128C70A58A0/TEMPFILE/
mkdir -p /data/lucifer/2BFE67B0B608F9ABE0638128C70AF9E0/TEMPFILE/
```
从文件路径可以看出来这是一套 CDB 架构的数据库。

目录创建完成后，继续下一步，可以选择多个通道加快恢复速度：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967439258419998720_395407.png)

开始恢复：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967439448044482560_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967458053704396800_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20250915-1967459833104314368_395407.png)

恢复的时间根据数据库的备份大小和磁盘性能来决定。

















