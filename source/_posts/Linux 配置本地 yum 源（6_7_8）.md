---
title: Linux 配置本地 yum 源（6/7/8）
date: 2021-09-18 21:24:57
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/111623
---

## 一、挂载 ISO 安装镜像
查看当前主机系统版本：
```bash
cat /etc/system-release
```
**下载对应的 linux iso安装镜像：**

**<font color='red'>⭐️ 点击下载  👉  [超全 Linux 8/7/6/5 安装包合集下载地址](https://mp.weixin.qq.com/s/PFKkftgaTWpJKCnhI3uxZw)</font>** ⭐️

**<font color='Persimmon'>❤️ 也可以扫码关注公众号，菜单栏自取！❤️</font>**
![](https://img-blog.csdnimg.cn/20210702105616339.jpg)
**挂载分为两种方式：**

1、上传iso安装镜像到服务器主机指定目录下，以 /soft 为例
```bash
mount -o loop /soft/iso镜像包名称 /mnt
```
![](https://img-blog.csdnimg.cn/57ab450ec4aa416783c050937bb39616.png)
2、直接虚拟机或者物理主机挂载iso安装镜像
```bash
mount /dev/cdrom /mnt
```
![](https://img-blog.csdnimg.cn/7e81eb7d2f3b4d8da4ca85aa5b241a94.png)
3、挂载完之后，通过 df -Th /mnt 查看挂载情况
```bash
df -Th /mnt
```
![](https://img-blog.csdnimg.cn/eb1c224f50aa4fde813f1ff2ea2c3f12.png)
以上两种方式都可以实现挂载，看情况使用即可。

## 二、配置 yum 文件
yum 文件位于 /etc/yum.repos.d/ 目录下，执行以下命令即可！

**📢 注意：提前备份该目录下文件：**
```bash
mkdir /etc/yum.repos.d/bak
mv /etc/yum.repos.d/* /etc/yum.repos.d/bak
```
避免多个yum 文件冲突，识别错误！
### Linux 6 & 7
```bash
{
  echo "[local]"
  echo "name=local"
  echo "baseurl=file:///mnt"
  echo "enabled=1"
  echo "gpgcheck=0"
} >/etc/yum.repos.d/local.repo
```
![](https://img-blog.csdnimg.cn/cbb569a9aef146e68cb6ca1250ce4b24.png)
### Linux 8
```bash
 {
  echo "[BaseOS]"
  echo "name=BaseOS"
  echo "baseurl=file:///mnt/BaseOS"
  echo "enabled=1"
  echo "gpgcheck=0"
  echo "[AppStream]"
  echo "name=AppStream"
  echo "baseurl=file:///mnt/AppStream"
  echo "enabled=1"
  echo "gpgcheck=0"
} >/etc/yum.repos.d/local.repo
```
执行以上命令，自动创建一个 local.repo 文件，无需改动！

## 验证 yum 源可用性
执行以上两个步骤后，yum 源已经配置完成，接下来可以验证以下可用性！
```bash
yum clean all
yum makecache
yum repolist all
yum install -y tree
```
![](https://img-blog.csdnimg.cn/93ff1f27c71440c4a78b490a88192362.png)
![](https://img-blog.csdnimg.cn/5c5844f51aff4857a06cf5f6b051d33d.png)
如果成功安装 tree，说明本地 yum 源配置成功，如果没有成功，请按照上述步骤进行再次检查！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️