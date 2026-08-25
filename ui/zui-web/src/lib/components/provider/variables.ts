import type { Action } from 'svelte/action';

export type IcssVariableValue = string | number | null | undefined;
export type IcssVariables = Readonly<Record<`--${string}`, IcssVariableValue>>;

export interface IcssRootStyle {
	readonly style?: string | null;
	readonly variables?: IcssVariables;
}

function validVariable(name: string): name is `--${string}` {
	return /^--[a-zA-Z][\w-]*$/u.test(name);
}

export function serializeIcssVariables(variables: IcssVariables | undefined): string {
	if (variables === undefined) return '';
	return Object.entries(variables)
		.flatMap(([name, value]) => {
			if (!validVariable(name)) throw new TypeError(`Invalid ICSS variable "${name}".`);
			return value === null || value === undefined ? [] : [`${name}:${String(value)}`];
		})
		.join(';');
}

export function mergeStyles(
	style: string | null | undefined,
	generated: string
): string | undefined {
	const authored = style?.trim().replace(/;+$/u, '') ?? '';
	if (authored.length === 0) return generated || undefined;
	if (generated.length === 0) return authored;
	return `${authored};${generated}`;
}

function applyVariables(
	node: HTMLElement,
	previous: ReadonlyMap<string, string>,
	variables: IcssVariables | undefined
): Map<string, string> {
	const next = new Map<string, string>();
	for (const [name, value] of Object.entries(variables ?? {})) {
		if (!validVariable(name)) throw new TypeError(`Invalid ICSS variable "${name}".`);
		if (value === null || value === undefined) continue;
		const text = String(value);
		next.set(name, text);
		if (previous.get(name) !== text && node.style.getPropertyValue(name) !== text) {
			node.style.setProperty(name, text);
		}
	}
	for (const name of previous.keys()) {
		if (!next.has(name)) node.style.removeProperty(name);
	}
	return next;
}

export const applyIcssVariables: Action<HTMLElement, IcssVariables | undefined> = (
	node,
	variables
) => {
	let applied = applyVariables(node, new Map(), variables);
	return {
		update(next) {
			applied = applyVariables(node, applied, next);
		}
	};
};

export const applyIcssRootStyle: Action<HTMLElement, IcssRootStyle> = (node, initial) => {
	let authored = initial.style?.trim().replace(/;+$/u, '') ?? '';
	let applied = applyVariables(node, new Map(), initial.variables);
	return {
		update(next) {
			const nextAuthored = next.style?.trim().replace(/;+$/u, '') ?? '';
			if (nextAuthored !== authored) {
				node.style.cssText = nextAuthored;
				authored = nextAuthored;
				applied = new Map();
			}
			applied = applyVariables(node, applied, next.variables);
		}
	};
};
