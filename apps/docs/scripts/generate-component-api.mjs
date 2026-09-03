import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';
import ts from 'typescript';

import { collectWorkspacePropertyFacts, REQUIREDNESS } from './workspace-property-facts.mjs';
import { WorkspaceTypeGraph } from './workspace-type-graph.mjs';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');
const componentsRoot = resolve(workspaceRoot, 'ui/zui/src/components');
const outputPath = resolve(docsRoot, 'src/framework/component-api.generated.ts');
const teachingCoverageJsonPath = resolve(workspaceRoot, '.docs/zui/api-teaching-coverage.json');
const teachingCoverageMarkdownPath = resolve(workspaceRoot, '.docs/zui/api-teaching-coverage.md');
const workspaceTypeGraph = new WorkspaceTypeGraph({ workspaceRoot });
const write = process.argv.includes('--write');
const portable = (path) => path.replaceAll('\\', '/');
const normalizeType = (value) => value.replace(/\s+/gu, ' ').trim();

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

function stringProperty(object, name, sourceFile, filename) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) {
		throw new Error(`${filename} zuiMetadata must declare ${name}.`);
	}
	const value = unwrapExpression(property.initializer);
	if (!ts.isStringLiteral(value) && !ts.isNoSubstitutionTemplateLiteral(value)) {
		throw new Error(`${filename} zuiMetadata.${name} must be a string literal.`);
	}
	return value.text;
}

function metadataItemNames(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return [];
	const value = unwrapExpression(property.initializer);
	if (!ts.isArrayLiteralExpression(value)) return [];
	return value.elements.flatMap((element) => {
		const item = unwrapExpression(element);
		if (!ts.isObjectLiteralExpression(item)) return [];
		const itemName = item.properties.find((candidate) => propertyName(candidate) === 'name');
		if (!itemName || !ts.isPropertyAssignment(itemName)) return [];
		const initializer = unwrapExpression(itemName.initializer);
		return ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)
			? [initializer.text]
			: [];
	});
}

function metadataItems(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return [];
	const value = unwrapExpression(property.initializer);
	if (!ts.isArrayLiteralExpression(value)) return [];
	return value.elements.flatMap((element) => {
		const item = unwrapExpression(element);
		return ts.isObjectLiteralExpression(item) ? [item] : [];
	});
}

function objectStringProperty(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return undefined;
	const value = unwrapExpression(property.initializer);
	return ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)
		? value.text
		: undefined;
}

function objectBooleanProperty(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return undefined;
	const value = unwrapExpression(property.initializer);
	return value.kind === ts.SyntaxKind.TrueKeyword
		? true
		: value.kind === ts.SyntaxKind.FalseKeyword
			? false
			: undefined;
}

function objectStringArrayProperty(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return undefined;
	const value = unwrapExpression(property.initializer);
	if (!ts.isArrayLiteralExpression(value)) return undefined;
	return value.elements.every((item) => ts.isStringLiteral(item))
		? value.elements.map((item) => item.text)
		: undefined;
}

function objectObjectProperty(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return undefined;
	const value = unwrapExpression(property.initializer);
	return ts.isObjectLiteralExpression(value) ? value : undefined;
}
function objectPropertyPresent(object, name) {
	return object.properties.some((candidate) => propertyName(candidate) === name);
}

function hasDeprecatedTag(member) {
	return ts.getJSDocTags(member).some((tag) => tag.tagName.text === 'deprecated');
}

async function scanWorkspacePropertyPaths(graph, modulePath, rootName, collectAll = false) {
	const paths = new Set();
	const seen = new Set();
	function bindingFor(node, context) {
		if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
			const existing = context.bindings.get(node.typeName.text);
			if (existing) return existing;
		}
		return { node, modulePath: context.modulePath, bindings: context.bindings };
	}
	function literalNames(node, context) {
		if (!node) return new Set();
		if (ts.isParenthesizedTypeNode(node)) return literalNames(node.type, context);
		if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
			const binding = context.bindings.get(node.typeName.text);
			if (binding)
				return literalNames(binding.node, {
					bindings: binding.bindings,
					modulePath: binding.modulePath
				});
		}
		const types = ts.isUnionTypeNode(node) ? node.types : [node];
		return new Set(
			types
				.filter(ts.isLiteralTypeNode)
				.map(({ literal }) =>
					ts.isStringLiteral(literal) || ts.isNumericLiteral(literal) ? literal.text : undefined
				)
				.filter((value) => value !== undefined)
		);
	}
	async function visitReference(name, typeArguments, context, path, include, exclude) {
		const binding = context.bindings.get(name);
		if (binding) {
			await visitType(
				binding.node,
				{ bindings: binding.bindings, modulePath: binding.modulePath },
				path,
				include,
				exclude
			);
			return;
		}
		if ((name === 'Omit' || name === 'Pick') && typeArguments?.[0]) {
			const selected = literalNames(typeArguments[1], context);
			const nextInclude = name === 'Pick' ? selected : include;
			const nextExclude = name === 'Omit' ? new Set([...exclude, ...selected]) : exclude;
			await visitType(typeArguments[0], context, path, nextInclude, nextExclude);
			return;
		}
		if (
			['Array', 'Readonly', 'ReadonlyArray', 'Partial', 'Required'].includes(name) &&
			typeArguments?.[0]
		) {
			await visitType(typeArguments[0], context, path, include, exclude);
			return;
		}
		const resolution = await graph.resolveDeclaration(
			context.modulePath,
			name,
			typeArguments ?? []
		);
		if (resolution.status !== 'local') return;
		const identity = `${resolution.path}#${resolution.name}`;
		if (seen.has(identity)) return;
		const targetBindings = new Map();
		const parameters = [...(resolution.declaration.typeParameters ?? [])];
		for (const [index, parameter] of parameters.entries()) {
			const argument = typeArguments?.[index];
			if (argument) targetBindings.set(parameter.name.text, bindingFor(argument, context));
			else if (parameter.default)
				targetBindings.set(parameter.name.text, {
					node: parameter.default,
					modulePath: resolution.path,
					bindings: targetBindings
				});
		}
		seen.add(identity);
		await visitDeclaration(
			resolution.declaration,
			{ bindings: targetBindings, modulePath: resolution.path },
			path,
			include,
			exclude
		);
		seen.delete(identity);
	}
	async function visitType(node, context, path, include, exclude = new Set()) {
		if (!node) return;
		if (ts.isParenthesizedTypeNode(node))
			return visitType(node.type, context, path, include, exclude);
		if (ts.isTypeOperatorNode(node)) {
			if (node.operator === ts.SyntaxKind.ReadonlyKeyword)
				return visitType(node.type, context, path, include, exclude);
			return;
		}
		if (ts.isArrayTypeNode(node))
			return visitType(node.elementType, context, path, include, exclude);
		if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
			for (const type of node.types) await visitType(type, context, path, include, exclude);
			return;
		}
		if (ts.isTypeLiteralNode(node)) {
			for (const member of node.members) await visitMember(member, context, path, include, exclude);
			return;
		}
		if (ts.isExpressionWithTypeArguments(node)) {
			if (ts.isIdentifier(node.expression))
				await visitReference(
					node.expression.text,
					node.typeArguments,
					context,
					path,
					include,
					exclude
				);
			return;
		}
		if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
			await visitReference(node.typeName.text, node.typeArguments, context, path, include, exclude);
		}
	}
	async function visitMember(member, context, parentPath, include, exclude = new Set()) {
		if (!ts.isPropertySignature(member)) return;
		const name = propertyName(member);
		if (!name) return;
		if (exclude.has(name) || (include && !include.has(name))) return;
		const path = parentPath ? `${parentPath}.${name}` : name;
		if (collectAll || hasDeprecatedTag(member)) paths.add(path);
		await visitType(member.type, context, path);
	}
	async function visitDeclaration(declaration, context, path, include, exclude = new Set()) {
		if (ts.isTypeAliasDeclaration(declaration)) {
			await visitType(declaration.type, context, path, include, exclude);
			return;
		}
		for (const heritage of declaration.heritageClauses ?? [])
			for (const type of heritage.types) await visitType(type, context, path, include, exclude);
		for (const member of declaration.members)
			await visitMember(member, context, path, include, exclude);
	}
	const root = await graph.resolveDeclaration(modulePath, rootName);
	if (root.status !== 'local')
		throw new Error(`${portable(relative(workspaceRoot, modulePath))} cannot resolve ${rootName}.`);
	const identity = `${root.path}#${root.name}`;
	seen.add(identity);
	const rootBindings = new Map();
	for (const parameter of root.declaration.typeParameters ?? [])
		if (parameter.default)
			rootBindings.set(parameter.name.text, {
				node: parameter.default,
				modulePath: root.path,
				bindings: rootBindings
			});
	await visitDeclaration(root.declaration, { bindings: rootBindings, modulePath: root.path }, '');
	seen.delete(identity);
	return paths;
}

