---
title: CentOS LVM 扩容实战：home 分区合并到根分区
date: 2025-08-30 23:57:44
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1961818933510549504
---

# 前言

今天遇到一个常见的问题：服务器的根分区只有 50G，而 `/home` 分区有 957G 却几乎没用。这种默认分区很不合理，所以决定把 `/home` 的空间都给根分区用。

记录一下操作过程，方便以后查阅。

# 操作过程

## 查看当前磁盘情况

查看磁盘空间：

```bash
[root@lucifer ~]# df -h
Filesystem               Size  Used Avail Use% Mounted on
/dev/mapper/centos-root   50G  1.8G   49G   4% /
/dev/mapper/centos-home  957G   33M  957G   1% /home
```

根分区 50G，home 分区 957G，很多软件都不建议安装到 /home 目录下，所以不建议把空间都划分到 home 分区下。

```bash
[root@lucifer ~]# lsblk
NAME            MAJ:MIN RM    SIZE RO TYPE MOUNTPOINT
sda               8:0    0      1T  0 disk
├─sda1            8:1    0    200M  0 part /boot/efi
├─sda2            8:2    0      1G  0 part /boot
└─sda3            8:3    0 1022.8G  0 part
  ├─centos-root 253:0    0     50G  0 lvm  /
  ├─centos-swap 253:1    0   15.8G  0 lvm  [SWAP]
  └─centos-home 253:2    0    957G  0 lvm  /home
```

## 备份 home 目录

先看看 /home 下面有什么：

```bash
[root@lucifer /]# cd /home/
[root@lucifer home]# ls
lucifer  shell
```

就两个目录，先备份：

```bash
[root@lucifer /]# mkdir -p /root/home_backup
[root@lucifer /]# cp -a /home/* /root/home_backup/
```

## 停止相关服务

停掉可能会用到 /home 的服务：

```bash
[root@lucifer /]# systemctl stop crond
[root@lucifer /]# systemctl stop atd
Failed to stop atd.service: Unit atd.service not loaded.
```

atd 服务没装，无所谓。

## 卸载 home 分区

```bash
[root@lucifer /]# umount -l /home
```

## 删除 home 逻辑卷

```bash
[root@lucifer /]# lvremove /dev/centos/home
Do you really want to remove active logical volume centos/home? [y/n]: y
  Logical volume "home" successfully removed
```

## 扩展根分区

把释放出来的空间全部给根分区：

```bash
[root@lucifer /]# lvextend -l +100%FREE /dev/centos/root
  Size of logical volume centos/root changed from 50.00 GiB (12800 extents) to 1007.05 GiB (257805 extents).
  Logical volume centos/root successfully resized.
```

从 50G 扩展到了 1007G，爽！

## 扩展文件系统

逻辑卷扩展了，文件系统也要跟着扩展：

```bash
[root@lucifer /]# xfs_growfs /dev/centos/root
meta-data=/dev/mapper/centos-root isize=512    agcount=4, agsize=3276800 blks
...
data blocks changed from 13107200 to 263992320
```

## 修改启动配置

编辑/etc/fstab，把/home 那行删掉或注释掉：

```bash
[root@lucifer /]# vi /etc/fstab
[root@lucifer /]# cat /etc/fstab

#
# /etc/fstab
# Created by anaconda on Fri Aug 22 05:57:40 2025
#
# Accessible filesystems, by reference, are maintained under '/dev/disk'
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
#
/dev/mapper/centos-root /                       xfs     defaults        0 0
UUID=29b0e279-9b23-46ed-9271-31726f790177 /boot                   xfs     defaults        0 0
UUID=F141-4160          /boot/efi               vfat    umask=0077,shortname=winnt 0 0
/dev/mapper/centos-swap swap                    swap    defaults        0 0
```

可以看到已经没有 /home 的挂载信息了。

## 恢复数据

测试一下配置有没有问题：

```bash
[root@lucifer /]# mount -a
```

没报错就是没问题。把备份的数据恢复回去：

```bash
[root@lucifer /]# cd /home/
[root@lucifer home]# ll
total 0
[root@lucifer home]# cp -a /root/home_backup/* /home/
[root@lucifer home]# ll
total 0
drwx------. 2 jump jump 83 Aug 26 09:55 jump
drwxr-xr-x. 2 root root 26 Aug 26 09:41 shell
```

数据回来了，权限也都在。

## 验证结果

看看现在的磁盘情况：

```bash
[root@lucifer ~]# lsblk
NAME            MAJ:MIN RM    SIZE RO TYPE MOUNTPOINT
sda               8:0    0      1T  0 disk
├─sda1            8:1    0    200M  0 part /boot/efi
├─sda2            8:2    0      1G  0 part /boot
└─sda3            8:3    0 1022.8G  0 part
  ├─centos-root 253:0    0 1007.1G  0 lvm  /
  └─centos-swap 253:1    0   15.8G  0 lvm  [SWAP]

[root@lucifer ~]# df -h
Filesystem               Size  Used Avail Use% Mounted on
/dev/mapper/centos-root 1008G  1.8G 1006G   1% /
/dev/sda2               1014M  142M  873M  14% /boot
/dev/sda1                200M   12M  189M   6% /boot/efi
```

完美！根分区现在有 1T 空间了。

## 重启验证

最后重启一下，确保系统能正常启动：

```bash
[root@lucifer home]# reboot
```
重启正常，修改成功！

## 总结

整个操作其实挺简单的，主要就是：备份数据 → 卸载分区 → 删除逻辑卷 → 扩展根分区 → 恢复数据 → 重启验证。

全程大概 10 分钟搞定，现在根分区有 1T 空间，再也不用担心空间不够了。最重要的是记得备份数据和修改 fstab，不然重启可能会出问题。