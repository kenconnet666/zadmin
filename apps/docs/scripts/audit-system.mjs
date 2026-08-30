import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');
const componentsRoot = resolve(workspaceRoot, 'ui/zui/src/components');
const docsComponentsRoot = resolve(docsRoot, 'src/content/components');
const docsSourceRoot = resolve(docsRoot, 'src');
const portable = (path) => path.replaceAll('\\', '/');
const ignoredDirectories = new Set([
	'.svelte-kit',
	'.vite',
	'build',
	'coverage',
	'dist',
	'node_modules',
	'playwright-report',
	'test-results'
]);

async function filesUnder(root, extensions) {
	const entries = await readdir(root, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(root, entry.name);
		if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
			files.push(...(await filesUnder(path, extensions)));
		} else if (entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))) {
			files.push(path);
		}
	}
	return files.sort();
}

function fail(message) {
	throw new Error(message);
}

const componentFiles = await filesUnder(componentsRoot, ['.svelte']);
const metadata = [];
const internalComponents = [];
const transitionFiles = [];
for (const path of componentFiles) {
	const source = await readFile(path, 'utf8');
	const filename = portable(relative(workspaceRoot, path));
	const id = source.match(
		/export const zuiMetadata\s*=\s*\{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/u
	)?.[1];
	if (id) metadata.push({ id, source: filename });
	else internalComponents.push(filename);
	if (/transition(?:Property|Duration)|transition:/u.test(source)) {
		transitionFiles.push(filename);
		if (!/\bmotion\b/u.test(source))
			fail(`${filename} defines a transition without a motion contract.`);
	}
	for (const line of source.split(/\r?\n/u)) {
		if (/^\s*import\s+(?!type\b).*from\s+['"]@lucide\/svelte['"]/u.test(line)) {
			fail(`${filename} imports Lucide values from the package root instead of an icon subpath.`);
		}
	}
}

if (new Set(metadata.map(({ id }) => id)).size !== metadata.length) {
	fail('ZUI component metadata ids must be globally unique.');
}
const expectedInternal = [
	'ui/zui/src/components/input/ZMentionEditor.svelte',
	'ui/zui/src/components/input/ZTextareaAutosize.svelte'
];
if (JSON.stringify(internalComponents) !== JSON.stringify(expectedInternal)) {
	fail(`Unexpected internal component set: ${internalComponents.join(', ') || 'none'}.`);
}

const docsSvelteFiles = await filesUnder(docsSourceRoot, ['.svelte']);
const rawInteractive =
	/<(?:a|button|code|details|input|kbd|meter|progress|select|summary|table|textarea)\b/u;
const forbiddenGlyph = /[×‹›✓]/u;
for (const path of docsSvelteFiles) {
	const source = await readFile(path, 'utf8');
	const filename = portable(relative(workspaceRoot, path));
	if (rawInteractive.test(source))
		fail(`${filename} hand-builds an interactive element instead of dogfooding ZUI.`);
	if (forbiddenGlyph.test(source))
		fail(`${filename} contains a character UI icon instead of Lucide.`);
}
for (const path of componentFiles) {
	const source = await readFile(path, 'utf8');
	if (forbiddenGlyph.test(source)) {
		fail(
			`${portable(relative(workspaceRoot, path))} contains a character UI icon instead of Lucide.`
		);
	}
}

const svgCandidates = [
	...(await filesUnder(resolve(workspaceRoot, 'apps'), ['.svelte', '.svg'])),
	...(await filesUnder(resolve(workspaceRoot, 'packages'), ['.svelte', '.svg'])),
	...(await filesUnder(resolve(workspaceRoot, 'ui'), ['.svelte', '.svg']))
];
const inlineSvg = [];
for (const path of svgCandidates) {
	if (/<(?:path|svg)\b/u.test(await readFile(path, 'utf8'))) {
		inlineSvg.push(portable(relative(workspaceRoot, path)));
	}
}
const allowedSvg = [
	'apps/desktop/static/zadmin-icon.svg',
	'apps/docs/static/favicon.svg',
	'ui/zui/src/components/data-display/ZProgress.svelte',
	'ui/zui/src/components/feedback/ZSpinner.svelte'
];
if (JSON.stringify(inlineSvg.sort()) !== JSON.stringify(allowedSvg.sort())) {
	fail(`Inline SVG boundary changed: ${inlineSvg.join(', ') || 'none'}.`);
}

const docFiles = await filesUnder(docsComponentsRoot, ['doc.ts']);
const demoIds = [];
for (const path of docFiles) {
	const source = await readFile(path, 'utf8');
	const ids = [...source.matchAll(/\bid:\s*['"]([^'"]+)['"]/gu)].map((match) => match[1]);
	if (ids.length < 2)
		fail(`${portable(relative(workspaceRoot, path))} defines fewer than two demos.`);
	demoIds.push(...ids);
}
if (new Set(demoIds).size !== demoIds.length)
	fail('Documentation demo ids must be globally unique.');

console.log(
	JSON.stringify({
		componentSvelteFiles: componentFiles.length,
		metadataIds: metadata.length,
		docPages: docFiles.length,
		demoIds: demoIds.length,
		transitionFiles: transitionFiles.length,
		inlineSvgFiles: inlineSvg.length,
		docsRawInteractiveElements: 0
	})
);
