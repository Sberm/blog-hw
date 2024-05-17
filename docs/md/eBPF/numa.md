## NUMA分析

sberf安装方法
```
wget https://github.com/Sberm/sberf/releases/download/0.0.5/sberf
curl -O https://github.com/Sberm/sberf/releases/download/0.0.5/sberf

chmod +x sberf
```

命令:
```
# 所有进程的NUMA事件
sudo ./sberf record -t "sched:sched_swap_numa,sched:sched_stick_numa,sched:sched_move_numa" -a
# 指定pid
sudo ./sberf record -t "sched:sched_swap_numa,sched:sched_stick_numa,sched:sched_move_numa" -p 1001
# 指定多个pid
sudo ./sberf record -t "sched:sched_swap_numa,sched:sched_stick_numa,sched:sched_move_numa" -p 1001,12291,2901
```

2023年10月的patch, 新增事件sched_skip_vma_numa

由于各种原因，NUMA 平衡会跳过或扫描 VMA。在准备
完成对 VMA 的扫描（无论 PID 访问情况如何）时，应跟踪 VMA 被跳过的原因。

```c
TRACE_EVENT(sched_skip_vma_numa,

	TP_PROTO(struct mm_struct *mm, struct vm_area_struct *vma,
		 enum numa_vmaskip_reason reason),

	TP_ARGS(mm, vma, reason),

	TP_STRUCT__entry(
		__field(unsigned long, numa_scan_offset)
		__field(unsigned long, vm_start)
		__field(unsigned long, vm_end)
		__field(enum numa_vmaskip_reason, reason)
	),

	TP_fast_assign(
		__entry->numa_scan_offset	= mm->numa_scan_offset;
		__entry->vm_start		= vma->vm_start;
		__entry->vm_end			= vma->vm_end;
		__entry->reason			= reason;
	),

	TP_printk("numa_scan_offset=%lX vm_start=%lX vm_end=%lX reason=%s",
		  __entry->numa_scan_offset,
		  __entry->vm_start,
		  __entry->vm_end,
		  __print_symbolic(__entry->reason, NUMAB_SKIP_REASON))
);
#endif /* CONFIG_NUMA_BALANCING */

```

```txt
NUMA事件:
 o trace_sched_move_numa	当一个任务被移动到一个节点时
 o trace_sched_swap_numa	当一个任务与另一个任务交换时
 o trace_sched_stick_numa	当与 numa 相关的迁移失败时

跟踪点允许对 NUMA 调度器活动进行监控，并可得出以下高级指标

 o NUMA migrated stuck	 nr trace_sched_stick_numa
 o NUMA migrated idle	 nr trace_sched_move_numa
 o NUMA migrated swapped nr trace_sched_swap_numa
 o NUMA local swapped	 trace_sched_swap_numa src_nid == dst_nid (永远不应该发生)
 o NUMA remote swapped	 trace_sched_swap_numa src_nid != dst_nid (应该 == NUMA migrated swapped)
 o NUMA group swapped	 trace_sched_swap_numa src_ngid == dst_ngid
		少量这样的情况可以接受
		但如果数量过多，就会很糟。
		如果跳转频繁，情况会更糟。
 o NUMA avg task migs.	 任务迁移的平均次数
 o NUMA stddev task mig	 如名
 o NUMA max task migs.	 单个任务的最大迁移次数
```

