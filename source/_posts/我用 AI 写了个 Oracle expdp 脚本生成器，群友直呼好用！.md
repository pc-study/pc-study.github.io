---
title: 我用 AI 写了个 Oracle expdp 脚本生成器，群友直呼好用！
date: 2025-06-10 15:28:35
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1932339090410713088
---

> 大家好，这里是 **DBA 学习之路**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言

今天群里有位兄弟问：有没有一键生成 Oracle expdp 命令脚本的工具？我试着用 DeepSeek 问了一下，结果：惊艳！生成的工具有点意思！

![](https://files.mdnice.com/user/16270/db1052f3-4455-4134-9792-bdfade417d35.png)

本文记录了一下如何用 DeepSeek 一键生成自动化工具的过程，文末我会免费分享这个 **Oracle expdp 脚本生成工具**。

# DeepSeek 一键生成

打开 [DeepSeek 官网](https://chat.deepseek.com/)，输入一句简单提示词：

> 写一个 oracle expdp 脚本生成工具，html 版

DeepSeek 深度思考了 26 秒，生成了一个功能完整的 Web 工具。

![](https://files.mdnice.com/user/16270/d51132df-91cd-4fad-ac3a-f133727e8883.png)

**深度思考内容如下：**

```bash
我们将创建一个简单的HTML页面，其中包含一个表单，用户可以在表单中输入Oracle expdp（数据泵导出）参数，然后生成相应的expdp命令。

参数包括：用户名/密码、目录对象、转储文件名、日志文件名、表空间、模式、表等（这里只列出部分常用参数，实际应用中可以扩展）。

由于是简单示例，我们只考虑部分常用参数，并假设用户了解这些参数的含义。

我们将包含以下字段：

1. 用户名 (user)

2. 密码 (password)

3. 目录对象 (directory)

4. 转储文件 (dumpfile)

5. 日志文件 (logfile)

6. 模式 (schema) - 多个模式用逗号分隔

7. 表空间 (tablespaces) - 多个表空间用逗号分隔

8. 表 (tables) - 多个表用逗号分隔

9. 全库导出 (full) - 复选框

10. 压缩 (compression) - 下拉框，可选值：无，ALL, DATA_ONLY, METADATA_ONLY, DEFAULT

11. 并行度 (parallel)

注意：expdp命令的参数有很多，这里只实现一部分。用户可以根据需要扩展。

我们将使用纯HTML和JavaScript（内联在HTML中）来实现。

当用户填写表单并点击生成按钮时，将生成一个expdp命令字符串，并显示在页面上。

由于安全性原因，我们不会将密码以明文形式显示在生成的命令中，而是提示用户使用安全的方式（比如在运行命令时输入密码）。但为了完整性，我们也可以提供一个选项让用户选择是否在命令中包含密码。

因此，我们还可以添加一个复选框，让用户选择是否在命令中显示密码。

步骤：

1. 创建HTML表单，包含上述输入项。

2. 编写JavaScript函数，在提交表单时收集各个字段的值。

3. 根据用户输入构造expdp命令字符串。

4. 将生成的命令显示在页面上。

注意：expdp命令的基本格式为：

expdp username/password@db_directory ... 参数

但通常，我们不会在命令中直接写密码，而是提示用户输入。所以我们有两种方式：

方式1：不显示密码，在命令中只写用户名，然后在运行时会提示输入密码。

方式2：显示密码（不安全）。

我们可以在表单中添加一个复选框，让用户选择是否包含密码。

另外，对于目录对象，expdp使用DIRECTORY参数指定。

开始编写HTML代码：
```

DeepSeek 写了大概 2 ～ 3 分钟：

![](https://files.mdnice.com/user/16270/2c337480-94b9-4ec7-af4a-371aad73809a.png)

写完了之后可以点击 `运行`，查看工具的使用效果：

![](https://files.mdnice.com/user/16270/e212a60b-bee4-4d11-a8ad-4b14b319b9f8.png)

第一眼看到挺震惊的，太有那味儿了！

# Oracle expdp 脚本生成工具
Oracle expdp 脚本生成工具的核心功能包括：
* 用户名 / 密码
* 目录对象（`DIRECTORY`）
* 转储文件名（`DUMPFILE`）
* 日志文件名（`LOGFILE`）
* 导出模式（`SCHEMAS`）
* 表空间（`TABLESPACES`）
* 表（`TABLES`）
* 全库导出（`FULL=Y`）
* 压缩选项（`COMPRESSION`：ALL、DATA\_ONLY 等）
* 并行度（`PARALLEL`）
* 是否在命令中显示密码（出于安全考虑默认关闭）

界面是纯 `HTML + JavaScript`，填写表单后点击「**生成命令**」，即可实时输出标准的 `expdp` 命令。
- 👉 表单界面美观直观
- 👉 支持导出配置自定义
- 👉 生成命令标准规范
- 👉 一键复制，方便实用

测试了一下生成一个导出命令：

![](https://files.mdnice.com/user/16270/27df349d-023c-4481-82e1-10525ea19d76.png)

支持一键复制：

![](https://files.mdnice.com/user/16270/9f63d233-b8f0-41a8-bfc9-6b7a4288682a.png)

说实话，自己写这个工具起码得花半天时间，用 AI 不到 3 分钟就搞定了，太香！

# 下载 Oracle expdp 脚本生成工具
📦 想要这款 Oracle expdp 脚本生成工具？

![](https://oss-emcsprod-public.modb.pro/image/editor/20250610-1932338970122268672_395407.png)

>⬆️ 关注公众号： **DBA学习之路** ，公众号回复 **`expdp`** 即可获取！
