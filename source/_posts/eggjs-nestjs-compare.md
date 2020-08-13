title: Egg.js和nest.js两个node.js框架的对比
date: 2019-07-12 11:28:52
tags:
- nodejs
category: 
- 前端
---

## 简介

### Nest.js 

- 官网 <https://nestjs.com/>
- 中文文档 <https://docs.nestjs.cn/>
- github <https://github.com/nestjs/nest>

> Nest 是一个用于构建高效，可扩展的 Node.js 服务器端应用程序的框架。它使用渐进式 JavaScript，内置并完全支持 TypeScript（但仍然允许开发人员使用纯 JavaScript 编写代码）并结合了 OOP（面向对象编程），FP（功能编程）和 FRP（功能反应编程）的元素。

特性：

- 依赖注入容器
- 模块化封装
- 可测试性 
- 内置支持 TypeScript 

### Egg.js 

- 官网 <https://eggjs.org/zh-cn/>
- github <https://github.com/eggjs/egg/>

> - 为企业级框架和应用而生
> - 奉行『约定优于配置』

特性：

- 提供基于 Egg 定制上层框架的能力
- 高度可扩展的插件机制
- 内置多进程管理
- 基于 Koa 开发，性能优异
- 框架稳定，测试覆盖率高
- 渐进式开发

<!-- more -->

## Egg.js

### 快速入门

```bash
# 安装脚手架
npm i -g egg-init

# 初始化目录
egg-init egg-example --type=simple

# 安装依赖
cd egg-example && npm i

# 启动
npm run dev

```

### 目录结构

约定的目录结构规则：

```
egg-example/
|-- app.js    # (可选)用于自定义启动时的初始化工作
|-- app/      # 主应用程序代码
|   |-- controller/  # Controller控制层
|   |   |-- home.js  # 首页Controller层
|   |
|   |-- service/     # (可选)业务逻辑层
|   |-- middleware/  # (可选)中间件层
|   |-- schedule/    # (可选)定时任务
|   |-- public/      # (可选)用于存放静态资源，具体参见内置插件 egg-static
|   |-- extend/      # (可选)框架的扩展
|   |-- router.js    # 配置 URL 路由规则，具体参见 Router
|
|-- config/   # 用于编写配置文件
|   |-- config.default.js
|   |-- plugin.js           # 配置需要加载的插件
|
|-- logs/     # 存放服务器运行日志
|-- test/     # 用于单元测试
```

直接修改 `app/controller/home.js` 中的输出内容。
改成：

```js
const { ctx } = this;
const data = {
  sucess: true,
  data: 'hi, egg',
};
ctx.body = JSON.stringify(data);
```

保存文件之后，不需要重启服务器，刷新 <http://localhost:7001> 就看到输出的内容修改已经生效了。

## Nest.js

### 快速入门

```bash
# 安装脚手架
npm i -g @nestjs/cli
```

方法一、使用脚手架初始化新空白项目
```bash
nest new nest-example
```

方法二、使用指定git模板初始化新项目
```bash
git clone https://github.com/nestjs/typescript-starter.git project
cd project
npm install
```

运行应用程序：
```
# watch模式，开发用
npm run start:dev

# 部署模式
npm run start:prod
```

在 `src` 目录中的 `main.ts` 文件中定义的端口上启动 HTTP 服务器。
默认访问 <http://localhost:3000/>

查看 `src/app.controller.ts` 文件，发现controller默认调用了service中的方法来输出结果。
修改 `src/app.service.ts` 文件：

```js
getHello(): object {
  return {
    success: true,
    data: 'Hello World!',
  };
}
```

同时由于service中方法的输出类型改变，在调用时同样要修改 ts 的变量类型。 `app.controller.ts`：
```js
@Get()
getHello(): object {
  return this.appService.getHello();
}
```

**修改完成后，需要重启服务器才能生效**。如果是**watch模式**下，不用重启会自动更新。

### 脚手架命令工具

```
# 创建模块类
nest g module [module-name]

# 创建控制器
nest g controller [controller-name]

# 创建服务类
nest g service [service-name]
```

**顺序**： 先创建 `module` ，然后创建*控制器*和*服务类*的时候会自动添加到对应的 `module` 中进行关联。

### 名词解释

- 控制器 Controller
- 提供者 Providers
- 模块 Modules


### 概念-控制器

![Controller](./eggjs-nestjs-compare/nest_controllers_1.png)

控制器层负责处理传入的请求, 并返回对客户端的响应。

**Nest项目和其他的前端项目不太一样地方是，它的每个控制器中同时负责了路由的配置和处理，而其他项目中习惯将路由规则配置单独存放在一个文件或目录中。**

表示HTTP请求方法的装饰器：

- `@Post()`
- `@Get()`
- `@Put()`
- `@Delete()`
- `@Patch()`
- `@Options()`
- `@Head()`
- `@All()`

路由规则定义：

- 通配符：

    ```js
    @Get('ab*cd')
    findAll() {
      return 'This route uses a wildcard';
    }
    ```
- 路由参数：
  
    ```js
    @Get(':id')
    findOne(@Param() params): string {
      console.log(params.id);
      return `This action returns a #${params.id} cat`;
    }
    ```

### 一个restful 的控制器实现

```javascript
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```

## 设定应用场景

- 业务： Socket.IO 实时通讯
- 业务： token鉴权
- 数据库： MySQL
- 框架： RESTful API

### 数据库连接
使用nest.js内置的 TypeORM 模块连接 MySQL 数据库，这部分在另外一篇文章中有说明。详见[《Nest.js连接mysql数据库的配置》](./nestjs-mysql.html)

### 鉴权模块 passport-jwt

使用jwt(json web token)鉴权。

1. 安装

```bash
npm install --save @nestjs/jwt passport-jwt
```


## 参考资料

- [《选择JavaScript开源库时，你需要考虑这些问题》](https://mp.weixin.qq.com/s/QI52VbaQfFOTZyNSfkHk0w) 前端之巅  2018-09-16
