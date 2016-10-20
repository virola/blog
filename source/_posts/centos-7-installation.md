title: "centos 7 虚拟机安装记录"
date: 2015-03-30 15:13:09
tags:
- linux
category: whatever
---

## 前言
这几天也是蛋疼了，觉得机器上的windows系统太卡太慢，然后又十分想念mac上的命令行操作，一心想再弄个linux系统来写码练手。以前装过ubuntu虚拟机，印象中配置上似乎十分复杂，以至于后来一直不愿意再装一次，正好之前下载过centos 7.0的安装镜像，然后我的vps主机也是centos系统，觉得装同样的系统应该比较有亲切感。好在最近项目上比较轻松，马上放清明假的节奏大家都不太想排项目(>\_<)，于是在各种利好的促使下，我又开始了一次我的折腾之旅。

## 虚拟机安装
vmare player安装过程我就不细说了，基本傻瓜式，比较给力的是我选的iso镜像装好之后自动就是gnome图形界面，之前见到过安装完成之后只有命令行界面的情况，我这个估计镜像版本不太一样。

研究了半天终于搞清楚centos平台的可安装软件是 **.rpm** 后缀的，而不是 .deb 后缀的，基本上去网站上下载软件的时候都会提供这两个文件版本，选择正确的后缀名下载就好。

### 关于镜像的问题
受以前安装ubuntu的龟速软件下载的经验影响，我以为这个centos为了提速也一样会需要修改国内镜像之类的，还去改了网易的镜像地址。
结果好像镜像地址过期，搞的yum下载不了东东，只好改回原镜像。万万没想到，系统切换完语言重启之后，自动选择了国内的镜像地址（sina的），下载速度刚刚的。

### 关于虚拟机卡、慢、假死问题
觉得奇怪，给虚拟机分配了**50G硬盘**、**2G内存**、**2个处理器**，结果还是开几个程序就卡死，尤其是在安装程序的时候死得更频繁。
后来假死的时候切换出来调win的任务管理器发现，原来是硬盘I/O的处理速度跟不上。
vmware卡死的时候硬盘读写占用一直都是100%，遇到过几次这种情况，每次只能等啊等等到磁盘使用率过一段时间降下来之后，就能切换进虚拟机go on了。

<!-- more -->

