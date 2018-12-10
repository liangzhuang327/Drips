
    /**
     * menucode: iframe的id
     * otherWindow: 新打开的窗口对象
     * bridgeName: 通信配对标识
     * messageData: 父像子传递的数据体
     * fatherCallback: 子像父传递消息后的处理
    */
   export const fatherPostMessageToSon = (options) => {
       setTimeout(() => {
            let { otherWindow, bridgeName, menucode, messageData } = options;
            let iframeWindow = menucode && document.getElementById(menucode) && document.getElementById(menucode).contentWindow;
            let __otherWindow = otherWindow || iframeWindow;
            if (!__otherWindow) throw '没有通信的窗口';
            let finalPostMessageData = { ...messageData, __kind: bridgeName };
            let isInit = false
            window.addEventListener('message', (message) => {
                let data = message.data;
                // 接收子页面传来的消息，通知父页面，父子之间通信通道已经打通
                if (data.__done && data.__kind === bridgeName) {
                    isInit = true
                    __otherWindow.postMessage(finalPostMessageData, '*')
                }
            })
            if (isInit) return
            __otherWindow.postMessage(finalPostMessageData, '*')
        }, 0)
    }
     /**
     * menucode: iframe的id
     * otherWindow: 新打开的窗口对象
     * bridgeName: 通信配对标识
     * messageData: 父像子传递的数据体
     * sonCallback: 子页面拿到父页面数据后的操作
    */
    export const sonReadyRecieveMessage = (options) => {
        let { bridgeName, sonCallback } = options
        window.parent.postMessage({ __done: true, __kind: bridgeName }, '*')
        window.addEventListener('message', (ev) => {
            // if (ev.source !== window.parent) {return;}
            // 在存在多个iframe时候，通信只接受约定的bridgeName之间的通信
            if (ev.data.__kind !== bridgeName) {
                return
            }
            let data = ev.data;
            sonCallback && sonCallback(data, ev)
        }, false);
    }




    const parentPostMessageToSon = (postData, options= {}) => {
        const handler = () => {
          /**
           * menucode: iframe的id
           * opener: 新打开的窗口对象
           * __kind: 通信配对标识
           */
          let { menucode, opener, __kind } = options;
          if (!menucode && !opener) throw 'menucode不能为空！'
          let iframe = document.getElementById(menucode);
          let iframeWindow = iframe.contentWindow;
          let otherWindow = opener || iframeWindow;
          let finalPostMessageData = {...postData, __kind }

          let isInit = false
          window.addEventListener('message', (message)=>{
            let data = message.data;
            if (data.__status && data.__kind === __kind){
              isInit = true
              otherWindow.postMessage(finalPostMessageData, '*')
            }
          })
          if (isInit) return
          otherWindow.postMessage(finalPostMessageData, '*')
        }
        setTimeout(handler, 0)
      }