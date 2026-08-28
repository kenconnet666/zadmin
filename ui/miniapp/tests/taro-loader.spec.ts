import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

type ResolvedPlugin = {
	apply(): unknown;
	id: string;
};

describe('Taro service loader integration', () => {
	it('resolves and requires the CJS framework plugin from the app', () => {
		const { resolvePresetsOrPlugins } = require('@tarojs/service/dist/utils/index.js') as {
			resolvePresetsOrPlugins(
				root: string,
				plugins: Record<string, Record<string, unknown>>,
				type: string
			): ResolvedPlugin[];
		};
		const { PluginType } = require('@tarojs/service/dist/utils/constants.js') as {
			PluginType: { Plugin: string };
		};
		const appPath = resolve(import.meta.dirname, '../../../apps/wechat');
		const plugins = resolvePresetsOrPlugins(appPath, { '@zadmin/miniapp': {} }, PluginType.Plugin);

		expect(plugins).toHaveLength(1);
		expect(plugins[0].id).toMatch(/miniapp[\\/]dist[\\/]plugin[\\/]index\.cjs$/u);
		expect(plugins[0].apply()).toBeTypeOf('function');
	});
});
