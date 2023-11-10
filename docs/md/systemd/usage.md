Place to put .service file

The best place to put system unit files: `/etc/systemd/system` Just be sure to add a target under the [Install] section, read "How does it know?" for details. UPDATE: /usr/local/lib/systemd/system is another option, read "Gray Area" for details."

.service file example
```
[Unit]
Description=Daemon for blog server

[Service]
Type=simple
WorkingDirectory=/root/hw/blog-hw
ExecStart=/bin/python3.9 /root/hw/blog-hw/blog_server.py
Restart=always
RestartSec=3
KillSignal=SIGKILL
;Wants=checkin.service

[Install]
WantedBy=multi-user.target
```

current services:

1. blog-server.service
2. checkin.service
3. hackernews.service


```
systemctl start/stop/status/enable
```

use `Wants=` to start multiple services
```
Wants=checkin.service
```
