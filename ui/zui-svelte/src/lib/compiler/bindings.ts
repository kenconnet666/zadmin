import type {
	ArrowFunctionExpression,
	CallExpression,
	Expression,
	Identifier,
	MemberExpression,
	Node,
	Pattern
} from 'estree';
import { walk } from 'estree-walker';

import { UNIT_FAMILIES } from '@zadmin/zui-core';
import { createDiagnostic } from './diagnostics.ts';
import { createCallsiteId, createVariableName, sourceVariableName } from './source-names.ts';
import type {
	DynamicSlot,
	IcssCallsite,
	IcssCompilerDiagnostic,
	Positioned,
	PositionedExpression,
	SlotAnalysis
} from './types.ts';

interface ParentLink {
	readonly key: string | number | symbol | null | undefined;
	readonly parent: Node;
}

const UNIT_METHODS = new Set(Object.values(UNIT_FAMILIES).flatMap((family) => Object.keys(family)));

function positioned<TNode extends Node>(node: TNode): Positioned<TNode> | undefined {
	const candidate = node as TNode & { readonly end?: unknown; readonly start?: unknown };
	return typeof candidate.start === 'number' && typeof candidate.end === 'number'
		? (node as Positioned<TNode>)
		: undefined;
}

function memberName(member: MemberExpression): string | undefined {
	if (member.computed || member.property.type !== 'Identifier') return undefined;
	return member.property.name;
}

function rootBuilderName(member: MemberExpression): string | undefined {
	let current: MemberExpression['object'] = member.object;
	while (current.type === 'MemberExpression') current = current.object;
	return current.type === 'Identifier' ? current.name : undefined;
}

function nestedFactory(
	call: CallExpression,
	builders: ReadonlySet<string>
): ArrowFunctionExpression | undefined {
	if (call.callee.type !== 'MemberExpression') return undefined;
	const method = memberName(call.callee);
	const root = rootBuilderName(call.callee);
	if (
		method === undefined ||
		!method.startsWith('_') ||
		root === undefined ||
		!builders.has(root)
	) {
		return undefined;
	}
	const candidate = call.arguments.at(-1);
	return candidate?.type === 'ArrowFunctionExpression' ? candidate : undefined;
}

function addPatternBindings(pattern: Pattern, bindings: Set<string>): void {
	if (pattern.type === 'Identifier') {
		bindings.add(pattern.name);
		return;
	}
	if (pattern.type === 'RestElement') {
		addPatternBindings(pattern.argument, bindings);
		return;
	}
	if (pattern.type === 'AssignmentPattern') {
		addPatternBindings(pattern.left, bindings);
		return;
	}
	if (pattern.type === 'ArrayPattern') {
		for (const element of pattern.elements)
			if (element !== null) addPatternBindings(element, bindings);
		return;
	}
	if (pattern.type === 'ObjectPattern') {
		for (const property of pattern.properties) {
			if (property.type === 'RestElement') addPatternBindings(property.argument, bindings);
			else addPatternBindings(property.value, bindings);
		}
	}
}

function collectContext(factory: IcssCallsite['factory']): {
	readonly builders: ReadonlySet<string>;
	readonly locals: ReadonlySet<string>;
	readonly parents: WeakMap<Node, ParentLink>;
} {
	const builders = new Set<string>();
	const locals = new Set<string>();
	const parents = new WeakMap<Node, ParentLink>();
	for (const parameter of factory.params) {
		addPatternBindings(parameter, builders);
		addPatternBindings(parameter, locals);
	}

	walk(factory.body, {
		enter(node, parent, key) {
			if (parent !== null) parents.set(node, { key, parent });
			if (node.type === 'VariableDeclarator') addPatternBindings(node.id, locals);
			if (node.type === 'FunctionDeclaration' && node.id !== null) locals.add(node.id.name);
			if (node.type !== 'CallExpression') return;
			const nested = nestedFactory(node, builders);
			if (nested?.params[0]?.type === 'Identifier') {
				builders.add(nested.params[0].name);
				locals.add(nested.params[0].name);
			}
		}
	});
	return { builders, locals, parents };
}

function isStaticExpression(expression: Expression): boolean {
	if (expression.type === 'Literal') return true;
	if (expression.type === 'TemplateLiteral') return expression.expressions.length === 0;
	if (expression.type === 'Identifier') return expression.name === 'undefined';
	return (
		expression.type === 'UnaryExpression' &&
		(expression.operator === '+' || expression.operator === '-') &&
		expression.argument.type === 'Literal' &&
		typeof expression.argument.value === 'number'
	);
}

function isReferenceIdentifier(node: Identifier, parent: Node | null, key: unknown): boolean {
	if (parent?.type === 'MemberExpression' && key === 'property' && !parent.computed) return false;
	if (parent?.type === 'Property' && key === 'key' && !parent.computed && !parent.shorthand) {
		return false;
	}
	return true;
}

function usesFactoryLocal(expression: Expression, locals: ReadonlySet<string>): boolean {
	let found = false;
	walk(expression, {
		enter(node, parent, key) {
			if (
				node.type === 'Identifier' &&
				locals.has(node.name) &&
				isReferenceIdentifier(node, parent, key)
			) {
				found = true;
				this.skip();
			}
		}
	});
	return found;
}

