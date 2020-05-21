> 当你想自己定义一个事件，第一时间想到的是创建一个Event对象的实例。网上搜索一下有
> document.createEvent的方法；就此问题想了一下，Event对象延伸了多少对象，js其他的API谁
> 又继承了这个对象? 谁又继承了Event对象的延伸对象？那问题又来了js到底有多少自带的类（对象）？
> 他们之间又有什么关系？看来是时候回过头来缕一遍了

## 内置对象 (Build-in) 和宿主对象（Naitve）构成了所有js能用的原生对象
---

**内置对象（Build-in）**

看下ECMAScript的解释：

> 由ECMAScript实现提供的对象，与宿主环境无关，该对象在执行ECMAScript程序开始时出现

也就是说内置对象是ECMAScript初始化时候创建的，也可以说js引擎初始化时候生成

这里其实还有更细的分级粒度，此处的内置对象其实分为：内置对象和本地对象，本地对象现在只有两个Global和Math，此处都归为广义的内置对象

**宿主对象（Naitve）**

> 宿主环境提供的对象，以完成ECMAScript的执行环境
> 任何不是内置对象的对象都是宿主对象

现在比较常用的宿主环境有两种，浏览器以及Node;这两种宿主环境同，也就造就了两者提供的宿主对象不同，即使有相同的对象，也是两个宿主环境特殊提供的

**内置对象有哪些**

ECMA-262 把内置对象（Build-in）定义为“独立于宿主环境的 ECMAScript 实现提供的对象”。包括如下：

Object、Function、Array、String、Boolean、Number、Date、RegExp、Error、EvalError、RangeError、ReferenceError、SyntaxError、TypeError、URIError、ActiveXObject(服务器方面)、Enumerator(集合遍历类)、RegExp（正则表达式）；以及对象的方法

Gloable Math 本地对象

**宿主对象有哪些（以浏览器为例）**

window, document, location, history, XMLHttpRequest, setTimeout, getElementsByTagName, querySelectorAll, ...

宿主对象就是执行JS脚本的环境提供的对象。对于嵌入到网页中的JS来说，其宿主对象就是浏览器提供的对象，所以又称为浏览器对象，如IE、Firefox等浏览器提供的对象。不同的浏览器提供的宿主对象可能不同，即使提供的对象相同，其实现方式也大相径庭！这会带来浏览器兼容问题，增加开发难度

[参考连接](https://segmentfault.com/a/1190000002634958)

## BOM对象以及DOM对象构成了宿主对象
---

#### BOM

> 1、BOM是Browser Object Model的缩写，简称浏览器对象模型

> 2、BOM缺乏标准，DOM标准是W3C，JavaScript标准是ECMA。

    这句话的最好体现就是ie和众浏览器的不兼容。想当年的浏览器大战都为争夺浏览器也就是BOM的标准发布，谁也不服谁，这期间难以想象开发是怎么过来的吗？真心心疼老前辈一哆嗦，虽然现在ie有所低头，chrome和fierfox都支持的api他也在支持，我认为还是早让chrome统一天下吧，掌握BOM的制定标准，那时候在也不再担心要写兼容了，面试再也不会问到ie兼容的问题，那一天，我必老泪纵横


#### DOM

1、DOM（文档对象模型）是 HTML 和 XML 的应用程序接口（API）,是用来操作HTML和XML的技术

