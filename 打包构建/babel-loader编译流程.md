### 调试依赖包的版本
---
下面是本文用到的几个主要依赖包的版本，因为7的版本源码还没有看，可能存在差异，但主要的编译流程应该不会变

babel-core: 6.26.3

babel-loader: 6.4.1

babel-traverse: 6.26.0

babel-generator: 6.26.1

### 1、参数准备
---

babel-loader的参数／配置来源于三处
- globalOptions = this.options.babel || {};
  > this.options即webpack的配置信息，里边如果配置了babel项，globalOptions即取此值（map对象）
- loaderOptions = loaderUtils.parseQuery(this.query);
  > babel-loader的配置信息,即在webpack的babel-loader配置项中传入的参数
- babelrc
  > 这里这说在常见的那种在项目根目录加入.babelrc文件的形式：
  
  > babelrc = resolveRc(path.dirname(filename));通过获取当前解析source的文件路径
  > 找到当前项目的跟路径，然后通过babel内置的resolveRc方法到项目跟路径找是否又.babelrc
  > 文件，并读出配置，放到cacheIdentifier对象中

最后将globalOptions,loaderOptions, cacheIdentifier三个参数合并，作为编译source的最终参数

babel@7 以后官方建议配置文件为 

> 因为7以前.babelrc存在一些bug或者叫做弱点，所以7之后对于配置文件做了比较大的改动


1、babel.config.json/.babelrc.json(文件为json) (static JSON files)
2、babel.config.js／.babelrc.js(文件支持module.exports={})（allow you to define your configuration as CommonJS, using module.exports）
**如果babel.config.js／.babelrc.js文件中配置了“type”:"module"，其行为和.mjs模式一样；不配置则和
.cjs模式一样**
3、babel.config.cjs and .babelrc.cjs allow you to define your configuration as CommonJS, using module.exports
4、babel.config.mjs／.babelrc.mjs使用ECMAScript原生模块系统（比较不常用）

babel@7支持解析配置文件的格式
["babel.config.js", "babel.config.cjs", "babel.config.mjs", "babel.config.json"]

```js
/**
 * babel-loader在开启缓存模式后（cacheDirectory），核心是调用cache({}, callback)
 * 在cache方法的回调中返回了babel-loader处理之后的代码(code)以及映射(map)
*/
module.exports = function (source, inputSourceMap) {
  // ...
  var globalOptions = this.options.babel || {};
  var loaderOptions = loaderUtils.parseQuery(this.query);
  var userOptions = assign({}, globalOptions, loaderOptions);
  var defaultOptions = {
    metadataSubscribers: [],
    inputSourceMap: inputSourceMap,
    sourceRoot: process.cwd(),
    filename: filename,
    cacheIdentifier: JSON.stringify({
      "babel-loader": pkg.version,
      "babel-core": babel.version,
      babelrc: exists(userOptions.babelrc) ? read(userOptions.babelrc) : resolveRc(path.dirname(filename)),
      env: userOptions.forceEnv || process.env.BABEL_ENV || process.env.NODE_ENV || "development"
    })
  };

  var options = assign({}, defaultOptions, userOptions);
  // ...
  if (cacheDirectory) {
    var callback = this.async();
    return cache({
      directory: cacheDirectory,
      identifier: cacheIdentifier,
      source: source,
      options: options,
      transform: transpile
    }, function (err) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          code = _ref.code,
          map = _ref.map,
          metadata = _ref.metadata;

      if (err) return callback(err);

      metadataSubscribers.forEach(function (s) {
        return passMetadata(s, _this, metadata);
      });

      return callback(null, code, map);
    });
  }

  var _transpile = transpile(source, options),
      code = _transpile.code,
      map = _transpile.map,
      metadata = _transpile.metadata;

  metadataSubscribers.forEach(function (s) {
    return passMetadata(s, _this, metadata);
  });

  this.callback(null, code, map);
};
```

### 2、转译文件 transform
---

> 此处根据参数是否缓存编译结果分为两个分支代码，此处以不缓存分支代码进行解析

