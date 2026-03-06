---
title: GBase 8c 分布式集群安装部署手册
date: 2025-01-15 11:48:41
tags: [墨力计划,gbase 8c]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1879046588874637312
---

>大家好，这里是公众号 **DBA学习之路**，致力于分享数据库领域相关知识。

@[TOC](目录)

# 前言
2025 年第一场 GBase 培训：**[培训预告 | 2025元月 GBase 8c 认证培训班开始报名啦~](https://mp.weixin.qq.com/s/Hhk-cLC_-9p4eiBzoa5r1g)** ，老规矩，写一篇安装部署教程，一起免费学习考证。

<img src="https://oss-emcsprod-public.modb.pro/image/editor/20250114-1879048552333193216_395407.png" width="800" />

# GBase 8c 介绍
GBase 8c 是南大通用自主研发的一款多模多态的第三代智能分布式数据库，通过智能优化，智能运维，智能安全实现 DB 智能化，使 GBase8c 具备高性能、高可用、弹性伸缩、高安全性等智能特性。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250114-1879046661377372160_395407.png)

**产品架构：** GBase 8c 支持主备式与分布式两种部署，支持行存、列存、内存三种存储引擎，满足用户各种业务需求。

**多存储模式：**
- GBase 8c 支持多个存储引擎以满足不同场景的业务需求：
- **行存储引擎**：主要面向OLTP场景设计，例如订货、发货、银行交易系统；
- **列存储引擎**：主要面向OLAP场景设计，例如数据统计报表分析系统；
- **内存引擎**：主要面向极致性能场景设计，例如银行风控场景。

**多部署形态：** GBase 8c 通过多租户方式实现多种部署形态，可提供单机部署、主备部署及分布式部署三种部署形态，并通过统一运维管理平台来进行管理，分别面向企业核心交易和未来海量事务型场景，打造差异化竞争力。
- **单机形态**：GBase 8c 支持单机部署，可以直接在一台服务器上部署数据库，这种部署的优势是最低成本，且部署简洁。
- **主备形态**：GBase 8c 支持一主多备的部署方式，主备之间可以采用同步或异步备份方式。这种部署方式部署简洁、交付高效，适用于较低数据量、追求极致单机性能，且要求数据备份的场景。
- **分布式形态**：分布式模式，支持分布式全组件冗余的高可用，支持计算存储分离的部署。可以根据业务需求对计算和存储能力分别进行水平扩展，适用于大数据量高并发且追求数据高安全性的场景。

本文主要演示分布式形态的部署方案。

# 环境准备
## 主机环境
这里我已经提前好了三台 Linux 主机：

|角色|节点|操作系统|IP地址|内存|gbase版本|
|-|-|-|-|-|-|
|gha,dcs,gtm,cn|gbase8c01|麒麟V10|192.168.6.135|8G|GBase8cV5_3.0.0_分布式_x86|
|dn,dcs|gbase8c02|麒麟V10|192.168.6.136|8G|GBase8cV5_3.0.0_分布式_x86|
|dn,dcs|gbase8c03|麒麟V10|192.168.6.137|8G|GBase8cV5_3.0.0_分布式_x86|

**推荐服务器配置**：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250114-1879052972471107584_395407.png)

在推荐的部署环境下，建议部署 GBase 8c 数据库分布式集群时，至少部署 1 台 GTM 服务器、3 台数据库服务器部署 Coordinator 和 Datanode 节点。

