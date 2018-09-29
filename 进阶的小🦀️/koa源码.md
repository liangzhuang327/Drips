>解读源码koa的use，中间件原理以及中间件核心koa-compose的实现

```javascript
/**
 * 1、get, set 增加对象取值和赋值的自定义方法，在取值和赋值过程中做自定义操作
 * 
 * 2、中间件：对请求做自定义的操作
 * 
 * 3、koa处理中间件的核心就是koa-compose，compose接受中间件数组为参数，返回一个维护
 *    了中间件数组下标的闭包，这个闭包函数接受context为参数；闭包返回的是一个promise对象
 * 
 * 4、在http.createServer(callback()),callback即为请求处理函数，其有两个参数req和res(node API);
 *    在callback中处理req，并执行闭包函数，闭包返回promise对象后在处理res对象，res.end()至此koa流程完成
*/


const http = require('http')
let request = {
  get url(){
    return this.req.url
  }
}
let response = {
  get body(){
    return this._body
  },
  set body(val){
    this._body = val
  }
}

let context = {
  get url(){
    return this.request.url
  },
  get body(){
    return this.response.body
  },
  set body(val){
    this.response.body = val
  }
}
class Application {
  constructor(){
    // this.callback = ()=>{}
    this.context = context
    this.request = request
    this.response = response
    this.middlewares = []
  }
  use(callback){
    this.middlewares.push(callback)
    // this.callback = callback
  }
  compose (middlewares){
    return function(context){
      return dispatch(0)
      function dispatch(i){
        let fn = middlewares[i]
        if(!fn){
          return Promise.resolve()
        }
        return Promise.resolve(fn(context,function next(){
          return dispatch(i+1)
        }))
      }
    }
  }
  listen(...args){
    const server = http.createServer(async(req,res)=>{
      let ctx = this.createCtx(req,res)
      const fn = this.compose(this.middlewares)
      await fn(ctx)
      ctx.res.end(ctx.body)
      // this.callback(req,res)
    })
    server.listen(...args)
  }
  createCtx(req, res){
    let ctx = Object.create(this.context)
    ctx.request = Object.create(this.request)
    ctx.response = Object.create(this.response)
    ctx.req = ctx.request.req = req
    ctx.res = ctx.response.res = res
    return ctx
  }
}
module.exports = Application
```

