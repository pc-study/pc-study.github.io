---
title: Linux 配置 multipath 多路径
date: 2021-09-24 10:31:32
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/113028
---

@[TOC](目录)
# 📚 前言
通常 Linux 主机挂载存储盘时，每次重启后对应的 `/dev/sd*` 都会变，而且不好辨识！

这时可以通过 multipath 多路径来绑定磁盘！

# ☀️ 安装 multipath
**需提前配置 yum 源，可参考：[Linux 配置本地 yum 源（6/7/8）
](https://luciferliu.blog.csdn.net/article/details/120196606)**

如果选择最小化安装的 Linux 主机，则需要手动安装 multipath，否则默认为自动安装。
```bash
yum install -y device-mapper-multipath
mpathconf --enable --with_multipathd y
```
执行以上命令后，multipath 已经成功安装并且初始化！

# ⭐️ 配置 multipath
默认将 `sda` 系统盘排除，配置文件内容如下：
```bash
cat <<EOF >/etc/multipath.conf
defaults {
    user_friendly_names yes
}
 
blacklist {
  devnode "^sda"
}
EOF
```
执行以上命令，将绑定除系统安装盘之外所有的盘！

📢 注意：如果需要配置对应的盘的名称，可以通过指定 UUID 和别名的方式：
```bash
cat <<EOF >/etc/multipath.conf
defaults {
    user_friendly_names yes
}
 
blacklist {
  devnode "^sda"
}

multipaths {
  multipath {
  wwid 获取对应磁盘的UUID
  alias 需要自定义的别名
  }
}
EOF
```
**上面👆🏻命令中的 UUID 获取方式可以参考：[Linux 获取磁盘的UUID
](https://luciferliu.blog.csdn.net/article/details/120211454)**

# 🌛 重载 multipath
配置完 multipath 之后，并不会立即生效，需要手动刷新！
```bash
multipath -F
multipath -v2
multipath -ll
```
至此，multipath 即配置完成！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️