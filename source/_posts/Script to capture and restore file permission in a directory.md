---
title: Script to capture and restore file permission in a directory (for eg. ORACLE_HOME) (Doc ID 1515018.1)	
date: 2021-12-15 16:12:47
tags: [墨力计划]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/210773
---

# APPLIES TO
Gen 1 Exadata Cloud at Customer (Oracle Exadata Database Cloud Machine) - Version N/A and later
Oracle Cloud Infrastructure - Database Service - Version N/A and later
Oracle Database Backup Service - Version N/A and later
Oracle Database Cloud Exadata Service - Version N/A and later
Oracle Database Cloud Service - Version N/A and later
Generic UNIX
Generic Linux
# MAIN CONTENT
# PURPOSE
This script is intended to capture and restore the file permission of a given directory example - ORACLE_HOME. The script will create a output file called permission_<timestamp> and permission_<timestamp>.cmd

# REQUIREMENTS
The script needs to be run on command prompt of Unix platform .
Perl is required to execute this script
Shell is required to run the shell script .

# CONFIGURING
Download and save the script on your server as permission.pl
Provide the execute permission on the script
# INSTRUCTIONS
Run the script from the location where you have downloaded and saved it
```bash
./permission.pl <Path name to capture permission>
```
# CAUTION
This sample code is provided for educational purposes only and not supported by Oracle Support Services. It has been tested internally, however, and works as documented. We do not guarantee that it will work for you, so be sure to test it in your environment before relying on it.

Proofread this sample code before using it! Due to the differences in the way text editors, e-mail packages and operating systems handle text formatting (spaces, tabs and carriage returns), this sample code may not be in an executable state when you first receive it. Check over the sample code to ensure that errors of this type are corrected.

**Note : This script can restore permission back to the point at which it was captured. It is not intended to reset the permission.**

# SCRIPT
Execute the script from the dollar ($) prompt

Steps to capture permission of a directory

1. Download the script from [here](https://www.modb.pro/download/185083)
2. Log in as "oracle" user
3. copy the file to a location say /home/oracle/scripts
4. Give execute permission
```bash
$ chmod 755 permission.pl
```
5. Execute the script to capture permission
```bash
$ cd /home/oracle/scripts
$ ./permission.pl <Path name to capture permission>
```
Script generates two files

a. **`permission-<time stamp>`** - This contains file permission in octal value, owner and group information of the files captured
b. **`restore-perm-<time stamp>.cmd`** - This contains command to change the permission, owner, and group of the captured files


Steps to restore captured permission of the directory

1. Copy the "restore-perm-<time stamp>.cmd" to desired location or NODE

2. Give execute permission to file generated during capture
```bash
chmod 755 restore-perm-<timestamp>.cmd
```
3. execute .cmd file to restore the permission and the ownership
```bash
$ ./restore-perm-<timestamp>.cmd
```
**Note:** In case of **RAC setup for GRID_HOME**, execute permission.pl and restore-perm-<timestamp>.cmd as root user.

**Note:** In case of RAC setup review the file restore-perm-<time stamp>.cmd to check for the node specific information like NODENAME, if any make necessary changes.

<u>**Sample output of the script**</u>

**`permission-<time stamp>`**
```bash
755 oracle oinstall <ORACLE_HOME>
750 oracle oinstall <ORACLE_HOME>/root.sh
644 oracle oinstall <ORACLE_HOME>/install.platform
640 oracle oinstall <ORACLE_HOME>/oraInst.loc
644 oracle oinstall <ORACLE_HOME>/afiedt.buf
644 oracle oinstall <ORACLE_HOME>/a.out
6755 root root <ORACLE_HOME>/tsh.sh
644 oracle oinstall <ORACLE_HOME>/Readme.txt
640 oracle oinstall <ORACLE_HOME>/oraorcl1122
644 oracle oinstall <ORACLE_HOME>/SQLtraining_day1.lst
751 oracle oinstall <ORACLE_HOME>/bin/hsots
751 oracle oinstall <ORACLE_HOME>/bin/nid
6751 oracle oinstall <ORACLE_HOME>/bin/oracle
751 oracle oinstall <ORACLE_HOME>/bin/orapwd
751 oracle oinstall <ORACLE_HOME>/bin/wrap
750 oracle oinstall <ORACLE_HOME>/bin/grdcscan
```
**`restore-perm-<time stamp>.cmd`**
```bash
chown  oracle:oinstall <ORACLE_HOME>
chmod  755 <ORACLE_HOME>
chown  oracle:oinstall <ORACLE_HOME>/root.sh
chmod  750 <ORACLE_HOME>/root.sh
chown  oracle:oinstall <ORACLE_HOME>/install.platform
chmod  644 <ORACLE_HOME>/install.platform
chown  oracle:oinstall <ORACLE_HOME>/oraInst.loc
chmod  640 <ORACLE_HOME>/oraInst.loc
chown  oracle:oinstall <ORACLE_HOME>/afiedt.buf
chmod  644 <ORACLE_HOME>/afiedt.buf
chown  oracle:oinstall <ORACLE_HOME>/a.out
chmod  644 <ORACLE_HOME>/a.out
chown  root:root <ORACLE_HOME>/tsh.sh
chmod  6755 <ORACLE_HOME>/tsh.sh
chown  oracle:oinstall <ORACLE_HOME>/Readme.txt
chmod  644 <ORACLE_HOME>/Readme.txt
chown  oracle:oinstall <ORACLE_HOME>/oraorcl1122
chmod  640 <ORACLE_HOME>/oraorcl1122
chown  oracle:oinstall <ORACLE_HOME>/SQLtraining_day1.lst
chmod  644 <ORACLE_HOME>/SQLtraining_day1.lst
chown  oracle:oinstall <ORACLE_HOME>/bin/nid
chmod  751 <ORACLE_HOME>/bin/nid
chown  oracle:oinstall <ORACLE_HOME>/bin/oracle
chmod  6751 <ORACLE_HOME>/bin/oracle
chown  oracle:oinstall <ORACLE_HOME>/bin/orapwd
chmod  751 <ORACLE_HOME>/bin/orapwd
chown  oracle:oinstall <ORACLE_HOME>/bin/wrap
chmod  751 <ORACLE_HOME>/bin/wrap
chown  oracle:oinstall <ORACLE_HOME>/bin/grdcscan
chmod  750 <ORACLE_HOME>/bin/grdcscan
```

最后，也可以参考 `陈举超` 超哥的讲解文章：[Oracle RAC目录权限丢失故障恢复](https://www.modb.pro/course/article/116?lsId=4463)