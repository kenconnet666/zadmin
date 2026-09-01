import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const componentsRoot = resolve(packageRoot, 'src/components');
const manifestPath = resolve(packageRoot, 'package.json');
const args = process.argv.slice(2);
const writeUnreleased = args.includes('--write-unreleased');
const materializeIndex = args.indexOf('--materialize-unreleased');
const materializeUnreleased = materializeIndex >= 0;
const requestedVersion = materializeUnreleased ? args[materializeIndex + 1] : undefined;
const portable = (path) => path.replaceAll('\\', '/');
const releasedVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;

if (writeUnreleased && materializeUnreleased) {
	throw new Error('Choose either --write-unreleased or --materialize-unreleased, not both.');
}
const expectedArgumentCount = writeUnreleased ? 1 : materializeUnreleased ? 2 : 0;
if (args.length !== expectedArgumentCount) {
	throw new Error(`Unexpected arguments: ${args.join(' ') || 'none'}.`);
}

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

function parseReleasedVersion(value, label) {
	const match = releasedVersionPattern.exec(value);
	if (!match)
		throw new Error(`${label} must be a stable x.y.z version; received ${JSON.stringify(value)}.`);
	return match.slice(1).map(Number);
}

function compareVersions(left, right) {
	for (let index = 0; index < 3; index += 1) {
		const difference = left[index] - right[index];
		if (difference !== 0) return Math.sign(difference);
	}
	return 0;
}

function unwrapExpression(expression) {
	let current = expression;
	while (
		ts.isAsExpression(current) ||
		ts.isParenthesizedExpression(current) ||
		ts.isSatisfiesExpression(current)
	) {
		current = current.expression;
	}
	return current;
}

function propertyName(property) {
	if (!property.name) return undefined;
	if (
		ts.isIdentifier(property.name) ||
		ts.isStringLiteral(property.name) ||
		ts.isNumericLiteral(property.name)
	) {
		return property.name.text;
	}
	return undefined;
}

function stringProperty(object, name, sourceFile, filename) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) {
		throw new Error(`${filename} zuiMetadata must declare ${name}.`);
	}
	const value = unwrapExpression(property.initializer);
	if (!ts.isStringLiteral(value) && !ts.isNoSubstitutionTemplateLiteral(value)) {
		throw new Error(`${filename} zuiMetadata.${name} must be a string literal.`);
	}
	return {
		end: value.getEnd(),
		start: value.getStart(sourceFile),
		value: value.text
	};
}

function metadataObject(sourceFile, filename) {
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'zuiMetadata') continue;
			if (!declaration.initializer) break;
			const initializer = unwrapExpression(declaration.initializer);
			if (ts.isObjectLiteralExpression(initializer)) return initializer;
		}
	}
	throw new Error(`${filename} is missing an object-literal zuiMetadata export.`);
}

function readMetadataFact(source, filename) {
	const match = /<script\s+module\s+lang=["']ts["']>([\s\S]*?)<\/script>/u.exec(source);
	if (!match || match.index === undefined) {
		throw new Error(`${filename} is missing its TypeScript module script.`);
	}
	const moduleSource = match[1];
	const moduleOffset = match.index + match[0].indexOf(moduleSource);
	const sourceFile = ts.createSourceFile(filename, moduleSource, ts.ScriptTarget.Latest, true);
	const metadata = metadataObject(sourceFile, filename);
	const id = stringProperty(metadata, 'id', sourceFile, filename);
	const name = stringProperty(metadata, 'name', sourceFile, filename);
	const since = stringProperty(metadata, 'since', sourceFile, filename);
	return {
		id: id.value,
		name: name.value,
		since: since.value,
		sinceEnd: moduleOffset + since.end,
		sinceStart: moduleOffset + since.start
	};
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const packageVersion = manifest.version;
const parsedPackageVersion = parseReleasedVersion(packageVersion, '@zadmin/zui package version');

if (materializeUnreleased) {
	if (!requestedVersion) {
		throw new Error(
			'Pass the already-versioned package version after --materialize-unreleased, for example 0.2.0.'
		);
	}
	parseReleasedVersion(requestedVersion, 'Materialized component version');
	if (requestedVersion !== packageVersion) {
		throw new Error(
			`Materialized version ${requestedVersion} must equal @zadmin/zui package version ${packageVersion}.`
		);
	}
}

const facts = [];
const changedFiles = [];
const pendingWrites = [];
for (const path of await filesUnder(componentsRoot, '.svelte')) {
	const source = await readFile(path, 'utf8');
	if (!source.includes('export const zuiMetadata')) continue;
	const filename = portable(relative(packageRoot, path));
	const fact = readMetadataFact(source, filename);
	if (!fact.name.startsWith('Z')) throw new Error(`${filename} metadata name must start with Z.`);
	const expectedSourceSuffix = `/${fact.name}.svelte`;
	if (!portable(path).endsWith(expectedSourceSuffix)) {
		throw new Error(`${filename} metadata name does not match its source filename.`);
	}

	let replacement;
	if (fact.since === 'unreleased') {
		replacement = materializeUnreleased ? requestedVersion : undefined;
	} else {
		const parsedSince = parseReleasedVersion(fact.since, `${filename} zuiMetadata.since`);
		fact.isFuture = compareVersions(parsedSince, parsedPackageVersion) > 0;
		replacement = writeUnreleased && fact.isFuture ? 'unreleased' : undefined;
	}

	if (replacement) {
		const updated = `${source.slice(0, fact.sinceStart)}'${replacement}'${source.slice(fact.sinceEnd)}`;
		pendingWrites.push({ path, source: updated });
		changedFiles.push(filename);
		fact.since = replacement;
		fact.isFuture = false;
	}
	facts.push(fact);
}

const ids = facts.map(({ id }) => id);
if (new Set(ids).size !== ids.length) {
	throw new Error('ZUI component metadata ids must be globally unique.');
}

const futureFacts = facts.filter(({ isFuture }) => isFuture);
if (futureFacts.length > 0) {
	const examples = futureFacts
		.slice(0, 12)
		.map(({ id, since }) => `${id}@${since}`)
		.join(', ');
	throw new Error(
		`${futureFacts.length} component metadata entries claim a future release beyond @zadmin/zui ${packageVersion}: ${examples}${futureFacts.length > 12 ? ', ...' : ''}. Run \`pnpm --filter @zadmin/zui metadata:since:normalize\` after parallel component edits are merged.`
	);
}

await Promise.all(pendingWrites.map(({ path, source }) => writeFile(path, source)));

const distribution = Object.fromEntries(
	[...new Set(facts.map(({ since }) => since))]
		.sort((left, right) => left.localeCompare(right, 'en'))
		.map((since) => [since, facts.filter((fact) => fact.since === since).length])
);

console.log(
	JSON.stringify({
		changedFiles: changedFiles.length,
		componentMetadata: facts.length,
		packageVersion,
		since: distribution
	})
);
