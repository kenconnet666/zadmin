import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const foundationDependencies = [
	'@floating-ui',
	'@internationalized/date',
	'runed',
	'shiki',
	'tabbable'
];

export function packageFromModule(id) {
	const normalized = id.replaceAll('\\', '/');
	const marker = '/node_modules/';
	const index = normalized.lastIndexOf(marker);
	if (index < 0) return null;
	return packageFromImport(normalized.slice(index + marker.length));
}

function packageFromImport(id) {
	if (id.startsWith('.') || id.startsWith('/') || id.startsWith('\0')) return null;
	const parts = id.split('/');
	return id.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function matchesPackage(name, boundary) {
	return name === boundary || name?.startsWith(`${boundary}/`);
}

export function assertBundleBoundary(bundle, owner, { foundation = false } = {}) {
	if (!Array.isArray(bundle.modules) || bundle.modules.length === 0)
		throw new Error(`${owner} is missing bundler module metadata.`);
	const imports = [...bundle.imports, ...bundle.dynamicImports];
	const dependencies = [...new Set(bundle.modules.map(packageFromModule).filter(Boolean))].sort();
	for (const boundary of foundationDependencies) {
		if (imports.some((id) => matchesPackage(packageFromImport(id), boundary)))
			throw new Error(`${owner} leaks an unresolved ${boundary} import.`);
		if (foundation && dependencies.some((name) => matchesPackage(name, boundary)))
			throw new Error(`${owner} foundation bundles ${boundary}.`);
	}
	if (
		[...bundle.modules, ...imports].some((id) =>
			/(?:^|:)node:|\/ui\/zui\/src\/compiler\/|\/svelte\/compiler(?:\/|$)/u.test(
				id.replaceAll('\\', '/')
			)
		)
	)
		throw new Error(`${owner} browser bundle contains compiler/server modules.`);
	return dependencies;
}

function selfTest() {
	const clean = {
		modules: ['/repo/src/runtime.ts'],
		imports: ['svelte/internal/client'],
		dynamicImports: []
	};
	assert.deepEqual(assertBundleBoundary(clean, 'runtime', { foundation: true }), []);
	const date = {
		...clean,
		modules: [
			...clean.modules,
			'/repo/node_modules/.pnpm/@internationalized+date@3/node_modules/@internationalized/date/dist/main.js'
		],
		code: 'throw new Error("@internationalized/date is required")'
	};
	assert.deepEqual(assertBundleBoundary(date, 'ZCalendar'), ['@internationalized/date']);
	assert.throws(
		() => assertBundleBoundary(date, 'runtime', { foundation: true }),
		/foundation bundles/u
	);
	assert.throws(
		() => assertBundleBoundary({ ...clean, imports: ['@internationalized/date'] }, 'ZCalendar'),
		/unresolved/u
	);
	assert.throws(
		() => assertBundleBoundary({ ...clean, dynamicImports: ['shiki/core'] }, 'ZButton'),
		/unresolved/u
	);
	assert.throws(
		() => assertBundleBoundary({ ...clean, imports: ['node:async_hooks'] }, 'ZButton'),
		/compiler\/server/u
	);
	assert.throws(
		() =>
			assertBundleBoundary(
				{ ...clean, modules: ['/repo/ui/zui/src/compiler/preprocess.ts'] },
				'ZButton'
			),
		/compiler\/server/u
	);
	assert.deepEqual(
		assertBundleBoundary({ ...clean, code: '"node:async_hooks @floating-ui shiki"' }, 'ZButton'),
		[]
	);
	assert.equal(packageFromModule('C:\\repo\\node_modules\\tabbable\\dist\\index.js'), 'tabbable');
	console.log('Bundle dependency boundary self-test passed.');
}

if (
	process.argv[1] &&
	pathToFileURL(resolve(process.argv[1])).href === import.meta.url &&
	process.argv.includes('--self-test')
)
	selfTest();
