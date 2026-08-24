import { describe, expect, it, vi } from 'vitest';

import {
	componentMarkerId,
	createSvelteVitePlugin,
	styleVirtualId
} from '../src/compiler/index.ts';

describe('Svelte Taro compiler', () => {
	it('compiles through the custom renderer and emits CSS and component metadata', async () => {
		const plugin = createSvelteVitePlugin({ dev: true });
		plugin.configResolved?.({ command: 'build', mode: 'development', root: 'C:/fixture' });
		plugin.buildStart?.();
		const warnings: unknown[] = [];
		const filename = 'C:/fixture/Panel.svelte';
		const result = await plugin.transform?.call(
			{ warn: (warning) => warnings.push(warning) },
			`<script>let active = $state(true)</script><style>.panel{color:red}</style><view class="panel"><text>Ready</text>{#if active}<button>Go</button>{/if}</view>`,
			filename
		);

		expect(result?.code).toContain("from '@zadmin/svelte-taro/renderer'");
		expect(result?.code).toContain('virtual:zadmin-svelte-taro-build-id');
		expect(result?.code).toContain(JSON.stringify(componentMarkerId(filename)));
		expect(result?.code).toContain(JSON.stringify(styleVirtualId(filename)));
		expect(plugin.load?.(styleVirtualId(filename))).toContain('.panel');
		const marker = plugin.load?.(componentMarkerId(filename));
		expect(marker).toContain('createElement("button"');
		expect(marker).toContain('createElement("text"');
		expect(marker).toContain('createElement("view"');
		expect(componentMarkerId(filename).startsWith('\0')).toBe(false);
		expect(warnings).toEqual([]);
		plugin.buildStart?.();
		expect(plugin.load?.(styleVirtualId(filename))).toContain('.panel');
		expect(plugin.load?.(componentMarkerId(filename))).toContain('createElement("view"');
	});

	it('publishes a build id only after a successful development bundle and erases it in production', async () => {
		const development = createSvelteVitePlugin({ dev: true });
		development.buildStart?.();
		const output = await development.transform?.call(
			{ warn() {} },
			'<view>development</view>',
			'C:/fixture/Development.svelte'
		);
		const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
		development.writeBundle?.();
		expect(output?.code).toContain('virtual:zadmin-svelte-taro-build-id');
		const virtualId = development.resolveId?.('virtual:zadmin-svelte-taro-build-id');
		expect(virtualId).toBe('\0zadmin-svelte-taro-build-id');
		expect(development.load?.(virtualId ?? '')).toMatch(
			/globalThis\.__ZADMIN_BUILD_ID__ = "[a-z0-9-]+"/u
		);
		expect(development.shouldTransformCachedModule?.({ id: virtualId ?? '' })).toBe(true);
		expect(log).toHaveBeenCalledWith(expect.stringMatching(/^\[zadmin-build\] /u));
		log.mockRestore();

		const production = createSvelteVitePlugin({ dev: false });
		production.buildStart?.();
		const productionOutput = await production.transform?.call(
			{ warn() {} },
			'<view>production</view>',
			'C:/fixture/Production.svelte'
		);
		expect(productionOutput?.code).not.toContain('zadmin-svelte-taro-build-id');
	});

	it('ignores non-Svelte modules and surfaces unsupported renderer syntax', async () => {
		const plugin = createSvelteVitePlugin();
		expect(
			await plugin.transform?.call({ warn() {} }, 'export const value = 1', 'plain.ts')
		).toBeUndefined();
		for (const loader of ['entry-loader', 'page-loader']) {
			expect(
				await plugin.transform?.call(
					{ warn() {} },
					'export default function generatedByTaro() {}',
					`\0C:/fixture/App.svelte?${loader}=true`
				)
			).toBeUndefined();
		}
		await expect(
			plugin.transform?.call(
				{ warn() {} },
				'<svelte:window onkeydown={() => undefined} />',
				'C:/fixture/Unsupported.svelte'
			)
		).rejects.toThrow(/not supported|lifecycle/i);
	});

	it('collects typed native elements and rejects accidental browser tags', async () => {
		const plugin = createSvelteVitePlugin();
		const filename = 'C:/fixture/Native.svelte';
		const result = await plugin.transform?.call(
			{ warn() {} },
			'<view><camera></camera><live-player></live-player><web-view></web-view></view>',
			filename
		);
		expect(result?.code).toContain(JSON.stringify(componentMarkerId(filename)));
		const marker = plugin.load?.(componentMarkerId(filename));
		expect(marker).toContain('createElement("camera"');
		expect(marker).toContain('createElement("live-player"');
		expect(marker).toContain('createElement("web-view"');
		await expect(
			plugin.transform?.call(
				{ warn() {} },
				'<div>Browser DOM is invalid here.</div>',
				'C:/fixture/Browser.svelte'
			)
		).rejects.toThrow(/Unsupported Mini Program native element "div"/u);
	});

	it.each([
		[
			'regular binding',
			'<script>let value = $state(0)</script><input bind:value />',
			/component-level \$bindable/u
		],
		[
			'transition',
			'<script>import { fade } from "svelte/transition"</script><view transition:fade></view>',
			/Mini Program animation/u
		],
		[
			'browser global',
			'<svelte:window onkeydown={() => undefined} />',
			/platform or App\/Page lifecycle/u
		],
		[
			'dynamic element',
			'<script>let tag = "view"</script><svelte:element this={tag} />',
			/statically enumerable/u
		],
		['raw HTML', '<script>let html = "<b>x</b>"</script>{@html html}', /arbitrary HTML/u],
		[
			'raw snippet',
			'<script>import { createRawSnippet } from "svelte"; const raw = createRawSnippet(() => ({ render: () => "x" }))</script>',
			/declarative snippet/u
		],
		[
			'boundary fallback snippet',
			'<svelte:boundary>{#snippet failed(error)}<text>{error}</text>{/snippet}</svelte:boundary>',
			/onerror/u
		]
	])('reports a stable diagnostic for unsupported %s', async (_name, source, suggestion) => {
		const plugin = createSvelteVitePlugin();
		const error = await plugin.transform
			?.call({ warn() {} }, source, 'C:/fixture/Unsupported.svelte')
			.catch((reason: unknown) => reason);
		expect(error).toMatchObject({
			code: 'svelte_taro_unsupported',
			column: expect.any(Number),
			filename: 'C:/fixture/Unsupported.svelte',
			line: expect.any(Number)
		});
		expect((error as Error).message).toMatch(suggestion);
	});
});
