---
title: 有趣的对话体：SQL零基础入门，一文带你轻松学会增删改查！
date: 2021-06-10 15:14:52
tags: [oracle,sql]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/70351
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)


### 前言

***<font color='red'>SQL是什么？</font>***

**官方解释：** SQL (Structured Query Language:结构化查询语言) 是用于管理关系数据库管理系统（RDBMS）。

***<font color='red'>SQL能用来干什么？</font>***

**通俗的讲：** 让您可以访问和处理数据库，包括数据插入、查询、更新和删除。

![SQL](https://img-blog.csdnimg.cn/20210607125934124.png)

**<font color='blue'>下面让我们看看小美是如何零基础学习SQL的：</font>**

👸小美：Lucifer，最新领导让我负责数据库开发，需要写SQL，但是我零基础没学过，有办法快速入门吗？

🙉Lucifer：小美啊，SQL语言其实入门不难，我先来教你最简单的增删改查基础吧。

👸小美：好的，我试试看，奥力给。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607154038119.png)
🙉Lucifer：Ok，那我们先来一个最简单常用的SQL语句DUAL查询： `SELECT SYSDATE FROM DUAL;`。

![sysdate](https://img-blog.csdnimg.cn/20210607140550277.png)

使用这个SQL语句可以查看数据库当前时间，当然也可以把 **SYSDATE** 换成任意东西。

例如：

**计算器：`SELECT 365 * 24 FROM dual;`**

![计算器](https://img-blog.csdnimg.cn/2021060714094030.png)

这个SQL我们在开发中会经常用到，作为入门第一个SQL轻松有趣。小美，你觉得难吗？

👸小美：这个太实用了，以后计算器和日历都可以省了，哈哈哈。

🙉Lucifer：是的，其实我们刚刚已经不经意的学习了SQL语言增删改查中的 **<font color='blue'>查</font>** 操作了。接下来，我要介绍一个新的对象：**<font color='blue'>表</font>** ：是相关的数据项的集合，它由列和行组成。通俗的讲，数据库相当于图书馆，表就类似于其中的一个个书架，表数据就类似于一本本书。我们查询数据库表的数据，就好比我们进入图书馆去找一本喜欢的书。我这么说，你能理解吗？

**<font color='blue'>查</font>** 的基本语法：`select * from 表名;`

👸小美：可以可以，这个比喻我一下子就听懂了，原来数据库查询是这样的，那表是怎么创建的呢？

🙉Lucifer：不要着急，先来介绍一下数据库中最常用的3个数据类型：NUMBER，VARCHAR2，DATE，分别为数字型，字符型，日期型。顾名思义，即用来定义表中列字段用来存放数据的类型。

![数据类型](https://img-blog.csdnimg.cn/20210607163421767.png)

👸小美：嗯嗯，这个能理解，跟java，C 好像有些相似。

🙉Lucifer：嗯嗯。理解了这个，就可以开始建表了，现在来创建一个简单的图书馆书架表。

	CREATE TABLE bookshelf
	(
	BOOK_ID NUMBER,
	BOOK_NAME VARCHAR2(100),
    BOOK_TYPE VARCHAR2(100),
    AUTHOR VARCHAR2(100),
	INTIME DATE
	);

表名为：bookshelf，有列：图书id，图书名称，图书类型，作者，入库时间。通过上面学习的 `SELECT`语法，来查询一下这张表：

`SELECT * FROM bookshelf;`

![查询图书表](https://img-blog.csdnimg.cn/20210607150212744.png)

可以发现，新建的bookshelf表没有任何记录。现在，图书馆里已经增加一个空的书架，是不是需要将书放入书架上呢？这时就需要用到 **<font color='blue'>增</font>** 操作了。

👸小美：嗯嗯，很形象，感觉自己就像个图书管理员一样，哈哈哈。

🙉Lucifer：哈哈，没错，我们数据库管理员跟图书管理员可以说是异曲同工。好了，继续说放书吧，现在假设有一本书《飘》，作者：玛格丽特·米切尔，类型：长篇小说。现在通过 <font color='blue'>`INSERT`</font> 将这本书放入书架上：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607153934761.png)

	INSERT INTO bookshelf 
	(book_id,
	book_name,
	book_type,
	author,
	intime)
	VALUES
	(1,
	'飘',
	'长篇小说',
	'玛格丽特·米切尔',
	SYSDATE);
	COMMIT;

**<font color='blue'>增</font>** 的基本语法：`insert into 表名 (需要插入的列名，用逗号隔开) values (对应列名的值);`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607150927461.png)

通过sql查询发现，这本书《飘》已经放入了书架上，可供大家借用和查看。

👸小美：太形象了，那如果我把书的作者写错了，那怎么办呢？再插入一条吗？

🙉Lucifer：这个问题问的很好，因为人为的操作总会存在误差，因此提出了 **<font color='blue'>改</font>** 和  **<font color='blue'>删</font>** 两种操作。

**<font color='blue'>改</font>** 的基本语法： `UPDATE 表名 SET 列名 = 新的值;`

**<font color='blue'>删</font>** 的基本语法： `DELETE FROM 表名;`

现在来模拟一下场景：

**1、修改作者名：**

	UPDATE bookshelf SET author='Margaret Mitchell';
    COMMIT;

![修改作者名](https://img-blog.csdnimg.cn/20210607152814914.png)

**2、下架图书：**

	DELETE FROM bookshelf;
	COMMIT;

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20210610-639a46f7-4732-4005-9a98-0b06b0582ee5.png)

通过以上两个场景，演示了 **<font color='blue'>改</font>** 和  **<font color='blue'>删</font>** 两种操作。

👸小美：lucifer，你讲的很明了，我现在已经懂了增删改查四种操作了，迫不及待想要动手开始操作了！

🙉Lucifer：小美，先别急，你没有发现一个严重的问题吗？如果书架上不止一本书呢？那你怎么对指定的那本书进行操作呢？有思考过吗？

👸小美：啊！对哦，上面都是演示的一本书，如果有多本书，是不是也有对应的操作可以来筛选呢？

🙉Lucifer：没错，很聪明。现在隆重有请 **<font color='blue'>WHERE</font>** 查询条件登场。正如上面所说，WHERE 子句用于提取那些满足指定条件的记录。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607153749625.png)

**先上架3本书：**

	INSERT INTO bookshelf (book_id,book_name,book_type,author,intime) VALUES (1,'飘','长篇小说','玛格丽特·米切尔',SYSDATE);
	INSERT INTO bookshelf (book_id,book_name,book_type,author,intime) VALUES (2,'倾城之恋','爱情小说','张爱玲',SYSDATE);
	INSERT INTO bookshelf (book_id,book_name,book_type,author,intime) VALUES (3,'从你的全世界路过','短篇小说','张嘉佳',SYSDATE);
    COMMIT;

![插入数据](https://img-blog.csdnimg.cn/20210607155152502.png)

**查看《倾城之恋》：**

	SELECT * FROM bookshelf WHERE BOOK_NAME = '倾城之恋';
    
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607155944655.png)

**更新《飘》：**

	UPDATE bookshelf SET author='Margaret Mitchell' WHERE book_name = '飘';
	COMMIT;
    
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607155907619.png)

