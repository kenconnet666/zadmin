import type { ResourceScope } from '../runtime/scope.ts';
import type { WeChatPlatform } from '../platform/service.ts';
import type { CapabilityDescriptor } from '../platform/types.ts';

export interface MiniappModuleContext {
	readonly platform: WeChatPlatform;
	readonly scope: ResourceScope;
}

export interface MiniappModule<
	TRoutes extends readonly string[] = readonly string[],
	TRequired extends readonly CapabilityDescriptor[] = readonly CapabilityDescriptor[],
	TOptional extends readonly CapabilityDescriptor[] = readonly CapabilityDescriptor[]
> {
	readonly capabilities: {
		readonly optional?: TOptional;
		readonly required: TRequired;
	};
	readonly id: string;
	readonly routes: TRoutes;
	setup?(context: MiniappModuleContext): unknown | Promise<unknown>;
}

export function defineMiniappModule<
	const TRoutes extends readonly string[],
	const TRequired extends readonly CapabilityDescriptor[],
	const TOptional extends readonly CapabilityDescriptor[] = readonly []
>(
	module: MiniappModule<TRoutes, TRequired, TOptional>
): MiniappModule<TRoutes, TRequired, TOptional> {
	if (!/^@?[a-z0-9][a-z0-9._/-]*$/u.test(module.id)) {
		throw new TypeError(`Invalid Miniapp module id "${module.id}".`);
	}
	if (module.routes.some((route) => !route.endsWith('.svelte') || !route.startsWith('./'))) {
		throw new TypeError('Miniapp module routes must be relative .svelte paths.');
	}
	return Object.freeze(module);
}

export interface ComposedMiniappModules {
	readonly capabilities: readonly CapabilityDescriptor[];
	readonly modules: readonly MiniappModule[];
	readonly routes: readonly string[];
}

export function composeMiniappModules(modules: readonly MiniappModule[]): ComposedMiniappModules {
	const ids = new Set<string>();
	const routes = new Set<string>();
	const capabilities = new Map<string, CapabilityDescriptor>();
	for (const module of modules) {
		if (ids.has(module.id)) throw new TypeError(`Duplicate Miniapp module id "${module.id}".`);
		ids.add(module.id);
		for (const route of module.routes) {
			if (routes.has(route)) throw new TypeError(`Duplicate Miniapp module route "${route}".`);
			routes.add(route);
		}
		for (const descriptor of [
			...module.capabilities.required,
			...(module.capabilities.optional ?? [])
		]) {
			capabilities.set(descriptor.id, descriptor);
		}
	}
	return Object.freeze({
		capabilities: Object.freeze(
			[...capabilities.values()].sort((a, b) => a.id.localeCompare(b.id))
		),
		modules: Object.freeze([...modules]),
		routes: Object.freeze([...routes])
	});
}

export interface MiniAppCapabilityConfig {
	readonly permission?: Readonly<Record<string, { readonly desc?: string }>>;
	readonly requiredBackgroundModes?: readonly string[];
	readonly requiredPrivateInfos?: readonly string[];
}

export interface CapabilityDiagnostic {
	readonly capabilityId: string;
	readonly field: 'permission' | 'requiredBackgroundModes' | 'requiredPrivateInfos';
	readonly message: string;
}

export function diagnoseCapabilityConfig(
	config: MiniAppCapabilityConfig,
	descriptors: readonly CapabilityDescriptor[]
): readonly CapabilityDiagnostic[] {
	const diagnostics: CapabilityDiagnostic[] = [];
	for (const descriptor of descriptors) {
		const permissionDescription =
			descriptor.permissionScope === undefined
				? undefined
				: config.permission?.[descriptor.permissionScope]?.desc;
		if (
			descriptor.permissionScope !== undefined &&
			(typeof permissionDescription !== 'string' || permissionDescription.trim() === '')
		) {
			diagnostics.push({
				capabilityId: descriptor.id,
				field: 'permission',
				message: `${descriptor.permissionScope} requires a non-empty, application-specific purpose description.`
			});
		}
		if (
			descriptor.requiredPrivateInfo !== undefined &&
			!config.requiredPrivateInfos?.includes(descriptor.requiredPrivateInfo)
		) {
			diagnostics.push({
				capabilityId: descriptor.id,
				field: 'requiredPrivateInfos',
				message: `Missing requiredPrivateInfos entry "${descriptor.requiredPrivateInfo}".`
			});
		}
		if (
			descriptor.requiredBackgroundMode !== undefined &&
			!config.requiredBackgroundModes?.includes(descriptor.requiredBackgroundMode)
		) {
			diagnostics.push({
				capabilityId: descriptor.id,
				field: 'requiredBackgroundModes',
				message: `Missing requiredBackgroundModes entry "${descriptor.requiredBackgroundMode}".`
			});
		}
	}
	return diagnostics;
}
