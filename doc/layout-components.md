# 布局组件

已实现 Stack、Inline、SimpleGrid，属于允许独立设计的 API。常规控件仍遵循 Ant Design 的 API 习惯。

- Stack：竖排，默认横向撑满。
- Inline：横排，默认垂直居中、允许换行；wrap={false} 禁止换行。
- SimpleGrid：columns 数字定义等宽列，字符串定义 CSS 列模板；minChildWidth 根据容器宽度自动分列。两种模式互斥。
- SimpleGrid.Item：span 正整数或 full。固定数字列数会限制 span 上限；自动列数仅允许 span=1 或 full。普通子元素无需 Item。

所有容器支持 gap、align、justify、className、style、原生 div 属性和 ref。SimpleGrid 另支持 rowGap / columnGap。style 优先于布局属性；自定义 CSS 列模板和 style 覆盖列数时，跨列范围由使用者负责。

主题间距使用 theme.token.spacing：small=4px、medium=8px、large=16px。默认 gap=medium。数字单位 px，支持 CSS 字符串。预设继承主题；显式数值不受主题影响。

只渲染必要容器，不包装每个子元素，不添加背景、内边距、固定高度。自动列数由 CSS auto-fit 实现，无 JS 宽度监听，支持服务端渲染。首期不提供断点对象、跨行等快捷属性，复杂布局通过 CSS 扩展。

```tsx
import { Stack, Inline, SimpleGrid } from 'paper-ink';
import 'paper-ink/style.css';

<Stack gap="large">
  <SimpleGrid columns={2} rowGap="medium" columnGap="large">
    <Input placeholder="名称" />
    <Input placeholder="负责人" />
    <SimpleGrid.Item span="full"><Input.TextArea /></SimpleGrid.Item>
  </SimpleGrid>
  <Inline justify="flex-end"><Button>取消</Button><Button type="primary">保存</Button></Inline>
</Stack>
```

独立导入：paper-ink/stack、paper-ink/inline、paper-ink/simple-grid，每个子路径有 style.css。

CLI 源码安装：`paper-ink add stack inline simple-grid`，自动包含共享间距工具和主题。
