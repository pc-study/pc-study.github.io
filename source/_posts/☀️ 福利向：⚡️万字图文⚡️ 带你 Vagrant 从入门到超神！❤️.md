---
title: ☀️ 福利向：⚡️万字图文⚡️ 带你 Vagrant 从入门到超神！❤️
date: 2021-07-29 17:29:09
tags: [玩转 vagrant]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/88457
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 🌲  前言 🌲
>**<font color='red'>不是标题党，上来我就直接装系统，往下翻，👌🏻 ！！！ </font>**

❤️ **ヾ(◍°∇°◍)ﾉﾞ** ❤️

**首先下载安装 [Vagrant](https://www.vagrantup.com/downloads) 和 [VirtualBox](https://www.virtualbox.org/wiki/Downloads) ，不用知道是啥玩意，安装完软件之后，打开 `cmd` 或者 `终端` 执行以下命令即可安装操作系统，就这么简单！**

**🙉 <font color='blue'>以下列出主流系统安装方式</font> 🙉 ：**

>🌞  **<font color='orange'>安装Windows10 系统</font>** 🌞
```bash
vagrant init galppoc/windows10
vagrant up
```
> **<font color='green'>安装 macOS 系统</font>** 
```bash
vagrant init jhcook/macos-sierra
vagrant up
```

>🧡   **<font color='orange'>安装 Linux/Unix 系统</font>** 🧡

**① centos：**
```bash
vagrant init generic/centos7
vagrant up
```
**② Ubuntu：**
```bash
vagrant init generic/ubuntu2010
vagrant up
```
**③ redhat：**
```bash
vagrant init generic/rhel7
vagrant up
```
**④ fedora：**
```bash
vagrant init generic/fedora32
vagrant up
```
**⑤ oracle linux：**
```bash
vagrant init generic/oracle7
vagrant up
```
**<font color='oragen'>看不懂？没有关系，直接输入就行！！！</font>**

**❤️ 以上只列出常用主流操作系统，并不是仅仅这些，Vagrant 支持所有操作系统安装，只要能安装的，都可以！**

**☀️ <font color='green'>想要入门？想要解锁 🔓 更多玩法？看下去，带你玩转 Vagrant ！！！☀️</font>**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210720003451421.gif)
@[TOC](⭐️ Vagrant 使用指南大全 ⭐️)
# 🌻	Vagrant 简介 🌻	
**Vagrant**  - 一款用于管理虚拟机的命令行实用软件，用 Ruby 语言开发而成。换言说，可以省去你使用虚拟机创建操作系统的所有操作，比如创建虚拟机，挂载镜像文件，一步步点击安装；使用 Vagrant ，这些都不需要做了，简简单单 2 行命令，快速创建属于你个人的系统。

![在这里插入图片描述](https://img-blog.csdnimg.cn/e9d3d030e5a549d4b967ddb0aae602b8.png)
# ❤️ <font color='green'>入门玩法：Vagrant 安装</font> ❤️
😄 Vagrant 的安装 **Very easy~** ，直接在官网下载安装包👇🏻：

> 官网下载地址：https://www.vagrantup.com/downloads

![在这里插入图片描述](https://img-blog.csdnimg.cn/0cbe319b7c354f58ba1a9e6770138d7d.png)
**安装完后，方便使用，启用命令行自动补全：**

```bash
vagrant autocomplete install --bash --zsh
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/87926bd719b5480fbe9cfbe7261eb260.png)
o(￣▽￣)ｄ，安装完后，重新启动终端，尝试输入部分命令 vagr ，然后直接按 Tab 键自动带出完整命令。

# ⚡️ <font color='oragen'>初阶玩法：Vagrant 常用命令</font> ⚡️
## 1️⃣ Vagrant 基础命令
**<font color='green'>查看 Vagrant 帮助</font>**
```bash
vagrant --help
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/e51c9a2fcf6a4527ba4e9fad40f425f3.png)
☺️ 显而易见，这个命令就是帮助我们了解 Vagrant 有哪些命令，以及哪些功能，如何使用。

**<font color='green'>查看 Vagrant 版本</font>**
```bash
vagrant --version
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3b8e4f240a0645a292104265a437d0ea.png)
查看当前 Vagrant 版本。

**<font color='green'>查看 Vagrant 当前所有已安装系统</font>**

```bash
vagrant global-status
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/bdb074f7e3024df7b5aa459672319dfa.png)
通过该命令可以查看当前系统已安装的虚拟机系统详细信息，非常方便。

