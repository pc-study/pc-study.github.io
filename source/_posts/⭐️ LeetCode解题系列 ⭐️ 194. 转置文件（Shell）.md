---
title: ⭐️ LeetCode解题系列 ⭐️ 194. 转置文件（Shell）
date: 2021-08-03 07:08:14
tags: [leetcode解题]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/89239
---

@[TOC](194.转置文件)
# ❤️ 原题 ❤️
给定一个文件 `file.txt`，转置它的内容。

你可以假设每行列数相同，并且每个字段由 `'  '` 分隔。

**示例：**

假设 `file.txt` 文件内容如下：
```
name age
alice 21
ryan 30
```
应当输出：
```
name alice ryan
age 21 30
```
# ☀️ 解题思路 ☀️
## 分析
文件内容为2行3列，每行列数相同，字段由 `' ' ` 分隔，需要将第一列转为第一行，第二列转为第二行。

## xargs 多行变单行
很容易就想到了 `xargs` 这个命令，可以将单行或多行文本输入转换为其他格式，例如多行变单行，单行变多行。

**举例：**
```bash
cat <<EOF>1.txt
1
2
3
EOF
cat 1.txt | xargs
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/8eca10e61e0e42fd9cbb969c6b1705d5.png)
但是有个问题，如果有多列的情况下，输出只能按次序只能变成单行。也就是如下：
![在这里插入图片描述](https://img-blog.csdnimg.cn/8ec3c0df43cb41afbb4fc1edfbe08120.png)
无法达到需要的效果。所以得想办法依次取到每一列然后执行 `xargs` 输出。**<font color='red'>如何取到第一列的数据呢？</font>**

## awk + print 打印列
可以使用 `awk` 命令处理文本，配置 `print` 命令来获取指定列的数据：
```bash
awk '{print $1}' 1.txt
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c6d734d8a28f4ee9b21ba76c91a3bbac.png)
这样就达到了我们的要求，接下来只需要获取文本有多少列，然后循环输出即可。

## head + wc 获取列数
通过 `head -n` 命令可以获取文件指定行数的内容，再使用 `wc -w` 即可获取当前行的所有列数。由于本题每行列数相同，因此我们取第一行即可。
```bash
cat 1.txt | head -n 1 | wc -w
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/bea15d178e5b4f5fa352fdb75b4c5584.png)
获取每行的总列数为2列。接下来再写个循环来输出：
```bash
columns=$(cat 1.txt | head -n 1 | wc -w)
for i in $(seq 1 $columns)
do
awk '{print $'''$i'''}' 1.txt | xargs
done
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/488dd7bb70904c9eaa36183dad330a60.png)
至此，已经成功解题，达到了所需结果。将文中的 `1.txt` 换成 `file.txt`，去 LeetCode 执行一下看看结果吧：
![在这里插入图片描述](https://img-blog.csdnimg.cn/d42810bbc26f46458d3bd8ff199005f1.png)
# ❄️ 写在最后 ❄️
本题主要用到一些 Linux 基础命令：`awk`、`head`、`xargs`、`wc`、`print`，需要熟练掌握使用。

---
本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。
