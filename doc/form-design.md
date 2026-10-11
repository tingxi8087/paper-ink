# 新表单设计草案

状态：已实现第一期独立 Form。本文记录确定的设计与实现边界；实际导出以组件源码和文档站 API 为准。

Form 属于独立设计，不承诺 antd Form API 兼容，也不代表优先级清单里的 antd Form 已完成。其他输入组件继续沿用已有 API。

## 设计原则

- 字段值由表单统一管理，控件保持独立，不要求自定义控件调用表单 Hook。
- 第一期只管理顶层字段；对象和数组可作为完整字段值，内部交互交给自定义控件，不解析嵌套字段路径。
- 常规写法自动绑定唯一的直接控件子元素；特殊布局和事件结构使用渲染函数显式绑定。两种写法共用同一个字段引擎。
- 自动绑定读取控件声明的统一协议，不识别组件身份，不在 Form 中维护控件名单。
- 错误状态、禁用状态和无障碍属性通过统一属性传递。
- 字段展示订阅与校验依赖分开，不提供多个含义接近的联动入口。
- 每个字段订阅自己的状态；表单元状态订阅不因每次输入而刷新整个表单。
- 使用原生 form 提交语义。布局组合 Stack、Inline、SimpleGrid，不再内置一套布局系统。
- 不以减少 API 数量代替性能验证；体积和渲染成本在实现后测量。

## API 总览

| API | 计划用途 | 阶段 |
| --- | --- | --- |
| `useForm<T>(options)` | 创建稳定的表单实例、初始化数据 | 第一期 |
| `Form` | 原生表单、上下文、提交流程 | 第一期 |
| `Form.Field` | 注册字段、标签、帮助与错误展示、控件关联 | 第一期 |
| `form.getValues()` | 读取当前数据快照，不建立订阅 | 第一期 |
| `form.setValue(name, value)` | 修改指定字段 | 第一期 |
| `form.patchValues(values)` | 一次操作局部更新多个字段，统一通知 | 第一期 |
| `form.reset(values?)` | 恢复基准数据，或载入新的基准数据 | 第一期 |
| `form.validate(names?)` | 校验全部或指定字段 | 第一期 |
| `useWatch(form, name)` | 订阅指定字段值，用于条件展示等 | 第一期 |
| `useFormState(form)` | 订阅提交、修改等表单元状态 | 第一期 |
| `useFieldState()` | 读取最近一个 Field 的展示状态 | 第一期，高级入口 |
| `FieldControl` | 自绘控件的通用外观容器 | 第一期已实现 |
| 数组作为单个字段 | 自定义控件内部管理增删、排序与稳定 key | 第一期 |
| 数组字段 Hook | 表单逐项管理值、错误与稳定身份 | 暂缓，有实际需求后评估 |

不计划提供 `getFieldValue/getFieldsValue` 多种重载、`setFields/setFieldsValue`、`shouldUpdate`、跨表单 Provider、schema 页面生成器等入口。

## useForm 与实例

```tsx
type Values = {
  username: string;
  enabled: boolean;
};

const form = useForm<Values>({
  defaultValues: { username: '', enabled: true },
});
```

| 配置或方法 | 行为 |
| --- | --- |
| `defaultValues` | 初始化及重置基准；后续 props 变化不自动覆盖输入 |
| `getValues()` | 返回当前数据快照；调用方不能通过修改快照改变表单 |
| `setValue(name, value)` | 使用与用户输入相同的数据更新通道，更新 dirty 并通知订阅 |
| `patchValues(values)` | 顶层局部更新，保留未指定字段；对象和数组整体替换，一次操作只通知一次 |
| `reset()` | 恢复当前基准，清除错误、触碰与修改状态 |
| `reset(values)` | 将 values 同时设为当前值和新基准，适用于异步编辑数据 |
| `validate()` | 校验所有当前注册字段 |
| `validate(names)` | 校验指定字段，不触发业务提交 |

`reset` 不通过重新挂载控件实现。name、setValue、useWatch、dependencies 和 validate(names) 统一使用顶层字段 key，按 `keyof Values` 推导字段值类型；不提供点路径解析、数组下标路径或深层合并。快照复制普通对象、数组和 Date；其他类实例需业务适配。validate 返回 status、values、errors。