> 根据babel-loader暴露出来的处理函数可以看到，核心编译就是调用了babel-loader定义的另一个方法
> `transpile`,而transpile核心是调用了`babel.transform`,经过此方法转译之后返回的对象就是包含
> 转译后代码以及souremap的对象

```js
// babel.transform,此处的babel即是babel的核心库babel-core;
// babel-core暴露出来的是一个pipeline实例，此实例的pipeline.transform挂在到了exports上，故babel.// transform 即是 pipeline.transform 即是要研究的转译过程核心

// babel-loader.js
var transpile = function transpile(source, options) {

  // ...

  var result = void 0;
  // source即要转译文件的所有代码（字符串）， options即babel相关的参数和配置
  result = babel.transform(source, options);
  var code = result.code;
  var map = result.map;
  var metadata = result.metadata;

  // ...
  
  return {
    code: code,
    map: map,
    metadata: metadata
  };
}

// pipeline.js

Pipeline.prototype.transform = function transform(code, opts) {
  var file = new _file2.default(opts, this);
  // file.warp主要根据配置参数ignore和only参数判断是否转译当前code
  return file.wrap(code, function () {
    file.addCode(code);
    file.parseCode(code);
    // 因为每个文件的都创建了一个实例，所以此处不用传参数，在创建实例的时候已经把code,opts放到了实例中
    return file.transform();
  });
};
```


这里插一句题外话，babel的转译以及wepback的编译及其相似；wepback有compiler以及compilation，babel有
pipeline以及file概念，对比着compiler／pipeline和compilation/file很容易理解**编译配置实例和编译实例**这两者的区别了；从技术实现上也能帮助理解这两者的区别，编译配置实例是单实例实现，而编译实例却是多实例实现，以babel举例，因为需要转译的文件有多个就会生产多个**编译实例**（file），而所有的编译实例所需要的配置都是最初定好的，编译一经启动是不会变的只会生成单个**编译配置实例**（pipeline）。事实上babel做的还是将大头都放到了file上配置信息仍是在file实例上做的，但pipeline一经实现了这种机制，为后续的扩展铺好了道路；以上纯属自己浅显的理解，不代表官方^_^

> pipeline实例中新建了一个file实例，并调用了file实例的**file.transform**方法对 源码进行转译

> 进入file.js中看下file实例都干了啥事情

```js
// file.js

  File.prototype.transform = function transform() {
    // 在file实例的时候调用buildPluginsForOptions，将plugin放入pluginpasses中；
    // 并把每个plugin中的visitor收集如pluginVisitors中，供生成新ast的generator使用
    for (var i = 0; i < this.pluginPasses.length; i++) {
      var pluginPasses = this.pluginPasses[i];
      // pluginPasses是babel用到的所有插件，在此处调用所有插件的的pre钩子函数（如果插件自身注册了的话）
      this.call("pre", pluginPasses);
      this.log.debug("Start transform traverse");

      // 将pluginVisitors数组中每个元素（每个plugin的visitors）中的visitors中相同的token(标识符)
      // 的enter/exit方法放到一起，到generator中统一调用
      /**
       * 说明下数据格式：
       * this.pluginVisitors[i]=[
       *        [ // plugin1
       *          VariableDeclarator: {enter: function(){//...plugin1}},
       *          ArrayExpression: {enter: function(){//...plugin1}, exit: function(){//...}}
       *          ...
       *        ],
       *        [ // plugin2
       *          VariableDeclarator: {enter: function(){//...plugin2}},
       *          ArrayExpression: { enter: function(){//...plugin2}},
       *          ClassDeclaration: {enter: function(){//...}},
       *          ...
       *        ]
       *      
       * ]
       * 合并处理之后visitor的数据格式：
       * visitor = {
       *      VariableDeclarator: { //token
       *          enter: [function(){//...plugin1}, function(){//...plugin2}]
       *      },
       *      ArrayExpression: { //token
       *          enter: [function(){//...plugin1}, function(){//...plugin2}],
       *          exit: [function(){//...plugin1}]
       *      },
       *      ...
       * }
      */
      var visitor = _babelTraverse2.default.visitors.merge(this.pluginVisitors[i], pluginPasses, this.opts.wrapPluginVisitorMethod);

      // this.ast: 当前文件生成的语法树 visitor: plugin所有的visitor
      (0, _babelTraverse2.default)(this.ast, visitor, this.scope);

      this.log.debug("End transform traverse");
      // 在此处调用所有插件的的post钩子函数（如果插件自身注册了的话）
      this.call("post", pluginPasses);
    }

    // 
    return this.generate();
  };
```

