import { defineConfig } from '@playwright/test';
// Remote website fonts must not gate screenshots of local component behavior.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
// Keep local health checks out of inherited HTTP proxies.
for (const key of ['NO_PROXY', 'no_proxy']) process.env[key] = [process.env[key], '127.0.0.1', 'localhost'].filter(Boolean).join(',');
export default defineConfig({ testDir: './tests/browser', use: { channel: process.env.PLAYWRIGHT_CHANNEL, baseURL: 'http://127.0.0.1:4187', viewport: { width: 1440, height: 1000 } }, webServer: { env: { NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost' }, command: 'pnpm --filter @paper-ink/website preview --strictPort --port 4187', url: 'http://127.0.0.1:4187', reuseExistingServer: !process.env.CI }, reporter: 'list' });