```
NUMA事件的格式:

name: sched_swap_numa
ID: 313
format:
	field:unsigned short common_type;	offset:0;	size:2;	signed:0;
	field:unsigned char common_flags;	offset:2;	size:1;	signed:0;
	field:unsigned char common_preempt_count;	offset:3;	size:1;	signed:0;
	field:int common_pid;	offset:4;	size:4;	signed:1;

	field:pid_t src_pid;	offset:8;	size:4;	signed:1;
	field:pid_t src_tgid;	offset:12;	size:4;	signed:1;
	field:pid_t src_ngid;	offset:16;	size:4;	signed:1;
	field:int src_cpu;	offset:20;	size:4;	signed:1;
	field:int src_nid;	offset:24;	size:4;	signed:1;
	field:pid_t dst_pid;	offset:28;	size:4;	signed:1;
	field:pid_t dst_tgid;	offset:32;	size:4;	signed:1;
	field:pid_t dst_ngid;	offset:36;	size:4;	signed:1;
	field:int dst_cpu;	offset:40;	size:4;	signed:1;
	field:int dst_nid;	offset:44;	size:4;	signed:1;

print fmt: "src_pid=%d src_tgid=%d src_ngid=%d src_cpu=%d src_nid=%d dst_pid=%d dst_tgid=%d dst_ngid=%d dst_cpu=%d dst_nid=%d", REC->src_pid, REC->src_tgid, REC->src_ngid, REC->src_cpu, REC->src_nid, REC->dst_pid, REC->dst_tgid, REC->dst_ngid, REC->dst_cpu, REC->dst_nid

name: sched_move_numa
ID: 315
format:
	field:unsigned short common_type;	offset:0;	size:2;	signed:0;
	field:unsigned char common_flags;	offset:2;	size:1;	signed:0;
	field:unsigned char common_preempt_count;	offset:3;	size:1;	signed:0;
	field:int common_pid;	offset:4;	size:4;	signed:1;

	field:pid_t pid;	offset:8;	size:4;	signed:1;
	field:pid_t tgid;	offset:12;	size:4;	signed:1;
	field:pid_t ngid;	offset:16;	size:4;	signed:1;
	field:int src_cpu;	offset:20;	size:4;	signed:1;
	field:int src_nid;	offset:24;	size:4;	signed:1;
	field:int dst_cpu;	offset:28;	size:4;	signed:1;
	field:int dst_nid;	offset:32;	size:4;	signed:1;

print fmt: "pid=%d tgid=%d ngid=%d src_cpu=%d src_nid=%d dst_cpu=%d dst_nid=%d", REC->pid, REC->tgid, REC->ngid, REC->src_cpu, REC->src_nid, REC->dst_cpu, REC->dst_nid

name: sched_stick_numa
ID: 314
format:
	field:unsigned short common_type;	offset:0;	size:2;	signed:0;
	field:unsigned char common_flags;	offset:2;	size:1;	signed:0;
	field:unsigned char common_preempt_count;	offset:3;	size:1;	signed:0;
	field:int common_pid;	offset:4;	size:4;	signed:1;

	field:pid_t src_pid;	offset:8;	size:4;	signed:1;
	field:pid_t src_tgid;	offset:12;	size:4;	signed:1;
	field:pid_t src_ngid;	offset:16;	size:4;	signed:1;
	field:int src_cpu;	offset:20;	size:4;	signed:1;
	field:int src_nid;	offset:24;	size:4;	signed:1;
	field:pid_t dst_pid;	offset:28;	size:4;	signed:1;
	field:pid_t dst_tgid;	offset:32;	size:4;	signed:1;
	field:pid_t dst_ngid;	offset:36;	size:4;	signed:1;
	field:int dst_cpu;	offset:40;	size:4;	signed:1;
	field:int dst_nid;	offset:44;	size:4;	signed:1;

print fmt: "src_pid=%d src_tgid=%d src_ngid=%d src_cpu=%d src_nid=%d dst_pid=%d dst_tgid=%d dst_ngid=%d dst_cpu=%d dst_nid=%d", REC->src_pid, REC->src_tgid, REC->src_ngid, REC->src_cpu, REC->src_nid, REC->dst_pid, REC->dst_tgid, REC->dst_ngid, REC->dst_cpu, REC->dst_nid

name: sched_skip_vma_numa
ID: 312
format:
	field:unsigned short common_type;	offset:0;	size:2;	signed:0;
	field:unsigned char common_flags;	offset:2;	size:1;	signed:0;
	field:unsigned char common_preempt_count;	offset:3;	size:1;	signed:0;
	field:int common_pid;	offset:4;	size:4;	signed:1;

	field:unsigned long numa_scan_offset;	offset:8;	size:8;	signed:0;
	field:unsigned long vm_start;	offset:16;	size:8;	signed:0;
	field:unsigned long vm_end;	offset:24;	size:8;	signed:0;
	field:enum numa_vmaskip_reason reason;	offset:32;	size:4;	signed:0;

print fmt: "numa_scan_offset=%lX vm_start=%lX vm_end=%lX reason=%s", REC->numa_scan_offset, REC->vm_start, REC->vm_end, __print_symbolic(REC->reason, { 0, "unsuitable" }, { 1, "shared_ro" }, { 2, "inaccessible" }, { 3, "scan_delay" }, { 4, "pid_inactive" }, { 5, "ignore_pid_inactive" }, { 6, "seq_completed" })

```

