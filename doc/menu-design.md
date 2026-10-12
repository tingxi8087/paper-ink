# 轻量 Menu 设计

状态：2026-10-12 首期已实现侧边与顶部横向导航。本文记录已确认 API、功能、交互与首期边界；实际导出以源码、组件 README 和文档站 API 为准。

## 职责与原则

- Menu 负责导航展示、单项选中、子菜单展开、折叠展示、键盘和焦点处理。
- 业务负责路由匹配、跳转策略、权限过滤、请求和侧栏容器；Menu 不读取地址栏或依赖 Router。
- 常规名称与回调尽量接近 antd；只实现常用子集，不承诺完整兼容。
- 唯一菜单声明入口为 items；不同时提供 Menu.Item / Menu.SubMenu / ItemGroup 的 JSX 声明与 React 子元素结构收集。
- 当前页面与展开节点分别控制；不提供一个统管路由、选中、展开和折叠的配置对象。
- 使用已有主题、SVG 图标和弹层基础，不引入完整菜单引擎、路由库或新增图标库。
- 默认紧凑黑白风格，动效平缓且遵循 prefers-reduced-motion；轻量以产物体积和实际交互测量为依据。

## 功能范围

| 功能 | 阶段 | 支持范围 |
| --- | --- | --- |
| 侧边菜单 | 首期 | mode="inline"，子菜单在当前位置展开 |
| 多级结构 | 首期 | children 递归展示，不人为限制层级；深层级仍需业务评估可用性 |
| 单项选中 | 首期 | 一个当前叶子项，父级显示包含当前页面的强调状态 |
| 受控与非受控 | 首期 | selectedKeys、openKeys 分开管理 |
| 分组、分隔线 | 首期 | 分组标题不可选中、不折叠；分隔线无交互 |
| 图标和附加内容 | 首期 | icon、extra；徽标、数量由业务组合 |
| 禁用 | 首期 | 叶子项禁用；父菜单禁用整棵子树 |
| 侧栏折叠 | 首期 | inlineCollapsed 图标状态、叶子提示、父项点击弹层 |
| 同层手风琴 | 首期 | 可选 accordion，同一父级下只展开一个子菜单 |
| 原生链接 | 首期 | 叶子 href/target，保留新标签页、右键和修饰键点击 |
| 路由库接入 | 首期组合能力 | 业务计算 selectedKeys，通过 onClick 接入跳转 |
| 键盘与无障碍 | 首期 | nav/列表/链接/展开按钮、aria-current/expanded、Tab、辅助方向键和 Escape |
| 顶部横向导航 | 首期 | mode="horizontal"；一级横排、点击下拉、单弹层内多级展开，宽度不足时横向滚动 |
| 自动收进“更多” | 暂缓 | 首期不做宽度测量、溢出节点搬移与折叠分配 |
| 独立 vertical 浮层模式 | 暂不实现 | 不复制 antd 的独立级联悬浮模式 |
| 多选、层层侧向弹层 | 暂不实现 | 首期单项导航，折叠父项只使用一个弹层 |
| 权限、异步数据、路由生成 | 不内置 | 业务过滤和更新 items |

暂缓项不作为首期占位 API；Menu 已按首期常用 API 子集标记已有基础实现，暂缓能力不计为已完成。

## 菜单数据

所有节点提供稳定、全局唯一的 string key，包括分组与分隔线。不根据数组下标生成 key；label 的变化不影响状态身份。

```tsx
import type { MenuItem } from 'paper-ink/menu';

const items: MenuItem[] = [
  { key: 'overview', label: '概览', icon: <OverviewIcon />, href: '#/overview' },
  {
    key: 'workspace',
    label: '工作空间',
    icon: <WorkspaceIcon />,
    children: [
      { key: 'members', label: '成员', href: '#/members' },
      { key: 'settings', label: '设置', href: '#/settings' },
    ],
  },
  {
    key: 'tools', type: 'group', label: '工具',
    children: [
      { key: 'logs', label: '操作记录', href: '#/logs', extra: <Badge count={3} /> },
    ],
  },
  { key: 'separator', type: 'divider' },
];
```

