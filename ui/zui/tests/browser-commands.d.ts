declare module 'vitest/browser' {
	interface BrowserCommands {
		dragSliderTrack(selector: string, startRatio: number, endRatio: number): Promise<void>;
	}
}
export {};