`file.transform`主要是轮询调用了所有插件的钩子函数（如果注册了的），并将所有的plugin对应的token的visitor分类集中起来，与解析出来的源码语法树ast， 一起调用`babel-traverse`中的`traverse`方法

此处调用流程有点多，现在这里大致说一下：

**babel-traverse**中的lib/index`traverse` => `traverse.node` => **lib/context**中的`context.visit` => `context.visitSingle`/`context.visitMultiple` => `context.visitQueue` => `path.visit` => `context.visit`, 递归整个ast,期间运行plugin的解析逻辑更改ast。 此时`traverse`方法走完

现在接着回到`file.transform`中的`file.generate` => 调用**babel-generator**lib/index中Generator实例的`generate`方法 => lib/printer中的`generate`方法 => lib/buffer中的`get`方法得到最终的转译结果

---

对于`babel-traverse`库，着重看下一下代码

对ast的traverse，需要从traverse方法也就是traverse.node方法开始

```js
/**
 * 对ast的traverse，需要从traverse方法也就是traverse.node方法开始
*/

traverse.node = function (node, opts, scope, state, parentPath, skipKeys) {
  // node即传入的ast，至此递归语法树开始

  // t.VISITOR_KEYS即babel-types库提供的 AST树节点的类型
  var keys = t.VISITOR_KEYS[node.type];
  if (!keys) return;

  var context = new _context2.default(scope, opts, state, parentPath);
  for (var _iterator = keys, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var key = _ref;

    if (skipKeys && skipKeys[key]) continue;
    if (context.visit(node, key)) return;
  }
};
```

对ast树节点的解析是用的context.visit方法；
而context.visit方法的核心就是visitQueue方法，然而在context.visit进入visitQueue方法的过程中有一个非常重要的事情，那就是对context.visit传入的node实例化了一个`Path`的实例，这个`Path`的实例是干什么用的？

> 我们一直再说的改变ast其实是不严谨的，babel并没有直接改变由词法解析生成的语法树，而是新建了一个大
> 对象来存放经过vistor的节点以及记录树的层级关系。这个大对象就是`Path`的实例

```js
  // babel-traverse/lib/context.js
  TraversalContext.prototype.visit = function visit(node, key) {
    var nodes = node[key];
    if (!nodes) return false;

    if (Array.isArray(nodes)) {
      return this.visitMultiple(nodes, node, key);
    } else {
      return this.visitSingle(node, key);
    }
  }

  TraversalContext.prototype.visitSingle = function visitSingle(node, key) {
    if (this.shouldVisit(node[key])) {

      /**
       * this.create(node, node, key)即是创建Path的实例(虽然visitSingle／visitMultiple)
       * 在重复调用，表面上看this.create(node, node, key)一直在调用，一直在生成实例；其实不然
       * 
       * 在create内部，会有一个缓存，第一次生成的Path实例会缓存起来，剩下会根据parent判断当前进入
       * 的节点是不是缓存的子节点，如果是子节点会创建关联关系并返回
      */

      return this.visitQueue([this.create(node, node, key)]);
    } else {
      return false;
    }
  };
```

接着说上面说到的visitQueue。

visitQueue是对传入的数组节点递归调用path.visit方法，作用是用plugin的注册方法对
一个数组节点进行处理

