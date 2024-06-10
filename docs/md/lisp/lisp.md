# lisp cheatsheet

quick reload

```lisp
(let (fn)
  (defun l (&optional filename)
    (if filename
      (setf fn filename))
    (load fn)))
```

上面这个可以加到sbclrc`/root/.sbclrc`

如果报`Package QL does not exist.`
```lisp
(load "~/quicklisp/setup.lisp")
```
