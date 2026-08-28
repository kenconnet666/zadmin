import type Taro from '@tarojs/taro';

import type { ResourceScope } from '../runtime/scope.ts';
import { wechatCapabilities } from './catalog.ts';
import { toPlatformError } from './error.ts';
import { ScopedHandle, scopedListener } from './handles.ts';
import type {
	AvailabilityOptions,
	AvailabilityResult,
	CapabilityDescriptor,
	DisposableHandle,
	PlatformDriver,
	TaroMethodName,
	TaroMethodResult
} from './types.ts';

declare const LOGIN_CODE: unique symbol;
declare const PHONE_CODE: unique symbol;
export type LoginCode = string & { readonly [LOGIN_CODE]: true };
export type PhoneNumberCode = string & { readonly [PHONE_CODE]: true };

export class OneTimeCredential<TCredential extends string> {
	#consumed = false;
	#value: TCredential | undefined;

	constructor(value: TCredential) {
		this.#value = value;
	}

	get consumed(): boolean {
		return this.#consumed;
	}

	consume(): TCredential {
		if (this.#consumed || this.#value === undefined) {
			throw new Error('This one-time credential has already been consumed.');
		}
		this.#consumed = true;
		const value = this.#value;
		this.#value = undefined;
		return value;
	}
}

type ListenerValue<TKey extends keyof Taro.TaroStatic> = Taro.TaroStatic[TKey] extends (
	listener: (value: infer TValue) => void
) => unknown
	? TValue
	: unknown;

type PaymentOptions = Omit<Taro.requestPayment.Option, 'complete' | 'fail' | 'success'>;
type PromiseOptions<TOptions> = Omit<TOptions, 'complete' | 'fail' | 'success'>;
type NavigateToResult = Parameters<NonNullable<Taro.navigateTo.Option['success']>>[0];

export interface PaymentClientResult {
	readonly clientAccepted: true;
	readonly finalOrderState: 'server-unconfirmed';
}

export interface BluetoothSession extends DisposableHandle {
	connect(deviceId: string, timeout?: number): Promise<DisposableHandle>;
	discover(
		options?: Omit<Taro.startBluetoothDevicesDiscovery.Option, 'complete' | 'fail' | 'success'>
	): Promise<DisposableHandle>;
}

export type SensorKind = 'accelerometer' | 'compass' | 'deviceMotion' | 'gyroscope';

function compareVersions(left: string, right: string): number {
	const leftParts = left.split('.').map(Number);
	const rightParts = right.split('.').map(Number);
	for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
		const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
		if (difference !== 0) return difference;
	}
	return 0;
}

async function safeCall<TResult>(
	descriptor: CapabilityDescriptor,
	operation: string,
	action: () => Promise<TResult>
): Promise<TResult> {
	try {
		return await action();
	} catch (error) {
		throw toPlatformError(descriptor.id, operation, error);
	}
}

function callAs<TResult>(driver: PlatformDriver, method: TaroMethodName, ...args: unknown[]) {
	return driver.call(method, ...(args as never)) as Promise<TResult>;
}

function ignoreFailure(action: () => Promise<unknown>): Promise<void> {
	return action().then(
		() => undefined,
		() => undefined
	);
}

function afterNativeEvent<TResult>(action: () => Promise<TResult>): Promise<TResult> {
	return new Promise<TResult>((resolve, reject) => {
		// WeChat can attach the destination Page synchronously while Taro is still dispatching
		// a native event. A new task gives Svelte a clean component-context boundary.
		setTimeout(() => {
			try {
				void action().then(resolve, reject);
			} catch (error) {
				reject(error);
			}
		}, 0);
	});
}

function promisifyObject<TResult>(
	target: object,
	method: string,
	options: Record<string, unknown> = {}
): Promise<TResult> {
	const candidate = (target as Record<string, unknown>)[method];
	if (typeof candidate !== 'function') throw new TypeError(`${method} is unavailable.`);
	return new Promise<TResult>((resolve, reject) => {
		(candidate as (options: Record<string, unknown>) => unknown).call(target, {
			...options,
			fail: reject,
			success: resolve
		});
	});
}

class BluetoothSessionHandle extends ScopedHandle implements BluetoothSession {
	readonly #driver: PlatformDriver;
	readonly #scope: ResourceScope;

