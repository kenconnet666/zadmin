import { compile, preprocess } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';

import { icssPreprocess, type IcssCompilerDiagnostic } from '../src/lib/compiler/preprocess.js';

async function transform(
	source: string,
	diagnostics: IcssCompilerDiagnostic[] = []
): Promise<string> {
	const result = await preprocess(
		source,
		icssPreprocess({
			onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
			root: 'C:/project'
		}),
		{ filename: 'C:/project/src/Sample.svelte' }
	);
	return result.code;
}

describe('ICSS Svelte preprocessor', () => {
	it('lifts direct identifier values from a local derived class', async () => {
		const output = await transform(`<script lang="ts">
			import { defaultTheme, icss } from '@zadmin/zui';
			let width = $state(320);
			const panelClass = $derived(icss(defaultTheme, (style) => {
				style.width.px(width);
				style.padding.px(16);
			}));
		</script>
		<div class={panelClass}></div>`);

		expect(output).toContain("import { __icssSlot as __zuiIcssSlot } from '@zadmin/zui/internal'");
		expect(output).toMatch(/style\.width\.px\(__zuiIcssSlot\('--width-[a-z0-9]+-0'\)\)/u);
		expect(output).toMatch(/style:--width-[a-z0-9]+-0=\{width\}/u);
		expect(output).toContain('style.padding.px(16)');
		expect(() => compile(output, { generate: 'client', runes: true })).not.toThrow();
	});

	it('supports direct class calls and anonymous complex expressions', async () => {
		const output = await transform(`<script>
			import { defaultTheme, icss as css } from '@zadmin/zui';
			let width = $state(20);
			let zoom = $state(2);
		</script>
		<div class={css(defaultTheme, (s) => s.width.px(width * zoom))}></div>`);

		expect(output).toMatch(/s\.width\.px\(__zuiIcssSlot\('--[a-z0-9]+-0'\)\)/u);
		expect(output).toMatch(/style:--[a-z0-9]+-0=\{width \* zoom\}/u);
	});

	it('preserves if guards around nullable expressions', async () => {
		const output = await transform(`<script lang="ts">
			import { defaultTheme, icss } from '@zadmin/zui';
			let item = $state<{ width: number } | undefined>();
			const panel = $derived(icss(defaultTheme, (s) => {
				if (item) s.width.px(item.width);
			}));
		</script>
		<div class={panel}></div>`);

		expect(output).toMatch(/style:--[a-z0-9]+-0=\{\(item\) \? \(item\.width\) : undefined\}/u);
		expect(() => compile(output, { generate: 'server', runes: true })).not.toThrow();
	});

	it('lifts nested selector values and class arrays', async () => {
		const output = await transform(`<script>
			import { defaultTheme, icss } from '@zadmin/zui';
			let opacity = $state(0.5);
			const panel = $derived(icss(defaultTheme, (s) => {
				s._hover((hover) => hover.opacity(opacity));
			}));
		</script>
		<div class={['base', panel]}></div>`);

		expect(output).toMatch(/hover\.opacity\(__zuiIcssSlot\('--opacity-[a-z0-9]+-0'\)\)/u);
		expect(output).toMatch(/style:--opacity-[a-z0-9]+-0=\{opacity\}/u);
	});

	it('falls back when a value depends on a factory-local binding', async () => {
		const diagnostics: IcssCompilerDiagnostic[] = [];
		const source = `<script>
			import { defaultTheme, icss } from '@zadmin/zui';
			let width = $state(20);
			const panel = $derived(icss(defaultTheme, (s) => {
				const doubled = width * 2;
				s.width.px(doubled);
			}));
		</script>
		<div class={panel}></div>`;
		const output = await transform(source, diagnostics);

		expect(output).toBe(source);
		expect(diagnostics).toContainEqual(expect.objectContaining({ code: 'factory-local-value' }));
	});

	it('uses runtime fallback at unknown component boundaries', async () => {
		const diagnostics: IcssCompilerDiagnostic[] = [];
		const source = `<script>
			import Button from './Button.svelte';
			import { defaultTheme, icss } from '@zadmin/zui';
			let width = $state(20);
			const panel = $derived(icss(defaultTheme, (s) => s.width.px(width)));
		</script>
		<Button class={panel} />`;
		const output = await transform(source, diagnostics);

		expect(output).toBe(source);
		expect(diagnostics).toContainEqual(expect.objectContaining({ code: 'component-boundary' }));
	});

	it('can disable inline variables for strict CSP', async () => {
		const source = `<script>import { icss } from '@zadmin/zui';</script><div class={icss(theme, s => s.width.px(width))}></div>`;
		const result = await preprocess(source, icssPreprocess({ dynamicValues: 'class-rules' }));

		expect(result.code).toBe(source);
	});
});
