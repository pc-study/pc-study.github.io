---
title: SQLark：高效、便捷的数据生成利器！
date: 2024-11-12 12:56:51
tags: [墨力计划,达梦,sqlark]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1855974936637091840
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习国产数据库路上的知识和经验。

# 社群交流
为了给大家提供一些技术交流的平台，目前已成立的技术交流群：
- Oracle 数据库交流群
- 国产数据库交流群
- Linux 技术交流群
- ChatGPT 4o 免费体验群

需要进群（**均已超过 200 人，需要邀请**）可以添加号主微信：Lucifer-0622，备注对应的群名即可。

@[TOC](目录)

# 前言
今年 1024 程序员节的时候，达梦推出了一款面向信创应用开发者的数据库开发和管理工具：**[达梦技术专家内部保留利器 - SQLark 百灵连接](https://www.sqlark.com/)**。

今天我在测试 SQLark 的数据迁移功能时，用到了其中的一个功能，感觉特别好用，就是 **[数据生成](https://www.sqlark.com/docs/zh/v1/data-generation/data-generation.html)** 功能。本来是打算在数据库迁移文章里顺便提一下的，想了想还是觉得这个功能很实用，所以单拎出来讲讲。

# SQLark
## 介绍
**[达梦技术专家内部保留利器 - SQLark 百灵连接](https://www.sqlark.com/)** 是一款面向信创应用开发者的数据库开发和管理工具，用于快速查询、创建和管理不同类型的数据库系统，现已支持达梦、Oracle 和 MySQL 数据库。

**SQLark 的功能一览：**
1. 提供了对多种数据库的连接支持，实现跨平台数据库管理的无缝切换；
2. 通过直观的可视化界面，轻松实现对模式、表、视图、物化视图、函数、存储过程、触发器、包等多种对象类型的增删改查。
3. 内置的 SQL 编辑器，基于语法解析，集成智能提示、实时语法检查及语法高亮等功能，提升编写 SQL 语句的效率与准确性；其直观的数据查看与编辑器，使用户能够直观地浏览数据内容并进行即时编辑。
4. 集成了数据生成、数据迁移及 ER 图生成等特色功能，助力开发人员更加高效、安全地完成数据管理任务。

## 支持平台
目前是免费下载，注册即用的一款开发与管理工具，目前支持以下版本客户端下载安装：
- **Windows 系统**：Microsoft Windows 7、Windows 8、Windows 8.1、Windows 10、Windows 11
- **macOS 系统**：macOS Monterey 12、macOS Ventura 13、macOS Sonoma 14
	- **支持的芯片**：Intel、Apple Silicon（M1/M2）

![](https://oss-emcsprod-public.modb.pro/image/editor/20241111-1855865215661912064_395407.png)

目前支持的数据库类型为：
- **达梦数据库**：DM 7.0 及以上
- **Oracle**：Oracle 11g 及以上
- **MySQL**：MySQL 5.7、8.0

## 免费使用
目前 SQLark 只需要注册即可免费使用，进入 **[SQLark 官网](https://www.sqlark.com/)** ，单击右上角的 **注册/登录**。

![](https://oss-emcsprod-public.modb.pro/image/editor/20241111-1855895834265661440_395407.png)

登录后就可以正常使用了。

# 数据生成
数据生成功能是一种高效生成测试数据的方式，帮助用户快速、可视化地生成大量测试数据。

SQLark 的数据生成功能提供了丰富的场景化的数据规则，涵盖人员、时间、位置、商业、产品等 8 大类 47 子类规则，可快速构建仿真测试数据环境，提高数据处理和分析的效率和质量。

>详细数据库生成规则可以参考：[https://www.sqlark.com/docs/zh/v1/data-generation/data-rule.html](https://www.sqlark.com/docs/zh/v1/data-generation/data-rule.html)

本文将为你介绍 SQLark 的数据生成功能，它能够更高效地满足不同的测试场景，帮助应用开发者们实现应用系统调试、以及 DBA/测试人员完成 POC 测试。

# 实战演示
我最开始注意到这个功能是因为在迁移测试时需要对源数据库进行一些测试数据的创建，便于更加全面的测试迁移工具的完善性。如果再配合 ChatGPT 一起使用，让 GPT 帮忙提前创建测试表结构，简直如虎添翼，酷爆了！！！

## 连接源数据库
首先，使用 SQLark 连接到源数据库 Oracle 19C：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241111-1855896773584236544_395407.png)

保存连接，双击即可连接 Oracle 19C 数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241111-1855896996637323264_395407.png)

## 创建测试用户
使用 SQLark 数据生成功能的前提是要存在测试用户以及对应数据表，所以我们需要提前创建好。

首先创建一个迁移用户：
```sql
SQL> create user lucifer identified by lucifer;
SQL> grant dba to lucifer;
```
然后使用 ChatGPT 生成了一些测试表结构：
```sql
conn lucifer/lucifer

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
创建完成后，可以通过 SQLark 查看已创建的表：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856157426140065792_395407.png)

这些表结构涵盖了常见的数据类型、约束和复杂关系，以确保在迁移测试过程中能够发现潜在的兼容性问题或性能瓶颈。迁移时可以先在 Oracle 中创建这些表，然后使用迁移工具迁移到达梦，观察各字段和约束的兼容性表现。

## Basic_Info
选择对应的表，右键选择数据生成功能：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856157726171213824_395407.png)

选择目标库表后，SQLark 将根据列名、列注释和字段类型等信息，自动匹配相应的数据规则，并在此过程中生成数据预览。SQLark 支持查看 12 条预览数据，方便直观查看数据预览及调整配置规则：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856158117399113728_395407.png)

在生成数据后，如某列数据不符合测试需求，可通过以下步骤重新配置该列的生成规则：
1. 单击该列名对应的规则配置单元格，在弹出配置窗口中，可自定义配置不同的数据生成规则。
2. 点击 应用于表格预览，可查看数据变更后的实时预览；如符合需求，点击 确定，该配置将生效。

通过查看 Basic_Info 表结构以及预览数据，可以发现以下问题需要进行修改。

1、age 列为年龄，正常应该不超过 100，生成的规则不符合，需要修改规则：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856158988304396288_395407.png)

2、gender 列存在约束 `gender CHAR(1) CHECK (gender IN ('M', 'F'))`，生成的规则不符合，需要修改规则：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856159238108753920_395407.png)

以下配置项确认无误后，可点击 **生成数据** 按钮：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856159525884145664_395407.png)

在确认生成界面，如果多张表的情况下，将展示表数据的生成顺序，上下拖动可调整顺序（这里只有一张表）：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856159806743130112_395407.png)

点击 **确认生成**，SQLark 将开始生成数据，窗口将显示运行进度、耗时、成功或失败详情：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856163049221140480_395407.png)

数据生成完成后，若生成失败，可在错误详情中查看具体原因，点击 **返回配置**， 可重新修改配置规则。

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856164227543740416_395407.png)

选择目标文件，点击 **加载** 按钮，即可加载所选配置文件。

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856165086109380608_395407.png)

Basic_Info 表数据生成完成。

## Customers
Customers 表不符合表结构限制的规则如下：

1、CITY 列字段长度为 50，建议修改为 **城市**：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856166014115917824_395407.png)

2、COUNTRY 列为国家，修改规则为国家：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856166264490700800_395407.png)

3、ZIP_CODE 列为邮编，SQLark 规则中没有邮编规则，可以使用正则表达式 `^[1-9][0-9]{5}$`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856167528163192832_395407.png)

以下配置项确认无误后，可点击 **生成数据** 按钮：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856167675819470848_395407.png)

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856167768161267712_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856168108436762624_395407.png)

Customers 表数据生成完成。

## Departments
Departments 表不符合表结构限制的规则如下：

1、NAME 列为部分名称，修改规则为部门：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856169624954482688_395407.png)

2、LOCATION 列为地址，修改规则为地址：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856170072767737856_395407.png)

3、BUDGET 列为部门预算，最多 12 位，必须大于 0，精确到小数点后两位：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856170979911806976_395407.png)

以下配置项确认无误后，可点击 **生成数据** 按钮：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856171021821292544_395407.png)

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856171079312617472_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856171480661372928_395407.png)

Departments 表数据生成完成。

## Employees
Employees 表不符合表结构限制的规则如下：

1、FIRST_NAME 列可以修改为英文名称：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856172055939526656_395407.png)

2、SALARY 列为薪资，最多 10 位，必须大于 0，精确到小数点后两位：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856173431302139904_395407.png)

以下配置项确认无误后，可点击 **生成数据** 按钮：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856173478580334592_395407.png)

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856173754112552960_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856173870185721856_395407.png)

Employees 表数据生成完成。

## Inventory
Inventory 表不需要修改规则，配置项确认无误后，直接生成即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856175584552955904_395407.png)

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856175636574908416_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856176184967573504_395407.png)

Inventory 表数据生成完成。

## Orders
Orders 表不符合表结构限制的规则如下：

1、STATUS 列存在约束 `status VARCHAR2(20) CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELED'))`，生成的规则不符合，需要修改规则：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856176702716653568_395407.png)

以下配置项确认无误后，可点击 **生成数据** 按钮：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856176788062351360_395407.png)

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856176919427952640_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856176999870509056_395407.png)

Orders 表数据生成完成。

## Order_Details
Order_Details 表不符合表结构限制的规则如下：

1、TOTAL_PRICE 列为虚拟列，目前 SQLark 暂不支持，所以生成时会报错：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856190314814386176_395407.png)

建议可以将虚拟列从数据生成功能中排除掉，不进行数据插入。

暂时将 TOTAL_PRICE 列删除，重新进行数据生成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856191699056340992_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856191832355516416_395407.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856191882812993536_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856191986282278912_395407.png)

Order_Details 表数据生成完成。

## Products
Products 表不符合表结构限制的规则如下：

1、NAME 列为产品名称，修改规则为产品名：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856192569252786176_395407.png)

