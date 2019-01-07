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
