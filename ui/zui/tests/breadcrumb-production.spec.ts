import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZBreadcrumb from '../src/components/navigation/ZBreadcrumb.svelte';

const items = [
	{ href: '/workspace', key: 'workspace', label: '工作台' },
	{ href: '/workspace/projects', key: 'projects', label: '项目' },
	{ current: true, key: 'details', label: '交付详情' }
] as const;

describe('ZBreadcrumb server contract', () => {
	it('keeps named native nav, ordered hierarchy, real links, current text and decorative separators', () => {
		const body = render(ZBreadcrumb, { props: { 'aria-label': '当前位置', items } }).body;
		expect(body).toContain('<nav');
		expect(body).toContain('aria-label="当前位置"');
		expect(body).toContain('<ol');
		expect(body.match(/<li/g)).toHaveLength(3);
		expect(body).toContain('href="/workspace"');
		expect(body).toContain('aria-current="page"');
		expect(body.match(/aria-hidden="true"/g)).toHaveLength(2);
	});

	it('rejects ambiguous current ownership before producing markup', () => {
		expect(
			() =>
				render(ZBreadcrumb, {
					props: {
						items: [
							{ current: true, key: 'a', label: 'A' },
							{ current: true, key: 'b', label: 'B' }
						]
					}
				}).body
		).toThrow('at most one current item');
	});

	it('infers the last item as current and retains a genuine current-page URL', () => {
		const body = render(ZBreadcrumb, {
			props: { items: [{ href: '/only', key: 'only', label: 'Only' }] }
		}).body;
		expect(body).toContain('href="/only"');
		expect(body.match(/aria-current="page"/g)).toHaveLength(1);
	});
});
