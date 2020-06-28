// import("babel-polyfill");
import { a } from '../source.js'
let ttt = a;

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