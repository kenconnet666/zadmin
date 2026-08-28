import type { CapabilityDescriptor } from './types.ts';

const CHECKED_AT = '2026-08-25';
const WECHAT_API = 'https://developers.weixin.qq.com/miniprogram/dev/api';

type DescriptorInput<Id extends string> = Omit<
	CapabilityDescriptor<Id>,
	| 'billing'
	| 'checkedAt'
	| 'dataClasses'
	| 'officialPluginSupport'
	| 'realDevice'
	| 'requiresAccountEntitlement'
	| 'requiresBackend'
	| 'requiresPrivacyConsent'
	| 'requiresUserGesture'
	| 'stability'
> &
	Partial<
		Pick<
			CapabilityDescriptor<Id>,
			| 'billing'
			| 'dataClasses'
			| 'officialPluginSupport'
			| 'realDevice'
			| 'requiresAccountEntitlement'
			| 'requiresBackend'
			| 'requiresPrivacyConsent'
			| 'requiresUserGesture'
			| 'stability'
		>
	>;

function capability<const Id extends string>(input: DescriptorInput<Id>): CapabilityDescriptor<Id> {
	return Object.freeze({
		billing: 'none' as const,
		checkedAt: CHECKED_AT,
		dataClasses: [],
		officialPluginSupport: 'supported' as const,
		realDevice: 'no' as const,
		requiresAccountEntitlement: false,
		requiresBackend: false,
		requiresPrivacyConsent: false,
		requiresUserGesture: false,
		stability: 'stable' as const,
		...input
	});
}

const support = {
	canIUse: capability({
		api: 'canIUse',
		id: 'wechat.support.can-i-use',
		officialDoc: `${WECHAT_API}/base/wx.canIUse.html`,
		resource: 'one-shot',
		taroType: 'types/api/base/index.d.ts#canIUse',
		title: 'Capability support probe'
	}),
	system: capability({
		api: 'getSystemSetting',
		id: 'wechat.support.system',
		minBaseLibrary: '2.20.1',
		officialDoc: `${WECHAT_API}/base/system/wx.getSystemSetting.html`,
		resource: 'one-shot',
		taroType: 'types/api/base/system.d.ts#getSystemSetting',
		title: 'System switches and device support'
	})
} as const;

const privacy = {
	permission: capability({
		api: 'authorize',
		dataClasses: ['personal'],
		id: 'wechat.privacy.permission',
		officialDoc: `${WECHAT_API}/open-api/authorize/wx.authorize.html`,
		resource: 'one-shot',
		requiresPrivacyConsent: true,
		requiresUserGesture: true,
		taroType: 'types/api/open-api/authorize.d.ts#authorize',
		title: 'Permission request'
	}),
	setting: capability({
		api: 'getPrivacySetting',
		dataClasses: ['personal'],
		id: 'wechat.privacy.setting',
		minBaseLibrary: '2.32.3',
		officialDoc: `${WECHAT_API}/open-api/privacy/wx.getPrivacySetting.html`,
		resource: 'one-shot',
		taroType: 'types/api/open-api/privacy.d.ts#getPrivacySetting',
		title: 'Privacy authorization state'
	})
} as const;

const identity = {
	checkSession: capability({
		api: 'checkSession',
		dataClasses: ['identity'],
		id: 'wechat.identity.check-session',
		officialDoc: `${WECHAT_API}/open-api/login/wx.checkSession.html`,
		resource: 'one-shot',
		taroType: 'types/api/open-api/login.d.ts#checkSession',
		title: 'Session validity check'
	}),
	login: capability({
		api: 'login',
		dataClasses: ['identity'],
		id: 'wechat.identity.login',
		officialDoc: `${WECHAT_API}/open-api/login/wx.login.html`,
		resource: 'one-shot',
		requiresBackend: true,
		taroType: 'types/api/open-api/login.d.ts#login',
		title: 'One-time login code'
	}),
	phoneNumber: capability({
		api: 'button.open-type=getPhoneNumber',
		billing: 'possible',
		dataClasses: ['identity', 'personal'],
		id: 'wechat.identity.phone-number',
		officialDoc:
			'https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html',
		officialPluginSupport: 'conditional',
		resource: 'one-shot',
		requiresAccountEntitlement: true,
		requiresBackend: true,
		requiresPrivacyConsent: true,
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: '@tarojs/components/types/Button.d.ts#onGetPhoneNumber',
		title: 'One-time phone number code'
	}),
	soter: capability({
		api: 'startSoterAuthentication',
		dataClasses: ['identity'],
		id: 'wechat.identity.soter',
		officialDoc: `${WECHAT_API}/open-api/soter/wx.startSoterAuthentication.html`,
		realDevice: 'required',
		resource: 'one-shot',
		requiresBackend: true,
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: 'types/api/open-api/soter.d.ts#startSoterAuthentication',
		title: 'SOTER biometric challenge'
	})
} as const;

