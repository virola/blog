title: 用gulp实现全站HTML、CSS、JS和图片压缩
date: 2020-08-13 16:04:50
tags:
- nodejs
- gulp
category: 前端
---

最近被安利了一款一键更新 npm package 的小工具，叫 `npm-check-updates` ，装完只需要在目录下运行 `ncu -u`，然后就会自动把 package.json 中的包版本更新到最新版本号，然后再一键 `npm install` 就完成了依赖升级。

本来这个博客 `hexo` 也是好多年前起的，看到最近 hexo 发布了 5.0 大版本，冲动之下马上一键更新，结果发现自己之前定制的 gulp 压缩脚本也用不了，跑去官网一看，原来 gulp 更新的新版本的语法已经变了。

于是只好花了2个小时左右学习新版本的语法，重写了 hexo 的全站压缩脚本 `gulpfile.js`。

先上官网：
- <https://gulpjs.com/>

再来个中文网快速入门：
-  <https://www.gulpjs.com.cn/>

<!-- more -->


还是和之前的脚本一样， gulp 任务中定义了4个压缩任务：
1. HTML压缩
1. JS压缩
1. CSS压缩
1. 图片压缩

用到的gulp插件：
```
npm i -S gulp-csso gulp-htmlmin gulp-uglify gulp-imagemin
```

其中 `gulp-imagemin` 这个图片压缩插件需要额外安装几个工具插件，如果因为墙的原因安装不少，建议用 `cnpm` 安装。

如果出现运行不了，报错的情况，建议重新全局安装 `gulp` 可以解决问题。
```
npm i -g gulp
```

整合之后的 `gulpfile.js` 如下：
```js
const { src, dest, parallel } = require('gulp')
const minifyCSS = require('gulp-csso')
const htmlmin = require('gulp-htmlmin')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')

function html() {
  return src('public/**/*.html')
    .pipe(
      htmlmin({
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
      })
    )
    .pipe(dest('public'))
}

function css() {
  return src('public/**/*.css').pipe(minifyCSS()).pipe(dest('public'))
}

function js() {
  return src('public/**/*.js')
    .pipe(uglify())
    .pipe(dest('public', { sourcemaps: false }))
}

function img() {
  return src('public/**/*.{png,jpg,jpeg,gif}').pipe(imagemin()).pipe(dest('public'))
}

exports.js = js
exports.css = css
exports.html = html
exports.img = img
exports.default = parallel(html, css, js, img)

```

默认的任务，运行 `gulp` 命令就可以顺序执行 html, css, js 和 img 任务。