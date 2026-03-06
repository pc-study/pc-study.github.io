---
title: Vertica 玩转示例数据库：VMart
date: 2021-12-11 23:12:03
tags: [墨力计划,vertica]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/196694
---

# 前言
上一篇演示了如何安装一台单节点 Vertica 数据库，并初始化创建了一个 `Lucifer` 数据库，但是苦于没有数据进行测试学习！通过阅读官方文档了解到 Vertica 有一个示例数据库 `VMart` 可以用来初始化一个功能齐全的多模式的数据库用来学习查询！

当然了，前提是你已经安装好了 Vertica 数据库，安装教程可以参考下方文章：

- [《初识 Vertica ，看完白皮书，我都发现了啥》](https://www.modb.pro/db/194763)
- [《Vertica 架构：Eon 与企业模式》](https://www.modb.pro/db/196644)
- [《初体验：Centos7.9 单节点安装 Vertica 11 社区版（超详细教程）》](https://www.modb.pro/db/195927)

**🏆 作者写的 [《Vertica 技术文章合集》](https://www.modb.pro/topic/194826)**，欢迎阅读 👏🏻！

# 一、介绍
Vertica 附带了一个名为 `VMart` 示例数据库的示例多模式数据库，大型超市 (VMart) 可能会使用该数据库来访问有关其产品、客户、员工以及在线和实体商店的信息。使用此示例，可以创建、运行、优化和测试多模式数据库。

**VMart 数据库包含以下 `schema`：**
- public（在任何新创建的 Vertica 数据库中自动创建）
- store
- online_Sales

**VMart 数据库位置和脚本：**

如果使用 `RPM` 软件包安装 Vertica，则 VMart 架构安装在 `/opt/vertica/examples/VMart_Schema` 目录中。此文件夹包含以下脚本文件，可用于快速入门。将脚本用作您自己的应用程序的模板。
|脚本/文件名|描述|
|-|-|
|vmart_count_data.sql|对所有示例数据库表的行进行计数的 SQL 脚本，您可以使用它来验证负载。|
|vmart_define_schema.sql|定义每个表的逻辑架构和参照完整性约束的 SQL 脚本。|
|vmart_gen.cpp|数据生成器源代码 (C++)。|
|vmart_gen |数据生成器可执行文件。|
|vmart_load_data.sql|使用 COPY 将生成的示例数据加载到相应表的 SQL 脚本。|
|vmart_queries.sql|包含串联示例查询的 SQL 脚本，用作数据库设计器的训练集。|
|vmart_query_##.sql|包含单个查询的 SQL 脚本；例如，vmart_query_01 通过 vmart_query_09.sql|
|vmart_schema_drop.sql|删除所有示例数据库表的 SQL 脚本。|

**Vertica 提供了两个选项来安装示例数据库：**
- `使用脚本快速安装`：此选项可让您创建示例数据库并立即开始使用它。使用此方法绕过架构和表创建过程并立即开始查询。
- `高级安装`：高级选项是使用管理工具界面的高级但简单的示例数据库安装。使用此方法可以更好地理解数据库创建过程并练习创建模式、创建表和加载数据。

两种安装方法都会创建一个名为 `VMart` 的数据库。

# 二、脚本安装方式
执行快速安装所需的脚本为 `/opt/vertica/sbin` 目录下的 `install_example`。此脚本在默认端口 `5433` 上创建数据库、生成数据、创建模式，并加载数据。该文件夹还包含一个 `delete_example` 脚本，用于停止和删除数据库。

**📢 注意：** 强烈建议您一次仅启动一个示例数据库，以避免出现不可预测的结果，**确保磁盘空间足够**！

## 1、脚本创建 VMart
下面演示如何快速安装：

**1、切换至 `dbadmin` 用户**
```bash
su - dbadmin
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-568d5165-88d2-4cde-b0de-25b6caa01312.png)

**2、进入 `example` 目录**
```bash
cd /opt/vertica/examples
pwd
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-0d1648f3-8c2b-4172-b322-4826c2d390a7.png)

**3、执行快速安装**
```bash
/opt/vertica/sbin/install_example VMart
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-76743410-def2-4d80-b6b1-52ca08d5827d.png)

VMart 数据库创建成功，测试连接！

## 2、连接 VMart 数据库
使用 `admintools` 工具连接数据库：
```bash
admintools
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-20f48893-cd9c-4302-bcc7-dd0b89e845ff.png)

**密码为空，直接回车即可！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-e9b09a7a-3ba4-451e-af3a-addcbce29ced.png)

简单查询一下数据库，模式以及用户。

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-f4802cb6-d92e-4329-bae2-4b3bea6d5780.png)