const commerce = {
	payment: capability({
		api: 'requestPayment',
		billing: 'required',
		dataClasses: ['financial', 'identity'],
		id: 'wechat.commerce.payment',
		officialDoc: `${WECHAT_API}/payment/wx.requestPayment.html`,
		officialPluginSupport: 'unsupported',
		resource: 'one-shot',
		requiresAccountEntitlement: true,
		requiresBackend: true,
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: 'types/api/payment/index.d.ts#requestPayment',
		title: 'Client payment bridge'
	})
} as const;

const media = {
	camera: capability({
		api: 'createCameraContext',
		dataClasses: ['media', 'personal'],
		id: 'wechat.media.camera',
		officialDoc: `${WECHAT_API}/media/camera/wx.createCameraContext.html`,
		permissionScope: 'scope.camera',
		realDevice: 'recommended',
		resource: 'context',
		requiresPrivacyConsent: true,
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: 'types/api/media/camera.d.ts#createCameraContext',
		title: 'Scoped camera context'
	}),
	choose: capability({
		api: 'chooseMedia',
		dataClasses: ['media', 'personal'],
		id: 'wechat.media.choose',
		minBaseLibrary: '2.10.0',
		officialDoc: `${WECHAT_API}/media/video/wx.chooseMedia.html`,
		realDevice: 'recommended',
		resource: 'one-shot',
		requiresPrivacyConsent: true,
		requiresUserGesture: true,
		taroType: 'types/api/media/video.d.ts#chooseMedia',
		title: 'Choose image or video'
	}),
	scan: capability({
		api: 'scanCode',
		dataClasses: ['media'],
		id: 'wechat.media.scan',
		officialDoc: `${WECHAT_API}/device/scan/wx.scanCode.html`,
		realDevice: 'required',
		resource: 'one-shot',
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: 'types/api/device/scan.d.ts#scanCode',
		title: 'Scan QR or barcode'
	})
} as const;

const locationCapabilities = {
	background: capability({
		api: 'startLocationUpdateBackground',
		dataClasses: ['location', 'personal'],
		id: 'wechat.location.background',
		officialDoc: `${WECHAT_API}/location/wx.startLocationUpdateBackground.html`,
		permissionScope: 'scope.userLocationBackground',
		realDevice: 'required',
		renderers: ['webview'],
		requiredBackgroundMode: 'location',
		requiredPrivateInfo: 'startLocationUpdateBackground',
		resource: 'listener',
		requiresAccountEntitlement: true,
		requiresPrivacyConsent: true,
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: 'types/api/location/index.d.ts#startLocationUpdateBackground',
		title: 'Background location stream'
	}),
	current: capability({
		api: 'getLocation',
		dataClasses: ['location', 'personal'],
		id: 'wechat.location.current',
		officialDoc: `${WECHAT_API}/location/wx.getLocation.html`,
		permissionScope: 'scope.userLocation',
		realDevice: 'recommended',
		requiredPrivateInfo: 'getLocation',
		resource: 'one-shot',
		requiresPrivacyConsent: true,
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: 'types/api/location/index.d.ts#getLocation',
		title: 'Current location'
	}),
	foreground: capability({
		api: 'startLocationUpdate',
		dataClasses: ['location', 'personal'],
		id: 'wechat.location.foreground',
		officialDoc: `${WECHAT_API}/location/wx.startLocationUpdate.html`,
		permissionScope: 'scope.userLocation',
		realDevice: 'recommended',
		requiredPrivateInfo: 'startLocationUpdate',
		resource: 'listener',
		requiresPrivacyConsent: true,
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: 'types/api/location/index.d.ts#startLocationUpdate',
		title: 'Foreground location stream'
	})
} as const;

