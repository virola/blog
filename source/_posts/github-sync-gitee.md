title: 使用Github Actions自动同步仓库代码至gitee
tags:
  - git
  - github
category: 前端
date: 2021-06-21 15:33:59
---

本文主要研究通过 github actions 自动同步仓库代码至 gitee，顺便了解一下github actions的基础用法。

## 1. Github和Gitee添加公钥

### 通过终端生成公钥

在终端中输入： `ssh-keygen` ，不需要输入任何信息，直接回车，默认生成公钥文件如图：

![public key](/2021/github-sync-gitee/public_key.png)

根据提示的文件路径，查看公钥内容：

```
# 根据路径修改，如： cat /c/Users/Administrator/.ssh/id_rsa.pub
cat [xxx.pub]
```

### 添加公钥信息

将输入的公钥内容复制下来，分别添加至 `github` 和 `gitee` 账户设置中。

- github: https://github.com/settings/keys
- gitee: https://gitee.com/profile/sshkeys

### 检查公钥是否成功添加

```
ssh -T git@github.com
ssh -T git@gitee.com
```

返回成功认证的信息，则说明成功添加公钥。

```
# like this.
Hi! You've successfully authenticated, but GitHub does not provide shell access.
```

<!-- more -->
## 2. Github、Gitee 中添加新的token

1.github:

访问： https://github.com/settings/tokens

点击： `Generate new token` 按钮

![personal token](/2021/github-sync-gitee/personal_token.png)

生成之后，复制好token信息保存起来，以后**不会**再次显示。

2.gitee:

访问： https://gitee.com/profile/personal_access_tokens/new

其他同上，保存生成的token信息。

## 3. Github仓库添加私钥

进入Github想要同步的仓库，选择 `Settings` -> `Secret` -> `New repository secret` ：

![repo_secret](/2021/github-sync-gitee/repo_secret.png)

### 1.添加 `ACCESS_TOKEN `

新增 Secret 命名为： `ACCESS_TOKEN` ，内容是刚刚生成的 token 。

### 2.添加 `GITEE_RSA_PRIVATE_KEY`

新增 Secret 命名为： `GITEE_RSA_PRIVATE_KEY` ，查看之前在终端里生成的私钥：
`cat /c/Users/Administrator/.ssh/id_rsa` ，把内容复制到 secret 里。

### 3.添加 `GITEE_TOKEN`

secret内容是之前生成gitee的access token。

最后检查一下是否在 Github 中添加了 `ACCESS_TOKEN` ， `GITEE_TOKEN` ， `GITEE_RSA_PRIVATE_KEY` 三个密钥。

## 4. Github 中添加 Actions

点击代码仓库中的 `Actions` ，可以自定义配置名称。

![action_setup](/2021/github-sync-gitee/action_setup.png)


## 同步脚本
```yml
# File: .github/workflows/repo-sync.yml
name: sync-blog
on:
  workflow_dispatch:
# 可以设置定时任务，每天同步2次
#   schedule:
#     - cron: '1 0,15 * * *'
#   watch:
#     types: started
  push:
    branches: [ master ]
jobs:
  repo-sync:
    env:
      PAT: ${{ secrets.ACCESS_TOKEN }}
      dst_key: ${{ secrets.GITEE_RSA_PRIVATE_KEY }}
    runs-on: ubuntu-latest
    if: github.event.repository.owner.id == github.event.sender.id
    steps:
      - uses: actions/checkout@v2
        with:
          persist-credentials: false

    # 如果需要同步指定作者的仓库，可以启用这部分配置
    #   - name: sync BLOG
    #     uses: repo-sync/github-sync@v2
    #     if: env.PAT
    #     with:
    #       source_repo: "https://github.com/virola/blog.git"
    #       source_branch: "master"
    #       destination_branch: "master"
    #       github_token: ${{ secrets.ACCESS_TOKEN }}

      # 一个用于在hub间（例如Github，Gitee）账户代码仓库同步的action
      - name: sync github -> gitee
        uses: Yikun/hub-mirror-action@master
        if: env.dst_key
        with:
          src: github/virola
          dst: gitee/virola
          dst_key: ${{ secrets.GITEE_RSA_PRIVATE_KEY }}
          dst_token: ${{ secrets.GITEE_TOKEN }}
          # 静态名单（可用于单一仓库同步）
          static_list: "blog"
          force_update: true
          timeout: '1h'
```