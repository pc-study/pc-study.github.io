---
title: 重磅发布：Oracle ADG 一键自动化搭建脚本
date: 2025-07-17 17:04:48
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1945771655838576640
---

> 大家好，这里是 **DBA 学习之路**，专注于提升数据库运维效率。

# 前言

在 Oracle 数据库高可用架构中，Active Data Guard (ADG) 是保障数据安全和业务连续性的核心方案。然而传统 ADG 搭建涉及数十项复杂配置（监听、TNSNAMES、参数文件、密码文件、日志传输、应用服务等），步骤繁琐且易错，即使资深 DBA 也需 1-2 小时完成部署。

![](https://files.mdnice.com/user/16270/616eee76-a5d7-4857-9480-049f42a91a6b.png)

为此，我们正式发布 Oracle ADG 全自动搭建脚本，实现从零到生产级 ADG 环境的一键式部署。该脚本通过严密的流程设计和异常处理机制，将传统人工操作转化为标准化、自动化的可靠流程，极大降低运维风险。

**OracleADGSetup 脚本核心价值：**

- **分钟级部署**：全程无人工干预，10 分钟内完成 ADG 环境构建；
- **开箱即用**：自动配置所有必需组件，生成生产就绪环境；
- **智能检测**：前置环境校验（归档模式/补丁/网络）、实时进度跟踪；
- **无缝切换**：内置标准化主备切换模块，保障容灾演练效率；

> 下载脚本请联系作者微信：`krielwus0725`（备注：**ADG 脚本**）

# 环境准备

首先，使用 Oracle 一键安装脚本部署好主备数据库环境。

**主库：** 无需手动开启归档模式以及强制日志模式，脚本会自动检测配置。

![](https://files.mdnice.com/user/16270/78a7ab4f-9edb-4656-b30b-6ac2d7a13bb4.png)

**备库：** 备库无需手动建库，脚本自动完成 `RMAN` 操作。

![](https://files.mdnice.com/user/16270/938a4a02-98c1-4806-aca6-2091521a43ab.png)

# 一键搭建 ADG 实战

脚本初始化权限：

![](https://files.mdnice.com/user/16270/3ecc401d-48a7-4957-891b-aac64227064f.png)

查看脚本参数以及使用帮助：

![](https://files.mdnice.com/user/16270/7bb66d70-e0c2-4a85-91ae-a90e9653b229.png)

oracle 用户下执行一键自动化部署：

```bash
[oracle@primarynode:/soft]$ ./OracleADGSetup.sh -p 10.168.1.110 -s 10.168.1.111
```

脚本执行过程如下：

![](https://files.mdnice.com/user/16270/0cafec25-ecee-4255-88a6-d991c1fdfbf6.png)

同步状态验证：

![](https://files.mdnice.com/user/16270/c70dbb5a-79f2-4fbc-9c23-b80f859295b3.png)

同步正常。

# 主备切换演练（生产级容灾验证）

使用搭建好的 ADG 环境进行主备切换测试。

**主库：**

![](https://files.mdnice.com/user/16270/98370e8c-9c36-4758-84e3-dc2878e30e43.png)

**备库：**

![](https://files.mdnice.com/user/16270/16bcab7d-a434-4f92-ba6b-6d9ca3892c99.png)

主备切换没问题。

# 写在最后

此脚本不仅实现了 ADG 部署的**标准化**和**自动化**，更深层价值在于：

1. **风险控制**：避免人工操作失误导致的数据不一致；
2. **资源优化**：节省 90% 的部署时间，释放 DBA 生产力；
3. **知识沉淀**：将专家经验转化为可复用的技术资产；
4. **敏捷响应**：快速构建开发/测试/灾备环境

> **特别提示**：生产环境部署前建议在测试环境验证，详细参数说明及定制化需求请联系作者 `krielwus0725`。

---

>已加入 `DB信息差` 星球的用户可以优惠价获取脚本！

![](https://files.mdnice.com/user/16270/9ac9691f-949d-4c4b-a1f3-0277487bf34f.png)
