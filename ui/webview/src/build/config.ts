export type WebviewTarget = 'windows-arm64' | 'windows-x64';
export type WebviewPackageFormat = 'portable';

export interface WebviewTargetConfig {
	readonly package: WebviewPackageFormat;
	readonly productName?: string;
	readonly runtime?: 'evergreen';
}

export interface WebviewConfig {
	readonly host?: {
		readonly allowedExternalOrigins?: readonly string[];
	};
	readonly output?: string;
	readonly targets: Partial<Record<WebviewTarget, WebviewTargetConfig>>;
	readonly web: {
		readonly assets: string;
		readonly command: string;
		readonly devCommand?: string;
		readonly devUrl?: string;
	};
}

export function defineWebviewConfig(config: WebviewConfig): WebviewConfig {
	if (Object.keys(config.targets).length === 0)
		throw new TypeError('At least one WebView target is required.');
	if (!config.web.command.trim()) throw new TypeError('web.command cannot be empty.');
	if (!config.web.assets.trim()) throw new TypeError('web.assets cannot be empty.');
	return Object.freeze(config);
}

export function resolveWebviewTargets(
	config: WebviewConfig,
	requested: WebviewTarget | 'all'
): WebviewTarget[] {
	const configured = Object.keys(config.targets) as WebviewTarget[];
	if (requested === 'all') return configured;
	if (!config.targets[requested]) throw new Error(`WebView target is not configured: ${requested}`);
	return [requested];
}
