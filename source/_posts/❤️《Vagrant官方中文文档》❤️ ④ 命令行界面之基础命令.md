---
title: ❤️《Vagrant官方中文文档》❤️ ④ 命令行界面之基础命令
date: 2021-08-02 13:08:54
tags: [vagrant官方文档翻译]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89234
---

**<font color='blue'>以下为个人翻译，包含个人一些截图，本打算自用，现分享给大家，欢迎👏🏻纠错~</font>**
![在这里插入图片描述](https://img-blog.csdnimg.cn/0c7d7ec28e244584953d6da43d0b6899.png)
@[TOC](Vagrant中文文档)
# Connect
**命令：** `vagrant connect NAME`

connect 命令通过启用对共享环境的访问来补充 share 命令。 您可以在 Vagrant Share 部分了解 Vagrant Share 的所有详细信息。

下面提供了对此命令的可用命令行标志的参考。

**子命令选项**
![在这里插入图片描述](https://img-blog.csdnimg.cn/92b1a024376f4de2ac4656b3c855f2b4.png)
- **`--disable-static-ip`：** 命令不会启动小型虚拟机来创建您可以访问的静态 IP。 设置此标志后，访问连接的唯一方法是使用输出的 SOCKS 代理地址。

- **`--static-ip IP`：** 告诉 connect 虚拟机使用的静态 IP 地址。 默认情况下，Vagrant connect 将使用在 172.16.0.0/16 空间中可用的 IP 地址。

- **`--ssh`：** 通过 SSH 连接到与 vagrant share --ssh 共享的环境。

# Destroy
**命令：** `vagrant destroy [name|id]`

此命令停止 Vagrant 管理的正在运行的机器，并销毁在机器创建过程中创建的所有资源。 运行此命令后，您的计算机将恢复最初状态，就好像您从未创建过访客计算机一样。

对于基于 linux 的来宾，Vagrant 使用 shutdown 命令优雅地终止机器。 由于操作系统的不同性质，shutdown 命令可能存在于来宾 $PATH 的许多不同位置。 使用包含关闭命令的目录正确填充 $PATH 是来宾计算机的责任。

**子命令选项**
![在这里插入图片描述](https://img-blog.csdnimg.cn/09586c52e52740d7ac77de9a79808a7f.png)
- **`-f ` 或 `--force`：** 强制销毁，无需确认。
- **`--[no-]parallel`：** 如果 虚拟机系统 支持，可以并行销毁多台机器。 
- **`-g` 或 `--graceful`：** 优雅地关闭机器。

> 使用 `destroy` 命令不会删除在 vagrant up 期间可能已安装在您计算机上的 Box 。 因此，即使您运行 vagrant destroy，系统中安装的 Box 仍将存在于硬盘驱动器上。 要将您的计算机恢复到 vagrant up 命令之前的状态，您需要使用 vagrant box remove。

# Global Status
**命令：** `vagrant global-status`

此命令将告诉您当前登录用户的系统上所有活动 Vagrant 环境的状态。

此命令不会主动验证机器的状态，而是基于缓存。 因此，可能会看到陈旧的结果（机器说它们正在运行，但实际上并没有）。 例如，如果您重新启动计算机，Vagrant 不会知道。 要清除无效条目，请使用 --prune 标志运行 global status。
![在这里插入图片描述](https://img-blog.csdnimg.cn/0c9d111d5bf248308e5e53b263b19f3f.png)
输出 `6864cf2` 的 ID 可用于从系统的任何位置控制 Vagrant 机器。 任何使用目标机器的 Vagrant 命令（例如 up、halt、destroy）都可以使用这个 ID 来控制它。 例如：vagrant destroy a1b2c3。

**子命令选项**

- **`--prune`：** 从列表中删除无效条目。 这比简单地列出条目要耗时得多。

**虚拟机系统没有出现**

如果您的虚拟机系统没有出现，您可能必须先进行 vagrant destroy，然后进行 vagrant up。

如果您刚刚从 Vagrant 的先前版本升级，则现有环境将不会显示在 global-status 中，直到它们被销毁并重新创建。

# Halt
**命令：** `vagrant halt [name|id]`

此命令关闭 Vagrant 正在管理的正在运行的机器。

Vagrant 将首先尝试通过运行来宾操作系统关闭方式来正常关闭机器。 如果失败，或者指定了 --force 标志，Vagrant 将有效地关闭机器的电源。

对于基于 linux 的来宾，Vagrant 使用 shutdown 命令优雅地终止机器。 由于操作系统的不同性质，shutdown 命令可能存在于来宾 $PATH 的许多不同位置。 使用包含关闭命令的目录正确填充 $PATH 是来宾计算机的责任。

**子命令选项**
![在这里插入图片描述](https://img-blog.csdnimg.cn/e560684893c7403283f4b69c8b45fe77.png)
- **`-f 或 --force`：** 不要尝试强制关闭机器。 这会影响主机的电源。
# Init
**命令：**`vagrant init [name [url]]`

如果 Vagrantfile 尚未存在，则通过创建初始 Vagrantfile ，将当前目录初始化为 Vagrant 环境。

如果给出第一个参数，它将在创建的 Vagrantfile 中预填充 config.vm.box 设置。

如果给出第二个参数，它将在创建的 Vagrantfile 中预填充 config.vm.box_url 设置。

**子命令选项**
![在这里插入图片描述](https://img-blog.csdnimg.cn/8ef31e131c6f4ee2bc039a3c6e38e521.png)
- **`--box-version`：** （可选）要添加到 Vagrantfile 的 box 版本或 box 版本约束。
- **`--force`：** 如果指定，此命令将覆盖任何现有的 Vagrantfile。
- **`--minimal`：** 如果指定，将创建一个没有注释的 Vagrantfile。 这个 Vagrantfile 不包含普通 Vagrantfile 包含的说明性注释。
- **`--output FILE`：** 这会将 Vagrantfile 输出到给定的文件。 如果这是“-”，则 Vagrantfile 将被输出到当前终端。
- **`--template FILE`：** 提供用于生成 Vagrantfile 的自定义 ERB 模板。

![在这里插入图片描述](https://img-blog.csdnimg.cn/a3a83e0f98e44ef48a288525dbd4859d.png)
**举例：**

创建一个基本的 Vagrantfile：
```bash
vagrant init hashicorp/bionic64
```
创建一个最小的 Vagrantfile（没有注释）：
```bash
vagrant init -m hashicorp/bionic64
```
创建一个新的 Vagrantfile，覆盖当前路径的文件：
```bash
vagrant init -f hashicorp/bionic64
```
从特定框 URL 使用特定框创建 Vagrantfile：
```bash
vagrant init my-company-box https://example.com/my-company.box
```
创建一个 Vagrantfile，将框锁定到版本约束：
```bash
vagrant init --box-version '> 0.1.5' hashicorp/bionic64
```
# Login
**命令：**`vagrant login`

login 命令用于向 HashiCorp 的 Vagrant Cloud 服务器进行身份验证。 只有在访问受保护的 Box 或使用 Vagrant Share 时才需要登录。

使用 Vagrant 不需要登录。 绝大多数 Vagrant 命令不需要登录。 只有某些功能需要登录。

**子命令选项**
![在这里插入图片描述](https://img-blog.csdnimg.cn/1c68adcfd0274da3942705ae85fb8c60.png)
- **`--check`：** 这将检查您是否已登录。除了输出您是否已登录外，如果您已登录，该命令的退出状态将为 0，如果您未登录，则退出状态为 1。
- **`--logout`：** 如果您已登录，这会将您注销。如果您已经注销，此命令将不执行任何操作。 如果您已经注销，则调用此命令不是错误。
- **`--token`：** 这将手动将 Vagrant Cloud 登录令牌设置为提供的字符串。 假定此令牌是有效的 Vagrant Cloud 访问令牌。

![在这里插入图片描述](https://img-blog.csdnimg.cn/ad1ac1bda6474049b87cfc2d283dfeef.png)
**<font color='green'>注意：该命令选项 login 已经废弃！建议使用 `vagrant cloud auth login` 来进行登录。</font>**
# Package
**命令：**`vagrant package [name|id]`

这将当前运行的 VirtualBox 或 Hyper-V 环境打包到一个可重用的 Box 中。此命令只能与基于 同一虚拟机软件 实现的其他 虚拟机软件 一起使用。

**子命令选项**
![在这里插入图片描述](https://img-blog.csdnimg.cn/596f3dc5f9b641098dd3e43bab9a2fcc.png)
- **`--base NAME`：** 不是打包 Vagrant 管理的 VirtualBox 机器，而是打包 VirtualBox 管理的 VirtualBox 机器。 NAME 应该是 VirtualBox GUI 中机器的名称或 UUID，即主机名。 目前此选项仅适用于 VirtualBox。
- **`--output NAME`：** 生成的包将保存为 NAME。 默认情况下，它将保存为 package.box。
- **`--include x,y,z`：** 附加文件将与盒子一起打包。 这些可以被打包的 Vagrantfile（记录如下）用来执行额外的任务。
- **`--info path/to/info.json`：** 该包将包含一个自定义 JSON 文件，其中包含在使用 -i 标志调用时由 list 命令显示的信息。
- **`--vagrantfile FILE`：** 将 Vagrantfile 与框一起打包，当使用结果框时，该框作为 Vagrantfile 加载顺序的一部分加载。

> 一个常见的误解是 --vagrantfile 选项将打包一个 Vagrantfile，当 vagrant init 与此框一起使用时使用该Vagrantfile。 不是这种情况。 相反，当使用该框时，作为 Vagrant 加载过程的一部分加载和读取 Vagrantfile。

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。