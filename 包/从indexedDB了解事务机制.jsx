/**
 * 删除单条数据
 * @param {int|array} id 要删除的数据主键
 * @param {string} dbTableName
 */
export function IDB_deleteOneData(options={}){
    return new Promise(resolve=>{
        let { id, dbTableName } = options
        dbTableName || (dbTableName='save_data')
        var tx = db.transaction(dbTableName,'readwrite');
        var store = tx.objectStore(dbTableName);
        if (Array.isArray.call(null, id)){
            if (id.length<1){
                resolve('没有要删除的数据！')
                return 
            }
            let allPromises = []
            for(let i=0,length=id.length;i<length;i++){
                try{
                    let per = new Promise(resolve=>{
                        var req = store.delete(id);
                        req.onsuccess = function(){
                            resolve(true)
                        }
                        req.onerror = function(){
                            resolve(false)
                        }
                    })
                    allPromises.push(per)
                }catch(e){
                    console.error(`删除多条数据时候，id为：${id[i]}数据删除时候出错；错误为：${e}`)
                }
            }
            Promise.all(allPromises).then(json=>{
                let errorIndexes = [];
                json.forEach((ele, index) => {
                    if(ele!==true) errorIndexes.push(index)
                });
                if (errorIndexes && !errorIndexes.length) 
                    resolve('删除成功')
                else 
                    resolve(errorIndexes) // 把删除失败的项的index穿出去，供使用者后续处理失败的几项数据
            }).catch(e=>{
                console.error(e)
            })
        }else{
            var req = store.delete(id);
            req.onsuccess = function(){
                // 删除数据成功之后重新渲染表格
                // vm.getData();
                resolve('删除成功')
            }
            req.onerror = function(){
                resolve('删除失败')
            }
        }
    })
}

/**用事务解决
 * 1、不同点就是：事务形式，一个出错，所有的delete都会回滚，自己实现的👆是删除成功就成功
 */

export function IDB_deleteSomeData(options={}){
    return new Promise(resolve=>{
        let { id, dbTableName } = options
        dbTableName || (dbTableName='save_data')
        var tx = db.transaction(dbTableName,'readwrite');
        var store = tx.objectStore(dbTableName);
        if (Array.isArray.call(null, id) && id.length>0){
            for(let i=0,length=id.length;i<length;i++){
                var req = store.delete(id[i]);
                req.onsuccess = function(){
                    console.log(`删除多条数据时候，id为：${id[i]}成功`)
                }
                req.onerror = function(e){
                    console.error(`删除多条数据时候，id为：${id[i]}数据删除时候出错；错误为：${e}`)
                }
            }
        }
        tx.oncomplete = function(e){
            resolve('删除成功')
        }
        tx.onerror = function(e){
            resolve('删除失败')
            console.error('删除多条数据时候tansaction error: ' + e);
        }
    })
}