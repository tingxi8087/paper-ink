import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Timeline } from './index.js';
it('renders modern and legacy fields, placement, custom SVG and colors',()=>{
 const {container}=render(<Timeline mode="alternate" items={[{key:'a',title:'09:00',content:'created',color:'red'},{key:'b',label:'10:00',children:'saved',dot:<svg data-testid="dot"/>,position:'right'}]}/>);
 expect(screen.getByRole('list')).toHaveClass('pi-timeline--labelled');const entries=screen.getAllByRole('listitem');expect(entries[0]).toHaveClass('pi-timeline__item--start');expect(entries[1]).toHaveClass('pi-timeline__item--end');expect(screen.getByText('saved')).toBeInTheDocument();expect(screen.getByTestId('dot')).toBeInTheDocument();expect(container.querySelector('.pi-timeline__dot')).toHaveStyle({color:'#ff4d4f'});
});
it('reverses a copy of items including pending and supports loading with icon overrides',()=>{
 const items=[{key:'a',content:'first'},{key:'b',content:'last',loading:true,icon:<span>custom</span>}];const {container}=render(<Timeline items={items} pending="working" reverse variant="filled"/>);const entries=screen.getAllByRole('listitem');expect(entries[0]).toHaveTextContent('working');expect(entries[0]).toHaveAttribute('aria-busy','true');expect(entries[1]).toHaveTextContent('custom');expect(items[0].content).toBe('first');expect(container.querySelectorAll('.pi-timeline__spinner')).toHaveLength(1);
});
it('handles no items, blank content and explicit placement with native attributes',()=>{
 const {rerender}=render(<Timeline items={[]}/>);expect(screen.queryByRole('listitem')).toBeNull();rerender(<Timeline mode="end" aria-label="history" items={[{content:0,title:'',placement:'start',className:'custom','data-testid':'entry'}]}/>);expect(screen.getByRole('list',{name:'history'})).toBeInTheDocument();expect(screen.getByTestId('entry')).toHaveClass('pi-timeline__item--start','custom');expect(screen.getByText('0')).toBeVisible();
});