| 字段 | 计划类型 | 默认 / 行为 |
| --- | --- | --- |
| key | string | 必填，全树唯一，作为状态与回调标识 |
| label | ReactNode | 叶子项和子菜单必填；分组标题可省略 |
| icon | ReactNode | 叶子项、子菜单的自定义图标 |
| children | MenuItem[] | 子菜单内容；group 只接受叶子项，不嵌套子菜单或分组 |
| disabled | boolean | 默认 false；子菜单为 true 时禁用全部后代 |
| extra | ReactNode | 叶子项或父标题末端的徽标/数量等非交互内容 |
| href | string | 仅叶子项；提供时使用原生 a，否则使用 button |
| target | string | 仅链接叶子项；_blank 配合安全 rel |
| title | string | 折叠提示与可访问名称；默认从纯文本 label 获取 |
| type | 'group' / 'divider' 或省略 | 普通项省略；有 children 的普通项为子菜单 |
| className / style | string / CSSProperties | 当前节点的展示容器，不覆盖整个子树 |

- 叶子项负责导航或激活，父项只负责展开；类型上区分叶子与父项，父项不允许同时提供 href/target。
- label 是展示内容，不直接嵌套 a/button；已有路由 Link 不放进默认交互元素内部。首期不公开路由组件替换或 itemRender。
- extra 不放嵌套按钮、输入框等额外交互；需要复杂导航卡片时由业务单独组合。
- 复杂 label 或仅图标内容应提供 title；无法提取纯文本时不猜测 ReactNode 的含义。
- 无图标项在折叠时使用一个保留名称的文字缩写占位，不凭空生成业务图标；缩写仅展示，完整名称仍供提示与辅助技术使用。
- 重复 key 属于配置错误，开发环境提示；权限过滤后为空的父项由业务删除，组件不把空父项自动改成导航链接。

## Menu 属性

| 属性 | 计划类型 | 默认 / 行为 |
| --- | --- | --- |
| items | readonly MenuItem[] | 必填，唯一菜单声明入口 |
| mode | 'inline' / 'horizontal' | 默认 inline；侧边导航 / 顶部导航；与 antd 默认 vertical 不同 |
| selectedKeys | readonly string[] | 受控选中项；首期最多一个叶子 key，[] 表示不选中 |
| defaultSelectedKeys | readonly string[] | 非受控初始值，默认 []；后续变更不覆盖当前状态 |
| onSelect | (info: MenuSelectInfo) => void | 有效选中值变化时通知，已选中项不重复通知 |
| onClick | (info: MenuClickInfo) => void | 叶子项激活时通知，已选中项仍可触发 |
| openKeys | readonly string[] | 受控展开的子菜单 keys；不包含 group/叶子/分隔线 |
| defaultOpenKeys | readonly string[] | 非受控初始展开值，默认 [] |
| onOpenChange | (keys: string[]) => void | 用户展开/收起操作的一次最终通知 |
| inlineCollapsed | boolean | 默认 false；仅 inline 有效，horizontal 忽略；不内置折叠按钮 |
| inlineIndent | number | 默认 16，侧边及弹层内逐层缩进，非负像素值；不改变顶部一级排列 |
| accordion | boolean | 默认 false；纵向结构同层手风琴；horizontal 顶层始终最多一个下拉，不受此开关影响 |
| selectable | boolean | 默认 true；false 保留激活、链接和展开，不产生新的选中状态 |
| expandIcon | ReactNode | 替换默认 SVG 展开箭头，不公开内部状态工厂 |
| className / style | string / CSSProperties | 导航根元素样式 |
| aria-label / aria-labelledby | string | 导航区域名称；多个导航区域应使用不同名称 |
| ref | HTMLElement | 访问导航根元素；首期不提供菜单控制实例 |

受控判断以是否传入属性为准：显式传入 selectedKeys/openKeys=undefined 时按受控空数组处理，仍可通知修改请求，不回退到内部状态。传入多个 selectedKeys 不属于首期契约；开发环境提示，展示按第一个 key 处理，不自动补选其他有效项。

## 回调协议

```ts
import type { MouseEvent } from 'react';

type MenuClickInfo = {
  key: string;
  keyPath: string[];
  domEvent: MouseEvent<HTMLElement>;
};

type MenuSelectInfo = MenuClickInfo & {
  selectedKeys: string[];
};
```

- keyPath 从叶子到外层父菜单，例如 ['members', 'workspace']；分组和分隔线不进入 keyPath。
- 原生链接或按钮的键盘激活通过 click 通道处理，避免分别调用鼠标和键盘回调造成重复。
- 叶子激活先 onClick，再在允许默认选择且值变化时 onSelect。onClick 的 preventDefault() 可取消菜单默认选中动作及原生链接默认跳转；受控路由仍可在业务跳转完成后更新 selectedKeys。
- 点击父项只修改展开状态并通知 onOpenChange，不触发叶子的 onClick/onSelect；首期不提供 onTitleClick。
- 禁用节点不触发激活、选择或展开回调；disabled 子菜单内的链接也不能跳转。
- 数据、选中 props 或模式变化本身不触发用户事件回调，不通过渲染过程调用业务函数。

