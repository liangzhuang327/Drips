一、 for循环
1、
数组中的索引是假的，在js数组中不能叫做索引，只能叫做“下标“;
var arr_t = [];
arr_t[0]='a'
arr_t[100]='b'
arr_t[10000]='c'
打印arr_t的结果是：
    (10001) ["a", empty × 99, "b", empty × 9899, "c"];
    arr_t的length是10001
for循环这个数组，就会循环10001次，而用forEach就只会循环3次


二、forEach循环
1、
forEach对数组进行循环的时候，在第一次调用callback的时候，数组的 范围就已经确定，
即在forEach的过程中，不能往数组中添加(push)元素，却能都操作数组中还没有遍历到(未来)的元素（改变值，删除pop()）;
总结：不能push，能够操作还未遍历到的元素
2、
总结：不能return ，continue，break操作
    