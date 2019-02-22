[1、浏览器事件一：事件的基础应用](http://www.igooda.cn/jzjl/20150322837.html)

[2、浏览器事件二：浏览器是如何实现事件](http://blog.csdn.net/hulk_oh/article/details/52852005)

[3、浏览器事件三：自定义事件](https://blog.csdn.net/hulk_oh/article/details/52902412)

#### 1、DOM的事件监听方式

- 内联属性形式：<div onclick="alert('1234')"></div>;react的事件绑定并不属于内联形式，使用了语法糖

- DOM属性绑定：

  ```javascript
  element.onclick = function(event){
      alert('你点击了这个按钮');
  };
  ```

​     这种方式很常见，jq常用，但是也有缺陷，因为是直接赋值给dom的属性，所以重复赋值后边的执行函数回覆盖前边的执行函数，虽然也可以实现布覆盖，但需要些兼容方法

- 标准事件监听函数：element.addEventListener(<event-name>, <callback>, <use-capture>);

⚠️在有人说dom0和dom2之类的瞎忽悠，拿概念靠你 [怼他就](http://www.ershing.cn/about-dom/)

以上有不解详见：浏览器事件一：事件的基础应用

#### 2、浏览器如何实现事件系统（事件源对象、事件对象、事件监听器）

##### EventTargt:你不知道的事件对象

​	我们都知道dom节点，document，window等都有addEventListener属性，有没有猜测过为什么这几个对象都有事件监听的属性？如果让你实现这几个对象都有次属性怎么办？

我当然抽出一个事件对象来，然后让上述几个对象的原型指向事件对象！我们来验证一下：

```javascript
document.__proto__.__proto__.__proto__.__proto__
//EventTarget {addEventListener: ƒ, removeEventListener: ƒ, dispatchEvent: ƒ, constructor: ƒ, Symbol(Symbol.toStringTag): "EventTarget"}

window.__proto__.__proto__.__proto__
//EventTarget {addEventListener: ƒ, removeEventListener: ƒ, dispatchEvent: ƒ, constructor: ƒ, Symbol(Symbol.toStringTag): "EventTarget"}

//我们看到原型顶层都是继承了EventTarget事件对象
// EventTarget事件对象里有三个属性，就是我们常用的事件监听，移除事件监听
```

有了事件对象，按照浏览器的做法，我可不可以自己建立一个对象集成事件对象，那我自定义的对象也就可以进行监听了！何乐而不为：

```javascript
function A (){
    this.value = 1
}
A.prototype = new EventTarget();
var a = new A();
a.addEventListener // ƒ addEventListener() { [native code] }
a.addEventListener() // 报错 Uncaught TypeError: Illegal invocation
```

通过上述代码，发现EventTarget对象好像是浏览器内置的，不暴露给开发者自己使用的对象；所以自定义一个拥有事件对象的对象好像行不通！

##### EventTarget对象中的dispatchEvent是什么

核心：target.dispatchEvent（event）是用来触发自定义事件，派发一个事件\

- event：需要派发的事件对象
- target：触发自定义事件的目标

接下来就来演示从网上找资料体验自定义事件的过程（悲催加蒙蔽过程）

```javascript
/* 第一种 */
	// 注册监听
document.addEventListener('lz', function(e){
    console.log('自定义事件 lz 触发')
    console.log(e)
}, false);
	// 注册自定义事件的名称
var selfEvent = new MouseEvent('lz')
	// 派发事件 用代码来触发事件
document.dispatchEvent(selfEvent) 
// 打印如下：
// 自定义事件 lz 触发
// MouseEvent {isTrusted: false, screenX: 0, screenY: 0, clientX: 0, clientY: 0, …}
```

> 1、从上述代码我猜测，有一个全局构造函数MouseEvent，用来初始化一个mouse有关的事件对象；
>
> 🚩2、由上述打印出的MouseEvent对象可以和浏览器自带的事件监听（例如click）对比一下：
>
> ​	鼠标在浏览器页面点击，点击的过程就相当于@1：初始化事件对象；@2：派发／触发事件；
>
> ​	@3：将初始化的事件对象传给addEventListener的callback处理函数，即MouseEvent对象

```javascript
/* 第二种 */
document.addEventListener('lzAlert', function(e){
    console.log('自定义事件 lzAlert 触发')
    console.log(e)
}, false);
	// 创建
var selfEvent = document.createEvent('UIEvents');
	// 初始化
selfEvent.initUIEvent('lzAlert', false, false);
	// 派发事件 用代码来触发事件
document.dispatchEvent(selfEvent);
// 自定义事件 lzAlert 触发
// UIEvent {isTrusted: false, view: null, detail: 0, sourceCapabilities: null, which: 0, …}
```

> 妈卖批，什么鬼！document下还有个createEvent的方法？创建完事件对象还需要初始化才能用？
>
> 别着急，还有一种别的自定义方法！

```javascript
/* 第三种 */
document.addEventListener('lzbibi', function(e){
    console.log('自定义事件 lzbibi 触发');
    console.log(e);
}, false)
	// 创建初始化事件对象
var selfEvent = new Event('lzbibi');
	// 派发事件 用代码来触发事件
document.dispatchEvent(selfEvent);
// 自定义事件 lzbibi 触发
// Event {isTrusted: false, type: "lzbibi", target: document, currentTarget: document, eventPhase: 2, …}
```

> 卧槽，有个Event对象，那还用document.createEvent（）感冒用？和第一种方法差不多，怎么window下有Event对象还有MouseEvent对象？

##### 哪来的那么多Event有关对象，它们之间的关系是什么？

dipatchEvent分发事件，我们实质上分发的是一个**事件类型对象**（下面称为event对象，这些对象在JavaScript中 是Event类的子类），下图是事件类型的结构图

![](https://github.com/liangzhuang327/Drips/blob/master/pictrues/EventPrototype.png)



#### 3、能不能自己模拟实现一个EventTarget构造函数，实质就是发布订阅模式的实现

回归主题，因为EventTarget对象是个内置对象，不对外开放。那我能不能自己模拟实现一个EventTarget？

> 分析：
>
> 1、EventTarget对象是顶层对象，document等对象都是继承于它，所以EventTarget得是一个构造函数
>
> 2、接下来就是三个方法的实现

```javascript
EventTarget.prototype.addEventListener = function(type, func){
  if( !(type in this.listeners) ){
      this.listeners[type] = []
  }
  this.listeners[type].push(func)
}
EventTarget.prototype.removeEventListener = function(type, func){
  if( !(type in this.listeners) ){
    return 
  }
  for(var i=0, length=this.listeners[type].length;i<length;i++){
    if(this.listeners[type][i] === func){
      this.listeners[type].splice(i, 1)
    }
  }
}
// 派发，触发事件
EventTarget.prototype.dispatchEvent = function(event){
  if(!event || !event.type || !this.listeners || !this.listeners[event.type]){
    return 
  }
  // 自己未曾想到； 将调用者对象赋值给event.target
  event.target = this;
  for(var i=0,length=this.listeners[event.type].length;i<length;i++){
    this.listeners[event.type][i].call(this, event)
  }
}
```

🌿很多源码里都喜欢用call的方法 [看这里](http://www.cnblogs.com/f-dream/p/4950918.html)
   Array.prototype.slice.call(arguments)转成真正数组用  [看这里](https://www.cnblogs.com/yzhihao/p/7053796.html)



#### 从浏览器事件监听的实现  反思得到启发

> **现状**：我们为`window`、`document`、`dom节点`等设置监听，当这些事件源对象触发相应的事件时候，执行这些监听函数；并且还可以设置监听自定义事件，使我们使用事件系统更加灵活
>
> **启发**：@1：我们发现浏览器现有的事件句柄中（click等），只有触发句柄事件才会运行监听函数；
>
> ​	    @2：自定义事件，我们可以随时随地的在代码任何地方手动触发句柄，即在任何地方来触发监听函		数，这非常好；但有一点，自定义事件是需要依赖浏览器的**Event对象**和**拥有监听方法(addEventListner)的对象**（继承了EventTarget的对象，window,document, dom节点等）；
>
> ​	    @3：我们自己用发布／订阅模式做一套能够随时随地监听的系统

```javascript
//@2
selfEvents = {};
selfEvents.on = function (name, callback, context) {
  if (!name || !callback) return;
  this._events || (this._events = {});
  var events = this._events[name] || (this._events[name] = []);
  events.push({ callback: callback, context: context });
};
selfEvents.un = function (name, callback) {
  if (!name || !this._events || !this._events[name]) return;
  if (!callback) {
    delete this._events[name];
  } else {
    var index = this._events[name].findIndex(function (value) {
      if (value.callback === callback)
        return true;
    });
    if (index !== -1)
      this._events[name].removeData(this._events[name][index]);
  }
};
selfEvents.hasEvent = function (name) {
  if (!name) return;
  return this._events && this._events[name] && this._events[name].length;
};
selfEvents.execute = function (name) {
  if (!name) return;
  var events = this._events ? this._events[name] : null;
  if (!events) return true;
  var result = true;
  var args = Array.prototype.slice.call(arguments, 1);
  events.forEach(function (event) {
    result = event.callback.apply(event.context || this, args) === false ? false : result;
  }, this);
  return result;
};
```



待解决：

window.Event和window.EventTarget的区别

参考资料：

[自定义事件](https://www.cnblogs.com/stephenykk/p/4861420.html)