## 选中与展开规则

| 场景 | 计划行为 |
| --- | --- |
| 叶子选中 | 只有叶子进入 selectedKeys；祖先仅显示包含当前页面的样式 |
| 点击已选中叶子 | 仍 onClick；不重复 onSelect |
| 点击父项 | 切换其 openKeys 状态，子节点不被自动选中 |
| 外部选中变化 | 不自动改 openKeys；业务决定是否展开当前路径 |
| 非受控初始选中 | 也不自动展开祖先；需要展示路径时同时提供 defaultOpenKeys |
| 收起父项 | 隐藏后代，但保留后代展开 key，再次展开恢复原结构 |
| accordion 展开兄弟 | 收起同父级兄弟；其他层级及隐藏的后代展开记录保留，一次 onOpenChange |
| 受控 accordion | 用户操作提出符合规则的新 keys；外部传入多个同层 key 时提示契约冲突，不静默改 props |
| 数据删除/过滤 | 缺失 key 不展示、不参与有效交互，不自动回调或为业务更换当前页面 |
| 切换折叠 | 保留 selectedKeys/openKeys；不因为模式切换触发 onSelect/onOpenChange |
| selectable=false | 不更新选中或通知 onSelect；显式 selectedKeys 仍可展示当前路由 |
| items=[] | 渲染空导航列表，不内置 Empty 或请求占位 |

菜单默认不选择首项，不从 href 推导 key，不猜测路径前缀。菜单层级和 URL 层级可以不同，当前项与祖先展开路径由业务映射。

## 顶部横向菜单

```tsx
<Menu
  mode="horizontal"
  aria-label="顶部导航"
  items={items}
  selectedKeys={currentMenuKey ? [currentMenuKey] : []}
  openKeys={openKeys}
  onOpenChange={setOpenKeys}
/>
```

- 共用 items、selectedKeys、openKeys、回调和链接协议；不另外创建 HeaderMenu，不绑定页面 Header 布局。
- 一级菜单横排，不换行；父项点击、Enter 或 Space 切换下拉，不以 hover 自动展开。
- 下拉从父项下方对齐，必要时自动避让；内部是同一个纵向菜单，多级 children 在该弹层内展开，不产生侧向级联浮层。
- 顶部父项的下拉显隐由 openKeys 控制，后代展开也使用 openKeys。首期最多一个顶部下拉；开启另一个时替换顶层展开 key，保留隐藏的后代记录，一次 onOpenChange。
- 受控 openKeys 同时包含多个顶部父项属于契约冲突，开发环境提示，仅呈现第一项对应的下拉；不静默修改外部值。
- 点击外部、Escape 或普通激活叶子时，提出移除当前顶部展开 key 的请求；后代记录保留。非受控立即关闭，受控等待业务更新 openKeys。
- 下拉外部点击不抢焦点；Escape 恢复触发父项焦点。受控弹层仍未关闭时，不提前将焦点移回并假装已关闭。
- 顶层 group 不显示标题，其叶子在组内横排；顶层 divider 展示竖分隔线。下拉内部保留正常分组标题和横分隔线，分组不参与 keyPath。
- 宽度不足时在菜单自身容器内横向滚动，不挤压页面、不自动收进“更多”；键盘聚焦项滚动到可见位置。弹层使用 Portal，不被滚动容器裁切。
- inlineCollapsed 在 horizontal 下无效，不自动把顶部菜单切成图标模式，也不在窄屏自动切成 Drawer 或汉堡菜单。
- 模式切换保留选中和展开数据，释放旧模式的弹层并按新模式有效 keys 呈现；业务需要把 openKeys 规范成当前模式允许的结构，组件不因 mode 变化额外发出用户操作回调。

顶部键盘规则：Left/Right 在可用一级项之间移动，Home/End 到首尾；Down 打开父项下拉并进入第一项，Up 打开并进入最后一项。弹层内部使用纵向键盘规则，Escape 关闭并返回触发项。Tab 正常前进，不拦截浏览器修饰键快捷操作。

## 折叠菜单

