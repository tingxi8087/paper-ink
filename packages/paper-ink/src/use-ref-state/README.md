# useRefState

从 `paper-ink` 或 `paper-ink/use-ref-state` 引入，不依赖 Table。

```tsx
const [count, setCount, countRef] = useRefState(() => 0);
setCount(previous => previous + 1);
console.log(countRef.current); // setter 返回时即为最新值
```

元组顺序为 `[state, setter, readonlyRef]`。setter/ref 身份稳定，支持惰性初始化和值或函数更新。同一事件内连续函数更新基于最新 ref 值；界面仍按 React 调度更新，不把 ref 当成已提交的渲染快照。ref.current 是只读类型，更新对象也应使用不可变方式。

保存函数值时使用 `setValue(() => callback)`，与 React useState 的函数更新约定一致。
