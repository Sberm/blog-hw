#### 0.5 define`main.ex`, use`mix run main.ex`(duplicates with 2.)
main.ex:

```elixir
defmodule Main do
  Server.main()
end
```

server.ex:
```elixir
defmodule Server do
  # no need to import 
  def main do
    path = Path.join(File.cwd!(), "title.yaml")
    yaml_list = YamlElixir.read_from_file(path)
    IO.inspect(yaml_list)
  end
end
```

output
```bash
server > mix run main.ex
Compiling 1 file (.ex)
Generated server app
{:ok,
 %{
```

#### 1. Use `iex -S mix` or `mix run -e`

define main function in Server module
```elixir
defmodule Server do

  def main do
    path = Path.join(File.cwd!(), "title.yaml")
    yaml_list = YamlElixir.read_from_file(path)
    IO.inspect(yaml_list)
  end
end
```

`iex -S mix`，In interactive command line, call Server.main() as the entrance of the project
```bash
server > iex -S mix
Compiling 1 file (.ex)
Generated server app
Erlang/OTP 26 [erts-14.0] [source] [64-bit] [smp:2:2] [ds:2:2:10] [async-threads:1] [jit:ns]

Interactive Elixir (1.15.4) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> Server.main()
```

works the same as `iex -S mix`
```elixir
mix run -e "Server.main()"
```

#### 2. Use `mix run path/to/code.ex`

Compile and solves dependencies automatically, specifying file path is needed

#### 3. Use `mix run` with no arguments, or`mix app.start`

when `mix run` with no arguments，mix will read application defined in `mix.exs`, this is the launching unit of the project 

`mix run --no-halt` doesn't have any effect, is because the app isn't registered in `mix.exs`

it is required to add user's app MyApp to `mix.exs`'s application

```elixir
def application do
  [mod: {MyApp, []}]
end
```

Within the custom application MyApp, you need to implement the start method in the Application as the startup function for launching your application using mix.

```elixir
defmodule MyApp do
  use Application

  def start(_type, _args) do
    children = []
    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

In the start function, you need to return a supervisor that conforms to `{:ok, pid}` or `{:ok, pid, state}`. To meet this format, you need to input the list of child processes into `Supervisor.start_link()`.

The callback format of mix for Application, refer to: [Application](https://hexdocs.pm/elixir/1.12/Application.html)
Supervisor and child processes, refer to: [Supervisor](https://hexdocs.pm/elixir/1.12/Supervisor.html)

The child processes passed to Supervisor's `start_link` must be actual processes, not directly returned functions.
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

output

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
