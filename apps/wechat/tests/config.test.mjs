import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const projectConfig = JSON.parse(
	await readFile(new URL('../project.config.json', import.meta.url), 'utf8')
);
const appConfig = await readFile(new URL('../src/app.config.ts', import.meta.url), 'utf8');
const taroConfig = await readFile(new URL('../config/index.ts', import.meta.url), 'utf8');
const supervisor = await readFile(new URL('../config/supervisor.mjs', import.meta.url), 'utf8');

test('keeps a private Svelte-only Taro host', () => {
	assert.equal(packageJson.private, true);
	assert.equal(packageJson.dependencies.react, undefined);
	assert.equal(packageJson.dependencies.vue, undefined);
	assert.match(packageJson.scripts.build, /--no-check/u);
	assert.match(packageJson.scripts.build, /verify-build\.mjs/u);
	assert.match(packageJson.scripts.prebuild, /pnpm clean/u);
	assert.equal(projectConfig.compileType, 'miniprogram');
	assert.equal(projectConfig.miniprogramRoot, 'dist/');
});

test('declares and copies the bounded safe-probe worker', () => {
	assert.match(appConfig, /workers:\s*'workers'/u);
	assert.match(taroConfig, /from:\s*'src\/workers'/u);
	assert.match(taroConfig, /to:\s*'dist\/workers'/u);
	assert.match(supervisor, /'--no-check'/u);
});
