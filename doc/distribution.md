# npm 包与 CLI 源码分发

记录日期：2026-10-10

## 已落地

同一份 `packages/paper-ink/src` 组件源码提供两条分发路径：

1. TypeScript 构建为 ESM、声明文件和 CSS，发布为 `paper-ink`。
2. 从 registry 清单收集源码，生成随 `@tingxi8087/paper-ink-cli` 发布的安装资源；CLI 把所选组件安装到使用项目。

首个公开版本为 0.1.0：组件包 paper-ink，源码 CLI @tingxi8087/paper-ink-cli。CLI 可执行命令仍为 paper-ink。

## 目录

```text
packages/paper-ink/src/         唯一的组件实现
packages/cli/src/               CLI 参数、安装规划与执行
packages/cli/test/              文件操作、冲突和依赖行为测试
packages/cli/dist/              构建的 CLI 与 registry.json（不提交）
registry/registry.json         组件文件、共享模块依赖与公开导出清单
scripts/build-registry.mjs     从真实源码生成 CLI 安装资源
scripts/check-cli.mjs          打包后的 CLI 与 npm 包的独立消费验证
```

清单维护文件路径和依赖关系，不维护第二份源码。Button 和 Input 依赖 theme 组，Modal 依赖 theme 和 Button；theme 组包含 ConfigProvider、主题类型、默认值、配置合并、CSS 变量转换和作用域样式。

构建时使用 TypeScript AST 将相对 import/export 的 `.js` 模块引用转换为无扩展名引用，适配 Vite 等 bundler 模式的源码项目。npm 产物保持原有 NodeNext ESM 引用。

## CLI 使用

在仓库中构建后，操作目标 React 18+ TypeScript 项目：

```bash
pnpm build:registry
pnpm cli list
pnpm cli init --cwd /absolute/path/to/your-app
pnpm cli add button input modal --cwd /absolute/path/to/your-app --dry-run
pnpm cli add button input modal --cwd /absolute/path/to/your-app
```

`init --path src/ui/ink` 可以调整安装目录。默认在有 src 的项目里安装到 `src/components/paper-ink`。不自动修改业务 tsconfig、别名和入口文件。

安装后的业务入口需要明确导入样式一次，例如从 `src/App.tsx` 引用：

```tsx
import { Button, ConfigProvider } from './components/paper-ink';
import './components/paper-ink/style.css';
```

已有 `@/` 别名的项目可改用自己的别名。没有别名也可以正常使用。

## 安装规划与文件保护

- 先解析组件依赖，再预检全部目标文件，发现无归属的冲突时停止，不先写入半套组件。
- 安装目录必须位于项目内，拒绝路径穿越、符号链接，以及 `.git` 和 `node_modules` 内的路径。
- `--dry-run` 不写文件、不安装依赖，也不创建安装记录。
- 共享模块只安装一份；重复添加同一组件保持文件内容不变。
- `paper-ink.json` 存配置，`paper-ink.lock.json` 存安装组和生成时的文件 hash，均建议提交。
- 默认保留已记录的文件，包含用户修改；hash 不代表自动合并能力。
- `--overwrite` 显式替换组件文件。入口导出的管理区块以外的用户内容保留。
- 缺失的 npm 依赖通过检测到的包管理器安装；Button / Input 当前没有额外运行时依赖；Modal 声明 react-dom 宿主依赖，缺失时先提示安装与 React 匹配的版本，不自动选择最新版。
- `--no-install` 跳过依赖安装，输出需要手动执行的命令。

当前不提供自动升级或合并用户修改的命令。组件文件预检通过后，依赖安装仍可能失败；失败时不写组件文件，但包管理器可能已经修改 package.json 或锁文件。

## 主题与维护边界

源码组件使用本地共享的 ConfigProvider。npm 组件使用包内 ConfigProvider。两份实现的 Context 各自独立，单个组件树中应一致选择一种分发方式。

源码安装后属于业务项目，可以直接修改；npm 包升级不会更新这些本地文件。保留各文件来源说明和 `LICENSE.paper-ink`。

## 验证

```bash
pnpm test
pnpm build
PLAYWRIGHT_CHANNEL=chrome pnpm check:cli
pnpm check:package
```

`check:cli` 在临时目录打包并安装真实 CLI 和组件包，使用 CLI 安装 Button、Input 和 Modal，验证 dry-run、重复安装、TypeScript、Vite 生产构建，以及浏览器中的两种分发形式的主题、点击、禁用、输入清空、文本域自适应和 Portal 弹窗行为。命令会先构建组件包和 CLI；测试消费项目使用本地缓存的依赖安装。

新组件加入 registry 后，需要同时维护文件清单、共享组依赖、公开导出和必要的 npm 依赖，并执行同类消费验证。
