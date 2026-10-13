const componentRows = [
  ['fileList / defaultFileList', 'readonly UploadFile<T>[]', '[]', '受控列表 / 初始列表；组件不发送请求'],
  ['onChange', '(info: UploadChangeInfo<T>) => void', '—', '用户实际增删替换后通知；批量选择只通知一次'],
  ['accept / multiple / maxCount', 'string / boolean / number', '— / false / —', '类型提示、多选、数量上限；maxCount=1 时校验后替换'],
  ['validate', '(file, batch) => string | undefined | Promise', '—', '返回错误文案或抛错拒绝；只校验，不转换文件'],
  ['onReject', '(rejections: UploadRejection[]) => void', '—', '被拒绝文件及 type / count / validation 原因'],
  ['listType', "'text' | 'picture' | 'picture-card'", 'text', '附件列表、带缩略图列表或图片卡片'],
  ['showUploadList', 'boolean', 'true', '隐藏内置列表后由业务自行展示'],
  ['onRemove', '(file) => boolean | void | Promise', '—', 'false 或 Promise 拒绝阻止删除；不会自动删除服务器文件'],
  ['onPreview', '(file: UploadFile<T>) => void', '—', '业务预览；未传时图片提供基础预览'],
  ['onCancel / onRetry', '(file: UploadFile<T>) => void', '—', '取消与重试的操作意图；未传时隐藏对应入口'],
  ['disabled / status', "boolean / 'error' | 'warning'", 'false / —', '整体控件状态，与单个文件状态区分'],
  ['children', 'ReactNode', '选择文件按钮', '自定义触发区域；请使用可聚焦并转发事件的入口'],
  ['className / style / 原生 div 属性', 'string / CSSProperties / HTMLAttributes', '—', '作用于外层容器；aria 属性支持 Form 错误关联'],
  ['ref', 'UploadRef', '—', 'open() 打开选择对话框；focus() 聚焦入口；nativeElement 获取容器'],
  ['Upload.Dragger', 'UploadProps<T>', '—', '共用所有列表与校验属性，额外提供拖拽选择区域'],
];
const hookRows = [
  ['request', '(options: UploadRequestOptions) => Promise<UploadResult<T>>', '必填', '调用方提供请求函数；resolve 成功，reject 失败'],
  ['defaultFileList', 'UploadFile<T>[]', '[]', '初始文件列表，可回填远端完成文件'],
  ['autoUpload', 'boolean', 'true', '通过 props.onChange 加入的文件自动进入队列'],
  ['concurrency', 'number', '3', '正整数，并发任务上限'],
  ['fileList', 'UploadFile<T>[]', '—', '当前完整列表，包含状态、进度、响应与错误'],
  ['props', '{ fileList, onChange, onCancel, onRetry }', '—', '普通属性协议，直接展开给 Upload；业务可覆盖展示属性'],
  ['upload(uids?)', '(uids?: string[]) => Promise<void>', '—', '不传只上传 idle 文件；指定 uid 可重试 error / cancelled'],
  ['cancel(uid?)', '(uid?: string) => void', '—', '取消指定或全部排队 / 进行中的任务，保留列表项'],
  ['setFileList', 'Dispatch<SetStateAction<UploadFile<T>[]>>', '—', '回填、清空、更新本地数据；移除活动文件自动取消任务'],
];
const protocolRows = [
  ['UploadChangeInfo.type', "'add' | 'remove' | 'replace'", '只表达用户列表操作，不包含进度、取消与重试'],
  ['fileList / files', 'UploadFile<T>[]', '操作后的完整列表 / 本次实际加入或移除的文件'],
  ['removedFiles', 'UploadFile<T>[]', '仅 replace 存在，记录被替换的旧文件'],
  ['UploadFile.uid / name', 'string / string', '稳定身份 / 展示名称，同名文件不会自动去重'],
  ['originFileObj', 'File | undefined', '本地文件有原始 File；远端文件可省略，不能重新上传'],
  ['status', "'idle' | 'uploading' | 'done' | 'error' | 'cancelled'", '等待、请求中、完成、失败、取消；删除从列表移除'],
  ['size / type / percent', 'number / string / number', '字节数、MIME、0～100 进度；缺少进度时显示不确定状态'],
  ['url / response / error', 'string / T / Error', '完成地址、业务响应、失败原因；组件不解读响应结构'],
  ['UploadRequestOptions', '{ file: File; signal: AbortSignal; onProgress(percent): void }', '必须把 signal 传给请求库；只报告真实进度'],
  ['UploadResult<T>', '{ url?: string; response?: T }', 'Promise 成功值；调用方自行检查 HTTP 和业务错误'],
  ['UploadRejection', '{ file: File; reason; message: string }', 'reason 为 type / count / validation；拒绝文件不进入列表'],
];
function ApiTable({ rows, protocol = false }: { rows: string[][]; protocol?: boolean }) {
  return <div className="table-scroll"><table><thead><tr>{(protocol ? ['字段', '类型', '说明'] : ['属性 / 方法', '类型', '默认值', '说明']).map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((value, index) => <td key={index}>{index < row.length - 1 ? <code>{value}</code> : value}</td>)}</tr>)}</tbody></table></div>;
}
export function UploadApiTable() { return <ApiTable rows={componentRows} />; }
export function UseUploadApiTable() { return <ApiTable rows={hookRows} />; }
export function UploadProtocolTable() { return <ApiTable rows={protocolRows} protocol />; }