const releasedVersionPattern = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;
const lifecycleVersionPattern = new RegExp(
	`^(?:unreleased|${releasedVersionPattern.source})$`,
	'u'
);

function safeMigrationTarget(value) {
	if (typeof value !== 'string' || value.length === 0) return false;
	try {
		const url = new URL(value);
		return (
			url.protocol === 'https:' &&
			url.hostname.length > 0 &&
			url.username === '' &&
			url.password === ''
		);
	} catch {
		return (
			!value.startsWith('/') &&
			!value.includes('\\') &&
			!value.includes(':') &&
			!value.includes('\0') &&
			value
				.split('/')
				.every(
					(segment) =>
						segment.length > 0 &&
						segment !== '.' &&
						segment !== '..' &&
						/^[A-Za-z0-9._-]+$/u.test(segment)
				)
		);
	}
}

function compareReleasedVersions(left, right) {
	const leftParts = left.split('.').map(Number);
	const rightParts = right.split('.').map(Number);
	for (let index = 0; index < 3; index += 1) {
		if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
	}
	return 0;
}

function canonicalTypeNode(node, sourceFile) {
	if (ts.isParenthesizedTypeNode(node)) return canonicalTypeNode(node.type, sourceFile);
	if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
		const separator = ts.isUnionTypeNode(node) ? ' | ' : ' & ';
		return [...new Set(node.types.map((item) => canonicalTypeNode(item, sourceFile)))]
			.sort()
			.join(separator);
	}
	if (ts.isArrayTypeNode(node)) return `array<${canonicalTypeNode(node.elementType, sourceFile)}>`;
	if (ts.isTypeOperatorNode(node)) {
		const operand = canonicalTypeNode(node.type, sourceFile);
		if (node.operator === ts.SyntaxKind.ReadonlyKeyword && ts.isArrayTypeNode(node.type))
			return `readonly-array<${canonicalTypeNode(node.type.elementType, sourceFile)}>`;
		return `${ts.tokenToString(node.operator) ?? 'operator'}<${operand}>`;
	}
	if (ts.isTypeReferenceNode(node)) {
		const name = normalizeType(node.typeName.getText(sourceFile));
		const argumentsText = (node.typeArguments ?? []).map((argument) =>
			canonicalTypeNode(argument, sourceFile)
		);
		if ((name === 'Array' || name === 'ReadonlyArray') && argumentsText.length === 1)
			return `${name === 'Array' ? 'array' : 'readonly-array'}<${argumentsText[0]}>`;
		if (name === 'Readonly' && argumentsText.length === 1) return `readonly<${argumentsText[0]}>`;
		return argumentsText.length > 0 ? `${name}<${argumentsText.join(', ')}>` : name;
	}
	return normalizeType(node.getText(sourceFile));
}

function canonicalTypeText(value) {
	const sourceFile = ts.createSourceFile(
		'metadata-type.ts',
		`type __ZuiMetadataType = ${value};`,
		ts.ScriptTarget.Latest,
		true
	);
	if (sourceFile.parseDiagnostics.length > 0) return undefined;
	const declaration = sourceFile.statements.find(ts.isTypeAliasDeclaration);
	return declaration ? canonicalTypeNode(declaration.type, sourceFile) : undefined;
}

function closedMetadataTypeNode(node) {
	if (ts.isParenthesizedTypeNode(node)) return closedMetadataTypeNode(node.type);
	if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node))
		return node.types.every(closedMetadataTypeNode);
	if (ts.isArrayTypeNode(node)) return closedMetadataTypeNode(node.elementType);
	if (ts.isTypeOperatorNode(node)) return closedMetadataTypeNode(node.type);
	if (ts.isLiteralTypeNode(node)) return true;
	if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
		if (['Array', 'Readonly', 'ReadonlyArray'].includes(node.typeName.text))
			return (node.typeArguments ?? []).every(closedMetadataTypeNode);
		return ['File'].includes(node.typeName.text) && (node.typeArguments?.length ?? 0) === 0;
	}
	return [
		ts.SyntaxKind.AnyKeyword,
		ts.SyntaxKind.BigIntKeyword,
		ts.SyntaxKind.BooleanKeyword,
		ts.SyntaxKind.NeverKeyword,
		ts.SyntaxKind.NullKeyword,
		ts.SyntaxKind.NumberKeyword,
		ts.SyntaxKind.ObjectKeyword,
		ts.SyntaxKind.StringKeyword,
		ts.SyntaxKind.SymbolKeyword,
		ts.SyntaxKind.UndefinedKeyword,
		ts.SyntaxKind.UnknownKeyword,
		ts.SyntaxKind.VoidKeyword
	].includes(node.kind);
}

function closedMetadataTypeText(value) {
	const sourceFile = ts.createSourceFile(
		'metadata-closed-type.ts',
		`type __ZuiMetadataClosedType = ${value};`,
		ts.ScriptTarget.Latest,
		true
	);
	if (sourceFile.parseDiagnostics.length > 0) return false;
	const declaration = sourceFile.statements.find(ts.isTypeAliasDeclaration);
	return Boolean(declaration && closedMetadataTypeNode(declaration.type));
}

