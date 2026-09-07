// Keep a different basename from browser-commands.ts so TypeScript includes this augmentation.
declare module 'vitest/internal/browser' {
	interface BrowserCommands {
		dragSliderTrack(selector: string, startRatio: number, endRatio: number): Promise<void>;
	}
}
export {};
