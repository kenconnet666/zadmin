import { describe, expect, it } from 'vitest';

import { ZUI_PACKAGE_NAME } from '../src/lib/index.js';

describe('@zadmin/zui package', () => {
	it('keeps a stable public package name', () => {
		expect(ZUI_PACKAGE_NAME).toBe('@zadmin/zui');
	});
});
