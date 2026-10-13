# Paper Ink 设计文档

记录组件库的设计约定和讨论草案，作为后续实现与讨论的依据。

- [组件库规划](./component-library-plan.md)：定位、API 兼容原则、轻量化方向和实施顺序。
- [主题体系设计](./theme-design.md)：主题分层、变量命名、覆盖与派生规则。

设计文档记录目标；当前已实现范围以组件源码、文档站 API 和测试为准。
- [项目目录与文档站](./project-structure.md)：workspace、在线编辑器与验证流程。
- [文档站搜索与主题实验室](./website-tools.md)：共享检索目录、快捷搜索、主题编辑、真实预览与配置保存。
- [npm 包与 CLI 源码分发](./distribution.md)：安装命令、registry、文件保护及验证。

- [Modal 与输入控件](./modal-and-input.md)：受控弹窗、业务 open(config)、输入 API 与实现边界。

- [antd 组件清单与开发优先级](./component-priorities.md)：73 个核心条目、6 个扩展组件的推荐指数、成本、理由和分批计划。

- [组件规划筛选网页](./component-priorities.html)：可直接打开，支持分类、指数、成本、状态、批次筛选和统计、CSV 导出。

修改组件优先级 Markdown 后，运行 `node scripts/build-component-priorities.mjs` 同步网页数据。实现状态为记录时的快照。

- [布局组件](./layout-components.md)
- [新表单设计草案](./form-design.md)：确定 API、字段绑定、校验、状态订阅、自定义控件协议及实现边界；独立 Form 已实现。
- [轻量 Menu 设计](./menu-design.md)：首期顶部/侧边导航、API、选中/展开协议、折叠与路由接入、功能边界和验收；已实现。
- [日期时间组件设计](./date-time-design.md)：DatePicker、RangePicker、TimePicker 的计划 API、值协议、草稿提交、功能边界与验收；首期已实现。
- [通用 Hooks](./hooks.md)：独立 useRefState 与自动本地持久化 useLocalstorageState。
- [轻量 Upload 与 useUpload 设计草案](./upload-design.md)：纯文件控件、独立上传任务 Hook、列表操作类型、进度取消、Form 接入与功能边界；首期已实现。
- [轻量 Table 设计草案](./table-design.md)：source/selection 协议、内置分页、内置 useBasePageTable/useTableChecked、公共 useRefState、AbortSignal 与业务 Hook 适配、固定列与汇总、省略 Tooltip、展开行与单元格合并、低成本扩展、后续功能及验证计划；首版已实现。

每次新增组件或变更实现状态后，必须同步更新 `component-priorities.md` 并运行 `node scripts/build-component-priorities.mjs`。独立组件单独记录；不将对应的 antd API 误标为已完成。

5 分组件的常用 API 子集已齐备，详细支持边界见文档站各组件页和 `packages/paper-ink/src/<component>/README.md`。

4 分组件已完成 19 项，规划页共 60 项已有基础实现（包含 Rate、Timeline、Result、独立 Form/Table/Upload 与公共 Hook）。DatePicker、RangePicker、TimePicker 和 Menu 首期已实现；Space 暂不实现，antd Table/Form 使用独立方案。InputNumber 与 App 的使用边界见各组件文档。

新增 Statistic、Util、Layout、Splitter、Steps、AutoComplete、Slider、Notification、Image，API、演示和支持边界见文档站；App 已接入 Notification。

ColorPicker 纯色首期已实现：支持透明度、HEX/RGB/HSB、预设、键盘、Form，使用独立高精度颜色状态。

Upload 纯文件控件与 useUpload 上传任务 Hook 首期已实现：12 组案例、批量操作类型、图片预览、Form 绑定和请求取消；规划页当前已有基础实现 60 项。