const hardware = {
	beacon: capability({
		api: 'startBeaconDiscovery',
		dataClasses: ['device', 'location'],
		id: 'wechat.hardware.beacon',
		officialDoc: `${WECHAT_API}/device/ibeacon/wx.startBeaconDiscovery.html`,
		realDevice: 'required',
		resource: 'session',
		requiresPrivacyConsent: true,
		stability: 'provisional',
		taroType: 'types/api/device/iBeacon.d.ts#startBeaconDiscovery',
		title: 'iBeacon discovery'
	}),
	bluetooth: capability({
		api: 'openBluetoothAdapter',
		dataClasses: ['device'],
		id: 'wechat.hardware.bluetooth',
		officialDoc: `${WECHAT_API}/device/bluetooth/wx.openBluetoothAdapter.html`,
		realDevice: 'required',
		resource: 'session',
		stability: 'provisional',
		taroType: 'types/api/device/bluetooth.d.ts#openBluetoothAdapter',
		title: 'Bluetooth adapter'
	}),
	bleConnection: capability({
		api: 'createBLEConnection',
		dataClasses: ['device'],
		id: 'wechat.hardware.ble-connection',
		officialDoc: `${WECHAT_API}/device/bluetooth-ble/wx.createBLEConnection.html`,
		realDevice: 'required',
		resource: 'connection',
		stability: 'provisional',
		taroType: 'types/api/device/bluetooth-ble.d.ts#createBLEConnection',
		title: 'BLE central connection'
	}),
	nfc: capability({
		api: 'getNFCAdapter',
		clients: ['android'],
		dataClasses: ['device'],
		id: 'wechat.hardware.nfc',
		minBaseLibrary: '2.11.0',
		officialDoc: `${WECHAT_API}/device/nfc/wx.getNFCAdapter.html`,
		realDevice: 'required',
		resource: 'session',
		stability: 'provisional',
		taroType: 'types/api/device/nfc.d.ts#getNFCAdapter',
		title: 'NFC discovery'
	}),
	sensors: capability({
		api: 'startAccelerometer',
		dataClasses: ['device'],
		id: 'wechat.hardware.sensors',
		officialDoc: `${WECHAT_API}/device/accelerometer/wx.startAccelerometer.html`,
		realDevice: 'required',
		resource: 'listener',
		stability: 'provisional',
		taroType: 'types/api/device/accelerometer.d.ts#startAccelerometer',
		title: 'Motion sensors'
	}),
	wifi: capability({
		api: 'startWifi',
		dataClasses: ['device', 'location'],
		id: 'wechat.hardware.wifi',
		officialDoc: `${WECHAT_API}/device/wifi/wx.startWifi.html`,
		realDevice: 'required',
		resource: 'session',
		requiresPrivacyConsent: true,
		stability: 'provisional',
		taroType: 'types/api/device/wifi.d.ts#startWifi',
		title: 'Wi-Fi session'
	})
} as const;

const system = {
	files: capability({
		api: 'getFileSystemManager',
		dataClasses: ['device'],
		id: 'wechat.system.files',
		officialDoc: `${WECHAT_API}/file/wx.getFileSystemManager.html`,
		resource: 'context',
		taroType: 'types/api/files/index.d.ts#getFileSystemManager',
		title: 'Sandbox file system'
	}),
	network: capability({
		api: 'getNetworkType',
		dataClasses: ['device'],
		id: 'wechat.system.network',
		officialDoc: `${WECHAT_API}/device/network/wx.getNetworkType.html`,
		resource: 'listener',
		taroType: 'types/api/device/network.d.ts#getNetworkType',
		title: 'Network state'
	}),
	storage: capability({
		api: 'getStorage',
		dataClasses: ['device'],
		id: 'wechat.system.storage',
		officialDoc: `${WECHAT_API}/storage/wx.getStorage.html`,
		resource: 'one-shot',
		taroType: 'types/api/storage/index.d.ts#getStorage',
		title: 'Local storage'
	})
} as const;