2、CATEGORY 列为产品类型，修改规则为产品类别：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856192377308852224_395407.png)

以下配置项确认无误后，可点击 **生成数据** 按钮：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856192655676420096_395407.png)

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856192717785673728_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856192791982911488_395407.png)

Products 表数据生成完成。

## Sales_Stats
Sales_Stats 表不符合表结构限制的规则如下：

1、YEAR 列为年份，没有单独的年份规则，可以使用正则替代 `^\d{4}$`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856196246025809920_395407.png)

2、MONTH 列为月份，没有单独的月份规则，可以使用正则替代 `^(0[1-9]|1[0-2])$`：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856196384316207104_395407.png)

以下配置项确认无误后，可点击 **生成数据** 按钮：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856196455317385216_395407.png)

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856196526800908288_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856196651350765568_395407.png)

Sales_Stats 表数据生成完成。

## Warehouses
Warehouses 表不符合表结构限制的规则如下：

1、LOCATION 列为地址，修改规则为地址：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856197191975579648_395407.png)

以下配置项确认无误后，可点击 **生成数据** 按钮：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856197244198858752_395407.png)

**生成成功记得保存配置文件，下次可以通过加载配置文件来快速生成数据：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856197297114198016_395407.png)

数据生成完成后，查看表数据：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856197372246765568_395407.png)

