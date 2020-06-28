
## 1、
在编写webapck.config.js中，例如头部需要import path form 'path'，以及一些es6语法；
我们在命令行里直接启动编译，按说会优先读webpack.config.js，可里边的语法是node本身识别不了的？
怎样才能提前编译该配置文件呢？

webpack.config.js是由webpack来运行（node）;
    - 首先，不能用node来执行webpack，需要用babel-node来执行
    - 再者，需要设置babel的`env`的预设

> 代码表示：
> 
> 1、babel-node ./node_modules/webapck/bin/webpack.js --config webpack.config.js
> 
> 2、{"presets": ["env"]}
> 满足两点才可以解析webpack.config.js中import以及es6语法

## 2、
基于上面的解决方案猜测，应该是先有Babel来转译webpack.config.js的语法；a:那么是webpack把所有模块都加载到同一个文件中在去用Babel转译最后输出结果？b:还是先把所有文件经过Bable转译完之后再由webpack将所有模块加载到同一文件中？c:如果让你设计该如何做到将所有用到模块加载到一起并转译？

a: webpack将所有模块加载到同一个文件，如果引入模块是用import语法写的(先不讨论node_modules中的模块)，cjs肯定是解析不了的(node解析不了此语法)，跟定也就加载不了模块，所有此设想是行不通的

b: 将模块经过Babel解析之后就能用cjs引用模块了，但是先由Babel将所有所需模块转译，所需的模块Babel是无从得知的。所以此方案行不通的

看下Babel是如何解决的：

将Babel功能注入到cjs中。当从启动文件开始(此文件肯定是能在node运行的，不存在语法等问题)，读取其中的内容，如果有require就用cjs引用模块；当读出这个模块后，经由注入的Babel功能检查是否需要转译，最后输出模块的内容；同样的检查此模块的内容是否有require(即使有import也被Babel转译成require),如果有同样调用cjs引入下一个模块，再经由注入的Babel功能检查是否需要转译，最后输出模块的内容 .... 如此反复将所有模块转译并加载

Babel includes a polyfill that includes a custom regenerator runtime and core-js，this polyfill is automatically loaded when using babel-node

> 官网对Babel的polyfill功能做解释的时候也已经说了，如果用babel-node来启动会自动下载
> polyfill并应用到模块中(此文档是Babel@7之后的，也就是babel-node被拆成
> 单独包--@babelnode)

```js
/**
 * compile是webpack实现的cjs中的Module.load引起调用的；
 * compile传入的模块的内容(code)，以及模块的文件名(filename),返回值：该模块的内容
 * 
 * 着重说下compile的返回值，是经过Babel处理过之后的；想一些node_modules或者原生模块是
 * 不经过Babel处理的，只有我们编写的一些模块会经过Babel编译(如何区分？稍后再说)
*/
function compile(code, filename) {
    /**
     * 此处调用babel/core 的init方法；如果返回opts为null,说明此模块不需要Babel处理
     * 相反init存在返回值，则传入babel.transform去转译
    */
  const opts = new babel.OptionManager().init(Object.assign({
    sourceRoot: _path.default.dirname(filename) + _path.default.sep
  }, (0, _cloneDeep.default)(transformOpts), {
    filename
  }));
  if (opts === null) return code;


  let cacheKey = `${JSON.stringify(opts)}:${babel.version}`;
  const env = babel.getEnv(false);
  if (env) cacheKey += `:${env}`;
  let cached = cache && cache[cacheKey];

  if (!cached || cached.mtime !== mtime(filename)) {
    cached = babel.transform(code, Object.assign({}, opts, {
      sourceMaps: opts.sourceMaps === undefined ? "both" : opts.sourceMaps,
      ast: false
    }));

    if (cache) {
      cache[cacheKey] = cached;
      cached.mtime = mtime(filename);
    }
  }

  if (cached.map) {
    if (Object.keys(maps).length === 0) {
      installSourceMapSupport();
    }

    maps[filename] = cached.map;
  }

  return cached.code;
}
```

**？**webpeck实现的cjs功能何时有Babel的能力的？答案是由babel/register提供注入的方法(具体是在babel-node注入的)。具体细节先不讨论，知道大概方式先

回到问题本身：当有人问你项目中有babel.config.js（babel配置）和webpack.config.js（webpack配置）的时候，到底先加载的是哪个个配置？或者说哪个配置先生效的？

