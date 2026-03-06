---
title: 磁盘空间不足怎么办？一个脚本搞定 LVM 扩容
date: 2025-09-08 15:40:53
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1964952465418235904
---

# 前言

在 Linux 系统运维过程中，磁盘空间不足是一个常见且棘手的问题。特别是当系统分区使用率接近 100%时，如何快速、安全地扩容存储空间成为运维人员必须面对的挑战。

本文将详细介绍一个功能强大的 LVM 自动扩容脚本，帮助您快速解决存储空间不足的问题。

# 背景

传统的磁盘扩容操作通常需要执行多个复杂的命令步骤：

1. 创建物理卷（pvcreate）
2. 扩展卷组（vgextend）
3. 扩展逻辑卷（lvextend）
4. 扩展文件系统（resize2fs/xfs_growfs）

这些步骤不仅繁琐，而且容易出错。一旦操作失误，可能导致数据丢失或系统无法启动。因此，开发一个自动化的扩容脚本显得尤为重要。

# 脚本源码

为此特地写了个 lvm 一键扩容脚本，其实还是为了偷懒，脚本源码如下：

```bash
#!/bin/bash

# LVM扩容脚本 - 将新磁盘添加到现有卷组并自动扩容
# 使用方法: ./lvm_extend_disk.sh -n <新磁盘设备> -d <挂载点>
# 示例: ./lvm_extend_disk.sh -n /dev/sdc -d /data

set -e

# 显示帮助信息
show_help() {
    cat << EOF
LVM扩容脚本 - 自动将新磁盘添加到现有卷组并扩容

使用方法:
    $0 -n <新磁盘设备> -d <挂载点> [选项]

参数:
    -n <device>     新磁盘设备 (必需)
    -d <mountpoint> 挂载点目录 (必需)
    -y              跳过确认提示，直接执行
    -h              显示此帮助信息

示例:
    $0 -n /dev/sdc -d /data
    $0 -n /dev/sdd -d /opt -y

EOF
}

# 初始化变量
NEW_DISK=""
MOUNT_POINT=""
AUTO_CONFIRM=0

# 如果没有参数，显示帮助
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

# 解析命令行参数
while getopts "n:d:yh" opt; do
    case $opt in
        n)
            NEW_DISK="$OPTARG"
            ;;
        d)
            MOUNT_POINT="$OPTARG"
            ;;
        y)
            AUTO_CONFIRM=1
            ;;
        h)
            show_help
            exit 0
            ;;
        \?)
            echo "无效选项: -$OPTARG" >&2
            show_help
            exit 1
            ;;
    esac
done

# 检查必需参数
if [ -z "$NEW_DISK" ] || [ -z "$MOUNT_POINT" ]; then
    echo "错误: 缺少必需参数"
    echo ""
    show_help
    exit 1
fi

# 检查设备是否存在
if [ ! -b "$NEW_DISK" ]; then
    echo "错误: 磁盘设备 $NEW_DISK 不存在"
    exit 1
fi

# 检查挂载点是否存在
if [ ! -d "$MOUNT_POINT" ]; then
    echo "错误: 挂载点 $MOUNT_POINT 不存在"
    exit 1
fi

# 自动获取卷组和逻辑卷信息
echo "正在获取挂载点 $MOUNT_POINT 的LVM信息..."

# 从df命令获取设备路径
DEVICE_PATH=$(df "$MOUNT_POINT" | tail -1 | awk '{print $1}')
if [ -z "$DEVICE_PATH" ]; then
    echo "错误: 无法获取挂载点 $MOUNT_POINT 对应的设备"
    exit 1
fi

# 从设备路径解析卷组和逻辑卷名
if [[ "$DEVICE_PATH" =~ ^/dev/mapper/(.+)-(.+)$ ]]; then
    VG_NAME="${BASH_REMATCH[1]}"
    LV_NAME="${BASH_REMATCH[2]}"
elif [[ "$DEVICE_PATH" =~ ^/dev/(.+)/(.+)$ ]]; then
    VG_NAME="${BASH_REMATCH[1]}"
    LV_NAME="${BASH_REMATCH[2]}"
else
    echo "错误: 挂载点 $MOUNT_POINT 不是LVM逻辑卷"
    exit 1
fi

echo "检测到LVM信息:"
echo "  设备路径: $DEVICE_PATH"
echo "  卷组名称: $VG_NAME"
echo "  逻辑卷名: $LV_NAME"

# 检查卷组是否存在
if ! vgdisplay "$VG_NAME" >/dev/null 2>&1; then
    echo "错误: 卷组 $VG_NAME 不存在"
    exit 1
fi

# 检查逻辑卷是否存在
if ! lvdisplay "/dev/$VG_NAME/$LV_NAME" >/dev/null 2>&1; then
    echo "错误: 逻辑卷 $LV_NAME 在卷组 $VG_NAME 中不存在"
    exit 1
fi

echo ""
echo "========================================="
echo "LVM扩容操作信息"
echo "========================================="
echo "新磁盘设备: $NEW_DISK"
echo "目标挂载点: $MOUNT_POINT"
echo "目标卷组: $VG_NAME"
echo "目标逻辑卷: $LV_NAME"
echo "========================================="

# 显示扩容前状态
echo ""
echo "扩容前状态:"
echo "物理卷信息:"
pvs
echo ""
echo "卷组信息:"
vgs
echo ""
echo "逻辑卷信息:"
lvs
echo ""
echo "磁盘使用情况:"
df -h "$MOUNT_POINT"
echo ""

# 询问用户确认
if [ $AUTO_CONFIRM -eq 0 ]; then
    read -p "确认要将 $NEW_DISK 添加到卷组 $VG_NAME 并扩容 $LV_NAME 吗？(y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
else
    echo "自动确认模式，开始执行..."
fi

echo ""
echo "步骤1: 创建物理卷..."
pvcreate "$NEW_DISK"
echo "物理卷 $NEW_DISK 创建成功"

echo ""
echo "步骤2: 扩展卷组..."
vgextend "$VG_NAME" "$NEW_DISK"
echo "卷组 $VG_NAME 扩展成功"

echo ""
echo "步骤3: 扩展逻辑卷..."
lvextend -l +100%FREE "/dev/$VG_NAME/$LV_NAME"
echo "逻辑卷 $LV_NAME 扩展成功"

echo ""
echo "步骤4: 检测文件系统类型并扩展..."
FS_TYPE=$(df -T "$MOUNT_POINT" | tail -1 | awk '{print $2}')
echo "检测到文件系统类型: $FS_TYPE"

case $FS_TYPE in
    ext4|ext3|ext2)
        echo "扩展ext文件系统..."
        resize2fs "/dev/$VG_NAME/$LV_NAME"
        ;;
    xfs)
        echo "扩展xfs文件系统..."
        xfs_growfs "$MOUNT_POINT"
        ;;
    *)
        echo "警告: 不支持的文件系统类型 $FS_TYPE，请手动扩展文件系统"
        ;;
esac

echo ""
echo "========================================="
echo "扩容完成! 最终状态:"
echo "========================================="
echo ""
echo "物理卷信息:"
pvs
echo ""
echo "卷组信息:"
vgs
echo ""
echo "逻辑卷信息:"
lvs
echo ""
echo "磁盘使用情况:"
df -h "$MOUNT_POINT"
echo ""
echo "磁盘布局:"
lsblk
echo ""
echo "========================================="
echo "LVM扩容脚本执行完成"
echo "========================================="
```

