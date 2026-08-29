import { describe, expect, it } from 'vitest';

import {
	composeMiniappModules,
	defineMiniappModule,
	diagnoseCapabilityConfig
} from '../src/module/index.ts';
import { wechatCapabilities } from '../src/platform/index.ts';

describe('static Miniapp modules', () => {
	const inventory = defineMiniappModule({
		capabilities: {
			optional: [wechatCapabilities.media.scan],
			required: [wechatCapabilities.identity.login]
		},
		id: '@example/inventory',
		routes: ['./pages/inventory/index.svelte']
	});

	it('preserves route and capability literals while composing deterministically', () => {
		expect(inventory.routes[0]).toBe('./pages/inventory/index.svelte');
		const composed = composeMiniappModules([inventory]);
		expect(composed.routes).toEqual(['./pages/inventory/index.svelte']);
		expect(composed.capabilities.map(({ id }) => id)).toEqual([
			'wechat.identity.login',
			'wechat.media.scan'
		]);
		expect(() => composeMiniappModules([inventory, inventory])).toThrow(
			/Duplicate Miniapp module id/u
		);
	});

	it('rejects malformed modules and diagnoses required app configuration', () => {
		expect(() =>
			defineMiniappModule({
				capabilities: { required: [] },
				id: 'bad module',
				routes: ['./page.ts']
			})
		).toThrow(/Invalid Miniapp module id/u);
		const diagnostics = diagnoseCapabilityConfig({}, [wechatCapabilities.location.background]);
		expect(diagnostics.map(({ field }) => field).sort()).toEqual([
			'permission',
			'requiredBackgroundModes',
			'requiredPrivateInfos'
		]);
		expect(
			diagnoseCapabilityConfig(
				{
					permission: { 'scope.userLocationBackground': { desc: '用于用户主动开启的轨迹记录' } },
					requiredBackgroundModes: ['location'],
					requiredPrivateInfos: ['startLocationUpdateBackground']
				},
				[wechatCapabilities.location.background]
			)
		).toEqual([]);
	});
});