## 2️⃣ Vagrant Box 管理
本节主要介绍 Vagrant Box 的基本管理命令：
![在这里插入图片描述](https://img-blog.csdnimg.cn/719fcf7f964046bfab3a299fc91882c8.png)
**<font color='green'>查看所有已添加 box</font>**

```bash
vagrant box list
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/1632c401e567468ea866971fa75fd8fa.png)
此命令可以列出所有已添加的 box 。

**<font color='green'>添加新的 box</font>**

```bash
vagrant box add /Volumes/Lucifer/vagrant/centos79-oracle11g-vb/centos7.9 --name=centos7
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3f080dd9e18e428282e1d8eda9b5f0d9.png)
下载 box 到本地，指定本地 box 添加，名称为centos7。

**<font color='green'>移除已添加 box </font>**

```bash
vagrant box remove centos7
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/12bc90da38ea457ca1095cfb3d4928df.png)
本示例移除名为 centos7 的 box。

## 3️⃣ Vagrant 虚拟机系统命令

**<font color='green'>初始化虚拟机系统 </font>**

```bash
vagrant init luciferliu/oracle11g
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/9ba6a7e3f57c4eceb557fa0f00417874.png)
初始化虚拟机系统之后，会自动生成一个Vagrantfile文件，可自定义编辑，玩转 Vagrant 关键。

**<font color='green'>校验 Vagrantfile 文件 </font>**

```bash
vagrant validate
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/31173594003248cb8af5a5cf02d90fe3.png)
当你编辑好一个 Vagrantfile 之后，不确定编写是否正确，可以使用该命令进行验证是否正确。


**<font color='green'>启动虚拟机系统 </font>**

```bash
vagrant up --provider=virtualbox
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/45d3d13bf73f4b63a10eb0e9b210a260.png)
用默认虚拟机 virtualbox 启动虚拟机系统，过程中显示，如果本地没有添加过 box，vagrant up 启动后会自动下载添加。

**<font color='green'>连接虚拟机系统 </font>**

```bash
vagrant ssh
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/66103784680b41e0b86bec54eb3954b8.png)
通过该命令可以无需常规的 SSH 方式，快速连接系统，默认用户为 vagrant，密码为 vagrant。

**<font color='green'>查看虚拟机系统状态 </font>**

```bash
vagrant status 
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3b540390626a4ea1bf05ce4fa91a43a2.png)
显而易见，查看当前虚拟机系统的运行状态。

**<font color='green'>重载虚拟机系统 </font>**

```bash
vagrant reload
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/803387f821ec49bfa4f526afa5fb9eb3.png)
顾名思义，重新加载你的虚拟机系统，当你修改 Vagrantfile 之后需要生效，无需关闭虚拟机系统，执行该命令即可生效。

**<font color='green'>关闭虚拟机系统 </font>**

```bash
vagrant halt
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/6aa1f621ba7b4f6ca7d14020d62b24a8.png)
执行关闭命令后，虚拟机系统将会立刻关闭。

**<font color='green'>打包虚拟机系统 </font>**

```bash
vagrant package
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/4d5aad021fc74c49ab8545a033e8f9fa.png)
为什么要打包系统？很简单，你可以打包后备份它，可以分享它给你的朋友，可以用来工作同步一键部署开发环境。

**<font color='green'>删除虚拟机系统 </font>**

```bash
vagrant destory
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c7d9cbb3f16b45f1810d345e46d2fb61.png)
删除命令将会删除你的虚拟机系统，包括所有文件，全都消失无踪，慎用 ⚠️。

