interface ContextModule {
	readonly hot?: { readonly data: Record<string, unknown> };
}

/** Keep each module's context identity across HMR without sharing it across package copies. */
export function createContextKey(module: ContextModule, description: string): symbol {
	if (!module.hot) return Symbol(description);
	const key = `zui:context:${description}`;
	const previous = module.hot.data[key];
	if (typeof previous === 'symbol') return previous;
	const next = Symbol(description);
	module.hot.data[key] = next;
	return next;
}
