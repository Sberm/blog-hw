```
" vim 退出时不清空剪贴板
autocmd VimLeave * call system("xsel -ib", getreg('+'))
noremap <S-Y> "+y<CR>
```

先安装xsel
```
yum install -y xsel
```
