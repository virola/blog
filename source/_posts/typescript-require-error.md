title: angular2开发及typescript编译时总是报错 Cannot find name 'require'.
date: 2016-10-22 16:44:53
tags: angular
category: tips
---
用angular2开发项目时运行 `ng serve` ，控制台里一直有error报错：

```
Error in bail mode: [default] /Users/Virola/code/sites/ng2-app/src/app/app.component.ts:5:14 
Cannot find name 'require'.
```

虽然一直不知道什么原因，但是因为并不影响开发环境的项目效果所以一直没有理会。

但是到了项目发布的时候，运行 `ng build` ，这时候就不行了，因为会出现上面这个错误，一直无法部署编译成功。

去网上搜了一下相关帖子，发现实际上是 **typescript** 编译出的问题。

<!-- more -->

angular2默认使用 typescript2.x 版本，需要为编译器安装定义require的模块支持：

1: 安装定义 require 的模块，如node:

```
npm install @types/node --save-dev
```


2: 在 tsconfig.json 配置文件中添加 TypeScript 选项:

```
{
    "compilerOptions": {
        "types": ["node"]
    }
}

```

两步搞定之后再运行 `ng build` ，可以看到大功告成~

{% img photo /2016/typescript-require-error/result.png %}