function metadataTypesEquivalent(left, right) {
	const canonicalLeft = canonicalTypeText(left);
	const canonicalRight = canonicalTypeText(right);
	return (
		canonicalLeft !== undefined && canonicalRight !== undefined && canonicalLeft === canonicalRight
	);
}

export function validateDeprecationMetadata({
	deprecatedPaths,
	deprecatedNames,
	entries,
	publicPaths,
	filename = 'metadata'
}) {
	const paths = new Set(deprecatedPaths ?? deprecatedNames ?? []);
	const knownPublicPaths = new Set(
		publicPaths ?? entries.map(({ path, name }) => path ?? name).filter(Boolean)
	);
	for (const entry of entries) {
		const entryPath = entry.path ?? entry.name;
		if (publicPaths && entryPath?.includes('.') && !knownPublicPaths.has(entryPath))
			throw new Error(
				`${filename} metadata member does not exist in the public type graph: ${entryPath ?? '<unnamed>'}.`
			);
		if (entry.since !== undefined && !lifecycleVersionPattern.test(entry.since))
			throw new Error(
				`${filename} ${entry.name ?? '<unnamed>'}.since must be unreleased or a stable x.y.z version.`
			);
		const hasLifecycle = [
			'deprecatedSince',
			'replacement',
			'replacementExternal',
			'removeAfter',
			'migration'
		].some((field) => entry[field] !== undefined);
		if (!hasLifecycle) continue;
		const path = entry.path ?? entry.name;
		if (!path || !paths.has(path))
			throw new Error(
				`${filename} metadata lifecycle does not match a @deprecated public API: ${path ?? '<unnamed>'}.`
			);
		const name = entry.name;
		if (entry.deprecatedSince !== undefined && !lifecycleVersionPattern.test(entry.deprecatedSince))
			throw new Error(
				`${filename} ${name}.deprecatedSince must be unreleased or a stable x.y.z version.`
			);
		if (entry.removeAfter !== undefined && !releasedVersionPattern.test(entry.removeAfter))
			throw new Error(`${filename} ${name}.removeAfter must be a stable x.y.z version.`);
		if (entry.migration !== undefined && !safeMigrationTarget(entry.migration))
			throw new Error(
				`${filename} ${name}.migration must be a safe repository-relative path or https URL.`
			);
		if (entry.deprecatedSince === undefined)
			throw new Error(`${filename} deprecation metadata for ${name} requires deprecatedSince.`);
		if (typeof entry.replacement !== 'string' || entry.replacement.length === 0)
			throw new Error(`${filename} deprecation metadata for ${name} requires replacement.`);
		const parent = path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : '';
		const replacementPath = parent ? `${parent}.${entry.replacement}` : entry.replacement;
		if (entry.replacement === name || replacementPath === path)
			throw new Error(`${filename} deprecation metadata for ${path} cannot replace itself.`);
		if (entry.replacementExternal !== true && !knownPublicPaths.has(replacementPath))
			throw new Error(
				`${filename} deprecation metadata for ${path} requires a same-level resolvable replacement or replacementExternal=true.`
			);
		if (entry.replacementExternal !== undefined && entry.replacementExternal !== true)
			throw new Error(`${filename} ${name}.replacementExternal must be true when specified.`);
		if (
			entry.since !== undefined &&
			entry.since !== 'unreleased' &&
			entry.deprecatedSince !== 'unreleased' &&
			compareReleasedVersions(entry.deprecatedSince, entry.since) < 0
		)
			throw new Error(`${filename} ${name} cannot be deprecated before it was introduced.`);
		if (
			entry.removeAfter !== undefined &&
			entry.deprecatedSince !== 'unreleased' &&
			compareReleasedVersions(entry.removeAfter, entry.deprecatedSince) <= 0
		)
			throw new Error(`${filename} ${name}.removeAfter must follow deprecatedSince.`);
	}
}

export function validateMemberMetadataFacts({ entries, publicFacts, filename = 'metadata' }) {
	for (const entry of entries) {
		const path = entry.path ?? entry.name;
		if (!path?.includes('.')) continue;
		const source = publicFacts.get(path);
		if (!source)
			throw new Error(
				`${filename} metadata member does not exist in the public type graph: ${path}.`
			);
		if (entry.requiredWhen !== undefined && entry.requiredWhen.trim() === '')
			throw new Error(`${filename} ${path}.requiredWhen must not be empty.`);
		const typeCandidates = source.typeCandidates ?? [source.declaredType];
		if (
			source.requiredness !== REQUIREDNESS.unknown &&
			source.declaredType !== 'unknown' &&
			typeof entry.type === 'string' &&
			!typeCandidates.some((candidate) => metadataTypesEquivalent(entry.type, candidate)) &&
			closedMetadataTypeText(entry.type) &&
			closedMetadataTypeText(source.declaredType)
		)
			throw new Error(
				`${filename} ${path}.type does not match its public type: ${entry.type} != ${source.declaredType}.`
			);
		if (source.requiredness === REQUIREDNESS.required) {
			if (entry.required !== true)
				throw new Error(`${filename} ${path} must be marked required from its public type.`);
			if (entry.requiredWhen !== undefined)
				throw new Error(
					`${filename} ${path} is unconditionally required and cannot use requiredWhen.`
				);
			continue;
		}
		if (source.requiredness === REQUIREDNESS.conditional) {
			if (entry.required === true)
				throw new Error(
					`${filename} ${path} is conditionally required and cannot be always required.`
				);
			if (entry.requiredWhen === undefined)
				throw new Error(`${filename} ${path} requires requiredWhen for its public union branches.`);
			continue;
		}
		if (source.requiredness === REQUIREDNESS.optional && entry.required === true)
			throw new Error(`${filename} ${path} is optional in its public type.`);
		if (source.requiredness === REQUIREDNESS.forbidden)
			throw new Error(`${filename} ${path} is forbidden in every public type branch.`);
	}
}

