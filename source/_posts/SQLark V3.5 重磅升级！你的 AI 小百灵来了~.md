---
title: SQLark V3.5 重磅升级！你的 AI 小百灵来了~
date: 2025-07-03 09:18:31
tags: [墨力计划,sqlark]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1940303734261690368
---

> 大家好，这里是 **DBA 学习之路**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言

在数据库工具这个领域，SQLark 的迭代速度真的让我十分佩服，从 2023 年 5 月正式发布以来，几乎每 1-2 个月就会有新版本推出，伴随着用户群体的壮大，功能版图也在持续扩展，如今已然成为一款相当成熟的产品。

作为一名从发布就开始接触 SQLark 的用户，我见证了它从最初，一路演进到如今搭载 AI 小百灵的全功能平台。这个过程中最让我感触的是，每当在社区提出一些使用建议：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940314284827881472_395407.png)

![数据生成功能](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940305806243672064_395407.png)

![寻求 AI 功能](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940306602427428864_395407.png)

往往在后续版本中就能看到相应的改进 -- **这种用户声音被认真倾听和采纳的体验，在当下并不多见**。

# SQLark V3.5 新版亮点

这次 6 月份推出的 V3.5 版本，最引人关注的当属 AI 小百灵助手的正式上线。通过集成 Qwen3 与 DeepSeek 两大模型，实现了从代码生成、报错分析到 SQL 优化，再到达梦专家知识检索的全链路智能化覆盖。

>👉 体验 SQLark V3.5 版本最新功能，欢迎在官网 **www.sqlark.com** 下载全功能免费版。

![](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940307361676144640_395407.png)

在数据库支持方面，PostgreSQL 的功能完善度有了显著提升，新增的数据导入、数据生成、ER 图等功能让整个工作流更加完整。值得一提的是，Linux ARM 架构版本的推出，也体现了对不同硬件平台用户需求的考量。

从细节上看，SQL 编辑器、表设计器、数据处理等核心模块的优化多达 90 项，这种对用户体验的精雕细琢，往往比大功能的添加更能体现产品的用心程度。

当前 V3.5 版本的数据库兼容性覆盖：

- 达梦 DM 7.0 及以上版本
- Oracle 11g 及以上版本
- MySQL 5.7、8.0
- PostgreSQL 12、13、14、15、16

多的不说了，大家可以移步 [百灵 x 通义Qwen3，AI 助手正式上线！](https://mp.weixin.qq.com/s/sOpM1a4yfC3azL8QvsRydA) 官方发布文章细看！

# AI 小百灵测评
更新到最新版之后，赶忙试了下新的 AI 小百灵功能：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940313767355625472_395407.png)

## 代码解释
我理解的代码解释应该是帮助我来快速读懂一段复杂的 SQL，我用 DeepSeek 生成了一段包含多表连接、子查询、窗口函数、条件聚合等复杂逻辑的 SQL 示例，看看小百灵的反馈如何：
```sql
WITH ranked_products AS (
  SELECT
    c.country,
    cat.category_name,
    p.product_name,
    SUM(od.quantity * od.unit_price) AS total_sales,
    ROUND(
      100.0 * SUM(od.quantity * od.unit_price) 
      / SUM(SUM(od.quantity * od.unit_price)) OVER (PARTITION BY c.country, cat.category_id),
      2
    ) AS sales_percentage,
    RANK() OVER (
      PARTITION BY c.country, cat.category_id
      ORDER BY SUM(od.quantity * od.unit_price) DESC
    ) AS sales_rank
  FROM orders o
  JOIN order_details od ON o.order_id = od.order_id
  JOIN products p ON od.product_id = p.product_id
  JOIN categories cat ON p.category_id = cat.category_id
  JOIN customers c ON o.customer_id = c.customer_id
  WHERE o.order_date BETWEEN '2023-01-01' AND '2023-12-31'
    AND c.country IN ('USA', 'UK', 'Germany')
  GROUP BY c.country, cat.category_id, cat.category_name, p.product_name
),
category_stats AS (
  SELECT
    country,
    category_name,
    SUM(total_sales) AS category_total,
    COUNT(DISTINCT CASE WHEN sales_rank <= 3 THEN product_name END) AS top_products_count
  FROM ranked_products
  GROUP BY country, category_name
  HAVING SUM(total_sales) > 50000
)
SELECT 
  rp.country,
  rp.category_name,
  rp.product_name,
  rp.total_sales,
  rp.sales_percentage,
  cs.category_total,
  CASE 
    WHEN rp.sales_rank <= 3 THEN 'Top 3'
    ELSE 'Other'
  END AS performance_flag,
  LAG(rp.total_sales, 1) OVER (
    PARTITION BY rp.country, rp.category_name 
    ORDER BY rp.sales_rank
  ) AS prev_product_sales
FROM ranked_products rp
JOIN category_stats cs
  ON rp.country = cs.country 
  AND rp.category_name = cs.category_name
WHERE rp.sales_rank <= 5
ORDER BY 
  rp.country, 
  cs.category_total DESC, 
  rp.sales_rank;
```
解释一下这段 SQL 代码：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940405040959729664_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940405188750225408_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940405300327100416_395407.png)

结果有点让我眼前一亮，还与 SQLark 有一定的联动，接着我打算让小百灵帮我根据这个 SQL 生成对应的表结构，然后用 SQLark 的数据生成功能填充数据，验证一下这个 SQL 是否可以正常执行。

