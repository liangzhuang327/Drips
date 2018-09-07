#### Set定义

> 1、书面定义：
>
> ​	es6提供的一种新的数据结构Set。它类似于数组，但是成员都是唯一的，没有重复的值；
>
> ​	Set本身是一个构造函数，用来生成Set的数据结构
>
> 2、自己理解：
>
> Set做为**最简单的集合**，有着如下几个特点：
>
> * Set可以存储任何类型的值，遍历顺序和**插入顺序相同**
> * Set内无重复的值

------

#### Set初始化

​	**1、**Set初始化的时候接受一个数组为参数（或者具有Iterator数据接口的其他数据结构，string，documentNodes，自定义了[Symbol.iterator]的对象等等）;

​	**2、**Set也同样提供了一种新的去重方法，但是set内部实现元素唯一（去重）可以理解为通过 === 严等符实现，也就是去重只能是值类型数据，new Set([{},{}])得到的set为两个空对象的元素

```javascript
let set = new Set([1,3,5]) // [...set] 得到 [1,3,5]
set.add(3).add(4).add(5)   // [...set] 得到[1,3,4,5]
let _set = new Set()
_set.add({}).add({})      //  [...set] 得到[{}, {}] 引用类型数据始终不想等
```

​	**3（误区）、** Set初始化后得到的数据结构是set数据结构，它不是数组，而是一个可迭代的对象！

```javascript
let set = new Set([1,2])
console.log(set)        //Set(2) {1, 2}
/*size:(...)
__proto__:Set
[[Entries]]:Array(2)
0:1
1:2
length:2*/
typeof set.           // 'object'
set instanceof Object // true

/* 从另一方面解释构建出来的数据结构不是数组，我们用数组的方式得到set的其中的元素 */
set[0]          // undefined
set[1]          // undefined

/**
正确的到set数据结构中的数据有两种方式 ：
1、set是一种iterator对象，可以用for of 循环得到
2、得到set的迭代器，用其.next()方法得到其值
*/
let setIterator = set[Symbol.iterator]();
setIterator.next()     // {value: 1, done: false}
setIterator.next()     // {value: 2, done: false}
setIterator.next()     // {value: undefined, done: true}
```

------

#### 对Set实例的操作

> 对Set实例的操作，是根据set实例提供的api对其进行操作；即是Set实例的属性和方法

**1、属性**

* `Set.prototype.constructor`：构造函数，默认就是`Set`函数。

* `Set.prototype.size`：返回`Set`实例的成员总数。

  ------

  ​

* `add(value)`：添加某个值，返回Set结构本身。

* `delete(value)`：删除某个值，返回一个布尔值，表示是否删除成功。

* `has(value)`：返回一个布尔值，表示该值是否为`set`成员。

* `clear()`：清除所有成员，没有返回值。

**2、Set结构和js数组的转换**

* Set结构转为js数组格式：`Array.from(set)`； `[...set]`
* js数组格式转Set结构：`new Set(jsArry)`。

**3、Set的遍历操作**

- `keys()`：返回键名的遍历器。
- `values()`：返回键值的遍历器。
- `entries()`：返回键值对的遍历器。
- `forEach(),map(),filter()`：和数组的方法一样。

> 1、需要注意⚠️的是：Set的插入顺序就是set的遍历顺序，而js中的对象格式的遍历顺序不一定是插入顺序；比如使用 Set 保存一个回调函数列表，调用时就能保证按照添加顺序调用。
>
> 2、需要注意⚠️的是：Set 结构的实例默认可遍历，它的默认遍历器生成函数就是它的`values`方法
>
> 3、需要区分⚠️的是：Set的遍历forEach，map，filter的实现应该和数组的这些方法实现原理上有些不同，只是让我们看到的效果是一样的（遍历的iteratorg格式数据）





------

------



#### Map定义

> JavaScript的对象（Object），本质上是键值对的结合（Hash结构），但是传统上的对象只能用字符串当键。**对对象的操作使用（遍历等）上带来了很大的限制**；为此Map出现，Object结构提供了**“字符串—值”**的对应，Map结构提供了**“值—值”**的对应，完成了对Object结构**“键”**的扩展。
>
> 强调一下Object和Map的区别：
>
> - `Map` 与 `Object` 都可以存取数据，`Map` 适用于存储需要 **常需要变化（增减键值对）或遍历** 的数据集，而 `Object` 适用于存储 **静态** （例如配置信息）数据集
> - `Object` 的 key 必须是 `String` 或 `Symbol` 类型的，而 `Map` 无此限制，可以是任何值
> - **<u>重点：</u>**  `Map` 可以很方便的取到键值对数量，而 `Object` 需要用额外途径