export function validateOpaqueMetadataFacts({ entries, publicFacts, filename = 'metadata' }) {
	const kinds = new Set([
		'caller-generic',
		'external-protocol',
		'external-descriptor',
		'dynamic-record'
	]);
	const resolutions = new Set(['generic-unexpanded', 'external-resolved', 'dynamic-key']);
	for (const entry of entries) {
		if (!entry.opaque) continue;
		if (entry.members === true)
			throw new Error(`${filename} ${entry.path} cannot declare both opaque and members.`);
		const opaque = entry.opaque;
		if (!kinds.has(opaque.kind) || !resolutions.has(opaque.resolution))
			throw new Error(`${filename} ${entry.path} opaque kind/resolution is invalid.`);
		if (!opaque.type || !opaque.reason?.trim() || !opaque.owner?.trim())
			throw new Error(`${filename} ${entry.path} opaque type/reason/owner is required.`);
		if (
			(opaque.kind === 'external-protocol' || opaque.kind === 'external-descriptor') &&
			!opaque.source?.trim()
		)
			throw new Error(`${filename} ${entry.path} opaque external source is required.`);
		if (
			opaque.kind === 'caller-generic' &&
			(!opaque.genericParameters?.length || opaque.resolution !== 'generic-unexpanded')
		)
			throw new Error(
				`${filename} ${entry.path} generic opaque metadata requires genericParameters.`
			);
		if (
			(opaque.kind === 'external-protocol' || opaque.kind === 'external-descriptor') &&
			opaque.resolution !== 'external-resolved'
		)
			throw new Error(
				`${filename} ${entry.path} external opaque must use external-resolved resolution.`
			);
		if (opaque.kind === 'dynamic-record' && opaque.resolution !== 'dynamic-key')
			throw new Error(`${filename} ${entry.path} dynamic-record must use dynamic-key resolution.`);
		const source = publicFacts.get(entry.path);
		if (!source)
			throw new Error(
				`${filename} ${entry.path} opaque prop does not exist in the public type graph.`
			);
		const typeCandidates = source.typeCandidates ?? [source.declaredType];
		if (
			opaque.genericParameters?.some(
				(parameter) => !(source.genericParameters ?? []).includes(parameter)
			)
		)
			throw new Error(
				`${filename} ${entry.path} opaque genericParameters are not declared by the public API.`
			);
		if (
			opaque.genericParameters?.some(
				(parameter) => !new RegExp(`\\b${parameter}\\b`, 'u').test(opaque.type)
			)
		)
			throw new Error(`${filename} ${entry.path} genericParameters do not occur in opaque type.`);
		if (opaque.kind === 'dynamic-record' && source.dynamicKey !== true)
			throw new Error(
				`${filename} ${entry.path} dynamic-record is not proven by a Record or index signature.`
			);
		if (
			!typeCandidates.some(
				(candidate) =>
					opaque.type.trim() === String(candidate).trim() ||
					metadataTypesEquivalent(opaque.type, candidate) ||
					(opaque.kind === 'dynamic-record' &&
						opaque.type.includes('Record') &&
						String(candidate).includes('Record'))
			)
		)
			throw new Error(
				`${filename} ${entry.path} opaque type does not match its public type: ${opaque.type} != ${source.declaredType}.`
			);
	}
}

