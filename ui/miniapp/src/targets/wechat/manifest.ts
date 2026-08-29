export interface MiniappAppConfig {
	readonly pages: readonly string[];
	readonly window?: Readonly<Record<string, unknown>>;
	readonly workers?: string;
	readonly [key: string]: unknown;
}

export interface MiniappPageConfig {
	readonly navigationBarTitleText?: string;
	readonly renderer?: 'skyline' | 'webview';
	readonly [key: string]: unknown;
}

export function normalizeAppConfig(config: MiniappAppConfig): MiniappAppConfig {
	if (!Array.isArray(config.pages) || config.pages.length === 0) {
		throw new TypeError('Miniapp app config must declare at least one page.');
	}
	const pages = config.pages.map((page) => page.replace(/^\/+|\/+$/gu, ''));
	if (new Set(pages).size !== pages.length)
		throw new TypeError('Miniapp page routes must be unique.');
	return Object.freeze({ ...config, pages: Object.freeze(pages) });
}
