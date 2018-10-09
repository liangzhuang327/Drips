# Promise

> promise一些常识知识点

###### 1、resolve后的执行情况

​	在实例化的promise对象里，无论是执行resolve，reject，都会将函数剩余的代码执行完。所以当你想resolve或者reject后，后续的代码不再执行，可以在其后边return，终止。

```javascript
const promise = new Promise((resolve, reject) => {
    console.log('mark 1');
    return resolve('hello world');     // reject('hello world');
    console.log('mark 2');             // never be here,没有return，无论顺序都会打印 mark 2
});

promise.then(result => {
    console.log(result);
}).catch(err => {
    console.log(err);
});
```



###### 2、then的第二个参数和catch的区别

​	我们知道then的第二个参数和catch的用法差不多，都是用来做错误处理的；

​	

```javascript
let promise1 = new Promise((resolve, reject) => {
    reject('this is an error');
});

promise1.then(data => {
    console.log(data);
}, err => {
    console.log('handle err:', err);    // handle err: this is an error,用then来捕获reject函数的返回，状态机由pending => reject,变为reject调用then的第二个参数！
});

let promise2 = new Promise((resolve, reject) => {
    reject('this is an error');
});
promise2.then(data => {
    console.log(data);
}).catch(err => {
    console.log('handle err:', err);    // handle err: this is an error，用catch来捕获rejet函数的返回
});
```

​	二者的区别：then的第二个参数无法处理第一个参数函数中的错误，但catch可以捕获

```javascript
let promise1 = Promise.resolve();
promise1.then(() => {
    throw Error('this is a error');   //UnhandledPromiseRejectionWarning: Unhandled promise rejection
}, err => {
    console.log(err); // 这里没有返回，因为reject函数没有返回，状态机由pending到fulfilled，调用then的第一个参数
})

let promise2 = Promise.resolve();

promise2.then(() => {
    throw Error('this is a error');  
}).catch(err => {
    console.log('handle err:', err);    //handle err: Error: this is a error，catch来捕获整个promise对象中的错误
})
```



# Async/await

> 散乱知识点

###### 1、async函数中只要有reject状态的promise对象，async函数就会就此终止，不再运行下面的函数体。



```javascript
const p1 = new Promise((resolve, reject)=>{
  setTimeout(()=>{
    reject('p1延迟1秒reject')
  }, 1000)
})
const p2 = new Promise((resolve, reject)=>{
  resolve('p2 resolve')
})
const func = async() =>{
  let p2Result = await p2;
  console.log('p2Result'+p2Result) // p2Resultp2 resolve
  let p1Result = await p1;
  console.log('p1Result'+p1Result) // p1Result await之后返回一个reject状态的promise对象，整个async函数不再继续往下走,进入func()的reject函数中
  return [p1Result, p2Result];
}
let final = func(); 
console.log(final); // Promise {<pending>}
final()
  .then(v=>{
    console.log('成功'+v) // final中有reject，直接返回，不会走final的return，即final函数的resolve不会走，即此处then不会走
  }).catch(err=>{
    console.log('catch'+err) // catchp1延迟1秒reject
  })
```



###### 2、在async／await中，await后边跟一个promise对象，await强制剩下的代码等待直			到那个Promise结束并且返回一个结果：

​	a:这个promise对象为resolve状态：返回promise对象的resolve值；

​	b:这个promise对象为pending状态： 返回Promise {<pending>}；

​	c:这个promise对象为reject状态： async函数直接终止，进入主体函数（async）的	reject处理函数

```javascript

const func = async() =>{
  
  return new Promise((resolve, reject)=>{
              resolve('p2 resolve')
            })
}
const func_ = async()=>{
	let final = func(); 
	console.log(final); // Promise {<pending>}
	let final_ = await func();
	console.log(final_) // p2 resolve
}
func_() // Promise {<pending>}


```