# 实战演示

有一台 RHEL 系统，根分区空间严重不足（使用率 97%），需要添加一块 50GB 的新磁盘来扩容根分区。

## 扩容前状态

```bash
[root@localhost ~]# df -h
Filesystem             Size  Used Avail Use% Mounted on
/dev/mapper/rhel-root   50G   49G  2.0G  97% /
devtmpfs               3.9G     0  3.9G   0% /dev
tmpfs                  3.9G     0  3.9G   0% /dev/shm
tmpfs                  3.9G   34M  3.8G   1% /run
tmpfs                  3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/vda1             1014M  143M  872M  15% /boot
/dev/mapper/rhel-home   42G  4.7G   37G  12% /home
tmpfs                  1.6G     0  1.6G   0% /run/user/0
[root@localhost ~]# lsblk
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
fd0             2:0    1    4K  0 disk
sr0            11:0    1 1024M  0 rom
vda           252:0    0  100G  0 disk
├─vda1        252:1    0    1G  0 part /boot
└─vda2        252:2    0   99G  0 part
  ├─rhel-root 253:0    0   50G  0 lvm  /
  ├─rhel-swap 253:1    0  7.9G  0 lvm  [SWAP]
  └─rhel-home 253:2    0 41.1G  0 lvm  /home
vdb           252:16   0   50G  0 disk
[root@localhost ~]# pvs
  PV         VG   Fmt  Attr PSize   PFree
  /dev/vda2  rhel lvm2 a--  <99.00g 4.00m
[root@localhost ~]# vgs
  VG   #PV #LV #SN Attr   VSize   VFree
  rhel   1   3   0 wz--n- <99.00g 4.00m
[root@localhost ~]# lvs
  LV   VG   Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  home rhel -wi-ao---- <41.12g
  root rhel -wi-ao----  50.00g
  swap rhel -wi-ao----  <7.88g
```

## 执行扩容操作

执行脚本一键扩容：

