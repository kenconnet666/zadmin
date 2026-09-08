import type { TransferTouchStep, TransferTouchTerminal } from './transfer-touch-commands.js';

declare module 'vitest/internal/browser' {
	interface BrowserCommands {
		touchSequence(
			sourceSelector: string,
			steps: readonly TransferTouchStep[],
			terminal: TransferTouchTerminal
		): Promise<void>;
	}
}

export {};