const network = {
	mdns: capability({
		api: 'startLocalServiceDiscovery',
		dataClasses: ['device'],
		id: 'wechat.network.mdns',
		officialDoc: `${WECHAT_API}/network/mdns/wx.startLocalServiceDiscovery.html`,
		realDevice: 'required',
		resource: 'session',
		stability: 'provisional',
		taroType: 'types/api/network/mdns.d.ts#startLocalServiceDiscovery',
		title: 'mDNS discovery'
	}),
	tcp: capability({
		api: 'createTCPSocket',
		dataClasses: ['device'],
		id: 'wechat.network.tcp',
		officialDoc: `${WECHAT_API}/network/tcp/wx.createTCPSocket.html`,
		realDevice: 'recommended',
		resource: 'connection',
		stability: 'provisional',
		taroType: 'types/api/network/tcp.d.ts#createTCPSocket',
		title: 'TCP socket'
	}),
	udp: capability({
		api: 'createUDPSocket',
		dataClasses: ['device'],
		id: 'wechat.network.udp',
		officialDoc: `${WECHAT_API}/network/udp/wx.createUDPSocket.html`,
		realDevice: 'recommended',
		resource: 'connection',
		stability: 'provisional',
		taroType: 'types/api/network/udp.d.ts#createUDPSocket',
		title: 'UDP socket'
	}),
	websocket: capability({
		api: 'connectSocket',
		dataClasses: ['device'],
		id: 'wechat.network.websocket',
		officialDoc: `${WECHAT_API}/network/websocket/wx.connectSocket.html`,
		resource: 'connection',
		taroType: 'types/api/network/websocket.d.ts#connectSocket',
		title: 'WebSocket connection'
	})
} as const;

const messaging = {
	share: capability({
		api: 'onShareAppMessage',
		dataClasses: [],
		id: 'wechat.messaging.share',
		officialDoc:
			'https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object',
		resource: 'listener',
		requiresUserGesture: true,
		taroType: 'types/taro.lifecycle.d.ts#onShareAppMessage',
		title: 'Share lifecycle bridge'
	}),
	subscribe: capability({
		api: 'requestSubscribeMessage',
		dataClasses: ['identity'],
		id: 'wechat.messaging.subscribe',
		officialDoc: `${WECHAT_API}/open-api/subscribe-message/wx.requestSubscribeMessage.html`,
		resource: 'one-shot',
		requiresAccountEntitlement: true,
		requiresBackend: true,
		requiresPrivacyConsent: true,
		requiresUserGesture: true,
		stability: 'provisional',
		taroType: 'types/api/open-api/subscribe-message.d.ts#requestSubscribeMessage',
		title: 'Subscription message consent'
	})
} as const;

const compute = {
	worker: capability({
		api: 'createWorker',
		dataClasses: [],
		id: 'wechat.compute.worker',
		officialDoc: `${WECHAT_API}/worker/wx.createWorker.html`,
		resource: 'connection',
		stability: 'raw',
		taroType: 'types/api/worker/index.d.ts#createWorker',
		title: 'Worker context'
	}),
	experimental: capability({
		api: 'AI/VisionKit/XR/cloud/ad/VoIP',
		billing: 'possible',
		dataClasses: ['device', 'media', 'personal'],
		id: 'wechat.compute.experimental',
		officialDoc: `${WECHAT_API}/ai/`,
		officialPluginSupport: 'conditional',
		realDevice: 'required',
		resource: 'context',
		requiresAccountEntitlement: true,
		requiresBackend: true,
		stability: 'raw',
		taroType: 'types/api/ai, cloud, ad, media/voip',
		title: 'Experimental AI, XR, cloud, ads, and VoIP'
	})
} as const;

export const wechatCapabilities = Object.freeze({
	commerce,
	compute,
	hardware,
	identity,
	location: locationCapabilities,
	media,
	messaging,
	network,
	privacy,
	support,
	system
});

export const allWechatCapabilities = Object.freeze(
	Object.values(wechatCapabilities).flatMap((group) => Object.values(group))
) satisfies readonly CapabilityDescriptor[];

export type WeChatCapabilityId = (typeof allWechatCapabilities)[number]['id'];
