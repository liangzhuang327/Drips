#### 为什么我们需要react-redux？

熟悉redux的人可能知道，redux是数据存储和管理的工具，但是想要在react中使用redux，并不能直接将store、action和react组件建立连接，所以就需要react-redux来结合react和redux。

react-redux主要任务就是用来连接react 和redux



#### 核心API

##### 1、Provider

> 1、用来包裹react根组建，起到的作用就是，创建context----`生产者`，并将redux的store传入context，用来像子孙组建传递状态
>
> 2、react-redux的Provider根本就是一个react的高阶组建，对根组建进行了wrapped，在Provider源码中，在此高阶组建的didmount的时候，调用了对redux的监听`store.subscrib`,redux状态发生变化后就会走进此监听函数中，通过`state`的变化，重新`render`，同时改变传入`context`中的store的值。**达到了手动触发了组建的刷新和`store`的改变**
>
>  
>
> 至此，react-redux的`Provider`高阶组建实现了给子孙组建提供了redux的`store`和每当redux变化的时候将组建重新刷新并将变化的`store`提供给子孙组建；
>
> 下面贴一下react-redux中Provider的源码，指贴了一些关键代码

```javascript
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ReactReduxContext } from './Context'

class Provider extends Component {
  constructor(props) {
    super(props)
    // 将Provider组建传进来的store,存入次高阶组建的state中，实现reudx变化刷新组建
    const { store } = props
    this.state = {
      storeState: store.getState(),
      store
    }
  }

  componentDidMount() {
    this._isMounted = true
    // 高阶组建didmount后，就开始对传入的store进行监听，每当redux变化的时候，重新setState
    // 跟新state中的redux state, 并刷新组建
    this.subscribe()
  }

  componentWillUnmount() {
    // 组建卸载，清楚监听
    if (this.unsubscribe) this.unsubscribe()

    this._isMounted = false
  }

  render() {
    // Context react核心API,也是react-redux实现的核心思路
    const Context = this.props.context || ReactReduxContext

    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
}
```

⚠️在这里提一句，`react-redux`5x版本及以前都是应用`react`16.3版本以前的context来实现的，与本文介绍的有所不同，本文中`react-redux`版本为6X，其核心实现的context 是`react`16.3版本以上的全新API context。具体context 在`react`16.3版本前后有何不同，我们后续会将到

##### 2、connect

> ```javascript
> connect(mapStateToProps, mapDispatchToProps, mergeProps, options = {})(WrapComponent)
> ```

```javascript
import * as todoActionCreators from './todoActionCreators'
import * as counterActionCreators from './counterActionCreators'
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { todos: state.todos }
}

function mapDispatchToProps(dispatch) {
  return {
    todoActions: bindActionCreators(todoActionCreators, dispatch),
    counterActions: bindActionCreators(counterActionCreators, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoApp)
```

如上述代码，connect的作用，就是将最新的redux 的state和 actions 合并到wrappedComponent的props上，这样，在我们基础组建内，就可以拿到redux的状态，以及我们定义的action。用法很简单，那接下来就简单说一下connect的源码

------

> 由connect的调用就能看出,connect返回的是一个需要组建为参数的函数，故其核心内容就是这个函数，在源码里其方法为`connectAdvanced`
>
> 先看一段`connectAdvanced`的英文注释
>
> selectorFactory is a func that is responsible for returning the selector function used to
>
> ​    compute new props from state, props, and dispatch. For example:
>
> ​      export default connectAdvanced((dispatch, options) => (state, props) => ({
>
> ​        thing: state.things[props.thingId],
>
> ​        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
>
> ​      }))(YourComponent)
>
> selectorFactory是一个函数，返回值也是个函数，返回函数是用来计算出最新的props（根据传入的options，state, props, dispatch）
>
> ​    Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
>
> ​    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
>
> ​    the selectorFactory, along with displayName and WrappedComponent, as the second argument.
>
> ​    Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
>
> ​    props. Do not use connectAdvanced directly without memoizing results between calls to your
>
> ​    selector, otherwise the Connect component will re-render on every state or props change.

