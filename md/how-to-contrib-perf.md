## How to contribute to perf

#### TL;DR:

1. Clone the repo:

```bash
git clone https://git.kernel.org/pub/scm/linux/kernel/git/perf/perf-tools-next.git/

# switch to perf-tools-next branch
git checkout perf-tools-next

# cd into the perf's directory
cd tools/perf
```

2. Write some code

```bash
# compile with
make
```

3. Commit changes

```bash
git add
git commit
# you can also use 'git commit -s' to add 'Signed-off-by:' tag
```

4. Create a patch based on a commit

```bash
# single patch
git format-patch HEAD~1 -s -o ~/patch

# patch series, version 2, including 4 commits, adding cover letter
git format-patch -v2 HEAD~4 -s -o ~/patch --cover-letter
```

5. Check the format of your patch

```bash
../../scripts/checkpatch.pl ~/patch/0001-foo.patch
```

6. Find maintainers to send your patch to

```bash
# run this script in the root directory of Linux
# use --no-rolestats to make the output simpler
# use sed to extract useful emails, you can also do it by hand
./scripts/get_maintainer.pl --no-rolestats ~/patch/0001-foo.patch | sed 's/.*<\(.*\)>.*/\1/g'
```

> You can also add `| paste -s -d,` to the end of the command above to replace newlines with comma, and put the whole thing after the `--to` flag of `git send-email` for convenience, for example: `--to peterz@infradead.org,mingo@redhat.com,acme@kernel.org`

7. Send your patch

```bash
# don't copy as-is, use the maintainer emails you got from the previous step:
git send-email \
--to peterz@infradead.org \
--cc mingo@redhat.com \
--cc acme@kernel.org \
--cc namhyung@kernel.org \
--cc mark.rutland@arm.com \
--cc alexander.shishkin@linux.intel.com \
--cc jolsa@kernel.org \
--cc irogers@google.com \
--cc adrian.hunter@intel.com \
--cc kan.liang@linux.intel.com \
--cc linux-perf-users@vger.kernel.org \
--cc linux-kernel@vger.kernel.org \
~/patch/0001-foo.patch --smtp-debug=1
```

## Explanations on each step

#### 1. Clone the repo:

We use perf-tools-next.git and the branch perf-tools-next for active development:
https://git.kernel.org/pub/scm/linux/kernel/git/perf/perf-tools-next.git/

For releasing in the next Linux kernel there is the perf-tools.git repository with the perf-tools branch:
https://git.kernel.org/pub/scm/linux/kernel/git/perf/perf-tools.git/log/?h=perf-tools

