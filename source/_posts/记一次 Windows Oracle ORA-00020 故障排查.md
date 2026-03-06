---
title: 记一次 Windows Oracle ORA-00020 故障排查
date: 2025-12-27 11:15:58
tags: [墨力计划,数据库实操,性能优化,oracle]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/2004740369708310528
---

>大家好，这里是公众号 **DBA学习之路**，分享一些学习数据库路上的知识和经验。

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)

@[TOC](目录)

# 前言
今天有一套 Windows Oracle 数据库会话满了，连接报错 `ORA-00020: maximum number of processes (2000) exceeded`，应用无法连接。

# ORA-00020 介绍
首先，我们通过 Oracle 工具查看该错误的官方解释：
```bash
$ oerr ora 00020
00020, 00000, "maximum number of processes (%s) exceeded"
// *Cause:  All process state objects are in use.
// *Action: Increase the value of the PROCESSES initialization parameter.
```
关键参数说明：
- **`PROCESSES`**：定义了能够同时连接到数据库实例的最大操作系统进程数量。每个成功的客户端连接都会对应一个服务器进程，此参数限制了这些进程的总数。
- **`SESSIONS`**：定义了数据库允许的最大并发会话数。其默认值通常由公式 `(1.1 * PROCESSES) + 5` 自动计算得出。因此，当进程数达到上限时，会话数限制也会同步触发，新的数据库连接将无法建立。

`ORA-00020` 错误通常由以下几类原因引起：
1.  **应用程序连接池泄漏**：连接池配置不当或代码缺陷导致连接未正确释放，连接数随时间持续增长。
2.  **数据库参数配置过低**：`PROCESSES` 初始设置未能预估业务增长，无法满足实际并发需求。
3.  **异常会话堆积**：
    - 长时间未提交或回滚的事务。
    - 被锁阻塞的会话链，产生大量等待进程。
    - 客户端异常断开（如网络中断、程序崩溃）后，数据库端会话未能及时清理。
4.  **监控/管理工具过度占用**：如 Oracle Enterprise Manager (OEM)、DBConsole、第三方监控或备份软件可能创建大量会话。
5.  **数据库遭受攻击或异常访问**：连接风暴（Connection Storm）或恶意程序发起海量连接尝试。

该错误直接影响业务系统的可用性，需立即定位并解决。

# 问题分析
检查数据库当前会话使用情况：
```sql
-- 检查当前会话分布
SQL> set line2222 pages1000
col username for a10
col program for a30
col machine for a30
select username,program,machine,status,count(1) from v$session where username is not null group by username,program,machine,status;

USERNAME             PROGRAM                        MACHINE                        STATUS     COUNT(1)
-------------------- ------------------------------ ------------------------------ -------- ----------
DBSNMP               emagent.exe                    WORKGROUP\WIN-KTMVJAA4QIM      ACTIVE            1
SYS                  sqlplus.exe                    WORKGROUP\WIN-KTMVJAA4QIM      ACTIVE            1
LIS                  JDBC Thin Client               WIN-KTMVJAA4QIM                INACTIVE         10
EMR                  JDBC Thin Client               WIN-KTMVJAA4QIM                INACTIVE         30
HIS                  JDBC Thin Client               WIN-KTMVJAA4QIM                INACTIVE         30
SYSMAN               OMS                            WIN-KTMVJAA4QIM                INACTIVE       1896

-- 查看数据库参数设置
show parameter processes;
show parameter sessions;
```
**SYSMAN 用户通过 OMS 程序创建了 1896 个 `INACTIVE` 状态的会话**，几乎占满了全部进程资源。而正常的业务用户（HIS， EMR， LIS）连接数合计仅 70 个，处于合理范围。

- **SYSMAN** 是 Oracle Enterprise Manager（EM） 相关的核心管理用户。
- **OMS** 程序通常与 Oracle Management Server 或 Database Control（DBConsole）相关联。

结合环境判断，这台 Windows 数据库服务器很可能默认安装并启动了 **Oracle Database Control（DBConsole）** 服务。

# DBConsole 介绍
**Oracle Database Control（DBConsole）** 是 Oracle 提供的基于 Web 的轻量级数据库管理工具，它是 Enterprise Manager 的基础版本，通常随数据库软件默认安装。主要功能包括：
- 数据库性能监控与诊断
- 表空间与存储管理
- 用户、角色与权限管理
- 基本的备份与恢复操作

