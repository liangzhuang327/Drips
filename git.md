## git 命令

`git branch`

`git checkout`

`git log`


### Git命令解析以及适用场景
[git官网](https://git-scm.com/docs)

[看过这篇官网的解释](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E9%87%8D%E7%BD%AE%E6%8F%AD%E5%AF%86#r_git_reset)，你会对市面上所有的以前你认为解释git很牛逼的博客发出几声“呵呵”。我就敢这么打保票，只要你仔细看了，原理+操作都会明白的(我第一遍看了一个小时)









#### 1、本地基于master分支新建一个分支，并将分支推至远程

方案1(百度到的方案):
> 1、git checkout -b newBranch 

> 2、git push --set-upstream origin newBranch

第一步就是新建一个newBranch的分支并切换到此分支；第二步就是将本地分支newBranch推送到远程newBranch并将远程分支newBranch和本地分支newBranch做关联，以保证以后每次的push和pull都基于该分支来操作

方案2:
> 1、git checkout -b newBranch 

> 2、git push 


使用git在本地新建一个分支后，需要做远程分支关联。如果没有关联，git会在下面的操作中提示你显示的添
加关联。关联目的是在执行git pull, git push操作时就不需要指定对应的远程分支，你只要没有显示指定
git push的时候，就会提示你git push --set-upstream origin you_remote_branch，只需按照此
操作提交即可；
此示例子即：git push --set-upstram origin newBranch

问题1:如何查看当前项目的所有本地分支对应的远程分支是哪些？

> `git branch -vv`

输出信息如下
<i>
user$ git br -vv
  master        95bd2da [origin/master: behind 9] xxxxx
  patch         a96b0e3 [origin/patch: behind 2] undefined
  release       2cf1522 [origin/release: behind 7] Update .gitlab-ci.yml
  release-patch 8c21087 [origin/release-patch] xxx filter all wareh
  releaseitg    2bff21c [origin/releaseitg: behind 26]</i>

本地分支master 对应的远程分支是origin/master

问题2: 如果我想两个分支A/B都链接远程分支的C分支怎么办？

> `git branch --set-upstream-to=origin/remote_branch your_local_branch`

`--set-upstream-to=origin/remote_branch your_local_branch`此参数就是将
your_local_branch与origin/remote_branch做关联，即将指定远程分支与指定本地分支做关联;查看是否关联成功即用`git branch -vv`命令查看即可，或者用bash命令`vim .git/config`查看

#### 2、如何提交代码和回滚代码？

1、提交代码(本地分支远程分支已链接,未链接情况git push命令会有提示：git push --set-upstream orgin/your_branch)

> 1、`git add` : `git add .`将所有工作区改动提交至暂存区,`git add [file path]`暂存单个文件

> 2、`git commit -m msg` 将暂存区内容提交到本地仓库

> 3、`git push` 将本地仓库的commit提交到远程仓库

2、回滚代码

> 1、回滚工作区代码：最简单直接就是删除改动(借助vscode);或者使用`git chekout -- filename`

> 2、回滚暂存区代码(暂存区 => 工作区)／撤销git add：`get reset -q HEAD -- <file path>`

> 3、回滚本地仓库代码(本地仓 => 暂存区/工作区(--soft/--mixed))／撤销git commit：`git reset HEAD^`/ `git reset commitID`(commitID具体的回滚到哪个commit)

> 4、回滚远程仓库代码(远程仓库 => 本地): `git revert commitID`(单纯撤销某一次远程提交，该提交的后续
> 提交依然保持)；`git reset --hard commitID 和 git push -f`两个命令配合使用(撤销某次远程提交之后所
> 有的代码)

[关于HEAD^和HEAD~的区别](https://blog.csdn.net/albertsh/article/details/106448035),不想深入了解的就直接用commitID也是可以的

#### 3、在本地删除远程仓库文件或者文件夹？
	:和正常提交文件一样，只是先在本地删除，再提价到远程即可
	删除文件：git rm xx.jsx; 删除文件夹以及下边的文件：git rm -r xx文件夹