---
title: Can I Create an 11.2 Disk Over the 2 TB Limit? (Doc ID 1077784.1)	
date: 2022-01-17 13:01:11
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/238762
---

@[TOC](In this Document)
## APPLIES TO:

Oracle Database - Enterprise Edition - Version 11.2.0.0. and later  
Oracle Database Cloud Schema Service - Version N/A and later  
Oracle Database Exadata Cloud Machine - Version N/A and later  
Oracle Cloud Infrastructure - Database Service - Version N/A and later  
Oracle Database Backup Service - Version N/A and later  
Information in this document applies to any platform.  
***Checked for relevance on 22-02-2013***  
  
  

## GOAL

Trying to add a 2 TB disk to an ASM diskgroup

## SOLUTION

In 11.2 a check was made to disallow creation of diskgroups with disks of size > 2tb.

If a disk > 2tb is used to create a diskgroup, ORA-15099 error will come up. 

Disk size greater than 2 TB can only be used on 12.1 release when  compatible.asm  and compatible.rdbms is set to  12.1  or higher.

## REFERENCES

[NOTE:1057333.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=1077784.1&id=1057333.1) - ORA-15018, ORA-15099 When Creating Diskgroup in ASM