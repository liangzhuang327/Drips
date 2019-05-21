**在Web领域，Blob被定义为包含只读数据的类文件对象。**Blob中的数据不一定是js原生数据形式。常见的File接口就继承自Blob，并扩展它用于支持用户系统的本地文件



构建一个Blob对象通常有三种方式：

1. 通过Blob对象的构造函数来构建。
2. 从已有的Blob对象调用slice接口切出一个新的Blob对象。
3. canvas API toBlob方法，把当前绘制信息转为一个Blob对象。下面只看第一种的实现：

```javascript
// 测试如何读取blob对象
let str = 'http://baidu.com';
let blob = new Blob([str]);
let reader = new FileReader();
let readerAsBuffer = reader.readAsArrayBuffer(blob);
reader.onload = function(){
    if (reader.readyState == 0){
        console.log('readerAsBuffer is EMPTY == 0 ')
        console.log(reader.result)
    }
    if (reader.readyState == 1){
        console.log('readerAsBuffer is LOADING == 1 ')
        console.log(reader.result)
    }
    if (reader.readyState == 2){
        console.log('readerAsBuffer is DONE == 2 ')
        console.log(reader.result)
    }

    // 2
    let readerAsBinaryString = reader.readAsBinaryString(blob);
    reader.onload = function(){
        console.log('readAsBinaryString' + ": " + reader.result)

        //3
        let readerAsDataURL = reader.readAsDataURL(blob);
        reader.onload = function(){
            console.log('readerAsDataURL' + ": " + reader.result)

            //4
            let readerAsText = reader.readAsText(blob);
            reader.onload = function(){
                console.log('readAsText' + ": " + reader.result)
            }
        }
    }
}

//readAsDataURL方法会使用base-64进行编码，编码的资料由data字串开始，后面跟随的是MIME type，然后再加上base64字串，逗号之后就是编码过的图像文件的内容。


//若想要将读取出来的图像文件，直接显示在网页上，您可以透过JavaScript建立一个<img>标签，再设定src属性为Data URL，再将<img>标签加入DOM之中



```

![打印结果](https://github.com/liangzhuang327/Drips/blob/master/pictrues/FileReader.png)





#### FormData

##### 一句话总结：利用 FormData 对象，可以通过JavaScript键值对来模拟一系列表单控件，还可以使用 XMLHttpRequest的send()方法来异步提交表单。

##### 与普通的Ajax相比，使用FormData 的最大优点就是可以异步上传二进制文件。



可以先通过new关键字创建一个空的 FormData 对象，然后使用 append() 方法向该对象里添加字段（字段的值可以是一个 Blob 对象，File对象或者字符串，剩下其他类型的值都会被自动转换成字符串）。





> 上传文件流程：
>
> 1、拿到file对象，或者blob对象
>
> ​	a:可以通过html标签input来上传文件，file从fileList里去拿到：fileList = e.target.file;file= fileList[0]
>
> ​	b:将base64资源转成file对象，再去上传（转换过程有点儿复杂，设计转码）
>
> ​		（base64转file核心：1、btoa和atob是window对象的两个函数，其中btoa是binary to ascii，用于将binary的数据用ascii码表示，即Base64的编码过程，而atob则是ascii to binary，用于将ascii码解析成binary数据 。刚刚那个atob  就是将ascii码转成binary；2、Uint8Array方法即是类型化数组）
>
> 2、通过FormData来上传文件（对比ajax的优势，用表单提交格式来上传文件）
>
> ​	a: let xhr = new XMLHttpRequest();   xhr.open("POST", url); xhr.send(new FormData(file))



##### Base64是一种任意二进制到文本字符串的编码方法，常用于在URL、Cookie、网页中传输少量二进制数据



##### 成果

```javascript

//将图片转换为Base64
function getImgToBase64(url,callback){
  var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    img = new Image;
  img.crossOrigin = 'Anonymous';
  img.onload = function(){
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img,0,0);
    var dataURL = canvas.toDataURL('image/png');
    callback(dataURL);
    canvas = null;
  };
  img.src = url;
}
//将base64转换为文件对象
function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length; 
  var u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  //转换成file对象
  return new File([u8arr], filename, {type:mime});
  //转换成成blob对象
  //return new Blob([u8arr],{type:mime});
}
//将图片转换为base64,再将base64转换成file对象
getImgToBase64('images/ruoshui.png',function(data){
　　　var myFile = dataURLtoFile(data,'testimgtestimgtestimg');
　　　console.log(myFile);
});
```



