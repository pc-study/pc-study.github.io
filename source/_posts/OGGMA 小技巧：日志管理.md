---
title: OGGMA 小技巧：日志管理
date: 2026-01-26 17:32:30
tags: [墨力计划,ogg]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2015717951849193472
---

最近用 OGGMA，发现前端这个日志真的讨厌，问题已经解决了，但是还是一直显示：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260126-2015718004596760576_395407.png)

Oracle 没有设计一个可以手动管理日志的页面或者按钮，只展示日志的内容，对于强迫症来说就很烦。

后来发现，这个日志显示的是 `/ogg/ogginst/dep/var/log` 目录下的 `ER-events.log` 日志文件内容，只需要手动编辑日志内容或者直接清空日志：
```bash
echo ""> /ogg/ogginst/dep/var/log/ER-events.log
```
然后前端刷新页面：

![](https://oss-emcsprod-public.modb.pro/image/editor/20260126-2015718756669530112_395407.png)

舒服了，没啥用但是让人舒适的一个小技巧。