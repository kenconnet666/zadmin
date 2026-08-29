import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [manifest, project, appConfig] = await Promise.all([
	readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
	readFile(new URL('../project.config.json', import.meta.url), 'utf8').then(JSON.parse),
	readFile(new URL('../src/app.config.ts', import.meta.url), 'utf8')
]);

test('uses the direct self-contained WeChat target', () => {
	assert.match(manifest.scripts.build, /miniapp build/u);
	assert.doesNotMatch(JSON.stringify(manifest), /@tarojs/u);
	assert.equal(project.miniprogramRoot, 'dist/wechat/');
	assert.match(appConfig, /MiniappAppConfig/u);
	assert.match(appConfig, /workers:\s*'workers'/u);
});