问题:
```bash
# 在我的机器上，numa相关的事件没有触发
sberf $ ./sberf record -t "sched:sched_swap_numa,sched:sched_stick_numa,sched:sched_move_numa" -a
recording events: sched:sched_swap_numa sched:sched_stick_numa sched:sched_move_numa
^C
    event                                             count

    sched:sched_swap_numa                             0
    sched:sched_stick_numa                            0
    sched:sched_move_numa                             0


# lscpu输出
sberf $ lscpu
Architecture:             x86_64
  CPU op-mode(s):         32-bit, 64-bit
  Address sizes:          39 bits physical, 48 bits virtual
  Byte Order:             Little Endian
CPU(s):                   4
  On-line CPU(s) list:    0-3
Vendor ID:                GenuineIntel
  BIOS Vendor ID:         Intel(R) Corporation
  Model name:             Intel(R) Core(TM) i5-5257U CPU @ 2.70GHz
    BIOS Model name:      Intel(R) Core(TM) i5-5257U CPU @ 2.70GHz   CPU @ 3.1GHz
    BIOS CPU family:      205
    CPU family:           6
    Model:                61
    Thread(s) per core:   2
    Core(s) per socket:   2
    Socket(s):            1
    Stepping:             4
    CPU(s) scaling MHz:   90%
    CPU max MHz:          3100.0000
    CPU min MHz:          500.0000
    BogoMIPS:             5401.76
    Flags:                fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflus
                          h dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constan
                          t_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmpe
                          rf pni pclmulqdq dtes64 monitor ds_cpl vmx est tm2 ssse3 sdbg fma cx16 xtpr pd
                          cm pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16
                          c rdrand lahf_lm abm 3dnowprefetch cpuid_fault epb pti ssbd ibrs ibpb stibp tp
                          r_shadow flexpriority ept vpid ept_ad fsgsbase tsc_adjust bmi1 avx2 smep bmi2
                          erms invpcid rdseed adx smap intel_pt xsaveopt dtherm ida arat pln pts vnmi md
                          _clear flush_l1d
Virtualization features:
  Virtualization:         VT-x
Caches (sum of all):
  L1d:                    64 KiB (2 instances)
  L1i:                    64 KiB (2 instances)
  L2:                     512 KiB (2 instances)
  L3:                     3 MiB (1 instance)
NUMA:
  NUMA node(s):           1
  NUMA node0 CPU(s):      0-3
Vulnerabilities:
  Gather data sampling:   Not affected
  Itlb multihit:          KVM: Mitigation: VMX disabled
  L1tf:                   Mitigation; PTE Inversion; VMX conditional cache flushes, SMT vulnerable
  Mds:                    Mitigation; Clear CPU buffers; SMT vulnerable
  Meltdown:               Mitigation; PTI
  Mmio stale data:        Unknown: No mitigations
  Reg file data sampling: Not affected
  Retbleed:               Not affected
  Spec rstack overflow:   Not affected
  Spec store bypass:      Mitigation; Speculative Store Bypass disabled via prctl
  Spectre v1:             Mitigation; usercopy/swapgs barriers and __user pointer sanitization
  Spectre v2:             Mitigation; Retpolines, IBPB conditional, IBRS_FW, STIBP conditional, RSB fill
                          ing, PBRSB-eIBRS Not affected
  Srbds:                  Mitigation; Microcode
  Tsx async abort:        Not affected
```

