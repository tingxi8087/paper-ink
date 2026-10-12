import { createRef } from 'react';
import { it, expect } from 'vitest';
import { Menu, type MenuItem, type MenuClickInfo, type MenuSelectInfo } from './index.js';
function MenuTypeFixture() {
  const items: readonly MenuItem[] = [
    { key: 'leaf', label: 'Leaf', href: '#leaf', target: '_blank' },
    { key: 'parent', label: 'Parent', children: [{ key: 'nested', label: 'Nested' }] },
    { key: 'group', type: 'group', children: [{ key: 'grouped', label: 'Grouped' }] },
    { key: 'divider', type: 'divider' },
  ];
  const valid = <Menu ref={createRef<HTMLElement>()} items={items} mode="horizontal" selectedKeys={undefined} openKeys={undefined} onClick={info => { const click: MenuClickInfo = info; click.domEvent.preventDefault(); }} onSelect={info => { const select: MenuSelectInfo = info; const keys: string[] = select.selectedKeys; void keys; }} />;
  // @ts-expect-error unsupported vertical mode
  const vertical = <Menu items={items} mode="vertical" />;
  // @ts-expect-error first release is single selection
  const multiple = <Menu items={items} multiple />;
  // @ts-expect-error parents cannot be navigation links
  const linkedParent: MenuItem = { key: 'bad', label: 'Bad', href: '#bad', children: [] };
  // @ts-expect-error groups contain leaves, not submenus
  const nestedGroup: MenuItem = { key: 'bad-group', type: 'group', children: [{ key: 'submenu', label: 'Submenu', children: [] }] };
  // @ts-expect-error numeric keys do not belong to the stable string-key protocol
  const numberKey: MenuItem = { key: 1, label: 'Bad' };
  return <>{valid}{vertical}{multiple}{String(linkedParent)}{String(nestedGroup)}{String(numberKey)}</>;
}
it('checks Menu public protocol with tsc', () => expect(typeof MenuTypeFixture).toBe('function'));
