### React 高级API

#### 1、Context

> 为什么需要使用Context?
>
> 我们都知道，react组建之间的数据传递只能依赖于props一级一级往下传。如果组建嵌套层级比较深，props传播的层级太深，同时还会污染中间层级组建的props。所以Context就是为了解决react组建跨层级之间的数据传递。可以理解为Context携带的数据是一个“全局作用域”
>
> Context API react官方是不赞成开发者将其应用到自己的组建中（怕理解不深，副作用）。但很多第三方库都是依赖这个Context来实现，**比如react-redux 、react-router**

- React.createContext

createContext是一个function，接受一个参数defaultValue。作用是创建一对{ Provider, Consumer }。注意在组建中使用Provider和Consumer的时候，要保证它们两个是从出自同一个实例。

```javascript
const { Provider, Consumer } = React.createContext(defaultValue);
// defaultValue可以为空不传，传值是保证父级组建中没有调用Provider组建的时候，但是在子级组建中调用Consumer的时候，保证context中的值为defualtValue
// ⚠️ 如果父级组建调用了Provider组建，但是没有传value属性，在子级组建中调用Consumer的时候，context中的值不会是defaultValue⚠️，而是undefined
```

- Provider

```javascript
<Provider value={/* some value */}>
```

React 组件允许 Consumers 订阅 context 的改变。

接收一个 `value` 属性传递给 Provider 的后代 Consumers。一个 Provider 可以联系到多个 Consumers。Providers 可以被嵌套以覆盖组件树内更深层次的值。

- Consumer

```javascript
<Consumer>
  {value => /* render something based on the context value */}
</Consumer>
```

一个可以订阅 context 变化的 React 组件。

