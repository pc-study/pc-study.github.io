---
title: KCP 模拟题练习 01 - 数据库字符集选项
date: 2024-09-30 14:52:16
tags: [墨力计划,kingbasees]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1840645633181581312
---

【单选题】根据业务需求，需要新建（initdb）一个 KingbaseES 数据库实例，在创建数据库实例时使用哪个选项来指定数据库编码？
- [x] --encoding
- [ ] -e
- [ ] --coding
- [ ] -ENCODING

**解题思路：**

查看 initdb 命令选项中关于数据库编码的参数选项：
```bash
[kingbase@kes:/home/kingbase]$ initdb --help | grep 编码
  -E, --encoding=ENCODING         为新数据库设置默认编码
```
可以发现可以使用 `-E` 或者 `--encoding` 来指定数据库编码，例如：
```bash
initdb --username=system --pwprompt --wal-segsize=32 --block-size=16 --encoding=UTF8 --lc-collate=C --lc-ctype=en_US.utf8 -m 1 --data-checksums -D /data
```