在通过 DBCA 建库时，通常会提示是否配置并启动 DBConsole：

![](https://oss-emcsprod-public.modb.pro/image/editor/20251227-2004749186496028672_395407.png)

DBConsole 在运行过程中，有时会因为内部机制或异常状态产生大量“僵尸”会话，并且这些会话长期处于 `INACTIVE` 状态却不释放，持续占用 `PROCESSES` 名额。

在生产环境中，若无需使用此控制台，**通常建议将其关闭**。如需更强大、更稳定的集中监控管理，应部署 **Enterprise Manager Cloud Control (EMCC)**。

**EMCC 安装文档可以参考**：
- [EMCC 13.5 完整安装详细版](https://www.modb.pro/db/1760220352349294592)
- [Oracle Linux 9 安装 EMCC 13.5：避坑细节与实战经验汇总！](https://www.modb.pro/db/1927601150161858560)
- [Oracle EMCC 13.5 集群安装部署指南](https://www.modb.pro/db/1939579573704863744)
- [实战篇：Oracle EMCC 24ai 保姆级安装教程！](https://www.modb.pro/db/1869933671994638336)

# 解决方案
检查发现当前主机开启了 OracleDBConsoleORCL 服务，手动关闭 EM：
```bash
## 停止 EM 控制台服务
emctl stop dbconsole

# Windows服务管理（永久生效）
# 1. 打开services.msc
# 2. 找到"OracleDBConsoleORCL"服务
# 3. 将启动类型改为"禁用"
# 4. 停止服务（如果正在运行）

# 或者使用命令行
sc config OracleDBConsoleORCL start= disabled
net stop OracleDBConsoleORCL
```
确保下次启动默认不启动 EM，需要在 Windows 服务中关闭 OracleDBConsoleORCL 服务的自动启动。

关闭后再次检查会话情况：
```sql
SQL> set line2222 pages1000
col username for a10
col program for a30
col machine for a30
select username,program,machine,status,count(1) from v$session where username is not null group by username,program,machine,status;

USERNAME             PROGRAM                        MACHINE                        STATUS     COUNT(1)
-------------------- ------------------------------ ------------------------------ -------- ----------
DBSNMP               emagent.exe                    WORKGROUP\WIN-KTMVJAA4QIM      ACTIVE            1
SYS                  sqlplus.exe                    WORKGROUP\WIN-KTMVJAA4QIM      ACTIVE            1
LIS                  JDBC Thin Client               WIN-KTMVJAA4QIM                INACTIVE         10
EMR                  JDBC Thin Client               WIN-KTMVJAA4QIM                INACTIVE         30
HIS                  JDBC Thin Client               WIN-KTMVJAA4QIM                INACTIVE         30
```
可见，SYSMAN 用户的所有 OMS 会话已全部消失，连接池立刻释放了近1900个进程名额。应用连接随即恢复正常。

# 总结
此次连接数爆满并非业务压力所致，而是 Oracle Database Control（DBConsole）异常堆积会话 导致，SYSMAN 用户通过 OMS 程序产生了近 1900 个无效会话，迅速耗尽了 PROCESSES 参数限制，使得正常应用无法建立新连接。

在 Windows 平台中，DBConsole 服务（OracleDBConsoleORCL）若长期运行且管理不当，容易发生会话泄露。其产生的会话多数处于 INACTIVE 状态，但依然占用进程资源，这在默认参数设置下极易触发连接数上限。

**预防建议**：
- **生产环境慎用 DBConsole**：对于正式业务库，建议关闭 DBConsole，如需集中监控管理，可部署功能更完善的 EMCC（Enterprise Manager Cloud Control）。
- **参数合理规划**：根据业务实际连接需求适当调整 PROCESSES 与 SESSIONS，并保留适量冗余。

因此，数据库运维不仅要关注核心参数与 SQL 性能，还需将数据库周边组件与服务纳入监控体系，形成全方位的资源视角，才能防患于未然，保障系统稳定运行。

---

![](https://oss-emcsprod-public.modb.pro/image/editor/20251219-2001925766843015168_395407.png)