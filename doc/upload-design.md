# 轻量 Upload 与 useUpload 设计草案

状态：2026-10-13 已实现首期独立 Upload 与 useUpload。本文记录计划 API、功能和行为边界；不代表完整 antd Upload API 已完成。

## 职责与原则

- Upload 是文件列表输入控件，负责选择、拖拽、校验和展示，不发送请求。
- useUpload 管理上传任务，负责自动/手动上传、并发、进度、取消与失败重试；可脱离 Upload 使用。
- 两者通过普通属性协议组合，Upload 不识别特定 Hook，也不依赖请求库、后端地址或接口结构。
- 常规属性尽量沿用 antd 命名；请求 Hook、操作类型和任务状态属于独立设计，不承诺完整 antd Upload 兼容。
- 一个列表只保留一个状态来源，不让组件、Hook 和 Form 分别维护同一份列表。
- 使用稳定 uid 区分文件，不修改原生 File，不通过文件名或列表下标判断身份。
- 内置图标复用 SVG 系统；紧凑黑白外观，状态色沿用主题，不使用回弹动画。

## 常规组合

```tsx
const upload = useUpload({
  request: async ({ file, signal, onProgress }) => {
    const result = await uploadImage(file, { signal, onProgress });
    return { url: result.url, response: result };
  },
});

<Upload {...upload.props} accept="image/*" multiple maxCount={5} />;
```

Upload 不提供 request、action、customRequest、autoUpload 或请求配置。鉴权、请求参数、接口响应检查、压缩和格式转换都由 Hook 的 request 函数处理。

## 文件协议

```ts
type UploadFile<T = unknown> = {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  originFileObj?: File;
  status: 'idle' | 'uploading' | 'done' | 'error' | 'cancelled';
  percent?: number;
  url?: string;
  response?: T;
  error?: Error;
};
```

| 状态 | 含义 |
| --- | --- |
| idle | 新加入、尚未上传 |
| uploading | 请求正在进行 |
| done | 上传完成或远端文件回填 |
| error | 上传失败，可重试 |
| cancelled | 用户或外部取消，保留在列表，可重新上传 |

本地文件带 originFileObj。远端回填可只传 uid、name、url、status: 'done'，没有原始 File 时不能重新上传。删除是列表操作，不把 removed 作为持久状态。

## Upload 属性

| 属性 | 计划类型 / 行为 |
| --- | --- |
| fileList / defaultFileList | 受控列表 / 非受控初始列表，默认空列表 |
| onChange | `(info: UploadChangeInfo<T>) => void`，只通知用户造成的实际列表变化 |
| accept | 原生文件类型选择提示；拖拽走同一接纳与校验流程，不作为文件安全保证 |
| multiple | 是否允许一次选择多个文件，默认 false |
| maxCount | 最大列表长度，包含待上传、上传中、成功、失败和取消的文件 |
| validate | `(file: File, batch: readonly File[]) => string \| undefined \| Promise<string \| undefined>`；返回错误文案或抛出错误则拒绝加入 |
| listType | `'text' \| 'picture' \| 'picture-card'`，默认 text |
| showUploadList | 是否显示内置列表，默认 true；首版不提供复杂配置对象 |
| onRemove | `(file: UploadFile<T>) => boolean \| void \| Promise<boolean \| void>`；false 或 Promise 拒绝阻止移除 |
| onPreview | `(file: UploadFile<T>) => void`；提供时使用业务预览，否则图片使用基础内置预览 |
| onCancel / onRetry | `(file: UploadFile<T>) => void`，操作意图交给外部；未提供回调时不显示对应操作 |
| onReject | `(rejections: UploadRejection[]) => void`，接收本批被拒绝的文件及原因 |
| disabled / status | 禁用 / 控件整体 error、warning 状态，与单个文件的上传状态分开 |
| children | 自定义选择入口；默认提供紧凑的选择按钮 |
| className / style | 容器外观扩展 |
| ref | `open(): void`、`focus(): void` 和 `nativeElement`，不提供上传任务方法 |

首版提供 Upload.Dragger，共用相同属性和状态逻辑，仅改变文件选择区域的展示与拖拽交互。任意自定义 children 的点击、禁用和键盘行为需在实现时明确，不能生成嵌套按钮或只支持鼠标的入口。

## onChange 操作类型

