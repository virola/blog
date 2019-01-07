title: hexo用travis-ci实现自动部署
date: 2019-01-08 00:11:36
tags:
category:
---

## 一、配置github项目

在github项目里新增 `.travis.yml` 文件。


## 在server上生成travis私钥

```
ssh-keygen -f travis                    # 生成 travis, travis.pub
cat travis.pub >> ~/.ssh/authorized_keys    # 将公钥添加到服务器认证列表
```

## 在server上加密travis私钥

`travis` 加密命令是要通过 `gem` 安装的，请确保 `ruby` 已经安装。
在 vps 上的项目目录里安装执行下面的命令

```
gem install travis
travis login                        # github 帐号和密码，token 我没登录上
travis encrypt-file travis  --add   # 加密 travis 私钥，--add 会自动将解密命令添加到 .travis.yml
```

将修改过的 `.travis.yml` 文件复制到项目目录里。
新建一个 `.travis` 目录，把生成的 `travis.enc` 文件放进去。

这时提交代码之后就可以在[网站](https://travis-ci.org/)上看到自动构建流程了。
