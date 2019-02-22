/**
 * 业务要求：仔finalCallback运行之前，要把所有的脚本都家在完成，其中涉及到异步的如下几个方法
 * 解决：在所有异步同步进行，都完成之后，再去运行各自方法的处理函数，再去运行finalCallback
 */
const asyncHandler = [];
asyncHandler.push({
    handle: openDB('off-lineDB', 1, ['save_data', 'upLoaded', 'offlineLogin', 'metaData']),
    successCallback: (result)=>{
      result ? require('./common/rewriteProxy.js') : cb.utils.alert('打开数据库失败，缓存功能不可用！', 'error')
    },
    errorCallback: (error)=>{cb.utils.alert('打开数据库出错！', 'error')}
  })
asyncHandler.push({
handle: proxy(config),
successCallback: testFetch,
errorCallback: testFetch
})
const finalCallback = ()=>{
    if (fromBrowser && pathname !== '/login') {
      store.dispatch({ type: 'PLATFORM_UI_USER_INIT' });
      store.dispatch(billingInit());
    }
    render();
    if (fromBrowser) return;
    // cb.utils.checkUpdate(() => {
    //   if (!cb.events.execute('onInitEnd', history)) return false;
    //   history.push('/login');
    // });
    history.push('/login');
  }
(async (asyncHandler, finalCallback)=>{
  let asyncResult = [];
  let handleArr = [];
  const deal = (asyncResult, asyncHandler, finalCallback) => {
    return new Promise(resolve=>{
      for(let i=0,length=asyncResult.length;i<length;i++){
        asyncHandler[i].successCallback && asyncHandler[i].successCallback(asyncResult[i])
        console.log('successCallback')
        console.log(asyncHandler[i].successCallback)
      }
      finalCallback && finalCallback()
      console.log('finalCallback')
      console.log(finalCallback)
      resolve()
    })
  }
  for(let i=0,length=asyncHandler.length;i<length;i++){
    handleArr.push(asyncHandler[i].handle)
  }
  try{ // handleArr[i]即异步的promise容器，有可能reject,或者跑错，会中指async函数的运行
    for(let i=0,length=handleArr.length;i<length;i++){
      asyncResult.push(await handleArr[i])
      console.log('异步结果')
      console.log(handleArr[i])
    }
  } catch(e){
    console.error(e)
    asyncHandler[i].errorCallback && asyncHandler[i].errorCallback()
  }
  await deal(asyncResult,asyncHandler, finalCallback)
})(asyncHandler, finalCallback)

/**
 * 解决：所有异步同时去进行，各自的处理自己进行；所有运行完成之后，再去运行finalCallback
 * Promise.all来解决
 * 1、testC自己来catch住了error,实际就相当于testC没有报错，Promise.all的catch就不会进入
 * 2、如果testC不自己来catch error的话，那么Promise.all在中途运行testC的时候就会报错，就如Promise.all的catch,
 *   然后Promise.all就会中止，不会在运行testC后边的（和async里await reject类似）
 */

var testA = ()=>{
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(true)
        }, 3000)
    })
}
var testAA = () => {
    return testA().then(json=>{
        console.log(`testA函数reslove正常${json}`)
    })
}
var testB = ()=>{
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(true)
        }, 5000)
    })
}
var testBB = () =>{
    return testB().then(json=>{
        console.log(`testB函数reslove正常${json}`)
    })
}
var testC = () => {
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            reject(false)
        }, 4000)
    })
}
var testCC = () => {
    return testC().then(json=>{
        console.log(`testC函数reslove正常${json}`)
    }).catch(e=>{
        console.error(`testC函数catch错误${e}`)
    })
}
// json 能够有结果，testA()是一个promise
Promise.all([testA(), testB(), testC()]).then(json=>{
    console.log(json)
}).catch(e=>{
    console.log(e)
})
// json 是undefined组成的数组，testAA()返回的是一个函数（编译时，不是运行时！）
// Promise.all([testAA(), testBB(), testCC()]).then(json=>{
//     console.log(json)
// })