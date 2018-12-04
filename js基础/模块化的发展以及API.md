### 一、模块化以及模块化的发展

> 模块就是代码功能块。
>
> 先想一想，为什么需要模块？
>
> 因为有了模块，我们可以更方便的使用别人的代码，想要什么功能，就加载模块；但是，这样的前提就是大家必须以同样的方式编写模块，否则你有你的写法，我有我的写法，岂不是乱了套。
>
> **首先，commonjs规范：**2009年，美国程序员Ryan Dahl创造了[node.js](http://nodejs.org/)项目，将javascript语言用于服务器端编程。这标志"Javascript模块化编程"正式诞生。
>
> node.js的[模块系统](http://nodejs.org/docs/latest/api/modules.html)，就是参照[CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1)规范实现的。在CommonJS中，有一个全局性方法require()，用于加载模块。commonJS的主要实现就是node和webpack
>
> commonJS特点：主要用于服务端（node）,加载模块通过require实现，同步加载模块。这对服务器端不是一个问题，因为所有的模块都存放在本地硬盘，可以同步加载完成，等待时间就是硬盘的读取时间。
>
> **其次，AMD规范：**[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)是"Asynchronous Module Definition"的缩写，意思就是"异步模块定义"。它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。即实现了模块的异步加载，主要实现就是requirejs
>
> **最后，ES6规范：**在 ES6 之前，社区制定了一些模块加载方案，最主要的有 CommonJS 和 AMD 两种。前者用于服务器，后者用于浏览器。ES6 在语言标准的层面上，实现了模块功能，而且实现得相当简单，完全可以取代 CommonJS 和 AMD 规范，成为浏览器和服务器通用的模块解决方案

### CommonJs规范

> node以及webpack都是遵循commonjs规范实现的模块加载，commonjs格式的核心就是require语句

##### 一、Module构造函数

require 的源码在 Node 的 [lib/module.js](https://github.com/joyent/node/blob/master/lib/module.js) 文件。为了便于理解，本文引用的源码是简化过的，并且删除了原作者的注释。

```javascript
function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;
  this.filename = null;
  this.loaded = false;
  this.children = [];
}

module.exports = Module;

var module = new Module(filename, parent);
```

上面代码中，Node 定义了一个构造函数 Module，所有的模块都是 Module 的实例。可以看到，当前模块（module.js）也是 Module 的一个实例。



每个实例都有自己的属性。下面通过一个例子，看看这些属性的值是什么。新建一个脚本文件 a.js 。

> ```javascript
> // a.js
> 
> console.log('module.id: ', module.id);
> console.log('module.exports: ', module.exports);
> console.log('module.parent: ', module.parent);
> console.log('module.filename: ', module.filename);
> console.log('module.loaded: ', module.loaded);
> console.log('module.children: ', module.children);
> console.log('module.paths: ', module.paths);
> ```

运行这个脚本。

> ```bash
> $ node a.js
> 
> module.id:  .
> module.exports:  {}
> module.parent:  null
> module.filename:  /home/ruanyf/tmp/a.js
> module.loaded:  false
> module.children:  []
> module.paths:  [ '/home/ruanyf/tmp/node_modules',
>   '/home/ruanyf/node_modules',
>   '/home/node_modules',
>   '/node_modules' ]
> ```

可以看到，如果没有父模块，直接调用当前模块，parent 属性就是 null，id 属性就是一个点。filename 属性是模块的绝对路径，path 属性是一个数组，包含了模块可能的位置。另外，输出这些内容时，模块还没有全部加载，所以 loaded 属性为 false 。

新建另一个脚本文件 b.js，让其调用 a.js 。

> ```javascript
> // b.js
> 
> var a = require('./a.js');
> ```

运行 b.js 。

> ```bash
> $ node b.js
> 
> module.id:  /home/ruanyf/tmp/a.js
> module.exports:  {}
> module.parent:  { object }
> module.filename:  /home/ruanyf/tmp/a.js
> module.loaded:  false
> module.children:  []
> module.paths:  [ '/home/ruanyf/tmp/node_modules',
>   '/home/ruanyf/node_modules',
>   '/home/node_modules',
>   '/node_modules' ]
> ```

上面代码中，由于 a.js 被 b.js 调用，所以 parent 属性指向 b.js 模块，id 属性和 filename 属性一致，都是模块的绝对路径。

##### require核心

每个模块实例都有一个 require 方法。

require 并不是全局性命令，而是每个模块提供的一个内部方法，也就是说，只有在模块内部才能使用 require 命令（唯一的例外是 REPL 环境）。另外，require 其实内部调用 Module._load 方法。

Module._load 的关键步骤是两个。

> - Module._resolveFilename() ：确定模块的绝对路径
> - module.load()：加载模块



有了模块的绝对路径，就可以加载该模块了。下面是 module.load 方法的源码。

> ```javascript
> Module.prototype.load = function(filename) {
>   var extension = path.extname(filename) || '.js';
>   if (!Module._extensions[extension]) extension = '.js';
>   Module._extensions[extension](this, filename);
>   this.loaded = true;
> };
> ```

……..

最后，也就是说，模块的加载实质上就是，注入exports、require、module三个全局变量，然后执行模块的源码，然后将模块的 exports 变量的值输出。



### AMD

> 用AMD规范实现的主要是requirejs

使用require.js的第一步，是先去官方网站[下载](http://requirejs.org/docs/download.html)最新版本。

下载后，假定把它放在js子目录下面，就可以加载了。

```javascript
<script src="js/require.js"></script>
```

有人可能会想到，加载这个文件，也可能造成网页失去响应。解决办法有两个，一个是把它放在网页底部加载，另一个是写成下面这样：

```javascript
<script src="js/require.js" defer async="true" ></script>
```

async属性表明这个文件需要异步加载，避免网页失去响应。IE不支持这个属性，只支持defer，所以把defer也写上。

require.js加载的模块，采用AMD规范。也就是说，模块必须按照AMD的规定来写。

具体来说，就是模块必须采用特定的define()函数来定义。如果一个模块不依赖其他模块，那么可以直接定义在define()函数之中。

假定现在有一个math.js文件，它定义了一个math模块。那么，math.js就要这样写：

> 　　// math.js
>
> 　　define(function (){
>
> 　　　　var add = function (x,y){
>
> 　　　　　　return x+y;
>
> 　　　　};
>
> 　　　　return {
>
> 　　　　　　add: add
> 　　　　};
>
> 　　});

加载方法如下：

```javascript
　　　// main.js

　　require(['math'], function (math){

　　　　alert(math.add(1,1));

　　});

```

### ES6规范

在 ES6 之前，社区制定了一些模块加载方案，最主要的有 CommonJS 和 AMD 两种。前者用于服务器，后者用于浏览器。ES6 在语言标准的层面上，实现了模块功能，而且实现得相当简单，完全可以取代 CommonJS 和 AMD 规范，成为浏览器和服务器通用的模块解决方案。

ES6 模块的设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些东西。比如，CommonJS 模块就是对象，输入时必须查找对象属性。

```javascript
// CommonJS模块
let { stat, exists, readFile } = require('fs');

// 等同于
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

上面代码的实质是整体加载`fs`模块（即加载`fs`的所有方法），生成一个对象（`_fs`），然后再从这个对象上面读取 3 个方法。这种加载称为“运行时加载”，因为只有运行时才能得到这个对象，导致完全没办法在编译时做“静态优化”。

ES6 模块不是对象，而是通过`export`命令显式指定输出的代码，再通过`import`命令输入。

```javascript
// ES6模块
import { stat, exists, readFile } from 'fs';
```

上面代码的实质是从`fs`模块加载 3 个方法，其他方法不加载。这种加载称为“编译时加载”或者静态加载，即 ES6 可以在编译时就完成模块加载，效率要比 CommonJS 模块的加载方式高。当然，这也导致了没法引用 ES6 模块本身，因为它不是对象。

由于 ES6 模块是编译时加载，使得静态分析成为可能。有了它，就能进一步拓宽 JavaScript 的语法，比如引入宏（macro）和类型检验（type system）这些只能靠静态分析实现的功能。





补：js预编译期和执行期

step 1. 读入第一个代码块。

step 2. 做语法分析，有错则报语法错误（比如括号不匹配等），并跳转到step5。

step 3. 对var变量和function定义做“预编译处理”（永远不会报错的，因为只解析正确的声明）。

step 4. 执行代码段，有错则报错（比如变量未定义）。

step 5. 如果还有下一个代码段，则读入下一个代码段，重复step2。

step6. 结束。







#### 参考资料

1、[Javascript模块化编程-模块的写法](http://www.ruanyifeng.com/blog/2012/10/javascript_module.html)

2、[Javascript模块化编程-AMD](http://www.ruanyifeng.com/blog/2012/10/asynchronous_module_definition.html)

3、[commonJS-require源码](http://www.ruanyifeng.com/blog/2015/05/require.html)

4、[ES6模块](http://es6.ruanyifeng.com/#docs/module)