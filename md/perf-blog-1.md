## Journey to Becoming a (Newbie) Perf Contributor

Oct 25, 2023, this is the day I pushed the first commit to my silly little eBPF project, `sberf`. You can tell I stole this name from a prestigious performance analysis tool, [perf](https://perf.wiki.kernel.org/index.php/Main_Page). 

I didn't just steal the name, I stole some code from perf as well, about how to parse subcommands, calling function pointers and stuff.

I wouldn't believe you if you told me that I can contribute to perf myself, I'd say you are crazy. I remember the day when I first read `perf record`'s code, all I saw was `evlist` this, `evlist` that, and no matter what, I just couldn't understand these abstractions, I was discouraged.

> Well actually, anybody can contribute to perf, here's a [blog post](https://sberm.cn/blog/how-to-contrib-perf) I wrote about how to do it.

![evlist-all-over](/images/docs/perf/Snipaste_2024-06-27_18-35-26.png)

Fast forward to the GSoC application period, I started writing a proposal. I have a low expectation of getting selected, and that expectation dropped to none after reading this proposal in the mailing list: [Proposal for Roofline Support in perf](https://lore.kernel.org/linux-perf-users/CAMZOccS0NcTSSHkJEiM6X5pM95OT98iwz152303qPnKdw49azA@mail.gmail.com/T/#u). Figured that getting selected doesn't matter that much, contributing to a project that I looked up to is cool enough, so I started working.

At first I thought kernel people are a little weird. No github, no GUI version controls, just plain texts, CLI tools and emails. I read some posts about how to contribute to the kernel, and I started to practice it. Luckily there's no learning curve in text editors for C, for I have used vim + tmux for years.

I cured my `evlist`phobia by taking 3000+ lines of notes on `perf record`'s codebase, and I sent a [patch series](https://lore.kernel.org/linux-perf-users/20240424024805.144759-1-howardchu95@gmail.com/) on off-cpu feature (where I also copied a lot of code from [arnaldo carvalho de melo](https://github.com/acmel)'s `perf trace`). And then luckily, I got selected and I'm now contributing to perf.

![note-image](/images/docs/perf/Snipaste_2024-06-27_18-13-07.png)

About a month later, I contribute a feature: [enum pretty printing for perf trace](https://sberm.cn/blog/perf-trace-enum), this paves the path for the struct pointer pretty-printing feature, which I have been working on as a background task.

Thank you, that's my story, and thank you, perf.

#### P.S.

Because I'm writing C instead of Java, there's only one more thing that I want to do. That is... turning off syntax highlighting.

![no-highlighting](/images/docs/perf/Snipaste_2024-06-27_18-36-02.png)

Haha, it's just a joke. Or is it?
