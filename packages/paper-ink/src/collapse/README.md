# Collapse 折叠面板

单项或多项展开、内容保留和手风琴。

## API

items（key / label / children / extra / showArrow / collapsible / forceRender / className / style）、activeKey / defaultActiveKey、onChange(keys)、accordion、bordered、ghost、size、destroyOnHidden、expandIcon、expandIconPosition。

## 支持边界

使用 items，不提供旧 Collapse.Panel。没有展开动画；destroyOnHidden 优先于 forceRender。图标触发的按钮通过 label 提供无障碍名称。

所有组件支持 className、style；默认采用 ConfigProvider 主题。
