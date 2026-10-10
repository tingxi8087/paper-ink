import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StrictMode, useEffect } from 'react';
import { App, type ModalConfirmHandle } from './index';
import { ConfigProvider } from '../config-provider';
describe('App',()=>{
 it('inherits theme for contextual messages and modal confirmation',async()=>{
  let handle:ModalConfirmHandle | undefined;
  function Demo(){const {message,modal}=App.useApp();return <><button onClick={()=>message.success('Done',0)}>Message</button><button onClick={()=>{handle=modal.confirm({title:'Confirm',content:'Continue?'});}}>Confirm</button></>;}
  render(<ConfigProvider theme={{token:{color:{primary:{solid:'#663399'}}}}}><App><Demo /></App></ConfigProvider>);
  const user=userEvent.setup();await user.click(screen.getByText('Message'));expect(screen.getByRole('status')).toHaveTextContent('Done');
  await user.click(screen.getByText('Confirm'));const dialog=screen.getByRole('dialog');expect(dialog.closest('.pi-modal-root')).toHaveStyle('--pi-color-primary-solid: #663399');
  await user.click(screen.getByRole('button',{name:'确定'}));await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());expect(await handle).toBe(true);
 });
 it('retains rejected async confirmation and allows retry',async()=>{
  const callback=vi.fn().mockRejectedValueOnce(Error('no')).mockResolvedValueOnce(undefined);
  function Demo(){const {modal}=App.useApp();return <button onClick={()=>modal.confirm({title:'Async',onOk:callback})}>Open</button>;}
  const user=userEvent.setup();render(<App><Demo /></App>);await user.click(screen.getByText('Open'));await user.click(screen.getByRole('button',{name:'确定'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('操作未完成');expect(screen.getByRole('dialog')).toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'确定'}));await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());expect(callback).toHaveBeenCalledTimes(2);
 });
 it('updates and destroys handles and resolves outstanding dialogs on unmount',async()=>{
  let api:ReturnType<typeof App.useApp> | undefined;
  function Demo(){api=App.useApp();return <button onClick={()=>api!.modal.confirm({title:'One'})}>Open</button>;}
  const user=userEvent.setup();const {unmount}=render(<App><Demo /></App>);await user.click(screen.getByText('Open'));
  unmount();expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const handle=api!.modal.confirm({title:'Unmounted'});expect(await handle).toBe(false);
 });
 it('keeps confirmation handles alive during StrictMode effect replay',async()=>{
  function Demo(){const {modal}=App.useApp();useEffect(()=>{const handle=modal.confirm({title:'Effect dialog'});return()=>handle.destroy();},[modal]);return null;}
  const user=userEvent.setup();render(<StrictMode><App><Demo /></App></StrictMode>);
  await waitFor(()=>expect(screen.getAllByRole('dialog')).toHaveLength(1));
  await user.click(screen.getByRole('button',{name:'确定'}));await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
 });
 it('runs afterClose after the dialog and scroll lock are removed',async()=>{
  const afterClose=vi.fn(()=>{expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(document.body.style.overflow).not.toBe('hidden');});
  let handle:ModalConfirmHandle | undefined;
  function Demo(){const {modal}=App.useApp();return <><button onClick={()=>{handle=modal.confirm({title:'Before',afterClose});}}>Open</button><button onClick={()=>handle?.update({title:'After'})}>Update</button></>;}
  const user=userEvent.setup();render(<App><Demo /></App>);await user.click(screen.getByText('Open'));
  // Updating via the handle does not require interacting with the inert background.
  const { act }=await import('@testing-library/react');act(()=>handle?.update(previous=>({title:previous.title+' updated'})));
  expect(screen.getByRole('dialog',{name:'Before updated'})).toBeInTheDocument();act(()=>handle?.destroy());
  await waitFor(()=>expect(afterClose).toHaveBeenCalledTimes(1));expect(await handle).toBe(false);
 });

 it('preserves messages called by child effects during StrictMode replay',async()=>{
  function Demo(){const {message}=App.useApp();useEffect(()=>{message.info({key:'init',content:'Initialized',duration:0});},[message]);return null;}
  render(<StrictMode><App><Demo /></App></StrictMode>);
  await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('Initialized'));
  expect(screen.getAllByRole('status')).toHaveLength(1);
 });

});
