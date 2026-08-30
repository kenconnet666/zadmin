import { describe, expect, it } from 'vitest';

import { fileIdentity, matchesFileAccept, validateFileQueue } from '../src/runtime/file.js';

const file = (name: string, type: string, size = 4, lastModified = 1) => ({
	lastModified,
	name,
	size,
	type
});

describe('file queue algorithms', () => {
	it('matches extensions, exact MIME types and wildcard MIME families', () => {
		expect(matchesFileAccept(file('a.JSON', 'application/json'), '.json')).toBe(true);
		expect(matchesFileAccept(file('photo.bin', 'image/png'), 'image/*')).toBe(true);
		expect(matchesFileAccept(file('data.bin', 'application/json'), 'application/json')).toBe(true);
		expect(matchesFileAccept(file('data.txt', 'text/plain'), '.json,image/*')).toBe(false);
		expect(matchesFileAccept(file('data.txt', 'text/plain'))).toBe(true);
	});

	it('accepts a stable queue and reports precise rejection reasons', () => {
		const first = file('a.json', 'application/json');
		const duplicate = file('a.json', 'application/json');
		const oversized = file('b.json', 'application/json', 20);
		const wrongType = file('c.txt', 'text/plain');
		const extra = file('d.json', 'application/json');
		const result = validateFileQueue([first], [duplicate, oversized, wrongType, extra], {
			accept: 'application/json',
			maxFiles: 1,
			maxSize: 8,
			multiple: true
		});
		expect(result.accepted).toEqual([first]);
		expect(result.rejected.map(({ reason }) => reason)).toEqual([
			'duplicate',
			'size',
			'type',
			'max-files'
		]);
		expect(fileIdentity(first)).toContain('a.json');
	});
});
