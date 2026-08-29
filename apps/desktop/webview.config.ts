import { defineWebviewConfig } from '@zadmin/webview/build';

export default defineWebviewConfig({
	host: {
		allowedExternalOrigins: ['https://github.com', 'https://learn.microsoft.com']
	},
	output: 'dist/desktop',
	web: {
		assets: 'build',
		command: 'pnpm build:web',
		devCommand: 'vite dev --host 0.0.0.0 --port 5176 --strictPort',
		devUrl: 'http://127.0.0.1:5176'
	},
	targets: {
		'windows-x64': {
			package: 'portable',
			productName: 'ZAdmin',
			runtime: 'evergreen'
		}
	}
});
