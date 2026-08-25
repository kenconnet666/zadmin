import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyChange } from '../config/file-policy.mjs';

test('classifies source changes into incremental, restart, and dependency boundaries', () => {
	assert.equal(classifyChange('apps/wechat/src/pages/index/index.svelte'), 'incremental');
	assert.equal(classifyChange('apps/wechat/src/workers/safe-probe.js'), 'restart-taro');
	assert.equal(classifyChange('ui/zui-taro/src/components/Button.svelte'), 'incremental');
	assert.equal(classifyChange('packages/zui-taro/src/components/Button.svelte'), 'ignore');
	assert.equal(classifyChange('ui/svelte-taro/src/platform/service.ts'), 'package-incremental');
	assert.equal(classifyChange('ui/svelte-taro/src/compiler/index.ts'), 'restart-taro');
	assert.equal(classifyChange('apps/wechat/src/app.config.ts'), 'restart-taro');
	assert.equal(classifyChange('ui/zui-taro/package.json'), 'dependencies-changed');
	assert.equal(classifyChange('pnpm-lock.yaml'), 'dependencies-changed');
	assert.equal(classifyChange('src/taro/index.ts', { external: true }), 'incremental');
	assert.equal(classifyChange('README.md'), 'ignore');
});
