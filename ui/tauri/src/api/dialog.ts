import {
	confirm,
	message,
	open,
	save,
	type ConfirmDialogOptions,
	type MessageDialogOptions,
	type MessageDialogResult,
	type OpenDialogOptions,
	type OpenDialogReturn,
	type SaveDialogOptions
} from '@tauri-apps/plugin-dialog';

import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export type {
	ConfirmDialogOptions,
	DialogFilter,
	MessageDialogOptions,
	MessageDialogResult,
	OpenDialogOptions,
	OpenDialogReturn,
	SaveDialogOptions
} from '@tauri-apps/plugin-dialog';

export interface DesktopDialogApi {
	readonly availability: DesktopAvailability;
	confirm(
		messageText: string,
		options?: string | ConfirmDialogOptions
	): Promise<DesktopResult<boolean>>;
	message(
		messageText: string,
		options?: string | MessageDialogOptions
	): Promise<DesktopResult<MessageDialogResult>>;
	open<TOptions extends OpenDialogOptions>(
		options?: TOptions
	): Promise<DesktopResult<OpenDialogReturn<TOptions>>>;
	save(options?: SaveDialogOptions): Promise<DesktopResult<string | null>>;
}

export function createDialogApi(availability: DesktopAvailability): DesktopDialogApi {
	return {
		availability,
		confirm: (messageText, options) =>
			captureDesktop('dialog.confirm', () => confirm(messageText, options)),
		message: (messageText, options) =>
			captureDesktop('dialog.message', () => message(messageText, options)),
		open: <TOptions extends OpenDialogOptions>(options?: TOptions) =>
			captureDesktop('dialog.open', () => open(options)),
		save: (options) => captureDesktop('dialog.save', () => save(options))
	};
}

export function createUnsupportedDialogApi(availability: DesktopAvailability): DesktopDialogApi {
	return {
		availability,
		confirm: () => unsupportedDesktop('dialog.confirm', availability.reason),
		message: () => unsupportedDesktop('dialog.message', availability.reason),
		open: <TOptions extends OpenDialogOptions>() =>
			unsupportedDesktop<OpenDialogReturn<TOptions>>('dialog.open', availability.reason),
		save: () => unsupportedDesktop('dialog.save', availability.reason)
	};
}
