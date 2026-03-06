---
title: Bug 27092508 - Flashback Queries Fails with ORA-08181 Due to Corrupted Timestamp Mappings (Doc ID 27092508.8)
date: 2022-01-04 16:01:47
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/230156
---

### Bug 27092508  Flashback Queries Fails with ORA-08181 and/or ORA-01466 Due to Corrupted Timestamp Mappings in SYS.SMON\_SCN\_TIME

 This note gives a brief overview of bug 27092508.  
 The content was last updated on: 03-NOV-2021  
*Click [here](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=27092508.8&id=245840.1) for details of each of the sections below.*  

### Affects:

> <table border="1" data-mkd-display="block" data-mkd-tablehasheader="false"><tbody data-mkd-display="block"><tr data-mkd-display="block" data-mkd-index="1" data-mkd-index-row="1"><td data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><b data-mkd-display="inline">Product (<i data-mkd-display="inline">Component</i>)</b></td><td data-mkd-display="block" data-mkd-index="2" data-mkd-index-cell="2" data-mkd-pos="last">Oracle Server (Rdbms)</td></tr><tr data-mkd-display="block" data-mkd-index="2" data-mkd-index-row="2"><td data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><b data-mkd-display="inline">Range of versions&nbsp;<i data-mkd-display="inline">believed</i>&nbsp;to be affected</b></td><td data-mkd-display="block" data-mkd-index="2" data-mkd-index-cell="2" data-mkd-pos="last">Versions &gt;= 12.1 but BELOW 18.1</td></tr><tr data-mkd-display="block" data-mkd-index="3" data-mkd-index-row="3"><td data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><b data-mkd-display="inline">Versions&nbsp;<i data-mkd-display="inline">confirmed</i>&nbsp;as being affected</b></td><td data-mkd-display="block" data-mkd-index="2" data-mkd-index-cell="2" data-mkd-pos="last"><ul compact="" data-mkd-display="block" data-mkd-depth="1"><li data-mkd-display="block" data-mkd-index="1"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#AFFECTS_12.2.0.1" data-mkd-display="inline">12.2.0.1 (Base Release)</a></li><li data-mkd-display="block" data-mkd-index="2"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#AFFECTS_12.1.0.2" data-mkd-display="inline">12.1.0.2 (Server Patch Set)</a></li></ul></td></tr><tr data-mkd-display="block" data-mkd-index="4" data-mkd-index-row="4"><td data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><b data-mkd-display="inline">Platforms affected</b></td><td data-mkd-display="block" data-mkd-index="2" data-mkd-index-cell="2" data-mkd-pos="last">Generic (all / most platforms affected)</td></tr></tbody></table>

### Fixed:

