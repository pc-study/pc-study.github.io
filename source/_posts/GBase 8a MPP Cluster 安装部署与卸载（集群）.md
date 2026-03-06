---
title: GBase 8a MPP Cluster 安装部署与卸载（集群）
date: 2021-08-17 22:08:26
tags: [gbase]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/100469
---

@[TOC](目录)

# 🌲 前言

最近参加了 [GBase 数据库训练营的培训](https://edu.gbase.cn/detail/term_60dd81d6585b9_Di9d3X/25)，学习过程中，需要安装部署 GBase 8a MPP Cluster 集群环境，本次仅做记录以供参考。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-353b458b-0a20-4f21-88ed-a917bb503e52.png)

**官方安装教程：**[E01 GBase 8a MPP Cluster V95 安装和卸载](https://blog.csdn.net/wiserhowe/article/details/118181237)

# ☀️ 环境准备

|节点|操作系统|IP地址|内存|gbase版本|
|-|-|-|-|-|
|gbase01|redhat7.3|10.211.55.100|2G|RHEL7.3-x86_64-9.5.2.39|
|gbase02|redhat7.3|10.211.55.101|2G|RHEL7.3-x86_64-9.5.2.39|
|gbase03|redhat7.3|10.211.55.102|2G|RHEL7.3-x86_64-9.5.2.39|

**<font color='green'>📢 注意：由于官方提供的安装包版本为 `Redhat7.3` 版本，因此无法选择其余版本操作系统；安装系统时建议在“软件选择”中勾选“带GUI的服务器”中的“开发工具”选项。</font>**

## 安装介质下载

【百度云盘链接】：https://pan.baidu.com/s/1cI7tIdyCojMku2yjhrWDlw
【提取码】：ckrf

安装介质包括：
>☆ GBase 8a集群产品手册9.5.2.39 GBase 8a集群产品手册
>☆ GBaseDataStudio GBase 8a集群图形化工具-企业管理器GBaseDataStudio
>☆ RHEL7.3-x86_64-9.5.2.39-license GBase 8a集群产品安装包和linux客户端

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-d6661bfe-980e-4b4e-90af-06d131ce1a55.png)

## 操作系统安装

首先创建安装一台 gbase01 作为主节点，然后克隆另外两台（gbase02、gbase03）作为数据节点。

虚拟机软件选择可以为 VMWare、Vbox、Parallels等等。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-ee7792b5-4043-45cd-80f3-8419934b2e7f.png)

**<font color='green'>📢 注意：克隆后需要单独配置每台机器的主机名和网络IP地址。</font>**

## 安装前准备

**<font color='red'>📢 以下操作，三台主机均需执行！截图仅展示主节点。</font>**

### 1、关闭防火墙
```bash
systemctl stop firewalld.service
systemctl disable firewalld.service
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-d3efda4d-7cc2-4bf0-aa9a-cf085ad4af10.png)

### 2、禁用 Selinux

关闭 Selinux 之后需要重启主机才能生效，这里使用 `setenforce 0` 临时生效。
```bash
/usr/sbin/setenforce 0
sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-9846a6a7-714c-4dfc-9538-7bb4ea48a0b2.png)
### 3、创建 gbase 用户
```bash
useradd gbase
echo gbase | passwd --stdin gbase
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-d51e3ad8-60df-4553-a02d-0a7c154f0f1a.png)

### 4、创建目录并授权
```bash
mkdir -p /opt/gbase
chown gbase:gbase /opt/gbase
chown gbase:gbase /tmp
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-788b3ea8-8daa-4814-87aa-d2cba0370777.png)

