---
title: EMCC 13.5 安装介质完整下载（包含 DB安装包+DB RU+EMCC安装包+OMS RU+AGENT RU）
date: 2024-02-21 16:22:55
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1760217473668435968
---

## 前言
下载以下安装包之前，请先登录 [Oracle 官网](https://www.oracle.com/) 以及 [MOS 网站](https://support.oracle.com/)，以下为所需下载的安装介质：
```bash
## EMCC 安装包
em13500_linux64.bin
em13500_linux64-2.zip
em13500_linux64-3.zip
em13500_linux64-4.zip
em13500_linux64-5.zip

## EMCC DB TEMPLATE
19_11_0_0_0_Database_Template_for_EM13_5_0_0_0_Linux_x64.zip

## Oracle 安装软件包
LINUX.X64_193000_db_home.zip

## Oracle 软件补丁包
p35943157_190000_Linux-x86-64.zip
p6880880_190000_Linux-x86-64.zip

## EMCC 补丁包
## OMS
p19999993_135000_Generic.zip
p35861059_135000_Generic.zip
## OMS BUG
p28186730_1394214_Generic.zip
p35430934_122140_Generic.zip
p34153238_122140_Generic.zip
p31657681_191000_Generic.zip
## AGENT
p33355570_135000_Generic.zip
p35861076_135000_Generic.zip
## WLS
p36155700_122140_Generic.zip
```

✨ 偷懒的请直接跳转墨天轮资源下载:[EMCC 13.5 安装介质完整下载（包含 DB安装包+DB RU+EMCC安装包+OMS RU+AGENT RU）](https://www.modb.pro/doc/125363)

## 1.EMCC 安装包下载
- [Oracle Enterprise Manager Cloud Control 13c Release 5 (13.5.0.0.0) for Linux x86-64](https://www.oracle.com/enterprise-manager/downloads/linux-x86-64-13c-rel5-downloads.html)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-6da2321b-e81d-473a-935c-74cc580310ea.png)

## EMCC DB 模板下载
- [19_11_0_0_0_Database_Template_for_EM13_5_0_0_0_Linux_x64.zip](https://www.oracle.com/enterprise-manager/downloads/db-templates-13c-release5-downloads.html)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-f23e450a-f286-4067-99e1-10f93e8a4a4a.png)

## 3.DB 安装包
- [Oracle Database 19c for Linux x86-64 - LINUX.X64_193000_db_home.zip](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html#19c)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-48fe1487-6bb9-4963-bed2-7031a641bb94.png)

## 4.DB RU 补丁包
- [Patch 35943157: DATABASE RELEASE UPDATE 19.22.0.0.0 - p35943157_190000_Linux-x86-64.zip](https://updates.oracle.com/Orion/Services/download/p35943157_190000_Linux-x86-64.zip?aru=25527362&patch_file=p35943157_190000_Linux-x86-64.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-8c4eed6a-7741-4a3d-a292-bf83c1f00b76.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-bdaabba3-68e3-4e7f-9faf-4e227586cff4.png)

- [OPatch 12.2.0.1.41 for DB 19.0.0.0.0 (Jan 2024) - p6880880_190000_Linux-x86-64.zip](https://updates.oracle.com/download/6880880.html)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-fd6b74b0-7205-4798-bc16-a7efd8945d7e.png)

## 5.OMS RU 补丁包
- [Patch 35861059: Oracle Enterprise Manager 13c Release 5 Update 19 ( 13.5.0.19 ) for Oracle Management Service - p35861059_135000_Generic.zip](https://updates.oracle.com/Orion/Services/download/p35861059_135000_Generic.zip?aru=25470098&patch_file=p35861059_135000_Generic.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-abc6862a-69fd-4ea8-aa37-d27a42cf0039.png)

- [Patch 19999993: OMSPatcher patch of version 13.9.5.17.0 for Enterprise Manager Cloud Control 13.5.0.0.0 - p19999993_135000_Generic.zip](https://updates.oracle.com/Orion/Services/download/p19999993_135000_Generic.zip?aru=25515848&patch_file=p19999993_135000_Generic.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-20bd01a2-0629-4cec-a7d4-2a266b64c38d.png)

## 6.AGENT RU 补丁包
- [Patch 35861076: Oracle Enterprise Manager 13c Release 5 Update 19 ( 13.5.0.19 ) for Oracle Management Agent - p35861076_135000_Generic.zip](https://updates.oracle.com/Orion/Services/download/p35861076_135000_Generic.zip?aru=25470100&patch_file=p35861076_135000_Generic.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-06c71ca5-7323-4078-aec2-b7e1162a4d04.png)

- [Patch 33355570: AgentPatcher release of version 13.9.5.6.0 for Enterprise Manager Cloud Control Agent 13.5.0.0.0 - p33355570_135000_Generic.zip](https://updates.oracle.com/Orion/Services/download/p33355570_135000_Generic.zip?aru=25515884&patch_file=p33355570_135000_Generic.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240221-950e7ef3-d5a2-42f0-8c7b-681f31fa79c2.png)

## 7.OMS BUG 补丁包
- [Patch 28186730: OPATCH 13.9.4.2.14 FOR EM 13.4, 13.5 AND FMW/WLS 12.2.1.3.0, 12.2.1.4.0 AND 14.1.1.0.0 - p28186730_1394214_Generic.zip]()

![](https://oss-emcsprod-public.modb.pro/image/editor/20240227-c5b218f4-8957-4f76-8dc2-980ed9042c4e.png)

- [Patch 35430934: MERGE REQUEST ON TOP OF 12.2.1.4.0 FOR BUGS 32720458 33607709 - p35430934_122140_Generic.zip](https://updates.oracle.com/Orion/Services/download/p35430934_122140_Generic.zip?aru=25249299&patch_file=p35430934_122140_Generic.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240227-7c471753-9d3d-4d36-8af8-3de8c8f8f9fa.png)

- [Patch 34153238: HTTPS PROXY CONFIGURATION IS NOT USED WHEN PROTOCOL IS CONFIGURED TO TCP - p34153238_122140_Generic.zip](https://updates.oracle.com/Orion/Services/download/p34153238_122140_Generic.zip?aru=25250883&patch_file=p34153238_122140_Generic.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240227-e1689507-7778-4877-baf5-c682c4cd3cc4.png)

- [Patch 31657681: THREADS CONTEND FOR LOCK IN LOADFILEBASEDKEYSTORE WHEN OPENING TLS/SSL ENABLED JDBC CONNECTIONS - p31657681_191000_Generic.zip](https://updates.oracle.com/Orion/Services/download/p31657681_191000_Generic.zip?aru=24379155&patch_file=p31657681_191000_Generic.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240227-996a579c-731c-4ca1-8712-9fd4bdea1fc7.png)

## 8.WLS 补丁包
- [Patch 36155700: WLS PATCH SET UPDATE 12.2.1.4.240104 - p36155700_122140_Generic.zip](https://updates.oracle.com/Orion/Services/download/p36155700_122140_Generic.zip?aru=25515608&patch_file=p36155700_122140_Generic.zip)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240227-c5383118-9c2b-4b4e-b27a-16cf6f5a68de.png)






