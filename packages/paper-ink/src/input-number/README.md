
# InputNumber 数字输入框

小数步进、范围限制、格式化和高精度字符串。默认黑白，支持原生输入属性、className、style 和 ref。

## 代码演示


## 常用 API

<table><thead><tr><th>属性</th><th>类型 / 默认值</th><th>说明</th></tr></thead><tbody>
<tr><td>value / defaultValue</td><td>number | string | null</td><td>受控 / 初始值</td></tr>
<tr><td>onChange</td><td>(value) =&gt; void</td><td>默认 number，stringMode 为 string；清空为 null</td></tr>
<tr><td>min / max / step</td><td>number | string</td><td>默认安全整数边界，步长 1</td></tr>
<tr><td>precision / stringMode</td><td>number / false</td><td>失焦和步进时对齐精度，高精度输入应传字符串</td></tr>
<tr><td>formatter / parser</td><td>function</td><td>formatter(value, &#123; userTyping, input &#125;)，parser(displayValue)</td></tr>
<tr><td>controls / keyboard</td><td>true / true</td><td>步进按钮可传 upIcon / downIcon；方向键步进</td></tr>
<tr><td>changeOnBlur / changeOnWheel</td><td>true / false</td><td>失焦对齐范围，滚轮需开启且输入框聚焦</td></tr>
<tr><td>size / variant / status</td><td>middle / outlined / —</td><td>尺寸、outlined / filled / borderless / underlined 和语义状态</td></tr>
<tr><td>prefix / suffix</td><td>ReactNode</td><td>前后缀</td></tr>
<tr><td>onStep / onPressEnter</td><td>function</td><td>步进来源及回车事件</td></tr>
</tbody></table>

## 使用边界

运算由 MIT 开源的 mini-decimal 完成。stringMode 全程保留字符串精度；默认 number 模式受 JavaScript Number 精度限制。输入 `-`、`1.` 等中间态会保留，越界输入失焦后收敛；受控值由调用方决定，动态修改边界不会主动触发 onChange。精度与边界无法同时满足时优先保证范围。

支持 ref.focus(options)、blur()、nativeElement、input。暂不支持 spinner 模式、按住连续步进、语义 classNames / styles。

```tsx
```

CLI：`paper-ink add input-number`，自动安装精度计算依赖。
