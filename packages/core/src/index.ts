export interface PluginDefinition<Id extends string = string> {
	readonly id: Id;
	readonly dependencies: readonly PluginDefinition[];
}

export interface AppDefinition<Id extends string = string> {
	readonly id: Id;
	readonly plugins: readonly PluginDefinition[];
}

export function definePlugin<const Id extends string>(definition: {
	readonly id: Id;
	readonly dependencies?: readonly PluginDefinition[];
}): PluginDefinition<Id> {
	return Object.freeze({
		id: definition.id,
		dependencies: Object.freeze([...(definition.dependencies ?? [])])
	});
}

export function defineApp<const Id extends string>(
	definition: AppDefinition<Id>
): AppDefinition<Id> {
	return Object.freeze({
		id: definition.id,
		plugins: Object.freeze([...definition.plugins])
	});
}
