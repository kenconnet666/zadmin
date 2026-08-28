import { preprocess } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';

import { icssPreprocess, type IcssCompilerDiagnostic } from '../src/lib/compiler/preprocess.js';

async function compileSource(
	source: string,
	diagnostics: IcssCompilerDiagnostic[] = [],
	filename = 'C:/project/src/Edge.svelte'
): Promise<string> {
	return (
		await preprocess(
			source,
			icssPreprocess({
				onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
				root: 'C:/project'
			}),
			{ filename }
		)
	).code;
}

describe('ICSS compiler edge behavior', () => {
	it('ignores files without a matching value import', async () => {
		const source = `<script>import * as zui from '@zadmin/zui'; const value = zui.icss(theme, s => s.color('red'));</script><div class={value}></div>`;
		expect(await compileSource(source)).toBe(source);
	});

	it('diagnoses non-inline and invalid factory parameters', async () => {
		const diagnostics: IcssCompilerDiagnostic[] = [];
		const source = `<script>
			import { icss } from '@zadmin/zui';
			const factory = s => s.width.px(width);
			const first = icss(theme, factory);
			const second = icss(theme, ({ width }) => width);
		</script><div class={[first, second]}></div>`;
		expect(await compileSource(source, diagnostics)).toBe(source);
		expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
			'invalid-factory',
			'invalid-factory'
		]);
	});

	it('preserves if, else, logical and ternary guards', async () => {
		const output = await compileSource(`<script>
			import { icss } from '@zadmin/zui';
			let active = $state(true), width = $state(10), height = $state(20);
			const value = $derived(icss(theme, s => {
				if (active) s.width.px(width); else s.height.px(height);
				active && s.minWidth.px(width);
				active || s.maxWidth.px(width);
				active ? s.minHeight.px(height) : s.maxHeight.px(height);
			}));
		</script><div class={value}></div>`);

		expect(output).toContain('(active) ? (width) : undefined');
		expect(output).toContain('!(active) ? (height) : undefined');
		expect(output).toContain('!(active) ? (width) : undefined');
		expect(output.match(/style:--/gu)).toHaveLength(6);
	});

	it('keeps loops and switch values on runtime class rules', async () => {
		const diagnostics: IcssCompilerDiagnostic[] = [];
		const output = await compileSource(
			`<script>
				import { icss } from '@zadmin/zui';
				let values = $state([1]), mode = $state('a'), width = $state(2);
				const value = $derived(icss(theme, s => {
					for (const item of values) s.width.px(item);
					switch (mode) { case 'a': s.height.px(width); }
				}));
			</script><div class={value}></div>`,
			diagnostics
		);

		expect(output).not.toContain('style:--');
		expect(output).toContain('__zuiIcssOwned');
		expect(
			diagnostics.filter((diagnostic) => diagnostic.code === 'unsupported-control-flow')
		).toHaveLength(2);
	});

	it('lifts low-level set and raw calls', async () => {
		const output = await compileSource(`<script>
			import { icss } from '@zadmin/zui';
			let width = $state('10rem'), height = $state('20rem');
			const value = $derived(icss(theme, s => {
				s.set('width', width);
				s.height.raw(height);
			}));
		</script><div class={value}></div>`);

		expect(output).toMatch(/\.set\('width', __zuiIcssSlot/u);
		expect(output).toMatch(/\.raw\(__zuiIcssSlot/u);
		expect(output.match(/style:--/gu)).toHaveLength(2);
	});

	it('does not lift static template, unary and undefined values', async () => {
		const output = await compileSource(`<script>
			import { icss } from '@zadmin/zui';
			const value = icss(theme, s => {
				s.width.px(-1);
				s.content(\`fixed\`);
				s.opacity(undefined);
			});
		</script><div class={value}></div>`);

		expect(output).not.toContain('__zuiIcssSlot(');
		expect(output).toContain('__zuiIcssOwned');
	});

	it('uses an existing module script and collision-free helper aliases', async () => {
		const output = await compileSource(`<script module>const marker = true;</script>
		<script>
			import { icss } from '@zadmin/zui';
			let __zuiIcssSlot = 1, width = $state(2);
			const value = $derived(icss(theme, s => s.width.px(width)));
		</script><div class={value}></div>`);

		expect(output.match(/<script module>/gu)).toHaveLength(1);
		expect(output).toContain('__icssSlot as __zuiIcssSlot1');
		expect(output).toContain('const marker = true');
	});

	it('recognizes aliased ZUI components but not unknown imports', async () => {
		const output = await compileSource(`<script>
			import Unknown from './Unknown.svelte';
			import { ZBox as Panel, icss } from '@zadmin/zui';
			let width = $state(2);
			const value = $derived(icss(theme, s => s.width.px(width)));
		</script><Panel class={value}></Panel><Unknown class="external"></Unknown>`);

		expect(output).toContain('__zuiIcssCarrier({');
	});

	it('uses anonymous module IDs when no filename is available', async () => {
		const source = `<script>import { icss } from '@zadmin/zui'; let width=$state(1); const value=$derived(icss(theme,s=>s.width.px(width)));</script><div class={value}></div>`;
		const output = (await preprocess(source, icssPreprocess({ root: 'C:/project' }))).code;

		expect(output).toContain("__zuiIcssOwned('m-");
	});

	it('recognizes factory-local destructuring patterns without confusing object keys', async () => {
		const diagnostics: IcssCompilerDiagnostic[] = [];
		const output = await compileSource(
			`<script>
				import { icss } from '@zadmin/zui';
				let width = $state(2);
				const value = $derived(icss(theme, s => {
					const [first = width, ...rest] = [width];
					const { local: alias, ...others } = { local: first };
					s.width.px(alias);
					s.transform({ local: width });
					s.translate({ first });
				}));
			</script><div class={value}></div>`,
			diagnostics
		);

		expect(
			diagnostics.filter((diagnostic) => diagnostic.code === 'factory-local-value')
		).toHaveLength(2);
		expect(output).toContain("'--");
		expect(output).toContain('style:--');
	});

	it('applies one compiled binding to every local element use', async () => {
		const output = await compileSource(`<script>
			import { icss } from '@zadmin/zui';
			let width = $state(2);
			const value = $derived(icss(theme, s => s.width.px(width)));
		</script><div class={value}></div><section class={['base', value]}></section>`);

		expect(output.match(/style:--width-/gu)).toHaveLength(2);
		expect(output.match(/__zuiIcssOwned\(/gu)).toHaveLength(1);
	});

	it('leaves computed, spread and unknown carrier calls on runtime fallback', async () => {
		const output = await compileSource(`<script>
			import { icss } from '@zadmin/zui';
			let width = $state(2), values = $state([1, 2]);
			const value = $derived(icss(theme, s => {
				s['width'](width);
				s.transform(...values);
				s.width.unknown(width);
			}));
		</script><div class={value}></div>`);

		expect(output).not.toContain('style:--');
		expect(output).toContain('__zuiIcssOwned');
	});

	it('diagnoses an invalid direct class factory and ignores member property references', async () => {
		const diagnostics: IcssCompilerDiagnostic[] = [];
		const source = `<script>
			import { icss } from '@zadmin/zui';
			const factory = s => s.width.px(width);
			const value = icss(theme, s => s.height.px(height));
			const holder = { value };
		</script><div class={icss(theme, factory)}></div><section class={holder.value}></section>`;
		const output = await compileSource(source, diagnostics);

		expect(output).toBe(source);
		expect(diagnostics).toContainEqual(expect.objectContaining({ code: 'invalid-factory' }));
	});

	it('supports function factories and deeply nested builder callbacks', async () => {
		const output = await compileSource(`<script>
			import { icss } from '@zadmin/zui';
			let opacity = $state(0.5);
			const value = $derived(icss(theme, function (s) {
				s._hover(h => h._focus(f => f.opacity(opacity)));
			}));
		</script><div class={value}></div>`);

		expect(output).toMatch(/f\.opacity\(__zuiIcssSlot/u);
		expect(output).toContain('style:--opacity-');
	});

	it('handles missing set values and non-arrow nested callbacks conservatively', async () => {
		const output = await compileSource(`<script>
			import { icss } from '@zadmin/zui';
			let width = $state(2);
			const value = $derived(icss(theme, s => {
				s.set('width');
				s._hover(function (hover) { hover.width.px(width); });
			}));
		</script><div class={value}></div>`);

		expect(output).not.toContain('style:--');
		expect(output).toContain('__zuiIcssOwned');
	});

	it('lifts descendant selector values but falls back for sibling selectors', async () => {
		const diagnostics: IcssCompilerDiagnostic[] = [];
		const output = await compileSource(
			`<script>
				import { icss } from '@zadmin/zui';
				let color = $state('red'), width = $state(2);
				const value = $derived(icss(theme, s => {
					s._selector('& > span', child => child.color(color));
					s._selector('& + .sibling', sibling => sibling.width.px(width));
				}));
			</script><div class={value}><span></span></div>`,
			diagnostics
		);

		expect(output).toContain('style:--color-');
		expect(output).not.toContain('style:--width-');
		expect(diagnostics).toContainEqual(
			expect.objectContaining({ code: 'unsupported-selector-scope' })
		);
	});
});
