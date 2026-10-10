import { LiveDemo } from './LiveDemo';
import basic from '../content/components/button/demos/basic.tsx?raw';
import sizes from '../content/components/button/demos/sizes.tsx?raw';
import loading from '../content/components/button/demos/loading.tsx?raw';
import danger from '../content/components/button/demos/danger.tsx?raw';
import ghost from '../content/components/button/demos/ghost.tsx?raw';
import flexible from '../content/components/button/demos/flexible.tsx?raw';
// The exact demo file becomes the editable expression. Imports are supplied by scope.
export const demoCode = (file: string) => file.replace(/^import .*;\n/gm, '').replace('export default function Demo()', 'function Demo()').trim();
export function ButtonDemos() { return <div className="demo-list">
  <LiveDemo title="按钮类型" code={demoCode(basic)} />
  <LiveDemo title="尺寸与形状" code={demoCode(sizes)} />
  <LiveDemo title="加载与禁用" code={demoCode(loading)} />
  <LiveDemo title="危险操作" code={demoCode(danger)} />
  <LiveDemo title="幽灵按钮" code={demoCode(ghost)} dark />
  <LiveDemo title="图标、链接与宽度" code={demoCode(flexible)} />
  <LiveDemo title="颜色与变体" code={`<div className="example-row">
  <Button color="primary" variant="filled">Filled</Button>
  <Button color="primary" variant="outlined">Outlined</Button>
  <Button color="danger" variant="solid">Danger</Button>
</div>`} />
  <LiveDemo title="局部样式扩展" code={`<Button className="custom-button" icon={<span>→</span>} iconPlacement="end" classNames={{ content: 'custom-content' }} styles={{ root: { borderRadius: 12 }, content: { fontWeight: 600 }, icon: { color: '#1677ff' } }}>自定义样式</Button>`} />
</div>; }
