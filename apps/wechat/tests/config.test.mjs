import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const projectConfig = JSON.parse(
	await readFile(new URL('../project.config.json', import.meta.url), 'utf8')
);

test('keeps a private Svelte-only Taro host', () => {
	assert.equal(packageJson.private, true);
	assert.equal(packageJson.dependencies.react, undefined);
	assert.equal(packageJson.dependencies.vue, undefined);
	assert.equal(projectConfig.compileType, 'miniprogram');
	assert.equal(projectConfig.miniprogramRoot, 'dist/');
});