```tsx
type Values = {
  username: string;
  address: { province: string; city: string };
  contacts: Contact[];
};

form.setValue('address', { province: '浙江', city: '杭州' });
form.patchValues({ contacts: nextContacts });
```

`address` 和 `contacts` 各是一个字段。`address.city` 不会被解释为 address 内部的 city；带点的实际顶层键也只作为字面 key。需要与后端嵌套结构转换时，由业务在加载或提交处处理。

```tsx
// 编辑详情加载完成后，明确载入数据。
form.reset(detail);

// 联动修改一个字段；不会把其他输入覆盖掉。
form.setValue('username', 'new-name');
```

## Form

| 属性 | 计划类型 / 用途 |
| --- | --- |
| `form` | useForm 创建的实例 |
| `onSubmit` | `(values: T) => void | Promise<void>`，校验通过后调用 |
| `onValuesChange` | `(changedValues, values, info) => void`，可选的数据变化通知 |
| `disabled` | 向字段传递整体禁用状态 |
| `children` | 字段和任意布局内容 |
| `className / style` | 自定义外观 |
| 原生 form 属性、ref | 保留合理的原生能力；onSubmit 使用上述业务提交语义 |

提交流程：阻止默认页面跳转 → 校验当前注册字段 → 失败时聚焦首个错误控件 → 成功时调用 onSubmit → 等待 Promise → 结束 submitting。

- 提交期间阻止重复提交，submitting 在校验与业务提交期间均为 true。
- 提交成功不自动清空，失败保留输入。
- 业务请求失败不自动转换成字段格式错误；由业务代码处理。
- 不默认把提交状态等同于整表禁用。
- 异步校验期间的数据变化、提交快照与异常处理边界需要专门验证，避免提交未经校验的新值。

## 数据变化通知与批量更新

onValuesChange 用于自动保存、同步外部草稿、通知父组件等业务副作用。动态界面联动使用 useWatch，跨字段校验使用 dependencies，最终提交使用 onSubmit；不增加混合值和校验状态的 onFieldsChange 总回调。

```tsx
<Form
  form={form}
  onValuesChange={(changedValues, values, info) => {
    if (info.source === 'user') {
      saveDraftDebounced(values);
    }
  }}
/>
```

### 三个参数

| 参数 | 含义 |
| --- | --- |
| `changedValues` | 本次实际变化的顶层字段及新值，结构为 Partial<T> |
| `values` | 本次更新后的完整表单数据快照 |
| `info.source` | `'user'` 或 `'programmatic'`，区分控件输入与程序修改 |
| `info.names` | 本次实际变化的顶层字段 key，始终是数组 |
| `info.previousValues` | 仅变化字段的旧值，结构与 changedValues 对应；不是整份旧表单数据 |

单字段和多字段共用同一种参数结构，不再提供独立的 name / previousValue 属性。旧值表示本次操作之前的值，不是 defaultValues；程序修改同样提供旧值。

以下是参数结构示意，字段名限定为数据模型的顶层字符串 key：

```tsx
type ValuesChangeInfo<T> = {
  source: 'user' | 'programmatic';
  names: Array<Extract<keyof T, string>>;
  previousValues: Partial<T>;
};
```

### 单字段修改

假设原数据为 `{ username: '张三', enabled: true }`，执行：

```tsx
form.setValue('username', '李四');
```

onValuesChange 调用一次，参数为：

```tsx
changedValues // { username: '李四' }
values        // { username: '李四', enabled: true }
info          // {
              //   source: 'programmatic',
              //   names: ['username'],
              //   previousValues: { username: '张三' }
              // }
```

同样的变化如果来自用户输入，source 为 user。

### 批量修改

假设原数据为 `{ province: '江苏', city: '南京', enabled: true }`，执行：

```tsx
form.patchValues({ province: '浙江', city: '杭州' });
```

先完成两个字段的更新，再统一通知；订阅者不会看到本次操作的中间状态。onValuesChange 只调用一次：

