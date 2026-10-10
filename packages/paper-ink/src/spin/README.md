# Spin

Supports spinning/delay (milliseconds), small/medium/large (default legacy alias), indicator, description/tip legacy alias, percent number/auto, fullscreen portal, wrapperClassName legacy alias, native div props/ref, and setDefaultIndicator. Defaults to spinning=true. Children remain mounted; visible loading blocks pointer events and makes content inert, restoring it when loading ends. Fullscreen carries the active theme into its portal and returns null on the server.

No semantic styles/classNames. Numeric progress is shown as accessible progressbar with percentage text; auto uses the indeterminate indicator. Fullscreen does not trap focus or lock scrolling. Modern browser inert support is required to block keyboard interaction with nested content.
