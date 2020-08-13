title: nodejs将base64编码的图片上传至指定服务器
date: 2020-08-12 16:28:59
tags:
- nodejs
category: 后端
---

最近做项目的时候遇到了一个小细节问题，对接第三方云平台接口拿到了一个图片的 base64 编码，微信小程序中需要使用这个图片，并且将图片上传至java后端服务器上。
后端提供了图片上传接口，但只支持 `FormData` 文件流，不支持 base64 直接传，前端需要考虑的就是如何把 base64 编码变成图片。

这个其实 web 端已经有成熟的方案了，将 base64 转换成二进制图片 `Blob`，再组装 FormData 对象即可完成。

贴一段示例代码，应该很容易看懂：

```javascript
var base64String = '/*base64图片串*/';

// 这里对base64串进行操作，去掉url头，并转换为byte
var bytes = window.atob(base64String.split(',')[1]);

// 处理异常，将ASCII码小于0的转换为大于0
var ab = new ArrayBuffer(bytes.length);
var ia = new Uint8Array(ab);
for (var i = 0; i < bytes.length; i++) {
  ia[i] = bytes.charCodeAt(i);
}
// Blob对象
var blob = new Blob([ab], {type: 'image/jpeg'}); //type为图片的格式

// FormData对象
var fd = new FormData();

// FormData对象接受三个参数，第三个参数为文件名，通常我们只传前两个参数，第三个参数不传则使用默认文件名。
// 这里使用的Blob对象，所以需要一个文件名，用时间戳代替。
fd.append('file', blob, Date.now() + '.jpg');
```

然而这一切到了**微信小程序**上，开始变得困难了 =。=

微信小程序里没有 `atob` ，也不支持 `Blob` 对象，这种转换不允许放在微信小程序上前端执行。这时候我只好退而求其次，让 nodejs 作为中间件去完成这个小任务。

<!-- more -->

nodejs我用的就是最基础的 `express`， 实现方法也很简单，但是网上关于这块的介绍比较少，所以我在这记录分享一下。

首先，node 环境中没有 `FormData` 对象，需要引入这个模块。

```
npm i --save form-data
```

其次，node 环境中需要一个发起 http 请求的模块，我在 browser 端比较惯用 `axios` ，所以这里也用了 axios
```
npm i --save axios
```

然后可以开始写转换代码了。

```javascript
const axios = require('axios');
const FormData = require('form-data');

/**
 * base64图片上传至服务器
 * @param {String} base64 图片的base64编码
 * @param {String} url 上传地址
 * @param {String} contentType 图片类型，默认 `image/jpeg`
 */
function uploadBase64File(base64, url, contentType = 'image/jpeg') {
  const formData = new FormData();
  // 定义一个临时文件名
  const filename = 'tempfile.' + contentType.split('/')[1];
  // 1.先将字符串转换成Buffer
  const fileContent = Buffer.from(base64, 'base64');
  // 2.补上文件meta信息
  formData.append('image', fileContent, {
    filename,
    contentType,
    knownLength: fileContent.byteLength,
  });
  // From axios docs: In Node.js environment you need to set boundary in the header field 'Content-Type' by calling method `getHeaders`
  const formHeaders = formData.getHeaders();
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'post',
      data: formData,
      headers: {
        ...formHeaders,
      },
    })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}
```

里面用到的 `Buffer` 是 node 中自带的二进制处理模块，formData 只要把文件信息补全，上传流程就没问题了。
