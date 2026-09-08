export interface HotModuleLike {
	readonly data: Record<string, unknown>;
}

export interface ImportMetaLike {
	readonly hot?: HotModuleLike;
}

/** Pass `{ hot: (import.meta as ImportMetaLike).hot }` so Vite sees the caller's hot access. */
export function createContextKey(module: ImportMetaLike, description: string): symbol {
	if (!module.hot) return Symbol(description);
	const key = `zui:context:${description}`;
	const previous = module.hot.data[key];
	if (typeof previous === 'symbol') return previous;
	const next = Symbol(description);
	module.hot.data[key] = next;
	return next;
}
