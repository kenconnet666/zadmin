import { readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { buildMiniapp } from '../src/compiler/build.ts';

const projectRoot = resolve(import.meta.dirname, 'direct');
const outputRoot = resolve(projectRoot, 'dist-test');

afterEach(async () => {
	await rm(outputRoot, { force: true, recursive: true });
});

describe('direct WeChat target', () => {
	it('emits JS, JSON, WXML and WXSS without Taro', async () => {
		const result = await buildMiniapp({ outputRoot: 'dist-test', projectRoot, target: 'wechat' });

		expect(result.pages).toEqual(['pages/index/index']);
		expect(result.files).toEqual(
			expect.arrayContaining([
				'app.js',
				'app.json',
				'app.wxss',
				'pages/index/index.js',
				'pages/index/index.json',
				'pages/index/index.wxml',
				'pages/index/index.wxss',
				'templates/runtime.wxml'
			])
		);
		const pageScript = await readFile(resolve(outputRoot, 'pages/index/index.js'), 'utf8');
		const pageTemplate = await readFile(resolve(outputRoot, 'pages/index/index.wxml'), 'utf8');
		const runtimeTemplate = await readFile(resolve(outputRoot, 'templates/runtime.wxml'), 'utf8');
		expect(pageScript).toContain('registerWechatPage');
		expect(pageScript).not.toContain('@tarojs');
		expect(pageTemplate).toContain('template is="zadmin-children"');
		expect(runtimeTemplate).toContain('bindtap="__zadmin_tap"');
	});

	it('rejects outputs outside the project boundary', async () => {
		await expect(
			buildMiniapp({ outputRoot: '../outside', projectRoot, target: 'wechat' })
		).rejects.toThrow(/must stay inside projectRoot/);
	});
});
