---
title: Query Errors 'ORA-12850: Could Not Allocate Slaves On All Specified Instances' (Doc ID 2388821.1)	
date: 2022-01-04 16:01:36
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/230155
---

@[TOC](In this Document)

## APPLIES TO:

Oracle Database Cloud Schema Service - Version N/A and later  
Oracle Database Exadata Express Cloud Service - Version N/A and later  
Gen 1 Exadata Cloud at Customer (Oracle Exadata Database Cloud Machine) - Version N/A and later  
Oracle Cloud Infrastructure - Database Service - Version N/A and later  
Oracle Database Backup Service - Version N/A and later  
Information in this document applies to any platform.  

## SYMPTOMS

-   Query hangs with following error:  
```bash
ORA-12850: Could Not Allocate Slaves On All Specified Instance
```    
-   Query works with optimizer_features_enable string 11.2.0.4  
## CAUSE

Internal bug was filed but closed as duplicate to another bug:

Bug 26680874 SQL MONITORING QUERY RAISES ORA-12850 >>>>>>> Unpublished bug closed as duplicate to following  
[Bug 19768896](https://support.oracle.com/epmos/faces/BugDisplay?parent=DOCUMENT&sourceId=2388821.1&id=19768896) : ALWAYS ALLOW INDEX WHEN COMPARING TIMESTAMP TO DATE COLUMN

  
 

## SOLUTION
- 1.Bug is fixed in 12.2.0.1
- 2.Apply [Patch 19768896](https://support.oracle.com/epmos/faces/ui/patch/PatchDetail.jspx?parent=DOCUMENT&sourceId=2388821.1&patchId=19768896)
- 3.Workaround is to use optimizer\_features\_enable('11.2.0.4'):  
```bash
/*+ optimizer_features_enable('11.2.0.4') */
```