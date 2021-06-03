title: Centos系统的 VPS 初始环境整理（yum, docker, node, vpn, ss 等等）
tags:
  - linux
category: linux
date: 2021-06-03 17:29:22
---

搞了一台新VPS上手，一堆软件又不记得怎么装了。记录一下各种软件部署的流程。

## 安装工具
### 升级yum
```
yum update
yum makecache  #生成仓库缓存
```

### 基础工具
```
yum install -y git python3
sudo yum install -y gcc gcc-c++
```

nodejs - 推荐用下面的 `nvm` 安装替代:
```
# 下载node 版本参考<https://nodejs.org/en/download/>
wget https://nodejs.org/dist/v12.18.3/node-v12.18.3-linux-x64.tar.xz
tar -xvf node-v12.18.3-linux-x64.tar.gz
cd node-v12.18.3-linux-x64
./configure
# 编译
make && make install
# 查看node版本
node -v
```

nvm - node版本管理工具:
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```
完成后，在 `.bash_profile` 文件中加入：
```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

执行 `source .bash_profile` 后，安装 node 的命令就很简单了：
```
nvm install stable
```
<!-- more -->

### 安装docker

官方安装脚本
```
curl -fsSL https://get.docker.com | bash -s docker
```

启动docker
```
systemctl start docker  #启动docker
systemctl enable docker #开机启动docker
systemctl status docker #查看docker状态
```

### 安装docker-compose
<https://docs.docker.com/compose/install/>

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 权限
sudo chmod +x /usr/local/bin/docker-compose

docker-compose --version
```


## 部署服务
### ipsec VPN
教程：<https://github.com/hwdsl2/docker-ipsec-vpn-server/blob/master/README-zh.md>
```
docker pull hwdsl2/ipsec-vpn-server
```

配置 `vpn.env`:
```
VPN_IPSEC_PSK=xxx
VPN_USER=xxx
VPN_PASSWORD=xxx
VPN_ADDL_USERS=xxx
VPN_ADDL_PASSWORDS=xxx
```
运行容器：
```
docker run \
    --name ipsec-vpn-server \
    --env-file ./vpn.env \
    --restart=always \
    -p 500:500/udp \
    -p 4500:4500/udp \
    -d --privileged \
    hwdsl2/ipsec-vpn-server
```

查看帐号信息：
```
docker logs ipsec-vpn-server
```

### SS节点(shadowsocks)

参考：<https://hijk.art/shadowsocks-ss-one-click-script/>

```
bash <(curl -sL https://raw.githubusercontent.com/hijkpw/scripts/master/centos_install_ss.sh)
```
配置 密码，端口，完成后会展示相关信息。

## 配置用户

```
adduser forapp
passwd forapp
```
## 部署网站

### 安装nginx
配置一个nginx作为服务器总控。其他站点用docker容器部署。

```
yum install -y nginx
```

nginx的启动指令：

```
systemctl start nginx
```

重启命令：
```
pkill -9 nginx
nginx
```