function leafArguments(
	call: CallExpression,
	builders: ReadonlySet<string>
): readonly Expression[] | undefined {
	if (call.callee.type !== 'MemberExpression') return undefined;
	const method = memberName(call.callee);
	const root = rootBuilderName(call.callee);
	if (method === undefined || root === undefined || !builders.has(root)) return undefined;

	if (call.callee.object.type === 'Identifier') {
		if (method.startsWith('_')) return undefined;
		if (method === 'set') {
			const value = call.arguments[1];
			return value === undefined || value.type === 'SpreadElement' ? [] : [value];
		}
		return call.arguments.filter(
			(argument): argument is Expression => argument.type !== 'SpreadElement'
		);
	}

	if (call.callee.object.type !== 'MemberExpression') return undefined;
	if (method !== 'raw' && !UNIT_METHODS.has(method)) return undefined;
	return call.arguments.filter(
		(argument): argument is Expression => argument.type !== 'SpreadElement'
	);
}

function controlFlow(
	node: Node,
	parents: WeakMap<Node, ParentLink>,
	source: string
): { readonly guards: readonly string[]; readonly unsupported: boolean } {
	const guards: string[] = [];
	let current = node;
	let link = parents.get(current);
	while (link !== undefined) {
		const { key, parent } = link;
		if (
			parent.type === 'ForStatement' ||
			parent.type === 'ForInStatement' ||
			parent.type === 'ForOfStatement' ||
			parent.type === 'WhileStatement' ||
			parent.type === 'DoWhileStatement' ||
			parent.type === 'SwitchStatement'
		) {
			return { guards, unsupported: true };
		}
		if (parent.type === 'IfStatement' && (key === 'consequent' || key === 'alternate')) {
			const test = positioned(parent.test);
			if (test !== undefined) {
				const expression = source.slice(test.start, test.end);
				guards.push(key === 'consequent' ? `(${expression})` : `!(${expression})`);
			}
		}
		if (parent.type === 'LogicalExpression' && key === 'right') {
			const left = positioned(parent.left);
			if (left !== undefined) {
				const expression = source.slice(left.start, left.end);
				guards.push(parent.operator === '&&' ? `(${expression})` : `!(${expression})`);
			}
		}
		if (parent.type === 'ConditionalExpression' && (key === 'consequent' || key === 'alternate')) {
			const test = positioned(parent.test);
			if (test !== undefined) {
				const expression = source.slice(test.start, test.end);
				guards.push(key === 'consequent' ? `(${expression})` : `!(${expression})`);
			}
		}
		current = parent;
		link = parents.get(current);
	}
	return { guards: guards.reverse(), unsupported: false };
}

function selectorCanInherit(selector: string): boolean {
	return selector.split(',').every((part) => {
		const normalized = part.trim();
		const anchor = normalized.indexOf('&');
		if (anchor !== 0) return false;
		const tail = normalized.slice(1).trimStart();
		return !tail.startsWith('+') && !tail.startsWith('~');
	});
}

function hasUnsafeSelector(node: Node, parents: WeakMap<Node, ParentLink>): boolean {
	let current = node;
	let link = parents.get(current);
	while (link !== undefined) {
		const { parent } = link;
		if (
			parent.type === 'CallExpression' &&
			parent.callee.type === 'MemberExpression' &&
			memberName(parent.callee) === '_selector'
		) {
			const selector = parent.arguments[0];
			if (
				selector?.type !== 'Literal' ||
				typeof selector.value !== 'string' ||
				!selectorCanInherit(selector.value)
			) {
				return true;
			}
		}
		current = parent;
		link = parents.get(current);
	}
	return false;
}

export function analyzeDynamicSlots(
	callsite: IcssCallsite,
	source: string,
	filename: string | undefined,
	root: string
): SlotAnalysis {
	const { builders, locals, parents } = collectContext(callsite.factory);
	const callsiteId = createCallsiteId(callsite.call, source, filename, root);
	const diagnostics: IcssCompilerDiagnostic[] = [];
	const slots: DynamicSlot[] = [];
	const localPattern = [...locals].map((name) => name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
	const localGuardExpression =
		localPattern.length === 0
			? undefined
			: new RegExp(`(?:^|\\W)(?:${localPattern.join('|')})(?:$|\\W)`, 'u');

	walk(callsite.factory.body, {
		enter(node) {
			if (node.type !== 'CallExpression') return;
			const argumentsToLift = leafArguments(node, builders);
			if (argumentsToLift === undefined) return;

			for (const argument of argumentsToLift) {
				if (isStaticExpression(argument)) continue;
				const expression = positioned(argument) as PositionedExpression | undefined;
				if (expression === undefined) continue;
				const flow = controlFlow(node, parents, source);
				if (hasUnsafeSelector(node, parents)) {
					diagnostics.push(
						createDiagnostic(
							'unsupported-selector-scope',
							'Dynamic ICSS values targeting siblings, ancestors or external selectors use runtime class-rule fallback.',
							expression.start,
							expression.end,
							filename
						)
					);
					continue;
				}
				if (flow.unsupported) {
					diagnostics.push(
						createDiagnostic(
							'unsupported-control-flow',
							'Dynamic ICSS values inside loops or switch statements use runtime class-rule fallback.',
							expression.start,
							expression.end,
							filename
						)
					);
					continue;
				}
				if (
					usesFactoryLocal(expression, locals) ||
					flow.guards.some((guard) => localGuardExpression?.test(guard) === true)
				) {
					diagnostics.push(
						createDiagnostic(
							'factory-local-value',
							'Dynamic ICSS values that depend on factory-local bindings use runtime class-rule fallback.',
							expression.start,
							expression.end,
							filename
						)
					);
					continue;
				}

				const sourceName = sourceVariableName(expression);
				slots.push({
					expression: source.slice(expression.start, expression.end),
					guards: flow.guards,
					replacementEnd: expression.end,
					replacementStart: expression.start,
					variable: createVariableName(callsiteId, slots.length, sourceName)
				});
			}
		}
	});
	return { diagnostics, slots };
}
