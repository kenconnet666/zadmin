import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

import { recipeVariantEntries } from './recipe-variant-facts.mjs';
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
			requiredInSomeBranch: requiredness === REQUIREDNESS.required,
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
		requiredInSomeBranch: requiredness === REQUIREDNESS.required,
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
			const typedItems =
				kind === 'union' && items.some((item) => item.requiredness !== REQUIREDNESS.forbidden)
					? items.filter((item) => item.requiredness !== REQUIREDNESS.forbidden)
					: items;
			// Provenance must follow an inhabitable declaration, not an earlier `prop?: never`.
			const first = typedItems[0];
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
					requiredInSomeBranch: items.some((item) => item.requiredInSomeBranch === true),
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
	const unreachableFacts = Symbol('unreachable-property-facts');

	function unreachableBranch() {
		const facts = [];
		Object.defineProperty(facts, unreachableFacts, { value: true });
		return facts;
	}

	function isUnreachableBranch(facts) {
		return facts[unreachableFacts] === true;
	}

	function mergeUnionBranches(branchFacts, context) {
		const reachableBranches = branchFacts.filter((items) => !isUnreachableBranch(items));
		if (reachableBranches.length === 0) return unreachableBranch();
		const allPaths = new Set(reachableBranches.flatMap((items) => items.map((item) => item.path)));
		const branches = [...allPaths].flatMap((factPath) =>
			reachableBranches
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
		);
		return [...mergeFacts(branches, 'union').values()];
	}

	async function finiteLiteralCandidates(node, context, seen = new Set()) {
		if (!node) return undefined;
		if (ts.isParenthesizedTypeNode(node)) return finiteLiteralCandidates(node.type, context, seen);
		// `never` distributes to no branches; it must not be treated as a false branch.
		if (node.kind === ts.SyntaxKind.NeverKeyword) return [];
		if (ts.isUnionTypeNode(node)) {
			const candidates = [];
			for (const branch of node.types) {
				const branchCandidates = await finiteLiteralCandidates(branch, context, seen);
				if (!branchCandidates) return undefined;
				candidates.push(...branchCandidates);
			}
			return [...new Map(candidates.map((candidate) => [candidate.key, candidate])).values()];
		}
		if (ts.isLiteralTypeNode(node)) {
			const literal = node.literal;
			if (ts.isStringLiteral(literal)) return [{ key: `string:${literal.text}`, node, context }];
			if (ts.isNumericLiteral(literal)) return [{ key: `number:${literal.text}`, node, context }];
			if (literal.kind === ts.SyntaxKind.TrueKeyword)
				return [{ key: 'boolean:true', node, context }];
			if (literal.kind === ts.SyntaxKind.FalseKeyword)
				return [{ key: 'boolean:false', node, context }];
			return undefined;
		}
		if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) return undefined;
		const name = node.typeName.text;
		const binding = context.bindings.get(name) ?? context.constraints?.get(name);
		if (binding) return finiteLiteralCandidates(binding.node, binding.context, seen);
		const resolution = await graph.resolveDeclaration(
			context.modulePath,
			name,
			node.typeArguments ?? []
		);
		if (resolution.status !== 'local' || !ts.isTypeAliasDeclaration(resolution.declaration))
			return undefined;
		const identity = `${resolution.path}#${resolution.name}<${(node.typeArguments ?? [])
			.map((argument) => text(argument, context.sourceFile))
			.join(',')}>`;
		if (seen.has(identity)) return undefined;
		const next = {
			bindings: new Map(),
			constraints: new Map(),
			declarations: resolution.declarations,
			genericParameters: context.genericParameters,
			modulePath: resolution.path,
			declaration: resolution.name,
			sourceFile: resolution.declaration.getSourceFile()
		};
		for (const [index, parameter] of (resolution.declaration.typeParameters ?? []).entries()) {
			const argument = node.typeArguments?.[index];
			if (argument) next.bindings.set(parameter.name.text, { node: argument, context });
			else if (parameter.default)
				next.bindings.set(parameter.name.text, { node: parameter.default, context: next });
			if (parameter.constraint)
				next.constraints.set(parameter.name.text, { node: parameter.constraint, context: next });
		}
		seen.add(identity);
		const candidates = await finiteLiteralCandidates(resolution.declaration.type, next, seen);
		seen.delete(identity);
		return candidates;
	}

	function isNakedGenericParameter(node, context) {
		return (
			ts.isTypeReferenceNode(node) &&
			ts.isIdentifier(node.typeName) &&
			(context.bindings.has(node.typeName.text) || context.constraints?.has(node.typeName.text))
		);
	}

	async function visitType(node, context, path = '', modifiers = {}) {
		if (!node) return [];
		if (ts.isParenthesizedTypeNode(node)) return visitType(node.type, context, path, modifiers);
		// Alias/binding traversal below preserves this marker without a second type resolver.
		if (node.kind === ts.SyntaxKind.NeverKeyword) return unreachableBranch();
		if (ts.isArrayTypeNode(node)) return visitType(node.elementType, context, path, modifiers);
		if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.ReadonlyKeyword)
			return visitType(node.type, context, path, modifiers);
		if (ts.isConditionalTypeNode(node)) {
			const candidates = await finiteLiteralCandidates(node.checkType, context);
			const accepted = await finiteLiteralCandidates(node.extendsType, context);
			if (!candidates || !accepted) return [];
			const nakedGeneric = isNakedGenericParameter(node.checkType, context);
			if (!nakedGeneric) {
				// The empty finite set is never: it is a subset of every type, including never.
				const acceptedKeys = new Set(accepted.map((candidate) => candidate.key));
				const selected = candidates.every((candidate) => acceptedKeys.has(candidate.key));
				return visitType(selected ? node.trueType : node.falseType, context, path, modifiers);
			}
			if (candidates.length === 0) return unreachableBranch();
			const acceptedKeys = new Set(accepted.map((candidate) => candidate.key));
			const branchFacts = [];
			for (const candidate of candidates) {
				const branchContext = { ...context, bindings: new Map(context.bindings) };
				branchContext.bindings.set(node.checkType.typeName.text, {
					node: candidate.node,
					context: candidate.context
				});
				branchFacts.push(
					await visitType(
						acceptedKeys.has(candidate.key) ? node.trueType : node.falseType,
						branchContext,
						path,
						modifiers
					)
				);
			}
			return mergeUnionBranches(branchFacts, context);
		}
		if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
			const branchFacts = [];
			for (const branch of node.types)
				branchFacts.push(await visitType(branch, context, path, modifiers));
			return ts.isUnionTypeNode(node)
				? mergeUnionBranches(branchFacts, context)
				: branchFacts.some(isUnreachableBranch)
					? unreachableBranch()
					: [...mergeFacts(branchFacts.flat(), 'intersection').values()];
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
		if (!ts.isTypeReferenceNode(node) && !ts.isExpressionWithTypeArguments(node)) return [];
		const name = refName(ts.isTypeReferenceNode(node) ? node.typeName : node.expression);
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
		if ((name === 'RecipeVariants' || name === 'SlotRecipeSelection') && args[0]) {
			const entries = recipeVariantEntries(args[0], context.sourceFile);
			if (entries)
				return entries
					.filter(
						({ name }) =>
							(!modifiers.include || modifiers.include.has(name)) && !modifiers.exclude?.has(name)
					)
					.map(({ name, type }) => ({
						path: path ? `${path}.${name}` : name,
						requiredness: REQUIREDNESS.optional,
						requiredInSomeBranch: false,
						valueAllowsUndefined: true,
						declaredType: type,
						typeCandidates: [type],
						genericParameters: [...(context.genericParameters ?? [])],
						source: { modulePath: context.modulePath, declaration: context.declaration }
					}));
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
			constraints: new Map(),
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
			if (parameter.constraint)
				next.constraints.set(parameter.name.text, { node: parameter.constraint, context: next });
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
			constraints: new Map(),
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
			constraints: new Map(),
			declarations: root.declarations,
			genericParameters: new Set(
				(root.declaration.typeParameters ?? []).map((parameter) => parameter.name.text)
			),
			modulePath: root.path,
			declaration: root.name,
			sourceFile: root.declaration.getSourceFile()
		};
		for (const parameter of root.declaration.typeParameters ?? [])
			if (parameter.constraint)
				rootContext.constraints.set(parameter.name.text, {
					node: parameter.constraint,
					context: rootContext
				});
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
};
export interface Extended extends Omit<Alias, 'optional'> {
	own?: number;
}
type Kind = 'month' | 'year';
type Mode = 'single' | 'multiple';
interface DistributedShared<K extends Kind, M extends Mode> {
	granularity: K;
	value?: { kind: K; mode: M };
}
type ModeProp<M extends Mode> = { selectionMode?: M } &
	(M extends 'single' ? unknown : { selectionMode: M });
