import { defineConfig } from 'vitest/config';
import { diagnosticPlaywright } from './scripts/browser-runner-diagnostics.js';
import baseConfig, { browserProject } from './vite.config.js';
import { isolateTouchBrowserHistory, touchSequence } from './tests/transfer-touch-commands.js';

// Protocol touch simulation is Chromium-only, not physical-device or cross-engine evidence.
// Keep it out of the common three-browser spec set and its component-execution report.
export default defineConfig({
	...baseConfig,
	test: {
		...baseConfig.test,
		coverage: { enabled: false },
		fileParallelism: false,
		includeTaskLocation: false,
		maxWorkers: 1,
		outputFile: { json: 'test-results/transfer-touch-chromium.json' },
		reporters: ['default', 'json'],
		projects: [
			{
				...browserProject,
				test: {
					...browserProject.test,
					browser: {
						...browserProject.test.browser,
						commands: {
							...browserProject.test.browser.commands,
							isolateTouchBrowserHistory,
							touchSequence
						},
						instances: [
							{
								browser: 'chromium',
								provider: diagnosticPlaywright({ launchOptions: { channel: 'chromium' } })
							}
						]
					},
					include: ['tests/transfer-touch.cdp.ts'],
					name: 'chromium-touch-simulation'
				}
			}
		]
	}
});
