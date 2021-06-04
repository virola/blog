title: Centos用yum安装的nginx相关配置
tags:
  - linux
category: linux
date: 2021-06-04 15:09:12
---

使用 `yum install nginx` 安装的 nginx 服务器，配置文件路径：

- `html` 目录默认路径： `/usr/share/nginx/html`
- 默认 `nginx.conf` 路径： `/etc/nginx/nginx.conf`
- vhost 配置目录：`/etc/nginx/conf.d`

现在开始普及 docker 之后，基本上 nginx 就是专门用来做转发配置了。

<!-- more -->

nginx常用指令：

```bash
# 启动
systemctl start nginx

# 开机启动d
systemctl enable nginx

# reload
systemctl reload nginx

# 状态
systemctl status nginx
```


示例 proxy.conf ：

```conf
server {
    listen 80;
    server_name example.com;

    #如果需要http 301跳转到 https 需要将下面行前面的 # 注释去掉，并重载nginx
    #return 301 https://$host$request_uri;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version    1.1;
        proxy_cache_bypass    $http_upgrade;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_set_header X-Forwarded-Host   $host;
        proxy_set_header X-Forwarded-Port   $server_port;
    }

    access_log off;
}
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /root/ssl/Nginx/1_example.com_bundle.crt;
    ssl_certificate_key /root/ssl/Nginx/2_example.com.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "TLS13-AES-256-GCM-SHA384:TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:TLS13-AES-128-CCM-8-SHA256:TLS13-AES-128-CCM-SHA256:EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5";
    ssl_session_cache builtin:1000 shared:SSL:10m;

    location / {
        proxy_pass http://127.0.0.1:8009;
        proxy_http_version    1.1;
        proxy_cache_bypass    $http_upgrade;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_set_header X-Forwarded-Host   $host;
        proxy_set_header X-Forwarded-Port   $server_port;
    }

    access_log off;
}

```
