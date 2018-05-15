title: 自己写了个抓取网页图片的脚本（phantomjs和shell）
date: 2018-05-15 18:53:31
tags:
- phantomjs
- shell
category:
- 前端
---

最近自己写程序的时候经常素材不够用，想去网上扒现成的图片，扒很多的图片，这种重复劳动让我又想偷懒看能不能用程序实现。
找到了比较适合我用的两个工具—— `phantomjs` 和 `shell` 。
`phantomjs` http://phantomjs.org/  支持模拟浏览器打开网页，执行脚本用js就可以写，适合前端用。有时候碰到那些不实时渲染`img`源地址的，还可以在浏览器开发者工具`console`里跑一下，复用度高。
`shell` 主要是觉得用`wget`做下载系统消耗可能少一点，然后用惯了mac偶尔写写脚本也还顺手。想的是用phantomjs拿到图片地址后，存到一个文件里，脚本逐行读然后wget下载就行了，很方便。
<!-- more -->

## phantomjs脚本代码
img.js :

```javascript
// img.js
var page = require('webpage').create(),
  system = require('system'),
  fs = require('fs'),
  address, output, size;

if (system.args.length < 2 || system.args.length > 4) {
  console.log('Usage: img.js URL filename');
  phantom.exit(1);
} else {
  address = system.args[1];
  output = system.args[2];

  page.viewportSize = {
    width: 600,
    height: 600
  };

  page.open(address, function(status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
      phantom.exit(1);
    } else {
      setTimeout(function () {
        var imglist = page.evaluate(function() {
          var html = document.body.innerHTML;
          var list = [];
          // 匹配图片（g表示匹配所有结果i表示区分大小写）
          var imgReg = /<img.*?(?:>|\/>)/gi;
          // 匹配src属性
          var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
          // 排除base64
          // var base64Reg = ;
          var arr = html.match(imgReg);
          
          for (var i = 0; i < arr.length; i++) {
              var src = arr[i].match(srcReg);
              //获取图片地址
              if (src[1]) {
                var img = src[1];
                // base64的不要，本地的图片不要
                if (!img.match(/data:image\//i) 
                  && img.match(/(http|ftp|https):\/\/[\w\-_]+/i)
                  // 数组去重
                  && list.indexOf(src[1]) == -1
                ) {
                  list.push(src[1]);
                }
              }
          }
          return list;
        });
        console.log('匹配图片数：' + imglist.length);
        var content = imglist.join('\n');
        if (output) {
          try {
            fs.write(output, content, 'w');
            console.log('已输出文件：' + output);
          } catch(e) {
            console.log(e);
          }
        } else {
          console.log(content);
        }
        
        phantom.exit();
      }, 1000);
      
    }
  });
}
```

使用方法： `phantomjs img.js URL filename`

    phantomjs img.js http://sc.chinaz.com/tupian/180514351304.htm imglist.md

其中的JS正则匹配部分可以单独提出来，给那些没有在`img`标签上直接写源地址的页面工具`console`使用：
```javascript
function findImg() {
  var html = document.body.innerHTML;
  var list = [];
  // 匹配图片（g表示匹配所有结果i表示区分大小写）
  var imgReg = /<img.*?(?:>|\/>)/gi;
  // 匹配src属性
  var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  // 排除base64
  // var base64Reg = ;
  var arr = html.match(imgReg);
  
  for (var i = 0; i < arr.length; i++) {
      var src = arr[i].match(srcReg);
      //获取图片地址
      if (src[1]) {
        var img = src[1];
        // base64的不要，本地的图片不要
        if (!img.match(/data:image\//i) 
          && img.match(/((http|ftp|https):)?\/\/[\w\-_]+/i)
          && list.indexOf(src[1]) == -1
        ) {
          list.push(src[1]);
        }
      }
  }
  return list;
}

(findImg()).join('\n');
```

## Shell脚本代码
**download.sh**:

```bash
#!/bin/bash

if [ $# -lt 2 ]; then
  echo "-----Usage------\n sh download.sh filename dirname"
  exit
fi

filename=$1
dirname=$2

if [ ! -d $dirname ]; then
  echo "No such directory: ${dirname}, mkdir..."
  mkdir -p $dirname  
fi

options=$3

nowtime=$(date +%Y%m%d_%H%M%S)
count=0
[ -f $filename ] && {
  cat $filename | while read line
  do

    timestamp=$(date +%Y%m%d_%H%M%S)
    if [ $nowtime = $timestamp ]; then
      ((count=count+1));
    else
      nowtime=$timestamp
      count=0
    fi
    name="${timestamp}_${count}"
    # add filetype
    filetype=${line##*.}
    if [[ ! -z $filetype || ${#filetype} -gt 4 ]]; then
      filetype="jpeg"
    fi
    name="${dirname}/${name}.${filetype}"

    wget -cx $line -O $name
  done
}

```

脚本给下载的图片做了重命名，命名规则是 `下载时的日期_时间_序号.文件类型`
如果没有文件类型，则默认为 `jpeg`

使用方法： `sh download.sh filename dirname`

    sh download.sh imglist.md images


