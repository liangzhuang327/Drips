#### Description:当前产品用的是react框架，需要引入高德地图，高德官方示例最适合jq来写，故引入了react-amap包，来完美适用react

> 1、（events）为了使react-amap和高德原生api来完美切合，做到通用，react-amap提供了一个新的事件，挂在到events事件上
>
> **支持通过配置`events`属性给地图绑定事件；除了[高德原生提供的事件](http://lbs.amap.com/api/javascript-api/reference/map)外，我们扩展了`created`事件。**
>
> **`events.created` 在地图实例创建成功后调用，传入参数就是地图实例。你可以在这里获得实例并进行操作**
>
> ```javascript
> const allEvents = {
>     created: (ins)=>{
>         // 当react-amap实例创建成功后调用
>         // ins就是该组件的实例，有了该参数，就可以完美调用高德原生的任何api
>         // 如果react-amap中无法或者没实现的功能，都可以通过该桥梁（ins）来调用原生的api
>         console.log(ins) 
>     }
> }
> <Map events={allEvents}/>
> ```



> 2、**用react-amap做电子栅栏**
>
> ```javascript
> import { Map, Polygon, Polyline, PolyEditor } from 'react-amap';
> 
> class App extends React.Component{
>   constructor() {
>     super();
>     this.state = {
>       lineActive: true,
>       polygonActive: true,
>     };
>     this.editorEvents = {
>       created: (ins) => {
>           console.log(ins)
>           this.editorInstance = ins // 缓存该实例对象
>       },
>       addnode: (obj) => {console.log('polyeditor addnode')},
>       adjust: (obj) => {console.log('polyeditor adjust')},
>       removenode: (obj) => {console.log('polyeditor removenode')},
>       end: (obj) => {
>           console.log('polyeditor end')
>           let { type, target} = obj
>           // 在调用close方法时，触发该事件，target即为编辑后的折线/多边形实例
>           // dosomething  code
>           
>       },
>     };
>     this.linePath = [
>       {longitude: 150, latitude: 20 },
>       {longitude: 170, latitude: 20 },
>       {longitude: 150, latitude: 30 },
>     ];
>     this.polygonPath = [
>       {longitude: 120, latitude: 30 },
>       {longitude: 130, latitude: 30 },
>       {longitude: 120, latitude: 40 },
>     ];
>     this.mapCenter = {longitude: 145, latitude: 30 }
>   }
>     // 关闭围栏
>     closeClick = () => {
>         this.editorInstance.close()
>     }
>   render(){
>     return <div>
>       <div style={{width: '100%', height: '370px'}}>
>         <Map zoom={3} center={this.mapCenter}>
>           <Polygon path={this.polygonPath}>
>             <PolyEditor active={true} events={this.editorEvents} />
>           </Polygon>
>         </Map>
>       </div>
> 	  <button onClick={this.closeClick}>手动关闭电子围栏</button>
>     </div>
>   }
> }
> ```
>
> 如上例代码，挂载到events上的方法，在不同的的事件下触发，除了created之外，其默认的参数就是包含编辑之后的实例对象（可调用高德原生api）；
>
> 另外在说一下end的调用：当我们手动关闭电子围栏的时候，我们调用该实例（this.editorInstance)的close方法，即关闭该实例，此时就会调用挂载到events上的end方法，并把关闭时候的（经过操作，编辑）实例当作参数传给end；简单阐述：react-amp封装了实例的close方法，在原生的close方法里传入了callback（end）