### 5、重启主机
```
reboot
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-98f3835d-8a70-46b7-8cba-7c5447c56552.png)

非必须，建议重启三个节点后进行安装。


# ❤️ GBase 8a MPP Cluster 安装

确保以上环境均已配置完成，网络IP设置正确，就可以正式开始安装。

## 主节点上传安装介质

本文主节点为 `10.211.55.100`，因此上传安装介质到主节点 `/opt` 目录下。

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-76bbf866-7498-4f75-9d0f-cb06cf799c41.png)

上传介质可以通过 ftp 工具上传。

## 主节点解压安装包
```bash
cd /opt
tar xfj GBase8a_MPP_Cluster-License-9.5.2.39-redhat7.3-x86_64.tar.bz2
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-d3cf5c5f-2349-4049-b9f7-5a7d2f927eeb.png)

解压成功后，`/opt` 目录会多出一个 `gcinstall` 的目录。

## 分发配置文件

这里三台主机均需要配置环境变量，因此需要拷贝配置文件 `SetSysEnv.py` 到三台主机的 `/opt` 目录下。

```bash
cp gcinstall/SetSysEnv.py /opt
scp /opt/gcinstall/SetSysEnv.py 10.211.55.101:/opt
scp /opt/gcinstall/SetSysEnv.py 10.211.55.102:/opt
```

📢 注意：以上命令只需要在主节点执行分发即可。

## 配置环境变量

以下命令每个节点均需执行：
```bash
cd /opt
python SetSysEnv.py --dbaUser=gbase --installPrefix=/opt/gbase --cgroup
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-90f58dc3-6dc9-4a97-a271-66f8e2b59360.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-ddfee6f0-9792-49e0-83f8-6dfd51b7221e.png)

## 修改主节点安装配置文件
```
su - gbase
cd /opt/gcinstall/
vi demo.options
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-3a42dbb0-21ff-458b-8732-381e7754ddda.png)

修改内容如下：

```
installPrefix= /opt/gbase
coordinateHost = 10.211.55.100,10.211.55.101,10.211.55.102
coordinateHostNodeID = 100,101,102
dataHost = 10.211.55.100,10.211.55.101,10.211.55.102
#existCoordinateHost =
#existDataHost =
dbaUser = gbase
dbaGroup = gbase
dbaPwd = 'gbase'
rootPwd = 'gbase'
#rootPwdFile = rootPwd.json
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-514fe18f-6354-406d-9f49-0c821ad32e09.png)

**📢 注意：IP地址根据实际环境进行修改，`dbaPwd` 是 `gbase` 账户的密码，`rootPwd` 是 `root` 账户的密码。**

## 主节点执行安装命令

只需要在主节点执行安装命令即可。

```bash
cd /opt/gcinstall
./gcinstall.py --silent=demo.options
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-bace9733-e4ae-4a92-8b3c-7d6680ea6a1b.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-e36d72bd-fcb1-4d68-924f-1616c5a6ddba.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-d78370fc-041c-4cc5-929c-a7cf27723e96.png)

**截图只截取重要部分，其余内容过多不作展示。**

## 检查集群状态

gbase 用户下，新打开一个窗口或者手动生效环境变量：
```
source ~/.bash_profile
gcadmin
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-33d3b9de-bbae-4df2-83e9-3f97bcb9b470.png)

**<font color='green'>📢 可以看到此时集群状态和节点状态都是 `CLOSE`，原因是因为因为没有注册 `License` 授权，属于正常现象。</font>**

## 申请和导入授权

### ① 导出集群各节点的指纹信息

进入 `/opt/gcinstall` 目录下，执行导出指纹命令，IP和密码根据实际情况修改：
```bash
cd /opt/gcinstall
./gethostsid -n 10.211.55.100,10.211.55.101,10.211.55.102 -u root -p gbase -f /tmp/finger.txt
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-f575398d-8150-46e8-a7be-04f300b29a69.png)

### ② 邮件申请授权

