```bash
error[E0277]: the `?` operator can only be used on `Result`s, not `Option`s, in a function that returns `Result`
  --> src/main.rs:11:59
   |
5  | fn display_dir(dir: &Path) -> io::Result<()>{
   | -------------------------------------------- this function returns a `Result`
...
11 |         let path_str  = path.file_name().unwrap().to_str()?;
   |                                                           ^ use `.ok_or(...)?` to provide an error compatible with `Result<(), std::io::Error>`
   |
   = help: the trait `FromResidual<Option<Infallible>>` is not implemented for `Result<(), std::io::Error>`
   = help: the following other types implement trait `FromResidual<R>`:
             <Result<T, F> as FromResidual<Yeet<E>>>
             <Result<T, F> as FromResidual<Result<Infallible, E>>>

For more information about this error, try `rustc --explain E0277`.
```

解决:

```rust
path.file_name().unwrap().to_str().unwrap();
```

error handling 问题，?抛出错误，但Option和Result不共用，放弃error处理，直接unwrap()取字符串
