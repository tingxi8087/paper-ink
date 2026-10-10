# Modal 与输入控件

## 设计决策

基础组件延续 antd 常规属性与受控行为，支持范围明确列出；业务弹窗采用 `ref.open(config)` 组合模式，依据 react-loose-conventions 的中后台组件约定。业务组件持有显示、初始化、提交和错误状态，页面传入数据与成功回调，不将临时表单状态放入全局 store。

## 当前组件

- Button：原生属性、className/style、rootClassName、color/variant、classNames/styles(root/icon/content)、自定义 loading 图标、iconPlacement 与兼容 iconPosition、autoInsertSpace。
- Input：受控/非受控、原生属性、尺寸、error/warning、清空、前后缀、回车、字数统计。
- Input.TextArea / TextArea：共享输入能力，增加 rows、autoSize(minRows/maxRows) 与容器宽度变化测量。
- Modal：受控显示、默认/自定义页脚、异步提交状态、Portal 主题继承、焦点循环/恢复、顶层 Esc/遮罩、滚动锁定、保留/销毁内容、原地渲染。

## 责任边界

普通 Modal 的 onOk / onCancel 仅通知调用方。open 和 confirmLoading 由调用方控制，Promise 不隐式关闭。业务 open(config) 示例在文档站 WorkspaceEditor 内实现；不扩展基础 Modal 的含义。暂未实现 Modal.confirm 或 Modal.useModal。

Input 状态只改变视觉，不执行业务校验。不包含 Search/Password/OTP、Form 联动、完整 count 或语义样式配置。完整 ref 方法以导出的类型为准。

Modal 无过渡动画；afterClose 在隐藏后调用。Esc 的 onCancel 参数为原生 KeyboardEvent；mask=false 保留焦点限制和页面滚动锁定，仅开放背景指针操作。更完整差异见组件页。

## 主题与分发

Input 和 Modal 使用现有语义变量，组件级仅增加明确的几何覆盖：Input.radius/paddingInline、Modal.radius/padding。Portal 根节点写入解析后的主题变量，避免挂载到 body 后丢失 CSS 继承。

npm 提供 input/modal 子路径和单独 CSS；Modal 单独样式入口会包含 Button 样式。CLI 支持 add button input modal，Modal 依赖 Button 与 theme；react-dom 为已有宿主依赖，需要与项目 React 版本一致。
