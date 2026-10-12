# Generic hooks

Import `useRefState` and `useLocalstorageState` from `paper-ink/hooks` or `paper-ink`. Source installation: `paper-ink add hooks`; no CSS is needed.

```tsx
const [value, setValue, ref] = useRefState(0);
const [draft, setDraft] = useLocalstorageState({ name: '' }, 'profile.draft');
```

useRefState updates its readonly ref immediately; render with state. useLocalstorageState reads JSON on initialization and writes after committed updates. Both accept lazy initialization and functional updates. Storage key changes load the new slot without overwriting it with old state; the setter is stable. Undefined removes the entry; blocked storage or serialization failure does not break state. Use JSON-compatible values and immutable updates. This is browser-local persistence, not cross-tab or shared-component state synchronization. Legacy `paper-ink/use-ref-state` and the individual localstorage subpath remain supported. See doc/hooks.md for full semantics.
