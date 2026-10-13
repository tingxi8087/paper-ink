import { useState } from 'react';
import { Tabs } from 'paper-ink';
import { InstallCommands } from './InstallCommands';
import { LiveDemo } from './LiveDemo';
import example from '../content/guides/demos/first.tsx?raw';

export function QuickStart() {
  const [method, setMethod] = useState('package');
  const source = method === 'source';
  const imports = source ? example.replace("from 'paper-ink'", "from './components/paper-ink'").replace("'paper-ink/style.css'", "'./components/paper-ink/style.css'") : example;
  const preview = example.replace(/^import .*;\n/gm, '').replace('export default function Demo()', 'function Demo()').trim();
  return <>
    <Tabs aria-label="选择安装方式" activeKey={method} onChange={setMethod} items={[
      { key: 'package', label: '组件包', children: <><p>安装组件包，跟随 npm 版本升级。</p><InstallCommands /></> },
      { key: 'source', label: 'CLI 源码', children: <><p>在 React + TypeScript 项目根目录执行，需要 Node.js 20+：</p><pre><code>{`npx @tingxi8087/paper-ink-cli init\nnpx @tingxi8087/paper-ink-cli add button input stack`}</code></pre><p>源码默认安装到 <code>src/components/paper-ink</code>，可以直接修改，无需安装组件包。<a href="https://github.com/tingxi8087/paper-ink/blob/main/packages/cli/README.md" target="_blank" rel="noopener noreferrer">查看 CLI 详细说明</a></p></> },
    ]} />
    <h2>第一个例子</h2>
    <p>将下面的代码放到 <code>src/App.tsx</code>。输入文字，点击确认即可看到结果。</p>
    <pre aria-label="第一个例子的完整代码"><code>{imports}</code></pre>
    <LiveDemo title="试试第一个例子" code={preview} />
    {source && <p>如果项目没有 <code>src</code> 目录，请按实际安装位置调整导入路径。组件包与源码的主题上下文独立，同一个组件树中保持一种来源。</p>}
  </>;
}