> courtesy of [Ian Rogers](https://sites.google.com/site/rogersemail/home)

Please do:

```bash
git clone https://git.kernel.org/pub/scm/linux/kernel/git/perf/perf-tools-next.git/

# switch to perf-tools-next branch
git checkout perf-tools-next
```

This is a git repo of Linux. Perf is located at `tools/perf`, let's `cd tools/perf` first.

#### 2. Write some code

To build perf, simply type `make` and return (make sure you are at `tools/perf`).

Sometimes I do have to build it with `WERROR=0 make`, before changing anything.

Now make your changes, compile run and repeat.

You can see your changes with 
```bash
git diff
```

#### 3. Commit changes

Once you decide the modification is complete, please commit it. 

For a simple feature/bug fix, just use 
```bash
git add <some-file> # or 'git add .' to add everything in current directory 
git commit
# you can also use 'git commit -s' to add 'Signed-off-by:' tag
```

To learn how to write commit title and descriptions, check how other people do it in the [mailing list](https://lore.kernel.org/linux-perf-users/).

To learn more about tags like `Signed-off-by:`, `Tested-by:`, and `Reviewed-by:`, please read [Submitting patches: the essential guide to getting your code into the kernel](https://www.kernel.org/doc/html/v4.17/process/submitting-patches.html)

The title looks like this:
```git
perf <subcommand>: <topic>

perf pmu: Event parsing and listing fixes
perf sched map: Add command-name, fuzzy-name options to filter the output map
```

For a more complicated contribution, please split your patches based on **individual logic**. Sometimes using `git add <some-file>` to create a commit for every modified file is good enough, but sometimes it's not.

If you need to split the changes in the same file, please use `git add -p`, and press `e` to split. These changes are called `hunks` in git's term. To learn more about how to use `git add -p` to split up commits, please go to [here](https://drewdeponte.com/blog/git-add-patch-wont-split/).

So after writing your code, the workflow will look like this:
```bash
# check you changes
git status
git diff

# create a commit
git add <some-file> # or git add -p
git commit
# you can also use 'git commit -s' to add 'Signed-off-by:' tag

# create another commit
git add <some-file>
git commit
.
.
.
# create the last commit
git add <some-file>
git commit

# see if all changes are added(staged)
git status
```

> When writing commit messages, it is best to limit the number of characters per line to 75. I use vim as my editor, so this `:set tw=75` will do the auto wrapping. If vim somehow doesn't wrap, use `gg gqG` to format the commit message. There are also lots of online text wrapping apps.

#### 4. Create a patch based on a commit

Please use `-s` option to add `Signed-off-by:`, and `-o` to specify output directory. 

Depending on how many commits to be included, use `-n` or `HEAD~n`, for example, to include 4 commits, you can do `git format-patch -4` or `git format-patch HEAD~4`. 

Adding version number using `-v` option is also recommended, so you can revise patches after receiving reviewer's opinions.

When creating a patch series, it is highly recommended to use `--cover-letter` to add a cover letter to your series. Cover letter is an introduction to this patch series. Please don't forget to add an explanation of the purpose of this patch in the cover letter(of number 0000), and add a subject to this cover letter.

examples:

```bash
# single patch
git format-patch HEAD~1 -s -o ~/patch

# patch series, version 2, including 4 commits, adding cover letter
git format-patch -v2 HEAD~4 -s -o ~/patch --cover-letter
```

#### 5. Check the format of your patch

Use `scripts/checkpatch.pl` to check the format. (If you are in `tools/perf`, it is `../../scripts/checkpatch.pl`)

```bash
# check one specific patch
../../scripts/checkpatch.pl ~/patch/0001-foo.patch

# check all patches
../../scripts/checkpatch.pl ~/patch/*.patch
```

You might get WARNING and ERROR
```
WARNING: Prefer a maximum 75 chars per line (possible unwrapped commit description?)

ERROR: Please use git commit description style 'commit <12+ chars of sha1> ("<title line>")' - ie: 'commit 0123456789ab ("commit description")'
```

I suggest just pay close attention to errors.

To edit/amend a commit based on these error messages:

For a single patch, use `git add`, `git commit --amend`, and `git format-patch` to resolve errors.

For a patch series, use `git rebase -i <HASH>~`, change the 'pick' to 'edit' for the commit you want to modify in the interactive file, and use `git add`, `git commit`, and `git rebase --continue`. This might be hard to understand, I recommend reading this [stack overflow post](https://stackoverflow.com/questions/1186535/how-do-i-modify-a-specific-commit)

#### 6. Find maintainers and mailing lists to send your patch to

Run `get_maintainer.pl` script. This script can only be run when you're at the root directory of Linux.

```bash
# run this script in the root directory of Linux
# use --no-rolestats to make the output simpler
# use sed to extract useful emails, you can also do it by hand
linux $ scripts/get_maintainer.pl ~/patch/0001-foo.patch --no-rolestats | sed -r 's/.*<(.*)>.*/\1/g'
peterz@infradead.org
mingo@redhat.com
acme@kernel.org
namhyung@kernel.org
mark.rutland@arm.com
alexander.shishkin@linux.intel.com
jolsa@kernel.org
irogers@google.com
adrian.hunter@intel.com
kan.liang@linux.intel.com
linux-perf-users@vger.kernel.org
linux-kernel@vger.kernel.org
```

> You can also add `| paste -s -d,` to the end of the command above to replace newlines with comma, and put the whole thing after the `--to` flag of `git send-email` for convenience, for example: `--to peterz@infradead.org,mingo@redhat.com,acme@kernel.org`

You can also find maintainers of perf in `MAINTAINERS`. Just search `PERFORMANCE EVENTS SUBSYSTEM` in the `MAINTAINERS` file.

#### 7. Send your patch

```bash
# don't copy as-is, use the maintainer emails you got from the previous step:
git send-email \
--to peterz@infradead.org \
--cc mingo@redhat.com \
--cc acme@kernel.org \
--cc namhyung@kernel.org \
--cc mark.rutland@arm.com \
--cc alexander.shishkin@linux.intel.com \
--cc jolsa@kernel.org \
--cc irogers@google.com \
--cc adrian.hunter@intel.com \
--cc kan.liang@linux.intel.com \
--cc linux-perf-users@vger.kernel.org \
--cc linux-kernel@vger.kernel.org \
~/patch/0001-foo.patch --smtp-debug=1

# or, simply do

git send-email --to peterz@infradead.org,mingo@redhat.com,acme@kernel.org,namhyung@kernel.org,mark.rutland@arm.com,alexander.shishkin@linux.intel.com,jolsa@kernel.org,irogers@google.com,adrian.hunter@intel.com,kan.liang@linux.intel.com,linux-perf-users@vger.kernel.org,linux-kernel@vger.kernel.org ~/patch/0001-foo.patch --smtp-debug=1
```

I like to use `--smtp-debug=1`, because `git send-email` is slow, and `--smtp-debug=1` is a good loading screen, reducing some agitation.

> I do have to install some perl packages before successfully running `git send-email`

> You can `git send-email` to yourself first to avoid embarrassment

## You are all set, well done!

Now you can check your contribution on the [perf mailing list](https://lore.kernel.org/linux-perf-users/)

It might take one to three minutes for it to show up.

#### Apply patches

Sometimes you may want to apply a patch or two from the mailing list. 

The easiest way being, going to `https://lore.kernel.org/linux-perf-users/`, click on the `raw` link(besides `permalink`), and copy the whole thing. Next, type `git am` and return, paste what you have copied into it, press `Ctrl+D` to finish. But this process can be annoying.

You can also download the `mbox.gz`, or just use `b4`. To learn more about how to apply patches from the mailing list, please read this [blog post](https://blog.reds.ch/?p=1814)

---

Special thanks to [Ian Rogers](https://sites.google.com/site/rogersemail/home), [Namhyung Kim](https://github.com/namhyung), and [Arnaldo Carvalho de Melo](https://github.com/acmel)
