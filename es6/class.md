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

