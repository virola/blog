# virola's blog

<http://blog.zhuyuwei.cn>

markdown blog

run server:
```
npm run dev
```

build:
```
npm run build
```

deploy。
部署到腾讯云开发静态托管
```
npm run deploy:tcb
```

如果部署在子目录，注意需要修改 `_config.yml` 中的 `root` 字段。

另外，图片使用了绝对路径引用，子目录部署时暂时没有做相应处理。后续需要考虑解决方案。