Warehouses 表数据生成完成。

## ER 图
SQLark 还支持 ER 图功能，ER 图（实体关系图）用于描述实体及其之间关系的一种图形化表示方法，可以帮助开发者、DBA 以及项目团队更好地理解数据库的结构和数据库对象之间的关系。

点击工具栏 **ER 图** 按钮 ，选择所需的数据库连接和模式，点击 **生成 ER 图**；也可在对象导航栏中，选择指定的数据库模式，右键单击 **查看 ER 图**：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856198190228320256_395407.png)

ER 图生成后，将在界面中展示完整的数据库实体关系图布局：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856197811897905152_395407.png)

SQLark 还支持导出 ER 图：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856198611244167168_395407.png)

导出的 ER 图效果如下：

![](https://oss-emcsprod-public.modb.pro/image/editor/20241112-1856198860318715904_395407.png)

本文主要演示数据生成功能，其他功能不再赘述。

# 写在最后
测试数据生成成功，下一篇就是数据迁移测试了。

如果有遗漏或者不足的地方，欢迎评论区补充或者投稿，感谢阅读！

# 往期精彩文章
>[达梦数据库安装最详细教程](https://mp.weixin.qq.com/s/gjQBBvjIFsHC1rtEjn30nw)    
[一招教你学会达梦数据库的免密登录](https://mp.weixin.qq.com/s/hapMuAF9xg8fbdlKJpsN6A)  
[一文讲透达梦数据库的大小写敏感](https://mp.weixin.qq.com/s/pZIcZiICY1pUiTAWQRtUKg)  
[效率翻倍！达梦数据库 disql 使用技巧全攻略](https://mp.weixin.qq.com/s/MWQeqdvIfo9D2d8_vi7BTg)
[达梦数据库参数配置与一键优化指南](https://mp.weixin.qq.com/s/5EvUN21PZ3Oc0tDnygr7rw) 
[达梦 AWR 报告快速上手指南](https://mp.weixin.qq.com/s/4vl88Oj9Nal-goeoijAqWg)
[金仓数据库 KingbaseES V9 单机安装指南](https://mp.weixin.qq.com/s/Yd3gkFki_OJsCfCFKf1Ttw)    
[KingbaseES KSQL 免密登录的几种方式](https://mp.weixin.qq.com/s/u7HK4soHUght3p0tzHPanA)    
[KingbaseES 控制文件冗余与恢复秘籍](https://mp.weixin.qq.com/s/vdsFR2aPNp8Gys1G4qX5cQ)    
[南大通用 GBASE 8s V8.8 数据库最全安装指南](https://mp.weixin.qq.com/s/MwmvwR7sUQ6VuoftHM19mA)   
[GBase 8a MPP 集群部署最佳实践](https://mp.weixin.qq.com/s/zt6Jhv0liO5EsvWyc6YrOg)  
[GBase 8s GDCA 认证课后练习题大全（题库）](https://mp.weixin.qq.com/s/XL2jYOPEf9x_bXW0VFE6kg)   
[GBase 8s 数据库巡检报告及一键巡检脚本](https://mp.weixin.qq.com/s/oIEWt5pzK0KfhUq3GUNGCA)   
[YashanDB 一键生成 AWR 报告](https://mp.weixin.qq.com/s/i-L_tAF-XIIY_d4YCn0MIw)    
[YashanDB 数据库安装部署](https://mp.weixin.qq.com/s/sgB3WQ6A8mGl3QaIJj5v1A)  

---

<center>「喜欢这篇文章，您的关注和赞赏是给作者最好的鼓励」</center>