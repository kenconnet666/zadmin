export interface MentionQuery {
	readonly end: number;
	readonly query: string;
	readonly start: number;
	readonly trigger: string;
}

const isBoundary = (value: string): boolean => value.length === 0 || /[\s\p{P}\p{S}]/u.test(value);

export function findMentionQuery(
	value: string,
	caret: number,
	triggers: readonly string[]
): MentionQuery | undefined {
	const end = Math.max(0, Math.min(value.length, caret));
	const beforeCaret = value.slice(0, end);
	let match: { index: number; trigger: string } | undefined;
	for (const trigger of triggers) {
		if (!trigger) continue;
		const index = beforeCaret.lastIndexOf(trigger);
		if (
			index >= 0 &&
			(!match ||
				index > match.index ||
				(index === match.index && trigger.length > match.trigger.length))
		) {
			match = { index, trigger };
		}
	}
	const preceding = match ? (Array.from(value.slice(0, match.index)).at(-1) ?? '') : '';
	if (!match || !isBoundary(preceding)) return undefined;
	const query = value.slice(match.index + match.trigger.length, end);
	if (/\s/u.test(query) || triggers.some((trigger) => trigger && query.includes(trigger)))
		return undefined;
	return Object.freeze({ end, query, start: match.index, trigger: match.trigger });
}

export function insertMention(
	value: string,
	query: MentionQuery,
	replacement: string,
	appendSpace = true
): { readonly caret: number; readonly value: string } {
	const inserted = `${query.trigger}${replacement}${appendSpace ? ' ' : ''}`;
	return Object.freeze({
		caret: query.start + inserted.length,
		value: `${value.slice(0, query.start)}${inserted}${value.slice(query.end)}`
	});
}
