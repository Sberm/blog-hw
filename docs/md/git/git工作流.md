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

# commit 了
# 要是不重要的话
git reset --hard origin/main
# 重要
git merge origin/main # 然后手动解决冲突
```
