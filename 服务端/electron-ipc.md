#### 主进程 ipcMain
```js
ipcMain直接继承的EventEmitter对象，是EventEmitter的一个实例,**实例本身没有追加任何方法**
const ipcMain = require('electron').ipcMain;
// ipcMain直接继承的EventEmitter对象，是EventEmitter的一个实例,实例本身没有追加任何方法
```
#### 渲染进程 ipcRenderer
ipcRenderer也继承自EventEmitter对象，是EventEmitter的一个实例，**实例本身又实现了send等方法**
```js
const ipcRenderer = require('electron').ipcRenderer;
// ipcRenderer也继承自EventEmitter对象，是EventEmitter的一个实例，实例本身又实现了send等方法
```

#### 渲染进程像主进程发送消息

#### 主进程像渲染进程发送消息

#### 渲染进程像渲染进程通讯

#### ipcMain的监听者怎么接受到ipcRenderer的发送者内容？
按照官网实例实现`渲染进程和主进程通讯`；渲染进程给主进程发送renderToMain的句柄携带ping消息，主进程接根据监听的句柄，调用回调；在主进程的回调里处理完逻辑，像渲染进程发送mainToRender的句柄携带pong消息；至此 renderer => main => renderer,实现渲染进程和主进程的通讯
```js
    // main.js
    ipcMain.on('renderToMain', function(event, arg){
        let message = 'pong'
        console.log(arg) // ping
        event.sender.send('mainToRender', message)
    })

    // renderer.js
    ipcRenderer.send('renderToMain', 'ping');
    // 可用on 可用addListener
    ipcRenderer.on('mainToRender', function(event, arg){
        console.log(arg) // pong
    })
```

##### 问题1：ipcMain的注册监听 和ipcRender的注册监听是不是在同一个target上？如果不是为什么ipcRender发送的chenal在ipcMain上能够接收到？
看下源码：
```js
// browser/ipc-main-internal.js
// 可以看到ipc-main完全是一个EventEmitter的实例，没有任何东西
const { EventEmitter } = require('events')

const emitter = new EventEmitter()

// Do not throw exception when channel name is "error".
emitter.on('error', () => {})

module.exports = emitter

//render/ipc-render-internal.js
const binding = process.atomBinding('ipc')
const v8Util = process.atomBinding('v8_util')

// Created by init.js.
const ipcRenderer = v8Util.getHiddenValue(global, 'ipc')
const internal = false

ipcRenderer.send = function (...args) {
  return binding.send('ipc-message', args)
}

ipcRenderer.sendSync = function (...args) {
  return binding.sendSync('ipc-message-sync', args)[0]
}

ipcRenderer.sendToHost = function (...args) {
  return binding.send('ipc-message-host', args)
}

ipcRenderer.sendTo = function (webContentsId, channel, ...args) {
  return binding.sendTo(internal, false, webContentsId, channel, args)
}

ipcRenderer.sendToAll = function (webContentsId, channel, ...args) {
  return binding.sendTo(internal, true, webContentsId, channel, args)
}

module.exports = ipcRenderer

```
> ipcRender.send('renderToMain', 'ping')发送消息，进入binding.send('ipc-message', ['renderToMain', 'ping']);渲染进程发
> 送的消息会被分类,这些预知的分类有：`ipc-message`, `ipc-message-sync`, `ipc-message-host`等；要想知道ipcRender和ipcMain的
> 事件target是不是一个就只能看binding了

```js
// common/init.js
process.atomBinding = require('@electron/internal/common/atom-binding-setup')(process.binding, process.type)

//common/atom-binding-setup.js
module.exports = function atomBindingSetup (binding, processType) {
  return function atomBinding (name) {
    try {
      return binding(`atom_${processType}_${name}`)
    } catch (error) {
      if (/No such module/.test(error.message)) {
        return binding(`atom_common_${name}`)
      } else {
        throw error
      }
    }
  }
}

//render/ipc-render-internal.js
const binding = process.atomBinding('ipc')
```
> 根据上述代码，electron把node的`process.binding`做成了中间件，返回一个供electron调用的`atomBinding`。自我分析流程大概是:
> electron将外部js代码统一经过`atomBinding`处理，返回一个调用外部插件的功能；process.atomBinding('ipc')返回的是插件
> `atom_browser_ipc`的返回

继续看ipcRender的事件模型和ipcMain的关系：
```js
//render/ipc-render-internal.js 
const binding = process.atomBinding('ipc')
const v8Util = process.atomBinding('v8_util')
const ipcRenderer = v8Util.getHiddenValue(global, 'ipc')

ipcRenderer.send = function (...args) {
  return binding.send('ipc-message', args)
}

```
ipcRenderer.send最后调用的是binding.send，binding是加载注入了`ipc`功能，最后调用binding内部的send方法，并且消息体是ipc-message;
到这里就代码跟不到了，只能猜测了：binding.send('ipc-message', ['renderToMain', 'ping'])会进入binding的监听，并进入此chanel的回调，此回调里应该会循环ipcMain的事件模型里的_events数组，如果ipcMain里有注册此消息，就会进入ipcMain对应的chanel中的回调；