> cjs肯定是先加载的webpack.config.js这个模块或者说文件；但是运行时真正先生效的配置肯定是
> babel.config.js（babel配置）先生效，因为webpack.config.js会先经过Babel的检查(检查过
> 程中读取babel.config.js配置信息)

## 3、
经过2的解答知道了问题1中的为什么用babel-node;a:如果我在webpack.config.js中不使用import以及es6语法，那我是不是就可以用node来启动命令来编译？b：既然没有用babel-node来启动，就没有在cjs中注入Babel编译的功能，只有webpack中还有一个babel-loader, 那还会加载babel.config.js配置吗？c:babel还会转译引入的模块吗？

a: 将webpack.config.js的语法换掉，启动命令从babel-node换成node,最终结果是编译成功了。这里**babel-node的效果和babel-register很类似的**；
b：既然没有用babel-node,就不会在cjs中注入babel转译的功能，也就不会加载babel的配置babel.config.js文件；但因为webpack中引用了babel-loader，因为loader的功能是webpack提供的，
在webpack加载babel-loader的时候，同样会加载babel的配置（我们上文已经提过babel-loader如何加载babel配置并转译源文件了），故此问题答案是同样会加载babel.config.js配置文件

b问题总结：
> 加载Babel功能(以及配置)常用的两种方式
  - 1、通过webpack加载babel-loader的方式引入Babel转译的功能（并加载Babel的配置）
  - 2、启动命令以babel-node启动，将Babel功能注入cjs,引用模块的时候转译
  - 3、babel-register api

c: 在回答这个问题前，有必要弄懂babel-loader是干啥用的
> This package allows transpiling JavaScript files using Babel and webpack.
> 
> 用人话说就是：babel-loader的作用就是将Babel的功能注入到webpack中；如果单纯的只是引用下
> babel-loader不加任何Babel配置信息，只是将Babel的空runner(或者说Babel的运行环境)注入
> 到了webpack，即不会做任何转译的工作

继续回答c问题，babel还会转译引入的模块吗？如果项目中或者babel-loader的options中加了Babel的配置，那么就会转译文件，如果没有加就不会转译 


## 4、import()和import在webpack打包时候的不同表现

在测试babel-polyfill的功能时候，在polyfill.js文件中是这样引用的：

import('babel-polyfill')

webpack打包出来的表现就是会生成两个包 0.babel_polyfillResult.js和babel_polyfillResult.js。webpack会把babel-polyfill单独放入0.babel_polyfillResut.js文件中！

而改用import 'babel-polyfill'就会打成一个包，将babel-polyfill的内容也打入babel_polyfillResult.js文件中

## 5、关于babel-polyfill的疑问

1、都说babel-polyfill会污染全局变量，a:为啥污染全局变量了；b：污染了全局变量有啥缺点

好好看下边这句话

> This module accomplishes emulating ES2015 by assigning methods 
> on the global (like: Promise and WeakMap) and to prototypes 
> (like Array.prototype.includes)

在这说下为啥放英文，代码这些标准现在还多是老外发明制定的，有的时候按字面意义翻译过来的东西其实和我们写代码这行的意义还是有点儿出入的：
我们看“百度文”10篇有9篇是粘贴复制的，解释babel-polyfill会污染全局变量，这里的“全局”就有点出入了，global翻译过来确实是全局的意思，“污染全局变量”就认为是window对象了，但是英文语境我们首先想到的确实global对象，global和window的区别就不扯了

a : 回归主题，polyfill模拟实现了新增的对象(例如Promise, WeakMap等)和内置对象的methods(Array.prototype.includes, Object.assign等)；polyfill模拟实现新增对象的途径是将（Promise/WeakMap等）挂载到global/window对象上，模拟实现内置对象的methods的途径是将method挂载到内置对象的原型上，因为都改变global/window对象以及内置对象的原型，所以称之为“污染了global”对象

但此“污染”只是在不兼容浏览器器上实现了最新API,我认为完全可以的。

b: 虽然对于项目来说我认为“污染”完全可以的，但对于标准库/工具来说私自改变了引用项目的‘global’是存在风险的，违背了辨准库／开发工具的标准，这就引出了**babel-runtime**：解决污染