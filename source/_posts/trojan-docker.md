title: 通过 docker-compose 安装 trojan ，修改指定端口
tags:
  - vps
category: vps
date: 2021-12-09 17:32:54
---

`jrohy/trojan` 这个trojan镜像启动web时默认端口绑定在80上，占用了宿主机的端口，适合专职机场的vps，安装其推荐的安装方式安装比较好。


所以暂时不考虑使用端口转发。

`docker-compose.yml`

```yaml
version: '2.3'

services:
  mariadb:
    restart: always
    image: mariadb:10.2
    ports:
    - "3306:3306"
    volumes:
    - /home/mariadb:/var/lib/mysql:Z
    environment:
    - MYSQL_ROOT_PASSWORD=mycustompassword
    - MYSQL_ROOT_HOST=%
    - MYSQL_DATABASE=trojan

  trojan:
    restart: always
    image: jrohy/trojan
    depends_on:
    - mariadb
    network_mode: host
    privileged: true
    commond: [ "init" ]
```

<!-- 连接数据库时使用： `mariadb:3306` 代替。 -->

