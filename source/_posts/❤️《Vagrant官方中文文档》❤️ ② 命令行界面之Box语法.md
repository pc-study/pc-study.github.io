---
title: ❤️《Vagrant官方中文文档》❤️ ② 命令行界面之Box语法
date: 2021-08-02 13:08:44
tags: [vagrant官方文档翻译]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89232
---

**<font color='blue'>以下为个人翻译，包含个人一些截图，本打算自用，现分享给大家，欢迎👏🏻纠错~</font>**
![在这里插入图片描述](https://img-blog.csdnimg.cn/0c7d7ec28e244584953d6da43d0b6899.png)
@[TOC](Vagrant中文文档)
# Vagrant命令行
## 一、命令行界面
几乎所有与 Vagrant 的交互都是通过命令行界面完成的。

该界面可使用 `vagrant` 命令访问，并随 `Vagrant` 自动安装。 `vagrant` 命令有很多子命令，比如 `vagrant up`、`vagrant destroy` 等。
![在这里插入图片描述](https://img-blog.csdnimg.cn/0388f29d4d2b46bcbd89523a3a87e6e7.png)
如果你直接运行 `vagrant`，帮助将显示所有可用的子命令。 除此之外，您可以运行任何带有 `-h` 标志的 Vagrant 命令来输出有关该特定命令的帮助。 例如，尝试运行 `vagrant init -h`。 帮助将输出一个关于命令功能的单句概要以及命令接受的所有标志的列表。
![在这里插入图片描述](https://img-blog.csdnimg.cn/1fb2951eaad5446f8ac30d53f045aaa8.png)
通过阅读本文后续章节，可以获得各种 Vagrant 命令的深入文档和用例。

您可能还希望查阅有关可用于以全局方式配置和控制 Vagrant 的环境变量的 **[文档](https://www.vagrantup.com/docs/other/environmental-variables)**。

### 命令自动补全
Vagrant 提供了自动补全命令的能力。 目前，支持 `bash` 和 `zsh shell`。 这些可以通过运行 `vagrant autocomplete install --bash --zsh` 来启用。
![在这里插入图片描述](https://img-blog.csdnimg.cn/d76712dabf8349199c11cb04cc81a37c.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/75cc5552132e41a59e67b3def05fb6b9.png)
## 二、Box
**命令：** `vagrant box`

这是用于管理（添加、删除等）**[Boxes](https://www.vagrantup.com/docs/boxes)** 的命令。

此命令的主要功能通过更多子命令公开：
>- `add`
>- `list`
>- `outdated`
>- `prune`
>- `remove`
>- `repackage`
>- `update`

![在这里插入图片描述](https://img-blog.csdnimg.cn/31f3b9f27b7045018f9fcf33f74700cb.png)
### 1、Box Add
**命令：** `vagrant box add ADDRESS`

这个命令需要提供一个 Box 的下载地址，可以是以下三项之一：
- 来自 **[Vagrant官方box资源站](https://app.vagrantup.com/boxes/search)** 的简称，例如：`ubuntu/trusty64`
![在这里插入图片描述](https://img-blog.csdnimg.cn/aa50be5023b4456ab4792fe063e32cb4.png)
- **[第三方站点资源](http://www.vagrantbox.es/)**，支持通过HTTP方式加载 Box，对于 HTTP，支持基本身份验证并遵守 http_proxy 环境变量。 还支持 HTTPS。
- 本地已下载的 Box，可通过添加 `--name` 和 Box 目录位置来进行添加。在这种情况下，您必须指定一个 --name 标志（见下文），版本控制/更新将不起作用。

如果下载过程中发生错误或下载被 Ctrl-C 中断，则 Vagrant 将在下次请求时尝试恢复下载。 Vagrant 只会在初始下载后的 24 小时内尝试恢复下载。

#### Box add 子命令选项
- **`--box-version VALUE`：** 要添加的 Box 的版本。 默认情况下，将添加最新版本。 可以是确切的版本号，例如“1.2.3”，也可以是一组版本约束。 版本约束看起来像 ">= 1.0, < 2.0"。
- **`--cacert CERTFILE`：** 用于验证对等方的 CA 证书。 如果远程端不使用标准根 CA，则应使用此选项。
- **`--capath CERTDIR`：** 用于验证对等方的 CA 的证书目录。 如果远程端不使用标准根 CA，则应使用此选项。
- **`--cert CERTFILE`：** 下载 Box 时使用的客户端证书（如有必要）。
- **`--clean`：** 当该子命令被使用时，Vagrant 将从先前下载的相同 URL 中删除任何旧的临时文件。 如果您不希望 Vagrant 从前一个点恢复下载，这很有用，可能是因为内容已更改。
- **`--force`：** 当该子命令被使用时，该 Box 将被下载并覆盖具有此名称的任何现有 Box。
- **`--insecure`：** 当该子命令被使用时，如果 URL 是 HTTPS URL，则不会验证 SSL 证书。
- **`--provider PROVIDER`：** 当该子命令被使用时，Vagrant 将验证您添加的 Box 是否用于正确的虚拟机软件。 默认情况下，Vagrant 会自动检测 Box 要使用的对应虚拟机软件。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20b6260e21024a6f832f74067c84f6db.png)
#### 本地路径添加Box子命令选项
以下选项仅适用于本地路径直接添加 Box 文件的情况（不使用官方Box站点时）。

- **`--checksum VALUE`：** 对下载的 Box 做校验。 如果指定，Vagrant 会将此校验和与实际下载的内容进行比较，如果校验和不匹配，则会出错。 这是强烈推荐的，因为盒子文件太大了。 如果指定了此项，则还必须指定 `--checksum-type`。 如果您从官方Box站点下载，则校验和包含在目录条目中。

- **`--checksum-type TYPE`：** 如果指定了 `--checksum` 的校验和类型。 目前已支持的值为“md5”、“sha1”、“sha256”、“sha384”和“sha512”。

- **`--name VALUE`：** 	Box 的逻辑名称。 这是您将放入 Vagrantfile 中的 `config.vm.box` 的值。 从官方资源站点中添加 Box 时，名称包含在条目中，不需要指定。

>**来自 HashiCorp 的 Vagrant Cloud 的版本 Boxes 或 Boxes 的校验**：对于来自 HashiCorp 的 Vagrant Cloud 的 Boxes，校验已嵌入在 Boxes 的元数据中。 元数据本身通过 TLS 提供，并且其格式经过验证。

### 2、Box List
**命令：** `vagrant box list`

此命令列出了安装到 Vagrant 中的所有 Boxes。
![在这里插入图片描述](https://img-blog.csdnimg.cn/91f913e8e7a648a3bce03b21abe82187.png)
### 3、Box Outdated
**命令：** `vagrant box outdated`

这个命令告诉你，在当前 Vagrant 环境中使用的 box 是否已经过时。 如果存在 `--global` 标志，将检查每个已安装的 Box 是否有更新。

这将显示可用于特定提供程序类型的最新版本，这可能与可用的绝对最新版本不同。

检查更新涉及刷新与 Box 关联的元数据。 这通常需要互联网连接。

默认情况下，如果 Vagrant 最近检查了一个过时的 Box，它会缓存该结果并且在一小时内不会查找另一个更新。 如果使用 `--force` 标志，则可以忽略此缓存值。

#### 子命令选项
- **`--force`：** 检查所有已安装 Boxes 的更新并忽略缓存间隔。
- **`--global`：** 检查所有已安装框的更新，而不仅仅是当前 Vagrant 环境的 Boxes。

![在这里插入图片描述](https://img-blog.csdnimg.cn/5ffddc0b9cfb49c2bbfa65c34e3c8ca3.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/5387fa89d03d48a4b7ca506a5df8fa4d.png)
### 4、Box Prune
**命令：** `vagrant box prune`

此命令将删除旧版本的已安装 Box。 如果 Box 当前正在使用，vagrant 会要求确认。

#### 子命令选项
- **`--provider PROVIDER`：** 要销毁的 Box 的虚拟机软件类型。
- **`--dry-run`：** 只打印将被删除的 Box。
- **`--name NAME`：** 用于检查过时版本的特定 Box 名称。
- **`--force`：** 即使在使用 Box 时也无需确认即可销毁。
- **`--keep-active-boxes`：** 与 `--force` 结合使用时，将保持 Box 仍在使用中。

![在这里插入图片描述](https://img-blog.csdnimg.cn/80c09f4fed6e459e963aa4cbca322c43.png)
### 5、Box Remove
**命令：** `vagrant box remove NAME`

此命令从 Vagrant 中删除与给定名称匹配的 Box。

如果一个 Box 有多个虚拟机程序版本，则必须使用 `--provider` 标志指定确切的虚拟机程序版本。 如果一个框有多个版本，您可以使用 `--box-version` 标志选择要删除的版本或使用 `--all` 标志删除所有版本。

#### 子命令选项
- **`--box-version VALUE`：** 指明需要删除的 Box 的版本约束。 
- **`--all`：** 删除一个 Box 的所有可用版本。
- **`--force`：** 即使活动的 Vagrant 环境正在使用它，也强制删除该 Box。
- **`--provider VALUE`：** 要使用给定名称删除的特定于提供者的 Box。 仅当一个 Box 由多个虚拟机软件程序支持时才需要该命令。 如果只有一个虚拟机程序支持，Vagrant 将默认删除它。

![在这里插入图片描述](https://img-blog.csdnimg.cn/13029f6c65e04a09b4b84ae5a411f1a9.png)
### 6、Box Repackage
**命令：* `vagrant box repackage NAME PROVIDER VERSION`

此命令重新打包给定的框并将其放在当前目录中，以便您可以重新分发它。 可以使用 `vagrant box  list` 检索 Boxes 的名称、提供者和版本

当您添加一个 Box 时，Vagrant 会打开它并将其存储在内部。 不保留原始 `*.box` 文件。 此命令对于从已安装的 `Vagrant box` 中回收 `*.box` 文件很有用。
![在这里插入图片描述](https://img-blog.csdnimg.cn/b8450c9289a54fe8b8899317ba0ae340.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/d40b3cf94e864369a963a786a8117f83.png)
### 7、Box Update
**命令：** `vagrant box update`

如果有可用更新，此命令会更新当前 Vagrant 环境的 Boxes。 该命令还可以通过指定 `--box` 标志来更新特定 Box（在活动的 `Vagrant` 环境之外）。

请注意，更新 Box 不会更新已经运行的 `Vagrant` 机器。 为了反映 Box 中的变化，您必须销毁并重新启动 `Vagrant` 机器。

如果您只想检查是否有可用更新，请使用 `vagrant box outdated` 命令。

#### 子命令选项
- **`--box VALUE`：** 要更新的特定 Box 的名称。 如果未指定此标志，`Vagrant` 将更新活动 Vagrant 环境的 Box。
- **`--provider VALUE`：** 当 `--box` 存在时，这将控制要更新的特定于虚拟机程序的 `Box`。 除非该 Box 有多个虚拟机程序支持，否则这不是必需的。 如果没有 `--box` 标志，这将不起作用。

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。