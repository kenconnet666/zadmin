import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

import { WorkspaceTypeGraph } from './workspace-type-graph.mjs';

export const REQUIREDNESS = Object.freeze({
	required: 'required',
	optional: 'optional',
	conditional: 'conditional',
	forbidden: 'forbidden',
	unknown: 'unknown'
});

const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

function text(node, sourceFile) {
	return node === undefined ? 'unknown' : node.getText(sourceFile).replace(/\s+/gu, ' ').trim();
}

function nameOf(node) {
	if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node))
		return node.text;
	return undefined;
}

function refName(node) {
	return ts.isIdentifier(node) ? node.text : node.getText();
}

function substitutedType(node, context) {
	if (!node || !ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName))
		return { node, sourceFile: context.sourceFile };
	const binding = context.bindings.get(node.typeName.text);
	return binding === undefined
		? { node, sourceFile: context.sourceFile }
		: substitutedType(binding.node, binding.context);
}

function dynamicRecordShape(node, context, seen = new Set()) {
	if (!node) return false;
	if (ts.isParenthesizedTypeNode(node)) return dynamicRecordShape(node.type, context, seen);
	if (ts.isTypeOperatorNode(node))
		return node.operator === ts.SyntaxKind.ReadonlyKeyword
			? dynamicRecordShape(node.type, context, seen)
			: false;
	if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node))
		return node.types.some((type) => dynamicRecordShape(type, context, seen));
	if (ts.isTypeLiteralNode(node))
		return node.members.some((member) => ts.isIndexSignatureDeclaration(member));
	if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) return false;
	const name = node.typeName.text;
	if (name === 'Record') return true;
	if (name === 'Readonly' && node.typeArguments?.[0])
		return dynamicRecordShape(node.typeArguments[0], context, seen);
	const binding = context.bindings.get(name);
	if (binding) return dynamicRecordShape(binding.node, binding.context, seen);
	const resolutionKey = `${context.modulePath}#${name}`;
	if (seen.has(resolutionKey)) return false;
	seen.add(resolutionKey);
	const declaration = context.declarations?.get(name);
	const result = declaration
		? ts.isTypeAliasDeclaration(declaration)
			? dynamicRecordShape(declaration.type, context, seen)
			: declaration.members.some((member) => ts.isIndexSignatureDeclaration(member))
		: false;
	seen.delete(resolutionKey);
	return result;
}

function renderedType(node, context, parentPrecedence = 0) {
	if (!node) return 'unknown';
	if (ts.isParenthesizedTypeNode(node)) return `(${renderedType(node.type, context)})`;
	if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
		const binding = context.bindings.get(node.typeName.text);
		if (binding) return renderedType(binding.node, binding.context, parentPrecedence);
		const argumentsText = node.typeArguments?.map((argument) => renderedType(argument, context));
		return argumentsText?.length
			? `${node.typeName.text}<${argumentsText.join(', ')}>`
			: node.typeName.text;
	}
	if (ts.isArrayTypeNode(node)) {
		const element = renderedType(node.elementType, context, 3);
		return `${element}[]`;
	}
	if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
		const precedence = ts.isUnionTypeNode(node) ? 1 : 2;
		const separator = ts.isUnionTypeNode(node) ? ' | ' : ' & ';
		const value = node.types.map((item) => renderedType(item, context, precedence)).join(separator);
		return parentPrecedence > precedence ? `(${value})` : value;
	}
	return text(node, context.sourceFile);
}

function literalKeys(node) {
	if (!node) return undefined;
	const values = ts.isUnionTypeNode(node) ? node.types : [node];
	const keys = values.map((item) => {
		if (!ts.isLiteralTypeNode(item)) return undefined;
		return ts.isStringLiteral(item.literal) || ts.isNumericLiteral(item.literal)
			? String(item.literal.text)
			: undefined;
	});
	return keys.every((key) => key !== undefined) ? new Set(keys) : undefined;
}

