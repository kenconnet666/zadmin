import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [manifest, project, privateExample, appConfig, pageConfig] = await Promise.all([
	readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
	readFile(new URL('../project.config.json', import.meta.url), 'utf8').then(JSON.parse),
	readFile(new URL('../project.private.config.example.json', import.meta.url), 'utf8').then(
		JSON.parse
	),
	readFile(new URL('../src/app.config.ts', import.meta.url), 'utf8'),
	readFile(new URL('../src/pages/index/index.config.ts', import.meta.url), 'utf8')
]);

test('uses the direct self-contained WeChat target', () => {
	assert.match(manifest.scripts.build, /miniapp\/dist\/cli\.js build/u);
	assert.doesNotMatch(JSON.stringify(manifest), /@tarojs/u);
	assert.equal(project.miniprogramRoot, 'dist/wechat/');
	assert.equal(privateExample.setting.compileHotReLoad, false);
	assert.equal(privateExample.setting.skylineRenderEnable, false);
	assert.match(appConfig, /MiniappAppConfig/u);
	assert.doesNotMatch(appConfig, /rendererOptions/u);
	assert.match(appConfig, /workers:\s*'workers'/u);
	assert.match(pageConfig, /renderer:\s*'webview'/u);
});
