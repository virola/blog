const { src, dest, parallel } = require('gulp')
const minifyCSS = require('gulp-csso')
const htmlmin = require('gulp-htmlmin')
const uglify = require('gulp-uglify')
// const imagemin = require('gulp-imagemin')

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

// function img() {
//   return src('public/**/*.{png,jpg,jpeg,gif}').pipe(imagemin()).pipe(dest('public'))
// }

exports.js = js
exports.css = css
exports.html = html
exports.default = parallel(html, css, js)
