---
title: 低版本 Bash declare [-u|-l|-A] 执行报错分析
date: 2024-09-02 14:25:51
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1830484415668039680
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 问题描述
今天有群友在 SUSE11  版本运行 Oracle 一键安装脚本时报错如下：
```bash
./OracleShellInstall: line 152: declare: -l: invalid option
declare: usage: declare [-afFirtx] [-p] [name[=value] ...]
./OracleShellInstall: line 153: declare: -u: invalid option
declare: usage: declare [-afFirtx] [-p] [name[=value] ...]
./OracleShellInstall: line 154: declare: -A: invalid option
declare: usage: declare [-afFirtx] [-p] [name[=value] ...]
```
看提示信息是 `declare` 命令没有 `-u`、`-l` 和 `-A` 选项。

![](https://oss-emcsprod-public.modb.pro/image/editor/20240902-c1e81c9b-0804-4312-947e-b88992bf51f6.png)

因为脚本里定义变量是使用以下方式：
```bash
# 数据库是否开启归档模式
declare -l enable_arch=true
# 仅配置操作系统，默认值为 N，包括配置操作系统以及解压软件安装包
declare -u only_conf_os=N
# 定义一个用于保存 root 用户需要设置 SSH 信任的 IP 地址
declare -a ssh_ips
# 定义用于保存心跳 IP 的关联数组
declare -A rac_priv_ips
```
脚本并未适配 bash-4 以下版本，所以未曾考虑命令不支持的问题。

# 原因分析
在我的 rhel8 主机上查看这 3 个参数的含义：
```bash
Options which set attributes:
      -A        to make NAMEs associative arrays (if supported)
      -l        to convert NAMEs to lower case on assignment
      -u        to convert NAMEs to upper case on assignment
```
查看 [Bash Changelog](https://git.savannah.gnu.org/cgit/bash.git/log/NEWS?showmsg=1) 中 bash 4.0 的相关变更情况 [Imported from ../bash-4.0-rc1.tar.gz.](https://git.savannah.gnu.org/cgit/bash.git/commit/NEWS?id=3185942a5234e26ab13fa02f9c51d340cec514f8)：
```bash
## shell 提供关联数组变量，也就是对 -A 参数的支持
+ii. The shell provides associative array variables, with the appropriate
+    support to create, delete, assign values to, and expand them.
+
# 对 declare 命令新增了 -l 和 -u 命令
+jj. The `declare' builtin now has new -l (convert value to lowercase upon
+    assignment) and -u (convert value to uppercase upon assignment) options.
+    There is an optionally-configurable -c option to capitalize a value at
+    assignment.
```
再看一下每个版本中对于 declare 命令的扩展更新：
```bash
## bash-4.0-rc1
+n.  The -p option to `declare' now displays all variable values and attributes
+    (or function values and attributes if used with -f).

+jj. The `declare' builtin now has new -l (convert value to lowercase upon
+    assignment) and -u (convert value to uppercase upon assignment) options.
+    There is an optionally-configurable -c option to capitalize a value at
+    assignment.

## bash-4.2
+e.  declare/typeset has a new `-g' option, which creates variables in the
+    global scope even when run in a shell function.

## bash-4.4
+f.  The `-p' option to declare and similar builtins will display attributes for
+    named variables even when those variables have not been assigned values
+    (which are technically unset).

+p.  Bash no longer attempts to perform compound assignment if a variable on the
+    rhs of an assignment statement argument to `declare' has the form of a
+    compound assignment (e.g., w='(word)' ; declare foo=$w); compound
+    assignments are accepted if the variable was already declared as an array,
+    but with a warning.
+
+q.  The declare builtin no longer displays array variables using the compound
+    assignment syntax with quotes; that will generate warnings when re-used as
+    input, and isn't necessary.

## bash-5.0
+aa. The `@A' variable transformation now prints a declare command that sets a
+    variable's attributes if the variable has attributes but is unset.
+
+bb. `declare' and `local' now have a -I option that inherits attributes and
+    value from a variable with the same name at a previous scope.


## bash-5.2
+bb. Array references using `@' and `*' that are the value of nameref variables
+    (declare -n ref='v[@]' ; echo $ref) no longer cause the shell to exit if
+    set -u is enabled and the array (v) is unset.

