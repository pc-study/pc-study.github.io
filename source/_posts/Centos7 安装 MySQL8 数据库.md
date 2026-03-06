---
title: Centos7 安装 MySQL8 数据库
date: 2026-01-08 15:28:55
tags: [墨力计划,mysql,mysql 8.0]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2008435275916713984
---

# 前言

最近在搭建新的数据库环境，正好记录一下 MySQL 8.0 的安装过程。作为一个数据库爱好者，我发现在实际安装过程中，有些细节如果提前注意到，真的能少走很多弯路。所以想把这些经验分享出来，希望能给大家一些参考。

我这次安装的是 MySQL 8.0.30 版本，操作系统是 CentOS 7.9。整个过程花了大概一个下午的时间，整体还算顺利，但也遇到了一些小问题，后面会一一提到。

# 准备阶段：环境检查

在开始安装之前，我先检查了一下系统环境。这是很重要的一步，毕竟基础不牢，后面可能会遇到各种奇怪的问题。

- **操作系统**：我用的 CentOS 7.9，之前用这个版本挺稳定的；
- **内存**：准备了 8GB，因为我后续还要做一些测试；
- **磁盘空间**：分了 50GB 给数据目录，独立挂载的，这样性能会好一些；
- **权限**：整个过程需要用 root 用户操作；

## 防火墙处理

我习惯先把防火墙关掉，等数据库跑起来再根据需要配置。因为是在内网环境，所以暂时关掉问题不大。

```bash
# 看看防火墙状态
systemctl status firewalld.service

# 停掉服务
systemctl stop firewalld.service

# 禁止开机启动
systemctl disable firewalld.service
```

如果需要在生产环境保持防火墙开启，记得开放 3306 端口：

```bash
firewall-cmd --zone=public --add-port=3306/tcp --permanent
firewall-cmd --reload
```

## 下载和安装

MySQL 官网的下载速度其实还可以，我直接用了 wget 下载。选择二进制包主要是因为安装简单，不用编译，节省时间。

```bash
# 下载安装包
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-8.0.30-el7-x86_64.tar.gz

# 解压到 /usr/local
tar -xf mysql-8.0.30-el7-x86_64.tar.gz -C /usr/local/

# 重命名一下，方便后续管理
cd /usr/local/
mv mysql-8.0.30-el7-x86_64 mysql
```

## 检查依赖

虽然二进制包已经包含了大部分依赖，但我还是习惯检查一下，防止后面出问题：

```bash
ldd /usr/local/mysql/bin/mysqld | grep "not found"

# 如果有缺失，安装一下
yum install -y libaio numactl-libs ncurses-compat-libs
```

## 创建专用用户

我觉得为 MySQL 创建专门的用户是个好习惯，这样更安全，权限也更清晰。

```bash
groupadd mysql
useradd -r -g mysql mysql
echo "mysql:mysql" | chpasswd
```

## 规划目录结构

目录规划这块我花了一些时间思考。之前吃过亏，把日志和数据放在同一个磁盘上，结果磁盘 I/O 成了瓶颈。这次特意做了分离：

- 二进制文件：`/usr/local/mysql`（系统盘）
- 数据文件：`/data/mysql/data`（单独的高性能 SSD）
- 日志文件：`/data/mysql/log`（另一块磁盘）
- 临时文件：`/data/mysql/tmp`（高速磁盘）

实际操作命令：

```bash
# 给软件目录授权
chown -R mysql:mysql /usr/local/mysql/
chmod -R 755 /usr/local/mysql/

# 创建数据目录
mkdir -p /data/mysql/log/
mkdir -p /data/mysql/data/
mkdir -p /data/mysql/tmp/

# 创建错误日志文件
touch /data/mysql/log/error.log

# 授权
chown -R mysql:mysql /data
chmod -R 755 /data
```

## 初始化数据库

这是比较关键的一步。我用的命令是：

```bash
/usr/local/mysql/bin/mysqld --initialize \
  --user=mysql \
  --datadir=/data/mysql/data \
  --basedir=/usr/local/mysql \
  --lower_case_table_names=1
```

这里有个注意事项：`lower_case_table_names` 参数在 MySQL 8.0 中必须在初始化时设置，之后修改需要重新初始化。我之前就因为这个重新搞了一次，所以特别提醒一下。

初始化完成后，MySQL 会给 root 生成一个临时密码，记得把这个密码记下来，第一次登录要用。

## 配置文件调优

配置文件这块我参考了官方文档和一些最佳实践，根据自己的硬件情况做了调整。下面是我的配置：

