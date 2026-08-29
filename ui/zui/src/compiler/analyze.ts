import type {
	CallExpression,
	Expression,
	Identifier,
	ImportDeclaration,
	ImportSpecifier,
	Node,
	VariableDeclarator
} from 'estree';

import { createDiagnostic } from './diagnostics.ts';
import type {
	IcssCallsite,
	IcssCompilerDiagnostic,
	Positioned,
	PositionedCallExpression,
	PositionedFactory,
	PositionedProgram
} from './types.ts';

function isPositioned<TNode extends Node>(node: TNode): node is Positioned<TNode> {
	const candidate = node as TNode & { readonly end?: unknown; readonly start?: unknown };
	return typeof candidate.start === 'number' && typeof candidate.end === 'number';
}

function isIdentifier(node: Node | null | undefined, name?: string): node is Identifier {
	return node?.type === 'Identifier' && (name === undefined || node.name === name);
}

function asIcssCall(
	expression: Expression | null | undefined,
	bindings: ReadonlySet<string>
): PositionedCallExpression | undefined {
	if (expression?.type !== 'CallExpression' || !isPositioned(expression)) return undefined;
	if (!isIdentifier(expression.callee) || !bindings.has(expression.callee.name)) return undefined;
	return expression;
}

function unwrapDerived(
	expression: Expression | null | undefined,
	bindings: ReadonlySet<string>
): PositionedCallExpression | undefined {
	const direct = asIcssCall(expression, bindings);
	if (direct !== undefined) return direct;
	if (expression?.type !== 'CallExpression' || !isIdentifier(expression.callee, '$derived')) {
		return undefined;
	}
	const first = expression.arguments[0];
	return first?.type === 'SpreadElement' ? undefined : asIcssCall(first, bindings);
}

function createCallsite(
	call: PositionedCallExpression,
	bindingName: string | undefined,
	filename: string | undefined
): { callsite?: IcssCallsite; diagnostic?: IcssCompilerDiagnostic } {
	const factory = call.arguments[1];
	if (factory?.type !== 'ArrowFunctionExpression' && factory?.type !== 'FunctionExpression') {
		return {
			diagnostic: createDiagnostic(
				'invalid-factory',
				'ICSS compiler optimization requires an inline function as the second argument.',
				call.start,
				call.end,
				filename
			)
		};
	}
	if (
		!isPositioned(factory) ||
		factory.params.length !== 1 ||
		factory.params[0]?.type !== 'Identifier'
	) {
		return {
			diagnostic: createDiagnostic(
				'invalid-factory',
				'ICSS factory must have exactly one identifier parameter.',
				call.start,
				call.end,
				filename
			)
		};
	}
	return { callsite: { bindingName, call, factory: factory as PositionedFactory } };
}

export function findIcssBindings(
	program: PositionedProgram,
	modules: ReadonlySet<string>
): ReadonlySet<string> {
	const bindings = new Set<string>();
	for (const statement of program.body) {
		if (statement.type !== 'ImportDeclaration') continue;
		const declaration = statement as ImportDeclaration;
		if (typeof declaration.source.value !== 'string' || !modules.has(declaration.source.value)) {
			continue;
		}
		for (const specifier of declaration.specifiers) {
			if (specifier.type !== 'ImportSpecifier') continue;
			const imported = (specifier as ImportSpecifier).imported;
			if (isIdentifier(imported, 'icss')) bindings.add(specifier.local.name);
		}
	}
	return bindings;
}

const ZUI_COMPONENTS = new Set(['ZBox', 'ZButton', 'ZField', 'ZIcon', 'ZInput', 'ZStack', 'ZText']);

export function findZuiComponentBindings(
	program: PositionedProgram,
	modules: ReadonlySet<string>
): ReadonlySet<string> {
	const bindings = new Set<string>();
	for (const statement of program.body) {
		if (statement.type !== 'ImportDeclaration') continue;
		const declaration = statement as ImportDeclaration;
		if (typeof declaration.source.value !== 'string' || !modules.has(declaration.source.value)) {
			continue;
		}
		for (const specifier of declaration.specifiers) {
			if (specifier.type !== 'ImportSpecifier') continue;
			const imported = (specifier as ImportSpecifier).imported;
			if (isIdentifier(imported) && ZUI_COMPONENTS.has(imported.name)) {
				bindings.add(specifier.local.name);
			}
		}
	}
	return bindings;
}

function variableName(declarator: VariableDeclarator): string | undefined {
	return declarator.id.type === 'Identifier' ? declarator.id.name : undefined;
}

export function findVariableCallsites(
	program: PositionedProgram,
	bindings: ReadonlySet<string>,
	filename?: string
): {
	readonly callsites: ReadonlyMap<string, IcssCallsite>;
	readonly diagnostics: readonly IcssCompilerDiagnostic[];
} {
	const callsites = new Map<string, IcssCallsite>();
	const diagnostics: IcssCompilerDiagnostic[] = [];
	for (const statement of program.body) {
		if (statement.type !== 'VariableDeclaration') continue;
		for (const declarator of statement.declarations) {
			const name = variableName(declarator);
			if (name === undefined) continue;
			const call = unwrapDerived(declarator.init, bindings);
			if (call === undefined) continue;
			const result = createCallsite(call, name, filename);
			if (result.callsite !== undefined) callsites.set(name, result.callsite);
			if (result.diagnostic !== undefined) diagnostics.push(result.diagnostic);
		}
	}
	return { callsites, diagnostics };
}

export function createDirectCallsite(
	call: CallExpression,
	bindings: ReadonlySet<string>,
	filename?: string
): { callsite?: IcssCallsite; diagnostic?: IcssCompilerDiagnostic } {
	if (!isPositioned(call) || !isIdentifier(call.callee) || !bindings.has(call.callee.name)) {
		return {};
	}
	return createCallsite(call, undefined, filename);
}
