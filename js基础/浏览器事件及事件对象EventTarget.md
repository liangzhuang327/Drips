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

⚠️在有人说dom0和dom2之类的瞎忽悠，[怼他就](http://www.ershing.cn/about-dom/)

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

核心：dispatchEvent是用来触发自定义事件











参考资料：

[自定义事件](https://www.cnblogs.com/stephenykk/p/4861420.html)