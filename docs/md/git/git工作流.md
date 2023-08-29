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

有时候远程的主分支merge了之后，自己又改动了本地的主分支，这个时候:
```bash
git checkout main
git fetch --all
git reset --hard origin/main
```
