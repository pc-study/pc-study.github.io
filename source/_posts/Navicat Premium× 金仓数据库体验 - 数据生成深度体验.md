---
title: Navicat Premium× 金仓数据库体验 - 数据生成深度体验
date: 2025-10-16 17:36:22
tags: [墨力计划,navicat x 金仓,金仓数据库,navicat]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1978698307224481792
---

# 前言
Navicat 作为一款强大的数据库管理工具，始终致力于为开发者提供高效、便捷的数据操作体验。Navicat Premium 自 17.3 版本起，已正式支持 KingbaseES V8 及以上版本，可全面满足该数据库的管理与开发需求。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978699875080482816_395407.png)

# Navicat 下载安装
**Navicat Premium V17.3 下载地址**：https://www.navicat.com.cn/download/navicat-premium

下载后双击打开进行安装：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978698902601740288_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978698963675000832_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978699060777332736_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978699134806798336_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978699187512422400_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978699246199123968_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978699294714638336_395407.png)

安装完成后双击打开（14天免费试用）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978700350290931712_395407.png)

一打开映入眼帘的就是新增国产数据库的支持：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978700482621222912_395407.png)

还有 AI 助手：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978700729627979776_395407.png)

但是不是内置的 AI 大模型，需要自行提供 API：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978752988067934208_395407.png)

sk-5bb0211b3e02499780daa34edd090d16

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978700954182627328_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978701225700896768_395407.png)

参考:[Navicat x 金仓 KingbaseES 快速入门指南](https://bbs.kingbase.com.cn/blogDetail?postsId=7c26961250b623baf126283f5f50487d) 文档，可以快速连接金仓数据库。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978743390879625216_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978743702621270016_395407.png)

双击连接数据库，新建查询：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978743951523852288_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978744158466617344_395407.png)

AI 助手需要再设置中启用：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978751961201651712_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978744250988769280_395407.png)

新建模式：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978744740711510016_395407.png)

新建数据库（这里建议加载Kingbase数据库的创建默认值）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978745421484797952_395407.png)

备份数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978747557044039680_395407.png)

点击开始就能开始备份：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978747196979818496_395407.png)

保存为一个备份任务：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978748005318668288_395407.png)

设置任务计划：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978748127825899520_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978748447377338368_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978748522845450240_395407.png)

新建一张表：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978749713167953920_395407.png)

数据生成功能：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978749081296056320_395407.png)

选择一个模式后进行下一步，设置字段属性：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978750052730417152_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978750221869920256_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978750334017220608_395407.png)

如果有多个表，表之间有主外键关联的，还可以选择表生成顺序进行生成，这个设计还是比较友好的！

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978750644500574208_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978750744069156864_395407.png)

简单的数据生成是没有问题的，我来试试复杂逻辑的数据生成是否可以正常支持：
```sql
-- 基本信息表
-- 包含基本的数据类型，如数字、字符串、日期等；包含主键和唯一约束。
CREATE TABLE Basic_Info (
    id NUMBER(10) PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    age NUMBER(3),
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    birth_date DATE,
    email VARCHAR2(100),
    phone VARCHAR2(20) UNIQUE
);

-- 订单信息表
-- 使用 TIMESTAMP 数据类型，以测试时间相关字段的迁移；包含检查约束 CHECK 以测试迁移时的约束兼容性。
CREATE TABLE Orders (
    order_id NUMBER(10) PRIMARY KEY,
    customer_id NUMBER(10) NOT NULL,
    order_date TIMESTAMP,
    amount NUMBER(12, 2),
    status VARCHAR2(20) CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELED'))
);

-- 客户信息表
-- 包含 DEFAULT 值，测试默认值的迁移；TIMESTAMP 类型的默认当前时间字段。
CREATE TABLE Customers (
    customer_id NUMBER(10) PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    address VARCHAR2(200),
    city VARCHAR2(50),
    country VARCHAR2(50),
    zip_code VARCHAR2(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品信息表
-- 测试小数数据类型；包含检查库存数量是否为非负的 CHECK 约束。
CREATE TABLE Products (
    product_id NUMBER(10) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    category VARCHAR2(50),
    price NUMBER(10, 2),
    stock_quantity NUMBER(5) CHECK (stock_quantity >= 0)
);

-- 订单详情表（关联外键）
-- 包含外键约束，测试外键的迁移；使用虚拟列 total_price，测试计算列的兼容性。
CREATE TABLE Order_Details (
    order_detail_id NUMBER(10) PRIMARY KEY,
    order_id NUMBER(10) REFERENCES Orders(order_id) ON DELETE CASCADE,
    product_id NUMBER(10) REFERENCES Products(product_id),
    quantity NUMBER(5) CHECK (quantity > 0),
    price NUMBER(10, 2),
    total_price AS (quantity * price) VIRTUAL
);

-- 员工信息表
-- 测试自引用的外键（如管理者的 ID）；包含日期类型和数字类型。
CREATE TABLE Employees (
    employee_id NUMBER(10) PRIMARY KEY,
    first_name VARCHAR2(50),
    last_name VARCHAR2(50),
    hire_date DATE,
    department_id NUMBER(10),
    salary NUMBER(10, 2),
    manager_id NUMBER(10),
    FOREIGN KEY (manager_id) REFERENCES Employees(employee_id)
);

-- 部门信息表
-- 基础信息表，用于与其他表的外键关联；包含检查约束用于测试预算是否为正数。
CREATE TABLE Departments (
    department_id NUMBER(10) PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    location VARCHAR2(100),
    budget NUMBER(12, 2) CHECK (budget > 0)
);

-- 库存记录表（复杂表结构）
-- 包含组合唯一约束，测试复杂唯一约束的兼容性；包含默认值时间戳字段。
CREATE TABLE Inventory (
    inventory_id NUMBER(10) PRIMARY KEY,
    product_id NUMBER(10) REFERENCES Products(product_id),
    warehouse_id NUMBER(10),
    stock_level NUMBER(10),
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, warehouse_id)
);

-- 仓库信息表
-- 仓库和员工有外键关系；用于测试数据库间表的跨引用。
CREATE TABLE Warehouses (
    warehouse_id NUMBER(10) PRIMARY KEY,
    location VARCHAR2(100),
    capacity NUMBER(10),
    manager_id NUMBER(10),
    FOREIGN KEY (manager_id) REFERENCES Employees(employee_id)
);

-- 销售统计表（分区表）
-- 包含分区表结构，以测试分区表的迁移；
CREATE TABLE Sales_Stats (
    sales_id NUMBER(10) PRIMARY KEY,
    year NUMBER(4) NOT NULL,
    month NUMBER(2) NOT NULL,
    month_start_date DATE DEFAULT SYSDATE NOT NULL,
    product_id NUMBER(10) REFERENCES Products(product_id),
    total_sales NUMBER(12, 2)
)
PARTITION BY RANGE (month_start_date)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH')) (
    PARTITION p_initial VALUES LESS THAN (TO_DATE('2023-01-01', 'YYYY-MM-DD'))
);
```
其中有一个 SQL 执行失败，提示语法有问题：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978753580228161536_395407.png)

使用 AI 建议进行修复：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978753454432595968_395407.png)

再次执行成功：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978753686029479936_395407.png)

所有表都创建成功后，进行数据生成测试：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978754162741489664_395407.png)

执行数据生成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978755893361651712_395407.png)

生成失败：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978756041001152512_395407.png)

很多 check 都需要人为进行调整，无法自动识别约束限制条件：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251016-1978756352734408704_395407.png)

在遇到复杂场景的情况下，很多逻辑方面还需要进行优化，基础功能虽然可用，但是需要人为干预较多。