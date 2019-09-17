### Call()和apply()

###### 一、方法定义

> 1. 语法：call([**thisArg**[,arg1[, arg2[,   [,.argN]]]]])；apply([**thisArg**[,argArray]])
> 2. 定义：执行一个方法。（根据第一个参数来改变执行方法的上下文环境--this）
> 3. 参数：
>    - **thisArg**:该参数用来指定函数调用时候的上下文环境。
>    
>      > 这里关于`thisArg`说以下几个注意点
>      >
>      > - 不传，或者传`null`,`undefined`,this指向window对象（如果没有给定女朋友，那只能日天日地日空气了）
>      > - 传递另一个函数的函数名fun2,this指向函数fun2的this指向（fun2随谁，俺就随谁，嫁鸡随鸡嫁狗随狗？）
>      > - 值为原始值（数字，字符串，布尔），this会指向该原始值的自动包装对象，如Number，String,Boolean
>      > - 传递一个对象，函数中的this指向这个对象
>    
>      在上面`thisArg`参数介绍中，我们发现一个共同的事实就是：`thisArg`参数永远会是个对象。原始值就用原始值的构造对象，函数就用引用该函数的对象，无对象就用全局对象。`thisArg`定义虽然没说我必须是个对象，但最终都要转换成对象，换成心语：老子就要对象。........我辈之人哈，想要还不明说。。
>    
>      
>    
>    - **arg1, arg2, ...**：执行函数时传入的参数
>    
>    - **argArray**:类数组参数（array-like）,如果函数不需要此参数，则值应为null或者undefined
> 4. 返回值：调用call方法，相当于**执行函数本身**。返回值为函数的返回值

###### 二、call和apply的区别

> 1、参数的区别，call传入的的是参数列表，apply传入的是参数数组
>
> 2、apply的优势：从apply的调用形式以及最终函数的执行知道，**apply可以将类数组参数拍平**
>
> ```javascript
> //1、只要函数的参数是拍平的，但实际场景却给出的是类数组，就可以用apply来优雅解决
> 
> /*我们需要在console.log基础上二次封装*/
> var log = function(){
>   var args = Array.prototype.slice.call(null, arguments)
>   args.unshift(new Date().format('yyyy-MM-dd hh:mm:ss'))
>   console.log.apply(null, args) // 将类数组参数拍平
> }
> ```

###### 三、为什么出现call/apply？call/apply的产生背景，要解决的痛点？

> 一、出现的背景
>
> 在早期，js定位为“网页小助手”语言，只负责做简单的校验表单字段小活，一度还沦为广告弹框专属语言，因为其尴尬的定位，所以js充满各种意想不到的坑，大家一直也不怎么重视它，直到基于Ajax技术的Gmail项目诞生(Gmail项目不是直接原因，这里只是借机聊下js历史)，大家才发现利用js可以做出这么多牛逼的交互，一时间，各大公司蜂拥而至，大公司的项目往往预示着项目的复杂和多人协作，当项目一复杂后大家发现js的缺点就暴露出来了，js虽然在其名里面包含了Java，但其命名只属于取巧沾光，Java面向对象编程的特性可没被js吸收，js语言更具函数式编程特性，函数为js语言的一等公民，当函数越写越多之时，管理他们的艺术就被提上了台面，为了复杂项目开发的规范化、统一化，js迫切需要引入面向对象的相关思想，但面向对象属于语言灵魂层次，js作为函数式编程使用了这么多年，不可能想改就改灵魂层次的东西，为了兼顾函数式编程的灵活和面向对象编程的规范，js开发的相关组织做了很多努力，其中一个努力就是创造出了bind、call、apply三个媒婆，这三个媒婆的共同作用就是为js的一等公民**Function函数**找个门当户对的人家(指明**Function函数**的this指向)
>
> 二、要解决的痛点
>
> 在以前，函数的this指向指向被调用者，意味着一个对象想要调用一个函数，此对象必须拥有此函数（无论对象本身还是对象原型上）。一个对象A想要调用另一个对象B的方法，只能是在A上重新定义一下或者是将函数挂到A和B对象共有的原型上。这样就造成了函数使用的局限性，**call/apply/bind就是用来改变函数的this指向**，将函数的可用性极大的提高

###### 四、call/apply的应用场景

call/apply的应用场景主要围绕着**改变函数中this的指向展开的**

场景一：获取数组中的最大／小值

```javascript
var nums = [11, 15, 2, 20, 10];

var max = Math.max.apply(null, nums);
var min = Math.min.apply(null, nums);

console.log(max); // 20
console.log(min); // 2
```

场景二：将类数组转换为真正数组

```javascript
var func = function(){
  var argArray = Array.prototype.slice.call(arguments)
  console.log(argArray)
}
func(1,2)
// [1,2]
```

场景三：判断js数据类型

```javascript
var obj = {}
Object.prototype.toString.call(obj) //"[object Object]"
var arr = []
Object.prototype.toString.call(arr)// "[object Array]"
```

场景四：继承

```javascript
// 再深入，还不太清
var Person = function(){
  this.name='11'
  this.say = function(){
    console.log(this.name)
  }
}
```

