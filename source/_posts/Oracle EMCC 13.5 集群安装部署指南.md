---
title: Oracle EMCC 13.5 集群安装部署指南
date: 2025-07-02 13:19:20
tags: [墨力计划,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1939579573704863744
---

> 大家好，这里是 **DBA 学习之路**，专注于提升数据库运维效率。

@[TOC](目录)

## 前言

本文档详细介绍了如何部署 Oracle Enterprise Manager Cloud Control (EMCC) 13.5 的高可用集群环境。整个部署方案基于 Oracle RAC 架构实现 OMR（Oracle Management Repository）集群，采用 EMCC 13.5 和 Oracle 19.27 数据库版本，最终实现 Active-Active 模式的 OMS（Oracle Management Service）集群。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250707-1942145457162039296_395407.png)

## 第一阶段：OMR 集群部署

### 1.1 Oracle RAC 环境准备

首先部署作为 EMCC 存储库的 Oracle RAC 集群。推荐使用作者开发的 [Oracle 一键安装命令生成工具](https://mp.weixin.qq.com/s/6mn3Y63njUwsDw-rg4qgZA) 来简化安装过程。

![Oracle RAC 安装工具截图](https://oss-emcsprod-public.modb.pro/image/editor/20250630-1939591648833449984_395407.png)

**执行安装步骤：**

1. 在主节点上传一键安装脚本和安装包；
2. 执行 RAC 一键安装命令（**强烈建议在 VNC 环境中运行以防止意外中断**）；

```bash
./OracleShellInstall \
-lf ens192 `# 公网IP网卡名称`\
-pf ens224 `# 心跳IP网卡名称`\
-n oem `# 主机名前缀`\
-hn oem01,oem02 `# 所有节点主机名`\
-ri 192.168.6.80,192.168.6.81 `# 公网IP地址`\
-vi 192.168.6.82,192.168.6.83 `# 虚拟IP地址`\
-si 192.168.6.85 `# SCAN IP地址`\
-rp 'oracle' `# root用户密码`\
-od /dev/sdb,/dev/sdc,/dev/sdd `# OCR磁盘组磁盘列表`\
-dd /dev/sde `# DATA磁盘组磁盘列表`\
-or NORMAL `# OCR磁盘组冗余度`\
-o emcc `# 数据库名称`\
-gpa 37641958 `# Grid PSU/RU补丁编号`\
-jpa 37499406 `# OJVM PSU/RU补丁编号`\
-opd Y `# 优化数据库`
```

安装过程约需 1 小时左右，完成后会看到如下界面：

![Oracle RAC 安装完成截图](https://oss-emcsprod-public.modb.pro/image/editor/20250630-1939614543894818816_395407.png)

### 1.2 数据库版本验证

安装完成后，验证数据库补丁版本：

```bash
[oracle@oem01:/home/oracle]$ opatch lspatches
37499406;OJVM RELEASE UPDATE: 19.27.0.0.250415 (37499406)
37654975;OCW RELEASE UPDATE 19.27.0.0.0 (37654975)
37642901;Database Release Update : 19.27.0.0.250415 (37642901)

OPatch succeeded.
```

### 1.3 EMCC 专用数据库优化

为确保 EMCC 的最佳性能，需要进行以下数据库参数优化：

```sql
-- 优化共享池大小
SQL> alter system set shared_pool_size=600M;

-- 临时禁用统计信息收集任务（安装完成后自动启用）
SQL> BEGIN
  DBMS_AUTO_TASK_ADMIN.DISABLE(CLIENT_NAME => 'auto optimizer stats collection',
                               OPERATION   => NULL,
                               WINDOW_NAME => NULL);
END;
/

-- 设置并行服务器参数
SQL> alter system set parallel_max_servers=8;

-- 启用特定兼容性参数
SQL> alter system set "_allow_insert_with_update_check"=true;

-- 重置优化器自适应功能参数（Oracle 官方建议）
SQL> alter system reset "_optimizer_nlj_hj_adaptive_join" scope=both sid='*';
alter system reset "_optimizer_strans_adaptive_pruning" scope=both sid='*';
alter system reset "_px_adaptive_dist_method" scope=both sid='*';
alter system reset "_sql_plan_directive_mgmt_control" scope=both sid='*';
alter system reset "_optimizer_dsdir_usage_control" scope=both sid='*';
alter system reset "_optimizer_use_feedback" scope=both sid='*';
alter system reset "_optimizer_gather_feedback" scope=both sid='*';
alter system reset "_optimizer_performance_feedback" scope=both sid='*';

-- 重启数据库使配置生效
SQL> shutdown immediate
SQL> startup
```

至此，EMCC 的 OMR 数据库环境已准备就绪。

## 第二阶段：ACFS 集群文件系统构建

为实现 OMS 的高可用性，需要创建 ACFS（ASM Cluster File System）共享文件系统来存储 OMS 软件和配置文件。

### 2.1 存储层配置

#### 配置 multipath 多路径

编辑 multipath 配置文件，添加 OMS 专用共享磁盘：

```bash
vi /etc/multipath.conf

## 新增 OMS 共享磁盘配置
multipath {
    wwid 2515190a70c079c6f
    alias asm_oms_1
}
```

![multipath 配置截图](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939868879065460736_395407.png)

使配置生效：

```bash
multipath -F
multipath -v2
multipath -ll
```

![multipath 生效验证](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939869155235213312_395407.png)

#### 配置 UDEV 设备绑定

为 OMS 共享磁盘创建稳定的设备路径：

```bash
cat<<-EOF>>/etc/udev/rules.d/99-oracle-asmdevices.rules
KERNEL=="dm-*",ENV{DM_UUID}=="mpath-2515190a70c079c6f",SYMLINK+="asm_oms_1",OWNER="grid",GROUP="asmadmin",MODE="0660"
EOF

# 应用 udev 规则
udevadm control --reload-rules
udevadm trigger --type=devices --action=change
```

![UDEV 配置验证](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939869677564473344_395407.png)

### 2.2 ACFS 文件系统创建

#### 使用 ASMCA 创建磁盘组

以 grid 用户身份运行 ASMCA 图形界面工具：

![ASMCA 启动界面](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939872341480189952_395407.png)

按照向导步骤创建 OMS 磁盘组：

![磁盘组创建步骤1](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939872536557268992_395407.png)

![磁盘组创建步骤2](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939872596959440896_395407.png)

#### 创建 ACFS Volume

![Volume 创建界面](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939874515937406976_395407.png)

![Volume 配置界面](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939875366642921472_395407.png)

![Volume 创建确认](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939875456954675200_395407.png)

#### 挂载点准备和文件系统创建

在所有节点创建挂载点：

```bash
[root@oem01:/root]# mkdir /OMS
[root@oem02:/root]# mkdir /OMS
```

完成 ACFS 文件系统创建：

![ACFS 创建步骤1](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939875633769754624_395407.png)

![ACFS 创建步骤2](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939875917304705024_395407.png)

![ACFS 创建完成](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939876175359258624_395407.png)

执行 ACFS 挂载脚本：

```bash
[root@oem01:/root]# /u01/app/grid/cfgtoollogs/asmca/scripts/acfs_script.sh
ACFS file system /OMS is mounted on nodes oem01,oem02
```

![ACFS 挂载验证](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939876989071011840_395407.png)

验证挂载状态：

![挂载状态确认1](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939877361944637440_395407.png)

![挂载状态确认2](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939877494425923584_395407.png)

现在 ACFS 共享集群文件系统已成功创建并挂载到所有节点。

## 第三阶段：OMS 集群部署

本阶段将部署 Active-Active 模式的 OMS 集群，实现真正的高可用性。

### 3.1 环境准备

#### 系统依赖包安装

参考 Oracle 官方文档的[软件包要求](https://docs.oracle.com/en/enterprise-manager/cloud-control/enterprise-manager-cloud-control/13.5/embsc/package-kernel-parameter-and-library-requirements-enterprise-manager-cloud-control.html#GUID-3BB45A80-47C2-4AA5-929A-7523861E9A2C)：

![官方依赖包要求](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939879698461372416_395407.png)

在所有节点执行软件包安装：

```bash
## root 用户在所有节点执行
yum install -y binutils compat-libcap1 compat-libstdc++-33 gcc gcc-c++ glibc glibc-devel libaio libaio-devel libgcc libstdc++ libstdc++-devel dejavu-serif-fonts ksh make sysstat numactl numactl-devel motif motif-devel redhat-lsb redhat-lsb-core openssl
```

安装额外的 32 位 glibc 开发包：

```bash
## 在所有节点执行
cd /mnt/Packages/
yum install -y glibc-devel-2.17-317.0.1.el7.i686.rpm
```

验证安装结果：

```bash
rpm -q binutils compat-libcap1 compat-libstdc++-33 gcc gcc-c++ glibc glibc-devel libaio libaio-devel libgcc libstdc++ libstdc++-devel dejavu-serif-fonts ksh make sysstat numactl numactl-devel motif motif-devel redhat-lsb redhat-lsb-core openssl
```

#### 系统参数优化

配置网络端口范围：

```bash
## root 用户在所有节点执行
echo 11000 65000 > /proc/sys/net/ipv4/ip_local_port_range

cat<<-\EOF>>/etc/sysctl.conf
net.ipv4.ip_local_port_range = 11000 65000
EOF

sysctl -p
systemctl restart network.service
```

配置进程限制：

```bash
## root 用户在所有节点执行
echo "nproc 4098" >> /etc/security/limits.conf
```

#### 目录结构创建

建立标准的 Oracle 软件目录结构：

```bash
## root 用户在所有节点执行
mkdir -p /u01/app/oracle/middleware/oms
mkdir -p /u01/app/oracle/middleware/agent
chown -R oracle.oinstall /u01/app/oracle/middleware
```

#### 环境变量配置

为 OMS 和 Agent 分别创建专用的环境配置文件：

**OMS 环境配置：**

```bash
## oracle 用户执行
cp /home/oracle/.bash_profile /home/oracle/.oms
vi /home/oracle/.oms

## 在 export PATH 下方添加以下内容
umask 022
export TMP=/tmp
export TMPDIR=$TMP
export PATH=/usr/sbin:$PATH
export PS1="[`whoami`@`hostname`:"'$PWD]$ '
export ORACLE_HOME=/u01/app/oracle/middleware/oms
export PATH=$ORACLE_HOME/bin:$ORACLE_HOME/OMSPatcher:$PATH
```

**Agent 环境配置：**

```bash
## oracle 用户执行
cp /home/oracle/.bash_profile /home/oracle/.agent
vi /home/oracle/.agent

## 在 export PATH 下方添加以下内容
umask 022
export TMP=/tmp
export TMPDIR=$TMP
export PATH=/usr/sbin:$PATH
export PS1="[`whoami`@`hostname`:"'$PWD]$ '
export ORACLE_HOME=/u01/app/oracle/middleware/agent/agent_13.5.0.0.0
export PATH=$ORACLE_HOME/bin:$ORACLE_HOME/AgentPatcher:$PATH
```

#### 语言环境检查和配置

**重要提醒：** 这是一个关键配置点，语言环境必须设置为英文，否则会导致安装失败。

![语言环境错误示例](https://oss-emcsprod-public.modb.pro/image/editor/20250528-1927631265847586816_395407.png)

参考 Oracle 支持文档：[EM 13.5: OMS Installation Fails in Repository Configuration Phase with the Error: ORA-01843: not a valid month (Doc ID 2880634.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=2880634.1)

验证当前语言环境：

```bash
[root@emcc:/root]# locale
LANG=en_US.UTF-8
LC_CTYPE="en_US.UTF-8"
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_PAPER="en_US.UTF-8"
LC_NAME="en_US.UTF-8"
LC_ADDRESS="en_US.UTF-8"
LC_TELEPHONE="en_US.UTF-8"
LC_MEASUREMENT="en_US.UTF-8"
LC_IDENTIFICATION="en_US.UTF-8"
LC_ALL=
```

如果语言环境为中文，需要修改为英文：

```bash
## root 用户执行
cat <<-EOF>/etc/profile.d/locale.sh
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8
export LC_COLLATE=C
export LC_CTYPE=en_US.UTF-8
EOF

source /etc/profile.d/locale.sh
```

### 3.2 主节点 OMS 安装

确保所有准备工作完成后，开始进行 OMS 的图形化安装。

#### 启动安装程序

```bash
## oracle 用户执行，强烈建议使用 VNC 进行远程安装
[oracle@oem01 ~]$ source .bash_profile
[oracle@oem01:/home/oracle]$ cd /soft/
[oracle@oem01:/soft]$ chmod +x em13500_linux64.bin
[oracle@oem01:/soft]$ ./em13500_linux64.bin
```

#### 安装向导步骤

**步骤 1：** 安装类型选择

![安装类型选择](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939894811599843328_395407.png)

**步骤 2：** 软件更新配置

![软件更新配置](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939894893107752960_395407.png)

**步骤 3：** 先决条件检查

![先决条件检查](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939894964415115264_395407.png)

**步骤 4：** 安装详细信息配置

![安装详细信息](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939895276769128448_395407.png)

**关键配置点：**

- 全部勾选所有可选组件

![组件选择](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939895329357312000_395407.png)

- 设置管理员密码（建议使用：Welcome1）

![管理员密码设置](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939895506155614208_395407.png)

**步骤 5：** 数据库连接配置

填写之前创建的 RAC 数据库信息，**关键点：必须使用 SCAN IP 地址**

![数据库连接配置](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939896296240852992_395407.png)

数据库连接验证：

![数据库验证](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939896514764091392_395407.png)

**步骤 6：** 先决条件验证和自动修复

![先决条件验证](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939896724970024960_395407.png)

使用 Auto Fix 功能解决问题：

![自动修复](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939896870747254784_395407.png)

![修复完成](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939897024707571712_395407.png)

**步骤 7：** SYSMAN 密码设置

设置 EMCC 登录用户密码：

![SYSMAN 密码设置](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939897736686481408_395407.png)

**步骤 8：** 软件库位置配置

**重要：** 选择 ACFS 共享磁盘作为软件库位置：

![软件库位置配置](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939898041503330304_395407.png)

**步骤 9：** 端口配置确认

确认以下端口配置并开启防火墙策略：

![端口配置](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939898189209939968_395407.png)

**步骤 10：** 开始安装

![开始安装](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939898237641568256_395407.png)

#### 安装过程监控

![安装进度监控](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939898302955270144_395407.png)

等待安装完成：

![安装基本完成](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939925924636536832_395407.png)

#### 后安装配置

执行必要的 root 脚本：

![root 脚本执行提示](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939934536159211520_395407.png)

```bash
[root@oem01:/root]# /u01/app/oracle/middleware/oms/allroot.sh

Starting to execute allroot.sh .........

Starting to execute /u01/app/oracle/middleware/oms/root.sh ......
Check /u01/app/oracle/middleware/oms/install/root_oem01_2025-07-01_14-30-28.log for the output of root script

Finished product-specific root actions.
/etc exist
Finished execution of  /u01/app/oracle/middleware/oms/root.sh ......

Starting to execute /u01/app/oracle/middleware/agent/agent_13.5.0.0.0/root.sh ......

Finished product-specific root actions.
/etc exist
Finished execution of  /u01/app/oracle/middleware/agent/agent_13.5.0.0.0/root.sh ......
```

安装完成确认：

![安装完成界面](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939934797665677312_395407.png)

### 3.3 补丁安装和更新

为确保系统稳定性和安全性，需要安装最新的 Bug 修复补丁和 Release Update。

#### 3.3.1 OMS Bug 修复补丁安装

**补丁 35430934：**

```bash
[oracle@oem01:/soft]$ source ~/.oms
[oracle@oem01:/soft]$ unzip -q /soft/p35430934_122140_Generic.zip
[oracle@oem01:/soft]$ cd 35430934
[oracle@oem01:/soft/35430934]$ opatch apply -silent
```

**补丁 34153238：**

```bash
[oracle@oem01:/soft/35430934]$ cd /soft
[oracle@oem01:/soft]$ unzip -q /soft/p34153238_122140_Generic.zip
[oracle@oem01:/soft]$ cd 34153238
[oracle@oem01:/soft/34153238]$ opatch apply -silent
```

**补丁 31657681：**

```bash
[oracle@oem01:/soft/34153238]$ cd /soft
[oracle@oem01:/soft]$ unzip -q /soft/p31657681_191000_Generic.zip
[oracle@oem01:/soft]$ cd 31657681
[oracle@oem01:/soft/31657681]$ opatch apply -silent
```

#### 3.3.2 OMS Release Update 安装

**更新 OMSPatcher：**

```bash
[oracle@oem01:/soft]$ source ~/.oms
[oracle@oem01:/soft]$ unzip -qo /soft/p19999993_135000_Generic.zip -d $ORACLE_HOME
[oracle@oem01:/soft]$ omspatcher version
OMSPatcher Version: 13.9.5.25.0
OPlan Version: 12.2.0.1.16
OsysModel build: Tue Apr 28 18:16:31 PDT 2020
```

**应用 RU 补丁：**

```bash
[oracle@oem01:/soft/37439429]$ omspatcher apply

## 需要提供以下信息
Please enter OMS weblogic admin server URL(t3s://oem01:7102):>
Please enter OMS weblogic admin server username(weblogic):>
Please enter OMS weblogic admin server password:>

Enter DB user name : sys
Enter 'sys' password :
```

**注意：** 此过程可能需要较长时间，请耐心等待。

#### 3.3.3 Agent 补丁更新

**升级 AgentPatcher：**

```bash
[oracle@oem01:/soft]$ source ~/.agent
[oracle@oem01:/soft]$ unzip -qo /soft/p33355570_135000_Generic.zip -d $ORACLE_HOME
[oracle@oem01:/soft]$ agentpatcher version
AgentPatcher Version: 13.9.5.10.0
OPlan Version: 12.2.0.1.16
OsysModel build: Tue Apr 28 18:16:31 PDT 2020

AgentPatcher succeeded.
```

**应用 Agent 补丁：**

```bash
# 停止 Agent 服务
[oracle@oem01:/soft]$ emctl stop agent
Oracle Enterprise Manager Cloud Control 13c Release 5
Copyright (c) 1996, 2021 Oracle Corporation.  All rights reserved.
Stopping agent ... stopped.

# 应用补丁
[oracle@oem01:/soft]$ unzip -q /soft/p37439438_135000_Generic.zip
[oracle@oem01:/soft]$ cd /soft/37439438
[oracle@emcc:/soft/37439438]$ agentpatcher apply
```

### 3.4 安装后验证

#### 验证 OMS 服务状态

```bash
[oracle@oem01:/home/oracle]$ source ~/.oms
[oracle@oem01:/home/oracle]$ emctl status oms
Oracle Enterprise Manager Cloud Control 13c Release 5
Copyright (c) 1996, 2021 Oracle Corporation.  All rights reserved.
WebTier is Up
Oracle Management Server is Up
JVMD Engine is Up
```

详细状态检查：

```bash
[oracle@oem01:/home/oracle]$ emctl status oms -details
Oracle Enterprise Manager Cloud Control 13c Release 5
Copyright (c) 1996, 2021 Oracle Corporation.  All rights reserved.
Console Server Host        : oem01
HTTP Console Port          : 7788
HTTPS Console Port         : 7803
HTTP Upload Port           : 4889
HTTPS Upload Port          : 4903
EM Instance Home           : /u01/app/oracle/middleware/gc_inst/em/EMGC_OMS1
OMS Log Directory Location : /u01/app/oracle/middleware/gc_inst/em/EMGC_OMS1/sysman/log
OMS is not configured with SLB or virtual hostname
Agent Upload is locked.
OMS Console is locked.
Active CA ID: 1
Console URL: https://oem01:7803/em
Upload URL: https://oem01:4903/empbs/upload

WLS Domain Information
Domain Name            : GCDomain
Admin Server Host      : oem01
Admin Server HTTPS Port: 7102
Admin Server is RUNNING

Oracle Management Server Information
Managed Server Instance Name: EMGC_OMS1
Oracle Management Server Instance Host: oem01
WebTier is Up
Oracle Management Server is Up
JVMD Engine is Up
```

#### 验证 Agent 服务状态

```bash
[oracle@oem01:/home/oracle]$ source ~/.agent
[oracle@oem01:/home/oracle]$ emctl status agent
Oracle Enterprise Manager Cloud Control 13c Release 5
Copyright (c) 1996, 2021 Oracle Corporation.  All rights reserved.
---------------------------------------------------------------
Agent Version          : 13.5.0.0.0
OMS Version            : 13.5.0.0.0
Protocol Version       : 12.1.0.1.0
Agent Home             : /u01/app/oracle/middleware/agent/agent_inst
Agent Log Directory    : /u01/app/oracle/middleware/agent/agent_inst/sysman/log
Agent Binaries         : /u01/app/oracle/middleware/agent/agent_13.5.0.0.0
Core JAR Location      : /u01/app/oracle/middleware/agent/agent_13.5.0.0.0/jlib
Agent Process ID       : 11756
Parent Process ID      : 11635
Agent URL              : https://oem01:3872/emd/main/
Local Agent URL in NAT : https://oem01:3872/emd/main/
Repository URL         : https://oem01:4903/empbs/upload
Started at             : 2025-07-01 17:10:55
Started by user        : oracle
Operating System       : Linux version 5.4.17-2102.201.3.el7uek.x86_64 (amd64)
Number of Targets      : 36
Last Reload            : (none)
Last successful upload                       : 2025-07-01 17:12:51
Last attempted upload                        : 2025-07-01 17:12:51
Total Megabytes of XML files uploaded so far : 0.03
Number of XML files pending upload           : 0
Size of XML files pending upload(MB)         : 0
Available disk space on upload filesystem    : 68.52%
Collection Status                            : Collections enabled
Heartbeat Status                             : Ok
Last attempted heartbeat to OMS              : 2025-07-01 17:12:13
Last successful heartbeat to OMS             : 2025-07-01 17:12:13
Next scheduled heartbeat to OMS              : 2025-07-01 17:13:13

---------------------------------------------------------------
Agent is Running and Ready
```

### 3.5 第二节点 OMS 部署

为实现真正的高可用性，需要在第二个节点部署额外的 OMS 实例。

#### 3.5.1 添加 Agent 到第二节点

登录 EMCC 控制台（`https://192.168.6.80:7803/em`）进行第二节点的 Agent 部署：

![EMCC 登录界面](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939976374408720384_395407.png)

![主页面](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939976646468055040_395407.png)

导航到 Agent 部署页面：

![Agent 部署导航](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939976812306640896_395407.png)

![Agent 添加选项](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939976949053534208_395407.png)

配置 Agent 部署参数：

![Agent 配置1](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939977368282607616_395407.png)

![Agent 配置2](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939977485408546816_395407.png)

![Agent 配置3](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939977594926018560_395407.png)

![Agent 配置4](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939977775201398784_395407.png)

等待部署完成：

![Agent 部署进度](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939978922138021888_395407.png)

![Agent 部署完成](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939978996666609664_395407.png)

#### 3.5.2 添加 OMS 节点

通过 EMCC 的过程库添加第二个 OMS 节点：

![过程库导航](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939980490275041280_395407.png)

搜索"添加"相关的过程：

![搜索添加过程](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939980935819177984_395407.png)

**重要提醒：** 确保每个 OMS 节点的端口配置保持一致，以简化后续维护工作。

![OMS 添加配置1](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939981338816294912_395407.png)

![OMS 添加配置2](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939981681767755776_395407.png)

创建共享目录：

```bash
[oracle@oem01:/OMS]$ mkdir /OMS/share
```

![共享目录配置](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939982494326075392_395407.png)

继续配置向导：

![配置步骤1](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939982618053849088_395407.png)

![配置步骤2](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939982693232553984_395407.png)

![配置步骤3](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939982762941886464_395407.png)

![配置步骤4](https://oss-emcsprod-public.modb.pro/image/editor/20250701-1939982853534658560_395407.png)

等待第二节点部署完成：

![第二节点部署进度1](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940215766457004032_395407.png)

![第二节点部署进度2](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940215857708281856_395407.png)

![第二节点部署完成](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940218351112957952_395407.png)

## 第四阶段：高可用性验证

完成集群部署后，需要验证高可用性功能是否正常工作。

### 4.1 多节点访问验证

验证两个节点都可以正常提供服务：

**节点 1 访问：** `https://192.168.6.80:7803/em`

![节点1访问测试1](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940245446073528320_395407.png)

![节点1访问测试2](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940243472296980480_395407.png)

![节点1功能验证](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940244207092903936_395407.png)

**节点 2 访问：** `https://192.168.6.81:7803/em`

![节点2访问测试1](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940245787481485312_395407.png)

![节点2访问测试2](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940243385806237696_395407.png)

![节点2功能验证](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940244289150267392_395407.png)

### 4.2 故障转移测试

模拟节点故障，验证系统的容错能力：

```bash
## 关闭节点1的 OMS 服务
source ~/.oms
emctl status oms
emctl stop oms -all
```

![故障模拟](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940247661555232768_395407.png)

验证节点 1 已无法访问：

![节点1故障确认](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940249907139457024_395407.png)

验证节点 2 继续正常服务：

![节点2正常服务确认](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940250012353572864_395407.png)

测试结果证明，当一个节点发生故障时，另一个节点可以继续提供完整的 EMCC 服务，实现了真正的高可用性。

## 总结

通过本文档的详细步骤，您已经成功部署了一套完整的 Oracle EMCC 13.5 高可用集群环境。该环境具备以下特性：

1. **高可用的数据存储**：基于 Oracle RAC 的 OMR 数据库集群；
2. **共享的文件系统**：ACFS 集群文件系统确保配置和软件的一致性；
3. **Active-Active OMS 架构**：多个 OMS 节点同时提供服务；
4. **自动故障转移**：单节点故障不影响整体服务可用性；

### 进一步优化建议

关于很多用户关心的统一访问入口问题（类似 Oracle RAC 的 SCAN IP 功能），Oracle 官方文档提供了通过服务器负载均衡器（SLB）实现的解决方案。

>参考文档：[Configuring Multiple Management Services Behind a Server Load Balancer (SLB)](https://docs.oracle.com/cd/E73210_01/EMADV/GUID-F45A2F2E-FE04-414E-A4F0-A33518157F82.htm#EMADV14386)

![SLB 配置参考](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940254843034152960_395407.png)

通过配置 SLB，用户可以使用单一 IP 地址访问 EMCC 集群，负载均衡器会自动将请求分发到可用的 OMS 节点，进一步提升用户体验。

### 参考文档

本部署指南基于以下官方文档和最佳实践：

- [How To Configure Enterprise Manager for High Availability (Doc ID 330072.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=330072.1)
- [EM 12c ,13c : Steps to Install and Configure Multiple OMS Behind a Server Load Balancer (SLB) (Doc ID 1369698.1)](https://support.oracle.com/epmos/faces/DocContentDisplay?id=1369698.1)
- [OEMCC 13.2 集群版本安装部署 - Alfred Zhao](https://cloud.tencent.com/developer/article/1431526)
