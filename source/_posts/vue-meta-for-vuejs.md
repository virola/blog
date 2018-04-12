title: 在vuejs项目中使用vue-meta管理HTML head信息
date: 2018-04-12 09:57:00
tags: 
- vue
category:
- 前端
---

> 用于管理 Vue 2.0 中页面 meta 信息，支持SSR（服务器端渲染）

vue-meta的官方文档[在这里](https://github.com/declandewet/vue-meta)。
文档中比较详细地说明了在浏览器端和服务器端如何使用 vue-meta 修改页面头部信息，这里我主要介绍下在SPA项目中管理meta info的使用方法。

## Step1. 安装：
```
$ npm install vue-meta --save
```

<!-- more -->

## Step2. 在 `router.js` 中引入 vue-meta
**router.js**
```javascript
import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'

Vue.use(Router)
Vue.use(Meta)

export default new Router({
  //...
})
```

## Step3. 开始定义 `metaInfo`
在任何一个component中都可以定义 metaInfo 属性

**App.vue**
```html
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'App',
    metaInfo: {
      // 如果子component中没有定义 metaInfo.title ，会默认使用这个title
      title: '首页',
      titleTemplate: '%s | 我的Vuejs网站'
    }
  }
</script>
```

**Home.vue**
```html
<template>
  <div id="page">
    <h1>这是首页</h1>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    metaInfo: {
      title: '这是一个首页',
      // 这里定义titleTemplate会覆盖App.vue中的定义
      titleTemplate: null
    }
  }
</script>
```
**About.vue**
```html
<template>
  <div id="page">
    <h1>关于我们</h1>
  </div>
</template>

<script>
  export default {
    name: 'About',
    metaInfo: {
      // 这里的 title 会替换 titleTemplate 中的字符占位
      title: '关于我们'
    }
  }
</script>
```

如果想定义其他meta信息，可以使用vue-meta的API。
例如 `meta` :

```javascript
{
  metaInfo: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  }
}
```
**output** :
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## 异步请求数据定义
如果component中使用了异步请求数据，可以使用 `metaInfo()` 方法。

**Post.vue**:
```html
<template>
  <div>
    <h1>{{{ title }}}</h1>
  </div>
</template>

<script>
  export default {
    name: 'post',
    data () {
      return {
        title: ''
        description: '这是一篇文章...'
      }
    },
    metaInfo () {
      return {
        title: this.title,
        meta: [
          { vmid: 'description', name: 'description', content: this.description }
        ]
      }
    },
    created () {
      this.initData()
    },
    methods: {
      initData () {
        axios.get('some/url').then((resp) => {
          // 设置title时 metaInfo 会同时更新
          this.title = resp.title
          this.description = resp.decription
        })
      }
    }
  }
</script>
```
这样就很轻松地完成了页面meta info的设定。
