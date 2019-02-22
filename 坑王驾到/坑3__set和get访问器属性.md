#### 坑1: 设置了访问器，访问的时候报错Uncaught RangeError: Maximum call stack size exceeded；调用溢出

```javascript
var person = {
    a:1
}
// 下面的this指向ogj(person)
Object.defineProperty(person,'a',{
    get(){
		console.log('get +++ ')
        return this.a 
    },
    set(val){
        console.log('set +++' + val)
        this.a = val 
    }
})
person.a // Uncaught RangeError: Maximum call stack size exceeded

// 按照网上的瞎逼资料理解，访问a属性应该打印'get +++ '，然并卵，却抛出上述错误

// 吐槽网上博客大多数无脑粘贴的文章贴出来的代码，如下面👇：
let obj = {};
let name = '张三';
Object.defineProperty(obj,"name",{
    get:function (){
        return name ;    
    },
    set:function (value){
        name = value;
    }
});
// 这样每次访问一个obj对象的属性时候去改变另一个变量的值，我至今没有想到它的实际应用场景在哪里？
// 改变obj.num，结果不是改变obj.num ？ 难道不是本末倒置？？？
// sb一样弄个全局变量去来回改变，实际用途？当然这种情况不会出现Uncaught RangeError: Maximum call stack size exceeded这样错误

```

### 解决坑1:

> Uncaught RangeError: Maximum call stack size exceeded，出现这个原因就是因为一直循环调用造成的，仔细分析一下为什么会造成循环调用？
>
> ```javascript
> person.a → get.call(person) → this.a → person.a  → get.call(person) → this.a......
> 
> //我们调用person.a触发访问器属性，调用get.call(person)，get函数返回的是this.a即是person.a，此时又会触发get, get又会触发访问person.a,如此死循环
> ```

知道原因了，下面我们来解决一下：

**设置obj的一个属性(name)的描述属性的时候（get, set），在函数体里不能在调用次属性(name)**，

不能直接访问，那我们就在obj里设置一个name的副本做中间转换之用

```javascript
var person = {
    name:1
}
Object.defineProperty(person,'name',{
    get(){
		console.log('get +++ ')
        return this._name || 1 
    },
    set(val){
        console.log('set +++' + val)
        this._name = val 
        return val
    }
})
```

#### 坑1-1:给obj对象一个属性设置访问器属性就要建立一个副本来转换，那我要监听obj里所有的属性，都建立副本是不是很浪费资源？

> 不对不对，我还是想一下为什么要设置属性访问器吧以及访问器的返回。寻找一波官方文档，走起
>
> 妈卖批，官方文档打不开又，破网！
>
> 经过上面分析，以及跑代码，看效果，大概了解了get和set访问器的用途了：
>
> **属性访问器，即是一个在读取属性(get)和设置属性(set)过程中提供给开发者的一个扩展机制！无论get还是set函数的返回就是读取到的值和设置的值，大部分情况下我们只需要在读取和赋值过程中拓展我们的业务，很少去干预返回，所以这两个函数的返回我们可以不干预，走系统默认。**纯属自己总结定义，官网打不开，不知道对不对，应该没毛病老铁

### 解决坑1-1

```d
var person = {
    a:1
}
Object.defineProperty(person,'a',{
    get(){
		console.log('get +++ ')
        // 不干预返回，加入我们处理的业务就好
    },
    set(val){
        console.log('set +++' + val)
        // 不干预返回，加入我们处理的业务就好
    }
})
person.a // get +++

```

------

回头看看我最开始说的那些无脑粘贴别人那段代码，我又有不同的理解了:

在他的代码里，没有干预set和get的返回，只是在赋值和取值的中间改变着变量name，我是不是可以理解为name变量就是我上边说的自己的业务逻辑！哇塞，这么一看我骂错了😯，人家不是无脑粘贴。。。。还是自己太弱了



#### 总结坑1系列问题

> 解决问题的这一路，解决到最后发现根本是自己没有理解get和set是干什么用的？，返回值是什么？
>
> 需要总结的还是，遇到新的api，新的知识点，最先要理解透的就是下面个问题：
>
> 1、这个东东的定义，参数，返回值
>
> 2、这个东东是干什么用的？
>
> 3、为什么要用这个东东？
>
> 能回答出上述三点，api或者知识点基本就算掌握了
>
> 更深的可能就是：
>
> 4、我能不能自己模拟实现一下？ES6的Proxy代理是不是基于这个实现的，怎么实现的😄
>
>
> 最后最后：此坑相关api决定去js基础里边写一下，吼猴


