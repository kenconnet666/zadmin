import type {
	MiniappTheme,
	MiniappThemePatch,
	MiniappTokenGroup,
	MiniappTokenValue
} from './types.ts';

function freezeGroup(group: MiniappTokenGroup): MiniappTokenGroup {
	const copy: Record<string, MiniappTokenValue> = Object.create(null);
	for (const [name, value] of Object.entries(group)) {
		if (typeof value !== 'string' && typeof value !== 'number') {
			throw new TypeError(`Miniapp theme token "${name}" must be a string or number.`);
		}
		if (typeof value === 'number' && !Number.isFinite(value)) {
			throw new TypeError(`Miniapp theme token "${name}" must be finite.`);
		}
		copy[name] = value;
	}
	return Object.freeze(copy);
}

export function defineMiniappTheme<const TTheme extends MiniappTheme>(theme: TTheme): TTheme {
	const copy: Record<string, MiniappTokenGroup> = Object.create(null);
	for (const [groupName, group] of Object.entries(theme)) {
		if (typeof group !== 'object' || group === null || Array.isArray(group)) {
			throw new TypeError(`Miniapp theme group "${groupName}" must be an object.`);
		}
		copy[groupName] = freezeGroup(group);
	}
	return Object.freeze(copy) as unknown as TTheme;
}

export function extendMiniappTheme(base: MiniappTheme, patch: MiniappThemePatch): MiniappTheme {
	const merged = Object.fromEntries(
		Object.entries(base).map(([groupName, group]) => [groupName, { ...group }])
	) as Record<string, Record<string, MiniappTokenValue>>;
	for (const [groupName, groupPatch] of Object.entries(patch)) {
		const group = merged[groupName];
		if (group === undefined) throw new TypeError(`Unknown Miniapp theme group "${groupName}".`);
		for (const [token, value] of Object.entries(groupPatch ?? {})) {
			if (!Object.hasOwn(group, token)) {
				throw new TypeError(`Unknown Miniapp theme token "${groupName}.${token}".`);
			}
			group[token] = value as MiniappTokenValue;
		}
	}
	return defineMiniappTheme(merged as unknown as MiniappTheme);
}
