function Table({ rows }: { rows: string[][] }) { return <div className="table-scroll"><table><thead><tr><th>属性 / 方法</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i < 3 ? <code>{cell}</code> : cell}</td>)}</tr>)}</tbody></table></div>; }
export function TooltipApiTable() { return <Table rows={[
  ['title', 'ReactNode | () => ReactNode', '—', '提示内容，空内容不显示'],
  ['placement', 'top/bottom/left/right 及各方向对齐变体', 'top', '支持12个常规位置'],
  ['trigger', 'hover | focus | click | Array', 'hover', 'hover 同时支持键盘聚焦'],
  ['open / defaultOpen', 'boolean', 'false', '受控 / 初始显示状态'],
  ['onOpenChange', '(open: boolean) => void', '—', '显示状态变化通知'],
  ['mouseEnterDelay / mouseLeaveDelay', 'number', '0.1', '鼠标移入 / 移出延迟，单位秒'],
  ['destroyOnHidden', 'boolean', 'false', '关闭后卸载浮层'],
  ['autoAdjustOverflow', 'boolean', 'true', '尝试翻转并限制在视口内'],
  ['color', 'string', '—', '提示背景颜色'],
  ['getPopupContainer', '(triggerNode) => HTMLElement', 'document.body', '定位按实际 offsetParent 换算'],
  ['className / style', 'string / CSSProperties', '—', '用于提示浮层；当前与 antd 的位置略有差异'],
]} />; }
export function MessageApiTable() { return <Table rows={[
  ['success / error / info / warning / loading', '(content, duration?, onClose?) => handle', '—', '显示对应语义提示，也接受配置对象'],
  ['open', '(config: MessageArgs) => handle', '—', '使用配置对象显示提示'],
  ['content / icon / type', 'ReactNode / ReactNode / MessageType', '— / — / info', '消息内容、图标及类型'],
  ['key', 'string | number', '自动生成', '相同 key 更新原有消息并重置计时'],
  ['duration', 'number', '3', '单位秒，0表示持续显示'],
  ['onClose', '() => void', '—', '自动、手动或淘汰关闭时调用'],
  ['className / style', 'string / CSSProperties', '—', '单条消息样式'],
  ['destroy', '(key?) => void', '—', '销毁指定消息或实例所有消息'],
  ['useMessage', '(config?) => [api, contextHolder]', '—', 'contextHolder 放在所需 Provider 内'],
  ['config', '(config: MessageConfig) => void', '—', '仅静态 message 的全局设置'],
  ['duration / maxCount / top / getContainer', 'number / number / number|string / () => HTMLElement', '3 / 不限 / 8 / body', '全局设置或 hook 初始配置'],
  ['handle', '可调用函数 & PromiseLike<boolean>', '—', 'handle() 关闭；handle.then() 或 await handle 等待关闭'],
]} />; }
