title: node操作mysql数据库学习
date: 2017-03-09 17:16:19
tags: 
- nodejs
- mysql
category: whatever
---

突然想研究研究怎么用nodejs操作数据库，目前自己机器上刚好装了mysql，这个数据库我也比较熟悉，所以就找了些网上的教程跟着学习一下怎么操作。

首先在项目目录里需要安装 node-mysql 模块：
```
npm install mysql
```


在mysql里创建一个测试数据库 `node_test`，然后建个测试用的数据表 `mytable` ：

```
CREATE TABLE `node_test`.`mytable` ( 
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY , 
    `firstname` VARCHAR( 20 ) NOT NULL , 
    `lastname` VARCHAR( 20 ) NOT NULL , 
    `message` TEXT NOT NULL
) ENGINE = MYISAM ;
```

<!-- more -->

新建一个 database.js 文件，测试基本功能：

```javascript
var mysql = require('mysql'); 

//创建连接 
var client = mysql.createConnection({ 
    host     : '127.0.0.1',
    user     : 'root',
    password : 'root',
    port     : '3306',
    database : 'node_test' 
}); 

client.connect();

// 查询数据
client.query( 
    'SELECT * FROM mytable', 
    function (err, results, fields) { 
        if (err) { 
            console.log('[SELECT ERROR] - ', err.message);
            return;
        } 

        if (results) {
            for (var i = 0; i < results.length; i++) {
                console.log('%d\t%s\t%s', results[i].id, results[i].name, results[i].message);
            }
        }
    }
);
client.end();
```

运行文件可以看到显示结果：

```
>> node database.js 
1 user1 hello user1
2 user2 hello user2
```


## 增删改

```javascript
// 插入数据
var  addSql = 'INSERT INTO node_test(id, name, message) VALUES(0,?,?)';
var  addSqlParams = ['Virola', 'Hello Virola'];

client.query(addSql, addSqlParams, function (err, result) {
    if (err){
        console.log('[INSERT ERROR] - ', err.message);
        return;
    }       

   console.log('-------INSERT----------');     
   console.log('INSERT ID:', result);       
   console.log('#######################'); 

});

client.end();

```

```javascript
// 修改数据
var updateSql = 'UPDATE mytable SET name = ?,message = ? WHERE id = ?';
var updateSqlParams = ['newuser', 'Hello World', 2];
client.query(updateSql, updateSqlParams, function (err, result) {
    if (err) {
        console.log('[UPDATE ERROR] - ', err.message);
        return;
    }       

    console.log('----------UPDATE-------------');
    console.log('UPDATE affectedRows', result.affectedRows);
    console.log('******************************');
});
```

```javascript
// 删除数据
var delSql = 'DELETE FROM mytable WHERE id = 7';
client.query(delSql, function (err, result) {
    if (err) {
        console.log('[DELETE ERROR] - ', err.message);
        return;
    }

   console.log('-------------DELETE--------------');
   console.log('DELETE affectedRows', result.affectedRows);
   console.log('&&&&&&&&&&&&&&&&&'); 
});
```