```bash
[root@localhost ~]# vi led.sh
[root@localhost ~]# chmod +x led.sh
[root@localhost ~]# ./led.sh
LVM扩容脚本 - 自动将新磁盘添加到现有卷组并扩容

使用方法:
    ./led.sh -n <新磁盘设备> -d <挂载点> [选项]

参数:
    -n <device>     新磁盘设备 (必需)
    -d <mountpoint> 挂载点目录 (必需)
    -y              跳过确认提示，直接执行
    -h              显示此帮助信息

示例:
    ./led.sh -n /dev/sdc -d /data
    ./led.sh -n /dev/sdd -d /opt -y

[root@localhost ~]# ./led.sh -n /dev/vdb -d /
正在获取挂载点 / 的LVM信息...
检测到LVM信息:
  设备路径: /dev/mapper/rhel-root
  卷组名称: rhel
  逻辑卷名: root

=========================================
LVM扩容操作信息
=========================================
新磁盘设备: /dev/vdb
目标挂载点: /
目标卷组: rhel
目标逻辑卷: root
=========================================

扩容前状态:
物理卷信息:
  PV         VG   Fmt  Attr PSize   PFree
  /dev/vda2  rhel lvm2 a--  <99.00g 4.00m

卷组信息:
  VG   #PV #LV #SN Attr   VSize   VFree
  rhel   1   3   0 wz--n- <99.00g 4.00m

逻辑卷信息:
  LV   VG   Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  home rhel -wi-ao---- <41.12g
  root rhel -wi-ao----  50.00g
  swap rhel -wi-ao----  <7.88g

磁盘使用情况:
Filesystem             Size  Used Avail Use% Mounted on
/dev/mapper/rhel-root   50G   49G  2.0G  97% /

确认要将 /dev/vdb 添加到卷组 rhel 并扩容 root 吗？(y/N): y

步骤1: 创建物理卷...
  Physical volume "/dev/vdb" successfully created.
物理卷 /dev/vdb 创建成功

步骤2: 扩展卷组...
  Volume group "rhel" successfully extended
卷组 rhel 扩展成功

步骤3: 扩展逻辑卷...
  Size of logical volume rhel/root changed from 50.00 GiB (12800 extents) to 100.00 GiB (25600 extents).
  Logical volume rhel/root successfully resized.
逻辑卷 root 扩展成功

步骤4: 检测文件系统类型并扩展...
检测到文件系统类型: xfs
扩展xfs文件系统...
meta-data=/dev/mapper/rhel-root  isize=512    agcount=4, agsize=3276800 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=13107200, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=6400, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 13107200 to 26214400

=========================================
扩容完成! 最终状态:
=========================================

物理卷信息:
  PV         VG   Fmt  Attr PSize   PFree
  /dev/vda2  rhel lvm2 a--  <99.00g    0
  /dev/vdb   rhel lvm2 a--  <50.00g    0

卷组信息:
  VG   #PV #LV #SN Attr   VSize   VFree
  rhel   2   3   0 wz--n- 148.99g    0

逻辑卷信息:
  LV   VG   Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  home rhel -wi-ao---- <41.12g
  root rhel -wi-ao---- 100.00g
  swap rhel -wi-ao----  <7.88g

磁盘使用情况:
Filesystem             Size  Used Avail Use% Mounted on
/dev/mapper/rhel-root  100G   49G   52G  49% /

磁盘布局:
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
fd0             2:0    1    4K  0 disk
sr0            11:0    1 1024M  0 rom
vda           252:0    0  100G  0 disk
├─vda1        252:1    0    1G  0 part /boot
└─vda2        252:2    0   99G  0 part
  ├─rhel-root 253:0    0  100G  0 lvm  /
  ├─rhel-swap 253:1    0  7.9G  0 lvm  [SWAP]
  └─rhel-home 253:2    0 41.1G  0 lvm  /home
vdb           252:16   0   50G  0 disk
└─rhel-root   253:0    0  100G  0 lvm  /

=========================================
LVM扩容脚本执行完成
=========================================
```

## 扩容后检查

扩容后的根目录为 100G：

```bash
[root@localhost ~]# df -h
Filesystem             Size  Used Avail Use% Mounted on
/dev/mapper/rhel-root  100G   49G   52G  49% /
devtmpfs               3.9G     0  3.9G   0% /dev
tmpfs                  3.9G     0  3.9G   0% /dev/shm
tmpfs                  3.9G   34M  3.8G   1% /run
tmpfs                  3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/vda1             1014M  143M  872M  15% /boot
/dev/mapper/rhel-home   42G  4.7G   37G  12% /home
tmpfs                  1.6G     0  1.6G   0% /run/user/0
[root@localhost ~]# lsblk
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
fd0             2:0    1    4K  0 disk
sr0            11:0    1 1024M  0 rom
vda           252:0    0  100G  0 disk
├─vda1        252:1    0    1G  0 part /boot
└─vda2        252:2    0   99G  0 part
  ├─rhel-root 253:0    0  100G  0 lvm  /
  ├─rhel-swap 253:1    0  7.9G  0 lvm  [SWAP]
  └─rhel-home 253:2    0 41.1G  0 lvm  /home
vdb           252:16   0   50G  0 disk
└─rhel-root   253:0    0  100G  0 lvm  /
```

# 写在最后

本文介绍的 LVM 自动扩容脚本具有智能化、安全性高、操作简便的特点，能够有效解决 Linux 系统中磁盘空间不足的问题。脚本通过自动识别 LVM 结构、多重安全检查、智能文件系统扩展等特性，大大简化了传统的手工扩容流程，降低了操作风险。

在实际应用中，建议根据具体环境需求对脚本进行适当定制，并建立完善的测试和备份机制。通过合理使用此脚本，可以显著提升系统运维效率，确保业务系统的稳定运行。
