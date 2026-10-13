# Upload

纯文件列表输入控件：点击 / 拖拽、同步与异步校验、数量限制、三种列表、图片预览和 Form 绑定。Upload 不发送请求，上传任务由独立 `useUpload` 或业务状态管理处理。

```tsx
import { Upload } from 'paper-ink/upload';
import { useUpload } from 'paper-ink/hooks';
import 'paper-ink/upload/style.css';

const upload = useUpload({
  request: async ({ file, signal, onProgress }) => {
    const result = await uploadFile(file, { signal, onProgress });
    return { url: result.url, response: result };
  },
});
<Upload {...upload.props} multiple maxCount={5} />;
```

不使用 Hook 时，`fileList / defaultFileList` 与 `onChange` 只管理选中文件。`onChange({ type, fileList, files, removedFiles })` 的 type 为 add / remove / replace；removedFiles 仅替换时提供。一次多选校验后通知一次，外部进度更新不触发列表操作事件。`maxCount={1}` 校验通过后替换旧文件，失败保留旧文件；类型、数量和校验拒绝走 onReject。validate 返回错误文案或抛错拒绝加入，不转换 File。

文件通过稳定 uid 区分。本地文件带 originFileObj，远端回填可只提供 uid、name、url、status:'done'。listType 支持 text / picture / picture-card；showUploadList 可隐藏内置列表。Upload.Dragger 共用属性。自定义单一 button / a / React 组件通过克隆透传事件，其他内容使用默认按钮包裹，避免嵌套按钮；自定义组件需转发 onClick、disabled、id 及 aria 属性。ref 提供 open()、focus() 与 nativeElement，不提供请求方法。禁用、整体错误状态、className/style 与原生 div 无障碍属性均可传入。

useUpload 提供 autoUpload（默认 true）、concurrency（默认 3）、fileList、props、upload(uids?)、cancel(uid?)、setFileList。request 收到原始 File、AbortSignal 和 onProgress(0～100)，Promise resolve / reject 表示成功 / 失败；响应结构由业务解释。upload() 只处理 idle 文件，失败或取消后指定 uid 重试。取消保留列表，移除会取消任务；旧结果、迟到进度及卸载后任务不会回写。请求库需要实际透传 signal 才会取消网络请求。无真实进度时不模拟百分比。

删除由 onRemove 决定，false 或 Promise 拒绝阻止移除；不会自动删除服务器资源。onCancel / onRetry 仅发出操作意图，未传时隐藏入口。默认图片提供基础预览，onPreview 可覆盖；本地 Object URL 按生命周期释放。非图片预览、下载和业务删除由调用方实现。

Form.Field 自动绑定文件列表；与 useUpload 组合时由 Hook 持有列表，提交读取 Hook 结果，避免多个状态来源。常规属性参考 antd，任务 Hook、操作类型和状态独立设计，不提供 action/customRequest/beforeUpload。目录、粘贴、排序、裁剪、分片和断点续传不内置。

CLI：纯控件使用 `paper-ink add upload`，组合请求使用 `paper-ink add upload use-upload`，Hook 单独安装使用 `paper-ink add use-upload`。Hook 独立导入，不让纯 Upload 加载请求任务逻辑。完整 API 和 12 组交互案例见网站文档。
