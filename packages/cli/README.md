# Paper Ink CLI

Install Paper Ink source into a React 18+ TypeScript project. MIT licensed, zero runtime npm dependencies. The registry payload ships inside the CLI package and is generated from the same source used by the `paper-ink` npm library.

**Local development release; not yet published to npm.**

## Local use

From the Paper Ink repository:

```bash
pnpm build:registry
pnpm cli init --cwd /absolute/path/to/your-app
pnpm cli add button input modal --cwd /absolute/path/to/your-app --dry-run
pnpm cli add button input modal --cwd /absolute/path/to/your-app
```

Alternatively, pack this package, install the generated tgz in your project, then run `pnpm exec paper-ink init` and `pnpm exec paper-ink add button input modal`.

After npm publication the equivalent commands will be:

```bash
pnpm dlx @paper-ink/cli init
pnpm dlx @paper-ink/cli add button input modal
```

## Commands

- `init`: create `paper-ink.json`. Existing configuration is preserved.
- `init --path src/ui/paper-ink`: choose the source directory.
- `add button input modal`: install component source, shared modules, CSS and license.
- `list`: list available public components.
- `--cwd`: target another project.
- `--dry-run`: preview without file writes or dependency installation.
- `--overwrite`: explicitly restore/replace conflicting installed source files.
- `--no-install`: leave missing npm dependencies for manual installation.
- `--help` / `--version`.

Button and Input only need the project's React dependency. Modal also needs an existing ReactDOM version compatible with React; the CLI checks this host dependency before writing any files. Future registry items can declare npm dependencies. The CLI detects npm, pnpm, yarn or bun from project configuration and lockfiles.

## Use installed source

Default directory: `src/components/paper-ink` when `src` exists, otherwise `components/paper-ink`.

```tsx
// From src/App.tsx:
import { Button, ConfigProvider } from './components/paper-ink';
import './components/paper-ink/style.css';
```

An existing `@/` alias can also be used; the CLI does not change your tsconfig or bundler aliases. Installed internal imports are relative and extensionless, intended for bundler-mode React TypeScript projects such as Vite.

`paper-ink.lock.json` records installed groups and generated file hashes. Commit it alongside `paper-ink.json` and the installed source. Shared theme and ConfigProvider files are stored once under the chosen directory.

Existing tracked files are preserved even if modified. Untracked conflicting files abort before component writes; use another directory or explicitly opt into `--overwrite`. User exports outside the managed block in index.ts are preserved. There is no automatic upstream merge/update command.

Use local source or the npm package consistently within a component tree: the two distributions have independent theme contexts, and editing local source does not alter the npm package.

Layout source installation: `paper-ink add stack inline simple-grid`. These components share spacing helpers and theme modules, installed once.

Available source items also include checkbox, radio, switch, tabs, select, tooltip, message, tag, alert, spin and empty. Install any combination with `paper-ink add checkbox radio switch tabs select tooltip message tag alert spin empty`. Select, Tooltip, Message and fullscreen Spin require the project's compatible ReactDOM dependency, which the CLI validates before writing files.

Source items now also include typography, divider, breadcrumb, dropdown, pagination, input-number, avatar, badge, card, collapse, descriptions, popover, segmented, drawer, popconfirm, progress, skeleton and app. Shared dependencies are installed once. Adding input-number installs @rc-component/mini-decimal; Statistic also uses this decimal dependency.

新增 Rate、Timeline、Result：支持常用 antd 风格 API、共享主题与 SVG 图标，提供 npm 子路径和 CLI 源码安装，完整 API 与支持边界见文档站。

Additional source items: `paper-ink add statistic util layout splitter steps auto-complete slider notification image`. Layout is the application shell; Stack/Inline/SimpleGrid continue to share internal spacing helpers. Util contains only types and has no CSS. Image pulls in Modal; AutoComplete pulls in Input; Slider pulls in Tooltip. App includes Notification along with Message and Modal.

ColorPicker 纯色首期：透明度、HEX/RGB/HSB、预设、键盘与 Form。npm 子路径 `paper-ink/color-picker`，CSS `paper-ink/color-picker/style.css`；CLI `paper-ink add color-picker` 自动添加 @ctrl/tinycolor。支持范围见组件文档，渐变与屏幕取色留待后续。
