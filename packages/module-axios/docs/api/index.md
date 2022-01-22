# API

## create 创建api

```ts
const const MA = new Request({ ... })

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

// 输出
/**
 * {
 *    user,
 *    project: {
 *        list,
 *        create
 *    }
 * }
 */

// 调用
const getProjects = async () => {
  const content = await MA.io.project.list()
}
```