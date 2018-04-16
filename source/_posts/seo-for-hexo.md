title: 为HEXO博客做搜索引擎优化
date: 2018-04-12 11:11:31
tags:
- whatever
category:
- whatever
---

## 百度站长平台收录

登录百度站长平台：http://zhanzhang.baidu.com ,只要有百度旗下的账号就可以登录，登录成功之后在站点管理中点击添加网站然后输入你的站点地址。

添加CNAME验证比较快速方便。

<!-- more -->
## 生成sitemap

### 安装hexo sitemap插件
```
npm install hexo-generator-sitemap hexo-generator-baidu-sitemap --save
```

### 修改网站配置 `_config.yml` 
将 url 改成站点地址
```
url: http://www.zhuyuwei.cn
root: /
permalink: :year/:title.html
permalink_defaults:
```
执行
```
hexo generate
```
就看到生成的根目录下有了 sitemap.xml 和 baidusitemap.xml 两个文件。

## 提交sitemap

### 方法一：主动推送
安装插件
```
npm install hexo-baidu-url-submit --save
```
然后再根目录的配置文件 `_config.yml` 中新增字段
```
baidu_url_submit:
  count: 10 # 提交最新的一个链接
  host: www.zhuyuwei.cn # 在百度站长平台中注册的域名
  token: xxxxx # 请注意这是您的秘钥， 所以请不要把博客源代码发布在公众仓库里!
  path: baidu_urls.txt # 文本文档的地址， 新链接会保存在此文本文档里
```
加入新的deploy
```
deploy:
 - type: baidu_url_submitter
```

这样执行hexo deploy的时候，新的链接就会被推送了。

### 方法二：自动推送
需要在主题中新建一个脚本推送的文件。

**themes/(light)/layout/_partial/baidu_push.ejs** :
```
{% if theme.baidu_push %}
<script>
(function(){
    var bp = document.createElement('script');
    var curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https') {
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';        
    }
    else {
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    }
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(bp, s);
})();
</script>
{% endif %}
```
在 layout 中引入这个文件，放在 body 结束标签之前。
**themes/(light)/layout/layout.ejs** :
```
<%- partial('_partial/baidu_push') %>
</body>
```

然后设置主题配置文件 `themes/(light)/_config.yml` :
```
baidu_push: true
```
这样每次访问页面就会自动向百度提交sitemap。

## Google站点收录
google站点平台：https://www.google.com/webmasters/ ，然后就是注册账号、验证站点、提交sitemap，一步一步来就好，过不了过久就可以被google收录了。

# 整理站点文件
使用 `gulp` 压缩HTML、CSS、JS

## 安装gulp和插件
```
npm install -g gulp
npm install gulp gulp-htmlclean gulp-htmlmin gulp-imagemin gulp-minify-css gulp-uglify --save
```

## 配置 gulpfile.js 
根目录新建 gulpfile.js 文件
**gulpfile.js**
```javascript
var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');

// 获取 gulp-imagemin 模块
var imagemin = require('gulp-imagemin')

// 压缩 public 目录 css
gulp.task('minify-css', function() {
    return gulp.src('./public/**/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('./public'));
});
// 压缩 public 目录 html
gulp.task('minify-html', function() {
    return gulp.src('./public/**/*.html')
        .pipe(htmlclean())
        .pipe(htmlmin({
            removeComments: true,  //清除HTML注释
            collapseWhitespace: true,  //压缩HTML
            collapseBooleanAttributes: true,  //省略布尔属性的值 <input checked="true"/> ==> <input checked />
            removeEmptyAttributes: true,  //删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true,  //删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,  //删除<style>和<link>的type="text/css"
            minifyJS: true,  //压缩页面JS
            minifyCSS: true  //压缩页面CSS
        }))
        .on('error', function(err) {
            console.log('html Error!', err.message);
            this.end();
        })
        .pipe(gulp.dest('./public'))
});
// 压缩 public/js 目录 js
gulp.task('minify-js', function() {
    return gulp.src('./public/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public'));
});


// 压缩图片任务
// 在命令行输入 gulp images 启动此任务
gulp.task('images', function () {
    // 1. 找到图片
    gulp.src('./photos/*.*')
    // 2. 压缩图片
        .pipe(imagemin({
            progressive: true
        }))
        // 3. 另存图片
        .pipe(gulp.dest('dist/images'))
});

// 执行 gulp 命令时执行的任务
gulp.task('build', [
    'minify-html','minify-css','minify-js','images',
]);
```

执行 gulp build 命令，就会自动整理 public 目录下的文件。

## 加入项目自动部署命令

**package.json** :
```javascript
{
    "scripts": {
        "dev": "hexo server",
        "start": "npm run dev",
        "build": "hexo clean && hexo generate && gulp build && hexo deploy"
    }
}
```
运行 npm run dev ，自动开启服务器
运行 npm run build ，就会自动生成网站和进行部署
