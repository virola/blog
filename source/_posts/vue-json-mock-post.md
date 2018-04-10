title: VUE(版本v2.5)模拟POST本地json的方法
date: 2018-04-10 15:14:21
tags: 
- vue
category:
- 前端
---
最近在学习vue项目开发，由于纯练手没有开发后端，只能用本地模拟数据进行。
找了网上的一些 json mock 方法，发现 get 请求可以通过 proxyTable 进行模拟，但是 post 请求就会报404错误。

<!-- more -->

get 请求的配置可以用这个方法：
1. 在根目录新建 `static/mock/` 文件夹，将模拟数据 *.json 放在目录里；
2. 修改 config/index.js 文件，增加proxyTable配置
```javascript
proxyTable: {
    // 数据代理，将所有 api/get 开头的请求转发给本地mock目录
    '/api/get': {
        target: 'http://localhost:8080/static/mock'
    }
}
```

这时候请求get就能访问到json文件（我项目中用了 [axios](https://github.com/axios/axios) ）：
```javascript
// 会转发请求到 http://localhost:8080/static/mock/user.json
axios.get('api/get/user.json')
```

在网上找了一些文章，有写配置的也是比较旧版本的vuejs，新版本的配置文件不太一样了。
看了下 webpack devserver 的[文档](https://webpack.js.org/configuration/dev-server/)，里面有个属性 devServer.before 似乎可以实现mock。
然后研究了下项目结构，发现devserver使用的配置是 `build/webpack.dev.conf.js`，而这个配置文件只使用了 `config/index.js` 中的部分配置，所以要使用 `devServer.before` 这个属性必须要修改 `build/webpack.dev.conf.js` 文件：

```javascript
// 在devServer的属性中添加
// ...其他属性
before (app) {
    app.post('/api/post/login', function (req, res) {
        // 这里也可以用import一个数据文件，但修改文件内容时也需要重启server才能生效
        res.json({
            status: 'ok',
            data: {}
        })
    })
},
// ...其他属性
```
重启 server ，使用 post json生效
```javascript
axios.post('api/post/login', {username: 'username', password: 'pwd123'});
```
