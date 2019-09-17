# iOS下setTimeout无法触发focus事件的解决方案

**开篇总结：其实目前无法解决这个bug。**

这两天做项目遇到了这个case，项目需求是打开页面的时候，input元素自动弹起键盘。由于各种方面的考虑，我们希望通过setTimeout延时200毫秒让input元素focus，demo代码如下：

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

```
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>IOS下setTimeout无法触发focus事件的解决方案</title>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no">
</head>
<body>
<div id="container">
    <input id="input-box" type="text" placeholder="click here to focus.">
</div>
<script>
    var container = document.getElementById("container");
    var input = document.getElementById("input-box");
    setTimeout(function () {
        input.focus();
    },200);
</script>
</body>
</html>
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

 

- **问题出在哪？**

上面的代码在pc上显示没有问题，但是在安卓上也ok，但是在ios上出了问题，input没有获得焦点，问题出在哪了？

我通过debug发现，代码能执行到setTimeout里面，并且input元素也没有选择失败，那我们判断是input.focus()这句失效了。

 

- **前人指路**

然后我们在stackoverflow上搜到了相关的case：[Mobile Safari Autofocus text field](http://stackoverflow.com/questions/6287478/mobile-safari-autofocus-text-field)

在最高票答案中，来自FastClick团队的大牛指出了IOS下input的获取焦点存在这样的问题：

*my colleagues and I found that iOS will only allow focus to be triggered on other elements, from within a function, if the first function in the call stack was triggered by a non-programmatic event. In your case, the call to setTimeout starts a new call stack, and the security mechanism kicks in to prevent you from setting focus on the input.*

*翻译：我和我的同事发现，iOS将只允许在其他元素上绑定函数来触发focus事件，如果第一个函数调用栈是由非编程触发的事件（这句不知道怎么翻译）。在你的案例中，调用setTimeout开始一个新的调用堆栈，IOS的安全机制开始阻止你触发input元素的focus事件。*

github上也有相关的issue：[iOS does not show keyboard on .focus()](https://github.com/jquery/jquery-mobile/issues/3016)

里面也有人指出：

*iOS won't, as far as I can tell from testing, show the keyboard without some kind of user interaction.Trying a setTimeout to load it doesnt work. But setting the focus on another element's onClick event brings it up.*

*翻译：据我目前测试所知，如果没有通过某种用户交互，iOS不会（触发focus事件）。用setTimeout试图触发focus不工作（setTimeout是延时触发，非用户交互的当下触发focus），但设置另一个元素的onClick事件，就能把focus事件带起来。*

```
    //通过在input以外的其他元素绑定事件可以触发input元素的focus事件
    container.addEventListener("click",function(e){
        input.focus();
    });
```

 

- **解决方案？**

**目前看来没有更好的办法能在iOS下，通过setTimeout调起focus事件，所以只能把setTimeout去掉，从产品设计上避免**