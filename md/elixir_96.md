## 使用mix启动elixir应用

#### 0.5 定义`main.ex`, 使用`mix run main.ex`(和2.重复)
main.ex:

```elixir
defmodule Main do
  Server.main()
end
```

server.ex:
```elixir
defmodule Server do
  # 无需import 
  def main do
    path = Path.join(File.cwd!(), "title.yaml")
    yaml_list = YamlElixir.read_from_file(path)
    IO.inspect(yaml_list)
  end
end
```

输出
```bash
server > mix run main.ex 
Compiling 1 file (.ex)
Generated server app
{:ok,
 %{
```

#### 1. 使用 `iex -S mix` 或 `mix run -e`

在Server模块中定义主函数main
```elixir
defmodule Server do

  def main do
    path = Path.join(File.cwd!(), "title.yaml")
    yaml_list = YamlElixir.read_from_file(path)
    IO.inspect(yaml_list)
  end
end
```

`iex -S mix`，交互命令行中启动Server.main()主函数作为项目启动入口
```bash
server > iex -S mix
Compiling 1 file (.ex)
Generated server app
Erlang/OTP 26 [erts-14.0] [source] [64-bit] [smp:2:2] [ds:2:2:10] [async-threads:1] [jit:ns]

Interactive Elixir (1.15.4) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> Server.main()
```

与iex -S mix起到同样作用的
```elixir
mix run -e "Server.main()"
```

#### 2. 使用 `mix run path/to/code.ex`

自动编译和解决依赖, 需要指定文件路径

#### 3. 使用 `mix run` 无参数, 或者`mix app.start`

`mix run`无参数时，会读取`mix.exs`中定义的application，为用户项目的启动单位。

`mix run --no-halt`时无反应，由于用户未在mix.exs中注册应用。

需要在`mix.exs`的application中加入自定义应用MyApp

```elixir
def application do
  [mod: {MyApp, []}]
end
```

自定义应用MyApp中，要implement Application中的start方法，作为mix启动您应用的启动函数。

```elixir
defmodule MyApp do
  use Application

  def start(_type, _args) do
    children = []
    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

在start函数中，需要返回一个符合{:ok, pid} or {:ok, pid, state}的supervisor。为了符合这个格式，需要将child process的list输入`Supervisor.start_link()`中。

mix对Application的回调格式，参照: [Application](https://hexdocs.pm/elixir/1.12/Application.html)

Supervisor和child process等，参照: [Supervisor](https://hexdocs.pm/elixir/1.12/Supervisor.html)


Supervisor start_link的child process得是process, 而不能是一个直接返回的函数
```elixir
defmodule Child do
  def foo do
    IO.puts("I am a child.")
  end
end

defmodule Foo do
  use Application

  def start(_type, _args) do
    children = [%{
      id: Child,
      start: {Child, :foo, []}
    }]
    a = Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

输出

```bash
server > mix run
Compiling 1 file (.ex)
warning: variable "a" is unused (if the variable is not meant to be used, prefix it with an underscore)
  lib/foo.ex:15: Foo.start/2

I am a child.

16:31:28.052 [notice] Application server exited: Foo.start(:normal, []) returned an error: shutdown: failed to start child: Child
    ** (EXIT) :ok

16:31:28.064 [notice] Application yaml_elixir exited: :stopped

16:31:28.065 [notice] Application yamerl exited: :stopped
** (Mix) Could not start application server: Foo.start(:normal, []) returned an error: shutdown: failed to start child: Child
    ** (EXIT) :ok
server > 
```