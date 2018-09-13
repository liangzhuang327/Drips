> 问题描述：安卓联迪设备副屏整体页面样式放大了，document.body.clientWidth=980而 window.screen.width = 1550；这样导致了原来样式里的样式都几乎翻成原来的两倍；
>
> 问题原因：viewport没有设置，html继承的默认视口的宽度，此时安卓联迪设备的默认视口宽度是980，根html继承的宽度就为980
>
>
>
> 疑惑：为什么端上的viewport要设置成980？为了让pc页面到手机上的时候，不至于挤成一团
>
> 问题解决：在header中加入meta的viewport标签<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">



## 简介

在查阅w3school中，第一句话中的“元数据”就让我开始了Google之旅。然后很顺利的在英文版的w3school找到了想要的结果。（中文w3school说的是元信息，Google和百度都没有相关的词条。但元数据在Google就有详细解释。所以这儿采用英文版W3school的解释。）



>The <meta> tag provides metadata about the HTML document. Metadata will not be displayed on the page, but will be machine parsable.



即是：meta标签是HTML文档的元数据（描述HTML如何从服务取，如何加载，如何布局），元数据不会对页面有影响，是对加载页面的机器（端）来生效的



## meta组成

#### 1、name属性

>最重要属性name='viewport',做端上的适配（不止是移动端，例如联迪）

#### 2、http-equid属性

#### 3、content属性

>与name属性的‘viewport’组合：content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"

#### 默认情况下，content属性为必输项，name和http-quiv二选一，与content组合，生成一项元数据

##### [问题解决](https://blog.csdn.net/u012402190/article/details/70172371)



#### 

##### [参考资料]('https://blog.csdn.net/xustart7720/article/details/79649896')

##### [参考资料](https://segmentfault.com/a/1190000004279791)

##### 



