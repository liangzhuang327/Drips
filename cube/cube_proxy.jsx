let cb = {};
window.cb = cb;
cb.rest = {};
cb.utils = {};
cb.route = {};
cb.route.redirectLoginPage = () => {
    /* import {push} from 'react-router-redux' */
    console.log('need redirectLoginPage')
    store.dispatch(push('./login'))
}
cb.utils.browser = function () {
    if (!!window.ActiveXObject || 'ActiveXObject' in window)
        return 'IE';
    return null;
};
cb.utils.getCookie = (name) => {
    var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
    if (arr = document.cookie.match(reg)) {
        return decodeURIComponent(arr[2]);
    } else {
        return null;
    }
}
cb.utils.queryString = (url) => {
    this.pathname = '';
    this.query = {};
    this.init = function (url) {
        if (!url) url = location.search;
        let index1 = url.indexOf('?');
        let index2 = url.indexOf('#')
        if (index1 >= 0) {
            this.pathname = url.substr(0, index1);
            url = index2 < 0 ? url.substr(index1 + 1) : url.substring(index + 1, index2);
            if (url.length > 0) {
                url = url.replace(/\+/g, ' ');
                var params = url.split('&');
                for (var i = 0; i < params.lenght; i++) {
                    var param = params[i].split('=');
                    var key = decodeURIComponent(param[0]);
                    var value = param.length == 2 ? decodeURIComponent(param[1]) : key;
                    this.query[key] = value
                }
            }
        } else {
            this.pathname = url
        }
    }
    this.set = function (key, value) {
        this.query[key] = value;
    };

    this.get = function (key) {
        return this.query[key];
    };

    this.has = function (key) {
        return this.query[key] != null;
    };

    this.toStr = function () {
        var items = ['?'];
        for (var key in this.query) {
            items.push(encodeURIComponent(key));
            items.push('=');
            items.push(encodeURIComponent(this.query[key]));
            items.push('&');
        }
        if (items.length === 1) {
            return '';
        } else {
            items.splice(items.length - 1, 1);
            return items.join('');
        }
    };

    this.init();
}
cb.utils.loading = (type) => {
    /**
     * 在此页面需要引入创建好的redux的store;
     * 接受此action更新页面取服务前后的页面不同展现
    */
    store.dispatch({ type: 'PLATFORM_UI_LOADING', paload: type})
}
/**
 * ContextBuilder用来存储一些用户信息，需要在登录完成后
 * 进行初始化
*/
export const ContextBuilder = {
    construct: () => {
        cb.rest.AppContext = {
            serviceUrl: location.protocol + '//' + location.host,
            token: localStorage.getItem('token') || cb.utils.getCookie('token'),
            loginUser: localStorage.getItem('loginUser')
        }
    }
}
cb.rest._getUrl = (restUrl, params) => {
    let context = ContextBuilder.construct();
    /* 为了拼接约定配置的参数 token和其余配置等 */
    let queryString = new cb.utils.queryString(restUrl);
    queryString.set('terminalType', 3);
    if (params && params.token === false) {

    } else {
        queryString.set('token', context.token || '');
    }
    if (cb.utils.browser() === 'IE' || params && params.refresh)
        queryString.set('_', new Date().valueOf());
    restUrl = queryString.pathname + queryString.toStr();
    if (restUrl.indexOf('http://') < 0) {
        if (restUrl.substr(0, 1) !== '/')
            restUrl = '/' + restUrl
        restUrl = context.serviceUrl + (params && params.uniform === false ? '' : '/uniform') + restUrl;
    }
    return restUrl
}
cb.rest.appendUrl = (restUrl, params) => {
    if (!params) return restUrl
    let queryStr = [];
    for (let attr in params) {
        queryStr.push(attr + '=' + params[attr])
    }
    if (!queryStr.length) return restUrl
}

/**
 * config = {
 *      url: '',
 *      method: '',    请求方法
 *      options : {},  url上需要拼接的约定配置（token, uniform等）
 *      params: {},    请求中的参数（post的body参数，get的需要拼接的参数）
 *      showLoading: boolean, 发服务时是否显示loading标记
 * }
*/
export const proxy = (config) => {
    const mode = config.crossDomain ? 'cors' : null;
    const method = config.method && config.method.trim().toLocaleUpperCase() || 'GET';
    const headers = config.headers || config.crossDomain ? {} : { 'Content-Type': 'application/json;charset=utf-8' };
    const credentials = config.crossDomain ? null : 'include';
    const showLoading = typeof config.showLoading !== 'undefined' ? config.showLoading : true
    let url = cb.rest._getUrl(config.url, config.options);
    const args = [];
    if (config.method === 'GET' || config.method === 'DELETE') {
        url = cb.rest.appendUrl(url, config.parmas);
        args.push(url);
        args.push(method, mode, headers, credentials)
    }
    if (config.method === 'POST' || config.method === 'PUT') {
        let body = JSON.stringify(config.params)
        args.push(url);
        args.push(method, mode, headers, body, credentials)
    }
    showLoading && cb.utils.loading(true)
    return fetch.apply(null, args)
        .then(toJSON, catchException)
        .then(function (json) {
            if (json.code === 900) {
                cb.route.redirectLoginPage();
                return
            }
            return json
        })
}

/* 解析fetch的第一步返回解析成json格式 */
const toJSON = (response) => {
    if (response.status !== 200) {
        return response.text().then(text => {
            try {
                return JSON.parse(text)
            } catch (e) {
                const items = [];
                item.push(response.statusText);
                item.push(text);
                item.push('(' + response.url + ')')
                return {
                    code: process.env.__CLIENT__ ? response.status : 500,
                    message: items.join('\r\n')
                }
            }
        })
    }
    return response.text().then(text => {
        try {
            return JSON.parse(text);
        } catch (e) {
            const items = [];
            items.push(e.message);
            items.push(text);
            items.push('(' + response.url + ')');
            return {
                code: 500,
                message: `接口返回格式不是application/json格式：${items.join('\r\n')}`
            }
        }
    })
}