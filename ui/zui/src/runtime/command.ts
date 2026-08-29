export interface CommandSearchRecord {
	readonly keywords?: readonly string[];
	readonly label: string;
}

const normalize = (value: string, locale: string): string =>
	value.trim().replace(/\s+/gu, ' ').toLocaleLowerCase(locale);

function subsequenceScore(value: string, query: string): number | undefined {
	let queryIndex = 0;
	let gaps = 0;
	let previous = -1;
	for (let index = 0; index < value.length && queryIndex < query.length; index += 1) {
		if (value[index] !== query[queryIndex]) continue;
		if (previous >= 0) gaps += index - previous - 1;
		previous = index;
		queryIndex += 1;
	}
	return queryIndex === query.length ? Math.max(1, 20 - gaps) : undefined;
}

export function scoreCommand(
	record: CommandSearchRecord,
	query: string,
	locale = 'en'
): number | undefined {
	const needle = normalize(query, locale);
	if (!needle) return 0;
	const label = normalize(record.label, locale);
	if (label === needle) return 100;
	if (label.startsWith(needle)) return 90 - Math.min(20, label.length - needle.length);
	const wordIndex = label.search(new RegExp(`(?:^|\\s)${escapeRegExp(needle)}`, 'u'));
	if (wordIndex >= 0) return 70 - Math.min(20, wordIndex);
	const containsIndex = label.indexOf(needle);
	if (containsIndex >= 0) return 50 - Math.min(20, containsIndex);
	for (const keyword of record.keywords ?? []) {
		const candidate = normalize(keyword, locale);
		if (candidate === needle) return 80;
		if (candidate.startsWith(needle)) return 60;
		if (candidate.includes(needle)) return 40;
	}
	return subsequenceScore(label, needle);
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

export interface CommandShortcut {
	readonly altKey?: boolean;
	readonly ctrlKey?: boolean;
	readonly key: string;
	readonly metaKey?: boolean;
	readonly modKey?: boolean;
	readonly shiftKey?: boolean;
}

export function matchesCommandShortcut(
	event: Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'>,
	shortcut: CommandShortcut,
	platform = typeof navigator === 'undefined' ? '' : navigator.platform
): boolean {
	const apple = /Mac|iPhone|iPad|iPod/u.test(platform);
	const expectedCtrl = shortcut.modKey ? !apple : Boolean(shortcut.ctrlKey);
	const expectedMeta = shortcut.modKey ? apple : Boolean(shortcut.metaKey);
	return (
		event.key.toLocaleLowerCase() === shortcut.key.toLocaleLowerCase() &&
		event.altKey === Boolean(shortcut.altKey) &&
		event.ctrlKey === expectedCtrl &&
		event.metaKey === expectedMeta &&
		event.shiftKey === Boolean(shortcut.shiftKey)
	);
}
