# Paper Ink CLI

将 Paper Ink 组件源码安装到你的 React + TypeScript 项目。与组件包来自同一份实现，支持按需选择、共享依赖解析和本地二次开发。MIT 许可，CLI 零运行时 npm 依赖。

[在线文档](https://tingxi8087.github.io/paper-ink/) · [快速开始](https://tingxi8087.github.io/paper-ink/#/guide) · [GitHub](https://github.com/tingxi8087/paper-ink)

## 安装源码

要求 Node.js 20+、React 18+ 和 TypeScript。在消费项目根目录执行：

```bash
npx @tingxi8087/paper-ink-cli init
npx @tingxi8087/paper-ink-cli add button input --dry-run
npx @tingxi8087/paper-ink-cli add button input
```

也可以使用 `pnpm dlx @tingxi8087/paper-ink-cli`，或安装 CLI 后使用 `paper-ink` 命令。无需安装 `paper-ink` 组件包。

从消费项目的 `src/App.tsx` 引入：

```tsx
import { Button, Input } from './components/paper-ink';
import './components/paper-ink/style.css';

export default function App() {
  return <><Input placeholder="可以直接修改源码" /><Button>保存</Button></>;
}
```

有 src 时默认安装到 `src/components/paper-ink`，否则为 `components/paper-ink`。生成的内部引用是相对路径，适用于 Vite 等 bundler 模式的 React TypeScript 项目。

## 命令

- `init --path src/ui/paper-ink`：指定源码目录，不修改项目别名和应用入口。
- `add button input modal`：添加组件及共享依赖；Modal 要求消费项目有兼容的 ReactDOM。
- `list`：查看可安装条目。
- `--cwd /absolute/path/to/your-app`：操作指定项目。
- `--dry-run`：预览，不写文件、不安装依赖。
- `--no-install`：写入源码，由你手动安装缺失的 npm 依赖。
- `--overwrite`：明确替换已安装的源码。
- `--help` / `--version`：查看帮助和版本。

CLI 根据项目配置与锁文件识别 npm、pnpm、Yarn 或 Bun，自动解析组件的源码和 npm 依赖。共享模块安装一次，不需要手动复制文件。

## 修改与升级

源码属于你的项目，可直接修改。重复添加默认保留本地修改，无归属冲突会停止操作。请一起提交源码、`paper-ink.json` 和 `paper-ink.lock.json`。当前不提供自动合并上游改动的更新命令。

组件包与源码拥有独立的主题上下文，一个组件树中建议保持同一种来源。

## 仓库开发

```bash
pnpm build:registry
pnpm cli init --cwd /absolute/path/to/your-app
pnpm cli add button input --cwd /absolute/path/to/your-app
```

常用组件 API 参考 [Ant Design](https://ant.design/)，采用独立实现，不依赖 antd，支持范围以组件文档为准。

[MIT License](LICENSE)。
