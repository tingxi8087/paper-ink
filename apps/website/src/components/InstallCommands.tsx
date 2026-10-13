import { Tabs } from 'paper-ink';
const managers = [
  { key: 'npm', label: 'npm', registry: 'npm install paper-ink' },
  { key: 'cnpm', label: 'cnpm', registry: 'cnpm install paper-ink' },
  { key: 'yarn', label: 'Yarn', registry: 'yarn add paper-ink' },
  { key: 'pnpm', label: 'pnpm', registry: 'pnpm add paper-ink' },
];
export function InstallCommands() {
  return <Tabs aria-label="选择包管理器" defaultActiveKey="npm" items={managers.map(manager => ({
    key: manager.key,
    label: manager.label,
    children: <pre><code>{manager.registry}</code></pre>,
  }))} />;
}