## 安装介质下载
官网可以直接下载：[GBase8cV5_3.0.0_分布式_x86.zip](https://www.gbase.cn/download/gbase-8c?category=INSTALL_PACKAGE)。

根据操作系统的版本（同一套集群使用相同版本操作系统）获取相应的 GBase 8c 软件安装包：

![](https://oss-emcsprod-public.modb.pro/image/editor/20250114-1879050645219590144_395407.png)

# 安装前准备
环境配置需要在 root 用户下执行。

## 配置 /etc/hosts
```bash
cat<<-EOF>>/etc/hosts
192.168.6.135 gbase8c01
192.168.6.136 gbase8c02
192.168.6.137 gbase8c03
EOF
```

## 关闭防火墙
所有节点均需关闭防火墙：
```bash
systemctl stop firewalld.service
systemctl disable firewalld.service
systemctl status firewalld.service
```
确保防火墙正常关闭。

## 禁用 Selinux
所有节点建议关闭 SELNUX，防止造成一些不必要的问题：
```bash
## 这里使用 `setenforce 0` 临时生效
/usr/sbin/setenforce 0
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
sestatus
```
将 SELINUX 参数设置为 disabled，即 SELINUX=disabled 保存退出后，需要重新启动才能生效。

## 依赖检查
检查 bison、flex、patch、bzip2 依赖是否已安装：
```bash
[root@gbase8c01 ~]# rpm -q bison flex patch bzip2
bison-3.6.4-3.ky10.x86_64
flex-2.6.4-5.ky10.x86_64
patch-2.7.6-13.ky10.x86_64
bzip2-1.0.8-6.ky10.x86_64
```

## 创建 DBA 用户
主机创建用户如果有密码复杂性要求，不想设置密码太复杂的话，可以取消密码复杂度：
```bash
## 以节点一为例
sed -i 's/^password\+[[:space:]]\+requisite[[:space:]]\+pam_pwquality.so/#&/g' /etc/pam.d/system-auth
sed -i 's/use_authtok$//' /etc/pam.d/system-auth
```
集群安装用户为 **gbase**，所有节点均需创建：
```bash
useradd gbase
echo "gbase:gbase" | chpasswd
```

## 配置 sudo 免密
```bash
## 对 root 用户赋权并打开 /etc/sudoers 文件
chmod +w /etc/sudoers
## 在文件的最后添加如下内容
cat<<-EOF>>/etc/sudoers
gbase ALL=(ALL)NOPASSWD:ALL
EOF

chmod -w /etc/sudoers
```

## 创建安装目录
在部署机上创建 GBase 8c 数据库的安装目录。

配置文件中 `pkg_path` 参数值需与安装目录保持一致。建议设置为 `/home/gbase/gbase_package`，即 yml 文件中 pkg_path 参数默认值：
```bash
## 所有节点均需执行，以节点一为例
[gbase@gbase8c01 ~]$ mkdir -p /home/gbase/gbase_package
[gbase@gbase8c01 ~]$ chown -R gbase:gbase /home/gbase/gbase_package
```

## 系统参数配置
配置系统内核参数，避免信号量不足无法初始化：
```bash
## 以节点一为例
sysctl -w kernel.sem="40960 2048000 40960 20480"
echo "kernel.sem=40960 2048000 40960 20480" >>/etc/sysctl.conf

## 生效配置
sysctl -p
```

## 配置互信
在所有节点创建 gbase 用户免密登录。

创建免密配置文件：
```bash
## 所有节点均需执行，以节点一为例
[root@gbase8c01 soft]# su - gbase
[gbase@gbase8c01 ~]$ mkdir ~/.ssh
[gbase@gbase8c01 ~]$ chmod 700 ~/.ssh
```
gbase 用户生成密钥文件：
```bash
## 在密钥生成过程中，执行互动操作，默认回车键即可
## 只在节点一执行
ssh-keygen -t rsa
```
将公钥文件上传至同集群所有节点（包括本节点），即可实现免密登录（此操作需输入密码）：
```bash
## 只在节点一执行，中途需要输入 gbase 用户密码
ssh-copy-id gbase@192.168.6.135
ssh-copy-id gbase@192.168.6.136
ssh-copy-id gbase@192.168.6.137
```
验证互信：
```bash
[gbase@gbase8c01 ~]$ ssh 192.168.6.135 date

Authorized users only. All activities may be monitored and reported.
2025年 01月 14日 星期二 14:58:56 CST
[gbase@gbase8c01 ~]$ ssh 192.168.6.136 date

Authorized users only. All activities may be monitored and reported.
2025年 01月 14日 星期二 14:58:59 CST
[gbase@gbase8c01 ~]$ ssh 192.168.6.137 date

Authorized users only. All activities may be monitored and reported.
2025年 01月 14日 星期二 14:59:02 CST
```
配置互信成功即可。

## 上传安装介质
在 gbase 用户下，下载安装包，拷贝或使用 ssh 工具传至部署机安装目录。
```bash
[gbase@gbase8c01 gbase_package]$ ll
总用量 276860
-rwxr-xr-x 1 gbase gbase 283503415  1月 14 14:20 GBase8cV5_3.0.0_分布式_x86.zip
```
对解压得到的 GBase8cV5_S3.0.0B114_centos7.8_x86_64.tar.gz 安装包，继续进行解压：
```bash
[gbase@gbase8c01 gbase_package]$ unzip -q GBase8cV5_3.0.0_分布式_x86.zip 
[gbase@gbase8c01 gbase_package]$ ls
GBase8cV5_3.0.0_分布式_x86.zip  GBase8cV5_S3.0.0B114
[gbase@gbase8c01 gbase_package]$ cd GBase8cV5_S3.0.0B114/
[gbase@gbase8c01 GBase8cV5_S3.0.0B114]$ ls
Document  Server
[gbase@gbase8c01 GBase8cV5_S3.0.0B114]$ cd Server/
[gbase@gbase8c01 Server]$ ls
GBase8cV5_S3.0.0B114_centos7.8_x86_64.md5.txt  GBase8cV5_S3.0.0B114_centos7.8_x86_64.tar.gz
[gbase@gbase8c01 Server]$ tar -xf GBase8cV5_S3.0.0B114_centos7.8_x86_64.tar.gz 
[gbase@gbase8c01 Server]$ ll *gz
-rw-r--r-- 1 gbase gbase 266255210 11月 23  2023 GBase8cV5_S3.0.0B114_centos7.8_x86_64.tar.gz
-rw-r--r-- 1 gbase gbase 103175364 11月  7  2023 GBase8cV5_S3.0.0B114_CentOS_x86_64_om.tar.gz
-rw-r--r-- 1 gbase gbase   1036193 11月  7  2023 GBase8cV5_S3.0.0B114_CentOS_x86_64_pgpool.tar.gz
-rw------- 1 gbase gbase    383797 11月  7  2023 upgrade_sql.tar.gz
## 需要移动到 /home/gbase/gbase_package/ 目录下
[gbase@gbase8c01 Server]$ mv *.gz /home/gbase/gbase_package/
```
再次对 GBase8cV5_S3.0.0B114_CentOS_x86_64_om.tar.gz 进行解压：
```bash
[gbase@gbase8c01 Server]$ tar -xf GBase8cV5_S3.0.0B114_CentOS_x86_64_om.tar.gz -C /home/gbase/gbase_package
[gbase@gbase8c01 Server]$ cd /home/gbase/gbase_package
[gbase@gbase8c01 gbase_package]$ ll
总用量 276888
drwxr-xr-x  6 gbase gbase       180 11月  7  2023 dependency
-rwxr-xr-x  1 gbase gbase 283503415  1月 14 14:20 GBase8cV5_3.0.0_分布式_x86.zip
drwxr-xr-x  4 gbase gbase        36 11月 30  2023 GBase8cV5_S3.0.0B114
-rw-r--r--  1 gbase gbase      2590 11月  7  2023 gbase.yml
drwxr-xr-x 11 gbase gbase      4096 11月  7  2023 gha
-rw-r--r--  1 gbase gbase       188 11月  7  2023 gha_ctl.ini
drwxr-xr-x  2 gbase gbase        96 11月  7  2023 lib
-rw-r--r--  1 gbase gbase      1242 11月  7  2023 package_info.json
drwxr-xr-x  4 gbase gbase        28  3月 16  2021 python3.8
drwxr-xr-x 10 gbase gbase      4096 11月  7  2023 script
drwxr-xr-x  2 gbase gbase       330 11月  7  2023 simpleInstall
drwxr-xr-x  3 gbase gbase        24 11月  7  2023 tools
-rw-r--r--  1 gbase gbase       132 11月  7  2023 ubuntu_version.json
drwx------  6 gbase gbase        87  7月  2  2022 venv
-rw-r--r--  1 gbase gbase        42 11月  7  2023 version.cfg
```
解压完成后即可进行安装。

# GBase 8c 安装
## 配置 yml 文件
安装前需要先编辑集群配置文件。模板配置文件默认在安装目录中，安装时可移动至其他 owner 为 gbase 用户路径下。用户需要根据实际情况，修改配置文件名和其中节点参数信息。

安装目录为 /home/gbase/gbase_package/，将模板文件复制到 owner 为 gbase 用户的 /home/gbase 目录下，并编辑 gbase.yml 配置文件：
```bash
[gbase@gbase8c01 gbase_package]$ cp /home/gbase/gbase_package/gbase.yml /home/gbase/
```
修改配置文件中节点参数信息：
```bash
[gbase@gbase8c01 ~]$ sed -i 's/10.0.1.16/192.168.6.135/g' /home/gbase/gbase.yml
[gbase@gbase8c01 ~]$ sed -i 's/100.0.1.16/192.168.6.135/g' /home/gbase/gbase.yml
[gbase@gbase8c01 ~]$ sed -i 's/10.0.1.17/192.168.6.136/g' /home/gbase/gbase.yml
[gbase@gbase8c01 ~]$ sed -i 's/100.0.1.17/192.168.6.136/g' /home/gbase/gbase.yml
[gbase@gbase8c01 ~]$ sed -i 's/10.0.1.18/192.168.6.137/g' /home/gbase/gbase.yml
[gbase@gbase8c01 ~]$ sed -i 's/100.0.1.18/192.168.6.137/g' /home/gbase/gbase.yml
```
其中，必选参数说明如下：
- **host 参数**：指定此节点由数据面节点（gtm、cn、dn）访问连接的 IP 地址。
- **agent_host 参数**：指定此节点由控制面节点（gha_server、dcs）访问连接的 IP 地址。可与 host 参数相同，表示数据面和控制面均通过同一 IP 地址访问连接此节点。
- **role 参数**：集群节点角色类型。可选值为 primary 或 standby。在 gtm、coordinator、datanode
节点参数中，为必选字段。
- **port 参数**：集群节点连接端口号。
- **agent_port 参数**：高可用端口号。
- **syncMode 参数**：仅 CN 为只读（standby）时，需设置此项。可选值为sync、async。其中 sync（同步）表示只读 CN 在同步备机进行读操作；async 表示只读CN 在异步备机进行读操作。
- **work_dir 参数**：集群节点数据存放目录。
- **cluster_type 参数**：指定集群的类型。部署分布式集群时，指定参数为multiple-nodes；部署主备式集群时，指定参数为 single-inst。
- **pkg_path 参数**：指定数据库安装包的存放路径。与 5.2 准备安装包中安装目录相同。 prefix 参数：指定运行目录路径。安装时后台自动扫描该目录是否已存在，若不存在，则自动创建；若已存在，请注意需确保 owner 为 gbase 用户。
- **version 参数**：指定安装包版本。格式为 V5_S3.0.0BXX，XX 为具体版本号，可根据安装包名称相应修改。如该参数配置错误，将找不到安装包而导致安装失败。 user 参数：指定操作系统用户 gbase。一般无需修改。
- **port 参数**：指定 ssh 端口。默认为 22，一般无需修改。
- **third_ssh 参数**：默认值为 false。当使用第三方 ssh 工具时，将 third_ssh 参数设置为true。

## 安装数据库
完成两层安装包解压后，会在安装目录下生成 script 子目录。执行 gha_ctl 命令安装 GBase 8c 数据库。语法格式为：
```bash
gha_ctl install <-c cluster> <-p confpath>
```
其中参数说明：
- **-c 参数**：指定数据库名称，为可选字段。缺省默认值 gbase。
- **-p 参数**：指定配置文件保存路径，为可选字段。缺省默认值 /home/gbase。

部署命令如下：
```bash
[gbase@gbase8c01 ~]$ cd gbase_package/script/
[gbase@gbase8c01 script]$ ./gha_ctl install -p /home/gbase/ -c gbase
{
    "ret":0,
    "msg":"Success"
}
```
如上返回部署成功信息。

## 检查集群
```bash
[root@gbase8c01 ~]# su - gbase
上一次登录： 二 1月 14 16:39:38 CST 2025 pts/0 上 
[gbase@gbase8c01 ~]$ gha_ctl monitor -l http://192.168.6.135:2379 -H
+----+-------------+---------------+-------+---------+--------+
| No |     name    |      host     |  port |  state  | leader |
+----+-------------+---------------+-------+---------+--------+
| 0  | gha_server1 | 192.168.6.135 | 20001 | running |  True  |
+----+-------------+---------------+-------+---------+--------+
+----+------+---------------+------+---------------------------+---------+---------+
| No | name |      host     | port |          work_dir         |  state  |   role  |
+----+------+---------------+------+---------------------------+---------+---------+
| 0  | gtm1 | 192.168.6.135 | 6666 | /home/gbase/data/gtm/gtm1 | running | primary |
| 1  | gtm2 | 192.168.6.136 | 6666 | /home/gbase/data/gtm/gtm2 | running | standby |
+----+------+---------------+------+---------------------------+---------+---------+
+----+------+---------------+------+----------------------------+---------+---------+
| No | name |      host     | port |          work_dir          |  state  |   role  |
+----+------+---------------+------+----------------------------+---------+---------+
| 0  | cn1  | 192.168.6.136 | 5432 | /home/gbase/data/coord/cn1 | running | primary |
| 1  | cn2  | 192.168.6.137 | 5432 | /home/gbase/data/coord/cn2 | running | primary |
+----+------+---------------+------+----------------------------+---------+---------+
+----+-------+-------+---------------+-------+----------------------------+---------+---------+
| No | group |  name |      host     |  port |          work_dir          |  state  |   role  |
+----+-------+-------+---------------+-------+----------------------------+---------+---------+
| 0  |  dn1  | dn1_1 | 192.168.6.136 | 15432 | /home/gbase/data/dn1/dn1_1 | running | primary |
| 1  |  dn1  | dn1_2 | 192.168.6.137 | 15433 | /home/gbase/data/dn1/dn1_2 | running | standby |
| 2  |  dn1  | dn1_3 | 192.168.6.135 | 15433 | /home/gbase/data/dn1/dn1_3 | running | standby |
| 3  |  dn2  | dn2_1 | 192.168.6.137 | 20010 | /home/gbase/data/dn2/dn2_1 | running | primary |
| 4  |  dn2  | dn2_2 | 192.168.6.135 | 20010 | /home/gbase/data/dn2/dn2_2 | running | standby |
| 5  |  dn2  | dn2_3 | 192.168.6.136 | 20010 | /home/gbase/data/dn2/dn2_3 | running | standby |
+----+-------+-------+---------------+-------+----------------------------+---------+---------+
+----+---------------------------+--------+---------+----------+
| No |            url            |  name  |  state  | isLeader |
+----+---------------------------+--------+---------+----------+
| 0  | http://192.168.6.136:2379 | node_1 | healthy |  False   |
| 1  | http://192.168.6.137:2379 | node_2 | healthy |  False   |
| 2  | http://192.168.6.135:2379 | node_0 | healthy |   True   |
+----+---------------------------+--------+---------+----------+
```
也可以使用以下方式：
```bash 
[gbase@gbase8c01 ~]$ gha_ctl monitor -l http://192.168.6.135:2379
{
    "cluster": "gbase",
    "version": "V5_S3.0.0B114",
    "server": [
        {
            "name": "gha_server1",
            "host": "192.168.6.135",
            "port": "20001",
            "state": "running",
            "isLeader": true
        }
    ],
    "gtm": [
        {
            "name": "gtm1",
            "host": "192.168.6.135",
            "port": "6666",
            "workDir": "/home/gbase/data/gtm/gtm1",
            "agentPort": "8001",
            "state": "running",
            "role": "primary",
            "agentHost": "192.168.6.135"
        },
        {
            "name": "gtm2",
            "host": "192.168.6.136",
            "port": "6666",
            "workDir": "/home/gbase/data/gtm/gtm2",
            "agentPort": "8002",
            "state": "running",
            "role": "standby",
            "agentHost": "192.168.6.136"
        }
    ],
    "coordinator": [
        {
            "name": "cn1",
            "host": "192.168.6.136",
            "port": "5432",
            "workDir": "/home/gbase/data/coord/cn1",
            "agentPort": "8003",
            "state": "running",
            "role": "primary",
            "agentHost": "192.168.6.136",
            "central": true
        },
        {
            "name": "cn2",
            "host": "192.168.6.137",
            "port": "5432",
            "workDir": "/home/gbase/data/coord/cn2",
            "agentPort": "8004",
            "state": "running",
            "role": "primary",
            "agentHost": "192.168.6.137"
        }
    ],
    "datanode": {
        "dn1": [
            {
                "name": "dn1_1",
                "host": "192.168.6.136",
                "port": "15432",
                "workDir": "/home/gbase/data/dn1/dn1_1",
                "agentPort": "8005",
                "state": "running",
                "role": "primary",
                "agentHost": "192.168.6.136"
            },
            {
                "name": "dn1_2",
                "host": "192.168.6.137",
                "port": "15433",
                "workDir": "/home/gbase/data/dn1/dn1_2",
                "agentPort": "8006",
                "state": "running",
                "role": "standby",
                "agentHost": "192.168.6.137"
            },
            {
                "name": "dn1_3",
                "host": "192.168.6.135",
                "port": "15433",
                "workDir": "/home/gbase/data/dn1/dn1_3",
                "agentPort": "8006",
                "state": "running",
                "role": "standby",
                "agentHost": "192.168.6.135"
            }
        ],
        "dn2": [
            {
                "name": "dn2_1",
                "host": "192.168.6.137",
                "port": "20010",
                "workDir": "/home/gbase/data/dn2/dn2_1",
                "agentPort": "8007",
                "state": "running",
                "role": "primary",
                "agentHost": "192.168.6.137"
            },
            {
                "name": "dn2_2",
                "host": "192.168.6.135",
                "port": "20010",
                "workDir": "/home/gbase/data/dn2/dn2_2",
                "agentPort": "8008",
                "state": "running",
                "role": "standby",
                "agentHost": "192.168.6.135"
            },
            {
                "name": "dn2_3",
                "host": "192.168.6.136",
                "port": "20010",
                "workDir": "/home/gbase/data/dn2/dn2_3",
                "agentPort": "8009",
                "state": "running",
                "role": "standby",
                "agentHost": "192.168.6.136"
            }
        ]
    },
    "dcs": {
        "clusterState": "healthy",
        "members": [
            {
                "url": "http://192.168.6.136:2379",
                "id": "14a718a6a4833a05",
                "name": "node_1",
                "isLeader": false,
                "state": "healthy"
            },
            {
                "url": "http://192.168.6.137:2379",
                "id": "8eed282d78c15ddb",
                "name": "node_2",
                "isLeader": false,
                "state": "healthy"
            },
            {
                "url": "http://192.168.6.135:2379",
                "id": "a43c96850bc6ef25",
                "name": "node_0",
                "isLeader": true,
                "state": "healthy"
            }
        ]
    }
}
```
如上说明集群安装正常，数据服务启动中。

# 启停数据库
## 停止数据库
```bash
[gbase@gbase8c01 ~]$ gha_ctl stop all -l http://192.168.6.135:2379
{
    "ret":0,
    "msg":"Success"
}
```

## 启动数据库
```bash
[gbase@gbase8c01 ~]$ gha_ctl start all -l http://192.168.6.135:2379
{
    "ret":0,
    "msg":"Success"
}
```

# 连接测试
在数据库节点执行：
```bash
+----+------+---------------+------+----------------------------+---------+---------+
| No | name |      host     | port |          work_dir          |  state  |   role  |
+----+------+---------------+------+----------------------------+---------+---------+
| 0  | cn1  | 192.168.6.136 | 5432 | /home/gbase/data/coord/cn1 | running | primary |
| 1  | cn2  | 192.168.6.137 | 5432 | /home/gbase/data/coord/cn2 | running | primary |
+----+------+---------------+------+----------------------------+---------+---------+
```
连接数据库：
```bash
## 出现 postgres=# 操作符说明客户端工具 gsql 成功连接 8c 数据库
[gbase@gbase8c02 ~]$ gsql -d postgres -p 5432
gsql ((multiple_nodes GBase8cV5 3.0.0B114 build 9b50bc36) compiled at 2023-11-07 19:39:08 commit 0 last mr 1763 )
Non-SSL connection (SSL connection is recommended when requiring high-security)
Type "help" for help.

postgres=# create database lucifer;
CREATE DATABASE
postgres=# \c lucifer
Non-SSL connection (SSL connection is recommended when requiring high-security)
You are now connected to database "lucifer" as user "gbase".
lucifer=# create table test(ID int, Name varchar(10));
CREATE TABLE
lucifer=# insert into test values(1, 'lucifer'),(2,'echo');
INSERT 0 2
lucifer=# select * from test;
 id |  name   
----+---------
  1 | lucifer
  2 | echo
(2 rows)
```

# 卸载数据库
集群卸载具体操作命令为：
```bash
gha_ctl uninstall -l http://192.168.6.135:2379
```
在集群卸载后环境变量自动清除，因此再次执行 gha_ctl 命令需要进入script 目录。卸载 DCS 工具的具体操作命令为：
```bash
cd /home/gbase/script
./gha_ctl destroy dcs -l http://192.168.6.135:2379
```


# 写在最后
如果有遗漏或者不足的地方，欢迎评论区补充或者投稿，感谢阅读！

# 往期精彩文章
>[达梦数据库安装最详细教程](https://mp.weixin.qq.com/s/gjQBBvjIFsHC1rtEjn30nw)    
[一招教你学会达梦数据库的免密登录](https://mp.weixin.qq.com/s/hapMuAF9xg8fbdlKJpsN6A)  
[一文讲透达梦数据库的大小写敏感](https://mp.weixin.qq.com/s/pZIcZiICY1pUiTAWQRtUKg)  
[效率翻倍！达梦数据库 disql 使用技巧全攻略](https://mp.weixin.qq.com/s/MWQeqdvIfo9D2d8_vi7BTg)
[达梦数据库参数配置与一键优化指南](https://mp.weixin.qq.com/s/5EvUN21PZ3Oc0tDnygr7rw) 
[达梦 AWR 报告快速上手指南](https://mp.weixin.qq.com/s/4vl88Oj9Nal-goeoijAqWg)
[金仓数据库 KingbaseES V9 单机安装指南](https://mp.weixin.qq.com/s/Yd3gkFki_OJsCfCFKf1Ttw)    
[KingbaseES KSQL 免密登录的几种方式](https://mp.weixin.qq.com/s/u7HK4soHUght3p0tzHPanA)    
[KingbaseES 控制文件冗余与恢复秘籍](https://mp.weixin.qq.com/s/vdsFR2aPNp8Gys1G4qX5cQ)    
[南大通用 GBASE 8s V8.8 数据库最全安装指南](https://mp.weixin.qq.com/s/MwmvwR7sUQ6VuoftHM19mA)    
[GBase 8s GDCA 认证课后练习题大全（题库）](https://mp.weixin.qq.com/s/XL2jYOPEf9x_bXW0VFE6kg)   
[GBase 8s 数据库巡检报告及一键巡检脚本](https://mp.weixin.qq.com/s/oIEWt5pzK0KfhUq3GUNGCA)   
[YashanDB 一键生成 AWR 报告](https://mp.weixin.qq.com/s/i-L_tAF-XIIY_d4YCn0MIw)    
[YashanDB 数据库安装部署](https://mp.weixin.qq.com/s/sgB3WQ6A8mGl3QaIJj5v1A)  

---

<center>「喜欢这篇文章，您的关注和赞赏是给作者最好的鼓励」</center>