```ts
type UploadChangeInfo<T = unknown> =
  | {
      type: 'add' | 'remove';
      fileList: UploadFile<T>[];
      files: UploadFile<T>[];
      removedFiles?: never;
    }
  | {
      type: 'replace';
      fileList: UploadFile<T>[];
      files: UploadFile<T>[];
      removedFiles: UploadFile<T>[];
    };
```

| type | 触发情况 | files | removedFiles |
| --- | --- | --- | --- |
| add | 选择或拖入新文件 | 本次实际加入的文件 | 不提供 |
| remove | 移除文件，且 onRemove 已允许 | 本次实际移除的文件 | 不提供 |
| replace | maxCount 为 1，已有文件被新文件替换 | 新加入的文件 | 本次被替换的旧文件 |

fileList 始终是操作后的完整列表。首次加入单文件仍是 add，有旧文件才是 replace。一次多选或拖入多个文件，校验结束后按选择顺序一次性通知，不按文件逐个触发。

被拒绝的文件走 onReject，不混入 files。没有实际列表变化时不触发 onChange。外部传入新 fileList、上传状态和进度变化不会反向触发组件 onChange；取消和重试走各自回调，不添加 cancel、retry、progress 等列表操作类型。

```tsx
<Upload
  fileList={files}
  onChange={({ type, fileList, files: changedFiles, removedFiles }) => {
    setFiles(fileList);
    // type 表示 add / remove / replace。
    // changedFiles 是本次操作文件，removedFiles 仅替换时存在。
  }}
/>
```

## 选择、校验与数量限制

- 大小限制、图片尺寸和业务规则走 validate，不分别增加大量校验属性。
- validate 只判断能否加入，不替换 File，不承担压缩、转换或暂停上传的职责。
- maxCount 为 1 时，新文件通过校验后才替换旧文件；新文件不合格时保留旧文件。替换整批最多接收一个文件，其余走 onReject。
- 多文件超限时，按原顺序接收剩余容量，超出部分拒绝；不静默移除已有文件。
- 异步校验结束时基于最新列表重新判断容量，不覆盖期间发生的删除或外部回填；卸载后不能补回文件。
- 重复选择同名文件不自动去重，接纳后生成不同 uid；清空原生 input 值，允许再次选择同一个文件。

```ts
type UploadRejection = {
  file: File;
  reason: 'type' | 'count' | 'validation';
  message: string;
};
```

## useUpload

| 配置 | 计划类型 / 行为 |
| --- | --- |
| request | 必填，`(options: UploadRequestOptions) => Promise<UploadResult<T>>` |
| defaultFileList | Hook 初始列表，可用于远端文件回填 |
| autoUpload | 默认 true，新加入文件自动进入队列；false 时只加入列表 |
| concurrency | 同时进行的请求数量，默认 3，要求正整数 |

```ts
type UploadRequestOptions = {
  file: File;
  signal: AbortSignal;
  onProgress: (percent: number) => void;
};

type UploadResult<T = unknown> = {
  url?: string;
  response?: T;
};
```

request Promise 完成表示成功，拒绝表示失败。业务负责检查响应里的业务错误并抛出错误，不以 HTTP 请求完成自动认定业务成功。不要求 onSuccess/onError 回调，不解读 response，不绑定 fetch、Axios 或特定 SDK。

| 返回值 / 方法 | 行为 |
| --- | --- |
| fileList | 当前完整列表，供展示或读取结果 |
| props | 普通 Upload 属性：fileList、onChange、onCancel、onRetry；不包含请求配置 |
| upload(uids?) | 上传所有 idle 文件，或上传/重试指定 uid；返回 Promise<void>，本次指定任务结束后完成，逐项结果通过列表读取 |
| cancel(uid?) | 取消指定文件；不传 uid 取消全部等待或进行中的任务，保留列表项 |
| setFileList(next) | 更新本地列表，支持新列表或函数更新；用于回填、清空、更新业务结果 |

props.onChange 接收组件的操作信息，更新 Hook 列表；新增或替换后按 autoUpload 决定是否入队。props.onCancel/onRetry 执行取消或重新上传。onRemove、onPreview、校验及展示属性仍由业务传给组件。

```tsx
const upload = useUpload({ request: uploadFile, autoUpload: false });

<Upload {...upload.props} multiple />;
<Button onClick={() => upload.upload()}>开始上传</Button>;

upload.upload([uid]); // 对指定失败或取消文件重新上传
upload.cancel(uid);
upload.setFileList(remoteFiles); // 显式回填
```

