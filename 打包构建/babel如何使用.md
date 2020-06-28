babel需要转译的es6[es6新增特性](https://github.com/lukehoban/es6features#readme)

babel6和7之间配置的区别[babel6和7之间配置的区别](https://www.babeljs.cn/docs/config-files#6x-vs-7x-babelrc-loading)


preset: we can use a "preset" which is just a pre-determined set of plugins.
        like with plugins, you can create your own presets too to share any combination of plugins you need. For our use case here, there's an excellent preset named env.


config配置处：6中可以从.babelrc/package.json中取，7不再支持package.json的配置



6中的babel-node属于babel-cli包的一部分，7之后babel-node从babel-cli中拆出来，重新命名一个包叫@babel/node

## 简介

1、用代码解释babel是干啥用的：

```js
        var babel = (sourceCode) => {
                // ...
                return targetCode
        }
```
babel的输入就是我们编写的代码，babel的输出就是浏览器能识别的代码

2、babel的主要构成：

bable自身可以认为是一个空的runner,是不具备转换代码的功能，只是提供了一个供插件运行的环境；在没有使用任何插件的情况下，babel自身就是一个空runner,我们用代码测试下

```js
/**
 * 1、新建一个项目，初始化，下载@babel/core和babel/cli两个核心库
 * 2、项目根目录新建一个test.js，写如一些es6的代码，运行bebel,查看输出result.js
*/

// shell
mkdir testBabel
npm init
npm install @babel/core @babel/cli --save-dev

vim test.js
//内容开始如下：
let a = New Promise(resolve=>{
        resolve(ture)
});
let b = Object.assign({}, {name: 'hello'}, {value: 'world'})
// 内容结束
babel test.js -o result.js

vim result.js
// 内容开始如下：
let a = New Promise(resolve=>{
        resolve(ture)
});
let b = Object.assign({}, {name: 'hello'}, {value: 'world'})
// 内容结束
```

通过babel的输入`test.js`和babel的输出`result.js`可以发现，内容没有任何变化；

可以发现babel核心功能还是依赖插件来实现的，如果想要 Babel 做一些实际的工作，就需要为其添加插件。**插件**是babel最重要的组成

3、插件

插件是babel功能的最小实现单元，你的项目中babel的功能是所有插件共同作用的结果

4、预设

> 不想自己动手组合插件？没问题！preset 可以作为 Babel 插件的组合

在实际项目中，大多数人都需要的功能是将es6的代码转化成es5或者es3的代码，使其能够在众浏览器中运行；

基于这个需求，官方推出了`预设`的概念：**将某一常用功能所有需要的所有插件集合在一起**；比如`@babel/preset-env`这个预设就是专门用来解析es6代码的插件集合（es6的一些特性不包含）；再比如`@babel/preset-react`这个预设就是专门用来解析react代码的插件集合；

预设降低了babel的配置难度，配置愈发简单。核心功能用预设即能完成，特殊个性化的功能自己再去配置相应的插件即可

## 配置(Config Files)
---

1、Config Files

配置文件分为两种格式`多项目配置(Project-wide configuration)`和`单项目配置(File-relative configuration)`;

**Babel 7 以前加载`.babelrc`的规则（Babel@7之前的做法）：**

Babel加载.babelrc文件时，是根据当前正在编译的源文件的文件路径开始寻找，如果当前源文件的文件夹下存在
.babelrc，则读取此.babelrc并停止像上级寻找。如果在当前文件夹没有找到.babelrc文件，则像上级文件夹
寻找，直至找到.babelrc文件，并读取其中的配置信息

通过.babelrc的读取规则，我们可以得到以下结论：

- 如果想.babelrc对所有源文件生效，则将此文件放到所有源文件的最外层文件夹下
- 

**Babel 7以后加载配置文件的规则（包含babel.config.*和.babelrc.*）**

> Babel 7加配配置文件的核心代码在 `babel-core/lib/config/config-chain.js`

看下其中的核心方法buildRootChain源码

```js
function* buildRootChain(opts, context) {
        // ...
  let configFile;

  if (typeof opts.configFile === "string") {
    configFile = yield* (0, _files.loadConfig)(opts.configFile, context.cwd, context.envName, context.caller);
  } else if (opts.configFile !== false) {
    // 默认configFile不设置，走此默认逻辑，此处是加载babel.config.*的配置
    // 加载逻辑，是去当前文件的根目录寻找babel.config.*文件并加载配置
    configFile = yield* (0, _files.findRootConfig)(context.root, context.envName, context.caller);
  }

  let { babelrc,babelrcRoots } = opts;
  let babelrcRootsDirectory = context.cwd;
  const configFileChain = emptyChain();

  if (configFile) {
    const validatedFile = validateConfigFile(configFile);
    const result = yield* loadFileChain(validatedFile, context);
    if (!result) return null;

    if (babelrc === undefined) {
      babelrc = validatedFile.options.babelrc;
    }

    if (babelrcRoots === undefined) {
      babelrcRootsDirectory = validatedFile.dirname;
      babelrcRoots = validatedFile.options.babelrcRoots;
    }

    mergeChain(configFileChain, result);
  }

  // 此处取.babelrc.*配置文件
  /**
   * 读取.babelrc.*的方法和6的版本稍有出入
   * 相同点：都是根据正在编译的文件来寻找.babelrc的配置
   * 不同点：
   *    1、babel 6/7都是根据当前文件一级一级的向上寻找；6 的寻找上一级文件的方法有点粗糙，7用的是
   *       path.basename方法来实现的；
   *    2、Babel@7: path.join(dirname, package.json); 
   *       Babel@6: path.join(dirname, .babelrc);
   *       6是根据编译文件向上取.babelrc，这里不一定是要在根目录；7根据编译文件向上寻找package.json
   *       在遇到package.json后，在当前文件路径取babelrc.*文件，如果babelrc.*没有和
   *       package.json在同一层路径下，就会读不到babelrc的配置
  */
  const pkgData = typeof context.filename === "string" ? yield* (0, _files.findPackageData)(context.filename) : null;
  let ignoreFile, babelrcFile;
  const fileChain = emptyChain();

  if ((babelrc === true || babelrc === undefined) && pkgData && babelrcLoadEnabled(context, pkgData, babelrcRoots, babelrcRootsDirectory)) {
    ({
      ignore: ignoreFile,
      config: babelrcFile
    } = yield* (0, _files.findRelativeConfig)(pkgData, context.envName, context.caller));

    if (ignoreFile && shouldIgnore(context, ignoreFile.ignore, null, ignoreFile.dirname)) {
      return null;
    }

    if (babelrcFile) {
      const result = yield* loadFileChain(validateBabelrcFile(babelrcFile), context);
      if (!result) return null;
      // 合并配置信息
      mergeChain(fileChain, result);
    }
  }

```

- Babel 7加载 babel.config.*规则

> 是去当前文件的根目录寻找babel.config.*文件并加载配置

- Babel 7加载 babelrc.*的规则

> 根据编译文件向上寻找package.json
> 在遇到package.json后，在当前文件路径取babelrc.*文件，如果babelrc.*没有和
> package.json在同一层路径下，就会读不到babelrc的配置

- Babel 加载配置的规则

> 先加载babel.config.*的配置，然后加载babelrc.*的配置，然后将两个配置的配置项合并

- 补充

> 想了解源码的可以去@babel/core/lib/config/config-chain.js的**buildRootChain**方法中查看；

Babel 7为什么又多出一直配置的方式？([英文能力过关还是建议去看官网](https://www.babeljs.cn/docs/config-files))

```js
        - babel.config.json
        - pakages/
        - mod1/
                package.json
                src/index.js
        - mode2/
                package.json
                src/index.js
```

如果你的项目是这种目录结构：即一个文件夹下有多个项目，并且多个项目间共享babel的配置／插件信息；这样的优点就是既能减少包的安装体积，还能避免不同项目之间（或者一个项目的不同分支作为另一个项目）依赖版本不同导致的问题，并且在此根目录下新建项目不再重复配置，搭建项目速度更快；具体的可以了解下monorepo的[文档](https://www.babeljs.cn/docs/config-files#monorepos)

此中项目如果在根目录用.babelrc文件的话，会有很多预料不到的问题。所以在7以后提供了babelconfig.json(后缀可以是.js/.cjs/.mjs)就可以完美解决这种问题;

当跟目录下的不同项目启动的时候，可以在babel.config.json中设置不同的根路径`configFile`字段

所以多项目配置有更广阔的应用场景，但对于单个项目目录来说，这两种配置的效果是一样的；如果使用babel7以后的版本，还是建议使用`多项目配置格式`来配置

**具体配置** (但项目配置／多项目配置相同)

1、预设／插件都不需要参数格式
```js
{
        "presets": [
                '@babel/preset-env',
                '@babel/preset-react'
        ],
        "plugins": [
                'plugin1',
                'plugin2'
        ]
}
```

2、预设／插件需要参数的格式
```js
{
        "presets": [
                ['@babel/preset-env',{//...预设的参数}]
                '@babel/preset-react'
        ],
        "plugins": [
                ['plugin1', {option1: 11, option2: 222}]
                'plugin2'
        
}
```

- presets的执行顺序是**逆序**的，这主要是为了兼容以前的写法；react - env
- plugins的执行顺序是**正序**的 plugin1 - plugin2

## 选项 （Options）

---
因为大多数参数都是提供给Babel编程来用，比如写Babel相关的工具。对于大多数Babel集成用户来说不大能用到
故这部分内容就先不写了 [官网地址](https://www.babeljs.cn/docs/options)

## 如何在项目中加载babel的配置

### register

---

register是另一个使用Babel的方式；

register和babel-node的实现方式类似，都是通过将钩子函数（hook）注册到node的`require`模块上，**在运行的时候即时编译**；

配置babel-register:
- 1、在文件入口引入babel-register：require('@babel/register')
- 2、如需特殊配置编译哪些文件可进行配置(默认不编译node_modules下的文件)
```js
                require('@babel/register')({
                        ignore: [
                                /regex/,
                                function(filepath){
                                        return filepath === 'xxx'
                                }
                        ],
                        only: [
                                // ...和ignore配置相同
                        ]
                })
```
- 3、后续所有用`require`方式引入的模块在运行时候都会即时运行Babel配置去编译
- 4、babel.config.js/.babelrc和以前的配置一样

何时使用babel-register：

> 1、babel-register和babel-node一样都尽量在开发环境使用，不要在生产环境使用；
> 毕竟实时编译会造成性能影响，所以个人建议尽量使用Babel的预编译

> 2、但是babel-register还是有写场景能发挥他的灵活性的；

比如我们要根据当前运行环境或者参数动态的加载一些第三方包，最为关键的是第三方包有可能存在ES6或者其他需要
Babel转译的语法，此时有两种法案：
        1、Babel预编译的文件目录不变，使用babel-register实时编译此第三方包
        2、还使用预编。即将需要用的第三方包都预先编译好，即加入到编译入口中去也能完成
总之，根据实际需要，灵活的使用

注意：
        实际使用过babel-register之后会发现(我用的版本是@7.10.1)在ie中根本无法用，因为在babel-register/lib/index.js中第一句就用了es6的...语法！所以还得提前用Babel预编译
        `@babel/register`这个依赖包，好鸡肋！！