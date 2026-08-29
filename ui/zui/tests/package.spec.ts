import { describe, expect, it } from 'vitest';

import { ZUI_PACKAGE_NAME } from '../src/lib/index.js';
import {
	boxMetadata,
	buttonMetadata,
	codeMetadata,
	fieldMetadata,
	iconMetadata,
	inputMetadata,
	providerMetadata,
	stackMetadata,
	textMetadata
} from '../src/lib/metadata.js';

describe('@zadmin/zui package', () => {
	it('keeps a stable public package name', () => {
		expect(ZUI_PACKAGE_NAME).toBe('@zadmin/zui');
	});

	it('keeps component metadata unique and colocated with public source files', () => {
		const metadata = [
			providerMetadata,
			boxMetadata,
			stackMetadata,
			textMetadata,
			iconMetadata,
			codeMetadata,
			buttonMetadata,
			inputMetadata,
			fieldMetadata
		];
		expect(new Set(metadata.map(({ id }) => id)).size).toBe(metadata.length);
		expect(metadata.every(({ name }) => name.startsWith('Z'))).toBe(true);
		expect(metadata.every(({ name, source }) => source.endsWith(`/${name}.svelte`))).toBe(true);
	});
});
