# Menu 导航菜单

轻量导航，支持侧边 `inline` 与顶部 `horizontal`。默认 `inline`，通过 `items` 声明树，不依赖 Router。

```tsx
import { Menu } from 'paper-ink/menu';
import 'paper-ink/menu/style.css';

<Menu
  mode="horizontal"
  aria-label="主导航"
  items={[
    { key: 'home', label: '首页', href: '#/' },
    { key: 'work', label: '工作空间', children: [
      { key: 'members', label: '成员', href: '#/members' },
    ] },
  ]}
  selectedKeys={['members']}
/>
```

按需入口的 `paper-ink/menu/style.css` 已包含折叠提示所需 Tooltip 样式；完整 `paper-ink/style.css` 与 CLI 汇总样式也包含这些依赖。CLI：`paper-ink add menu`。

## API

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| items | readonly MenuItem[] | 必填 | 唯一入口，全树 string key 唯一 |
| mode | inline / horizontal | inline | 侧边 / 顶部，顶部忽略 inlineCollapsed |
| selectedKeys / defaultSelectedKeys | readonly string[] | [] | 单叶子选中，受控 / 初始值 |
| onClick | (MenuClickInfo) => void | — | 激活叶子；先通知，可 preventDefault 取消选中和跳转 |
| onSelect | (MenuSelectInfo) => void | — | 有效选中改变时通知 |
| openKeys / defaultOpenKeys | readonly string[] | [] | 受控 / 初始展开节点 |
| onOpenChange | (string[]) => void | — | 一次操作的最终展开结果 |
| inlineCollapsed | boolean | false | 侧边仅图标，父项点击单弹层 |
| inlineIndent | number | 16 | 每层非负像素缩进 |
| accordion | boolean | false | 同层手风琴，保留隐藏后代展开记录 |
| selectable | boolean | true | false 时不产生选中改变，仍显示显式选中 |
| expandIcon | ReactNode | SVG | 自定义箭头 |
| className / style | string / CSSProperties | — | 导航根样式 |
| aria-label / aria-labelledby | string | — | 导航名称 |
| ref | HTMLElement | — | nav 根 DOM |

菜单项 `MenuLeafItem` 提供 key/label/icon/extra/disabled/title/href/target/className/style；`MenuSubMenuItem` 提供 children，不能同时 href/target。`MenuGroupItem` 为 type="group"，children 仅叶子项；`MenuDividerItem` 为 type="divider"。复杂 label 在折叠时应提供纯文本 title。回调 keyPath 顺序为叶子到根，group 不计入。MenuSelectInfo 额外包含 selectedKeys。

## 行为与边界

- 显式传入 selectedKeys/openKeys=undefined 视为受控空数组；默认值仅初始化，不在 props 更新时重置。
- 根为 nav，内部 ul/li，链接为 a，父项和无 href 叶子为 button。Tab 正常遍历可见控件，当前页使用 aria-current。
- 侧边/弹层 Up/Down、Home/End 移动；Right 展开或进入，Left 收起或返父。顶部 Left/Right 移动，Up/Down 打开进入。Escape 关闭弹层并还焦点；外部点击关闭不抢焦点。
- 选中祖先仅强调文字，不自动展开；disabled 父项禁用全部后代。业务过滤权限，删除空父项。
- 同层 accordion 与顶部切换保留后代记录；顶部始终最多一个根下拉。受控多根展开属于契约冲突，只呈现首个下拉，不静默改值。
- 折叠根弹层是本地展示状态，不写入 openKeys；后代开合仍使用 openKeys。解除折叠恢复原展开记录。
- 链接保留 Ctrl/Cmd、Shift、中键、target 原生行为，新上下文激活不改变当前选中或关闭弹层。
- Portal 继承主题且避让视口；顶部溢出横向滚动，无自动“更多”。轻微高度/透明度过渡，无弹性，支持 reduced-motion。
- 不支持 vertical、multiple、JSX 子组件、hover 级联、权限/请求/路由自动匹配、虚拟滚动、拖拽、搜索、父项同时导航与展开、itemRender、自定义 popup 容器或SSR。
- extra/label 不嵌套额外交互控件，业务复杂导航卡片单独组合。仅覆盖常用 API 子集，并非完整 antd Menu 替代。
