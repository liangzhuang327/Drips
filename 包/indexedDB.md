#### 一、事务 transtion

​	1、事务的执行顺序是按照创建的顺序，而不是发出请求的顺序。

```javascript
var trans1 = db.transaction('foo', 'readwrite');
var trans2 = db.transaction('foo', 'readwrite');
var objectStore2 = trans2.objectStore('foo')
var objectStore1 = trans1.objectStore('foo')
objectStore2.put('2', 'key');
objectStore1.put('1', 'key');
```

> 上面代码中，`key`对应的键值最终是`2`，而不是`1`。因为事务`trans1`先于`trans2`创建，所以首先执行。
>
> 注意，事务有可能失败，只有监听到事务的`complete`事件，才能保证事务操作成功。

​	2、同时进行1和2两个事务，（创建顺序为先1后2），2的执行是不是等到1执行完成之后才会进行？

​		**答案是：yes；1的事务都执行完成之后才会执行2的事务，只有1的事务oncompolete或onerror有返回才会进入事务2**

```javascript
startTest(){
    for(let j=0;j<20;j++){
      if (j == 18)
      IDB_saveData({name: `事务同时进行的时候 存：第${j}条`, index:j}, '', true) // 第三个参数是让此次保存报错
      else
      IDB_saveData({name: `事务同时进行的时候 存：第${j}条`, index:j})
    }
    console.log('**************事务同步写**********')
    IDB_searchData({dbTableName: 'save_data'}).then(list=>{
      for(let i=0;i<list.length;i++){
        IDB_deleteOneData({id: list[i].indexedDB_id})
      }
    })
  }
startTest()
/**
打印如下：
**************事务同步写**********
Uncaught (in promise) ReferenceError: tt is not defined （此处是我故意让保存出错的地方）
成功保存id为769的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为770的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为771的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为772的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为773的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为774的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为775的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为776的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为777的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为778的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为779的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为780的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为781的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为782的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为783的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为784的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为785的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为786的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:66 成功保存id为787的数据
indexedDB.jsx:70 进行save_data:[object Object] 的事务成功！
indexedDB.jsx:155 进行IDB_searchData: 的事务成功！
indexedDB.jsx:103 进行IDB_deleteOneData:689 的事务成功！
indexedDB.jsx:103 进行IDB_deleteOneData:690 的事务成功！
indexedDB.jsx:103 进行IDB_deleteOneData:691 的事务成功！
indexedDB.jsx:103 进行IDB_deleteOneData:692 的事务成功！
.....
*/
```

> console.log('**************事务同步写**********')，先打印出这句：说明DB的事务执行都是异步的；
>
> 先打印保存成功的19条，然后在进行seracrh和删除：说明事务是一个完成之后才会进行下一个事务，不会同时进行

​	3、事务里边，不能在存在逻辑上的异步



```javascript
IDB_saveData(data, dbTableName, isError){
return new Promise((resolve, reject) => {
    let name = dbTableName ? dbTableName : 'save_data';
    var tx = db.transaction(name,'readwrite');
    var store = tx.objectStore(name);
    if (true) {
        setTimeout(() => {
            var req = store.put(data);
            req.onsuccess = function(){
                console.log('成功保存id为'+this.result+'的数据');
                resolve(true)
            }
            tx.oncomplete = function(){
                console.log('进行save_data:' + data + ' 的事务成功！')
            }
            tx.onerror = function(){
                console.log('进行save_data:' + data + ' 的事务失败！')
            }
            req.onerror = function(e){
                console.log('保存失败')
                console.log(e.target.result.error)
                cb.utils.alert('缓存数据失败！', 'error')
                reject(e.target.result)
            }
        }, 0);
        tx.oncomplete = function(){
            console.error('进行save_data:' + data + ' 的事务成功！')
        }
        tx.onerror = function(){
            console.error('进行save_data:' + data + ' 的事务失败！')
        }
        return 
    }
}
// 模拟事务里边存在除了db自身操作以外的异步操作
/*
indexedDB.jsx:63 Uncaught DOMException: Failed to execute 'put' on 'IDBObjectStore': The transaction has finished
indexedDB.jsx:82 进行save_data:[object Object] 的事务成功！
*/
```

> 1、事务里存在除了db自身操作以外的异步操作，就会报错：The transaction has finished
>
> 2、**事务里的存取操作失败，事务可以成功**，如何确保一个读取操作完全成功？

​			4、事务成功，并且事务里对DB的读取也成功，才能100%保证成功

```javascript
export function IDB_saveData(data, dbTableName){
return new Promise((resolve, reject) => {
    let name = dbTableName ? dbTableName : 'save_data';
    var tx = db.transaction(name,'readwrite');
    var store = tx.objectStore(name);
    var req = store.put(data);
    let returnData = '', result = false;
    req.onsuccess = function(){
        returnData = this.result
        result = true
    }
    req.onerror = function(e){
        returnData = e.target.result
    }
    tx.oncomplete = function(){
        if (result) { // 事务成功且读取操作也成功才代表最终成功
            console.log('成功保存id为'+returnData+'的数据');
            resolve(true)
        } else {
            cb.utils.alert('IDB_saveData存储操作成功，事务失败！');
            reject(returnData)
        }
    }
    tx.onerror = function(){
        console.log(returnData.error)
        cb.utils.alert('缓存数据失败！', 'error')
        reject(returnData)
    }
})
}
```

一点儿indexedDB官网自己翻译：

[IndexedDB]: https://w3c.github.io/IndexedDB/#transaction-construct	"IndexedDB"



```javascript
/**
 * 下面解说说明了事务什么时候可以被开启
 * 1、任意数量的只读事务允许同时进行，即时这些事务的作用域有重叠甚至是操作同一个表。只要只读事务开启，事务
 * 完成后返回的数据都应该是相同的。也就是说两个事务读取同一表中的一条数据时候，无论当查询到数据或者没有查到数据
 * 的情况都应该返回形同的结果
 * 说明：这里有多种方法来保证上面的这种情况，应用在只读事务完成之前可能会阻止任何的read-write类型的事务
 * （其作用域与只读类型的事务作用域重叠）。或者应用可以允许只读事务查看当前表的一个快照，该快照是在第一个
 * 只读事务开启时拍摄的
 */
```

