import type { CSSProperties, MouseEvent, ReactNode } from 'react';
export type MenuMode = 'inline' | 'horizontal';
interface MenuItemBase { key: string; className?: string; style?: CSSProperties; }
interface MenuInteractiveItem extends MenuItemBase { label: ReactNode; icon?: ReactNode; extra?: ReactNode; disabled?: boolean; title?: string; }
export interface MenuLeafItem extends MenuInteractiveItem { type?: undefined; children?: never; href?: string; target?: string; }
export interface MenuSubMenuItem extends MenuInteractiveItem { type?: undefined; children: readonly MenuItem[]; href?: never; target?: never; }
export interface MenuGroupItem extends MenuItemBase { type: 'group'; label?: ReactNode; children: readonly MenuLeafItem[]; }
export interface MenuDividerItem extends MenuItemBase { type: 'divider'; }
export type MenuItem = MenuLeafItem | MenuSubMenuItem | MenuGroupItem | MenuDividerItem;
export interface MenuClickInfo { key: string; keyPath: string[]; domEvent: MouseEvent<HTMLElement>; }
export interface MenuSelectInfo extends MenuClickInfo { selectedKeys: string[]; }
export interface MenuProps {
  items: readonly MenuItem[]; mode?: MenuMode;
  selectedKeys?: readonly string[]; defaultSelectedKeys?: readonly string[];
  openKeys?: readonly string[]; defaultOpenKeys?: readonly string[];
  onClick?: (info: MenuClickInfo) => void; onSelect?: (info: MenuSelectInfo) => void; onOpenChange?: (keys: string[]) => void;
  inlineCollapsed?: boolean; inlineIndent?: number; accordion?: boolean; selectable?: boolean; expandIcon?: ReactNode;
  className?: string; style?: CSSProperties; 'aria-label'?: string; 'aria-labelledby'?: string;
}