## 4️⃣ Vagrant 插件管理
本节主要介绍 Vagrant 插件的管理命令：
![在这里插入图片描述](https://img-blog.csdnimg.cn/9358881417d94fb7b8a4bc62cfff6a53.png)
**<font color='green'>查看已安装插件 </font>**

```bash
vagrant plugin list
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c2f4224efcdf4282bf220d9540ca482c.png)
显示你安装的所有 Vagrant 插件。

**<font color='green'>安装插件 </font>**

```bash
vagrant plugin install vagrant-share
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/216d3dea68aa498c88d2943f0f52876a.png)
**<font color='green'>卸载插件 </font>**
```bash
vagrant plugin uninstall vagrant-share
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/6067d7bef0da4f1183b33d1195a942dd.png)
**<font color='green'>修复插件 </font>**

```bash
vagrant plugin repair
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/1a98316b31b54385af50125fd8a8388d.png)
插件出现问题时，可以使用修复命令来进行修复。

**<font color='green'>更新插件 </font>**

```bash
vagrant plugin update
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/73d552d303104657a8538bca91093b21.png)
既然是插件，当然需要经常更新，使用更新命令可以更新你的插件。

# 🌀 <font color='blue'>进阶玩法：Vagrant 插件</font> 🌀
既然上面讲到插件了，那就推荐一下常用插件。刚安装的 Vagrant 相当于一个没有武装的战士，想要拥有强大的战斗力，就需要用插件来全副武装。Vagrant 具有许多开箱即用的强大功能，可以让你的环境启动并运行。

> **❤️  给大家分享下 Plugin 网站 ：https://vagrant-lists.github.io/#plugins ❤️**

👌🏻 **这里分享下我已安装的几个插件：**

> - **vagrant-parallels** (2.2.3, global) 
> <font color='green'>用于 Parallels Desktop 虚拟机的支持插件</font>
> - **vagrant-proxyconf** (2.0.10, global)
> <font color='green'>用于设置虚拟机代理</font>
> - **vagrant-share** (2.0.0, global)
> <font color='green'>通过插件可以分享你的虚拟机环境给朋友</font>
> - **vagrant-mutate** (1.2.0, global)
> <font color='green'>使用插件可以转换你的 box ，比如从 virtualbox 到 kvm</font>

**☀️ 安装方式：**
```bash
vagrant plugin install vagrant-parallels
vagrant plugin install vagrant-proxyconf
vagrant plugin install vagrant-reload
vagrant plugin install vagrant-share
vagrant plugin install vagrant-mutate
vagrant plugin list
```

❤️  **顺便给大家分享一个解决 Vgrant 插件安装慢的方法：** ❤️

```bash
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
gem sources -l
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/0d9280027c9f414cb1ba562cb4e5b579.png)
没错，就是替换 RubyGems 的源，确保只有这一个源，如果失灵，就换回去，😌 慢就慢点，总比不能用强。

# ☁️ <font color='orange'>高阶玩法：Vagrant 配套工具</font> ☁️

> <font color='orange'>① ngrok</font>
> - 
> <font color='orage'>② packer</font>
> -

<font color='orange'>**① ngrok：**</font>

