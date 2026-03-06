---
title: ⭐️ 产品体验官：Tapdata Cloud && Oracle 数据库实时同步（详细版）
date: 2021-08-07 17:49:28
tags: [oracle,tapdata数据同步]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/97494
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)
# 🌲 前言
**最近新接触了一个数据同步的产品：`Tapdata Cloud` 。**

>Tapdata Cloud 是由 Tapdata 提供的集数据同步、数据融合（即将上线）、数据服务（即将上线）为一体的实时数据融合服务，能够在跨云、跨地域、多类型数据源的场景下，提供毫秒级的实时数据同步服务和数据融合服务。

**官网地址：<font color='blue'>https://cloud.tapdata.net/</font>**

本文主要演示通过 Tapdata Cloud 来进行 Oracle 数据同步。ヾ(◍°∇°◍)ﾉﾞ

# ☀️ 环境准备
Tapdata 部署支持 `Windows64`，`Linux64`，`docker` 三种环境；本文使用 `Linux64` 环境进行同步测试。

## 💻 Linux 环境部署
**使用 Vagrant 快速部署环境，想玩的朋友可以参考：[⚡️万字图文⚡️ 带你 Vagrant 从入门到超神！❤️](https://www.modb.pro/db/88457)**

### 1、添加 Vagrant box
使用 Vagrant 快速部署一套 Linux 环境，主机版本 `Centos7.9`。

![在这里插入图片描述](https://img-blog.csdnimg.cn/e3ef372dd3e747c2bcd7deb1443d42ab.png)
### 2、初始化启动 Linux 主机
通过新添加的 box 初始化 Vagrantfile：

![在这里插入图片描述](https://img-blog.csdnimg.cn/1873a306e3c9499e99daab81b4df0e5c.png)

Vagrant 启动主机：

![在这里插入图片描述](https://img-blog.csdnimg.cn/8e7c269ffa8f4f4f83ac3261dea34253.png)
### 3、Vagrant 连接主机
通过 `vagrant ssh` 连接已成功部署的 Centos 环境：

![在这里插入图片描述](https://img-blog.csdnimg.cn/21bd10f96b384b8db20de05f527838f8.png)

修改 root 用户密码：

![在这里插入图片描述](https://img-blog.csdnimg.cn/f4252db92d9c4e3d8a6d561dc373531f.png)
修改玩 root 密码后，通过 `su -` 切换到 root 用户。

## 🌩 Tapdata Agent 本地部署
**<font color='green'>❤️ 为什么要部署 Tapdata Agent 到本地环境？❤️ </font>**

>Tapdata Agent是数据同步、数据异构、数据开发场景中的关键程序。以上场景对数据的流转有着极高的实时性要求，因此，通过下载Tapdata Agent并将其部署在你的本地环境，基于低延迟的本地网络，Tapdata Agent能够发挥最大性能以确保数据流转的实时性。

### 1、安装 Java 环境
Tapdata Agent 的运行依赖本地 Java 环境，因此，在部署前你需要检查本地否已经安装java环境，例如在命令行中使用下方命令:
```bash
java -version
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/f5500b6194104c4fa7d16508832fdff8.png)

如图 `java -version` 返回异常，则说明java环境可能未安装，可参考下方的命令为本地安装java环境（本提示中的openjdk版本仅用于示例）：
```bash
yum -y install java-1.8.0-openjdk
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/33d83f80a1b44be68b9dd9fa0519a826.png)

在本地java环境安装完毕后，即可开始下载Tapdata Agent。

### 2、下载 Tapdata Agent 并部署
安装前请确认您的部署环境中已安装Java1.8版本并正确配置环境变量。

**Tapdata Agent 下载方式：**

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210808-45775f7b-268b-475c-98a7-109571145ef1.png)

点击 `创建Agent`，然后 选择 `部署` ，进入下载页面，下载属于自己的 Agent。

下载 Tapdata Agent ，官方非常建议在一个独立、干净的文件夹内部署 `Tapdata Agent` ：
```bash
#通过wget下载Tapdata Agent至本地环境
mkdir /tapdata
cd /tapdata
wget "https://resource.tapdata.net/package/feagent/dfs-1.0.4-prod/tapdata"
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/1b4e670815ed4ed3827eb88c815f9a7e.png)

下载、部署 Tapdata Agent 无需 root 权限，只需要对部署目录具备读写权限即可，因此创建 tapdata 用户：
```bash
groupadd tapdata
useradd -g tapdata tapdata
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/28dc7a10b5b44b6eaeb32afc42e31c70.png)

授权用户 `tabpdata` 访问目录 `/tapdata` 权限：
```bash
chown -R tapdata:tapdata /tapdata
chmod +x /tapdata/tapdata
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/ab1453a9469a458bacd5f44ae5ec4ec7.png)

切换到 tapdata 用户，开始安装部署 tapdata ：
```bash
su - tapdata
cd /tapdata
./tapdata start backend --downloadUrl https://resource.tapdata.net/package/feagent/dfs-1.0.4-prod/ --token a/HZzXh5MDbwPGd8hCzZYYF0XXgDZ287oY34Sx3QAq5Z7zikkMRcI62kZHXq8RRJj6VrJcSY6ehw4iM8d8LW1YDkAXDfFv6XW/comFuRjivUKI0bU2CJbyb9YX2hukWTYG7rnIlkqV6c1QG//tczPtDt4Bvjy5eqwShMLprhyrzjDysD0Zqfag0tfN0rKB8YbGn87/61rWjizqFuByrG+V2RQCKmccHqWLwjAKLeMEYFUW6imRIHTrEHFQ9u5qDEDB4xza6Nz+ZeDgwNTHYQAChlL1rg+2B6g8C55dTKdQvOTiumURSbnY3Z8IURjYOw4INb5NmhUFvlcceX6OMguQVMrKfiV2vYzpSAcFKB+3KGJVj71tKGRxaSuZI5AINPxECZg+kgE2vUTMhFwZ9I2oPLDGntSWSnYp2MVqUnTNq446ikmUIuEsTTPhsiTcHO2/8oniGzy4gMGvSmofZI2w==
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/7fdd6aada8c6464d9805a63396444e17.png)

待上方命令执行完毕后，出现如图所示日志则代表Agent启动成功。

**<font color='red'>注意：这里的 AGENT 不可照搬，需要自己登录控制台新建 AGENT ，然后点击 `部署` 申请属于自己的 AGENT 才行。</font>**

### 3、Tapdata Agent 管理命令
在本地对 Tapdata Agent 进行管理，建议设置 /tapdata 环境变量：
```bash
cat <<EOF>~/.bash_profile
export TAPDATA_HOME=/tapdata
export PATH=$TAPDATA_HOME:$PATH
EOF

source ~/.bash_profile
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/67d2883c7ad04c3f9188a869ea38581d.png)
```bash
#关闭 Tapdata Agent
tapdata stop

#启动 Tapdata Agent
tapdata start 

#查看 Tapdata Agent 状态
tapdata status
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/5ca27e9196054ecc87757aca6210163c.png)

Tapdata Agent本地目录结构及功能简介：

![在这里插入图片描述](https://img-blog.csdnimg.cn/3f9acc4a50c3494bb4af736a34f5db13.png)

**<font color='green'>至此，Tapdata 环境准备已经完成。🎉</font>**
## 🔆 Oracle 环境部署
同样使用 `Vagrant` 安装两套 Linux 主机环境，使用 `Oracle 一键安装脚本` 安装数据库：
### 1、部署 oracle11g 主机
创建安装目录并上传安装介质：
```bash
mkdir oracle11g
mkdir oracle12c
mkdir software
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2521c67d0c3d409e90371dca5ef91093.png)

**<font color='red'>⭐️ 安装介质获取方式：</font>[Oracle安装包](https://www.modb.pro/db/81506)，[Oracle一键安装脚本](https://github.com/pc-study/InstallOracleshell)。**
### 3、配置 Shell 脚本
分别进入 `oracle11g` 和 `oracle12c` 目录下，创建 `scripts` 目录：
```bash
mkdir scripts
cat <<EOF>ora_preinstall.sh
#change root password
echo oracle | passwd --stdin root
#change sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
systemctl reload sshd.service
#mkdir software dir
mkdir /soft
#cp software to softdir
cp /vagrant/* /soft
#chmod shell script
chmod +x /soft/OracleShellInstall.sh
#install oracle database
cd /soft
./OracleShellInstall.sh -i 192.168.1.140 -installmode single -dbv 11g -iso N
EOF
```
**需要注意 `-dbv` 和 `-i` 参数，需要根据实际情况修改，12C 需要修改为对应 12c。**
### 3、配置 Vagrantfile 脚本
**Oracle 11G：**
```bash
cd oracle11g
cat <<EOF>Vagrantfile
Vagrant.configure("2") do |config|
  config.vm.box = "centos79"
  config.vm.provision :shell, path: "/Volumes/DBA/vagrant/oracle11g/scripts/ora_preinstall.sh"
  config.vm.synced_folder "/Volumes/DBA/vagrant/software", "/vagrant"
  config.vm.network :forwarded_port, guest: 1521, host: 1521
  config.vm.network :forwarded_port, guest: 22, host: 22
  config.vm.network "public_network", ip: "192.168.1.140"
  config.vm.provider "virtualbox" do |vb|
  vb.name = "orcl11g"
  vb.memory = 2048
  vb.cpus = 2
  end
end
EOF
```
**Oracle 12C：**
```bash
cd oracle12c
cat <<EOF>Vagrantfile
Vagrant.configure("2") do |config|
  config.vm.box = "centos79"
  config.vm.provision :shell, path: "/Volumes/DBA/vagrant/oracle12c/scripts/ora_preinstall.sh"
  config.vm.synced_folder "/Volumes/DBA/vagrant/software", "/vagrant"
  config.vm.network :forwarded_port, guest: 1521, host: 1522
  config.vm.network :forwarded_port, guest: 22, host: 23
  config.vm.network "public_network", ip: "192.168.1.150"
  config.vm.provider "virtualbox" do |vb|
  vb.name = "orcl12c"
  vb.memory = 2048
  vb.cpus = 2
  end
end
EOF
```
### 4、启动部署 Oracle 数据库
```bash
cd oracle11g
vagrant up --provider=virtualbox
cd oracle12c
vagrant up --provider=virtualbox
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/24e5ccb09f8f4ae3904b55d368fa1e02.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/6fbeff6f541c46118aaed1cb5e64b70c.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/55f9b4fab3ac48569b7dec1fd0c2f5b4.png)
### 5、Oracle 11G+12C 创建测试数据
```sql
create user tapdata identified by tapdata;
grant dba to tapdata;
conn tapdata/tapdata;
create table tapdata (id number,name varchar(100));
insert into tapdata values (1,'lucifer');
insert into tapdata values (2,'lucifer1');
insert into tapdata values (3,'lucifer2');
commit;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/a7b8e8150a4d4a198f00a8029521f839.png)

**❤️ 想了解的朋友可参考：❤️**
>- [Vagrant 一键搞定 Oracle 数据库安装](https://www.modb.pro/db/86763)
>- [我写了4000多行Shell脚本，终于实现了一键安装Oracle RAC！！！](https://www.modb.pro/db/69072)

# 💛 数据同步 Oracle 11GR2 --> 12C
## ⚡️ 数据同步介绍
**工作原理：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/ff9ae102a59740478c2ceecb0cf65df9.png)
>数据同步功能是 Tapdata 数据中台的重要功能，同时也是 Tapdata 的核心优势。如上图所示，在两个数据存储节点中，Tapdata Agent 作为处理的桥梁，在用户简单设置后即可全自动的将数据从一个节点中读取（源端），并写入至另一个节点（目标端）。在整个过程中，Tapdata Agent 仅作为数据的处理层确保处理的流程符合用户的预期，Tapdata Agent 不会对用户数据做任何形式的上传、保存。

**接入、同步、异构：**
>在数据同步功能中，Tapdata 中台支持多种数据存储的接入，其不仅支持同类型数据存储（如 MySQL 到MySQL，Oracle 到Oracle）之间的数据同步，同时也支持不同类型数据存储（如 Oracle 到 MySQL，MySQL 到 MongoDB）之间以异构方式进行数据同步。

**任务类型：**
>基于Tapdata Agent的可配置性，其支持全量同步、全量及增量两种任务类型。用户可根据对应的数据场景选择对应的同步模式来满足需求。如全量同步适合一次性的数据迁移、异构场景，而全量及增量同步则适合实时的数据迁移、异构场景。

![在这里插入图片描述](https://img-blog.csdnimg.cn/48a7969282fa472d9a59f68ac2d3a7cc.png)
## ❤️ ORACLE 配置 Tapdata（源端+目标端）
确保在 Tapdata 中成功添加和使用Oracle数据库，注意：Oracle 实时同步基于Oracle Redo Log，因此需要提前执行某些配置。

### 1、开启归档日志
以具有 DBA 权限的用户身份登录数据库
```bash
sqlplus / as sysdba
```
查看数据库的 logging mode
```sql
select log_mode from v$database;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/787f76eb210c44f6a7749b27c5beec61.png)

如果返回的结果是 NOARCHIVELOG , 继续按照以下步骤操作:

关闭数据库: 
```sql
shutdown immediate;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/5878c28646f2430988112e319f75511c.png)

启动并挂载数据库:
```sql
startup mount;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/e8fc7e49846f4672b7de3d78e17d58a1.png)

开启归档模式并打开数据库:
```sql
alter database archivelog;
alter database open;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/982c6b0bd36f415d9e979fba2f508c9b.png)
### 2、开启 Supplemental Logging
**11G：**
```sql
alter database add supplemental log data;
alter system switch logfile;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
SELECT supplemental_log_data_min, supplemental_log_data_pk, supplemental_log_data_all FROM v$database;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/45bb8f3d0221493ab22fdc5ff2fb8c36.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/a06eea54472a43db8ed69f885bb13186.png)

**12C：**
```sql
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS;
ALTER SYSTEM SWITCH LOGFILE;
SELECT supplemental_log_data_min, supplemental_log_data_pk, supplemental_log_data_all FROM v$database;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/eead8d18186d4e94b8436edbfbbfc456.png)
### 3、创建用户账号
创建用户帐户并分配权限：
```sql
--前面已经创建，这里不再创建用户
--CREATE USER tapdata IDENTIFIED BY tapdata;
GRANT create session, alter session, execute_catalog_role, select any dictionary, select any transaction, select any table, create any table, create any index, unlimited tablespace to tapdata;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/f8f07b72be2a43ea92d45152809de167.png)

至此，已配置完 Oracle 11G 源端数据库。

## ☀️ Tapdata Cloud 连接 Oracle 11G+12C
首先需要打开 Tapdata Cloud 控制台。
### 1、创建连接
![在这里插入图片描述](https://img-blog.csdnimg.cn/955d72c37b814e6086e36cfdaa3870ef.png)
### 2、选择 Oracle
![在这里插入图片描述](https://img-blog.csdnimg.cn/bb0d423c4d5b411fbe3cf3917983714e.png)
### 3、填写关键信息
根据提示填写信息，具体可参考：[Oracle 创建连接](https://www.yuque.com/tapdata/cloud/chan-pin-shou-ce_lian-jie-guan-li_lian-jie-pei-zhi_oracle)

![在这里插入图片描述](https://img-blog.csdnimg.cn/b8f7d12697164d7a994e467ac2e571c7.png)
**<font color='red'>注意：这里的 `Schema` 值需要大写！</font>**
### 4、测试连接
测试连接是否成功，具体可参考：[Oracel 的连接测试与常见问题](https://www.yuque.com/tapdata/cloud/chan-pin-shou-ce_lian-jie-guan-li_lian-jie-ce-shi_oracel-de-lian-jie-ce-shi-yu-chang-jian-wen-ti)
![在这里插入图片描述](https://img-blog.csdnimg.cn/5f5c9e20da4946d28ed162c3d549c0af.png)
**以同样的方式添加 Oracle 12C ，添加成功后显示如下：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/51db3a8eb6824699851943ae4675f2eb.png)
## 🌀 创建同步任务
创建好连接之后，需要创建任务来配置进行数据同步。
### 1、创建任务
配置源端和目标端连接，选择上一步中新建的连接：

![在这里插入图片描述](https://img-blog.csdnimg.cn/d69c0f86e2bf4cfeab311ddeacb13f2d.png)
### 2、配置任务
设置任务，本次选择 `全量+增量` 类型，`全量写入模式`：

![在这里插入图片描述](https://img-blog.csdnimg.cn/25d730b9572d425c946ede1e9ee5da99.png)
### 3、选择同步表
这里选择需要同步的表，添加到目标端：

![在这里插入图片描述](https://img-blog.csdnimg.cn/d552596847a849059b7e2d44fd02307c.png)

同时还支持 `改名` 和 `字段映射`：

![在这里插入图片描述](https://img-blog.csdnimg.cn/53f3dd5b64bb49adb98785f8265752b2.png)

点击完成按钮，即可。如果点击没有反应，可以尝试退回上一步，再回来点击完成。

### 4、启动任务
点击完成后，任务状态为 `待启动`，可以通过启动任务来开始：

![在这里插入图片描述](https://img-blog.csdnimg.cn/0982f85d5e334f008b2134caa6e5ce70.png)

先去目标端 Oracle 12C 查询表 Lucifer 是否存在：
```sql
select * from lucifer;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/0ce0ee21fd7845d38b3af9de52ff0480.png)

确认没有表 Lucifer，启动任务：

![在这里插入图片描述](https://img-blog.csdnimg.cn/54494afe2c9b4af29c666fdec3db17a8.png)
### 5、运行监控
点击 `运行监控` 可以看到同步情：

![在这里插入图片描述](https://img-blog.csdnimg.cn/34f827f5f36c4ee7a01b44eb2f613bd1.png)
### 6、报错处理
可以看到，这里报错了，看了一下日志记录：

![在这里插入图片描述](https://img-blog.csdnimg.cn/9d555dc7a3814546bd58e473ab61086f.png)

由于我之前创建表时，没有创建主键，**<font color='red'>咨询官方之后，确认必须需要表带主键才可以</font>**，因此，新增表主键：
```sql
alter table lucifer add constraint tb_lucifer_pk primary key (id);
alter table tapdata add constraint tb_tapdata_pk primary key (id);
```
新增表主键之后，需要重新加载数据源，即`连接管理`那里连接测试即可。

![在这里插入图片描述](https://img-blog.csdnimg.cn/fd9d07e54d2b4927988a602feff7ca39.png)

回到`运行监控`页面，`重置`之后重新同步：

![在这里插入图片描述](https://img-blog.csdnimg.cn/aad4c80643164b3b9ab765d5e2819f23.png)

`重置` 即清除进度，回到最初，然后点击启动即可。

![在这里插入图片描述](https://img-blog.csdnimg.cn/fbc77e43c82848c087660782b00a3360.png)
### 7、同步测试
连接 Oracle 12C 目标端，查询 Lucifer 表的数据：

![在这里插入图片描述](https://img-blog.csdnimg.cn/823ec3e3b95246ff9fefad019e3f9551.png)
发现数据已经同步成功。

测试源端 Oracle 11G 写入数据之后，目标端是否同步：

**源端：**

```sql
insert into tapdata values (17,'haha');
insert into lucifer values (26,'hah1a');
delete from tapdata where id=1;
delete from lucifer where id=2;
commit;
```
**目标端：**
```sql
select * from lucifer;
select * from tapdata;
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/36a36b3a744b4fd4a69074a45707fcab.png)

查看监控页面，可以发现源端的操作记录均已同步：

![在这里插入图片描述](https://img-blog.csdnimg.cn/7166b5eaeb814da5b265b54893649ad0.png)

**<font color='green'>❤️ 至此，Oracle 不同版本间的实时数据同步测试已经完成。</font>**

# 🌊 写在最后
**首先，给 Tapdata 的文档点赞一波，写的真的很详细易懂！**

本文从无到有地展示了所有环境的安装部署，数据同步的完整步骤以及一些需要注意的事项，可以说是尽善尽美了。之后，应该还会写异构数据库之间的同步教程。

总体体验来说，Tapdata Cloud 在安装部署和使用方面，大大降低了技术难度，相较于其他一些数据同步产品，在入门体验上更好。关于实时同步的效率，由于没有实测生产，不做过多的评价。

感兴趣的朋友可以多多测试，希望 Tapdata 能够越做越好！同时还可以参加 Tapdata 的新活动：[推荐 | 异构数据库同步云平台 Tapdata Cloud 开启有奖公测](https://mp.weixin.qq.com/s/QSRTlakt7ioEGArnuwOUkA)，❤️ 奖品确实很丰厚！

**⭐️ 可直接扫码参加：**

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210807-67017a27-7077-4ffe-bde7-c6056854c485.png)



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