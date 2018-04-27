title: Ruby on rails 配置使用 mysql 数据库
date: 2018-04-23 13:27:53
tags:
- mysql
category:
- 前端
---

Ruby on rails 项目初始化后数据库默认配置使用 sqlite3 ，想使用 mysql 数据库的话需要修改配置。

（默认本机 Mysql 已安装，本地开发使用Mac OS）

1. 安装 mysql2 adapter
```
sudo gem install mysql2
```

2. 修改 Gemfile ，安装依赖
```
gem 'mysql2'
```
在项目目录执行：
```
bundle install
```
<!-- more -->

3. 修改项目配置 `config/database.yml`
```yaml
default: &default
  adapter: mysql2
  encoding: utf8
  username: username
  password: password
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000

development:
  <<: *default
  database: ror_db

test:
  <<: *default
  database: ror_db_test

production:
  <<: *default
  database: ror_db_deploy
```

4. 创建 database ，在项目目录执行命令
```
rake db:create
```

执行数据库命令后一定要重启服务器，否则直接访问会报错。

