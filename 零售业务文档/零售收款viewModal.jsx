/**
 * 1、从leftMemu中点击mune菜单中的 零售收款
 * 2、menuItem中存有billnum等信息，点击走进tree.jsx的execHandler
 * 3、execHandler中的处理函数由leftMenu中定义的 如何处理click操作的函数（走元数据, platform自定义，ajax打开别的页面） 来充当
 * 4、此处的execHandler会走进cube中的cb.loader.runCommandLine（点击走元数据的 菜单的业务处理）
 * 5、从cb.loader.runCommandLine走进 cb.loader.byBillNo（根据billnum打开对应的公共业务处理 此处为"voucherlist") => 调用此方法bill[data.billtype.toLowerCase()].init
 * 6、进入yxyweb/client/common/voucherlist页面,进入init方法, 并调用./common.js中的取元数据方法 common.fetchMeta
 * 
 * 
 * 7All、取回元数据后，根据元数据实例化model：将字符串的vm进行注册，并实例化viewmodel；在实例化viewmodel的时候，在viewmodel的原型上注册
 *    了一个initData的方法：用来引用对应的扩展脚本，所有数据构造完成之后，通过self.execute('extendReady', self)通知vocherlist.js里的
 *    回调函数；回调函数：主要是调用viewCallback，将viewmodel以及viewmeta传会页面作为页面click的处理函数的参数；这里是新增页签，并根据传回
 *    的viewmodel和viewmeta来进行加载对应的业务层组建
 * 7、        common.initVM = function(){
 *              return {
 *                      vm, (实例化的model)
 *                      view,(viewmeta 元数据)
 *                  }
 *          }
 *    并对此model注册监听方法['refresh', 'back', 'return']
 * 7-1、在initVM方法中vm = new cb.viewmodels[result.viewmeta.vmName]()，根据元数据实力化不同的基础model
 * 7-2、进入cube实例化model(此处是containermodel), containermodel继承basemodel，
 *      并将从多方法放拓展进containermodel的原型上, new 完之后就成为一个拥有众多方法以及
 *      { listeners: [], propertyNames: propertyNames, events: {}, cache: {} }属性的function
 * 7-3、在从服务取回来的元数据中，有注册viewmodel的字符串代码，以及引用对应扩展脚本的代码 （见common.js的initVM方法）
 * 7-4、再所有数据构建好之后，会调用self.execute('extendReady', self)通知并把{vm, viewmeta} 通过viewCallback
 *      回传给页面的点击事件
 * 7-5、页面点击事件更新redux新增页签，触发PortalTabItem更新，渲染Meta组建（meta-runner）
 */