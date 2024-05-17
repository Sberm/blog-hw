# Sberf开发文档

## BUG
./sberf record -f 10000 -a 卡住
多个进程，dso导入的位置重合(都是虚存)

```todo

TODO:

c & t

内存

锁

实时

负载

benchmark




**GRANDIOSE TODO: 

File I/O

可视化 host一个服务器在后端

memory

usdt

events + trace

dwarf

docker

支持rust

android性能分析(?)

opentelemetry

gpu(?)

Specifically, we aim to enable the export of performance data to formats such as Firefox's Gecko profile format and Chrome's trace event format,

tracelog(锁时间) / trace compass支持

malloc support

32进制ELF文件

NUMA(bpf_get_numa_node_id) & (OFF-CPU/ePoll)





```

```
https://bugzilla.kernel.org/show_bug.cgi?id=207323
> Naturally I went to my standby for profiling, perf. I found some stuff, and I
> fixed it all, and surprise surprise the numbers didn’t change. Clearly there
> was some blocking going on that was affecting the frames. Could the
> flamegraph tools for perf highlight this issue for me?

>
> No.

>
> An average Monday in the life of a zink developer.

>
> New tools would be needed to figure out what’s going on here.

>
> Do such tools already exist? Maybe. Post in the comments if you have tools
> you use for this type of thing.
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
- bpf_read_branch_records
- bpf_get_task_stack
- bpf_get_stack
- bpf_get_current_task_btf
- bpf_sys_bpf
- bpf_timer_set_callback
- bpf_get_func_ip
- bpf_get_attach_cookie
- bpf_task_pt_regs
- bpf_trace_vprintk/bpf_trace_printk
- bpf_tail_call
- bpf_get_func_arg/bpf_get_func_ret
- bpf_strncmp
- bpf_get_retval
- bpf_map_lookup_percpu_elem)
- bpf_kptr_xchg

- bpf_local_storage(not a function)

in bpf_helpers.h:
- bpf_for_each

in libbpf.h:
- bpf_program__attach_tracepoint
- libbpf_num_possible_cpus

in usdt.bpf.c
- BPF_USDT

in a lot of bcc's example:
- uapi/linux/ptrace.h

good macro:

- BPF_KPROBE
___
```c
int BPF_KPROBE(malloc_enter, size_t size)
{
    return gen_alloc_enter(size);
}
```

btf

SEC("tp_btf/sys_enter")
___

### sberf related
```bash
./sberf record -t "sched:sched_process_exit"
```

### 笔记

```
eBPF没有锁，可以用map来作为eBPF的锁，因为map同时只能由一个cpu访问

```

https://github.com/iovisor/bcc/blob/master/libbpf-tools/trace_helpers.c#L1214
```c
bool probe_tp_btf(const char *name)
{
	LIBBPF_OPTS(bpf_prog_load_opts, opts, .expected_attach_type = BPF_TRACE_RAW_TP);
	struct bpf_insn insns[] = {
		{ .code = BPF_ALU64 | BPF_MOV | BPF_K, .dst_reg = BPF_REG_0, .imm = 0 },
		{ .code = BPF_JMP | BPF_EXIT },
	};
	int fd, insn_cnt = sizeof(insns) / sizeof(struct bpf_insn);

	opts.attach_btf_id = libbpf_find_vmlinux_btf_id(name, BPF_TRACE_RAW_TP);
	fd = bpf_prog_load(BPF_PROG_TYPE_TRACING, NULL, "GPL", insns, insn_cnt, &opts);
	if (fd >= 0)
		close(fd);
	return fd >= 0;
}
```
`LIBBPF_OPTS`


```c
#define DEBUGFS "/sys/kernel/debug/tracing"
#define TRACEFS "/sys/kernel/tracing"

	return use_debugfs() ? DEBUGFS"/available_filter_functions" :
			       TRACEFS"/available_filter_functions";

/sys/kernel/debug/kprobes/blacklist
/sys/kernel/debug/kprobes/list: 列出内核中已经设置kprobe断点的函数

/sys/kernel/debug/kprobes/enabled: kprobe开启/关闭开关