```js
/**
 * 对ast树节点的解析是用的context.visit方法；
 * 而context.visit方法的核心就是visitQueue方法
 * 
 * visitQueue是对传入的数组节点递归调用path.visit方法，作用是用plugin的注册方法对
 * 一个数组节点进行处理
 * 
*/

TraversalContext.prototype.visitQueue = function visitQueue(queue) {
    this.queue = queue;
    this.priorityQueue = [];

    var visited = [];
    var stop = false;

    for (var _iterator2 = queue, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var path = _ref2;

      // ...

      if (path.visit()) {
        stop = true;
        break;
      }

      if (this.priorityQueue.length) {
        stop = this.visitQueue(this.priorityQueue);
        this.priorityQueue = [];
        this.queue = queue;
        if (stop) break;
      }
    }


/**
 * babel-traverse/lib/path/context.js
 * 
 * 用visitor对当前语法树节点处理
*/

function visit() {

  // ...

  // 调用当前节点的enter钩子以及当前语法树节点类型(plugin中注册)的enter钩子
  if (this.call("enter") || this.shouldSkip) {
    this.debug(function () {
      return "Skip...";
    });
    return this.shouldStop;
  }

  this.debug(function () {
    return "Recursing into...";
  });
  // 以当前节点为父节点继续递归调用traverse.node方
  _index2.default.node(this.node, this.opts, this.scope, this.state, this, this.skipKeys);

  // 调用当前节点的exit钩子以及当前语法树节点类型(plugin中注册)的exit钩子
  this.call("exit");

  return this.shouldStop;
}

/**
 * babel-traverse/lib/path/context.js
 * 
 * 运行所有的钩子函数
*/
function call(key) {
  var opts = this.opts;

  // 每个节点开始visit的时候，先会进入节点级别的‘enter’钩子，在这里即key=‘enter’
  if (this.node) {
    if (this._call(opts[key])) return true;
  }
  // 节点界别的钩子运行完之后，运行节点下token(语法树节点)级别的钩子函数 例如‘ExpressionStatement’的
  // ‘enter’钩子

  // plugin的语法树节点的钩子是要区分返回值的
  if (this.node) {
    return this._call(opts[this.node.type] && opts[this.node.type][key]);
  }

  return false;
}

function _call(fns) {
  if (!fns) return false;

  for (var _iterator = fns, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var fn = _ref;

    if (!fn) continue;

    var node = this.node;
    if (!node) return true;

    var ret = fn.call(this.state, this, this.state);
    if (ret) throw new Error("Unexpected return value from visitor method " + fn);

    if (this.node !== node) return true;

    if (this.shouldStop || this.shouldSkip || this.removed) return true;
  }

  return false;
}
```

经过babel-traverse库的处理，已经根据plugin的转译体现到了AST上；

---

对于`babel-generator`库，着重看下一下代码

在调用`file.generate`之后，会生成一个**Generator**（babel-generator/lib/index）的实例，此实例继承于**Print**(babel-generator/lib/printer);生成最终的转译结果即执行脚本的核心方法是`printer.generate`

```js
/**
 * babel-generator/lib/printer.js
*/

 Printer.prototype.generate = function generate(ast) {
   // 将要ast生成执行脚本的核心

   //在执行完print后，会在generator实例上的_buf._buf属性上得到一个数组，此数组就是经过
   // babel-generator/lib/generators文件夹下提供的语法树节点处理函数 处理之后的结果，大致形式：
   // ["'use strict'", ";", "↵", "↵", "require", "(", "'babel-polyfill'", ")", ";", "↵", "↵",  "var", " ", "_react", " ", "=", " ", "require", "(", "'react'", ")", ";", "↵", "↵",  "var", " ", "_react2", " ", "=", " ", "_interopRequireDefault", ...];

    this.print(ast);
    this._maybeAddAuxComment();

    // 获取最终转译结果

    // this._buf.get方法主要是将上面的this._buf._buf序列化，从而得到最终的转译结果
    return this._buf.get();
  };


Printer.prototype.print = function print(node, parent) {
   
   // ...

    var _this = this;

    // printer.print的核心就是递归调用babel-generator/lib/generators文件夹下提供的语法树节点处理函数
    // 其主要核心逻辑就是将语法树不同的node节点按照不同的处理方式生成可执行脚本字符串
    this.withSource("start", loc, function () {

      // File(node, parent){//...}, DeclareFunction(node, parent){//...} 等等，并且在这些处理函数
      // 中如果发现节点有子节点还会循环调用 Printer.prototype.print方法，直至递归完成
      _this[node.type](node, parent);
    });

    // ...

  };
```


[原理文章](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-check-if-a-node-is-a-certain-type)