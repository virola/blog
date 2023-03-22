title: 使用 Github Action 自动化部署到服务器
tags:

- whatever
- vps

category: vps
date: 2023-03-22 16:54:48

---

## 准备

服务器创建秘钥对：

1. 在本地机器上使用 `ssh-keygen` 产生公钥私钥对

```
ssh-keygen -m PEM -t rsa -b 4096
```

2. 用 `ssh-copy-id` 将公钥复制到远程机器中

```
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@ip.ip.ip.ip
```

Ps. ssh-copy-id 会自动将 key 写到远程机器的 `~/ .ssh/authorized_key` 文件中

3. 提示成功，测试连接

```
ssh ubuntu@ip.ip.ip.ip
```

配置秘钥：

当需要使用一些不能公开的参数，比如 服务器 ip，用户名等，我们可以通过 Actions secrets 来创建。
在项目仓库的 Settings -> Secrets -> Actions 中 New repository secret 中添加 。

## 配置 Github Action

主要分几个步骤：

1. 拉取 master 分支的最新代码。
1. 设置 node 版本号
1. 缓存依赖
1. 安装依赖
1. 打包
1. 上传资源到指定路径

可以将配置文件 `deploy_vps.yml` 加到项目目录 `.github/workflows/` 中，git 提交代码时会自动运行。

workflow 配置文件：

```
name: deploy_vps
on:
  # 开启手动触发
  workflow_dispatch:
  # 推送分支时触发
  push:
    branches: [master]

jobs:
  build: # 任务的job_id，具体名称自定义，这里build代表打包
    runs-on: ubuntu-latest # runs-on字段指定运行所需要的虚拟机环境。注意：这个是必填字段
    steps:
      - uses: actions/checkout@master

      - uses: actions/setup-node@v1
        with:
          node-version: v14.17.0

      #缓存依赖
      - name: Cache nodemodules
        uses: actions/cache@v1
        env:
          cache-name: cache-node-modules
        with:
          # 需要缓存的文件的路径
          path: ./node_modules
          # 对缓存的文件指定的唯一标识
          key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('./package.json') }}
          # 用于没有再找目标key的缓存的backup选项
          restore-keys: |
            ${{ runner.os }}-build-${{ env.cache-name }}-
            ${{ runner.os }}-build-
            ${{ runner.os }}-

      # 装依赖
      - name: Install
        run: yarn global add hexo-cli && yarn

      # 打包
      - name: Build
        run: yarn build

      # 部署
      - name: Deploy file
        uses: wlixcc/SFTP-Deploy-Action@v1.2.4
        with:
          username: ${{ secrets.USER_NAME }}
          server: ${{ secrets.SERVER_HOST }}
          ssh_private_key: ${{ secrets.SERVER_PRIVATE_KEY }}
          local_path: './public/*'
          remote_path: '/var/www/blog'
          sftpArgs: '-o ConnectTimeout=5'

```
