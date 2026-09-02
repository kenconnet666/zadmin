import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function collectManifestClosure(manifest, entryKey, relation) {
	const visited = new Set();
	const visit = (key) => {
		if (visited.has(key)) return;
		visited.add(key);
		for (const child of manifest[key]?.[relation] ?? []) visit(child);
	};
	visit(entryKey);
	return visited;
}

export function collectDynamicManifestClosure(manifest, entryKey) {
	const dynamic = new Set();
	const visitDynamic = (key) => {
		if (dynamic.has(key)) return;
		dynamic.add(key);
		for (const child of manifest[key]?.imports ?? []) visitDynamic(child);
		for (const child of manifest[key]?.dynamicImports ?? []) visitDynamic(child);
	};
	for (const key of collectManifestClosure(manifest, entryKey, 'imports')) {
		for (const child of manifest[key]?.dynamicImports ?? []) visitDynamic(child);
	}
	return dynamic;
}

export function validateManifest(manifest, { entryKey, docSourceKeys, docChunkKeys }) {
	const staticClosure = collectManifestClosure(manifest, entryKey, 'imports');
	const dynamicClosure = collectDynamicManifestClosure(manifest, entryKey);
	const forbiddenStaticSources = [...staticClosure].filter(
		(key) =>
			/(?:^|\/)src\/content\/components\/.*\/doc\.ts$/u.test(key) ||
			/(?:^|\/)src\/content\/components\/.*\.svelte$/u.test(key) ||
			key === 'src/framework/catalog.ts'
	);
	if (forbiddenStaticSources.length > 0) {
		throw new Error(
			`Docs static entry graph contains catalog/doc sources: ${forbiddenStaticSources.join(', ')}.`
		);
	}
	const missingDynamicDocs = docSourceKeys.filter((key) => !dynamicClosure.has(key));
	if (missingDynamicDocs.length > 0) {
		throw new Error(
			`Docs doc.ts sources are not dynamically reachable: ${missingDynamicDocs.join(', ')}.`
		);
	}
	const staticDocs = docSourceKeys.filter((key) => staticClosure.has(key));
	if (staticDocs.length > 0) {
		throw new Error(`Docs doc.ts sources entered the static graph: ${staticDocs.join(', ')}.`);
	}
	const uniqueDocChunks = new Set(docChunkKeys).size;
	if (uniqueDocChunks < docSourceKeys.length) {
		throw new Error(
			`Docs emitted ${uniqueDocChunks} unique doc chunks for ${docSourceKeys.length} doc sources.`
		);
	}
	return {
		staticModules: staticClosure.size,
		dynamicModules: dynamicClosure.size,
		staticDocs: staticDocs.length,
		dynamicDocs: docSourceKeys.filter((key) => dynamicClosure.has(key)).length,
		uniqueDocChunks
	};
}

function selfTest() {
	const base = {
		'entry.ts': {
			imports: ['src/framework/catalog-manifest.generated.ts'],
			dynamicImports: ['doc-a.ts', 'doc-b.ts']
		},
		'src/framework/catalog-manifest.generated.ts': { imports: [], dynamicImports: [] },
		'doc-a.ts': { file: 'assets/doc-a.js', imports: [], dynamicImports: [] },
		'doc-b.ts': { file: 'assets/doc-b.js', imports: [], dynamicImports: [] }
	};
	const args = {
		entryKey: 'entry.ts',
		docSourceKeys: ['doc-a.ts', 'doc-b.ts'],
		docChunkKeys: ['assets/doc-a.js', 'assets/doc-b.js']
	};
	validateManifest(base, args);
	const staticDoc = { ...base, 'entry.ts': { ...base['entry.ts'], imports: ['doc-a.ts'] } };
	try {
		validateManifest(staticDoc, args);
		throw new Error('self-test static doc was accepted');
	} catch (error) {
		if (String(error).includes('self-test')) throw error;
	}
	const missingDynamic = {
		...base,
		'entry.ts': { ...base['entry.ts'], dynamicImports: ['doc-a.ts'] }
	};
	try {
		validateManifest(missingDynamic, args);
		throw new Error('self-test missing dynamic was accepted');
	} catch (error) {
		if (String(error).includes('self-test')) throw error;
	}
	try {
		validateManifest(base, { ...args, docChunkKeys: ['assets/doc-a.js', 'assets/doc-a.js'] });
		throw new Error('self-test duplicate chunk was accepted');
	} catch (error) {
		if (String(error).includes('self-test')) throw error;
	}
	console.log(JSON.stringify({ cases: 4, status: 'passed' }));
}

if (process.argv.includes('--self-test')) selfTest();
else {
	const docsRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
	const distRoot = resolve(docsRoot, 'dist');
	const manifestPath = resolve(distRoot, '.vite/manifest.json');
	const entryHtml = await readFile(resolve(distRoot, 'index.html'), 'utf8').catch(() => null);
	if (!entryHtml)
		throw new Error(
			'Docs build output is missing dist/index.html. Run pnpm --filter @zadmin/docs build first.'
		);
	const entryMatch = entryHtml.match(/src=["']\.\/assets\/([^"']+\.js)["']/u);
	if (!entryMatch) throw new Error('Docs dist/index.html has no module entry script.');
	const entryFile = `assets/${entryMatch[1]}`;
	const manifest = JSON.parse(
		await readFile(manifestPath, 'utf8').catch(() => {
			throw new Error(
				'Docs build output is missing dist/.vite/manifest.json. Enable Vite build.manifest first.'
			);
		})
	);
	const entryKey = Object.keys(manifest).find((key) => manifest[key]?.file === entryFile);
	if (!entryKey) throw new Error(`Docs Vite manifest has no entry for ${entryFile}.`);
	const docSourceKeys = Object.keys(manifest).filter((key) =>
		/(?:^|\/)src\/content\/components\/.*\/doc\.ts$/u.test(key)
	);
	const docChunkKeys = docSourceKeys
		.map((key) => manifest[key]?.file)
		.filter((file) => typeof file === 'string');
	const entrySource = await readFile(resolve(distRoot, entryFile), 'utf8');
	const graph = validateManifest(manifest, { entryKey, docSourceKeys, docChunkKeys });
	const entryBytes = Buffer.byteLength(entrySource);
	const entryGzipBytes = gzipSync(entrySource, { level: 9 }).byteLength;
	const maxEntryBytes = 326_000;
	if (entryBytes > maxEntryBytes)
		throw new Error(
			`Docs entry is ${entryBytes} bytes; expected no more than ${maxEntryBytes} bytes.`
		);
	const maxEntryGzipBytes = 100_000;
	if (entryGzipBytes > maxEntryGzipBytes)
		throw new Error(
			`Docs entry gzip is ${entryGzipBytes} bytes; expected no more than ${maxEntryGzipBytes} bytes.`
		);

	console.log(
		JSON.stringify({
			entry: basename(entryFile),
			entryBytes,
			entryGzipBytes,
			maxEntryBytes,
			maxEntryGzipBytes,
			...graph,
			status: 'passed'
		})
	);
}
