---
title: Vertica 安装配置 MC（管理控制台）
date: 2021-12-12 11:12:21
tags: [墨力计划,vertica]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/196754
---

# 前言
Vertica 提供了专门的管理控制台（MC），本文分享下如何安装配置以及使用 `MC`。

更多关于 Vertica 可以参考下方文章：

- [《初识 Vertica ，看完白皮书，我都发现了啥》](https://www.modb.pro/db/194763)
- [《Vertica 架构：Eon 与企业模式》](https://www.modb.pro/db/196644)
- [《初体验：Centos7.9 单节点安装 Vertica 11 社区版（超详细教程）》](https://www.modb.pro/db/195927)
- [《Vertica 玩转示例数据库：VMart》](https://www.modb.pro/db/196694)

**🏆 作者写的 [《Vertica 技术文章合集》](https://www.modb.pro/topic/194826)**，欢迎阅读 👏🏻！

# 一、介绍
`MC` ( vertica-console) 软件包含 Oracle Java 7 JRE，并要求在 SuSe Linux 平台上安装 unixODBC 驱动程序管理器。unixODBC 提供了所需的库 `libodbc` 和 `lidodbcinst`。

可以在安装 Vertica 之前或之后安装 MC；**建议在安装 MC 之前安装 Vertica 并创建数据库。**

MC 可以单独安装在一台服务器，也可以安装在集群中任何一个节点上。

# 二、安装 MC
我这里选择在之前安装的单节点 Vertica 上安装 MC。

**1、上传安装介质**

上传 MC 安装介质：`vertica-console-11.0.1-2.x86_64.RHEL6.rpm`：
```bash
scp vertica-console-11.0.1-2.x86_64.RHEL6.rpm root@192.168.56.100:/soft
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-1380287e-c7c5-4903-8cc5-654d5c31d434.png)

**2、rpm 安装 MC**
```bash
rpm -ivh vertica-console-11.0.1-2.x86_64.RHEL6.rpm
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-c65123c8-de83-409c-beda-42825d2bbbd8.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-d72b3b1c-b34f-4511-99cd-6e4147749d39.png)

安装成功之后使用客户端 `Google` 或者其他浏览器打开管理控制台：
```http
https://192.168.56.100:5450/webui/login
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-be2ba68c-01fd-4a9d-ba86-2ee57890db61.png)

**📢 注意：** IP 地址请更换为 Vertica MC 安装机器的 IP。

# 三、配置 MC
由于我们是第一次安装并打开 MC，因此需要配置。具体步骤跟着配置向导一步步走就行。

（PS：英文不好的同学，可以右键翻译成中文，阅读效果更加！）

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-2e1b3256-bb18-4626-8030-bda43dd432d0.png)

密码请根据建议进行设置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-9df596b0-6964-4dc2-86f8-c6f7dff67d06.png)

Unix 组名默认为 `verticadba`，请根据实际情况填写：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-3cbd8f23-3c1e-42c5-a5c0-829fc4c08422.png)

这个安全问题配置，大家自行设置吧，我随便设置一下，但是要记住哦：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-b1d9ad87-9d95-46f8-bd9f-2dd06bc70903.png)

文件位置我这里保持默认，大家请根据实际情况填写：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-316af863-f23e-4ed8-9106-4cbfa5921a6a.png)

默认使用管理控制台进行身份验证：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-1dd5903b-00ac-433a-8fc5-bf9622a94da8.png)

**📢 注意：** 如果需要使用 LDAP 进行验证，请参考官方文档进行设置！

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-c26ae81b-a248-48c6-af61-18a82fea4519.png)

点击完成后不久，在浏览器中看到一个等待连接状态；但是，在几秒钟内可能只会看到一个空白页面，是正常现象。

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-a8cb2b28-02f9-40ef-8a61-86e4bf56705b.png)

短暂等待后，跳出 MC 登录界面：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-bcb946dc-02ed-4ca3-b30b-da9228477020.png)

用户名：`dbadmin`，登录：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-66e10aa5-245a-4df5-901b-c7f84658e9bc.png)

登录成功之后：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-f4067c8c-4c43-4fae-b1e7-24ff51589654.png)

**<font color='orage'>至此，MC 已经安装配置成功！</font>**

# 四、管理数据库
我们使用 MC 导入现有的数据库 VMart。

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-e134a1c2-ffc8-494c-b318-33a0d6bf4b76.png)

填写数据库主机 IP：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-d71a7363-0647-414b-af8e-32c530f2029c.png)

输入 `API Key`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-b9c2777d-1051-45e7-b378-9032e3dfe3fa.png)

**📢 注意：** API Key 可以在 `/opt/vertica/config/apikeys.dat` 文件中查看：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-4ad3e666-965a-4c78-bd61-466c28b572f0.png)

输入用户名密码，我这里密码为空：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-e3c7aba1-7a62-4d21-a201-ea6d1ddc9877.png)

导入成功：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-d7e7c03c-09e0-4dcf-b818-70bb01d42d82.png)

管理控制台查看 VMart 数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-0483b841-4a98-42f9-852a-6fd24b8d5dd5.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-16db13e8-77b0-4b4f-9a2a-a15339a7aa07.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-4bc0f6cc-bd26-44f3-ad3d-0858918809c2.png)

可以用来查询数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-c3a5be67-0455-41a1-bc1e-290bd59b0545.png)

查看执行计划：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-ff6cc69e-f399-491e-95cc-9cf4ca996db4.png)

分析执行计划和profile：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-68035d95-74d5-4ffd-92ef-cb514818f971.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-541c8ab0-dcfb-44d8-8e41-b3b5c4b1660e.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-13aa632c-9c46-4a42-b2f1-cd051ed8b69c.png)

进行数据库方面的一些设置：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-9999ec4c-23b4-4b96-a1b9-1fd336b7dcb0.png)

功能很强大，不做过多的演示了，更多功能可以参考管理员指南，大家可以自行摸索。

![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-7de478a4-b54f-424f-b11d-090f885ac855.png)

# 五、卸载 MC
卸载命令会关闭管理控制台并删除 MC 安装脚本安装的大部分文件。

登录 MC 安装主机，停止 MC：
```bash
systemctl stop vertica-consoled
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-55c0742f-73d1-4a32-a492-c967964a5743.png)

查看已安装的 MC 版本：
```bash
rpm -qa | grep vertica
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-7dfddcb5-1c56-40d9-a09a-d377231fe6b0.png)

卸载 MC 软件并删除 MC 目录文件：
```bash
rpm -e vertica-console
rm -rf /opt/vconsole
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-8fd669e9-4689-4201-8fea-22b954131d42.png)

**<font color='orage'>MC 已成功卸载！</font>**

# 写在最后
Vertica MC 可以方便的管理和监控集群以及数据库，图形化的操作更加直观人性化，点赞👍🏻！更多关于 MC 控制台的使用放到后面再讲~
