# 如何上传PATCH

> 最好不要把patch放在/tmp里面

1. 将每一个逻辑分成一个commit, 上传所有的commit

2. 根据需求, 使用`format-patch`创建补丁

```bash
# single patch
git format-patch HEAD -o /tmp/patch

# patch set
git format-patch -v2 HEAD~4 -o /tmp/off-cpu-patch --cover-letter
```

3. 查看需要发送的邮箱

```bash
# 必须在根目录下运行
scripts/get_maintainer.pl patch/0001-perf-record-Fix-comments-misspellings.patch
```

4. 检查格式

```bash
../../scripts/checkpatch.pl /tmp/off-cpu-patch/v2-0002-perf-record-off-cpu-Parse-off-cpu-event-change-co.patch
```

5. 发送邮件，要cc到尽量多人

```bash
# 可以使用--smtp-debug=1查看邮件是否被发送了
git send-email --to peterz@infradead.org \
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
--cc trivial@kernel.org \
./patch/0001-perf-record-Fix-comments-misspellings.patch --smtp-debug=1
```

References: [https://kernelnewbies.org/FirstKernelPatch](https://kernelnewbies.org/FirstKernelPatch)
