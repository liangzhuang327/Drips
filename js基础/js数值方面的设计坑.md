## 一、数值计算问题
### 业务场景
---
  如果你在做的产品项目，涉及到金额的计算以及交易，比如电商、股票、等行业。随着前端的发展以及交互的复杂，大多数这种产品都会涉及前端金额的计算。此时我们的主角，混世大魔王--js浮点数就该出来搞怪了，如果你事先不了解“它”的话，等你们的线上产品出现此等问题，那绝对是事故级的，据说京东商城就出现过这种问题（-_-），后果嘛你就细品去吧；

---

### 上问题代码
```js
// 理想计算出的值应该是0.29；
0.12+0.17 = 0.29000000000000004;
// 理想计算出的值应该是0.23；
0.12+0.11 = 0.22999999999999998;
0.12+0.16 = 0.28
```

### 为什么js的这种浮点数计算会出现这种误差问题

1、在JS内部所有的计算都是以二进制方式计算的。
2、JS内部无法无限制保存二进制数值的长度。（最长52位）
这两点其实都不难理解。计算机底层都是0和1，当然，计算机也不能保留无限长(无限大)的东西。
知道了这两点，那么自然也就不难理解为什么JS在计算超大的数值的时候，会出现问题了，就好像你永远无法算清宇宙里有多少颗星星一样，计算机也不行。
那么为什么计算很小浮点数的时候也会出问题呢，答案就是，在JS内部，浮点数也是用很长很长的二进制表示的([具体为什么请参考计算机原理](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html))。
在JS的世界里，0.1转换为二进制是0.00011001100110011…你会发现这串数字是无数个0.11在循环..（0.0(0011)(0011)(0011)(0011)…还有无数0011）没办法，在JS里，浮点数就是转化为无穷长的二进制，所以JS只能截取这串二进制的前52位进行二进制的相加，那么下面不用再说了，自然就会出现精度问题。
这也可以解释，为什么JS中整型的数值加减不会出现问题，但是超大数值和浮点数计算会出现问题。

### 怎么解决这种浮点数计算的问题呢
不知道你们有没有注意到，浮点数的计算出现误差的时候都是在原有decimal的后一位，即我们把计算出来的值按照加减乘除的最初decimal格式化下数据即可(**乘除和加减不同**)
- A+B = C / A-B = C(C的按照A和B中最大的精度格式化)
- A*B = C / A*B = C(C按照A和B精度位数之和格式化)
```js
const getMultiplication = (first, second, type) => {
  first = parseFloat(first);
  second = parseFloat(second);
  let firstArr = first.toString().split('.');
  let secondArr = second.toString().split('.');
  let first_decimal = firstArr.length > 1 ? firstArr[1].length : 0;
  let second_decimal = secondArr.length > 1 ? secondArr[1].length : 0;
  let total_decimal = 0;
  if (type === 'Multiplication') {
    total_decimal = first_decimal + second_decimal
    if (total_decimal >= 10) total_decimal = 10
    return parseFloat((first * second).toFixed(total_decimal))
  }
  if (type === 'add') {
    total_decimal = (first_decimal >= second_decimal) ? first_decimal : second_decimal
    if (total_decimal >= 10) total_decimal = 10
    return parseFloat((first + second).toFixed(total_decimal))
  }
  if (type === 'subduction') {
    total_decimal = (first_decimal >= second_decimal) ? first_decimal : second_decimal
    if (total_decimal >= 10) total_decimal = 10
    return parseFloat((first - second).toFixed(total_decimal))
  }
}
let c = getMultiplication(0.12, 0.11, 'add') //0.23

/**
 * 上面方法中为什么都限制了total_decimal的最大值为10？，这其中涉及到toFixed的一个浏览器兼容问题，因为实际项目使用的精度一般都是3-4位，就简单的控制下total_decimal最大为10
*/
```
#### toFixed的参数范围
官方定义：NumberObject.toFixed(num)
当 num 太小或太大时抛出异常 RangeError。0 ~ 20 之间的值不会引发该异常。有些实现支持**更大范围或更小范围**内的值。

