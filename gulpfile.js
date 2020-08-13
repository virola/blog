const { src, dest, parallel } = require('gulp')
const minifyCSS = require('gulp-csso')
const htmlmin = require('gulp-htmlmin')

function html() {
  return src(['public/**/*.html', 'public/*.html'])
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
    .pipe(dest('build/'))
}

function css() {
  return src('public/css/*.css').pipe(minifyCSS()).pipe(dest('build/'))
}

function js() {
  return src('public/js/*.js', { sourcemaps: true }).pipe(dest('build/', { sourcemaps: true }))
}

exports.js = js
exports.css = css
exports.html = html
exports.default = parallel(html, css, js)
