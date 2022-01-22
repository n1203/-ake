import axios from 'axios';

function isFunction(functionToCheck: Function) {
    return ({}.toString() as any).call(functionToCheck) == '[object Function]'
}

function isUndefined (obj: any) {
    return typeof obj === 'undefined'
}

/**
 * 接口请求模块
 * todo：
 *  1. 全局接口请求配置：支持多套环境配置 已完成
 *  2. 模块化定义接口，单个入口导出所有接口 已完成
 *  3. 全局/局部支持前、后置处理函数，应变应急数据结构变更、数据结构处理问题 已完成
 *  4. 支持接口数据缓存，并可以设置接口更新时间周期
 *  5. 支持自定义接口请求载入
 *
 *  全局配置伪代码
 *  import gdIo from 'gd-io'
 *  gdIo.init({
 *    api: 'http://xxxxxx',
 *    prefix: '',
 *  })
 */

function splitNames(name: string) {
    return name.split('.');
}

interface api {
    url: string;
    when: Function | Boolean;
}

interface options {
    api: string | Array<api>;
    useApiIndex?: number;
    axiosOptions?: object;
    authOptions?: any;
    prefix?: Function;
    processFix?: Function;
    fail?: Function;
}

export enum method {
    'get' = 'get',
    'post' = 'post',
    'delete' = 'delete',
    'opinion' = 'opinion',
    'put' = 'put',
}

interface createModules {
    name?: string;
    method: method;
    url: string;
    useApiIndex?: number;
    prefix?: Function;
    processFix?: Function;
    fail?: Function;
    config?: options;
}

/**
 * 请求模块
```
const request = new Request({
    // 可以传字符串或者对象,按api类型变更当前全局api地址，具体条件按传输（可以用于通过环境控制api地址）
    api: [{
        url: 'http://',
        when: () => {},
    }],
});
```
 */
class Request {
    #api = ''; // 全局api地址
    #apis: Array<any> = []; // 全局api地址

    #axiosOptions: any = {}; // headers

    #prefix?: Function; // 全局前置处理函数

    #processFix?: Function; // 全局过程处理函数

    #fail?: Function; // 全局过程处理函数

    io: any = {}; // 全局io模块汇聚

    #axios: any = {};

    #getAuthOptions: any = {}; // 全局权限信息

    constructor({
        api = '', // 可以传字符串或者对象
        axiosOptions = {},
        prefix, // 前置处理函数
        processFix, // 过程处理函数
        fail, // 错误处理函数
        authOptions = () => {}, // 权限内容
        useApiIndex,
    }: options) {
        this.#axiosOptions = axiosOptions;
        this.#prefix = prefix;
        this.#processFix = processFix;
        this.#fail = fail;
        this.#getAuthOptions = isFunction(authOptions) ? authOptions : () => authOptions;
        // 按api类型变更当前全局api地址，具体条件按传输（可以用于）
        this.#apis = Array.isArray(api) ? api : [{ url: api, when: () => true }];
        if (!isUndefined(useApiIndex)) {
            this.#api = this.#apis[useApiIndex as number].url;
        } else {
            Array.isArray(api)
                ? [...api].reverse().forEach((o) => {
                      o.when instanceof Function
                          ? o.when() && (this.#api = o.url)
                          : o.when && (this.#api = o.url);
                  })
                : (this.#api = api);
        }
        // 创建axios
        this.#axios = axios.create({
            baseURL: this.#api,
            ...this.#axiosOptions,
        });
        this.#axios = this.#createAxios();
    }

    /**
     * 创建API
     */
    create(name: string, modules: createModules | Array<createModules>) {
        const hasModules = Array.isArray(modules);
        if (!name && !hasModules && !modules.name) {
            throw Error('name、modules.name 不能同时不定义');
        }

        (!hasModules ? [modules] : modules).forEach((module) => {
            let path = this.io;
            const names = splitNames(name);
            names.forEach((o, i) => {
                if (!path[o]) {
                    path = path[o] =
                        names.length - 1 === i && !module.name ? this.#getAxios(module) : {};
                } else {
                    path = path[o];
                }
            });
            if (module.name) {
                const moduleNames = splitNames(module.name);
                moduleNames.forEach((o, i) => {
                    if (!path[o]) {
                        path = path[o] = moduleNames.length - 1 === i ? this.#getAxios(module) : {};
                    } else {
                        path = path[o];
                    }
                });
            }
        });
    }

    /**
     * 请求体构建器
     * @param module
     * @returns
     */
    #getAxios(module: createModules) {
        return async (data: any, configs: any) => {
            let content: any;
            try {
                // 权限拦截
                const throwError = (error: string) => {
                    throw Error(error || 'Permission denied');
                    return '';
                };
                // 全局前置处理函数
                data =
                    (this.#prefix
                        ? this.#prefix(data, {
                              data,
                              reject: throwError,
                              global: this,
                              module,
                              authOptions: this.#getAuthOptions(),
                          })
                        : data) || data;
                // 模块前置处理函数
                data =
                    (module.prefix
                        ? module.prefix(data, {
                              data,
                              reject: throwError,
                              global: this,
                              module,
                              authOptions: this.#getAuthOptions(),
                          })
                        : data) || data;
                // url组合
                let url = isUndefined(module.useApiIndex)
                    ? module.url
                    : `${this.#apis[module.useApiIndex as number].url}${module.url}`;
                if ([method.get, method.delete].includes(module.method)) url = `${url}?${data ? Object.entries(data).map((v: any) => v.join('=')).join('&') : ''}`
                // 真正的请求
                content = await this.#axios[method[module.method]](url, data, configs);
                // 全局后置处理函数
                content.data = module.processFix
                    ? module.processFix(content.data, content)
                    : content.data;
                // 模块后置处理函数
                content.data = this.#processFix
                    ? this.#processFix(content.data, content)
                    : content.data;
            } catch (error) {
                // 全局错误拦截函数
                content = module.fail ? module.fail(error) : error;
                // 模块错误拦截函数
                content = this.#fail ? this.#fail(error) : error;
            }
            return content?.data;
        };
    }

    /**
     * 创建接口请求
     * @param props
     * @param config
     */
    #createAxios(config: any = {}) {
        return axios.create({
            baseURL: this.#api,
            ...this.#axiosOptions,
            ...config,
        });
    }
}

export default Request;
