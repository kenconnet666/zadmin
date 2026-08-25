import { desktopError, desktopFail, desktopOk, type DesktopResult } from './error.js';

export interface DesktopOpenerPolicy {
	readonly allowedOrigins: readonly string[];
}

export interface ConfirmedDesktopAction {
	readonly confirmed: true;
}

export function validateExternalUrl(
	value: string | URL,
	policy: DesktopOpenerPolicy
): DesktopResult<URL> {
	let url: URL;
	try {
		url = value instanceof URL ? value : new URL(value);
	} catch {
		return desktopFail(
			desktopError('invalid-input', 'opener.openUrl', 'The external URL is invalid.')
		);
	}
	if (url.protocol !== 'https:') {
		return desktopFail(
			desktopError('permission-denied', 'opener.openUrl', 'Only HTTPS URLs are allowed.')
		);
	}
	if (!policy.allowedOrigins.includes(url.origin)) {
		return desktopFail(
			desktopError(
				'permission-denied',
				'opener.openUrl',
				`The URL origin is not allowed: ${url.origin}`
			)
		);
	}
	return desktopOk(url);
}

export function isConfirmedDesktopAction(value: unknown): value is ConfirmedDesktopAction {
	return Boolean(value && typeof value === 'object' && Reflect.get(value, 'confirmed') === true);
}
