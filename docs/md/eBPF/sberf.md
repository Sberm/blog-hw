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

Linux页大小 `4KB`

libbpf version `1.3`

cpu 信息 `/sys/devices/system/cpu/online`

numa相关 `/sys/kernel/debug/tracing/events/sched/sched_move_numa/format`

<br/>
<br/>
<br/>
