import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Layout } from './index.js';
it('composes semantic regions and automatically detects direct Sider children', () => {
 const {container}=render(<Layout><Layout.Sider>Navigation</Layout.Sider><Layout><Layout.Header>Header</Layout.Header><Layout.Content>Body</Layout.Content><Layout.Footer>Footer</Layout.Footer></Layout></Layout>);
 expect(container.firstChild).toHaveClass('pi-layout--has-sider'); expect(screen.getByRole('main')).toHaveTextContent('Body'); expect(screen.getByRole('complementary')).toHaveStyle({width:'200px'});
});
it('collapses to zero while keeping an accessible expansion trigger and respects controlled state', () => {
 const onCollapse=vi.fn(); const {rerender}=render(<Layout.Sider collapsible collapsedWidth={0} onCollapse={onCollapse}>Nav</Layout.Sider>);
 fireEvent.click(screen.getByRole('button',{name:'折叠侧栏'})); expect(screen.getByRole('complementary')).toHaveStyle({width:'0px'}); expect(screen.getByText('Nav')).not.toBeVisible(); fireEvent.click(screen.getByRole('button',{name:'展开侧栏'})); expect(onCollapse).toHaveBeenLastCalledWith(false,'clickTrigger');
 rerender(<Layout.Sider collapsible collapsed={false} onCollapse={onCollapse}>Nav</Layout.Sider>); fireEvent.click(screen.getByRole('button',{name:'折叠侧栏'})); expect(screen.getByRole('complementary')).toHaveStyle({width:'200px'});
});
it('allows custom or absent triggers and explicit layout direction', () => {
 const {container}=render(<Layout hasSider={false}><Layout.Sider collapsible trigger={null} theme="dark">Nav</Layout.Sider></Layout>); expect(container.firstChild).not.toHaveClass('pi-layout--has-sider'); expect(screen.queryByRole('button')).toBeNull();
});
it('responds to a breakpoint without repeating callbacks when handlers change',()=>{
 const callbacks:((event:MediaQueryListEvent)=>void)[]=[];const media={matches:true,addEventListener:vi.fn((_name:string,cb:(event:MediaQueryListEvent)=>void)=>callbacks.push(cb)),removeEventListener:vi.fn()};const match=vi.fn(()=>media);vi.stubGlobal('matchMedia',match);const collapse=vi.fn(),broken=vi.fn();const {rerender,unmount}=render(<Layout.Sider breakpoint="md" collapsible onCollapse={collapse} onBreakpoint={broken}>Nav</Layout.Sider>);expect(collapse).toHaveBeenCalledWith(true,'responsive');expect(screen.getByRole('button',{name:'展开侧栏'})).toBeInTheDocument();rerender(<Layout.Sider breakpoint="md" collapsible onCollapse={collapse} onBreakpoint={()=>{}}>Nav</Layout.Sider>);expect(collapse).toHaveBeenCalledTimes(1);media.matches=false;callbacks[0]({matches:false} as MediaQueryListEvent);expect(collapse).toHaveBeenLastCalledWith(false,'responsive');unmount();expect(media.removeEventListener).toHaveBeenCalled();vi.unstubAllGlobals();
});
