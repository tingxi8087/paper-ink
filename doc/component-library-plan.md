# 组件库规划

记录日期：2026-10-10

## 已确定的方向

Paper Ink 是一套通用的 React UI 组件库，完全开源，从简单组件开始逐步扩展。

- 默认采用水墨黑白：白纸背景、浓墨文字、极淡衬底；有效文字使用暗色，灰色按用途向淡或暗收敛，保持足够对比度。
- 成功、警告、错误、信息等其他颜色参考 Ant Design。
- 组件 API 与 Ant Design 基本一致。
- 不追求实现 Ant Design 的全部组件或全部 API，但已有能力需要足够灵活。
- 常规用法保持一致；特殊情况下允许差异，差异需要明确记录。
- 目标是更轻量，同时保留完整的基本交互行为。
- 演示网站与组件动效保持克制：不使用弹簧、回弹、过冲或缩放入场；保留短淡入、平缓滑动和状态过渡。
- 网站滚动边界与组件自身的滚动区域禁用回弹；横向区域只限制横轴，不额外阻止普通纵向页面滚动。

## API 兼容原则

功能可以少，已支持功能的常规行为需要与 Ant Design 一致。

兼容范围包括组件名称、常用属性名称与含义、事件参数、默认值、组合方式，以及受控与非受控行为。

例如：

```tsx
<Button type="primary" loading>保存</Button>

<Input value={value} onChange={e => setValue(e.target.value)} />

<Select options={options} value={value} onChange={setValue} />

<Modal open={open} onCancel={close} onOk={submit}>
  内容
</Modal>
```

- `Input.onChange` 接收事件，`Select.onChange` 接收值，保持各自的约定。
- 保持 `value/defaultValue`、`checked/defaultChecked` 的受控与非受控行为。
- `size`、`disabled`、`loading`、`status` 等属性按组件需要逐步支持，保持含义一致。
- 支持 `className`、`style`，以及组件适用的原生属性和 `ref`。
- 暂未实现的属性不放进公开类型定义，也不静默忽略。
- 每个组件记录支持的 API、默认值、事件参数和已知差异。

主题体系是允许独立设计的明确差异，不要求复制 Ant Design 的全部 token 和算法。

## 技术方向草案

以下为讨论建议，具体工具和发布配置尚未确定。

- React + TypeScript，内部实现独立控制。
- 静态 CSS + CSS 变量，使用统一的类名和变量前缀。
- ESM、类型声明、组件和样式按需加载。
- 无需安装 Tailwind 或配置主题即可使用默认样式。
- 集中处理受控状态、弹层、焦点和键盘操作等实际共用能力。
- 按实际需要选择复杂交互依赖，不以牺牲交互完整性换取体积。
- 用消费项目测量 JS/CSS gzip 增量，建立真实的体积基线和预算。
- 组件保持一个发布包，配套独立 CLI 包和预览／文档站；不按组件拆分 npm 包。
- 完全开源，起步采用 MIT 许可证，并保留必要的第三方声明。

## 实施顺序草案

1. Button：建立视觉、尺寸、图标、加载、禁用状态及 API 对齐的样板。
2. Input / TextArea：验证输入事件、受控行为、焦点和表单状态。
3. Checkbox / Radio / Switch：验证选择状态和 Group 组合方式。
4. Space / Divider：补充常用布局能力。
5. Select / Modal：建设弹层、焦点管理、键盘交互与主题继承能力。
6. 后续按实际需求扩展 Drawer、Tooltip、Popover、Dropdown、Message、Form、Table、Pagination、Tabs 等。

Form 和 Table 需要单独设计，避免在起步阶段同时引入字段订阅、校验、排序、筛选和行选择的复杂度。

通过“设置页 + 编辑弹窗”等真实使用路径验收，覆盖输入、选择、状态、加载和提交；文档站同步展示示例、支持的属性及差异。

## 后续待确定

- Ant Design API 的参考版本。
- 第一版 Button 的具体 API 清单。
- React 18+；已采用 TypeScript 构建组件包、React + Vite + MDX 构建文档站。
- 当前 MIT，工作包名为 paper-ink；正式发布前确认 npm 包名可用性。
- 各典型消费场景的体积预算。

## 参考资料

- [Ant Design Button](https://ant.design/components/button/)
- [主题体系设计草案](./theme-design.md)

## 动效约定（2026-10-12）

默认禁用 Q 弹效果，包括弹性/过冲曲线、缩放入场和滚动边界回弹。Modal 只做淡入淡出，Drawer 使用标准平缓滑动；Badge processing 只改变透明度。保留加载旋转、短状态过渡、退出生命周期和 reduced-motion 支持。头像文字的静态尺寸适配不属于动效。

演示站根页面与侧栏关闭边界回弹；组件只控制自身滚动容器，不向宿主页面注入全局规则。横向滚动区域仅禁用横轴回弹，未限定高度的 Table 保持普通纵向滚动传递。

已通过完整构建、类型检查及 13 项动效/弹层浏览器检查，包含弹窗各阶段无缩放、实际淡入/退出保留、抽屉滑入和滚动策略。
