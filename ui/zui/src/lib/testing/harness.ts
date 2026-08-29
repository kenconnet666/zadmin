import { StyleRegistry, type StyleRegistryOptions } from '../icss/registry.js';
import { createIcssRuntime } from '../icss/runtime.js';
import { MemoryStyleSheet } from '../icss/sheet.js';
import type { IcssTestRuntime, IcssTestSnapshot } from './types.js';

export type IcssTestRuntimeOptions = Omit<StyleRegistryOptions, 'sheet'>;

export function createTestIcssRuntime(options: IcssTestRuntimeOptions = {}): IcssTestRuntime {
	const sheet = new MemoryStyleSheet();
	const registry = new StyleRegistry({ ...options, sheet });
	const runtime = createIcssRuntime({ registry });

	return Object.freeze({
		registry,
		runtime,
		sheet,
		reset() {
			registry.clear();
		},
		snapshot() {
			return snapshotTestIcssRuntime(registry, sheet);
		}
	});
}

export function snapshotTestIcssRuntime(
	registry: StyleRegistry,
	sheet: MemoryStyleSheet
): IcssTestSnapshot {
	return Object.freeze({
		cssText: registry.cssText(),
		entries: sheet.entries.length,
		metrics: Object.freeze({ ...registry.metrics }),
		styleTag: registry.styleTag()
	});
}
