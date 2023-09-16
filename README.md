# 个人博客源代码

#### 运行命令
``` bash
# 开启nginx
nginx -c `pwd`/nginx.conf
# 开启后端
python blog_server.py
```

#### 模块

|功能|路径|
|:---:|:---:|
|个人博客|根目录, md/, blog/|
|美食博客|review/|
|文档|docs/|

#### 个人博客

主页 index.html
blog_server.py中使用github markdown api转换md中的markdown文件为html文件，保存至blog/中。css使用github近似css，在blog/中。

#### 美食博客

主页 review/index.html, 编辑主页 review/edit/index.html, 编辑器主页 review/edit/editor.html.

数据库使用postgreSQL

数据库表结构 review/sql/

#### 文档

主页docs/index.html. 在进入主页之前会使用index_a.html进行密码认证，认证成功后跳转至真主页。

同样在blog_server.py中，对docs/md/中的md文件监控，若文件发生更改，调用github markdown api转换为html文件，保存在docs/content中。

#### 异常

* 部分大文件未使用git记录版本，故部分图片可能无法正常显示。


#### 使用技术

|功能|语言|文件|
|:---:|:---:|:---:|
|前端|纯js|根目录的html(内嵌css), blog, review, review/edit, docs中的.html, .css, .js|
|后端|python + postgreSQL + Fastapi|blog_server.py|
|静态资源服务器|nginx|nginx.conf|