**`ngrok` 是什么？别问(`へ´)ノ，问就告诉你：用来做内网映射的😄。**

接下来教你怎么用 ngrok ，将你的虚拟机环境分享给全世界各地的 People 使用！！！

**第一步**：安装ngrok，官网下载安装包，解压是个可执行文件，直接双击使用 o(￣▽￣)ｄ。

> 官网下载地址：https://dashboard.ngrok.com/get-started/setup

**第二步**：需要注册一个 ngrok 用户，获取授权码，来授权本地机器。
```bash
ngrok authtoken 你的授权码
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/eac315d0ec1743c28dfc8077215a22b7.png)
**第三步**：测试 ngrok 是否可用
![在这里插入图片描述](https://img-blog.csdnimg.cn/1ff5ebc7114641c5bfb041f6fc8d28ac.png)
```bash
ngrok http 80
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/b82ead3314484bbeacb119baa6d5fda2.png)
打开你的浏览器访问 http://127.0.0.1:4040，如果能打开，说明 👌🏻 啦，恭喜你 🎉 ！

**第四步**：使用 **vagrant-share** 插件，分享你的虚拟机：

这里有个小前提：需要环境变量中配置 `ngrok` ，否则 vagrant 无法获取到改命令：
```bash
export VG_HOME='/opt/vagrant'
export PATH=$PATH:$VG_HOME/bin
```
注意：我是将解压的 `ngrok` 可执行工具放入 `/opt/vagrant/bin` 目录下，参考如上配置即可。

- 使用 ssh 方式分享你的主机：

**服务端开启共享：**

注意：过程中需要输入两次密码，用于提供给客户端来进行登录。

```bash
vagrant share --ssh
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c399f3d348394570a414dccfbff4d702.png)
如果服务端执行之后，显示上图这样，说明已经共享成功，客户端可以进行访问。

**客户端连接：**

模拟下其他朋友连接我的虚拟机环境：

```bash
vagrant connect --ssh orange_amigo:george_botanic@forward
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/6049bef02c1f4623ae934185a2bde5a5.png)
这边输入密码后，已经连接进虚拟机环境了，我这是一套 Oracle RAC 环境的其中一个节点：
![在这里插入图片描述](https://img-blog.csdnimg.cn/cf1d88ee3b484b40a488c81a07aa4f3d.png)
这里的 `orange_amigo:george_botanic@forward` 是自动生成的，建议根据实际情况填写。

<font color='orange'>**② packer：**</font>

**`packer` 是什么？别问(`へ´)ノ，问就告诉你：用来定制你的专属 Box 的😄。**

接下来教你怎么用 packer ，打造为你量身定制的虚拟机环境！！！

**第一步**：安装 packer ，官网下载安装包，解压是个可执行文件，直接双击使用 o(￣▽￣)ｄ。

> 官网下载地址：https://www.packer.io/downloads