/sys/kernel/debug/kprobes/blacklist: kprobe黑名单（无法设置断点函数）

/proc/sys/debug/kprobes-optimization: Turn kprobes optimization ON/OFF.
```


可以看到这里多了几行，后面去读取的什么.debug文件里的东西是什么？注意到后面有个build-id，好像perf中也有和这个相关的功能，我们不妨来看看build-id是什么：buildid是一个用于标识可执行文件和共享库的唯一标识符。它是由编译器在编译时生成的，通常包含在ELF格式的可执行文件和共享库中。buildid可以用来识别不同版本的程序，以及检查程序是否被篡改过。在调试时，它还可以用来定位程序崩溃的原因。我们用file查看负载文件信息：
可以看出来，当源目录和$HOME/.debug/.build-id目录下不存在时，perf script还会去找/usr/lob/debug下的一些文件，尝试去寻找到源文件，或者说源文件对应的debug信息。
至此，我们可以得出一个结论：perf script需要依赖源文件的信息进行解析，首先会去寻找源目录下的文件，当找不到时会去寻找$HOME/.debug目录下的文件，最后会去/usr/lib下的信息，当都找不到时，perf script会解析成[unknown]

from: [link](https://blog.csdn.net/weixin_43079395/article/details/131271547)

valgrind, heap profiler: https://valgrind.org/docs/manual/ms-manual.html

a man's word on memleak & memory usage: https://github.com/netdata/netdata/issues/8112

插桩和多参数: https://www.cnxct.com/using-ebpf-kprobe-to-file-notify/#ftoc-heading-2

ebpf的文件系统: https://ebpf.io/blog/ebpf-updates-2021-01/#did-you-know-ebpf-virtual-filesystem

ebpf lifetime: https://facebookmicrosites.github.io/bpf/blog/2018/08/31/object-lifetime.html

试下 
```c
	stack_id = bpf_get_stackid(ctx, &stacks,
				   BPF_F_FAST_STACK_CMP | BPF_F_USER_STACK);

```

Map In Map

eBPF 提供了两种特殊的 Map 类型，BPF_MAP_TYPE_ARRAY_OF_MAPS 和 BPF_MAP_TYPE_HASH_OF_MAPS，实现了 map-in-map，也就是 eBPF Map 中每一个 entry 的 Value 也是一个 Map

bpf.attach_uprobe(name="pthread", sym="pthread_mutex_init", fn_name="probe_mutex_init", pid=pid)
bpf.attach_uprobe(name="pthread", sym="pthread_mutex_lock", fn_name="probe_mutex_lock", pid=pid)
bpf.attach_uretprobe(name="pthread", sym="pthread_mutex_lock", fn_name="probe_mutex_lock_return", pid=pid)
bpf.attach_uprobe(name="pthread", sym="pthread_mutex_unlock", fn_name="probe_mutex_unlock", pid=pid)


白学了 sched_switch
```
# centos
/usr/src/kernels/4.18.0-348.7.1.el8_5.x86_64/include/trace/events/sched.h

# arch
/usr/lib/modules/6.8.4-arch1-1/build/include/trace/events/sched.h
```

如果某个cpu忙应该看到什么现象, 我们可以去获取cpu runqueue的长度

如果我们已经有了cpu视角和task视角, 我们看到大量cpu idle而只有某个task在跑, 那么一种合理的推测是该task是否阻塞其他task了 调试其实就是把很多现象关联起来, 也就是说孤立地去看一种现象往往收获不大. 一般来说我们可以通过时间轴把这些事件关联起来, 从资源的角度(比如每个cpu的在任意时间的使用情况), 从消费者的角度(比如每个进程的运行状态/路径)

如果某个cpu忙其他cpu闲会有什么现象, 以每个cpu为视角, 通过时间轴把所有的cpu关联起来, 使用不同的颜色表示runqueue的长度, 这样生成的图可以很容易看出migration是否及时, 这样的资源利用图是非常有必要的, 有点类似htop, 但是更加精细

## 自动补全

perf自动补全在/etc/bash_completion.d/perf

___

<br/>
<br/>
<br/>