export type Distributed<K extends Kind = Kind, M extends Mode = Mode> =
	K extends Kind ? (M extends Mode ? DistributedShared<K, M> & ModeProp<M> : never) : never;
type DateTimeMode = 'local' | 'zoned';
type Presentation = 'inline' | 'popover';
export type ReverseNested<M extends DateTimeMode = DateTimeMode, P extends Presentation = Presentation> =
	| ('local' extends M
		? ('inline' extends P ? { localInline: string } : never) |
			('popover' extends P ? { localPopover: string } : never)
		: never)
	| ('zoned' extends M
		? ('inline' extends P ? { zonedInline: string } : never) |
			('popover' extends P ? { zonedPopover: string } : never)
		: never);
export type ReverseNestedPartial = ReverseNested<'local' | 'zoned', 'inline'>;
export type ReverseNestedExact = ReverseNested<'local', 'inline'>;
export type NeverDistributed<T extends DateTimeMode = never> =
	T extends 'local' ? { localOnly: string } : { falseBranch: string };
export type NeverExtendsLiteral = never extends 'local'
	? { directTrue: string }
	: { directFalse: string };
export type LiteralExtendsNever = 'local' extends never
	? { impossibleTrue: string }
	: { directFalse: string };
export type NonDistributed = ('local' | 'zoned') extends 'local'
	? { wrongBranch: string }
	: { falseBranch: string };
