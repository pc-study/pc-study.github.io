---
title: ❤️《Vagrant官方中文文档》❤️ ① 简介及安装
date: 2021-08-02 13:08:49
tags: [vagrant官方文档翻译]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89231
---

**<font color='blue'>以下为个人翻译，包含个人一些截图，本打算自用，现分享给大家，欢迎👏🏻纠错~</font>**
![在这里插入图片描述](https://img-blog.csdnimg.cn/0c7d7ec28e244584953d6da43d0b6899.png)
@[TOC](Vagrant中文文档)
# 一、简介
## Vagrant文档
欢迎使用 Vagrant 文档 - 一款用于管理虚拟机的命令行实用程序。 该文档旨在完整地记录 Vagrant 的每个功能，并尽可能详细地介绍。 如果您刚刚开始使用 Vagrant，我们强烈建议您先从 HashiCorp 的 Learn 平台上的 **[入门教程](https://learn.hashicorp.com/vagrant)** 开始，然后返回到此页面。

导航将带您浏览 Vagrant 的每个组件。 单击导航项以开始使用，或阅读更多有关 **[为什么开发人员、设计人员和操作人员选择 Vagrant](https://www.vagrantup.com/intro)** 来满足他们的需求的信息。

# 二、安装
## 1、安装Vagrant
安装 Vagrant 非常简单。 请前往 **[Vagrant下载页面](https://www.vagrantup.com/downloads)** 并获取适合您平台的安装程序或软件包。 使用适用于您的操作系统的标准程序安装软件包。
![在这里插入图片描述](https://img-blog.csdnimg.cn/607356cca74748b7931fdec6b662d588.png)
安装程序会自动将 `vagrant` 添到您的系统路径中，以便在终端中可用。 如果没有找到，请尝试注销并重新登录到您的系统（特别是对于 Windows 系统，很有必要）。

>**是否想通过 gem 安装？** Vagrant 1.0.x 可以选择安装为 **[RubyGem](https://en.wikipedia.org/wiki/RubyGems)**。 后续已不再支持此安装方法。 如果您通过 Rubygems 安装了旧版本的 Vagrant，请在安装新版本的 Vagrant 之前将其删除。

>**当心系统包管理器**！ 一些操作系统发行版在其上游包存储库中包含一个 vagrant 包。 请不要以这种方式安装 Vagrant。 通常，这些包缺少依赖项或包含非常过时的 Vagrant 版本。 如果您通过系统的包管理器安装，很可能会遇到问题。 请使用下载页面上的官方安装程序。

### 运行多个虚拟机管理程序
有时，如果使用多个虚拟机管理程序，某些管理程序不允许您启动虚拟机。 如果你足够幸运的话，在尝试使用 Vagrant 和 VirtualBox 启动虚拟机时，您可能会看到以下错误消息：
```bash
There was an error while executing `VBoxManage`, a CLI used by Vagrant for controlling VirtualBox. The command and stderr is shown below.

Command: ["startvm", <ID of the VM>, "--type", "headless"]

Stderr: VBoxManage: error: VT-x is being used by another hypervisor (VERR_VMX_IN_VMX_ROOT_MODE).
VBoxManage: error: VirtualBox can't operate in VMX root mode. Please disable the KVM kernel extension, recompile your kernel and reboot
(VERR_VMX_IN_VMX_ROOT_MODE)
VBoxManage: error: Details: code NS_ERROR_FAILURE (0x80004005), component ConsoleWrap, interface IConsole
```
如果您尝试启动启用了 Hyper-V 的 VirtualBox VM，其他操作系统（如 Windows）将蓝屏。 如果存在另一个虚拟机管理程序，以下是确保您可以使用 Vagrant 和 VirtualBox 的几种方法。
#### Linux, VirtualBox, and KVM
上述错误消息是因为正在使用另一个管理程序（如 KVM）。 我们必须将这些列入黑名单才能使 VirtualBox 正确运行。

---

首先找出管理程序的名称：
```bash
$ lsmod | grep kvm
kvm_intel             204800  6
kvm                   593920  1 kvm_intel
irqbypass              16384  1 kvm
```
我们需要关注的是 `kvm_intel`。 你可能会显示有一个。

将管理程序列入黑名单（以 root 身份运行以下命令）：
```bash
echo 'blacklist kvm-intel' >> /etc/modprobe.d/blacklist.conf
```
重新启动你的机器并再次尝试运行 vagrant。
#### Windows, VirtualBox, and Hyper-V
---

如果您希望在 Windows 上使用 VirtualBox，则必须确保在 Windows 上未启用 Hyper-V。 您可以通过运行以下 Powershell 命令来关闭该功能：
```bash
Disable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/a68df380d39f40c59fcc93b4cfb4b55d.png)
您还可以通过 Windows 系统设置禁用它：
>- 双击打开控制面板，打开 `程序和功能`。
![在这里插入图片描述](https://img-blog.csdnimg.cn/4e0a4d06280a454da7e9ce416b82744d.png)
>- 选择 `启用或关闭 Windows 功能`。
![在这里插入图片描述](https://img-blog.csdnimg.cn/99ee609b8ab34940b93cafc4527cf500.png)
>- 取消选择 `Hyper-V`，然后单击确定。
![在这里插入图片描述](https://img-blog.csdnimg.cn/f988bd9fb78341d4ac485380e4c38181.png)

您可能必须重新启动计算机才能使更改生效。 阅读有关 **[Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)** 的更多信息。

## 2、版本向后兼容性
### 1.0.x版本
对于未使用插件并且有效的 Vagrant 1.0.x Vagrantfiles版本，Vagrant 1.1+ 提供完全的向后兼容性。 安装 Vagrant 1.1 后，原有的 1.0.x 环境应该无需修改即可继续工作，并且现有的运行机器将继续得到正确管理。

甚至到 Vagrant 2.0  版本，版本兼容性依然有效。 但 Vagrant 的兼容性承诺仅适用于两个版本。由于主要的 Vagrant 版本需要数年时间来开发和发布，暂时坚持使用 1.0.x Vagrantfile 版本是安全的。

如果您使用任何 Vagrant 1.0.x 插件，则必须在升级之前从 Vagrantfile 中删除对这些插件的引用。 Vagrant 1.1+ 引入了一种新的插件格式，可以防止这种不兼容再次发生。

### 1.x版本
官方不承诺 1.x 版本的向后兼容性，直到 2.0 final 才承诺 Vagrantfile 语法稳定性。 1.x 中的任何向后不兼容都将被清楚地记录下来。

这类似于 Vagrant 0.x 的处理方式。 在实践中，Vagrant 0.x 在整个开发周期中只引入了少数向后不兼容，但向后不兼容的可能性被明确了，所以用户并不感到惊讶。

Vagrant 2.0 final 将具有稳定的 Vagrantfile 格式，该格式将保持向后兼容，就像 1.0 被认为是稳定的一样。

## 3、更新Vagrant
如果你想从 Vagrant 1.0.x 升级，请阅读如下章节：从1.0.x版本升级。 本页介绍了在 1.x 系列中升级 Vagrant 的一般情况。

1.x 版本系列中的 Vagrant 升级很简单：
- 1、**[下载](https://www.vagrantup.com/downloads)** 新版本安装包
- 2、安装覆盖原有版本即可

安装程序将正确覆盖和删除旧文件。 建议在升级过程中不要运行其他 Vagrant 进程。

请注意，新版本 Vagrantfile 语法的稳定性要到 2.0 最终版才能保证。 因此，虽然为 1.0.x 制作的 Vagrantfiles 将继续工作，但较新的 Vagrantfiles 可能具有向后不兼容的更改，直到 2.0 最终版。

>**升级遇到麻烦？** 如果您遇到升级问题，**[请在Github提交问题](https://github.com/hashicorp/vagrant/issues)**。 升级是一个顺利的过程，如果不是，我们认为它是一个错误。

## 4、从1.0.x版本升级
从 1.0.x 到 1.x 的升级过程很简单。 Vagrant 与 Vagrant 1.0.x 完全向后兼容，因此您可以通过下载最新的软件包并使用适用于您的操作系统的标准程序安装它来简单地重新安装 Vagrant。

正如向后兼容性页面所说，**Vagrant 1.0.x 插件不适用于 Vagrant 1.1+** 。 其中有很多插件都已更新用于较新版本的 Vagrant 使用，因此您可以查看它们是否已更新。 如果没有更新，则必须在升级前将其删除。

建议升级前先把插件全部去掉，再慢慢添加插件。 这通常会使升级过程更顺畅。

>**如果你的 Vagrant 版本是通过 Rubygems 安装的**，你必须在安装新版本 Vagrant 的包之前卸载旧版本。 新版本将不再支持 Rubygems 安装。

## 5、使用源码安装Vagrant
使用源码安装 Vagrant 是一个非常规操作，仅在无法选择使用官方安装程序时才推荐使用。 本页详细介绍了从源码安装 Vagrant 的步骤和先决条件。

### 安装Ruby
你必须有一个新版本的 Ruby (>= 2.2) 才能开发和构建 Vagrant。 具体的 Ruby 版本记录在 Vagrant 的 `gemspec`中。 请参阅 GitHub 上存储库中的 `vagrant.gemspec`，因为它将包含最新的需求。 本指南不会讨论如何安装和管理 Ruby。 但是，请注意以下陷阱：

>- 不要使用系统自带的Ruby：使用 Ruby 版本管理器，如 rvm 或 chruby
>- Vagrant 插件是根据当前环境配置的。 如果插件是从源代码使用 Vagrant 安装的，它们将无法从基于包的 Vagrant 安装中工作。

### 下载Vagrant源码
**注意：需要提前安装好Git软件。**

将 Vagrant 的源码从 GitHub 克隆到您在机器上保存代码的目录中：
```bash
git clone https://github.com/hashicorp/vagrant.git
```
接下来， `cd` 进入该路径。 所有命令都将从此路径运行：
```bash
cd /path/to/your/vagrant/clone
```
使用所需版本的bundle来运行 `bundle` 命令以安装要求：
```bash
bundle install
```
您现在可以通过从该目录中运行 `bundle exec vagrant` 来运行 Vagrant。

### 本地使用
为了在其他项目中使用本地安装的 Vagrant 版本，您需要创建一个 binstub 并将其添加到您的路径中。

首先，从 Vagrant 仓库运行以下命令：
```bash
bundle --binstubs exec
```
这将在 `exec/` 中生成文件，包括 `vagrant`。 您现在可以在操作系统的任何位置指定 `exec/vagrant` 的完整路径：
```bash
/path/to/vagrant/exec/vagrant init -m hashicorp/bionic64
```
请注意，您将收到警告，不支持像这样运行 Vagrant。 请仔细查看这些警告⚠️，确认是否有影响。

如果您不想指定 Vagrant 的完整路径（即您只想运行 vagrant），您可以创建一个指向您的 exec 的符号链接：
```bash
ln -sf /path/to/vagrant/exec/vagrant /usr/local/bin/vagrant
```
当您想切换回官方 Vagrant 版本时，只需删除符号链接即可。

## 6、卸载Vagrant
卸载 Vagrant 既简单又直接。 您可以卸载 Vagrant 二进制文件、用户数据或两者。 以下部分介绍了如何在每个平台上执行此操作。
### 删除Vagrant程序
删除 Vagrant 程序将从您的机器中删除 vagrant 二进制文件和所有依赖项。 卸载程序后，您仍然可以使用标准方法重新安装。 卸载 Vagrant 不会删除用户数据。 此部分下面的部分提供了有关如何从系统中删除该目录的更详细说明。

**Windows系统：**
>使用控制面板的添加/删除程序部分卸载

**Mac OS X系统:**
```bash
sudo rm -rf /opt/vagrant /usr/local/bin/vagrant
sudo pkgutil --forget com.vagrant.vagrant
```
**Linux系统:**
```bash
rm -rf /opt/vagrant
rm -f /usr/bin/vagrant
```
### 删除用户数据
删除用户数据将删除 Vagrant 可能使用的所有boxes盒子、插件、许可证文件和任何已存储的状态。 有效地删除用户数据使 Vagrant 认为这是一个全新的安装。

在所有平台上，此目录位于您的主目录的根目录中，并命名为 `vagrant.d`。 只需删除 `~/.vagrant.d` 目录即可删除用户数据。 如果在 Windows 上，此目录位于 `C:\Users\YourUsername\.vagrant.d`，其中 `YourUsername` 是本地用户的用户名。

当需要进行调试时，Vagrant 支持团队可能会要求您删除此目录。 在删除此目录之前，请进行备份。

运行 Vagrant 将自动重新生成运行所需的任何数据，因此随时删除用户数据是安全的。

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。