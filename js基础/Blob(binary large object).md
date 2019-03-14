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


```

