为什么非要读webpack源码：
> 网上充斥着大量webpack教学，打开都是教你怎么配置webpack的config,做做简单的demo完全没问题;
> 1、webpack配置的一些参数意义始终不明白：a:output中的path，publicPath，b:module->rules->loader,还有loader的option等等，层级感觉很乱；c:plugin加入的方式多种多样很蒙蔽（先实例化，放入loader中，然后在放入plugin中）等等；
> 2、一些参数配置了不生效或者和预期的不同：比如source-map中遇到的问题，配置完成了之后在浏览器找不到源码，到底是配置出错还是内部原因？很懵逼，其实这个也可以归结到第一项中去，我怎么知道我参数配置成功没有？不生效是我配置不对还是本身有问题^_^本身有问题的几率很小），即使我配置不对，我也分不清到底哪里是不对了。
> 3、在编译出了问题，能大致定位到配置哪里出了问题
> 4、能够根据项目需求很快自定义自己的配置文件（很灵活的配置）
> 5、能够对webpack不再陌生，达到自己做的项目那种熟练度，了然于胸，装逼

如何读源码：
> 1、将源码引入到例子中去，开始调试着走（前端类的源码好说直接运行在浏览器调试就可以，node端的就需要用vscode调试node功能来启动源码）[借鉴这里]("https://juejin.im/post/5dc01199f265da4d12067ebe")
> 2、给源码分类，按照逻辑分层／核心概念分层／核心API分层（这部工作不好做，可以借助网上大量的这类博客，虽然平时看这些博客一脸蒙蔽，但调试的时候跟一遍，找出那几个核心就达到目的了）
> 3、分层之后不着急细化去读其中的逻辑，先把核心层的输入／工作内容／输出总结出来，然后把核心的几个层在逻辑上串起来，形成一个思路图，结合实际使用场景将思路图巩固
> 4、开始细化每个层的代码逻辑／如果只了解大致流程可以到此为止
> 5、总结源码的编写上的优点，优秀方法，优秀架构思想归纳

我秉持着上边的指引来开始阅读webpack源码

---


## webpack source code
### 1、将源码跑起来，急于走第二步，此步后续来补充（主要是调试node的过程）

### 2、给源码分核心层
按照核心API:
#### 1、webpack方法
 我们启动webpack最先调用的就是webppack这个方法（lib/webpack.js）
 **输入（@params）:**
 > 1、options: 我们在项目中的配置文件 即是webpack.config.js；可以是**数组List**，可以是**对象Map**;
 > 2、callback(可选参数): 回调函数，如果有此参数，在webpackb编译完成之后会回调进来
 **输出（@return）:**
 > 如果传入参数有callback,则会自行启动编译工作并返回一个compiler实例；如果没有callback参数，则只是单纯的返回一个compiler实例并不会启动编译工作
 **主要的功能（@process）:**
 > 根据配置文件即配置参数options来实例化一个配置实例compiler,注册一些列的**钩子工厂**，供后续逻辑用**钩子工厂**来实现自己的**钩子注册**和**钩子调用**
#### 2、compiler实例
> compiler实例是由createCompiler类构造出来的
**输入（@params）:**
> options: webpack中用户定义的配置参数对象Map；（注：如果用户定义的是多配置文件即webpack.config.js输出是List,则会调用createMultiCompiler实例）;
**输出（@return）:**
> compiler*生产线*实例
**内部几个核心流程：**
> 1、注册用户自定义的plugin,即options.plugins。循环plugins数组，如果元素是函数（plugin是函数）则直接调用，如果是类（plugin是类），则调用类上的apply方法；
> 最终将plugin中的逻辑以及监听函数注册到compiler实例／compiler.hooks上
> (次要)2、将默认的参数与options合并。调用applyWebpackOptionsDefaults方法，完善最终传入的options。
> (次要)3、调用最早的两个钩子函数／声明周期。environment和afterEnvironment。
> 4、根据options配置来注册和初始化webpack内置的插件。
**内部核心的API:**
1、run
> run方法就是不同阶段钩子函数的运行
> 运行钩子函数beforeRun————run—---钩子函数，最后运行done————afterDone---钩子函数，中间的最重要的编译流程交给compile方法了
2、compile
> 如何加载依赖？
> loader如何处理文件？
> 处理好的文件如何加载到浏览器中？
#### 3、compilication实例
