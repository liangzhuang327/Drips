### Git命令解析以及适用场景
[git官网](https://git-scm.com/docs)

---
#### 1、git reset
> [看过这篇官网的解释](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E9%87%8D%E7%BD%AE%E6%8F%AD%E5%AF%86#r_git_reset)，你会对市面上所有的以前你认为解释git很牛逼的博客发出几声“呵呵”。我就敢这么打保票，只要你仔细看了，原理+操作都会明白的(我第一遍看了一个小时)
1、git reset 不加参数(**取消暂存，用来对执行过 git add 命令的文件取消暂存**)：只代表将暂存区域文件恢复到工作区
> git reset read.txt :将暂存区中read.txt改动恢复到工作区
> git reset -- :将暂存区中的所有改动恢复到工作区

---
2、





### 其他场景
1、在本地删除远程仓库文件或者文件夹？
	:和正常提交文件一样，只是先在本地删除，再提价到远程即可
	删除文件：git rm xx.jsx; 删除文件夹以及下边的文件：git rm -r xx文件夹