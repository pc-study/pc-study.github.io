---
title: Oracle 查询表空间使用率 SQL 语句
date: 2021-09-29 12:09:53
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/121710
---

Oracle 数据库的表空间如果使用超过100%，会导致数据库无法使用，因此需要及时扩展！

通过 sql 查询当前数据库所有表空间的使用率：
```sql
set line222
set pagesize1000
col TABLESPACE_NAME for a40
select tbs_used_info.tablespace_name,
       tbs_used_info.alloc_mb,
       tbs_used_info.used_mb,
       tbs_used_info.max_mb,
       tbs_used_info.free_of_max_mb,
       tbs_used_info.used_of_max || '%' used_of_max_pct
  from (select a.tablespace_name,
               round(a.bytes_alloc / 1024 / 1024,2) alloc_mb,
               round((a.bytes_alloc - nvl(b.bytes_free,
                                          0)) / 1024 / 1024,2) used_mb,
               round((a.bytes_alloc - nvl(b.bytes_free,
                                          0)) * 100 / a.maxbytes,2) used_of_max,
               round((a.maxbytes - a.bytes_alloc + nvl(b.bytes_free,
                                                       0)) / 1048576,2) free_of_max_mb,
               round(a.maxbytes / 1048576,2) max_mb
          from (select f.tablespace_name,
                       sum(f.bytes) bytes_alloc,
                       sum(decode(f.autoextensible,
                                  'YES',
                                  case when f.maxbytes > f.bytes then f.maxbytes else f.bytes end,
                                  'NO',
                                  f.bytes)) maxbytes
                  from dba_data_files f
                 group by tablespace_name) a,
               (select f.tablespace_name,
                       sum(f.bytes) bytes_free
                  from dba_free_space f
                 group by tablespace_name) b
         where a.tablespace_name = b.tablespace_name(+)) tbs_used_info
 order by tbs_used_info.used_of_max desc;
```

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️