---
title: Oracle 查看数据库字符集和客户端字符集 SQL 语句
date: 2021-10-01 09:10:34
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/125653
---

Oracle 数据库分为`数据库字符集`和`客户端字符集`两种！

很多刚接触的朋友经常会搞混这两个字符集，数据库字符集是在创建数据库时进行指定的，不建议更改！而客户端字符集是可以随时更改的！

**查询数据库字符集：**
```sql
select * from nls_database_parameters t where t.parameter in ('NLS_CHARACTERSET','NLS_NCHAR_CHARACTERSET');
```

**查询客户端字符集：**
```sql
SELECT USERENV('language') FROM DUAL;
```

如何修改客户端字符集？

**Windows：**
```bash
set NLS_LANG=american_america.AL32UTF8
set NLS_LANG=SIMPLIFIED CHINESE_CHINA.ZHS16GBK
```

**Linux：**
```bash
export NLS_LANG=american_america.AL32UTF8
export NLS_LANG="SIMPLIFIED CHINESE_CHINA".ZHS16GBK
```
以上为常用客户端字符集，一个是英文，一个是中文！

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️