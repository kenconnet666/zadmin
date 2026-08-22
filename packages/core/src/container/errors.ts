export class ContainerError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'ContainerError';
	}
}

export class DuplicateModuleError extends ContainerError {
	constructor(id: string) {
		super(`Module "${id}" is registered more than once.`);
		this.name = 'DuplicateModuleError';
	}
}

export class DuplicateServiceError extends ContainerError {
	constructor(id: string, owner: string, duplicateOwner: string) {
		super(`Service "${id}" is provided by both "${owner}" and "${duplicateOwner}".`);
		this.name = 'DuplicateServiceError';
	}
}

export class ServiceNotActiveError extends ContainerError {
	constructor(id: string) {
		super(`Service "${id}" is not active.`);
		this.name = 'ServiceNotActiveError';
	}
}

export class ServiceCycleError extends ContainerError {
	readonly cycle: readonly string[];

	constructor(cycle: readonly string[]) {
		super(`Service dependency cycle detected: ${cycle.join(' -> ')}.`);
		this.name = 'ServiceCycleError';
		this.cycle = Object.freeze([...cycle]);
	}
}

export class ServiceVisibilityError extends ContainerError {
	constructor(consumer: string, service: string, owner: string) {
		super(`Module "${consumer}" cannot inject private service "${service}" from "${owner}".`);
		this.name = 'ServiceVisibilityError';
	}
}

export class ServiceNamespaceError extends ContainerError {
	constructor(moduleId: string, serviceId: string) {
		super(`Service "${serviceId}" must equal or be namespaced below module "${moduleId}".`);
		this.name = 'ServiceNamespaceError';
	}
}

export class HostDependsOnPluginError extends ContainerError {
	constructor(host: string, plugin: string) {
		super(`Host module "${host}" cannot depend on dynamic plugin "${plugin}".`);
		this.name = 'HostDependsOnPluginError';
	}
}

export class LeakedGenerationError extends ContainerError {
	constructor(moduleId: string) {
		super(`Module "${moduleId}" has a leaked generation; restart the host before replacing it.`);
		this.name = 'LeakedGenerationError';
	}
}
