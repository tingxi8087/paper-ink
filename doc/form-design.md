# 新表单设计草案

状态：规划中，尚未实现。记录当前讨论的 API 和功能，作为后续实现依据；类型签名仍可调整。

Form 属于独立设计，不承诺 antd Form API 兼容，也不代表优先级清单里的 antd Form 已完成。其他输入组件继续沿用已有 API。

## 设计原则

- 字段值由表单统一管理，控件保持独立，不要求自定义控件调用表单 Hook。
- 常规写法自动绑定唯一的直接控件子元素；特殊布局和事件结构使用渲染函数显式绑定。两种写法共用同一个字段引擎。
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
| `FieldControl` | 自绘控件的通用外观容器 | 计划提供，具体接口待定 |
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
| `patchValues(values)` | 局部更新多个字段，保留未指定字段；一次操作只通知一次 |
| `reset()` | 恢复当前基准，清除错误、触碰与修改状态 |
| `reset(values)` | 将 values 同时设为当前值和新基准，适用于异步编辑数据 |
| `validate()` | 校验所有当前注册字段 |
| `validate(names)` | 校验指定字段，不触发业务提交 |

`reset` 不通过重新挂载控件实现。字段路径需要支持嵌套对象，提供值类型推导；路径具体语法、快照复制边界和 validate 返回类型在实现前确认。

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
| `changedValues` | 本次实际变化字段的新值，按字段路径组织成局部数据结构 |
| `values` | 本次更新后的完整表单数据快照 |
| `info.source` | `'user'` 或 `'programmatic'`，区分控件输入与程序修改 |
| `info.names` | 本次实际变化的字段路径，始终是数组 |
| `info.previousValues` | 仅变化字段的旧值，结构与 changedValues 对应；不是整份旧表单数据 |

单字段和多字段共用同一种参数结构，不再提供独立的 name / previousValue 属性。旧值表示本次操作之前的值，不是 defaultValues；程序修改同样提供旧值。

以下是参数结构示意，FieldPath 和局部数据类型的最终签名待实现时确定：

