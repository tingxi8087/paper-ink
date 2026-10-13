import { Tabs } from 'paper-ink';
const managers = [
  { key: 'npm', label: 'npm', local: 'npm install ./paper-ink-0.1.0.tgz', registry: 'npm install paper-ink' },
  { key: 'cnpm', label: 'cnpm', local: 'cnpm install ./paper-ink-0.1.0.tgz', registry: 'cnpm install paper-ink' },
  { key: 'yarn', label: 'Yarn', local: 'yarn add ./paper-ink-0.1.0.tgz', registry: 'yarn add paper-ink' },
  { key: 'pnpm', label: 'pnpm', local: 'pnpm add ./paper-ink-0.1.0.tgz', registry: 'pnpm add paper-ink' },
];
export function InstallCommands() {
  return <Tabs aria-label="选择包管理器" defaultActiveKey="npm" items={managers.map(manager => ({
    key: manager.key,
    label: manager.label,
    children: <><p>在 React 项目中安装组件包：</p><pre><code>{manager.registry}</code></pre><details><summary>本地构建文件安装方式</summary><pre><code>{manager.local}</code></pre></details></>,
  }))} />;
}
