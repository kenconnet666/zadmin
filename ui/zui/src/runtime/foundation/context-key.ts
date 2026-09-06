interface ContextModule {
	readonly hot?: { readonly data: Record<string, unknown> };
}

/** Pass `{ hot: import.meta.hot }` so Vite sees the hot access in the calling module. */
export function createContextKey(module: ContextModule, description: string): symbol {
	if (!module.hot) return Symbol(description);
	const key = `zui:context:${description}`;
	const previous = module.hot.data[key];
	if (typeof previous === 'symbol') return previous;
	const next = Symbol(description);
	module.hot.data[key] = next;
	return next;
}
