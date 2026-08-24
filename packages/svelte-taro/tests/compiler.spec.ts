import { describe, expect, it } from 'vitest';

import {
	componentMarkerId,
	createSvelteVitePlugin,
	styleVirtualId
} from '../src/compiler/index.ts';

describe('Svelte Taro compiler', () => {
	it('compiles through the custom renderer and emits CSS and component metadata', async () => {
		const plugin = createSvelteVitePlugin({ dev: true });
		plugin.configResolved?.({ command: 'build', mode: 'development', root: 'C:/fixture' });
		const warnings: unknown[] = [];
		const filename = 'C:/fixture/Panel.svelte';
		const result = await plugin.transform?.call(
			{ warn: (warning) => warnings.push(warning) },
			`<script>let active = $state(true)</script><style>.panel{color:red}</style><view class="panel"><text>Ready</text>{#if active}<button>Go</button>{/if}</view>`,
			filename
		);

		expect(result?.code).toContain("from '@zadmin/svelte-taro/renderer'");
		expect(result?.code).toContain(JSON.stringify(componentMarkerId(filename)));
		expect(result?.code).toContain(JSON.stringify(styleVirtualId(filename)));
		expect(plugin.load?.(styleVirtualId(filename))).toContain('.panel');
		const marker = plugin.load?.(componentMarkerId(filename));
		expect(marker).toContain('createElement("button"');
		expect(marker).toContain('createElement("text"');
		expect(marker).toContain('createElement("view"');
		expect(componentMarkerId(filename).startsWith('\0')).toBe(false);
		expect(warnings).toEqual([]);
	});

	it('ignores non-Svelte modules and surfaces unsupported renderer syntax', async () => {
		const plugin = createSvelteVitePlugin();
		expect(
			await plugin.transform?.call({ warn() {} }, 'export const value = 1', 'plain.ts')
		).toBeUndefined();
		await expect(
			plugin.transform?.call(
				{ warn() {} },
				'<svelte:window onkeydown={() => undefined} />',
				'C:/fixture/Unsupported.svelte'
			)
		).rejects.toThrow(/svelte:window|custom renderer/i);
	});
});