upload() 不自动重试所有失败文件，避免一次操作重复请求。重试明确指定 uid。已经上传中或完成的文件不重复上传；没有 originFileObj 的远端文件不进入上传任务。

## 请求生命周期与进度

- 每个任务使用独立 AbortController。取消、移除、替换、清空和 Hook 卸载均终止对应任务；排队中的文件也能取消。
- 真正的网络取消要求 request 将 signal 传给请求库。即使请求库不支持取消，Hook 也必须忽略旧任务的结果和进度。
- 同一 uid 重试生成新的任务身份，旧请求的延迟成功或失败不能覆盖新任务，也不能重新插入已经移除的文件。
- request 只处理真实上传；不提供模拟进度。onProgress 使用 0～100，成功后为 100；无进度能力时显示不确定进度。
- Hook 更新状态和进度不通过调用组件 onChange 实现，列表操作通知和请求事件不混为一个协议。
- 取消与删除不同：取消保留文件，删除移除文件；取消不显示为请求错误。
- 删除不等于删除远端资源。业务可在 onRemove 中调用删除接口，完成后允许移除；替换同样不自动删除服务器旧资源。
- setFileList 移除或替换活动任务对应文件时，应取消旧任务；单纯更新展示元数据不应重启请求。具体一致性实现需在编码时验证。

## Form 接入

纯文件选择场景直接绑定文件列表：

```tsx
<Form.Field name="attachments" label="附件">
  <Upload multiple maxCount={5} />
</Form.Field>
```

Upload 声明统一字段绑定协议：valueProp 为 fileList，变化取 onChange(info).fileList，初始化使用 defaultFileList；错误、禁用及无障碍属性遵循现有控件协议，不在 Form 中添加 Upload 特判。

立即上传场景需要明确列表归属：使用 Hook 的 fileList 管理任务，不再同时让 Form 自动接管同一个 fileList。业务可在提交时读取 Hook 中已完成文件，或将完成结果写入独立表单字段。需要 Form 和 Hook 共用受控列表的直连能力，后续单独细化，不先承诺隐式双向同步。

## 首版功能与边界

| 功能 | 首版范围 |
| --- | --- |
| 文件选择 | 点击、原生文件对话框、多选、重复选择 |
| 拖拽 | Upload.Dragger，文件拖入；共用校验逻辑 |
| 列表 | text、picture、picture-card；远端回填，移除、状态、错误、取消和重试入口 |
| 图片 | 本地缩略图和基础图片预览，业务 onPreview 可覆盖 |
| 上传任务 | Hook 独立管理自动/手动上传、并发、真实进度、取消和重试 |
| 扩展 | 自定义选择入口、隐藏默认列表、业务请求函数 |
| 目录、粘贴、拖拽排序 | 暂缓 |
| 裁剪、压缩和格式转换 | 业务 request 或自定义业务组件组合，不内置引擎 |
| 分片、断点续传、签名和存储 SDK | 由业务 request 接入，不纳入首版 |
| 任意文件预览、下载系统 | 不内置，业务自行处理 |

本地缩略图使用临时 Object URL，移除、替换与卸载时释放，不写进持久业务数据；图片加载失败显示文件占位，不阻断选择和上传。

## 验证计划

- 纯组件不发请求；受控、非受控列表行为一致，外部状态变化不产生 onChange 循环。
- 多选只通知一次；操作类型、files、removedFiles 和最终列表一致；拒绝、超限与异步校验竞态有覆盖。
- 取消、删除、替换、清空、卸载、重试后，旧任务与进度不能回写；并发上限和排队取消有效。
- 用可取消的真实请求验证 AbortSignal，不只用 Promise 演示；无进度的请求不生成假百分比。
- 键盘选择、拖拽、禁用、自定义入口、焦点与错误关联有效；Form 自动绑定不依赖组件身份。
- 缩略图失败与 Object URL 释放、远端文件回填、图片预览、移动端布局均有实际案例。
- 验证组件和 Hook 的独立导入、npm 与 CLI 分发，不让纯 Upload 强制加载上传任务模块。
- 实现后补齐文档站 API 和充分案例，并按 AGENTS.md 更新优先级 Markdown、生成 HTML、检查状态筛选与统计。
