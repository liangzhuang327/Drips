#### webpack 的Require

1、定义：require为请求加在模块，参数为包含变量的表达式，所以require在编译时只会创建一个上下文，而拿不到精确的具体的要加载的模块；在运行时才会拿到具体的模块

​	（**require在编译时只会创建一个上下文(context)，在运行时才会拿到具体模块**）

2、require生成的context(上下文对象)：context包含对该目录中所有模块的引用，context为一个map对象，包含了请求转换的模块和该模块id的映射

> ```javascript
> let context = require('./template/' + name + '.ejs');
> // context为上下文对象
> {
>   "./table.ejs": 42,
>   "./table-row.ejs": 43,
>   "./directory/folder.ejs": 44
> }
> ```

3、require.context定义：生成自己的上下文对象，require.context(目录,  是否应该搜索子目录， 正则匹配后缀文件名称 )；自定义生成的上下文对象在构建时解析代码

​	（**所以用require.context来动态引用，因为其在构建是解析代码，构建时本地层级目录还存在，运行时候代码层级已经变为真正域名了；所以生命一个变量存储在构建时候生成require上下文**）

> 用途：如果支持动态引入文件？