当调用该方法的对象不是 Number 时抛出 TypeError 异常

出问题就出在了**有些实现支持更大范围或更小范围**，更大范围无所谓，因为我们可以控制最大不超过20，那么所有环境都能保证不会出问题，但是还有更小范围什么意思？我就遇到过num最大值超过10就报错了！

## 二、toFixed问题

### 上问题代码
```js
// 第一组
(1.244).toFixed(2)
"1.24"
(1.246).toFixed(2)
"1.25"

// toFixed得到的结果和预期完全一样

// 第二组
(1.255).toFixed(2)
// => "1.25"    预想是1.26
(1.245).toFixed(2)
// => "1.25"    预想是1.25
(1.2551).toFixed(2)
// => "1.26"    预想是1.26
(1.2451).toFixed(2)
// => "1.25"    预想是1.25

// toFixed得到的结果和预期不完全一样
```

### 为什么toFixed格式化后的数据和预期存在误差
> 网上解释这个原因的博客满天飞，都是大同小异，核心解释就是**四舍六入五成双或者四舍六入五凑偶**，实际原因却并非如此
---
我们查阅了es5文档，那里给出的解释一目了然，并没有说**四舍六入五成双或者四舍六入五凑偶**，而是通过计算差值得到的，上面的习语猜测是总结的经验，后续咱再验证这个经验的正确性，[官方解释](https://es5.github.io/#x15.7.4.5)

我们贴一下截图：
[toFixed解释](https://github.com/liangzhuang327/Drips/blob/master/pictrues/es5_toFixed.jpeg)
图中其他项先暂不涉及，先看我们正常用到的场景，图中标红的那句意思就是说：toFixed之后得到值n应满足 n/10^f -x = 0, 即让此表达式尽可能的接近0，如果有两个这样的n，取较大的那个n（其中n:最终得到结果值的**整数**；f:toFixed传入的参数；x:即原始被格式化的数据）
```js
// 我们拿(1.255).toFixed(2)来做个测试案例
// n=125, f = 2, x = 1.255
125/10^2 - 1.255 == -0.004999999999999893

// n=126, f = 2, x = 1.255
126/10^2 - 1.255 == 0.0050000000000001155

```
我们比较两个的绝对值，发现0.004999999999999893更接近0，所以(1.255).toFixed(2)得到的最终结果应该是1.25而不是1.26
```js
// 我们拿(1.2551).toFixed(2)来做个测试案例
// n=125, f = 2, x = 1.255
125/10^2 - 1.2551 == -0.0051000000000001044

// n=126, f = 2, x = 1.255
126/10^2 - 1.2551 == 0.004899999999999904

```
我们比较两个的绝对值，发现0.004899999999999904更接近0，所以(1.2551).toFixed(2)得到的最终结果应该是1.26而不是1.25

### toFixed误差结论
- 四舍六入五成双经查阅是一种小数的修约规则，又被称为“银行家舍入”，为的是减少修约带来的误差（相对于四舍五入），**但验证后并不适用toFixed!**
- toFixed的修约规则如下：
  - 被修约数<=4 舍弃， 被修约数>=6 进上去
  - 被修约数=5的时候分以下情况
    - 5后边有有效数字的时候， 进上去
    - 5后边无有效数字的时候就需要用n/10^f -x = 0方案来确定了（个人经验是“凑奇而不是凑偶”没有理论支撑哈）

### toFixed如何正确的使用
toFixed是一种有着一套比较精确的修约规则来修约的；<br/>
如果你只是想用toFixed实现简单的四舍五入就有点大材小用了，但是js又没有另外一个api来实现简单的四舍五入，那我们就自己实现以下：
```js
 const toSimpleFixed = (value, decimal) => {
  if (!decimal) return value
  const pow = Math.pow(10, decimal);
  let returnValue = Math.round(Math.abs(value) * pow) / pow;
  if (value < 0)
    returnValue = -returnValue;
  return returnValue.toFixed(decimal);
}
```

[本文参考](https://juejin.im/post/5bdbff00f265da6116393c17)