import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Modal } from '../modal/modal.js';
import { Tooltip } from '../tooltip/tooltip.js';
import { useMessage } from '../message/message.js';
import type { MessageInstance, MessageHandle } from '../message/types.js';
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('matchMedia', () => ({ matches: false })); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('keeps modal focus, content and scroll until exit completes and cancels interrupted exits', () => {
 const done = vi.fn(); const {rerender} = render(<Modal open destroyOnHidden afterClose={done}>content</Modal>);
 rerender(<Modal destroyOnHidden afterClose={done}>content</Modal>);
 expect(screen.getByText('content')).toBeInTheDocument(); expect(document.body.style.overflow).toBe('hidden'); expect(done).not.toHaveBeenCalled();
 act(() => vi.advanceTimersByTime(90)); rerender(<Modal open destroyOnHidden afterClose={done}>content</Modal>);
 act(() => vi.advanceTimersByTime(180)); expect(done).not.toHaveBeenCalled();
 rerender(<Modal destroyOnHidden afterClose={done}>content</Modal>); act(() => vi.advanceTimersByTime(180));
 expect(screen.queryByText('content')).not.toBeInTheDocument(); expect(done).toHaveBeenCalledOnce(); expect(document.body.style.overflow).not.toBe('hidden');
});
it('retains a tooltip exit visually but removes it from accessibility before destroying', () => {
 const {rerender} = render(<Tooltip open title="hint" destroyOnHidden><button>target</button></Tooltip>);
 rerender(<Tooltip open={false} title="hint" destroyOnHidden><button>target</button></Tooltip>);
 expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(); expect(screen.getByText('hint')).toBeInTheDocument();
 act(() => vi.advanceTimersByTime(120)); expect(screen.queryByText('hint')).not.toBeInTheDocument();
});
it('resolves messages only after exit and cancels exit when the same key is updated', async () => {
 let api!:MessageInstance; function Demo(){const [instance,holder]=useMessage();api=instance;return holder;}
 render(<Demo/>);const done=vi.fn();let handle!:MessageHandle;
 act(()=>{handle=api.info({key:'x',content:'old',duration:0,onClose:done});});act(()=>handle());
 expect(screen.getByText('old')).toBeInTheDocument();expect(done).not.toHaveBeenCalled();
 act(()=>{api.success({key:'x',content:'new',duration:0,onClose:done});});act(()=>vi.advanceTimersByTime(180));
 expect(screen.getByRole('status')).toHaveTextContent('new'); expect(done).not.toHaveBeenCalled();
 act(()=>api.destroy('x'));act(()=>vi.advanceTimersByTime(180));await handle;expect(done).toHaveBeenCalledOnce();expect(screen.queryByText('new')).not.toBeInTheDocument();
});
it('skips deferred exits with reduced motion',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));const done=vi.fn();const {rerender}=render(<Modal open destroyOnHidden afterClose={done}>content</Modal>);
 rerender(<Modal destroyOnHidden afterClose={done}>content</Modal>);expect(screen.queryByText('content')).not.toBeInTheDocument();expect(done).toHaveBeenCalledOnce();
});
