import { defineFieldBinding, textFieldBinding } from '../internal/field-binding.js';
import { forwardRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../internal/icons.js';
import { InputControl } from './input.js';
import type { InputRef, PasswordProps } from './types.js';

export const Password = forwardRef<InputRef, PasswordProps>(function Password({ visibilityToggle = true, iconRender, suffix, disabled, className, type: _type, ...rest }, ref) {
 const [innerVisible, setInnerVisible] = useState(false);
 const config = typeof visibilityToggle === 'object' ? visibilityToggle : undefined;
 const controlled = config?.visible !== undefined; const visible = controlled ? config.visible! : innerVisible;
 function toggle() { if(disabled)return; const next = !visible; if(!controlled)setInnerVisible(next); config?.onVisibleChange?.(next); }
 return <InputControl {...rest} ref={ref} disabled={disabled} type={visible ? 'text' : 'password'} className={['pi-input-password',className].filter(Boolean).join(' ')} suffix={<>
  {visibilityToggle && <button className="pi-input-password__toggle" type="button" disabled={disabled} tabIndex={config?.tabIndex} aria-label={visible ? '隐藏密码' : '显示密码'} aria-pressed={visible} onMouseDown={event => event.preventDefault()} onMouseUp={event => event.preventDefault()} onClick={toggle}>{iconRender ? iconRender(visible) : visible ? <EyeIcon /> : <EyeOffIcon />}</button>}
  {suffix}
 </>} />;
});

defineFieldBinding(Password, textFieldBinding);
