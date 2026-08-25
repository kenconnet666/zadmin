import { desktopError, desktopFail, desktopOk, type DesktopResult } from '@zadmin/tauri';

import type { DesktopCommandError } from './generated/tauri.js';

export type GeneratedCommandResult<T> =
	| { readonly data: T; readonly status: 'ok' }
	| { readonly error: unknown; readonly status: 'error' };

export function isDesktopCommandError(value: unknown): value is DesktopCommandError {
	if (!value || typeof value !== 'object') return false;
	const code = Reflect.get(value, 'code');
	const details = Reflect.get(value, 'details');
	return (
		((code === 'channel' || code === 'invalid-request' || code === 'unsupported') &&
			Boolean(
				details &&
				typeof details === 'object' &&
				typeof Reflect.get(details, 'message') === 'string'
			)) ||
		(code === 'unsupported' &&
			Boolean(
				details &&
				typeof details === 'object' &&
				typeof Reflect.get(details, 'capability') === 'string'
			))
	);
}

export function normalizeCommandResult<T>(result: GeneratedCommandResult<T>): DesktopResult<T> {
	if (result.status === 'ok') return desktopOk(result.data);
	if (!isDesktopCommandError(result.error)) {
		return desktopFail(
			desktopError(
				'transport-error',
				'commands.invoke',
				'Tauri returned an error outside the generated command contract.',
				true
			)
		);
	}

	const error = result.error;
	if (error.code === 'unsupported') {
		return desktopFail(desktopError('unsupported', 'commands.invoke', error.details.capability));
	}
	return desktopFail(
		desktopError(
			error.code === 'invalid-request' ? 'invalid-input' : 'transport-error',
			'commands.invoke',
			error.details.message,
			error.code === 'channel'
		)
	);
}
