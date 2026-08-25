import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
	type Options
} from '@tauri-apps/plugin-notification';

import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export type { Options as DesktopNotificationOptions } from '@tauri-apps/plugin-notification';

export interface DesktopNotificationApi {
	readonly availability: DesktopAvailability;
	isPermissionGranted(): Promise<DesktopResult<boolean>>;
	requestPermission(): Promise<DesktopResult<NotificationPermission>>;
	send(options: Options | string): Promise<DesktopResult<void>>;
}

export function createNotificationApi(availability: DesktopAvailability): DesktopNotificationApi {
	return {
		availability,
		isPermissionGranted: () =>
			captureDesktop('notification.isPermissionGranted', () => isPermissionGranted()),
		requestPermission: () =>
			captureDesktop('notification.requestPermission', () => requestPermission()),
		send: (options) => captureDesktop('notification.send', () => sendNotification(options))
	};
}

export function createUnsupportedNotificationApi(
	availability: DesktopAvailability
): DesktopNotificationApi {
	return {
		availability,
		isPermissionGranted: () =>
			unsupportedDesktop('notification.isPermissionGranted', availability.reason),
		requestPermission: () =>
			unsupportedDesktop('notification.requestPermission', availability.reason),
		send: () => unsupportedDesktop('notification.send', availability.reason)
	};
}