------

#### Map的初始化（如何像Map中添加成员）

​	**1、**像Map中传入一个键值对 (a,b)

​	**2、**像Map中传入一个数组，数组的成员是一个个包含键值对的数组（[ [], []]）

​	**3、**广义上来讲，任何具有**Iterator接口、且没个成员都是一个双元素的数组**的数据结构，都可以作			为Map的参数

```javascript
/* 传键值对 */
let map = new Map();
map.set('name', 'lz');
map.get('name')         // 'lz'
let o = { p: 'Helloworld'};
map.set(o, 'content');
map.get(o);              // 'content'

map.has(o)               // true
map.delete(o);           // true
map.has(o);              // false

/* 传包含键值对数组 的数组 */
let map1 = new Map([
    ['name', '张三'],
    ['title', 'author']
])
map.size // 2
map.has('name') // true
map.get('name') // "张三"
map.has('title') // true
map.get('title') // "Author"

/* 传入Iterator数据结构 */
const set = new Set([
  ['foo', 1],
  ['bar', 2]
]);
const m1 = new Map(set);
m1.get('foo') // 1

const m2 = new Map([['baz', 3]]);
const m3 = new Map(m2);
m3.get('baz') // 3
```

​	**4、⚠️对同一键名的理解**

​		如果对同一个键多次赋值，后面的值将覆盖前面的值；同一键名，字符串等值类型的数据，字面相等即位同一键名，对于引用类型数据（对象，数组等做为键名），数据的引用为同一引用才是同一键名

```javascript
/* 值类型 */
const map = new Map();

map
.set(1, 'aaa')
.set(1, 'bbb');

map.get(1) // "bbb"
/* 引用类型 */
const map = new Map();

map.set(['a'], 555);
map.get(['a']) // undefined

let tt = {name: 'lz'};
map.set(tt, 'content');
map.get(tt)            // content
let yy = tt;
map.set(yy, 'header');
/**
Map(2) {Array(1) => 555, {…} => "header"}
size:(...)
__proto__:Map
[[Entries]]:Array(2)
0:{Array(1) => 555}
1:{Object => "header"}
length:2
**/
map.get(tt);           // header
map.get(yy);		   // header
```

------



#### 对Map实例的操作

* `size`：`size`属性返回 Map 结构的成员总数

* `set(key, value)`：`set`方法设置键名`key`对应的键值为`value`，**然后返回整个 Map 结构**。如果`key`已经有值，则键值会被更新，否则就新生成该键。**可以链式调用**

*  `get(value)`:   `get`方法读取`key`对应的键值，如果找不到`key`，返回`undefined`。

* `delete(key)`：`delete`方法删除某个键，返回`true`。如果删除失败，返回`false`。

* `has(key)`：`has`方法返回一个布尔值，表示某个键是否在当前 Map 对象之中。

* `clear()`：`clear`方法清除所有成员，没有返回值。

  **Map的遍历方法**

- `keys()`：返回键名的遍历器。
- `values()`：返回键值的遍历器。
- `entries()`：返回所有成员的遍历器。
- `forEach()`：遍历 Map 的所有成员。

> 1、需要⚠️特别注意的是，Map 的遍历顺序就是插入顺序。
>
> 2、需要注意⚠️：表示 Map 结构的默认遍历器接口（`Symbol.iterator`属性），就是`entries`方法。

​	**Map与其他数据结构的转化**

​	1、**Map 转为数组**：[...map]

​	2、**数组 转为 Map**

​	3、**Map 转为对象**：通过遍历for of

​	4、**对象转为 Map**：通过遍历for of

```javascript
/* Map转为数组 */
const myMap = new Map()
  .set(true, 7)
  .set({foo: 3}, ['abc']);
[...myMap]
// [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]

/* 数组转为Map */
new Map([
  [true, 7],
  [{foo: 3}, ['abc']]
])
// Map {
//   true => 7,
//   Object {foo: 3} => ['abc']
// }

/* Map转为对象 （前提：如果所有 Map 的键都是字符串，它可以无损地转为对象。）*/
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

const myMap = new Map()
  .set('yes', true)
  .set('no', false);
strMapToObj(myMap)
// { yes: true, no: false }

/* 对象转为Map */
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

objToStrMap({yes: true, no: false})
// Map {"yes" => true, "no" => false}
```



#### 



#### Eewedwe