## 3、删除 VMart 数据库
为了测试一下删除脚本，同时为了下面测试高级安装，这边删除一下 VMart 数据库。
```bash
cd /opt/vertica/examples
/opt/vertica/sbin/delete_example VMart
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-1e91bb1f-951a-42d7-891b-a4fb04a05140.png)

示例数据库日志文件 `ExampleInstall.txt` 和 `ExampleDelete.txt` 被写入`/opt/vertica/examples/log`。

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20211211-a8e9e006-d67b-497d-9af5-7c583d13e478.png)

**<font color='orage'>至此，关于脚本快速安装的演示就结束了！</font>**

# 三、高级安装
开始高级安装之前，确保当前主机的所有数据库均已停止运行。

## 1、配置示例环境
**1、切换到 dbadmin 用户：**
```bash
su - dbadmin
```
**2、进入 `/opt/vertica/examples/VMart_Schema` 目录：**
```bash
cd /opt/vertica/examples/VMart_Schema
```
**📢 注意：** 下面整个配置过程都不要离开这个目录，否则会失败。

**3、运行生成器**
```bash
./vmart_gen
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-d08be042-9131-4aae-b523-9ead53c1c07f.png)

**📢 注意：** 让程序使用默认参数运行，后面可以在 `README` 文件中查看这些参数。

**4、报错解决**

以下步骤仅针对上述运行报错的情况，如果 vmart_gen 不能正常执行，执行下方命令：
```bash
g++ vmart_gen.cpp -o vmart_gen
chmod +x vmart_gen
./vmart_gen
```
**📢 注意：** vmart_gen 运行正常情况下无需执行！

## 2、创建示例数据库
下面我们使用 `admintools` 管理工具创建数据库：
```bash
admintools
```
选择配置菜单 `Configuration Menu` 进入：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-be6b3bea-761e-44bd-a6f7-94587f3aca88.png)

创建数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-07eb339a-690c-4fe6-8ed5-5a6931a76277.png)

默认选择企业模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-e15da401-480a-4419-af49-d52014bfab69.png)

填写数据库名称 `VMart`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-4292c25b-bf28-46f7-8d78-bd78ac6979ea.png)

填写密码，这里我们不设置密码：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-7cab4c30-a988-4a87-9ddb-bb4dfe104e22.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-ffc2b191-2a5c-423b-a9b1-8660ccb20403.png)

单节点，默认即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-547c3081-42fc-4f33-8b63-e5b5d8e54c94.png)

数据文件位置，默认即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-fafa9ba3-67e6-46c8-8ddc-343ad82710a7.png)

K-safe 默认：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-5ce2f85e-ac7f-4776-9203-a12022c4b91e.png)

确认信息，开始创建：

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-6def5401-c3d0-4d24-ae35-4ae7147a79ce.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-f8a0c2af-baaf-4b06-8fe7-7965aa0b6ef1.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-ec696393-89f0-4fa9-ab68-b9ff5a0f4dcc.png)

