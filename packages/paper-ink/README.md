# Paper Ink

Monochrome-first React components with familiar Ant Design-style APIs. MIT licensed; independently implemented.

Local development release, not yet published to npm. Requires React 18+.

```tsx
import { Button } from 'paper-ink';
import 'paper-ink/style.css';

<Button type="primary">Save</Button>
```

For component-level imports:

```tsx
import { Button } from 'paper-ink/button';
import 'paper-ink/button/style.css';
```

Button supports common types, sizes, shapes, color/variant, className/style, semantic classNames/styles, delayed/custom loading icons, links and native element refs.

Input and Input.TextArea (also exported as TextArea) support native attributes, controlled/uncontrolled values, clear, status, count and refs. TextArea supports autoSize. Modal provides controlled dialogs, focus management, portal theme inheritance and custom footers. Ordinary Modal callbacks do not automatically close or start loading; a business ref.open(config) example is available on the website.

Input and Modal also have subpath exports and CSS. Modal CSS includes its Button dependency.

Theme configuration uses `ConfigProvider` with grouped semantic tokens under `theme.token` and component overrides under `theme.components.Button`, `Input` and `Modal`. It intentionally differs from antd. Current themes use explicit overrides, not automatic color derivation.

See the repository website and `doc` directory for the supported API and design decisions.