> <table border="1" data-mkd-display="block" data-mkd-tablehasheader="false"><tbody data-mkd-display="block"><tr data-mkd-display="block" data-mkd-index="1" data-mkd-index-row="1"><td data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><b data-mkd-display="inline">The fix for 27092508 is first included in</b></td><td data-mkd-display="block" data-mkd-index="2" data-mkd-index-cell="2" data-mkd-pos="last"><ul compact="" data-mkd-display="block" data-mkd-depth="1"><li data-mkd-display="block" data-mkd-index="1"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#FIXED_18.1" data-mkd-display="inline">18.1.0</a></li><li data-mkd-display="block" data-mkd-index="2"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=29757449.8" data-mkd-display="inline">12.2.0.1.190716 (Jul 2019) Database Jul2019 Release Update (DB RU)</a></li><li data-mkd-display="block" data-mkd-index="3"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#FIXED_12.1.0.2.200114" data-mkd-display="inline">12.1.0.2.200114 (Jan 2020) Database Patch Set Update (DB PSU)</a></li><li data-mkd-display="block" data-mkd-index="4"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#FIXED_12.1.0.2.DBBP:191015" data-mkd-display="inline">12.1.0.2.191015 (Oct 2019) Database Proactive Bundle Patch</a></li><li data-mkd-display="block" data-mkd-index="5"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#FIXED_WIN:C201P:190530" data-mkd-display="inline">12.2.0.1.190530 (May 2019) Bundle Patch for Windows Platforms</a></li><li data-mkd-display="block" data-mkd-index="6"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#FIXED_WIN:C102P:200114" data-mkd-display="inline">12.1.0.2.200114 (Jan 2020) Bundle Patch for Windows Platforms</a></li></ul></td></tr></tbody></table>
> 
>   
> *Interim patches may be available for earlier versions - click [here](https://support.oracle.com/epmos/faces/ui/patch/PatchDetail.jspx?parent=DOCUMENT&sourceId=27092508.8&patchId=27092508) to check.*

<table width="90%" align="top" style="font-family: Tahoma, Verdana, Helvetica, sans-serif; font-size: small; background-color: rgb(255, 255, 255);" data-mkd-display="block" data-mkd-tablehasheader="false"><tbody data-mkd-display="block"><tr data-mkd-display="block" data-mkd-index="1" data-mkd-index-row="1"><td data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><h3 data-mkd-display="block"><u data-mkd-display="block">Symptoms:</u></h3></td><td data-mkd-display="block" data-mkd-index="2" data-mkd-index-cell="2" data-mkd-pos="last"><h3 data-mkd-display="block"><u data-mkd-display="block">Related To:</u></h3></td></tr><tr data-mkd-display="block" data-mkd-index="2" data-mkd-index-row="2"><td data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1"><ul compact="" data-mkd-display="block" data-mkd-depth="1"><li data-mkd-display="block" data-mkd-index="1">ORA-08181 / ORA-01466</li></ul></td><td data-mkd-display="block" data-mkd-index="2" data-mkd-index-cell="2" data-mkd-pos="last"><ul compact="" data-mkd-display="block" data-mkd-depth="1"><li data-mkd-display="block" data-mkd-index="1"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#TAGS_FDA" data-mkd-display="inline">Flashback Data Archive (Oracle Total Recall)</a></li><li data-mkd-display="block" data-mkd-index="2"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#TAGS_FLASHBACK" data-mkd-display="inline">Flashback</a></li><li data-mkd-display="block" data-mkd-index="3"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#TAGS_PDB" data-mkd-display="inline">Pluggable Database (PDB) / Container</a></li><li data-mkd-display="block" data-mkd-index="4"><a href="https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&amp;sourceId=27092508.8&amp;id=245840.1#TAGS_TIMESTAMP" data-mkd-display="inline">Datatypes (TIMESTAMP)</a></li></ul></td></tr></tbody></table>

### Description

> This bug is only relevant when using Flashback Data Archive (Oracle Total Recall)
> 
> Memory corruption can occur in PDB as a result of corrupted timestamp
> mappings in SYS.SMON\_SCN\_TIME, causing one of two errors:
>  
>   ORA-08181: specified number is not a valid system change number
>   ORA-01466: unable to read data - table definition has changed
>  
> **Rediscovery Notes**
> If ORA-01466 or ORA-08181 is seen while running flashback queries 
> this bug might be encountered.
>  
> **Workaround**
> NONE
>  
> 
>  

<table border="1" align="center" width="80%" style="font-family: Tahoma, Verdana, Helvetica, sans-serif; font-size: small; background-color: rgb(255, 255, 255);" data-mkd-display="block" data-mkd-tablehasheader="false"><tbody data-mkd-display="block"><tr data-mkd-display="block" data-mkd-index="1" data-mkd-index-row="1"><td data-mkd-display="block" data-mkd-index="1" data-mkd-index-cell="1" data-mkd-pos="last"><b data-mkd-display="inline">Please note:</b>&nbsp;The above is a summary description only. Actual symptoms can vary. Matching to any symptoms here does not confirm that you are encountering this problem. For questions about this bug please consult Oracle Support.</td></tr></tbody></table>

### References

> [Bug:27092508](https://support.oracle.com/epmos/faces/BugDisplay?parent=DOCUMENT&sourceId=27092508.8&id=27092508) (This link will only work for PUBLISHED bugs)  
> [Note:245840.1](https://support.oracle.com/epmos/faces/DocumentDisplay?parent=DOCUMENT&sourceId=27092508.8&id=245840.1) Information on the sections in this article