function fact(path, member, context, requiredness, typeNode) {
	if (ts.isMethodSignature(member) || ts.isMethodDeclaration(member)) {
		const methodTypeParameters = member.typeParameters ?? [];
		const methodBindings = new Map(context.bindings);
		for (const parameter of methodTypeParameters) methodBindings.delete(parameter.name.text);
		const methodContext = {
			...context,
			bindings: methodBindings,
			genericParameters: new Set([
				...(context.genericParameters ?? []),
				...methodTypeParameters.map((parameter) => parameter.name.text)
			])
		};
		const genericParameters = member.typeParameters?.length
			? `<${member.typeParameters
					.map((parameter) => {
						const constraint = parameter.constraint
							? ` extends ${renderedType(parameter.constraint, methodContext)}`
							: '';
						const defaultType = parameter.default
							? ` = ${renderedType(parameter.default, methodContext)}`
							: '';
						return `${parameter.name.text}${constraint}${defaultType}`;
					})
					.join(', ')}>`
			: '';
		const parameterType = (parameter) => {
			const prefix = parameter.dotDotDotToken ? '...' : '';
			const optional = parameter.questionToken ? '?' : '';
			return `${prefix}${text(parameter.name, context.sourceFile)}${optional}: ${renderedType(parameter.type, methodContext)}`;
		};
		const declaredType = `${genericParameters}(${member.parameters.map(parameterType).join(', ')}) => ${renderedType(member.type, methodContext)}`;
		return {
			path,
			requiredness,
			valueAllowsUndefined: requiredness !== REQUIREDNESS.required,
			declaredType,
			typeCandidates: [declaredType],
			genericParameters: [...methodContext.genericParameters],
			source: { modulePath: context.modulePath, declaration: context.declaration }
		};
	}
	const resolved = substitutedType(typeNode ?? member.type, context);
	const resolvedType = resolved.node;
	const declaredType = renderedType(typeNode ?? member.type, context);
	const authoredType = text(typeNode ?? member.type, context.sourceFile);
	const allowsUndefined =
		requiredness === REQUIREDNESS.optional ||
		requiredness === REQUIREDNESS.unknown ||
		(resolvedType !== undefined &&
			ts.isUnionTypeNode(resolvedType) &&
			resolvedType.types.some((item) => item.kind === ts.SyntaxKind.UndefinedKeyword));
	return {
		path,
		requiredness,
		valueAllowsUndefined: allowsUndefined,
		declaredType,
		typeCandidates: [...new Set([declaredType, authoredType])],
		dynamicKey: dynamicRecordShape(typeNode ?? member.type, context),
		genericParameters: [...(context.genericParameters ?? [])],
		source: { modulePath: context.modulePath, declaration: context.declaration }
	};
}

function mergeRequiredness(values, kind) {
	if (values.every((value) => value === REQUIREDNESS.required)) return REQUIREDNESS.required;
	if (values.every((value) => value === REQUIREDNESS.forbidden)) return REQUIREDNESS.forbidden;
	if (kind === 'union') {
		if (values.every((value) => value === REQUIREDNESS.optional)) return REQUIREDNESS.optional;
		return REQUIREDNESS.conditional;
	}
	if (values.some((value) => value === REQUIREDNESS.required)) return REQUIREDNESS.required;
	if (values.some((value) => value === REQUIREDNESS.unknown)) return REQUIREDNESS.unknown;
	if (values.some((value) => value === REQUIREDNESS.conditional)) return REQUIREDNESS.conditional;
	return REQUIREDNESS.optional;
}

function mergeFacts(facts, kind) {
	const grouped = new Map();
	for (const item of facts)
		(grouped.get(item.path) ?? grouped.set(item.path, []).get(item.path)).push(item);
	return new Map(
		[...grouped].map(([path, items]) => {
			const first = items[0];
			const typedItems =
				kind === 'union' && items.some((item) => item.requiredness !== REQUIREDNESS.forbidden)
					? items.filter((item) => item.requiredness !== REQUIREDNESS.forbidden)
					: items;
			const types = [...new Set(typedItems.map((item) => item.declaredType))];
			const typeCandidates = [
				...new Set(typedItems.flatMap((item) => item.typeCandidates ?? [item.declaredType]))
			];
			return [
				path,
				{
					...first,
					declaredType:
						types.length === 1 ? types[0] : types.join(kind === 'union' ? ' | ' : ' & '),
					typeCandidates,
					requiredness: mergeRequiredness(
						items.map((item) => item.requiredness),
						kind
					),
					valueAllowsUndefined: items.some((item) => item.valueAllowsUndefined)
				}
			];
		})
	);
}