```tsx
changedValues // { province: '浙江', city: '杭州' }
values        // { province: '浙江', city: '杭州', enabled: true }
info          // {
              //   source: 'programmatic',
              //   names: ['province', 'city'],
              //   previousValues: { province: '江苏', city: '南京' }
              // }
```

patchValues 是顶层局部更新，不替换整份数据、不改变重置基准，也不清除全部字段状态；指定的对象和数组字段整体替换，不递归合并。变更字段使用与 setValue 相同的 dirty 和校验触发规则。依赖校验读取完整更新后的数据。

```tsx
// 原 address = { province: '江苏', city: '南京' }
form.patchValues({ address: { province: '浙江', city: '杭州' } });
// 替换整个 address；部分属性更新由自定义控件先构造完整的新对象。
```

### 通知规则

| 操作 | onValuesChange 行为 |
| --- | --- |
| 用户修改字段 | 一次操作通知一次，source=user |
| setValue 修改字段 | 一次操作通知一次，source=programmatic |
| patchValues 修改多个字段 | 一次操作通知一次，source=programmatic |
| 连续调用两次 setValue | 两次通知，不因 React 合并渲染而合并 |
| 设置相同值 | 不通知；批量更新时从变化集合中排除 |
| 初始化、reset()、reset(values) | 不通知 |
| 只变化错误、触碰或校验状态 | 不通知 |

patchValues 中所有字段都未变化时不通知。相同值采用 Object.is 比较；显式 undefined 设为空值，不跳过更新。dirty 按与基准的内容比较。

在回调中再次 setValue / patchValues 会形成下一次更新与通知；使用来源判断或值比较避免循环，不默默屏蔽程序更新。

## Form.Field

| 属性 | 计划用途 |
| --- | --- |
| `name` | 顶层字段 key，关联值、校验和状态 |
| `label` | 字段标题，通过关联 ID 连接控件 |
| `required` | 必填校验和必填标记共用一个声明 |
| `validate` | 同步或异步校验函数 |
| `dependencies` | 其他字段变化时，重新校验本字段；不负责联动渲染 |
| `help` | 辅助说明；错误出现时的展示关系保持统一 |
| `disabled` | 字段禁用；整体表单禁用优先，不允许字段绕过 |
| `preserve` | 默认 false；卸载移除值与错误，显式开启则保留值 |
| `children` | 唯一的直接控件子元素，或获得 control 和字段状态的渲染函数 |
| `className / style` | 字段容器外观 |

required 支持 boolean 或自定义提示字符串；help 与错误分别展示。已卸载字段不继续校验，不留下过期错误；preserve 的暂存值不进入 getValues 或提交。

### 常规写法：直接子控件

```tsx
<Form.Field name="username" label="用户名" required>
  <Input placeholder="请输入用户名" />
</Form.Field>

<Form.Field name="enabled" label="启用">
  <Switch />
</Form.Field>

<Form.Field name="contacts" label="联系人">
  <ContactsInput />
</Form.Field>
```

自动绑定规则：

- 只绑定唯一的直接控件子元素，不递归查找，不猜测多个子元素里的主控件。
- 自定义控件默认采用 value / onChange(nextValue) 协议，不要求调用表单 Hook。
- 控件在自己的模块声明统一绑定协议，描述值属性、变化回调及值提取方式；Form 只读取协议，不导入控件或判断组件身份。保留现有控件 API。
- 自动传入值、变化回调、onBlur、错误状态、禁用状态、ID、无障碍属性和聚焦注册 ref。
- 字段值由表单管理，不同时由子控件的 value / defaultValue 建立第二个数据来源。
- 自定义控件负责把属性与聚焦能力连接到实际控件；仅声明这些 props 不会自动产生外观或无障碍效果。

绑定协议通过 defineFieldBinding(component, binding) 附着到组件，采用共享 Symbol；npm 与 CLI 源码使用相同协议。基础结构如下：

```tsx
type FieldBinding = {
  valueProp: string;
  changeProp: string;
  getValue: (...args: any[]) => unknown;
};

// Input 自己声明：value / onChange(event)
const inputBinding = {
  valueProp: 'value',
  changeProp: 'onChange',
  getValue: (event: React.ChangeEvent<HTMLInputElement>) => event.target.value,
};

// Switch 自己声明：checked / onChange(boolean)
const switchBinding = {
  valueProp: 'checked',
  changeProp: 'onChange',
  getValue: (value: boolean) => value,
};
```

