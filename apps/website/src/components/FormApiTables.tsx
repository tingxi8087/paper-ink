import { PropsTable } from './ComponentApiTables';
export function FormApiTables() { return <>
<h3>Form</h3><PropsTable rows={[
 ['form', 'FormInstance<T>', '必填', 'useForm 创建的稳定实例'],
 ['onSubmit', '(values: T) => void | Promise<void>', '—', '校验通过后提交固定快照；等待异步提交并保护重复提交'],
 ['onValuesChange', '(changed, values, info) => void', '—', '值变化通知；info 含 source、names、previousValues'],
 ['onError', '(error, { phase }) => void', '控制台报告', '校验、提交或用户值更新异常；业务失败保留输入'],
 ['disabled / validateTrigger', 'boolean / blur | change | submit', 'false / blur', '整体禁用与字段校验默认触发方式'],
 ['className / style / ref / 原生 form 属性', '原生属性', '—', '原生 reset 重置基准；使用 noValidate 由字段统一校验'],
]} />
<h3>Form.Field</h3><PropsTable rows={[
 ['name / form', '顶层 key / FormInstance<T>', '必填 / 从 Form 获取', '不解析点路径；显式 form 可推导字段名与字段值类型'],
 ['label / help', 'ReactNode', '—', '标题、辅助说明及控件的无障碍关联'],
 ['required', 'boolean | string', 'false', '必填校验与标记；字符串作为自定义错误'],
 ['validate', '(value, { values, signal }) => string | undefined | Promise', '—', '返回错误文字或 undefined；过期结果忽略'],
 ['validateTrigger', 'blur | change | submit', '继承 Form', '默认失焦，已有错误后输入重新校验；submit 模式不自动校验'],
 ['dependencies', '顶层 key[]', '—', '已操作或已校验字段在依赖变化后重新校验'],
 ['preserve', 'boolean', 'false', '卸载后可暂存值，仍不校验、不提交；重新挂载恢复'],
 ['children', '唯一直接控件 / ({ control, ...state }) => ReactNode', '必填', '默认协议 value/onChange(value)；特殊布局用渲染函数'],
 ['disabled / className / style', 'boolean / string / CSSProperties', 'false / —', '表单、字段或控件任一禁用即禁用'],
]} />
<h3>实例与 Hook</h3><PropsTable rows={[
 ['useForm({ defaultValues })', 'FormInstance<T>', '—', '初始化与重置基准；后续 defaultValues 不覆盖输入'],
 ['getValues()', 'T', '—', '当前注册字段的独立快照；条件字段应在类型中声明为可选'],
 ['setValue(name, value) / patchValues(values)', '顶层 key / Partial<T>', '—', '单字段或顶层批量更新；对象数组整体替换；批量通知一次'],
 ['reset(values?)', 'void', '—', '恢复基准或载入新基准；不通知 onValuesChange、不重挂载'],
 ['validate(names?)', 'Promise<{ status, values, errors }>', '全部注册字段', 'status=valid/invalid/cancelled；直接调用异常会 reject'],
 ['useWatch(form, name)', '字段值', '—', '独立订阅顶层字段，适合条件显示'],
 ['useFormState(form)', '{ submitting, dirty }', '—', '提交期间与修改状态；不提供 form.submitting'],
 ['useFieldState()', 'FieldState', '—', '当前 Field 的 error/status/validating/touched/dirty/disabled/required'],
 ['defineFieldBinding(component, binding)', '原组件', '默认值协议', '控件就近声明 valueProp/changeProp/getValue 等绑定能力'],
 ['FieldControl', 'status / disabled / 原生 div 属性与 ref', '继承字段状态', '自绘控件外观容器；不管理值与校验'],
]} />
</>; }