if (process.argv.includes('--self-test')) {
	const componentPath = (...segments) => resolve(componentsRoot, ...segments);
	const listDeprecatedPaths = await scanWorkspacePropertyPaths(
		workspaceTypeGraph,
		componentPath('data-display', 'ZList.svelte'),
		'ZListProps'
	);
	if (![...listDeprecatedPaths].includes('items.id'))
		throw new Error('Workspace property scanner missed nested deprecated List items.id.');
	const importedCases = [
		[
			componentPath('navigation', 'ZCommandPalette.svelte'),
			'ZCommandPaletteProps',
			['items.key', 'items.label', 'items.keywords']
		],
		[
			componentPath('input', 'ZFileUpload.svelte'),
			'ZFileUploadProps',
			['files.id', 'files.file', 'files.status', 'files.progress', 'files.error']
		],
		[
			componentPath('input', 'ZCascader.svelte'),
			'ZCascaderProps',
			['nodes.key', 'nodes.label', 'nodes.parentKey', 'nodes.hasChildren']
		],
		[
			componentPath('input', 'ZTreeSelect.svelte'),
			'ZTreeSelectProps',
			['nodes.key', 'nodes.label', 'nodes.selectionDisabled']
		]
	];
	for (const [path, declarationName, expectedPaths] of importedCases) {
		const publicPaths = await scanWorkspacePropertyPaths(
			workspaceTypeGraph,
			path,
			declarationName,
			true
		);
		const missing = expectedPaths.filter((expected) => !publicPaths.has(expected));
		if (missing.length > 0)
			throw new Error(
				`Workspace property scanner missed ${declarationName} paths: ${missing.join(', ')}.`
			);
	}
	const drawerPaths = await scanWorkspacePropertyPaths(
		workspaceTypeGraph,
		componentPath('compound', 'drawer', 'ZDrawerContent.svelte'),
		'ZDrawerContentProps',
		true
	);
	if (
		!drawerPaths.has('dismissOnEscape') ||
		drawerPaths.has('appearance') ||
		drawerPaths.has('role')
	)
		throw new Error('Workspace property scanner did not preserve cross-file Omit semantics.');
	const valid = () =>
		validateDeprecationMetadata({
			deprecatedNames: ['old'],
			entries: [
				{
					name: 'old',
					deprecatedSince: 'unreleased',
					replacement: 'new',
					migration: 'docs/migrate.md'
				},
				{ name: 'new', since: '0.1.0' }
			]
		});
	valid();
	validateDeprecationMetadata({
		deprecatedPaths: ['items.meta.id'],
		entries: [
			{ path: 'items.meta.id', name: 'id', deprecatedSince: 'unreleased', replacement: 'key' },
			{ path: 'items.meta.key', name: 'key' },
			{ path: 'other.id', name: 'id' }
		]
	});
	try {
		validateDeprecationMetadata({
			deprecatedPaths: [],
			publicPaths: ['items', 'items.id'],
			entries: [{ path: 'items.meta.fake', name: 'fake' }],
			filename: 'nested member existence'
		});
		throw new Error('Deprecation validator self-test accepted a nonexistent nested member.');
	} catch (error) {
		if (!String(error).includes('does not exist')) throw error;
	}
	const semanticFacts = new Map([
		['items.required', { requiredness: REQUIREDNESS.required, declaredType: 'string | number' }],
		['items.optional', { requiredness: REQUIREDNESS.optional, declaredType: 'readonly string[]' }],
		['items.conditional', { requiredness: REQUIREDNESS.conditional, declaredType: 'boolean' }],
		['items.forbidden', { requiredness: REQUIREDNESS.forbidden, declaredType: 'never' }]
	]);
	validateMemberMetadataFacts({
		publicFacts: semanticFacts,
		entries: [
			{ path: 'items.required', required: true, type: 'number | string' },
			{ path: 'items.optional', type: 'ReadonlyArray<string>' },
			{ path: 'items.conditional', requiredWhen: 'selected branch', type: 'boolean' }
		]
	});
	validateOpaqueMetadataFacts({
		publicFacts: new Map([
			['rows', { declaredType: 'readonly TRow[]', genericParameters: ['TRow'] }],
			['record', { declaredType: 'Readonly<Record<string, boolean>>', dynamicKey: true }]
		]),
		entries: [
			{
				path: 'rows',
				opaque: {
					kind: 'caller-generic',
					resolution: 'generic-unexpanded',
					type: 'readonly TRow[]',
					genericParameters: ['TRow'],
					reason: 'caller-owned',
					owner: 'caller'
				}
			},
			{
				path: 'record',
				opaque: {
					kind: 'dynamic-record',
					resolution: 'dynamic-key',
					type: 'Readonly<Record<string, boolean>>',
					reason: 'dynamic keys',
					owner: 'caller',
					serializable: true
				}
			}
		]
	});
	for (const [label, entry, pattern] of [
		[
			'dynamic record without shape',
			{
				path: 'rows',
				opaque: {
					kind: 'dynamic-record',
					resolution: 'dynamic-key',
					type: '{ key: boolean }',
					reason: 'x',
					owner: 'x'
				}
			},
			/not proven/u
		],
		[
			'opaque with members',
			{
				path: 'rows',
				members: true,
				opaque: {
					kind: 'caller-generic',
					resolution: 'generic-unexpanded',
					type: 'readonly TRow[]',
					genericParameters: ['TRow'],
					reason: 'x',
					owner: 'x'
				}
			},
			/both opaque and members/u
		],
		[
			'opaque missing owner',
			{
				path: 'rows',
				opaque: {
					kind: 'caller-generic',
					resolution: 'generic-unexpanded',
					type: 'readonly TRow[]',
					genericParameters: ['TRow'],
					reason: 'x'
				}
			},
			/type\/reason\/owner/u
		],
		[
			'opaque undeclared generic parameter',
			{
				path: 'rows',
				opaque: {
					kind: 'caller-generic',
					resolution: 'generic-unexpanded',
					type: 'readonly TRow[] & TExtra',
					genericParameters: ['TRow', 'TExtra'],
					reason: 'x',
					owner: 'x'
				}
			},
			/not declared by the public API/u
		],
		[
			'opaque wrong type',
			{
				path: 'rows',
				opaque: {
					kind: 'caller-generic',
					resolution: 'generic-unexpanded',
					type: 'readonly TRow[] & unknown',
					genericParameters: ['TRow'],
					reason: 'x',
					owner: 'x'
				}
			},
			/does not match/u
		]
	]) {
		try {
			validateOpaqueMetadataFacts({
				publicFacts: new Map([
					['rows', { declaredType: 'readonly TRow[]', genericParameters: ['TRow'] }]
				]),
				entries: [entry],
				filename: label
			});
			throw new Error(`Opaque validator self-test accepted ${label}.`);
		} catch (error) {
			if (!pattern.test(String(error))) throw error;
		}
	}
	for (const [label, entry, pattern] of [
		['missing required', { path: 'items.required' }, /must be marked required/u],
		['optional required', { path: 'items.optional', required: true }, /is optional/u],
		['conditional required', { path: 'items.conditional', required: true }, /conditionally/u],
		['missing condition', { path: 'items.conditional' }, /requires requiredWhen/u],
		[
			'empty condition',
			{ path: 'items.conditional', requiredWhen: ' ' },
			/requiredWhen must not be empty/u
		],
		['wrong type', { path: 'items.optional', type: 'readonly number[]' }, /type does not match/u],
		['forbidden member', { path: 'items.forbidden' }, /forbidden/u]
	]) {
		try {
			validateMemberMetadataFacts({
				publicFacts: semanticFacts,
				entries: [entry],
				filename: label
			});
			throw new Error(`Member fact validator self-test accepted ${label}.`);
		} catch (error) {
			if (!pattern.test(String(error))) throw error;
		}
	}
	const external = () =>
		validateDeprecationMetadata({
			deprecatedNames: ['old'],
			entries: [
				{
					name: 'old',
					deprecatedSince: '0.1.0',
					replacement: 'aria-label',
					replacementExternal: true
				}
			]
		});
	external();
	validateDeprecationMetadata({
		deprecatedNames: ['old'],
		entries: [
			{
				name: 'old',
				deprecatedSince: '0.2.0',
				replacement: 'aria-label',
				replacementExternal: true,
				migration: 'https://example.com/migrations/old'
			}
		]
	});
	const rejects = [
		[
			'nested missing member',
			[{ path: 'items.id', name: 'id', deprecatedSince: 'unreleased', replacement: 'key' }],
			/resolvable replacement/u
		],
		[
			'same-name sibling mismatch',
			[
				{ path: 'other.id', name: 'id', deprecatedSince: 'unreleased', replacement: 'key' },
				{ path: 'items.key', name: 'key' }
			],
			/resolvable replacement/u
		],
		['missing deprecatedSince', [{ name: 'old', replacement: 'new' }], /requires deprecatedSince/u],
		[
			'orphan metadata',
			[{ name: 'other', deprecatedSince: 'unreleased', replacement: 'new' }],
			/does not match/u
		],
		[
			'missing replacement',
			[{ name: 'old', deprecatedSince: 'unreleased' }],
			/requires replacement/u
		],
		[
			'same replacement',
			[{ name: 'old', deprecatedSince: 'unreleased', replacement: 'old' }],
			/cannot replace itself/u
		],
		[
			'unresolved replacement',
			[{ name: 'old', deprecatedSince: 'unreleased', replacement: 'new' }],
			/resolvable replacement/u
		],
		['invalid since', [{ name: 'new', since: 'next' }], /\.since must be/u],
		[
			'invalid deprecatedSince',
			[{ name: 'old', deprecatedSince: 'next', replacement: 'new' }],
			/deprecatedSince must be/u
		],
		[
			'invalid removal',
			[{ name: 'old', deprecatedSince: 'unreleased', replacement: 'new', removeAfter: '1.0' }],
			/removeAfter must be/u
		],
		[
			'unsafe migration',
			[{ name: 'old', deprecatedSince: 'unreleased', replacement: 'new', migration: '../x.md' }],
			/safe repository-relative/u
		],
		[
			'replacementExternal false',
			[
				{
					name: 'old',
					deprecatedSince: 'unreleased',
					replacement: 'new',
					replacementExternal: false
				},
				{ name: 'new' }
			],
			/replacementExternal must be true/u
		],
		['stray lifecycle', [{ name: 'old', removeAfter: '1.0.0' }], /requires deprecatedSince/u],
		[
			'deprecated before introduction',
			[
				{
					name: 'old',
					since: '0.3.0',
					deprecatedSince: '0.2.0',
					replacement: 'new'
				},
				{ name: 'new' }
			],
			/deprecated before/u
		],
		[
			'removal before deprecation',
			[
				{
					name: 'old',
					deprecatedSince: '0.2.0',
					replacement: 'new',
					removeAfter: '0.2.0'
				},
				{ name: 'new' }
			],
			/must follow/u
		]
	];
	for (const [label, entries, expectedPattern] of rejects) {
		try {
			validateDeprecationMetadata({
				...(entries.some((entry) => entry.path)
					? { deprecatedPaths: [entries[0].path] }
					: { deprecatedNames: ['old'] }),
				entries,
				filename: label
			});
		} catch (error) {
			if (expectedPattern.test(String(error))) continue;
			throw new Error(`Deprecation validator self-test received an unexpected ${label} error.`, {
				cause: error
			});
		}
		throw new Error(`Deprecation validator self-test accepted ${label}.`);
	}
	console.log('Deprecation validator self-test passed.');
}

function declarationMap(sourceFile) {
	const declarations = new Map();
	for (const statement of sourceFile.statements) {
		if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
			declarations.set(statement.name.text, statement);
		}
	}
	return declarations;
}

function referenceName(node) {
	if (ts.isIdentifier(node)) return node.text;
	if (ts.isQualifiedName(node)) return normalizeType(node.getText());
	if (ts.isPropertyAccessExpression(node)) return normalizeType(node.getText());
	return normalizeType(node.getText());
}

