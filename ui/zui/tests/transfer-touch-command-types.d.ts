import type {
	TransferTouchCheckpoint,
	TransferTouchStep,
	TransferTouchTerminal
} from './transfer-touch-commands.js';

declare module 'vitest/internal/browser' {
	interface BrowserCommands {
		isolateTouchBrowserHistory(): Promise<void>;
		touchSequence(
			sourceSelector: string,
			steps: readonly TransferTouchStep[],
			terminal: TransferTouchTerminal,
			holdMilliseconds?: number
		): Promise<readonly TransferTouchCheckpoint[]>;
	}
}

export {};
