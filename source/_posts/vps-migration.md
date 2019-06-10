title: VPS迁移记录
date: 2019-06-10 09:35:06
tags: 
- VPS
category: whatever
---

最近使用的vultr主机又一次被墙，换了日本、新加坡、美国不同位置的主机，连 ssh 都是连不上的状态，不得不考虑换个VPS服务商。同事推荐了那个很出名的搬瓦工[Bandwagon](https://bwh88.net)，一年50刀的价格感觉还可以接受，而且听说搬瓦工有个功能是可以免费更换被墙IP，这个功能有点贴心啊，于是迅速地下单买买买，拿到一个试用一年。

接下来要面对的就是搬搬搬……把之前VPS上的N个网站搬到新主机上。好像做这种主机迁移的事情也是做过蛮多次了，实在是难得碰到一个靠谱稳定的VPS，这次还是把主机迁移的步骤记录一下，下次如果还要做这种事情，就整个自动化脚本工具做一键迁移试试。

<!-- more -->

## 安装lnmp环境

首先就是安装 lnmp [一键安装包](https://lnmp.org)。

执行命令：
```
wget http://soft.vpser.net/lnmp/lnmp1.6.tar.gz -cO lnmp1.6.tar.gz && tar zxf lnmp1.6.tar.gz && cd lnmp1.6 && ./install.sh lnmp
```

如果白板 `centos` 系统没有安装 `wget` ，还需要先 `yum install -y wget` 。

安装完成后，执行 `lnmp status` 可以看到环境运行状态。

## nginx网站配置

lnmp 默认的配置文件所在位置：

```
# nginx配置
/usr/local/nginx/conf/
```

把vhost配置文件copy过去：

```
scp -r root@ip:/usr/local/nginx/conf/vhost/* /usr/local/nginx/conf/vhost/
```

## 网站&mysql备份脚本

根目录拷贝一个备份脚本 `backup.sh` ，执行时会自动将当时的网站和数据库备份到 `/home/backup/` 这个目录中。

```
scp root@140.82.14.63:/root/backup.sh .
```

将另一个主机上备份好的网站文件和数据库文件 scp 到本机目录中。

恢复数据库恢复：

```
mysql -uroot -p123456
> create database db_name 
> source ~/backup/db.sql
```

解压所有网站目录：

```
ls *.tar.gz | xargs -n1 tar xzvf
```

## 建立网站目录软链

lnmp网站默认目录： `/home/wwwroot`

lnmp日志默认目录： `/home/wwwlogs`

```
ln -s /home/wwwroot ~/
ln -s /home/wwwlogs ~/logs
```

恢复网站备份，这个没啥好说的，就是 cp -r 。

## ssl添加
加ssl证书

```
lnmp ssl add
```

需要先把之前主机上的 ssl 证书文件 scp 过来。

## 最后步骤

整理完上面的那些配置，就可以重启服务器了。

```
lnmp nginx restart
```

## 一些问题的处理

1. lnmp restart 重启服务时，nginx报错：

**[warn] the "ssl" directive is deprecated, use the "listen ... ssl" directive instead**

解决方法：

去掉配置了 ssl 网站的 .conf 配置文件中 `ssl on;` ，警告消失了。


