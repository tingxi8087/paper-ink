# 通用 Hooks

通用 Hook 独立放在 `packages/paper-ink/src/hooks`，文档站使用独立 `/hooks` 页面，不归属于 Table。表格业务 Hook 仍有自己的模块与 Table 适配文档。

```tsx
import { useRefState, useLocalstorageState } from 'paper-ink/hooks';

const [value, setValue, valueRef] = useRefState(0);
const [name, setName] = useLocalstorageState('', 'profile.name');
```

## useRefState

`useRefState(initialState)` 返回 `[state, setState, stateRef]`。setter 同步更新只读 ref，事件和异步回调可立即读取；渲染使用 state。支持惰性初始化、函数更新，setter/ref 身份稳定。连续函数更新基于最新 ref；更新函数保持纯函数。不得直接修改 ref.current。

## useLocalstorageState

`useLocalstorageState(initialState, storageKey)` 返回普通 `[state, setState]`，比 useState 增加第二个参数 key。

| 行为 | 规则 |
| --- | --- |
| 初始化 | 有缓存则 JSON.parse 读取，包括 0、false、空字符串和 null；无缓存或 JSON 无效时使用初值 |
| 惰性初值 | 支持 () => T；有有效缓存时不执行，同一 key 下改变初值不覆盖已有状态 |
| 自动保存 | 初次提交及状态变化后用 JSON.stringify 保存；批量更新只保存最终提交值 |
| 更新 | 支持值与函数更新；setter 身份稳定，不在状态更新函数内写存储 |
| 切换 key | 读取新槽位或重新初始化，不将旧槽位值写入新 key |
| undefined | 删除对应存储项；下次挂载使用初值 |
| 失败 | 读取、解析、序列化或写入失败不阻断 React 状态；写失败时原缓存可能保留 |

数据采用 JSON，普通对象/数组可用；Date 恢复为字符串，Map、函数、BigInt、循环引用等不提供原类型恢复。缓存结构与类型由业务使用同一 key 的约定维护，不自动校验 schema。Hook 面向浏览器，不要求 SSR。

首版不提供同 key 多组件共享状态或跨标签页同步；调用 localStorage.removeItem 不会自动修改已挂载的 state，需要显式 setState 或重新挂载。状态初始化/更新函数按 React 要求保持纯函数，StrictMode 可能重放初始化和更新。

## 分发

根入口和 `paper-ink/hooks` 导出两个通用 Hook。单独子路径 `paper-ink/use-ref-state` 保持兼容，`paper-ink/use-localstorage-state` 也可使用。

CLI：`paper-ink add hooks` 安装两者；也可分别安装 use-ref-state 或 use-localstorage-state，无样式和新运行时依赖。文档站提供即时 ref、本地计数、对象草稿、key 槽位和布尔偏好五个交互案例。

## 验证（2026-10-12）

类型检查、完整构建通过；244 项单元与类型检查、8 项 CLI 单元检查、81 项 Chrome 浏览器检查通过。新增 Hook 覆盖 8 项行为与 1 项类型约束；浏览器新增 3 项检查，实际刷新恢复对象/数值/布尔值并切换 key，移动端无页面横向溢出。React 18.3.1、19.3.0 的 npm 与 CLI 源码安装、类型检查、生产构建及本地存储交互通过。规划页同步为 45/82 已完成、独立条目 9/9；旧 useRefState 引入路径仍可用。
