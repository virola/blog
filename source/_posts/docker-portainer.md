title: Linux 安装 docker 可视化管理工具 Portainer
tags:
  - linux
  - docker
category: linux
date: 2021-06-04 09:59:36
---

## 简介

Portainer是一个可视化的容器镜像的图形管理工具，利用Portainer可以轻松构建，管理和维护Docker环境。 而且完全免费，基于容器化的安装方式，方便高效部署。

官网：https://www.portainer.io/

## 安装

官网提供的 docker 安装方式： https://documentation.portainer.io/v2.0/deploy/ceinstalldocker/

1 创建一个docker数据目录

```
docker volume create portainer_data
```

2 启动服务
```
docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
```

3 初始化管理账户

用浏览器访问： http://[ip]:9000

设置管理员用户名密码。

4 选择管理方式

点击 `Local` 确定。

以上，配置完成。

点击左侧菜单栏的 `Host` 可以查看主机信息。