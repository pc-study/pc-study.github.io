---
title: Oracle SQLcl MCP Server 部署实践总结
date: 2025-07-25 09:26:29
tags: [墨力计划,数据库实操]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1948254241185869824
---

# 前言

最近实践了 Oracle SQLcl MCP Server 的本地部署，基于葛大爷的文章 [Oracle MCP Server 本地部署保姆级教程](https://mp.weixin.qq.com/s/oKE7Xnqe-NwDzAHLYWSbbw) 完成了完整的配置流程。整体部署过程较为顺利，但有几个关键点需要特别注意，在此记录分享。

![](https://files.mdnice.com/user/16270/a2744ac2-a718-4ea4-9c8f-8f0c198898e3.png)

# 关键配置要点

## 环境要求

1. **SQLcl 版本**：建议使用最新版本 **Version 25.2.2.199.0918**；
2. **Java 版本**：`SQLcl -mcp` 功能最低需要 **Java 17**；
3. **部署位置**：SQLcl 仅需在客户端主机安装，无需在数据库服务器安装；

## API 配置

**Deepseek API**：需要充值后才能正常使用。

MCP Server 配置文件：

```bash
{
  "mcpServers": {
    "SQLcl": {
      "command": "/Users/lucifer/Downloads/sqlcl/bin/sql",
      "args": [
        "-mcp",
        "sys/oracle@192.168.6.133:1521/lucifer as sysdba"
      ],
      "disabled": false,
      "timeout": 300
    }
  }
}
```

这里配置不正确无法正常显示 SQLcl MCP：

![](https://files.mdnice.com/user/16270/37c0e100-2901-4a74-82ee-bf067d12b810.png)

# 部署验证

按照教程步骤完成配置后，可以验证 Oracle SQLcl MCP 的功能：

![](https://files.mdnice.com/user/16270/15a3dab7-97e2-4deb-8fb6-b94f8d73bc8b.png)

# 扩展学习

Oracle 官方资源：**https://www.youtube.com/watch?v=hj6WoZVGUBg&t=1888s**

Claude 集成教程：**https://www.youtube.com/watch?v=5WlyMjihfWQ**

# 总结

Oracle SQLcl MCP Server 为数据库管理提供了新的交互方式，部署过程相对简单，但需要注意版本兼容性和环境配置。建议在生产环境使用前进行充分测试。
