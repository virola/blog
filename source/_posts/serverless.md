title: 腾讯云 + serverless 快速部署全栈项目（vue + express + postgresql）
tags:
  - serverless
  - vue
  - nodejs
category: 前端
date: 2021-07-21 15:40:24
---

初步试用了一下 serverless 一键生成项目框架和部署到腾讯云，果然和官方宣传的一样，过程非常丝滑。

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


## 项目开发

进入项目目录 `cd fullstack` ，可以看到自动生成的目录结构如下：

```
|- api/  # express 应用
|- db/   # 数据库应用配置
|- frontend/ # 前端 vuejs 应用
|- ...
```
项目中使用 vpc 组件作为 db 和 api 的私有网络连接。

进入 express 和 vue 的相应目录进行代码开发和本地调试。

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