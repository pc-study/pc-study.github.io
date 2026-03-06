---
title: KingbaseES V9R1C10 兼容 Oracle 分区表特性
date: 2025-10-04 08:02:25
tags: [墨力计划,金仓数据库,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1973060510706839552
---

# 前言
听说金仓 V9R1C10 兼容了很多 Oracle 的特性，正好最近在做一些分区表的数据归档，测试一下金仓的 Oracle 兼容模式的分区表功能。

# 范围分区表
创建一个范围分区表：
```sql
test=# show database_mode;   
 database_mode 
---------------
 oracle

test=# CREATE TABLE sales_range (
    sale_id NUMBER,
    product_name VARCHAR2(100),
    sale_date DATE,
    amount NUMBER(10,2),
    region VARCHAR2(50)
)
PARTITION BY RANGE (sale_date) (
    PARTITION p_2023_q1 VALUES LESS THAN (TO_DATE('2023-04-01', 'YYYY-MM-DD')),
    PARTITION p_2023_q2 VALUES LESS THAN (TO_DATE('2023-07-01', 'YYYY-MM-DD')),
    PARTITION p_2023_q3 VALUES LESS THAN (TO_DATE('2023-10-01', 'YYYY-MM-DD')),
    PARTITION p_2023_q4 VALUES LESS THAN (TO_DATE('2024-01-01', 'YYYY-MM-DD')),
    PARTITION p_2024 VALUES LESS THAN (MAXVALUE)
);
CREATE TABLE
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973063368151937024_395407.png)

插入测试数据到不同分区：
```sql
test=# INSERT INTO sales_range VALUES (1, 'Laptop', TO_DATE('2023-02-15', 'YYYY-MM-DD'), 1200.50, 'North');
INSERT 0 1
test=# INSERT INTO sales_range VALUES (2, 'Mouse', TO_DATE('2023-05-20', 'YYYY-MM-DD'), 25.99, 'South');
INSERT 0 1
test=# INSERT INTO sales_range VALUES (3, 'Keyboard', TO_DATE('2023-08-10', 'YYYY-MM-DD'), 80.00, 'East');
INSERT 0 1
test=# INSERT INTO sales_range VALUES (4, 'Monitor', TO_DATE('2023-11-05', 'YYYY-MM-DD'), 350.00, 'West');
INSERT 0 1
test=# INSERT INTO sales_range VALUES (5, 'Tablet', TO_DATE('2024-03-15', 'YYYY-MM-DD'), 499.99, 'North');
INSERT 0 1
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973063445532651520_395407.png)

验证分区数据分布：
```sql
test=# SELECT 'p_2023_q1' AS partition_name, COUNT(*) FROM sales_range PARTITION (p_2023_q1)
UNION ALL
SELECT 'p_2023_q2', COUNT(*) FROM sales_range PARTITION (p_2023_q2)
UNION ALL
SELECT 'p_2023_q3', COUNT(*) FROM sales_range PARTITION (p_2023_q3)
UNION ALL
SELECT 'p_2023_q4', COUNT(*) FROM sales_range PARTITION (p_2023_q4)
UNION ALL
SELECT 'p_2024', COUNT(*) FROM sales_range PARTITION (p_2024);

 partition_name | count 
----------------+-------
 p_2023_q1      |     1
 p_2023_q2      |     1
 p_2023_q3      |     1
 p_2023_q4      |     1
 p_2024         |     1
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973063519163658240_395407.png)

查看分区数据：
```sql
EXPLAIN SELECT * FROM sales_range WHERE sale_date BETWEEN TO_DATE('2023-05-01', 'YYYY-MM-DD')
    AND TO_DATE('2023-06-30', 'YYYY-MM-DD');

SELECT * FROM sales_range WHERE sale_date BETWEEN TO_DATE('2023-05-01', 'YYYY-MM-DD')
    AND TO_DATE('2023-06-30', 'YYYY-MM-DD');
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973063719353593856_395407.png)

