#### 一、从原理来缕class

> 从网上找原理性的文章找不到，只能自己来搞了：利用babel的转译，来看看class的语法糖怎么实现的，也就是拔一拔class的源码

testES6.js

```javascript
class Person{
    constructor(props){
        // super(props)
        this.parmas = props;
        this.construcFunc = function(){console.log('constructor 方法')}
        const name = 'person';
    }

    say(){
        console.log('Person say!')
    }
    static talk(){
        console.log('static person talk!')
    }
}
```

命令：`bable testES6.js -o testES5.js`

testES5.js文件

```javascript
'use strict';

// 将 在类中定义的方法挂载到构造函数的原型上
// 类似于像构造函数的原型上新增方法
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    // 将class中的方法定义到构造函数的原型上
    // 将class中的静态方法（带有'static'关键字的方法）合并到构造函数本身上（不是实例！不是实例！不是实例！）
    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); }
}

var Person = function () {
  	// class中的constructor中定义属性方法，就是构造函数本身的属性方法
    function Person(props) {
        _classCallCheck(this, Person);

        // super(props)
        this.parmas = props;
        this.construcFunc = function () {
            console.log('constructor 方法');
        };
        var name = 'person';
    }

    _createClass(Person, [{
        key: 'say',
        value: function say() {
            console.log('Person say!');
        }
    }], [{
        key: 'talk',
        value: function talk() {
            console.log('static person talk!');
        }
    }]);

    return Person;
}();
```

⚠️：1、如果class中定义的方法和带有`static`方法名称相同的话，静态方法将不会生效，不会挂载到构造函数本身上。

对比testES6.js和testES5.js中我们可以猜测说class关键字的行为

> 在声明一个类的时候`class Person{}`，大致经过了这几个过程（es5）：
>
> 1、声明一个构造函数Person，将class中的constructor方法中定义的属性方法定义到构造函数Person本身；
>
> 2、将class中定义的方法挂载到Person的原型对象上，将class中带有`static`的方法挂载到Person构造函数本身上（不是实例！不是实例！不是实例！）
>
> 3、返回构造函数Person，`class Person{}`的行为走完

#### 二、class的散乱收集



> 1、`class`的constructor相当于es5的构造函数，`class`中的函数相当于es5中定义在原型上的方法

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}
/* class的constructor相当于es5的构造函数 */
let a = new Point()
a //Point {x: undefined, y: undefined}
// 我们知道new操作符的意思：新建一个对象obj，将对象的原型指向Point函数的原型，Point.call(obj), 最后返回obj对象；根据打印的a我们可以对比知道class的constructor就相当于es5的构造函数！

/* class中的函数相当于es5中定义在原型上的方法 */
a.__proto__ // {constructor: ƒ, toString: ƒ}
Point.prototype // {constructor: ƒ, toString: ƒ}
// 打印class Point(极其像构造函数)，以及a的原型。我们可以看到都用toString方法，所以class里定义的方法都是定义到类（构造函数）的原型上
```

> 2、`class`类也属于构造函数，但类不能直接调用，只能通过new来执行

```javascript
class Foo {
    constructor() {
        return Object.create(null)
    }
}
Foo() //VM1807:6 Uncaught TypeError: Class constructor Foo cannot be invoked without 'new'

function Fooo(){
    return Object.create(null)
}
Fooo() // {}
```

> 3、`class`中可以设置取值函数（getter）和存值函数（setter）

```javascript
class MyClass {
  constructor() {
    // ...
  }
  get prop() {
    return 'getter';
  }
  set prop(value) {
    console.log('setter: '+value);
  }
}

let inst = new MyClass();

inst.prop = 123;
// setter: 123

inst.prop
// 'getter'
// prop属性有对应的存值函数和取值函数，因此赋值和读取行为都被自定义了。
```

> `4、class`的静态方法可以被继承，但不能在实例中被拥有；静态方法只能用类本身调用！
>
> ⚠️：态方法为类特有，Foo拥有，而Foo的实例没有；
>
> ⚠️：类里定义的普通方法（即挂载到原型上的方法），为实例所拥有，即类Foo没有(Foo只管定义，语法糖而已)，而类Foo的实例拥有
>
> 解释：静态方法类拥有而实例不拥有，个人猜测是在构造函数中根据new.target新属性来判断的，如果是通过new实例的，就把这个类的静态属性去掉

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

Foo.classMethod() // 'hello'

var foo = new Foo();
foo.classMethod()
// TypeError: foo.classMethod is not a function

/* 类的静态方法里的this指的是类，而不是实例！ */
class Foo {
  static bar() {
    this.baz();
  }
  static baz() { // 此静态方法为类特有，Foo拥有，而Foo的实例没有
    console.log('hello');
  }
  baz() { // 此方法为挂载到类原型上的方法，只有实例才能够拥有，类Foo并不拥有
    console.log('world');
  }
}

Foo.bar() // hello
var p = new Foo();
p.baz() // world  
```

> 5、`new.target`
>
> `new`是从构造函数生成实例对象的命令。ES6 为`new`命令引入了一个`new.target`属性，该属性一般用在构造函数之中，返回`new`命令作用于的那个构造函数。如果构造函数不是通过`new`命令调用的，`new.target`会返回`undefined`，因此这个属性可以用来确定构造函数是怎么调用的

```javascript
function Person(name) {
  if (new.target !== undefined) {
    this.name = name;
  } else {
    throw new Error('必须使用 new 命令生成实例');
  }
}

// 另一种写法
function Person(name) {
  if (new.target === Person) {
    this.name = name;
  } else {
    throw new Error('必须使用 new 命令生成实例');
  }
}

var person = new Person('张三'); // 正确
var notAPerson = Person.call(person, '张三');  // 报错
```





#### 三、从原理来缕extends

testES6.js

```javascript

class Person{
    constructor(props){
        // super(props)
        this.parmas = props;
        this.construcFunc = function(){console.log('constructor 方法')}
        const name = 'person';
    }

    say(){
        console.log('Person say!')
    }
    static talk(){
        console.log('static person talk!')
    }
}

class Man extends Person{
    constructor(props){
        super(props)
        this.ManConstrucFunc = function(){console.log('ManConstructFunc')}
    }
    say(){
        console.log('Man say!')
    }
}
```

`babel testES6.js -o testES5.js`

testES5.js:

```javascript
'use strict';

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Person = function () {
    function Person(props) {
        _classCallCheck(this, Person);

        // super(props)
        this.parmas = props;
        this.construcFunc = function () {
            console.log('constructor 方法');
        };
        var name = 'person';
    }

    _createClass(Person, [{
        key: 'say',
        value: function say() {
            console.log('Person say!');
        }
    }], [{
        key: 'talk',
        value: function talk() {
            console.log('static person talk!');
        }
    }]);

    return Person;
}();

var Man = function (_Person) {
  	// 继承父类的原型
    _inherits(Man, _Person);

    function Man(props) {
        _classCallCheck(this, Man);
				
      	// 生成子类的this
        var _this = _possibleConstructorReturn(this, (Man.__proto__ || Object.getPrototypeOf(Man)).call(this, props));

        _this.ManConstrucFunc = function () {
            console.log('ManConstructFunc');
        };
        return _this;
    }

    _createClass(Man, [{
        key: 'say',
        value: function say() {
            console.log('Man say!');
        }
    }]);

    return Man;
}(Person);

```

`extends`的过程；class Man extends Person；

> 流程不清晰，只知道了子类的this是由父类的this构造而来；