---
title: KCP 模拟题练习 17 - 控制文件重建
date: 2024-10-09 17:07:51
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1843584909888290816
---

【单选题】使用什么工具可以重建控制文件？
 - [x] sys_resetwal
 - [ ] sys_controlbuild
 - [ ] sys_resetcontrol
 - [ ] sys_rebuild_control

**解题思路：**

前文 **[KCP 模拟题练习 16](https://www.modb.pro/db/1843574601202364416)** 演示了如何维护和破坏控制文件，这一题就接着来演示如何恢复控制文件。

# 恢复控制文件
## control_file_copy 方式（简单推荐）
这时，如果我们配置了控制文件冗余，也就是 control_file_copy 参数，那就很简单了，直接拷贝 /cf_copy 目录下的控制文件到 /data/global 目录下，并且重命名为 sys_control 即可：
```bash
[kingbase@kes:/home/kingbase]$ cp /cf_copy/sys_control_1 /data/global/sys_control
```
再次启动数据库：
```bash
[kingbase@kes:/home/kingbase]$ sys_ctl start
sys_ctl: 其他服务器进程可能正在运行; 尝试启动服务器进程
等待服务器进程启动 ....2024-10-08 17:21:02.689 CST [9321] 日志:  sepapower extension initialized
2024-10-08 17:21:02.693 CST [9321] 日志:  正在启动 KingbaseES V008R006C007B0024 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 4.8.5 20150623 (Red Hat 4.8.5-28), 64-bit
2024-10-08 17:21:02.694 CST [9321] 日志:  正在监听IPv4地址"0.0.0.0"，端口 54321
2024-10-08 17:21:02.694 CST [9321] 日志:  正在监听IPv6地址"::"，端口 54321
2024-10-08 17:21:02.695 CST [9321] 日志:  在Unix套接字 "/tmp/.s.KINGBASE.54321"上侦听
2024-10-08 17:21:02.797 CST [9321] 日志:  日志输出重定向到日志收集进程
2024-10-08 17:21:02.797 CST [9321] 提示:  后续的日志输出将出现在目录 "sys_log"中.
 完成
服务器进程已经启动
```
suprise，数据库成功启动，此时查看 test 表数据库：
```sql
test=# \c test system
您现在已经连接到数据库 "test",用户 "system".
test=# select * from test;
 id 
----
  1
  2
(2 行记录)
```
数据也没有丢失。

## sys_resetwal
这种方式是基于没有使用控制文件冗余的情况，需要使用 sys_resetwal 来重建控制文件，相对比较复杂一些。

`sys_resetwal` 会重置一个 KingbaseES 数据库集簇的预写式日志和控制信息。出于安全原因，使用时必须在命令行中指定数据目录，sys_resetwal 不会使用环境变量 $KINGBASE_DATA。

查看 `sys_resetwal` 的帮助命令：
```bash
[kingbase@kes:/home/kingbase]$ sys_resetwal --help
sys_resetwal 重置一个Kingbase数据库集簇的预写式日志.
用法:
  sys_resetwal [选项]... 数据目录
选项:
  -c, --commit-timestamp-ids=XID,XID
                                 设置提交时间可以检索到的最老的和最新的事务ID
                                 (0意味着没有变化)
 [-D, --kingbase-data=]DATADIR          data directory
  -e, --epoch=XIDEPOCH           设置下一个事务ID的epoch
  -f, --force                    强制更新完成
  -g, --dbmode                   设置数据库模式
  -l, --next-wal-file=WALFILE    设置新的WAL最小起始位置
  -m, --multixact-ids=MXID,MXID  设置下一个和最旧的多事务ID
  -n, --dry-run                  不更新，只显示将要执行的操作
  -o, --next-oid=OID             设置下一个OID
  -O, --multixact-offset=OFFSET  设置下一个多事务偏移量
  -V, --version                  输出版本信息，然后退出
  -x, --next-transaction-id=XID  设置下一个事务ID
      --wal-segsize=SIZE         WAL段的大小（兆字节）
  -?, --help                     显示本帮助，然后退出

Report bugs to <kingbase-bugs@kingbase.com.cn>.
```
首先，我们需要取消 control_file_copy 参数的配置：
```bash
## 从 kingbase.conf 文件中注释 control_file_copy 参数配置，vi 修改即可
[kingbase@kes:/data]$ cat kingbase.conf | grep control_file_copy
# control_file_copy = ''                        #example: control_file_copy = 'filepath/filename'
                                                #control_file_copy = 'filepath1/filename1;filepath2/filename2'
#control_file_copy='/cf_copy/sys_control_1;/cf_copy/sys_control_2'

## 重启数据库生效
[kingbase@kes:/data]$ sys_ctl restart
等待服务器进程关闭 .... 完成
服务器进程已经关闭
等待服务器进程启动 ....2024-10-08 17:25:49.495 CST [9475] 日志:  sepapower extension initialized
2024-10-08 17:25:49.499 CST [9475] 日志:  正在启动 KingbaseES V008R006C007B0024 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 4.8.5 20150623 (Red Hat 4.8.5-28), 64-bit
2024-10-08 17:25:49.499 CST [9475] 日志:  正在监听IPv4地址"0.0.0.0"，端口 54321
2024-10-08 17:25:49.499 CST [9475] 日志:  正在监听IPv6地址"::"，端口 54321
2024-10-08 17:25:49.500 CST [9475] 日志:  在Unix套接字 "/tmp/.s.KINGBASE.54321"上侦听
2024-10-08 17:25:49.596 CST [9475] 日志:  日志输出重定向到日志收集进程
2024-10-08 17:25:49.596 CST [9475] 提示:  后续的日志输出将出现在目录 "sys_log"中.
 完成
服务器进程已经启动

## 删除 /cf_copy 目录下的冗余文件
[kingbase@kes:/data]$ rm -rf /cf_copy/sys_control_*
```
使用以上同样方式模拟控制文件损坏后，数据库无法成功启动：
```bash
[kingbase@kes:/data]$ sys_ctl start
sys_ctl: 其他服务器进程可能正在运行; 尝试启动服务器进程
等待服务器进程启动 ....kingbase: 无法找到数据库系统
预期在目录 "/data" 找到,
但是无法打开文件 "/data/global/sys_control": 没有那个文件或目录
 已停止等待
sys_ctl: 无法启动服务器进程
检查日志输出.
```
此时没有冗余控制文件，只能使用 sys_resetwal 来重建控制文件，这个过程比较复杂，下面进行详细演示。

一般恢复控制文件只需要以下几个参数即可：

| 参数 | 简介 |
| --- | --- |
| -l  | 设置新的 WAL 最小起始位置 |
| -x  | 设置下一个事务 ID (NextXID) |
| -m  | 设置下一个多事务 ID (NextMultiXactId) 和最旧的多事务 ID (oldestMultiXid) |
| -O  | 设置下一个多事务偏移量 (NextMultiOffset) |
| -f  | 强制更新完成 |
| -D  | 指定数据库主数据目录 |
| -g  | 设置数据库模式 |

下面节开始演示 sys_resetwal 如何重建控制文件。

首先需要讲解每一个参数的值是如何获取。
## 参数 -l
wal 命名格式文件名称为 16 进制的 24 个字符组成，每 8 个字符一组，每组的意义如下：
- 时间线：英文为timeline，是以1开始的递增数字，如1,2,3...
- LogId：32bit长的一个数字，是以0开始递增的数字，如0,1,2,3...
- LogSeg：32bit长的一个数字，是以0开始递增的数字，如0,1,2,3..

|时间线|LogId|LogSeg|
|-|-|-|
|00000001|00000000|00000002|

参数 -l 的值是设置新的 WAL 最小起始位置，需要查找 `$KINGBASE_DATA/sys_wal` 目录下最大的日志文件编号，然后加 1，就可以得到 -l 参数的值：
```bash
## 最大文件编号为 000000010000000000000002
[kingbase@kes:/home/kingbase]$ ll /data/sys_wal/*
-rw------- 1 kingbase kingbase 16777216 10月  8 17:28 /data/sys_wal/000000010000000000000001
-rw------- 1 kingbase kingbase 16777216  9月 24 21:13 /data/sys_wal/000000010000000000000002
## 加 1 也就是 000000010000000000000003
000000010000000000000002 + 1 = 000000010000000000000003
```
这个结果是如何计算的？通过获取的最大文件编号 wal 的十六进制数：`000000010000000000000002`，进行加 1 的计算过程如下：
1. 识别最右边的位：最右边的位是 2，它小于 15（F），所以可以直接加 1。
2. 执行加法：将最右边的位 2 加 1 得到 3。
3. 更新数值：所有其他位保持不变。

因此，计算过程是：$000000010000000000000002_{16} + 1_{16} = 000000010000000000000003_{16}$，这是因为在十六进制中，每个位的值是 16 的幂，最右边的位是 $16^0$，即 1。当我们将 2 加 1 时，我们得到 3，这在十六进制中是有效的，不需要进位到下一个位。

这里也可以使用 python 计算，比较方便：
```python
import os
import glob
import re

# 获取 WAL 目录路径
wal_directory = os.path.join(os.getenv("KINGBASE_DATA"), "sys_wal")

# 正则表达式匹配十六进制字符串
hex_pattern = re.compile(r'^[0-9A-Fa-f]+$')

# 查找所有符合十六进制格式的文件名并获取最大编号
max_number = max(
    (os.path.basename(f) for f in glob.glob(os.path.join(wal_directory, "*"))
     if hex_pattern.match(os.path.basename(f))),  # 确保文件名是十六进制
    key=lambda x: int(x, 16)
)

# 计算下一个编号
next_hex_number = f"{int(max_number, 16) + 1:024X}"

# 打印结果
print(f"最大日志文件编号: {max_number.zfill(24)}")  # 确保格式为 24 位
print(f"最大日志文件编号加 1 后的日志: {next_hex_number}")


## 执行后的输出如下
最大日志文件编号: 000000010000000000000002
最大日志文件编号加 1 后的日志: 000000010000000000000003
```
这里清晰的介绍了如何计算得出参数 -l 的值。

## 参数 -x
参数 -x 的值是设置下一个事务 ID，需要查找 `$KINGBASE_DATA/sys_xact` 目录下的最大编号，然后加 1，再在末尾补位 00000，就可以得到 -x 参数的值：
```bash
## 最大编号为 0000
[kingbase@kes:/home/kingbase]$ ll /data/sys_xact/*
-rw------- 1 kingbase kingbase 262144 10月  8 17:28 /data/sys_xact/0000

## 加 1 后，末尾补位 00000
0x000100000
```
这同样也是一个 16 进制数，通过 python 计算可以得到值：
```python
import os
import glob
import re

# 获取 sys_xact 目录路径
xact_directory = os.path.join(os.getenv("KINGBASE_DATA"), "sys_xact")

# 正则表达式匹配十六进制字符串
hex_pattern = re.compile(r'^[0-9A-Fa-f]+$')

# 查找所有符合十六进制格式的文件名并获取最大编号
max_number = max(
    (os.path.basename(f) for f in glob.glob(os.path.join(xact_directory, "*"))
     if hex_pattern.match(os.path.basename(f))),  # 确保文件名是十六进制
    key=lambda x: int(x, 16)
)

# 计算下一个编号并在末尾补位 00000
next_id = (int(max_number, 16) + 1) * 0x100000
next_hex_id = f"0x{next_id:09X}"

# 打印结果
print(f"最大事务编号列: {max_number}")
print(f"最大事务编号加 1 末尾补 00000 后的事务 ID: {next_hex_id}")

## 执行后的输出如下
最大事务编号列: 0000
最大事务编号加 1 末尾补 00000 后的事务 ID: 0x000100000
```
这里需要补位 00000，所以 print 打印出来需要 9 位。

## 参数 -m
参数 -x 的值有两个，需要查找 `$KINGBASE_DATA/sys_multixact/offsets` 目录下的最大编号和最小编号：
- 设置下一个多事务 ID：最大编号 + 1，再在末尾补位 0000
- 最旧的多事务 ID：最小编号末尾补位 0000

📢 注意：最旧的多事务 ID 不能为 0，如果为 0 也需要进行加 1 处理。

```bash
## 最大和最小均为 0000
[kingbase@kes:/home/kingbase]$ ll /data//sys_multixact/offsets
-rw------- 1 kingbase kingbase 8192 10月  8 17:28 0000

## 最大编号 +1，末尾补位 0000
0x00010000

## 最小编号末尾补位 0000，因为是 0，所以 +1
0x00000001
```
这同样也是 16 进制数，通过 python 计算可以得到值：
```python
import os
import glob
import re

# 获取 offsets 目录路径
offsets_directory = os.path.join(os.getenv("KINGBASE_DATA"), "sys_multixact", "offsets")

# 正则表达式匹配十六进制字符串
hex_pattern = re.compile(r'^[0-9A-Fa-f]+$')

# 查找以数字开头的文件，并提取编号
log_files = [os.path.basename(f) for f in glob.glob(os.path.join(offsets_directory, "*"))
     if hex_pattern.match(os.path.basename(f))]

# 设置最大和最小编号，处理没有文件的情况
max_number = max(log_files, key=lambda x: int(x, 16))
min_number = min(log_files, key=lambda x: int(x, 16))

# 计算下一个多事务 ID 和最旧的多事务 ID
def calculate_ids(max_hex, min_hex):
    max_id = (int(max_hex, 16) + 1) * 0x10000
    min_id = (int(min_hex, 16) * 0x10000) + (1 if int(min_hex, 16) == 0 else 0)
    return f"0x{max_id:08X}", f"0x{min_id:08X}"

# 计算 ID
max_hex_result, min_hex_result = calculate_ids(max_number, min_number)

# 打印结果
print(f"最大多事务编号: {max_number}")
print(f"最小多事务编号: {min_number}")
print(f"下一个多事务 ID: {max_hex_result}")
print(f"下一个最旧的多事务 ID: {min_hex_result}")

## 执行后的输出如下
最大多事务编号: 0000
最小多事务编号: 0000
下一个多事务 ID: 0x00010000
下一个最旧的多事务 ID: 0x00000001
```

## 参数 -O
参数 -O 的值是设置下一个多事务偏移量，需要查找 `$KINGBASE_DATA/sys_multixact/members` 目录下的最大编号，加 1，然后乘以 `0xCC80`：
```bash
## 最大编号为 0000
[kingbase@kes:/home/kingbase]$ ll /data/sys_multixact/members
-rw------- 1 kingbase kingbase 8192  9月 24 21:13 0000

## 加 1，乘以 0xCC80
0xCC80
```
这同样也是 16 进制数，通过 python 计算可以得到值：
```python
import os
import glob
import re

# 获取多事务成员目录路径
members_directory = os.path.join(os.getenv("KINGBASE_DATA"), "sys_multixact", "members")

# 正则表达式匹配十六进制字符串
hex_pattern = re.compile(r'^[0-9A-Fa-f]+$')

# 查找所有符合十六进制格式的文件名并获取最大编号
max_number = max(
    (os.path.basename(f) for f in glob.glob(os.path.join(members_directory, "*"))
     if hex_pattern.match(os.path.basename(f))),  # 确保文件名是十六进制
    key=lambda x: int(x, 16)
)

# 计算下一个编号和下一个事务偏移量
next_number = int(max_number, 16) + 1
next_hex_number = f"0x{next_number:08X}"
next_offset = next_number * 0xCC80
next_hex_offset = f"0x{next_offset:X}"

# 打印结果
print(f"最大多事务成员编号: {max_number}")
print(f"最大编号加1的编号: {next_hex_number}")
print(f"下一个事务偏移量: {next_hex_offset}")

## 执行后的输出如下
最大多事务成员编号: 0000
最大编号加1的编号: 0x00000001
下一个事务偏移量: 0xCC80
```

## 参数 -g
参数 -g 的值是数据库兼容模式：
- 1：oracle 风格；
- 0：pg 风格；

获取完参数值后，也就获得了恢复控制文件的命令：
```bash
sys_resetwal -f -l 000000010000000000000003 \
-x 0x000100000 \
-m 0x00010000,0x00000001 \
-O 0xCC80 \
-D /data \
-g 1
```
但是，在执行以上命令之前，需要先手工创建一个空的控制文件和删除 kingbase.pid 文件：
```bash
[kingbase@kes:/home/kingbase]$ touch /data/global/sys_control
[kingbase@kes:/home/kingbase]$ rm -rf /data/kingbase.pid
```
执行 sys_resetwal 恢复控制文件：
```bash
[kingbase@kes:/home/kingbase]$ sys_resetwal -f -l 000000010000000000000003 \
-x 0x000100000 \
-m 0x00010000,0x00000001 \
-O 0xCC80 \
-D /data \
-g 1
sys_resetwal: 警告: sys_control存在，但已损坏或版本错误；忽略它
重置预写日志
```
启动数据库：
```bash
[kingbase@kes:/home/kingbase]$ sys_ctl start
等待服务器进程启动 ....2024-10-08 22:17:41.248 CST [16714] 日志:  sepapower extension initialized
2024-10-08 22:17:41.252 CST [16714] 日志:  正在启动 KingbaseES V008R006C007B0024 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 4.8.5 20150623 (Red Hat 4.8.5-28), 64-bit
2024-10-08 22:17:41.253 CST [16714] 日志:  正在监听IPv4地址"0.0.0.0"，端口 54321
2024-10-08 22:17:41.253 CST [16714] 日志:  正在监听IPv6地址"::"，端口 54321
2024-10-08 22:17:41.254 CST [16714] 日志:  在Unix套接字 "/tmp/.s.KINGBASE.54321"上侦听
2024-10-08 22:17:41.356 CST [16714] 日志:  日志输出重定向到日志收集进程
2024-10-08 22:17:41.356 CST [16714] 提示:  后续的日志输出将出现在目录 "sys_log"中.
 完成
服务器进程已经启动
```
数据库已经正常启动，访问数据是否正常：
```sql
test=# \c test system
您现在已经连接到数据库 "test",用户 "system".
test=# table test;
 id
----
  1
  2
  3
  4
(4 行记录)
```
访问正常，控制文件已恢复。

## 一键恢复控制文件
基于 sys_resetwal 命令，我们可以通过脚本的方式一键恢复控制文件，我写了一个 python 脚本，脚本支持传入参数：
```bash
[kingbase@kes:/home/kingbase]$ python3 recover_controlfile.py --help
usage: recover_controlfile.py [-h] [-cs {1,2}] [-kd KINGBASE_DATA]

KingbaseES 一键恢复控制文件

optional arguments:
  -h, --help            show this help message and exit
  -cs {1,2}, --compatible_style {1,2}
                        兼容样式: 1-Oracle, 2-PostgreSQL（可选，默认为 1）
  -kd KINGBASE_DATA, --kingbase_data KINGBASE_DATA
                        KINGBASE_DATA 参数（可选）
```
下面演示一下一键恢复脚本的使用过程，首先模拟控制文件丢失：
```sql
test=# \! rm -rf /data/global/sys_control
test=# checkpoint ;                      

警告:  中断联接, 因为其它服务器进程崩溃
描述:  The kingbase has commanded this server process to roll back the current transaction and exit, because another server process exited abnormally and possibly corrupted shared memory.
提示:  一会儿你将可以重联接数据库并且重复你的命令.
服务器意外地关闭了联接
        这种现象通常意味着服务器在处理请求之前
或者正在处理请求的时候意外中止
```
然后执行一键恢复控制文件脚本：
```bash
[kingbase@kes:/home/kingbase]$ python3 recover_controlfile.py

==================================================
WAL 信息:
最大日志文件编号: 00000001000000000000000F
最大日志文件编号加 1 后的日志: 000000010000000000000010
==================================================


==================================================
XACT 事务信息:
最大事务编号列: 0000
最大事务编号加 1 末尾补 00000 后的事务 ID: 0x000100000
==================================================


==================================================
multixact 多事务信息:
最大多事务编号: 0000
最小多事务编号: 0000
下一个多事务 ID: 0x00010000
下一个最旧的多事务 ID: 0x00000001
==================================================


==================================================
多事务成员信息:
最大多事务成员编号: 0000
最大编号加 1 的编号: 0x00000001
下一个事务偏移量: 0xCC80
==================================================


==================================================
生成 sys_resetwal 恢复命令:
sys_resetwal -f -l 000000010000000000000010 \
    -x 0x000100000 \
    -m 0x00010000,0x00000001 \
    -O 0xCC80 \
    -D /data \
    -g 1
==================================================


==================================================
创建一个空控制文件:
b'-rw-r--r-- 1 kingbase kingbase 0 10\xe6\x9c\x88  9 17:03 /data/global/sys_control'
==================================================


==================================================
正在删除 kingbase.pid 文件:
/data/kingbase.pid
==================================================


==================================================
正在执行 sys_resetwal 恢复控制文件:
重置预写日志
sys_resetwal: 警告: sys_control存在，但已损坏或版本错误；忽略它
==================================================


==================================================
恢复的控制文件所在路径及大小如下:
b'-rw-r--r-- 1 kingbase kingbase 8192 10\xe6\x9c\x88  9 17:03 /data/global/sys_control'
==================================================

正在启动数据库：

等待服务器进程启动 ....2024-10-09 17:03:00.573 CST [46332] 日志:  sepapower extension initialized
2024-10-09 17:03:00.577 CST [46332] 日志:  正在启动 KingbaseES V008R006C007B0024 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 4.8.5 20150623 (Red Hat 4.8.5-28), 64-bit
2024-10-09 17:03:00.578 CST [46332] 日志:  正在监听IPv4地址"0.0.0.0"，端口 54321
2024-10-09 17:03:00.578 CST [46332] 日志:  正在监听IPv6地址"::"，端口 54321
2024-10-09 17:03:00.584 CST [46332] 日志:  在Unix套接字 "/tmp/.s.KINGBASE.54321"上侦听
2024-10-09 17:03:00.702 CST [46332] 日志:  日志输出重定向到日志收集进程
2024-10-09 17:03:00.702 CST [46332] 提示:  后续的日志输出将出现在目录 "sys_log"中.
 完成
服务器进程已经启动

恭喜！控制文件还原成功！！！
```
一键恢复完成，数据库成功开启：
```sql
test=# \c test system 
您现在已经连接到数据库 "test",用户 "system".
test=# table test;
 id 
----
  1
  2
  3
  4
(4 行记录)
```
数据库可以正常访问。

