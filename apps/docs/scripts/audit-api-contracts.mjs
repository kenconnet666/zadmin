import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const componentsRoot = resolve(root, 'ui/zui/src/components');
const generatedApiPath = resolve(root, 'apps/docs/src/framework/component-api.generated.ts');

// This gate proves declaration -> $props destructuring -> metadata coverage.
// Observable runtime behavior remains owned by browser/SSR/visual evidence.

async function filesUnder(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await filesUnder(path)));
		else if (entry.isFile() && entry.name.endsWith('.svelte')) files.push(path);
	}
	return files.sort();
}

function unwrap(node) {
	while (
		node &&
		(ts.isAsExpression(node) ||
			ts.isSatisfiesExpression(node) ||
			ts.isParenthesizedExpression(node))
	) {
		node = node.expression;
	}
	return node;
}

function nameOf(node) {
	return node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : undefined;
}

function objectProperty(object, name) {
	return object.properties.find(
		(property) => ts.isPropertyAssignment(property) && nameOf(property.name) === name
	);
}

function literalText(node) {
	node = unwrap(node);
	if (node && ts.isStringLiteral(node)) return { kind: 'string', value: node.text };
	if (node && node.kind === ts.SyntaxKind.TrueKeyword) return { kind: 'boolean', value: true };
	if (node && node.kind === ts.SyntaxKind.FalseKeyword) return { kind: 'boolean', value: false };
	if (node && node.kind === ts.SyntaxKind.NullKeyword) return { kind: 'null', value: null };
	if (node && ts.isIdentifier(node) && node.text === 'undefined')
		return { kind: 'undefined', value: 'undefined' };
	if (node && ts.isNumericLiteral(node)) return { kind: 'number', value: Number(node.text) };
	if (
		node &&
		ts.isPrefixUnaryExpression(node) &&
		node.operator === ts.SyntaxKind.MinusToken &&
		ts.isNumericLiteral(node.operand)
	)
		return { kind: 'number', value: -Number(node.operand.text) };
	return undefined;
}

function metadataFacts(sourceFile) {
	let metadata;
	function visit(node) {
		if (metadata) return;
		if (ts.isVariableDeclaration(node) && nameOf(node.name) === 'zuiMetadata' && node.initializer) {
			const candidate = unwrap(node.initializer);
			if (ts.isObjectLiteralExpression(candidate)) metadata = candidate;
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);
	if (!metadata) return undefined;
	const id = literalText(objectProperty(metadata, 'id')?.initializer)?.value;
	const name = literalText(objectProperty(metadata, 'name')?.initializer)?.value;
	const propsArray = unwrap(objectProperty(metadata, 'props')?.initializer);
	const props = new Map();
	const covered = new Set();
	if (propsArray && ts.isArrayLiteralExpression(propsArray)) {
		for (const entry of propsArray.elements) {
			const object = unwrap(entry);
			if (!object || !ts.isObjectLiteralExpression(object)) continue;
			const propName = literalText(objectProperty(object, 'name')?.initializer)?.value;
			if (typeof propName !== 'string') continue;
			const defaultNode = objectProperty(object, 'default')?.initializer;
			const defaultValue = literalText(defaultNode);
			const rawDefault = defaultNode ? defaultNode.getText(sourceFile) : undefined;
			props.set(propName, { defaultValue, rawDefault });
			covered.add(propName);
		}
	}
	for (const section of ['bindings', 'events', 'snippets']) {
		const array = unwrap(objectProperty(metadata, section)?.initializer);
		if (!array || !ts.isArrayLiteralExpression(array)) continue;
		for (const entry of array.elements) {
			const object = unwrap(entry);
			if (!object || !ts.isObjectLiteralExpression(object)) continue;
			const propName = literalText(objectProperty(object, 'name')?.initializer)?.value;
			if (typeof propName === 'string') covered.add(propName);
		}
	}
	return { id, name, props, covered };
}

function generatedApiFacts(source) {
	const sourceFile = ts.createSourceFile(
		generatedApiPath,
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const bySource = new Map();
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			const object = declaration.initializer ? unwrap(declaration.initializer) : undefined;
			if (!object || !ts.isObjectLiteralExpression(object)) continue;
			const sourcePath = literalText(objectProperty(object, 'source')?.initializer)?.value;
			const id = literalText(objectProperty(object, 'id')?.initializer)?.value;
			const name = literalText(objectProperty(object, 'name')?.initializer)?.value;
			const propsNode = unwrap(objectProperty(object, 'props')?.initializer);
			if (
				typeof sourcePath !== 'string' ||
				typeof id !== 'string' ||
				typeof name !== 'string' ||
				!propsNode ||
				!ts.isArrayLiteralExpression(propsNode)
			)
				continue;
			const props = propsNode.elements.flatMap((element) => {
				const prop = unwrap(element);
				if (!prop || !ts.isObjectLiteralExpression(prop)) return [];
				const propName = literalText(objectProperty(prop, 'name')?.initializer)?.value;
				const inheritedFrom = literalText(
					objectProperty(prop, 'inheritedFrom')?.initializer
				)?.value;
				return typeof propName === 'string'
					? [{ name: propName, inheritedFrom: String(inheritedFrom ?? '') || undefined }]
					: [];
			});
			if (bySource.has(sourcePath))
				throw new Error(`Generated API repeats component source ${sourcePath}.`);
			bySource.set(sourcePath, { id, name, props });
		}
	}
	return bySource;
}

