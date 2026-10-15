# npm 发布

组件包：`paper-ink`。源码 CLI：`@tingxi8087/paper-ink-cli`，可执行命令为 `paper-ink`。两个包的首次公开版本为 `0.1.0`，MIT 许可。

## 发布前

1. 从干净的仓库状态开始，更新两个 package.json 的版本与 CHANGELOG。
2. 执行 `pnpm install --frozen-lockfile`、`pnpm typecheck`、`pnpm test`、`pnpm build`。
3. 执行 `pnpm check:size`、`pnpm check:package`、`PLAYWRIGHT_CHANNEL=chrome pnpm check:cli` 和相关文档浏览器测试。
4. `npm whoami --registry=https://registry.npmjs.org` 确认登录；发布验证在 npm 页面完成，不将密码、验证码或 token 写入仓库。
5. `npm pack` 构建并检查最终制品；两个包的 prepack 会自动构建。发布通过最终 tgz，避免验证后产物变化。

## 发布

```bash
npm pack ./packages/paper-ink --pack-destination .artifacts
npm pack ./packages/cli --pack-destination .artifacts
npm publish .artifacts/paper-ink-0.2.0.tgz --access public --registry=https://registry.npmjs.org
npm publish .artifacts/tingxi8087-paper-ink-cli-0.2.0.tgz --access public --registry=https://registry.npmjs.org
```

升级时替换版本号。只发布到 npm 官方 registry；已经发布的同名版本不可覆盖。两个包独立发布，失败时检查各自 registry 状态，再只重试未成功的包。

## 同步镜像与验收

```bash
cnpm sync paper-ink
cnpm sync @tingxi8087/paper-ink-cli
npm view paper-ink@0.2.0 version dist.integrity --registry=https://registry.npmmirror.com
npm view @tingxi8087/paper-ink-cli@0.2.0 version dist.integrity --registry=https://registry.npmmirror.com
```

npmmirror 是只读镜像。触发同步后等待版本可查询，并比对官方 registry 的 dist.integrity；实际安装验证 npm 组件包、CSS 子路径和 CLI 的 list / init / add，再构建消费项目。镜像同步为异步操作，触发成功不等于安装验证成功。

发布完成后同步 README、快速开始与 CLI 文档，推送仓库以部署 Pages。后续自动发布建议使用 npm Trusted Publishing（GitHub Actions OIDC），避免长期发布 token。

0.2.0 新增 Tabler Icons（paper-ink/icons）与 CLI tabler-icons 条目，依赖自动安装。
