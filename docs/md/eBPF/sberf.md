# Sberf开发文档

```todo
TODO: 

NUMA(bpf_get_numa_node_id) & (OFF-CPU/ePoll)

调研
	调研市面上主流的分析软件, 它们有哪些功能，它们还缺一些什么功能

栈太多爆了怎么办(现在entries只有8192个)
	方法1: So I suggest using a map-in-map array/hash map and replacing the inner map once in a while, and adding back the desired entries.You can create the new map while the old one is still being used and swap out once you are ready. Performance depends on the amount of entries to add to the new map.

可视化
	host一个服务器在后端

record时进程退出, 会出segfault

使用addr的相等来insert stack, 而不是字符串匹配

调试svg输出 字体、缩放、最短大小、动态改变长宽

events

memory

usdt

events + trace

dwarf

docker

```

user-space APIs:
* [libbpf.h](https://github.com/libbpf/libbpf/blob/master/src/libbpf.h);
```
libbpf.h很详细，相当于文档。但是比如bpf_map_update_elem, 要加个下划线, 变成bpf_map__update_elem才能搜到
```
* [bpf.h](https://github.com/libbpf/libbpf/blob/master/src/bpf.h);
* [btf.h](https://github.com/libbpf/libbpf/blob/master/src/btf.h);

BPF map type:
* [bpf.h](https://github.com/libbpf/libbpf/blob/master/include/uapi/linux/bpf.h)中

BPF-side APIs:
* [bpf_helpers.h](https://github.com/libbpf/libbpf/blob/master/src/bpf_helper_defs.h);
* [bpf_tracing.h](https://github.com/libbpf/libbpf/blob/master/src/bpf_tracing.h);
* [bpf_core_read.h](https://github.com/libbpf/libbpf/blob/master/src/bpf_core_read.h);
* [usdt.bpf.h](https://github.com/libbpf/libbpf/blob/master/src/usdt.bpf.h);
* [bpf_endian.h](https://github.com/libbpf/libbpf/blob/master/src/bpf_endian.h).

好用的BPF示例

* [bcc中的libbpf示例](https://github.com/iovisor/bcc/blob/master/libbpf-tools/execsnoop.c)

bootstrap

* [bootstrap](https://github.com/libbpf/libbpf-bootstrap/tree/master/examples/c)

---

### 本地grep路径

`/usr/include/bpf/`

---

### debug

```bash
cat /sys/kernel/debug/tracing/trace_pipe
```

---


### SEC中内容:

`/sys/kernel/debug/tracing/available_events`

`<category>:<name>` -> `SEC("tracepoint/<category>/<name>")`

通过查看 `/sys/kernel/debug/tracing/events/<category>/<name>/format` 得到可获取信息。

---

Linux页大小 `4KB`

libbpf version `1.3`

cpu 信息 `/sys/devices/system/cpu/online`

numa相关 `/sys/kernel/debug/tracing/events/sched/sched_move_numa/format`

max sample rate ` /proc/sys/kernel/perf_event_max_sample_rate`

bpf可以查看内核symbol `static long (*bpf_kallsyms_lookup_name)(const char *name, int name_sz, int flags, __u64 *res) = (void *) 179;`

```bash
perf record -F 99 -p 181 -g -- sleep 60
# -g                    enables call-graph recording
```

--- 
### Resolving address to symbol:

bcc方式 [https://github.com/iovisor/bcc/blob/6cd272189771bbc7120d9d834e2588b93d8e9cfa/src/python/bcc/__init__.py#L1586](https://github.com/iovisor/bcc/blob/6cd272189771bbc7120d9d834e2588b93d8e9cfa/src/python/bcc/__init__.py#L1586)

libbacktrace [https://github.com/ianlancetaylor/libbacktrace](https://github.com/ianlancetaylor/libbacktrace)

perf原生 [https://github.com/torvalds/linux/blob/87adedeba51a822533649b143232418b9e26d08b/tools/perf/builtin-kallsyms.c](https://github.com/torvalds/linux/blob/87adedeba51a822533649b143232418b9e26d08b/tools/perf/builtin-kallsyms.c)

cpp profiler [https://github.com/zq-david-wang/linux-tools/blob/main/perf/profiler/profiler.cpp#L152](https://github.com/zq-david-wang/linux-tools/blob/main/perf/profiler/profiler.cpp#L152)

user space `/proc/%ld/maps`

kernel `/proc/kallsyms`

---

存在的问题：

默认编译参数 `-fomit-frame-pointer`
出于优化目的，很多软件在正式编译时都会指定 -fomit-frame-pointer， 导致无法使用 frame-pointer 这种 stack walking 方式
很多系统上这都是默认选项，尤其是性能敏感的软件，例如 C 标准库、JVM。 很多时候用 frame pointer 方式展开调用栈时，会看到 unknown symbol 之类的错误，就是因为这个原因。

---
### 增加function

`bpf_program__attach_ksyscall`
`bpf_program__attach_uprobe`
`bpf_program__attach_usdt`

___

in bpf_helper_defs.h:
bpf_read_branch_records
bpf_get_task_stack
bpf_get_stack
bpf_get_current_task_btf
bpf_sys_bpf
bpf_timer_set_callback
bpf_get_func_ip
bpf_get_attach_cookie
bpf_task_pt_regs
bpf_trace_vprintk/bpf_trace_printk
bpf_tail_call
bpf_get_func_arg/bpf_get_func_ret
bpf_strncmp
bpf_get_retval
bpf_map_lookup_percpu_elem)
bpf_kptr_xchg

bpf_local_storage(not a function)

in bpf_helpers.h:
bpf_for_each

in libbpf.h:
bpf_program__attach_tracepoint

in usdt.bpf.c
BPF_USDT
___

<br/>
<br/>
<br/>
