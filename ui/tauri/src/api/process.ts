import { exit, relaunch } from '@tauri-apps/plugin-process';

import type { DesktopAvailability } from '../runtime/environment.js';
import {
	captureDesktop,
	desktopError,
	desktopFail,
	unsupportedDesktop,
	type DesktopResult
} from '../runtime/error.js';
import { isConfirmedDesktopAction, type ConfirmedDesktopAction } from '../runtime/scope.js';

export interface DesktopProcessApi {
	readonly availability: DesktopAvailability;
	exit(action: ConfirmedDesktopAction, code?: number): Promise<DesktopResult<void>>;
	relaunch(action: ConfirmedDesktopAction): Promise<DesktopResult<void>>;
}

function validateAction(operation: string, action: unknown): DesktopResult<void> | undefined {
	if (isConfirmedDesktopAction(action)) return undefined;
	return desktopFail(
		desktopError('invalid-input', operation, 'A confirmed user action is required.')
	);
}

export function createProcessApi(availability: DesktopAvailability): DesktopProcessApi {
	return {
		availability,
		async exit(action, code) {
			const invalid = validateAction('process.exit', action);
			return invalid ?? captureDesktop('process.exit', () => exit(code));
		},
		async relaunch(action) {
			const invalid = validateAction('process.relaunch', action);
			return invalid ?? captureDesktop('process.relaunch', () => relaunch());
		}
	};
}

export function createUnsupportedProcessApi(availability: DesktopAvailability): DesktopProcessApi {
	return {
		availability,
		exit: () => unsupportedDesktop('process.exit', availability.reason),
		relaunch: () => unsupportedDesktop('process.relaunch', availability.reason)
	};
}
