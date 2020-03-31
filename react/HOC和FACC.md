HOC: high-order-component 高阶组建
FACC: function-as-child-component 函数做为子组建

### 两种模式的输入和输出
**HOC:** HOC接受一个组建，输出一个被增强功能的组建；
**FACC:** FACC本身没有输入，输出是一个组建并且将所有此组建下的子组建放到一个函数里，函数的参数就是FACC与子组建的唯一联系通道

### 两种模式的实现细节
**HOC**主要利用了**组建props由上向下传递**的特性，对组建进行了二次封装。对组建本身增加了一层控制点，可以对props进行改造以及利用props进行控制子组建的状态（展现形式／展现与否）最经典的例子就是react-redux
```js
/**
 * connect就可以认为是HOC,对基础组建Component进行二次封装，将redux中的state／dispatch合并到传入
 * Component组建的props中；这里connect是一个更高级HOC,不仅实现了HOC的基础功能，为了性能优化，还接
 * 受mapStateToProps这些参数，给业务暴露出了接口决定自己组建里需要哪些redux中的状态，而不是一股脑
 * 的仍到Component的props上
*/
export default connect(mapStateToProps,mapDispatchToProps)(Component);
```
**FACC** **是根据react的React.createElement技术方案实现的**，FACC是不需要输入自己生成一个组建，并将所有FACC内部的组建／节点／文本放到一个函数作用域中，此函数的参数就是FACC的产出，以及子组建所需要的全部条件
```js
// FACC
class MyComponent extends React.Component{   
  render() {  
    return (  
        <div>
          {this.props.children('Scuba Steve')}
        </div>
    );  
  }  
}

MyComponent.propTypes = {  
  children: React.PropTypes.func.isRequired,  
};
/**
* 这里差一句，React.PropTypes已经在15.57（好像是这个版本）拆除来了，单独使用需要自己安装prop-types依赖，
import propTypes from 'prop-types';
MyComponent.propTypes = {  
  children: propTypes.func.isRequired,  
};
还有一点：在es7中增加了static新属性，可以这么写：
class Component extends React.Component{
  static propTyeps = {
    children: propTypes.func.isRequired, 
  }
}
*/

// 调用FACC的地方
<MyComponent> 
    (name)=>{
        <ChildComponent title={name}/>
        <ChildComponent1 titleCopy={name}/>
    }
</MyComponent>

// 经过babel解析jsx语法之后
React.createElement({
    'div',
    {},
    (name)=>{
        React.createElement({
            ChildComponent,
            {title: name},
            null
        })
        React.createElement({
            ChildComponent1,
            {titleCopy: name},
            null
        })
    }
    })
```
### 两种模式的比较
1、耦合性：两种模式都实现了对组建的增强，只是HOC对被增强组建的“干扰”力度要大，耦合性要高，入侵了被增强组建本身（props/展现）；而FACC只是将被增强组建所可能需要的条件都暴露在函数的参数中，供被增强组建自身使用，耦合性要必HOC低；
2、实用性：也正是HOC的耦合性相对FACC比较高，对同一类的HOC使用方便，业务方不太关系HOC内部的实现，代码书写方便易读，但FACC书写起来比较麻烦，并且语法相对于jsx来说可读性比较差
3、灵活性：HOC因为完全不干预被增强组建，所以更灵活，对开发更友好；

总结：使用过程中可以自行根据实际情况来决定使用哪种组建增强模式，网上关于这两种模式谁好谁坏很激烈，但都是仁者见仁，智者见智。看的多了，就能在自己用的时候找出最适合的那种方案