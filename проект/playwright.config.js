const baseURL = `http://127.0.0.1:${process.env.PORT || 5173}`;

export default {
  testDir: './tests/browser',
  timeout: 30000,
  fullyParallel: false,
  use: { baseURL, channel: process.env.ATLAS_BROWSER_CHANNEL, browserName: 'chromium', headless: true },
  webServer: { command: 'npm run dev', url: baseURL, reuseExistingServer: true, timeout: 15000 },
  reporter: 'list'
};
