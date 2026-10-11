import { it, expect } from 'vitest';
import { Form, useForm, useWatch } from './index.js';
import { Input } from '../input/index.js';
function TypedExample() {
  const form = useForm({ defaultValues: { name: '', enabled: true, contacts: [] as { name: string }[] } });
  const name: string = useWatch(form, 'name');
  form.setValue('enabled', false);
  form.patchValues({ contacts: [{ name: 'Alice' }] });
  // @ts-expect-error wrong top-level key
  form.setValue('missing', 'value');
  // @ts-expect-error wrong value type
  form.setValue('enabled', 'yes');
  // @ts-expect-error no nested paths
  useWatch(form, 'contacts.0.name');
  // @ts-expect-error unknown typed Field name
  const invalid = <Form.Field form={form} name="missing"><Input /></Form.Field>;
  return <Form form={form} onSubmit={values => { const enabled: boolean = values.enabled; void enabled; }}>
    <Form.Field form={form} name="name" dependencies={['enabled']} validate={value => value.length < 2 ? '短' : undefined}>
      {({ control }) => { const value: string = control.value; return <Input {...control.props} value={value} onChange={event => control.setValue(event.target.value)} />; }}
    </Form.Field>
    {name}{invalid}
  </Form>;
}
it('keeps the typed usage fixture available to tsc', () => expect(typeof TypedExample).toBe('function'));
