import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AvatarSsrFixture from './AvatarSsrFixture.svelte';

describe('ZAvatar production SSR contract', () => {
	it('renders native image attributes and stable decorative/named fallbacks without DOM globals', () => {
		const result = render(AvatarSsrFixture).body;
		expect(result).toContain('data-testid="avatar-ssr-fallback"');
		expect(result).toContain('role="img"');
		expect(result).toContain('aria-label="Server fallback"');
		expect(result).toContain('data-testid="avatar-ssr-decorative"');
		expect(result).toContain('aria-hidden="true"');
		expect(result).toContain('loading="lazy"');
		expect(result).toContain('decoding="async"');
		expect(result).toContain('crossorigin="anonymous"');
		expect(result).toContain('referrerpolicy="no-referrer"');
		expect(result).toContain('sizes="48px"');
		expect(result).toContain('srcset="/avatar.png 1x, /avatar@2x.png 2x"');
		expect(result).toContain('draggable="false"');
	});
});
