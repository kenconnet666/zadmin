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

	it('normalizes empty and escaped queries across every keyword ranking tier', () => {
		expect(scoreCommand({ label: 'Anything' }, '   ')).toBe(0);
		expect(scoreCommand({ keywords: ['Release train'], label: 'Build' }, 'rel')).toBe(60);
		expect(scoreCommand({ keywords: ['Release train'], label: 'Build' }, 'train')).toBe(40);
		expect(scoreCommand({ label: 'Open C++ tools' }, 'C++')).toBeGreaterThan(40);
		expect(scoreCommand({ label: 'Command palette' }, 'command palette')).toBe(100);
		expect(scoreCommand({ label: 'Command palette' }, 'cp')).toBeGreaterThan(0);
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

	it('rejects each mismatched shortcut field without masking later modifiers', () => {
		const event = { altKey: true, ctrlKey: true, key: 'K', metaKey: true, shiftKey: true };
		const shortcut = { altKey: true, ctrlKey: true, key: 'k', metaKey: true, shiftKey: true };
		expect(matchesCommandShortcut(event, shortcut, 'Win32')).toBe(true);
		expect(matchesCommandShortcut({ ...event, key: 'P' }, shortcut, 'Win32')).toBe(false);
		expect(matchesCommandShortcut({ ...event, altKey: false }, shortcut, 'Win32')).toBe(false);
		expect(matchesCommandShortcut({ ...event, ctrlKey: false }, shortcut, 'Win32')).toBe(false);
		expect(matchesCommandShortcut({ ...event, metaKey: false }, shortcut, 'Win32')).toBe(false);
		expect(matchesCommandShortcut({ ...event, shiftKey: false }, shortcut, 'Win32')).toBe(false);
		expect(
			matchesCommandShortcut(
				{ altKey: false, ctrlKey: true, key: 'k', metaKey: false, shiftKey: false },
				{ ctrlKey: true, key: 'k' }
			)
		).toBe(true);
	});
});
