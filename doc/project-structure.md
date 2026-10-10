# 项目目录与文档站

记录日期：2026-10-10

## 采用的结构

pnpm workspace：一个组件库包 `packages/paper-ink`、一个源码安装 CLI `packages/cli`，一个文档站应用 `apps/website`。

- 组件实现、类型、CSS、行为测试按组件聚合存放。
- 主题类型、默认值、配置合并与 CSS 变量转换统一放在组件库 `src/theme`。
- `src/internal` 预留给实际复用的内部能力，不对外导出。
- 文档站使用 React + Vite + MDX。
- `doc` 存内部设计记录，官网内容放在 `apps/website/src/content`。
- npm 包仅发布 dist、包 README 和许可证，不包含文档站或在线编译依赖。

## 官网

采用 Hash 路由，支持静态托管：

| 地址 | 内容 |
| --- | --- |
| `#/` | 首页与组件库定位 |
| `#/guide` | 安装、引入、开发命令、主题和编辑器使用说明 |
| `#/button` | MDX 组件文档、可编辑演示、API、主题变量和兼容差异 |
| `#/input` | Input / TextArea 演示、API、自适应与计数 |
| `#/modal` | Modal 演示、API 与 ref.open(config) 业务示例 |
| `#/theme` | 主题实验室，配置修改、真实组件预览及复制 |
| `#/examples` | Input / TextArea 与 Button 的表单组合演示 |

## 在线编辑器

使用 React Live 在浏览器编译执行 JSX。示例由独立 TSX 文件或直接 JSX 字符串提供，TSX 去掉 import 和 export 包装后进入编辑器；组件与 Hooks 通过 scope 提供。展示和运行使用同一份代码。

支持编辑、即时预览、复制、重置、语法和渲染错误提示、函数组件与 Hooks。暂不支持任意模块导入、npm 安装或代码自动保存。

编辑器在当前文档页面执行用户输入的代码，不是隔离的多文件沙箱。仅用于用户主动编辑的本地示例，不加载外部提交的代码。

## 开发与发布验证

- 官网开发时通过 Vite alias 引用组件库源码，即时预览修改。
- 组件包使用 TypeScript 输出 ESM 和声明文件，CSS 独立复制。
- `pnpm build` 构建组件包和官网；官网输出为静态文件。
- 单元测试验证 Button 扩展 API、Input/TextArea 原生表单与输入、Modal 焦点/弹层生命周期和主题继承。
- 浏览器测试验证构建后官网的在线编辑、错误恢复、主题、组合场景与移动布局。
- 包消费验证检查 tgz 安装后的导出、声明、CSS 和 React 18/19 使用。
- 体积检查以构建后的 Button 为入口打包，React 外置；初始 JS 上限设为 8 KB gzip，后续随功能审视。

## 当前边界

- 已提供 Button、Input/TextArea 和受控 Modal，支持范围和差异见各官网组件页。
- ConfigProvider 为基础版本，并非完整的 antd 兼容配置入口。
- 主题覆盖已经实现；Modal Portal 主题继承已实现；颜色派生和暗色预设尚未实现。
- 文档表格中的属性含义、默认值和兼容差异手工维护，类型为真实公开类型；未来可增加类型提取辅助，但行为描述仍需维护。
- 当前选择 MIT 许可证；尚未发布 npm 或部署公网网站。

首次浏览器测试可运行 `pnpm exec playwright install chromium`，或通过 `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser` 使用已安装的 Chrome。

## 双分发方式

CLI 与 npm 包使用同一份组件实现。安装流程、registry 结构与维护边界详见 [npm 包与 CLI 源码分发](./distribution.md)。
