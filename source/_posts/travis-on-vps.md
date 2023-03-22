title: travis-ci 持续集成构建产物部署到远程主机的记录
tags:

- vps
- travis
  category: vps
  date: 2022-03-28 15:24:38

---

过期说明：

2023.3 经测试，travis ci 已经不提供免费 ci 了。考虑转为 github actions。

一转眼都 2022 年了，这工具一直在改造，之前我维护的 hexo 博客自动部署到主机的配置文件现在又不能用了。
没办法，工具在升级，我也得继续好好学习啊。
今天就来研究研究现在最新的 travis-ci (<https://app.travis-ci.com>) 是怎么配置实现将构建的产物部署到指定的远程主机上。

首先是要保证 travis 的持续集成构建步骤，开启 travis 的自动构建很简单，只要在项目中加入 `.travis.yml` 这个文件即可。基本配置参考：

```yml
language: node_js
node_js:
  - 12
cache: npm
branches:
  only:
    - master
install:
  - npm install hexo-cli gulp-cli -g
  - npm install
script:
  - npm run build
deploy:
  provider: pages
  skip_cleanup: true
  # $GH_TOKEN 这个参数需要在 github 的 personal access token 中获取，
  # 然后在 travis 的 options 中配置好
  github_token: $GH_TOKEN
  keep_history: true
  local_dir: public
  on:
    branch: master
```

以上配置文件 `.travis.yml` 会将生成的文件自动提交到 `gh_pages` 分支。

其中比较重要的 deploy 参数就是 `provider: pages`，详细的文档可以看[这里](https://docs.travis-ci.com/user/deployment/pages/)（没有中文版还得自个翻译）。
hexo 默认生成的静态文件是在 `public` 目录下的，所以这里 `local_dir` 有指定上传目录。

<!-- more -->

## 安装 travis ci 客户端

1.进入 root 用户（非 root 用户的时候）

```
sudo su
```

2.安装 rvm

```
curl -L get.rvm.io | bash -s stable
```

如果遇到提示由于 public key 认证失败，则根据指示运行另一条命令如下，成功后再执行安装。

```
curl -sSL https://rvm.io/pkuczynski.asc | sudo gpg --import -
```

然后根据安装完成的提示，生效配置文件：

```
source /etc/profile.d/rvm.sh
```

添加用户组（root 和 ubuntu）：

```
usermod -aG rvm root
usermod -aG rvm ubuntu
```

3.查看可用 ruby 版本

```
rvm list known
```

4.使用 rvm 安装 ruby

```
rvm install ruby-2.7.2
```

Ps. 以上 1-4 步骤的目的是为了安装 ruby 2+ 版本，2023 年实测中，发现 ubuntu 22 的系统直接运行 `apt install ruby` 即可完成安装 ruby 3.0 + 。

5.安装 travis ci

```
gem install travis
```

如果网络实在太差，可以使用 `RubyGems` 镜像

```
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
gem sources -l
```

6.检查是否安装成功

```
# 退出root用户
exit
# 检查
travis --version

# 如果失败的话，重新执行脚本生效
source /etc/profile.d/rvm.sh
```

## 远程服务器免密登录

注意：项目目录所在机器也需要是 linux 机器，windows 安装不了 travis 客户端。

1. 在本地机器上使用 `ssh-keygen` 产生公钥私钥对
   `ssh-keygen`

2. 用 `ssh-copy-id` 将公钥复制到远程机器中

```
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@ip.ip.ip.ip
```

Ps. ssh-copy-id 会自动将 key 写到远程机器的 `~/ .ssh/authorized_key` 文件中

3. 提示成功，测试连接

```
ssh ubuntu@ip.ip.ip.ip
```

## 配置 travis ci

1. 进入项目目录，登录 travis 用户

```
# github token 在设置中生成：https://github.com/settings/tokens
travis login --pro --github-token=xxxxx
```

Ps.一点小问题就是国内机器似乎连接不了。

成功时提示： `Successfully logged in as xxx`

2. 加密 travis 私钥

```
# 在项目根目录下，加密 travis 私钥，--add 会自动将解密命令添加到 .travis.yml
travis encrypt-file ~/.ssh/id_rsa --add --pro
```

Ps.如果 `.travis.yml` 出现~\/.ssh/id_rsa 就**将反斜杠去掉**

3. 继续完善 `.travis.yml` 文件

```yml
# ...省略之前的配置

addons:
  ssh_known_hosts:
    - $IP
before_install:
  - openssl aes-256-cbc -K $encrypted_edf35525f8fd_key -iv $encrypted_edf35525f8fd_iv
    -in id_rsa_aws.enc -out ~/.ssh/id_rsa_aws -d
  - chmod 600 ~/.ssh/id_rsa_aws
  - echo -e "Host $IP\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config

# 执行部署脚本，将编译后的项目同步到服务器的webapps下
# 注意 rsync 需要指定密钥地址
after_success:
  - chmod 600 ~/.ssh/id_rsa_aws
  - rsync -e "ssh -i ~/.ssh/id_rsa_aws" -az --delete ./public/* root@$IP:/usr/share/nginx/html/blog
```

最后提交代码。看 travis 控制台中是否构建成功。

注意，github 现在不支持用户名密码的方式 commit 了，需要使用 github token 提交代码。方法如下：

```
git remote set-url origin https://github_token_xxx@github.com/virola/blog.git

# 提交代码
git push -u origin master
```

## 补充说明

travis 安装、登录要和 `ssh-keygen` 生成免密登录密钥对的机器在同一个机器上，才能保证加密解密的正确性。
