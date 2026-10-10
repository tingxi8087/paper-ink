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
