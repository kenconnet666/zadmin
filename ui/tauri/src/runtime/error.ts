export type DesktopErrorCode =
	| 'disposed'
	| 'invalid-input'
	| 'permission-denied'
	| 'system-error'
	| 'transport-error'
	| 'unsupported';

export interface DesktopError {
	readonly code: DesktopErrorCode;
	readonly message: string;
	readonly operation: string;
	readonly retryable: boolean;
}

export type DesktopResult<T> =
	{ readonly ok: true; readonly value: T } | { readonly error: DesktopError; readonly ok: false };

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

function errorMessage(cause: unknown): string {
	if (cause instanceof Error) return cause.message;
	if (typeof cause === 'string') return cause;
	if (cause && typeof cause === 'object' && 'message' in cause) {
		const message = Reflect.get(cause, 'message');
		if (typeof message === 'string') return message;
	}
	return 'The desktop operation failed.';
}

export function normalizeDesktopError(operation: string, cause: unknown): DesktopError {
	if (isDesktopError(cause)) return cause;

	const message = errorMessage(cause);
	if (/not allowed|permission|forbidden|scope/i.test(message)) {
		return desktopError('permission-denied', operation, message);
	}
	if (/__TAURI|not running in tauri|unsupported/i.test(message)) {
		return desktopError('unsupported', operation, message);
	}
	if (typeof cause === 'string') {
		return desktopError('transport-error', operation, message, true);
	}
	return desktopError('system-error', operation, message, true);
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
	reason?: string
): Promise<DesktopResult<T>> {
	return Promise.resolve(
		desktopFail(
			desktopError('unsupported', operation, reason ?? 'This desktop capability is unavailable.')
		)
	);
}
