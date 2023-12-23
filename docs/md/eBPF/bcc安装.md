## Centos-8.5 - Source

#### Install build dependencies

```
dnf install -y bison cmake ethtool flex git iperf3 libstdc++-devel python3-netaddr python3-pip gcc gcc-c++ make zlib-devel elfutils-libelf-devel
# dnf install -y luajit luajit-devel ## if use luajit, will report some lua function(which in lua5.3) undefined problem 
dnf install -y clang clang-devel llvm llvm-devel llvm-static ncurses-devel
dnf -y install netperf
pip3 install pyroute2
ln -s /usr/bin/python3 /usr/bin/python
```

#### Install and Compile bcc

```
git clone https://github.com/iovisor/bcc.git

mkdir bcc-build
cd bcc-build/

## here llvm should always link shared library
cmake ../bcc -DCMAKE_INSTALL_PREFIX=/usr -DENABLE_LLVM_SHARED=1
make -j10
make install
```

记得`make install`(安装library到/usr/include/bcc)

```
bcc-build > cd /usr/include/bcc
bcc > ls
BPF.h       bcc_common.h  bcc_exception.h  bcc_syms.h  bcc_version.h  compat       libbpf.h       table_desc.h
BPFTable.h  bcc_elf.h     bcc_proc.h       bcc_usdt.h  bpf_module.h   file_desc.h  perf_reader.h  table_storage.h
```

