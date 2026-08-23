import { describe, expect, it } from 'vitest';

import {
	createIcssRuntime,
	createServerStyleRegistry,
	defaultTheme,
	icss,
	StyleRegistry,
	type IcssStyle
} from '../src/lib/index.js';
import { createIcssSlot } from '../src/lib/icss/values.js';

describe('ICSS runtime', () => {
	it('creates a deterministic class and prefixed nested CSS', () => {
		const registry = createServerStyleRegistry();
		const runtime = createIcssRuntime({ registry });
		const factory = (style: IcssStyle<typeof defaultTheme>) => {
			style.display.flex;
			style.userSelect.none;
			style._hover((hover) => hover.color._primaryHover);
		};

		const first = runtime.icss(defaultTheme, factory);
		const second = runtime.icss(defaultTheme, factory);

		expect(first).toBe(second);
		expect(registry.size).toBe(1);
		expect(registry.cssText()).toContain(`.${first}{`);
		expect(registry.cssText()).toContain('display:-webkit-box');
		expect(registry.cssText()).toContain(`.${first}:hover{color:#1d4ed8;}`);
	});

	it('serializes dynamic slots without including their current values', () => {
		const registry = createServerStyleRegistry();
		const runtime = createIcssRuntime({ registry });
		const width = createIcssSlot('--panel-width-a1b2c3-0');
		const opacity = createIcssSlot('--opacity-a1b2c3-1');

		const className = runtime.icss(defaultTheme, (style) => {
			(style.width.px as (...values: unknown[]) => void)(width);
			(style.opacity as (value: unknown) => void)(opacity);
		});

		expect(registry.cssText()).toContain(
			`.${className}{width:calc(var(--panel-width-a1b2c3-0) * 1px);opacity:var(--opacity-a1b2c3-1);}`
		);
	});

	it('emits hydratable and nonce-aware SSR style tags', () => {
		const registry = createServerStyleRegistry();
		createIcssRuntime({ registry }).icss(defaultTheme, (style) => style.padding._medium);

		const tag = registry.styleTag({ nonce: 'safe-value' });
		expect(tag).toMatch(/^<style data-icss="c-[a-z0-9]+" nonce="safe-value">/);
		expect(tag).toContain('padding:8px');
	});

	it('fails deterministically instead of hiding hash collisions', () => {
		const registry = new StyleRegistry({ hash: () => 'collision' });
		const runtime = createIcssRuntime({ registry });
		runtime.icss(defaultTheme, (style) => style.color._primary);

		expect(() => runtime.icss(defaultTheme, (style) => style.color._danger)).toThrow(
			/hash collision/
		);
	});

	it('keeps the ordinary TypeScript API class-only', () => {
		expect(typeof icss(defaultTheme, (style) => style.display.block)).toBe('string');
	});

	it('does not register empty style programs', () => {
		const registry = createServerStyleRegistry();
		const className = createIcssRuntime({ registry }).icss(defaultTheme, () => undefined);

		expect(className).toBe('');
		expect(registry.size).toBe(0);
		expect(registry.styleTag()).toBe('');
	});

	it('releases HMR-owned rules without removing shared or persistent styles', () => {
		const registry = createServerStyleRegistry();
		const runtime = createIcssRuntime({ registry });
		const factory = (style: IcssStyle<typeof defaultTheme>) => style.color._primary;

		runtime.ownedIcss('module-a', defaultTheme, factory);
		runtime.ownedIcss('module-b', defaultTheme, factory);
		expect(registry.size).toBe(1);
		registry.releaseOwner('module-a');
		expect(registry.size).toBe(1);
		registry.releaseOwner('module-b');
		expect(registry.size).toBe(0);

		runtime.icss(defaultTheme, factory);
		runtime.ownedIcss('module-c', defaultTheme, factory);
		registry.releaseOwner('module-c');
		expect(registry.size).toBe(1);
	});

	it('bounds structural variants per compiler callsite', () => {
		const registry = createServerStyleRegistry({ maxVariantsPerOwner: 2 });
		const runtime = createIcssRuntime({ registry });
		const themed = (color: string) => ({
			...defaultTheme,
			color: { ...defaultTheme.color, primary: color }
		});

		runtime.ownedIcss('module:callsite', themed('#000001'), (style) => style.color._primary);
		runtime.ownedIcss('module:callsite', themed('#000002'), (style) => style.color._primary);
		expect(() =>
			runtime.ownedIcss('module:callsite', themed('#000003'), (style) => style.color._primary)
		).toThrow(/exceeded 2 structural variants/);
	});
});
