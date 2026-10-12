const rows = [
 ['value / defaultValue','ColorValue（string / Color / HSB / RGB / null）','#171717','受控值 / 初始值；null、空串表示清空'],
 ['onChange','(color: Color, css: string) => void','—','拖动、键盘、预设、输入提交及清空；css 是浏览器可用值'],
 ['onChangeComplete','(color: Color) => void','—','指针松开、单次键盘操作、输入确认、预设或清空后触发；取消拖动不触发'],
 ['format / defaultFormat',"'hex' | 'rgb' | 'hsb'",'hex','受控 / 初始展示格式，不修改颜色本身'],
 ['onFormatChange',"(format: ColorFormat) => void",'—','请求切换格式'],
 ['disabledFormat / disabledAlpha','boolean','false','禁用格式切换 / 隐藏透明度并规范化为不透明'],
 ['open / defaultOpen / onOpenChange','boolean / boolean / (open) => void','false','受控 / 非受控展开，关闭不会回滚已生效的颜色'],
 ['presets','ColorPreset[]','[]','分组预设，label 与 colors；忽略非法预设值'],
 ['allowClear / onClear','boolean / () => void','false / —','清空后 Color.cleared=true、css为空串'],
 ['showText','boolean | (color: Color) => ReactNode','false','显示当前格式的文本，或自定义触发器文字'],
 ['children','ReactElement','—','自定义触发元素，需要透传原生事件与 aria 属性'],
 ['disabled / size / status',"boolean / 'small' | 'middle' | 'large' / 'error' | 'warning'",'false / middle / —','触发器状态与大小'],
 ['placement / getPopupContainer','PopoverPlacement / (triggerNode) => HTMLElement','bottomLeft / body','沿用 Popover 定位与挂载；Modal 内自动寻找容器'],
 ['destroyOnHidden','boolean','false','退出后销毁弹层 DOM'],
 ['className / style / ref','string / CSSProperties / HTMLButtonElement','—','触发器原生属性与样式；ref 仅指向默认按钮，自定义触发器使用自己的 ref'],
];
const methods = [
 ['new Color(value, previous?)','ColorValue / Color','创建不可变颜色；previous 在解析黑白灰时保留色相'],
 ['toHsb()','{h,s,b,a}','h=0–360；s、b、a=0–1，保留内部精度'],
 ['toRgb()','{r,g,b,a}','RGB 通道取整为 0–255，alpha=0–1'],
 ['toHex() / toHexString() / toHex8String()','string','不带 # 的 HEX、六位 HEX、含透明度的八位 HEX'],
 ['toRgbString() / toHsbString()','string','展示字符串，HSB 百分比与 alpha 最多三位小数'],
 ['toCssString()','string','不透明时为 HEX，透明时为 RGBA，清空时为空串'],
 ['cleared / isValid','boolean','清空与非法输入是不同状态；非法受控输入保持上次合法颜色'],
];
export function ColorPickerApiTable(){return <div className="table-scroll"><table><thead><tr>{['属性','类型','默认值','说明'].map(text=><th key={text}>{text}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map((text,index)=><td key={index}>{index<3?<code>{text}</code>:text}</td>)}</tr>)}</tbody></table></div>;}
export function ColorMethodsTable(){return <div className="table-scroll"><table><thead><tr><th>颜色对象</th><th>返回 / 参数</th><th>说明</th></tr></thead><tbody>{methods.map(row=><tr key={row[0]}>{row.map((text,index)=><td key={index}>{index<2?<code>{text}</code>:text}</td>)}</tr>)}</tbody></table></div>;}
