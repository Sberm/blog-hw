## Using lldb to read C++ standard library

C++ standard library can be hard to read, using a debugger to help with learning can
be a good approach.

My machine is a mac so this will be `clang`'s std library. And I'm using `lldb`
because it's better supported than `gdb`. Here's how to do it.

Install `lldb`, typically use
```
xcode-select --install
```

If you want to update installed tools through command line, use `softwareupdate` command line tool
```bash
softwareupdate -l
softwareupdate -i "software name"
```

Compile and run debugger
```bash
lldb a.out
```

Somehow `lldb`'s `l` or `list` commands doesn't print the source file for me, but what works for me is `l source_file.c` and `l main`.
```bash
cpp_learn $ lldb a.out
(lldb) target create "a.out"
Current executable set to '/Users/howardchu/hw/cabin/cpp_learn/a.out' (arm64).
(lldb) l main
File: /Users/howardchu/hw/cabin/cpp_learn/a.cc
   5    bool comparator(int o1, int o2)
   6    {
   7            return o1 < o2;
   8    }
   9   
   10   int main()
   11   {
   12           vector<int> a = {1, 3};
   13           sort(a.begin(), a.end(), comparator);
   14           return 0;
   15   }
(lldb) 
```

But when I want to step into a c++ standard library lldb won't do it.
```bash
(lldb) s
Process 84607 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = step in
    frame #0: 0x00000001000037dc a.out`main at a.cc:13:9
   10   int main()
   11   {
   12           vector<int> a = {1, 3};
-> 13           sort(a.begin(), a.end(), comparator);
   14           return 0;
   15   }
Target 0: (a.out) stopped.
(lldb) s
Process 84607 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = step in
    frame #0: 0x000000010000380c a.out`main at a.cc:14:2
   11   {
   12           vector<int> a = {1, 3};
   13           sort(a.begin(), a.end(), comparator);
-> 14           return 0;
   15   }
Target 0: (a.out) stopped.
(lldb)
```

To solve this one has to disable the `std::` standard library function filtering in `lldb`, run this command in lldb:

Show all the filtering regular expressions:
```bash
(lldb) settings show target.process.thread.step-avoid-regexp ""
target.process.thread.step-avoid-regexp (regex) = ^std::

(lldb)
```

Set that to empty:
```bash
(lldb) settings set target.process.thread.step-avoid-regexp ""
```

This is from this Stack Overflow page [Why the breakpoints set in STL are "skipped/ignored" while using LLDB?](https://stackoverflow.com/questions/70554765/why-the-breakpoints-set-in-stl-are-skipped-ignored-while-using-lldb/70560542)

Now I can step into the c++ std
```bash
(lldb) r
Process 88390 launched: '/Users/howardchu/hw/cabin/cpp_learn/a.out' (arm64)
Process 88390 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00000001000037dc a.out`main at a.cc:13:9
   10   int main()
   11   {
   12           vector<int> a = {1, 3};
-> 13           sort(a.begin(), a.end(), comparator);
   14           return 0;
   15   }
Target 0: (a.out) stopped.
(lldb) s
Process 88390 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = step in
    frame #0: 0x0000000100003920 a.out`std::__1::vector<int, std::__1::allocator<int>>::begin[abi:ue170006](this=0x000000016fdff1c0 size=2) at vector:1501:30
   1498 typename vector<_Tp, _Allocator>::iterator
   1499 vector<_Tp, _Allocator>::begin() _NOEXCEPT
   1500 {
-> 1501     return __make_iter(this->__begin_);
   1502 }
   1503
   1504 template <class _Tp, class _Allocator>
Target 0: (a.out) stopped.
(lldb)
```
