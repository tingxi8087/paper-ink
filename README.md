# Paper Ink

默认黑白主色、保留语义色的 React UI 组件库。常规组件 API 参考 Ant Design，支持范围逐步扩展，主题结构独立设计。

当前为 **0.1.0 本地开发版本，尚未发布到 npm**。已实现 Button、Input / Search / Password / TextArea、受控 Modal、Checkbox / Radio / Switch / Select、Tabs、Tag / Empty / Alert / Spin / Tooltip / Message、Stack / Inline / SimpleGrid 布局、基础 ConfigProvider、源码安装 CLI，以及 React + Vite + MDX 文档站和在线 JSX 编辑预览。

## 开发

要求 Node.js 22.12+、pnpm 10。

```bash
pnpm install
pnpm dev
```

打开终端显示的地址，进入组件页可以修改代码实时预览；主题实验室可以调整主色、圆角与按钮内边距。

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm check:size
pnpm check:package
PLAYWRIGHT_CHANNEL=chrome pnpm check:cli
pnpm exec playwright install chromium  # 首次执行浏览器测试
pnpm test:browser
# 也可使用本机 Chrome：PLAYWRIGHT_CHANNEL=chrome pnpm test:browser
```

官网构建结果在 `apps/website/dist`，可部署到静态托管服务。采用 Hash 路由和相对资源路径，支持静态子目录部署。

## CLI 安装源码

目前 CLI 尚未发布，可以从仓库操作你的 React + TS 项目：

```bash
pnpm build:registry
pnpm cli init --cwd /absolute/path/to/your-app
pnpm cli add button input modal --cwd /absolute/path/to/your-app --dry-run
pnpm cli add button input modal --cwd /absolute/path/to/your-app
```

从目标项目的 `src/App.tsx` 使用：

```tsx
import { Button, ConfigProvider } from './components/paper-ink';
import './components/paper-ink/style.css';
```

支持自定义目录、依赖解析和重复安装。默认保留已安装文件，发现无归属冲突时停止；`--overwrite` 才覆盖。样式需在业务入口导入一次；Modal 要求目标项目已有与 React 版本匹配的 react-dom。详见 [源码分发说明](doc/distribution.md)。

## 使用构建后的组件库

```bash
pnpm build
pnpm --dir packages/paper-ink pack
```

在消费项目安装生成的 tgz 后：

```tsx
import { Button, ConfigProvider } from 'paper-ink';
import 'paper-ink/style.css';

export default function App() {
  return <Button type="primary">保存</Button>;
}
```

也可以按需引入 `paper-ink/button`、`paper-ink/input`、`paper-ink/modal` 与对应的 `style.css`；Modal 样式入口包含 Button。React 和 ReactDOM 是 peer dependencies，不打包到组件库中。

## 目录

- `packages/paper-ink`：对外发布的组件库实现、类型、样式和行为测试。
- `packages/cli`：安装本地组件源码的 CLI，零运行时依赖。
- `registry`：组件文件和共享依赖清单，源码由构建脚本生成。
- `apps/website`：官网、MDX 使用文档、组件演示和主题实验室。
- `doc`：内部规划、主题设计与项目结构记录。
- `tests/browser`：构建后官网的浏览器交互验证。
- `scripts`：样式构建、消费验证和体积检查。

## 范围与差异

Button 支持常用属性、color/variant、className/style、语义 classNames/styles、自定义 loading 图标和原生 ref。Input/TextArea 支持清空、状态、计数、原生表单与高度自适应；Input.Search 提供搜索按钮、清空来源与加载状态，Input.Password 支持自定义图标和受控显隐。Modal 支持受控显示、焦点管理、Portal 主题和内容生命周期；业务 ref.open(config) 示例见文档站。详见各组件页。

在线编辑器支持 JSX／函数组件和 Hooks，提供站内组件 scope，不支持任意模块 import 或包安装。源码修改仅保留在当前页面。

主题当前支持显式深层覆盖、嵌套继承、inherit: false 和少量组件变量；自动颜色派生和暗色预设留待后续设计。ConfigProvider 会渲染 display: contents 作用域元素。组件为默认值和 React 主题提供内联 CSS 变量；直接覆盖同名 CSS 变量需要遵循内联样式优先级，不是当前推荐入口。

## 开源

MIT。贡献前请阅读 `doc` 中的设计约定；新增组件需要同步公开类型、行为、演示、API 支持范围及兼容差异。此项目独立实现，不依赖 antd。

布局组件支持 4 / 8 / 16px 主题间距、自动列数、列比例和跨列。使用方式见 [布局组件](doc/layout-components.md)。源码安装：`pnpm cli add stack inline simple-grid --cwd /absolute/path/to/your-app`。

推荐指数为 5 的组件现已全部提供常用 API 子集：Button、Input、Modal、ConfigProvider、Checkbox、Radio、Switch、Select、Tabs、Tag、Empty、Alert、Spin、Tooltip、Message。API 与暂未支持的能力见文档站各组件页；不表示实现了 antd 的完整 API。

Message 推荐使用 `message.useMessage()` 与 contextHolder 继承主题。Select 支持单选、多选、tags 和键盘搜索；大型数据列表的虚拟化、antd Form 集成和 Tabs 可编辑模式暂未提供；已提供独立 Form。

本批新增 18 个 4 分组件：Typography、Divider、Breadcrumb、Dropdown、Pagination、InputNumber、Avatar、Badge、Card、Collapse、Descriptions、Popover、Segmented、Drawer、Popconfirm、Progress、Skeleton、App。Space、DatePicker、antd Form/Table API 暂不实现；独立轻量 Form 和 Table 已实现，见 doc/form-design.md、doc/table-design.md 和文档站案例；布局继续使用 Inline / Stack / SimpleGrid。

InputNumber 使用 `@rc-component/mini-decimal` 的字符串十进制运算，支持 `stringMode`。App.useApp() 提供继承主题的 message 和 modal，确认弹窗支持异步回调、更新、销毁及等待结果。内置图标统一为 SVG。

新增 Rate、Timeline、Result：支持常用 antd 风格 API、共享主题与 SVG 图标，提供 npm 子路径和 CLI 源码安装，完整 API 与支持边界见文档站。

## 轻量表格与公共 Hook

```tsx
import { Table, useBasePageTable, useTableChecked, useRefState } from 'paper-ink';
import 'paper-ink/table/style.css';

const table = useBasePageTable<User, SearchParams>({ getTableData });
const selection = useTableChecked({
  tableData: table.tableData, setTableData: table.setTableData, idName: 'id',
});
// 在组件内创建 Hook，然后直接把返回值交给 Table。
<Table rowKey="id" source={table} selection={selection} columns={columns} />;
```

Table 内置分页，支持固定列、汇总和实际溢出 Tooltip；也可用 data 展示静态数据。getTableData(query, signal) 由业务提供，Hook 管理取消与过期响应；选择状态保存在业务行 _checked 中。三个入口支持 table、table-hooks、use-ref-state 子路径，CLI `paper-ink add table` 同时安装需要的 Hook 与样式依赖。useRefState 独立提供 [state, setState, stateRef]。树形、展开、合并、虚拟滚动留待后续。