```bash
cat >/etc/my.cnf<<'EOF'
[client]
port = 3306
socket = /data/mysql/tmp/mysql.sock

[mysql]
prompt="\u@db \R:\m:\s [\d]> "
no-auto-rehash

[mysqld]
user = mysql
port = 3306
basedir = /usr/local/mysql
datadir = /data/mysql/data
socket = /data/mysql/tmp/mysql.sock
pid-file = /data/mysql/tmp/mysql.pid
character-set-server=utf8mb4
collation-server = utf8mb4_general_ci

sql_mode='NO_UNSIGNED_SUBTRACTION,NO_ENGINE_SUBSTITUTION'

open_files_limit = 65535
innodb_open_files = 65535
back_log=1024
max_connections = 512
max_connect_errors=1000000
interactive_timeout=300
wait_timeout=300
max_allowed_packet = 1024M
secure_file_priv=''
lower_case_table_names=1
log-error=/data/mysql/log/error.log

slow_query_log=ON
slow_query_log_file=/data/mysql/log/slow_mysql.log
long_query_time=2

innodb_flush_log_at_trx_commit=1
innodb_log_file_size =1G
innodb_redo_log_capacity=8388608
innodb_log_group_home_dir=./

log-bin-trust-function-creators=1
sync_binlog = 1
binlog_cache_size = 16M
max_binlog_cache_size = 1G
max_binlog_size=1G
log-bin=mysql-bin
relay-log=mysql-relay-bin
binlog_format=row
binlog_row_image=full
server-id = 1
authentication_policy  =mysql_native_password

innodb_buffer_pool_size=4G
innodb_buffer_pool_instances=4
EOF

chmod 644 /etc/my.cnf
```

几个重要参数的考虑：

1. **缓冲池大小**：我设置为 4G，因为系统有 8G 内存。通常建议是物理内存的 60-80%
2. **字符集**：用了 utf8mb4，现在基本都是这个配置了
3. **二进制日志**：开启并设置为 row 模式，方便后续做主从复制

## 启动服务

```bash
/usr/local/mysql/support-files/mysql.server start

# 创建一些软链接，方便使用
ln -s /usr/local/mysql/support-files/mysql.server /etc/init.d/mysql
ln -s /usr/local/mysql/bin/mysql /usr/bin/mysql
ln -s /usr/local/mysql/mysql.sock /var/mysql.sock

service mysql restart
```

## 设置开机自启

我比较喜欢用 systemd 管理服务：

```bash
cat > /etc/systemd/system/mysqld.service << 'EOF'
[Unit]
Description=MySQL Server
Documentation=man:mysqld(8)
Documentation=http://dev.mysql.com/doc/refman/en/using-systemd.html
After=network.target
After=syslog.target

[Install]
WantedBy=multi-user.target

[Service]
User=mysql
Group=mysql
Type=notify
TimeoutSec=0
PermissionsStartOnly=true
ExecStart=/usr/local/mysql/bin/mysqld --defaults-file=/etc/my.cnf
LimitNOFILE = 65535
Restart=on-failure
RestartPreventExitStatus=1
PrivateTmp=false
EOF

systemctl daemon-reload
systemctl enable mysqld
systemctl start mysqld
systemctl status mysqld
```

## 修改密码和权限

第一次登录要用临时密码，然后立即修改：

```bash
mysql -uroot -p

# 修改密码
alter user 'root'@'localhost' identified by '你的新密码';

# 允许远程访问（根据实际情况决定）
use mysql;
update user set user.Host='%' where user.User='root';

flush privileges;
```

## 验证安装

最后做个简单的测试，确保一切正常：

```sql
-- 创建测试数据库
CREATE DATABASE test_db;
USE test_db;

-- 创建测试表
CREATE TABLE test_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入测试数据
INSERT INTO test_table (name) VALUES ('测试数据1'), ('测试数据2');

-- 查询验证
SELECT * FROM test_table;

-- 清理
DROP DATABASE test_db;
```

# 一些个人体会

这次安装整体还算顺利，遇到的小问题：

1. **目录权限问题**：第一次启动时因为目录权限不对，报错了。解决方法就是确保所有相关目录的所有者都是 mysql 用户。
2. **配置文件路径**：有时候 MySQL 会读取默认位置的配置文件，如果配置了多个地方，可能会有冲突。我选择把配置统一放在 `/etc/my.cnf`。
3. **内存设置**：刚开始 `innodb_buffer_pool_size` 设得太大，导致系统内存不足。后来调整到合适的大小就好了。

有几个地方我觉得特别重要：

1. **规划先行**：特别是目录结构和存储规划，提前想好能避免后续很多麻烦。
2. **参数理解**：不要直接复制别人的配置，要根据自己的硬件和业务需求调整。比如缓冲池大小、连接数这些。
3. **安全考虑**：即使是测试环境，也要养成良好的安全习惯，比如用强密码、限制访问权限等。
4. **文档记录**：把安装过程和配置记录下来，以后维护或者迁移的时候会很有帮助。

MySQL 8.0 的新特性挺多的，比如更好的性能、更强的安全特性等。安装只是第一步，后续还有很多可以探索和学习的地方。

希望我的这份笔记对你有帮助。如果你在安装过程中遇到其他问题，或者有更好的建议，欢迎一起交流讨论。毕竟，学习数据库的路上，我们都是同行者。
