title: 在jenkins pipeline 项目 + jmeter 自动化测试 + HTML Publisher 生成测试报告
tags:
  - whatever
  - jenkins
category: whatever
date: 2021-07-07 17:10:14
---

最近在调研jmeter自动化测试这个topic，简单学习了一下jmeter的各种用法和语法，用jmeter写一套测试计划倒是挺简单的。
不过我认为，ui工具写出来的用例，如果不能git维护+持续集成，那就谈不上自动化测试。
所以就有了 jenkins + jmeter + 生成报告的这套工具的构建。

总结一下我的操作步骤，以及解决的一些坑（如生成的HTML报告没有样式等问题）

## 构建结果展示

项目构建状态：

![project](/2021/jenkins-jmeter/project.png)

HTML生成报告：

![html](/2021/jenkins-jmeter/html.png)

<!-- more -->

## 环境准备

首先，我的 jenkins 是通过 docker 容器搭建在我的 vps 机器上的，容器内操作本身就受到了一些限制，需要把 jmeter 工具从宿主机挂载映射过去。不过方法总体来说挺简单的。我这里使用的容器命令是：

```
docker run -u root --rm -d -p 8080:8080 -p 50000:50000 \
-v $HOME/jenkins-data:/var/jenkins_home \
-v /var/run/docker.sock:/var/run/docker.sock \
-v $HOME/tools/apache-jmeter-5.4.1:/app/jmeter \
-e TZ="Asia/Shanghai" \
--name jenkins jenkinsci/blueocean

```

其中有几个比较重要的参数：

1. 挂载 jenkins 主目录到本地 `$HOME/jenkins-data/` 目录上；
2. 挂载主机本地的 jmeter 目录（提前下载好）到容器里的 `/app/jmeter` 路径；
3. 修改时区 `-e TZ="Asia/Shanghai"`
4. `-u root --rm`、 `-v /var/run/docker.sock:/var/run/docker.sock` 这些参数是按官方文档中要求执行的，貌似不加的话会有一些权限问题（猜测）；

docker启动完成，如果是初次配置 jenkins 会有一些界面引导，按提示的步骤完成就行。



## jenkins相关配置

提前安装好jenkins插件：
- HTML Publisher plugin

### jdk配置

直接在pipeline脚本中运行jdk tool会报错，而实际上jenkins 镜像中已经包含了jdk，需要把容器中工具的路径找出来，配置下路径即可。

1、进入容器：
```sh
docker exec -it jenkins /bin/bash
```

2、查看java路径
```sh
echo $JAVA_HOME
# /opt/java/openjdk
```

3、在jenkins上配置jdk路径

`Manage Jenkins` -> `Global Tool Configuration` -> `JDK` - `新增 JDK`：

配置如下：

- 别名：`jdk`
- JAVA_HOME： `/opt/java/openjdk`

### 时间显示问题
如果启动项目后发现jenkins上显示时间还是有问题，时区没有生效，那么可以去容器中修改时区配置：

1、进入容器：
```sh
docker exec -it jenkins /bin/bash
```

2、查看时区配置是否存在：
```sh
cat /etc/timezone
cat /etc/localtime
```

3、修改时区：
```sh
echo Asia/Shanghai >/etc/timezone
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

### 解决HTML报告样式失效问题

要解决该问题，方式也比较简单，就是修改`Content Security Policy`的默认配置。

修改方式为，进入 `Manage Jenkins` -> `Script console`，输入如下命令并进行执行。

```sh
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")
```

当看到如下结果后，则说明配置修改已经生效。
```
Result
Result:
```
再次进行构建，新生成的HTML就可以正常展示样式了。**需要说明的是，该操作对之前构建生成的HTML报告无效**。

## 新建jenkins项目

新建一个 `pipeline` 类型的项目，在 `流水线` 中定义好脚本：

```sh
pipeline {
    agent any
    tools {
        jdk 'jdk'
    }

    stages {
        stage('checkout') {
            steps {
                git credentialsId: '可能会需要密钥拉取', url: '这里填要拉取的git地址'
            }
        }
        stage('build') {
            steps {
                # 先删除原先生成的报告，否则结果目录不为空jmeter执行会报错
                sh 'rm -rf $WORKSPACE/result.jtl'
                sh 'rm -rf $WORKSPACE/result'
                # 执行jmeter对应脚本，指定生成文件 result.jtl， 指定生成的web结果到 result 目录
                sh '/app/jmeter/bin/jmeter -n -t ${WORKSPACE}/funcs_test.jmx -l $WORKSPACE/result.jtl -e -o $WORKSPACE/result'

                # 使用HTML publisher 插件生成HTML报告
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: false,
                    keepAll: false, reportDir: 'result',
                    reportFiles: 'index.html', reportName: 'HTML Report',
                    reportTitles: ''
                ])
            }
        }
    }
}

```

跑一次立即构建，就可以看到构建成果啦。

So easy~