function hasForbiddenAncestor(items, path) {
	const segments = path.split('.');
	for (let length = segments.length - 1; length > 0; length -= 1) {
		const ancestor = segments.slice(0, length).join('.');
		if (
			items.some((item) => item.path === ancestor && item.requiredness === REQUIREDNESS.forbidden)
		)
			return true;
	}
	return false;
}

/** Collects public property facts without a TypeScript checker or external package resolution. */
export async function collectWorkspacePropertyFacts(graph, modulePath, rootName, options = {}) {
	const active = new Set();

	async function visitType(node, context, path = '', modifiers = {}) {
		if (!node) return [];
		if (ts.isParenthesizedTypeNode(node)) return visitType(node.type, context, path, modifiers);
		if (ts.isArrayTypeNode(node)) return visitType(node.elementType, context, path, modifiers);
		if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.ReadonlyKeyword)
			return visitType(node.type, context, path, modifiers);
		if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
			const branchFacts = [];
			for (const branch of node.types)
				branchFacts.push(await visitType(branch, context, path, modifiers));
			const allPaths = new Set(branchFacts.flatMap((items) => items.map((item) => item.path)));
			const branches = ts.isUnionTypeNode(node)
				? [...allPaths].flatMap((factPath) =>
						branchFacts
							.filter((items) => !hasForbiddenAncestor(items, factPath))
							.map(
								(items) =>
									items.find((item) => item.path === factPath) ?? {
										path: factPath,
										requiredness: REQUIREDNESS.forbidden,
										valueAllowsUndefined: true,
										declaredType: 'never',
										source: { modulePath: context.modulePath, declaration: context.declaration }
									}
							)
					)
				: branchFacts.flat();
			const merged = mergeFacts(branches, ts.isUnionTypeNode(node) ? 'union' : 'intersection');
			return [...merged.values()];
		}
		if (ts.isTypeLiteralNode(node)) {
			const facts = [];
			for (const member of node.members) {
				if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) continue;
				const name = nameOf(member.name);
				if (
					!name ||
					(modifiers.include && !modifiers.include.has(name)) ||
					modifiers.exclude?.has(name)
				)
					continue;
				const childPath = path ? `${path}.${name}` : name;
				const isNever = member.type && member.type.kind === ts.SyntaxKind.NeverKeyword;
				let requiredness = isNever
					? REQUIREDNESS.forbidden
					: member.questionToken
						? REQUIREDNESS.optional
						: REQUIREDNESS.required;
				if (modifiers.optional && requiredness === REQUIREDNESS.required)
					requiredness = REQUIREDNESS.optional;
				if (modifiers.required && requiredness !== REQUIREDNESS.forbidden)
					requiredness = REQUIREDNESS.required;
				const current = fact(childPath, member, context, requiredness, member.type);
				facts.push(current);
				if (!isNever) facts.push(...(await visitType(member.type, context, childPath, {})));
			}
			return facts;
		}
		if (!ts.isTypeReferenceNode(node)) return [];
		const name = refName(node.typeName);
		const args = node.typeArguments ?? [];
		if (name === 'Partial' && args[0])
			return visitType(args[0], context, path, { ...modifiers, optional: true });
		if (name === 'Required' && args[0])
			return visitType(args[0], context, path, { ...modifiers, required: true });
		if ((name === 'Pick' || name === 'Omit') && args[0]) {
			const keys = literalKeys(args[1]);
			if (!keys) return [];
			return visitType(args[0], context, path, {
				...modifiers,
				include: name === 'Pick' ? keys : modifiers.include,
				exclude: name === 'Omit' ? keys : modifiers.exclude
			});
		}
		if (['Array', 'ReadonlyArray', 'Readonly'].includes(name) && args[0])
			return visitType(args[0], context, path, modifiers);
		const binding = context.bindings.get(name);
		if (binding) return visitType(binding.node, binding.context, path, modifiers);
		const resolution = await graph.resolveDeclaration(context.modulePath, name, args);
		if (resolution.status !== 'local') {
			return [];
		}
		const identity = `${resolution.path}#${resolution.name}<${args.map((arg) => text(arg, context.sourceFile)).join(',')}>`;
		if (active.has(identity)) {
			return [];
		}
		const bindings = new Map();
		const next = {
			bindings,
			declarations: resolution.declarations,
			genericParameters: context.genericParameters,
			modulePath: resolution.path,
			declaration: resolution.name,
			sourceFile: resolution.declaration.getSourceFile()
		};
		for (const [index, parameter] of (resolution.declaration.typeParameters ?? []).entries()) {
			const argument = args[index];
			if (argument) bindings.set(parameter.name.text, { node: argument, context });
			else if (parameter.default)
				bindings.set(parameter.name.text, { node: parameter.default, context: next });
		}
		active.add(identity);
		const output = await visitDeclaration(resolution.declaration, next, path, modifiers);
		active.delete(identity);
		return output;
	}

	async function visitDeclaration(declaration, context, path, modifiers = {}) {
		if (ts.isTypeAliasDeclaration(declaration))
			return visitType(declaration.type, context, path, modifiers);
		const output = [];
		for (const heritage of declaration.heritageClauses ?? [])
			for (const type of heritage.types)
				output.push(...(await visitType(type, context, path, modifiers)));
		for (const member of declaration.members) {
			if (
				!ts.isPropertySignature(member) &&
				!ts.isPropertyDeclaration(member) &&
				!ts.isMethodSignature(member) &&
				!ts.isMethodDeclaration(member)
			)
				continue;
			const name = nameOf(member.name);
			if (
				!name ||
				(modifiers.include && !modifiers.include.has(name)) ||
				modifiers.exclude?.has(name)
			)
				continue;
			const childPath = path ? `${path}.${name}` : name;
			const isNever = member.type && member.type.kind === ts.SyntaxKind.NeverKeyword;
			let requiredness = isNever
				? REQUIREDNESS.forbidden
				: member.questionToken
					? REQUIREDNESS.optional
					: REQUIREDNESS.required;
			if (modifiers.optional && requiredness === REQUIREDNESS.required)
				requiredness = REQUIREDNESS.optional;
			if (modifiers.required && !isNever) requiredness = REQUIREDNESS.required;
			const current = fact(childPath, member, context, requiredness, member.type);
			output.push(current);
			if (!isNever) output.push(...(await visitType(member.type, context, childPath, {})));
		}
		return output;
	}

	let root;
	let rootContext;
	let output;
	if (options.typeNode) {
		const module = await graph.load(options.modulePath ?? modulePath);
		if (module.status !== 'local')
			throw new Error(`${modulePath} cannot load callable type source.`);
		rootContext = options.context ?? {
			bindings: new Map(),
			declarations: module.declarations,
			genericParameters: new Set(),
			modulePath: module.path,
			declaration: options.declaration ?? '<type>',
			sourceFile: options.sourceFile ?? module.file
		};
		output = await visitType(options.typeNode, rootContext, '');
	} else {
		root = await graph.resolveDeclaration(modulePath, rootName);
		if (root.status !== 'local') throw new Error(`${modulePath} cannot resolve ${rootName}.`);
		const rootBindings = new Map();
		rootContext = {
			bindings: rootBindings,
			declarations: root.declarations,
			genericParameters: new Set(
				(root.declaration.typeParameters ?? []).map((parameter) => parameter.name.text)
			),
			modulePath: root.path,
			declaration: root.name,
			sourceFile: root.declaration.getSourceFile()
		};
		for (const parameter of root.declaration.typeParameters ?? [])
			if (parameter.default)
				rootBindings.set(parameter.name.text, { node: parameter.default, context: rootContext });
		output = await visitDeclaration(root.declaration, rootContext, '');
	}
	return mergeFacts(output, 'intersection');
}

