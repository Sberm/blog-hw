# Sberf开发文档

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

本地grep路径

`/usr/include/bpf/`

---

debug

```bash
cat /sys/kernel/debug/tracing/trace_pipe
```

---


SEC中内容:

`/sys/kernel/debug/tracing/available_events`

`<category>:<name>` -> `SEC("tracepoint/<category>/<name>")`

通过查看 `/sys/kernel/debug/tracing/events/<category>/<name>/format` 得到可获取信息。

---

map
```c
enum bpf_map_type {
	BPF_MAP_TYPE_UNSPEC,
	BPF_MAP_TYPE_HASH,
	BPF_MAP_TYPE_ARRAY,
	BPF_MAP_TYPE_PROG_ARRAY,
	BPF_MAP_TYPE_PERF_EVENT_ARRAY,
	BPF_MAP_TYPE_PERCPU_HASH,
	BPF_MAP_TYPE_PERCPU_ARRAY,
	BPF_MAP_TYPE_STACK_TRACE,
	BPF_MAP_TYPE_CGROUP_ARRAY,
	BPF_MAP_TYPE_LRU_HASH,
	BPF_MAP_TYPE_LRU_PERCPU_HASH,
	BPF_MAP_TYPE_LPM_TRIE,
	BPF_MAP_TYPE_ARRAY_OF_MAPS,
	BPF_MAP_TYPE_HASH_OF_MAPS,
	BPF_MAP_TYPE_DEVMAP,
	BPF_MAP_TYPE_SOCKMAP,
	BPF_MAP_TYPE_CPUMAP,
	BPF_MAP_TYPE_XSKMAP,
	BPF_MAP_TYPE_SOCKHASH,
	BPF_MAP_TYPE_CGROUP_STORAGE_DEPRECATED,
	/* BPF_MAP_TYPE_CGROUP_STORAGE is available to bpf programs attaching
	 * to a cgroup. The newer BPF_MAP_TYPE_CGRP_STORAGE is available to
	 * both cgroup-attached and other progs and supports all functionality
	 * provided by BPF_MAP_TYPE_CGROUP_STORAGE. So mark
	 * BPF_MAP_TYPE_CGROUP_STORAGE deprecated.
	 */
	BPF_MAP_TYPE_CGROUP_STORAGE = BPF_MAP_TYPE_CGROUP_STORAGE_DEPRECATED,
	BPF_MAP_TYPE_REUSEPORT_SOCKARRAY,
	BPF_MAP_TYPE_PERCPU_CGROUP_STORAGE_DEPRECATED,
	/* BPF_MAP_TYPE_PERCPU_CGROUP_STORAGE is available to bpf programs
	 * attaching to a cgroup. The new mechanism (BPF_MAP_TYPE_CGRP_STORAGE +
	 * local percpu kptr) supports all BPF_MAP_TYPE_PERCPU_CGROUP_STORAGE
	 * functionality and more. So mark * BPF_MAP_TYPE_PERCPU_CGROUP_STORAGE
	 * deprecated.
	 */
	BPF_MAP_TYPE_PERCPU_CGROUP_STORAGE = BPF_MAP_TYPE_PERCPU_CGROUP_STORAGE_DEPRECATED,
	BPF_MAP_TYPE_QUEUE,
	BPF_MAP_TYPE_STACK,
	BPF_MAP_TYPE_SK_STORAGE,
	BPF_MAP_TYPE_DEVMAP_HASH,
	BPF_MAP_TYPE_STRUCT_OPS,
	BPF_MAP_TYPE_RINGBUF,
	BPF_MAP_TYPE_INODE_STORAGE,
	BPF_MAP_TYPE_TASK_STORAGE,
	BPF_MAP_TYPE_BLOOM_FILTER,
	BPF_MAP_TYPE_USER_RINGBUF,
	BPF_MAP_TYPE_CGRP_STORAGE,
};
```

Linux页大小 `4KB`

libbpf version `1.3`

cpu 信息 `/sys/devices/system/cpu/online`

<br/>
<br/>
<br/>