**删除《从你的全世界路过》：**

	DELETE FROM bookshelf WHERE book_name = '从你的全世界路过';
	COMMIT;

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607160155743.png)

通过上面的几个栗子🌰，应该能很好的理解 **<font color='blue'>WHERE</font>** 查询条件的使用了。

👸小美：懂了懂了，lucifer，我现在是不是可以去开发了？好像练练手啊！！！

🙉Lucifer：嗯。现在只能说是入门了，会简单的增删改查是数据库开发的第一部，所有的数据库操作都是基于SQL语言的。

👸小美：好的好的。有问题了，我在继续问你，谢谢lucifer！！！Thanks♪(･ω･)ﾉ。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607160623609.png)

**<font color='red'>文末，赠送给各位看官几个一句SQL画图的趣味小SQL：</font>**

**五角星：**

```sql
WITH a AS
 (SELECT DISTINCT round(SUM(x) over(ORDER BY n)) x,
                  round(SUM(y) over(ORDER BY n)) y
    FROM (SELECT n,
                 cos(trunc(n / 20) * (1 - 1 / 5) * 3.1415926) * 2 x,
                 sin(trunc(n / 20) * (1 - 1 / 5) * 3.1415926) y
            FROM (SELECT rownum - 1 n
                    FROM all_objects
                   WHERE rownum <= 20 * 5)))
SELECT REPLACE(sys_connect_by_path(point,
                                   '/'),
               '/',
               NULL) star
  FROM (SELECT b.y,
               b.x,
               decode(a.x,
                      NULL,
                      ' ',
                      '*') point
          FROM a,
               (SELECT *
                  FROM (SELECT rownum - 1 + (SELECT MIN(x)
                                               FROM a) x
                          FROM all_objects
                         WHERE rownum <= (SELECT MAX(x) - MIN(x) + 1
                                            FROM a)),
                       (SELECT rownum - 1 + (SELECT MIN(y)
                                               FROM a) y
                          FROM all_objects
                         WHERE rownum <= (SELECT MAX(y) - MIN(y) + 1
                                            FROM a))) b
         WHERE a.x(+) = b.x
           AND a.y(+) = b.y)
 WHERE x = (SELECT MAX(x)
              FROM a)
 START WITH x = (SELECT MIN(x)
                   FROM a)
CONNECT BY y = PRIOR y
       AND x = PRIOR x + 1;
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210607161038642.png)

**<font color='red'>调整期中数字5, 你还可以输出7角星, 9角星。</font>**

**奥运五环：**

```sql
WITH a AS
 (SELECT DISTINCT round(a.x + b.x) x,
                  round(a.y + b.y) y
    FROM (SELECT (SUM(x) over(ORDER BY n)) x,
                 round(SUM(y) over(ORDER BY n)) y
            FROM (SELECT n,
                         cos(n / 30 * 3.1415926) * 2 x,
                         sin(n / 30 * 3.1415926) y
                    FROM (SELECT rownum - 1 n
                            FROM all_objects
                           WHERE rownum <= 30 + 30))) a,
         (SELECT n,
                 (SUM(x) over(ORDER BY n)) x,
                 round(SUM(y) over(ORDER BY n)) y
            FROM (SELECT n,
                         cos(m / 3 * 3.1415926) * 2 * 15 x,
                         sin(m / 3 * 3.1415926) * 15 y
                    FROM (SELECT CASE
                                   WHEN rownum <= 2 THEN
                                    3
                                   WHEN rownum = 3 THEN
                                    -2
                                   ELSE
                                    -6
                                 END m,
                                 rownum - 1 n
                            FROM all_objects
                           WHERE rownum <= 5))) b)
