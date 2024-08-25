## System clock not right

This may cause make to unable to build, and git to be really really slow.


show current time

```bash
perf $ timedatectl
               Local time: Tue 2024-07-09 13:22:42 HKT
           Universal time: Tue 2024-07-09 05:22:42 UTC
                 RTC time: Tue 2024-07-09 05:22:42
                Time zone: Asia/Hong_Kong (HKT, +0800)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

install ntp package

```bash
perf $ pacman -S ntp
```

set time

```bash
ntpd -qg
```
