# fetch的一些基础东西

> 为了写一篇封装请求服务的文章做准备，其中包含两种形式：ajax和fetch；此篇是积累一些常用的知识点

- fetch是基于promise实现的（解决ajax的回调函数模式，写法不简洁），使用fetch服务器返回400，500错误代码时并不会reject，只有网络错误等导致请求不能完成时，fetch才会reject；这与ajax不一样（区别）

  用promise实现fetch：

  ```javascript
  fetch(url).then(function(response){
      if(response.status !== 200){
          // 服务错误处理
          return
      }
      return response.json();
  }).then(function(data){
      // 服务返回的数据data
  }).catch(function(error){
      console.error(error) //reject模式，网络错误等造成
  })
  ```

  用async／await来实现fetch：

  ```javascript
  const async proxy = (url) => {
      try{
          let response = await fetch(url);
          if(response.status !== 200){
              // 服务错误处理
              return
          }
          let data = await response.json();
          return data // 服务返回的数据data
      } catch(error){
          console.error(error)//reject模式，网络错误等造成
      }
  }
  ```

  > 注：async/await 是非常新的 API，属于 ES7，目前尚在 Stage 1(提议) 阶段，这是它的[完整规范](https://github.com/lukehoban/ecmascript-asyncawait)。使用[Babel](https://babeljs.io/) 开启 [runtime](https://babeljs.io/docs/usage/runtime/) 模式后可以把 async/await 无痛编译成 ES5 代码



- fetch请求默认时不待cookie的，需要在fetch的第二个参数重设置credentials: 'include', fetch(url, {credentials: 'include'})；与ajax不一样（区别之一）



- 在触屏项目中（零售用的触屏机器），亲测用fetch发送的请求会相对于ajax形式多处300毫秒，在触屏上就会差距很大



- fetch的返回response，并不是我们预想的格式，而是返回了一个带有body和请求状态的集合，我们需要个服务返回都在这个body（ReadableStream流之中）；所以我们需要调用一个恰当的方法来转换这个流（.json(), .text(), .blob()）；

  ​    



- ​



- ​