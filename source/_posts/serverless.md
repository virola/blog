title: 腾讯云 + serverless 快速部署全栈项目（vue + express + postgresql）
tags:
  - serverless
  - vue
  - nodejs
category: 前端
date: 2021-07-21 15:40:24
---

初步试用了一下 serverless 一键生成项目框架和部署到腾讯云，果然和官方宣传的一样，过程非常丝滑。
基本操作按照官方文档的指导来就可以正常完成一个框架的部署。

### 操作场景
该模板可以快速部署一个基于 Vue + Express + PostgreSQL 的全栈 Serverless 应用。主要包含以下组件：

- Serverless RESTful API：通过**云函数**和 **API 网关**构建的 Express 框架实现 RESTful API。
- Serverless 静态网站：前端通过托管 Vue.js 静态页面到 **COS 对象存储**中。
- PostgreSQL Serverless：通过创建 **PostgreSQL DB** 为全栈网站提供数据库服务。
- VPC：通过创建 **VPC** 和 **子网**，提供 SCF 云函数和数据库的网络打通和使用。

> 说明：
> 本项目云函数因 VPC，导致无法直接访问外网，如需访问外网请参考 云函数网络配置。

<https://cloud.tencent.com/document/product/583/38202>

## 初始化应用

在空目录下，执行初始化命令：

```sh
# 交互式 serverless 初始化命令
$ serverless
```

接下来按照交互提示，完成项目初始化，选择 `fullstack` 组件模版，并等待依赖安装结束：

```
Serverless: 当前未检测到 Serverless 项目，是否希望新建一个项目？ Yes
Serverless: 请选择您希望创建的 Serverless 应用 fullstack

  eggjs-starter - 快速部署一个Egg.js 基础应用
  express-starter - 快速部署一个 Express.js 基础应用
  flask-starter - 快速部署一个 Flask 基础应用
❯ fullstack - 快速部署一个 Full Stack 应用, vuejs + express + postgres
  koa-starter - 快速部署一个 Koa.js 基础应用
  laravel-starter - 快速部署一个 Laravel 基础应用
  nextjs-starter - 快速部署一个 nextjs 应用

Serverless: 请输入项目名称 fullstack
Serverless: 正在安装 fullstack 应用...

- 项目 "fullstack" 已在当前目录成功创建
- 执行 "cd fullstack && serverless deploy" 部署应用

fullstack › 创建成功
```

<!-- more -->

![初始化应用](/2021/serverless/serverless.png)

应用创建完成之后，如果想要部署，可以选择【立即部署】并将已经初始化好的项目快速部署腾讯云平台。

![腾讯云部署成功](/2021/serverless/serverless-success.png)

## 部署更新代码

在代码调试满意之后，通过以下命令部署代码到腾讯云。

```sh
# 部署项目代码到云服务器
$ serverless deploy
```

## 查看部署信息

如果希望再次查看应用的部署状态和资源，可以进入到部署成功的文件夹，运行如下命令，查看对应信息：

```sh
# 查看已部署应用信息
$ serverless info
```

## 项目开发

进入项目目录 `cd fullstack` ，可以看到自动生成的目录结构如下：

```
|- api/  # express 应用
|- db/   # 数据库应用配置（无需修改）
|- frontend/ # 前端 vuejs 应用
|- vpn/  # 网络部署配置（无需修改）
|- ...
```
项目中使用 vpc 组件作为 db 和 api 的私有网络连接。

进入 express 和 vue 的相应目录进行代码开发和本地调试。


## 绑定自定义域名

要求：域名已备案，CNAME修改为serverless应用的对外地址。

### 1、API域名配置

研究了半天，腾讯的 website 组件不支持在sls配置中直接绑定自定义域名，而 express 组件支持这个配置。
所以可以在 `api/serverless.yml` 中增加相关配置内容：

```yml
# ...
inputs:
  apigatewayConf: # API 网关
    enableCORS: true # 允许跨域
    protocols:
      - http
      - https
    # 自定义域名相关配置
    customDomains:
      - domain: xxx.com
        certificateId: abscder # 证书 ID
        # 这里将 API 网关的 release 环境映射到根路径
        # pathMappingSet:
        #   - path: /
        #     environment: release
        protocols:
          - https
```

### 2、前端资源域名配置

由于静态资源是托管在 `COS对象存储` 中的，所以绑定域名的操作需要去[腾讯云控制台](https://console.cloud.tencent.com/cos)上进行操作。
添加CNAME的时候也要注意是绑定 COS 中的CNAME而不是 serverless 应用中的对外访问地址。