## Google Chrome
作为一个BD出品的FE，Chrome自然是心头爱，虽然centos自带firefox似乎也挺好用，但是chrome积累了好几年的config还是想同步过来。
安装chrome没有什么可说的，翻个墙去[官网](http://www.google.cn/intl/zh-CN/chrome/browser/desktop/index.html)下载 rpm 版本的软件安装上就能用。

## git
代码都存在github上，自然少不了git安装。Centos上安装git很简单，一句命令立马搞定。
```
sudo yum install git
```

可以再顺手装个[gitflow](https://github.com/nvie/gitflow/wiki/Installation)来增强git操作。
```
sudo yum install gitflow
```

## node.js
因为安装centos的主要目的就是想在更好的工具环境里面写博客和建设网站，博客和网站的工具环境都是nodejs，所以装node自然不必说。

1. [官网](https://nodejs.org/)tar包下载好
1. 解压出 node-v0.12.1 目录， cd node-v0.12.1
1. 运行命令
    ```
    ./configure
    sudo make
    sudo make install
    ```

这些方法在网上都能搜到，问题不大。

## 输入法和编辑器
其实系统装好之后默认的拼音输入法是可以用的，虽然稍微有那么点点卡。但是，万万没想到，我们前端最中意的编辑器 sublime text 竟然不能输入中文。
去网上查相关资料，有说要安装google-pinyin的，然后我去尝试了，不知道什么原因没装上（yum里有记录但是语言输入源无法添加）。

更有甚者，我搜出来这样一篇文章：[中文竟然需要这样输入我也是醉了](http://www.csdn123.com/html/mycsdn20140110/61/61630f4872710aee1eb0dd860ff14f03.html)
这篇的办法是，安装一个 `inputhelper` 插件，每次需要输入中文的时候，按ctrl+shift+z，弹出一个输入框，在输入框中输入中文后，按enter将中文插入到编辑区域。
这方法简直是变态啊，让人不忍吐槽。

无奈之下，还是寻求其他更适合的编辑器吧。正好前阵子看到<atom.io>上有一款 **atom** 编辑器，抱着尝试一下的心情试用了。
实践证明，这款编辑器可以输入中文，而且配置起来和sublime一样方便，只有一个问题就是markdown语法的识别不是特别好，总的来说在linux上开发值得推荐。

对了，因为我的博客是基于[hexo](http://hexo.io)开发的，在atom上装了一个插件(markdown-writer)，看简介很厉害的样子，等我写几篇博试用一下先。

贴一份我的Atom配置：

```
welcome:
  showOnStartup: false
core:
  themes: [
    "one-light-ui"
    "one-dark-syntax"
  ]
editor:
  'showInvisibles': true
  'showIndentGuide': true
  invisibles: {}
  fontFamily: "Yahei Consolas Hybrid"
  fontSize: 18
  tabLength: 4
  softWrap: true
  softWrapAtPreferredLineLength: true
  preferredLineLength: 120
```

## Nginx+PHP
要搭建服务器必备工具。

### EPEL 软件仓库
EPEL（http://fedoraproject.org/wiki/EPEL） 是由 Fedora 社区打造，为 RHEL 及衍生发行版如 CentOS、Scientific Linux 等提供高质量软件包的项目。装上了 EPEL，就像在 Fedora 上一样，可以通过 yum install package-name，随意安装软件。

```
rpm -Uvh http://download.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-5.noarch.rpm
```

可在下面链接里寻找:<http://fedoraproject.org/wiki/EPEL/FAQ#howtouse>

安装完毕之后，即可使用 yum 来安装软件，比如 git：`yum install git` ,
若要查看 EPEL Repo 中是否存在某个软件包： `yum search package-name`

### 安装nginx+php+mysql
```
yum -y install nginx mysql-server php-fpm php-cli php-pdo php-mysql php-mcrypt php-mbstring php-gd php-tidy php-xml php-xmlrpc php-pear php-pecl-memcache php-eaccelerator
```

mysql-server这个包没装上= =

### 开机启动
开机启动
```
chkconfig --level 345 mysqld on  
chkconfig --level 345 php-fpm on  
chkconfig --level 345 nginx on
```
### 配置文件

- /etc/nginx/nginx.conf
- /etc/nginx/fastcgi_params
- /etc/php-fpm.conf

### 操作命令
启动命令：

```
nginx
php-fpm
```

## 其他
git alias配置

```
git config --global alias.l   "log --color --graph --decorate --pretty=oneline --abbrev-commit"
git config --global alias.l0  "log --color --graph --decorate --pretty=oneline --abbrev-commit -U0"
git config --global alias.la  "log --color --graph --decorate --pretty=oneline --abbrev-commit --all"
git config --global alias.lb  "log --color --graph --decorate --pretty=oneline --abbrev-commit --all --simplify-by-decoration"
git config --global alias.lg  "log --color --graph --decorate"
git config --global alias.dl   "log --date-order --color --graph --decorate --pretty=oneline --abbrev-commit"
git config --global alias.dla  "log --date-order --color --graph --decorate --pretty=oneline --abbrev-commit --all"
git config --global alias.dlb  "log --date-order --color --graph --decorate --pretty=oneline --abbrev-commit --all --simplify-by-decoration"
git config --global alias.dlg  "log --date-order --color --graph --decorate"
git config --global alias.d   "diff --color"
git config --global alias.dc  "diff --color --cached"
git config --global alias.d0  "diff --color --unified=0"

git config --global alias.ci  "commit --verbose"
git config --global alias.co  "checkout"
git config --global alias.tr  "checkout --track"
git config --global alias.s   "status --short"
git config --global alias.st  "status"
```