export type AliasedDistributed = NeverDistributed<'local' | 'zoned'>;
type Impossible = never;
export type UnionWithNever = { retained: string } | Impossible;
export type UnionWithEmpty = { retained: string } | {};
export type IntersectionWithNever = { discarded: string } & Impossible;
interface InlineBranch { open?: never }
interface PopoverBranch { open?: boolean }
export type ForbiddenFirst = InlineBranch | PopoverBranch;`,
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
		const extendedFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'Extended'
		);
		if (
			extendedFacts.get('required')?.requiredness !== REQUIREDNESS.required ||
			extendedFacts.has('optional') ||
			extendedFacts.get('own')?.requiredness !== REQUIREDNESS.optional
		)
			throw new Error('interface heritage facts were not preserved through Omit');
		const distributedFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'Distributed'
		);
		if (
			distributedFacts.get('granularity')?.requiredness !== REQUIREDNESS.required ||
			!distributedFacts.get('granularity')?.declaredType.includes("'month'") ||
			!distributedFacts.get('granularity')?.declaredType.includes("'year'") ||
			distributedFacts.get('selectionMode')?.requiredness !== REQUIREDNESS.conditional ||
			distributedFacts.get('selectionMode')?.requiredInSomeBranch !== true ||
			distributedFacts.get('value.kind')?.requiredness !== REQUIREDNESS.required
		)
			throw new Error('finite distributed conditional facts were not preserved');
		const reverseNestedFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'ReverseNested'
		);
		for (const path of ['localInline', 'localPopover', 'zonedInline', 'zonedPopover'])
			if (
				reverseNestedFacts.get(path)?.requiredness !== REQUIREDNESS.conditional ||
				reverseNestedFacts.get(path)?.requiredInSomeBranch !== true
			)
				throw new Error(`reverse nested conditional facts missed ${path}`);
		const partialReverseFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'ReverseNestedPartial'
		);
		if (
			partialReverseFacts.get('localInline')?.requiredness !== REQUIREDNESS.conditional ||
			partialReverseFacts.get('zonedInline')?.requiredness !== REQUIREDNESS.conditional ||
			partialReverseFacts.has('localPopover') ||
			partialReverseFacts.has('zonedPopover')
		)
			throw new Error('partial reverse conditional facts did not exclude popover branches');
		const exactReverseFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'ReverseNestedExact'
		);
		if (
			exactReverseFacts.get('localInline')?.requiredness !== REQUIREDNESS.required ||
			exactReverseFacts.size !== 1
		)
			throw new Error('exact reverse conditional facts did not retain only local inline props');
		const neverFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'NeverDistributed'
		);
		if (neverFacts.size !== 0)
			throw new Error('never conditional facts produced a false or optional branch');
		const neverExtendsFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'NeverExtendsLiteral'
		);
		if (
			neverExtendsFacts.get('directTrue')?.requiredness !== REQUIREDNESS.required ||
			neverExtendsFacts.has('directFalse')
		)
			throw new Error('non-distributed never did not select its true branch');
		const literalExtendsNeverFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'LiteralExtendsNever'
		);
		if (
			literalExtendsNeverFacts.get('directFalse')?.requiredness !== REQUIREDNESS.required ||
			literalExtendsNeverFacts.has('impossibleTrue')
		)
			throw new Error('literal extends never did not select its false branch');
		const nonDistributedFacts = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'NonDistributed'
		);
		if (
			nonDistributedFacts.get('falseBranch')?.requiredness !== REQUIREDNESS.required ||
			nonDistributedFacts.has('wrongBranch')
		)
			throw new Error('non-distributed literal-union conditional selected both branches');
		for (const [name, expectedPaths, requiredness] of [
			['AliasedDistributed', ['localOnly', 'falseBranch'], REQUIREDNESS.conditional],
			['UnionWithNever', ['retained'], REQUIREDNESS.required],
			['UnionWithEmpty', ['retained'], REQUIREDNESS.conditional],
			['IntersectionWithNever', [], REQUIREDNESS.required]
		]) {
			const actual = await collectWorkspacePropertyFacts(
				graph,
				resolve(root, 'src/props.ts'),
				name
			);
			if (
				actual.size !== expectedPaths.length ||
				expectedPaths.some((path) => actual.get(path)?.requiredness !== requiredness)
			)
				throw new Error(`conditional alias/reachability regression: ${name}`);
		}
		const forbiddenFirst = await collectWorkspacePropertyFacts(
			graph,
			resolve(root, 'src/props.ts'),
			'ForbiddenFirst'
		);
		if (forbiddenFirst.get('open')?.source.declaration !== 'PopoverBranch')
			throw new Error('Union property provenance points at its forbidden branch.');
		console.log(JSON.stringify({ status: 'passed', facts: facts.size }));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
}
