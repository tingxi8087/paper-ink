import { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Upload } from './upload.js';
import type { UploadRef, UploadFile } from './types.js';
import { Form, useForm, type FormInstance } from '../form/index.js';

const local = (name: string, type = 'text/plain') => new File(['contents'], name, { type });
const remote: UploadFile = { uid: 'remote', name: 'existing.txt', status: 'done', url: '/existing.txt' };
function choose(container: HTMLElement, files: File[]) { fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files } }); }
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(yes => { resolve = yes; }); return { promise, resolve }; }

describe('Upload pure file-list contract', () => {
  it('commits one ordered batch, generates distinct identities and clears input for repeated selections', async () => {
    const change = vi.fn(); const validate = vi.fn(() => undefined); const a = local('same.txt'); const b = local('same.txt');
    const { container } = render(<Upload multiple validate={validate} onChange={change} />);
    choose(container, [a, b]); await waitFor(() => expect(change).toHaveBeenCalledTimes(1));
    const info = change.mock.calls[0][0]; expect(info.type).toBe('add'); expect(info.files.map((f: UploadFile) => f.originFileObj)).toEqual([a, b]); expect(info.files[0].uid).not.toBe(info.files[1].uid);
    expect(validate).toHaveBeenCalledWith(a, [a, b]); expect(container.querySelector('input')).toHaveValue('');
    choose(container, [a]); await waitFor(() => expect(change).toHaveBeenCalledTimes(2)); expect(change.mock.calls[1][0].fileList).toHaveLength(3);
  });
  it('rejects type, validation and count separately without contaminating accepted files', async () => {
    const change = vi.fn(); const reject = vi.fn(); const a = local('a.txt'); const invalid = local('invalid.txt'); const image = local('photo.png', 'image/png'); const overflow = local('overflow.txt');
    const { container } = render(<Upload multiple accept=".txt" maxCount={1} validate={file => file.name === 'invalid.txt' ? 'bad content' : undefined} onChange={change} onReject={reject} />);
    choose(container, [a, invalid, image, overflow]); await waitFor(() => expect(change).toHaveBeenCalledTimes(1));
    expect(change.mock.calls[0][0].files.map((f: UploadFile) => f.name)).toEqual(['a.txt']);
    expect(reject.mock.calls[0][0]).toEqual(expect.arrayContaining([expect.objectContaining({ file: invalid, reason: 'validation' }), expect.objectContaining({ file: image, reason: 'type' }), expect.objectContaining({ file: overflow, reason: 'count' })]));
  });
  it('keeps old single file when invalid and emits replace with removedFiles only after acceptance', async () => {
    const change = vi.fn(); const { container } = render(<Upload defaultFileList={[remote]} maxCount={1} validate={file => file.name === 'bad.txt' ? 'bad' : undefined} onChange={change} />);
    choose(container, [local('bad.txt')]); await waitFor(() => expect(screen.getByText('existing.txt')).toBeInTheDocument()); expect(change).not.toHaveBeenCalled();
    choose(container, [local('new.txt')]); await waitFor(() => expect(change).toHaveBeenCalledTimes(1));
    expect(change.mock.calls[0][0]).toMatchObject({ type: 'replace', removedFiles: [remote], fileList: [{ name: 'new.txt' }], files: [{ name: 'new.txt' }] });
  });
  it('uses the latest controlled list after async validation and never emits changes for external progress', async () => {
    const gate = deferred<string | undefined>(); const change = vi.fn(); const { container, rerender } = render(<Upload multiple maxCount={2} fileList={[]} validate={() => gate.promise} onChange={change} />);
    choose(container, [local('selected.txt')]); rerender(<Upload multiple maxCount={2} fileList={[remote]} validate={() => gate.promise} onChange={change} />);
    await act(async () => gate.resolve(undefined)); await waitFor(() => expect(change).toHaveBeenCalledTimes(1)); expect(change.mock.calls[0][0].fileList.map((f: UploadFile) => f.name)).toEqual(['existing.txt', 'selected.txt']);
    rerender(<Upload fileList={[{ ...remote, status: 'uploading', percent: 23 }]} onChange={change} />); expect(change).toHaveBeenCalledTimes(1);
  });
  it('cannot commit an async validation batch after unmount', async () => {
    const gate = deferred<string | undefined>(); const change = vi.fn(); const { container, unmount } = render(<Upload validate={() => gate.promise} onChange={change} />);
    choose(container, [local('late.txt')]); unmount(); await act(async () => gate.resolve(undefined)); expect(change).not.toHaveBeenCalled();
  });
  it('waits for asynchronous removal, prevents duplicate removal, and respects false or rejected permission', async () => {
    const gate = deferred<boolean>(); const change = vi.fn(); const remove = vi.fn(() => gate.promise); const { rerender } = render(<Upload defaultFileList={[remote]} onRemove={remove} onChange={change} />);
    const button = screen.getByRole('button', { name: /移除|删除/ }); fireEvent.click(button); fireEvent.click(button); expect(remove).toHaveBeenCalledTimes(1); expect(change).not.toHaveBeenCalled();
    await act(async () => gate.resolve(false)); expect(screen.getByText('existing.txt')).toBeInTheDocument();
    rerender(<Upload defaultFileList={[remote]} onRemove={() => Promise.reject(new Error('denied'))} onChange={change} />); await userEvent.click(screen.getByRole('button', { name: /移除|删除/ })); expect(change).not.toHaveBeenCalled();
    rerender(<Upload defaultFileList={[remote]} onRemove={() => true} onChange={change} />); await userEvent.click(screen.getByRole('button', { name: /移除|删除/ })); await waitFor(() => expect(change).toHaveBeenCalledTimes(1)); expect(change.mock.calls[0][0]).toMatchObject({ type: 'remove', files: [remote], fileList: [] });
  });
  it('supports native keyboard activation and ref.open while disabled prevents file selection and actions', async () => {
    const ref = createRef<UploadRef>(); const change = vi.fn(); const { container, rerender } = render(<Upload ref={ref} onChange={change} />); const input = container.querySelector('input')!; const click = vi.spyOn(input, 'click');
    await userEvent.tab(); await userEvent.keyboard('{Enter}'); expect(click).toHaveBeenCalled(); act(() => ref.current!.open()); expect(ref.current!.nativeElement).toBe(container.firstElementChild);
    rerender(<Upload ref={ref} disabled defaultFileList={[remote]} onChange={change} />); click.mockClear(); act(() => ref.current!.open()); expect(click).not.toHaveBeenCalled(); choose(container, [local('blocked.txt')]); expect(change).not.toHaveBeenCalled(); expect(input).toBeDisabled();
  });
  it('uses the same file acceptance path for Dragger', async () => {
    const change = vi.fn(); const reject = vi.fn(); const { container } = render(<Upload.Dragger multiple accept="image/*" onChange={change} onReject={reject} />);
    fireEvent.drop(container.querySelector('.pi-upload__dropzone') ?? container.firstElementChild!, { dataTransfer: { files: [local('ok.png', 'image/png'), local('no.txt')] } });
    await waitFor(() => expect(change).toHaveBeenCalledTimes(1)); expect(change.mock.calls[0][0].files[0].name).toBe('ok.png'); expect(reject.mock.calls[0][0][0].reason).toBe('type');
  });
  it('binds Form through the shared fileList protocol, validates, resets and exposes accessible errors', async () => {
    let form!: FormInstance<{ files: UploadFile[] }>;
    function Demo() { form = useForm<{ files: UploadFile[] }>({ defaultValues: { files: [] } }); return <Form form={form}><Form.Field name="files" label="附件" required="请添加附件"><Upload multiple /></Form.Field></Form>; }
    const { container } = render(<Demo />); await act(async () => { await form.validate(); }); expect(screen.getByRole('alert')).toHaveTextContent('请添加附件'); expect(container.querySelector('[aria-invalid="true"]')).toBeInTheDocument();
    choose(container, [local('form.txt')]); await waitFor(() => expect(form.getValues().files).toHaveLength(1)); expect((await form.validate()).status).toBe('valid'); act(() => form.reset()); expect(screen.queryByText('form.txt')).not.toBeInTheDocument();
  });
  it('releases local thumbnail object URLs on removal and unmount without persisting them in values', async () => {
    const create = vi.fn(() => 'blob:test'); const revoke = vi.fn(); vi.stubGlobal('URL', class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
    try { const change = vi.fn(); const { container, unmount } = render(<Upload listType="picture" onChange={change} />); choose(container, [local('photo.png', 'image/png')]); await waitFor(() => expect(create).toHaveBeenCalled()); expect(change.mock.calls[0][0].files[0].url).toBeUndefined(); await userEvent.click(screen.getByRole('button', { name: /移除|删除/ })); await waitFor(() => expect(revoke).toHaveBeenCalledWith('blob:test')); choose(container, [local('another.png', 'image/png')]); await waitFor(() => expect(create).toHaveBeenCalledTimes(2)); unmount(); expect(revoke).toHaveBeenCalledTimes(2); }
    finally { vi.unstubAllGlobals(); }
  });
  it('serializes overlapping async batches and applies capacity after earlier commits', async () => {
    const gate = deferred<string | undefined>(); const change = vi.fn(); const reject = vi.fn(); const validate = vi.fn((file: File) => file.name === 'first.txt' ? gate.promise : undefined);
    const { container } = render(<Upload multiple maxCount={2} validate={validate} onChange={change} onReject={reject} />);
    choose(container, [local('first.txt')]); choose(container, [local('second.txt'), local('third.txt')]);
    await act(async () => gate.resolve(undefined)); await waitFor(() => expect(change).toHaveBeenCalledTimes(2));
    expect(change.mock.calls[1][0].fileList.map((f: UploadFile) => f.name)).toEqual(['first.txt', 'second.txt']); expect(reject.mock.calls[0][0][0]).toMatchObject({ reason: 'count', file: expect.objectContaining({ name: 'third.txt' }) });
  });
  it('preserves a custom button handler and its ability to prevent opening without nesting buttons', async () => {
    const handler = vi.fn(event => event.preventDefault()); const { container, rerender } = render(<Upload><button onClick={handler}>Custom</button></Upload>); const input = container.querySelector('input')!; const click = vi.spyOn(input, 'click');
    await userEvent.click(screen.getByRole('button', { name: 'Custom' })); expect(handler).toHaveBeenCalledTimes(1); expect(click).not.toHaveBeenCalled(); expect(container.querySelector('button button')).toBeNull();
    rerender(<Upload disabled><button>Custom</button></Upload>); expect(screen.getByRole('button', { name: 'Custom' })).toBeDisabled();
  });
  it('only exposes cancellation and retry when handlers exist and reports intent without list changes', async () => {
    const change = vi.fn(); const cancel = vi.fn(); const retry = vi.fn(); const active = { ...remote, status: 'uploading' as const, originFileObj: local('existing.txt') }; const failed = { ...active, uid: 'failed', name: 'failed.txt', status: 'error' as const };
    const { rerender } = render(<Upload fileList={[active, failed]} onChange={change} />); expect(screen.queryByRole('button', { name: /取消|重新上传/ })).not.toBeInTheDocument();
    rerender(<Upload fileList={[active, failed]} onChange={change} onCancel={cancel} onRetry={retry} />); await userEvent.click(screen.getByRole('button', { name: /取消上传/ })); await userEvent.click(screen.getByRole('button', { name: /重新上传/ })); expect(cancel).toHaveBeenCalledWith(active); expect(retry).toHaveBeenCalledWith(failed); expect(change).not.toHaveBeenCalled();
  });
  it('replaces a failed image thumbnail with an SVG placeholder and preserves preview override', async () => {
    const preview = vi.fn(); const { container } = render(<Upload listType="picture" defaultFileList={[{ ...remote, name: 'photo.png', type: 'image/png', url: '/photo.png' }]} onPreview={preview} />); const img = container.querySelector('img')!; fireEvent.error(img); expect(container.querySelector('.pi-upload__thumbnail img')).toBeNull(); expect(container.querySelector('.pi-upload__thumbnail svg')).not.toBeNull(); await userEvent.click(screen.getByRole('button', { name: /预览/ })); expect(preview).toHaveBeenCalledWith(expect.objectContaining({ name: 'photo.png' })); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not remove a different origin or remote resource reusing a uid while removal awaits approval', async () => {
    const gate = deferred<boolean>(); const change = vi.fn(); const original = { ...remote, originFileObj: local('old.txt') }; const replacement = { ...remote, name: 'new.txt', originFileObj: local('new.txt') };
    const { rerender } = render(<Upload fileList={[original]} onRemove={() => gate.promise} onChange={change} />); fireEvent.click(screen.getByRole('button', { name: /移除/ })); rerender(<Upload fileList={[replacement]} onRemove={() => gate.promise} onChange={change} />); await act(async () => gate.resolve(true)); expect(change).not.toHaveBeenCalled();
    const secondGate = deferred<boolean>(); rerender(<Upload fileList={[remote]} onRemove={() => secondGate.promise} onChange={change} />); fireEvent.click(screen.getByRole('button', { name: /移除/ })); rerender(<Upload fileList={[{ ...remote, url: '/different.txt' }]} onRemove={() => secondGate.promise} onChange={change} />); await act(async () => secondGate.resolve(true)); expect(change).not.toHaveBeenCalled();
  });
  it('closes an old preview when the same uid receives a different image URL', async () => {
    const file = { ...remote, name: 'old.png', type: 'image/png', url: '/old.png' }; const { rerender } = render(<Upload fileList={[file]} listType="picture" />); await userEvent.click(screen.getByRole('button', { name: /预览/ })); expect(screen.getByRole('dialog')).toBeInTheDocument(); rerender(<Upload fileList={[{ ...file, url: '/new.png' }]} listType="picture" />); await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('reserves committed capacity before a controlled owner echoes the new list', async () => {
    const change = vi.fn(); const reject = vi.fn(); const { container } = render(<Upload fileList={[]} multiple maxCount={2} onChange={change} onReject={reject} />);
    await act(async () => { choose(container, [local('a.txt'), local('b.txt')]); choose(container, [local('c.txt')]); });
    await waitFor(() => expect(reject).toHaveBeenCalledTimes(1)); expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][0].fileList).toHaveLength(2); expect(reject.mock.calls[0][0][0].reason).toBe('count');
  });

});
