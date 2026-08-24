type AstNode = {
	readonly [key: string]: unknown;
	readonly name?: unknown;
	readonly type?: unknown;
};

function visit(value: unknown, elements: Set<string>, seen: WeakSet<object>): void {
	if (typeof value !== 'object' || value === null || seen.has(value)) return;
	seen.add(value);
	const node = value as AstNode;
	if (
		node.type === 'RegularElement' &&
		typeof node.name === 'string' &&
		/^[a-z][a-z0-9-]*$/u.test(node.name)
	) {
		elements.add(node.name);
	}
	for (const child of Object.values(node)) visit(child, elements, seen);
}

export function collectNativeElements(ast: unknown): readonly string[] {
	const elements = new Set<string>();
	visit(ast, elements, new WeakSet());
	return [...elements].sort();
}

export function createComponentMarkerCode(elements: readonly string[]): string {
	const calls = elements
		.map((element) => `  __zadmin_taro_marker__.createElement(${JSON.stringify(element)}, null);`)
		.join('\n');
	return `const __zadmin_taro_marker__ = null;\nexport function __zadmin_collect_components__() {\n${calls}\n}\n`;
}
