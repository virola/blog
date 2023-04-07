title: 前端通用 prettier config 配置
tags:

- whatever
- fe

category: 前端
date: 2023-04-07 23:45:40

---

## 项目根目录配置

`.prettierrc` 配置内容

```
{
    // tab缩进大小,默认为2
    "tabWidth": 4,
    // 使用tab缩进，默认false
    "useTabs": false,
    // 使用分号, 默认true
    "semi": false,
    // 使用单引号, 默认false(在jsx中配置无效, 默认都是双引号)
    "singleQuote": false,
    // 行尾逗号,默认none,可选 none|es5|all
    // es5 包括es5中的数组、对象
    // all 包括函数对象等所有可选
    "TrailingCooma": "all",
    // 对象中的空格 默认true
    // true: { foo: bar }
    // false: {foo: bar}
    "bracketSpacing": true,
    // JSX标签闭合位置 默认false
    // false: <div
    //          className=""
    //          style={{}}
    //       >
    // true: <div
    //          className=""
    //          style={{}} >
    "jsxBracketSameLine": false,
    // 箭头函数参数括号 默认avoid 可选 avoid| always
    // avoid 能省略括号的时候就省略 例如x => x
    // always 总是有括号
    "arrowParens": "avoid"
}
```

## vscode 配置

配置文件 `settings.json`，用 `ctrl + .` 打开配置预览。

```
// prettier配置
"prettier.configPath": "C:\\Users\\Luck\\.prettierrc", // prettierrc文件目录
"eslint.alwaysShowStatus": true, // 总是显示eslint状态
"prettier.printWidth": 120, // 超过最大值换行
"prettier.tabWidth": 2, // 缩进字节数
"prettier.useTabs": false, // 缩进不使用tab，使用空格
"prettier.semi": true, // 句尾添加分号
"prettier.singleQuote": true, // 使用单引号代替双引号
"prettier.proseWrap": "preserve", // 默认值。因为使用了一些折行敏感型的渲染器（如GitHub comment）而按照markdown文本样式进行折行
"prettier.arrowParens": "avoid", //  (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid：省略括号
"prettier.bracketSpacing": true, // 在对象，数组括号与文字之间加空格 "{ foo: bar }"
"prettier.endOfLine": "auto", // 结尾是 \n \r \n\r auto
"prettier.eslintIntegration": false, //不让prettier使用eslint的代码格式进行校验
"prettier.htmlWhitespaceSensitivity": "ignore",
"prettier.ignorePath": ".prettierignore", // 不使用prettier格式化的文件填写在项目的.prettierignore文件中
"prettier.BracketSameLine": false, // 在jsx中把'>' 是否单独放一行
"prettier.jsxSingleQuote": false, // 在jsx中使用单引号代替双引号
// "prettier.parser": "babylon", // 格式化的解析器，默认是babylon
"prettier.requireConfig": false, // Require a 'prettierconfig' to format prettier
"prettier.stylelintIntegration": false, //不让prettier使用stylelint的代码格式进行校验
"prettier.trailingComma": "none", // 属性值es5表示在对象或数组最后一个元素后面是否加逗号（在ES5中加尾逗号）
"prettier.tslintIntegration": false, // 不让prettier使用tslint的代码格式进行校验
```

重启 vscode 生效。
