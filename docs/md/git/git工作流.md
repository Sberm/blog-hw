feature branch
> checkout before editing, multiple commit, pull(or rebase) before push
```bash
# Start a new feature
git checkout -b new-feature main
# Edit some files
git add <file>
git commit -m "Start a feature"
# Edit some files
git add <file>
git commit -m "Finish a feature"

# before push, if feature has new changes
git rebase # (if nobody but me is working on this feature)
git pull # (if multiple people are working on this feature)

# push
git push origin <BRANCH_NAME>
```

选择不同ref pointer和跳转
```bash
# 查看所有ref
git reflog

# 切换
git checkout <ref> # 未commit
git reset <ref> # 无history
git revert <ref> # 有history
```

有时候远程的主分支merge了之后，自己又改动了本地的主分支，如果要覆盖本地分支，这个时候:
```bash
git checkout main
git fetch --all
git reset --hard origin/main
```

本地删除远程分支中已删除的分支
```bash
git remote prune origin
```

查看分支
```bash
# 查看本地分支
git branch

# 查远程分支
git branch -r

# 查看所有分支
git branch -a
```

查看远程分支log
```bash
git log origin/main # 使用/而不是空格
```

git pull冲突办法
```bash
# 还没commit
git stash push # 存起来
git stash pop # 取出存储, 然后手动解决冲突
git stash drop # 删除用过的stash

# commit 了
# 要是不重要的话
git reset --hard origin/main
# 重要
git merge origin/main # 然后手动解决冲突
```

git revert HEAD revert最后一次commit. 如果是revert某一次的commit，git revert不会顺带revert这之后的每一个commit，而是只revert这一次。范围revert要使用 <ref1>...<ref2>

git checkout <ref> 也需要注意，因为进入detached head state, commit将会丢失，不会存储在当前的branch内，如果需要回退到这个commit并发展，使用这个commit新建一个branch再进行工作。detached head state的文章[ref](https://circleci.com/blog/git-detached-head-state/)


## 删除大文件

> 不要传视频，不要commit大文件，不要用很大的gif，能用就用照片。

```bash
# SHA查看文件名
git rev-list --objects --all | grep af3e90f1893c3ebf747073b8539aa0cea9d23949
# 查看idx文件，包括其中的blob大小
git verify-pack -v .git/objects/pack/pack-978e03944f5c581011e6998cd0e9e30000905586.idx

## 其他
# 使用BFG Repo-Cleaner清理过去上传过的大文件，非常好用
# git，不愧是你 - 2023-10-30 1:05 am

## references:
# https://git-scm.com/book/en/v2/Git-Internals-Packfiles
# https://stackoverflow.com/questions/11050265/remove-large-pack-file-created-by-git
# https://git-scm.com/docs/git-filter-branch
# https://stackoverflow.com/questions/460331/git-finding-a-filename-from-a-sha1
```
