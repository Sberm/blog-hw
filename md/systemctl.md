## 使用systemctl作为守护进程管理器时遇到的问题
1. 异步文件读写库asyncio上锁后SIGTERM无法终止程序。
2. 可以使用SIGKILL终止。

解决办法:
1. 在blog-server.service中添加ExecStop=SIGKILL代表`systemctl stop blog-server.service`    时不使用默认的SIGTERM信号而是SIGKILL信号。

```systemd
[Unit]
Description=Daemon for blog server

[Service]
Type=simple
WorkingDirectory=/root/hw/blog-hw
ExecStart=/bin/python3 /root/hw/blog-hw/blog_server.py
;Restart=always
;RestartSec=10
KillSignal=SIGKILL

[Install]
WantedBy=multi-user.target
```

2. systemctl kill -s 9 blog-server.service

3. kill -9 <PID>