```tsx
type ValuesChangeInfo<T> = {
  source: 'user' | 'programmatic';
  names: FieldPath<T>[];
  previousValues: PartialValues<T>;
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

patchValues 是局部更新，不替换整份数据、不改变重置基准，也不清除全部字段状态；变更字段使用与 setValue 相同的 dirty 和校验触发规则。依赖校验读取完整更新后的数据。

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

patchValues 中所有字段都未变化时不通知。相同值的比较策略、嵌套对象与数组的局部更新语义仍待明确。

在回调中再次 setValue / patchValues 会形成下一次更新与通知；使用来源判断或值比较避免循环，不默默屏蔽程序更新。

## Form.Field

| 属性 | 计划用途 |
| --- | --- |
| `name` | 字段路径，关联值、校验和状态 |
| `label` | 字段标题，通过关联 ID 连接控件 |
| `required` | 必填校验和必填标记共用一个声明 |
| `validate` | 同步或异步校验函数 |
| `dependencies` | 其他字段变化时，重新校验本字段；不负责联动渲染 |
| `help` | 辅助说明；错误出现时的展示关系保持统一 |
| `disabled` | 字段禁用；整体表单禁用优先，不允许字段绕过 |
| `preserve` | 默认 false；卸载移除值与错误，显式开启则保留值 |
| `children` | 唯一的直接控件子元素，或获得 control 和字段状态的渲染函数 |
| `className / style` | 字段容器外观 |

required 的自定义提示、help 与错误的具体排版、preserve 字段的提交边界仍待确认。基本原则：已卸载字段不继续校验，不留下过期错误。

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
- 库内控件使用内置适配：Input 等提取事件中的值，Checkbox、Switch 等处理 checked 与事件差异；保留现有控件 API。
- 自动传入值、变化回调、onBlur、错误状态、禁用状态、ID、无障碍属性和聚焦注册 ref。
- 字段值由表单管理，不同时由子控件的 value / defaultValue 建立第二个数据来源。
- 自定义控件负责把属性与聚焦能力连接到实际控件；仅声明这些 props 不会自动产生外观或无障碍效果。

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
| `error` | 当前错误文字；具体类型待定 |
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

校验函数统一采用 `(value, context) => string | undefined | Promise<string | undefined>`。context 计划提供当前 values 与取消信号 signal。

- undefined 表示通过，字符串表示字段错误。
- required 先处理空值，其他业务校验使用函数；不再建立丰富的规则对象语言。
- 默认失焦校验、提交时完整校验；出现错误后，输入时重新校验。
- dependencies 用于跨字段校验，例如原密码变化后重新检查确认密码。
- 内部通过版本或取消信号忽略过期异步结果，不要求使用者自行处理竞态。
- 复杂 schema 校验可在 validate 中适配，不强制引入某个校验库。

空值判定、校验触发配置、首次交互前是否触发依赖校验，以及函数抛异常的处理方式待实现前确认。

## 状态订阅 Hook

| Hook | 返回内容 / 职责 |
| --- | --- |
| `useWatch(form, name)` | 指定字段值；主要用于跨字段联动展示 |
| `useFormState(form)` | submitting、dirty 等元状态；用于按钮、未保存提醒等 |
| `useFieldState()` | 最近一个 Field 的 error、status、validating、touched、dirty、disabled、required 等状态 |

useFieldState 是可选高级入口，不负责读取或修改其他字段，也不能提交表单。Field 外调用返回中性状态还是报错，以及表单元状态是否支持选择器，待确认。

先前示例中的 `form.submitting` 是便捷读取设想，是否保留待确认；当前推荐通过 useFormState 获取响应式提交状态，避免出现两个含义不同的提交状态来源。

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
  required?: boolean;
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

FieldControl 计划用于完全自绘的控件，提供通用边框、错误和禁用外观，不管理值和校验。组合控件可以把错误外观放在整体容器上；错误文字默认只显示一次。

## 数组作为单个自定义字段

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
| 普通字段、嵌套对象、类型推导 | 第一期 |
| 标签、必填、帮助、错误、无障碍关联 | 第一期 |
| 直接子控件自动绑定、自定义控件协议与聚焦 | 第一期 |
| 渲染函数显式绑定，支持特殊布局与第三方控件 | 第一期 |
| 同步 / 异步校验、过期结果保护 | 第一期 |
| 校验依赖、字段值订阅、条件展示 | 第一期 |
| 提交加载、重复提交保护、失败聚焦 | 第一期 |
| 初始值、异步详情载入、重置、修改状态 | 第一期 |
| 单字段与批量局部更新、变化通知、变化字段旧值 | 第一期 |
| 字段卸载处理、可选值保留 | 第一期 |
| 自绘控件通用外观容器 | 第一期候选，接口待定 |
| 数组作为一个字段；增删、排序、稳定 key 由自定义控件管理 | 第一期 |
| 通用数组字段 Hook、逐项状态迁移与错误定位 | 暂缓，按实际需求评估 |
| 独立引入、npm 与 CLI 源码分发、文档演示 | 实现时同步接入项目现有流程 |
| 跨表单 Provider、schema 页面生成、复杂布局配置 | 暂不计划 |
| 完整 antd Form API 兼容 | 不作为目标 |

## 完整最小示例

以下是计划 API 示例，当前不能作为已发布功能使用。

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

## 实现前待确认

1. 嵌套字段路径的语法与类型推导；第一期数组按单字段处理，不承诺通用逐项字段管理。
2. validate 返回类型、异步异常处理、提交期间的数据变化策略。
3. required 自定义提示、空值规则、校验触发配置和依赖触发时机。
4. preserve 字段是否进入提交数据，重新挂载如何恢复值。
5. useFormState 订阅粒度、是否保留 form.submitting 便捷入口。
6. FieldControl 的组合控件外观、ref 协议与控件属性优先级。
7. 引擎自行实现还是复用现有库；按 API 匹配、依赖体积、订阅与竞态能力评估。
8. patchValues 对嵌套对象、数组、undefined 的更新语义；相同值比较、旧值快照和字段卸载导致数据移除时的通知规则。
9. 库内控件适配方式；自动绑定与子控件既有 onChange / onBlur / ref 的组合顺序及冲突提示。内部状态与业务回调都应保留，不静默覆盖。

后续实施时单独记录本组件的实现状态，不把设计文档当作完成证据。
