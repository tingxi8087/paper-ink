# Input

Input / Input.TextArea / Input.Search / Input.Password share native attributes, size, status, controlled/uncontrolled values, clear, count and input refs. TextArea supports autoSize and TextAreaRef; the other controls expose InputRef.

```tsx
import { Input, Search, Password } from 'paper-ink/input';
import 'paper-ink/input/style.css';
<Input.Search allowClear enterButton="Search" onSearch={(value, event, info) => console.log(value, info?.source)} />
<Input.Password visibilityToggle={{ visible, onVisibleChange: setVisible }} />
```

Search triggers onSearch on Enter, search-button clicks and clear actions, with info.source=input or clear. Normal edits only call onChange. Clear events expose an empty-value ChangeEvent with a native click source; Enter uses KeyboardEvent and buttons use MouseEvent. Loading prevents Enter/button submission, but clear still notifies source=clear. Composition Enter is ignored. preventDefault in onPressEnter or custom button onClick cancels search. Custom enterButton supports this library's Button and native button; other nodes become button content. Input.Search preserves the provided InputRef methods and uses its outer wrapper for nativeElement/className/style.

Password supports visibilityToggle=false, or {visible,onVisibleChange,tabIndex}, and iconRender(visible). Its native input remains mounted on visibility changes; toggling preserves focus/value and does not fire onChange. Disabled blocks toggling; readOnly permits revealing. Icons use shared SVG functions. No hover action is supplied.

Search/Password are also separately exported as Search and Password from the input subpath. Input CSS includes its Button dependency after packaging; source installations include Button automatically through registry dependencies.

Not included: OTP, variant, addonBefore/addonAfter, Form integration, full count config or semantic style objects. See the website [API and examples](../../../../apps/website/src/content/components/input/index.mdx).
