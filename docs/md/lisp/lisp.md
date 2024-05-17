# lisp cheatsheet

quick reload

```lisp
(let (fn)
  (defun l (&optional filename)
    (if filename
      (setf fn filename))
    (load fn)))
```
