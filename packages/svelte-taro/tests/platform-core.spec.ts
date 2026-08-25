import { describe, expect, it, vi } from 'vitest';

import {
	allWechatCapabilities,
	createCapabilityReport,
	createWeChatPlatform,
	PlatformError,
	serializeCapabilityReport,
	wechatCapabilities
} from '../src/platform/index.ts';
import { ResourceScope } from '../src/runtime/index.ts';
import { FakePlatformDriver } from '../src/testing/index.ts';

function fixture() {
	const scope = new ResourceScope();
	const driver = new FakePlatformDriver({
		baseLibraryVersion: '3.17.1',
		client: 'android',
		realDevice: false,
		renderer: 'webview'
	});
	return { driver, platform: createWeChatPlatform({ driver, scope }), scope };
}

describe('WeChat platform core', () => {
	it('ships a deterministic, fully attributed capability catalog and report', () => {
		expect(allWechatCapabilities.length).toBeGreaterThanOrEqual(25);
		expect(new Set(allWechatCapabilities.map(({ id }) => id)).size).toBe(
			allWechatCapabilities.length
		);
		for (const descriptor of allWechatCapabilities) {
			expect(descriptor.id).toMatch(/^wechat\./u);
			expect(descriptor.officialDoc).toMatch(/^https:\/\//u);
			expect(descriptor.taroType).not.toBe('');
			expect(descriptor.checkedAt).toBe('2026-08-25');
		}
		const first = serializeCapabilityReport();
		const second = serializeCapabilityReport(createCapabilityReport());
		expect(first).toBe(second);
		expect(JSON.parse(first)).toHaveLength(allWechatCapabilities.length);
	});

	it('returns explainable conservative availability states', async () => {
		const { driver, platform } = fixture();
		driver.setSupported('scanCode', false);
		await expect(platform.support.check(wechatCapabilities.media.scan)).resolves.toMatchObject({
			status: 'unsupported-platform'
		});
		driver.setSupported('scanCode', true);
		await expect(platform.support.check(wechatCapabilities.media.scan)).resolves.toMatchObject({
			status: 'real-device-required'
		});
		await expect(
			platform.support.check(wechatCapabilities.location.current, { realDevice: true })
		).resolves.toMatchObject({ status: 'privacy-required' });
		await expect(
			platform.support.check(wechatCapabilities.location.current, {
				permission: 'granted',
				privacyConsent: true,
				realDevice: true,
				userGesture: true
			})
		).resolves.toMatchObject({ status: 'available' });
		await expect(
			platform.support.check(wechatCapabilities.commerce.payment, {
				realDevice: true,
				userGesture: true
			})
		).resolves.toMatchObject({ status: 'account-entitlement-required' });
	});

	it('keeps login and phone credentials branded, one-time, and out of error messages', async () => {
		const { driver, platform } = fixture();
		driver.setHandler('login', () => ({ code: 'sensitive-login-code', errMsg: 'login:ok' }));
		const login = await platform.identity.login();
		expect(login.consume()).toBe('sensitive-login-code');
		expect(() => login.consume()).toThrow(/already been consumed/u);
		const phone = platform.identity.phoneCode('sensitive-phone-code');
		expect(phone.consume()).toBe('sensitive-phone-code');

		driver.setHandler('login', () =>
			Promise.reject({ code: 'must-not-leak', errCode: 40029, errMsg: 'login:fail invalid code' })
		);
		const error = await platform.identity.login().catch((reason: unknown) => reason);
		expect(error).toBeInstanceOf(PlatformError);
		expect((error as Error).message).not.toContain('must-not-leak');
		expect(JSON.stringify(error)).not.toContain('must-not-leak');
		expect(error).toMatchObject({ rawCode: 40029 });
	});

	it('preserves payment server authority and normalizes user cancellation', async () => {
		const { driver, platform } = fixture();
		const payment = {
			nonceStr: 'nonce',
			package: 'prepay_id=fixture',
			paySign: 'sensitive-signature',
			signType: 'RSA' as const,
			timeStamp: '1'
		};
		driver.setHandler('requestPayment', () => ({ errMsg: 'requestPayment:ok' }));
		await expect(platform.commerce.requestPayment(payment)).resolves.toEqual({
			clientAccepted: true,
			finalOrderState: 'server-unconfirmed'
		});
		driver.setHandler('requestPayment', () =>
			Promise.reject({ errMsg: 'requestPayment:fail cancel', paySign: payment.paySign })
		);
		const error = await platform.commerce
			.requestPayment(payment)
			.catch((reason: unknown) => reason);
		expect(error).toMatchObject({ kind: 'user-cancelled' });
		expect((error as Error).message).not.toContain(payment.paySign);
	});

	it('uses the same driver for privacy, media, network, and storage helpers', async () => {
		const { driver, platform, scope } = fixture();
		driver
			.setHandler('getPrivacySetting', () => ({
				errMsg: 'getPrivacySetting:ok',
				needAuthorization: false,
				privacyContractName: 'Fixture Privacy'
			}))
			.setHandler('getSetting', () => ({
				authSetting: { 'scope.camera': false },
				errMsg: 'getSetting:ok',
				subscriptionsSetting: {}
			}))
			.setHandler('chooseMedia', () => ({ errMsg: 'chooseMedia:ok', tempFiles: [], type: 'image' }))
			.setHandler('scanCode', () => ({
				charSet: 'UTF-8',
				errMsg: 'scanCode:ok',
				path: '',
				rawData: '',
				result: 'fixture',
				scanType: 'QR_CODE'
			}))
			.setHandler('getNetworkType', () => ({ errMsg: 'getNetworkType:ok', networkType: 'wifi' }))
			.setHandler('setStorage', () => ({ errMsg: 'setStorage:ok' }))
			.setHandler('getStorage', () => ({ data: { ready: true }, errMsg: 'getStorage:ok' }))
			.setHandler('removeStorage', () => ({ errMsg: 'removeStorage:ok' }));

		await expect(platform.privacy.setting()).resolves.toMatchObject({ needAuthorization: false });
		await expect(platform.privacy.permission('scope.camera')).resolves.toBe('denied');
		await expect(platform.media.choose({ count: 1 })).resolves.toMatchObject({ tempFiles: [] });
		await expect(platform.media.scan()).resolves.toMatchObject({ result: 'fixture' });
		await expect(platform.system.network.current()).resolves.toMatchObject({ networkType: 'wifi' });
		await platform.system.storage.set('fixture', { ready: true });
		await expect(platform.system.storage.get('fixture')).resolves.toEqual({ ready: true });
		await platform.system.storage.remove('fixture');
		await scope.dispose();
	});

	it('reads system support settings without opening system configuration', () => {
		const { driver, platform } = fixture();
		driver.setHandler('getSystemSetting', () => ({
			bluetoothEnabled: true,
			deviceOrientation: 'portrait',
			locationEnabled: false,
			wifiEnabled: true
		}));
		expect(platform.support.system()).toEqual({
			bluetoothEnabled: true,
			deviceOrientation: 'portrait',
			locationEnabled: false,
			wifiEnabled: true
		});
		expect(driver.calls).toContain('getSystemSetting');
	});

	it('defers typed page transitions beyond the native event dispatch boundary', async () => {
		vi.useFakeTimers();
		try {
			const { driver, platform } = fixture();
			const eventChannel = { emit: vi.fn(), off: vi.fn(), on: vi.fn(), once: vi.fn() };
			driver.setHandler('navigateTo', () => ({
				errMsg: 'navigateTo:ok',
				eventChannel
			}));

			const navigate = platform.navigation.navigateTo({ url: '/pages/target/index?id=1' });
			const redirect = platform.navigation.redirectTo({ url: '/pages/target/index' });
			const launch = platform.navigation.reLaunch({ url: '/pages/target/index' });
			const tab = platform.navigation.switchTab({ url: '/pages/home/index' });
			const back = platform.navigation.navigateBack({ delta: 1 });
			expect(driver.calls).not.toEqual(
				expect.arrayContaining([
					'navigateTo',
					'redirectTo',
					'reLaunch',
					'switchTab',
					'navigateBack'
				])
			);

			await vi.runAllTimersAsync();
			await expect(navigate).resolves.toMatchObject({ eventChannel });
			await Promise.all([redirect, launch, tab, back]);
			expect(driver.calls).toEqual(
				expect.arrayContaining([
					'navigateTo',
					'redirectTo',
					'reLaunch',
					'switchTab',
					'navigateBack'
				])
			);
		} finally {
			vi.useRealTimers();
		}
	});

	it('keeps consent, SOTER, subscription, location, and file-manager boundaries explicit', async () => {
		const { driver, platform, scope } = fixture();
		const files = { readFile: () => undefined };
		driver
			.setHandler('authorize', () => ({ errMsg: 'authorize:ok' }))
			.setHandler('startSoterAuthentication', () => ({
				authMode: 'fingerPrint',
				errCode: 0,
				errMsg: 'startSoterAuthentication:ok',
				resultJSON: '{}',
				resultJSONSignature: 'fixture-signature'
			}))
			.setHandler('requestSubscribeMessage', () => ({
				errMsg: 'requestSubscribeMessage:ok',
				'template-1': 'accept'
			}))
			.setHandler('getLocation', () => ({
				accuracy: 10,
				errMsg: 'getLocation:ok',
				horizontalAccuracy: 10,
				latitude: 0,
				longitude: 0,
				speed: 0,
				verticalAccuracy: 0
			}))
			.setHandler('getFileSystemManager', () => files);
		await expect(platform.privacy.authorize('scope.camera')).resolves.toBeUndefined();
		await expect(
			platform.identity.soter({
				authContent: 'server-issued-challenge',
				challenge: 'server-issued-challenge',
				requestAuthModes: ['fingerPrint']
			})
		).resolves.toMatchObject({ authMode: 'fingerPrint' });
		await expect(platform.messaging.subscribe(['template-1'])).resolves.toMatchObject({
			'template-1': 'accept'
		});
		await expect(platform.location.current({ type: 'wgs84' })).resolves.toMatchObject({
			latitude: 0,
			longitude: 0
		});
		expect(platform.system.files()).toBe(files);
		await scope.dispose();
	});
});
