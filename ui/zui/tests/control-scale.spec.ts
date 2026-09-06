import { describe, expect, it } from 'vitest';
import { defaultTheme, extendTheme } from '../src/entrypoints/theme.js';
import {
	controlSizeMetrics,
	controlSizes,
	resolveControlSize
} from '../src/runtime/foundation/control-size.js';
import { resolveComponentDefaults } from '../src/runtime/foundation/component-defaults.js';

describe('five-step control scale', () => {
	it('resolves explicit sizes independently of density and shares Provider defaults', () => {
		for (const size of controlSizes) {
			for (const density of ['compact', 'comfortable', 'spacious'] as const) {
				expect(resolveControlSize(size, density)).toBe(size);
			}
			expect(
				resolveComponentDefaults(undefined, {
					button: { size, tone: 'info', variant: 'outline' },
					input: { size },
					tag: { size, tone: 'neutral' },
					pagination: { size }
				})
			).toMatchObject({ button: { size }, input: { size }, tag: { size }, pagination: { size } });
		}
		expect(resolveControlSize(undefined, 'compact')).toBe('small');
		expect(resolveControlSize(undefined, 'comfortable')).toBe('medium');
		expect(resolveControlSize(undefined, 'spacious')).toBe('large');
	});

	it('keeps border-adjusted control content and indicator lengths valid for CSS-based themes', () => {
		const theme = extendTheme(defaultTheme, {
			size: { xlarge: 'var(--control-height)' },
			borderWidth: { hairline: '0.0625rem' },
			fontSize: { large: '1rem' },
			indicatorSize: { xlarge: '1.5rem' },
			space: { xlarge: 'calc(1rem + 4px)' }
		});
		expect(controlSizeMetrics(theme, 'xlarge')).toEqual({
			height: 'var(--control-height)',
			contentHeight: 'calc(var(--control-height) - 0.0625rem - 0.0625rem)',
			fontSize: '1rem',
			paddingInline: 'calc(1rem + 4px)',
			indicatorSize: '1.5rem'
		});
	});
});
