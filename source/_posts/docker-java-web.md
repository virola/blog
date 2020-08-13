title: 使用docker部署Java web项目
date: 2019-11-18 16:42:18
tags:
- java
- web
category:
- 后端
---

记录一下我的 centos7 机器上使用 docker 部署 java web项目的上线步骤。

<!-- more -->

我的vps机器上默认是安装了docker的，因此docker的安装这里不赘述。

## 安装gitlab

使用别人封装好的 docker-gitlab ，<https://github.com//sameersbn/docker-gitlab>

```
wget https://raw.githubusercontent.com/sameersbn/docker-gitlab/master/docker-compose.yml
```

修改 `docker-compose.yml` 中的时区为 `Asia/Shanghai` 。

直接一键启动安装：
```
# 加上 d 是后台运行
docker-compose up [d]
```

默认挂载目录：
- redis: /var/lib/redis
- postgresql: /var/lib/postgresql
- gitlab: /home/git/data

### 自定义分布安装

Step 1. Launch a postgresql container

```
docker run --name gitlab-postgresql -d \
    --env 'DB_NAME=gitlabhq_production' \
    --env 'DB_USER=gitlab' --env 'DB_PASS=password' \
    --env 'DB_EXTENSION=pg_trgm' \
    --volume /srv/docker/gitlab/postgresql:/var/lib/postgresql \
    sameersbn/postgresql:10-2
```

Step 2. Launch a redis container

```
docker run --name gitlab-redis -d \
    --volume /srv/docker/gitlab/redis:/var/lib/redis \
    sameersbn/redis:4.0.9-2
```

Step 3. Launch the gitlab container

```
docker run --name gitlab -d \
    --link gitlab-postgresql:postgresql --link gitlab-redis:redisio \
    --publish 10022:22 --publish 10080:80 \
    --env 'GITLAB_PORT=10080' --env 'GITLAB_SSH_PORT=10022' \
    --env 'GITLAB_SECRETS_DB_KEY_BASE=long-and-random-alpha-numeric-string' \
    --env 'GITLAB_SECRETS_SECRET_KEY_BASE=long-and-random-alpha-numeric-string' \
    --env 'GITLAB_SECRETS_OTP_KEY_BASE=long-and-random-alpha-numeric-string' \
    --volume /srv/docker/gitlab/gitlab:/home/git/data \
    sameersbn/gitlab:12.4.2
```

打开 http://IP:10080/ 出现 gitlab 的 502 错误页面。

1.
```
chmod -R 2770 /srv/docker/gitlab/gitlab/repositories

docker restart gitlab
```

2.
依旧502错误页面，查看主机监控，发现CPU占有率达到100%。一段时间后，CPU占有率下降，页面自动可以正常打开了。

## 安装gitlab runner

参考gitlab上文档

```
curl -LJO https://gitlab-runner-downloads.s3.amazonaws.com/latest/rpm/gitlab-runner_amd64.rpm
```