- 侧栏宽度由外部容器管理；不提供 collapsedWidth、侧栏 Header/Footer、折叠按钮或断点配置。
- 叶子项隐藏文字和 extra，居中展示图标或文字缩写，悬停/聚焦通过现有 Tooltip 展示完整名称。
- 父项点击打开一个弹层，弹层内恢复正常文字与纵向菜单；深层节点在同一个弹层内展开，不产生级联侧向弹层。
- 同时最多打开一个折叠根子菜单弹层。弹层显隐是展示状态，不把它写入 openKeys；弹层内部后代展开仍使用 openKeys/onOpenChange。
- 折叠时分组不显示标题，但保留其叶子项；分隔线保留。title 不替代正常展开时的 label。
- 点击外部、Escape 或激活可用叶子项关闭弹层；键盘操作关闭后将焦点恢复到触发父项，鼠标点击外部不抢回焦点。
- inlineCollapsed 切回 false 时关闭弹层，恢复原 openKeys 展示。
- 弹层继承当前主题，复用定位和边界避让；窄屏可操作，但不自动转换为 Drawer。首期不开放弹层容器、延迟、各子菜单弹层样式等配置。

## 路由与权限接入

普通网页/Hash Router 使用 href，选中项由当前路由计算：

```tsx
<Menu
  aria-label="主导航"
  items={items}
  selectedKeys={[currentMenuKey]}
  defaultOpenKeys={['workspace']}
/>
```

路由库通过业务侧接入；下面的 navigate 与 menuRoutes 都由调用方提供：

```tsx
<Menu
  items={items}
  selectedKeys={currentMenuKey ? [currentMenuKey] : []}
  openKeys={openKeys}
  onOpenChange={setOpenKeys}
  onClick={({ key, domEvent }) => {
    // 只拦截普通主键激活，保留链接的新标签页和修饰键行为。
    if (domEvent.button !== 0 || domEvent.ctrlKey || domEvent.metaKey || domEvent.shiftKey || domEvent.altKey) return;
    const target = domEvent.currentTarget instanceof HTMLAnchorElement ? domEvent.currentTarget.target : '';
    if (target && target !== '_self') return;
    const destination = menuRoutes[key];
    if (destination) {
      domEvent.preventDefault();
      navigate(destination);
    }
  }}
/>
```

- href 存在时保留原生链接语义；Ctrl/Cmd、Shift、非主键或 target 打开新上下文时，不更新当前页面的非受控选中，也不关闭当前菜单弹层。
- onClick 对实际 click 激活仍可通知业务；中键由原生 auxclick 处理，首期不额外提供菜单 auxclick 回调。
- selectedKeys 以实际路由为准，跳转失败不先假装导航成功。未传 href 的按钮项本身不能提供原生新标签页能力。
- 权限先过滤 items，再递归移除空父项；不提供 hidden/visible/permission 的重复入口。
- 异步加载后直接更新 items，加载与请求错误由业务展示；父标题不承担请求触发协议。

## 无障碍与外观

- 根使用 nav，内部使用 ul/li；链接为 a，父项和无 href 的激活项为 button。
- 当前导航叶子使用 aria-current，父项使用 aria-expanded/aria-controls；分组标签与内容建立清晰关系。
- 不给普通网站导航套 role="menu"/menuitem；Dropdown 继续作为操作菜单使用其自身语义。
- Tab/Shift+Tab 正常遍历可见、可用链接和按钮；首期不会把所有导航项压成一个必须依靠方向键访问的焦点入口。
- 侧边与弹层内辅助 Up/Down、Home/End 在可见可用项间移动；Right 展开父项或进入已展开子项，Left 收起父项或返回父项；顶部一级项采用横向键盘规则，不拦截带修饰键的浏览器快捷操作。
- 折叠父项 Enter/Space 打开弹层，并允许键盘进入第一项；Escape 关闭并恢复焦点。
- 收起包含当前焦点的子树时，先把焦点移回父项，再隐藏子节点，避免焦点落在隐藏内容中。
- 当前叶子默认浅灰背景、深色文字；祖先只强调文字，不增加多个选中背景或滑动指示条。
- 多层展开使用短暂、平缓的高度过渡，弹层使用可被连续打断的淡入淡出；退出完成后再移除，无缩放、弹性或滚动回弹。
- 内置展开箭头等使用统一 SVG；保留 icon/expandIcon 自定义入口，不捆绑业务图标集合。
- 外观消费现有 color、spacing、radius、font、motion 主题变量；首期不新增 light/dark theme 别名或大量 Menu 专属 token。

## 首期边界与兼容差异

