import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Result, type ResultStatus } from './index.js';
it('renders all statuses, numeric exception codes and semantic colors',()=>{
 const {container,rerender}=render(<Result/>);for(const status of ['info','success','warning','error','403','404','500',404] as ResultStatus[]){rerender(<Result status={status} title={String(status)}/>);expect(container.firstChild).toHaveClass('pi-result--'+status);expect(container.querySelector('svg')).not.toBeNull();expect(screen.getByText(String(status))).toBeInTheDocument();}
});
it('preserves custom icon, interactive extra and detail content with native refs and styling',()=>{
 const click=vi.fn(),ref=createRef<HTMLDivElement>();const {container,rerender}=render(<Result ref={ref} title="Done" subTitle="Saved" icon={<svg data-testid="custom"/>} extra={<button onClick={click}>Back</button>} classNames={{title:'heading'}} styles={{title:{fontSize:18}}}>Details</Result>);fireEvent.click(screen.getByText('Back'));expect(click).toHaveBeenCalledOnce();expect(ref.current).toBe(container.firstChild);expect(screen.getByText('Done')).toHaveClass('heading');expect(screen.getByTestId('custom')).toBeInTheDocument();expect(screen.getByText('Details')).toBeInTheDocument();rerender(<Result icon={null}/>);expect(container.querySelector('.pi-result__icon')).toBeNull();expect(container.querySelector('.pi-result__title')).toBeNull();
});