接收一个 [函数作为子节点](https://react.docschina.org/docs/render-props.html#using-props-other-than-render). 函数接收当前 context 的值并返回一个 React 节点。传递给函数的 `value` 将等于组件树中上层 context 的最近的 Provider 的 `value` 属性。如果 context 没有 Provider ，那么 `value` 参数将等于被传递给 `createContext()` 的 `defaultValue` 。

```javascript
import React, { Component } from 'react';

const ReactContext = React.createContext({background: '#222222',});

export default class Father extends Component{
    constructor(props){
        super(props)
    }

    computeState = () => {
        return {
            name: 'context'
        }
    }

    render(){
        let value = this.computeState()
        return(
            <ReactContext.Provider value={value}>
                <div>这里是Father组建</div>
                <Children />
            </ReactContext.Provider>
        )
    }
}

class Children extends Component{
    constructor(props){
        super(props)
    }
    render(){
        return<div>
            这里是Chldren组建
            <Son />
        </div>
    }
}
class Son extends Component{
    constructor(props){
        super(props)
    }
    render(){
        return(
            <ReactContext.Consumer>
                {(value)=>{
                    return <div>这里是Son组建<span>{`这里是从father拿的context${JSON.stringify(value)}===>${value.name}`}</span></div>
                }}
            </ReactContext.Consumer>
        )
    }
}
```



- 注意⚠️

**每当Provider的值发送改变时, 作为Provider后代的所有Consumers都会重新渲染。 从Provider到其后代的Consumers传播不受shouldComponentUpdate方法的约束，因此即使祖先组件退出更新时，后代Consumer也会被更新。** 这和react 16.3版本以前的context不同之处，之前的context，如果在Provider(暂时这样写，以前版本不是此api)和Consumer之间的中间组建中调用shouldComponentUpdate，返回false，就不会引起Consumer组建的刷新（旧版本的刷新是在Provider组建中调用setState实现）。

通过使用与[Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#Description)相同的算法比较新值和旧值来确定变化。

------

- react16.3版本之前的Context也稍微介绍一下，但不像新版本那样有明了的API

```javascript
// 旧版本的context要想使用，必须有类型校验，否则不生效
import PropTypes from 'prop-types';

class Button extends React.Component {
  render() {
    return (
      <button style={{background: this.context.color}}>
        {this.props.children}
      </button>
    );
  }
}
// 此处为‘调用者’，声明Button组建的contextTypes,其为一个对象，把Button组建需要的属性的类型都要校验一下
// 之后就能在组建中通过 this.context来调用到context对象
Button.contextTypes = {
  color: PropTypes.string
};

class Message extends React.Component {
  render() {
    return (
      <div>
        {this.props.text} <Button>Delete</Button>
      </div>
    );
  }
}

class MessageList extends React.Component {
  // 此处为'声明者'，即在顶层组建中定义context，定义完成，还需要做类型校验。这两步都完成，自组建才有可能 拿到context对象
  getChildContext() {
    return {color: "purple"};
  }

  render() {
    const children = this.props.messages.map((message) =>
      <Message text={message.text} />
    );
    return <div>{children}</div>;
  }
}
// ‘声明者’的类型校验
MessageList.childContextTypes = {
  color: PropTypes.string
};
```

总结一下旧版的context使用

> 1、**声明者:在顶层组建中，**a: 声明者的类型校验MessageList.childContextTypes = {}，b：调用getChildContext方法，返回定义的context对象，
>
> 2、**调用者：在子组建中，**a：调用者的类型校验 Button.contextTypes = {}，组建内部就可以拿到context属性



#### Ref 引用转发

> 这里写到的ref，主要是指的是引用转发
>
> 旧版的ref有什么问题？ 为什么要用新版的ref？ 新版的ref能解决什么问题或者说特殊用处是什么？
>
> 旧版的ref属性，放到哪个组建上，就标识该组建。弊端就是：当用到高阶组建（HOC）的时候，因为HOC的特性（wrap基础组建，即一个容器组建包裹着基础组建），ref放到了容器组建上，而不能像props那样传递给基础组建。
>
> 新版本就是解决上述问题--------ref的引用转发，具体实现见下

顺便介绍一下HOC，高阶组建

```javascript
/**
 *对需要包裹（enhanced增强功能）的基础组建 进行二次封装，实现某些公共的功能，比如打印props；
 *原则是不影响基础组建本身，只是进行扩展
 **/
const logProps = (WarppedComponent) => {
    class LogProps extends Component{
        componentWillReceiveProps(nextProps){
            console.log('preve props is : ', this.props);
            console.log('next props is : ', nextProps)
        }
        render(){
            return <WarppedComponent {...this.props} />
        }
    }
    return LogProps
}

class TestHOC extends Component{
    constructor(props){
        super(props)
    }
    render(){
        return<div>测试高阶组建=======> 基础组建==继承顶层props的数量为：<span>{this.props.count}</span></div>
    }
}

// 高阶组建，即enhanced不要放到render里去包裹！！！！
let LogTestHOC = logProps(TestHOC);
// 调用HOC的顶层组建
export class TestLogHOC extends Component{
    constructor(props){
        super(props)
        this.state={
            count: 1
        }
    }
    render(){
        return (
            <div>
                <button onClick={()=>this.click()}>改变</button>
                <LogTestHOC count={this.state.count} />
            </div>
        )
    }
    click = () => {
        this.setState({count: this.state.count+1})
    }
}
```

接下来介绍ref 引用传递

```javascript
/**
  * 如何使用引用传递：
  * 1、引用传递React.createRef()，创建一个ref赋值给顶层组建
  * 2、React.forwardRef(function(props, ref)=>{返回一个组建})，用来绑定顶层组建穿过来的ref
  * 3、ref从顶层传到基础组建用的是定义一个props属性props[forwardRef]来存储顶层的ref，用props来传递的
  */

 const inputOutoFocus = (WarppedComponent) => {
    class InputOutoFocus extends Component{
        constructor(props){
            super(props)
        }
        render(){
            let { forwardRef, ...rest } = this.props
            return <WarppedComponent ref={forwardRef} {...rest} />
        }
    }
    return React.forwardRef((props, ref)=>{
        return <InputOutoFocus forwardRef={ref} {...props} />
    })
 }

 class TestRef extends Component{
     render(){
         return<input ref='input' placeholder='自动聚焦HOC'></input>
     }
 }

 const InputOutoFocusHOC =  inputOutoFocus(TestRef);

 export class TestRefHOC extends Component{
    constructor(props){
        super(props)
        this.ref = React.createRef();
    }
    componentDidMount(){
        // 创建的ref的current属性就是wrappedComponent
        // 即React.createRef().current 就是TestRef组建
        this.ref.current.refs.input.focus()
    }
    render(){
        return <InputOutoFocusHOC forwardRef={this.ref} />
    }
 }
```



react 高级API Context相关资料

[react16.3全新API Context的发展](https://www.cnblogs.com/qiqi105/p/8881097.html)

⚠️[聊一聊我对 React Context 的理解以及应用](https://www.jianshu.com/p/eba2b76b290b)

react 16.3的Refs 和Forwarding Refs

[React16.3中的Refs和Forwarding Refs](https://blog.csdn.net/liwusen/article/details/80009968)