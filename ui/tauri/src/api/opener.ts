import { openUrl } from '@tauri-apps/plugin-opener';

import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';
import { validateExternalUrl, type DesktopOpenerPolicy } from '../runtime/scope.js';

export interface DesktopOpenerApi {
	readonly availability: DesktopAvailability;
	readonly policy: DesktopOpenerPolicy;
	openUrl(value: string | URL): Promise<DesktopResult<void>>;
}

export function createOpenerApi(
	availability: DesktopAvailability,
	policy: DesktopOpenerPolicy
): DesktopOpenerApi {
	return {
		availability,
		policy,
		async openUrl(value) {
			const validated = validateExternalUrl(value, policy);
			if (!validated.ok) return validated;
			return captureDesktop('opener.openUrl', () => openUrl(validated.value));
		}
	};
}

export function createUnsupportedOpenerApi(availability: DesktopAvailability): DesktopOpenerApi {
	return {
		availability,
		policy: { allowedOrigins: [] },
		openUrl: () => unsupportedDesktop('opener.openUrl', availability.reason)
	};
}
