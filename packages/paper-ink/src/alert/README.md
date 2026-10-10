# Alert

Supports title/message legacy alias, description, success/info/warning/error, showIcon/icon, banner, action, variant outlined/filled, closable boolean or configuration (closeIcon/disabled/onClose/afterClose/aria-*), legacy closeIcon/closeText/onClose/afterClose, native div props/ref. ErrorBoundary supports children/title/message/description. Banner defaults to warning with an icon.

Closing removes content immediately without animation; afterClose runs once after removal. Preventing the close event keeps the notice visible. No semantic style objects/functions or global ConfigProvider icon settings. ErrorBoundary shows the error message by default, without rendering stack traces.
