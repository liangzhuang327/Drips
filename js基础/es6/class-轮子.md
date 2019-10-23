> 多嘴一句，造轮子的前提就要了解目标的特性，根据特性一步步实现目标的功能；最后再和真正的目标源码对照。这才是轮子的正确打开方式

##### Wheel-one

###### target：

> 根据市面上对class的定义和特性解读最权威的还是阮老师的吧，咱就从阮老师es6种的class入门
>
> 1、class关键字就是生成实例对象的一个模版；
>
> 2、新的`class`写法只是让对象原型的写法更加清晰，直接定义在class里即可
>
> 3、声明式函数定义在构造函数的原型上，赋值性函数定义到构造函数里

```javascript
class Person{
    constructor(props){
        this.construcFunc = function(){console.log('constructor 方法')}
    }

    say(){
        console.log('Person say!')
    }
    say1 = () => {
        console.log('say1')
    }
}
```

###### Wheel:

> 这里js解析引擎怎么解析关键字class 以及class后边{}中的内容先不说（我也不会），以及怎么区分声明式函数say和赋值性函数say1也不说（我也不会），这里只用es5来实现target中的要求，并将3、中的默认要求实现（class内部的默认约定应该是）

```javascript
var Person = function(props){
  function Person(props){
    this.construcFunc = function(){
      console.log('constructor方法')
    }
    this.say1 = function(){
      console.log('say1!')
    }
  }
  
  Person.prototype.say = function(){
    console.log('Person say!')
  }
  return Person
}()
// 这样new Person() 无论用target中的class Person还是这里的Person都能得到同样的结果
```



##### h

##### m