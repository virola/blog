title: vue-cli build打包后CSS浏览器兼容前缀自动去除的问题
date: 2018-04-19 14:19:32
tags:
- vue
category:
- 前端
---

今天做练手项目部署的时候碰到了个奇怪问题，开发环境里显示得好好的CSS prefixer样式，到production环境就消失了。
我开发环境用的是 scss ，刚开始我还以为是 scss 处理器的问题，后来研究了下 build 脚本，发现人家把CSS统一用一个[插件](https://github.com/NMFR/optimize-css-assets-webpack-plugin)给压缩了，然后追查之下发现这个插件用了 [postCSS](http://postcss.org/) 的 [autoprefixer](https://github.com/postcss/autoprefixer) 插件。
这下问题就清楚了，因为 autoprefixer 插件会针对支持的浏览器进行CSS 前缀的删除和追加。


比如：

```css
a {
  -webkit-border-radius: 5px;
          border-radius: 5px;
}
```

编译成:
```css
a {
  border-radius: 5px;
}
```

autoprefixer 使用了 browserslist 作为依赖。在项目目录中运行:
```
npx browserslist
```
可以查看当前项目支持的浏览器列表，这时候只要修改当前项目支持的浏览器就可以了。
vue-cli生成的项目默认支持部分移动端浏览器和最新版本的PC端浏览器。


在 **package.json** 中修改 `browserslist` ：
```json
"browserslist": [
  "> 1%",
  "last 2 versions",
  "last 10 Chrome versions",
  "last 5 Firefox versions",
  "Safari >= 6",
  "ie > 8"
]
```
之后再运行 `npm run build` 这时生成的代码就有 css prefix 了。