# LIST 分区
创建一个 LIST 分区表：
```sql
test=# CREATE TABLE sales_list (
    sale_id NUMBER,
    product_name VARCHAR2(100),
    amount NUMBER(10,2),
    region VARCHAR2(50)
)
PARTITION BY LIST (region) (
    PARTITION p_north VALUES ('North', 'Northeast', 'Northwest'),
    PARTITION p_south VALUES ('South', 'Southeast', 'Southwest'),
    PARTITION p_east VALUES ('East'),
    PARTITION p_west VALUES ('West'),
    PARTITION p_default VALUES (DEFAULT)
);
CREATE TABLE
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973064338038599680_395407.png)

插入数据：
```sql
test=# INSERT INTO sales_list VALUES (1, 'Product A', 100.00, 'North');
INSERT 0 1
test=# INSERT INTO sales_list VALUES (2, 'Product B', 200.00, 'South');
INSERT 0 1
test=# INSERT INTO sales_list VALUES (3, 'Product C', 150.00, 'East');
INSERT 0 1
test=# INSERT INTO sales_list VALUES (4, 'Product D', 180.00, 'West');
INSERT 0 1
test=# INSERT INTO sales_list VALUES (5, 'Product E', 220.00, 'Central');
INSERT 0 1
test=# INSERT INTO sales_list VALUES (6, 'Product F', 90.00, 'Northeast');
INSERT 0 1
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973064619426066432_395407.png)

验证分区数据：
```sql
test=# SELECT * FROM sales_list PARTITION (p_north);
 sale_id | product_name | amount |  region   
---------+--------------+--------+-----------
       1 | Product A    | 100.00 | North
       6 | Product F    |  90.00 | Northeast

test=# SELECT * FROM sales_list PARTITION (p_default);
 sale_id | product_name | amount | region  
---------+--------------+--------+---------
       5 | Product E    | 220.00 | Central
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973064725353213952_395407.png)

# HASH 分区
创建一个哈希分区：
```sql
test=# CREATE TABLE customer_hash (
    customer_id NUMBER PRIMARY KEY,
    customer_name VARCHAR2(100),
    email VARCHAR2(100),
    phone VARCHAR2(20)
)
PARTITION BY HASH (customer_id) (
    PARTITION p1,
    PARTITION p2,
    PARTITION p3,
    PARTITION p4
);
CREATE TABLE
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973065309988859904_395407.png)

插入数据（会自动根据哈希算法分配到不同分区）：
```sql
test=# INSERT INTO customer_hash
SELECT
    i,
    'Customer_' || i,
    'customer' || i || '@example.com',
    '1234567' || LPAD(i::TEXT, 3, '0')
FROM generate_series(1, 20) AS i;
INSERT 0 20
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973066705354108928_395407.png)

查看各分区数据分布：
```sql
test=# SELECT 'p1' AS partition_name, COUNT(*) FROM customer_hash PARTITION (p1)
UNION ALL
SELECT 'p2', COUNT(*) FROM customer_hash PARTITION (p2)
UNION ALL
SELECT 'p3', COUNT(*) FROM customer_hash PARTITION (p3)
UNION ALL
SELECT 'p4', COUNT(*) FROM customer_hash PARTITION (p4);

 partition_name | count 
----------------+-------
 p1             |     5
 p2             |     6
 p3             |     2
 p4             |     7
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973066851991171072_395407.png)