SELECT REPLACE(sys_connect_by_path(point,
                                   '/'),
               '/',
               NULL) star
  FROM (SELECT b.y,
               b.x,
               decode(a.x,
                      NULL,
                      ' ',
                      '*') point
          FROM a,
               (SELECT *
                  FROM (SELECT rownum - 1 + (SELECT MIN(x)
                                               FROM a) x
                          FROM all_objects
                         WHERE rownum <= (SELECT MAX(x) - MIN(x) + 1
                                            FROM a)),
                       (SELECT rownum - 1 + (SELECT MIN(y)
                                               FROM a) y
                          FROM all_objects
                         WHERE rownum <= (SELECT MAX(y) - MIN(y) + 1
                                            FROM a))) b
         WHERE a.x(+) = b.x
           AND a.y(+) = b.y)
 WHERE x = (SELECT MAX(x)
              FROM a)
 START WITH x = (SELECT MIN(x)
                   FROM a)
CONNECT BY y = PRIOR y
       AND x = PRIOR x + 1;

```

![奥运五环](https://img-blog.csdnimg.cn/20210607161333885.png)

**打印当月日历：**

```sql
SELECT MAX(decode(dow,
                  1,
                  d,
                  NULL)) sun,
       
       MAX(decode(dow,
                  2,
                  d,
                  NULL)) mon,
       
       MAX(decode(dow,
                  3,
                  d,
                  NULL)) tue,
       
       MAX(decode(dow,
                  4,
                  d,
                  NULL)) wed,
       
       MAX(decode(dow,
                  5,
                  d,
                  NULL)) thu,
       
       MAX(decode(dow,
                  6,
                  d,
                  NULL)) fri,
       
       MAX(decode(dow,
                  7,
                  d,
                  NULL)) sat

  FROM (SELECT rownum d,
               
               rownum - 2 + to_number(to_char(trunc(SYSDATE,
                                                    'MM'),
                                              'D')) p,
               
               to_char(trunc(SYSDATE,
                             'MM') - 1 + rownum,
                       'D') dow
        
          FROM all_objects
        
         WHERE rownum <=
              
               to_number(to_char(last_day(to_date(SYSDATE)),
                                 'DD')))

 GROUP BY trunc(p / 7)

 ORDER BY sun NULLS FIRST;