未声明协议的自定义控件默认使用 value / onChange(nextValue)。业务包装组件不自动继承被包装控件的声明，应遵守默认协议、显式转发声明，或使用渲染函数。库内公开包装组件需要在自身模块保留声明，包括 CLI 源码分发场景。

下面的包装不自动绑定内部 Input；Fragment、多个子元素和特殊布局也不递归处理，应改用渲染函数：

```tsx
<Form.Field name="username">
  <div><Input /></div>
</Form.Field>
```

### 扩展写法：渲染函数

用于第三方控件、特殊事件结构或额外包装。显式指定值与事件映射，仍使用同一份字段状态和 control.props。

```tsx
<Form.Field name="username" label="用户名" required>
  {({ control }) => (
    <Input
      {...control.props}
      value={control.value}
      onChange={event => control.setValue(event.target.value)}
    />
  )}
</Form.Field>

<Form.Field name="enabled" label="启用">
  {({ control }) => (
    <Switch
      {...control.props}
      checked={control.value}
      onChange={control.setValue}
    />
  )}
</Form.Field>
```

### control 与字段状态

| 内容 | 含义 |
| --- | --- |
| `control.value` | 当前字段值 |
| `control.setValue(value)` | 接收业务值，不猜测 DOM 事件结构 |
| `control.props` | 关联、聚焦、失焦和展示所需的标准属性 |
| `error` | 当前错误文字，string 或 undefined |
| `status` | 控件外观状态，如 error / warning；不是全部生命周期状态 |
| `validating` | 正在异步校验 |
| `touched` | 用户已与字段交互，默认以失焦标记 |
| `dirty` | 当前值是否偏离重置基准 |

error、validating、touched、dirty 分开保存：校验中可能仍有错误，修改过也不等于已失焦。warning 作为展示协议预留，第一期不承诺单独的警告校验系统。

## 校验

```tsx
<Form.Field
  name="username"
  label="用户名"
  required
  validate={value =>
    value.length < 2 ? '至少输入两个字符' : undefined
  }
>
  <Input />
</Form.Field>
```

校验函数统一采用 `(value, context) => string | undefined | Promise<string | undefined>`。context 提供当前 values 与取消信号 signal。

- undefined 表示通过，字符串表示字段错误。
- required 先处理空值，其他业务校验使用函数；不再建立丰富的规则对象语言。
- 默认失焦校验、提交时完整校验；出现错误后，输入时重新校验。
- dependencies 用于跨字段校验，例如原密码变化后重新检查确认密码。
- 内部通过版本或取消信号忽略过期异步结果，不要求使用者自行处理竞态。
- 复杂 schema 校验可在 validate 中适配，不强制引入某个校验库。

空值包括 null、undefined、空字符串、纯空白字符串和空数组，0/false 有效。validateTrigger 支持 blur/change/submit；依赖变化仅校验已触碰或校验过的字段。直接调用 validate 的异常 reject；表单内流程由 onError 接收。

## 状态订阅 Hook

| Hook | 返回内容 / 职责 |
| --- | --- |
| `useWatch(form, name)` | 指定字段值；主要用于跨字段联动展示 |
| `useFormState(form)` | submitting、dirty 等元状态；用于按钮、未保存提醒等 |
| `useFieldState()` | 最近一个 Field 的 error、status、validating、touched、dirty、disabled、required 等状态 |

useFieldState 是可选高级入口，不负责读取或修改其他字段，也不能提交表单。Field 外调用报错。useFormState 仅订阅 submitting 和 dirty，第一期不提供选择器。

不提供 form.submitting；统一通过 useFormState 获取响应式提交状态。

```tsx
const accountType = useWatch(form, 'accountType');
const { submitting, dirty } = useFormState(form);
```

## 自定义控件与错误状态

普通自定义控件不需要调用表单 Hook。它接收 value、变化回调及标准属性，可以同时在表单内外使用。作为 Field 的唯一直接子控件时，这些属性自动注入；渲染函数模式下通过 control 显式传递。

