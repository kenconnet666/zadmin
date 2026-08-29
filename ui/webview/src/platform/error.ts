import type { DesktopError, DesktopErrorCode, DesktopResult } from './types.js';

export function desktopOk<T>(value: T): DesktopResult<T> {
	return { ok: true, value };
}

export function desktopError(
	code: DesktopErrorCode,
	operation: string,
	message: string,
	retryable = false
): DesktopError {
	return { code, message, operation, retryable };
}

export function desktopFail<T>(error: DesktopError): DesktopResult<T> {
	return { error, ok: false };
}

export function isDesktopError(value: unknown): value is DesktopError {
	if (!value || typeof value !== 'object') return false;
	return (
		typeof Reflect.get(value, 'code') === 'string' &&
		typeof Reflect.get(value, 'message') === 'string' &&
		typeof Reflect.get(value, 'operation') === 'string' &&
		typeof Reflect.get(value, 'retryable') === 'boolean'
	);
}

export function normalizeDesktopError(operation: string, cause: unknown): DesktopError {
	if (isDesktopError(cause)) return cause;
	if (cause instanceof DOMException && cause.name === 'AbortError') {
		return desktopError('cancelled', operation, 'The desktop operation was cancelled.');
	}
	const message =
		cause instanceof Error ? cause.message : String(cause ?? 'Desktop operation failed.');
	if (/timeout/i.test(message)) return desktopError('timeout', operation, message, true);
	if (/permission|forbidden|not allowed|origin/i.test(message)) {
		return desktopError('permission-denied', operation, message);
	}
	if (/protocol|version|payload|message/i.test(message)) {
		return desktopError('protocol-error', operation, message);
	}
	if (/transport|webview/i.test(message)) {
		return desktopError('transport-error', operation, message, true);
	}
	return desktopError('system-error', operation, message, true);
}

export async function captureDesktop<T>(
	operation: string,
	task: () => Promise<T> | T
): Promise<DesktopResult<T>> {
	try {
		return desktopOk(await task());
	} catch (cause) {
		return desktopFail(normalizeDesktopError(operation, cause));
	}
}

export function unsupportedDesktop<T>(
	operation: string,
	reason: string
): Promise<DesktopResult<T>> {
	return Promise.resolve(desktopFail(desktopError('unsupported', operation, reason)));
}
