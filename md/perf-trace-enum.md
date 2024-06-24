# perf trace: Add support for enum arguments

`perf trace` now supports pretty printing for enum arguments

Well, that been said, there is only one argument that can be pretty printed, which is `enum landlock_rule_type rule_type` from syscall `landlock_add_rule`.

Here is `perf trace` before:
```bash
perf $ ./perf trace -e landlock_add_rule
     0.000 ( 0.008 ms): ldlck-test/438194 landlock_add_rule(rule_type: 2)                                       = -1 EBADFD (File descriptor in bad state)
     0.010 ( 0.001 ms): ldlck-test/438194 landlock_add_rule(rule_type: 1)                                       = -1 EBADFD (File descriptor in bad state)
```

Just a number, kinda hard to understand for non-experts.

And this is `perf trace` with `enum landlock_rule_type` pretty printing:
```bash
perf $ ./perf trace -e landlock_add_rule
     0.000 ( 0.029 ms): ldlck-test/438194 landlock_add_rule(rule_type: LANDLOCK_RULE_NET_PORT)                  = -1 EBADFD (File descriptor in bad state)
     0.036 ( 0.004 ms): ldlck-test/438194 landlock_add_rule(rule_type: LANDLOCK_RULE_PATH_BENEATH)              = -1 EBADFD (File descriptor in bad state)
```

I would say it's much better. :)

Non-syscall tracepoints are supported too.

```bash
perf $ ./perf trace -e timer:hrtimer_start --max-events=1
     0.000 :0/0 timer:hrtimer_start(hrtimer: 0xffff974466d25f18, function: 0xffffffff89da5be0, expires: 488283834504945, softexpires: 488283834504945, mode: HRTIMER_MODE_ABS_PINNED_HARD)
```

You can use enum names, instead of plain integer number to do the filtering as well

```bash
perf $ ./perf trace -e timer:hrtimer_start --filter='mode != HRTIMER_MODE_ABS_PINNED_HARD && mode != HRTIMER_MODE_ABS' --max-events=1
     0.000 Hyprland/534 timer:hrtimer_start(hrtimer: 0xffff9497801a84d0, function: 0xffffffffc04cdbe0, expires: 12639434638458, softexpires: 12639433638458, mode: HRTIMER_MODE_REL)
```

Please try `perf trace`, see if you like it!
