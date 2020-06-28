
// 因为没有使用webpack,怎么样才能实现cjs规范，把@babel/polyfill模块引入此文件？


import "babel-polyfill";

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

// console.log("define: ", define);
console.log("fill: ", Array.prototype.fill);

// console.log('./node_modules/core-js/modules/_an-object.js', isObject)
console.log('./node_modules/core-js/modules/_array-from-iterable.js', forOf)

console.log("./src/polyfill.js", __webpack_require__.r)