/** Collect members from an already resolved type node, preserving its generic bindings. */
export async function collectWorkspacePropertyFactsFromType(graph, typeNode, context) {
	return collectWorkspacePropertyFacts(graph, context.modulePath, '<type>', {
		typeNode,
		modulePath: context.modulePath,
		sourceFile: context.sourceFile,
		context
	});
}

if (isMain && process.argv.includes('--self-test')) {
	const { mkdtemp, mkdir, rm, writeFile } = await import('node:fs/promises');
	const { tmpdir } = await import('node:os');
	const root = await mkdtemp(resolve(tmpdir(), 'zadmin-property-facts-'));
	try {
		await mkdir(resolve(root, 'src'), { recursive: true });
		await writeFile(
			resolve(root, 'src/shared.ts'),
			[
				'export interface Item<T> { required: T; optional?: string; forbidden?: never; }',
				'export interface DefaultItem<T ' + '= number> { value: T; }',
				'export type Left = { left: string };',
				'export type Right = { right: string };',
				'export type Alias = Item<string>;'
			].join('\n'),
			'utf8'
		);
		await writeFile(
			resolve(root, 'src/props.ts'),
			// language=TypeScript
			`import type { Alias, DefaultItem, Item, Left, Right } from './shared.js';
type Dyn = Readonly<Record<string, boolean>>;
export type Props<T = string> = {
	plain: string;
	maybe: string | undefined;
	union: { a: string } | { b: string };
	namedUnion: Left | Right;
	mode:
		| { items: Array<{ name: string }>; children?: never }
		| { items?: never; children: string };
	both: { x: string } & { y?: number };
	partial: Partial<Alias>;
	required: Required<Alias>;
	picked: Pick<Alias, 'required'>;
	inlinePicked: Pick<{ keep: string; drop: number }, 'keep'>;
	omitted: Omit<Alias, 'optional'>;
	generic: Item<boolean>;
	genericArray: Item<boolean[]>;
	defaultGeneric: DefaultItem;
	dyn?: Dyn;
	fixed?: { key: boolean };
	genericOpaque?: T;
	method<T extends string = string>(value: T, optional?: number, ...rest: boolean[]): T;
	optionalMethod?(value: string): void;
};`,
			'utf8'
		);
		const graph = new WorkspaceTypeGraph({ workspaceRoot: root });
		const facts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'Props'
		);
		const expectFact = (path, requiredness, typePart) => {
			const item = facts.get(path);
			if (
				!item ||
				item.requiredness !== requiredness ||
				(typePart && !item.declaredType.includes(typePart))
			)
				throw new Error(`fact mismatch: ${path}`);
		};
		expectFact('plain', 'required', 'string');
		expectFact('maybe', 'required', 'string | undefined');
		expectFact('union.a', 'conditional', 'string');
		expectFact('namedUnion.left', 'conditional', 'string');
		expectFact('mode.items', 'conditional', 'Array');
		expectFact('mode.items.name', 'required', 'string');
		expectFact('both.x', 'required', 'string');
		expectFact('partial.required', 'optional', 'string');
		expectFact('required.optional', 'required', 'string');
		expectFact('picked.required', 'required', 'string');
		expectFact('inlinePicked.keep', 'required', 'string');
		if (facts.has('inlinePicked.drop')) throw new Error('Pick leaked an inline excluded field');
		expectFact('omitted.required', 'required', 'string');
		expectFact('generic.required', 'required', 'boolean');
		expectFact('genericArray.required', 'required', 'boolean[]');
		expectFact('defaultGeneric.value', 'required', 'number');
		expectFact('dyn', 'optional', 'Dyn');
		if (facts.get('dyn')?.declaredType.includes(' & Record'))
			throw new Error('dynamic record produced a duplicate root intersection fact');
		if (facts.get('dyn')?.dynamicKey !== true)
			throw new Error('dynamic record alias was not classified as dynamic-key');
		if (facts.get('fixed')?.dynamicKey !== false)
			throw new Error('fixed object was misclassified as dynamic-key');
		if (!facts.get('genericOpaque')?.genericParameters.includes('T'))
			throw new Error('root generic parameter evidence was not preserved');
		expectFact(
			'method',
			'required',
			'<T extends string = string>(value: T, optional?: number, ...rest: boolean[]) => T'
		);
		expectFact('optionalMethod', 'optional', '(value: string) => void');
		if (facts.get('optionalMethod')?.valueAllowsUndefined !== true)
			throw new Error('optional method did not allow undefined');
		console.log(JSON.stringify({ status: 'passed', facts: facts.size }));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
}
