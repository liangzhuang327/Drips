### 属性描述对象

> 定义：
>
> JavaScript 提供了一个内部数据结构，用来描述对象的属性，控制它的行为，比如该属性是否可写、可遍历等等。这个内部数据结构称为“属性描述对象”（attributes object）。每个属性都有自己对应的属性描述对象，保存该属性的一些元信息。属性描述对象里的属性我们又称元属性。

### 元属性

（1）`value`

`value`是该属性的属性值，默认为`undefined`。

（2）`writable`

`writable`是一个布尔值，表示属性值（value）是否可改变（即是否可写），默认为`true`。

（3）`enumerable`

`enumerable`是一个布尔值，表示该属性是否可遍历，默认为`true`。如果设为`false`，会使得某些操作（比如`for...in`循环、`Object.keys()`）跳过该属性。

（4）`configurable`

`configurable`是一个布尔值，表示可配置性，默认为`true`。如果设为`false`，将阻止某些操作改写该属性，比如无法删除该属性，也不得改变该属性的属性描述对象（`value`属性除外）。也就是说，`configurable`属性控制了属性描述对象的可写性。

（5）`get`

`get`是一个函数，表示该属性的取值函数（getter），默认为`undefined`。

（6）`set`

`set`是一个函数，表示该属性的存值函数（setter），默认为`undefined`。

> 上述元属性介绍没有什么可说的，都是定义，但有个容易混淆的就是`configurable`属性：

```javascript
var obj = {};
// 1
Object.defineProperties(obj, {
	'name':{
		value: 1,
		configurable: false,
		writable: false
	}
})
// 2
Object.defineProperties(obj, {
	'name':{
		writable: true
	}
}) // 报错 Uncaught TypeError: Cannot redefine property: name at Function.defineProperties
Object.getOwnPropertyDescriptor(objss, 'name')
// configurable: false
// enumerable: false
// value: 1
// writable: false
// 1和2对比发现：第一次给obj定义name属性时候，元属性configurable设置为false,之后更改元属性（除value之外）报错
// 3
Object.defineProperties(obj, {
	'name':{
		writable: false
	}
}) // 不报错
Object.getOwnPropertyDescriptor(objss, 'name')
// configurable: false
// enumerable: false
// value: 1
// writable: false
// 2和3对比发现：第一次给obj定义name属性时候，元属性configurable设置为false,之后更改元属性（除value之外）,如果修改的元属性和第一次定义的元属性相同（这里是writable），这里就不会报错

```

上述演示代码总结：元属性configurable设置为false之后，在修改元属性都不会修改成功。修改值与第一次定义（元属性）相同，不会报错，相当于没有修改；修改值与第一次定义（元属性）不同，就会报错，同样不会修改成功。

### 属性描述对象的用途：

1、如果自己写库的话，库里定义的一些对象的属性，为了防止别人重写或覆盖，可以设置元属性writable:false;或者一些属性不希望被继承者遍历到，可以设置enumerable：false。

2、接下来用途最多的就是取值函数了，因为vue的流行，使其关注率提升了，setter和getter实现数据的双向绑定，自己可以做一些中间操作



### es6实现----Proxy 代理

[es6proxy](http://es6.ruanyifeng.com/#docs/proxy)

1、new Proxy(target, handler)

- Target: 可以使对象，数组，函数
- handler: 是一个对象，里边是自定义拓展拦截方法（一共13种）



### es6Reflect简单了解一下

>  Why:
>
> 以前，对象一些语言内部属性都是挂在到Object对象上，实例里是没有这些方法的。Reflect就是将所有的语言内部属性挂在到Reflect对象上
>
> 解决了什么问题：
>
> 现如今语言内部属性都挂在到了Reflect上，调用方便，处理合理（修改元属性不报错），最重要的是Refelect和Proxy对应与联系实现了：proxy拦截并添加业务行为，Reflect来实现原有的默认行为；
>
> **确保完成原有的行为(Reflect)，然后再部署额外的功能(Proxy)**

`Reflect`对象与`Proxy`对象一样，也是 ES6 为了操作对象而提供的新 API。`Reflect`对象的设计目的有这样几个。

（1） 将`Object`对象的一些明显属于语言内部的方法（比如`Object.defineProperty`），放到`Reflect`对象上。现阶段，某些方法同时在`Object`和`Reflect`对象上部署，未来的新方法将只部署在`Reflect`对象上。也就是说，从`Reflect`对象上可以拿到语言内部的方法。

（2） 修改某些`Object`方法的返回结果，让其变得更合理。比如，`Object.defineProperty(obj, name, desc)`在无法定义属性时，会抛出一个错误，而`Reflect.defineProperty(obj, name, desc)`则会返回`false`。

```javascript
// 老写法
try {
  Object.defineProperty(target, property, attributes);
  // success
} catch (e) {
  // failure
}

// 新写法
if (Reflect.defineProperty(target, property, attributes)) {
  // success
} else {
  // failure
}
```

（3） 让`Object`操作都变成函数行为。某些`Object`操作是命令式，比如`name in obj`和`delete obj[name]`，而`Reflect.has(obj, name)`和`Reflect.deleteProperty(obj, name)`让它们变成了函数行为。

```javascript
// 老写法
'assign' in Object // true

// 新写法
Reflect.has(Object, 'assign') // true
```

（4）`Reflect`对象的方法与`Proxy`对象的方法一一对应，只要是`Proxy`对象的方法，就能在`Reflect`对象上找到对应的方法。这就让`Proxy`对象可以方便地调用对应的`Reflect`方法，完成默认行为，作为修改行为的基础。也就是说，不管`Proxy`怎么修改默认行为，你总可以在`Reflect`上获取默认行为。

```javascript
Proxy(target, {
  set: function(target, name, value, receiver) {
    var success = Reflect.set(target,name, value, receiver);
    if (success) {
      console.log('property ' + name + ' on ' + target + ' set to ' + value);
    }
    return success;
  }
});
```

上面代码中，`Proxy`方法拦截`target`对象的属性赋值行为。它采用`Reflect.set`方法将值赋值给对象的属性，确保完成原有的行为，然后再部署额外的功能。

下面是另一个例子。

```javascript
var loggedObj = new Proxy(obj, {
  get(target, name) {
    console.log('get', target, name);
    return Reflect.get(target, name);
  },
  deleteProperty(target, name) {
    console.log('delete' + name);
    return Reflect.deleteProperty(target, name);
  },
  has(target, name) {
    console.log('has' + name);
    return Reflect.has(target, name);
  }
});
```

上面代码中，每一个`Proxy`对象的拦截操作（`get`、`delete`、`has`），内部都调用对应的`Reflect`方法，保证原生行为能够正常执行。添加的工作，就是将每一个操作输出一行日志。

有了`Reflect`对象以后，很多操作会更易读。

```javascript
// 老写法
Function.prototype.apply.call(Math.floor, undefined, [1.75]) // 1

// 新写法
Reflect.apply(Math.floor, undefined, [1.75]) // 1
```