function stringLiteralSet(node) {
	if (!node) return new Set();
	const nodes = ts.isUnionTypeNode(node) ? node.types : [node];
	return new Set(
		nodes
			.filter(ts.isLiteralTypeNode)
			.map(({ literal }) =>
				ts.isStringLiteral(literal) || ts.isNumericLiteral(literal) ? literal.text : undefined
			)
			.filter((value) => value !== undefined)
	);
}

function resolvedTypeText(node, sourceFile, declarations, seen = new Set(), parentPrecedence = 0) {
	if (ts.isParenthesizedTypeNode(node)) {
		return `(${resolvedTypeText(node.type, sourceFile, declarations, seen)})`;
	}
	if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
		const precedence = ts.isUnionTypeNode(node) ? 1 : 2;
		const separator = ts.isUnionTypeNode(node) ? ' | ' : ' & ';
		const text = node.types
			.map((item) => resolvedTypeText(item, sourceFile, declarations, seen, precedence))
			.join(separator);
		return parentPrecedence > precedence ? `(${text})` : text;
	}
	if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
		const name = node.typeName.text;
		const declaration = declarations.get(name);
		if (declaration && ts.isTypeAliasDeclaration(declaration) && !seen.has(name)) {
			const nextSeen = new Set(seen).add(name);
			if (
				ts.isUnionTypeNode(declaration.type) ||
				ts.isLiteralTypeNode(declaration.type) ||
				ts.isTypeReferenceNode(declaration.type) ||
				ts.isParenthesizedTypeNode(declaration.type)
			) {
				return resolvedTypeText(
					declaration.type,
					sourceFile,
					declarations,
					nextSeen,
					parentPrecedence
				);
			}
		}
	}
	return normalizeType(node.getText(sourceFile));
}

function collectProperty(member, context, include, exclude) {
	if (!ts.isPropertySignature(member)) return;
	const name = propertyName(member);
	if (!name || exclude.has(name) || (include && !include.has(name))) return;
	context.props.set(name, {
		name,
		required: !member.questionToken,
		type: member.type
			? resolvedTypeText(member.type, context.sourceFile, context.declarations)
			: 'unknown'
	});
	if (hasDeprecatedTag(member)) context.deprecatedProps.add(name);
}

function collectReference(name, typeArguments, context, include, exclude, printed) {
	if ((name === 'Omit' || name === 'Pick') && typeArguments?.[0]) {
		const selected = stringLiteralSet(typeArguments[1]);
		const nextInclude = name === 'Pick' ? selected : include;
		const nextExclude = name === 'Omit' ? new Set([...exclude, ...selected]) : exclude;
		collectType(typeArguments[0], context, nextInclude, nextExclude);
		return;
	}

	const declaration = context.declarations.get(name);
	if (declaration) {
		collectDeclaration(declaration, context, include, exclude);
		return;
	}

	context.inheritedFrom.add(printed);
}

function collectType(node, context, include = undefined, exclude = new Set()) {
	if (ts.isParenthesizedTypeNode(node)) {
		collectType(node.type, context, include, exclude);
		return;
	}
	if (ts.isTypeLiteralNode(node)) {
		for (const member of node.members) collectProperty(member, context, include, exclude);
		return;
	}
	if (ts.isIntersectionTypeNode(node)) {
		for (const type of node.types) collectType(type, context, include, exclude);
		return;
	}
	if (ts.isTypeReferenceNode(node)) {
		collectReference(
			referenceName(node.typeName),
			node.typeArguments,
			context,
			include,
			exclude,
			normalizeType(node.getText(context.sourceFile))
		);
		return;
	}
	context.inheritedFrom.add(normalizeType(node.getText(context.sourceFile)));
}

function collectHeritage(node, context, include, exclude) {
	collectReference(
		referenceName(node.expression),
		node.typeArguments,
		context,
		include,
		exclude,
		normalizeType(node.getText(context.sourceFile))
	);
}

function collectDeclaration(declaration, context, include = undefined, exclude = new Set()) {
	const name = declaration.name.text;
	if (context.seen.has(name)) return;
	context.seen.add(name);
	if (ts.isTypeAliasDeclaration(declaration)) {
		collectType(declaration.type, context, include, exclude);
	} else {
		for (const heritage of declaration.heritageClauses ?? []) {
			for (const type of heritage.types) collectHeritage(type, context, include, exclude);
		}
		for (const member of declaration.members) collectProperty(member, context, include, exclude);
	}
	context.seen.delete(name);
}

