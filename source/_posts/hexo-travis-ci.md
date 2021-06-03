title: hexo用travis-ci实现自动部署
date: 2019-01-08 00:11:36
tags:
category:
---

## 一些操作更新by 2019.11.13

首先需要机器上安装 ruby & gem :
```
yum install ruby ruby-devel

gem update --system
gem -v
```

也可以使用RVM管理ruby安装：<https://rvm.io/>
```
curl -sSL https://get.rvm.io | bash -s stable
```

国内vps切换rubygems为[ruby-china镜像](https://gems.ruby-china.com/)：
```
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
gem sources -l
```


## 一、配置github项目

在github项目里新增 `.travis.yml` 文件。


## 在server上生成travis私钥

```
ssh-keygen -f travis                    # 生成 travis, travis.pub
cat travis.pub >> ~/.ssh/authorized_keys    # 将公钥添加到服务器认证列表
```

注意：生成私钥的时候不能输入 `passphrase` 否则不能正常构建。

## 在server上加密travis私钥

`travis` 加密命令是要通过 `gem` 安装的，请确保 `ruby` 已经安装。
在 vps 上的项目目录里安装执行下面的命令

```
gem install travis
travis login --pro --github-token=xxxxx                       # github token 在设置中生成：https://github.com/settings/tokens
travis encrypt-file travis --com  --add   # 加密 travis 私钥，--add 会自动将解密命令添加到 .travis.yml
```

注意：迁移到 travis-ci.com 的项目，需要添加参数 `--com` 


这时提交代码之后就可以在网站 https://travis-ci.org/ 或 https://travis-ci.com/ 上看到自动构建流程了。

## 补充更新 by 2021.6.3

`travis login` 目前只支持 `github-token` 一种方式了，使用用户名密码登录会报错。