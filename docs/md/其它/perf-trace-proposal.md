## Personal Information
Name: Haowei Zhu (Howard Chu)

Major: Computer science

University: Shenzhen University

Email: howardchu95@gmail.com

Phone: +86 13682588784

Github: [https://github.com/sberm](https://github.com/sberm)

CV: [here](https://sberm.cn/cv/)

Timezone: China Standard Time UTC+8

## Project Information

Project name: **perf trace and BTF**

Project size: **medium**

### Motivation

Right now, perf trace has to build a list of format to pretty-print the syscall args. But we find it limited and manual work. Instead, it could use BTF (BPF type format) which has all the type information and is available in the (most) kernel.

### Deliverables

1. A new method of fetching augmented argument data.
2. Implementation of an auto-generated beauty map that stores the type and size of augmented syscall argument, based on BTF.
3. eBPF side augmented argument caching refactoring.
4. Pretty print feature to visualize data from struct pointer, char* string, etc, using BTF.
5. New sets of command line arguments to control pretty printing.
6. Fixes of current documentation of perf trace tool. Detailed documentation of this project. Addition of information about `perf trace` on perf wiki.
7. Fortnightly blogs on developmental advances and milestones.

---

First, please let me explain the process of pretty printing. We have a syscall function name, from which we get an argument list, and then we get those arguments' types. By combining argument types and argument data, we can pretty print the trace message. Here's a flow chart of it:

![](/images/docs/perf/pipeline.png)

The mapping from function name to argument list is already established by `syscall table` and `tep_format_field`. Please notice that finding function arguments in vmlinux BTF is problematic. Firstly, function symbols started in `__x64_sys_` and `__ia32_sys_`(eg. `__x64_sys_open`) are completely useless because their function prototype's argument will just be a `pt_regs` struct which is used to pass arguments. Secondly, function symbols that start with `do_sys_` or `do_` are generally correct but they are not usually aligned with what we collected from eBPF's sys_enter_* program. The correct argument mapping is in the raw_syscall table at `/sys/kernel/tracing/events/syscalls` and has been read in `trace->sctbl`;

![](/images/docs/perf/pipeline-2.png)

And the mapping from argument list to actual argument type is very easy to establish using `btf__find_by_name(field->type)` (although `field->type` has to be stripped, such as removing '*' and 'const')

![](/images/docs/perf/pipeline-3.png)

So there are only two components we need, a `pretty print function` and `argument data`, mainly augmented argument data.

I should mention that I'm focusing on augmented data(such as struct pointer data and char* string) in this project because vmlinux file doesn't contain any macro, a flag's type is directly resolved to int or uint, there is no additional information. Handcrafted opt codes and flags pretty-printing are still needed.

### Pretty printing

Sorting by customizability, there are three pretty print options. They are:
- `customized printf` with maximum customizability
- `btf_dump__dump_type_data` with little customizability
- `bpf_snprintf_btf` with zero customizability, and great [disadvantages](https://github.com/bpftrace/bpftrace/pull/2651)

![](/images/docs/perf/cus.png)

I want to mention that pretty printing here refers to printing a struct pointer (if it's char* or void*, just print the string/array). 
If all we want to do is a strace-style struct data dumping, `btf_dump__dump_type_data` is more than enough. But if we want to tweak the representation in struct's member (such as print perf_event_attr.type as PERF_TYPE_HARDWARE), then a customized pretty printing function is needed.

Here are some ideas of a customized pretty printing function:
1. Traverse members of the struct
2. If the *backtraced data type is eventually a primitive type, print it as is.
3. If data type is pointer, print it in hex.
3. Curly brackets and indentation(optional).
4. Field name and type.

<!--2. If it is flag/opt, use handcrafted opt pretty print().-->

*Backtrace is like __u32->unsigned int

Because there's not a lot of nested data in a struct that's passed in syscall, we don't need to have a recursive pretty print function and go a layer deeper. (there are some unions in those structs though)

Pseudo code for pretty printing:
```c
for each member in struct do:
	print(member.name) // member name

	type <- back_trace(member);
	if type == PRIMITIVE
		print(member)
	if type == PTR
		print_hex(member)

	print_beautify(); // curly brackets, indentation,
	                  // color codes and so on
```

The complexity of finding type data using type name string using vmlinux BTF is `O(1)` because a BTF is essentially a huge hashmap. The memory usage of a complete vmlinux BTF is roughly 1.4MB, loaded straight from kernel using `btf__load_vmlinux_btf()`.


### Fetching augmented argument data

First, let me analyze the De facto method that's currently being used.

We use two array maps of type `BPF_MAP_TYPE_PROG_ARRAY` `syscalls_sys_enter` and `syscalls_sys_exit` to do `bpf_tail_call`, so that we can jump to the handling program which the current syscall_nr is pointed to. We also use a lot of string matching to find out the correct bpf program a system call should be attached to.

Luckily, we don't have 300+ functions in the eBPF program, for smartly reusing some `sys_enter_` functions in different syscalls, but this method is hard to scale. So here is my proposed method:

When we are thinking about caching pointers' value in eBPF, we are essentially probe_reading an argument pointer of a fixed size. This fixed size could come from the size of a struct, or a length of an array passed into the syscall as an argument itself(eg. `ssize_t read(int fd, void buf[.count], size_t count);`). 

When a syscall triggered an eBPF program, we could be reading from arg1, arg2, or arg6, with size sz1, sz2, or sz6. Also, we could be simultaneously reading from multiple arguments. (but only 6 arguments for sys_enter raw tracepoint)

Judging from the use cases, I propose a map called beauty_map with the following structure:

```nonsense
syscall_nr
(arg_nr1, sz1)
(arg_nr2, sz2)
(arg_nr3, sz3)
(arg_nr4, sz4)
(arg_nr5, sz5)
(arg_nr6, sz6) 
```

Which is just:
```c
int beauty_map[n][6];           // n: total amount of syscalls
beauty_map[syscall_nr][1] = 32; // this means when syscall of 
                                // syscall_nr entered, 
                                // bpf program should read 32 bytes 
                                // from the address that argument 2 
                                // is pointed to.
```

#### rule

- If the value of such map is 0, eBPF program should read nothing.
- If the value of such map is 1, eBPF program should read a null-terminated string.
- If the value of such map is n (n > 1), eBPF program should read n bytes from specific argument's address.
- If the value of such map is m (m < 0), read args_m(eg. size_t count) bytes from specific argument's address, see the example below:

#### examples

- If beauty_map_enter[4][2] is 0, nothing is to be read.

- If beauty_map_enter[4][2] is 1, eBPF program should read a null-terminated string from argument 3's address I chose 1 because no pointer in syscall args points to a single-byte data(in this case, a char), they are often a bigger struct or int.

- If beauty_map_enter[4][2] is greater than 1, eBPF program should read a null-terminated string from argument 3's address.

- If beauty_map_enter[4][2] is below 0, for example, -4, it means that it should read data whose length is arg4(because it starts from -1, not 0)'s value from the address that argument 3 is pointed to. This solves: `int setsockopt(int sockfd, int level, int optname, const void optval[.optlen], socklen_t optlen);` For this syscall, the map value should be beauty_map_enter[nr_of_setsockopt][3] = -5.

The beauty map should be loaded into eBPF program. Which is something like:

```c
#define MAX_DATA_LEN 6
struct beauty_map_enter {
	__uint(type, BPF_MAP_TYPE_HASH);
	__type(key, __u32);
	__type(value, int[MAX_DATA_LEN]); // with 6 elements
	__uint(max_entries, 512);
} beauty_map_enter SEC(".maps");
```

The handling of return value is pretty much the same, with just one dimension to worry about.
```c
struct beauty_map_exit {
	__uint(type, BPF_MAP_TYPE_HASH);
	__type(key, __u32);
	__type(value, int);
	__uint(max_entries, 512);
} beauty_map_exit SEC(".maps");
```

Here is the pseudo code for caching data in eBPF program
```c
# sys_enter
SEC("tp/raw_syscalls/sys_enter")
int sys_enter(struct syscall_enter_args *args)
{
	struct augmented_args_payload *augmented_args;
	unsigned int args_len = sizeof(augmented_args->args);

	if (pid_filter__has(&pids_filtered, getpid()))
		return 0;

	/* could make this a struct, since we don't need to pass it between different program */
	augmented_args = augmented_args_payload();
	if (augmented_args == NULL)
		return 1;

	int* beauty_map = bpf_map_lookup_elem(&beauty_map_enter, &args->syscall_nr);
	int bytes;
	const void *addr = NULL;
	for (int i = 0;i < RAW_SYSCALL_ARGS_NUM; i++) {
		bytes = beauty_map[i];
		addr = (const void *)args->args[i];

		if (bytes == 1) { // read a null-terminated string
			bpf_probe_read_user_str(&augmented_args->data, sizeof(augmented_args->data), 
			                        addr);
		} else if (bytes > 1) { // read bytes
			bpf_probe_read_user(&augmented_args->data, bytes, addr);
		} else if (bytes < 0 && bytes >= -RAW_SYSCALL_ARGS_NUM) {//-(bytes + 1) as index,
			unsigned int len = args->args[-(bytes + 1)];//therefore -6 < bytes < 0
			bpf_probe_read_user(&augmented_args->data, len, addr);
		} else {
			continue;
		}
		augmented__output(args, augmented_args, len + args_len);
	}
	return 0;
}
```

```c
# sys_exit
SEC("tp/raw_syscalls/sys_exit")
int sys_enter(struct syscall_exit_args *args)
{
	if (pid_filter__has(&pids_filtered, getpid()))
		return 0;

	int beauty = bpf_map_lookup_elem(&beauty_map_exit, &args->syscall_nr);
	if (beauty <= 0) // no need to read any data
		return 0;

	const void *addr = (const void *)args->ret;
	char data[MAX_DATA_LEN];
	bpf_probe_read_user(data, beauty, addr);
	exit__output(args, bytes);

	return 0;
}
```

This way we can avoid a bloated eBPF program with every syscall name in SEC, and we can manage to fit the needs of retrieving data for every syscall.

No more `strcmp()` of `SEC()` eBPF program name is needed. There is no need for an `augmented_args_tmp` map of size 1 to pass the argument data between different BPF functions. The size of beauty_map_enter and beauty_map_exit in total is roughly 14KB

Every time we run perf trace, we need to construct `beauty_map_enter` and `beauty_map_exit`. It cannot be static because structs' size and members are different in different kernel versions. The construction can easily be done by using `vmlinux btf` and `btf__resolve_size(btf, type_id)`. 

This comment in builtin-trace.c reads: 
```
 * We'll revisit this later to pass s->args_size to the BPF augmenter
 * (now tools/perf/examples/bpf/augmented_raw_syscalls.c, so that it
 * copies only what we need for each syscall, like what happens when we
 * use syscalls:sys_enter_NAME, so that we reduce the kernel/userspace
 * traffic to just what is needed for each syscall.
```

We will build a truly fine-grained and flexible augmenter with the support of beauty_map.

This FIXME comment in `util/bpf_skel/augmented_raw_syscalls.bpf.c` reads:
```
/*
 * FIXME: Should come from system headers
 *
 * The definition uses anonymous union and struct in order to control the
 * default alignment.
 */
```

Now that we have the beauty_map, including headers and making sure everything is aligned on eBPF side isn't necessary anymore. No system headers or vmlinux.h are needed. This FIXME should be fixed.

<!--![](/images/docs/perf/overall.png)-->

### Other enhancement

We should use `bpf_core_read_user` and `bpf_core_read_user_str` instead of `bpf_probe_read_user` and `bpf_probe_read_user_str` for relocation in different kernel versions.

### Testing

Test scripts that test all syscalls will be created. Random data will be filled into syscall arguments, collect the output of perf trace, and see if it is correct. The tests will focus on syscalls' augmented argument data.

### Timeline

**April 3 - April 25**

- Do a second pass on `perf trace`'s codebase. Fix `perf record`'s off-cpu sample issue and some more bugs, and talk with mentors about ideas on building `perf trace`.

**April 26 - May 12**

- Focus on my degree thesis, I will not be contributing actively during this period.

**May 13 - May 26**

- Talk with mentors and community members about ideas on building `perf trace`.
- Start to research and implement the new method of fetching augmented argument data.

**May 27 - July 4**

- Finish implementing the auto-generated beauty_map that stores the type and size of augmented syscall arguments.
- Finish eBPF side augmented argument caching refactoring.
- Finish implementing the new method of fetching augmented argument data.

**July 5 - July 12**

- Test the BTF-based `perf trace`.
- Submit midterm evaluations.

**July 13 - August 19**

- Finish implementing pretty print feature.
- Add new sets of command line arguments to control pretty printing.
- Test the BTF based `perf trace` on all syscalls.
- Fix the current documentation of `perf trace` tool and create detailed documentation of this project.
- Add information about `perf trace` to perf wiki.

**August 20 - August 26**

- Finish final testing and integration.
- Submit final work product.

### My background and why me

- I have experience in `eBPF` and `C`. I wrote an eBPF-based performance analysis and visualization tool, [Sberf](https://github.com/Sberm/sberf), which is just `perf record` with built-in Flamegraph feature(it directly dumps data to an SVG file).
- I created other opensource projects such as a command line [file explorer](https://github.com/Sberm/Transgender.rs) using Rust, and a single-file address-to-symbol library [sym.h](https://github.com/Sberm/sym.h).
- I have experience in computational biography, I am one of the authors of this [paper](https://www.sciencedirect.com/science/article/abs/pii/S0141813024017896), I have a patent ["Intelligent parking management method and system based on Internet of things."](https://max.book118.com/html/2023/1118/8105076135006006.shtm)
- I once participated in Bytedance's Search Engine project as the project leader.
- I possess a physical Linux(Arch Linux, kernel version 6.8.1) machine, running on Intel CPU. My text editor of choice is NeoVim.
- More info [here](https://sberm.cn/cv/).

### Working schedule

- Work hours: 0:30 AM UTC - 3:45 PM UTC (40+h/week)
- Working full-time from Monday to Saturday.
- In cases of emergency, I’ll responsibly notify my mentor.

### My requirements

- Perf Wiki Edit Access

Some information on perf wiki about `perf trace` is problematic, I would like to correct it.

### Post GSOC

I will continue to submit patches for `perf trace` and `perf` tool for this is my area of interest.

### References
linux btf doc: https://docs.kernel.org/bpf/btf.html

pretty print test: https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/tree/tools/testing/selftests/bpf/prog_tests/btf.c

bpf_trace(Support BTF-based pretty printing): https://github.com/bpftrace/bpftrace/pull/2651

random commit: https://patchwork.ozlabs.org/project/netdev/patch/20180809155521.1544888-3-yhs@fb.com/

linux api: https://github.com/libbpf/libbpf/blob/20ea95b4505c477af3b6ff6ce9d19cee868ddc5d/include/uapi/linux/bpf.h

kernel test btf_dump.c: https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/tree/tools/testing/selftests/bpf/prog_tests/btf_dump.c

blog post: https://martincarstenbach.com/2021/07/29/do-you-know-perf-trace-its-an-almost-perfect-replacement-for-strace/

syscall table and regs lists: https://chromium.googlesource.com/chromiumos/docs/+/master/constants/syscalls.md

READ_ONCE: https://stackoverflow.com/questions/72507777/how-the-triggered-event-cause-the-program-jump-to-the-hook-point,https://elixir.bootlin.com/linux/v5.18.1/source/samples/bpf/xdp_sample.bpf.h#L89

