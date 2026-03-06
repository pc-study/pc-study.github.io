---
title: zCloud 纳管 Oracle 数据库
date: 2024-08-07 16:05:26
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/1820305079062323200
---

>大家好，这里是 **Lucifer三思而后行**，专注于提升数据库运维效率。

@[TOC](目录)

# 前言
前文演示了如何安装部署：[zCloud 个人版 Linux 版安装部署初体验](https://www.modb.pro/db/1820278805795266560)，本文演示如何在 zCloud 上快速纳管一台 Oracle 数据库。

**参考文档中心：**

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-ffb9ca61-c827-4c47-b916-f7b4da7222d5.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-d6797d56-166e-457d-a976-268acea0199d.png)

# 下载 Agent
纳管主机需要下载对应平台的 Agent 上传到 zCloud 网页端，这里我选择的是 Linux 主机，所以下载 Linux 的 Agent：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-18e46d6a-b562-4692-ace3-37ffb0d81fab.png)

下载后将 `agent_linux_6.2.1_20240724_0958.tar.gz` 文件上传到网页端：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-c71d6e32-aceb-49c6-8a91-fb09dc7490a4.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-d737aabc-6a8e-42f4-90ec-91794b512565.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-985f7f20-7ba1-4101-9067-75e016b4f1ea.png)

上传完成即可。

# 纳管主机
使用初始用户 `sysadmin` 登录 zCloud 网页门户：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-fc0f538d-b1fa-450f-8475-8dafa9c081aa.png)

选择【资源池管理】 --> 【主机资源池】 --> 【默认主机资源池】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-e7f04755-9d80-4409-b597-62e27969283c.png)

选择 【纳管主机】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-be2fcbf3-3121-4649-8ae4-caffb5d532ea.png)

填写对应信息后，选择 【连接主机】：

注意：这里经过测试，个人版暂不支持
- `LINUX 8.10` 主机，报错信息：**不支持类型为'LINUX 8.10'的主机,内核版本:4.18.0-553.el8_10.x86_64，发行厂商:RedHat**
- `Ubuntu`主机，报错信息：**查询操作系统发行商失败**

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-f0588b7b-7f12-4f4c-b481-673b03deb769.png)

确认信息没问题后，【确定】即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-d4e20d29-400c-482f-92bd-503c9eec9cb0.png)

等待部署完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-ab60d83f-7ac9-4bb3-b5a9-9a17fff3e1f6.png)

查看添加的主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-140e36f4-2641-478a-941d-973cff3aa385.png)

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-ca4c3b3b-a17e-45fe-8e46-ea45c8c99700.png)

# 纳管 Oracle 数据库
数据库纳管是将生产上已经运行的 Oracle 数据库（open read write 状态且监听正常的主库，备库是在纳管主库后的备库管理子页面纳管）纳管到数据库服务平台里，进行后续的管理及监控。纳管的前提是目标主机上已经安装了平台的 agent，并在主机资源池可以查到。如果目标数据库是 RAC 且节点主机都已纳管，平台会自动识别并统一展示。

平台支持服务器上多实例，只纳管选择的；也支持 RAC 先纳管部分节点，再纳管新增的节点，或者故障恢复的节点。

## 有主机纳管
选择【Oracle】–> 【实例管理】–> 【纳管选项】–> 【有主机纳管】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-8773950d-9738-4cfd-9404-39d3fd28ed4c.png)

选择刚添加纳管的主机：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-b4315974-4201-4616-bb45-9719e6ee20fe.png)

选择数据库实例：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-9903b244-a3a7-497f-8197-a5b129c69957.png)

点击修改，填写必填项：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-bad78fa9-3ba6-4373-8c06-ff1a709558b0.png)

修改完成后，完成即可：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20240807-9a2e5a0b-5019-4087-ae4a-b4c96628edad.png)

Oracle 数据库纳管完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-1dda9375-62b6-47d1-9d37-50e45d763b92.png)

## 无主机纳管

选择【Oracle】–> 【实例管理】–> 【纳管选项】–> 【无主机纳管】：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240805-0caa1f05-93c6-41ea-9c1b-6ada3b6e1324.png)

这里需要在被纳管数据库中提前创建 `平台纳管用户`：
```sql
SQL> create user dbaas_monitor identified by oracle;

-- LEVEL1:监控性能
SQL> grant CONNECT,RESOURCE,SELECT_CATALOG_ROLE,ALTER SESSION,ANALYZE ANY,ANALYZE ANY DICTIONARY,BECOME USER, SELECT ANY DICTIONARY,ADMINISTER SQL TUNING SET,ADVISOR,ALTER ANY SQL PROFILE,ADMINISTER ANY SQL TUNING SET,ADMINISTER SQL MANAGEMENT OBJECT to dbaas_monitor; 
grant EXECUTE ON DBMS_WORKLOAD_REPOSITORY to dbaas_monitor; 
grant EXECUTE ON DBMS_STATS to dbaas_monitor; 
grant EXECUTE ON DBMS_LOCK to dbaas_monitor; 

-- 11G没有该权限
-- grant SET CONTAINER to dbaas_monitor; 

-- LEVEL2:数据库管理（继承监控性能所有权限的基础上赋予下面权限）
SQL> grant ADMINISTER DATABASE TRIGGER,ADMINISTER RESOURCE MANAGER,ALTER ANY INDEX, ALTER ANY PROCEDURE,ALTER ANY TRIGGER,ALTER DATABASE,ALTER PROFILE,ALTER SYSTEM, ALTER TABLESPACE,ALTER USER,ENQUEUE ANY QUEUE,EXECUTE ANY ASSEMBLY,EXECUTE ANY CLASS, EXECUTE ANY EVALUATION CONTEXT,EXECUTE ANY INDEXTYPE,EXECUTE ANY LIBRARY, EXECUTE ANY OPERATOR, EXECUTE ANY PROCEDURE,EXECUTE ANY PROGRAM,EXECUTE ANY RULE, EXECUTE ANY RULE SET,EXECUTE ANY TYPE, EXECUTE ASSEMBLY,SELECT ANY TABLE to dbaas_monitor;
```

点击验证通过后，选择对应资源池，确定即可：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-9ca68356-55e7-4aa2-be29-dc4255ac3150.png)

纳管完成：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-1a6fe516-a348-4de5-bcc2-d3fff262e9cd.png)

# 查看纳管数据库
点击实例管理可以查看当前已纳管的数据库：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-a2307733-98b5-4df9-a25e-18f0cccdf4f1.png)

点进去可以查看数据库相关信息：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-7411cdef-7f0c-458d-9c7e-11c9a47c10a4.png)

性能监控：

![image.png](https://oss-emcsprod-public.modb.pro/image/editor/20240807-735d2952-8c91-4bea-ad1c-053bc5607780.png)

巡检中心：

![](https://oss-emcsprod-public.modb.pro/image/editor/20240807-2be7ad8e-e95a-42da-8d34-1e6fd7cc7c53.png)

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