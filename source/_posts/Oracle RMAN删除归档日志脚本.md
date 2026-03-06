---
title: Oracle RMAN删除归档日志脚本
date: 2021-10-16 10:33:20
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/137287
---

Oracle 开启归档模式后，会一直不停的产生归档日志，如果不定时删除，迟早会撑爆磁盘空间，所以就需要布置定时删除归档日志的脚本！

至于为什么要开启归档模式，还有怎么开启归档模式！**请参考：[Oracle 开启归档模式](https://luciferliu.blog.csdn.net/article/details/120250918)**

**Linux 下删除归档脚本：**
```bash
mkdir -p /home/oracle/scripts/log
vi /home/oracle/scripts/del_arch.sh
#!/bin/bash
source ~/.bash_profile
DAY_TAG=`date +"%Y-%m-%d"`
rman target / nocatalog msglog /home/oracle/scripts/log/del_arch_$DAY_TAG.log<<EOF
crosscheck archivelog all;
delete noprompt archivelog until time '(sysdate-7)';
delete noprompt force archivelog until time 'SYSDATE-10';

EOF

## 写入crontab
crontab -e
# 00 07 * * * /home/oracle/scripts/del_arch.sh
```

**Windows 下删除归档脚本：**

**编辑 `del_arch.bat` 脚本：**
```bash
@echo off
set ORACLE_SID=orcl
set "filename=del_arch_task_log_%date:~0,4%%date:~5,2%%date:~8,2%.log"
(
echo.
echo ====================cleaning  %date% %time%  =========================
echo.
rman target / cmdfile=G:\scripts\del_arch.sql
echo.
echo =====================  finish %date% %time%  =========================
echo.
)>>G:\scripts\%filename% 2>&1<nul
```

**编辑 `del_arch.sql` 脚本：**
```bash
run{
 crosscheck archivelog all;
 delete noprompt archivelog until time 'sysdate-1/2';
 delete noprompt force archivelog until time 'SYSDATE-1';
}
```
**📢 注意：脚本中的目录位置，请根据实际情况进行修改！**

---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️