验证分区数据：
```sql
test=# SELECT * FROM customer_hash PARTITION (p1);
 customer_id | customer_name |         email          |   phone    
-------------+---------------+------------------------+------------
           4 | Customer_4    | customer4@example.com  | 1234567004
           7 | Customer_7    | customer7@example.com  | 1234567007
          10 | Customer_10   | customer10@example.com | 1234567010
          12 | Customer_12   | customer12@example.com | 1234567012
          16 | Customer_16   | customer16@example.com | 1234567016

test=# SELECT * FROM customer_hash PARTITION (p4);
 customer_id | customer_name |         email          |   phone    
-------------+---------------+------------------------+------------
           2 | Customer_2    | customer2@example.com  | 1234567002
           6 | Customer_6    | customer6@example.com  | 1234567006
          11 | Customer_11   | customer11@example.com | 1234567011
          13 | Customer_13   | customer13@example.com | 1234567013
          17 | Customer_17   | customer17@example.com | 1234567017
          18 | Customer_18   | customer18@example.com | 1234567018
          19 | Customer_19   | customer19@example.com | 1234567019
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973067664239112192_395407.png)

# 间隔分区（INTERVAL 分区）
创建一个间隔分区：
```sql
-- 每月自动创建新分区
test=# CREATE TABLE logs_interval (
    log_id NUMBER,
    log_date DATE,
    log_level VARCHAR2(20),
    message VARCHAR2(500)
)
PARTITION BY RANGE (log_date)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
(
    PARTITION p_start VALUES LESS THAN (TO_DATE('2024-01-01', 'YYYY-MM-DD'))
);
CREATE TABLE
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973068221544673280_395407.png)

插入不同月份的数据，观察自动分区创建：
```sql
test=# INSERT INTO logs_interval VALUES (1, TO_DATE('2023-12-20', 'YYYY-MM-DD'), 'INFO', 'Old log entry');
INSERT 0 1
test=# INSERT INTO logs_interval VALUES (2, TO_DATE('2024-01-15', 'YYYY-MM-DD'), 'ERROR', 'Jan 2024 log');
INSERT 0 1
test=# INSERT INTO logs_interval VALUES (3, TO_DATE('2024-02-10', 'YYYY-MM-DD'), 'WARN', 'Feb 2024 log');
INSERT 0 1
test=# INSERT INTO logs_interval VALUES (4, TO_DATE('2024-03-05', 'YYYY-MM-DD'), 'INFO', 'Mar 2024 log');
INSERT 0 1
test=# INSERT INTO logs_interval VALUES (5, TO_DATE('2024-06-20', 'YYYY-MM-DD'), 'DEBUG', 'Jun 2024 log');
INSERT 0 1
test=# INSERT INTO logs_interval VALUES (6, TO_DATE('2024-10-15', 'YYYY-MM-DD'), 'ERROR', 'Oct 2024 log');
INSERT 0 1
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973068465351176192_395407.png)

查询所有数据（应该能看到自动创建的分区）：
```sql
test=# SELECT * FROM logs_interval ORDER BY log_date;
 log_id |      log_date       | log_level |    message    
--------+---------------------+-----------+---------------
      1 | 2023-12-20 00:00:00 | INFO      | Old log entry
      2 | 2024-01-15 00:00:00 | ERROR     | Jan 2024 log
      3 | 2024-02-10 00:00:00 | WARN      | Feb 2024 log
      4 | 2024-03-05 00:00:00 | INFO      | Mar 2024 log
      5 | 2024-06-20 00:00:00 | DEBUG     | Jun 2024 log
      6 | 2024-10-15 00:00:00 | ERROR     | Oct 2024 log
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973068601221459968_395407.png)


查看分区定义：
```sql
test=# SELECT partition_name, high_value FROM user_tab_partitions WHERE table_name = 'LOGS_INTERVAL';
 partition_name |       high_value        
----------------+-------------------------
 P_START        | ('2024-01-01 00:00:00')
 P1             | ('2024-02-01 00:00:00')
 P2             | ('2024-03-01 00:00:00')
 P3             | ('2024-04-01 00:00:00')
 P4             | ('2024-07-01 00:00:00')
 P5             | ('2024-11-01 00:00:00')
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973068809254744064_395407.png)

# 分区表 DML 操作
在特定分区插入数据：
```sql
test=# INSERT INTO sales_range PARTITION (p_2023_q3)
VALUES (6, 'Headset', TO_DATE('2023-09-15', 'YYYY-MM-DD'), 120.00, 'Central');
INSERT 0 1
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973069388836253696_395407.png)

更新特定分区数据：
```sql
test=# UPDATE sales_range PARTITION (p_2023_q1)
SET amount = amount * 1.1
WHERE region = 'North';
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973069633968156672_395407.png)

删除特定分区数据：
```sql
test=# select * FROM sales_range PARTITION (p_2024);
 sale_id | product_name |      sale_date      | amount | region 
