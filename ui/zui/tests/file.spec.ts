import { describe, expect, it } from 'vitest';

import {
	createFileUploadItem,
	fileIdentity,
	matchesFileAccept,
	normalizeFileUploadItems,
	normalizeFileUploadProgress,
	validateFileQueue
} from '../src/runtime/file.js';

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

	it('normalizes typed upload states without hiding invalid contracts', () => {
		const browserFile = file('a.json', 'application/json') as File;
		expect(createFileUploadItem('a', browserFile)).toMatchObject({
			id: 'a',
			progress: 0,
			status: 'queued'
		});
		expect(
			createFileUploadItem('complete', browserFile, { progress: 100, status: 'success' })
		).toMatchObject({ progress: 100, status: 'success' });
		expect(normalizeFileUploadProgress(120)).toBe(100);
		expect(normalizeFileUploadProgress(-1)).toBe(0);
		expect(() => normalizeFileUploadProgress(Number.NaN)).toThrow('must be finite');
		expect(() =>
			normalizeFileUploadItems([
				createFileUploadItem('duplicate', browserFile),
				createFileUploadItem('duplicate', browserFile)
			])
		).toThrow('unique ids');
	});
});