![在这里插入图片描述](https://img-blog.csdnimg.cn/db62e74d93da42fcaa09af2421db1dbd.png)
这里有个小前提：需要环境变量中配置 `packer` ，否则 vagrant 无法获取到改命令：
```bash
export VG_HOME='/opt/vagrant'
export PATH=$PATH:$VG_HOME/bin
```
注意：我是将解压的 `packer` 可执行工具放入 `/opt/vagrant/bin` 目录下，参考如上配置即可。
![在这里插入图片描述](https://img-blog.csdnimg.cn/2e6d0295990d4f209e1585ce1d9236f5.png)
**第二步：** 下载一个centos或者windows镜像，也就是安装包。本次以centos为例吧：

>下载地址：https://mirrors.163.com/centos/7.9.2009/isos/x86_64/CentOS-7-x86_64-Minimal-2009.iso

![在这里插入图片描述](https://img-blog.csdnimg.cn/40050193015841fda9c1cad7ef5dae35.png)
这里我已经成功下载完成，需要进行一下 checksum 校验一下：

```bash
shasum -a 256 /Users/lpc/Downloads/CentOS-7-x86_64-Minimal-2009.iso
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/4b79830885a54c0ebb6e4c833eae2329.png)
**顺便记录一下校验码：`07b94e6b1a0b0260b94c83d6bb76b26bf7a310dc78d7a9c7432809fb9bc6194a`**

**第三步：** 这里我们借用 `bento` 前辈写好的模板进行打包，首先通过 `git clone` 项目：

>Github 地址：https://github.com/chef/bento

```bash
git clone https://hub.fastgit.org/chef/bento.git
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2797e0c57041461094d196fc9aa20f8b.png)
**第四步：** 打开刚 git 的项目，自定义 packer json 文件：
![在这里插入图片描述](https://img-blog.csdnimg.cn/f9f45675b99143eba173b8e9c4df7880.png)
根据 `bento` 大神的 centos-7.9-x86_64.json ，我们自定义一个新的 json 文件：

```bash
{
  "builders": [
    {
      "boot_command": [
        "<up><wait><tab> text ks=http://{{ .HTTPIP }}:{{ .HTTPPort }}/{{user `ks_path`}}<enter><wait>"
      ],
      "boot_wait": "5s",
      "cpus": "{{ user `cpus` }}",
      "disk_size": "{{user `disk_size`}}",
      "guest_additions_path": "VBoxGuestAdditions_{{.Version}}.iso",
      "guest_additions_url": "{{ user `guest_additions_url` }}",
      "guest_os_type": "RedHat_64",
      "hard_drive_interface": "sata",
      "headless": "{{ user `headless` }}",
      "http_directory": "{{user `http_directory`}}",
      "iso_checksum": "{{user `iso_checksum`}}",
      "iso_url": "{{user `mirror`}}/{{user `mirror_directory`}}/{{user `iso_name`}}",
      "memory": "{{ user `memory` }}",
      "output_directory": "{{ user `build_directory` }}/packer-{{user `template`}}-virtualbox",
      "shutdown_command": "echo 'vagrant' | sudo -S /sbin/halt -h -p",
      "ssh_password": "vagrant",
      "ssh_port": 22,
      "ssh_timeout": "10000s",
      "ssh_username": "vagrant",
      "type": "virtualbox-iso",
      "virtualbox_version_file": ".vbox_version",
      "vm_name": "{{ user `template` }}"
    },
    {
      "boot_command": [
        "<up><wait><tab> text ks=http://{{ .HTTPIP }}:{{ .HTTPPort }}/{{user `ks_path`}}<enter><wait>"
      ],
      "boot_wait": "5s",
      "cpus": "{{ user `cpus` }}",
      "disk_size": "{{user `disk_size`}}",
      "guest_os_type": "centos",
      "http_directory": "{{user `http_directory`}}",
      "iso_checksum": "{{user `iso_checksum`}}",
      "iso_url": "{{user `mirror`}}/{{user `mirror_directory`}}/{{user `iso_name`}}",
      "memory": "{{ user `memory` }}",
      "output_directory": "{{ user `build_directory` }}/packer-{{user `template`}}-parallels",
      "parallels_tools_flavor": "lin",
      "prlctl_version_file": ".prlctl_version",
      "shutdown_command": "echo 'vagrant' | sudo -S /sbin/halt -h -p",
      "ssh_password": "vagrant",
      "ssh_port": 22,
      "ssh_timeout": "10000s",
      "ssh_username": "vagrant",
      "type": "parallels-iso",
      "vm_name": "{{ user `template` }}"
    }
  ],
  "post-processors": [
    {
      "output": "{{ user `build_directory` }}/{{user `box_basename`}}.{{.Provider}}.box",
      "type": "vagrant"
    }
  ],
  "provisioners": [
    {
      "environment_vars": [
        "HOME_DIR=/home/vagrant",
        "http_proxy={{user `http_proxy`}}",
        "https_proxy={{user `https_proxy`}}",
        "no_proxy={{user `no_proxy`}}"
      ],
      "execute_command": "echo 'vagrant' | {{.Vars}} sudo -S -E sh -eux '{{.Path}}'",
      "expect_disconnect": true,
      "scripts": [
        "{{template_dir}}/scripts/update.sh",
        "{{template_dir}}/../_common/motd.sh",
        "{{template_dir}}/../_common/sshd.sh",
        "{{template_dir}}/scripts/networking.sh",
        "{{template_dir}}/../_common/vagrant.sh",
        "{{template_dir}}/../_common/virtualbox.sh",
        "{{template_dir}}/../_common/vmware.sh",
        "{{template_dir}}/../_common/parallels.sh",
        "{{template_dir}}/scripts/cleanup.sh",
        "{{template_dir}}/../_common/minimize.sh"
      ],
      "type": "shell"
    }
  ],
  "variables": {
    "box_basename": "centos-7.9",
    "build_directory": "../../builds",
    "build_timestamp": "{{isotime \"20060102150405\"}}",
    "cpus": "2",
    "disk_size": "65536",
    "git_revision": "__unknown_git_revision__",
    "guest_additions_url": "",
    "headless": "",
    "http_directory": "{{template_dir}}/http",
    "http_proxy": "{{env `http_proxy`}}",
    "https_proxy": "{{env `https_proxy`}}",
    "iso_checksum": "07b94e6b1a0b0260b94c83d6bb76b26bf7a310dc78d7a9c7432809fb9bc6194a",
    "iso_name": "CentOS-7-x86_64-Minimal-2009.iso",
    "ks_path": "7/ks.cfg",
    "memory": "1024",
    "mirror": "",
    "mirror_directory": "Users/lpc/Downloads",
    "name": "centos-7.9",
    "no_proxy": "{{env `no_proxy`}}",
    "template": "centos-7.9-x86_64",
    "version": "TIMESTAMP"
  }
}
```
修改内容如上，读者可根据实际环境填写。
![在这里插入图片描述](https://img-blog.csdnimg.cn/e5189c98748149f482ba39db86af2eee.png)
**<font color='red'>需要注意：读者主要修改的部分为：</font>**
**1、iso的存放位置：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/7e90356edaf44d7b9678c9b742ef91f1.png)
**2、iso 的 checksum 结果和 iso 名称：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/be4bf41f5b714ef78f7d7b38b0affaf9.png)
修改以上两部分即可。

**第四步：** 启动 packer 进行打包：

```bash
cd /Volumes/DBA/vagrant/packer/packer_templates/centos
packer build -only=virtualbox-iso centos-7.9-x86_64.json
```
这里的 `-only=virtualbox-iso` 是指只创建 virtualbox 的 box 文件。
![在这里插入图片描述](https://img-blog.csdnimg.cn/65b99ffcb92f4bc9a1c130645de2117f.png)
<font color='orgren'>执行过程中，我们什么都不需要干，只需要安静的做个美男子，等着就完事儿了。😄</font>

**🎥 小剧场：**

闲着也是闲着，研究了一下大神的脚本，发现有一个脚本挺有意思的，拿出来分享一下：
![在这里插入图片描述](https://img-blog.csdnimg.cn/8d105ca49589434a8282447f4fa8620f.png)
⭐️ 就是这个脚本，干什么的呢❓ 
>简单来说：当我们安装完一个虚拟机系统之后，想要进行打包时，系统内一些多余的空间或者垃圾会占空间，导致打包出来的 box 过大，使用此脚本会清理这些垃圾和多余空间，使得打包出来的 box 非常的小，基本跟初始镜像的大小一致。❤️  可以说是灰常 Nice 的小玩意儿了！！！爱了爱了，收藏一波。

言归正传，经过一段时间的等待后，我们的 `packer` 也跑完了：
![在这里插入图片描述](https://img-blog.csdnimg.cn/692f9c75065e4c15b35b2c03896133d2.png)
😰 报错了，说是访问 GitHub 失败了，阿西吧，外国大神写的脚本，国内 GitHub 难受啊，想办法解决下：

**在 `networking.sh` 脚本中加入如下内容：**
```bash
# modify by luciferliu for github raw.githubusercontent.com:443; Connection refused
echo '185.199.108.133 raw.githubusercontent.com' >>/etc/hosts;
echo '185.199.109.133 raw.githubusercontent.com' >>/etc/hosts;
echo '185.199.110.133 raw.githubusercontent.com' >>/etc/hosts;
echo '185.199.111.133 raw.githubusercontent.com' >>/etc/hosts;

ping raw.githubusercontent.com
```
**测试一下是否可以：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/fecef2751b89493791eb6efac1fd4d68.png)
👌🏻，没有毛病啊，老铁，哈哈，忘记 linux ping不会自动停止，无限 ping 了。😓  重来吧，如果能重来，我要选一下代码！😄 ，修改为：
```bash
ping raw.githubusercontent.com -c 10
```
我们只 `ping` 10次哈，意思一下就行！
![在这里插入图片描述](https://img-blog.csdnimg.cn/50a558e2a658461b9a47dfba0078efd2.png)
**<font color='oragen'>再一次，事不过三啊，给爷冲！！！</font>**
![在这里插入图片描述](https://img-blog.csdnimg.cn/2ffe692b6cf848cd90797a9fe0bf0870.png)
**🎉 皇天不负有心人，成了 Nice！👌🏻**
![在这里插入图片描述](https://img-blog.csdnimg.cn/2310ed7144b14b3ea79ae76a8284f0ab.png)
打包完之后的 box 才 300 多M，来测试一下能不能用吧：
```bash
vagrant box add /Volumes/DBA/vagrant/packer/bento/builds/centos-7.9.virtualbox.box --name=centos79
vagrant init centos79
vagrant up --provider=virtualbox
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c05901cb5b784191b18e9b984a3e95d2.png)
连接使用：
```bash
vagrant ssh
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3a2b899bfad347e0b8765783e2570710.png)
使用没有毛病，很好很强大，到这 `packer` 也就讲完啦。😄

>关于高阶玩法，我就只讲了两个，一个是 `gnrok` 和 vagrant-share 插件组合使用，一个是 `packer` 打包 box。后续更多的玩法，放到后面慢慢讲，我也在慢慢的研究，慢慢玩，大家有兴趣可以 **<font color='red'>关注博主</font>** 一波。😄

# 💦	<font color='blvy'>超神玩法：Vagrant 卸载</font> 💦
**<font color='oragen'>哈哈，都说一切事务的终点就是回到原点，那不就是卸载嘛！😄，为了给大家写 blog，我前前后后卸载安装了好多回了，也算是颇有心得。</font>**

删除 Vagrant 程序将从您的机器中删除 vagrant 二进制文件和所有依赖项。 卸载程序后，您仍然可以使用标准方法重新安装。 卸载 Vagrant 不会删除用户数据。 此部分下面的部分提供了有关如何从系统中删除该目录的更详细说明。
## 1️⃣ Windows系统
使用控制面板的添加/删除程序部分卸载，这就不需要我教了吧，ε=(´ο｀*))) 实现不行，`geek uninstaller` 走起。

## 2️⃣ Linux系统
```bash
rm -rf /opt/vagrant
rm -f /usr/bin/vagrant
rm -rf ~/.vagrant.d
```
## 3️⃣ macOS系统
```bash
sudo rm -rf /opt/vagrant /usr/local/bin/vagrant
sudo pkgutil --forget com.vagrant.vagrant
rm -rf ~/.vagrant.d
```
在所有平台上，此目录位于您的主目录的根目录中，并命名为 `vagrant.d`。 只需删除 **~/.vagrant.d** 目录即可删除用户数据。 如果在 Windows 上，此目录位于 C:\Users\YourUsername\.vagrant.d，其中 YourUsername 是本地用户的用户名。

# ⏰ 写在最后
Vagrant 我也刚接触不久，如果有玩的厉害的大佬，可以加我好友，一起交流下心得，顺便也指点指点。感觉 Vagrant 的可玩度还是挺高的，感兴趣的确实可以入手一哈。😄

**☀️ <font color='oragen'>最后的最后，分享一下自己的其他文章：</font>**

> - [Oracle一键安装脚本](https://blog.csdn.net/m0_50546016/category_11127389.html)
> - [ MacOS  Vagrant 使用 Parallels Desktop 安装 Oracle 数据库
> ](https://luciferliu.blog.csdn.net/article/details/119078289)
> - [精心整理Linux各版本安装包（包括Centos、Redhat、Oracle
> Linux）☀️附下载链接☀️](https://luciferliu.blog.csdn.net/article/details/118729274)
> - [花钱都买不到的绝版Oracle数据库最全版本安装包（精心整理）附下载链接，建议收藏](https://luciferliu.blog.csdn.net/article/details/118652724)

**<font color='clvy'>希望大家多多支持，可以添加博主好友 ！👌🏻</font>**

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/4d953cabc0d8bf14e348b72aab3be905.gif)


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