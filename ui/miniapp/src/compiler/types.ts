export interface SvelteCompilerOptions {
	readonly dev?: boolean;
	readonly renderer?: string;
}

export interface SvelteTransformResult {
	readonly code: string;
	readonly map: unknown;
}

export interface SvelteCompilerPlugin {
	readonly enforce: 'pre';
	readonly name: 'zadmin:miniapp-compiler';
	buildStart?(): void;
	configResolved?(config: { command?: string; mode?: string; root?: string }): void;
	writeBundle?(): void;
	load?(id: string): string | undefined;
	resolveId?(source: string): string | undefined;
	shouldTransformCachedModule?(options: { id: string }): boolean;
	transform?(
		this: { warn(warning: unknown): void },
		source: string,
		id: string
	): Promise<SvelteTransformResult | undefined>;
}
