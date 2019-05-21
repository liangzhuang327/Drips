1、提到require都知道是引用模块用的。细分require有遵循AMD规范的require.js；还有遵循CommonJs的node实现的require(nodeRequire)



#### 2、ADM规范的require.js的用法：

> 1、为神马要用require.js:
>
> ​	a: 实现js文件的异步加载，避免网页失去响应;
>
> ​	b: 管理模块之间的依赖性，便于代码的编写和维护
>
> 2、将require.js引入到项目
>
> ```javascript
> <script src="js/require.js" data-main="js/main" defer async="true"></script>
> // 1、async属性表明这个文件需要异步加载，避免网页失去响应。IE不支持这个属性，只支持defer，所以把defer也写上
> // 2、data-main属性的作用是，指定网页程序的主模块。在上例中，就是js目录下面的main.js，这个文件会第一个被require.js加载
> ```
>
> 3、主模块（引用的写法）mian.js（可以理解为react的根组建）的写法
>
> ```javascript
> // main.js
> require(['moduleA', 'moduleB'], function(A, B){
>   // 等moduleA和moduleB异步加载完成之后，进入此回调，A和B分别代表两个模块的导出
> })
> ```
>
> 4、被引用模块的写法（要符合AMD规范规定的模块写法，当然市面上的库很多不遵循AMD规范，如何引用？后面说）
>
> ```javascript
> // AMD规范来写的模块，才能用require.js的方式引入Q！
> define(function(){ // 不引用其他模块的模块写法
>   	var testFunc = function(){
>       console.log('testFunc')
>     }
>     return {
>       testFunc: testFunc
>     }
> })
> 
> define(['moduleA'], function(A){ // 引用其他模块的模块写法
>   var testDemo = function(){
>     console.log(A.add(1,3)))
>   }
>   return {
>     testDemo: testDemo
>   }
> })
> ```
>
> 5、问题1:如何引入不是遵循AMD规范写的库（不是用define函数来定义的模块）
>
> ```javascript
> // ** 在主入口模块（main.js）最头部加入require.config({}),来对引入的库定义一些特征
> require.config({
> 　　　　shim: {
> 　　　　　　'underscore':{
> 　　　　　　　　exports: '_'
> 　　　　　　},
> 　　　　　　'backbone': {
> 　　　　　　　　deps: ['underscore', 'jquery'],
> 　　　　　　　　exports: 'Backbone'
> 　　　　　　}
> 　　　　}
> 　　});
> // require.config()接受一个配置对象，这个对象除了有前面说过的paths属性之外，还有一个shim属性，专门用来配置不兼容的模块。具体来说，每个模块要定义（1）exports值（输出的变量名），表明这个模块外部调用时的名称；（2）deps数组，表明该模块的依赖性。
> ```
>
> [参考链接](http://www.ruanyifeng.com/blog/2012/11/require_js.html)

#### 3、commonJS规范以及node中require

> commonJs具体规范文档无从找到，只能根据引用commonjs实现的node中的require来一探究竟了
>
> 1、node内置的require命令
>
> ​	`require`命令的基本功能是，读入并执行一个JavaScript文件，然后返回该模块的exports对象。如果没有	发现指定模块，会报错
>
> ```javascript
> // 一个简单的遵循commonjs规范的node模块写法
> 
> // test.js
> var invisible = function () {
>   console.log("invisible");
> }
> 
> module.exports.message = "hi";
> 
> module.exports.say = function () {
>   console.log(message);
> }
> 
> // 如果模块要导出的是一个function，只需将function赋值给module.exports
> 
> // main.js
> var test = require('./test.js');
> console.log(test) // 输出的就是test模块的module.exports对象
> ```
>
> 2、module模块的特点（commonJS中模块的特点）
>
> - 所有代码都运行在模块作用域，不会污染全局作用域。
> - 模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。
> - 模块加载的顺序，按照其在代码中出现的顺序
>
> 3、commonjs实现方(node)为了便携的让开发写出符合上述特点的module模块，node内部提供了一个Module构建函数，所有的模块都是Module的实例
>
> ```javascript
> function Module (id, parent) {
>   this.id = id;
>   this.exports = {};
>   this.parent = parent;
>   // ...
> }
> // 可以简单理解：我们自定义的模块都是Module的一个实例，实例的过程是在内部执行，所有每个模块里都会有一个module对象，即是构造函数Module的实例
> ```
>
> `module.id` 模块的识别符，通常是带有绝对路径的模块文件名
>
> - `module.filename` 模块的文件名，带有绝对路径。
> - `module.loaded` 返回一个布尔值，表示模块是否已经完成加载。
> - `module.parent` 返回一个对象，表示调用该模块的模块。
> - `module.children` 返回一个数组，表示该模块要用到的其他模块。
> - `module.exports` 表示模块对外输出的值。
>
> 4、模块的书写与简单引入介绍完毕，在介绍几个require有关的东东
>
> ​	（1）：require第一个参数表示引入模块的路径，路径大多是相对路径；如果写入绝对路径的话，需要获取项目地址+目录地址+文件地址（一般需要借助path模块）；'./'或者'../'开头的都是相对路径，'／'开头的表示绝对路径，如果参数字符串不以“./“或”/“开头，则表示加载的是一个默认提供的核心模块（位于Node的系统安装目录中），或者一个位于各级node_modules目录的已安装模块（全局安装或局部安装）
>
> ​	（2）：require第一个参数传入一个目录的解析规则：`require`发现参数字符串指向一个目录以后，会自动查看该目录的`package.json`文件，然后加载`main`字段指定的入口文件。如果`package.json`文件没有`main`字段，或者根本就没有`package.json`文件，则会加载该目录下的`index.js`文件或`index.node`文件
>
> ```javascript
> // package.json
> { "name" : "some-library",
>   "main" : "./lib/some-library.js" }
> ```
>
> [参考链接](http://javascript.ruanyifeng.com/nodejs/module.html#toc5)

。。。未完待续https://juejin.im/post/5a2e5f0851882575d42f5609

3、webpack中的require



4、webpack中的import

##### z

#### r