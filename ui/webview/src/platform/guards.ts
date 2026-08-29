import { desktopError, desktopFail, desktopOk } from './error.js';
import type { ConfirmedAction, DesktopResult } from './types.js';

export function validateExternalUrl(
	value: string | URL,
	allowedOrigins: readonly string[]
): DesktopResult<URL> {
	let url: URL;
	try {
		url = value instanceof URL ? value : new URL(value);
	} catch {
		return desktopFail(desktopError('invalid-input', 'opener.openUrl', 'Invalid external URL.'));
	}
	if (url.protocol !== 'https:') {
		return desktopFail(
			desktopError('permission-denied', 'opener.openUrl', 'Only HTTPS URLs are allowed.')
		);
	}
	if (!allowedOrigins.includes(url.origin)) {
		return desktopFail(
			desktopError(
				'permission-denied',
				'opener.openUrl',
				`External URL origin is not allowed: ${url.origin}`
			)
		);
	}
	return desktopOk(url);
}

export function isConfirmedDesktopAction(value: unknown): value is ConfirmedAction {
	return Boolean(value && typeof value === 'object' && Reflect.get(value, 'confirmed') === true);
}
