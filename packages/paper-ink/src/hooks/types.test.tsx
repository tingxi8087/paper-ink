import { expect, it } from 'vitest';
import { useLocalstorageState, useRefState } from './index.js';
function TypedHooks() {
  const [draft, setDraft] = useLocalstorageState(() => ({ name: '', count: 0 }), 'draft');
  const name: string = draft.name;
  setDraft(previous => ({ ...previous, count: previous.count + 1 }));
  // @ts-expect-error a storage key is required
  useLocalstorageState(0);
  // @ts-expect-error updates retain the state type
  setDraft({ name: 4, count: 0 });
  const [, set, ref] = useRefState(0); set(n => n + 1);
  // @ts-expect-error ref remains a readonly view
  ref.current = 2;
  void name;
}
it('exports generic state hooks with their state constraints', () => expect(typeof TypedHooks).toBe('function'));
