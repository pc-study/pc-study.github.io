---
title: Oracle 11GR2/12C/19C 安装所需依赖包汇总
date: 2024-03-26 15:24:42
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1772505591600189440
---

# RHEL6/OEL6/CENTOS6
## 11GR2
```bash
binutils
compat-libcap1
compat-libstdc++
gcc
gcc-c++
glibc
glibc-devel
ksh
libaio
libaio-devel
libgcc
libstdc++
libstdc++-devel
make
sysstat
```
## 12CR2
```bash
bc
binutils
compat-libcap1
compat-libstdc++
e2fsprogs
e2fsprogs-libs
glibc
glibc-devel
ksh
libgcc
libstdc++
libstdc++-devel
libaio
libaio-devel
libXtst
libX11
libXau
libxcb
libXi
libXrender
libXrender-devel
make
net-tools
nfs-utils
sysstat
smartmontools
```


# RHEL7/OEL7/CENTOS7
## 11GR2
```bash
binutils
compat-libcap1
compat-libstdc++
gcc
gcc-c++
glibc
glibc-devel
ksh
libaio
libaio-devel
libgcc
libstdc++
libstdc++-devel
libXi
libXtst
make
sysstat
```

## 12CR2
```bash
bc
binutils
compat-libcap1
compat-libstdc++
glibc
glibc-devel
ksh
libaio
libaio-devel
libX11
libXau
libXi
libXtst
libXrender
libXrender-devel
libgcc
libstdc++
libstdc++-devel
libxcb
make
nfs-utils
net-tools
smartmontools
sysstat
```

## 19C
```bash
bc
binutils
compat-libcap1
compat-libstdc++-33
elfutils-libelf
elfutils-libelf-devel
fontconfig-devel
glibc
glibc-devel
ksh
libaio
libaio-devel
libXrender
libXrender-devel
libX11
libXau
libXi
libXtst
libgcc
libstdc++
libstdc++-devel
libxcb
make
policycoreutils
policycoreutils-python
smartmontools
sysstat

## 可选
ipmiutil
net-tools
libvirt-libs
nfs-utils
python
python-configshell
python-rtslib
python-six
targetcli
```

# RHEL8/OEL8/CENTOS8
## 12CR2
```bash
bc
binutils
compat-openssl10
elfutils-libelf
glibc
glibc-devel
ksh
libaio
libXrender
libX11
libXau
libXi
libXtst
libgcc
libnsl
libstdc++
libxcb
libibverbs
make
policycoreutils
policycoreutils-python-utils
smartmontools
sysstat

## 可选
ipmiutil
libnsl2
libnsl2-devel
net-tools
nfs-utils
```

## 19C
```bash
bc
binutils
elfutils-libelf
elfutils-libelf-devel
fontconfig-devel
glibc
glibc-devel
ksh
libaio
libaio-devel
libXrender
libX11
libXau
libXi
libXtst
libgcc
libnsl
librdmacm
libstdc++
libstdc++-devel
libxcb
libibverbs
make
policycoreutils
policycoreutils-python-utils
smartmontools
sysstat

## 可选
ipmiutil
libnsl2
libnsl2-devel
libvirt-libs
net-tools
nfs-utils
```

# REHE9/CENTOS9/OEL9
## 19C
```bash
bc
binutils
compat-openssl11
elfutils-libelf
fontconfig
glibc
glibc-devel
ksh
libaio
libasan
liblsan
libX11
libXau
libXi
libXrender
libXtst
libxcrypt-compat
libgcc
libibverbs
libnsl
librdmacm
libstdc++
libxcb
libvirt-libs
make
policycoreutils
policycoreutils-python-utils
smartmontools
sysstat

## 可选
glibc-headers
ipmiutil
libnsl2
libnsl2-devel
net-tools
nfs-utils
```

# SUSE12
## 11GR2
```bash
binutils
gcc
gcc48
glibc
glibc-devel
libaio1
libaio-devel
libcap1
libstdc++48-devel
libstdc++6
libstdc++-devel
libgcc_s1
mksh
make
sysstat
xorg-x11-driver-video
xorg-x11-server
xorg-x11-essentials
xorg-x11-Xvnc
xorg-x11-fonts-core
xorg-x11
xorg-x11-server-extra
xorg-x11-libs
xorg-x11-fonts
```

## 12CR2
```bash
bc
binutils
gcc-c++
gcc48-c++
gcc
gcc-info
gcc-locale
gcc48
gcc48-info
gcc48-locale
glibc
glibc-devel
libaio-devel
libaio1
libgfortran3
libX11-6
libXau6
libXtst6
libcap-ng-utils
libcap-ng0
libcap-progs
libcap1
libcap2
libgcc_s1
libpcap1
libstdc++6
libstdc++33
make
mksh
net-tools
nfs-kernel-server
smartmontools
sysstat
xorg-x11-libs
```

## 19C
```bash
bc
binutils
glibc
glibc-devel
libX11
libXau6
libXtst6
libcap-ng-utils
libcap-ng0
libcap-progs
libcap1
libcap2
libelf-devel
libgcc_s1
libjpeg-turbo
libjpeg62
libjpeg62-turbo
libpcap1
libpcre1
libpcre16-0
libpng16-16
libstdc++6
libtiff5
libaio-devel
libaio1
libXrender1
make
mksh
pixz
rdma-core
rdma-core-devel
smartmontools
sysstat
xorg-x11-libs
xz

## 可选
net-tools
nfs-kernel-server
```


# SUSE15
## 12CR2
```bash
binutils
gcc
glibc
glibc-devel
libaio-devel
libaio1
libcap1
libstdc++6-devel
libstdc++6
libgcc_s1
make
mksh
sysstat
xorg-x11-fonts-core
xorg-x11-server-extra
xorg-x11-Xvnc
xorg-x11-server
xorg-x11-libs
xorg-x11-essentials
xorg-x11-fonts
xorg-x11
xorg-x11-driver-video
```

## 19C
```bash
bc
binutils
glibc
glibc-devel
insserv-compat
libaio-devel
libaio1
libX11-6
libXau6
libXext-devel
libXext6
libXi-devel
libXi6
libXrender-devel
libXrender1
libXtst6
libcap-ng-utils
libcap-ng0
libcap-progs
libcap1
libcap2
libelf1
libgcc_s1
libjpeg8
libpcap1
libpcre1
libpcre16-0
libpng16-16
libstdc++6
libtiff5
libgfortran4
mksh
make
pixz
rdma-core
rdma-core-devel
smartmontools
sysstat
xorg-x11-libs
xz

## 可选
net-tools
nfs-kernel-server
```

# NeoKylin6
## 11GR2
```bash
binutils
compat-libcap1
compat-libstdc++
gcc
gcc-c++
glibc
glibc-devel
ksh 
libgcc
libstdc++
libstdc++-devel
libaio
libaio-devel
make
sysstat
```

# NeoKylin7
## 11GR2
```bash
binutils
compat-libcap1
gcc
gcc-c++
glibc
glibc-devel
ksh
libai
libaio-devel
libgcc
libstdc++
libstdc++-devel
libXi
libXtst
make
sysstat
```

## 12CR2
```bash
binutils
compat-libcap1
gcc
gcc-c++
glibc
glibc-devel
ksh
libaio
libaio-devel
libgcc
libstdc++
libstdc++-devel
libXi
libXtst
make
sysstat
```