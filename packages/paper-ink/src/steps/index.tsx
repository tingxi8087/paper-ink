import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { CheckIcon, CloseIcon } from '../internal/icons.js';
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export interface StepItem { key?: string | number; title?: ReactNode; subTitle?: ReactNode; description?: ReactNode; icon?: ReactNode; status?: StepStatus; disabled?: boolean; }
export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> { items?: StepItem[]; current?: number; initial?: number; status?: StepStatus; direction?: 'horizontal' | 'vertical'; size?: 'default' | 'small'; labelPlacement?: 'horizontal' | 'vertical'; onChange?: (current: number) => void; }
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps({ items = [], current = 0, initial = 0, status = 'process', direction = 'horizontal', size = 'default', labelPlacement = 'horizontal', onChange, className, style, ...rest }, ref) {
  const theme = useTheme();
  return <ol {...rest} ref={ref} className={['pi-steps', `pi-steps--${direction}`, `pi-steps--${size}`, labelPlacement === 'vertical' && 'pi-steps--labels-vertical', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>
    {items.map((item, index) => {
      const number = initial + index; const resolved = item.status ?? (number < current ? 'finish' : number === current ? status : 'wait');
      const body = <><span className="pi-steps__icon" aria-hidden="true">{item.icon ?? (resolved === 'finish' ? <CheckIcon /> : resolved === 'error' ? <CloseIcon /> : number + 1)}</span><span className="pi-steps__body"><span className="pi-steps__title">{item.title}{item.subTitle != null && <span className="pi-steps__subtitle">{item.subTitle}</span>}</span>{item.description != null && <span className="pi-steps__description">{item.description}</span>}</span></>;
      return <li key={item.key ?? index} className={['pi-steps__item', `pi-steps__item--${resolved}`, item.disabled && 'pi-steps__item--disabled'].filter(Boolean).join(' ')} aria-current={number === current ? 'step' : undefined}>{onChange ? <button type="button" disabled={item.disabled} className="pi-steps__control" onClick={() => onChange(number)}>{body}</button> : <div className="pi-steps__control">{body}</div>}</li>;
    })}
  </ol>;
});
