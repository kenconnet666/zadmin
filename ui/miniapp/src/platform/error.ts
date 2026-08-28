export type PlatformErrorKind =
	| 'unsupported'
	| 'privacy-required'
	| 'permission-denied'
	| 'user-cancelled'
	| 'account-not-enabled'
	| 'device-unavailable'
	| 'disconnected'
	| 'timeout'
	| 'invalid-input'
	| 'network'
	| 'server-rejected'
	| 'unknown';

type RawPlatformError = {
	errCode?: unknown;
	errMsg?: unknown;
};

function kindOf(error: RawPlatformError): PlatformErrorKind {
	const message = typeof error.errMsg === 'string' ? error.errMsg.toLowerCase() : '';
	if (message.includes('cancel')) return 'user-cancelled';
	if (message.includes('auth deny') || message.includes('permission')) return 'permission-denied';
	if (message.includes('not support') || message.includes('unsupported')) return 'unsupported';
	if (message.includes('timeout') || message.includes('timed out')) return 'timeout';
	if (message.includes('disconnect') || message.includes('closed')) return 'disconnected';
	if (message.includes('network')) return 'network';
	if (message.includes('bluetooth') || message.includes('device')) return 'device-unavailable';
	return 'unknown';
}

function rawCodeOf(error: RawPlatformError): number | string | undefined {
	return typeof error.errCode === 'number' || typeof error.errCode === 'string'
		? error.errCode
		: undefined;
}

export class PlatformError extends Error {
	readonly capabilityId: string;
	declare readonly cause: unknown;
	readonly kind: PlatformErrorKind;
	readonly operation: string;
	readonly rawCode?: number | string;

	constructor(options: {
		capabilityId: string;
		cause?: unknown;
		kind: PlatformErrorKind;
		operation: string;
		rawCode?: number | string;
	}) {
		super(`${options.capabilityId}.${options.operation} failed (${options.kind}).`);
		this.name = 'PlatformError';
		this.capabilityId = options.capabilityId;
		Object.defineProperty(this, 'cause', {
			configurable: false,
			enumerable: false,
			value: options.cause,
			writable: false
		});
		this.kind = options.kind;
		this.operation = options.operation;
		this.rawCode = options.rawCode;
	}
}

export function toPlatformError(
	capabilityId: string,
	operation: string,
	error: unknown,
	kind?: PlatformErrorKind
): PlatformError {
	if (error instanceof PlatformError) return error;
	const raw = typeof error === 'object' && error !== null ? (error as RawPlatformError) : {};
	return new PlatformError({
		capabilityId,
		cause: error,
		kind: kind ?? kindOf(raw),
		operation,
		rawCode: rawCodeOf(raw)
	});
}
