import type { TouchCheckpoint, TouchStep, TouchTerminal } from './touch-commands.js';

declare module 'vitest/internal/browser' {
	interface BrowserCommands {
		isolateTouchBrowserHistory(): Promise<void>;
		touchSequence(
			sourceSelector: string,
			steps: readonly TouchStep[],
			terminal: TouchTerminal,
			holdMilliseconds?: number
		): Promise<readonly TouchCheckpoint[]>;
	}
}

export {};
