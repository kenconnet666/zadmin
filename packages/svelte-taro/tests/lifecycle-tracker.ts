export const lifecycleEvents: string[] = [];

let runtimeNavigation: () => void = () => undefined;

export function invokeRuntimeNavigation(): void {
	runtimeNavigation();
}

export function resetLifecycleEvents(): void {
	lifecycleEvents.length = 0;
	runtimeNavigation = () => undefined;
}

export function setRuntimeNavigation(navigate: () => void): void {
	runtimeNavigation = navigate;
}