---------+--------------+---------------------+--------+--------
       5 | Tablet       | 2024-03-15 00:00:00 | 499.99 | North
(1 行记录)

test=# DELETE FROM sales_range PARTITION (p_2024) WHERE amount < 100;
DELETE 0
test=# DELETE FROM sales_range PARTITION (p_2024) WHERE amount > 100;
DELETE 1
test=# select * FROM sales_range PARTITION (p_2024);                 
 sale_id | product_name | sale_date | amount | region 
---------+--------------+-----------+--------+--------
(0 行记录)
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973070162932805632_395407.png)

TRUNCATE 特定分区：
```sql
test=# select * FROM sales_range PARTITION (P_2023_q3);
 sale_id | product_name |      sale_date      | amount | region  
---------+--------------+---------------------+--------+---------
       3 | Keyboard     | 2023-08-10 00:00:00 |  80.00 | East
       6 | Headset      | 2023-09-15 00:00:00 | 120.00 | Central
(2 行记录)

test=# ALTER TABLE sales_range TRUNCATE PARTITION p_2023_q3;
ALTER TABLE
test=# select * FROM sales_range PARTITION (P_2023_q3);     
 sale_id | product_name | sale_date | amount | region 
---------+--------------+-----------+--------+--------
(0 行记录)
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973070559911096320_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973070654387793920_395407.png)


# 分区表 DDL 操作
添加新分区：
```sql
-- 删除 MAXVALUE 分区
test=# ALTER TABLE sales_range DETACH PARTITION sales_range_p_2024;
ALTER TABLE

-- 添加 2025 年分区
test=# ALTER TABLE sales_range ADD PARTITION p_2025 VALUES LESS THAN (TO_DATE('2026-01-01', 'YYYY-MM-DD'));
ALTER TABLE

-- 重新附加或创建 MAXVALUE 分区
test=# CREATE TABLE sales_range_p_future PARTITION OF sales_range FOR VALUES FROM ('2026-01-01') TO (MAXVALUE);
CREATE TABLE
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973072250689564672_395407.png)

删除分区：
```sql
test=# ALTER TABLE sales_range DROP PARTITION p_2025;
ALTER TABLE
```
拆分分区：
```sql
test=# ALTER TABLE sales_range SPLIT PARTITION p_2023_q1
AT ('2023-02-01')
INTO (PARTITION p_2023_h1, PARTITION p_2023_h2);
ALTER TABLE
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973095105770827776_395407.png)

合并分区：
```sql
test=# ALTER TABLE sales_range MERGE PARTITIONS p_2023_h1, p_2023_h2
INTO PARTITION p_2023_q1;
```

![](https://oss-emcsprod-public.modb.pro/image/editor/20251001-1973095347450818560_395407.png)

重命名分区：
```sql
ALTER TABLE sales_range RENAME PARTITION p_2024_all TO p_2024;
```
交换分区：
```sql
CREATE TABLE temp_sales (
    sale_id NUMBER,
    product_name VARCHAR2(100),
    sale_date DATE,
    amount NUMBER(10,2),
    region VARCHAR2(50)
);

INSERT INTO temp_sales VALUES (100, 'Test Product', TO_DATE('2023-03-10', 'YYYY-MM-DD'), 999.99, 'Test');
```
将普通表数据交换到分区：
```sql
ALTER TABLE sales_range EXCHANGE PARTITION p_2023_q1 WITH TABLE temp_sales;

SELECT * FROM sales_range PARTITION (p_2023_q1);
SELECT * FROM temp_sales;

-- 再交换回来
ALTER TABLE sales_range EXCHANGE PARTITION p_2023_q1 WITH TABLE temp_sales;
```

# 写在最后
关于分区表常用的一些分区类型以及功能特性，均已在金仓 V9R1C10 版本的 Oracle 兼容模式下测试，并且全部支持，点赞👍🏻！





