async function componentFacts(source, filename, path) {
	const match = /<script\s+module\s+lang=["']ts["']>([\s\S]*?)<\/script>/u.exec(source);
	if (!match) throw new Error(`${filename} is missing its TypeScript module script.`);
	const sourceFile = ts.createSourceFile(filename, match[1], ts.ScriptTarget.Latest, true);
	const metadata = metadataObject(sourceFile, filename);
	const id = stringProperty(metadata, 'id', sourceFile, filename);
	const name = stringProperty(metadata, 'name', sourceFile, filename);
	const sourcePath = stringProperty(metadata, 'source', sourceFile, filename);
	const propsType = `${name}Props`;
	const declarations = declarationMap(sourceFile);
	const declaration = declarations.get(propsType);
	if (!declaration) throw new Error(`${filename} must export ${propsType} for API extraction.`);
	const context = {
		declarations,
		inheritedFrom: new Set(),
		props: new Map(),
		deprecatedProps: new Set(),
		seen: new Set(),
		sourceFile
	};
	collectDeclaration(declaration, context);
	const documentedProps = new Set(
		['bindings', 'events', 'props', 'snippets'].flatMap((section) =>
			metadataItemNames(metadata, section)
		)
	);
	const metadataGapProps = [...context.props.keys()].filter(
		(name) =>
			!documentedProps.has(name) && name !== 'class' && name !== 'style' && !/^on[a-z]/u.test(name)
	);
	const metadataEntries = ['bindings', 'events', 'props', 'snippets'].flatMap((section) =>
		metadataItems(metadata, section).map((item) => ({ item, section }))
	);
	const flattenMetadataEntries = (entries, parentPath = '') =>
		entries.flatMap(({ item, section }) => {
			const name = objectStringProperty(item, 'name');
			const path = name ? (parentPath ? `${parentPath}.${name}` : name) : parentPath;
			return [
				{ item, section, path },
				...flattenMetadataEntries(
					metadataItems(item, 'members').map((member) => ({ item: member, section })),
					path
				)
			];
		});
	const allMetadataEntries = flattenMetadataEntries(metadataEntries);
	const nestedMetadataPaths = allMetadataEntries
		.map(({ path }) => path)
		.filter((path) => path?.includes('.'));
	if (new Set(nestedMetadataPaths).size !== nestedMetadataPaths.length)
		throw new Error(`${filename} repeats a nested metadata member path.`);
	const metadataByName = new Map(
		allMetadataEntries
			.map(({ item, section, path }) => [path, { item, section, path }])
			.filter(([path]) => path !== undefined)
	);
	const deprecatedPaths = await scanWorkspacePropertyPaths(workspaceTypeGraph, path, propsType);
	const publicFacts = await collectWorkspacePropertyFacts(workspaceTypeGraph, path, propsType);
	const publicPaths = new Set(publicFacts.keys());
	const missingDeprecationMetadata = [...deprecatedPaths].filter((path) => {
		const entry = metadataByName.get(path);
		return !entry || objectStringProperty(entry.item, 'deprecatedSince') === undefined;
	});
	if (missingDeprecationMetadata.length > 0) {
		throw new Error(
			`${filename} has @deprecated public API without structured metadata: ${missingDeprecationMetadata.join(', ')}.`
		);
	}
	validateDeprecationMetadata({
		deprecatedPaths,
		publicPaths,
		entries: allMetadataEntries.map(({ item, path }) => ({
			path,
			name: objectStringProperty(item, 'name'),
			since: objectStringProperty(item, 'since'),
			deprecatedSince: objectStringProperty(item, 'deprecatedSince'),
			replacement: objectStringProperty(item, 'replacement'),
			replacementExternal: objectBooleanProperty(item, 'replacementExternal'),
			removeAfter: objectStringProperty(item, 'removeAfter'),
			migration: objectStringProperty(item, 'migration')
		})),
		filename
	});
	validateOpaqueMetadataFacts({
		publicFacts,
		entries: allMetadataEntries.map(({ item, path }) => {
			const opaque = objectObjectProperty(item, 'opaque');
			return {
				path,
				members: objectPropertyPresent(item, 'members'),
				opaque: opaque
					? {
							kind: objectStringProperty(opaque, 'kind'),
							resolution: objectStringProperty(opaque, 'resolution'),
							type: objectStringProperty(opaque, 'type'),
							genericParameters: objectStringArrayProperty(opaque, 'genericParameters'),
							source: objectStringProperty(opaque, 'source'),
							reason: objectStringProperty(opaque, 'reason'),
							owner: objectStringProperty(opaque, 'owner'),
							serializable: objectBooleanProperty(opaque, 'serializable')
						}
					: undefined
			};
		}),
		filename
	});
	validateMemberMetadataFacts({
		publicFacts,
		entries: allMetadataEntries.map(({ item, path }) => ({
			path,
			name: objectStringProperty(item, 'name'),
			required: objectBooleanProperty(item, 'required'),
			requiredWhen: objectStringProperty(item, 'requiredWhen'),
			type: objectStringProperty(item, 'type')
		})),
		filename
	});
	const opaqueProps = allMetadataEntries
		.filter(({ item }) => objectPropertyPresent(item, 'opaque'))
		.map(({ item, path }) => ({
			path,
			kind: objectStringProperty(objectObjectProperty(item, 'opaque'), 'kind')
		}));
	return {
		declaration: propsType,
		id,
		inheritedFrom: [...context.inheritedFrom].sort(),
		name,
		props: [...context.props.values()],
		...(opaqueProps.length > 0 ? { opaqueProps } : {}),
		source: sourcePath,
		metadataGapProps
	};
}

function factExportName(id) {
	return `${id.replace(/-([a-z0-9])/gu, (_, character) => character.toUpperCase())}ApiFacts`;
}

const facts = {};
for (const path of await filesUnder(componentsRoot, '.svelte')) {
	const source = await readFile(path, 'utf8');
	if (!source.includes('export const zuiMetadata')) continue;
	const filename = portable(relative(workspaceRoot, path));
	const component = await componentFacts(source, filename, path);
	if (facts[component.id]) throw new Error(`Duplicate component API id ${component.id}.`);
	facts[component.id] = component;
}
function parseDocTeaching(source, filename) {
	const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
	let result;
	function visit(node) {
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === 'defineComponentDoc' &&
			node.arguments.length >= 2 &&
			ts.isObjectLiteralExpression(node.arguments[1])
		) {
			const properties = node.arguments[1].properties;
			const sourceApi = properties.find(
				(property) =>
					ts.isPropertyAssignment(property) &&
					ts.isIdentifier(property.name) &&
					property.name.text === 'sourceApi'
			);
			const teaching = properties.find(
				(property) =>
					ts.isPropertyAssignment(property) &&
					ts.isIdentifier(property.name) &&
					property.name.text === 'teaching'
			);
			const teachingProps = [];
			if (teaching && ts.isObjectLiteralExpression(teaching.initializer)) {
				const props = teaching.initializer.properties.find(
					(property) =>
						ts.isPropertyAssignment(property) &&
						ts.isIdentifier(property.name) &&
						property.name.text === 'props'
				);
				if (props && ts.isObjectLiteralExpression(props.initializer)) {
					for (const property of props.initializer.properties) {
						if (ts.isPropertyAssignment(property) && property.name) {
							teachingProps.push(property.name.getText(file).replace(/^['"]|['"]$/gu, ''));
						}
					}
				}
			}
			result = {
				sourceApi:
					sourceApi && ts.isIdentifier(sourceApi.initializer)
						? sourceApi.initializer.text
						: undefined,
				teachingProps
			};
		}
		ts.forEachChild(node, visit);
	}
	visit(file);
	return result;
}
const docsFiles = await filesUnder(resolve(docsRoot, 'src/content/components'), '.ts');
const teachingByFact = new Map();
for (const path of docsFiles) {
	const parsed = parseDocTeaching(
		await readFile(path, 'utf8'),
		portable(relative(workspaceRoot, path))
	);
	if (!parsed?.sourceApi) continue;
	const id = Object.keys(facts).find((candidate) => factExportName(candidate) === parsed.sourceApi);
	if (id) teachingByFact.set(id, new Set(parsed.teachingProps));
}
if (process.argv.includes('--self-test')) {
	const dataTableTeaching = teachingByFact.get('data-table');
	if (!dataTableTeaching || dataTableTeaching.size < 22)
		throw new Error('Teaching AST self-test expected DataTable teaching props.');
	const dataTableFact = facts['data-table'];
	if (dataTableFact?.metadataGapProps.length !== 0)
		throw new Error('Teaching AST self-test expected complete DataTable metadata.');
	const nested = parseDocTeaching(
		`defineComponentDoc(meta, { demos: [{ teaching: { props: { fake: {} } } }] })`,
		'nested.ts'
	);
	if (nested?.teachingProps.length !== 0)
		throw new Error('Teaching AST self-test misread nested demo props.');
	console.log('Teaching AST self-test passed.');
	process.exit(0);
}
const teachingCoverage = Object.values(facts).map((fact) => {
	const sourceDirectory = fact.source.slice(0, fact.source.lastIndexOf('/'));
	const directoryName = sourceDirectory.slice(sourceDirectory.lastIndexOf('/') + 1);
	const family = sourceDirectory.includes('/components/compound/') ? directoryName : undefined;
	const metadataGapPropNames = fact.metadataGapProps;
	const teachingProps = teachingByFact.get(fact.id) ?? new Set();
	const fallbackPropNames = metadataGapPropNames.filter((name) => !teachingProps.has(name));
	return {
		id: fact.id,
		name: fact.name,
		source: fact.source,
		family,
		declaredPropCount: fact.props.length,
		metadataGapPropCount: metadataGapPropNames.length,
		metadataGapPropNames,
		fallbackPropCount: fallbackPropNames.length,
		fallbackPropNames,
		...(fact.opaqueProps?.length
			? {
					opaqueStructuredProps: fact.opaqueProps,
					opaqueByKind: Object.fromEntries(
						[...new Set(fact.opaqueProps.map(({ kind }) => kind))].map((kind) => [
							kind,
							fact.opaqueProps.filter((item) => item.kind === kind).length
						])
					)
				}
			: {})
	};
});
const teachingCoverageOutput = {
	components: teachingCoverage,
	policy: {
		maxFallbackProps: 0,
		maxMetadataGapProps: 0
	},
	totals: {
		components: teachingCoverage.length,
		declaredProps: teachingCoverage.reduce((sum, item) => sum + item.declaredPropCount, 0),
		metadataGapProps: teachingCoverage.reduce((sum, item) => sum + item.metadataGapPropCount, 0),
		fallbackProps: teachingCoverage.reduce((sum, item) => sum + item.fallbackPropCount, 0),
		opaqueStructuredProps: teachingCoverage.reduce(
			(sum, item) => sum + (item.opaqueStructuredProps?.length ?? 0),
			0
		),
		opaqueByKind: Object.fromEntries(
			[...new Set(teachingCoverage.flatMap((item) => Object.keys(item.opaqueByKind ?? {})))].map(
				(kind) => [
					kind,
					teachingCoverage.reduce((sum, item) => sum + (item.opaqueByKind?.[kind] ?? 0), 0)
				]
			)
		)
	}
};
const incompleteMetadata = teachingCoverage.filter(
	(item) => item.metadataGapPropCount > 0 || item.fallbackPropCount > 0
);
if (incompleteMetadata.length > 0) {
	throw new Error(
		`Every public component prop requires owned API metadata. Incomplete components: ${incompleteMetadata
			.map(
				(item) =>
					`${item.name} (${item.metadataGapPropNames.join(', ') || 'no metadata gaps'}; fallback: ${item.fallbackPropNames.join(', ') || 'none'})`
			)
			.join('; ')}.`
	);
}
const teachingCoverageJson = JSON.stringify(teachingCoverageOutput, null, '\t');
const topFallback = [...teachingCoverage]
	.sort(
		(left, right) =>
			right.fallbackPropCount - left.fallbackPropCount ||
			right.metadataGapPropCount - left.metadataGapPropCount ||
			left.id.localeCompare(right.id)
	)
	.slice(0, 20);
const teachingCoverageMarkdownSource = [
	'# API teaching coverage',
	'',
	`Generated from ${teachingCoverageOutput.totals.components} components and ${teachingCoverageOutput.totals.declaredProps} declared props. ${teachingCoverageOutput.totals.metadataGapProps} metadata gaps remain; ${teachingCoverageOutput.totals.fallbackProps} remain true fallbacks after teaching overrides; ${teachingCoverageOutput.totals.opaqueStructuredProps} structured props are explicitly opaque.`,
	'',
	'Policy: every declared public prop must have owned component metadata, binding, event or snippet evidence; both totals are enforced at zero.',
	'',
	'| Component | Family | Declared props | Metadata gaps | True fallback props | Fallback names | Source |',
	'|---|---|---:|---:|---:|---|---|',
	...topFallback.map(
		(item) =>
			`| ${item.name} | ${item.family ?? '—'} | ${item.declaredPropCount} | ${item.metadataGapPropCount} | ${item.fallbackPropCount} | ${item.fallbackPropNames.join(', ') || '—'} | ${item.source} |`
	),
	''
].join('\n');
const serializedTeachingCoverageJson = await format(teachingCoverageJson, {
	...(await resolveConfig(teachingCoverageJsonPath)),
	filepath: teachingCoverageJsonPath
});
const serializedTeachingCoverageMarkdown = await format(teachingCoverageMarkdownSource, {
	...(await resolveConfig(teachingCoverageMarkdownPath)),
	filepath: teachingCoverageMarkdownPath
});

const generatedSource = `import type { ComponentApiFacts } from './component-api.js';\n\n// Generated by scripts/generate-component-api.mjs. Do not edit by hand.\n${Object.values(
	facts
)
	.map((fact) => {
		const directory = fact.source.slice(0, fact.source.lastIndexOf('/'));
		const familyId = directory.slice(directory.lastIndexOf('/') + 1);
		const members =
			fact.id === familyId
				? Object.values(facts)
						.filter(
							(candidate) =>
								candidate.source.slice(0, candidate.source.lastIndexOf('/')) === directory &&
								candidate.id !== fact.id
						)
						.map((candidate) => factExportName(candidate.id))
				: [];
		const serializedFact = JSON.stringify(fact, null, '\t');
		const withMembers = members.length
			? serializedFact.replace(/\n\}\s*$/u, `,\n\tmembers: () => [${members.join(', ')}]\n}`)
			: serializedFact;
		return `export const ${factExportName(fact.id)} = ${withMembers} as const satisfies ComponentApiFacts;`;
	})
	.join('\n\n')}\n`;
const serialized = await format(generatedSource, {
	...(await resolveConfig(outputPath)),
	filepath: outputPath
});

if (write) {
	await writeFile(outputPath, serialized);
	await writeFile(teachingCoverageJsonPath, serializedTeachingCoverageJson);
	await writeFile(teachingCoverageMarkdownPath, serializedTeachingCoverageMarkdown);
	console.log(`Wrote ${portable(relative(workspaceRoot, outputPath))}.`);
} else {
	const current = await readFile(outputPath, 'utf8').catch(() => '');
	if (current !== serialized) {
		throw new Error(
			'Generated component API facts are stale. Run `pnpm --filter @zadmin/docs api:source:update`.'
		);
	}
	const [currentCoverageJson, currentCoverageMarkdown] = await Promise.all([
		readFile(teachingCoverageJsonPath, 'utf8').catch(() => ''),
		readFile(teachingCoverageMarkdownPath, 'utf8').catch(() => '')
	]);
	const staleCoverage = [];
	if (currentCoverageJson !== serializedTeachingCoverageJson)
		staleCoverage.push(portable(relative(workspaceRoot, teachingCoverageJsonPath)));
	if (currentCoverageMarkdown !== serializedTeachingCoverageMarkdown)
		staleCoverage.push(portable(relative(workspaceRoot, teachingCoverageMarkdownPath)));
	if (staleCoverage.length > 0) {
		throw new Error(
			`API teaching coverage artifacts are missing or stale: ${staleCoverage.join(', ')}. Run pnpm --filter @zadmin/docs api:source:update.`
		);
	}
	const metadataGapProps = Object.values(facts).reduce(
		(total, fact) => total + fact.metadataGapProps.length,
		0
	);
	console.log(
		`Component API facts verified (${Object.keys(facts).length} components; ${metadataGapProps} metadata gaps; ${teachingCoverageOutput.totals.fallbackProps} true fallbacks after teaching overrides).`
	);
}
