### 什么是this

> this可以理解为上下文对象。它其实提供了一种更加优雅的方式来隐式“传递”一个对象的引用，因此可以使API设计的更加简洁且易于复用。

### this到底是谁

> this是在执行上下文创建时候确定的一个变量，但是是在**运行时**才能确定。所以this到底是谁，只有在执行时候才能确定

### 如何判断this的指向？（总原则：谁调用的它，就指向谁）

##### 1、独立函数的调用

> ```javascript
> function foo(){
>     console.log(this.a)
> }
> var a = 2
> foo()  // 2
> ```
>
> 这种直接调用独立函数的方式，this指向全局对象，如果是在浏览器就指向`window`

##### 2.对象中调用（隐式绑定）

> ```javascript
> function foo() { 
>     console.log( this.a );
> }
> var obj = { 
>     a: 2,
>     foo: foo
> };
> obj.foo(); // 2
> ```
>
> foo虽然定义在全局作用域，但是调用的时候是通过obj上下文引用的，可以理解在foo调用的那一刻，即运行时是呗obj对象拥有。所以this指向obj（**谁调用的它，就指向谁 👆**）
>
> ⚠️链式调用
>
> ​	链式调用的情况下只有最后一层才会影响调用位置
>
> ​	
>
> ```javascript
> obj1.obj2.obj3.fn() //这里的fn中的this指向obj3
> ```
>
> （**谁调用的它，就指向谁 👆**）
>
> ⚠️调用函数的引用（隐式丢失this）
>
> ```javascript
> function foo() { 
>     console.log( this.a );
> }
> var obj = { 
>     a: 2,
>     foo: foo 
> };
> var bar = obj.foo; // 只是将函数的引用复制给了bar
> var a = "xxxxx"
> bar(); // xxxxx   // 运行bar，不再经过obj的上下文转换，相当于直接调用foo,此时this指向全局对象，
> 				  // 这里指window
> ```
>
> 这里的`bar`其实是引用了`obj.foo`的内存地址，这个地址指向的是一个函数，也就是说`bar`的调用其实符合“独立函数调用”规则。所以它的`this`不是`obj`
>
> 另一种解释: `bar`运行是，是全局对象在调用`bar`，故这里的`this`是指向全局对象，在浏览器里指window
>
> （**谁调用的它，就指向谁 👆**）
>
> 顺便提一下：**回调函数其实就是隐式丢失**
>
> ```javascript
> function foo() { 
>     console.log( this.a );
> }
> var obj = { 
>     a: 2,
>     foo: foo 
> };
> var a = "xxxxx"
> setTimeout( obj.foo ,100); // xxxxx
> ```
>
> **回调函数的调用者改变了**
>
> （**谁调用的它，就指向谁 👆**）

##### 3、显式绑定

> 显示绑定的说法是和隐式绑定相对的，指的是通过`call`,`apply`,`bind`显示的更改`this`的指向。
>
> 这三个方法的第一个参数都是`this`要指向的对象。
>
> ⚠️**那么apply和call是不是真的万能的呢？并不是，ES6的箭头函数就是特例，因为箭头函数的this不是在调用时候确定的，这也就是为啥说箭头函数好用的原因之一，因为它的this固定不会变来变去的了。关于箭头函数的this我们稍后再说。**
>
> 注意，如果你给第一个参数传递一个值(字符串、布尔、数字)类型的话，这个值会被转换成对象形式(调用new String(..)、new Boolean(..)、new Number(..))。
>
> 这三个方法中`bind`方法比较特殊，**它可以延迟方法的执行，这可以让我们写出更加灵活的代码**。它的原理也很容易模拟：
>
> ```javascript
> function foo(something) {
>     console.log(this.a, something);
>     return this.a + something
> }
> function bind (fn, obj){
>     return function(){
>         return fn.apply(obj, arguments)
>     }
> }
> var obj = {
>     a:2
> }
> var bar = bind(foo, obj);
> var b = bar(3) // 2 3
> console.log(b) // 5
> ```
>
> ⚠️**延迟执行**：在初始化的时候显示的绑定this====> bind(foo, ojb),在这里bind为一个闭包，返回一个可执行函数，这个匿名函数执行的时候，会绑定给定对象的this，并运行
>
> ⚠️在react的constructor里绑定this，也可以这么理解
>
> ```javascript
> class App extends Component{
>     constructor{
>         super(props)
>         this.btnClick = this.btnClick.bind(this)
>     }
> }
> // this.btnClick.bind(this)就相当于上面我们自己定义的bind函数，其返回一个绑定好this并可执行业务的函数
> // this.btnClick就是这个绑定好this并可执行业务的函数
> ```

##### new绑定

> Js中`new`与传统的面向类的语言机制不同，Js中的“构造函数”其实和普通函数没有任何区别。
> 其实当我们使用`new`来调用函数的时候，发生了下列事情：
>
> - 创建一个全新的对象
> - 给这个临时对象绑定原型
> - 给临时对象对应属性赋值
> - 将临时对象return出来
>
> **其中，第三步绑定了`this`,所以“构造函数”和原型中的`this`永远指向`new`出来的实例。**

##### 优先级

​     以上四条判断规则的权重是递增的。判断的顺序为：

- 函数是`new`出来的，`this`指向实例
- 函数通过call、apply、bind绑定过，`this`指向绑定的第一个参数
- 函数在某个上下文对象中调用（隐式绑定），`this`指向上下文对象
- 以上都不是，`this`指向全局对象

##### 严格模式下的差异

以上所说的都是在非严格模式下成立，严格模式下的`this`指向是有差异的。

- 独立函数调用： `this` 指向`undefined`
- 对象上的方法： `this` 永远指向该对象
- 其他没有区别



## ES6中的this

### 箭头函数

**箭头函数不是通过`function`关键字定义的，也不适用上面👆的this规则，而是'继承'外层作用域中的`this`指向**

> ```javascript
> var a = 1;
> var obj = {
>   a: 2
> };
> var fun = () => console.log(this.a);
> fun();//1
> fun.call(obj)//1 
> // 调用者相当于obj，而obj的作用域为global，这里即为window，this.a = 1
> ```
>
> **（箭头函数：this指向调用者存在的作用域 👆）**
>
> ```javascript
> var a = 1;
> var obj = {
>     a: 2
> };
> function fun(){
>     var a = 3;
>     let f= () => {console.log(this.a)}
>     f()
> }
> fun(); // 1
> fun.call(obj); // 2
> ```
>
> fun()时候，f()的调用者的作用域就是window， 故fun() = 1;
>
> Fun.call(obj)时候，等于显示绑定（非箭头函数），调用者成了obj，这时候运行f()，调用f的作用域就是obj（箭头函数），故fun.call(obj) = 2
>
> https://juejin.im/post/59748cbb6fb9a06bb21ae36d
> https://juejin.im/post/5acb1d326fb9a028d2083ce2

### 总结：

> 1、es5中的this,有四种this的绑定，总的指导原则就是：**谁调用它，this就指向谁**
>
> 2、es6种的this,**this指向调用者的作用域**



## 