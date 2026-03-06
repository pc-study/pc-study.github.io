---
title: ⭐️ LeetCode解题系列 ⭐️ 192. 统计词频（Shell）
date: 2021-08-06 11:08:07
tags: [leetcode解题]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89237
---

@[TOC](192. 统计词频)
# ❤️ 原题 ❤️
写一个 bash 脚本以统计一个文本文件 `words.txt` 中每个单词出现的频率。

为了简单起见，你可以假设：

- `words.txt` 只包括小写字母和 `'  '` 。
- 每个单词只由小写字母组成。
- 单词间由一个或多个空格字符分隔。

**示例：**

假设 `words.txt` 内容如下：
```
the day is sunny the the
the sunny is is
```
你的脚本应当输出（以词频降序排列）：
```
the 4
is 3
sunny 2
day 1
```
**说明:**
- 不要担心词频相同的单词的排序问题，每个单词出现的频率都是唯一的。
- 你可以使用一行 `Unix pipes` 实现吗？

# ⭐️ 解题思路 ⭐️
注意几个关键词：词频降序排列、统计每个单词出现次数、使用一行命令实现。

① 使用 `xargs` 将所有行转为单列显示：
```bash
cat words.txt | xargs -n1
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/1120100fcc754a399eae983a060de498.png)
② 使用 `sort + uniq` 函数进行排列：
- `sort -nr` 表示依照数值的大小降序排序。
- `uniq -c` 表示在每列旁边显示该行重复出现的次数。

```bash
cat words.txt | xargs -n1 | sort | uniq -c | sort -nr
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/4998cc64a5e247eba515f1011b7f37d5.png)
③ 使用 `awk + print` 函数将 1、2 列位置互换：
```bash
cat words.txt | xargs -n 1 | sort | uniq -c | sort -nr | awk '{print $2" "$1}'
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/a9483fa7bec6435f9321b392b5455f92.png)
**至此，本题已解。**

去 LeetCode 执行一下看看结果吧：
![在这里插入图片描述](https://img-blog.csdnimg.cn/810725c4cbe64b0abe1e82244f4e98c6.png)
# ❄️ 写在最后 ❄️
本题依然是使用 Linux 的一些基础命令：`xargs`、`sort`、`uniq`、`awk`，基础很重要！

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。