title: mac安装jenkins和微信小程序发布助手集成
date: 2019-11-21 14:14:00
tags:
- mac
category: 
- 前端
---

mac安装jenkins真是遇到了大坑，jenkins官方pkg下载下来，安装后默认jenkins home主目录不能修改，然后各种报没有权限。本来安装就花了半天的时间去准备环境，最后还是不得不忍痛卸载官方jenkins，使用 brew install jenkins 来解决问题。结果等 brew install 同样等了俩小时。

卸载jenkins的终端命令：
```
/Library/Application Support/Jenkins/Uninstall.command
```

<!-- more -->

## 修改jenkins默认主目录权限

1、停止jenkins
```
sudo launchctl unload /Library/LaunchDaemons/org.jenkins-ci.plist
```

2、修改配置文件
```
sudo vim /Library/LaunchDaemons/org.jenkins-ci.plist
```
修改 `Groupname` 和 `Username`：
goalwisdom / staff

3、修改目录权限
```
sudo chown -R goalwisdom:staff /Users/Shared/Jenkins/
sudo chown -R goalwisdom:staff /var/log/jenkins/
```

4、启动jenkins
```
sudo launchctl load /Library/LaunchDaemons/org.jenkins-ci.plist
```

## jenkins插件管理

- git plugin
- ssh
- build name setter
- description setter
- nodejs

## jenkins项目配置

### 1、 新建项目
- 自由风格项目

### 2、 勾选“参数化构建过程”；

- Git Parameter： `branch` 
  
  git分支名，默认 dev 或 master

- 选项参数： `build_type`
  prod 生产环境， dev 开发预览版， build 测试体验版
  发布环境。选项： prod / dev / build

- 文本参数： `upload_version`
- 文本参数： `upload_desc`

  默认为 "由jenkins-${BUILD_USER}发布"

- 其他项目定制化参数

### 3、 源码管理；
- Git 指定分支： $branch

### 4、 构建触发器；
- 可以勾选 “轮询 SCM”， 日程表： “ * * * * * ”，表示每分钟轮询一次。
- 也可以勾选“收到 Coding 发送过来的请求时触发构建”

### 5、 构建
增加构建步骤 -> 执行shell ，指定执行脚本
```
#! /bin/bash
sh /Users/goalwisdom/jenkins/shell/mp_deploy.sh
```

### 6、构建后操作
增加构建后操作步骤 -> Set build description

- Regular expression:  \[mini-deploy\] (.*)
- Description: \1


## 执行脚本
小程序发布脚本

注意： `sed -i` 替换字符串时，如果字符串中有特殊字符，可能会替换失败。


患者端小程序

```bash
#!/bin/bash

echo -------------------------------------------------------
echo 代码分支: ${GIT_BRANCH}
echo -------------------------------------------------------

msg() {
  printf '%b\n' "$1" >&2
}

info()
{
  msg "[INFO] $1"
}

success() {
  msg "\e[1;32m[✔] ${1}${2} \33[0m "
}

notice() {
  msg "\e[1;33m ${1} \e[0m"
}

error_exit() {
  msg "\e[1;31m[✘] ${1}${2} \33[0m"
  exit 1
}

# sed匹配config/config.js内容，替换服务端环境
change_hosts() 
{
  if [ -f "config/config.wxs" ]; then
    case $build_type in
      "dev")
        echo "${WORKSPACE}"/config/config.wxs
      ;;
      "prod")
        echo "${WORKSPACE}"/config/config.wxs
        sed -i '' "s~IMG:.*~IMG:'${imgBaseUrl}'~" "${WORKSPACE}/config/config.wxs"
      ;;
    esac
  fi
  if [ -f "config/config.js" ]; then
    case $build_type in 
      "dev")
        target_env="dev"
        echo "${WORKSPACE}"/config/config.js
        
        info "切换到 ${target_env} 环境"
      ;;
      "prod")
        target_env="prod"
        echo "${WORKSPACE}"/config/config.js
        sed -i '' "s~hospitalName:.*~hospitalName: '${hospitalName}',~" ${WORKSPACE}"/config/config.js"
        sed -i '' "s~hospitalTel:.*~hospitalTel: '${hospitalTel}',~" ${WORKSPACE}"/config/config.js"
        sed -i '' "s~serverUrl:.*~serverUrl:'${serverUrl}',~" ${WORKSPACE}"/config/config.js"
        sed -i '' "s~socketUrl:.*~socketUrl:'${socketUrl}',~" ${WORKSPACE}"/config/config.js"
        sed -i '' "s~imgBaseUrl:.*~imgBaseUrl:'${imgBaseUrl}',~" ${WORKSPACE}"/config/config.js"

        info "切换到 ${target_env} 环境"
      ;;
    esac
    if [ "$?" != "0" ]; then
      error_exit "切换环境失败！"
    fi
  else
    error_exit "没有找到config/config.js文件！"
  fi
}

change_appid()
{
  if [ -f "project.config.json" ]; then
    sed -i '' "s/appid\":.*/appid\": \"${appid}\",/" ${WORKSPACE}"/project.config.json"
  else
    error_exit "没有找到project.config.json文件！"
  fi
}


if [ "$build_type" == "dev" ]; then
  info "发布开发版！"
  change_hosts
  change_appid
  #生成二维码
  rm -rf ./preview.png
  rm -rf ./login.png
  mini-deploy --mode=preview --login.format=image --login.qr='login.png' --no-resume
  
  let "result |= $?"
      
  if [ "$result" == "2" ]
    then
      echo "need login"
  elif [ "$result" == "1" ]
    then
      error_exit "发布预览二维码失败"
  else
    success "预览成功！请扫描二维码进入开发版！"
  fi
elif [ "$build_type" == "prod" ] || [ "$build_type" == "build" ]; then
  info "准备上传！"
  change_hosts
  change_appid
  #提交代码微信公众平台
  mini-deploy --mode=upload --ver=$upload_version --desc="$upload_desc" --login.format=image --login.qr='login.png' --no-resume
  success "上传成功！请到微信小程序后台设置体验版并提交审核！"
else
  error_exit "需要设置合法的build_type！"
fi
```

