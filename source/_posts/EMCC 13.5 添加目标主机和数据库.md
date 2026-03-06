---
title: EMCC 13.5 添加目标主机和数据库
date: 2024-02-28 14:53:26
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1762675003355631616
---


## 前言
接前文：[EMCC 13.5 完整安装详细版](https://www.modb.pro/db/1760220352349294592) 安装完成后，进入 EMCC 管理界面：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-81634663-750b-412e-aabe-14bb61d31844.png)

## 安装客户端 AGENT
在部署好 EMCC 服务端之后，如果需要监控某一台主机或者数据库，就需要在对应的主机上部署上代理（AGENT）。

### 被监控端配置
首先，需要在被监控主机上增加 EMCC 服务端的主机解析以及创建 AGENT 安装的目录（前提是 EMCC 服务端和被监控段的网络保持畅通）：
```bash
## 被监控端新增解析
[root@db19c:/root]$ cat<<-\EOF>>/etc/hosts
192.168.6.66 emcc
EOF

## EMCC 服务端新增解析（建议）
[root@emcc:/root]$ cat<<-\EOF>>/etc/hosts
192.168.6.186 db19c
EOF

## 创建目录（只要有 oracle 权限就可以）
[oracle@db19c:/home/oracle]$ mkdir -p /u02/app/emagent
```

### 网页部署代理
在 EMCC 网页端选择 手动添加目标：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-f86c4dda-861d-4d8b-94ba-cebd1815c78a.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-bc690ca3-97fc-404a-8749-f55380f6cb74.png)

添加一个被监控端的主机（这里主机可以写 IP 地址）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-40b33c8d-5181-46d0-a45f-50117039f1ec.png)

由于没有提供完整域名，所以会有一个告警，可以选择忽略：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-18226a3d-0438-4f08-a645-36ec4dc621cb.png)

安装基目录就是上面在被监控端创建的目录，填入即可，下面的实例目录会自动生成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-005affd7-c09f-4fc6-b0ab-3e57cbde56ee.png)

添加一个 oracle 用户的身份验证：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-bc9ea12a-ab11-4570-a9f1-3c8d9b9a1e27.png)

添加一个 root 用户的身份验证：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-9ef5f736-9768-4d5a-907d-8477f9b5d51d.png)

点击下一步，然后开始部署代理：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-cde49be3-6024-4c73-9d54-b89d839c5d1c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-b754ed40-3722-4292-aa92-aa591dc1848c.png)

等待部署完成即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-215b5a40-56d2-446f-8f7e-a21aa8e22246.png)

## 添加数据库
选择指导模式添加数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-aaf47896-7a32-4a1f-aa2e-bc8876229080.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-9f9bc778-b795-4c23-9ac7-e752ea8d5f0b.png)

选择已添加主机的数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-545fa45e-9364-4495-811a-e87381abef3a.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-1b154c8f-258d-44da-86fe-1aeaa71d71d7.png)

配置数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-9888926e-53ff-40f5-a9fc-5d3124f12b7d.png)

这里配置之前，需要解锁 dbsnmp 用户并且设置密码，否则会报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-0c34ca97-3996-4944-9ac4-70477daa6e88.png)

```sql
SQL> set line2222 pages1000
SQL> col username for a10
SQL> col account_status for a20
SQL> select username,account_status from dba_users where username = 'DBSNMP';

USERNAME   ACCOUNT_STATUS
---------- --------------------
DBSNMP     LOCKED

SQL> alter user dbsnmp account unlock;

User altered.

SQL> select username,account_status from dba_users where username = 'DBSNMP';

USERNAME   ACCOUNT_STATUS
---------- --------------------
DBSNMP     OPEN

SQL> alter user dbsnmp identified by Welcome#1;

User altered.
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-31242fae-3773-4543-998b-6e98be6a1c32.png)

点击测试连接，测试成功后，点击保存即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-24910191-c5dc-447e-a711-752c26c9046e.png)

配置监听：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-d14cfb2c-51f8-4919-b297-4ba005b4f81d.png)

都配置好之后，勾选数据库以及监听，然后下一步：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-d26f3d86-d21f-46b9-ac9c-d0f7a0e2cd19.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-0d87fa61-b8b5-4825-bde0-c5c132c10231.png)

点击保存：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-f5affece-f4a9-4bc7-bcb3-7074227a6096.png)

## 查看添加的目标
主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-7685a6f0-85c0-4876-ba40-0d74fd74c38c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-a15d85f2-e132-4b46-a07d-0713217be65a.png)

数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-8176c0c7-eb07-4810-8921-e06e2f525357.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240228-191d77d3-342d-4a82-944d-79fdef43e864.png)
