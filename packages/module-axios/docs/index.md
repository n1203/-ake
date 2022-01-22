---
home: false
# logo: ModuleAxios
heroAlt: Logo image
heroText: ModuleAxios
tagline: A modular axios request library.
actionText: Get Started
actionLink: /introduction/
# features:
#   - title: Simplicity First
#     details: Minimal setup with markdown-centered project structure helps you focus on writing.
#   - title: Vue-Powered
#     details: Enjoy the dev experience of Vue + webpack, use Vue components in markdown, and develop custom themes with Vue.
#   - title: Performant
#     details: VitePress generates pre-rendered static HTML for each page, and runs as an SPA once a page is loaded.
footer: MIT Licensed | Copyright © 2021-present JunPing Hu
---

# 什么是 ModuleAxios ?

> `ModuleAxios` 是一个区分环境、模块化的接口管理工具，基于 `axios` 实现，即满足了模块化特性同时也保留了 `axios` 本身所具有的灵活能力。

## 功能特性

- 模块化的方式
- 多环境的应用
- 前后置处理函数
- 权限控制

## 使用案例

```js
import * as moduleAxios from "https://cdn.skypack.dev/module-axios@1.0.4";

const isProduction = false;
const isDev = false;
const isStage = false;
const isFat = false;

const const MA = new Request({
    api: [
        {
            url: 'https://mork-local',
            when: false,
        },
        {
            url: 'https://mork',
            when: isProduction,
        },
        {
            url: 'https://mork-dev',
            when: isDev,
        },
        {
            url: 'https://mork-stage',
            when: isStage,
        },
        {
            url: 'https://mork-fat',
            when: isFat,
        },
    ],
    authOptions: () => (['/home']),
    prefix: (content: any, { authOptions = [], reject = () => {}, module }: any) => {
        const hasPermission = !authOptions.find((o: string) => o === module.url);
        if (!hasPermission) {
            return reject();
        }
        return content;
    },
    processFix: (content: any) => {
        if (content.code !== '0000') {
            console.error(content);
            throw Error(content.msg);
        }
        return content.data;
    },
    fail: (error: any) => {
        message.error(error.message);
        console.log({ ...error });
    },
});

// 用户接口
MA.create('user', {
    url: '/user/current-user',
    method: 'get',
    processFix: (data: any) => {
        return {
            code: '0000',
            msg: '',
            data,
        };
    },
});

// 项目管理接口
MA.create('project', [{
    name: 'list',
    url: '/project/list',
    method: 'get',
}, {
    name: 'create',
    url: '/project/create',
    method: 'post',
}]);

window.io = MA.io

export default MA.io
```

