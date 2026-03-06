---
title: KCP 模拟题练习 03 - ksql 选项 hostname
date: 2024-09-30 15:11:18
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1840647657473273856
---

【单选题】KSQL 是 KingbaseES **V8** 自带的交互式客户端。如果未设置环境变量 `KINGBASE_HOST`，则使用 ksql 时，默认使用的 hostname 参数值是？
- [x] local socket
- [ ] 当前主机名
- [ ] 当前服务器 IP 地址
- [ ] 127.0.0.1

**解题思路：**

根据官方文档可知环境变量 `KINGBASE_HOST` 的行为和 host 连接参数相同，查看 ksql 帮助命令：
```bash
[kingbase@kes:/home/kingbase]$ kingbase -V
KINGBASE (KingbaseES) V008R006C007B0024

[kingbase@kes:/home/kingbase]$ ksql --help | grep host
  -h, --host=主机名        数据库服务器主机或socket目录(默认："kes")
```
可以看到 `-h` 参数选项的默认值为数据库主机名或者 socket，所以感觉当前主机名应该也是正确的选项。

但是查看 KCP 教材 **R6-KCA-04命令行工具KSQL-V0.68-C7B24.pdf** 中可以发现：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240930-1840649710858764288_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240930-1840661312785973248_395407.png)

按照官方提供的答案，正确选项也是 local socket。

