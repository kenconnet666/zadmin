import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import ZScrollArea from '../src/components/layout/ZScrollArea.svelte';

it('renders native scroll ownership during SSR without a DOM measurement path', () => {
	const html = render(ZScrollArea, { props: { 'aria-label': 'Activity log', height: 120 } }).body;
	expect(html).toContain('aria-label="Activity log"');
	expect(html).toContain('role="region"');
	expect(html).toContain('tabindex="0"');
	expect(html).toContain('data-axis="y"');
	expect(html).not.toContain('role="scrollbar"');
});

it('rejects invalid configuration at the same SSR boundary', () => {
	expect(() => render(ZScrollArea, { props: { axis: 'diagonal' as never } }).body).toThrow(
		'Invalid ScrollArea axis'
	);
	expect(() => render(ZScrollArea, { props: { height: -1 } }).body).toThrow('height');
});
