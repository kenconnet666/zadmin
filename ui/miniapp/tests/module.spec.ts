import { describe, expect, it } from 'vitest';

import {
	composeTaroModules,
	defineTaroModule,
	diagnoseCapabilityConfig
} from '../src/module/index.ts';
import { wechatCapabilities } from '../src/platform/index.ts';

describe('static Taro modules', () => {
	const inventory = defineTaroModule({
		capabilities: {
			optional: [wechatCapabilities.media.scan],
			required: [wechatCapabilities.identity.login]
		},
		id: '@example/inventory',
		routes: ['./pages/inventory/index.svelte']
	});

	it('preserves route and capability literals while composing deterministically', () => {
		expect(inventory.routes[0]).toBe('./pages/inventory/index.svelte');
		const composed = composeTaroModules([inventory]);
		expect(composed.routes).toEqual(['./pages/inventory/index.svelte']);
		expect(composed.capabilities.map(({ id }) => id)).toEqual([
			'wechat.identity.login',
			'wechat.media.scan'
		]);
		expect(() => composeTaroModules([inventory, inventory])).toThrow(/Duplicate Taro module id/u);
	});

	it('rejects malformed modules and diagnoses required app configuration', () => {
		expect(() =>
			defineTaroModule({
				capabilities: { required: [] },
				id: 'bad module',
				routes: ['./page.ts']
			})
		).toThrow(/Invalid Taro module id/u);
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
