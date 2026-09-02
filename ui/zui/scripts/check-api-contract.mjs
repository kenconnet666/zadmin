import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const componentsRoot = resolve(packageRoot, 'src/components');
const entrypointsRoot = resolve(packageRoot, 'src/entrypoints');
const snapshotPath = resolve(packageRoot, '../../.docs/zui/api-contract.json');
const write = process.argv.includes('--write');
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

const portable = (path) => path.replaceAll('\\', '/');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

async function filesUnder(root, extension) {
	const entries = await readdir(root, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(root, entry.name);
		if (entry.isDirectory()) files.push(...(await filesUnder(path, extension)));
		else if (entry.isFile() && entry.name.endsWith(extension)) files.push(path);
	}
	return files.sort();
}

function isExported(statement) {
	return (
		ts.isExportAssignment(statement) ||
		ts.isExportDeclaration(statement) ||
		(ts.canHaveModifiers(statement) &&
			ts.getModifiers(statement)?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword))
	);
}

function publicContract(source, filename) {
	const normalizedSource = source.replace(/\r\n?/gu, '\n');
	const sourceFile = ts.createSourceFile(
		filename,
		normalizedSource,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	return sourceFile.statements
		.filter(isExported)
		.map((statement) => printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile))
		.join('\n');
}

function moduleScript(source, filename) {
	const match = source.match(/<script\s+module\s+lang=["']ts["']>([\s\S]*?)<\/script>/u);
	if (!match) throw new Error(`Missing TypeScript module script in ${filename}.`);
	return match[1];
}

function metadataId(contract, filename) {
	const declaration = contract.slice(contract.indexOf('export const zuiMetadata'));
	const match = declaration.match(/\bid:\s*['"]([^'"]+)['"]/u);
	if (!match) throw new Error(`Missing zuiMetadata id in ${filename}.`);
	return match[1];
}

async function createSnapshot() {
	const components = [];
	for (const path of await filesUnder(componentsRoot, '.svelte')) {
		const source = await readFile(path, 'utf8');
		if (!source.includes('export const zuiMetadata')) continue;
		const filename = portable(relative(packageRoot, path));
		const contract = publicContract(moduleScript(source, filename), filename);
		components.push({
			id: metadataId(contract, filename),
			sha256: sha256(contract),
			source: filename
		});
	}

	const ids = components.map(({ id }) => id);
	if (new Set(ids).size !== ids.length)
		throw new Error('ZUI API contract contains duplicate metadata ids.');

	const entrypoints = {};
	for (const path of await filesUnder(entrypointsRoot, '.ts')) {
		const filename = portable(relative(packageRoot, path));
		entrypoints[portable(relative(entrypointsRoot, path))] = sha256(
			publicContract(await readFile(path, 'utf8'), filename)
		);
	}

	const contract = { components, entrypoints };
	return {
		schemaVersion: 1,
		componentCount: components.length,
		overallSha256: sha256(JSON.stringify(contract)),
		...contract
	};
}

const actual = await createSnapshot();
const serialized = `${JSON.stringify(actual, null, '\t')}\n`;

if (write) {
	await writeFile(snapshotPath, serialized);
	console.log(`Wrote ${portable(relative(packageRoot, snapshotPath))}.`);
} else {
	const expectedSource = await readFile(snapshotPath, 'utf8').catch(() => '{}');
	const expected = JSON.parse(expectedSource);
	if (JSON.stringify(expected) !== JSON.stringify(actual)) {
		const expectedFingerprint = expected.overallSha256 ?? 'missing';
		throw new Error(
			`ZUI public API contract changed (${expectedFingerprint} -> ${actual.overallSha256}). Review the diff, then run \`pnpm --filter @zadmin/zui api:contract:update\`.`
		);
	}
	console.log(`ZUI public API contract verified (${actual.componentCount} metadata ids).`);
}