	constructor(scope: ResourceScope, driver: PlatformDriver) {
		super(scope, undefined, async () => {
			await ignoreFailure(() => callAs(driver, 'stopBluetoothDevicesDiscovery'));
			await ignoreFailure(() => callAs(driver, 'closeBluetoothAdapter'));
		});
		this.#driver = driver;
		this.#scope = scope;
	}

	async discover(
		options: Omit<Taro.startBluetoothDevicesDiscovery.Option, 'complete' | 'fail' | 'success'> = {}
	): Promise<DisposableHandle> {
		await safeCall(wechatCapabilities.hardware.bluetooth, 'discover', () =>
			callAs(this.#driver, 'startBluetoothDevicesDiscovery', options)
		);
		return new ScopedHandle(this.#scope, undefined, () =>
			callAs(this.#driver, 'stopBluetoothDevicesDiscovery')
		);
	}

	async connect(deviceId: string, timeout?: number): Promise<DisposableHandle> {
		if (deviceId.length === 0) throw new TypeError('BLE deviceId cannot be empty.');
		await safeCall(wechatCapabilities.hardware.bleConnection, 'connect', () =>
			callAs(this.#driver, 'createBLEConnection', { deviceId, timeout })
		);
		return new ScopedHandle(this.#scope, undefined, () =>
			callAs(this.#driver, 'closeBLEConnection', { deviceId })
		);
	}
}

export interface WeChatPlatform {
	readonly commerce: {
		requestPayment(options: PaymentOptions): Promise<PaymentClientResult>;
	};
	readonly compute: {
		worker(path: string): DisposableHandle<Taro.Worker>;
	};
	readonly hardware: {
		bluetooth(): Promise<BluetoothSession>;
		nfc(): Promise<DisposableHandle<Taro.NFCAdapter>>;
		sensor<TValue = unknown>(
			kind: SensorKind,
			listener: (value: TValue) => void
		): Promise<DisposableHandle>;
		wifi(): Promise<DisposableHandle>;
	};
	readonly identity: {
		checkSession(): Promise<boolean>;
		login(): Promise<OneTimeCredential<LoginCode>>;
		phoneCode(value: string): OneTimeCredential<PhoneNumberCode>;
		soter(
			options: Taro.startSoterAuthentication.Option
		): Promise<Taro.startSoterAuthentication.SuccessCallbackResult>;
	};
	readonly location: {
		current(
			options?: Omit<Taro.getLocation.Option, 'complete' | 'fail' | 'success'>
		): Promise<Taro.getLocation.SuccessCallbackResult>;
		observe(
			listener: (value: ListenerValue<'onLocationChange'>) => void,
			background?: boolean
		): Promise<DisposableHandle>;
	};
	readonly media: {
		camera(id?: string): DisposableHandle<Taro.CameraContext>;
		choose(options: Taro.chooseMedia.Option): Promise<Taro.chooseMedia.SuccessCallbackResult>;
		scan(options?: Taro.scanCode.Option): Promise<Taro.scanCode.SuccessCallbackResult>;
	};
	readonly messaging: {
		subscribe(
			templateIds: readonly string[]
		): Promise<
			| Taro.requestSubscribeMessage.SuccessCallbackResult
			| Taro.requestSubscribeMessage.FailCallbackResult
		>;
	};
	readonly navigation: {
		navigateBack(
			options?: PromiseOptions<Taro.navigateBack.Option>
		): Promise<TaroMethodResult<'navigateBack'>>;
		navigateTo(options: PromiseOptions<Taro.navigateTo.Option>): Promise<NavigateToResult>;
		reLaunch(options: PromiseOptions<Taro.reLaunch.Option>): Promise<TaroMethodResult<'reLaunch'>>;
		redirectTo(
			options: PromiseOptions<Taro.redirectTo.Option>
		): Promise<TaroMethodResult<'redirectTo'>>;
		switchTab(
			options: PromiseOptions<Taro.switchTab.Option>
		): Promise<TaroMethodResult<'switchTab'>>;
	};
	readonly network: {
		mdns(serviceType: string): Promise<DisposableHandle>;
		tcp(): DisposableHandle<Taro.TCPSocket>;
		udp(): DisposableHandle<Taro.UDPSocket>;
		websocket(options: Taro.connectSocket.Option): Promise<DisposableHandle<Taro.SocketTask>>;
	};
	readonly privacy: {
		authorize(scope: string): Promise<void>;
		permission(scope: string): Promise<'denied' | 'granted' | 'prompt'>;
		setting(): Promise<Taro.getPrivacySetting.SuccessCallbackResult>;
	};
	readonly raw: Taro.TaroStatic;
	readonly support: {
		check(
			descriptor: CapabilityDescriptor,
			options?: AvailabilityOptions
		): Promise<AvailabilityResult>;
		system(): Taro.getSystemSetting.Result;
	};
	readonly system: {
		files(): Taro.FileSystemManager;
		network: {
			current(): Promise<Taro.getNetworkType.SuccessCallbackResult>;
			observe(listener: (value: ListenerValue<'onNetworkStatusChange'>) => void): DisposableHandle;
		};
		storage: {
			get<TValue>(key: string): Promise<TValue>;
			remove(key: string): Promise<void>;
			set<TValue>(key: string, value: TValue): Promise<void>;
		};
	};
	forScope(scope: ResourceScope): WeChatPlatform;
}

export function createWeChatPlatform(options: {
	driver: PlatformDriver;
	scope: ResourceScope;
}): WeChatPlatform {
	const { driver, scope } = options;
	const platform: WeChatPlatform = {
		commerce: {
			async requestPayment(paymentOptions) {
				await safeCall(wechatCapabilities.commerce.payment, 'request', () =>
					callAs(driver, 'requestPayment', paymentOptions)
				);
				return { clientAccepted: true, finalOrderState: 'server-unconfirmed' };
			}
		},
		compute: {
			worker(path) {
				if (path.length === 0) throw new TypeError('Worker path cannot be empty.');
				const worker = driver.create('createWorker', path);
				return new ScopedHandle(scope, worker, () => worker.terminate());
			}
		},
		hardware: {
			async bluetooth() {
				await safeCall(wechatCapabilities.hardware.bluetooth, 'open', () =>
					callAs(driver, 'openBluetoothAdapter')
				);
				return new BluetoothSessionHandle(scope, driver);
			},
			async nfc() {
				const adapter = driver.create('getNFCAdapter');
				await safeCall(wechatCapabilities.hardware.nfc, 'start', () =>
					promisifyObject(adapter, 'startDiscovery')
				);
				return new ScopedHandle(scope, adapter, () =>
					promisifyObject(adapter, 'stopDiscovery').catch(() => undefined)
				);
			},
			async sensor<TValue>(kind: SensorKind, listener: (value: TValue) => void) {
				const methods = {
					accelerometer: [
						'startAccelerometer',
						'stopAccelerometer',
						'onAccelerometerChange',
						'offAccelerometerChange'
					],
					compass: ['startCompass', 'stopCompass', 'onCompassChange', 'offCompassChange'],
					deviceMotion: [
						'startDeviceMotionListening',
						'stopDeviceMotionListening',
						'onDeviceMotionChange',
						'offDeviceMotionChange'
					],
					gyroscope: ['startGyroscope', 'stopGyroscope', 'onGyroscopeChange', 'offGyroscopeChange']
				} as const;
				const [start, stop, on, off] = methods[kind];
				await safeCall(wechatCapabilities.hardware.sensors, `start-${kind}`, () =>
					callAs(driver, start)
				);
				const listenerHandle = scopedListener(
					scope,
					(callback) => driver.listen(on, off, callback),
					listener
				);
				scope.add(() => ignoreFailure(() => callAs(driver, stop)));
				return listenerHandle;
			},
			async wifi() {
				await safeCall(wechatCapabilities.hardware.wifi, 'start', () =>
					callAs(driver, 'startWifi')
				);
				return new ScopedHandle(scope, undefined, () => callAs(driver, 'stopWifi'));
			}
		},
		identity: {
			async checkSession() {
				try {
					await driver.call('checkSession');
					return true;
				} catch {
					return false;
				}
			},
			async login() {
				const result = await safeCall(wechatCapabilities.identity.login, 'request', () =>
					driver.call('login')
				);
				if (typeof result.code !== 'string' || result.code.length === 0) {
					throw toPlatformError(
						wechatCapabilities.identity.login.id,
						'request',
						undefined,
						'server-rejected'
					);
				}
				return new OneTimeCredential(result.code as LoginCode);
			},
			phoneCode(value) {
				if (value.length === 0) throw new TypeError('Phone number code cannot be empty.');
				return new OneTimeCredential(value as PhoneNumberCode);
			},
			soter(soterOptions) {
				return safeCall(wechatCapabilities.identity.soter, 'authenticate', () =>
					driver.call('startSoterAuthentication', soterOptions)
				);
			}
		},
		location: {
			current(locationOptions = {}) {
				return safeCall(wechatCapabilities.location.current, 'get', () =>
					callAs(driver, 'getLocation', locationOptions)
				);
			},
			async observe(listener, background = false) {
				const descriptor = background
					? wechatCapabilities.location.background
					: wechatCapabilities.location.foreground;
				const start = background ? 'startLocationUpdateBackground' : 'startLocationUpdate';
				await safeCall(descriptor, 'start', () => callAs(driver, start));
				const handle = scopedListener(
					scope,
					(callback) => driver.listen('onLocationChange', 'offLocationChange', callback),
					listener
				);
				scope.add(() => ignoreFailure(() => callAs(driver, 'stopLocationUpdate')));
				return handle;
			}
		},
		media: {
			camera(id) {
				const context = driver.create('createCameraContext', id);
				return new ScopedHandle(scope, context, () => undefined);
			},
			choose(chooseOptions) {
				return safeCall(wechatCapabilities.media.choose, 'choose', () =>
					driver.call('chooseMedia', chooseOptions)
				);
			},
			scan(scanOptions = {}) {
				return safeCall(wechatCapabilities.media.scan, 'scan', () =>
					driver.call('scanCode', scanOptions)
				);
			}
		},
		messaging: {
			subscribe(templateIds) {
				if (templateIds.length === 0 || templateIds.length > 3) {
					throw new TypeError('Subscription message requests require one to three template IDs.');
				}
				return safeCall(wechatCapabilities.messaging.subscribe, 'request', () =>
					driver.call('requestSubscribeMessage', {
						tmplIds: [...templateIds]
					} as Taro.requestSubscribeMessage.Option)
				);
			}
		},
		navigation: {
			navigateBack(navigateOptions = {}) {
				return afterNativeEvent(() => callAs(driver, 'navigateBack', navigateOptions));
			},
			navigateTo(navigateOptions) {
				return afterNativeEvent(() =>
					callAs<NavigateToResult>(driver, 'navigateTo', navigateOptions)
				);
			},
			reLaunch(navigateOptions) {
				return afterNativeEvent(() => callAs(driver, 'reLaunch', navigateOptions));
			},
			redirectTo(navigateOptions) {
				return afterNativeEvent(() => callAs(driver, 'redirectTo', navigateOptions));
			},
			switchTab(navigateOptions) {
				return afterNativeEvent(() => callAs(driver, 'switchTab', navigateOptions));
			}
		},
		network: {
			async mdns(serviceType) {
				if (serviceType.length === 0) throw new TypeError('mDNS serviceType cannot be empty.');
				await safeCall(wechatCapabilities.network.mdns, 'start', () =>
					callAs(driver, 'startLocalServiceDiscovery', { serviceType })
				);
				return new ScopedHandle(scope, undefined, () =>
					callAs(driver, 'stopLocalServiceDiscovery')
				);
			},
			tcp() {
				const socket = driver.create('createTCPSocket');
				return new ScopedHandle(scope, socket, () => socket.close());
			},
			udp() {
				const socket = driver.create('createUDPSocket');
				return new ScopedHandle(scope, socket, () => socket.close());
			},
			async websocket(socketOptions) {
				const task = await safeCall(wechatCapabilities.network.websocket, 'connect', () =>
					driver.call('connectSocket', socketOptions)
				);
				return new ScopedHandle(scope, task, () => task.close({}));
			}
		},
		privacy: {
			authorize(permissionScope) {
				return safeCall(wechatCapabilities.privacy.permission, 'authorize', () =>
					callAs(driver, 'authorize', { scope: permissionScope })
				).then(() => undefined);
			},
			async permission(permissionScope) {
				if (permissionScope.length === 0) throw new TypeError('Permission scope cannot be empty.');
				const settings = await safeCall(wechatCapabilities.privacy.permission, 'setting', () =>
					driver.call('getSetting')
				);
				const value = (settings.authSetting as Readonly<Record<string, boolean | undefined>>)[
					permissionScope
				];
				return value === true ? 'granted' : value === false ? 'denied' : 'prompt';
			},
			setting() {
				return safeCall(wechatCapabilities.privacy.setting, 'get', () =>
					callAs(driver, 'getPrivacySetting')
				);
			}
		},
		raw: driver.raw,
		support: {
			async check(descriptor, availability = {}) {
				const environment = driver.environment;
				if (!driver.canIUse(descriptor.api)) {
					return {
						descriptor,
						reason: `${descriptor.api} is unavailable.`,
						status: 'unsupported-platform'
					};
				}
				if (
					descriptor.minBaseLibrary !== undefined &&
					environment.baseLibraryVersion !== undefined &&
					compareVersions(environment.baseLibraryVersion, descriptor.minBaseLibrary) < 0
				) {
					return {
						descriptor,
						reason: `Requires base library ${descriptor.minBaseLibrary}.`,
						status: 'unsupported-base-library'
					};
				}
				if (
					descriptor.clients !== undefined &&
					environment.client !== undefined &&
					!descriptor.clients.includes(environment.client)
				) {
					return {
						descriptor,
						reason: `Unsupported client ${environment.client}.`,
						status: 'unsupported-platform'
					};
				}
				if (
					descriptor.renderers !== undefined &&
					environment.renderer !== undefined &&
					!descriptor.renderers.includes(environment.renderer)
				) {
					return {
						descriptor,
						reason: `Unsupported renderer ${environment.renderer}.`,
						status: 'unsupported-platform'
					};
				}
				if (
					descriptor.realDevice === 'required' &&
					!(availability.realDevice ?? environment.realDevice)
				) {
					return {
						descriptor,
						reason: 'A real device is required.',
						status: 'real-device-required'
					};
				}
				if (descriptor.requiresAccountEntitlement && availability.accountEntitled !== true) {
					return {
						descriptor,
						reason: 'Account entitlement cannot be confirmed on the client.',
						status: 'account-entitlement-required'
					};
				}
				if (descriptor.requiresPrivacyConsent && availability.privacyConsent !== true) {
					return { descriptor, reason: 'Privacy consent is required.', status: 'privacy-required' };
				}
				if (descriptor.permissionScope !== undefined) {
					if (availability.permission === 'denied')
						return { descriptor, reason: 'Permission was denied.', status: 'permission-denied' };
					if (availability.permission !== 'granted')
						return {
							descriptor,
							reason: `Permission ${descriptor.permissionScope} is required.`,
							status: 'permission-required'
						};
				}
				if (descriptor.requiresUserGesture && availability.userGesture !== true) {
					return {
						descriptor,
						reason: 'An explicit user gesture is required.',
						status: 'user-gesture-required'
					};
				}
				return { descriptor, status: 'available' };
			},
			system() {
				return driver.create('getSystemSetting');
			}
		},
		system: {
			files() {
				return driver.create('getFileSystemManager');
			},
			network: {
				current() {
					return safeCall(wechatCapabilities.system.network, 'get', () =>
						driver.call('getNetworkType')
					);
				},
				observe(listener) {
					return scopedListener(
						scope,
						(callback) =>
							driver.listen('onNetworkStatusChange', 'offNetworkStatusChange', callback),
						listener
					);
				}
			},
			storage: {
				async get<TValue>(key: string) {
					if (key.length === 0) throw new TypeError('Storage key cannot be empty.');
					const result = await safeCall(wechatCapabilities.system.storage, 'get', () =>
						driver.call('getStorage', { key })
					);
					return result.data as TValue;
				},
				remove(key) {
					if (key.length === 0) throw new TypeError('Storage key cannot be empty.');
					return safeCall(wechatCapabilities.system.storage, 'remove', () =>
						driver.call('removeStorage', { key })
					).then(() => undefined);
				},
				set<TValue>(key: string, value: TValue) {
					if (key.length === 0) throw new TypeError('Storage key cannot be empty.');
					return safeCall(wechatCapabilities.system.storage, 'set', () =>
						driver.call('setStorage', { data: value, key })
					).then(() => undefined);
				}
			}
		},
		forScope(childScope) {
			return createWeChatPlatform({ driver, scope: childScope });
		}
	};
	return platform;
}
