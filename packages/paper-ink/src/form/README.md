# Form

独立设计的顶层字段表单，不兼容 antd Form。没有新增运行时依赖。

```tsx
import { Form, useForm, useFormState, Input, Button } from 'paper-ink';
import 'paper-ink/style.css';

function Profile() {
  const form = useForm({ defaultValues: { name: '' } });
  const { submitting } = useFormState(form);
  return <Form form={form} onSubmit={saveProfile}>
    <Form.Field name="name" label="姓名" required><Input /></Form.Field>
    <Button htmlType="submit" loading={submitting}>保存</Button>
  </Form>;
}
```

## 数据与绑定

- useForm 仅使用首次 defaultValues。reset(data) 载入新基准，reset() 恢复基准，均不重挂载、不通知 onValuesChange。
- name 是顶层字符串 key，点号不解析。setValue 更新一项，patchValues 顶层局部更新，对象和数组整体替换。
- 自动绑定唯一直接控件子元素；自定义控件默认 value/onChange(nextValue)，转发 onBlur、status、disabled、无障碍属性和 focus ref。
- defineFieldBinding(Component, binding) 声明 valueProp、changeProp、getValue；Form 不导入或识别控件。库内控件在各自模块声明，包装组件需转发协议或遵守默认协议。
- 不自动绑定原生元素、Fragment、额外包装；特殊布局使用 children 渲染函数，显式连接 control.value、control.setValue 和 control.props。
- 方法和 useWatch 有顶层值类型推导。Field 使用上下文时无法从父 JSX 推导类型；传 form={form} 可以推导字段名和值，或显式指定 Field 的泛型。
- 值按不可变数据使用。快照复制普通对象、数组、Date；其他类实例、Map/Set 等需转为普通数据。Object.is 决定是否产生变化通知；dirty 按与基准的内容比较。

## 通知与订阅

onValuesChange(changedValues, values, info)：info 包含 source=user/programmatic、names 数组、仅变化字段的 previousValues。一次 patch 通知一次，两次 setValue 通知两次。初始化、reset、校验和卸载移除不通知。

useWatch(form, name) 订阅字段值；useFormState(form) 订阅 submitting/dirty；useFieldState() 读取最近 Field 的展示状态，在 Field 外调用会报错。不存在 form.submitting。

## 校验与提交

- required 支持 boolean 或自定义提示字符串。null、undefined、空白字符串、空数组为空，0/false 非空；不会 trim 数据。
- validate(value, { values, signal }) 返回 undefined、错误文字或 Promise。状态含独立的 error、validating、touched、dirty。
- 默认 blur，出现错误后输入重新校验；change 逐次校验；submit 仅提交和主动校验。dependencies 只对已经触碰或校验过的字段触发。
- validate(names?) 返回 status=valid/invalid/cancelled 与 values/errors。程序调用的异常 reject，表单内异步流程异常交给 onError(error, { phase })；未配置时报告控制台。
- 过期校验不能覆盖新结果；即使校验函数忽略 signal，数据修改、重置和卸载也能结束取消的等待。
- 提交期间阻止重复提交。校验阶段改变数据取消本次提交，业务提交拿固定快照。成功不清空，失败保留输入，不自动禁用整表。
- native reset 使用表单基准；native HTML 校验关闭，由 Field 提供错误并聚焦首个无效控件。

## 生命周期与组合控件

preserve 默认 false，卸载删除值和状态；true 暂存值，但不参与 getValues、校验或提交。再次挂载恢复暂存值，否则恢复该字段基准。reset 同步重置暂存数据。

getValues 和提交只包含注册字段；条件字段在类型中应声明为可选。对象、联系人数组作为整组字段，内部增删、排序、稳定 key 与子项错误由自定义控件管理。不提供 Form.List 或 useFieldArray。

FieldControl 是可选外观容器，继承 Field 状态，不管理值。组合控件自行声明 focus() 和错误落点；已注册的原生 group ref 会回退聚焦实际子控件。

## 分发

独立入口 paper-ink/form、paper-ink/form/style.css；控件 CSS 单独导入。CLI：paper-ink add form input button，协议文件作为共享依赖安装。

详细设计见 ../../../../doc/form-design.md；文档站有 12 个可编辑案例。

- 不可变值类（如 Dayjs）以相同原型和 valueOf() 的数字/字符串值比较 dirty；快照保留实例。可变类仍需业务转换，不通过修改实例更新字段。