先看一下源码connectAdcanced.js源码结构，同样，删掉了一些无关代码

```javascript
import hoistStatics from 'hoist-non-react-statics'
import invariant from 'invariant'
import React, { Component, PureComponent } from 'react'
import { isValidElementType } from 'react-is'

import { ReactReduxContext } from './Context'

export default function connectAdvanced(
  selectorFactory,
  {
    getDisplayName = name => `ConnectAdvanced(${name})`,
    methodName = 'connectAdvanced',
    renderCountProp = undefined,
    shouldHandleStateChanges = true,
    storeKey = 'store',
    withRef = false,
    forwardRef = false,
    context = ReactReduxContext,
    ...connectOptions
  } = {}
) {
  const Context = context
  // connectAdvanced函数返回的是一个函数wrapWithConnect，此函数返回的就是经过包装的的最终组建
  return function wrapWithConnect(WrappedComponent) {
    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const displayName = getDisplayName(wrappedComponentName)

    const selectorFactoryOptions = {
      ...connectOptions,
      getDisplayName,
      methodName,
      renderCountProp,
      shouldHandleStateChanges,
      storeKey,
      displayName,
      wrappedComponentName,
      WrappedComponent
    }

    const { pure } = connectOptions

    let OuterBaseComponent = Component
    let FinalWrappedComponent = WrappedComponent

    if (pure) {
      OuterBaseComponent = PureComponent
    }
	
     // 返回经过store更新，以及合并之后的最新props
    function makeDerivedPropsSelector() {}
	// 传递了最新props和ref的子组建
    function makeChildElementSelector() {}

    class Connect extends OuterBaseComponent {
      constructor(props) {
        super(props)
        invariant(
          forwardRef ? !props.wrapperProps[storeKey] : !props[storeKey],
          'Passing redux store in props has been removed and does not do anything. ' +
            customStoreWarningMessage
        )
        this.selectDerivedProps = makeDerivedPropsSelector()
        this.selectChildElement = makeChildElementSelector()
        this.renderWrappedComponent = this.renderWrappedComponent.bind(this)
      }
		// 将顶层context中的sotre传入，经过his.selectDerivedProps计算出最新props, 以此为参数传			// 给this.renderWrappedComponent
      // 构建出拥有最新props的wrapped组建
      renderWrappedComponent(value) {
        const { storeState, store } = value

        let wrapperProps = this.props
        let forwardedRef

        if (forwardRef) {
          wrapperProps = this.props.wrapperProps
          forwardedRef = this.props.forwardedRef
        }

        let derivedProps = this.selectDerivedProps(
          storeState,
          wrapperProps,
          store
        )

        return this.selectChildElement(derivedProps, forwardedRef)
      }

      render() {
        const ContextToUse = this.props.context || Context

        return (
          <ContextToUse.Consumer>
            {this.renderWrappedComponent}
          </ContextToUse.Consumer>
        )
      }
    }

    Connect.WrappedComponent = WrappedComponent
    Connect.displayName = displayName

    if (forwardRef) {
      const forwarded = React.forwardRef(function forwardConnectRef(
        props,
        ref
      ) {
        return <Connect wrapperProps={props} forwardedRef={ref} />
      })

      forwarded.displayName = displayName
      forwarded.WrappedComponent = WrappedComponent
      return hoistStatics(forwarded, WrappedComponent)
    }
	// 将WrappedComponent这个react组建的基础属性（框架底层）赋值给Connect组建
    // 至此，完成最终的wrap传进来的组建
    return hoistStatics(Connect, WrappedComponent)
  }
}

```

⚠️ 此源码文件中涉及到的reactAPI都是 16.3以后的全新api， context、ref、forwardRef。其他文章会介绍道这些API。









参考资料

[react-redux Connect方法](https://www.jianshu.com/p/e3cdce986ee2)







#### 