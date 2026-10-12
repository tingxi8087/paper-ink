# Paper Ink

Monochrome-first React components with familiar Ant Design-style APIs. MIT licensed; independently implemented.

Local development release, not yet published to npm. Requires React 18+.

```tsx
import { Button } from 'paper-ink';
import 'paper-ink/style.css';

<Button type="primary">Save</Button>
```

For component-level imports:

```tsx
import { Button } from 'paper-ink/button';
import 'paper-ink/button/style.css';
```

Button supports common types, sizes, shapes, color/variant, className/style, semantic classNames/styles, delayed/custom loading icons, links and native element refs.

Input, Input.Search, Input.Password and Input.TextArea (also exported as Search, Password and TextArea) support native attributes, controlled/uncontrolled values, clear, status, count and refs. TextArea supports autoSize. Search supports enterButton, loading and onSearch with input/clear source. Password supports iconRender and controlled visibilityToggle. Input CSS includes its Button dependency. Modal provides controlled dialogs, focus management, portal theme inheritance and custom footers. Ordinary Modal callbacks do not automatically close or start loading; a business ref.open(config) example is available on the website.

Input and Modal also have subpath exports and CSS. Modal CSS includes its Button dependency.

Theme configuration uses `ConfigProvider` with grouped semantic tokens under `theme.token` and component overrides under `theme.components.Button`, `Input` and `Modal`. It intentionally differs from antd. Current themes use explicit overrides, not automatic color derivation.

See the repository website and `doc` directory for the supported API and design decisions.

Stack, Inline and SimpleGrid provide vertical, horizontal and grid layouts with independent APIs. Spacing presets are small=4px, medium=8px, large=16px under theme.token.spacing; default gap is medium. All support native div attributes, className/style and refs. SimpleGrid accepts columns (number/CSS template) or minChildWidth, plus rowGap/columnGap; SimpleGrid.Item supports span (positive integer/full). Automatic columns allow span=1/full only. Numeric fixed columns clamp span to their column count. CSS overrides take precedence, and custom templates require the caller to manage spanning.

Import each from paper-ink/stack, paper-ink/inline or paper-ink/simple-grid with its corresponding style.css, or use the root exports and full stylesheet.

## Common components

Checkbox/Group, Radio/Group/Button, Switch, Select (single/multiple/tags/search), Tabs (items/keyboard/panel lifecycle), Tag/CheckableTag, Empty, Alert/ErrorBoundary, Spin, Tooltip and message/useMessage are available from the root or their lowercase subpaths. Each has a standalone style.css. These are documented subsets of familiar Ant Design APIs, not full API implementations.

Prefer `message.useMessage()` with its contextHolder inside your ConfigProvider for theme inheritance. Static message calls use the default theme. Select supports ordinary option sets without virtualization. Editable/vertical Tabs, Select labelInValue/grouped options, antd Form integration and semantic style functions remain outside this release. An independent Form engine is available.

Additional common API subsets: Typography, Divider, Breadcrumb, Dropdown, Pagination, InputNumber, Avatar, Badge, Card, Collapse, Descriptions, Popover, Segmented, Drawer, Popconfirm, Progress, Skeleton and App. Each has a lowercase kebab-case subpath and stylesheet. Space and the antd Form/Table APIs are deferred; independent Form and Table APIs are available. Our independent Form supports top-level fields, declarative bindings, async validation, subscriptions and atomic patches; import Form/useForm from paper-ink/form.

InputNumber uses MIT-licensed @rc-component/mini-decimal for string-based decimal calculations; enable stringMode and pass strings for high precision. App.useApp() provides theme-aware message, modal and notification APIs, including async confirmation handles. Read each component README for supported API boundaries.

新增 Rate、Timeline、Result：支持常用 antd 风格 API、共享主题与 SVG 图标，提供 npm 子路径和 CLI 源码安装，完整 API 与支持边界见文档站。

## Independent Table and hooks

Table accepts either `data` or a `source` satisfying TableSource. Use `source={table}` from useBasePageTable and `selection={checked}` from useTableChecked; pagination is built in. Fixed columns, summaries, controlled sorting, expansion, merged cells and overflow-only tooltips are supported. Request functions receive `(query, signal)`; selection remains on business rows as `_checked`.

Import Table/types from `paper-ink/table` and its dependency-complete CSS from `paper-ink/table/style.css`. Hooks are exported from `paper-ink/table-hooks`; the public useRefState tuple is exported from `paper-ink/use-ref-state`. Root imports also work. Source installation: `paper-ink add table`, or install either Hook item individually. See their source READMEs for exact methods and boundaries. No SSR guarantee is required for these browser-oriented hooks.

Generic hooks live separately in `paper-ink/hooks`: `useRefState(initialState)` and `useLocalstorageState(initialState, storageKey)`. The latter reads/writes JSON localStorage with ordinary state and functional updates. Source installation: `paper-ink add hooks`; individual subpaths remain available. No styles or runtime dependencies required.

## Additional components

Statistic, Layout (Header/Content/Footer/Sider), Splitter, Steps, AutoComplete, Slider, notification/useNotification and Image/PreviewGroup are available as root exports and kebab-case subpaths with dependency-complete styles. Each supports the documented common API subset; see its README and website for boundaries. Statistic uses mini-decimal to preserve decimal strings. AutoComplete and Slider integrate with the independent Form. Prefer App.useApp().notification for scoped theme inheritance.

GetProps, GetProp and GetRef are type-only exports from paper-ink/util or the root; they need no stylesheet. DatePicker/RangePicker, TimePicker and Menu are also available with documented subsets.

ColorPicker 纯色首期：透明度、HEX/RGB/HSB、预设、键盘与 Form。npm 子路径 `paper-ink/color-picker`，CSS `paper-ink/color-picker/style.css`；CLI `paper-ink add color-picker` 自动添加 @ctrl/tinycolor。支持范围见组件文档，渐变与屏幕取色留待后续。