## 代码生成
根据 SQL 生成必须的表结构并且能够支持 SQL 运行：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940406700637433856_395407.png)

让我来看看结果如何：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940406892988215296_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940407053663612928_395407.png)

没想到小百灵不仅提供了表结构，还创建了几个索引进行优化。

连接我的达梦测试库测试一下：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940407861377511424_395407.png)

首先创建一下表空间和用户：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940408460772913152_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940408708043911168_395407.png)

连接新建用户 lucifer，测试是否能建表：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940409382769012736_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940409657584005120_395407.png)

根据小百灵提示授予 `RESOURCE` 权限即可：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940409989995180032_395407.png)

再次测试建表：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940410087173009408_395407.png)

创建成功，继续创建测试表的表结构：
```sql
-- 创建 customers 表
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    country VARCHAR(100)
);

-- 创建 orders 表
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- 创建 order_details 表
CREATE TABLE order_details (
    order_detail_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 创建 products 表
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(255),
    category_id INT
);

-- 创建 categories 表
CREATE TABLE categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(255)
);

-- 添加索引以提高查询性能（可选）
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_details_order_id ON order_details(order_id);
CREATE INDEX idx_order_details_product_id ON order_details(product_id);
CREATE INDEX idx_products_category_id ON products(category_id);
```
创建成功：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940410408234397696_395407.png)

使用数据生成功能填充表数据：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940410617110736896_395407.png)

经过之前版本迭代，目前数据生成功能十分好用：
>1、这里需要注意检查一下测试 SQL 的查询条件，有没有一些特殊的值，比如日期范围，字符要求，根据实际情况生成数据，才能查到数据库。    
>2、如果有外键关系的表，要根据外键关系后生成数据，否则容易外键列为空。

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940413633247326208_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940414755622105088_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940415025932414976_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940410883985911808_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940410971432955904_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940411042086006784_395407.png)

分分钟就生成测试数据了，点赞！

接着，自然就是测试一下 SQL 能否正常运行了：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940419136509718528_395407.png)

SQL 可以正常执行并且返回结果，执行时间为：`33.037(毫秒)`

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940419456627388416_395407.png)

接着看看小百灵的优化能力如何，让小百灵优化一下这条 SQL。

## 优化 SQL
只需要在 SQLark 中选择需要优化的 SQL，右键问 AI 即可：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940420381395922944_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940420621846982656_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940420904031367168_395407.png)

使用优化后的 SQL 执行：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940423092510142464_395407.png)

时间减少到 ` 25.903(毫秒)`。

## 达梦知识检索
最后再测一下达梦知识检索功能，我尝试问了一个比较简单常用的问题：
>帮我写一个一键开启达梦归档的脚本命令。

看看小百灵的回答如何：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940312298673942528_395407.png)

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940312670675152896_395407.png)

生成的脚本如下：
```bash
#!/bin/bash

# 数据库配置文件路径
DM_INI="/dmdata/DAMENG/dm.ini"
# 归档配置文件路径
DM_ARCH_INI="/dmdata/DAMENG/dmarch.ini"

# 修改dm.ini文件，开启归档
sed -i "s/ARCH_INI = 0/ARCH_INI = 1/g" $DM_INI

# 如果dmarch.ini文件不存在，则创建并配置归档参数
if [ ! -f $DM_ARCH_INI ]; then
    cat <<EOF > $DM_ARCH_INI
[ARCHIVE_LOCAL1]
ARCH_TYPE = LOCAL
ARCH_DEST = /dmarch
ARCH_FILE_SIZE = 2048
ARCH_SPACE_LIMIT = 102400
EOF
fi

# 重启数据库以应用配置
systemctl restart DmServiceDMSERVER
```

测试一下这个脚本，找一套没有开启归档的达梦数据库：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940393738828787712_395407.png)

根据实际的环境修改一下脚本中的相关信息，比如文件路径，数据库服务名称等：
>这里还有个问题，脚本需要在 dmdba 中运行，所以重启数据库服务需要用 `DmServiceDAMENG restart` 命令，需要优化一下。

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940394823651962880_395407.png)

执行一键配置脚本：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940395115491635200_395407.png)

查看归档是否开启：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940395303383871488_395407.png)

没有生效，经过检查发现是 sed 命令没有替换成功，没有处理 `=` 号前面的空格问题导致：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940395724961755136_395407.png)

优化 sed 命令：
```bash
sed -i 's/\(\<ARCH_INI\>[[:space:]]*=[[:space:]]*\)0/\11/g' "$DM_INI"
```

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940400352361197568_395407.png)

优化后重新执行：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940400146324402176_395407.png)

再次检查归档启用情况：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20250702-1940400774727610368_395407.png)

可以看到归档已经一键开启成功。总的来说，生成的内容正确率能达到 90% 以上，细节还需要打磨，听说这个月还会上满血版，不知道在细节方面会不会进一步优化。

# 写在最后
经过一系列全面而深入的测试，我基本对 AI 小百灵的各项功能都体验了一把，总体来说还是很不错的，AI 小百灵已经可以满足大多数日常使用需求。虽然在某些方面还存在改进空间，但已经达到了一个令人满意的水平。

相信在未来，AI 小百灵还会推出更多令人惊喜的功能和更加智能的交互体验。