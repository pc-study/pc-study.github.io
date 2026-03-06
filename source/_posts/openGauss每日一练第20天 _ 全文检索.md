---
title: openGauss每日一练第20天 | 全文检索
date: 2021-12-20 11:12:27
tags: [墨力计划,opengauss]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/216376
---

openGauss 每日一练第 20 天打卡，我来了！又可以学习，真开心~

# 学习
今天第 20 课，学习openGauss全文检索。

openGauss提供了两种数据类型用于支持全文检索。tsvector类型表示为文本搜索优化的文件格式，tsquery类型表示文本查询！


# 课后作业
## 1.用tsvector @@ tsquery和tsquery @@ tsvector完成两个基本文本匹配
```sql
SELECT to_tsvector('dog roots pig red ate') @@ to_tsquery('dog & root') AS RESULT;
SELECT to_tsquery('dog & root') @@ to_tsvector('dog roots pig red ate') AS RESULT;
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211220-ea873b5a-2a0a-4ec3-8f80-a7a93e69bd1d.png)
## 2.创建表且至少有两个字段的类型为 text类型，在创建索引前进行全文检索
```sql
CREATE SCHEMA lucifer;
CREATE TABLE lucifer.lucifer(id int, body text, title text, last_mod_date date);
INSERT INTO lucifer.lucifer VALUES(1, 'China, officially the People''s Republic of China(PRC), located in Asia, is the world''s most populous state.', 'China', '2010-1-1'),(2, 'America is a rock band, formed in England in 1970 by multi-instrumentalists Dewey Bunnell, Dan Peek, and Gerry Beckley.', 'America', '2010-1-1'),(3, 'England is a country that is part of the United Kingdom. It shares land borders with Scotland to the north and Wales to the west.', 'England','2010-1-1');

SELECT id, body, title FROM lucifer.lucifer WHERE to_tsvector(body) @@ to_tsquery('america');
SELECT title FROM lucifer.lucifer WHERE to_tsvector(title || ' ' || body) @@ to_tsquery('china & asia');
```
![](https://oss-emcsprod-public.modb.pro/image/editor/20211220-b7b8a97c-18f4-46b5-925d-5e52dac10d8c.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20211220-efb8a133-1721-4114-95d3-72affd1da2a4.png)
## 3.创建GIN索引
```sql
CREATE INDEX lucifer_idx_1 ON lucifer.lucifer USING gin(to_tsvector('english', body));
```
## 4.清理数据
```sql
drop schema lucifer cascade;
```

# 写在最后

今天的作业打卡结束！🎉 