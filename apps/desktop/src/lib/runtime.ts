import type { DesktopError, DesktopResult } from '@zadmin/tauri';

export function resultMessage<T>(result: DesktopResult<T>, format: (value: T) => string): string {
	return result.ok ? format(result.value) : errorMessage(result.error);
}

export function errorMessage(error: DesktopError): string {
	return `${error.code}: ${error.message}`;
}
