// 连续称重模式下初始化遮罩组件
if (operationConfig.keepWeigh) {


    transparentMask = new TransparentMask('touch_touchContent_focused-cell', [{target:'peel-btn', deal: ()=>{cb.utils.alert('去皮')}},{target: 'reset-btn',deal: ()=>{cb.utils.alert('置零')}}], () => {
    dispatch(reWeigh())
    dispatch(genAction('PLATFORM_UI_BILLING_ELECTRONIC_BALANCE_UPDATEKEY', null))
    })
}


// 连续称重模式下的遮罩
/**
 * @param {focusedElementClassName, auxiliaryElements, onHide}
 * @param focusedElementClassName {String}: 选中区域的class类名
 * @param auxiliaryElements {Array}: 辅助elements  另外能够点击区域  [{ target: 辅助区域class类名, deal: 点击此区域的业务处理函数}]
 * @param onHide {Function} : 选中区域的关闭时候的业务处理函数
 * @return 构造对象
*/

class TransparentMask {
  constructor(focusedElementClassName, auxiliaryElements=null, onHide) {
    this.focusedElementClassName = focusedElementClassName
    // 初始化响应区域

    this.onHide = onHide
    this.auxiliaryElements = auxiliaryElements
    this.createMask()
  }


  createMask = () => {

    this.mask = document.getElementById('billing-TransparentMask')
    if (!this.mask) {
      this.mask = document.createElement('div')
      this.mask.setAttribute('id', 'billing-TransparentMask')
      document.body.appendChild(this.mask)
    }
    this.handler = addEventListener(this.mask, 'click', this.maskOnClick)
  }

  staticCalculate = (auxiliaryElements) => {
    if(!auxiliaryElements) return null
    let rect = {
      clientX: [0, 0],
      clientY: [0, 0]
    }
    return _.map(auxiliaryElements, (single)=>{
      let classname = single.target;
      let auxiliaryElementCollect = document.getElementsByClassName(classname);
      let auxiliaryElement = auxiliaryElementCollect && auxiliaryElementCollect[0];
      if (auxiliaryElement) {
        const auxiliaryRect = auxiliaryElement.getBoundingClientRect()
        rect = {
          clientX: [auxiliaryRect.left, auxiliaryRect.left + auxiliaryRect.width],
          clientY: [auxiliaryRect.top, auxiliaryRect.top + auxiliaryRect.height],
        }
        return {rect, deal: single.deal}
      }
    })
  }

  show = () => {
    this.mask.classList.add('show')

  }
  hide = () => {
    this.mask.classList.remove('show')
    if (typeof this.onHide === 'function') {
      this.onHide()
    }
  }
  destroy = () => {
    this.handler && this.handler.remove()
  }

  // 计算当前选中商品的可视坐标范围
  calculateRect = () => {
    let rect = {
      clientX: [0, 0],
      clientY: [0, 0]
    }
    const focusedElementCollect = document.getElementsByClassName(this.focusedElementClassName)
    const focusedElement = focusedElementCollect && focusedElementCollect[0]
    if (focusedElement) {
      const focusedRect = focusedElement.getBoundingClientRect()
      rect = {
        clientX: [focusedRect.left, focusedRect.left + focusedRect.width],
        clientY: [focusedRect.top, focusedRect.top + focusedRect.height],
      }

      return rect

    }
  }

  maskOnClick = (e) => {
    const rect = this.calculateRect()
    const auxiliaryRect = this.staticCalculate(this.auxiliaryElements)
    let auxiliaryExist = null
    if(auxiliaryRect){
      auxiliaryExist = _.find(auxiliaryRect, (single) => {
        return _.every(single.rect, (range, coordinateName) => {
          return e[coordinateName] > range[0] && e[coordinateName] < range[1]
        })
      })
    }
    if (_.every(rect, (range, coordinateName) => {
        return e[coordinateName] > range[0] && e[coordinateName] < range[1]
      })) {
      this.hide()

    } else if(auxiliaryExist){
      auxiliaryExist.deal()
      console.log('运行各自的功能吧@*@')
    }else {
      cb.utils.alert('请先确认称重商品', 'error')
    }
  }
}