- 发邮件给：license@gbase.cn；抄送给 shenliping@gbase.cn；
- 附件为指纹信息文件finger.txt；
- 邮件标题：GBase 8a MPP Cluster v95 license 申请
- 邮件正文：
```
客户名称: 学员公司名称
项目名称: 2021年X月认证培训
申请人: 填写自己姓名
申请原因: 培训学习
有效期: 3个月
操作系统名称及版本: Red Hat Enterprise Linux Server release 7.3 (Maipo)
8a集群版本: GBase8a_MPP_Cluster-License-9.5.2.39-redhat7.3-x86_64.tar.bz2
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-458cc310-5876-4e3c-8ae9-902c7f0bdaf3.png)

授权申请处理时间点为工作日 9:00、13:30和17:30。学员收到授权文件(20210817-08.lic)后上传到主节点的 `/tmp` 下。

### ③ 主节点导入授权

```bash
cd /opt/gcinstall
./License -n 10.211.55.100,10.211.55.101,10.211.55.102 -f /tmp/20210817-08.lic -u gbase -p gbase
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-38974b14-086b-4189-bf4a-8014f4ca90c0.png)

### ④ 检查授权情况

```bash
cd /opt/gcinstall
./chkLicense -n 10.211.55.100,10.211.55.101,10.211.55.102 -u gbase -p gbase
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-1cc4134a-f8bc-43c8-81e4-a8be100c9cec.png)

可以看到，三个节点均已授权成功。

**License 状态说明：**

>- `is_exist` 用于标识 license 文件是否存在： yes 代表存在，no 代表不存在；
>- `version` 用于标识 license 类型： trial为试用版， business 为商用版；
>- `expire_time` 用于标识试用版 license 的到期日期，只在检测试用版license 时才会显示；
>- `is_valid` 用于标识 license 是否有效： yes 代表 license 有效，no代表 license 失效；

**📢 注意：授权有效期为 3 个月，如果没超出 license 有效期，CPU、内存、网卡等机器配置没变更过，可以重复使用。虚拟机系统重装之后，就需要重新申请。**

## 所有节点启动集群服务

```bash
su - gbase
gcluster_services all start
gcadmin
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-877e25f8-c0fb-48aa-9ed1-fe825b397c75.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-0542a6bd-e2f8-4c44-9c09-726f6c2c5856.png)

确认集群状态均已 `OPEN` ，运行正常。

## 主节点设置分片信息

```bash
gcadmin distribution gcChangeInfo.xml p 2 d 1 pattern 1
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-0c91d27d-fadc-4877-9e3f-0fd3ad4b4581.png)

执行完之后，在 `/opt/gcinstall` 目录下会生成 `gcChangeInfo.xml` 文件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-9fdce911-0ca4-43e6-ba83-782fa24df4c2.png)

再次检查集群状态：
```bash
gcadmin
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-7c8c3e02-586b-4534-a1db-4fcb0d05a70d.png)

```bash
gcadmin showdistribution node
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-ae0af566-9efb-4057-a584-a38391e5dbf8.png)

## 数据库初始化

在管理节点上执行如下命令（**<font color='red'>数据库root密码默认为空</font>**）

```bash
gccli -u root -p
密码为空，直接回车
initnodedatamap;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-8768630f-6018-4807-8450-c9cfe890260c.png)

## 创建库表

```sql
create database lucifer;
show database;
user lucifer;
create table lucifer(id int ,name varchar(20));
show tables;
insert into lucifer values(1,'lucifer');
select * from lucifer;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-0f2e4ccf-4bea-49f9-8918-d2e14d6349f5.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-e2ec34ec-dbc4-45f8-95ea-d84e1f0ac1a1.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-fa662ca3-f745-4d0c-aa90-84a275fee47e.png)

# ❄️ 集群卸载

## 关闭所有集群服务

3台主机均需执行关闭命令：
```bash
gcluster_services all stop
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20210817-e5caa901-e152-47bf-922b-d5c924237d16.png)

## 主节点执行卸载命令
```bash
cd /opt/gcinstall
./unInstall.py --silent=demo.options
```

**这里我还要学习，就不演示卸载了😓！**

# 📚 写在最后

俺也是 gbase 新手😄，有什么写的不对的地方，欢迎👏🏻大家指教！谢谢~

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

技术交流可以 关注公众号：**Lucifer三思而后行**

![Lucifer三思而后行](https://img-blog.csdnimg.cn/20210702105616339.jpg)