```tsx
type ContactsInputProps = FieldControlProps & {
  value?: Contact[];
  onChange?: (value: Contact[]) => void;
  onBlur?: () => void;
};

<Form.Field name="contacts" label="联系人">
  <ContactsInput />
</Form.Field>
```

以上是属性协议示意；自定义组件还需按项目 React 版本约定转发 ref，并提供 focus 能力。

展示协议计划包含：

```tsx
type FieldControlProps = {
  id?: string;
  status?: 'error' | 'warning';
  disabled?: boolean;
  'aria-labelledby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};
```

control.props 还提供 onBlur 与聚焦注册 ref。以上是组件层协议，status 不能直接作为原生 DOM 属性透传；控件需要转成自身样式。组合控件的 ref 需要暴露 focus 能力，不能假定一定是原生 input。

```tsx
function MyInput({ value, onChange, ...props }: MyInputProps) {
  return (
    <Input
      {...props}
      value={value}
      onChange={event => onChange(event.target.value)}
    />
  );
}
```

| 内容 | 负责方 |
| --- | --- |
| 产生校验错误 | 表单引擎 |
| 标签、帮助和错误文字、关联 ID | Form.Field |
| 传递外观和无障碍属性 | 自动绑定，或渲染函数中的 control.props |
| 错误边框等外观 | 控件 |
| 聚焦首个错误 | Field 调用控件提供的 focus 能力 |

FieldControl 用于完全自绘的控件，提供通用边框、错误和禁用外观，不管理值和校验。组合控件可以把错误外观放在整体容器上；错误文字默认只显示一次。

## 对象与数组作为单个自定义字段

复杂输入优先封装成独立组件，由组件负责内部数据结构、布局和交互。例如地址对象：

```tsx
<Form.Field name="address" label="地址">
  <AddressInput />
</Form.Field>
```

AddressInput 接收完整的 `{ province, city }`，修改城市时返回完整的新对象；Form 不管理 address 内部路径。整个地址只有一份表单级校验、touched 和 dirty 状态，内部细粒度展示由控件处理。

第一期先把 contacts 等数组作为一个字段，不提供专门的 useFieldArray：

```tsx
<Form.Field name="contacts" label="联系人" validate={validateContacts}>
  <ContactsInput />
</Form.Field>
```

ContactsInput 接收 Contact[]，内部管理添加、删除、排序和稳定 key，通过 onChange(nextContacts) 返回新数组。不能直接把下标当作需要保持身份的行的 React key；UI 身份如何生成、是否进入业务数据由自定义控件定义。

表单默认按整组记录 touched / dirty、执行整组校验并显示一个字段错误。逐行错误展示、内部错误聚焦可由控件自行处理，不承诺表单自动定位某个子项。

以后确实需要通用的逐项校验、子字段订阅、错误定位和排序后的状态迁移，再评估数组字段 Hook，不预设第二期必须实现。

## 功能范围

| 功能 | 计划 |
| --- | --- |
| 顶层字段与值类型推导 | 第一期 |
| 对象、数组作为完整字段值，通过自定义控件管理内部交互 | 第一期 |
| 标签、必填、帮助、错误、无障碍关联 | 第一期 |
| 直接子控件自动绑定、自定义控件协议与聚焦 | 第一期 |
| 渲染函数显式绑定，支持特殊布局与第三方控件 | 第一期 |
| 同步 / 异步校验、过期结果保护 | 第一期 |
| 校验依赖、字段值订阅、条件展示 | 第一期 |
| 提交加载、重复提交保护、失败聚焦 | 第一期 |
| 初始值、异步详情载入、重置、修改状态 | 第一期 |
| 单字段与批量局部更新、变化通知、变化字段旧值 | 第一期 |
| 字段卸载处理、可选值保留 | 第一期 |
| 自绘控件通用外观容器 | 已实现 FieldControl |
| 数组作为一个字段；增删、排序、稳定 key 由自定义控件管理 | 第一期 |
| 通用数组字段 Hook、逐项状态迁移与错误定位 | 暂缓，按实际需求评估 |
| 独立引入、npm 与 CLI 源码分发、文档演示 | 实现时同步接入项目现有流程 |
| 跨表单 Provider、schema 页面生成、复杂布局配置 | 暂不计划 |
| 完整 antd Form API 兼容 | 不作为目标 |
| 点路径解析、深层字段绑定、数组下标路径与深层 patch 合并 | 第一期不提供 |

