import type { IcssRuntime } from '../icss/runtime.js';
import type { StyleRegistry, StyleRegistryMetrics } from '../icss/registry.js';
import type { MemoryStyleSheet } from '../icss/sheet.js';
import type { IcssClassName } from '../icss/types.js';

export interface IcssTestSnapshot {
	readonly cssText: string;
	readonly entries: number;
	readonly metrics: StyleRegistryMetrics;
	readonly styleTag: string;
}

export interface IcssTestRuntime {
	readonly registry: StyleRegistry;
	readonly runtime: IcssRuntime;
	readonly sheet: MemoryStyleSheet;
	reset(): void;
	snapshot(): IcssTestSnapshot;
}

export interface IcssFixtureResult {
	readonly className: IcssClassName;
	readonly snapshot: IcssTestSnapshot;
}
