title: Ruby on rails 自动部署工具 Mina 配置
date: 2018-04-27 14:00:50
tags:
- ruby on rails
- mina
category:
- 前端
---

这两天正在学习 ruby on rails 的项目部署，手里有台国外的vps搭个人网站，系统是 centos7，于是去网上查了一些资料怎么做项目部署。大多文章都推荐使用 Nginx + passenger + mina 的方式。
Mina是一个自动部署的脚本，有点像平常项目上线的一键上线的操作，基于`git`将本地开发好的项目发布到线上，自动备份不同发布版本，自动将当前版本指向最新版本，对于上线回滚挺有用的。废话不多说，网上相关的文章能查到很多资料，我照着网上提供的 mina 脚本进行部署，结果出现各种错误，主要是提示变量名不对之类。
这个时候还是看[Mina官方文档](https://github.com/mina-deploy/mina)最靠谱。

<!-- more -->

## 安装
在gem文件里加入 mina:
```
# Gemfile
gem 'mina'
```
运行 `bundle install` ，进行安装。

## 配置
运行 `mina init` ，生成初始化配置文件 `config/deploy.rb`
要运行的任务修改这个配置文件就可以。

### 配置好基本参数
```ruby

set :application_name, 'demo'
set :domain, 'root@servername'
set :deploy_to, '/root/wwwroot/deploy'
set :repository, 'git@github.com:virola/ror-events.git'
set :branch, 'master'

set :shared_paths, ['config/database.yml', 'config/application.yml', 'log', 'tmp/sockets', 'tmp/pids', 'public/uploads']

```
`shared_paths` 这个变量，列出的就是要共享的文件和目录，部署后会软链到 current 中。

### mina setup
服务器部署的目录结构应该是这样：
```
/root/wwwroot/deploy/     # The deploy_to path
 |-  releases/              # Holds releases, one subdir per release
 |   |- 1/
 |   |- 2/
 |   |- 3/
 |   '- ...
 |-  shared/                # Holds files shared between releases
 |   |- logs/               # Log files are usually stored here
 |   `- ...
 '-  current/               # A symlink to the current release in releases/
```

因为初始时服务器上还没有建立对应的目录结构和文件，这时我们需要先定义一个 `setup` task。

mina使用的任务是符合 `rake` 的 task ，之前我对rake了解不多，所以这里使用网上给出的配置时出现了很多问题。通过 `mina setup -v` 可以查看具体运行信息，发现其中使用了 `#{deploy_to}` 这样的变量似乎不能被识别，去查官方给的 task example，发现他们用的方式是 `#{fetch(:deploy_to)}` ，于是全部改成这个变量试了一下，竟然就成功了。。。

```ruby
task :setup do
  
  # 在服务器项目目录的shared中创建log文件夹
  command %{mkdir -p "#{fetch(:shared_path)}/log"}
  command %{chmod g+rx,u+rwx "#{fetch(:shared_path)}/log"}

  # 在服务器项目目录的shared中创建config文件夹 下同
  command %{mkdir -p "#{fetch(:shared_path)}/config"}
  command %{chmod g+rx,u+rwx "#{fetch(:shared_path)}/config"}

  command %{touch "#{fetch(:shared_path)}/config/database.yml"}
  command %{touch "#{fetch(:shared_path)}/config/secrets.yml"}

  # puma.rb 配置puma必须得文件夹及文件
  command %{mkdir -p "#{fetch(:deploy_to)}/shared/tmp/pids"}
  command %{chmod g+rx,u+rwx "#{fetch(:deploy_to)}/shared/tmp/pids"}

  command %{mkdir -p "#{fetch(:deploy_to)}/shared/tmp/sockets"}
  command %{chmod g+rx,u+rwx "#{fetch(:deploy_to)}/shared/tmp/sockets"}

  command %{touch "#{fetch(:deploy_to)}/shared/config/puma.rb"}
  comment  %{-----> Be sure to edit 'shared/config/puma.rb'.}

  # tmp/sockets/puma.state
  command %{touch "#{fetch(:deploy_to)}/shared/tmp/sockets/puma.state"}
  comment  %{-----> Be sure to edit 'shared/tmp/sockets/puma.state'.}

  # log/puma.stdout.log
  command %{touch "#{fetch(:deploy_to)}/shared/log/puma.stdout.log"}
  comment  %{-----> Be sure to edit 'shared/log/puma.stdout.log'.}

  # log/puma.stdout.log
  command %{touch "#{fetch(:deploy_to)}/shared/log/puma.stderr.log"}
  comment  %{-----> Be sure to edit 'shared/log/puma.stderr.log'.}

  comment  %{-----> Be sure to edit '#{fetch(:shared_path)}/config/database.yml'.}
end
```
之后执行 
```
mina setup
```
可以看到成功运行的信息。

### mina deploy
另外 mina deploy 的脚本和网上给的配置基本一致。就是注意没有 mina setup 之前运行 mina deploy 会提示目录不存在而中断，所以必须先配好 setup task 才行。

```ruby
task :deploy do
  # uncomment this line to make sure you pushed your local branch to the remote origin
  # invoke :'git:ensure_pushed'
  deploy do
    # Put things that will set up an empty directory into a fully set-up
    # instance of your project.
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'
    invoke :'rails:db_migrate'
    invoke :'rails:assets_precompile'
    invoke :'deploy:cleanup'

    on :launch do
      in_path(fetch(:current_path)) do
        command %{mkdir -p tmp/}
        command %{touch tmp/restart.txt}
      end
    end

    on :clean do
      command %{log "failed deployment"}
    end
  end

  # you can use `run :local` to run tasks on local machine before of after the deploy scripts
  # run(:local){ say 'done' }
end

```