医护端小程序

```bash
#!/bin/bash

echo -------------------------------------------------------
echo 代码分支: ${GIT_BRANCH}
echo -------------------------------------------------------

msg() {
  printf '%b\n' "$1" >&2
}

info()
{
  msg "[INFO] $1"
}

success() {
  msg "\e[1;32m[✔] ${1}${2} \33[0m "
}

notice() {
  msg "\e[1;33m ${1} \e[0m"
}

error_exit() {
  msg "\e[1;31m[✘] ${1}${2} \33[0m"
  exit 1
}

# sed匹配config/config.js内容，替换服务端环境
change_hosts() 
{
  if [ -f "config/config.js" ]; then
    case $build_type in 
      "dev")
        target_env="dev"
        echo "${WORKSPACE}"/config/config.js
        
        info "切换到 ${target_env} 环境"
      ;;
      "prod")
        target_env="prod"
        echo "${WORKSPACE}"/config/config.js
        sed -i "" "s~domainName:.*~domainName: '${domainName}',~" ${WORKSPACE}"/config/config.js"
        sed -i "" "s~socket:.*~socket: '${socket}',~" ${WORKSPACE}"/config/config.js"
        sed -i "" "s~img:.*~img:'${img}',~" ${WORKSPACE}"/config/config.js"
        sed -i "" "s~logo:.*~logo:'${logo}',~" ${WORKSPACE}"/config/config.js"

        info "切换到 ${target_env} 环境"
      ;;
    esac
    if [ "$?" != "0" ]; then
      error_exit "切换环境失败！"
    fi
  else
    error_exit "没有找到config/config.js文件！"
  fi
}

change_appid()
{
  if [ -f "project.config.json" ]; then
    sed -i "" "s/appid\":.*/appid\": \"${appid}\",/" ${WORKSPACE}"/project.config.json"
  else
    error_exit "没有找到project.config.json文件！"
  fi
}


if [ "$build_type" == "dev" ]; then
  info "发布开发版！"
  change_hosts
  change_appid
  #生成二维码
  rm -rf ./preview.png
  rm -rf ./login.png
  mini-deploy --mode=preview --login.format=image --login.qr='login.png' --no-resume
  
  let "result |= $?"
      
  if [ "$result" == "2" ]
    then
      echo "need login"
  elif [ "$result" == "1" ]
    then
      error_exit "发布预览二维码失败"
  else
    success "预览成功！请扫描二维码进入开发版！"
  fi
elif [ "$build_type" == "prod" ] || [ "$build_type" == "build" ]; then
  info "准备上传！"
  change_hosts
  change_appid
  #提交代码微信公众平台
  mini-deploy --mode=upload --ver=$upload_version --desc="$upload_desc" --login.format=image --login.qr='login.png' --no-resume
  success "上传成功！请到微信小程序后台设置体验版并提交审核！"
else
  error_exit "需要设置合法的build_type！"
fi
   
```