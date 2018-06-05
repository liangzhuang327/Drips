# js的数据类型

> 看了很多网上资料说：js的数据类型可以分为基本数据类型和复杂数据类型；基本：String, Number, Boolean, Symbol, Undefined , Null; 复杂：Object; 	可是用typeof之后竟然还有一种function。。。。懵逼

其实这个问题的原因就是js数据类型分类角度不同造成的；

- js数据类型按照定义来分：就如上所说分为基本数据类型和复杂数据类型（对象类型）；
- 如果按照在内存中存在形式来分：有值类型（String, Number, Boolean, Symbol, Undefined , Null）和引用类型（Object, Function）
- 而typeof正好返回的是变量在内存中存在的形式，即返回值类型和引用类型



> 问题进一步，对象格式typeof返回的都是object，比如数组，对像的typeof怎么区分？typeof的不足之处就显示出来了；
>
> 上面的问题，instanceof可以比较完美的解决

instanceof定义：a instanceof b ；运算符用来检测对象a 的原型 是否存在于参数 b 的原型链上。

```javascript
var a = [1,3];
var b = {name: 'lz'};
a instanceof Array  // true
b instanceof Object // true
```

