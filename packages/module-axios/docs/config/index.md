# 配置项

### .api
配置环境，支持单字符串或数组两种形式。如果是单字符串，则直接使用字符串内地址作为 `api` 接口请求目标地址，如果是数组，则可以通过配置 `.useApiIndex` 来设定当前 `生效目标url`，同样的，你也可以在每个环境中设定 `when()` 来控制环境生效时机。

***单字符串形式***

```js
const const MA = new Request({
    api: 'https://mork-local',
})
// 接口调用统一前缀url https://mork-local
```

***数组+`useApiIndex`形式***

```js
const const MA = new Request({
    api: [{
      url: 'https://mork-local'
    }, {
      url: 'https://mork-dev'
    }],
    useApiIndex: 1,
})
// 接口调用统一前缀url https://mork-dev
```

***数组+`when<Boolean>`形式***

如果有多个符合条件的项，则按数组权重先出现先应用原则枚举直到产生第一个符合条件的环境。如果所有都不符合条件，那么将采用第一个环境。

```js
const const MA = new Request({
    api: [{
      url: 'https://mork-local'
      when: true,
    }, {
      url: 'https://mork-dev'
      when: false,
    }],
})
// 接口调用统一前缀url https://mork-local

const const MA = new Request({
    api: [{
      url: 'https://mork-local'
      when: true,
    }, {
      url: 'https://mork-dev'
      when: true,
    }],
})
// 接口调用统一前缀url https://mork-local
```


***数组+`when<Function>`形式***

如果有多个符合条件的项，则按数组权重先出现先应用原则枚举直到产生第一个符合条件的环境。如果所有都不符合条件，那么将采用第一个环境。

```js
const const MA = new Request({
    api: [{
      url: 'https://mork-local'
      when: () => false,
    }, {
      url: 'https://mork-dev'
      when: () => true,
    }],
})
// 接口调用统一前缀url https://mork-local

const const MA = new Request({
    api: [{
      url: 'https://mork-local'
      when: () => true,
    }, {
      url: 'https://mork-dev'
      when: () => true,
    }],
})
// 接口调用统一前缀url https://mork-local
```

### .useApiIndex 按下标选择环境

必须 `.api` 配置为数组类型时才可使用，如果设置此参数，则放弃 `.api` 中的 `when` 条件判断。


```js
const const MA = new Request({
    api: [{
      url: 'https://mork-local',
      when: true,
    }, {
      url: 'https://mork-dev'
      when: true,
    }],
    useApiIndex: 1,
})
// 接口调用统一前缀url https://mork-dev
```

### .axiosOptions axios原始配置

为了保持原始灵活性，可以在全局为axios配置公共配置内容。

- [查看axios官方文档](https://axios-http.com/docs/intro)

```js
const const MA = new Request({
    // ... more configs
    axiosOptions: {
      // 配置内容 https://axios-http.com/docs/intro
    }
})
```

### .prefix 全局接口前缀

如果环境情况，建议采用本变量作为前缀统一的方式。而不是通过拼接环境url的方式去做。

```js
const const MA = new Request({
    api: 'https://mork-local',
    // ... more configs
    prefix: '/api/v1'
    // output https://mork-local/api/v1
})
```


### .prefix 全局前置处理函数

所有接口**在请求之前**都会经过这个方法，在这里，你可以针对于请求内容做数据转换、接口请求拦截等任何事情！

```js
const const MA = new Request({
    // ... more configs
    authOptions: () => (['/home']),
    prefix: (content: any, { authOptions = [], reject = () => {}, module }: any) => {
        const hasPermission = !authOptions.find((o: string) => o === module.url);
        if (!hasPermission) {
            return reject();
        }
        return content;
    },
})
```

### .authOptions 权限值获取钩子

在每次请求前都会通过这个钩子去获取一个权限数组，这个数据之后将会传入 `.prefix` 中去作为权限数据依据

```js
const const MA = new Request({
    // ... more configs
    authOptions: () => (['/home']),
    prefix: (content: any, { authOptions = [], reject = () => {}, module }: any) => {
        const hasPermission = !authOptions.find((o: string) => o === module.url);
        if (!hasPermission) {
            return reject();
        }
        return content;
    },
})
```


### .processFix 全局过程处理函数

所有接口请求在**请求完成后**都会经过这个方法，在这里，你可以剥离默认接口请求结构以及按前后端请求规范做逻辑判断！

```js
const const MA = new Request({
    // ... more configs
    processFix: (content: any) => {
        if (content.code !== '0000') {
            console.error(content);
            throw Error(content.msg);
        }
        return content.data;
    }
})
```


### .fail 全局过程处理函数

所有接口请求在**请求失败后**都会经过这个方法，在这里，你可以做一些失败之后需要做的事情。

```js
const const MA = new Request({
    // ... more configs
    fail: (error: any) => {
        message.error(error.message);
        console.log({ ...error });
    }
})
```

