import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceRoot = process.argv[2];
if (sourceRoot === undefined) {
	throw new Error('Usage: pnpm setup:local -- <authorized WeChat project directory>');
}

async function readJson(path, optional = false) {
	try {
		return JSON.parse(await readFile(path, 'utf8'));
	} catch (error) {
		if (optional && error?.code === 'ENOENT') return {};
		throw error;
	}
}

const sourcePublic = await readJson(resolve(sourceRoot, 'project.config.json'));
const sourcePrivate = await readJson(resolve(sourceRoot, 'project.private.config.json'), true);
if (typeof sourcePublic.appid !== 'string' || sourcePublic.appid === 'touristappid') {
	throw new Error('The source project does not contain an authorized non-tourist AppID.');
}

const target = {
	appid: sourcePublic.appid,
	libVersion: sourcePrivate.libVersion ?? sourcePublic.libVersion ?? '3.17.1',
	projectname: 'zadmin-wechat-local',
	setting: {
		...(sourcePrivate.setting ?? {}),
		compileHotReLoad: false,
		skylineRenderEnable: false
	}
};

await writeFile(
	new URL('../project.private.config.json', import.meta.url),
	`${JSON.stringify(target, null, '\t')}\n`,
	'utf8'
);
console.log('Local WeChat project settings synchronized without printing the AppID.');
