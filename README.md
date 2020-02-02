# 前言

**Taro** 是一套遵循 [React](https://reactjs.org/) 语法规范的 **多端开发** 解决方案。使用 **Taro**，我们可以只书写一套代码，再通过 **Taro** 的编译工具，将源代码分别编译出可以在不同端（微信小程序、H5、React-Native 等）运行的代码。


# 技术栈

React + Taro + Dva

## 项目运行

```
cd taro

npm install (建议安装yarn，npm安装时可能会出错 这一步可以替换为 yarn)

小程序运行
npm run dev:weapp //开发
npm run build:weapp //构建

h5运行
npm run dev:h5
npm run build:h5

```

## 项目说明

**git分支说明：**

  init：框架整体结构，不涉及任何业务逻辑

  master：项目的稳定版本

# 业务介绍

目录结构

    ├── .temp                  // H5编译结果目录
    ├── .rn_temp               // RN编译结果目录
    ├── dist                   // 小程序编译结果目录
    ├── config                 // Taro配置目录
    │   ├── dev.js                 // 开发时配置
    │   ├── index.js               // 默认配置
    │   └── prod.js                // 打包时配置
    ├── site                   // H5静态文件（打包文件）
    ├── src                    // 源码目录
    │   ├── components             // 组件
    │   ├── config                 // 项目开发配置
    │   ├── assets                 // 项目资源
    │   ├── models                 // redux models
    │   ├── pages                  // 页面文件目录
    │   │   └── home
    │   │       ├── index.js           // 页面逻辑
    │   │       ├── index.scss         // 页面样式
    │   │       ├── model.js           // 页面models
    │   │       └── service.js        // 页面api
    │   ├── styles             // 样式文件
    │   ├── utils              // 常用工具类
    │   ├── app.js             // 入口文件
    │   └── index.html
    ├── package.json
    └── template.js            // pages模版快速生成脚本,执行命令 npm run tep `文件名`


## 如何使用

#### 新增home页面
 ```npm run tep home``` ，在app.js中引用
```$xslt
    config = {
        pages: [
            'pages/home/index', //再app.js 中引用该页面，这里没有路由，文件即路由
        ],
        window: {
            backgroundTextStyle: 'light',
            navigationBarBackgroundColor: '#ffffff',
            navigationBarTitleText: '',
            navigationBarTextStyle: 'black'
        }
    }
```
#### 导入page页面的model
在 src/models/index.js 中引入home页面的model.js
```$xslt
import common from './common'
import home from '../pages/home/model'

export default [
  common,
  home
]
```

#### 写业务代码
