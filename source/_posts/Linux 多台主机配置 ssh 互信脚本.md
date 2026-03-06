---
title: Linux 多台主机配置 ssh 互信脚本
date: 2021-10-17 13:10:08
tags: [每天一个dba小知识]
author: 三笠丶
source: 墨天轮
source_url: https://www.modb.pro/db/137323
---

互信是指配置免密登录另一台主机，常用于自动化脚本！

**以下分享个互信脚本：**
```bash
DEST_USER=$1
  PASSWORD=$2
  HOSTS_FILE=$3
  if [ $# -ne 3 ]; then
    echo "Usage:"
    echo "$0 remoteUser remotePassword hostsFile"
    exit 1
  fi
  if [ "${DEST_USER}" != "root" ]; then
    cd /home/"${DEST_USER}"/ || return
  fi

  SSH_DIR=~/.ssh
  SCRIPT_PREFIX=./tmp
  echo ===========================
  # 1. prepare  directory .ssh
  mkdir $SSH_DIR
  chmod 700 $SSH_DIR

  # 2. generat ssh key
  TMP_SCRIPT=$SCRIPT_PREFIX.sh
  {
    echo "#!/usr/bin/expect"
    echo "spawn ssh-keygen -b 1024 -t rsa"
    echo "expect *key*"
    echo "send \r"
  } >>$TMP_SCRIPT
  if [ -f $SSH_DIR/id_rsa ]; then
    {
      echo "expect *verwrite*"
      echo "send y\r"
    } >>$TMP_SCRIPT
  fi
  {
    echo "expect *passphrase*"
    echo "send \r"
    echo "expect *again:"
    echo "send \r"
    echo "interact"
  } >>$TMP_SCRIPT

  chmod +x $TMP_SCRIPT

  /usr/bin/expect $TMP_SCRIPT
  rm -rf $TMP_SCRIPT

  # 3. generat file authorized_keys
  cat $SSH_DIR/id_rsa.pub >>$SSH_DIR/authorized_keys

  # 4. chmod 600 for file authorized_keys
  chmod 600 $SSH_DIR/authorized_keys
  echo ===========================
  # 5. copy all files to other hosts
  for ip in $(<"${HOSTS_FILE}"); do
    if [ "x$ip" != "x" ]; then
      echo -------------------------
      TMP_SCRIPT=${SCRIPT_PREFIX}.$ip.sh
      # check known_hosts
      val=$(ssh-keygen -F "${ip}")
      if [ "x$val" == "x" ]; then
        echo "$ip not in $SSH_DIR/known_hosts, need to add"
        val=$(ssh-keyscan "${ip}" 2>/dev/null)
        if [ "x$val" == "x" ]; then
          echo "ssh-keyscan $ip failed!"
        else
          echo "${val}" >>$SSH_DIR/known_hosts
        fi
      fi
      echo "copy $SSH_DIR to $ip"
      {
        echo "#!/usr/bin/expect"
        echo "spawn scp -r  $SSH_DIR $DEST_USER@$ip:~/"
        echo "expect *assword*"
        echo "send $PASSWORD\r"
        echo "interact"
      } >"$TMP_SCRIPT"

      chmod +x "$TMP_SCRIPT"

      /usr/bin/expect "$TMP_SCRIPT"
      rm -rf "$TMP_SCRIPT"
      echo "copy done."
    fi
  done

  # 6. date ssh
  for ip in $(<"$HOSTS_FILE"); do
    if [ "x$ip" != "x" ]; then
      {
        echo "#!/usr/bin/expect"
        echo "spawn ssh $DEST_USER@$ip date"
        echo "expect *yes*"
        echo "send yes\r"
        echo "interact"
      } >"$TMP_SCRIPT"

      chmod +x "$TMP_SCRIPT"

      /usr/bin/expect "$TMP_SCRIPT"
      rm -rf "$TMP_SCRIPT"
      echo "copy done."
    fi
  done
```
创建一个脚本 `sshtrust.sh`，将以上内容写入脚本！


支持多台主机进行互信，创建一个 `sshhostList.cfg` 文件，将需要配置互信的主机IP写入：
```
10.211.55.100
10.211.55.101
10.211.55.102
```
执行如下命令互信：
```bash
sh sshtrust.sh 互信用户 互信用户密码 sshhostList.cfg
```
执行完成后，即配置互信成功！


---

本次分享到此结束啦~

如果觉得文章对你有帮助，<font color='red'>**点赞、收藏、关注、评论**</font>，一键四连支持，你的支持就是我创作最大的动力。

❤️ 技术交流可以 关注公众号：**Lucifer三思而后行** ❤️
