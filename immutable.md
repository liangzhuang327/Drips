# Immutable

## （一）、 toJS() , toArray(), toObject()

​	toJS()是深层转换，另外两个是浅转换，只转换最外一层

## （二）、merge和set方法的区别

> (此问题来源是因为，从state中拿到的focusedRow有时是js对	象格式，有时是immutable对象格式；原因就是这两个api导致的)

​	merge可以理解为Object.assign(old, new)，是往原对象上合并新的改动，所以原对象的类型不会变动（immutable格式还会js对象格式），.merge(‘focusedRow’, obj),合并完成后focusedRow的类型还是immutable格式；而set可以理解为”重设“，重设原来的值包括类型，.set(‘focusedRow’, obj)，这个obj是什么类型，immutable大对象中这个focusedRow就是什么类型；

## (三）、每次生成的新对象哪里去了？

​	immutable数据格式是“不可更改的”，每次改变更新imuutable对象的属，都会基于原对象生成一个新的immutable对象（无论merge还是set等）；所以在redux中，每次执行action中的计算时都会生成一个新的immutable对象，每次return的对象就是当前store中的最新state，但老的那个immutable对象到底去哪里了？存在堆栈中？浪费内存？耗费性能？运行越来越慢？还没懂

- 代码

  ![代码](https://github.com/liangzhuang327/Drips/blob/master/pictrues/WX20180531-162554%402x.png)

运行结果如下图

![运行结果](https://github.com/liangzhuang327/Drips/blob/master/pictrues/WX20180531-162648%402x.png)