```

![打印日历](https://img-blog.csdnimg.cn/20210607161741189.png)


---

# 往期精彩文章
>[Oracle 一键巡检自动生成 Word 报告](https://mp.weixin.qq.com/s/0xFe5m1DQ0ucT2_266hsrA)    
[Oracle 一键安装合集](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5MzcwNzQ0MQ==&action=getalbum&album_id=3497774649285296131#wechat_redirect)    
[Oracle一键安装脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/gv6t97FFyMsd6e4GH1HAwQ)    
[Oracle一键巡检脚本的 21 个疑问与解答](https://mp.weixin.qq.com/s/4zI73auIUhwSRb7qL3UIfw)    
[全网首发：Oracle 23ai 一键安装脚本（非 RPM）](https://mp.weixin.qq.com/s/UL0BSMCAZrOQgCoWpDMGew)    
[Oracle 19C 最新 RU 补丁 19.24 ，一键安装！](https://mp.weixin.qq.com/s/T7GbpwhnMugzk7PB6hAoJQ)    
[Oracle Linux 7.9 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/dT4tFMYVZ3mh49CI6V3YEA)    
[RedHat 9.4(aarch64) 一键安装 Oracle 19C](https://mp.weixin.qq.com/s/cQJ6gP1bM_7m0H5-Dha4TA)    
[openEuler 22.03 LTS SP4 一键安装 Oracle 19C RAC](https://mp.weixin.qq.com/s/sx1E4GIvIeQXp2vGMmVr2A)    
[RHEL 7.9 一键安装 Oracle 19C 19.23 RAC](https://mp.weixin.qq.com/s/mUHqU5hQ9GdH2bKuClPt5A)    
[Oracle DataGuard GAP 修复手册](https://mp.weixin.qq.com/s/Trt7gYkQVoL5A803WlDL6Q)    
[优化 Oracle：最佳实践与开发规范](https://mp.weixin.qq.com/s/DysIcb-p11j56d3YtlqpcQ)    
[DBA 必备：Linux 软件源配置全攻略](https://mp.weixin.qq.com/s/SmncWuYAubj0tnOw35aJGA)    
[Linux 一键配置时钟同步全攻略](https://mp.weixin.qq.com/s/yvth1vorP3JjUp3g3vPBAQ)    

---

感谢您的阅读，这里是 **Lucifer三思而后行**，欢迎**点赞+关注**，我会持续分享数据库知识、运维技巧。