## 3、测试连接 WMart 数据库
使用 `admintools` 工具连接数据库：
```bash
admintools
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-20f48893-cd9c-4302-bcc7-dd0b89e845ff.png)

**密码为空，直接回车即可！**

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-e9b09a7a-3ba4-451e-af3a-addcbce29ced.png)

简单查询一下数据库，模式以及用户。

![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-3049dacc-3821-47d7-9c80-eacb667faeba.png)

**📢 注意：** 目前是新创建的 `VMart` 数据库，还未创建 schema 和加载数据。
## 4、创建 schema 和表
VMart 数据库安装了带有 SQL 命令的示例脚本，这些脚本旨在表示可能在实际业务中使用的查询。该`vmart_define_schema.sql` 脚本运行定义 VMart 模式并创建表的脚本。在将数据加载到 VMart 数据库之前，必须运行此脚本。

此脚本执行以下任务：
- 在 VMart 数据库架构中定义两个架构：`online_sales` 和 `store`。
- 在两种模式中定义表。
- 定义对这些表的约束。

连接 VMart 数据库后执行以下脚本：
```sql
\i vmart_define_schema.sql
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-74fad92c-ce1a-49d6-a22a-348fe7277c7c.png)

运行脚本之后创建完模式和表之后，查询一下：
```bash
\dn
\dt
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-be578e6f-7e1b-4444-b6ab-ac24c5fdf26b.png)

## 5、加载数据
现在已经成功创建了模式和表，下面可以通过运行 `vmart_load_data.sql` 脚本将数据加载到表中。此脚本将 15 个 `.tbl` 文本文件中的数据加载 `opt/vertica/examples/VMart_Schema` 到 `vmart_design_schema.sql` 创建的表中。

执行加载数据脚本，加载数据可能需要几分钟时间：
```sql
\i vmart_load_data.sql
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-de3cc437-c12f-4b47-a813-0e612f51be24.png)

**📢 注意：** 加载过程中，通过监视 `vertica.log` 文件来检查加载状态！

数据加载完成后，简单查询下表数据：
```sql
\i vmart_query_01.sql
-- 下面👇🏻是 vmart_query_01.sql 脚本中的语句：
SELECT fat_content
         FROM ( SELECT DISTINCT fat_content 
                FROM product_dimension
                WHERE department_description
                IN ('Dairy') ) AS food   
         ORDER BY fat_content 
         LIMIT 5;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211211-c7ce5135-db10-4f52-8a16-b9baaf0402bf.png)

查询数据没有问题，该命令查询乳制品部门中脂肪含量最低的五种产品的值。

## 6、vsql 客户端连接
我们也可以从客户端平台上命令行使用 vsql 连接到数据库：
```bash
/opt/vertica/bin/vsql [-h host] [ option...] [ dbname [ username ] ]
```
|参数|介绍|
|-|-|
|host|如果您连接到本地服务器，则可选。您可以提供 IPv4 或 IPv6 IP 地址或主机名。对于Vertica的地址为IPv4和IPv6地址和您提供主机名代替IP地址的服务器，你可以喜欢与使用IPv4地址-4选项，并与使用IPv6地址经过-6选项，如果DNS被配置为提供IPv4 和 IPv6 地址。如果您使用 IPv6 并提供 IP 地址，则必须在地址后附加.%interface name|
|option|一个或多个 vsql命令行选项如果数据库受密码保护，则必须指定 -w 或--password命令行选项。|
|dbname|目标数据库的名称，默认情况下您的 Linux 用户名。|
|username|一个数据库用户名，默认是你的 Linux 用户名。|

我本机为 `macOS`，安装客户端之后，测试连接：
```bash
vsql -h 192.168.56.100 VMart dbadmin
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211212-afd08cd6-b484-49e8-a651-5797d02ee7fb.png)

**<font color='orage'>至此，高级安装的完整步骤也演示完毕！</font>**

# 写在最后
这个大型超市 (VMart) 跟 `Oracle` 数据库中创建的用户 `scott` 有异曲同工之妙，方便初学者用来学习！建议大家好好利用，能省下很多模拟数据的时间哈，886~