+gg. Since there is no `declare -' equivalent of `local -', make sure to use
+    `local -' in the output of `local -p'.
```
可以看到从 `bash-4.0` 版本开始，declare 命令才支持 `-u`、`-l` 和 `-A` 选项。而 SUSE11 的 bash 版本为 `3.2.57`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240902-f4d1e05c-61db-4991-b8ce-ab18a004ea6a.png)

显然是不支持这三个选项，所以报错是情理之中了。

# 解决方案
解决方法也就很有限了，可以手动执行安装，如果想用脚本则建议使用 SUSE12 安装。当然，为了后面大家遇到问题可以第一时间知道原因，我加了一个判断进行限制提示：
```bash
# 增加 bash 版本限制
bash_version=$(echo "$BASH_VERSION" | cut -d '.' -f1)
if [[ $bash_version ]] && ((bash_version < 4)); then
  printf "\n\E[1;31m%-20s\n\E[0m\n" "本脚本不支持 Bash 版本低于 4 执行安装，当前 Bash 版本为：$bash_version，已退出！"
  exit 1
fi
```
如果 bash 版本低于 4，执行报错：
```bash
SUSE11 # ./OracleShellInstall

本脚本不支持 Bash 版本低于 4 执行安装，当前 Bash 版本为：3，已退出！
```
问题到此结束，记录以作参考。愿此微薄之力，可助君一二。

---
# 往期精彩文章推荐
>[Oracle 数据库启动过程之 nomount 详解](https://mp.weixin.qq.com/s/9NSZQlzcODE5fqmgYECf4w)
[Oracle RAC 修改系统时区避坑指南（深挖篇）](https://mp.weixin.qq.com/s/oKtZgbh5uLO2dyNtaGYp3w)
[Ubuntu 22.04 一键安装 Oracle 11G RAC](https://mp.weixin.qq.com/s/_srbpbXyQHSQow_5U_aUHw)
[使用 dbops 快速部署 MySQL 数据库](https://mp.weixin.qq.com/s/j9H5D1YVz2IketkmCqQKkA)
[Oracle RAC 启动顺序，你真的了解吗？](https://mp.weixin.qq.com/s/8Iab3QpvdIMCCsDycJ-kkA)
[达梦数据库一键安装脚本（免费）](https://mp.weixin.qq.com/s/DvowNh7ncV1OWs_Vpv5SSg)[一篇文章让你彻底掌握 Python](https://mp.weixin.qq.com/s/eH4oe3VfP3QQpqHsH620kQ) 🔥        
[一篇文章让你彻底掌握 Python](https://mp.weixin.qq.com/s/eH4oe3VfP3QQpqHsH620kQ)
[一篇文章让你彻底掌握 Shell](https://mp.weixin.qq.com/s/GmSqHJiBToncvcpFAJUZbw) 🔥      
[Oracle 监控 EMCC 13.5 安装部署超详细教程](https://mp.weixin.qq.com/s/0W-53x2eGIY9uaX_RQrI2g) 🔥    
[Oracle 一键巡检自动生成 Word 报告](https://mp.weixin.qq.com/s/0xFe5m1DQ0ucT2_266hsrA) 🔥      
[Oracle一键安装脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/gv6t97FFyMsd6e4GH1HAwQ) 🔥      
[Oracle一键巡检脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/4zI73auIUhwSRb7qL3UIfw) 🔥      
[全网首发：Oracle 23ai 一键安装脚本](https://mp.weixin.qq.com/s/UL0BSMCAZrOQgCoWpDMGew) 🔥      
[Oracle 19C 最新 RU 补丁 19.24 ，一键安装！](https://mp.weixin.qq.com/s/T7GbpwhnMugzk7PB6hAoJQ) 🔥       
[Oracle Linux 6 一键安装 Oracle 11GR2 RAC](https://mp.weixin.qq.com/s/uicyzHfgS2TwleocXJEIrA)    
[Oracle Linux 7.9 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/dT4tFMYVZ3mh49CI6V3YEA)    
[Oracle Linux 8.9 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/FHXYiZBPn3XpKOM6ZqlU1A)    
[Oracle Linux 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cTuTUE-oaO-tKZ72F2WjAA) 🔥        
[openEuler 20.03 LTS SP4 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/uJwEPOG22fhQcC6cTLfN1Q) 🔥        
[openEuler 22.03 LTS SP4 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/sx1E4GIvIeQXp2vGMmVr2A)    
[RHEL 7.9 一键安装 Oracle 19C 19.23 RAC](https://mp.weixin.qq.com/s/mUHqU5hQ9GdH2bKuClPt5A)    
[Redhat 8.4 一键安装 Oracle 11GR2](https://mp.weixin.qq.com/s/fnuHKotjj_S8_0EfUkWI4Q)    
[RedHat 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cQJ6gP1bM_7m0H5-Dha4TA)    
[龙蜥 Anolis 7.9 一键安装 Oracle 19C 19.23](https://mp.weixin.qq.com/s/bJtBpzyG_NAhU-0vov1WmQ)    
[龙蜥 Anolis OS 8.8 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/_4-anPhn9wThtdAqqHIH5w)    
[SUSE 15 SP5 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/N2J9JxZ7l9elG1L1NV7ynA)    
[统信 UOS V20 1070(a) 一键安装 Oracle 11GR2](https://mp.weixin.qq.com/s/SSmLvx2wDzhzsQY6f5Q5Rg)    
[Ubuntu 22.04 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/0-q9mLR48abGUbZUODj7xw)    
[Ubuntu 14.04 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/Y6fFi3Nth0NA5HGq2LjubQ)    
[银河麒麟 Kylin V10 SP3 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/EVNaKhH53YN885gk_Ik_Xg) 🔥       
[银河麒麟 Kylin V10 SP3 一键安装 Oracle 11GR2 RAC](https://mp.weixin.qq.com/s/IZ_VYoDOxzSLzsQo8aJTIw)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q) 🔥       
[优化 Oracle：最佳实践与开发规范](https://mp.weixin.qq.com/s/DysIcb-p11j56d3YtlqpcQ)    
[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA) 🔥       
[Linux 一键配置时钟同步全攻略](https://mp.weixin.qq.com/s/yvth1vorP3JjUp3g3vPBAQ) 🔥       
[Starwind 配置 ISCSI 共享存储](https://mp.weixin.qq.com/s/xjYZmGcwshbJBICcr0xvBw)    
[SUSE 15 SP3 安装 Oracle 19C RAC 数据库](https://mp.weixin.qq.com/s/JMMzOa6dN6ytAUkcy7I2jQ)    
[达梦 8 数据库安装手册](https://mp.weixin.qq.com/s/KEobA1FAx4Uod3uBGkJ9-A) 🔥       
[Oracle 12CR2 RAC 安装避坑宝典](https://mp.weixin.qq.com/s/KlP4IM4O7sHVvSNJ9rNXEA)    
[Linux7 安装 Oracle 19C RAC 详细图文教程](https://mp.weixin.qq.com/s/vNZbH5QsiSWrdtJcqP2MWg) 🔥       
[Oracle ADG 搭建 RAC to Single 详细教程](https://mp.weixin.qq.com/s/mA5MPcykF-eytChoUAhwnA)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q) 🔥        
[Oracle 分区表之在线重定义](https://mp.weixin.qq.com/s/NYQ8TPMktc6u8jMtnI_Gpg)    
[AutoUpgrade 快速升级 Oracle 数据库](https://mp.weixin.qq.com/s/ebpMdmozKOR6XZSMKsG2DQ)    
[Oracle 数据库巡检命令手册](https://mp.weixin.qq.com/s/vLtJ2zH_TnyQxKyVddzMRg) 🔥       
[Oracle 数据坏块的 N 种修复方式](https://mp.weixin.qq.com/s/0w66O5Ugx-TX7e_trE5ZBQ) 🔥       
[数据库 SQL 开发入门教程](https://mp.weixin.qq.com/s/92mBTibjSGNywnwOYIFuqg)    
[超全 Linux 基础命令总结](https://mp.weixin.qq.com/s/UwVlWxEUBE4OEq4a91dyfg) 🔥       
[VMware 虚拟机安装 Linux 系统](https://mp.weixin.qq.com/s/-gTiGVWFZV0tkw0yZyI2bQ)    
[Linux 安装 MySQL 详细教程](https://mp.weixin.qq.com/s/dHSaDSrUqxFG9E2dMuTmxg)    
[教你玩转 SQLPLUS，工作效率提升 200%](https://mp.weixin.qq.com/s/KaxEN6qxLDJWb7paOvcffw)    

---

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎 **点赞+关注**，我会持续分享数据库知识、运维技巧。
