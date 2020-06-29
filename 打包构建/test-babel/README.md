## npm install


## 接下来看下bable几个核心的概念
---
### npm run emtyBabel

对比源码`srouce.js`和输出`emtyBabelResult.js`;理解Babel本身的功能就是一个空runner,没做任何转换

### npm run env（@babel/preset-env）

对比源码`src/babel_env.js`和输出`dist/babel_envResult.js`; 可以理解`@babel/preset-env`将我们用最新语法写的代码转换成目前浏览器能识别的老语法(javascript更新速度很快，但各浏览器只会支持最稳定/统一规范的那些javascript)；从两个文件对比也能发现，`@babel/prest-env`只转换了部分的代码，其余的像一些静态方法都没有转换

测试可以将`env.html`放入ie和Google浏览器测试，因为google默认支持promise等新语法。打开调试窗口看报不报错

### npm run polyfill

为了解决`npm run dev`中的问题，在源码顶部引入`babel-polyfill`,查看效果；
对比源码`src/polyfill.js`和输出`dist/babel_polyfillResult.js`可以看到，babel-polyfill将所有preset-env不支持的api等全部写入到了全局中；好处是一劳永逸，坏处是无用的代码量增多并且污染了全局变量

测试可以将`polyfill.html`放入ie和Google浏览器测试，因为google默认支持promise等新语法。打开调试窗口看报不报错

[babel-polyfill和babel-runtime的关系](https://codersmind.com/babel-polyfill-babel-runtime-explained/)(随着babel-runtime更新，已经支持.includes等静态方法)

### npm run babelRuntime

对于 @babel/plugin-transform-runtime和@babel/runtime的解释，努力看下下面的英文
> This module does something very similar, but it doesn’t change the global 
> namespace or pollute prototypes. Instead, babel-runtime can be included as a 
> dependency of your application, just like any other module, and you can include 
> the ES2015 method from the module.

> This however, is too much work, so we use babel-plugin-transform-runtime which we
> can add to our babel config to automatically rewrite your code such that you write 
> your code using the Promise API and it will be transformed to use the Promise-like
> object exported by babel-runtime.

解释下第二段话，主要是用babel-plugin-transform-runtime此插件干预babel的语法解析，将Promise，
Object.assign关键词替换成babel/runtime包里对应的变量词（比如Promise-like）。此阶段完成了Babel的转译，随后在运行时，将babel/runtime包里的实现动态引入，就完成**不污染全局变量**并且**动态引入需要的API从而减少包体积**的需求

用打包出来的文件来描述下@babel/plugin-transform-runtime和@babel/runtime的流程
```js
// 源码
let a = new WeakMap()

// babel/plugin-transform-runtime/lib/runtime-corejs3-definitions.js
return {
    BuiltIns: {
        // 在gennerator阶段，根据WeakMap的映射关系，将ast节点替换
        WeakMap: { 
            stable: true,
            path: "weak-map"
        },
    }
}

// babel转译后的代码dist/babel_runtimeResult.js
var _babel_runtime_corejs3_core_js_stable_weak_map__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime-corejs3/core-js-stable/weak-map */ "./node_modules/@babel/runtime-corejs3/core-js-stable/weak-map.js");

var map = new _babel_runtime_corejs3_core_js_stable_weak_map__WEBPACK_IMPORTED_MODULE_4___default.a();

// 运行时 runtime

// 当代码运行到此行代码时候，其实WeakMap就是取的./node_modules/@babel/runtime-corejs3/core-js-stable/weak-map.js中的实现

```

#### @babel/plugin-transform-runtime存的内置对象/静态方法的映射关系；
#### @babel/runtime @babel/runtime-corejs3都是存的映射关系中WeakMap等的具体实现(大多数在
#### core-js中，这个两个依赖包主要做的二次封装)

对比 npm run polyfill：
- 1、bable_polyfillResult.js代码为11000行左右， babel_runtimeResult.js代码为4300行左右
- 2、babel_runtimeResult.js的Promise以及WeakMap/includes/Object.assign等都被替换成了很长的变量，而bable_polyfillResult.js保持和源码一致

如何配置：

1、
> 1、npm install @babel/plugin-transform-runtime --save-dev

> 2、npm install @babel/runtime --save

> 3、根据@babel/plugin-transform-runtime的配置 corejs的值；
> 安装npm install @babel/runtime-corejs3 --save 或者 
> install @babel/runtime-corejs2 --save 

2、在babel的配置信息中的plugins中加入@babel/plugin-transform-runtime及其参数即可

3、将babelRuntime.html用Google／IE浏览器打开，查看是否都生效

[查看下官方说明](https://babeljs.io/docs/en/next/babel-plugin-transform-runtime.html)

### babel-register

运行npm run babelRegister

对比源码`babel_register.js`和输出`babel_registerResult.js`发现只是引入了babel-register,并没有将源代码转译。这是因为babel-register对node的`require`模块进行的包装（和babel-node类似，加载钩子函数，都是对require进行了包装），只有在运行到`require`加载模块的时候才会转译改模块中的内容

实际使用过babel-register之后会发现(我用的版本是@7.10.1)在ie中根本无法用，因为在babel-register/lib/index.js中第一句就用了es6的`...`语法！所以还得提前用Babel预编译`@babel/register`这个依赖包，好鸡肋！！


## 最常用的一些plugins
---

> 现实项目中因为`presets`和`transform-runtime`的存在，绝大部分的syntax和静态方法等都能完成转译；每个项目所是否需要额外`plugins`是由项目中代码决定的，由于新特性的持续推出以及不同项目
> 的实际需求在这里不可能穷举出所有的插件，这是一个持续的过程；

在项目中如果想实时的跟着潮流走，体验新的特性语法，那么这部分的插件可定会更新的比较频繁，如果一出现新的特性你就想加入到你的项目中，就需要找到能支持这一特性的插件，如果市面上还没有，只能自己实现这类插件了，说到这里你也就能理解了所有浏览器不支持新特性都是**语法糖**；如果最新的也就是用到了es6的特性以及async/await这些就几乎不需要配置额外的插件就能完成code的转译

### 1、babel-plugin-module-resolver
> 此插件用以解决引用模块时候相对路径计算繁琐的问题。对于一些常用的文件夹／文件做“别名”处理，在引用的时候就可以直接引用“别名”从而不用在计算相对路径

```js
// babel.config.js  .babelrc 中使用方法
"plugins": [
    "babel-plugin-module-resolver",
    {"alis": {"utils": "./src/web/cliet/common/helpers/utils"}}
]

// 示例文件

// use plugin
import { funcitonA } from 'utils/A'
// no user plugin
import { functionA } from '../../../client/common/helpers/utils/A'
```

### 2、babel-plugin-import

> 实现antd antd-mobile loadsh 等包的按需加载

```js
//Via .babelrc or babel-loader.
{
  "plugins": [["import", options]]
}

// 按需加载antd 以及样式
{
    "plugins": [
        ["import", { "libraryName": "antd", style: "css" || true }]
    ]
}
// test.js 
import { Button } from 'antd';
ReactDOM.render(<Button>xxxx</Button>);
 
      ↓ ↓ ↓ ↓ ↓ ↓
// 经过此babel-plugin-import插件处理后 
var _button = require('antd/lib/button');
require('antd/lib/button/style/css');
ReactDOM.render(<_button>xxxx</_button>);
```