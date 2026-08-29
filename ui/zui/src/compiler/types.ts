import type {
	ArrowFunctionExpression,
	CallExpression,
	Expression,
	FunctionExpression,
	Identifier,
	Node,
	Program
} from 'estree';

export type Positioned<TNode extends Node = Node> = TNode & {
	readonly end: number;
	readonly start: number;
};

export type PositionedExpression = Positioned<Expression>;
export type PositionedCallExpression = Positioned<CallExpression>;
export type PositionedIdentifier = Positioned<Identifier>;
export type PositionedProgram = Positioned<Program>;
export type PositionedFactory = Positioned<ArrowFunctionExpression | FunctionExpression>;

export type DynamicValuesMode = 'class-rules' | 'inline-vars';

export interface IcssCompilerDiagnostic {
	readonly code:
		| 'component-boundary'
		| 'factory-local-value'
		| 'invalid-factory'
		| 'unsupported-control-flow'
		| 'unsupported-selector-scope';
	readonly end: number;
	readonly filename?: string;
	readonly message: string;
	readonly start: number;
}

export interface IcssPreprocessOptions {
	readonly dynamicValues?: DynamicValuesMode;
	readonly internalModule?: string;
	readonly modules?: readonly string[];
	readonly onDiagnostic?: (diagnostic: IcssCompilerDiagnostic) => void;
	readonly root?: string;
}

export interface IcssCallsite {
	readonly bindingName?: string;
	readonly call: PositionedCallExpression;
	readonly factory: PositionedFactory;
}

export interface DynamicSlot {
	readonly expression: string;
	readonly guards: readonly string[];
	readonly replacementEnd: number;
	readonly replacementStart: number;
	readonly variable: `--${string}`;
}

export interface SlotAnalysis {
	readonly diagnostics: readonly IcssCompilerDiagnostic[];
	readonly slots: readonly DynamicSlot[];
}
