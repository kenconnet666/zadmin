import { describe, expect, it } from 'vitest';

import { matchesCommandShortcut, scoreCommand } from '../src/runtime/command.js';

describe('command algorithms', () => {
	it('ranks exact, prefix, word, contains, keyword and subsequence matches', () => {
		expect(scoreCommand({ label: 'Deploy' }, 'deploy')).toBe(100);
		expect(scoreCommand({ label: 'Deploy preview' }, 'dep')).toBeGreaterThan(60);
		expect(scoreCommand({ label: 'Open deploy preview' }, 'deploy')).toBeGreaterThan(40);
		expect(scoreCommand({ label: 'Preview deployment' }, 'view')).toBeGreaterThan(20);
		expect(scoreCommand({ keywords: ['release'], label: 'Create build' }, 'release')).toBe(80);
		expect(scoreCommand({ label: 'Command palette' }, 'cmd')).toBeGreaterThan(0);
		expect(scoreCommand({ label: 'Open docs' }, 'missing')).toBeUndefined();
	});

	it('matches explicit and platform-aware modifier shortcuts', () => {
		const event = { altKey: false, ctrlKey: true, key: 'K', metaKey: false, shiftKey: false };
		expect(matchesCommandShortcut(event, { key: 'k', modKey: true }, 'Win32')).toBe(true);
		expect(matchesCommandShortcut(event, { key: 'k', modKey: true }, 'MacIntel')).toBe(false);
		expect(
			matchesCommandShortcut(
				{ ...event, ctrlKey: false, metaKey: true, shiftKey: true },
				{ key: 'k', modKey: true, shiftKey: true },
				'MacIntel'
			)
		).toBe(true);
	});
});
