# perf trace: Add support for enum arguments

`perf trace` now supports pretty printing for enum arguments

Well, that been said, there is only one argument that can be pretty printed in all syscalls, which is `enum landlock_rule_type rule_type` from syscall `landlock_add_rule`.

This feature is implemented using the BPF Type Format.

Here is `perf trace` before:
```bash
perf $ ./perf trace -e landlock_add_rule
     0.000 ( 0.008 ms): ldlck-test/438194 landlock_add_rule(rule_type: 2)                                       = -1 EBADFD (File descriptor in bad state)
     0.010 ( 0.001 ms): ldlck-test/438194 landlock_add_rule(rule_type: 1)                                       = -1 EBADFD (File descriptor in bad state)
```

Just a number (`rule_type: 1`), kinda hard to understand if you don't look up syscall arguments.

And this is `perf trace` with `enum landlock_rule_type` pretty printing:
```bash
perf $ ./perf trace -e landlock_add_rule
     0.000 ( 0.029 ms): ldlck-test/438194 landlock_add_rule(rule_type: LANDLOCK_RULE_NET_PORT)                  = -1 EBADFD (File descriptor in bad state)
     0.036 ( 0.004 ms): ldlck-test/438194 landlock_add_rule(rule_type: LANDLOCK_RULE_PATH_BENEATH)              = -1 EBADFD (File descriptor in bad state)
```

I would say it's much better. :)

Non-syscall tracepoints are supported as well.

here's the output:

```bash
perf $ ./perf trace -e timer:hrtimer_start --max-events=1
     0.000 :0/0 timer:hrtimer_start(hrtimer: 0xffff974466d25f18, function: 0xffffffff89da5be0, expires: 488283834504945, softexpires: 488283834504945, mode: HRTIMER_MODE_ABS_PINNED_HARD)
```

we got `mode: HRTIMER_MODE_ABS_PINNED_HARD` instead of `mode: 10`

```c
acme@number:~$ pahole --contains_enumerator=HRTIMER_MODE_ABS_PINNED_HARD | grep -E '([{}]|HRTIMER_MODE_ABS_PINNED_HARD)'
enum hrtimer_mode {
	HRTIMER_MODE_ABS_PINNED_HARD = 10,
}
```

You can use enum names, instead of plain integers to do the filtering of events.

instead of using `--filter` options like this:

`--filter='mode != 10 && mode != 0'`

we can use `--filter` option like this: 

`--filter='mode != HRTIMER_MODE_ABS_PINNED_HARD && mode != HRTIMER_MODE_ABS'`

```bash
perf $ ./perf trace -e timer:hrtimer_start --filter='mode != HRTIMER_MODE_ABS_PINNED_HARD && mode != HRTIMER_MODE_ABS' --max-events=1
     0.000 Hyprland/534 timer:hrtimer_start(hrtimer: 0xffff9497801a84d0, function: 0xffffffffc04cdbe0, expires: 12639434638458, softexpires: 12639433638458, mode: HRTIMER_MODE_REL)
```

That's all, thank you.
