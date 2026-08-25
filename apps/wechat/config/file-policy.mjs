import { relative, resolve, sep } from 'node:path';

/** @param {string} path */
function portable(path) {
	return path.split(sep).join('/').replace(/^\.\//u, '');
}

/**
 * @param {string} workspaceRoot
 * @param {string} path
 */
export function workspacePath(workspaceRoot, path) {
	return portable(relative(resolve(workspaceRoot), resolve(path)));
}

/**
 * @param {string} path
 * @param {{ external?: boolean }} [options]
 * @returns {'dependencies-changed' | 'ignore' | 'incremental' | 'package-incremental' | 'restart-taro'}
 */
export function classifyChange(path, options = {}) {
	const normalized = portable(path);
	if (
		normalized === 'pnpm-lock.yaml' ||
		normalized === 'pnpm-workspace.yaml' ||
		normalized.endsWith('/package.json') ||
		(options.external === true && normalized === 'package.json')
	) {
		return 'dependencies-changed';
	}
	if (
		/^ui\/svelte-taro\/src\/(?:compiler|plugin|vite)\//u.test(normalized) ||
		/^apps\/wechat\/src\/workers\//u.test(normalized) ||
		normalized === 'apps/wechat/src/app.config.ts' ||
		normalized === 'apps/wechat/config/index.ts'
	) {
		return 'restart-taro';
	}
	if (/^ui\/svelte-taro\/src\/(?:module|native|platform|renderer|runtime)\//u.test(normalized)) {
		return 'package-incremental';
	}
	if (
		/^ui\/zui-taro\/src\//u.test(normalized) ||
		/^apps\/wechat\/src\//u.test(normalized) ||
		options.external === true
	) {
		return 'incremental';
	}
	return 'ignore';
}