function collectPropsConsumption(sourceFile) {
	const consumed = new Set();
	const defaults = new Map();
	let restForwarded = false;
	function visit(node) {
		if (
			ts.isVariableDeclaration(node) &&
			node.initializer &&
			ts.isCallExpression(node.initializer)
		) {
			const call = node.initializer;
			if (
				call.expression.getText(sourceFile) === '$props' &&
				ts.isObjectBindingPattern(node.name)
			) {
				for (const element of node.name.elements) {
					if (ts.isSpreadElement(element) || element.dotDotDotToken) {
						restForwarded = true;
						continue;
					}
					if (
						!ts.isBindingElement(element) ||
						!element.name ||
						ts.isObjectBindingPattern(element.name)
					)
						continue;
					const name = nameOf(element.propertyName ?? element.name);
					if (!name || ts.isSpreadAssignment(element)) continue;
					consumed.add(name);
					const value = literalText(element.initializer);
					if (value) defaults.set(name, value);
				}
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);
	return { consumed, defaults, restForwarded };
}

function normalizeMetadataDefault(fact) {
	if (!fact?.defaultValue || fact.defaultValue.kind !== 'string') return undefined;
	const text = fact.defaultValue.value.trim();
	if (text === 'true') return { kind: 'boolean', value: true };
	if (text === 'false') return { kind: 'boolean', value: false };
	if (text === 'null') return { kind: 'null', value: null };
	if (text === 'undefined') return { kind: 'undefined', value: 'undefined' };
	if (/^(?:Provider|Field|最近|继承|String\(|locale)/u.test(text)) return undefined;
	const quoted = /^(['"])([\s\S]*)\1$/u.exec(text);
	if (quoted) return { kind: 'string', value: quoted[2] };
	if (/^-?\d+(?:\.\d+)?$/u.test(text)) return { kind: 'number', value: Number(text) };
	return undefined;
}

if (process.argv.includes('--self-test')) {
	const metadataString = { defaultValue: { kind: 'string', value: "'bottom-start'" } };
	const metadataBoolean = { defaultValue: { kind: 'string', value: 'false' } };
	if (normalizeMetadataDefault(metadataString)?.value !== 'bottom-start')
		throw new Error('API runtime audit string default self-test failed.');
	if (normalizeMetadataDefault(metadataBoolean)?.value !== false)
		throw new Error('API runtime audit boolean default self-test failed.');
	const facts = generatedApiFacts(await readFile(generatedApiPath, 'utf8'));
	const button = facts.get('ui/zui/src/components/gene/ZButton.svelte');
	if (
		!button?.props.some(({ name }) => name === 'size') ||
		!button.props.some(({ name }) => name === 'variant')
	)
		throw new Error('API runtime audit generated RecipeVariants self-test failed.');
	process.exit(0);
}

const allFiles = await filesUnder(componentsRoot);
const generatedFacts = generatedApiFacts(await readFile(generatedApiPath, 'utf8'));
const report = [];
let publicComponents = 0;
const visitedGeneratedSources = new Set();
for (const filename of allFiles) {
	const source = await readFile(filename, 'utf8');
	const moduleMatch = /<script\s+module\s+lang=["']ts["'][^>]*>([\s\S]*?)<\/script>/u.exec(source);
	if (!moduleMatch) continue;
	const sourceFile = ts.createSourceFile(
		filename,
		moduleMatch[1],
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const componentName = filename
		.slice(Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\')) + 1)
		.replace(/\.svelte$/u, '');
	const metadata = metadataFacts(sourceFile);
	if (!metadata) continue;
	publicComponents += 1;
	const sourcePath = relative(root, filename).replaceAll('\\', '/');
	const generated = generatedFacts.get(sourcePath);
	if (generated) visitedGeneratedSources.add(sourcePath);
	const instanceMatch =
		/<script(?![^>]*\bmodule\b)[^>]*\blang=["']ts["'][^>]*>([\s\S]*?)<\/script>/u.exec(source);
	const instanceSource = instanceMatch?.[1] ?? '';
	const consumed = collectPropsConsumption(
		ts.createSourceFile(filename, instanceSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
	);
	const generatedProps = generated?.props ?? [];
	const explicit = generatedProps.map(({ name }) => name);
	const inheritedProps = new Set(
		generatedProps.filter(({ inheritedFrom }) => inheritedFrom).map(({ name }) => name)
	);
	const missingConsumption = consumed.restForwarded
		? []
		: explicit.filter((name) => !consumed.consumed.has(name));
	const forwardedConsumption = consumed.restForwarded
		? explicit.filter((name) => !consumed.consumed.has(name))
		: [];
	const metadataExempt = new Set(['class', 'style']);
	const missingMetadata = explicit.filter(
		(name) =>
			!inheritedProps.has(name) &&
			!metadataExempt.has(name) &&
			!/^on[a-z]+$/u.test(name) &&
			!metadata.covered.has(name)
	);
	const metadataOnly = [...(metadata?.covered ?? [])].filter((name) => !explicit.includes(name));
	const missingGeneratedFacts = generated ? [] : [sourcePath];
	const generatedIdentityMismatch =
		generated && (generated.id !== metadata.id || generated.name !== metadata.name)
			? [{ actual: { id: generated.id, name: generated.name }, expected: metadata }]
			: [];
	const defaultMismatches = [];
	for (const [name, implementation] of consumed.defaults) {
		const metadataDefault = normalizeMetadataDefault(metadata?.props.get(name));
		if (!metadataDefault || implementation.kind !== metadataDefault.kind) continue;
		if (implementation.value !== metadataDefault.value)
			defaultMismatches.push({ name, implementation, metadata: metadataDefault });
	}
	if (
		missingConsumption.length ||
		missingGeneratedFacts.length ||
		generatedIdentityMismatch.length ||
		missingMetadata.length ||
		defaultMismatches.length ||
		metadataOnly.length ||
		forwardedConsumption.length
	) {
		report.push({
			component: componentName,
			file: sourcePath,
			metadataId: metadata?.id,
			declared: explicit,
			consumed: [...consumed.consumed],
			missingConsumption,
			missingGeneratedFacts,
			generatedIdentityMismatch,
			forwardedConsumption,
			missingMetadata,
			metadataOnly,
			defaultMismatches
		});
	}
}

const actionable = report.filter(
	(item) =>
		item.missingConsumption.length > 0 ||
		item.missingGeneratedFacts.length > 0 ||
		item.generatedIdentityMismatch.length > 0 ||
		item.missingMetadata.length > 0 ||
		item.defaultMismatches.length > 0
);
const unvisitedGeneratedSources = [...generatedFacts.keys()].filter(
	(source) => !visitedGeneratedSources.has(source)
);
const summary = {
	schemaVersion: 1,
	components: publicComponents,
	componentsWithFindings: report.length,
	actionableIssues: actionable.length + unvisitedGeneratedSources.length,
	missingConsumption: report.filter((x) => x.missingConsumption.length).length,
	missingGeneratedFacts: report.filter((x) => x.missingGeneratedFacts.length).length,
	generatedIdentityMismatches: report.filter((x) => x.generatedIdentityMismatch.length).length,
	forwardedConsumption: report.filter((x) => x.forwardedConsumption.length).length,
	missingMetadata: report.filter((x) => x.missingMetadata.length).length,
	defaultMismatches: report.filter((x) => x.defaultMismatches.length).length,
	metadataOnly: report.filter((x) => x.metadataOnly.length).length,
	generatedProps: [...generatedFacts.values()].reduce(
		(total, item) => total + item.props.length,
		0
	),
	unvisitedGeneratedSources: unvisitedGeneratedSources.length,
	...(process.argv.includes('--verbose') ? { results: report } : {})
};
console.log(JSON.stringify(summary, null, 2));
if (actionable.length > 0 || unvisitedGeneratedSources.length > 0) process.exitCode = 1;