- 支持 mode="inline" 和 mode="horizontal"，默认 inline；不承诺 antd 默认 vertical 行为。
- 只用 items，不支持 JSX 子组件声明、HOC 结构收集和内部节点替换。
- 保留 selectedKeys 的数组写法，但仅支持一个叶子项；不实现 multiple、onDeselect。
- href/target 与 accordion 是本库补充 API，首期不提供路由 Link 替换或自动路径匹配。
- 不支持父项同时导航与展开；group 仅组织叶子项，无可折叠分组。
- 不内置 Router、权限系统、动态请求、菜单搜索、虚拟滚动、拖拽排序或侧栏布局。
- 不支持自动“更多”溢出菜单、vertical 级联浮层、hover 展开策略、延迟配置和自定义每级 popup。
- 不提供 forceSubMenuRender、popupRender、语义 classNames/styles、多套主题别名、菜单控制实例等首期非必需入口。
- 不承诺 SSR；原生链接语义、键盘操作、焦点恢复和 reduced-motion 属于首期必需能力。
- Dropdown 与 Menu 可复用内部 SVG、主题、定位等基础，但公共数据类型与状态协议分别维护，不为复用而耦合导航和操作菜单。

## 分发、实施与验收

计划 npm 根入口和 paper-ink/menu，提供完整样式及 paper-ink/menu/style.css；CLI 提供 paper-ink add menu，声明实际源码依赖，不要求安装路由库。

实施顺序：

1. items 树、单项选中、inline 展开、分组与禁用，完成原生导航语义和核心键盘行为。
2. 受控展开、同层手风琴、动态数据与焦点收起处理。
3. 侧边折叠状态、提示、单弹层内多级导航、主题与连续动效。
4. 顶部 horizontal、受控下拉、一级键盘移动、横向溢出与模式切换。
5. 补齐 npm/CLI、文档案例、产物体积与浏览器验证；用文档站侧栏验证实际可用性。

| 验收类别 | 必需覆盖 |
| --- | --- |
| 数据 | 唯一 key、深层 children、group/divider、空树、权限过滤后结构 |
| 选中 | 受控/非受控、空值、同值不重复通知、祖先强调、未知 key、不自动补选 |
| 展开 | 嵌套开合、同层 accordion、隐藏后代状态保留、一次最终通知 |
| 原生链接 | 普通点击、键盘激活、Ctrl/Cmd、Shift、中键、target、新标签页不改当前状态 |
| 禁用 | 父级禁用整树，链接不可跳转，禁用项不参与键盘移动 |
| 折叠 | 选中/展开状态保持、无图标与复杂 label、单弹层、深层展开、退出与切换恢复 |
| 顶部 | 单层/多级、受控下拉唯一性、group/divider、左右移动、上下进入、溢出滚动、Portal 不被裁切、模式切换 |
| 焦点与键盘 | Tab、方向键、Home/End、Escape、收起焦点子树、鼠标外部关闭不抢焦点 |
| 外观 | 黑白紧凑、SVG、主题继承、窄容器、长标签、徽标、无弹性、reduced-motion |
| 分发 | npm 与 CLI 实际运行、React 18/19、独立 Menu 入口和其他组件按需体积 |

演示至少覆盖：基础顶部、顶部下拉与多级内容、顶部受控开合、长菜单溢出、顶部/侧边切换、基础侧栏、多级菜单、分组与徽标、受控路由、同层手风琴、图标折叠、无图标折叠、禁用父项、动态权限过滤、窄容器、局部主题和键盘操作。文档站 API 使用四列表格，支持边界和导入使用统一展示组件。

完成组件后更新 doc/component-priorities.md 并运行 node scripts/build-component-priorities.mjs，检查状态筛选和统计；首期只标记已实际完成的常用 API 子集，尚未完成的后续能力需在 README 单独列出，不把完整 antd Menu API 标为已完成。

## 实现记录

- 核心源码位于 packages/paper-ink/src/menu，提供完整公共类型与 README；不依赖 Router 或完整菜单引擎。
- 文档站侧栏实际使用 Menu，另提供 19 个可编辑案例及四列 API 表、支持边界和导入卡片。
- Menu JS gzip 约 6.6 KB，独立 CSS gzip 约 1.4 KB（含 Tooltip 依赖样式，React 外置）；实际字节以 check:size 为准。
- 已补回归：初始受控弹层定位、隐藏内容聚焦、动态删除/禁用节点焦点、Escape 不穿透外层 Modal、点击外部不抢焦点、连续淡出和源码独立消费。最终回归：302 项单元测试、10 项 CLI 测试、111 项浏览器测试通过；全仓 typecheck/build、npm 打包与 React 18.3.1 / 19.3.0 的 npm 和 CLI 源码消费均通过。

## 参考

- [Ant Design Menu](https://ant.design/components/menu/)：items、selectedKeys、openKeys、inlineCollapsed 等常规入口命名参考。
- [W3C Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)：普通网站导航的原生链接与展开按钮语义参考。