## 完整最小示例

以下示例对应当前独立 Form API。

```tsx
function ProfileForm() {
  const form = useForm({
    defaultValues: { username: '', enabled: true },
  });
  const { submitting } = useFormState(form);

  return (
    <Form form={form} onSubmit={saveProfile}>
      <Stack>
        <Form.Field name="username" label="用户名" required>
          <Input />
        </Form.Field>
        <Form.Field name="enabled" label="启用">
          <Switch />
        </Form.Field>
        <Inline>
          <Button htmlType="submit" loading={submitting}>保存</Button>
          <Button onClick={() => form.reset()}>重置</Button>
        </Inline>
      </Stack>
    </Form>
  );
}
```

## 已确定的实现规则

1. 顶层字符串 key，类型按 keyof T 推导；对象与数组整体管理。上下文 Field 无法从父 JSX 推导泛型，显式 form 属性可获得类型检查。
2. validate 返回 valid / invalid / cancelled；异常单独报告。值变化、重置或卸载使过期校验取消；校验阶段取消提交，业务提交使用固定快照。
3. required 支持自定义文字；空白和空数组为空，0/false 非空。默认 blur，已有错误后 change；submit 模式只主动校验。依赖校验只对已操作或已校验字段执行。
4. preserve 暂存值不校验、不提交、不出现在 getValues；挂载恢复，reset 清理旧暂存状态并恢复基准。
5. useFormState 订阅 submitting / dirty，不提供 form.submitting 或整份值订阅。
6. FieldControl 只负责外观。控件 ref 提供 focus；组合控件可回退聚焦内部元素。任一层 disabled 都优先，字段值、关联 ID 和状态由 Field 管理。
7. 自研范围明确的订阅与校验核心，无新增运行时依赖；不包含通用数组字段引擎。
8. patchValues 顶层更新，对象数组替换，undefined 表示空值。通知按 Object.is 判断；旧值与 getValues 快照复制普通数据。卸载删除不触发 onValuesChange。
9. 控件通过 defineFieldBinding 声明能力；默认 value/onChange(value)。更新表单后调用控件原回调，保留原参数；onBlur 与 ref 同样组合，不维护组件身份名单。

## 验证与后续范围

实现验证覆盖通知、校验、异步取消、提交、条件字段、StrictMode、类型、npm 与 CLI 分发，以及文档站交互。12 个案例包含普通录入、动态字段、密码依赖、异步校验、批量更新、对象与数组自定义控件等。

2026-10-11 验证结果：

| 检查 | 结果 |
| --- | --- |
| `pnpm typecheck`、`pnpm build` | 通过 |
| `pnpm test` | 180 项 Vitest 检查、8 项 CLI 测试通过；其中 39 项表单专项包含类型示例 |
| `PLAYWRIGHT_CHANNEL=chrome pnpm test:browser` | 60 项浏览器测试通过，其中 8 项验证表单案例、手机布局及规划页筛选统计 |
| `PLAYWRIGHT_CHANNEL=chrome npm_config_offline=true pnpm check:cli` | 打包 CLI 安装的 TSX 源码和 npm 包均通过类型、生产构建与浏览器交互检查 |
| `npm_config_offline=true pnpm check:package` | React 18.3.1 / 19.3.0 的打包入口、SSR、独立 CSS 和类型声明通过 |
| `pnpm check:size` | Button 原有体积预算通过；Form 单独测得 JS gzip 5493 bytes（React 外置）、CSS gzip 372 bytes |
| 规划页 | 已有实现共 40 项，独立组件 4 项；独立 Form 已完成，antd Form 仍待实现 |

桌面与手机案例截图：`.artifacts/form-desktop.png`、`.artifacts/form-mobile.png`，已检查。案例中的注册检查、保存请求与失败反馈均为明确标注的本地模拟。

暂缓通用数组字段 Hook、深层路径、跨表单 Provider 和 schema 自动生成。独立 Form 在规划页单独记录，不将 antd Form 标为已完成。
