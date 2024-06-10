# perf trace: Add support for enum arguments

`perf trace` now supports pretty printing for enum arguments

Well, that been said, there is only one argument that can be pretty printed, which is `enum landlock_rule_type rule_type` from syscall `landlock_add_rule`.

Here is `perf trace` before:
```bash
```

And this is `perf trace` with `enum landlock_rule_type` pretty printing:
```bash
```
