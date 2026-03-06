---
title: Linux 磁盘目录扩容记录一则
date: 2025-09-10 10:37:48
tags: [墨力计划,数据库实操,linux]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1965600628248424448
---

# 前言
今天 RMAN 备份恢复的时候发现磁盘空间不足了：
```bash
ORA-19502: write error on file "/oradata/rpt/tbs_ods04.dbf", block number 2921152 (block size=8192)
ORA-27072: File I/O error
Linux-x86_64 Error: 28: No space left on device
Additional information: 4
Additional information: 2921152
Additional information: -1
```
看一下磁盘空间：
```bash
[oracle@lucifer:/home/oracle]$ df -h 
Filesystem               Size  Used Avail Use% Mounted on
devtmpfs                  16G     0   16G   0% /dev
tmpfs                     32G     0   32G   0% /dev/shm
tmpfs                     16G   25M   16G   1% /run
tmpfs                     16G     0   16G   0% /sys/fs/cgroup
/dev/mapper/centos-root 1008G  982G   26G  98% /
/dev/sda2               1014M  142M  873M  14% /boot
/dev/sda1                200M   12M  189M   6% /boot/efi
tmpfs                    3.2G     0  3.2G   0% /run/user/0
```
根目录空间不够用了，需要扩容，这是一台虚拟机，找系统工程师加了 1T 空间，手动在系统上进行扩容，记录一下操作过程。

# 根目录扩容
虚拟化加完空间后，需要重启主机生效：
```bash
## reboot 之前
[oracle@lucifer:/home/oracle]$ lsblk
NAME            MAJ:MIN RM    SIZE RO TYPE MOUNTPOINT
sda               8:0    0      1T  0 disk
├─sda1            8:1    0    200M  0 part /boot/efi
├─sda2            8:2    0      1G  0 part /boot
└─sda3            8:3    0 1022.8G  0 part
  ├─centos-root 253:0    0 1007.1G  0 lvm  /
  └─centos-swap 253:1    0   15.8G  0 lvm  [SWAP]
sr0              11:0    1    1.2M  0 rom

## reboot 之后
[root@lucifer:/root]# lsblk
NAME            MAJ:MIN RM    SIZE RO TYPE MOUNTPOINT
sda               8:0    0      2T  0 disk
├─sda1            8:1    0    200M  0 part /boot/efi
├─sda2            8:2    0      1G  0 part /boot
└─sda3            8:3    0 1022.8G  0 part
  ├─centos-root 253:0    0 1007.1G  0 lvm  /
  └─centos-swap 253:1    0   15.8G  0 lvm  [SWAP]
sr0              11:0    1    1.2M  0 rom
```
可以看到磁盘空间已经加到 /dev/sda 上，现在是 2T，但是需要扩容到根目录上，还需要操作下，本文使用 parted 命令进行扩容。

扩展GPT分区：
```bash
## 修复 GPT 备份表位置，扩展分区 3 到磁盘末尾
[root@lucifer:/root]# parted /dev/sda resizepart 3 100%
Error: The backup GPT table is not at the end of the disk, as it should be.  This might mean that another operating system believes the disk is smaller.  Fix, by moving the backup to the end (and
removing the old backup)?
parted: invalid token: 3
Fix/Ignore/Cancel? Fix
Warning: Not all of the space available to /dev/sda appears to be used, you can fix the GPT to use all of the space (an extra 2147483648 blocks) or continue with the current setting?
Fix/Ignore? Fix
Partition number? 3
End?  [1100GB]? 100%
Information: You may need to update /etc/fstab.
```
刷新分区表：
```bash
## 通知内核分区表已变更
[root@lucifer:/root]# partprobe /dev/sda

[root@lucifer:/root]# lsblk
NAME            MAJ:MIN RM    SIZE RO TYPE MOUNTPOINT
sda               8:0    0      2T  0 disk
├─sda1            8:1    0    200M  0 part /boot/efi
├─sda2            8:2    0      1G  0 part /boot
└─sda3            8:3    0      2T  0 part
  ├─centos-root 253:0    0 1007.1G  0 lvm  /
  └─centos-swap 253:1    0   15.8G  0 lvm  [SWAP]
sr0              11:0    1    1.2M  0 rom
```
扩展物理卷：
```bash
## 让 LVM 识别新的分区大小
[root@lucifer:/root]# pvresize /dev/sda3
  Physical volume "/dev/sda3" changed
  1 physical volume(s) resized or updated / 0 physical volume(s) not resized
```
扩展逻辑卷：
```bash
## 使用所有可用空间扩展根分区逻辑卷
[root@lucifer:/root]#  lvextend -l +100%FREE /dev/mapper/centos-root
  Size of logical volume centos/root changed from 1007.05 GiB (257805 extents) to 1.98 TiB (519949 extents).
  Logical volume centos/root successfully resized.
```
扩展文件系统：
```bash
## 在线扩展XFS文件系统
[root@lucifer:/root]# xfs_growfs /
meta-data=/dev/mapper/centos-root isize=512    agcount=81, agsize=3276800 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=263992320, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=6400, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 263992320 to 532427776
```
验证结果：
```bash
[root@lucifer:/root]# df -h
Filesystem               Size  Used Avail Use% Mounted on
devtmpfs                  16G     0   16G   0% /dev
tmpfs                     32G     0   32G   0% /dev/shm
tmpfs                     16G  8.4M   16G   1% /run
tmpfs                     16G     0   16G   0% /sys/fs/cgroup
/dev/mapper/centos-root  2.0T  711G  1.3T  35% /
/dev/sda2               1014M  142M  873M  14% /boot
/dev/sda1                200M   12M  189M   6% /boot/efi
tmpfs                    3.2G     0  3.2G   0% /run/user/0

[root@lucifer:/root]# lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda               8:0    0    2T  0 disk
├─sda1            8:1    0  200M  0 part /boot/efi
├─sda2            8:2    0    1G  0 part /boot
└─sda3            8:3    0    2T  0 part
  ├─centos-root 253:0    0    2T  0 lvm  /
  └─centos-swap 253:1    0 15.8G  0 lvm  [SWAP]
sr0              11:0    1  1.2M  0 rom
```
可以看到：根目录从 1008G 成功扩展到 2.0 T。

# 写在最后
本文比较基础简单，仅做记录参考。















