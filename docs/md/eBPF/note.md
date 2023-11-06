## 文档

#### reference guide

https://github.com/iovisor/bcc/blob/master/docs/reference_guide.md

#### bpf-docs

https://github.com/iovisor/bpf-docs/blob/master/bpf_helpers.rst/

#### undocumented 的函数也有很多

比如 open_perf_event


python的包是用egg装的(`/usr/lib/python3.9/site-packages/bcc-0.28.0+b8b943a1-py3.9.egg/bcc/`)，代码在 `/root/hw/bcc/src/python/bcc`

bcc竟然是c++的api(被骗了)。路径: `/usr/include/bcc`


2023-11-2

FUCK BCC!!!
我用libbpf-CORE

gcc include path:
```
#include <...> search starts here:
 /usr/lib/gcc/x86_64-redhat-linux/8/include
 /usr/local/include
 /usr/include
```

gcc link path:
```
SEARCH_DIR("=/usr/x86_64-redhat-linux/lib64")
SEARCH_DIR("=/usr/lib64")
SEARCH_DIR("=/usr/local/lib64")
SEARCH_DIR("=/lib64")
SEARCH_DIR("=/usr/x86_64-redhat-linux/lib")
SEARCH_DIR("=/usr/local/lib")
SEARCH_DIR("=/lib")
SEARCH_DIR("=/usr/lib")
```


how to find out gcc include path:
```
In order to figure out the default paths used by gcc/g++, as well as their priorities, you need to examine the output of the following commands:

For C:
echo | gcc -xc -E -v -
echo | gcc -x c -E -Wp,-v - >/dev/null
For C++:
echo | gcc -xc++ -E -v -
```

find out link path:
```
ld --verbose | grep SEARCH_DIR | tr -s ' ;' \\012
```


bcc 安装位置
```
/ > find ./ -regex ".*libbcc.*" | grep lib64
./usr/lib64/libbcc_bpf.so.0.19.0
./usr/lib64/libbcc.so.0.19.0
./usr/lib64/pkgconfig/libbcc.pc
./usr/lib64/libbcc.so.0
./usr/lib64/libbcc.so
./usr/lib64/libbcc.a
./usr/lib64/libbcc-loader-static.a
./usr/lib64/libbcc_bpf.a
./usr/lib64/libbcc_bpf.so.0.28.0
./usr/lib64/libbcc_bpf.so.0
./usr/lib64/libbcc_bpf.so
./usr/lib64/libbcc.so.0.28.0
```

卸载: make uninstall


/*-*- mode:c;indent-tabs-mode:nil;c-basic-offset:2;tab-width:8;coding:utf-8 -*-│
│vi: set net ft=c ts=2 sts=2 sw=2 fenc=utf-8                                :vi│
╞══════════════════════════════════════════════════════════════════════════════╡
│ Copyright 2021 Justine Alexandra Roberts Tunney                              │
│                                                                              │
│ Permission to use, copy, modify, and/or distribute this software for         │
│ any purpose with or without fee is hereby granted, provided that the         │
│ above copyright notice and this permission notice appear in all copies.      │
│                                                                              │
│ THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL                │
│ WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED                │
│ WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE             │
│ AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL         │
│ DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR        │
│ PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER               │
│ TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR             │
│ PERFORMANCE OF THIS SOFTWARE.                                                │
╚─────────────────────────────────────────────────────────────────────────────*/

#### share vs static

share(.so) static(.a)


#### 很显然你可以直接使用-o指定-c生成的object file的名称(即helloworld.c不一定要生成helloworld.o)
gcc -c helloworld.c -o helloworld2.o
