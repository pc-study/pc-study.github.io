---
title: ❤️《Vagrant官方中文文档》❤️ ③ 命令行界面之Cloud命令
date: 2021-08-02 13:08:19
tags: [vagrant官方文档翻译]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89233
---

**<font color='blue'>以下为个人翻译，包含个人一些截图，本打算自用，现分享给大家，欢迎👏🏻纠错~</font>**
![在这里插入图片描述](https://img-blog.csdnimg.cn/0c7d7ec28e244584953d6da43d0b6899.png)
@[TOC](Vagrant中文文档)
# Vagrant Cloud
**命令：** `vagrant cloud`

这是用于管理与 `Vagrant Cloud` 相关的任何内容的命令。

此命令的主要功能通过子命令公开：
- `auth`
- `box`
- `provider`
- `publish`
- `search`
- `version`

![在这里插入图片描述](https://img-blog.csdnimg.cn/a816d6eae0c24c47a58f71df0004bb55.png)
## 1、Cloud Auth
**命令：**`vagrant cloud auth`

**cloud auth** 命令用于处理与 `Vagrant Cloud` 授权相关的所有事情。
- `login`
- `logout`
- `whoami`

### Cloud Auth Login
**命令：**`vagrant cloud auth login`

**login** 命令用于向 [HashiCorp's Vagrant Cloud]() 服务器进行身份验证。 仅当您访问受保护的邮箱时才需要登录。

使用 `Vagrant` 不需要登录。 绝大多数 `Vagrant` 不需要登录。 只有某些功能，例如受保护的 Boxes。
![在这里插入图片描述](https://img-blog.csdnimg.cn/e221eda7b9214fd98c230dc2025049f2.png)
下面提供了对此命令的可用命令行标志的参考。
#### 子命令选项
- **`--check`：** 这将检查您是否已登录。除了输出您是否已登录外，如果您已登录，则命令退出状态将为 0，否则为 1。
![在这里插入图片描述](https://img-blog.csdnimg.cn/090de36f01db4d459455f922589cf93e.png)
- **`--logout`：** 如果您已登录，这会将您注销。如果您已经注销，此命令将不执行任何操作。 如果您已经注销，则调用此命令不是错误。
![在这里插入图片描述](https://img-blog.csdnimg.cn/e0cd193f7fdd4449bd4df6b0efd4842d.png)
- **`--token`：** 这将手动将 `Vagrant Cloud` 登录令牌设置为提供的字符串。 假定此令牌是有效的 `Vagrant Cloud` 访问令牌。
![在这里插入图片描述](https://img-blog.csdnimg.cn/f05f02f04a434a13b41401ea3bc5676a.png)
### Cloud Auth Logout
**命令：**`vagrant cloud auth logout`

如果您已登录，这会将您注销。如果您已经注销，此命令将不执行任何操作。 如果您已经注销，则调用此命令不是错误。
![在这里插入图片描述](https://img-blog.csdnimg.cn/6570a30da9d048208bb11cc6a3671289.png)
### Cloud Auth Whoami
**命令：** `vagrant cloud auth whoami [TOKEN]`

此命令将验证您的 Vagrant Cloud 令牌并打印它所属的用户。 如果传入令牌，它将尝试验证它而不是存储在磁盘上的令牌。
![在这里插入图片描述](https://img-blog.csdnimg.cn/2174e50bd0dc4718b04079a4d06ebb6e.png)
## 2、Cloud Box
**命令：**`vagrant cloud box`

**cloud box** 命令用于管理 Vagrant Cloud 上所有 `box` 实体的生命周期操作。
- `create`
- `delete`
- `show`
- `update`

![在这里插入图片描述](https://img-blog.csdnimg.cn/a68c1086a2774a12b875c23b517e30ff.png)
### Cloud Box Create
**命令：** `vagrant cloud box create ORGANIZATION/BOX-NAME`

**box create** 命令用于在 Vagrant Cloud 上创建一个新的 box 条目。

#### 子命令选项
- **`--description DESCRIPTION`：** Box 的完整描述。 可以使用 `Markdown` 格式化。
- **`--short-description DESCRIPTION`：** Box 的简短摘要。
- **`--private`：** 将新建的 Box 设为私有（默认为公开）。

![在这里插入图片描述](https://img-blog.csdnimg.cn/a98d6ea7601043f3abf8b7869fcf6d90.png)
### Cloud Box Delete
**命令：**`vagrant cloud box delete ORGANIZATION/BOX-NAME`

**box delete** 命令将永久删除 Vagrant Cloud 上给定的 box 条目。 在提出请求之前，它会询问您是否确定要删除该框。

### Cloud Box Show
**命令：** `vagrant cloud box show ORGANIZATION/BOX-NAME`

**box show** 命令将显示有关给定 Vagrant box 的最新版本的信息。

### Cloud Box Update
**命令：**`vagrant cloud box update ORGANIZATION/BOX-NAME`

**box update** 命令将使用给定的选项更新 Vagrant Cloud 上已经创建的 box。

#### 子命令选项
- **`--description DESCRIPTION`：** Box 的完整描述。 可以用 Markdown 格式化。
- **`--short-description DESCRIPTION`：**  Box 的简短摘要。
- **`--private`：** 将新建的 Box 设为私有（默认为公开）。

## 3、Cloud Provider
**命令：**`vagrant cloud provider`

**cloud provider** 命令用于管理 Vagrant Cloud 上所有虚拟机程序版本的生命周期操作。
- `create`
- `delete`
- `update`
- `upload`

![在这里插入图片描述](https://img-blog.csdnimg.cn/ea95c06c70e64f1291744e1640799910.png)
### Cloud Provider Create
**命令：**`vagrant cloud provider create ORGANIZATION/BOX-NAME PROVIDER-NAME VERSION [URL]`

**provider create** 命令用于在 Vagrant Cloud 上创建一个新的虚拟机程序条目。 `url` 参数应该是 Vagrant Cloud 可以用来下载提供程序的远程 URL。 如果未指定 url，则可以稍后使用 url 更新提供程序条目，或者可以使用 upload 命令上传 Vagrant box 文件。

### Cloud Provider Delete
**命令：**`vagrant cloud provider delete ORGANIZATION/BOX-NAME PROVIDER-NAME VERSION`

**provider delete** 命令用于删除 Vagrant Cloud 上的虚拟机程序条目。 在提出请求之前，它会询问您是否确定要删除虚拟机程序条目。

### Cloud Provider Update
**命令：**`vagrant cloud provider update ORGANIZATION/BOX-NAME PROVIDER-NAME VERSION [URL]`

**provider update** 命令将使用给定的选项为 Vagrant Cloud 上的一个 Box 更新一个已经创建的虚拟机程序条目。

### Cloud Provider Upload
**命令：**`vagrant cloud provider upload ORGANIZATION/BOX-NAME PROVIDER-NAME VERSION BOX-FILE`

**provider upload** 命令会将 Vagrant box 文件上传到 Vagrant Cloud，用于指定版本和虚拟机程序条目。

## 4、Cloud Publish
**命令：**`vagrant cloud publish ORGANIZATION/BOX-NAME VERSION PROVIDER-NAME [PROVIDER-FILE]`

发布命令是在 Vagrant Cloud 上创建和更新 Vagrant box 的完整解决方案。 不必使用单独的命令创建 Vagrant Box 的每个属性，发布命令会要求您在创建或更新新框之前提供所需的所有信息。

#### 子命令选项
- **`--box-version VERSION`：** 为 Box 创建的版本号。
- **`--description DESCRIPTION`：** Box 的完整描述。 可以用 Markdown 格式化。
- **`--force`：** 创建或更新 Box 时禁用确认。
- **`--short-description DESCRIPTION`：** Box 的简短摘要。
- **`--private`：** 使新建的 Box 私有（默认为公开）。
- **`--release`：** 创建后自动释放Box（默认未释放）。
- **`--url`：** 用于下载 box 文件的有效远程 URL。
- **`--version-description DESCRIPTION`：** 即将创建的版本的描述。

#### 举例
在 Vagrant Cloud 上创建一个新 Box：
```bash
$ vagrant cloud publish briancain/supertest 1.0.0 virtualbox boxes/my/virtualbox.box -d "A really cool box to download and use" --version-description "A cool version" --release --short-description "Download me!"
You are about to create a box on Vagrant Cloud with the following options:
briancain/supertest (1.0.0) for virtualbox
Automatic Release:     true
Box Description:       A really cool box to download and use
Box Short Description: Download me!
Version Description:   A cool version
Do you wish to continue? [y/N] y
Creating a box entry...
Creating a version entry...
Creating a provider entry...
Uploading provider with file /Users/vagrant/boxes/my/virtualbox.box
Releasing box...
Complete! Published briancain/supertest
tag:                  briancain/supertest
username:             briancain
name:                 supertest
private:              false
downloads:            0
created_at:           2018-07-25T17:53:04.340Z
updated_at:           2018-07-25T18:01:10.665Z
short_description:    Download me!
description_markdown: A really cool box to download and use
current_version:      1.0.0
providers:            virtualbox
```
## 5、Cloud Search
**命令：**`vagrant cloud search QUERY`

云搜索命令将进行查询并在 Vagrant Cloud 中搜索任何匹配的 Vagrant Box。 可以对结果应用各种过滤器。

#### 子命令选项
- **`--json`：** 以 JSON 格式设置搜索结果。
- **`--page PAGE`：** 要显示的页面。 默认为结果的第一页。
- **`--short`：** 显示查询结果 Box 名称的简单列表。
- **`--order ORDER`：** 显示查询结果的顺序，可以是 desc 或 asc， 默认为 desc。
- **`--limit LIMIT`：** 要显示的最大搜索结果数，默认为 25。
- **`--provider PROVIDER`：** 将搜索结果过滤到单个提供程序。
- **`--sort-by SORT`：** 对结果进行排序的字段，可以创建、下载或更新，默认为下载。

#### 举例
```bash
vagrant cloud search hashicorp --limit 5
| NAME                    | VERSION | DOWNLOADS | PROVIDERS                       |
+-------------------------+---------+-----------+---------------------------------+
| hashicorp/precise64     | 1.1.0   | 6,675,725 | virtualbox,vmware_fusion,hyperv |
| hashicorp/precise32     | 1.0.0   | 2,261,377 | virtualbox                      |
| hashicorp/boot2docker   | 1.7.8   |    59,284 | vmware_desktop,virtualbox       |
| hashicorp/connect-vm    | 0.1.0   |     6,912 | vmware_desktop,virtualbox       |
| hashicorp/vagrant-share | 0.1.0   |     3,488 | vmware_desktop,virtualbox       |
+-------------------------+---------+-----------+---------------------------------+
```
## 6、Cloud Version
**命令：**``vagrant cloud version`

**cloud version** 命令用于管理 Vagrant Cloud 上 box 的所有版本实体的生命周期操作。
- `create`
- `delete`
- `release`
-` revoke`
- `update`

![在这里插入图片描述](https://img-blog.csdnimg.cn/8e068723dcbe48179fb76f208f8f6bf1.png)
### Cloud Version Create
**命令：**`vagrant cloud version create ORGANIZATION/BOX-NAME VERSION`

**cloud create** 命令为 Vagrant Cloud 上的一个 Box 创建一个版本条目。
#### 子命令选项
- **`--description DESCRIPTION`：** 将创建的版本的描述。

### Cloud Version Delete
**命令：**`vagrant cloud version delete ORGANIZATION/BOX-NAME VERSION`

**cloud delete** 命令删除 Vagrant Cloud 上一个 Box 的版本条目。 在提出请求之前，它会询问您是否确定要删除该版本。
### Cloud Version Release
**命令：**`vagrant cloud version release ORGANIZATION/BOX-NAME VERSION`

如果 Vagrant Cloud 上的 box 已经存在，则 **cloud release** 命令会释放它的版本条目。 在提出请求之前，它会询问您是否确定要发布版本。
### Cloud Version Revoke
**命令：**`vagrant cloud version revoke ORGANIZATION/BOX-NAME VERSION`

如果 Vagrant Cloud 上的 Box 已经存在，则 **cloud revoke** 命令会撤销该 Box 的版本条目。 在提出请求之前，它会询问您是否确定要撤销该版本。
### Cloud Version Update
**命令：**`vagrant cloud version update ORGANIZATION/BOX-NAME VERSION`

#### 子命令选项
- **`--description DESCRIPTION`：** 将创建的版本的描述。

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。