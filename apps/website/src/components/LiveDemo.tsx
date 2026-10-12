import dayjs from 'dayjs';
import { useState } from 'react';
import * as React from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { Menu, DatePicker, TimePicker, enUS, zhCN, Button, Input, Modal, Stack, Inline, SimpleGrid, Checkbox, Radio, Switch, Tabs, Select, Tooltip, message, Tag, Alert, Spin, Empty, Typography, Divider, Avatar, Badge, Card, Descriptions, Dropdown, Popover, Popconfirm, Drawer, Breadcrumb, Pagination, Collapse, Segmented, Progress, Skeleton, InputNumber, App, Rate, Timeline, Result, Table, useBasePageTable, useTableChecked, useRefState, useLocalstorageState, Form, useForm, useWatch, useFormState, useFieldState, FieldControl, defineFieldBinding, ConfigProvider, useTheme } from 'paper-ink';
const scope = { dayjs, React, useState: React.useState, useEffect: React.useEffect, useRef: React.useRef, Menu, DatePicker, TimePicker, enUS, zhCN, Button, Input, Modal, Stack, Inline, SimpleGrid, Checkbox, Radio, Switch, Tabs, Select, Tooltip, message, Tag, Alert, Spin, Empty, Typography, Divider, Avatar, Badge, Card, Descriptions, Dropdown, Popover, Popconfirm, Drawer, Breadcrumb, Pagination, Collapse, Segmented, Progress, Skeleton, InputNumber, App, Rate, Timeline, Result, Table, useBasePageTable, useTableChecked, useRefState, useLocalstorageState, Form, useForm, useWatch, useFormState, useFieldState, FieldControl, defineFieldBinding, ConfigProvider, useTheme };
export function LiveDemo({ title, code, dark = false }: { title: string; code: string; dark?: boolean }) {
  const [source, setSource] = useState(code);
  const [editing, setEditing] = useState(false);
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(source); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); } }
  return <section className="demo" aria-label={title}>
    <LiveProvider key={revision} code={source} scope={scope}>
      <div className={`demo-preview ${dark ? 'demo-preview--dark' : ''}`}><LivePreview /></div>
      <div className="demo-caption"><div><h3>{title}</h3></div><div className="demo-tools">
        <button onClick={copy} aria-label={`复制${title}代码`}>{copied ? '已复制' : '复制'}</button>
        <button onClick={() => { setSource(code); setRevision(n => n + 1); }} aria-label={`重置${title}`}>重置</button>
        <button className={editing ? 'active' : ''} onClick={() => setEditing(v => !v)} aria-expanded={editing}>{editing ? '收起代码' : '编辑代码'}</button>
      </div></div>
      {editing && <div className="demo-editor"><textarea className="code-input" value={source} onChange={e => setSource(e.target.value)} spellCheck={false} aria-label={`${title}在线代码编辑器`} /></div>}
      <LiveError className="demo-error" role="alert" />
    </LiveProvider>
  </section>;
}
