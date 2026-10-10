import {render,screen} from '@testing-library/react';
import {expect,it} from 'vitest';
import {Divider} from './index';
it('prioritizes modern orientation over legacy flags',()=>{render(<Divider vertical type="vertical" orientation="horizontal" titlePlacement="start">Section</Divider>);expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation','horizontal');expect(screen.getByText('Section')).toBeVisible();});
