import { describe, expect, it, vi } from 'vitest';

import { createWeChatPlatform } from '../src/platform/index.ts';
import { ResourceScope } from '../src/runtime/index.ts';
import { FakePlatformDriver } from '../src/testing/index.ts';

function resourceFixture() {
	const scope = new ResourceScope();
	const driver = new FakePlatformDriver({ realDevice: true });
	return { driver, platform: createWeChatPlatform({ driver, scope }), scope };
}

describe('managed platform resources', () => {
	it('returns listener counts to baseline across 100 scope lifecycles', async () => {
		const driver = new FakePlatformDriver();
		for (let index = 0; index < 100; index += 1) {
			const scope = new ResourceScope();
			const platform = createWeChatPlatform({ driver, scope });
			const listener = vi.fn();
			platform.system.network.observe(listener);
			driver.emit('onNetworkStatusChange', { isConnected: true, networkType: 'wifi' });
			expect(listener).toHaveBeenCalledOnce();
			await scope.dispose();
		}
		expect(driver.listenerCount()).toBe(0);
	});

	it('pairs Bluetooth adapter, discovery, and connection cleanup idempotently', async () => {
		const { driver, platform, scope } = resourceFixture();
		const session = await platform.hardware.bluetooth();
		const discovery = await session.discover({ allowDuplicatesKey: false });
		const connection = await session.connect('device-1', 5000);
		await connection.close();
		await connection.close();
		await discovery.close();
		await scope.dispose();
		expect(driver.calls.filter((call) => call === 'openBluetoothAdapter')).toHaveLength(1);
		expect(driver.calls.filter((call) => call === 'closeBLEConnection')).toHaveLength(1);
		expect(driver.calls).toContain('closeBluetoothAdapter');
		expect(session.closed).toBe(true);
	});

	it('scopes location, sensors, Wi-Fi, and NFC sessions', async () => {
		const { driver, platform, scope } = resourceFixture();
		const discovered = vi.fn();
		const adapter = {
			startDiscovery({ success }: { success(): void }) {
				success();
			},
			stopDiscovery({ success }: { success(): void }) {
				success();
			}
		};
		driver.setHandler('getNFCAdapter', () => adapter);
		await platform.hardware.nfc();
		await platform.hardware.wifi();
		await platform.hardware.sensor('accelerometer', discovered);
		await platform.location.observe(discovered);
		driver.emit('onAccelerometerChange', { x: 1, y: 2, z: 3 });
		driver.emit('onLocationChange', { latitude: 0, longitude: 0 });
		expect(discovered).toHaveBeenCalledTimes(2);
		await scope.dispose();
		expect(driver.listenerCount()).toBe(0);
		expect(driver.calls).toEqual(
			expect.arrayContaining([
				'startWifi',
				'stopWifi',
				'startAccelerometer',
				'stopAccelerometer',
				'startLocationUpdate',
				'stopLocationUpdate'
			])
		);
	});

	it('closes WebSocket, TCP, UDP, mDNS, worker, and camera handles', async () => {
		const { driver, platform, scope } = resourceFixture();
		const websocket = { close: vi.fn() };
		const tcp = { close: vi.fn() };
		const udp = { close: vi.fn() };
		const worker = { terminate: vi.fn() };
		const camera = { takePhoto: vi.fn() };
		driver
			.setHandler('connectSocket', () => websocket)
			.setHandler('createTCPSocket', () => tcp)
			.setHandler('createUDPSocket', () => udp)
			.setHandler('createWorker', () => worker)
			.setHandler('createCameraContext', () => camera);

		await platform.network.websocket({ url: 'wss://example.invalid/socket' });
		platform.network.tcp();
		platform.network.udp();
		await platform.network.mdns('_fixture._tcp.');
		platform.compute.worker('workers/fixture.js');
		platform.media.camera('camera');
		await scope.dispose();
		expect(websocket.close).toHaveBeenCalledOnce();
		expect(tcp.close).toHaveBeenCalledOnce();
		expect(udp.close).toHaveBeenCalledOnce();
		expect(worker.terminate).toHaveBeenCalledOnce();
		expect(driver.calls).toContain('stopLocalServiceDiscovery');
	});
});
