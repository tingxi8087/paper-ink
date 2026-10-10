# Pagination 分页

完整分页、条数切换、跳页和简洁模式。

## API

total、current / defaultCurrent、pageSize / defaultPageSize、onChange(page, pageSize)、onShowSizeChange(current, size)、showSizeChanger、pageSizeOptions、showQuickJumper、simple、showLessItems、showTotal、itemRender、showTitle、size、align、disabled、hideOnSinglePage。

## 支持边界

不支持响应式自动尺寸、SelectProps 式条数选择器、内部 components 与语义样式对象。条数选择器复用 Select，支持统一主题、SVG 图标、键盘操作及下拉动画；默认总数超过 50 时显示。

所有组件支持 className、style；默认采用 ConfigProvider 主题。
