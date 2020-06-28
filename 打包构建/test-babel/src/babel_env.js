/**
 * @babel/preset-env
 * 此预设只能转译 es6的syntax:比如let/const/class;
 * 
 * 而对于API或者静态方法，比如：WeakMap/Array.prototye.includes/Object.assing/Promise等是没有处理的
 *
*/

let arr = [1,3,4,5,6];
arr.includes(4);
const map = new WeakMap()
let newObj = Object.assign({}, {name: 'hello', value: 'world'});
let hasStr = 'hello world'.includes('wor');
new Promise(resolve=>{
    resolve(1)
})

class A {
    constructor(){
        this.state = {}
    }
    init(){
        console.log('initing')
    }
}