## find + grep/ripgrep
```bash
find . -regex './arch/.*/include/uapi/asm/unistd.h' | xargs grep --color=auto 'include <asm'
```

ripgrep
```bash
find . -regex './tools/perf/.*' | xargs rg EPOLLIN
```
