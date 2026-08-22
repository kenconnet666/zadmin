export class PluginRuntimeError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'PluginRuntimeError';
	}
}

export class DuplicatePluginError extends PluginRuntimeError {
	constructor(id: string) {
		super(`Plugin "${id}" is installed more than once.`);
		this.name = 'DuplicatePluginError';
	}
}

export class DuplicateProviderError extends PluginRuntimeError {
	constructor(id: string, owner: string) {
		super(`Provider "${id}" is already owned by "${owner}".`);
		this.name = 'DuplicateProviderError';
	}
}

export class ProviderNotActiveError extends PluginRuntimeError {
	constructor(id: string) {
		super(`Provider "${id}" is not active.`);
		this.name = 'ProviderNotActiveError';
	}
}

export class PluginCycleError extends PluginRuntimeError {
	readonly cycle: readonly string[];

	constructor(cycle: readonly string[]) {
		super(`Plugin dependency cycle detected: ${cycle.join(' -> ')}.`);
		this.name = 'PluginCycleError';
		this.cycle = cycle;
	}
}

export class PluginNotFoundError extends PluginRuntimeError {
	constructor(id: string) {
		super(`Plugin "${id}" is not installed.`);
		this.name = 'PluginNotFoundError';
	}
}

export class PluginNotActiveError extends PluginRuntimeError {
	constructor(id: string) {
		super(`Plugin "${id}" is not active.`);
		this.name = 'PluginNotActiveError';
	}
}
