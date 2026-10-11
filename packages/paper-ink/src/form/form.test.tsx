import { StrictMode, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Form, useForm, useWatch, useFormState, useFieldState, FieldControl, defineFieldBinding, type FormInstance } from './index.js';
import { Input } from '../input/index.js';
import { Checkbox } from '../checkbox/index.js';
import { Switch } from '../switch/index.js';
import { Radio } from '../radio/index.js';
import { Select } from '../select/index.js';
import { InputNumber } from '../input-number/index.js';
import { Segmented } from '../segmented/index.js';
import { Rate } from '../rate/index.js';
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (error: unknown) => void; const promise = new Promise<T>((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
function harness(initial: Record<string, any> = { name: '', city: '南京' }, props: Record<string, any> = {}, field: Record<string, any> = {}) {
  let form!: FormInstance<any>;
  function Demo() { form = useForm({ defaultValues: initial }); const state = useFormState(form); return <Form form={form} {...props}><Form.Field name="name" label="姓名" {...field}><Input /></Form.Field><Form.Field name="city" label="城市"><Input /></Form.Field><button type="submit">提交</button><output>{JSON.stringify(state)}</output></Form>; }
  const rendered = render(<Demo />); return { ...rendered, get form() { return form; } };
}
describe('Form data and subscription contract', () => {
  it('binds direct Input, keeps native events, aria associations and composed ref', async () => {
    const ref = { current: null as any }; const handler = vi.fn(); const blur = vi.fn(); let form!: FormInstance<{ name: string }>;
    function Demo() { form = useForm({ defaultValues: { name: '张三' } }); return <Form form={form}><Form.Field name="name" label="姓名" help="公开昵称" required><Input ref={ref} onChange={event => handler(event.target.value, form.getValues())} onBlur={blur} aria-describedby="external" /></Form.Field></Form>; }
    render(<Demo />); const input = screen.getByLabelText(/姓名/); expect(input).toHaveValue('张三'); expect(input).toHaveAttribute('aria-required', 'true'); expect(input.getAttribute('aria-describedby')).toContain('external'); expect(ref.current.input).toBe(input);
    fireEvent.change(input, { target: { value: '李四' } }); expect(handler).toHaveBeenCalledWith('李四', { name: '李四' }); fireEvent.blur(input); expect(blur).toHaveBeenCalledTimes(1);
  });
  it('notifies once for a patch with changed-only old values, and never for reset or equal primitives', () => {
    const change = vi.fn(); const h = harness({ name: '张三', city: '南京' }, { onValuesChange: change });
    act(() => h.form.patchValues({ name: '李四', city: '杭州' }));
    expect(change).toHaveBeenCalledTimes(1); expect(change).toHaveBeenLastCalledWith({ name: '李四', city: '杭州' }, { name: '李四', city: '杭州' }, { source: 'programmatic', names: ['name', 'city'], previousValues: { name: '张三', city: '南京' } });
    act(() => { h.form.patchValues({ name: '李四' }); h.form.reset(); }); expect(change).toHaveBeenCalledTimes(1);
    act(() => { h.form.setValue('name', 'A'); h.form.setValue('city', 'B'); }); expect(change).toHaveBeenCalledTimes(3);
  });
  it('identifies user source and updates all values before notifying', () => {
    const change = vi.fn(); const h = harness(undefined, { onValuesChange: change }); fireEvent.change(screen.getByLabelText(/姓名/), { target: { value: 'new' } });
    expect(change.mock.calls[0][2]).toEqual({ source: 'user', names: ['name'], previousValues: { name: '' } }); expect(h.form.getValues().name).toBe('new');
  });
  it('replaces object/array fields, treats dotted keys literally, and isolates snapshots', () => {
    let form!: FormInstance<any>; const change = vi.fn();
    function Demo() { form = useForm({ defaultValues: { address: { city: '南京', province: '江苏' }, contacts: [{ name: 'A' }], 'a.b': 1 } }); return <Form form={form} onValuesChange={change}>{['address', 'contacts', 'a.b'].map(name => <Form.Field key={name} name={name}>{() => null}</Form.Field>)}</Form>; }
    render(<Demo />); act(() => form.patchValues({ address: { city: '杭州' }, contacts: [], 'a.b': undefined }));
    expect(form.getValues()).toEqual({ address: { city: '杭州' }, contacts: [], 'a.b': undefined }); expect(change.mock.calls[0][2].previousValues.address.city).toBe('南京');
    const snapshot = form.getValues(); snapshot.address.city = 'mutated'; expect(form.getValues().address.city).toBe('杭州');
  });
  it('does not remount on reset, ignores later defaultValues and resets dirty baseline', () => {
    const h = harness({ name: 'initial', city: '' }); const node = screen.getByLabelText(/姓名/);
    fireEvent.change(node, { target: { value: 'changed' } }); expect(screen.getByRole('status')).toHaveTextContent('"dirty":true');
    act(() => h.form.reset({ name: 'loaded', city: '杭州' })); expect(screen.getByLabelText(/姓名/)).toBe(node); expect(node).toHaveValue('loaded'); expect(screen.getByRole('status')).toHaveTextContent('"dirty":false');
    fireEvent.change(node, { target: { value: 'x' } }); act(() => h.form.reset()); expect(node).toHaveValue('loaded');
  });
  it('supports native reset without remounting controlled inputs', () => {
    const h = harness(); const node = screen.getByLabelText(/姓名/); fireEvent.change(node, { target: { value: 'x' } }); fireEvent.reset(node.closest('form')!); expect(node).toHaveValue(''); expect(h.form.getValues().name).toBe('');
  });
  it('subscribes only to a watched value and changes meta only when the booleans change', () => {
    let form!: FormInstance<any>; const watch = vi.fn(); const meta = vi.fn();
    function Watch({ form }: { form: FormInstance<any> }) { watch(useWatch(form, 'city')); return null; }
    function Meta({ form }: { form: FormInstance<any> }) { meta(useFormState(form)); return null; }
    function Demo() { form = useForm({ defaultValues: { name: '', city: '' } }); return <Form form={form}><Form.Field name="name"><Input /></Form.Field><Form.Field name="city"><Input /></Form.Field><Watch form={form} /><Meta form={form} /></Form>; }
    render(<Demo />); watch.mockClear(); meta.mockClear(); act(() => form.setValue('name', 'A')); expect(watch).not.toHaveBeenCalled(); expect(meta).toHaveBeenCalledTimes(1);
    act(() => form.setValue('name', 'B')); expect(meta).toHaveBeenCalledTimes(1);
  });
});
describe('validation and submit', () => {
  it('shows required on blur, links error and revalidates it on change', async () => {
    harness(undefined, {}, { required: '请输入姓名' }); const input = screen.getByLabelText(/姓名/); fireEvent.blur(input);
    expect(await screen.findByRole('alert')).toHaveTextContent('请输入姓名'); expect(input).toHaveAttribute('aria-invalid', 'true'); expect(document.getElementById(input.getAttribute('aria-describedby')!)).toHaveTextContent('请输入姓名');
    fireEvent.change(input, { target: { value: 'ok' } }); await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
  it.each([0, false])('required considers %s a valid value', async value => {
    const h = harness({ name: value, city: '' }, {}, { required: true }); expect((await h.form.validate()).status).toBe('valid');
  });
  it.each([undefined, null, '', '  ', []])('required rejects empty %j', async value => {
    const h = harness({ name: value, city: '' }, {}, { required: true }); let result: any; await act(async () => { result = await h.form.validate(); }); expect(result.status).toBe('invalid');
  });
  it('honors submit-only trigger even after an error', async () => {
    const validate = vi.fn(() => 'bad'); const h = harness(undefined, {}, { validateTrigger: 'submit', validate }); fireEvent.blur(screen.getByLabelText(/姓名/)); expect(validate).not.toHaveBeenCalled();
    await act(async () => { await h.form.validate(); }); fireEvent.change(screen.getByLabelText(/姓名/), { target: { value: 'x' } }); expect(validate).toHaveBeenCalledTimes(1);
  });
  it('focuses the first invalid control and does not submit', async () => {
    const submit = vi.fn(); harness(undefined, { onSubmit: submit }, { required: true }); fireEvent.click(screen.getByText('提交')); await screen.findByRole('alert'); expect(screen.getByLabelText(/姓名/)).toHaveFocus(); expect(submit).not.toHaveBeenCalled();
  });
  it('blocks duplicate submissions, awaits async callback and submits an isolated snapshot', async () => {
    const task = deferred<void>(); const submit = vi.fn((_values: any) => task.promise); const h = harness({ name: 'A', city: 'B' }, { onSubmit: submit });
    fireEvent.click(screen.getByText('提交')); fireEvent.click(screen.getByText('提交')); await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('status')).toHaveTextContent('"submitting":true'); act(() => h.form.setValue('name', 'C')); expect(submit.mock.calls[0][0]).toEqual({ name: 'A', city: 'B' });
    await act(async () => task.resolve()); expect(screen.getByRole('status')).toHaveTextContent('"submitting":false'); expect(screen.getByLabelText(/姓名/)).toHaveValue('C');
  });
  it('cancels validation promptly when values change even if validator ignores signal', async () => {
    const pending = deferred<string | undefined>(); const submit = vi.fn(); const h = harness(undefined, { onSubmit: submit }, { validate: () => pending.promise });
    fireEvent.click(screen.getByText('提交')); expect(screen.getByRole('status')).toHaveTextContent('"submitting":true'); act(() => h.form.setValue('name', 'new'));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('"submitting":false')); expect(submit).not.toHaveBeenCalled(); await act(async () => pending.resolve('stale')); expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('ignores old async results and emits cancelled for reset or superseding validation', async () => {
    const old = deferred<string | undefined>(); const newer = deferred<string | undefined>(); const validate = vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(newer.promise); const h = harness(undefined, {}, { validate });
    let first!: Promise<any>; let second!: Promise<any>; act(() => { first = h.form.validate(); second = h.form.validate(); });
    await act(async () => { newer.resolve(undefined); expect((await second).status).toBe('valid'); expect((await first).status).toBe('cancelled'); old.resolve('obsolete'); }); expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('propagates imperative exceptions and reports submit failures with their phase', async () => {
    const error = new Error('network'); const report = vi.fn(); const h = harness(undefined, { onError: report }, { validate: () => { throw error; } });
    await act(async () => { await expect(h.form.validate()).rejects.toBe(error); }); fireEvent.click(screen.getByText('提交')); await waitFor(() => expect(report).toHaveBeenCalledWith(error, { phase: 'validate' })); expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('reports business submit rejection without clearing values', async () => {
    const error = new Error('save'); const report = vi.fn(); harness({ name: 'keep', city: '' }, { onError: report, onSubmit: () => Promise.reject(error) }); fireEvent.click(screen.getByText('提交')); await waitFor(() => expect(report).toHaveBeenCalledWith(error, { phase: 'submit' })); expect(screen.getByLabelText(/姓名/)).toHaveValue('keep');
  });
  it('validates dependencies only after interaction and uses the updated data', async () => {
    let form!: FormInstance<any>; const validate = vi.fn((value, { values }) => value === values.name ? undefined : '不一致');
    function Demo() { form = useForm({ defaultValues: { name: '', confirm: '' } }); return <Form form={form}><Form.Field name="name" label="原文"><Input /></Form.Field><Form.Field name="confirm" label="确认" dependencies={['name']} validate={validate}><Input /></Form.Field></Form>; }
    render(<Demo />); act(() => form.setValue('name', 'A')); expect(validate).not.toHaveBeenCalled(); fireEvent.blur(screen.getByLabelText('确认')); await screen.findByRole('alert');
    act(() => form.patchValues({ name: 'B', confirm: 'B' })); await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
describe('lifecycle and custom controls', () => {
  it.each([true, false])('unmount excludes values, clears errors, restores according to preserve=%s under StrictMode', async preserve => {
    let form!: FormInstance<any>; let toggle!: (value: boolean) => void;
    function Demo() { form = useForm({ defaultValues: { name: 'initial' } }); const [show, setShow] = useState(true); toggle = setShow; return <Form form={form}>{show && <Form.Field name="name" label="姓名" preserve={preserve} validate={() => 'error'}><Input /></Form.Field>}</Form>; }
    render(<StrictMode><Demo /></StrictMode>); expect(screen.getByLabelText(/姓名/)).toHaveValue('initial'); act(() => form.setValue('name', 'edited')); await act(async () => { await form.validate(); });
    await act(async () => toggle(false)); expect(form.getValues()).toEqual({}); await act(async () => toggle(true)); expect(screen.getByLabelText(/姓名/)).toHaveValue(preserve ? 'edited' : 'initial'); expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('handles object and array controls with the default value protocol and field state context', async () => {
    let form!: FormInstance<any>;
    const Contacts = forwardRef<any, any>(function Contacts({ value = [], onChange, status, ...props }, ref) { const input = useRef<HTMLInputElement>(null); const state = useFieldState(); useImperativeHandle(ref, () => ({ focus: () => input.current?.focus() })); return <FieldControl status={status}><input {...props} ref={input} value={value[0]?.name ?? ''} onChange={e => onChange([{ name: e.target.value }])} /><span>{state.dirty ? '修改过' : '未修改'}</span></FieldControl>; });
    function Demo() { form = useForm({ defaultValues: { contacts: [] as any[] } }); return <Form form={form}><Form.Field name="contacts" label="联系人" required><Contacts /></Form.Field><button type="submit">保存</button></Form>; }
    render(<Demo />); fireEvent.click(screen.getByText('保存')); await screen.findByRole('alert'); expect(screen.getByLabelText(/联系人/)).toHaveFocus(); fireEvent.change(screen.getByLabelText(/联系人/), { target: { value: 'Alice' } }); expect(form.getValues()).toEqual({ contacts: [{ name: 'Alice' }] }); expect(screen.getByText('修改过')).toBeInTheDocument();
  });
  it('accepts declarative binding on an unfamiliar wrapped component without identifying it', () => {
    const Toggle = defineFieldBinding(forwardRef<HTMLButtonElement, any>(function Toggle({ selected, onSelect, status, ...props }, ref) { return <button {...props} ref={ref} type="button" onClick={() => onSelect(!selected)}>{String(selected)}</button>; }), { valueProp: 'selected', changeProp: 'onSelect' });
    function Demo() { const form = useForm({ defaultValues: { on: false } }); return <Form form={form}><Form.Field name="on"><Toggle /></Form.Field></Form>; }
    render(<Demo />); fireEvent.click(screen.getByText('false')); expect(screen.getByText('true')).toBeInTheDocument();
  });
  it('renders special layouts with explicit binding and propagates overall disabled', () => {
    function Demo() { const form = useForm({ defaultValues: { name: 'A' } }); return <Form form={form} disabled><Form.Field name="name">{({ control }) => <div><Input {...control.props} value={control.value} onChange={e => control.setValue(e.target.value)} /></div>}</Form.Field></Form>; }
    render(<Demo />); expect(screen.getByRole('textbox')).toBeDisabled();
  });
  it('binds Checkbox, Switch, Radio.Group and direct value controls while retaining their conventional APIs', async () => {
    let form!: FormInstance<any>;
    function Demo() { form = useForm({ defaultValues: { check: false, toggle: false, radio: undefined, select: undefined, number: null, segment: undefined, rate: 0, choices: [] } }); return <Form form={form}>
      <Form.Field name="check"><Checkbox>同意</Checkbox></Form.Field><Form.Field name="toggle"><Switch aria-label="开关" /></Form.Field>
      <Form.Field name="radio"><Radio.Group options={['A', 'B']} /></Form.Field><Form.Field name="select"><Select aria-label="选择" options={[{ value: 'X' }]} /></Form.Field>
      <Form.Field name="number"><InputNumber aria-label="数字" /></Form.Field><Form.Field name="segment"><Segmented options={['S', 'T']} /></Form.Field>
      <Form.Field name="rate"><Rate aria-label="评分" /></Form.Field><Form.Field name="choices"><Checkbox.Group options={['C', 'D']} /></Form.Field></Form>; }
    render(<Demo />); fireEvent.click(screen.getByLabelText('同意')); fireEvent.click(screen.getByRole('switch')); fireEvent.click(screen.getByLabelText('B')); fireEvent.click(screen.getByLabelText('T')); fireEvent.click(screen.getByLabelText('C'));
    fireEvent.change(screen.getByLabelText('数字'), { target: { value: '12' } }); fireEvent.blur(screen.getByLabelText('数字')); fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    const user = userEvent.setup(); await user.click(screen.getByRole('combobox')); await user.click(await screen.findByRole('option', { name: 'X' }));
    expect(form.getValues()).toMatchObject({ check: true, toggle: true, radio: 'B', select: 'X', number: 12, segment: 'T', rate: 1, choices: ['C'] });
    act(() => form.reset()); expect(screen.getByLabelText('同意')).not.toBeChecked(); expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false'); expect(screen.getByLabelText('B')).not.toBeChecked(); expect(screen.getByLabelText('T')).not.toBeChecked();
  });
});
describe('additional lifecycle boundaries', () => {
  it('resets pending validators and old errors without notifying changes', async () => {
    const pending = deferred<string | undefined>(); const change = vi.fn(); const h = harness(undefined, { onValuesChange: change }, { validate: () => pending.promise });
    let result!: Promise<any>; act(() => { result = h.form.validate(); h.form.reset({ name: 'loaded', city: '' }); }); await act(async () => expect((await result).status).toBe('cancelled')); await act(async () => pending.resolve('late')); expect(screen.queryByRole('alert')).not.toBeInTheDocument(); expect(change).not.toHaveBeenCalled();
  });
  it('cancels in-flight submission when a registered field unmounts', async () => {
    const pending = deferred<string | undefined>(); const submit = vi.fn(); let toggle!: () => void;
    function Demo() { const form = useForm({ defaultValues: { name: '' } }); const [show, setShow] = useState(true); const { submitting } = useFormState(form); toggle = () => setShow(false); return <Form form={form} onSubmit={submit}>{show && <Form.Field name="name" validate={() => pending.promise}><Input /></Form.Field>}<button type="submit">保存</button><output>{String(submitting)}</output></Form>; }
    render(<Demo />); fireEvent.click(screen.getByText('保存')); await act(async () => toggle()); await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('false')); expect(submit).not.toHaveBeenCalled();
  });
  it('restores updated preserve option instead of capturing mount-time props', async () => {
    let form!: FormInstance<any>; let set!: (state: number) => void;
    function Demo() { form = useForm({ defaultValues: { name: '' } }); const [stage, setStage] = useState(0); set = setStage; return <Form form={form}>{stage !== 2 && <Form.Field name="name" label="姓名" preserve={stage > 0}><Input /></Form.Field>}</Form>; }
    render(<Demo />); act(() => { form.setValue('name', 'keep'); set(1); }); await act(async () => set(2)); await act(async () => set(3)); expect(screen.getByLabelText('姓名')).toHaveValue('keep');
  });
  it('uses latest required rules without overwriting field values', async () => {
    let form!: FormInstance<any>; let set!: (required: boolean) => void;
    function Demo() { form = useForm({ defaultValues: { name: '' } }); const [required, setRequired] = useState(false); set = setRequired; return <Form form={form}><Form.Field name="name" label="姓名" required={required}><Input /></Form.Field></Form>; }
    render(<Demo />); await act(async () => expect((await form.validate()).status).toBe('valid')); act(() => set(true)); await act(async () => expect((await form.validate()).status).toBe('invalid')); expect(screen.getByLabelText(/姓名/)).toHaveValue('');
  });
  it('tracks structural dirty independently of identity-based changes', () => {
    let form!: FormInstance<any>;
    function Demo() { form = useForm({ defaultValues: { data: { name: 'A' } } }); const { dirty } = useFormState(form); return <Form form={form}><Form.Field name="data">{() => null}</Form.Field><output>{String(dirty)}</output></Form>; }
    render(<Demo />); act(() => form.setValue('data', { name: 'B' })); expect(screen.getByRole('status')).toHaveTextContent('true'); act(() => form.setValue('data', { name: 'A' })); expect(screen.getByRole('status')).toHaveTextContent('false');
  });
  it('revalidates dependencies after successful submit-only validation even without blur', async () => {
    let form!: FormInstance<any>; const validate = vi.fn((value, { values }) => value === values.first ? undefined : 'different');
    function Demo() { form = useForm({ defaultValues: { first: 'A', second: 'A' } }); return <Form form={form}><Form.Field name="first"><Input /></Form.Field><Form.Field name="second" dependencies={['first']} validate={validate}><Input /></Form.Field></Form>; }
    render(<Demo />); await act(async () => { await form.validate(); }); act(() => form.setValue('first', 'B')); await screen.findByRole('alert'); expect(validate).toHaveBeenCalledTimes(2);
  });
});

describe('registration consistency', () => {
  it('cancels a pending submission when a new required field appears', async () => {
    const pending = deferred<string | undefined>(); const submit = vi.fn(); let toggle!: () => void;
    function Demo() { const form = useForm({ defaultValues: { name: 'A', added: '' } }); const [added, setAdded] = useState(false); const { submitting } = useFormState(form); toggle = () => setAdded(true); return <Form form={form} onSubmit={submit}><Form.Field name="name" validate={() => pending.promise}><Input /></Form.Field>{added && <Form.Field name="added" required><Input /></Form.Field>}<button type="submit">保存</button><output>{String(submitting)}</output></Form>; }
    render(<Demo />); fireEvent.click(screen.getByText('保存')); act(() => toggle()); await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('false')); expect(submit).not.toHaveBeenCalled();
  });
  it('does not replace input when defaultValues props change', () => {
    function Demo({ initial }: { initial: string }) { const form = useForm({ defaultValues: { name: initial } }); return <Form form={form}><Form.Field name="name"><Input /></Form.Field></Form>; }
    const { rerender } = render(<Demo initial="first" />); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'editing' } }); rerender(<Demo initial="second" />); expect(screen.getByRole('textbox')).toHaveValue('editing');
  });
  it('supports literal field names matching Object.prototype without dirty phantom values', () => {
    let form!: FormInstance<any>;
    function Demo() { form = useForm({ defaultValues: {} }); const { dirty } = useFormState(form); return <Form form={form}><Form.Field name="constructor"><Input /></Form.Field><output>{String(dirty)}</output></Form>; }
    render(<Demo />); expect(form.getValues()).toEqual({ constructor: undefined }); expect(screen.getByRole('status')).toHaveTextContent('false'); act(() => form.setValue('constructor', 'literal')); expect(form.getValues()).toEqual({ constructor: 'literal' });
  });
});
